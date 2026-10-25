import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { adminDb } from '@/lib/firebase/firebase-admin'
import {
  extractTextFromDocumentBuffer,
  getBuiltInDefaultCvDocument
} from '@/lib/career/career-storage'
import { CareerDocument, CareerDocumentType } from '@/types/email-system'
import { recordEmailAuditLog } from '@/lib/email/campaign-queue'

const ALLOWED_DOCUMENT_MIMES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024 // 10MB max for email attachment safety

export async function GET(request: NextRequest) {
  let adminUser
  try {
    adminUser = await requireAdmin(request)
  } catch (authError: any) {
    if (authError instanceof Response) return authError
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const snap = await adminDb
      .collection('career_documents')
      .where('ownerId', '==', adminUser.id)
      .get()

    const docs: CareerDocument[] = []
    snap.forEach(doc => {
      const data = doc.data() as Omit<CareerDocument, 'id'>
      // Omit heavy base64Content in list responses unless requested
      const { base64Content, ...metadataOnly } = data
      docs.push({
        id: doc.id,
        ...metadataOnly
      })
    })

    // Sort newest first
    docs.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))

    // Always include the built-in default CV if no custom default overrides it
    const builtInCv = getBuiltInDefaultCvDocument(adminUser.id)
    if (builtInCv && !docs.some(d => d.id === builtInCv.id)) {
      docs.push(builtInCv)
    }

    return NextResponse.json({
      success: true,
      documents: docs
    })
  } catch (error: any) {
    const builtInCv = getBuiltInDefaultCvDocument(adminUser.id)
    return NextResponse.json({
      success: true,
      documents: builtInCv ? [builtInCv] : []
    })
  }
}

export async function POST(request: NextRequest) {
  let adminUser
  try {
    adminUser = await requireAdmin(request)
  } catch (authError: any) {
    if (authError instanceof Response) return authError
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      id,
      name,
      originalFilename,
      type = 'cv',
      version = 'v1.0',
      intendedUse = '',
      fileBase64,
      extractedText = '',
      isDefault = false
    } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Document name is required' },
        { status: 400 }
      )
    }

    let mimeType = body.mimeType || 'application/pdf'
    let base64Clean = ''
    let fileSize = 0
    let autoExtractedText = String(extractedText || '').trim()

    if (fileBase64) {
      const matches = String(fileBase64).match(/^data:([^;]+);base64,(.+)$/)
      if (matches) {
        mimeType = matches[1]
        base64Clean = matches[2]
      } else {
        base64Clean = String(fileBase64)
      }

      if (!ALLOWED_DOCUMENT_MIMES.includes(mimeType)) {
        return NextResponse.json(
          { error: `Unsupported document file type: ${mimeType}. Allowed: PDF, TXT, MD, DOC, DOCX.` },
          { status: 400 }
        )
      }

      const buffer = Buffer.from(base64Clean, 'base64')
      fileSize = buffer.length

      if (fileSize > MAX_DOCUMENT_SIZE_BYTES) {
        return NextResponse.json(
          { error: 'Document size exceeds the 10MB limit.' },
          { status: 400 }
        )
      }

      if (!autoExtractedText) {
        autoExtractedText = extractTextFromDocumentBuffer(
          buffer,
          mimeType,
          `${name} (${version}) — ${intendedUse}`
        )
      }
    }

    const now = new Date().toISOString()
    const docData: Omit<CareerDocument, 'id'> = {
      ownerId: adminUser.id,
      name: String(name).trim(),
      originalFilename: String(originalFilename || `${name}.pdf`).trim(),
      type: type as CareerDocumentType,
      version: String(version).trim(),
      intendedUse: String(intendedUse).trim(),
      mimeType,
      fileSize,
      ...(base64Clean ? { base64Content: base64Clean } : {}),
      extractedText: autoExtractedText,
      isDefault: Boolean(isDefault),
      createdAt: now,
      updatedAt: now
    }

    if (id && id !== 'doc_default_primary_cv') {
      await adminDb.collection('career_documents').doc(id).set(docData, { merge: true })
      await recordEmailAuditLog({
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        domain: 'career_profile',
        action: 'UPDATE',
        targetId: id,
        details: { documentName: docData.name, version: docData.version, type: docData.type }
      })
      const { base64Content, ...safeDoc } = docData
      return NextResponse.json({
        success: true,
        document: { id, ...safeDoc }
      })
    } else {
      const ref = await adminDb.collection('career_documents').add(docData)
      await recordEmailAuditLog({
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        domain: 'career_profile',
        action: 'CREATE',
        targetId: ref.id,
        details: { documentName: docData.name, version: docData.version, type: docData.type }
      })
      const { base64Content, ...safeDoc } = docData
      return NextResponse.json({
        success: true,
        document: { id: ref.id, ...safeDoc }
      })
    }
  } catch (error: any) {
    console.error('[Career Documents POST Error]:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to upload career document' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  let adminUser
  try {
    adminUser = await requireAdmin(request)
  } catch (authError: any) {
    if (authError instanceof Response) return authError
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const id = request.nextUrl.searchParams.get('id')
    if (!id || id === 'doc_default_primary_cv') {
      return NextResponse.json(
        { error: 'Cannot delete the built-in fallback CV document' },
        { status: 400 }
      )
    }

    const docRef = adminDb.collection('career_documents').doc(id)
    const snap = await docRef.get()
    if (!snap.exists || snap.data()?.ownerId !== adminUser.id) {
      return NextResponse.json({ error: 'Document not found or unauthorized' }, { status: 404 })
    }

    await docRef.delete()
    await recordEmailAuditLog({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      domain: 'career_profile',
      action: 'DELETE',
      targetId: id,
      details: {}
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}

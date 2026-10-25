import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { adminDb } from '@/lib/firebase/firebase-admin'
import {
  DEFAULT_EMAIL_TEMPLATES,
  extractTemplateVariables,
  renderEmailForRecipient
} from '@/lib/email/template-engine'
import { EmailTemplate } from '@/types/email-system'
import { recordEmailAuditLog } from '@/lib/email/campaign-queue'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
  } catch (authError: any) {
    if (authError instanceof Response) return authError
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const snap = await adminDb.collection('email_templates').orderBy('updatedAt', 'desc').get()
    const customTemplates: EmailTemplate[] = []
    const existingIds = new Set<string>()

    snap.forEach(doc => {
      const data = doc.data() as Omit<EmailTemplate, 'id'>
      existingIds.add(doc.id)
      customTemplates.push({
        id: doc.id,
        ...data
      })
    })

    // Include default templates if not overridden in Firestore
    const mergedTemplates = [
      ...customTemplates,
      ...DEFAULT_EMAIL_TEMPLATES.filter(tpl => !existingIds.has(tpl.id))
    ]

    return NextResponse.json({
      success: true,
      templates: mergedTemplates
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      templates: DEFAULT_EMAIL_TEMPLATES
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
    const { action } = body

    // Action: Preview template with sample or custom variables
    if (action === 'preview') {
      const { subject, htmlBody, textBody, sampleData = {} } = body
      const preview = renderEmailForRecipient({
        subjectTemplate: subject || '',
        htmlTemplate: htmlBody || '',
        textTemplate: textBody || '',
        globalVariables: sampleData,
        recipientVariables: sampleData
      })

      return NextResponse.json({
        success: true,
        preview
      })
    }

    // Action: Duplicate an existing template
    if (action === 'duplicate') {
      const { sourceTemplate } = body
      if (!sourceTemplate || !sourceTemplate.name) {
        return NextResponse.json({ error: 'Source template required for duplication' }, { status: 400 })
      }
      const now = new Date().toISOString()
      const variables = extractTemplateVariables(
        sourceTemplate.subject,
        sourceTemplate.htmlBody,
        sourceTemplate.textBody
      )
      const newDoc: Omit<EmailTemplate, 'id'> = {
        name: `${sourceTemplate.name} (Copy)`,
        description: sourceTemplate.description || '',
        category: sourceTemplate.category || 'custom',
        subject: sourceTemplate.subject || '',
        htmlBody: sourceTemplate.htmlBody || '',
        textBody: sourceTemplate.textBody || '',
        variables,
        requiredVariables: sourceTemplate.requiredVariables || variables,
        sampleData: sourceTemplate.sampleData || {},
        status: 'draft',
        createdBy: adminUser.email,
        createdAt: now,
        updatedAt: now
      }

      const ref = await adminDb.collection('email_templates').add(newDoc)
      await recordEmailAuditLog({
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        domain: 'template',
        action: 'CREATE',
        targetId: ref.id,
        details: { name: newDoc.name, duplicatedFrom: sourceTemplate.id }
      })

      return NextResponse.json({
        success: true,
        template: { id: ref.id, ...newDoc }
      })
    }

    // Default Action: Create or Update template
    const {
      id,
      name,
      description = '',
      category = 'custom',
      subject,
      htmlBody,
      textBody = '',
      requiredVariables,
      sampleData = {},
      status = 'active'
    } = body

    if (!name || !subject || !htmlBody) {
      return NextResponse.json(
        { error: 'Template name, subject, and HTML body are required' },
        { status: 400 }
      )
    }

    const detectedVariables = extractTemplateVariables(subject, htmlBody, textBody)
    const now = new Date().toISOString()

    const templateData: Omit<EmailTemplate, 'id'> = {
      name: String(name).trim(),
      description: String(description).trim(),
      category,
      subject: String(subject).trim(),
      htmlBody: String(htmlBody),
      textBody: String(textBody),
      variables: detectedVariables,
      requiredVariables: Array.isArray(requiredVariables)
        ? requiredVariables
        : detectedVariables.filter(v => !['current_year', 'portfolio_url', 'sender_name', 'sender_email'].includes(v)),
      sampleData,
      status,
      createdBy: adminUser.email,
      createdAt: now,
      updatedAt: now
    }

    if (id) {
      await adminDb.collection('email_templates').doc(id).set(templateData, { merge: true })
      await recordEmailAuditLog({
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        domain: 'template',
        action: 'UPDATE',
        targetId: id,
        details: { name: templateData.name, category }
      })
      return NextResponse.json({
        success: true,
        template: { id, ...templateData }
      })
    } else {
      const ref = await adminDb.collection('email_templates').add(templateData)
      await recordEmailAuditLog({
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        domain: 'template',
        action: 'CREATE',
        targetId: ref.id,
        details: { name: templateData.name, category }
      })
      return NextResponse.json({
        success: true,
        template: { id: ref.id, ...templateData }
      })
    }
  } catch (error: any) {
    console.error('[Admin Templates POST Error]:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to save template' },
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
    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }
    if (id.startsWith('tpl_')) {
      return NextResponse.json(
        { error: 'Built-in system templates cannot be deleted; duplicate and customize instead.' },
        { status: 400 }
      )
    }

    await adminDb.collection('email_templates').doc(id).delete()
    await recordEmailAuditLog({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      domain: 'template',
      action: 'DELETE',
      targetId: id,
      details: {}
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}

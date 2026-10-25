import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { adminDb } from '@/lib/firebase/firebase-admin'
import { JobOpportunity, CareerProfile, CareerDocument } from '@/types/email-system'
import {
  parseJobOpportunitiesFromCsvOrText,
  evaluateJobMatchWithAi
} from '@/lib/career/job-intelligence'
import {
  getDefaultCareerProfile,
  getBuiltInDefaultCvDocument
} from '@/lib/career/career-storage'
import { detectEmailsInText, normalizeEmail } from '@/lib/email/recipient-resolver'
import { recordEmailAuditLog } from '@/lib/email/campaign-queue'

async function loadAdminCareerContext(adminId: string, adminEmail: string): Promise<{
  profile: CareerProfile
  documents: CareerDocument[]
}> {
  let profile = getDefaultCareerProfile(adminId, adminEmail)
  try {
    const profSnap = await adminDb.collection('career_profiles').doc(adminId).get()
    if (profSnap.exists) {
      profile = { ...profile, ...(profSnap.data() as CareerProfile), ownerId: adminId }
    }
  } catch {}

  const documents: CareerDocument[] = []
  try {
    const docSnap = await adminDb
      .collection('career_documents')
      .where('ownerId', '==', adminId)
      .get()
    docSnap.forEach(d => {
      const { base64Content, ...rest } = d.data() as Omit<CareerDocument, 'id'>
      documents.push({ id: d.id, ...rest })
    })
  } catch {}

  const builtIn = getBuiltInDefaultCvDocument(adminId)
  if (builtIn && !documents.some(d => d.id === builtIn.id)) {
    documents.push(builtIn)
  }

  return { profile, documents }
}

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
      .collection('job_opportunities')
      .where('ownerId', '==', adminUser.id)
      .get()

    const jobs: JobOpportunity[] = []
    snap.forEach(doc => {
      jobs.push({
        id: doc.id,
        ...(doc.data() as Omit<JobOpportunity, 'id'>)
      })
    })

    jobs.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))

    return NextResponse.json({
      success: true,
      jobs
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      jobs: []
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

    // 1. Bulk CSV/Text Import of Job Opportunities
    if (action === 'import_csv') {
      const { csvText, autoEvaluate = true, model } = body
      if (!csvText || typeof csvText !== 'string') {
        return NextResponse.json({ error: 'CSV text is required' }, { status: 400 })
      }

      const parsedJobs = parseJobOpportunitiesFromCsvOrText(csvText, adminUser.id)
      if (parsedJobs.length === 0) {
        return NextResponse.json({ error: 'No valid job rows found in CSV' }, { status: 400 })
      }

      const { profile, documents } = await loadAdminCareerContext(adminUser.id, adminUser.email)
      const createdJobs: JobOpportunity[] = []

      for (const jobData of parsedJobs) {
        let matchAssessment
        if (autoEvaluate) {
          matchAssessment = await evaluateJobMatchWithAi(
            profile,
            documents,
            { id: 'temp', ...jobData },
            model
          )
        }
        const toSave: Omit<JobOpportunity, 'id'> = {
          ...jobData,
          ownerId: adminUser.id,
          status: matchAssessment ? 'matched' : 'imported',
          ...(matchAssessment ? { matchAssessment } : {})
        }
        const ref = await adminDb.collection('job_opportunities').add(toSave)
        createdJobs.push({ id: ref.id, ...toSave })
      }

      await recordEmailAuditLog({
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        domain: 'job_application',
        action: 'CREATE',
        targetId: 'bulk_import',
        details: { importedCount: createdJobs.length }
      })

      return NextResponse.json({
        success: true,
        jobs: createdJobs
      })
    }

    // 2. Evaluate / Match an existing or batch of Job Opportunities
    if (action === 'evaluate_match') {
      const { jobIds = [], model } = body
      if (!Array.isArray(jobIds) || jobIds.length === 0) {
        return NextResponse.json({ error: 'jobIds array is required' }, { status: 400 })
      }

      const { profile, documents } = await loadAdminCareerContext(adminUser.id, adminUser.email)
      const updatedJobs: JobOpportunity[] = []

      for (const jobId of jobIds) {
        const docRef = adminDb.collection('job_opportunities').doc(jobId)
        const snap = await docRef.get()
        if (!snap.exists || snap.data()?.ownerId !== adminUser.id) continue

        const job = { id: snap.id, ...(snap.data() as Omit<JobOpportunity, 'id'>) }
        const matchAssessment = await evaluateJobMatchWithAi(profile, documents, job, model)
        const updatedAt = new Date().toISOString()

        await docRef.set(
          {
            matchAssessment,
            status: job.status === 'discovered' || job.status === 'imported' ? 'matched' : job.status,
            updatedAt
          },
          { merge: true }
        )

        updatedJobs.push({
          ...job,
          matchAssessment,
          status: job.status === 'discovered' || job.status === 'imported' ? 'matched' : job.status,
          updatedAt
        })
      }

      return NextResponse.json({
        success: true,
        jobs: updatedJobs
      })
    }

    // 3. Create or update a single Job Opportunity
    const {
      id,
      companyName,
      positionTitle,
      jobDescription = '',
      applicationEmail = '',
      applicationUrl = '',
      location = 'Remote',
      requiredSkills = [],
      employmentType = 'full-time',
      source = 'Manual Entry',
      sourceUrl = '',
      applicationDeadline = '',
      autoEvaluate = true,
      model
    } = body

    if (!companyName || !positionTitle) {
      return NextResponse.json(
        { error: 'Company name and position title are required' },
        { status: 400 }
      )
    }

    // Auto-detect email from job description if applicationEmail was left blank
    const detectedEmails = detectEmailsInText(`${applicationEmail} ${jobDescription}`)
    const resolvedEmail = normalizeEmail(applicationEmail) || detectedEmails[0] || ''
    const isPortalOnly = !resolvedEmail && Boolean(applicationUrl)

    const now = new Date().toISOString()
    const baseJob: Omit<JobOpportunity, 'id'> = {
      ownerId: adminUser.id,
      companyName: String(companyName).trim(),
      positionTitle: String(positionTitle).trim(),
      jobDescription: String(jobDescription).trim(),
      applicationEmail: resolvedEmail,
      applicationUrl: String(applicationUrl).trim(),
      isPortalOnly,
      location: String(location).trim(),
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills
        : String(requiredSkills)
            .split(/[,;\n]+/)
            .map(s => s.trim())
            .filter(Boolean),
      employmentType,
      source: String(source).trim(),
      sourceUrl: String(sourceUrl || applicationUrl).trim() || undefined,
      isVerifiedSource: true,
      applicationDeadline: applicationDeadline || undefined,
      status: 'to_review',
      createdAt: now,
      updatedAt: now
    }

    if (autoEvaluate) {
      const { profile, documents } = await loadAdminCareerContext(adminUser.id, adminUser.email)
      baseJob.matchAssessment = await evaluateJobMatchWithAi(
        profile,
        documents,
        { id: id || 'new', ...baseJob },
        model
      )
      baseJob.status = 'matched'
    }

    if (id) {
      await adminDb.collection('job_opportunities').doc(id).set(baseJob, { merge: true })
      return NextResponse.json({
        success: true,
        job: { id, ...baseJob }
      })
    } else {
      const ref = await adminDb.collection('job_opportunities').add(baseJob)
      return NextResponse.json({
        success: true,
        job: { id: ref.id, ...baseJob }
      })
    }
  } catch (error: any) {
    console.error('[Admin Jobs POST Error]:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to process job opportunity' },
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
    if (!id) return NextResponse.json({ error: 'Job ID required' }, { status: 400 })

    const docRef = adminDb.collection('job_opportunities').doc(id)
    const snap = await docRef.get()
    if (!snap.exists || snap.data()?.ownerId !== adminUser.id) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }

    await docRef.delete()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete job opportunity' }, { status: 500 })
  }
}

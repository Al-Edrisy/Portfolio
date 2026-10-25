import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { adminDb } from '@/lib/firebase/firebase-admin'
import {
  CareerProfile,
  CareerDocument,
  JobOpportunity,
  JobApplicationRecord,
  JobApplicationStatus
} from '@/types/email-system'
import {
  getDefaultCareerProfile,
  getBuiltInDefaultCvDocument,
  resolveCareerDocumentAttachment
} from '@/lib/career/career-storage'
import {
  evaluateJobMatchWithAi,
  generateTailoredApplicationDraft
} from '@/lib/career/job-intelligence'
import {
  computeContentHash,
  computeApplicationApprovalHash,
  sendSingleEmailWithRetry,
  processEmailBatchQueue,
  OutboundEmailPayload,
  EmailAttachmentPayload,
  recordEmailAuditLog
} from '@/lib/email/campaign-queue'
import { isValidEmailAddress, normalizeEmail } from '@/lib/email/recipient-resolver'
import { renderEmailForRecipient, DEFAULT_EMAIL_TEMPLATES } from '@/lib/email/template-engine'

async function loadAdminCareerData(adminId: string, adminEmail: string): Promise<{
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
      documents.push({ id: d.id, ...(d.data() as Omit<CareerDocument, 'id'>) })
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
      .collection('job_applications')
      .where('ownerId', '==', adminUser.id)
      .get()

    const applications: JobApplicationRecord[] = []
    snap.forEach(doc => {
      applications.push({
        id: doc.id,
        ...(doc.data() as Omit<JobApplicationRecord, 'id'>)
      })
    })

    applications.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))

    return NextResponse.json({
      success: true,
      applications
    })
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      applications: []
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

    const { profile, documents } = await loadAdminCareerData(adminUser.id, adminUser.email)

    // 1. Prepare personalized application drafts (single or bulk jobIds)
    if (action === 'prepare_drafts') {
      const {
        jobIds = [],
        preferredCvId,
        overrideDuplicateWarning = false,
        forceRegenerateManual = false,
        model
      } = body

      if (!Array.isArray(jobIds) || jobIds.length === 0) {
        return NextResponse.json({ error: 'Select at least one job opportunity' }, { status: 400 })
      }

      // Load existing applications to check for duplicate company + position
      const existingAppsSnap = await adminDb
        .collection('job_applications')
        .where('ownerId', '==', adminUser.id)
        .get()

      const existingApps: JobApplicationRecord[] = []
      existingAppsSnap.forEach(d => {
        existingApps.push({ id: d.id, ...(d.data() as Omit<JobApplicationRecord, 'id'>) })
      })

      const preparedRecords: JobApplicationRecord[] = []
      const skippedDuplicates: { jobId: string; companyName: string; positionTitle: string; reason: string }[] = []

      for (const jobId of jobIds) {
        const jobSnap = await adminDb.collection('job_opportunities').doc(jobId).get()
        if (!jobSnap.exists || jobSnap.data()?.ownerId !== adminUser.id) continue
        const job = { id: jobSnap.id, ...(jobSnap.data() as Omit<JobOpportunity, 'id'>) }

        // Check duplicate application for same candidate + company + position
        const existingForJob = existingApps.find(
          a =>
            a.jobId === job.id ||
            (a.companyName.toLowerCase() === job.companyName.toLowerCase() &&
              a.positionTitle.toLowerCase() === job.positionTitle.toLowerCase() &&
              a.status !== 'withdrawn' &&
              a.status !== 'archived')
        )

        if (existingForJob && !overrideDuplicateWarning) {
          // Protect manually edited or approved content from silent AI overwrite
          if (
            (existingForJob.isManuallyEdited || existingForJob.status === 'approved' || existingForJob.status === 'sent') &&
            !forceRegenerateManual
          ) {
            skippedDuplicates.push({
              jobId: job.id,
              companyName: job.companyName,
              positionTitle: job.positionTitle,
              reason:
                existingForJob.status === 'sent'
                  ? 'Application has already been sent for this company and position.'
                  : 'Application draft has manual edits or approval. Enable override to regenerate.'
            })
            preparedRecords.push(existingForJob)
            continue
          }
        }

        const matchAssessment =
          job.matchAssessment || (await evaluateJobMatchWithAi(profile, documents, job, model))

        const cvDocs = documents.filter(d => d.type === 'cv')
        const selectedCv =
          cvDocs.find(d => d.id === preferredCvId) ||
          cvDocs.find(d => d.id === matchAssessment.recommendedCvDocumentId) ||
          cvDocs.find(d => d.isDefault) ||
          cvDocs[0]

        if (!selectedCv) {
          return NextResponse.json(
            { error: 'No CV document available. Please upload a CV in Career Profile first.' },
            { status: 400 }
          )
        }

        const generated = await generateTailoredApplicationDraft({
          profile,
          selectedCv,
          job,
          matchAssessment,
          model
        })

        const now = new Date().toISOString()
        const draftData: Omit<JobApplicationRecord, 'id'> = {
          ownerId: adminUser.id,
          jobId: job.id,
          companyName: job.companyName,
          positionTitle: job.positionTitle,
          recipientEmail: normalizeEmail(job.applicationEmail),
          applicationUrl: job.applicationUrl,
          isPortalOnly: job.isPortalOnly || !isValidEmailAddress(normalizeEmail(job.applicationEmail)),
          status: 'awaiting_approval',
          emailSubject: generated.emailSubject,
          emailBody: generated.emailBody,
          coverLetter: generated.coverLetter,
          selectedCvDocumentId: selectedCv.id,
          selectedCvName: selectedCv.name,
          useTailoredCvSummary: true,
          tailoredCv: generated.tailoredCv,
          additionalAttachmentIds: [],
          portfolioLinks: generated.portfolioLinks,
          personalizationSummary: generated.personalizationSummary,
          missingInfoWarnings: generated.missingInfoWarnings,
          matchAssessment,
          isManuallyEdited: false,
          contentVersion: existingForJob ? (existingForJob.contentVersion || 1) + 1 : 1,
          createdAt: existingForJob?.createdAt || now,
          updatedAt: now
        }

        if (existingForJob) {
          await adminDb
            .collection('job_applications')
            .doc(existingForJob.id)
            .set(draftData, { merge: true })
          preparedRecords.push({ id: existingForJob.id, ...draftData })
        } else {
          const ref = await adminDb.collection('job_applications').add(draftData)
          preparedRecords.push({ id: ref.id, ...draftData })
        }

        await adminDb
          .collection('job_opportunities')
          .doc(job.id)
          .set({ status: 'awaiting_approval', matchAssessment, updatedAt: now }, { merge: true })
      }

      return NextResponse.json({
        success: true,
        applications: preparedRecords,
        skippedDuplicates
      })
    }

    // 2. Update/Edit a draft manually (Automatically invalidates previous approval if content changed!)
    if (action === 'update_draft') {
      const {
        applicationId,
        recipientEmail,
        emailSubject,
        emailBody,
        coverLetter,
        selectedCvDocumentId,
        useTailoredCvSummary,
        additionalAttachmentIds,
        portfolioLinks,
        notes,
        followUpDate,
        status
      } = body

      if (!applicationId) {
        return NextResponse.json({ error: 'applicationId is required' }, { status: 400 })
      }

      const appRef = adminDb.collection('job_applications').doc(applicationId)
      const snap = await appRef.get()
      if (!snap.exists || snap.data()?.ownerId !== adminUser.id) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 })
      }

      const currentApp = { id: snap.id, ...(snap.data() as Omit<JobApplicationRecord, 'id'>) }

      const updatedRecipient =
        recipientEmail !== undefined ? normalizeEmail(recipientEmail) : currentApp.recipientEmail
      const updatedSubject =
        emailSubject !== undefined ? String(emailSubject).trim() : currentApp.emailSubject
      const updatedBody =
        emailBody !== undefined ? String(emailBody) : currentApp.emailBody
      const updatedCoverLetter =
        coverLetter !== undefined ? String(coverLetter) : currentApp.coverLetter
      const updatedCvId =
        selectedCvDocumentId !== undefined ? selectedCvDocumentId : currentApp.selectedCvDocumentId
      const updatedAttachments =
        additionalAttachmentIds !== undefined
          ? additionalAttachmentIds
          : currentApp.additionalAttachmentIds

      const newHash = computeApplicationApprovalHash({
        recipientEmail: updatedRecipient,
        emailSubject: updatedSubject,
        emailBody: updatedBody,
        coverLetter: updatedCoverLetter,
        selectedCvDocumentId: updatedCvId,
        additionalAttachmentIds: updatedAttachments
      })

      const contentChangedAfterApproval =
        currentApp.status === 'approved' &&
        currentApp.contentHash &&
        currentApp.contentHash !== newHash

      const nextStatus: JobApplicationStatus = contentChangedAfterApproval
        ? 'awaiting_approval'
        : status || currentApp.status

      const selectedCvObj = documents.find(d => d.id === updatedCvId)
      const now = new Date().toISOString()

      const patch: Partial<JobApplicationRecord> = {
        recipientEmail: updatedRecipient,
        isPortalOnly: !isValidEmailAddress(updatedRecipient) && Boolean(currentApp.applicationUrl),
        emailSubject: updatedSubject,
        emailBody: updatedBody,
        coverLetter: updatedCoverLetter,
        selectedCvDocumentId: updatedCvId,
        selectedCvName: selectedCvObj?.name || currentApp.selectedCvName,
        ...(useTailoredCvSummary !== undefined ? { useTailoredCvSummary } : {}),
        additionalAttachmentIds: updatedAttachments,
        ...(portfolioLinks !== undefined ? { portfolioLinks } : {}),
        ...(notes !== undefined ? { notes } : {}),
        ...(followUpDate !== undefined ? { followUpDate } : {}),
        status: nextStatus,
        isManuallyEdited: true,
        contentVersion: (currentApp.contentVersion || 1) + 1,
        updatedAt: now
      }

      if (contentChangedAfterApproval) {
        patch.approvedAt = undefined
        patch.approvedBy = undefined
        patch.contentHash = undefined

        await recordEmailAuditLog({
          actorId: adminUser.id,
          actorEmail: adminUser.email,
          domain: 'job_application',
          action: 'APPROVAL_INVALIDATED',
          targetId: applicationId,
          details: {
            reason: 'Subject, body, recipient, or attachments modified after approval',
            companyName: currentApp.companyName
          }
        })
      }

      await appRef.set(patch, { merge: true })

      return NextResponse.json({
        success: true,
        approvalInvalidated: Boolean(contentChangedAfterApproval),
        application: {
          ...currentApp,
          ...patch
        }
      })
    }

    // 3. Explicitly Approve one or more reviewed job applications
    if (action === 'approve') {
      const { applicationIds = [] } = body
      if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
        return NextResponse.json({ error: 'applicationIds required' }, { status: 400 })
      }

      const approvedList: JobApplicationRecord[] = []
      const validationErrors: { id: string; companyName: string; error: string }[] = []

      for (const appId of applicationIds) {
        const appRef = adminDb.collection('job_applications').doc(appId)
        const snap = await appRef.get()
        if (!snap.exists || snap.data()?.ownerId !== adminUser.id) continue

        const app = { id: snap.id, ...(snap.data() as Omit<JobApplicationRecord, 'id'>) }
        const cleanEmail = normalizeEmail(app.recipientEmail)

        if (app.isPortalOnly || !isValidEmailAddress(cleanEmail)) {
          validationErrors.push({
            id: app.id,
            companyName: app.companyName,
            error: `Cannot approve for email sending: ${app.companyName} requires portal submission or has an invalid application email address (${app.recipientEmail || 'empty'}).`
          })
          continue
        }

        if (!app.emailSubject.trim() || !app.emailBody.trim()) {
          validationErrors.push({
            id: app.id,
            companyName: app.companyName,
            error: 'Email subject and body cannot be empty.'
          })
          continue
        }

        const hash = computeApplicationApprovalHash(app)
        const now = new Date().toISOString()

        const approvalPatch = {
          status: 'approved' as JobApplicationStatus,
          contentHash: hash,
          approvedAt: now,
          approvedBy: adminUser.email,
          updatedAt: now
        }

        await appRef.set(approvalPatch, { merge: true })
        await adminDb
          .collection('job_opportunities')
          .doc(app.jobId)
          .set({ status: 'approved', updatedAt: now }, { merge: true })

        await recordEmailAuditLog({
          actorId: adminUser.id,
          actorEmail: adminUser.email,
          domain: 'job_application',
          action: 'APPROVE',
          targetId: app.id,
          details: {
            companyName: app.companyName,
            positionTitle: app.positionTitle,
            recipientEmail: cleanEmail,
            contentHash: hash
          }
        })

        approvedList.push({ ...app, ...approvalPatch })
      }

      return NextResponse.json({
        success: approvedList.length > 0,
        approvedApplications: approvedList,
        validationErrors
      })
    }

    // 4. Send a test email of a job application to the administrator's own email
    if (action === 'send_test') {
      const { applicationId, testEmail } = body
      const appSnap = await adminDb.collection('job_applications').doc(applicationId).get()
      if (!appSnap.exists || appSnap.data()?.ownerId !== adminUser.id) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 })
      }
      const app = { id: appSnap.id, ...(appSnap.data() as Omit<JobApplicationRecord, 'id'>) }
      const targetTestEmail = normalizeEmail(testEmail || adminUser.email)

      const attachments = await buildVerifiedJobAttachments(app, documents, adminUser.id)

      const jobTemplate =
        DEFAULT_EMAIL_TEMPLATES.find(t => t.id === 'tpl_job_application_direct')!
      const rendered = renderEmailForRecipient({
        subjectTemplate: `[TEST APPLICATION] ${app.emailSubject}`,
        htmlTemplate: jobTemplate.htmlBody,
        textTemplate: jobTemplate.textBody,
        recipientVariables: {
          position_title: app.positionTitle,
          candidate_name: profile.fullName,
          hiring_team: 'Hiring Team',
          company_name: app.companyName,
          email_body: `${app.emailBody}\n\n--- COVER LETTER ---\n\n${app.coverLetter}`,
          portfolio_links: (app.portfolioLinks || []).join('\n'),
          candidate_email: profile.email,
          candidate_phone: profile.phone,
          portfolio_url: profile.portfolioUrl
        }
      })

      const result = await sendSingleEmailWithRetry({
        idempotencyKey: `job_test_${app.id}_${Date.now()}`,
        to: targetTestEmail,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        replyTo: profile.email,
        fromName: profile.fullName,
        attachments
      })

      return NextResponse.json({
        success: result.status === 'accepted',
        result
      })
    }

    // 5. Controlled Queue Dispatch of Explicitly Approved Job Applications
    if (action === 'send_approved') {
      const { applicationIds = [] } = body
      if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
        return NextResponse.json(
          { error: 'Select at least one approved application to send' },
          { status: 400 }
        )
      }

      const payloadsToQueue: {
        app: JobApplicationRecord
        payload: OutboundEmailPayload
      }[] = []
      const rejectedPreSend: { id: string; companyName: string; reason: string }[] = []

      const jobTemplate =
        DEFAULT_EMAIL_TEMPLATES.find(t => t.id === 'tpl_job_application_direct')!

      for (const appId of applicationIds) {
        const appSnap = await adminDb.collection('job_applications').doc(appId).get()
        if (!appSnap.exists || appSnap.data()?.ownerId !== adminUser.id) continue

        const app = { id: appSnap.id, ...(appSnap.data() as Omit<JobApplicationRecord, 'id'>) }

        // Mandatory enforcement: Must be in 'approved' status
        if (app.status !== 'approved') {
          rejectedPreSend.push({
            id: app.id,
            companyName: app.companyName,
            reason: `Application status is "${app.status}" — human review and explicit approval are required before sending.`
          })
          continue
        }

        // Verify content hash has not drifted since approval
        const currentHash = computeApplicationApprovalHash(app)
        if (!app.contentHash || app.contentHash !== currentHash) {
          await adminDb
            .collection('job_applications')
            .doc(app.id)
            .set({ status: 'awaiting_approval' }, { merge: true })
          rejectedPreSend.push({
            id: app.id,
            companyName: app.companyName,
            reason:
              'Application content or attachments changed after approval. Please re-review and approve again.'
          })
          continue
        }

        const cleanRecipient = normalizeEmail(app.recipientEmail)
        if (app.isPortalOnly || !isValidEmailAddress(cleanRecipient)) {
          rejectedPreSend.push({
            id: app.id,
            companyName: app.companyName,
            reason: 'Portal-only opportunity or invalid recipient email address.'
          })
          continue
        }

        // Resolve and verify attachments isolated strictly to this application
        const attachments = await buildVerifiedJobAttachments(app, documents, adminUser.id)

        const rendered = renderEmailForRecipient({
          subjectTemplate: app.emailSubject,
          htmlTemplate: jobTemplate.htmlBody,
          textTemplate: jobTemplate.textBody,
          recipientVariables: {
            position_title: app.positionTitle,
            candidate_name: profile.fullName,
            hiring_team: 'Hiring Team',
            company_name: app.companyName,
            email_body: `${app.emailBody}\n\n--- COVER LETTER ---\n\n${app.coverLetter}`,
            portfolio_links: (app.portfolioLinks || []).join('\n'),
            candidate_email: profile.email,
            candidate_phone: profile.phone,
            portfolio_url: profile.portfolioUrl
          }
        })

        const idempotencyKey = computeContentHash([
          'job_application_send',
          app.id,
          cleanRecipient,
          app.contentHash
        ])

        payloadsToQueue.push({
          app,
          payload: {
            idempotencyKey,
            to: cleanRecipient,
            subject: rendered.subject,
            html: rendered.html,
            text: rendered.text,
            replyTo: profile.email,
            fromName: profile.fullName,
            attachments
          }
        })
      }

      if (payloadsToQueue.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'No eligible approved applications could be queued.',
            rejectedPreSend
          },
          { status: 400 }
        )
      }

      const queueResults = await processEmailBatchQueue(
        payloadsToQueue.map(p => p.payload),
        { concurrency: 2, batchDelayMs: 350, maxRetries: 2 }
      )

      const updatedApplications: JobApplicationRecord[] = []

      for (let i = 0; i < payloadsToQueue.length; i++) {
        const { app } = payloadsToQueue[i]
        const res = queueResults[i]
        const now = new Date().toISOString()

        // Default follow-up reminder 7 days after sending
        const followUp = new Date()
        followUp.setDate(followUp.getDate() + 7)

        const nextStatus: JobApplicationStatus =
          res.status === 'accepted' ? 'sent' : 'delivery_failed'

        const patch: Partial<JobApplicationRecord> = {
          status: nextStatus,
          deliveryStatus: res.status,
          smtpMessageId: res.messageId,
          smtpResponse: res.smtpResponse,
          sentAt: res.status === 'accepted' ? now : undefined,
          deliveryError: res.error,
          followUpDate:
            res.status === 'accepted'
              ? app.followUpDate || followUp.toISOString().split('T')[0]
              : app.followUpDate,
          updatedAt: now
        }

        await adminDb.collection('job_applications').doc(app.id).set(patch, { merge: true })
        await adminDb
          .collection('job_opportunities')
          .doc(app.jobId)
          .set({ status: nextStatus, updatedAt: now }, { merge: true })

        await recordEmailAuditLog({
          actorId: adminUser.id,
          actorEmail: adminUser.email,
          domain: 'job_application',
          action: res.status === 'accepted' ? 'SEND_SUCCESS' : 'SEND_FAILURE',
          targetId: app.id,
          details: {
            companyName: app.companyName,
            positionTitle: app.positionTitle,
            recipientEmail: app.recipientEmail,
            deliveryStatus: res.status,
            messageId: res.messageId,
            error: res.error
          }
        })

        updatedApplications.push({ ...app, ...patch })
      }

      return NextResponse.json({
        success: true,
        applications: updatedApplications,
        rejectedPreSend
      })
    }

    return NextResponse.json({ error: 'Unsupported application action' }, { status: 400 })
  } catch (error: any) {
    console.error('[Admin Applications POST Error]:', error.message)
    return NextResponse.json(
      { error: error.message || 'Application workflow failed' },
      { status: 500 }
    )
  }
}

async function buildVerifiedJobAttachments(
  app: JobApplicationRecord,
  documents: CareerDocument[],
  adminUid: string
): Promise<EmailAttachmentPayload[]> {
  const attachments: EmailAttachmentPayload[] = []

  // 1. Primary selected CV document
  const cvDoc = documents.find(d => d.id === app.selectedCvDocumentId)
  if (cvDoc) {
    const resolved = await resolveCareerDocumentAttachment(cvDoc, adminUid)
    if (resolved) {
      attachments.push({
        filename: resolved.filename,
        content: resolved.content,
        contentType: resolved.contentType
      })
    }
  }

  // 2. If tailored ATS CV HTML summary was enabled and approved, attach a clean company-specific ATS HTML/Markdown supplement only when requested, or keep original CV intact
  if (app.useTailoredCvSummary && app.tailoredCv?.htmlContent) {
    const safeCompanySlug = app.companyName.replace(/[^a-zA-Z0-9_-]/g, '_')
    attachments.push({
      filename: `Salih_Ben_Otman_Tailored_Profile_${safeCompanySlug}.html`,
      content: Buffer.from(app.tailoredCv.htmlContent, 'utf-8'),
      contentType: 'text/html'
    })
  }

  // 3. Explicitly selected supporting documents (never attach all documents automatically)
  for (const extraId of app.additionalAttachmentIds || []) {
    if (extraId === app.selectedCvDocumentId) continue
    const extraDoc = documents.find(d => d.id === extraId)
    if (extraDoc) {
      const resolved = await resolveCareerDocumentAttachment(extraDoc, adminUid)
      if (resolved) {
        attachments.push({
          filename: resolved.filename,
          content: resolved.content,
          contentType: resolved.contentType
        })
      }
    }
  }

  return attachments
}

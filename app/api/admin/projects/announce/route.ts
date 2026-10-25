import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { adminDb } from '@/lib/firebase/firebase-admin'
import {
  DEFAULT_EMAIL_TEMPLATES,
  PROJECT_ANNOUNCEMENT_TEMPLATE_IDS,
  buildProjectTemplateVariables,
  evaluateDeliverabilityHealth,
  renderEmailForRecipient,
  resolvePublicBaseUrl,
  sanitizeOutboundUrl
} from '@/lib/email/template-engine'
import {
  DatabaseUserRecord,
  resolveRecipients,
  normalizeEmail
} from '@/lib/email/recipient-resolver'
import {
  computeContentHash,
  processEmailBatchQueue,
  recordEmailAuditLog,
  sendSingleEmailWithRetry,
  OutboundEmailPayload
} from '@/lib/email/campaign-queue'

function extractPublicRequestOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host') || request.headers.get('host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }
  return request.nextUrl.origin
}

let dbCache: {
  registeredUsers: DatabaseUserRecord[]
  pastContacts: DatabaseUserRecord[]
  suppressedEmails: Set<string>
  cachedAt: number
} | null = null

async function loadUsersAndContactsFromDb(forceRefresh = false): Promise<{
  registeredUsers: DatabaseUserRecord[]
  pastContacts: DatabaseUserRecord[]
  suppressedEmails: Set<string>
}> {
  const now = Date.now()
  if (!forceRefresh && dbCache && now - dbCache.cachedAt < 60_000) {
    return {
      registeredUsers: dbCache.registeredUsers,
      pastContacts: dbCache.pastContacts,
      suppressedEmails: dbCache.suppressedEmails
    }
  }

  const registeredUsers: DatabaseUserRecord[] = []
  const pastContacts: DatabaseUserRecord[] = []
  const suppressedEmails = new Set<string>()

  try {
    const usersSnap = await adminDb.collection('users').limit(500).get()
    usersSnap.forEach(doc => {
      const d = doc.data()
      if (d.email) {
        registeredUsers.push({
          id: doc.id,
          email: d.email,
          name: d.name || d.displayName || 'Portfolio Member',
          role: d.role || 'user',
          unsubscribed: Boolean(d.unsubscribed || d.emailOptOut),
          disabled: Boolean(d.disabled)
        })
      }
    })
  } catch {
    // Firestore offline fallback
  }

  try {
    const messagesSnap = await adminDb.collection('messages').limit(300).get()
    const seenContactEmails = new Set<string>()
    messagesSnap.forEach(doc => {
      const d = doc.data()
      if (d.email) {
        const norm = normalizeEmail(d.email)
        if (!seenContactEmails.has(norm)) {
          seenContactEmails.add(norm)
          pastContacts.push({
            id: `contact_${doc.id}`,
            email: d.email,
            name: d.name || 'Contact',
            role: 'contact',
            unsubscribed: Boolean(d.unsubscribed)
          })
        }
      }
    })
  } catch {
    // Ignore
  }

  try {
    const suppSnap = await adminDb.collection('email_suppressions').get()
    suppSnap.forEach(doc => {
      const d = doc.data()
      if (d.email) suppressedEmails.add(normalizeEmail(d.email))
    })
  } catch {
    // Ignore
  }

  dbCache = { registeredUsers, pastContacts, suppressedEmails, cachedAt: now }
  return { registeredUsers, pastContacts, suppressedEmails }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId') || ''

    let projectRecord: any = null
    if (projectId) {
      try {
        const docSnap = await adminDb.collection('projects').doc(projectId).get()
        if (docSnap.exists) {
          const data = docSnap.data() || {}
          projectRecord = {
            id: docSnap.id,
            ...data,
            announcedAt: data.announcedAt?.toDate
              ? data.announcedAt.toDate().toISOString()
              : data.announcedAt || null
          }
        }
      } catch {
        // Fallback to client-supplied project object in UI
      }
    }

    const projectTemplates = DEFAULT_EMAIL_TEMPLATES.filter(
      t =>
        t.category === 'project_release' ||
        (PROJECT_ANNOUNCEMENT_TEMPLATE_IDS as readonly string[]).includes(t.id)
    )

    const { registeredUsers, pastContacts, suppressedEmails } = await loadUsersAndContactsFromDb()

    // Default selection: All eligible registered users pre-selected
    const defaultSummary = resolveRecipients({
      dbUsers: registeredUsers,
      selectAllEligible: true,
      suppressedEmails
    })

    const requestOrigin = extractPublicRequestOrigin(request)
    const variables = projectRecord
      ? buildProjectTemplateVariables(projectRecord, { baseUrl: requestOrigin })
      : {}

    return NextResponse.json({
      success: true,
      project: projectRecord,
      templates: projectTemplates,
      defaultTemplateId: 'tpl_project_release_note',
      variables,
      registeredUsers,
      pastContacts,
      defaultSummary
    })
  } catch (error: any) {
    if (error instanceof Response) {
      return error
    }
    const status = error.message?.includes('Forbidden')
      ? 403
      : error.message?.includes('Authentication') || error.message?.includes('Unauthorized')
        ? 401
        : 500
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminUser = await requireAdmin(request)
    const body = await request.json()
    const {
      action,
      projectId,
      projectData,
      templateId = 'tpl_project_release_note',
      subjectTemplate,
      htmlTemplate,
      textTemplate,
      variables = {},
      includeRegisteredUsers = true,
      includePastContacts = false,
      excludedEmails = [],
      manualInput = '',
      testEmail,
      confirmed
    } = body

    const requestOrigin = extractPublicRequestOrigin(request)
    const publicBase = resolvePublicBaseUrl(requestOrigin)

    const defaultProjectVars = buildProjectTemplateVariables(
      projectData || { id: projectId },
      { baseUrl: requestOrigin }
    )

    const baseVariables = {
      ...defaultProjectVars,
      ...variables,
      project_url: sanitizeOutboundUrl(
        variables.project_url || defaultProjectVars.project_url,
        publicBase
      ),
      project_demo_url: sanitizeOutboundUrl(
        variables.project_demo_url || defaultProjectVars.project_demo_url,
        publicBase
      ),
      portfolio_url: sanitizeOutboundUrl(
        variables.portfolio_url || defaultProjectVars.portfolio_url,
        publicBase
      )
    }

    const { registeredUsers, pastContacts, suppressedEmails } = await loadUsersAndContactsFromDb()

    // Merge user pools according to toggles
    const selectedPool: DatabaseUserRecord[] = []
    if (includeRegisteredUsers) {
      selectedPool.push(...registeredUsers)
    }
    if (includePastContacts) {
      selectedPool.push(...pastContacts)
    }

    // Add any admin-excluded emails into the suppression set for this resolution
    const effectiveSuppression = new Set<string>(suppressedEmails)
    if (Array.isArray(excludedEmails)) {
      for (const ex of excludedEmails) {
        if (typeof ex === 'string' && ex.trim()) {
          effectiveSuppression.add(normalizeEmail(ex))
        }
      }
    }

    const recipientSummary = resolveRecipients({
      dbUsers: selectedPool,
      selectAllEligible: selectedPool.length > 0,
      manualInput,
      suppressedEmails: effectiveSuppression
    })

    // 1. Resolve recipients & compute deliverability preview
    if (action === 'resolve_recipients') {
      const sampleRendered = renderEmailForRecipient({
        subjectTemplate: subjectTemplate || '',
        htmlTemplate: htmlTemplate || '',
        textTemplate: textTemplate || '',
        globalVariables: baseVariables,
        recipientVariables: {
          first_name: 'Alex',
          recipient_name: 'Alex Rivera',
          recipient_email: 'alex@example.com'
        }
      })

      const deliverability = evaluateDeliverabilityHealth({
        subject: sampleRendered.subject,
        textBody: sampleRendered.text,
        htmlBody: sampleRendered.html
      })

      return NextResponse.json({
        success: true,
        summary: recipientSummary,
        deliverability,
        preview: sampleRendered
      })
    }

    if (!subjectTemplate || !htmlTemplate) {
      return NextResponse.json(
        { success: false, error: 'Subject and HTML body are required.' },
        { status: 400 }
      )
    }

    // 2. Send Test Email
    if (action === 'send_test') {
      const targetTestEmail = (testEmail || adminUser.email || '').trim()
      if (!targetTestEmail) {
        return NextResponse.json(
          { success: false, error: 'A valid test email address is required.' },
          { status: 400 }
        )
      }

      const rendered = renderEmailForRecipient({
        subjectTemplate,
        htmlTemplate,
        textTemplate,
        globalVariables: baseVariables,
        recipientVariables: {
          first_name: adminUser.name?.split(' ')[0] || 'Admin',
          recipient_name: adminUser.name || 'Admin',
          recipient_email: targetTestEmail
        }
      })

      const result = await sendSingleEmailWithRetry({
        idempotencyKey: `test_proj_${projectId || 'new'}_${Date.now()}`,
        to: targetTestEmail,
        subject: `[TEST] ${rendered.subject}`,
        html: rendered.html,
        text: rendered.text
      })

      return NextResponse.json({
        success: result.status === 'accepted',
        result
      })
    }

    // 3. Save Draft Campaign for Later in Email Center
    if (action === 'save_draft') {
      const now = new Date().toISOString()
      const campaignId = `cmp_proj_${projectId || Date.now()}_${Date.now()}`
      const campaignData = {
        id: campaignId,
        name: `Project Release: ${baseVariables.project_title}`,
        templateId,
        category: 'project_release',
        projectId: projectId || null,
        subjectTemplate,
        htmlTemplate,
        textTemplate: textTemplate || '',
        globalVariables: baseVariables,
        recipientSelection: {
          mode: 'multiple',
          includeRegisteredUsers,
          includePastContacts,
          excludedEmails,
          manualEmailsRaw: manualInput
        },
        status: 'draft',
        counts: {
          totalSelected: recipientSummary.totalInputCount,
          validCount: recipientSummary.validCount,
          invalidCount: recipientSummary.invalidCount,
          duplicateCount: recipientSummary.duplicateCount,
          unsubscribedCount: recipientSummary.unsubscribedCount,
          acceptedCount: 0,
          failedCount: 0
        },
        createdBy: adminUser.id,
        createdAt: now,
        updatedAt: now
      }

      try {
        await adminDb.collection('email_campaigns').doc(campaignId).set(campaignData)
      } catch {
        // Offline tolerance
      }

      return NextResponse.json({
        success: true,
        campaign: campaignData
      })
    }

    // 4. Approve and Dispatch Project Announcement
    if (action === 'approve_and_send') {
      if (confirmed !== true) {
        return NextResponse.json(
          {
            success: false,
            error: 'Explicit human confirmation (confirmed: true) is required before dispatching project announcements.'
          },
          { status: 400 }
        )
      }

      if (recipientSummary.validCount === 0) {
        return NextResponse.json(
          { success: false, error: 'No valid, eligible recipients selected.' },
          { status: 400 }
        )
      }

      const now = new Date().toISOString()
      const campaignId = `cmp_proj_${projectId || 'release'}_${Date.now()}`
      const contentHash = computeContentHash([
        projectId || '',
        subjectTemplate,
        htmlTemplate,
        textTemplate || '',
        recipientSummary.validRecipients.map(r => r.email)
      ])

      const payloads: OutboundEmailPayload[] = recipientSummary.validRecipients.map(recipient => {
        const rendered = renderEmailForRecipient({
          subjectTemplate,
          htmlTemplate,
          textTemplate,
          globalVariables: baseVariables,
          recipientVariables: {
            first_name: recipient.firstName || recipient.name?.split(' ')[0] || 'there',
            recipient_name: recipient.name || recipient.email.split('@')[0],
            recipient_email: recipient.email,
            ...(recipient.customVariables || {})
          }
        })

        const idempotencyKey = computeContentHash([
          campaignId,
          recipient.email,
          rendered.subject,
          rendered.html
        ])

        return {
          idempotencyKey,
          to: recipient.email,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text
        }
      })

      const batchResults = await processEmailBatchQueue(payloads, {
        concurrency: 3,
        batchDelayMs: 250,
        maxRetries: 2
      })

      const acceptedCount = batchResults.filter(r => r.status === 'accepted').length
      const failedCount = batchResults.filter(r => r.status !== 'accepted').length
      const dispatchSummary = {
        acceptedCount,
        failedCount,
        results: batchResults
      }

      const finalStatus =
        dispatchSummary.failedCount === 0
          ? 'completed'
          : dispatchSummary.acceptedCount > 0
            ? 'partially_failed'
            : 'failed'

      const campaignRecord = {
        id: campaignId,
        name: `Project Release: ${baseVariables.project_title}`,
        templateId,
        category: 'project_release',
        projectId: projectId || null,
        subjectTemplate,
        htmlTemplate,
        textTemplate: textTemplate || '',
        globalVariables: baseVariables,
        status: finalStatus,
        approvedBy: adminUser.id,
        approvedAt: now,
        contentHash,
        counts: {
          totalSelected: recipientSummary.totalInputCount,
          validCount: recipientSummary.validCount,
          invalidCount: recipientSummary.invalidCount,
          duplicateCount: recipientSummary.duplicateCount,
          unsubscribedCount: recipientSummary.unsubscribedCount,
          acceptedCount: dispatchSummary.acceptedCount,
          failedCount: dispatchSummary.failedCount
        },
        createdBy: adminUser.id,
        createdAt: now,
        updatedAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      }

      try {
        await adminDb.collection('email_campaigns').doc(campaignId).set(campaignRecord)
      } catch {
        // Offline tolerance
      }

      // Mark project as announced in Firestore if projectId is provided and at least 1 email was accepted
      if (projectId && dispatchSummary.acceptedCount > 0) {
        try {
          await adminDb.collection('projects').doc(projectId).set(
            {
              announcedAt: now,
              announcementCampaignId: campaignId,
              announcementRecipientCount: dispatchSummary.acceptedCount
            },
            { merge: true }
          )
        } catch {
          // Offline tolerance
        }
      }

      await recordEmailAuditLog({
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        domain: 'admin_campaign',
        action: dispatchSummary.acceptedCount > 0 ? 'SEND_SUCCESS' : 'SEND_FAILURE',
        targetId: campaignId,
        details: {
          projectId: projectId || 'unknown',
          projectTitle: baseVariables.project_title,
          templateId,
          validCount: recipientSummary.validCount,
          acceptedCount: dispatchSummary.acceptedCount,
          failedCount: dispatchSummary.failedCount
        }
      })

      return NextResponse.json({
        success: true,
        campaign: campaignRecord,
        dispatchSummary,
        announcedAt: now
      })
    }

    return NextResponse.json(
      { success: false, error: `Unsupported action: ${action}` },
      { status: 400 }
    )
  } catch (error: any) {
    if (error instanceof Response) {
      return error
    }
    const status = error.message?.includes('Forbidden')
      ? 403
      : error.message?.includes('Authentication') || error.message?.includes('Unauthorized')
        ? 401
        : 500
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { adminDb } from '@/lib/firebase/firebase-admin'
import {
  EmailCampaign,
  CampaignRecipientOutcome,
  ResolvedRecipient
} from '@/types/email-system'
import { renderEmailForRecipient } from '@/lib/email/template-engine'
import {
  sendSingleEmailWithRetry,
  processEmailBatchQueue,
  OutboundEmailPayload,
  computeContentHash,
  recordEmailAuditLog
} from '@/lib/email/campaign-queue'
import { isValidEmailAddress, normalizeEmail } from '@/lib/email/recipient-resolver'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
  } catch (authError: any) {
    if (authError instanceof Response) return authError
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const snap = await adminDb
      .collection('email_campaigns')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()

    const campaigns: EmailCampaign[] = []
    snap.forEach(doc => {
      campaigns.push({
        id: doc.id,
        ...(doc.data() as Omit<EmailCampaign, 'id'>)
      })
    })

    return NextResponse.json({
      success: true,
      campaigns
    })
  } catch (error: any) {
    console.error('[Admin Campaigns GET Error]:', error.message)
    return NextResponse.json({
      success: true,
      campaigns: []
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

    // 1. Send a test email to an authorized test address before launching a campaign
    if (action === 'send_test') {
      const {
        testRecipientEmail,
        subjectTemplate,
        htmlTemplate,
        textTemplate,
        globalVariables = {}
      } = body

      const normTestEmail = normalizeEmail(testRecipientEmail || adminUser.email)
      if (!isValidEmailAddress(normTestEmail)) {
        return NextResponse.json(
          { error: 'Valid test recipient email address is required' },
          { status: 400 }
        )
      }

      const rendered = renderEmailForRecipient({
        subjectTemplate: `[TEST] ${subjectTemplate || 'Test Campaign'}`,
        htmlTemplate: htmlTemplate || '<p>{{message}}</p>',
        textTemplate: textTemplate || '',
        globalVariables,
        recipientVariables: {
          first_name: adminUser.name?.split(' ')[0] || 'Admin',
          name: adminUser.name || 'Admin',
          email: normTestEmail
        }
      })

      const result = await sendSingleEmailWithRetry({
        idempotencyKey: `test_${Date.now()}_${normTestEmail}`,
        to: normTestEmail,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text
      })

      await recordEmailAuditLog({
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        domain: 'admin_campaign',
        action: 'TEST_SEND',
        targetId: 'test_email',
        details: {
          testRecipient: normTestEmail,
          status: result.status,
          error: result.error
        }
      })

      if (result.status !== 'accepted') {
        return NextResponse.json(
          {
            success: false,
            error: result.error || 'Failed to send test email via SMTP',
            result
          },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: `Test email accepted by provider for ${normTestEmail}`,
        result
      })
    }

    // 2. Save or update a campaign draft (never sends automatically)
    if (action === 'save_draft') {
      const {
        id,
        name,
        category = 'general_announcement',
        templateId,
        subject,
        htmlBody,
        textBody = '',
        globalVariables = {},
        recipientSummary,
        validRecipients = []
      } = body

      if (!name || !subject || !htmlBody) {
        return NextResponse.json(
          { error: 'Campaign name, subject, and HTML body are required' },
          { status: 400 }
        )
      }

      const now = new Date().toISOString()
      const outcomes: CampaignRecipientOutcome[] = (validRecipients as ResolvedRecipient[]).map(
        r => ({
          email: r.email,
          name: r.name,
          userId: r.userId,
          status: 'pending',
          attempts: 0
        })
      )

      const campaignDoc: Omit<EmailCampaign, 'id'> = {
        name: String(name).trim(),
        category,
        templateId,
        subject: String(subject).trim(),
        htmlBody: String(htmlBody),
        textBody: String(textBody),
        globalVariables,
        status: 'draft',
        recipientSummary: recipientSummary || {
          totalSelected: outcomes.length,
          validCount: outcomes.length,
          invalidCount: 0,
          duplicateCount: 0,
          unsubscribedCount: 0
        },
        outcomes,
        stats: {
          total: outcomes.length,
          accepted: 0,
          failed: 0,
          pending: outcomes.length,
          retried: 0
        },
        createdBy: adminUser.id,
        creatorEmail: adminUser.email,
        createdAt: now,
        updatedAt: now
      }

      if (id) {
        await adminDb.collection('email_campaigns').doc(id).set(campaignDoc, { merge: true })
        await recordEmailAuditLog({
          actorId: adminUser.id,
          actorEmail: adminUser.email,
          domain: 'admin_campaign',
          action: 'UPDATE',
          targetId: id,
          details: { name: campaignDoc.name, recipientCount: outcomes.length }
        })
        return NextResponse.json({
          success: true,
          campaign: { id, ...campaignDoc }
        })
      } else {
        const ref = await adminDb.collection('email_campaigns').add(campaignDoc)
        await recordEmailAuditLog({
          actorId: adminUser.id,
          actorEmail: adminUser.email,
          domain: 'admin_campaign',
          action: 'CREATE',
          targetId: ref.id,
          details: { name: campaignDoc.name, recipientCount: outcomes.length }
        })
        return NextResponse.json({
          success: true,
          campaign: { id: ref.id, ...campaignDoc }
        })
      }
    }

    // 3. Explicitly confirm and send an approved campaign
    if (action === 'approve_and_send') {
      const {
        campaignId,
        explicitApprovalConfirmed,
        name,
        category = 'general_announcement',
        templateId,
        subject,
        htmlBody,
        textBody = '',
        globalVariables = {},
        recipientSummary,
        validRecipients = []
      } = body

      if (explicitApprovalConfirmed !== true) {
        return NextResponse.json(
          { error: 'Explicit administrator approval confirmation is required before sending.' },
          { status: 400 }
        )
      }

      const recipientsList: ResolvedRecipient[] = Array.isArray(validRecipients)
        ? validRecipients.filter(r => r && r.valid && isValidEmailAddress(r.email))
        : []

      if (recipientsList.length === 0) {
        return NextResponse.json(
          { error: 'Cannot send campaign: no valid recipients selected.' },
          { status: 400 }
        )
      }

      if (!subject || !htmlBody) {
        return NextResponse.json(
          { error: 'Subject and HTML body are required.' },
          { status: 400 }
        )
      }

      const now = new Date().toISOString()
      let targetCampaignId = campaignId

      // Create or update the campaign record as 'sending'
      const initialOutcomes: CampaignRecipientOutcome[] = recipientsList.map(r => ({
        email: r.email,
        name: r.name,
        userId: r.userId,
        status: 'pending',
        attempts: 0
      }))

      const baseCampaign: Omit<EmailCampaign, 'id'> = {
        name: String(name || subject).trim(),
        category,
        templateId,
        subject: String(subject).trim(),
        htmlBody: String(htmlBody),
        textBody: String(textBody),
        globalVariables,
        status: 'sending',
        recipientSummary: recipientSummary || {
          totalSelected: recipientsList.length,
          validCount: recipientsList.length,
          invalidCount: 0,
          duplicateCount: 0,
          unsubscribedCount: 0
        },
        outcomes: initialOutcomes,
        stats: {
          total: recipientsList.length,
          accepted: 0,
          failed: 0,
          pending: recipientsList.length,
          retried: 0
        },
        createdBy: adminUser.id,
        creatorEmail: adminUser.email,
        approvedBy: adminUser.email,
        approvedAt: now,
        sentAt: now,
        createdAt: now,
        updatedAt: now
      }

      if (targetCampaignId) {
        await adminDb.collection('email_campaigns').doc(targetCampaignId).set(baseCampaign, { merge: true })
      } else {
        const ref = await adminDb.collection('email_campaigns').add(baseCampaign)
        targetCampaignId = ref.id
      }

      await recordEmailAuditLog({
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        domain: 'admin_campaign',
        action: 'APPROVE',
        targetId: targetCampaignId,
        details: {
          campaignName: baseCampaign.name,
          recipientCount: recipientsList.length
        }
      })

      // Build isolated payloads per recipient (never exposing one recipient's info to another)
      const payloads: OutboundEmailPayload[] = recipientsList.map(recipient => {
        const rendered = renderEmailForRecipient({
          subjectTemplate: subject,
          htmlTemplate: htmlBody,
          textTemplate: textBody,
          globalVariables,
          recipientVariables: {
            first_name: recipient.firstName || recipient.name?.split(' ')[0] || 'there',
            name: recipient.name || recipient.email.split('@')[0],
            email: recipient.email,
            ...(recipient.customVariables || {})
          }
        })

        const idempotencyKey = computeContentHash([
          targetCampaignId,
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

      // Process through controlled batch queue with retries
      const batchResults = await processEmailBatchQueue(payloads, {
        concurrency: 3,
        batchDelayMs: 250,
        maxRetries: 2
      })

      const finalOutcomes: CampaignRecipientOutcome[] = batchResults.map((res, idx) => ({
        email: res.recipient,
        name: recipientsList[idx]?.name,
        userId: recipientsList[idx]?.userId,
        status: res.status,
        messageId: res.messageId,
        smtpResponse: res.smtpResponse,
        attempts: res.attempts,
        lastAttemptAt: res.timestamp,
        error: res.error
      }))

      const acceptedCount = finalOutcomes.filter(o => o.status === 'accepted').length
      const failedCount = finalOutcomes.filter(
        o => o.status === 'failed' || o.status === 'bounced'
      ).length
      const retriedCount = finalOutcomes.filter(o => o.attempts > 1).length

      const finalStatus =
        acceptedCount === finalOutcomes.length
          ? 'completed'
          : acceptedCount > 0
            ? 'partial_failure'
            : 'failed'

      const completedAt = new Date().toISOString()

      const updatedFields = {
        status: finalStatus,
        outcomes: finalOutcomes,
        stats: {
          total: finalOutcomes.length,
          accepted: acceptedCount,
          failed: failedCount,
          pending: 0,
          retried: retriedCount
        },
        completedAt,
        updatedAt: completedAt
      }

      await adminDb
        .collection('email_campaigns')
        .doc(targetCampaignId)
        .set(updatedFields, { merge: true })

      await recordEmailAuditLog({
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        domain: 'admin_campaign',
        action: finalStatus === 'failed' ? 'SEND_FAILURE' : 'SEND_SUCCESS',
        targetId: targetCampaignId,
        details: {
          status: finalStatus,
          accepted: acceptedCount,
          failed: failedCount,
          retried: retriedCount
        }
      })

      return NextResponse.json({
        success: acceptedCount > 0,
        campaign: {
          id: targetCampaignId,
          ...baseCampaign,
          ...updatedFields
        }
      })
    }

    return NextResponse.json({ error: 'Unsupported campaign action' }, { status: 400 })
  } catch (error: any) {
    console.error('[Admin Campaigns POST Error]:', error.message)
    return NextResponse.json(
      { error: error.message || 'Campaign operation failed' },
      { status: 500 }
    )
  }
}

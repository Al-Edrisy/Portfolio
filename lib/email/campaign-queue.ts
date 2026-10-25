import crypto from 'crypto'
import { getTransporter } from './transporter'
import { sanitizeHeader } from './validator'
import { DeliveryStatus, EmailAuditLog } from '@/types/email-system'

export interface EmailAttachmentPayload {
  filename: string
  content: Buffer | string
  contentType?: string
  encoding?: 'base64' | 'utf-8'
}

export interface OutboundEmailPayload {
  idempotencyKey: string
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  fromName?: string
  attachments?: EmailAttachmentPayload[]
}

export interface OutboundEmailResult {
  idempotencyKey: string
  recipient: string
  status: DeliveryStatus
  messageId?: string
  smtpResponse?: string
  attempts: number
  error?: string
  timestamp: string
}

// Track dispatched idempotency keys in memory (and checked against Firestore records)
const dispatchedIdempotencyKeys = new Set<string>()

/**
 * Computes a deterministic SHA-256 hash for approval integrity & idempotency checks.
 */
export function computeContentHash(parts: (string | string[] | undefined)[]): string {
  const normalized = parts
    .map(part => {
      if (Array.isArray(part)) return [...part].sort().join('|')
      return String(part || '').trim()
    })
    .join('::')
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex')
}

/**
 * Computes the approval integrity hash for a JobApplicationRecord.
 * Any modification to recipient, subject, body, cover letter, CV, or attachments changes this hash.
 */
export function computeApplicationApprovalHash(app: {
  recipientEmail: string
  emailSubject: string
  emailBody: string
  coverLetter: string
  selectedCvDocumentId: string
  additionalAttachmentIds?: string[]
}): string {
  return computeContentHash([
    sanitizeHeader(app.recipientEmail || '').toLowerCase().trim(),
    app.emailSubject,
    app.emailBody,
    app.coverLetter,
    app.selectedCvDocumentId,
    app.additionalAttachmentIds || []
  ])
}

/**
 * Determines whether an SMTP error is transient (retryable) vs permanent (e.g., 550 User unknown, invalid syntax).
 */
export function isTransientSmtpError(error: any): boolean {
  if (!error) return false
  const code = error.responseCode || error.code
  // 4xx SMTP codes are transient (421, 450, 451, 452)
  if (typeof code === 'number' && code >= 400 && code < 500) {
    return true
  }
  // 5xx SMTP codes are permanent failures (bounces/rejections)
  if (typeof code === 'number' && code >= 500) {
    return false
  }
  const msg = String(error.message || '').toLowerCase()
  if (
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('rate limit') ||
    msg.includes('try again') ||
    msg.includes('421') ||
    msg.includes('temporary')
  ) {
    return true
  }
  return false
}

/**
 * Sends a single email with idempotency protection and configurable retry logic for transient errors.
 * Never logs full message body, CV content, or credentials.
 */
export async function sendSingleEmailWithRetry(
  payload: OutboundEmailPayload,
  options: {
    maxRetries?: number
    retryDelayMs?: number
    customTransporter?: any
  } = {}
): Promise<OutboundEmailResult> {
  const { maxRetries = 2, retryDelayMs = 400, customTransporter } = options
  const timestamp = new Date().toISOString()

  if (dispatchedIdempotencyKeys.has(payload.idempotencyKey)) {
    return {
      idempotencyKey: payload.idempotencyKey,
      recipient: payload.to,
      status: 'skipped',
      attempts: 0,
      error: 'Duplicate send prevented by idempotency key',
      timestamp
    }
  }

  const fromName = sanitizeHeader(
    payload.fromName || process.env.CONTACT_NAME || 'Salih Ben Otman'
  )
  const fromEmail = sanitizeHeader(
    process.env.EMAIL_FROM || process.env.SMTP_USER || 'salehfree33@gmail.com'
  )
  const cleanRecipient = sanitizeHeader(payload.to)
  const cleanSubject = sanitizeHeader(payload.subject)

  let attempts = 0
  let lastError: any = null

  while (attempts <= maxRetries) {
    attempts++
    try {
      const transporter = customTransporter || (await getTransporter())
      const mailOptions: any = {
        from: `"${fromName}" <${fromEmail}>`,
        to: cleanRecipient,
        subject: cleanSubject,
        html: payload.html,
        text: payload.text,
        headers: {
          'X-Entity-Ref-ID': sanitizeHeader(payload.idempotencyKey),
          'List-Unsubscribe': `<mailto:${fromEmail}?subject=unsubscribe>`
        }
      }

      if (payload.replyTo) {
        mailOptions.replyTo = sanitizeHeader(payload.replyTo)
      }

      if (payload.attachments && payload.attachments.length > 0) {
        mailOptions.attachments = payload.attachments.map(att => ({
          filename: sanitizeHeader(att.filename),
          content: att.content,
          contentType: att.contentType,
          encoding: att.encoding
        }))
      }

      const info = await transporter.sendMail(mailOptions)

      // Mark idempotency key as sent
      dispatchedIdempotencyKeys.add(payload.idempotencyKey)

      // Distinguish provider acceptance vs bounced in immediate response
      const rejectedList = Array.isArray(info?.rejected) ? info.rejected : []
      if (rejectedList.length > 0) {
        return {
          idempotencyKey: payload.idempotencyKey,
          recipient: cleanRecipient,
          status: 'bounced',
          messageId: info?.messageId,
          smtpResponse: info?.response,
          attempts,
          error: `Rejected by SMTP server: ${rejectedList.join(', ')}`,
          timestamp: new Date().toISOString()
        }
      }

      return {
        idempotencyKey: payload.idempotencyKey,
        recipient: cleanRecipient,
        status: 'accepted',
        messageId: info?.messageId,
        smtpResponse: info?.response,
        attempts,
        timestamp: new Date().toISOString()
      }
    } catch (err: any) {
      lastError = err
      const transient = isTransientSmtpError(err)
      if (!transient || attempts > maxRetries) {
        break
      }
      await new Promise(resolve => setTimeout(resolve, retryDelayMs * attempts))
    }
  }

  const errorCode = lastError?.responseCode
  const isBounce = typeof errorCode === 'number' && errorCode >= 500

  return {
    idempotencyKey: payload.idempotencyKey,
    recipient: cleanRecipient,
    status: isBounce ? 'bounced' : 'failed',
    attempts,
    error: lastError?.message || 'Unknown SMTP transport error',
    timestamp: new Date().toISOString()
  }
}

/**
 * Processes a batch of emails with controlled concurrency and inter-batch rate limiting.
 */
export async function processEmailBatchQueue(
  payloads: OutboundEmailPayload[],
  options: {
    concurrency?: number
    batchDelayMs?: number
    maxRetries?: number
    customTransporter?: any
  } = {}
): Promise<OutboundEmailResult[]> {
  const {
    concurrency = 3,
    batchDelayMs = 250,
    maxRetries = 2,
    customTransporter
  } = options

  const results: OutboundEmailResult[] = []

  for (let i = 0; i < payloads.length; i += concurrency) {
    const chunk = payloads.slice(i, i + concurrency)
    const chunkResults = await Promise.all(
      chunk.map(payload =>
        sendSingleEmailWithRetry(payload, { maxRetries, customTransporter })
      )
    )
    results.push(...chunkResults)

    if (i + concurrency < payloads.length && batchDelayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, batchDelayMs))
    }
  }

  return results
}

/**
 * Clears in-memory idempotency cache (used in automated unit tests).
 */
export function clearIdempotencyCache(): void {
  dispatchedIdempotencyKeys.clear()
}

/**
 * Writes an immutable audit log entry to Firestore without sensitive payloads.
 */
export async function recordEmailAuditLog(
  entry: Omit<EmailAuditLog, 'id' | 'timestamp'>
): Promise<void> {
  const timestamp = new Date().toISOString()
  try {
    const { adminDb } = await import('@/lib/firebase/firebase-admin')
    await adminDb.collection('email_audit_logs').add({
      ...entry,
      timestamp
    })
  } catch (err: any) {
    // Log sanitized warning if Firestore is offline
    console.warn(
      JSON.stringify({
        timestamp,
        domain: entry.domain,
        action: entry.action,
        targetId: entry.targetId,
        auditWarning: 'Failed to persist audit log to Firestore'
      })
    )
  }
}

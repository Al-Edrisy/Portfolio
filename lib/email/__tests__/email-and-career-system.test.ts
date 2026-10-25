import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/firebase/firebase-admin', () => ({
  adminDb: {
    collection: vi.fn()
  },
  adminAuth: {
    verifyIdToken: vi.fn()
  }
}))

import {
  resolveRecipients,
  splitRecipientInput,
  detectEmailsInText,
  normalizeEmail,
  isValidEmailAddress
} from '../recipient-resolver'
import {
  extractTemplateVariables,
  validateTemplateVariables,
  renderEmailForRecipient
} from '../template-engine'
import {
  sendSingleEmailWithRetry,
  processEmailBatchQueue,
  clearIdempotencyCache,
  computeContentHash,
  computeApplicationApprovalHash,
  isTransientSmtpError
} from '../campaign-queue'
import {
  getDefaultCareerProfile,
  getBuiltInDefaultCvDocument,
  resolveCareerDocumentAttachment
} from '../../career/career-storage'
import {
  parseJobOpportunitiesFromCsvOrText,
  computeDeterministicJobMatch,
  generateTailoredApplicationDraft
} from '../../career/job-intelligence'

describe('1. Recipient Parsing, Normalization, Deduplication & Validation', () => {
  it('parses manual recipients across commas, semicolons, and newlines', () => {
    const raw = 'alice@example.com, Bob Smith <BOB@Example.org>;\ncarol@company.io\r\ndave@test.net'
    const tokens = splitRecipientInput(raw)
    expect(tokens).toHaveLength(4)

    const summary = resolveRecipients({ manualInput: raw })
    expect(summary.validCount).toBe(4)
    expect(summary.validRecipients.map(r => r.email)).toEqual([
      'alice@example.com',
      'bob@example.org',
      'carol@company.io',
      'dave@test.net'
    ])
    expect(summary.validRecipients[1].name).toBe('Bob Smith')
    expect(summary.validRecipients[1].firstName).toBe('Bob')
  })

  it('identifies and excludes invalid, duplicate, and unsubscribed recipients', () => {
    const dbUsers = [
      { id: 'u1', email: 'User1@Domain.com', name: 'First User', role: 'user' },
      { id: 'u2', email: 'unsub@domain.com', name: 'Unsub User', unsubscribed: true },
      { id: 'u3', email: 'bad-email-format', name: 'Invalid DB User' }
    ]
    const manualInput = 'user1@domain.com, another@domain.com, not_an_email, another@domain.com'

    const summary = resolveRecipients({
      dbUsers,
      manualInput,
      respectUnsubscribe: true
    })

    expect(summary.validCount).toBe(2) // user1@domain.com and another@domain.com
    expect(summary.duplicateCount).toBe(2) // user1 duplicate in manual + another duplicate
    expect(summary.invalidCount).toBe(2) // bad-email-format + not_an_email
    expect(summary.unsubscribedCount).toBe(1) // unsub@domain.com
    expect(summary.excludedRecipients).toHaveLength(5)
  })

  it('detects embedded email addresses inside job descriptions', () => {
    const jd = 'Apply now by sending your CV to jobs@techcorp.io or hr.team@techcorp.io before Friday.'
    const detected = detectEmailsInText(jd)
    expect(detected).toEqual(['jobs@techcorp.io', 'hr.team@techcorp.io'])
  })
})

describe('2. Safe Template Engine & Per-Recipient Variable Isolation', () => {
  it('extracts template placeholders and validates missing variables', () => {
    const vars = extractTemplateVariables(
      'Subject: {{subject}}',
      '<p>Hi {{first_name}}, {{message}}</p>',
      'Footer {{sender_name}}'
    )
    expect(vars).toEqual(['subject', 'first_name', 'message', 'sender_name'])

    const check = validateTemplateVariables(['subject', 'first_name', 'message'], {
      subject: 'Hello',
      first_name: 'Salih',
      message: ''
    })
    expect(check.valid).toBe(false)
    expect(check.missingVariables).toEqual(['message'])
  })

  it('escapes HTML in user variables and prevents cross-recipient data leakage', () => {
    const tplSubject = 'Hi {{first_name}} — {{subject}}'
    const tplHtml = '<div>Hello {{first_name}}, secret token: {{secret_code}}</div>'

    const r1 = renderEmailForRecipient({
      subjectTemplate: tplSubject,
      htmlTemplate: tplHtml,
      globalVariables: { subject: 'Announcement' },
      recipientVariables: {
        first_name: '<script>alert("xss")</script>',
        secret_code: 'CODE_RECIPIENT_1'
      }
    })

    const r2 = renderEmailForRecipient({
      subjectTemplate: tplSubject,
      htmlTemplate: tplHtml,
      globalVariables: { subject: 'Announcement' },
      recipientVariables: {
        first_name: 'Sara'
        // secret_code intentionally omitted for recipient 2
      }
    })

    expect(r1.html).not.toContain('<script>')
    expect(r1.html).toContain('&lt;script&gt;')
    expect(r1.html).toContain('CODE_RECIPIENT_1')

    // Ensure recipient 2 never receives recipient 1's variable
    expect(r2.html).not.toContain('CODE_RECIPIENT_1')
    expect(r2.missingPlaceholders).toContain('secret_code')
  })
})

describe('3. Email Queue Idempotency, Concurrency & Transient Retries', () => {
  beforeEach(() => {
    clearIdempotencyCache()
  })

  it('retries transient 4xx SMTP failures and succeeds on subsequent attempt', async () => {
    let callCount = 0
    const mockTransporter = {
      sendMail: vi.fn(async () => {
        callCount++
        if (callCount === 1) {
          const err: any = new Error('421 Temporary service unavailable, try again later')
          err.responseCode = 421
          throw err
        }
        return { messageId: 'msg_123', response: '250 OK', rejected: [] }
      })
    }

    const res = await sendSingleEmailWithRetry(
      {
        idempotencyKey: 'idem_retry_test_1',
        to: 'recipient@example.com',
        subject: 'Retry Test',
        html: '<p>Test</p>',
        text: 'Test'
      },
      { maxRetries: 2, retryDelayMs: 5, customTransporter: mockTransporter }
    )

    expect(res.status).toBe('accepted')
    expect(res.attempts).toBe(2)
    expect(mockTransporter.sendMail).toHaveBeenCalledTimes(2)
  })

  it('does not retry permanent 550 bounce errors and marks status as bounced', async () => {
    const mockTransporter = {
      sendMail: vi.fn(async () => {
        const err: any = new Error('550 5.1.1 The email account that you tried to reach does not exist')
        err.responseCode = 550
        throw err
      })
    }

    const res = await sendSingleEmailWithRetry(
      {
        idempotencyKey: 'idem_bounce_1',
        to: 'nonexistent@example.com',
        subject: 'Bounce Test',
        html: '<p>Test</p>',
        text: 'Test'
      },
      { maxRetries: 2, retryDelayMs: 5, customTransporter: mockTransporter }
    )

    expect(res.status).toBe('bounced')
    expect(res.attempts).toBe(1) // No retry on permanent 5xx
  })

  it('enforces idempotency so duplicate queue submissions are skipped', async () => {
    const mockTransporter = {
      sendMail: vi.fn(async () => ({ messageId: 'msg_ok', response: '250 OK', rejected: [] }))
    }

    const payload = {
      idempotencyKey: 'unique_campaign_recipient_key',
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Hello</p>',
      text: 'Hello'
    }

    const first = await sendSingleEmailWithRetry(payload, { customTransporter: mockTransporter })
    const second = await sendSingleEmailWithRetry(payload, { customTransporter: mockTransporter })

    expect(first.status).toBe('accepted')
    expect(second.status).toBe('skipped')
    expect(mockTransporter.sendMail).toHaveBeenCalledTimes(1)
  })

  it('processes bulk campaign batches with partial failure tracking', async () => {
    const mockTransporter = {
      sendMail: vi.fn(async (opts: any) => {
        if (opts.to.includes('fail@')) {
          const err: any = new Error('550 Mailbox unavailable')
          err.responseCode = 550
          throw err
        }
        return { messageId: `id_${opts.to}`, response: '250 OK', rejected: [] }
      })
    }

    const payloads = [
      { idempotencyKey: 'k1', to: 'ok1@example.com', subject: 'S', html: 'H', text: 'T' },
      { idempotencyKey: 'k2', to: 'fail@example.com', subject: 'S', html: 'H', text: 'T' },
      { idempotencyKey: 'k3', to: 'ok2@example.com', subject: 'S', html: 'H', text: 'T' }
    ]

    const results = await processEmailBatchQueue(payloads, {
      concurrency: 2,
      batchDelayMs: 5,
      customTransporter: mockTransporter
    })

    expect(results).toHaveLength(3)
    expect(results.filter(r => r.status === 'accepted')).toHaveLength(2)
    expect(results.filter(r => r.status === 'bounced')).toHaveLength(1)
  })
})

describe('4. Career Profile Ownership, Document Security & Job Intelligence', () => {
  it('enforces strict administrator ownership when resolving CV attachments', async () => {
    const adminDoc = {
      id: 'cv_1',
      ownerId: 'admin_uid_123',
      name: 'Admin CV',
      originalFilename: 'Salih_CV.pdf',
      type: 'cv' as const,
      version: 'v1.0',
      intendedUse: 'General',
      mimeType: 'application/pdf',
      fileSize: 12,
      base64Content: Buffer.from('PDF_CONTENT').toString('base64'),
      extractedText: 'React Next.js TypeScript',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Authorized admin succeeds
    const resolved = await resolveCareerDocumentAttachment(adminDoc, 'admin_uid_123')
    expect(resolved?.filename).toBe('Salih_CV.pdf')
    expect(resolved?.content.toString()).toBe('PDF_CONTENT')

    // Another user ID is rejected
    await expect(
      resolveCareerDocumentAttachment(adminDoc, 'other_user_uid_999')
    ).rejects.toThrow('Forbidden')
  })

  it('parses CSV job opportunities and detects portal-only vs email jobs', () => {
    const csv = `companyName,positionTitle,applicationEmail,location,employmentType,applicationUrl,jobDescription,requiredSkills
Acme AI,Senior Full Stack Engineer,careers@acme.ai,Remote,full-time,https://acme.ai/jobs,"Build Next.js and Python AI agents",React|Next.js|TypeScript|Python|Kubernetes
PortalCorp,Frontend Engineer,,London,full-time,https://portalcorp.com/apply,"Apply on our portal",React|TypeScript`

    const jobs = parseJobOpportunitiesFromCsvOrText(csv, 'admin_uid_123')
    expect(jobs).toHaveLength(2)
    expect(jobs[0].companyName).toBe('Acme AI')
    expect(jobs[0].applicationEmail).toBe('careers@acme.ai')
    expect(jobs[0].isPortalOnly).toBe(false)

    expect(jobs[1].companyName).toBe('PortalCorp')
    expect(jobs[1].applicationEmail).toBe('')
    expect(jobs[1].isPortalOnly).toBe(true)
  })

  it('produces factual job match assessments and never invents missing skills in drafts', async () => {
    const profile = getDefaultCareerProfile('admin_uid_123', 'salehfree33@gmail.com')
    const cvDoc =
      getBuiltInDefaultCvDocument('admin_uid_123') || {
        id: 'cv_default',
        ownerId: 'admin_uid_123',
        name: 'Primary CV',
        originalFilename: 'cv.pdf',
        type: 'cv' as const,
        version: 'v1.0',
        intendedUse: 'General',
        mimeType: 'application/pdf',
        fileSize: 100,
        extractedText: profile.summary,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

    const job = {
      id: 'job_1',
      ownerId: 'admin_uid_123',
      companyName: 'CloudScale Systems',
      positionTitle: 'Senior Full Stack Engineer',
      jobDescription: 'We need React, Next.js, TypeScript, and RustlangKernelProgramming.',
      applicationEmail: 'hiring@cloudscale.io',
      applicationUrl: 'https://cloudscale.io/careers',
      isPortalOnly: false,
      location: 'Remote',
      requiredSkills: ['React 19', 'Next.js', 'TypeScript', 'RustlangKernelProgramming'],
      employmentType: 'full-time' as const,
      source: 'Manual',
      isVerifiedSource: true,
      status: 'to_review' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const match = computeDeterministicJobMatch(profile, [cvDoc], job)
    expect(match.matchedSkills).toContain('React 19')
    expect(match.matchedSkills).toContain('TypeScript')
    expect(match.missingOrUncertainRequirements).toContain('RustlangKernelProgramming')

    const draft = await generateTailoredApplicationDraft({
      profile,
      selectedCv: cvDoc,
      job,
      matchAssessment: match
    })

    expect(draft.emailSubject).toContain('Senior Full Stack Engineer')
    expect(draft.coverLetter).toContain('CloudScale Systems')
    // Must not claim the missing unverified skill in the cover letter or tailored CV skills
    expect(draft.tailoredCv.prioritizedSkills).not.toContain('RustlangKernelProgramming')
    expect(draft.missingInfoWarnings.some(w => w.includes('RustlangKernelProgramming'))).toBe(true)
  })

  it('invalidates approval hash if subject, body, recipient, or CV attachment changes after approval', () => {
    const baseApp = {
      recipientEmail: 'hiring@company.com',
      emailSubject: 'Application for Senior Engineer — Salih Ben Otman',
      emailBody: 'Original approved body',
      coverLetter: 'Original approved cover letter',
      selectedCvDocumentId: 'doc_cv_v1',
      additionalAttachmentIds: ['doc_cert_1']
    }

    const approvedHash = computeApplicationApprovalHash(baseApp)

    // Identical content produces identical hash
    expect(computeApplicationApprovalHash({ ...baseApp })).toBe(approvedHash)

    // Changing recipient email invalidates hash
    expect(
      computeApplicationApprovalHash({ ...baseApp, recipientEmail: 'other@company.com' })
    ).not.toBe(approvedHash)

    // Changing email body invalidates hash
    expect(
      computeApplicationApprovalHash({ ...baseApp, emailBody: 'Edited body after approval' })
    ).not.toBe(approvedHash)

    // Changing selected CV invalidates hash
    expect(
      computeApplicationApprovalHash({ ...baseApp, selectedCvDocumentId: 'doc_cv_v2' })
    ).not.toBe(approvedHash)
  })
})

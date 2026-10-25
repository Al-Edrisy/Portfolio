import { EmailTemplate } from '@/types/email-system'
import { escapeHtml } from './templates'
import { sanitizeHeader } from './validator'

const PLACEHOLDER_REGEX = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g

/**
 * Extracts all unique {{variable_name}} placeholders from subject, HTML, and text templates.
 */
export function extractTemplateVariables(...contents: (string | undefined)[]): string[] {
  const vars = new Set<string>()
  for (const content of contents) {
    if (!content) continue
    let match: RegExpExecArray | null
    const regex = new RegExp(PLACEHOLDER_REGEX.source, 'g')
    while ((match = regex.exec(content)) !== null) {
      if (match[1]) {
        vars.add(match[1].trim())
      }
    }
  }
  return Array.from(vars)
}

/**
 * Validates that all required variables are provided and non-empty.
 */
export function validateTemplateVariables(
  requiredVariables: string[],
  providedValues: Record<string, string | undefined>
): { valid: boolean; missingVariables: string[] } {
  const missingVariables: string[] = []
  for (const reqVar of requiredVariables) {
    const val = providedValues[reqVar]
    if (val === undefined || val === null || String(val).trim() === '') {
      missingVariables.push(reqVar)
    }
  }
  return {
    valid: missingVariables.length === 0,
    missingVariables
  }
}

/**
 * Safely interpolates {{variable}} placeholders without evaluating arbitrary code.
 * Values injected into HTML are automatically HTML-escaped unless explicitly marked as safe formatted paragraphs.
 */
export function renderSafeTemplateString(
  templateStr: string,
  variables: Record<string, string | undefined>,
  options: { escapeValues: boolean; sanitizeAsHeader?: boolean; fallbackForMissing?: string }
): string {
  if (!templateStr) return ''
  return templateStr.replace(PLACEHOLDER_REGEX, (_, varName: string) => {
    const key = varName.trim()
    const rawVal = variables[key]
    const resolved =
      rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== ''
        ? String(rawVal)
        : options.fallbackForMissing !== undefined
          ? options.fallbackForMissing
          : ''

    if (options.sanitizeAsHeader) {
      return sanitizeHeader(resolved)
    }
    if (options.escapeValues) {
      return escapeHtml(resolved)
    }
    return resolved
  })
}

/**
 * Renders a complete email (subject, html, text) for a single recipient in total isolation
 * so one recipient's variables never leak to another recipient.
 */
export function renderEmailForRecipient(params: {
  subjectTemplate: string
  htmlTemplate: string
  textTemplate?: string
  globalVariables?: Record<string, string>
  recipientVariables?: Record<string, string | undefined>
}): {
  subject: string
  html: string
  text: string
  missingPlaceholders: string[]
} {
  // Clone merged variables per-recipient to guarantee isolation
  const mergedVars: Record<string, string | undefined> = {
    sender_name: process.env.CONTACT_NAME || 'Salih Ben Otman',
    sender_email: process.env.CONTACT_EMAIL || 'salehfree33@gmail.com',
    portfolio_url: 'https://salihbenotman.dev',
    current_year: new Date().getFullYear().toString(),
    ...(params.globalVariables || {}),
    ...(params.recipientVariables || {})
  }

  const allPlaceholders = extractTemplateVariables(
    params.subjectTemplate,
    params.htmlTemplate,
    params.textTemplate
  )
  const { missingVariables } = validateTemplateVariables(allPlaceholders, mergedVars)

  const subject = renderSafeTemplateString(params.subjectTemplate, mergedVars, {
    escapeValues: false,
    sanitizeAsHeader: true
  })

  const html = renderSafeTemplateString(params.htmlTemplate, mergedVars, {
    escapeValues: true
  })

  // Generate plain text fallback if textTemplate is not explicitly provided
  const rawTextSource =
    params.textTemplate && params.textTemplate.trim()
      ? params.textTemplate
      : params.htmlTemplate
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<[^>]+>/g, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim()

  const text = renderSafeTemplateString(rawTextSource, mergedVars, {
    escapeValues: false
  })

  return {
    subject,
    html,
    text,
    missingPlaceholders: missingVariables
  }
}

/**
 * Built-in default templates for Administrative Email Management and Job Applications.
 */
export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl_general_announcement',
    name: 'General Announcement',
    description: 'Clean announcement email for portfolio community and registered users.',
    category: 'general_announcement',
    subject: '{{subject}}',
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#0f172a;">
  <div style="max-width:600px;margin:24px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <div style="background:#0f172a;color:#ffffff;padding:28px 32px;">
      <h1 style="margin:0;font-size:22px;font-weight:600;">{{subject}}</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hello {{first_name}},</p>
      <div style="margin:0 0 24px;font-size:15px;line-height:1.7;white-space:pre-wrap;color:#334155;">{{message}}</div>
      <p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#475569;">
        Best regards,<br/>
        <strong style="color:#0f172a;">{{sender_name}}</strong>
      </p>
    </div>
    <div style="background:#f1f5f9;padding:16px 32px;text-align:center;font-size:12px;color:#64748b;">
      © {{current_year}} {{sender_name}} • <a href="{{portfolio_url}}" style="color:#0f172a;text-decoration:underline;">{{portfolio_url}}</a>
    </div>
  </div>
</body>
</html>`,
    textBody: `Hello {{first_name}},\n\n{{message}}\n\nBest regards,\n{{sender_name}}\n{{portfolio_url}}`,
    variables: ['subject', 'first_name', 'message', 'sender_name', 'portfolio_url', 'current_year'],
    requiredVariables: ['subject', 'first_name', 'message'],
    sampleData: {
      subject: 'New Case Study & AI Architecture Update',
      first_name: 'Alex',
      message: 'I have just published a new engineering deep-dive on building resilient multi-agent systems in Next.js 15.',
      sender_name: 'Salih Ben Otman',
      portfolio_url: 'https://salihbenotman.dev',
      current_year: new Date().getFullYear().toString()
    },
    status: 'active',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl_welcome_onboarding',
    name: 'Welcome & Onboarding',
    description: 'Welcome message for newly registered portfolio members.',
    category: 'onboarding',
    subject: 'Welcome to {{sender_name}}\'s Engineering Portal, {{first_name}}!',
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#0f172a;">
  <div style="max-width:600px;margin:24px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <div style="background:#0f172a;color:#ffffff;padding:28px 32px;">
      <h1 style="margin:0;font-size:22px;font-weight:600;">Welcome aboard, {{first_name}}!</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hello {{first_name}},</p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#334155;">Thank you for joining my interactive portfolio community. You can now comment on technical case studies, react to projects, and follow live engineering updates.</p>
      <div style="margin:0 0 24px;font-size:15px;line-height:1.7;white-space:pre-wrap;color:#334155;">{{message}}</div>
      <p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#475569;">
        Best regards,<br/>
        <strong style="color:#0f172a;">{{sender_name}}</strong>
      </p>
    </div>
  </div>
</body>
</html>`,
    textBody: `Hello {{first_name}},\n\nThank you for joining my interactive portfolio community.\n\n{{message}}\n\nBest regards,\n{{sender_name}}`,
    variables: ['first_name', 'message', 'sender_name'],
    requiredVariables: ['first_name', 'message'],
    sampleData: {
      first_name: 'Sarah',
      message: 'Feel free to explore the projects section or reach out directly if you would like to collaborate.',
      sender_name: 'Salih Ben Otman'
    },
    status: 'active',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl_service_update',
    name: 'Service & Availability Update',
    description: 'Notify clients and contacts about availability, new services, or system updates.',
    category: 'service_update',
    subject: 'Update from {{sender_name}}: {{subject}}',
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;color:#0f172a;">
  <div style="max-width:600px;margin:24px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
    <div style="background:#1e293b;color:#ffffff;padding:24px 32px;">
      <span style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;">Service Update</span>
      <h1 style="margin:6px 0 0;font-size:20px;font-weight:600;">{{subject}}</h1>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 16px;font-size:16px;">Hello {{first_name}},</p>
      <div style="margin:0 0 24px;font-size:15px;line-height:1.7;white-space:pre-wrap;color:#334155;">{{message}}</div>
      <p style="margin:24px 0 0;font-size:15px;color:#475569;">
        Best regards,<br/>
        <strong style="color:#0f172a;">{{sender_name}}</strong>
      </p>
    </div>
  </div>
</body>
</html>`,
    textBody: `Hello {{first_name}},\n\n{{message}}\n\nBest regards,\n{{sender_name}}`,
    variables: ['subject', 'first_name', 'message', 'sender_name'],
    requiredVariables: ['subject', 'first_name', 'message'],
    sampleData: {
      subject: 'Q4 Engineering Consulting Availability',
      first_name: 'Michael',
      message: 'I am opening two slots for full-stack Next.js and AI systems architecture consulting next month.',
      sender_name: 'Salih Ben Otman'
    },
    status: 'active',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl_job_application_direct',
    name: 'Job Application & Cover Letter',
    description: 'Professional ATS-friendly job application email template for personal career outreach.',
    category: 'job_application',
    subject: 'Application for {{position_title}} — {{candidate_name}}',
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#ffffff;color:#111827;">
  <div style="max-width:640px;margin:0 auto;padding:24px;">
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">Dear {{hiring_team}} at {{company_name}},</p>
    <div style="margin:0 0 20px;font-size:15px;line-height:1.7;white-space:pre-wrap;color:#1f2937;">{{email_body}}</div>
    <div style="margin:20px 0;padding:16px 20px;background:#f9fafb;border-left:3px solid #111827;border-radius:4px;">
      <div style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#4b5563;margin-bottom:8px;">Portfolio & Relevant Links</div>
      <div style="font-size:14px;line-height:1.6;white-space:pre-wrap;color:#111827;">{{portfolio_links}}</div>
    </div>
    <p style="margin:20px 0 0;font-size:15px;line-height:1.6;">
      Sincerely,<br/>
      <strong>{{candidate_name}}</strong><br/>
      <span style="color:#4b5563;font-size:14px;">{{candidate_email}} | {{candidate_phone}}</span><br/>
      <a href="{{portfolio_url}}" style="color:#111827;font-size:14px;">{{portfolio_url}}</a>
    </p>
  </div>
</body>
</html>`,
    textBody: `Dear {{hiring_team}} at {{company_name}},\n\n{{email_body}}\n\nPortfolio & Links:\n{{portfolio_links}}\n\nSincerely,\n{{candidate_name}}\n{{candidate_email}} | {{candidate_phone}}\n{{portfolio_url}}`,
    variables: [
      'position_title',
      'candidate_name',
      'hiring_team',
      'company_name',
      'email_body',
      'portfolio_links',
      'candidate_email',
      'candidate_phone',
      'portfolio_url'
    ],
    requiredVariables: ['position_title', 'candidate_name', 'company_name', 'email_body'],
    sampleData: {
      position_title: 'Senior Full Stack Engineer',
      candidate_name: 'Salih Ben Otman',
      hiring_team: 'Hiring Team',
      company_name: 'Acme Technologies',
      email_body: 'I am writing to express my strong interest in the Senior Full Stack Engineer position at Acme Technologies. With over 5 years of experience architecting scalable React, Next.js, and AI-driven platforms, I have attached my CV and cover letter for your review.',
      portfolio_links: 'Portfolio: https://salihbenotman.dev\nGitHub: https://github.com/Al-Edrisy',
      candidate_email: 'salehfree33@gmail.com',
      candidate_phone: '+218 92 152 70 18',
      portfolio_url: 'https://salihbenotman.dev'
    },
    status: 'active',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

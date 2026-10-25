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
 * Checks if a URL or hostname points to a local or private address (e.g. localhost, 127.0.0.1, 10.*, etc.)
 */
export function isLocalOrPrivateHost(urlOrHost: string): boolean {
  if (!urlOrHost) return true
  try {
    const raw = urlOrHost.trim()
    const parsed =
      raw.startsWith('http://') || raw.startsWith('https://')
        ? new URL(raw)
        : new URL(`http://${raw}`)
    const hostname = parsed.hostname.toLowerCase()
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.local') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
    )
  } catch {
    return (
      urlOrHost.includes('localhost') ||
      urlOrHost.includes('127.0.0.1') ||
      urlOrHost.includes('0.0.0.0')
    )
  }
}

/**
 * Resolves the public base URL dynamically for outbound emails.
 * Discards localhost, private IPs, and internal Docker networks,
 * ensuring outbound emails always link to a publicly accessible domain.
 */
export function resolvePublicBaseUrl(explicitUrl?: string): string {
  // 1. Explicit argument from request origin or window.location (if non-local)
  const candidate = (explicitUrl || '').trim().replace(/\/$/, '')
  if (candidate && !isLocalOrPrivateHost(candidate)) {
    return candidate
  }

  // 2. Railway public domain
  const envRailway = (process.env.RAILWAY_PUBLIC_DOMAIN || '').trim()
  if (envRailway && !isLocalOrPrivateHost(envRailway)) {
    return envRailway.startsWith('http')
      ? envRailway.replace(/\/$/, '')
      : `https://${envRailway.replace(/\/$/, '')}`
  }

  // 3. Explicit production SITE_URL environment variable
  const envSite = (process.env.SITE_URL || '').trim().replace(/\/$/, '')
  if (envSite && !isLocalOrPrivateHost(envSite)) {
    return envSite
  }

  // 4. NEXT_PUBLIC_SITE_URL environment variable (if non-local)
  const envPublic = (process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '')
  if (envPublic && !isLocalOrPrivateHost(envPublic)) {
    return envPublic
  }

  // 5. Default production fallback
  return 'https://salihbenotman.dev'
}

/**
 * Ensures any outbound URL does not contain localhost or private container IPs.
 * If a local host is detected, its pathname & search are preserved on top of the fallback public origin.
 */
export function sanitizeOutboundUrl(
  url: string | undefined,
  fallbackOrigin: string = resolvePublicBaseUrl()
): string {
  if (!url) return fallbackOrigin
  const trimmed = url.trim()
  if (!trimmed) return fallbackOrigin

  if (isLocalOrPrivateHost(trimmed)) {
    try {
      const parsed = trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? new URL(trimmed)
        : new URL(`http://${trimmed}`)
      const base = fallbackOrigin.replace(/\/$/, '')
      const pathAndSearch = `${parsed.pathname}${parsed.search}${parsed.hash}`
      return pathAndSearch.startsWith('/') ? `${base}${pathAndSearch}` : `${base}/${pathAndSearch}`
    } catch {
      return fallbackOrigin
    }
  }
  return trimmed
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
  const publicBase = resolvePublicBaseUrl(params.globalVariables?.portfolio_url)

  // Clone merged variables per-recipient to guarantee isolation
  const mergedVars: Record<string, string | undefined> = {
    sender_name: process.env.CONTACT_NAME || 'Salih Ben Otman',
    sender_email: process.env.CONTACT_EMAIL || 'salehfree33@gmail.com',
    portfolio_url: publicBase,
    current_year: new Date().getFullYear().toString(),
    ...(params.globalVariables || {}),
    ...(params.recipientVariables || {})
  }

  // Sanitize any URLs to prevent localhost from ever appearing in rendered emails
  if (mergedVars.project_url) {
    mergedVars.project_url = sanitizeOutboundUrl(mergedVars.project_url, publicBase)
  }
  if (mergedVars.project_demo_url) {
    mergedVars.project_demo_url = sanitizeOutboundUrl(mergedVars.project_demo_url, publicBase)
  }
  if (mergedVars.portfolio_url) {
    mergedVars.portfolio_url = sanitizeOutboundUrl(mergedVars.portfolio_url, publicBase)
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

export const PROJECT_ANNOUNCEMENT_TEMPLATE_IDS = [
  'tpl_project_release_note',
  'tpl_project_editorial_digest',
  'tpl_project_personal_note'
] as const

/**
 * Maps a Project record into clean, structured template variables without undefined values or AI slop.
 */
export function buildProjectTemplateVariables(
  project: {
    id?: string
    title?: string
    slug?: string
    description?: string
    longDescription?: string
    challenges?: string
    solutions?: string
    results?: string
    features?: string[]
    tech?: string[]
    categories?: string[]
    category?: string
    link?: string
    github?: string
    authorName?: string
  },
  options?: { baseUrl?: string; preferExternalLink?: boolean }
): Record<string, string> {
  const baseUrl = resolvePublicBaseUrl(options?.baseUrl)
  const projectSlugOrId = (project.id || project.slug || '').trim()
  const portfolioCaseStudyUrl = projectSlugOrId
    ? `${baseUrl}/projects/${projectSlugOrId}`
    : `${baseUrl}/projects`
  const externalLink = (project.link || '').trim()
  const projectDemoUrl = externalLink ? sanitizeOutboundUrl(externalLink, portfolioCaseStudyUrl) : portfolioCaseStudyUrl
  const projectUrl = options?.preferExternalLink && externalLink ? projectDemoUrl : portfolioCaseStudyUrl

  const title = (project.title || 'New Engineering Case Study').trim()
  const category =
    (Array.isArray(project.categories) && project.categories.length > 0
      ? project.categories.join(' · ')
      : project.category) || 'Software Engineering'

  const techList =
    Array.isArray(project.tech) && project.tech.length > 0
      ? project.tech.join(', ')
      : 'TypeScript, Next.js, Cloud Architecture'

  const cleanSummary = (project.description || '').trim() || `Technical breakdown and architecture overview of ${title}.`

  // Extract a concise first paragraph from longDescription if challenges/solutions aren't explicitly separated
  const firstLongParagraph = (project.longDescription || '')
    .replace(/[#*`_~>-]/g, '')
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .find(p => p.length > 30)

  const challengeText =
    (project.challenges || '').replace(/[#*`_~]/g, '').trim() ||
    firstLongParagraph ||
    `Designing ${title} with predictable latency, maintainable state boundaries, and production resilience.`

  const solutionText =
    (project.solutions || '').replace(/[#*`_~]/g, '').trim() ||
    (Array.isArray(project.features) && project.features.length > 0
      ? `Implemented ${project.features.slice(0, 4).join('; ')} using ${techList}.`
      : `Built with ${techList}, focusing on clean domain separation and deterministic execution.`)

  const resultsText =
    (project.results || '').replace(/[#*`_~]/g, '').trim() ||
    (Array.isArray(project.features) && project.features.length > 0
      ? project.features.slice(0, 3).join(' · ')
      : `Shipped to production with full documentation and source breakdown.`)

  return {
    project_title: title,
    project_category: category,
    project_description: cleanSummary,
    project_tech: techList,
    project_challenge: challengeText,
    project_solution: solutionText,
    project_results: resultsText,
    project_url: projectUrl,
    project_case_study_url: portfolioCaseStudyUrl,
    project_demo_url: projectDemoUrl,
    project_github_url: (project.github || '').trim() || 'https://github.com/Al-Edrisy',
    sender_name: project.authorName || process.env.CONTACT_NAME || 'Salih Ben Otman',
    portfolio_url: baseUrl,
    current_year: new Date().getFullYear().toString()
  }
}

const SPAM_TRIGGER_WORDS = [
  'free',
  'guaranteed',
  'act now',
  'limited time',
  'click here',
  '100%',
  'revolutionary',
  'game-changer',
  'skyrocket',
  'urgent',
  'winner',
  'no obligation'
]

/**
 * Evaluates an email against Cold Email Deliverability & Anti-Slop rules:
 * - Link count (optimal <= 2 links)
 * - Plain-text to link ratio (optimal >= 80%)
 * - Absence of spam trigger words / AI hype buzzwords
 */
export function evaluateDeliverabilityHealth(params: {
  subject: string
  textBody: string
  htmlBody: string
}): {
  score: number
  linkCount: number
  plainTextRatio: number
  spamTriggersFound: string[]
  warnings: string[]
} {
  const combinedText = `${params.subject}\n${params.textBody}`.toLowerCase()
  const spamTriggersFound = SPAM_TRIGGER_WORDS.filter(word => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`\\b${escaped}\\b`, 'i').test(combinedText)
  })

  // Count distinct href links in HTML or URLs in text
  const htmlLinks = params.htmlBody.match(/href=["']https?:\/\/[^"']+["']/gi) || []
  const textUrls = params.textBody.match(/https?:\/\/[^\s)]+/gi) || []
  const linkCount = Math.max(htmlLinks.length, textUrls.length)

  const totalTextChars = Math.max(params.textBody.trim().length, 1)
  const linkChars = textUrls.reduce((acc, u) => acc + u.length, 0)
  const plainTextRatio = Math.min(100, Math.max(0, Math.round(((totalTextChars - linkChars) / totalTextChars) * 100)))

  const warnings: string[] = []
  let score = 100

  if (linkCount > 2) {
    score -= (linkCount - 2) * 12
    warnings.push(`Contains ${linkCount} links (keep to 1–2 links for primary inbox placement).`)
  }
  if (plainTextRatio < 80) {
    score -= 15
    warnings.push(`Plain-text-to-link ratio is ${plainTextRatio}% (target 80%+).`)
  }
  if (spamTriggersFound.length > 0) {
    score -= spamTriggersFound.length * 15
    warnings.push(`Contains spam/hype trigger words: ${spamTriggersFound.join(', ')}.`)
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    linkCount,
    plainTextRatio,
    spamTriggersFound,
    warnings
  }
}

/**
 * Built-in default templates for Administrative Email Management, Project Releases, and Job Applications.
 */
export const DEFAULT_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl_project_release_note',
    name: 'Engineering Release Note — Minimalist',
    description: 'Linear/Vercel changelog aesthetic. Monochrome typography, concrete architecture summary, single case study link, zero marketing fluff.',
    category: 'project_release',
    subject: 'Case study: {{project_title}} ({{project_category}})',
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;background:#fafafa;color:#18181b;-webkit-font-smoothing:antialiased;">
  <div style="max-width:580px;margin:32px auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:8px;padding:32px;">
    <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#71717a;margin-bottom:12px;">
      NEW PROJECT // {{project_category}}
    </div>
    <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;letter-spacing:-0.02em;color:#09090b;line-height:1.35;">
      {{project_title}}
    </h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.65;color:#27272a;">
      Hi {{first_name}},
    </p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#27272a;">
      {{project_description}}
    </p>
    <div style="margin:0 0 24px;padding:16px;background:#fafafa;border:1px solid #e4e4e7;border-radius:6px;">
      <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#71717a;margin-bottom:6px;">
        Stack &amp; Architecture
      </div>
      <div style="font-size:14px;line-height:1.55;color:#18181b;font-weight:500;margin-bottom:12px;">
        {{project_tech}}
      </div>
      <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#71717a;margin-bottom:6px;">
        Implementation Notes
      </div>
      <div style="font-size:14px;line-height:1.6;color:#3f3f46;">
        {{project_solution}}
      </div>
    </div>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
      Read the full technical write-up and inspect the architecture:<br/>
      <a href="{{project_url}}" style="color:#09090b;font-weight:600;text-decoration:underline;">{{project_url}}</a>
    </p>
    <div style="border-top:1px solid #f4f4f5;padding-top:18px;font-size:14px;line-height:1.5;color:#52525b;">
      {{sender_name}}<br/>
      <span style="font-size:12px;color:#a1a1aa;">Software Engineer · Reply with "unsubscribe" anytime to opt out of project notes.</span>
    </div>
  </div>
</body>
</html>`,
    textBody: `Hi {{first_name}},\n\nI just published a new engineering case study: {{project_title}} ({{project_category}}).\n\n{{project_description}}\n\nStack: {{project_tech}}\nImplementation: {{project_solution}}\n\nFull write-up and architecture notes:\n{{project_url}}\n\n— {{sender_name}}\n(Reply "unsubscribe" anytime to opt out of project notes.)`,
    variables: [
      'first_name',
      'project_title',
      'project_category',
      'project_description',
      'project_tech',
      'project_solution',
      'project_url',
      'sender_name'
    ],
    requiredVariables: ['first_name', 'project_title', 'project_description', 'project_tech', 'project_url'],
    sampleData: {
      first_name: 'Alex',
      project_title: 'Distributed Telemetry & Event Pipeline',
      project_category: 'Systems & Backend',
      project_description: 'A low-latency ingestion pipeline built to process high-throughput webhook events with idempotent retry queues.',
      project_tech: 'Next.js 15, TypeScript, Redis, PostgreSQL, Docker',
      project_solution: 'Implemented deterministic content-hash deduplication and exponential backoff workers.',
      project_url: 'https://salihbenotman.dev/projects/telemetry-pipeline',
      sender_name: 'Salih Ben Otman'
    },
    status: 'active',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl_project_editorial_digest',
    name: 'Editorial Case Study Digest',
    description: 'Structured engineering breakdown highlighting the core problem, system design, and measurable results.',
    category: 'project_release',
    subject: 'Architecture breakdown: how I built {{project_title}}',
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,sans-serif;background:#f8fafc;color:#0f172a;-webkit-font-smoothing:antialiased;">
  <div style="max-width:600px;margin:28px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:36px;">
    <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:16px;margin-bottom:24px;">
      <span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#475569;">
        CASE STUDY DIGEST // {{project_category}}
      </span>
    </div>
    <h1 style="margin:0 0 14px;font-size:22px;font-weight:600;letter-spacing:-0.02em;color:#0f172a;line-height:1.3;">
      {{project_title}}
    </h1>
    <p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:#334155;">
      Hi {{first_name}}, I have documented the engineering decisions behind <strong>{{project_title}}</strong>. Here is a concise summary of the problem and architecture:
    </p>
    <div style="margin:0 0 16px;padding-left:14px;border-left:2px solid #0f172a;">
      <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#475569;margin-bottom:4px;">The Engineering Problem</div>
      <div style="font-size:14px;line-height:1.6;color:#1e293b;">{{project_challenge}}</div>
    </div>
    <div style="margin:0 0 16px;padding-left:14px;border-left:2px solid #64748b;">
      <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#475569;margin-bottom:4px;">System Architecture &amp; Stack ({{project_tech}})</div>
      <div style="font-size:14px;line-height:1.6;color:#1e293b;">{{project_solution}}</div>
    </div>
    <div style="margin:0 0 24px;padding-left:14px;border-left:2px solid #94a3b8;">
      <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#475569;margin-bottom:4px;">Key Outcome</div>
      <div style="font-size:14px;line-height:1.6;color:#1e293b;">{{project_results}}</div>
    </div>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#0f172a;">
      Explore the full case study: <a href="{{project_url}}" style="color:#0f172a;font-weight:600;text-decoration:underline;">{{project_url}}</a>
    </p>
    <div style="border-top:1px solid #f1f5f9;padding-top:16px;font-size:13px;color:#64748b;">
      {{sender_name}} · <span style="color:#94a3b8;">Reply "unsubscribe" to stop receiving case study digests.</span>
    </div>
  </div>
</body>
</html>`,
    textBody: `Hi {{first_name}},\n\nI have documented the engineering decisions behind {{project_title}} ({{project_category}}).\n\nTHE PROBLEM:\n{{project_challenge}}\n\nARCHITECTURE & STACK ({{project_tech}}):\n{{project_solution}}\n\nKEY OUTCOME:\n{{project_results}}\n\nRead the full case study:\n{{project_url}}\n\n— {{sender_name}}\n(Reply "unsubscribe" to stop receiving case study digests.)`,
    variables: [
      'first_name',
      'project_title',
      'project_category',
      'project_challenge',
      'project_tech',
      'project_solution',
      'project_results',
      'project_url',
      'sender_name'
    ],
    requiredVariables: ['first_name', 'project_title', 'project_challenge', 'project_solution', 'project_url'],
    sampleData: {
      first_name: 'Alex',
      project_title: 'Distributed Telemetry & Event Pipeline',
      project_category: 'Systems & Backend',
      project_challenge: 'High-volume webhook bursts caused duplicate downstream writes and lock contention under peak load.',
      project_tech: 'Next.js 15, TypeScript, Redis, PostgreSQL',
      project_solution: 'Separated ingress validation from worker dispatch using SHA-256 idempotency keys and bounded batch queues.',
      project_results: 'Zero duplicate dispatches across 50k+ synthetic events with sub-40ms p95 acknowledgment latency.',
      project_url: 'https://salihbenotman.dev/projects/telemetry-pipeline',
      sender_name: 'Salih Ben Otman'
    },
    status: 'active',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'tpl_project_personal_note',
    name: 'Personal Engineer Note — Plain-Text First',
    description: '1-to-1 personal correspondence style with 85%+ plain-text ratio and zero decorative chrome for maximum primary-inbox placement.',
    category: 'project_release',
    subject: 'Built something new: {{project_title}}',
    htmlBody: `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#ffffff;color:#111827;font-size:15px;line-height:1.65;">
  <div style="max-width:560px;">
    <p style="margin:0 0 14px;">Hi {{first_name}},</p>
    <p style="margin:0 0 14px;">I wanted to share a quick note on a project I just finished putting together: <strong>{{project_title}}</strong>.</p>
    <p style="margin:0 0 14px;">{{project_description}}</p>
    <p style="margin:0 0 14px;">Under the hood, it is built with {{project_tech}}. {{project_solution}}</p>
    <p style="margin:0 0 18px;">I wrote up the full breakdown and architecture notes here if you would like to take a look:<br/>
    <a href="{{project_url}}" style="color:#111827;">{{project_url}}</a></p>
    <p style="margin:0 0 20px;">Would love to hear your thoughts or feedback if you check it out.</p>
    <p style="margin:0;color:#374151;">Best,<br/>{{sender_name}}</p>
    <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">If you prefer not to receive occasional notes when I publish a new project, just reply "unsubscribe".</p>
  </div>
</body>
</html>`,
    textBody: `Hi {{first_name}},\n\nI wanted to share a quick note on a project I just finished putting together: {{project_title}}.\n\n{{project_description}}\n\nUnder the hood, it is built with {{project_tech}}. {{project_solution}}\n\nI wrote up the full breakdown and architecture notes here if you would like to take a look:\n{{project_url}}\n\nWould love to hear your thoughts or feedback if you check it out.\n\nBest,\n{{sender_name}}\n\n(If you prefer not to receive occasional notes when I publish a new project, just reply "unsubscribe".)`,
    variables: [
      'first_name',
      'project_title',
      'project_description',
      'project_tech',
      'project_solution',
      'project_url',
      'sender_name'
    ],
    requiredVariables: ['first_name', 'project_title', 'project_description', 'project_tech', 'project_url'],
    sampleData: {
      first_name: 'Alex',
      project_title: 'Distributed Telemetry & Event Pipeline',
      project_description: 'A low-latency ingestion pipeline built to process high-throughput webhook events with idempotent retry queues.',
      project_tech: 'Next.js 15, TypeScript, Redis, PostgreSQL',
      project_solution: 'Implemented deterministic content-hash deduplication and exponential backoff workers.',
      project_url: 'https://salihbenotman.dev/projects/telemetry-pipeline',
      sender_name: 'Salih Ben Otman'
    },
    status: 'active',
    createdBy: 'system',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
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

import { ResolvedRecipient, RecipientResolutionSummary, RecipientSource } from '@/types/email-system'
import { sanitizeHeader } from './validator'

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/**
 * Normalizes an email address to lowercase and strips surrounding whitespace or brackets.
 */
export function normalizeEmail(raw: string): string {
  if (!raw) return ''
  // Handle "Display Name <email@domain.com>" format if pasted
  const angleMatch = raw.match(/<([^>]+)>/)
  const extracted = angleMatch ? angleMatch[1] : raw
  return sanitizeHeader(extracted).toLowerCase().trim()
}

/**
 * Extracts display name from "Display Name <email@domain.com>" if present.
 */
export function extractNameFromRawInput(raw: string): string | undefined {
  if (!raw) return undefined
  const angleMatch = raw.match(/^([^<]+)<[^>]+>$/)
  if (angleMatch && angleMatch[1]) {
    const clean = sanitizeHeader(angleMatch[1]).replace(/^["']|["']$/g, '').trim()
    return clean || undefined
  }
  return undefined
}

/**
 * Validates whether a normalized email address is syntactically valid and safe.
 */
export function isValidEmailAddress(email: string): boolean {
  if (!email || email.length > 254) return false
  if (/[\r\n]/.test(email)) return false
  return EMAIL_REGEX.test(email)
}

/**
 * Splits a raw multi-recipient string by commas, semicolons, or newlines.
 */
export function splitRecipientInput(rawText: string): string[] {
  if (!rawText || typeof rawText !== 'string') return []
  return rawText
    .split(/[,;\r\n]+/)
    .map(token => token.trim())
    .filter(token => token.length > 0)
}

/**
 * Extracts email addresses embedded inside arbitrary text (e.g., job descriptions or pasted blocks)
 */
export function detectEmailsInText(text: string): string[] {
  if (!text || typeof text !== 'string') return []
  const matches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []
  const unique = new Set<string>()
  for (const m of matches) {
    const norm = normalizeEmail(m)
    if (isValidEmailAddress(norm)) {
      unique.add(norm)
    }
  }
  return Array.from(unique)
}

export interface DatabaseUserCandidate {
  id: string
  email: string
  name?: string
  role?: string
  unsubscribed?: boolean
  emailNotificationsEnabled?: boolean
}

/**
 * Resolves, deduplicates, and validates a combination of database users and manual email inputs.
 * Database user records take precedence for metadata (name, userId) when deduplicating.
 */
export function resolveRecipients(options: {
  dbUsers?: DatabaseUserCandidate[]
  manualInput?: string | string[]
  respectUnsubscribe?: boolean
}): RecipientResolutionSummary {
  const { dbUsers = [], manualInput = '', respectUnsubscribe = true } = options

  const seenEmails = new Set<string>()
  const validRecipients: ResolvedRecipient[] = []
  const excludedRecipients: ResolvedRecipient[] = []

  let invalidCount = 0
  let duplicateCount = 0
  let unsubscribedCount = 0
  let totalInputCount = 0

  // 1. Process selected database users first (verified application records)
  for (const user of dbUsers) {
    totalInputCount++
    const normEmail = normalizeEmail(user.email)
    const fullName = sanitizeHeader(user.name || '')
    const firstName = fullName ? fullName.split(/\s+/)[0] : 'there'

    if (!isValidEmailAddress(normEmail)) {
      invalidCount++
      excludedRecipients.push({
        email: user.email || '(missing)',
        name: fullName,
        firstName,
        userId: user.id,
        role: user.role,
        source: 'user_db',
        valid: false,
        excludedReason: 'invalid_format'
      })
      continue
    }

    if (seenEmails.has(normEmail)) {
      duplicateCount++
      excludedRecipients.push({
        email: normEmail,
        name: fullName,
        firstName,
        userId: user.id,
        role: user.role,
        source: 'user_db',
        valid: false,
        excludedReason: 'duplicate'
      })
      continue
    }

    if (
      respectUnsubscribe &&
      (user.unsubscribed === true || user.emailNotificationsEnabled === false)
    ) {
      unsubscribedCount++
      seenEmails.add(normEmail)
      excludedRecipients.push({
        email: normEmail,
        name: fullName,
        firstName,
        userId: user.id,
        role: user.role,
        source: 'user_db',
        valid: false,
        excludedReason: 'unsubscribed'
      })
      continue
    }

    seenEmails.add(normEmail)
    validRecipients.push({
      email: normEmail,
      name: fullName || normEmail.split('@')[0],
      firstName: firstName || normEmail.split('@')[0],
      userId: user.id,
      role: user.role,
      source: 'user_db',
      valid: true
    })
  }

  // 2. Process manual inputs (comma, semicolon, or newline separated)
  const rawTokens = Array.isArray(manualInput)
    ? manualInput.flatMap(item => splitRecipientInput(item))
    : splitRecipientInput(manualInput)

  for (const rawToken of rawTokens) {
    totalInputCount++
    const normEmail = normalizeEmail(rawToken)
    const parsedName = extractNameFromRawInput(rawToken)
    const fallbackName = parsedName || (normEmail.includes('@') ? normEmail.split('@')[0] : rawToken)
    const firstName = parsedName ? parsedName.split(/\s+/)[0] : fallbackName

    if (!isValidEmailAddress(normEmail)) {
      invalidCount++
      excludedRecipients.push({
        email: rawToken,
        name: parsedName,
        firstName,
        source: 'manual',
        valid: false,
        excludedReason: 'invalid_format'
      })
      continue
    }

    if (seenEmails.has(normEmail)) {
      duplicateCount++
      excludedRecipients.push({
        email: normEmail,
        name: parsedName,
        firstName,
        source: 'manual',
        valid: false,
        excludedReason: 'duplicate'
      })
      continue
    }

    seenEmails.add(normEmail)
    validRecipients.push({
      email: normEmail,
      name: fallbackName,
      firstName,
      source: 'manual',
      valid: true
    })
  }

  return {
    totalInputCount,
    validCount: validRecipients.length,
    invalidCount,
    duplicateCount,
    unsubscribedCount,
    validRecipients,
    excludedRecipients
  }
}

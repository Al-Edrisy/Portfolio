import { EmailRequest } from './types'

/**
 * Strips CRLF carriage return/line feed sequences to prevent email header injection.
 */
export function sanitizeHeader(value: string): string {
  if (!value) return ''
  return value.replace(/[\r\n]+/g, ' ').trim()
}

/**
 * Validates the contact form payload constraints and prevents DoS by size limits.
 */
export function validateEmailRequest(data: unknown): { error?: string; validatedData?: EmailRequest } {
  if (!data || typeof data !== 'object') {
    return { error: 'Invalid request body' }
  }

  // Size limit validation (reject bodies exceeding 100KB)
  const payloadSize = JSON.stringify(data).length
  if (payloadSize > 100 * 1024) {
    return { error: 'Request payload exceeds the size limit (100KB)' }
  }

  const { name, email, subject, message } = data as Record<string, unknown>

  // Empty value verification
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof subject !== 'string' || !subject.trim() ||
    typeof message !== 'string' || !message.trim()
  ) {
    return { error: 'All fields (name, email, subject, message) are required' }
  }

  // Input boundaries verification
  if (name.length > 100) return { error: 'Name field cannot exceed 100 characters' }
  if (subject.length > 200) return { error: 'Subject field cannot exceed 200 characters' }
  if (email.length > 254) return { error: 'Email field cannot exceed 254 characters' }
  if (message.length > 10000) return { error: 'Message field cannot exceed 10,000 characters' }

  // Email structure regex validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: 'Invalid email address format' }
  }

  // Header injection sanitation
  const cleanName = sanitizeHeader(name)
  const cleanEmail = sanitizeHeader(email)
  const cleanSubject = sanitizeHeader(subject)

  return {
    validatedData: {
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: message.trim()
    }
  }
}

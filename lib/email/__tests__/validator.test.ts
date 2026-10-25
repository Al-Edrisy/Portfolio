import { describe, it, expect } from 'vitest'
import { validateEmailRequest, sanitizeHeader } from '../validator'

describe('Email Validator', () => {
  it('should sanitize CRLF header injections', () => {
    const malicious = 'Test User\r\nBcc: victim@example.com\r\n'
    const sanitized = sanitizeHeader(malicious)
    expect(sanitized).toBe('Test User Bcc: victim@example.com')
    expect(sanitized).not.toContain('\r')
    expect(sanitized).not.toContain('\n')
  })

  it('should accept valid contact form payload', () => {
    const payload = {
      name: 'Salih Ben Otman',
      email: 'salehfree33@gmail.com',
      subject: 'Collaboration Inquiry',
      message: 'Hello, I would like to discuss a project with you.',
    }
    const { error, validatedData } = validateEmailRequest(payload)
    expect(error).toBeUndefined()
    expect(validatedData).toEqual({
      name: 'Salih Ben Otman',
      email: 'salehfree33@gmail.com',
      subject: 'Collaboration Inquiry',
      message: 'Hello, I would like to discuss a project with you.',
    })
  })

  it('should reject invalid email formats', () => {
    const payload = {
      name: 'Test',
      email: 'invalid-email-address',
      subject: 'Test',
      message: 'Test message',
    }
    const { error, validatedData } = validateEmailRequest(payload)
    expect(error).toBe('Invalid email address format')
    expect(validatedData).toBeUndefined()
  })

  it('should reject payloads with missing fields', () => {
    const payload = {
      name: 'Test',
      email: 'test@example.com',
      subject: '',
      message: 'Test message',
    }
    const { error, validatedData } = validateEmailRequest(payload)
    expect(error).toContain('All fields')
  })

  it('should reject payload exceeding 100KB', () => {
    const payload = {
      name: 'Test',
      email: 'test@example.com',
      subject: 'Test',
      message: 'A'.repeat(105 * 1024),
    }
    const { error } = validateEmailRequest(payload)
    expect(error).toContain('exceeds the size limit')
  })
})

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/firebase-admin'
import { EmailService } from '@/lib/email/email.service'
import { validateEmailRequest } from '@/lib/email/validator'

class SimpleRateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>()

  isRateLimited(ip: string, limit = 5, windowMs = 60 * 1000): boolean {
    const now = Date.now()
    const record = this.store.get(ip)

    if (!record || now > record.resetTime) {
      this.store.set(ip, { count: 1, resetTime: now + windowMs })
      return false
    }

    if (record.count >= limit) {
      return true
    }

    record.count++
    return false
  }
}

// Instantiate rate limiter globally in the module scope
const rateLimiter = new SimpleRateLimiter()

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()
  
  // Retrieve sender IP for rate-limiting
  const ip = request.headers.get('x-forwarded-for') || (request as any).ip || '127.0.0.1'
  
  if (rateLimiter.isRateLimited(ip)) {
    console.warn(JSON.stringify({
      timestamp,
      recipient: 'API_GATEWAY',
      action: 'RATE_LIMIT_EXCEEDED',
      status: 'BLOCKED',
      ip
    }))
    
    return NextResponse.json(
      { error: 'Too many messages. Please wait a minute before trying again.' },
      { status: 429 }
    )
  }

  try {
    // Read request body safely
    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request payload' },
        { status: 400 }
      )
    }

    // Validate body structure and sanitize header values
    const { error, validatedData } = validateEmailRequest(body)
    if (error || !validatedData) {
      return NextResponse.json(
        { error: error || 'Bad request payload' },
        { status: 400 }
      )
    }

    const { name, email, subject, message } = validatedData

    console.log('Contact form submission received:', { 
      name, 
      email, 
      subject, 
      messageLength: message.length 
    })

    // Store contact submission in Firebase Firestore
    const contactData = {
      name,
      email,
      subject,
      message,
      timestamp: new Date(),
      createdAt: new Date().toISOString(),
      read: false,
      replied: false,
    }

    try {
      await adminDb.collection('contacts').add(contactData)
      console.log('Contact submission saved to Firestore successfully')
    } catch (firestoreError: any) {
      console.error('Error saving to Firestore:', firestoreError.message)
      return NextResponse.json(
        { error: 'Failed to save your message. Please try again.' },
        { status: 500 }
      )
    }

    // Verify if SMTP is configured
    const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS

    if (!smtpConfigured) {
      console.log('SMTP not configured - message saved to Firestore, but notification email skipped')
      return NextResponse.json(
        { message: "Message received successfully! I'll get back to you soon." },
        { status: 200 }
      )
    }

    // Deliver alert notification and auto-reply confirmation via EmailService
    const emailService = new EmailService()
    const emailResponse = await emailService.sendContactEmails(validatedData)
    
    if (!emailResponse.success) {
      // If email fails, return success message since the message is already saved in Firestore
      return NextResponse.json(
        { message: "Message received successfully! I'll get back to you soon." },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { message: 'Message sent successfully! Check your email for confirmation.' },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('Unhandled contact API route error:', error.message)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}

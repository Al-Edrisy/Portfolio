import nodemailer from 'nodemailer'
import { SMTPConfig } from './types'

export interface EmailTransporter {
  sendMail(options: {
    from: string
    to: string | string[]
    subject: string
    html: string
    text?: string
    replyTo?: string
    headers?: Record<string, string>
    attachments?: Array<{ filename: string; content: Buffer | string; contentType?: string; encoding?: string }>
  }): Promise<{ messageId?: string; response?: string; rejected?: string[] }>
  verify?(): Promise<boolean>
}

function getSMTPConfig(): SMTPConfig {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '465')
  const user = process.env.SMTP_USER || ''
  const pass = process.env.SMTP_PASS || ''
  const secure = port === 465
  
  return { host, port, secure, user, pass }
}

export function createTransporter(config: SMTPConfig): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    connectionTimeout: 8000, // 8s connection timeout (fails fast to avoid Railway gateway timeouts)
    greetingTimeout: 6000,   // 6s greeting timeout
    socketTimeout: 12000,    // 12s socket timeout
    // Production default: verify server certificates
    tls: {
      rejectUnauthorized: true
    }
  })
}

export function createResendTransporter(apiKey: string): EmailTransporter {
  return {
    async sendMail(options) {
      const fromAddress = process.env.RESEND_FROM || options.from || 'Portfolio <onboarding@resend.dev>'
      
      const payload: any = {
        from: fromAddress,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        headers: options.headers
      }

      if (options.attachments && options.attachments.length > 0) {
        payload.attachments = options.attachments.map(att => ({
          filename: att.filename,
          content: Buffer.isBuffer(att.content)
            ? att.content.toString('base64')
            : typeof att.content === 'string'
              ? Buffer.from(att.content).toString('base64')
              : att.content
        }))
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const errorMsg = data.message || data.error || `Resend API error (HTTP ${res.status})`
        throw new Error(errorMsg)
      }

      return {
        messageId: data.id,
        response: `250 OK (Resend: ${data.id})`,
        rejected: []
      }
    },
    async verify() {
      try {
        const res = await fetch('https://api.resend.com/api-keys', {
          headers: { Authorization: `Bearer ${apiKey.trim()}` }
        })
        if (!res.ok && res.status === 401) {
          throw new Error('Invalid RESEND_API_KEY')
        }
        return true
      } catch (err: any) {
        if (err.message?.includes('Invalid RESEND_API_KEY')) throw err
        return true
      }
    }
  }
}

// Global cached transporter to reuse connection pool
let transporterInstance: EmailTransporter | null = null
let lastFailureTime = 0
let lastFailureError: Error | null = null
const FAILURE_COOLDOWN_MS = 20000 // 20s cooldown on connection failures

export async function getTransporter(): Promise<EmailTransporter> {
  if (transporterInstance) {
    return transporterInstance
  }

  // 1. High-priority HTTPS provider: Resend (Port 443, immune to cloud SMTP port blocks)
  const resendApiKey = process.env.RESEND_API_KEY?.trim()
  if (resendApiKey) {
    console.log('[Email] Initializing HTTPS email transport via Resend API (port 443)')
    const resendTransporter = createResendTransporter(resendApiKey)
    transporterInstance = resendTransporter
    return resendTransporter
  }

  // 2. Cooldown check if recent SMTP verification failed
  if (Date.now() - lastFailureTime < FAILURE_COOLDOWN_MS && lastFailureError) {
    throw lastFailureError
  }

  const primaryConfig = getSMTPConfig()
  
  if (!primaryConfig.user || !primaryConfig.pass) {
    throw new Error('Email credentials are not configured. Set RESEND_API_KEY (recommended for cloud hosts) or SMTP_USER and SMTP_PASS.')
  }

  console.log(`[Email] Initializing SMTP connection to ${primaryConfig.host}:${primaryConfig.port} (secure: ${primaryConfig.secure})`)
  
  const transporter = createTransporter(primaryConfig)
  
  try {
    // Verify connection on startup
    await transporter.verify()
    console.log('[Email] SMTP connection verified successfully')
    transporterInstance = transporter
    lastFailureError = null
    return transporter
  } catch (error: any) {
    console.warn(`[Email] Primary SMTP verification failed on port ${primaryConfig.port}:`, error.message)
    
    // Auto-fallback: If on 465 try 587, or if on 587 try 465
    const fallbackPort = primaryConfig.port === 465 ? 587 : 465
    const fallbackSecure = fallbackPort === 465
    console.log(`[Email] Attempting fallback configuration to port ${fallbackPort} (secure: ${fallbackSecure})...`)
    
    const fallbackConfig: SMTPConfig = {
      ...primaryConfig,
      port: fallbackPort,
      secure: fallbackSecure
    }
    
    const fallbackTransporter = createTransporter(fallbackConfig)
    try {
      await fallbackTransporter.verify()
      console.log(`[Email] Fallback SMTP connection verified successfully on port ${fallbackPort}`)
      transporterInstance = fallbackTransporter
      lastFailureError = null
      return fallbackTransporter
    } catch (fallbackError: any) {
      console.error(`[Email] Fallback SMTP verification also failed on port ${fallbackPort}:`, fallbackError.message)
      
      const isTimeout =
        error.message?.includes('timeout') || fallbackError.message?.includes('timeout')
      
      const detailedMessage = isTimeout
        ? `SMTP connection timed out on ports ${primaryConfig.port} and ${fallbackPort}. Railway and cloud container platforms block outbound SMTP (ports 25, 465, 587) by default. Solution: Set RESEND_API_KEY in Railway Variables to send over standard HTTPS (port 443), or request an outbound SMTP unblock in the Railway dashboard.`
        : `SMTP validation failed: ${fallbackError.message}`
        
      lastFailureTime = Date.now()
      lastFailureError = new Error(detailedMessage)
      throw lastFailureError
    }
  }
}

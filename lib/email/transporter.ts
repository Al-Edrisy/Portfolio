import nodemailer from 'nodemailer'
import { SMTPConfig } from './types'

function getSMTPConfig(): SMTPConfig {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '465')
  const user = process.env.SMTP_USER || ''
  const pass = process.env.SMTP_PASS || ''
  const secure = port === 465
  
  return { host, port, secure, user, pass }
}

export function createTransporter(config: SMTPConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
    // Production default: verify server certificates
    tls: {
      rejectUnauthorized: true
    }
  })
}

// Global cached transporter to reuse connection pool
let transporterInstance: nodemailer.Transporter | null = null

export async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporterInstance) {
    return transporterInstance
  }

  const primaryConfig = getSMTPConfig()
  
  if (!primaryConfig.user || !primaryConfig.pass) {
    throw new Error('SMTP credentials (SMTP_USER and SMTP_PASS) are not configured')
  }

  console.log(`[Email] Initializing SMTP connection to ${primaryConfig.host}:${primaryConfig.port} (secure: ${primaryConfig.secure})`)
  
  const transporter = createTransporter(primaryConfig)
  
  try {
    // Verify connection on startup
    await transporter.verify()
    console.log('[Email] SMTP connection verified successfully')
    transporterInstance = transporter
    return transporter
  } catch (error: any) {
    console.warn(`[Email] Primary SMTP verification failed on port ${primaryConfig.port}:`, error.message)
    
    // Auto-fallback from 465 SSL to 587 STARTTLS
    if (primaryConfig.port === 465) {
      console.log('[Email] Attempting fallback configuration to port 587 (STARTTLS)...')
      const fallbackConfig: SMTPConfig = {
        ...primaryConfig,
        port: 587,
        secure: false
      }
      
      const fallbackTransporter = createTransporter(fallbackConfig)
      try {
        await fallbackTransporter.verify()
        console.log('[Email] Fallback SMTP connection verified successfully on port 587')
        transporterInstance = fallbackTransporter
        return fallbackTransporter
      } catch (fallbackError: any) {
        console.error('[Email] Fallback SMTP verification also failed:', fallbackError.message)
        throw new Error(`SMTP validation failed: ${fallbackError.message}`)
      }
    }
    
    throw error
  }
}

import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
  } catch (authError: any) {
    if (authError instanceof Response) {
      return authError
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const smtpConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS)
  
  return NextResponse.json({
    smtpConfigured,
    variables: {
      SMTP_HOST: process.env.SMTP_HOST ? '✅ Set' : '❌ Not Set',
      SMTP_PORT: process.env.SMTP_PORT ? '✅ Set' : '❌ Not Set',
      SMTP_SECURE: process.env.SMTP_SECURE ? '✅ Set' : '❌ Not Set',
      SMTP_USER: process.env.SMTP_USER ? '✅ Set' : '❌ Not Set',
      SMTP_PASS: process.env.SMTP_PASS ? '✅ Set' : '❌ Not Set',
      CONTACT_EMAIL: process.env.CONTACT_EMAIL ? '✅ Set' : '❌ Not Set',
      CONTACT_NAME: process.env.CONTACT_NAME ? '✅ Set' : '❌ Not Set',
    },
    message: smtpConfigured 
      ? '✅ SMTP is configured - emails should work' 
      : '❌ SMTP is NOT configured - add variables to Railway'
  })
}


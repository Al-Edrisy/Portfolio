/**
 * Utility script to verify SMTP credentials and connectivity.
 * Run locally or in CI/deployment with: node scripts/test-smtp.js
 */
const nodemailer = require('nodemailer')
require('dotenv').config()

async function testSMTP() {
  console.log('--- Testing SMTP Configuration ---')
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '465')
  const user = process.env.SMTP_USER || ''
  const pass = process.env.SMTP_PASS || ''
  const secure = port === 465

  const rawRecipient = process.argv[2] || process.env.TEST_EMAIL_TO || 'restflow33@gmail.com'
  // Sanitize recipient in case of accidental duplicate '@' or whitespace
  const recipient = rawRecipient.trim().replace(/@+/g, '@')

  console.log(`Host: ${host}`)
  console.log(`Port: ${port} (Secure: ${secure})`)
  console.log(`User: ${user ? user.replace(/(.{3}).*(@.*)/, '$1***$2') : 'NOT SET'}`)
  console.log(`Pass: ${pass ? '******** (configured)' : 'NOT SET'}`)
  console.log(`Recipient: ${recipient}`)

  if (!user || !pass) {
    console.error('\n❌ SMTP_USER or SMTP_PASS is missing!')
    console.log('Please set SMTP_USER and SMTP_PASS in your environment or .env file.')
    process.exit(1)
  }

  let transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: true }
  })

  try {
    console.log('\n1. Connecting and verifying credentials...')
    await transporter.verify()
    console.log('✅ SMTP connection and authentication succeeded!')
  } catch (err) {
    console.error(`\n❌ Verification failed on port ${port}:`, err.message)
    if (port === 465) {
      console.log('Trying fallback STARTTLS on port 587...')
      transporter = nodemailer.createTransport({
        host,
        port: 587,
        secure: false,
        auth: { user, pass },
        tls: { rejectUnauthorized: true }
      })
      try {
        await transporter.verify()
        console.log('✅ Fallback connection succeeded on port 587!')
      } catch (fallbackErr) {
        console.error('❌ Fallback verification also failed:', fallbackErr.message)
        process.exit(1)
      }
    } else {
      process.exit(1)
    }
  }

  try {
    console.log(`\n2. Sending test email to ${recipient}...`)
    const fromName = process.env.CONTACT_NAME || 'Portfolio Test'
    const info = await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to: recipient,
      subject: 'Portfolio SMTP Test Email',
      text: `Hello!\n\nThis is a verification test email sent from your Portfolio SMTP configuration.\n\nDetails:\n- Recipient: ${recipient}\n- SMTP Host: ${host}\n- Timestamp: ${new Date().toISOString()}\n\nIf you see this message, email delivery is functioning perfectly!`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">🚀 Portfolio SMTP Verification</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Hello! This is a test message to confirm that your SMTP mail delivery pipeline is working smoothly.
          </p>
          <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 14px 16px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 4px 0; color: #0f172a; font-size: 14px;"><strong>Status:</strong> ✅ Successfully Delivered</p>
            <p style="margin: 4px 0; color: #0f172a; font-size: 14px;"><strong>Recipient:</strong> ${recipient}</p>
            <p style="margin: 4px 0; color: #0f172a; font-size: 14px;"><strong>Sender:</strong> ${user}</p>
            <p style="margin: 4px 0; color: #0f172a; font-size: 14px;"><strong>Host:</strong> ${host}:${port}</p>
            <p style="margin: 4px 0; color: #0f172a; font-size: 14px;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="color: #64748b; font-size: 13px; margin-bottom: 0;">
            Sent automatically by the Portfolio SMTP diagnostic tool.
          </p>
        </div>
      `
    })

    console.log(`✅ Test email delivered successfully!`)
    console.log(`Message ID: ${info.messageId}`)
    if (info.response) {
      console.log(`Server Response: ${info.response}`)
    }
  } catch (sendErr) {
    console.error(`\n❌ Failed to send test email to ${recipient}:`, sendErr.message)
    process.exit(1)
  }
}

testSMTP()

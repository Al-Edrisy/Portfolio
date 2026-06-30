import { EmailRequest } from './types'

export function escapeHtml(unsafe: string): string {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Renders the HTML alert email sent to the portfolio owner when a user contacts them.
 */
export function renderContactAlertHtml(data: EmailRequest): string {
  const safeName = escapeHtml(data.name)
  const safeEmail = escapeHtml(data.email)
  const safeSubject = escapeHtml(data.subject)
  // preserve line breaks inside pre-wrap for the message, but escape HTML tags
  const safeMessage = escapeHtml(data.message)
  const dateStr = new Date().toLocaleString()

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Contact Form Submission</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background-color: #fafafa; color: #1a1a1a;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">New Contact Form Submission</h1>
          <p style="color: #cccccc; margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">Portfolio Contact Form</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          
          <!-- Contact Details Card -->
          <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 32px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h2 style="color: #1a1a1a; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">Contact Details</h2>
            
            <div style="margin-bottom: 20px; display: flex; align-items: center;">
              <div style="width: 4px; height: 20px; background: #1a1a1a; margin-right: 12px; border-radius: 2px;"></div>
              <div>
                <span style="color: #666666; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Name</span>
                <div style="color: #1a1a1a; font-size: 16px; font-weight: 500; margin-top: 2px;">${safeName}</div>
              </div>
            </div>
            
            <div style="margin-bottom: 20px; display: flex; align-items: center;">
              <div style="width: 4px; height: 20px; background: #1a1a1a; margin-right: 12px; border-radius: 2px;"></div>
              <div>
                <span style="color: #666666; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Email</span>
                <div style="margin-top: 2px;">
                  <a href="mailto:${safeEmail}" style="color: #1a1a1a; font-size: 16px; font-weight: 500; text-decoration: none; border-bottom: 1px solid #1a1a1a; padding-bottom: 1px;">${safeEmail}</a>
                </div>
              </div>
            </div>
            
            <div style="margin-bottom: 20px; display: flex; align-items: center;">
              <div style="width: 4px; height: 20px; background: #1a1a1a; margin-right: 12px; border-radius: 2px;"></div>
              <div>
                <span style="color: #666666; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Subject</span>
                <div style="color: #1a1a1a; font-size: 16px; font-weight: 500; margin-top: 2px;">${safeSubject}</div>
              </div>
            </div>
            
            <div style="margin-bottom: 0;">
              <span style="color: #666666; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Message</span>
              <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; margin-top: 8px; border-left: 4px solid #1a1a1a;">
                <p style="color: #1a1a1a; margin: 0; line-height: 1.6; font-size: 15px; white-space: pre-wrap;">${safeMessage}</p>
              </div>
            </div>
          </div>
          
          <!-- Timestamp -->
          <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e5e5;">
            <p style="color: #999999; font-size: 13px; margin: 0; font-weight: 400;">
              Received from portfolio contact form • ${dateStr}
            </p>
          </div>
          
        </div>
        
        <!-- Footer -->
        <div style="background: #1a1a1a; color: #ffffff; padding: 24px 30px; text-align: center;">
          <p style="margin: 0; font-size: 14px; font-weight: 400; color: #cccccc;">
            © ${new Date().getFullYear()} Salih Ben Otman Portfolio
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `
}

export function renderContactAlertText(data: EmailRequest): string {
  return `
New Contact Form Submission

Name: ${data.name}
Email: ${data.email}
Subject: ${data.subject}

Message:
${data.message}

---
Sent from portfolio contact form at ${new Date().toLocaleString()}
  `.trim()
}

/**
 * Renders the HTML confirmation auto-reply sent to the sender of the contact form.
 */
export function renderAutoReplyHtml(data: EmailRequest): string {
  const safeName = escapeHtml(data.name)
  const safeSubject = escapeHtml(data.subject)
  const safeMessage = escapeHtml(data.message)

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Thank You for Contacting Me</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background-color: #fafafa; color: #1a1a1a;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Thank You!</h1>
          <p style="color: #cccccc; margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">Message Received Successfully</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          
          <!-- Greeting Card -->
          <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 32px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h2 style="color: #1a1a1a; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Hi ${safeName}! 👋</h2>
            
            <p style="color: #666666; line-height: 1.6; font-size: 16px; margin-bottom: 20px;">
              Thank you for reaching out to me through my portfolio website. I've received your message about <strong>"${safeSubject}"</strong> and I'll get back to you within 24 hours.
            </p>
            
            <p style="color: #666666; line-height: 1.6; font-size: 16px; margin-bottom: 24px;">
              In the meantime, feel free to check out my latest projects and skills on my portfolio.
            </p>
            
            <!-- Message Preview -->
            <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; border-left: 4px solid #1a1a1a; margin-bottom: 24px;">
              <h3 style="color: #1a1a1a; margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">Your Message:</h3>
              <p style="color: #666666; margin: 0; line-height: 1.5; font-size: 15px; white-space: pre-wrap; font-style: italic;">${safeMessage}</p>
            </div>
            
            <!-- Signature -->
            <div style="border-top: 1px solid #e5e5e5; padding-top: 20px;">
              <p style="color: #666666; line-height: 1.6; font-size: 16px; margin: 0;">
                Best regards,<br>
                <strong style="color: #1a1a1a;">Al-Edrisy</strong><br>
                <span style="color: #999999; font-size: 14px;">Full Stack Developer</span>
              </p>
            </div>
          </div>
          
          <!-- Quick Links -->
          <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 24px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <h3 style="color: #1a1a1a; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Explore My Work</h3>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
              <a href="#" style="background: #1a1a1a; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">View Projects</a>
              <a href="#" style="background: #f8f8f8; color: #1a1a1a; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; border: 1px solid #e5e5e5;">My Skills</a>
              <a href="#" style="background: #f8f8f8; color: #1a1a1a; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500; border: 1px solid #e5e5e5;">About Me</a>
            </div>
          </div>
          
        </div>
        
        <!-- Footer -->
        <div style="background: #1a1a1a; color: #ffffff; padding: 24px 30px; text-align: center;">
          <p style="margin: 0; font-size: 13px; font-weight: 400; color: #cccccc;">
            This is an automated response. Please do not reply to this email.
          </p>
          <p style="margin: 8px 0 0 0; font-size: 14px; font-weight: 400; color: #cccccc;">
            © ${new Date().getFullYear()} Salih Ben Otman Portfolio
          </p>
        </div>
        
      </div>
    </body>
    </html>
  `
}

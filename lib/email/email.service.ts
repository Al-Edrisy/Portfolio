import { getTransporter } from './transporter'
import { EmailRequest, EmailResponse } from './types'
import {
  renderContactAlertHtml,
  renderContactAlertText,
  renderAutoReplyHtml
} from './templates'

export interface IEmailService {
  sendContactEmails(data: EmailRequest): Promise<EmailResponse>
}

export class EmailService implements IEmailService {
  private fromName: string
  private fromEmail: string
  private toEmail: string

  constructor() {
    this.fromName = process.env.CONTACT_NAME || 'Portfolio Contact'
    this.fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@portfolio.com'
    this.toEmail = process.env.CONTACT_EMAIL || process.env.SMTP_USER || ''
  }

  /**
   * Orchestrates sending the alert notification to the admin and the confirmation reply to the visitor.
   * Logs execution status in structured JSON format without exposing credentials or full text bodies.
   */
  async sendContactEmails(data: EmailRequest): Promise<EmailResponse> {
    const timestamp = new Date().toISOString()
    
    try {
      const transporter = await getTransporter()
      
      // 1. Send contact submission notification to the portfolio owner
      const alertOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to: this.toEmail,
        replyTo: `"${data.name}" <${data.email}>`,
        subject: `New Contact Form Submission: ${data.subject}`,
        html: renderContactAlertHtml(data),
        text: renderContactAlertText(data)
      }

      const alertInfo = await transporter.sendMail(alertOptions)
      
      // Structured log formatting
      console.log(JSON.stringify({
        timestamp,
        recipient: this.toEmail,
        action: 'SEND_CONTACT_ALERT',
        status: 'SUCCESS',
        messageId: alertInfo.messageId,
        smtpResponse: alertInfo.response
      }))

      // 2. Send confirmation auto-reply back to the user
      const autoReplyOptions = {
        from: `"${process.env.CONTACT_NAME || 'Salih Ben Otman'}" <${this.fromEmail}>`,
        to: data.email,
        subject: 'Thank you for contacting me!',
        html: renderAutoReplyHtml(data)
      }

      const autoReplyInfo = await transporter.sendMail(autoReplyOptions)
      
      console.log(JSON.stringify({
        timestamp,
        recipient: data.email,
        action: 'SEND_AUTO_REPLY',
        status: 'SUCCESS',
        messageId: autoReplyInfo.messageId,
        smtpResponse: autoReplyInfo.response
      }))

      return {
        success: true,
        message: 'Message sent successfully! Check your email for confirmation.'
      }
    } catch (error: any) {
      // Structured logging for SMTP exceptions
      console.error(JSON.stringify({
        timestamp,
        recipient: this.toEmail,
        action: 'SEND_EMAILS_FAILED',
        status: 'FAILED',
        errorMessage: error.message
      }))

      return {
        success: false,
        message: 'Failed to send message. Please try again.',
        error: error.message
      }
    }
  }
}

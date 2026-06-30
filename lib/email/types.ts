export interface EmailRequest {
  name: string
  email: string
  subject: string
  message: string
}

export interface EmailResponse {
  success: boolean
  message: string
  error?: string
}

export interface SMTPConfig {
  host: string
  port: number
  secure: boolean
  user: string
  pass: string
}

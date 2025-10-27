import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Initialize S3 client
const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true', // For S3-compatible services
})

/**
 * Upload an image to S3
 * @param imageBase64 - Base64 encoded image string (data URL)
 * @param folder - Optional folder path (default: 'phone-founder-images')
 * @returns Object with success status and the S3 URL
 */
export async function uploadImageToS3(
  imageBase64: string,
  folder: string = 'phone-founder-images'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Extract mime type and base64 data
    const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid base64 image format')
    }

    const mimeType = matches[1]
    const base64Data = matches[2]
    
    // Determine file extension from mime type
    const extension = mimeType.split('/')[1] || 'jpg'
    
    // Generate unique filename: {timestamp}-{randomId}.{ext}
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const randomId = Math.random().toString(36).substring(2, 9)
    const fileName = `${timestamp}-${randomId}.${extension}`
    
    // Create the full S3 key (path)
    const key = `${folder}/${fileName}`

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64')

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || '',
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      // ACL removed - bucket policy handles public access
    })

    await s3Client.send(command)

    // Construct the public URL
    const bucketName = process.env.S3_BUCKET_NAME
    const region = process.env.S3_REGION
    const endpoint = process.env.S3_ENDPOINT
    
    let url: string
    
    if (endpoint && process.env.S3_FORCE_PATH_STYLE === 'true') {
      // S3-compatible service with path-style URL
      url = `${endpoint}/${bucketName}/${key}`
    } else if (endpoint) {
      // Custom endpoint (like Backblaze, DigitalOcean)
      url = `${endpoint}/${key}`
    } else {
      // Standard AWS S3 URL
      url = `https://${bucketName}.s3.${region}.amazonaws.com/${key}`
    }

    return {
      success: true,
      url,
    }
  } catch (error) {
    console.error('S3 upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

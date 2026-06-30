import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  try {
    const accountId = process.env.R2_ACCOUNT_ID
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || ''
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || ''
    const bucketName = process.env.R2_BUCKET_NAME || ''
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`

    const client = new S3Client({
      endpoint,
      region: 'auto',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })

    const { key } = await params
    const objectKey = key.join('/')

    let response;
    try {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })
      response = await client.send(command)
    } catch (error: any) {
      // Fallback: If key not found and contains folder prefix, try searching at the bucket root
      if (error.name === 'NoSuchKey' && objectKey.includes('/')) {
        const rootKey = objectKey.split('/').pop() || ''
        console.log(`[Media Proxy] Key not found: ${objectKey}. Retrying at root: ${rootKey}`)
        const fallbackCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: rootKey,
        })
        response = await client.send(fallbackCommand)
      } else {
        throw error
      }
    }

    if (!response.Body) {
      return new NextResponse('Media Asset Not Found', { status: 404 })
    }

    const bodyArray = await response.Body.transformToByteArray()

    return new NextResponse(Buffer.from(bodyArray), {
      headers: {
        'Content-Type': response.ContentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error: any) {
    console.error('Error fetching R2 asset via proxy:', error)
    if (error.name === 'NoSuchKey') {
      return new NextResponse('Media Asset Not Found', { status: 404 })
    }
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

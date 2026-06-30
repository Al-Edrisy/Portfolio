import { NextRequest, NextResponse } from 'next/server'
import { MediaService } from '@/lib/storage/media-service'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { imageBase64, folder, filename, altText } = body

        if (!imageBase64) {
            return NextResponse.json(
                { success: false, error: 'No image data provided' },
                { status: 400 }
            )
        }

        // Extract mime type and base64 data
        const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/)
        if (!matches) {
            return NextResponse.json(
                { success: false, error: 'Invalid base64 image format' },
                { status: 400 }
            )
        }

        const mimeType = matches[1]
        const base64Data = matches[2]
        const buffer = Buffer.from(base64Data, 'base64')

        // Security check: Size limit (10MB for images)
        if (buffer.length > 10 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'File size exceeds 10MB limit' },
                { status: 400 }
            )
        }

        // Security check: MIME Type validation
        const allowedMimeTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
            'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
            'text/markdown', 'application/pdf', 'text/plain', 'application/octet-stream'
        ]
        if (!allowedMimeTypes.includes(mimeType)) {
            return NextResponse.json(
                { success: false, error: `Invalid content type: ${mimeType}` },
                { status: 400 }
            )
        }

        const ext = mimeType.split('/')[1] || 'jpg'
        const cleanFilename = filename || `upload-${Date.now()}.${ext}`

        // Upload using centralized MediaService
        const asset = await MediaService.uploadMedia(
            buffer,
            cleanFilename,
            mimeType,
            folder || 'project-images',
            { altText }
        )

        return NextResponse.json({
            success: true,
            url: asset.url, // Backward compatibility
            data: asset
        })
    } catch (error: any) {
        console.error('API Upload Error:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

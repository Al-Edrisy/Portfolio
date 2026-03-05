import { NextRequest, NextResponse } from 'next/server'
import { uploadImageToS3 } from '@/lib/s3-client'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { imageBase64, folder } = body

        if (!imageBase64) {
            return NextResponse.json(
                { success: false, error: 'No image data provided' },
                { status: 400 }
            )
        }

        const result = await uploadImageToS3(imageBase64, folder || 'project-images')

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            url: result.url
        })
    } catch (error) {
        console.error('API Upload Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}

import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/firebase/schema/firestore-schema'

// GET - Check if user has already submitted feedback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId parameter is required'
        },
        { status: 400 }
      )
    }

    const q = query(
      collection(db, COLLECTIONS.FEEDBACK),
      where('userId', '==', userId)
    )

    const snapshot = await getDocs(q)
    const hasSubmitted = !snapshot.empty

    return NextResponse.json({
      success: true,
      data: {
        hasSubmitted,
        feedbackId: hasSubmitted ? snapshot.docs[0].id : null
      }
    })
  } catch (error: any) {
    console.error('Error checking feedback status:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to check feedback status'
      },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/firebase/schema/firestore-schema'

// GET - Fetch all approved feedback
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const approvedOnly = searchParams.get('approvedOnly') !== 'false' // Default to true
    const projectId = searchParams.get('projectId')

    let q = query(
      collection(db, COLLECTIONS.FEEDBACK),
      orderBy('createdAt', 'desc')
    )

    if (approvedOnly) {
      q = query(
        collection(db, COLLECTIONS.FEEDBACK),
        where('approved', '==', true),
        orderBy('createdAt', 'desc')
      )
    }

    if (projectId) {
      q = query(
        collection(db, COLLECTIONS.FEEDBACK),
        where('projectId', '==', projectId),
        where('approved', '==', true),
        orderBy('createdAt', 'desc')
      )
    }

    const snapshot = await getDocs(q)
    const feedback = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString()
    }))

    return NextResponse.json({
      success: true,
      data: feedback,
      total: feedback.length
    })
  } catch (error: any) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch feedback'
      },
      { status: 500 }
    )
  }
}

// POST - Submit new feedback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userName, userAvatar, userEmail, rating, comment, projectId, projectTitle } = body

    // Validation
    if (!userId || !userName || !userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'User information is required'
        },
        { status: 400 }
      )
    }

    if (!rating || rating < 1 || rating > 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rating must be between 1 and 6 stars'
        },
        { status: 400 }
      )
    }

    if (!comment || comment.length < 10 || comment.length > 500) {
      return NextResponse.json(
        {
          success: false,
          error: 'Comment must be between 10 and 500 characters'
        },
        { status: 400 }
      )
    }

    // Check if user already submitted feedback
    const existingFeedbackQuery = query(
      collection(db, COLLECTIONS.FEEDBACK),
      where('userId', '==', userId)
    )
    const existingFeedback = await getDocs(existingFeedbackQuery)

    if (!existingFeedback.empty) {
      return NextResponse.json(
        {
          success: false,
          error: 'You have already submitted feedback. Each user can only submit once.'
        },
        { status: 400 }
      )
    }

    // Create feedback document
    const feedbackDoc = {
      userId,
      userName,
      userAvatar: userAvatar || null,
      userEmail,
      rating,
      comment,
      projectId: projectId || null,
      projectTitle: projectTitle || null,
      approved: true, // Auto-approve for now
      featured: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.FEEDBACK), feedbackDoc)

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...feedbackDoc
      },
      message: 'Feedback submitted successfully'
    })
  } catch (error: any) {
    console.error('Error submitting feedback:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to submit feedback'
      },
      { status: 500 }
    )
  }
}


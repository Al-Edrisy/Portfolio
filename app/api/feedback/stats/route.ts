import { NextRequest, NextResponse } from 'next/server'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { COLLECTIONS } from '@/lib/firebase/schema/firestore-schema'

// GET - Fetch feedback statistics
export async function GET(request: NextRequest) {
  try {
    const q = query(
      collection(db, COLLECTIONS.FEEDBACK),
      where('approved', '==', true)
    )

    const snapshot = await getDocs(q)
    const feedback = snapshot.docs.map(doc => doc.data())

    // Calculate statistics
    const totalFeedback = feedback.length
    const averageRating = totalFeedback > 0
      ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / totalFeedback
      : 0

    // Get unique users
    const uniqueUsers = new Set(feedback.map(f => f.userId))
    const totalUsers = uniqueUsers.size

    // Count feedback by rating
    const ratingDistribution = feedback.reduce((acc, f) => {
      const rating = f.rating || 0
      acc[rating] = (acc[rating] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    // Count feedback by project
    const projectFeedback = feedback.reduce((acc, f) => {
      if (f.projectId && f.projectTitle) {
        if (!acc[f.projectId]) {
          acc[f.projectId] = {
            projectId: f.projectId,
            projectTitle: f.projectTitle,
            count: 0,
            averageRating: 0
          }
        }
        acc[f.projectId].count++
        acc[f.projectId].averageRating += f.rating || 0
      }
      return acc
    }, {} as Record<string, any>)

    // Calculate average rating per project
    Object.keys(projectFeedback).forEach(projectId => {
      projectFeedback[projectId].averageRating /= projectFeedback[projectId].count
    })

    return NextResponse.json({
      success: true,
      data: {
        totalFeedback,
        averageRating: Math.round(averageRating * 10) / 10,
        totalUsers,
        ratingDistribution,
        projectFeedback: Object.values(projectFeedback)
      }
    })
  } catch (error: any) {
    console.error('Error fetching feedback stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch feedback statistics'
      },
      { status: 500 }
    )
  }
}


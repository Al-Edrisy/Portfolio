import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { adminDb } from '@/lib/firebase/firebase-admin'
import { getDefaultCareerProfile } from '@/lib/career/career-storage'
import { CareerProfile } from '@/types/email-system'
import { recordEmailAuditLog } from '@/lib/email/campaign-queue'

export async function GET(request: NextRequest) {
  let adminUser
  try {
    adminUser = await requireAdmin(request)
  } catch (authError: any) {
    if (authError instanceof Response) return authError
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Strictly keyed by authenticated admin UID — never trust client-supplied userId
    const docSnap = await adminDb.collection('career_profiles').doc(adminUser.id).get()
    if (docSnap.exists) {
      const data = docSnap.data() as CareerProfile
      return NextResponse.json({
        success: true,
        profile: {
          ...data,
          ownerId: adminUser.id
        }
      })
    }

    const defaultProfile = getDefaultCareerProfile(adminUser.id, adminUser.email)
    return NextResponse.json({
      success: true,
      profile: defaultProfile
    })
  } catch (error: any) {
    const fallbackProfile = getDefaultCareerProfile(adminUser.id, adminUser.email)
    return NextResponse.json({
      success: true,
      profile: fallbackProfile
    })
  }
}

export async function PUT(request: NextRequest) {
  let adminUser
  try {
    adminUser = await requireAdmin(request)
  } catch (authError: any) {
    if (authError instanceof Response) return authError
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const defaultProfile = getDefaultCareerProfile(adminUser.id, adminUser.email)

    // Enforce server-side ownership: ownerId is ALWAYS adminUser.id
    const updatedProfile: CareerProfile = {
      ...defaultProfile,
      ...body,
      ownerId: adminUser.id,
      updatedAt: new Date().toISOString()
    }

    await adminDb
      .collection('career_profiles')
      .doc(adminUser.id)
      .set(updatedProfile, { merge: true })

    await recordEmailAuditLog({
      actorId: adminUser.id,
      actorEmail: adminUser.email,
      domain: 'career_profile',
      action: 'UPDATE',
      targetId: adminUser.id,
      details: {
        fullName: updatedProfile.fullName,
        careerLevel: updatedProfile.careerLevel,
        skillsCount: updatedProfile.technicalSkills?.length || 0
      }
    })

    return NextResponse.json({
      success: true,
      profile: updatedProfile
    })
  } catch (error: any) {
    console.error('[Career Profile PUT Error]:', error.message)
    return NextResponse.json(
      { error: error.message || 'Failed to save career profile' },
      { status: 500 }
    )
  }
}

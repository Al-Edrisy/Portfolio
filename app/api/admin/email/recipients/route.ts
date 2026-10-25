import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { adminDb } from '@/lib/firebase/firebase-admin'
import { resolveRecipients, DatabaseUserCandidate } from '@/lib/email/recipient-resolver'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request)
  } catch (authError: any) {
    if (authError instanceof Response) return authError
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const search = (request.nextUrl.searchParams.get('q') || '').toLowerCase().trim()
    const roleFilter = request.nextUrl.searchParams.get('role') || 'all'

    const usersSnap = await adminDb.collection('users').limit(500).get()
    const users: DatabaseUserCandidate[] = []

    usersSnap.forEach(doc => {
      const data = doc.data()
      if (!data.email) return
      const emailNotificationsEnabled =
        data.preferences?.notifications?.email !== undefined
          ? Boolean(data.preferences.notifications.email)
          : true

      users.push({
        id: doc.id,
        email: data.email,
        name: data.name || data.displayName || '',
        role: data.role || 'user',
        unsubscribed: Boolean(data.unsubscribed),
        emailNotificationsEnabled
      })
    })

    // Also include unique contact form senders if requested or as a 'contacts' group
    const includeContacts = request.nextUrl.searchParams.get('includeContacts') === 'true'
    if (includeContacts) {
      const contactsSnap = await adminDb.collection('contacts').limit(300).get()
      const existingEmails = new Set(users.map(u => u.email.toLowerCase()))
      contactsSnap.forEach(doc => {
        const data = doc.data()
        if (!data.email) return
        const norm = String(data.email).toLowerCase().trim()
        if (!existingEmails.has(norm)) {
          existingEmails.add(norm)
          users.push({
            id: `contact_${doc.id}`,
            email: norm,
            name: data.name || '',
            role: 'contact',
            unsubscribed: false,
            emailNotificationsEnabled: true
          })
        }
      })
    }

    const filtered = users.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (!search) return true
      return (
        u.email.toLowerCase().includes(search) ||
        (u.name || '').toLowerCase().includes(search)
      )
    })

    return NextResponse.json({
      success: true,
      users: filtered,
      totalCount: filtered.length
    })
  } catch (error: any) {
    console.error('[Admin Recipients GET Error]:', error.message)
    return NextResponse.json(
      { error: 'Failed to load recipients list' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request)
  } catch (authError: any) {
    if (authError instanceof Response) return authError
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      selectedUserIds = [],
      selectAllEligibleUsers = false,
      userGroup = '',
      manualInput = '',
      respectUnsubscribe = true
    } = body

    const dbUsers: DatabaseUserCandidate[] = []

    if (selectAllEligibleUsers || selectedUserIds.length > 0 || userGroup) {
      const usersSnap = await adminDb.collection('users').limit(1000).get()
      const selectedSet = new Set<string>(selectedUserIds)

      usersSnap.forEach(doc => {
        const data = doc.data()
        const emailNotificationsEnabled =
          data.preferences?.notifications?.email !== undefined
            ? Boolean(data.preferences.notifications.email)
            : true

        const matchesSelection =
          selectAllEligibleUsers ||
          selectedSet.has(doc.id) ||
          (userGroup && data.role === userGroup)

        if (matchesSelection) {
          dbUsers.push({
            id: doc.id,
            email: data.email || '',
            name: data.name || '',
            role: data.role || 'user',
            unsubscribed: Boolean(data.unsubscribed),
            emailNotificationsEnabled
          })
        }
      })

      // Also check contacts if any contact_<id> was selected or userGroup === 'contact'
      const contactIds = selectedUserIds
        .filter((id: string) => id.startsWith('contact_'))
        .map((id: string) => id.replace('contact_', ''))

      if (contactIds.length > 0 || userGroup === 'contact') {
        const contactsSnap = await adminDb.collection('contacts').limit(500).get()
        const contactIdSet = new Set(contactIds)
        contactsSnap.forEach(doc => {
          if (userGroup === 'contact' || contactIdSet.has(doc.id)) {
            const data = doc.data()
            dbUsers.push({
              id: `contact_${doc.id}`,
              email: data.email || '',
              name: data.name || '',
              role: 'contact',
              unsubscribed: false,
              emailNotificationsEnabled: true
            })
          }
        })
      }
    }

    const summary = resolveRecipients({
      dbUsers,
      manualInput,
      respectUnsubscribe
    })

    return NextResponse.json({
      success: true,
      summary
    })
  } catch (error: any) {
    console.error('[Admin Recipients POST Error]:', error.message)
    return NextResponse.json(
      { error: 'Failed to resolve and validate recipients' },
      { status: 400 }
    )
  }
}

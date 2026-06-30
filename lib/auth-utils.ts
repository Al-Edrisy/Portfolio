import { adminAuth, adminDb } from './firebase/firebase-admin'
import { User, UserRole } from '@/types'

/**
 * Extracts and verifies the Firebase ID token from the Request headers.
 * Resolves the corresponding user profile document from Firestore.
 */
export async function getCurrentUser(request: Request): Promise<User | null> {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split('Bearer ')[1]
  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    
    // Fetch the user document from Firestore to verify their role
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get()
    if (!userDoc.exists) {
      return null
    }

    const userData = userDoc.data()
    // Normalize role: developer/admin -> admin, else user
    const dbRole = userData?.role
    const normalizedRole: UserRole = (dbRole === 'developer' || dbRole === 'admin') ? 'admin' : 'user'

    return {
      id: decodedToken.uid,
      email: decodedToken.email || userData?.email || '',
      name: decodedToken.name || userData?.name || '',
      avatar: decodedToken.picture || userData?.avatar || '',
      role: normalizedRole,
      createdAt: userData?.createdAt ? userData.createdAt.toDate() : new Date()
    }
  } catch (error) {
    console.error('[Auth Service] Token verification failed:', error)
    return null
  }
}

/**
 * Enforces that the request is authenticated. Throws a 401 response error if not.
 */
export async function requireUser(request: Request): Promise<User> {
  const user = await getCurrentUser(request)
  if (!user) {
    throw new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Authentication token is missing or invalid' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }
  return user
}

/**
 * Enforces that the request belongs to an authenticated admin. Throws a 403 or 401 response error if not.
 */
export async function requireAdmin(request: Request): Promise<User> {
  const user = await requireUser(request)
  if (user.role !== 'admin') {
    throw new Response(
      JSON.stringify({ success: false, error: 'Forbidden: Admin privilege is required to perform this action' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    )
  }
  return user
}

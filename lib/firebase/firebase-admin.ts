// Firebase Admin SDK configuration for server-side operations
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Validate required environment variables
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_PRIVATE_KEY',
]

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required Firebase Admin environment variables: ${missingEnvVars.join(', ')}\n` +
    'Please check your .env.local file and ensure all Firebase Admin configuration variables are set.'
  )
}

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
}

// Initialize Firebase Admin (avoid multiple initializations)
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]

// Initialize Firebase Admin services
export const adminDb = getFirestore(app)
export const adminAuth = getAuth(app)

// Export the app instance
export default app

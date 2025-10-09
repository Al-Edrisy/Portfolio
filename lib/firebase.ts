// Firebase client-side configuration
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined'

// Firebase configuration with fallbacks for development
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef',
}

// Only validate in browser environment to prevent SSR issues
if (isBrowser) {
  const requiredEnvVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ]

  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

  // Only show warning if we're actually missing variables (not just in development mode)
  if (missingEnvVars.length > 0 && missingEnvVars.length < requiredEnvVars.length) {
    console.warn('⚠️ Missing Firebase environment variables:', missingEnvVars)
    console.warn('📝 Please update your .env.local file with your Firebase configuration')
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

// Export the app instance
export default app

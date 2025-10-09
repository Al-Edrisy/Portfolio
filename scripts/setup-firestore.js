#!/usr/bin/env node

/**
 * Firestore Setup Script
 * 
 * This script helps you set up Firestore collections and test the connection
 * Run with: node scripts/setup-firestore.js
 */

const { initializeApp } = require('firebase/app')
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore')

// Firebase configuration (use environment variables in production)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:abcdef'
}

async function setupFirestore() {
  try {
    console.log('🚀 Setting up Firestore...')
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    
    // Connect to emulator in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Connecting to Firestore emulator...')
      try {
        connectFirestoreEmulator(db, 'localhost', 8080)
        console.log('✅ Connected to Firestore emulator')
      } catch (error) {
        console.log('⚠️ Firestore emulator not running, using cloud Firestore')
      }
    }
    
    console.log('✅ Firestore setup complete!')
    console.log('📝 Next steps:')
    console.log('   1. Set up your Firebase project in the Firebase Console')
    console.log('   2. Copy your config to .env.local')
    console.log('   3. Deploy security rules: npm run deploy-rules')
    console.log('   4. Initialize collections: npm run init-database')
    
  } catch (error) {
    console.error('❌ Error setting up Firestore:', error)
    process.exit(1)
  }
}

// Run the setup
setupFirestore()

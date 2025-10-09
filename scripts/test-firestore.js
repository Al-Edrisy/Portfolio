#!/usr/bin/env node

/**
 * Firestore Test Script
 * 
 * This script tests the Firestore connection and collections
 * Run with: node scripts/test-firestore.js
 */

const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc, getDocs, query, limit } = require('firebase/firestore')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

async function testFirestore() {
  try {
    console.log('🧪 Testing Firestore connection...')
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    
    console.log('✅ Firebase initialized successfully')
    
    // Test creating a document (this will create the collection if it doesn't exist)
    console.log('📝 Testing document creation...')
    
    const testDoc = {
      title: 'Test Project',
      description: 'This is a test project to verify Firestore is working',
      published: false,
      createdAt: new Date(),
      test: true
    }
    
    // Try to add a test document
    try {
      const docRef = await addDoc(collection(db, 'test-collection'), testDoc)
      console.log('✅ Test document created with ID:', docRef.id)
      
      // Try to read the document
      const snapshot = await getDocs(query(collection(db, 'test-collection'), limit(1)))
      if (!snapshot.empty) {
        console.log('✅ Test document read successfully')
        console.log('📄 Document data:', snapshot.docs[0].data())
      }
      
    } catch (error) {
      if (error.code === 'permission-denied') {
        console.log('⚠️ Permission denied - this is expected if security rules are active')
        console.log('✅ Firestore is working, but you need authentication to write data')
      } else {
        throw error
      }
    }
    
    console.log('🎉 Firestore test completed successfully!')
    console.log('📋 Next steps:')
    console.log('   1. Set up authentication if you haven\'t already')
    console.log('   2. Run: npm run init-database')
    console.log('   3. Start building your components!')
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error.message)
    
    if (error.code === 'app/invalid-credential') {
      console.log('💡 Solution: Check your Firebase configuration in .env.local')
    } else if (error.code === 'app/network-request-failed') {
      console.log('💡 Solution: Check your internet connection and Firebase project status')
    }
    
    process.exit(1)
  }
}

// Run the test
testFirestore()

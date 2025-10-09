#!/usr/bin/env node

// Test script to verify projects are loading correctly
import dotenv from 'dotenv'
import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, query, where, orderBy } from 'firebase/firestore'

dotenv.config({ path: '.env.local' })

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

console.log('🧪 Testing Projects Loading...')
console.log('📊 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
})

try {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)
  
  console.log('✅ Firebase initialized successfully')
  
  // Test loading projects
  console.log('📝 Loading projects...')
  
  const projectsQuery = query(
    collection(db, 'projects'),
    where('published', '==', true),
    orderBy('createdAt', 'desc')
  )
  
  const snapshot = await getDocs(projectsQuery)
  
  console.log(`📊 Found ${snapshot.size} published projects:`)
  
  snapshot.docs.forEach((doc, index) => {
    const data = doc.data()
    console.log(`   ${index + 1}. ${data.title} (${data.category})`)
  })
  
  if (snapshot.size === 0) {
    console.log('⚠️  No published projects found!')
    console.log('💡 Run: node scripts/init-database-admin.js to create sample data')
  } else {
    console.log('✅ Projects are loading correctly!')
  }
  
} catch (error) {
  console.error('❌ Error testing projects loading:', error.message)
  console.error('Stack trace:', error.stack)
}

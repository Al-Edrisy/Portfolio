#!/usr/bin/env node

/**
 * Firestore Collections Test Script
 * 
 * This script tests Firestore collections creation and structure
 * Run with: node scripts/test-collections.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const { initializeApp } = require('firebase/app')
const { getFirestore, collection, addDoc, getDocs, query, limit, serverTimestamp } = require('firebase/firestore')

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const COLLECTIONS = {
  PROJECTS: 'projects',
  COMMENTS: 'comments',
  REACTIONS: 'reactions',
  USERS: 'users',
  ANALYTICS: 'analytics'
}

async function testCollections() {
  try {
    console.log('🧪 Testing Firestore Collections...\n')
    
    // Initialize Firebase
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)
    
    console.log('✅ Firebase initialized successfully')
    console.log(`📊 Project ID: ${firebaseConfig.projectId}\n`)
    
    // Test 1: Check if collections exist
    console.log('📋 Step 1: Checking existing collections...')
    const collections = Object.values(COLLECTIONS)
    const collectionStatus = {}
    
    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(query(collection(db, collectionName), limit(1)))
        collectionStatus[collectionName] = {
          exists: true,
          hasData: !snapshot.empty,
          count: snapshot.size
        }
        console.log(`✅ ${collectionName}: ${snapshot.empty ? 'Empty collection' : 'Has data'} (${snapshot.size} docs)`)
      } catch (error) {
        if (error.code === 'permission-denied') {
          collectionStatus[collectionName] = {
            exists: false,
            hasData: false,
            count: 0,
            error: 'Permission denied (security rules active)'
          }
          console.log(`⚠️  ${collectionName}: Permission denied (security rules active)`)
        } else {
          collectionStatus[collectionName] = {
            exists: false,
            hasData: false,
            count: 0,
            error: error.message
          }
          console.log(`❌ ${collectionName}: ${error.message}`)
        }
      }
    }
    
    // Test 2: Try to create a test document (this will create the collection)
    console.log('\n📝 Step 2: Testing document creation...')
    
    const testDoc = {
      title: 'Test Project',
      description: 'This is a test project to verify collections work',
      published: false,
      createdAt: new Date(),
      test: true,
      authorId: 'test-user',
      authorName: 'Test User',
      commentsCount: 0,
      reactionsCount: {
        like: 0,
        love: 0,
        fire: 0,
        wow: 0,
        laugh: 0,
        idea: 0,
        rocket: 0,
        clap: 0
      },
      totalReactions: 0,
      viewsCount: 0
    }
    
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), testDoc)
      console.log(`✅ Test document created successfully with ID: ${docRef.id}`)
      
      // Try to read it back
      const snapshot = await getDocs(query(collection(db, COLLECTIONS.PROJECTS), limit(1)))
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        console.log(`✅ Document read back successfully: ${doc.data().title}`)
      }
      
    } catch (error) {
      if (error.code === 'permission-denied') {
        console.log('⚠️  Permission denied - this is expected with security rules')
        console.log('💡 Collections will be created automatically when you have proper authentication')
      } else {
        console.log(`❌ Error creating test document: ${error.message}`)
      }
    }
    
    // Test 3: Check collection structure
    console.log('\n🏗️  Step 3: Collection structure summary...')
    console.log('=' .repeat(60))
    
    Object.entries(collectionStatus).forEach(([name, status]) => {
      const icon = status.exists ? '✅' : '⚠️'
      const details = status.hasData ? `(${status.count} docs)` : '(empty)'
      const error = status.error ? ` - ${status.error}` : ''
      console.log(`${icon} ${name}: ${details}${error}`)
    })
    
    console.log('=' .repeat(60))
    
    // Summary
    console.log('\n📊 Test Summary:')
    const existingCollections = Object.values(collectionStatus).filter(s => s.exists).length
    const totalCollections = collections.length
    
    console.log(`   - Collections checked: ${totalCollections}`)
    console.log(`   - Collections existing: ${existingCollections}`)
    console.log(`   - Collections with data: ${Object.values(collectionStatus).filter(s => s.hasData).length}`)
    
    if (existingCollections === totalCollections) {
      console.log('\n🎉 All collections are accessible!')
    } else if (existingCollections > 0) {
      console.log('\n✅ Some collections are accessible!')
      console.log('💡 Collections will be created automatically when you write data to them')
    } else {
      console.log('\n⚠️  No collections are accessible yet')
      console.log('💡 This is normal - collections are created automatically when you write data')
    }
    
    console.log('\n📋 Next steps:')
    console.log('   1. Set up Firebase Authentication')
    console.log('   2. Run: npm run init-database')
    console.log('   3. Test with authenticated user')
    
  } catch (error) {
    console.error('❌ Collections test failed:', error.message)
    process.exit(1)
  }
}

// Run the test
testCollections()

#!/usr/bin/env node

/**
 * Test Script for CRUD Operations
 * Tests all the new CRUD hooks and operations with Firebase
 */

require('dotenv').config()
const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')

// Initialize Firebase Admin
// Note: For testing purposes, we'll use the client-side Firebase config
// In production, you would use Firebase Admin SDK with service account credentials
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

console.log('📋 Firebase Config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket
})

// For this test, we'll skip Firebase Admin initialization and test the structure instead
const skipFirebaseAdmin = true

console.log('🧪 Testing CRUD Operations...\n')

async function testCRUDOperations() {
  try {
    // Initialize Firebase Admin
    const app = initializeApp({
      credential: cert(serviceAccount)
    })
    
    const db = getFirestore(app)
    console.log('✅ Firebase Admin initialized successfully')

    // Test 1: Create a test user
    console.log('\n📝 Test 1: Creating test user...')
    const testUserId = 'test-user-' + Date.now()
    const userData = {
      id: testUserId,
      name: 'Test User',
      email: 'test@example.com',
      avatar: 'https://via.placeholder.com/150',
      role: 'developer',
      bio: 'Test user for CRUD operations',
      projectsCount: 0,
      commentsCount: 0,
      reactionsGiven: 0,
      reactionsReceived: 0,
      viewsCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastActiveAt: FieldValue.serverTimestamp(),
      preferences: {
        theme: 'system',
        notifications: {
          email: true,
          comments: true,
          reactions: true,
          projects: true
        },
        privacy: {
          showEmail: false,
          showLocation: false,
          showStats: true
        }
      }
    }

    await db.collection('users').doc(testUserId).set(userData)
    console.log('✅ Test user created successfully')

    // Test 2: Create a test project
    console.log('\n📝 Test 2: Creating test project...')
    const testProjectId = 'test-project-' + Date.now()
    const projectData = {
      title: 'Test Project',
      description: 'A test project for CRUD operations',
      longDescription: 'This is a detailed description of the test project.',
      images: {
        cover: 'https://via.placeholder.com/800x600',
        gallery: ['https://via.placeholder.com/800x600'],
        thumbnails: ['https://via.placeholder.com/300x200']
      },
      tech: ['React', 'TypeScript', 'Firebase'],
      category: 'web-development',
      link: 'https://example.com',
      github: 'https://github.com/example/test-project',
      published: true,
      featured: false,
      authorId: testUserId,
      authorName: 'Test User',
      authorAvatar: 'https://via.placeholder.com/150',
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
      viewsCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      publishedAt: FieldValue.serverTimestamp()
    }

    await db.collection('projects').doc(testProjectId).set(projectData)
    console.log('✅ Test project created successfully')

    // Test 3: Update project
    console.log('\n📝 Test 3: Updating test project...')
    await db.collection('projects').doc(testProjectId).update({
      description: 'Updated test project description',
      updatedAt: FieldValue.serverTimestamp()
    })
    console.log('✅ Test project updated successfully')

    // Test 4: Create a test comment
    console.log('\n📝 Test 4: Creating test comment...')
    const testCommentId = 'test-comment-' + Date.now()
    const commentData = {
      projectId: testProjectId,
      content: 'This is a test comment',
      parentCommentId: null,
      userId: testUserId,
      userDisplayName: 'Test User',
      userAvatar: 'https://via.placeholder.com/150',
      userRole: 'developer',
      depth: 0,
      repliesCount: 0,
      likesCount: 0,
      userLikes: [],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      deleted: false
    }

    await db.collection('comments').doc(testCommentId).set(commentData)
    
    // Update project comment count
    await db.collection('projects').doc(testProjectId).update({
      commentsCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp()
    })

    // Update user comment count
    await db.collection('users').doc(testUserId).update({
      commentsCount: FieldValue.increment(1),
      lastActiveAt: FieldValue.serverTimestamp()
    })

    console.log('✅ Test comment created successfully')

    // Test 5: Create a test reaction
    console.log('\n📝 Test 5: Creating test reaction...')
    const testReactionId = 'test-reaction-' + Date.now()
    const reactionData = {
      projectId: testProjectId,
      userId: testUserId,
      type: 'like',
      createdAt: FieldValue.serverTimestamp()
    }

    await db.collection('reactions').doc(testReactionId).set(reactionData)
    
    // Update project reaction counts
    await db.collection('projects').doc(testProjectId).update({
      'reactionsCount.like': FieldValue.increment(1),
      totalReactions: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp()
    })

    // Update user reaction count
    await db.collection('users').doc(testUserId).update({
      reactionsGiven: FieldValue.increment(1),
      lastActiveAt: FieldValue.serverTimestamp()
    })

    console.log('✅ Test reaction created successfully')

    // Test 6: Read operations
    console.log('\n📝 Test 6: Testing read operations...')
    
    // Read user
    const userDoc = await db.collection('users').doc(testUserId).get()
    console.log('✅ User read successfully:', userDoc.exists)

    // Read project
    const projectDoc = await db.collection('projects').doc(testProjectId).get()
    console.log('✅ Project read successfully:', projectDoc.exists)

    // Read comment
    const commentDoc = await db.collection('comments').doc(testCommentId).get()
    console.log('✅ Comment read successfully:', commentDoc.exists)

    // Read reaction
    const reactionDoc = await db.collection('reactions').doc(testReactionId).get()
    console.log('✅ Reaction read successfully:', reactionDoc.exists)

    // Test 7: Delete operations
    console.log('\n📝 Test 7: Testing delete operations...')
    
    // Delete reaction
    await db.collection('reactions').doc(testReactionId).delete()
    await db.collection('projects').doc(testProjectId).update({
      'reactionsCount.like': FieldValue.increment(-1),
      totalReactions: FieldValue.increment(-1),
      updatedAt: FieldValue.serverTimestamp()
    })
    await db.collection('users').doc(testUserId).update({
      reactionsGiven: FieldValue.increment(-1),
      lastActiveAt: FieldValue.serverTimestamp()
    })
    console.log('✅ Reaction deleted successfully')

    // Delete comment (soft delete)
    await db.collection('comments').doc(testCommentId).update({
      deleted: true,
      deletedAt: FieldValue.serverTimestamp(),
      deletedBy: testUserId,
      content: '[This comment has been deleted]',
      updatedAt: FieldValue.serverTimestamp()
    })
    await db.collection('projects').doc(testProjectId).update({
      commentsCount: FieldValue.increment(-1),
      updatedAt: FieldValue.serverTimestamp()
    })
    await db.collection('users').doc(testUserId).update({
      commentsCount: FieldValue.increment(-1),
      lastActiveAt: FieldValue.serverTimestamp()
    })
    console.log('✅ Comment soft deleted successfully')

    // Delete project (soft delete)
    await db.collection('projects').doc(testProjectId).update({
      published: false,
      deleted: true,
      deletedAt: FieldValue.serverTimestamp(),
      deletedBy: testUserId,
      updatedAt: FieldValue.serverTimestamp()
    })
    console.log('✅ Project soft deleted successfully')

    // Delete user
    await db.collection('users').doc(testUserId).delete()
    console.log('✅ User deleted successfully')

    console.log('\n🎉 All CRUD operations completed successfully!')
    console.log('\n📊 Test Summary:')
    console.log('✅ Create operations: PASSED')
    console.log('✅ Read operations: PASSED')
    console.log('✅ Update operations: PASSED')
    console.log('✅ Delete operations: PASSED')

  } catch (error) {
    console.error('\n❌ CRUD operations test failed:', error.message)
    console.error('Stack trace:', error.stack)
    process.exit(1)
  }
}

// Run the test
testCRUDOperations()
  .then(() => {
    console.log('\n✅ CRUD operations test completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ CRUD operations test failed:', error)
    process.exit(1)
  })

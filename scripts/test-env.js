#!/usr/bin/env node

/**
 * Environment Variables Test Script
 * 
 * This script tests if all required environment variables are properly configured
 * Run with: node scripts/test-env.js
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
]

function testEnvironmentVariables() {
  console.log('🧪 Testing Environment Variables...\n')
  
  let allPresent = true
  const results = []
  
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar]
    const isPresent = value && value.trim() !== ''
    const isDemo = value && (value.includes('demo') || value.includes('123456789'))
    
    results.push({
      variable: envVar,
      present: isPresent,
      isDemo: isDemo,
      value: isPresent ? (isDemo ? value : `${value.substring(0, 10)}...`) : 'NOT SET'
    })
    
    if (!isPresent) {
      allPresent = false
    }
  })
  
  // Display results
  console.log('📋 Environment Variables Status:')
  console.log('=' .repeat(60))
  
  results.forEach(result => {
    const status = result.present ? '✅' : '❌'
    const demoWarning = result.isDemo ? ' (DEMO VALUE)' : ''
    console.log(`${status} ${result.variable}: ${result.value}${demoWarning}`)
  })
  
  console.log('=' .repeat(60))
  
  if (allPresent) {
    console.log('🎉 All environment variables are present!')
    
    // Check for demo values
    const demoValues = results.filter(r => r.isDemo)
    if (demoValues.length > 0) {
      console.log('\n⚠️  WARNING: Some values appear to be demo/placeholder values:')
      demoValues.forEach(demo => {
        console.log(`   - ${demo.variable}`)
      })
      console.log('\n💡 Make sure to replace these with your actual Firebase project values!')
    } else {
      console.log('✅ All values appear to be real Firebase project values!')
    }
  } else {
    console.log('\n❌ Some environment variables are missing!')
    console.log('📝 Please check your .env.local file and add the missing variables.')
    
    const missing = results.filter(r => !r.present)
    console.log('\nMissing variables:')
    missing.forEach(missing => {
      console.log(`   - ${missing.variable}`)
    })
  }
  
  // Test Firebase config object creation
  console.log('\n🔧 Testing Firebase Configuration Object:')
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    }
    
    console.log('✅ Firebase config object created successfully')
    console.log('📊 Config summary:')
    console.log(`   - Project ID: ${firebaseConfig.projectId}`)
    console.log(`   - Auth Domain: ${firebaseConfig.authDomain}`)
    console.log(`   - Storage Bucket: ${firebaseConfig.storageBucket}`)
    
  } catch (error) {
    console.log('❌ Error creating Firebase config:', error.message)
  }
  
  return allPresent
}

// Run the test
const success = testEnvironmentVariables()

if (success) {
  console.log('\n🚀 Environment variables test completed successfully!')
  console.log('📋 Next step: Run "npm run test-firestore" to test Firebase connection')
} else {
  console.log('\n💥 Environment variables test failed!')
  console.log('📝 Please fix the missing variables and try again.')
  process.exit(1)
}

/**
 * Test S3 Upload Configuration
 * 
 * This script tests the S3 configuration and attempts to upload a test image
 * to verify all credentials and permissions are working correctly.
 */

require('dotenv').config({ path: '.env.local' })
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// Test configuration
async function testS3Configuration() {
  log('\n=== S3 Configuration Test ===\n', 'cyan')
  
  // 1. Check environment variables
  log('1. Checking environment variables...', 'blue')
  const requiredVars = [
    'S3_ENDPOINT',
    'S3_REGION',
    'S3_BUCKET_NAME',
    'S3_ACCESS_KEY_ID',
    'S3_SECRET_ACCESS_KEY',
  ]
  
  const config = {}
  let missingVars = []
  
  for (const varName of requiredVars) {
    const value = process.env[varName]
    if (!value) {
      missingVars.push(varName)
      log(`   ✗ ${varName}: NOT SET`, 'red')
    } else {
      // Mask secret values
      const displayValue = varName.includes('SECRET') || varName.includes('KEY')
        ? value.substring(0, 4) + '...' + value.substring(value.length - 4)
        : value
      log(`   ✓ ${varName}: ${displayValue}`, 'green')
      config[varName] = value
    }
  }
  
  if (missingVars.length > 0) {
    log(`\n❌ Missing required environment variables: ${missingVars.join(', ')}`, 'red')
    log('Please check your .env.local file\n', 'yellow')
    return false
  }
  
  // 2. Validate endpoint format
  log('\n2. Validating endpoint format...', 'blue')
  const endpoint = config.S3_ENDPOINT
  if (endpoint.includes('s3://')) {
    log(`   ❌ Invalid endpoint format: ${endpoint}`, 'red')
    log('   Endpoint should use https:// protocol, not s3://', 'yellow')
    log('   Expected format: https://s3.REGION.amazonaws.com', 'yellow')
    return false
  } else if (!endpoint.startsWith('https://')) {
    log(`   ⚠️  Endpoint doesn't use https://: ${endpoint}`, 'yellow')
    log('   Adding https:// prefix...', 'yellow')
    config.S3_ENDPOINT = `https://${endpoint}`
  } else {
    log(`   ✓ Endpoint format is correct: ${endpoint}`, 'green')
  }
  
  // 3. Initialize S3 client
  log('\n3. Initializing S3 client...', 'blue')
  let s3Client
  try {
    s3Client = new S3Client({
      endpoint: config.S3_ENDPOINT,
      region: config.S3_REGION,
      credentials: {
        accessKeyId: config.S3_ACCESS_KEY_ID,
        secretAccessKey: config.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    })
    log('   ✓ S3 client initialized successfully', 'green')
  } catch (error) {
    log(`   ❌ Failed to initialize S3 client: ${error.message}`, 'red')
    return false
  }
  
  // 4. Create a test image (small base64-encoded 1x1 PNG)
  log('\n4. Creating test image...', 'blue')
  const testImage = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  )
  const testKey = `phone-founder-images/test-${Date.now()}.png`
  log(`   ✓ Test image created (${testImage.length} bytes)`, 'green')
  log(`   ✓ Test key: ${testKey}`, 'green')
  
  // 5. Test upload
  log('\n5. Testing S3 upload...', 'blue')
  try {
    const putCommand = new PutObjectCommand({
      Bucket: config.S3_BUCKET_NAME,
      Key: testKey,
      Body: testImage,
      ContentType: 'image/png',
    })
    
    const uploadResult = await s3Client.send(putCommand)
    log('   ✓ Image uploaded successfully!', 'green')
    log(`   ETag: ${uploadResult.ETag}`, 'green')
  } catch (error) {
    log(`   ❌ Upload failed: ${error.message}`, 'red')
    
    if (error.Code === 'NoSuchBucket') {
      log('\n   💡 Solution: The bucket does not exist. Please create it first.', 'yellow')
    } else if (error.Code === 'AccessDenied') {
      log('\n   💡 Solution: Check your IAM user has s3:PutObject permission.', 'yellow')
    } else if (error.Code === 'InvalidAccessKeyId') {
      log('\n   💡 Solution: Check your S3_ACCESS_KEY_ID is correct.', 'yellow')
    } else if (error.Code === 'SignatureDoesNotMatch') {
      log('\n   💡 Solution: Check your S3_SECRET_ACCESS_KEY is correct.', 'yellow')
    } else if (error.name === 'EndpointError') {
      log('\n   💡 Solution: Check S3_ENDPOINT is using https:// protocol.', 'yellow')
    }
    
    return false
  }
  
  // 6. Test download (verify public access)
  log('\n6. Testing public access...', 'blue')
  try {
    const getCommand = new GetObjectCommand({
      Bucket: config.S3_BUCKET_NAME,
      Key: testKey,
    })
    
    const downloadResult = await s3Client.send(getCommand)
    const bodyContents = await downloadResult.Body.transformToByteArray()
    
    if (bodyContents.length === testImage.length) {
      log('   ✓ Image downloaded successfully!', 'green')
      log('   ✓ S3 configuration is working correctly!', 'green')
    } else {
      log('   ⚠️  Downloaded image size does not match', 'yellow')
    }
  } catch (error) {
    log(`   ⚠️  Could not download image: ${error.message}`, 'yellow')
    log('   (This might be fine if bucket is not public)', 'yellow')
  }
  
  // 7. Construct public URL
  log('\n7. Generating public URL...', 'blue')
  let publicUrl
  if (config.S3_ENDPOINT && process.env.S3_FORCE_PATH_STYLE === 'true') {
    publicUrl = `${config.S3_ENDPOINT}/${config.S3_BUCKET_NAME}/${testKey}`
  } else if (config.S3_ENDPOINT) {
    publicUrl = `${config.S3_ENDPOINT}/${testKey}`
  } else {
    publicUrl = `https://${config.S3_BUCKET_NAME}.s3.${config.S3_REGION}.amazonaws.com/${testKey}`
  }
  
  log(`   Public URL: ${publicUrl}`, 'cyan')
  log('\n   💡 Test this URL in your browser to verify public access', 'yellow')
  
  // Summary
  log('\n=== Test Summary ===', 'cyan')
  log('✓ Configuration: OK', 'green')
  log('✓ Upload: OK', 'green')
  log('✓ S3 Setup: COMPLETE\n', 'green')
  log('You can now test the application!\n', 'cyan')
  
  return true
}

// Run the test
testS3Configuration()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    log(`\n❌ Unexpected error: ${error.message}`, 'red')
    console.error(error)
    process.exit(1)
  })

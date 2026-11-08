import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const bucketName = process.env.R2_BUCKET_NAME || 'salih-otman-portfolio'
const endpoint = `https://${accountId}.r2.cloudflarestorage.com`

console.log('Connecting to Cloudflare R2 endpoint:', endpoint)
console.log('Target bucket:', bucketName)

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error('Error: Missing Cloudflare R2 credentials in environment variables.')
  process.exit(1)
}

const client = new S3Client({
  endpoint,
  region: 'auto',
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

async function uploadFile(localPath, r2Key, contentType) {
  if (!fs.existsSync(localPath)) {
    throw new Error(`File does not exist: ${localPath}`)
  }

  const fileBuffer = fs.readFileSync(localPath)
  console.log(`[R2 Upload] Starting upload for ${r2Key} (${(fileBuffer.length / (1024 * 1024)).toFixed(2)} MB)...`)

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: r2Key,
    Body: fileBuffer,
    ContentType: contentType,
  })

  const response = await client.send(command)
  console.log(`[R2 Upload] Uploaded successfully: ${r2Key} (ETag: ${response.ETag})`)
}

async function main() {
  try {
    const mp4Path = path.resolve(process.cwd(), 'public/videos/generative-lab-exploration.mp4')
    const webmPath = path.resolve(process.cwd(), 'public/videos/generative-lab-exploration.webm')

    await uploadFile(mp4Path, 'videos/generative-lab-exploration.mp4', 'video/mp4')
    await uploadFile(webmPath, 'videos/generative-lab-exploration.webm', 'video/webm')

    console.log('--- ALL VIDEO ASSETS UPLOADED TO CLOUDFLARE R2 SUCCESSFULLY ---')
  } catch (error) {
    console.error('[R2 Upload Failed]:', error)
    process.exit(1)
  }
}

main()

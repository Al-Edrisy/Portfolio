/**
 * Uploads the About-page demo video to Cloudflare R2.
 *
 * Filenames are versioned (-v2, -v3, ...) because /api/media serves objects with
 * `Cache-Control: immutable` for one year. Re-uploading under the same key would
 * leave visitors with a stale copy, so always bump the suffix when the video changes.
 *
 * Usage: node scripts/upload-video-r2.mjs
 */
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const accountId = process.env.R2_ACCOUNT_ID
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
const bucketName = process.env.R2_BUCKET_NAME || 'salih-otman-portfolio'

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error('Missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY in .env')
  process.exit(1)
}

const client = new S3Client({
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  region: 'auto',
  credentials: { accessKeyId, secretAccessKey },
})

const FILES = [
  {
    local: 'public/videos/generative-lab-exploration-v2.mp4',
    key: 'videos/generative-lab-exploration-v2.mp4',
    contentType: 'video/mp4',
  },
]

async function upload({ local, key, contentType }) {
  const filePath = path.resolve(process.cwd(), local)
  if (!fs.existsSync(filePath)) throw new Error(`Missing file: ${filePath}`)
  const body = fs.readFileSync(filePath)
  console.log(`[R2] Uploading ${key} (${(body.length / 1024 / 1024).toFixed(2)} MB)...`)
  const res = await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )
  console.log(`[R2] OK ${key} (ETag ${res.ETag})`)
}

try {
  for (const file of FILES) await upload(file)
  console.log('All assets uploaded to Cloudflare R2.')
} catch (error) {
  console.error('[R2] Upload failed:', error)
  process.exit(1)
}

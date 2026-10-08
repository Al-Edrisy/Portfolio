import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'

export interface StorageProviderInterface {
  upload(fileBuffer: Buffer, key: string, mimeType: string): Promise<string>
  delete(key: string): Promise<void>
  getPublicUrl(key: string): string
  exists(key: string): Promise<boolean>
}

export class CloudflareR2Provider implements StorageProviderInterface {
  private client: S3Client
  private bucketName: string
  private publicDomain: string

  constructor() {
    this.publicDomain = process.env.R2_PUBLIC_DOMAIN || ''
    this.bucketName = process.env.R2_BUCKET_NAME || 'salih-otman-portfolio'

    const accountId = process.env.R2_ACCOUNT_ID
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || ''
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || ''
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`

    this.client = new S3Client({
      endpoint,
      region: 'auto',
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    })
  }

  private getBucketName(): string {
    return process.env.R2_BUCKET_NAME || this.bucketName || 'salih-otman-portfolio'
  }

  async upload(fileBuffer: Buffer, key: string, mimeType: string): Promise<string> {
    const bucket = this.getBucketName()
    if (!bucket) {
      throw new Error('Storage configuration error: R2_BUCKET_NAME is not configured')
    }

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
    })

    await this.client.send(command)
    return this.getPublicUrl(key)
  }

  async delete(key: string): Promise<void> {
    const bucket = this.getBucketName()
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
    await this.client.send(command)
  }

  getPublicUrl(key: string): string {
    const cleanKey = key.startsWith('/') ? key.slice(1) : key
    if (this.publicDomain && !this.publicDomain.includes('.r2.cloudflarestorage.com')) {
      // Remove trailing slash if present in publicDomain
      const base = this.publicDomain.endsWith('/') ? this.publicDomain.slice(0, -1) : this.publicDomain
      return `${base}/${cleanKey}`
    }
    // Fallback to our Next.js API proxy to serve authorized assets directly
    return `/api/media/${cleanKey}`
  }

  async exists(key: string): Promise<boolean> {
    try {
      const bucket = this.getBucketName()
      const command = new HeadObjectCommand({
        Bucket: bucket,
        Key: key,
      })
      await this.client.send(command)
      return true
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false
      }
      throw error
    }
  }
}

// Export a default provider instance based on environment configuration
let activeProvider: StorageProviderInterface | null = null

export function getStorageProvider(): StorageProviderInterface {
  if (!activeProvider) {
    activeProvider = new CloudflareR2Provider()
  }
  return activeProvider
}

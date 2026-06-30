import { adminDb } from '@/lib/firebase/firebase-admin'
import { getStorageProvider } from './storage-provider'
import { MediaAsset, MediaAssetDocument } from '@/types'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'

export class MediaService {
  private static COLLECTION_NAME = 'media_assets'

  /**
   * Uploads a file buffer to storage and saves metadata in Firestore.
   */
  static async uploadMedia(
    fileBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    folder: string = 'media',
    metadata: {
      width?: number
      height?: number
      durationSeconds?: number
      altText?: string
      uploadedBy?: string
    } = {}
  ): Promise<MediaAsset> {
    const storageProvider = getStorageProvider()
    
    // Determine media type (image, video, document)
    let mediaType: 'image' | 'video' | 'document' = 'document'
    if (mimeType.startsWith('image/')) {
      mediaType = 'image'
    } else if (mimeType.startsWith('video/')) {
      mediaType = 'video'
    }

    // Generate clean keys
    const extension = originalFilename.split('.').pop() || 'bin'
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 9)
    const publicId = `med_${timestamp}_${randomId}`
    const objectKey = `${folder}/${publicId}.${extension}`

    // Upload to Cloudflare R2 (or other provider)
    const publicUrl = await storageProvider.upload(fileBuffer, objectKey, mimeType)

    // Save metadata to Firestore using Firebase Admin
    const docData: MediaAssetDocument = {
      url: publicUrl,
      publicId,
      storageProvider: 'cloudflare_r2',
      bucketName: process.env.R2_BUCKET_NAME || '',
      objectKey,
      originalFilename,
      mimeType,
      fileSize: fileBuffer.length,
      mediaType,
      width: metadata.width !== undefined ? metadata.width : null,
      height: metadata.height !== undefined ? metadata.height : null,
      durationSeconds: metadata.durationSeconds !== undefined ? metadata.durationSeconds : null,
      altText: metadata.altText || originalFilename,
      uploadedBy: metadata.uploadedBy || '',
      createdAt: Timestamp.now() as any,
      updatedAt: Timestamp.now() as any
    } as any

    const docRef = adminDb.collection(this.COLLECTION_NAME).doc()
    await docRef.set(docData)

    return {
      id: docRef.id,
      url: publicUrl,
      mediaType,
      mimeType,
      width: metadata.width,
      height: metadata.height,
      fileSize: fileBuffer.length,
      altText: docData.altText,
      uploadedBy: docData.uploadedBy,
      createdAt: new Date()
    }
  }

  /**
   * Retrieves a media asset by ID.
   */
  static async getMedia(mediaId: string): Promise<MediaAsset | null> {
    if (!mediaId) return null
    const docRef = adminDb.collection(this.COLLECTION_NAME).doc(mediaId)
    const docSnap = await docRef.get()
    
    if (!docSnap.exists) {
      return null
    }

    const data = docSnap.data() as MediaAssetDocument
    const storageProvider = getStorageProvider()
    const url = data.url || storageProvider.getPublicUrl(data.objectKey)

    return {
      id: docSnap.id,
      url,
      mediaType: data.mediaType,
      mimeType: data.mimeType,
      width: data.width,
      height: data.height,
      fileSize: data.fileSize,
      altText: data.altText,
      uploadedBy: data.uploadedBy,
      createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
    }
  }

  /**
   * Deletes a media asset by ID (both from storage and Firestore).
   */
  static async deleteMedia(mediaId: string): Promise<void> {
    if (!mediaId) return
    const docRef = adminDb.collection(this.COLLECTION_NAME).doc(mediaId)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return
    }

    const data = docSnap.data() as MediaAssetDocument
    const storageProvider = getStorageProvider()

    // Delete from storage
    try {
      await storageProvider.delete(data.objectKey)
    } catch (err) {
      console.error(`Failed to delete storage file with key ${data.objectKey}:`, err)
    }

    // Delete from database
    await docRef.delete()
  }
}

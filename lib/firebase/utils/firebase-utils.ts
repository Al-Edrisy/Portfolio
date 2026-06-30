// Utility functions for Firebase operations
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  DocumentSnapshot,
  QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from '../../firebase'
import {
  Project,
  Reaction,
  Comment,
  User,
  ProjectDocument,
  ReactionDocument,
  CommentDocument,
  UserDocument,
  ReactionType,
  MediaAsset
} from '@/types'

// Collection names
export const COLLECTIONS = {
  PROJECTS: 'projects',
  REACTIONS: 'reactions',
  COMMENTS: 'comments',
  USERS: 'users',
} as const

// Convert Firestore timestamp to Date
export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate()
}

// Convert Date to Firestore timestamp
export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date)
}

/**
 * Fetch a single MediaAsset from Firestore
 */
export const getMediaAsset = async (mediaId: string): Promise<MediaAsset | null> => {
  if (!mediaId) return null
  try {
    const mediaDoc = await getDoc(doc(db, 'media_assets', mediaId))
    if (!mediaDoc.exists()) return null
    const data = mediaDoc.data()
    return {
      id: mediaDoc.id,
      url: data.url || '',
      mediaType: data.mediaType || 'image',
      mimeType: data.mimeType || 'image/jpeg',
      width: data.width,
      height: data.height,
      fileSize: data.fileSize || 0,
      altText: data.altText,
      uploadedBy: data.uploadedBy,
      createdAt: data.createdAt ? data.createdAt.toDate() : new Date()
    }
  } catch (error) {
    console.error('Error fetching media asset:', error)
    return null
  }
}

/**
 * Fetch multiple MediaAssets from Firestore
 */
export const getMediaAssets = async (mediaIds: string[]): Promise<MediaAsset[]> => {
  if (!mediaIds || mediaIds.length === 0) return []
  try {
    const assets = await Promise.all(mediaIds.map(id => getMediaAsset(id)))
    return assets.filter((asset): asset is MediaAsset => asset !== null)
  } catch (error) {
    console.error('Error fetching media assets:', error)
    return []
  }
}

/**
 * Resolves project media assets asynchronously
 */
export const resolveProjectMedia = async (project: Project): Promise<Project> => {
  const resolved = { ...project }
  
  if (project.thumbnailMediaId) {
    const thumb = await getMediaAsset(project.thumbnailMediaId)
    if (thumb) {
      resolved.thumbnail = thumb
      resolved.image = thumb.url
      if (!resolved.images) {
        resolved.images = [thumb.url]
      } else {
        resolved.images = [thumb.url, ...resolved.images.slice(1)]
      }
    }
  }
  
  if (project.galleryMediaIds && project.galleryMediaIds.length > 0) {
    const gallery = await getMediaAssets(project.galleryMediaIds)
    resolved.gallery = gallery
    const galleryUrls = gallery.map(g => g.url)
    resolved.images = resolved.thumbnail ? [resolved.thumbnail.url, ...galleryUrls] : galleryUrls
  }
  
  if (project.videoMediaId) {
    const vid = await getMediaAsset(project.videoMediaId)
    if (vid) {
      resolved.video = vid
      resolved.videoUrl = vid.url
    }
  }
  
  return resolved
}

// Convert Firestore document to Project
// Normalizes images from Firestore structure to flat array for UI consumption
// Handles backward compatibility with legacy single-image projects
const sanitizeR2Url = (url: string | undefined | null): string => {
  if (!url) return ''
  if (url.includes('.r2.cloudflarestorage.com')) {
    const matches = url.match(/https?:\/\/[^\/]+\/(.+)$/)
    if (matches && matches[1]) {
      return `/api/media/${matches[1]}`
    }
  }
  return url
}

export const docToProject = (doc: QueryDocumentSnapshot): Project => {
  const data = doc.data() as ProjectDocument

  // Normalize images: convert Firestore { cover, gallery } structure to flat array
  // First image is always the cover, followed by gallery images
  const normalizeImages = (): string[] => {
    // If new images structure exists with cover or gallery
    if (data.images) {
      const images: string[] = []
      if (data.images.cover) {
        images.push(sanitizeR2Url(data.images.cover))
      }
      if (data.images.gallery && Array.isArray(data.images.gallery)) {
        // Filter out cover from gallery to avoid duplicates if it's already there
        const galleryImages = data.images.gallery
          .filter(img => img !== data.images!.cover)
          .map(img => sanitizeR2Url(img));
        images.push(...galleryImages)
      }
      if (images.length > 0) {
        return images
      }
    }

    // Fall back to legacy single image field
    if (data.image) {
      return [sanitizeR2Url(data.image)]
    }

    return []
  }

  const images = normalizeImages()

  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    thumbnailMediaId: data.thumbnailMediaId,
    galleryMediaIds: data.galleryMediaIds,
    videoMediaId: data.videoMediaId,
    // Legacy field: use cover from images structure, or legacy image field
    image: sanitizeR2Url(data.images?.cover || data.image || ''),
    // New images array: normalized flat array for UI consumption
    images: images.length > 0 ? images : undefined,
    // Video URL (YouTube, Vimeo, LinkedIn, Facebook, Twitter/X, or direct)
    videoUrl: sanitizeR2Url(data.videoUrl),
    tech: data.tech,
    categories: data.categories || [],
    category: data.category,
    link: data.link || '',
    github: data.github || '',
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    published: data.published,
    authorId: data.authorId,
    authorName: data.authorName || 'Unknown Author',
    authorAvatar: data.authorAvatar,
    reactionsCount: data.reactionsCount || {} as Record<ReactionType, number>,
    commentsCount: data.commentsCount || 0,
    viewsCount: data.viewsCount || 0,
    sharesCount: data.sharesCount || 0,
    documents: (data.documents || []).map((d: any) => ({
      ...d,
      url: sanitizeR2Url(d.url)
    })),
    documentsMediaIds: data.documentsMediaIds || [],
  }
}

// Convert Firestore document to Reaction
export const docToReaction = (doc: QueryDocumentSnapshot): Reaction => {
  const data = doc.data() as ReactionDocument
  return {
    id: doc.id,
    projectId: data.projectId,
    userId: data.userId,
    type: data.type,
    createdAt: timestampToDate(data.createdAt),
  }
}

// Convert Firestore document to Comment
export const docToComment = async (docSnapshot: QueryDocumentSnapshot): Promise<Comment> => {
  const data = docSnapshot.data() as CommentDocument

  // Get user data
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, data.userId))
  const userData = userDoc.exists() ? userDoc.data() as UserDocument : null

  return {
    id: docSnapshot.id,
    projectId: data.projectId,
    userId: data.userId,
    content: data.content,
    parentCommentId: data.parentCommentId,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
    likes: data.likes,
    repliesCount: data.repliesCount,
    user: {
      name: userData?.name || 'Unknown User',
      avatar: userData?.avatar || '',
    },
  }
}

// Convert Firestore document to User
export const docToUser = (doc: QueryDocumentSnapshot): User => {
  const data = doc.data() as UserDocument
  return {
    id: doc.id,
    email: data.email,
    name: data.name,
    avatar: data.avatar,
    avatarMediaId: data.avatarMediaId,
    role: data.role,
    createdAt: timestampToDate(data.createdAt),
  }
}

/**
 * Resolves user avatar media asset asynchronously
 */
export const resolveUserMedia = async (user: User): Promise<User> => {
  const resolved = { ...user }
  if (user.avatarMediaId) {
    const avatar = await getMediaAsset(user.avatarMediaId)
    if (avatar) {
      resolved.avatarMedia = avatar
      resolved.avatar = avatar.url
    }
  }
  return resolved
}

// Get project by ID with reactions and comments count
export const getProjectById = async (projectId: string): Promise<Project | null> => {
  try {
    const projectDoc = await getDoc(doc(db, COLLECTIONS.PROJECTS, projectId))

    if (!projectDoc.exists()) {
      return null
    }

    const project = docToProject(projectDoc as QueryDocumentSnapshot)
    const resolvedProject = await resolveProjectMedia(project)

    // Get reactions count
    const reactionsSnapshot = await getDocs(
      query(collection(db, COLLECTIONS.REACTIONS), where('projectId', '==', projectId))
    )

    const reactionsCount = reactionsSnapshot.docs.reduce((acc, reactionDoc) => {
      const type = reactionDoc.data().type as ReactionType
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<ReactionType, number>)

    // Get comments count
    const commentsSnapshot = await getDocs(
      query(collection(db, COLLECTIONS.COMMENTS), where('projectId', '==', projectId))
    )

    return {
      ...resolvedProject,
      reactionsCount,
      commentsCount: commentsSnapshot.size,
    }
  } catch (error) {
    console.error('Error getting project by ID:', error)
    return null
  }
}

// Get project with reactions and comments count (alias for compatibility)
export const getProjectWithCounts = getProjectById

// Get user by ID
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId))

    if (!userDoc.exists()) {
      return null
    }

    const user = docToUser(userDoc as QueryDocumentSnapshot)
    return resolveUserMedia(user)
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

// Check if user is admin
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const user = await getUserById(userId)
    return user?.role === 'developer' || false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

// Get paginated projects
export const getPaginatedProjects = async (
  pageSize: number = 10,
  lastDoc?: QueryDocumentSnapshot
): Promise<{ projects: Project[], lastDoc: QueryDocumentSnapshot | null }> => {
  try {
    let q = query(
      collection(db, COLLECTIONS.PROJECTS),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    )

    if (lastDoc) {
      q = query(q, startAfter(lastDoc))
    }

    const snapshot = await getDocs(q)
    const projects = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const project = docToProject(doc)
        const resolvedProject = await resolveProjectMedia(project)

        // Get reactions count
        const reactionsSnapshot = await getDocs(
          query(collection(db, COLLECTIONS.REACTIONS), where('projectId', '==', doc.id))
        )

        const reactionsCount = reactionsSnapshot.docs.reduce((acc, reactionDoc) => {
          const type = reactionDoc.data().type as ReactionType
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {} as Record<ReactionType, number>)

        // Get comments count
        const commentsSnapshot = await getDocs(
          query(collection(db, COLLECTIONS.COMMENTS), where('projectId', '==', doc.id))
        )

        return {
          ...resolvedProject,
          reactionsCount,
          commentsCount: commentsSnapshot.size,
        }
      })
    )

    return {
      projects,
      lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
    }
  } catch (error) {
    console.error('Error getting paginated projects:', error)
    return { projects: [], lastDoc: null }
  }
}

// Error handling utility
export const handleFirebaseError = (error: any): string => {
  if (error.code) {
    switch (error.code) {
      case 'permission-denied':
        return 'You do not have permission to perform this action.'
      case 'not-found':
        return 'The requested resource was not found.'
      case 'already-exists':
        return 'This resource already exists.'
      case 'invalid-argument':
        return 'Invalid data provided.'
      case 'unauthenticated':
        return 'You must be signed in to perform this action.'
      default:
        return `An error occurred: ${error.message}`
    }
  }
  return error.message || 'An unexpected error occurred.'
}

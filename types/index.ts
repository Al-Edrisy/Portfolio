// Type definitions for the portfolio projects system
import { User as FirebaseUser } from 'firebase/auth'
import { Timestamp } from 'firebase/firestore'

export interface TechStackItem {
  id: string
  name: string
  slug: string
  category: 'frontend' | 'mobile' | 'backend' | 'database' | 'devops' | 'design' | 'other'
  logoMediaId: string
  officialUrl?: string
  displayOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface TechStackItemDocument {
  name: string
  slug: string
  category: 'frontend' | 'mobile' | 'backend' | 'database' | 'devops' | 'design' | 'other'
  logoMediaId: string
  officialUrl?: string
  displayOrder: number
  createdAt: Timestamp
  updatedAt: Timestamp
}


// Export AI-related types
export type {
  CommentTone,
  CommentToneConfig,
  AICommentGenerateRequest,
  AICommentGenerateResponse,
  AIRateLimitInfo,
  AIGenerationError,
  AIGenerationErrorResponse
} from './ai'

export type ProjectCategory = string

export interface MediaAsset {
  id: string
  url: string
  mediaType: 'image' | 'video' | 'document'
  mimeType: string
  width?: number
  height?: number
  fileSize: number
  altText?: string
  uploadedBy?: string
  createdAt: Date
}

export interface Project {
  id: string
  title: string
  description: string
  thumbnailMediaId?: string
  thumbnail?: MediaAsset
  galleryMediaIds?: string[]
  gallery?: MediaAsset[]
  videoMediaId?: string
  video?: MediaAsset
  image?: string // Legacy field - kept for backward compatibility
  images?: string[] // Array of image URLs - first is cover, rest are gallery
  videoUrl?: string // Video URL (YouTube, Vimeo, LinkedIn, Facebook, Twitter/X, or direct)
  tech: string[]
  categories: ProjectCategory[] // Support multiple categories
  category?: ProjectCategory // Deprecated: Keep for backward compatibility
  link: string
  github: string
  createdAt: Date
  updatedAt: Date
  published: boolean
  featured?: boolean
  authorId: string
  authorName: string
  authorAvatar?: string
  reactionsCount: Record<ReactionType, number>
  commentsCount: number
  viewsCount?: number
  sharesCount?: number
  documents?: { name: string; url: string; type: 'srs' | 'erd' | 'readme' | 'mermaid' | 'other' }[]
  documentsMediaIds?: string[]
}

export interface Reaction {
  id: string
  projectId: string
  userId: string
  type: ReactionType
  createdAt: Date
}

export interface Comment {
  id: string
  projectId: string
  userId: string
  content: string
  parentCommentId?: string // For nested replies
  createdAt: Date
  updatedAt: Date
  likes: number
  repliesCount: number
  user: {
    name: string
    avatar: string
  }
  userLikes?: string[] // Array of user IDs who liked the comment
}

export type UserRole = 'admin' | 'user' | 'developer' | 'client'

export interface User {
  id: string
  email: string
  name: string
  avatar: string
  avatarMediaId?: string
  avatarMedia?: MediaAsset
  role: UserRole
  createdAt: Date
}

export interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  role: UserRole
  bio?: string
  website?: string
  github?: string
  linkedin?: string
  twitter?: string
  location?: string
  skills?: string[]
  interests?: string[]
  projectsCount?: number
  commentsCount?: number
  reactionsGiven?: number
  reactionsReceived?: number
  viewsCount?: number
  createdAt: Date
  updatedAt: Date
  lastActiveAt: Date
  preferences: {
    theme: 'system' | 'light' | 'dark'
    notifications: {
      email: boolean
      comments: boolean
      reactions: boolean
      projects: boolean
    }
    privacy: {
      showEmail: boolean
      showLocation: boolean
      showStats: boolean
    }
  }
}

export interface Feedback {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  userAvatarMediaId?: string
  userAvatarMedia?: MediaAsset
  userEmail: string
  rating: number // 1-6 stars
  comment: string
  projectId?: string
  projectTitle?: string
  approved: boolean
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface FeedbackFormData {
  rating: number
  comment: string
  projectId?: string
}

// 8 popular reaction types as requested
export type ReactionType =
  | 'like'    // 👍 ThumbsUp
  | 'love'    // ❤️ Heart
  | 'fire'    // 🔥 Zap
  | 'wow'     // 😮 Smile
  | 'laugh'   // 😂 Smile
  | 'idea'    // 💡 Lightbulb
  | 'rocket'  // 🚀 Rocket
  | 'clap'    // 👏 Clap

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Firebase document interfaces (for Firestore)
export interface MediaAssetDocument {
  url: string
  publicId: string
  storageProvider: 'cloudflare_r2' | 's3' | 'local'
  bucketName: string
  objectKey: string
  originalFilename: string
  mimeType: string
  fileSize: number
  width?: number
  height?: number
  durationSeconds?: number
  mediaType: 'image' | 'video' | 'document'
  altText?: string
  uploadedBy?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ProjectDocument {
  title: string
  description: string
  thumbnailMediaId?: string
  galleryMediaIds?: string[]
  videoMediaId?: string
  // Legacy single image field - kept for backward compatibility
  image?: string
  // New structured images field
  images?: {
    cover: string        // Main cover image URL
    gallery: string[]    // Additional images for gallery (max 10)
    thumbnails: string[] // Optimized thumbnails for performance
  }
  // Video URL (YouTube, Vimeo, LinkedIn, Facebook, Twitter/X, or direct)
  videoUrl?: string
  tech: string[]
  categories: ProjectCategory[] // Support multiple categories
  category?: ProjectCategory // Deprecated: Keep for backward compatibility
  link: string
  github: string
  createdAt: Timestamp
  updatedAt: Timestamp
  published: boolean
  featured?: boolean
  authorId: string
  authorName?: string
  authorAvatar?: string
  reactionsCount?: Record<ReactionType, number>
  commentsCount?: number
  viewsCount?: number
  sharesCount?: number
  documents?: { name: string; url: string; type: 'srs' | 'erd' | 'readme' | 'mermaid' | 'other' }[]
  documentsMediaIds?: string[]
}

export interface ReactionDocument {
  projectId: string
  userId: string
  type: ReactionType
  createdAt: Timestamp
}

export interface CommentDocument {
  projectId: string
  userId: string
  content: string
  parentCommentId?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  likes: number
  userLikes?: string[]
  repliesCount: number
}

export interface UserDocument {
  email: string
  name: string
  avatar: string
  avatarMediaId?: string
  role: UserRole
  createdAt: Timestamp
}

export interface FeedbackDocument {
  userId: string
  userName: string
  userAvatar?: string
  userAvatarMediaId?: string
  userEmail: string
  rating: number
  comment: string
  projectId?: string
  projectTitle?: string
  approved: boolean
  featured: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form types
export interface ProjectFormData {
  title: string
  slug: string
  description: string
  thumbnailMediaId?: string
  galleryMediaIds?: string[]
  videoMediaId?: string
  image?: string // Legacy field
  images?: string[] // Array of image URLs
  videoUrl?: string // Video URL (YouTube, Vimeo, LinkedIn, Facebook, Twitter/X, or direct)
  longDescription?: string
  challenges?: string
  solutions?: string
  results?: string
  features?: string[]
  tech: string[]
  categories: ProjectCategory[] // Support multiple categories
  category?: ProjectCategory // Deprecated: Keep for backward compatibility
  link: string
  github: string
  published: boolean
  featured?: boolean
  documents?: { name: string; url: string; type: 'srs' | 'erd' | 'readme' | 'mermaid' | 'other' }[]
  documentsMediaIds?: string[]
}

export interface CommentFormData {
  content: string
  parentCommentId?: string
}

// Filter and search types
export interface ProjectFilters {
  categories?: ProjectCategory[] // Support filtering by multiple categories
  category?: ProjectCategory // Deprecated: Keep for backward compatibility
  search?: string
  published?: boolean
}

export interface ProjectSortOptions {
  field: 'createdAt' | 'updatedAt' | 'title' | 'category'
  direction: 'asc' | 'desc'
}

// Statistics types
export interface ProjectStats {
  totalProjects: number
  publishedProjects: number
  draftProjects: number
  totalReactions: number
  totalComments: number
  mostPopularCategory: string
  recentActivity: {
    date: Date
    projects: number
    reactions: number
    comments: number
  }[]
}

// Error types
export interface FirebaseError {
  code: string
  message: string
  details?: any
}

// Auth context types
export interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
  isDeveloper: boolean
}

// Hook return types
export interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
}

export interface UseProjectReactionsReturn {
  reactions: Reaction[]
  loading: boolean
  addReaction: (type: ReactionType) => Promise<void>
  removeReaction: (reactionId: string) => Promise<void>
  userReactions: Reaction[]
}

export interface UseProjectCommentsReturn {
  comments: Comment[]
  loading: boolean
  addComment: (content: string, parentCommentId?: string) => Promise<void>
  updateComment: (commentId: string, content: string) => Promise<void>
  deleteComment: (commentId: string) => Promise<void>
}

// Contact messages for admin
export interface ContactMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  timestamp: Date
  read: boolean
  replied: boolean
  createdAt: string
}

export interface ContactMessageDocument {
  name: string
  email: string
  subject: string
  message: string
  timestamp: Timestamp
  read: boolean
  replied: boolean
  createdAt: string
}


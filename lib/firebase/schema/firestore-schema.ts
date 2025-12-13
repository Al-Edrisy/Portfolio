/**
 * Firestore Collections Schema Definition
 * 
 * This file defines the structure of our Firestore collections
 * Collections are created automatically when first document is written
 * But having a schema helps with development and documentation
 */

import { Timestamp } from 'firebase/firestore'
import { ReactionType } from '@/constants/reaction-types'

// ============================================================================
// PROJECTS COLLECTION
// ============================================================================
export interface ProjectDocument {
  // Core project data
  title: string
  description: string
  longDescription?: string
  
  // Image management
  images: {
    cover: string        // Main cover image URL
    gallery: string[]    // Additional images for gallery (max 10)
    thumbnails: string[] // Optimized thumbnails for performance
  }
  
  // Video URL (YouTube, Vimeo, LinkedIn, Facebook, Twitter/X, or direct mp4/webm)
  videoUrl?: string
  
  // Project metadata
  tech: string[]         // Technology stack (max 20 items)
  category: string       // Project category
  link?: string         // Live project URL
  github?: string       // GitHub repository URL
  
  // Timeline (optional)
  startDate?: Timestamp
  endDate?: Timestamp
  
  // Status and visibility
  published: boolean
  featured: boolean     // Featured projects shown first
  
  // Author information
  authorId: string
  authorName: string
  authorAvatar?: string
  
  // Denormalized counters for performance
  commentsCount: number
  reactionsCount: Record<ReactionType, number>
  totalReactions: number
  viewsCount: number
  sharesCount: number
  
  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt?: Timestamp
}

// ============================================================================
// COMMENTS COLLECTION
// ============================================================================
export interface CommentDocument {
  // Comment identification
  projectId: string
  
  // Comment content
  content: string
  parentCommentId?: string // For nested replies (max depth: 3)
  
  // Author information
  userId: string
  userDisplayName: string
  userAvatar?: string
  userRole: 'developer' | 'client'
  
  // Comment metadata
  depth: number // 0 for top-level, 1 for replies, etc.
  repliesCount: number
  likesCount: number
  
  // User interactions (denormalized for performance)
  userLikes: string[] // Array of user IDs who liked this comment
  
  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
  
  // Soft delete support
  deleted: boolean
  deletedAt?: Timestamp
  deletedBy?: string
}

// ============================================================================
// REACTIONS COLLECTION
// ============================================================================
export interface ReactionDocument {
  // Reaction identification
  projectId: string
  userId: string
  type: ReactionType
  
  // Timestamps
  createdAt: Timestamp
  
  // Compound index: projectId + userId + type (unique)
  // This allows one reaction per user per project per type
}

// ============================================================================
// USERS COLLECTION
// ============================================================================
export interface UserDocument {
  // Firebase Auth integration
  uid: string // Matches Firebase Auth UID
  
  // Profile information
  email: string
  displayName: string
  avatar?: string
  
  // User type (as requested)
  role: 'developer' | 'client'
  
  // Profile metadata
  bio?: string
  website?: string
  location?: string
  
  // Activity tracking
  projectsCount: number
  commentsCount: number
  reactionsGiven: number
  
  // Timestamps
  createdAt: Timestamp
  lastActiveAt: Timestamp
  
  // Preferences
  notifications: {
    newComments: boolean
    newReactions: boolean
    projectUpdates: boolean
  }
}

// ============================================================================
// ANALYTICS COLLECTION (Admin Only)
// ============================================================================
export interface AnalyticsDocument {
  // Analytics identification
  type: 'project' | 'user' | 'system'
  entityId: string
  
  // Metrics
  metrics: {
    views?: number
    reactions?: number
    comments?: number
    shares?: number
  }
  
  // Time-based data
  date: string // YYYY-MM-DD format
  hour?: number // 0-23 for hourly analytics
  
  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ============================================================================
// FEEDBACK COLLECTION
// ============================================================================
export interface FeedbackDocument {
  // User identification
  userId: string
  userName: string
  userAvatar?: string
  userEmail: string
  
  // Feedback content
  rating: number // 1-6 stars
  comment: string
  projectId?: string // Optional: specific project reference
  projectTitle?: string // Denormalized for display
  
  // Status
  approved: boolean // For moderation
  featured: boolean // Highlight on home page
  
  // Timestamps
  createdAt: Timestamp
  updatedAt: Timestamp
}

// ============================================================================
// COLLECTION CONFIGURATIONS
// ============================================================================

export const COLLECTIONS = {
  PROJECTS: 'projects',
  COMMENTS: 'comments',
  REACTIONS: 'reactions',
  USERS: 'users',
  ANALYTICS: 'analytics',
  FEEDBACK: 'feedback'
} as const

// ============================================================================
// INDEX REQUIREMENTS
// ============================================================================

/**
 * Required Firestore Indexes (will be created automatically for simple queries)
 * Complex queries may need manual index creation in Firebase Console
 */
export const REQUIRED_INDEXES = {
  // Projects indexes
  projects: [
    { fields: ['published', 'createdAt'], order: ['published', 'createdAt'] },
    { fields: ['featured', 'createdAt'], order: ['featured', 'createdAt'] },
    { fields: ['category', 'published', 'createdAt'], order: ['category', 'published', 'createdAt'] },
    { fields: ['authorId', 'published', 'createdAt'], order: ['authorId', 'published', 'createdAt'] },
    { fields: ['published', 'totalReactions', 'createdAt'], order: ['published', 'totalReactions', 'createdAt'] }
  ],
  
  // Comments indexes
  comments: [
    { fields: ['projectId', 'deleted', 'createdAt'], order: ['projectId', 'deleted', 'createdAt'] },
    { fields: ['projectId', 'parentCommentId', 'createdAt'], order: ['projectId', 'parentCommentId', 'createdAt'] },
    { fields: ['userId', 'createdAt'], order: ['userId', 'createdAt'] }
  ],
  
  // Reactions indexes
  reactions: [
    { fields: ['projectId', 'type', 'createdAt'], order: ['projectId', 'type', 'createdAt'] },
    { fields: ['userId', 'projectId', 'type'], order: ['userId', 'projectId', 'type'] },
    { fields: ['projectId', 'userId', 'type'], order: ['projectId', 'userId', 'type'] }
  ],
  
  // Users indexes
  users: [
    { fields: ['role', 'createdAt'], order: ['role', 'createdAt'] },
    { fields: ['createdAt'], order: ['createdAt'] }
  ],
  
  // Feedback indexes
  feedback: [
    { fields: ['userId'], order: ['userId'] },
    { fields: ['approved', 'featured', 'createdAt'], order: ['approved', 'featured', 'createdAt'] },
    { fields: ['projectId', 'approved', 'createdAt'], order: ['projectId', 'approved', 'createdAt'] }
  ]
} as const

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const VALIDATION_RULES = {
  PROJECT: {
    title: { min: 1, max: 100 },
    description: { min: 1, max: 500 },
    longDescription: { max: 5000 },
    tech: { maxItems: 20 },
    images: { maxGallery: 10 },
    category: { required: true }
  },
  
  COMMENT: {
    content: { min: 1, max: 1000 },
    depth: { max: 3 }
  },
  
  USER: {
    displayName: { min: 1, max: 50 },
    bio: { max: 500 },
    website: { max: 200 }
  },
  
  FEEDBACK: {
    comment: { min: 10, max: 500 },
    rating: { min: 1, max: 6 }
  }
} as const

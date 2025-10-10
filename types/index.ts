// Type definitions for the portfolio projects system
import { User as FirebaseUser } from 'firebase/auth'

export interface Project {
  id: string
  title: string
  description: string
  image: string
  tech: string[]
  category: string
  link: string
  github: string
  createdAt: Date
  updatedAt: Date
  published: boolean
  authorId: string
  authorName: string
  authorAvatar?: string
  reactionsCount: Record<ReactionType, number>
  commentsCount: number
  viewsCount: number
  sharesCount?: number
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
}

export interface User {
  id: string
  email: string
  name: string
  avatar: string
  role: 'developer' | 'user'
  createdAt: Date
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
export interface ProjectDocument {
  title: string
  description: string
  image: string
  tech: string[]
  category: string
  link: string
  github: string
  createdAt: FirebaseFirestore.Timestamp
  updatedAt: FirebaseFirestore.Timestamp
  published: boolean
  authorId: string
}

export interface ReactionDocument {
  projectId: string
  userId: string
  type: ReactionType
  createdAt: FirebaseFirestore.Timestamp
}

export interface CommentDocument {
  projectId: string
  userId: string
  content: string
  parentCommentId?: string
  createdAt: FirebaseFirestore.Timestamp
  updatedAt: FirebaseFirestore.Timestamp
  likes: number
  repliesCount: number
}

export interface UserDocument {
  email: string
  name: string
  avatar: string
  role: 'developer' | 'user'
  createdAt: FirebaseFirestore.Timestamp
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
  description: string
  image: string
  tech: string[]
  category: string
  link: string
  github: string
  published: boolean
}

export interface CommentFormData {
  content: string
  parentCommentId?: string
}

// Filter and search types
export interface ProjectFilters {
  category?: string
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

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
  ReactionType 
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

// Convert Firestore document to Project
export const docToProject = (doc: QueryDocumentSnapshot): Project => {
  const data = doc.data() as ProjectDocument
  return {
    id: doc.id,
    title: data.title,
    description: data.description,
    image: data.images?.cover || data.image || '',
    tech: data.tech,
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
export const docToComment = async (doc: QueryDocumentSnapshot): Promise<Comment> => {
  const data = doc.data() as CommentDocument
  
  // Get user data
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, data.userId))
  const userData = userDoc.exists() ? userDoc.data() as UserDocument : null
  
  return {
    id: doc.id,
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
    role: data.role,
    createdAt: timestampToDate(data.createdAt),
  }
}

// Get project by ID with reactions and comments count
export const getProjectById = async (projectId: string): Promise<Project | null> => {
  try {
    const projectDoc = await getDoc(doc(db, COLLECTIONS.PROJECTS, projectId))
    
    if (!projectDoc.exists()) {
      return null
    }

    const project = docToProject(projectDoc as QueryDocumentSnapshot)
    
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
      ...project,
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

    return docToUser(userDoc as QueryDocumentSnapshot)
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

// Check if user is admin
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const user = await getUserById(userId)
    return user?.role === 'admin' || false
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
          ...project,
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

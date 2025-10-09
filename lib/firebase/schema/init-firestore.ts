/**
 * Firestore Initialization Script
 * 
 * This script helps initialize Firestore collections with proper structure
 * Run this when setting up the project or when you need to reset data
 */

import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  writeBatch,
  serverTimestamp,
  query,
  limit
} from 'firebase/firestore'
import { db } from '../../firebase'
import { COLLECTIONS, type ProjectDocument, type UserDocument } from './firestore-schema'
import { REACTION_TYPES } from '@/constants/reaction-types'

// ============================================================================
// INITIALIZATION FUNCTIONS
// ============================================================================

/**
 * Check if collections exist and have data
 */
export async function checkCollectionsExist(): Promise<{
  projects: boolean
  users: boolean
  comments: boolean
  reactions: boolean
}> {
  try {
    const [projectsSnapshot, usersSnapshot, commentsSnapshot, reactionsSnapshot] = await Promise.all([
      getDocs(query(collection(db, COLLECTIONS.PROJECTS), limit(1))),
      getDocs(query(collection(db, COLLECTIONS.USERS), limit(1))),
      getDocs(query(collection(db, COLLECTIONS.COMMENTS), limit(1))),
      getDocs(query(collection(db, COLLECTIONS.REACTIONS), limit(1)))
    ])

    return {
      projects: !projectsSnapshot.empty,
      users: !usersSnapshot.empty,
      comments: !commentsSnapshot.empty,
      reactions: !reactionsSnapshot.empty
    }
  } catch (error) {
    console.error('Error checking collections:', error)
    return {
      projects: false,
      users: false,
      comments: false,
      reactions: false
    }
  }
}

/**
 * Initialize sample user data
 */
export async function initSampleUsers(): Promise<void> {
  const batch = writeBatch(db)
  
  const sampleUsers: UserDocument[] = [
    {
      uid: 'sample-admin-uid',
      email: 'admin@portfolio.com',
      displayName: 'Portfolio Admin',
      avatar: '/placeholder-user.jpg',
      role: 'developer',
      bio: 'Portfolio administrator and developer',
      website: 'https://portfolio.com',
      location: 'Global',
      projectsCount: 0,
      commentsCount: 0,
      reactionsGiven: 0,
      createdAt: serverTimestamp() as any,
      lastActiveAt: serverTimestamp() as any,
      notifications: {
        newComments: true,
        newReactions: true,
        projectUpdates: true
      }
    },
    {
      uid: 'sample-client-uid',
      email: 'client@example.com',
      displayName: 'Sample Client',
      avatar: '/placeholder-user.jpg',
      role: 'client',
      bio: 'Happy client who loves great projects',
      website: 'https://example.com',
      location: 'New York',
      projectsCount: 0,
      commentsCount: 0,
      reactionsGiven: 0,
      createdAt: serverTimestamp() as any,
      lastActiveAt: serverTimestamp() as any,
      notifications: {
        newComments: true,
        newReactions: false,
        projectUpdates: true
      }
    }
  ]

  sampleUsers.forEach(user => {
    const userRef = doc(db, COLLECTIONS.USERS, user.uid)
    batch.set(userRef, user)
  })

  await batch.commit()
  console.log('✅ Sample users initialized')
}

/**
 * Initialize sample project data
 */
export async function initSampleProjects(): Promise<void> {
  const batch = writeBatch(db)
  
  const sampleProjects: Omit<ProjectDocument, 'createdAt' | 'updatedAt'>[] = [
    {
      title: "AI-Powered E-Commerce Platform",
      description: "Full-stack e-commerce solution with AI-driven product recommendations and dynamic pricing.",
      longDescription: "A comprehensive e-commerce platform built with Next.js, featuring AI-powered product recommendations, dynamic pricing algorithms, and real-time analytics. The platform includes advanced search functionality, personalized user experiences, and seamless payment integration.",
      images: {
        cover: "/modern-ecommerce-dashboard-with-ai-analytics.jpg",
        gallery: [
          "/modern-ecommerce-dashboard-with-ai-analytics.jpg",
          "/analytics-dashboard.png"
        ],
        thumbnails: [
          "/modern-ecommerce-dashboard-with-ai-analytics.jpg"
        ]
      },
      tech: ["Next.js", "OpenAI", "Stripe", "PostgreSQL", "Tailwind CSS", "TypeScript"],
      category: "Full-Stack",
      link: "https://demo-ecommerce.com",
      github: "https://github.com/portfolio/ecommerce-platform",
      published: true,
      featured: true,
      authorId: "sample-admin-uid",
      authorName: "Portfolio Admin",
      authorAvatar: "/placeholder-user.jpg",
      commentsCount: 0,
      reactionsCount: {
        like: 0,
        love: 0,
        fire: 0,
        wow: 0,
        laugh: 0,
        idea: 0,
        rocket: 0,
        clap: 0
      },
      totalReactions: 0,
      viewsCount: 0,
      publishedAt: serverTimestamp() as any
    },
    {
      title: "Smart Content Management System",
      description: "CMS with AI content generation, automated SEO optimization, and real-time collaboration.",
      longDescription: "An intelligent content management system that leverages AI for content generation, automated SEO optimization, and real-time collaborative editing. Features include content scheduling, multi-user permissions, and advanced analytics.",
      images: {
        cover: "/content-management-system-interface-with-ai-featur.jpg",
        gallery: [
          "/content-management-system-interface-with-ai-featur.jpg",
          "/analytics-dashboard.png"
        ],
        thumbnails: [
          "/content-management-system-interface-with-ai-featur.jpg"
        ]
      },
      tech: ["React", "Langflow", "Firebase", "TypeScript", "Node.js"],
      category: "AI Integration",
      link: "https://demo-cms.com",
      github: "https://github.com/portfolio/smart-cms",
      published: true,
      featured: true,
      authorId: "sample-admin-uid",
      authorName: "Portfolio Admin",
      authorAvatar: "/placeholder-user.jpg",
      commentsCount: 0,
      reactionsCount: {
        like: 0,
        love: 0,
        fire: 0,
        wow: 0,
        laugh: 0,
        idea: 0,
        rocket: 0,
        clap: 0
      },
      totalReactions: 0,
      viewsCount: 0,
      publishedAt: serverTimestamp() as any
    },
    {
      title: "Real-Time Analytics Dashboard",
      description: "Interactive dashboard for business intelligence with live data visualization and predictive analytics.",
      longDescription: "A comprehensive analytics dashboard that provides real-time business intelligence through interactive data visualizations, predictive analytics, and customizable reporting. Features include drag-and-drop widgets, automated alerts, and multi-user dashboards.",
      images: {
        cover: "/analytics-dashboard.png",
        gallery: [
          "/analytics-dashboard.png",
          "/modern-ecommerce-dashboard-with-ai-analytics.jpg"
        ],
        thumbnails: [
          "/analytics-dashboard.png"
        ]
      },
      tech: ["Vue.js", "D3.js", "Node.js", "MongoDB", "WebSocket"],
      category: "Data Visualization",
      link: "https://demo-analytics.com",
      github: "https://github.com/portfolio/analytics-dashboard",
      published: true,
      featured: false,
      authorId: "sample-admin-uid",
      authorName: "Portfolio Admin",
      authorAvatar: "/placeholder-user.jpg",
      commentsCount: 0,
      reactionsCount: {
        like: 0,
        love: 0,
        fire: 0,
        wow: 0,
        laugh: 0,
        idea: 0,
        rocket: 0,
        clap: 0
      },
      totalReactions: 0,
      viewsCount: 0,
      publishedAt: serverTimestamp() as any
    }
  ]

  sampleProjects.forEach((project, index) => {
    const projectRef = doc(collection(db, COLLECTIONS.PROJECTS))
    const projectWithTimestamps = {
      ...project,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    batch.set(projectRef, projectWithTimestamps)
  })

  await batch.commit()
  console.log('✅ Sample projects initialized')
}

/**
 * Initialize Firestore with sample data
 */
export async function initializeFirestore(): Promise<void> {
  try {
    console.log('🚀 Initializing Firestore collections...')
    
    // Check what already exists
    const existing = await checkCollectionsExist()
    console.log('📊 Existing collections:', existing)
    
    // Initialize users if needed
    if (!existing.users) {
      console.log('👥 Initializing users...')
      await initSampleUsers()
    }
    
    // Initialize projects if needed
    if (!existing.projects) {
      console.log('📁 Initializing projects...')
      await initSampleProjects()
    }
    
    console.log('✅ Firestore initialization complete!')
    console.log('📝 Collections will be created automatically when first document is written')
    
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error)
    throw error
  }
}

/**
 * Clear all collections (use with caution!)
 */
export async function clearAllCollections(): Promise<void> {
  console.warn('⚠️ This will delete ALL data from Firestore!')
  console.warn('⚠️ Only use this in development environment!')
  
  // This is a destructive operation - implement carefully
  // In production, you'd want additional safety checks
}

// ============================================================================
// DEVELOPMENT HELPERS
// ============================================================================

/**
 * Get collection statistics
 */
export async function getCollectionStats(): Promise<{
  projects: number
  users: number
  comments: number
  reactions: number
}> {
  try {
    const [projectsSnapshot, usersSnapshot, commentsSnapshot, reactionsSnapshot] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.PROJECTS)),
      getDocs(collection(db, COLLECTIONS.USERS)),
      getDocs(collection(db, COLLECTIONS.COMMENTS)),
      getDocs(collection(db, COLLECTIONS.REACTIONS))
    ])

    return {
      projects: projectsSnapshot.size,
      users: usersSnapshot.size,
      comments: commentsSnapshot.size,
      reactions: reactionsSnapshot.size
    }
  } catch (error) {
    console.error('Error getting collection stats:', error)
    return {
      projects: 0,
      users: 0,
      comments: 0,
      reactions: 0
    }
  }
}

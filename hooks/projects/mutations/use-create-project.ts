"use client"

import { useState } from 'react'
import { collection, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ProjectFormData, Project } from '@/types'
import { COLLECTIONS } from '@/lib/firebase/utils'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

export function useCreateProject() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const createProject = async (projectData: ProjectFormData): Promise<Project | null> => {
    if (!user) {
      setError('User must be authenticated to create projects')
      toast({
        title: "Authentication Required",
        description: "Please sign in to create projects",
        variant: "destructive"
      })
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // Prepare project document for Firestore
      const projectDoc = {
        title: projectData.title,
        description: projectData.description,
        longDescription: projectData.longDescription || '',
        
        // Image structure
        images: {
          cover: projectData.image, // First image as cover
          gallery: projectData.images || [projectData.image], // All images including cover
          thumbnails: [projectData.image] // Optimized thumbnails (to be implemented)
        },
        
        tech: projectData.tech,
        category: projectData.category,
        link: projectData.link || '',
        github: projectData.github || '',
        
        // Status
        published: projectData.published,
        featured: false, // New projects are not featured by default
        
        // Author information
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatar,
        
        // Initialize counters
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
        sharesCount: 0,
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        publishedAt: projectData.published ? serverTimestamp() : null
      }

      // Add project to Firestore
      const docRef = await addDoc(collection(db, COLLECTIONS.PROJECTS), projectDoc)

      // Update user's project count
      if (user.id) {
        await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
          projectsCount: increment(1),
          lastActiveAt: serverTimestamp()
        })
      }

      // Create the Project object to return
      const newProject: Project = {
        id: docRef.id,
        title: projectData.title,
        description: projectData.description,
        image: projectData.image,
        tech: projectData.tech,
        category: projectData.category,
        link: projectData.link || '',
        github: projectData.github || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        published: projectData.published,
        authorId: user.id,
        reactionsCount: projectDoc.reactionsCount,
        commentsCount: 0
      }

      toast({
        title: "Project Created",
        description: `"${projectData.title}" has been ${projectData.published ? 'published' : 'saved as draft'}`,
      })

      return newProject

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create project'
      setError(errorMessage)
      
      toast({
        title: "Error Creating Project",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error creating project:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    createProject,
    loading,
    error
  }
}

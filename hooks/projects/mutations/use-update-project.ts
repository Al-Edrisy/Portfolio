"use client"

import { useState } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ProjectFormData, Project } from '@/types'
import { COLLECTIONS } from '@/lib/firebase/utils'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

export function useUpdateProject() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const updateProject = async (
    projectId: string,
    projectData: Partial<ProjectFormData>
  ): Promise<Project | null> => {
    if (!user) {
      setError('User must be authenticated to update projects')
      toast({
        title: "Authentication Required",
        description: "Please sign in to update projects",
        variant: "destructive"
      })
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId)

      // Prepare update data
      const updateData: any = {
        updatedAt: serverTimestamp()
      }

      // Update fields if provided
      if (projectData.title !== undefined) updateData.title = projectData.title
      if (projectData.description !== undefined) updateData.description = projectData.description
      if (projectData.longDescription !== undefined) updateData.longDescription = projectData.longDescription
      if (projectData.tech !== undefined) updateData.tech = projectData.tech
      if (projectData.categories !== undefined) {
        updateData.categories = projectData.categories
        updateData.category = projectData.categories[0] || '' // Keep legacy field in sync
      } else if (projectData.category !== undefined) {
        updateData.category = projectData.category // Legacy support
      }
      if (projectData.link !== undefined) updateData.link = projectData.link
      if (projectData.github !== undefined) updateData.github = projectData.github
      if (projectData.videoUrl !== undefined) {
        // If empty string, set to null to remove it
        updateData.videoUrl = projectData.videoUrl || null
      }

      // Handle images update
      if (projectData.image !== undefined || projectData.images !== undefined) {
        // Use dot notation for nested fields
        (updateData as any)['images.cover'] = projectData.image || projectData.images?.[0];
        (updateData as any)['images.gallery'] = projectData.images || [projectData.image];
        (updateData as any)['images.thumbnails'] = [projectData.image || projectData.images?.[0]];
      }

      // Handle published status
      if (projectData.published !== undefined) {
        updateData.published = projectData.published
        // If publishing for the first time, set publishedAt
        if (projectData.published) {
          updateData.publishedAt = serverTimestamp()
        }
      }

      // Update the document
      await updateDoc(projectRef, updateData)

      // Update user's last active timestamp
      if (user.id) {
        await updateDoc(doc(db, COLLECTIONS.USERS, user.id), {
          lastActiveAt: serverTimestamp()
        })
      }

      toast({
        title: "Project Updated",
        description: `"${projectData.title || 'Project'}" has been updated successfully`,
      })

      // Return updated project data (simplified for now)
      const updatedProject: Project = {
        id: projectId,
        title: projectData.title || '',
        description: projectData.description || '',
        image: projectData.image || '',
        videoUrl: projectData.videoUrl, // Include videoUrl in return
        tech: projectData.tech || [],
        categories: projectData.categories || [],
        category: projectData.categories?.[0] || projectData.category,
        link: projectData.link || '',
        github: projectData.github || '',
        createdAt: new Date(), // Would need to fetch from Firestore for accurate timestamp
        updatedAt: new Date(),
        published: projectData.published || false,
        authorId: user.id,
        authorName: user.name || 'Anonymous', // Added missing field
        viewsCount: 0, // Added missing field
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
        commentsCount: 0
      }

      return updatedProject

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update project'
      setError(errorMessage)

      toast({
        title: "Error Updating Project",
        description: errorMessage,
        variant: "destructive"
      })

      console.error('Error updating project:', err)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    updateProject,
    loading,
    error
  }
}

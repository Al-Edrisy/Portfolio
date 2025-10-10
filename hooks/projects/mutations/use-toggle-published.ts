"use client"

import { useState } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useToast } from '@/hooks/use-toast'

export function useTogglePublished() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const togglePublished = async (projectId: string, currentStatus: boolean) => {
    setLoading(true)
    
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        published: !currentStatus,
        updatedAt: serverTimestamp(),
        publishedAt: !currentStatus ? serverTimestamp() : null
      })

      toast({
        title: currentStatus ? "Project Unpublished" : "Project Published",
        description: currentStatus 
          ? "The project is now hidden from public view." 
          : "The project is now visible to everyone.",
      })

      return true
    } catch (error: any) {
      console.error('Error toggling published status:', error)
      toast({
        title: "Error",
        description: "Failed to update project status. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    togglePublished,
    loading,
  }
}

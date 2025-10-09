"use client"

import { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { User, UserProfile } from '@/types'
import { COLLECTIONS } from '@/lib/firebase/utils'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  // Load user profile
  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const userRef = doc(db, COLLECTIONS.USERS, user.id)
      const userDoc = await getDoc(userRef)

      if (userDoc.exists()) {
        const userData = userDoc.data()
        setProfile(userData as UserProfile)
      } else {
        // User document doesn't exist, create it
        await createUserProfile()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load user profile')
      console.error('Error loading user profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const createUserProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null

    try {
      const userProfile: UserProfile = {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        bio: '',
        website: '',
        github: '',
        linkedin: '',
        twitter: '',
        location: '',
        skills: [],
        interests: [],
        projectsCount: 0,
        commentsCount: 0,
        reactionsGiven: 0,
        reactionsReceived: 0,
        viewsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastActiveAt: new Date(),
        preferences: {
          theme: 'system',
          notifications: {
            email: true,
            comments: true,
            reactions: true,
            projects: true
          },
          privacy: {
            showEmail: false,
            showLocation: false,
            showStats: true
          }
        }
      }

      const userRef = doc(db, COLLECTIONS.USERS, user.id)
      await setDoc(userRef, {
        ...userProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastActiveAt: serverTimestamp()
      })

      setProfile(userProfile)
      return userProfile

    } catch (err: any) {
      setError(err.message || 'Failed to create user profile')
      console.error('Error creating user profile:', err)
      return null
    }
  }

  const updateUserProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user || !profile) {
      setError('User must be authenticated and profile must be loaded')
      toast({
        title: "Authentication Required",
        description: "Please sign in to update your profile",
        variant: "destructive"
      })
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const userRef = doc(db, COLLECTIONS.USERS, user.id)
      
      // Prepare update data (exclude computed fields)
      const updateData: any = {
        ...updates,
        updatedAt: serverTimestamp()
      }

      // Remove fields that shouldn't be updated directly
      delete updateData.id
      delete updateData.createdAt
      delete updateData.projectsCount
      delete updateData.commentsCount
      delete updateData.reactionsGiven
      delete updateData.reactionsReceived
      delete updateData.viewsCount

      await updateDoc(userRef, updateData)

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null)

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile'
      setError(errorMessage)
      
      toast({
        title: "Error Updating Profile",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error updating profile:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateUserPreferences = async (preferences: Partial<UserProfile['preferences']>): Promise<boolean> => {
    if (!user || !profile) {
      setError('User must be authenticated and profile must be loaded')
      return false
    }

    try {
      const userRef = doc(db, COLLECTIONS.USERS, user.id)
      
      await updateDoc(userRef, {
        preferences: {
          ...profile.preferences,
          ...preferences
        },
        updatedAt: serverTimestamp()
      })

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        preferences: {
          ...prev.preferences,
          ...preferences
        },
        updatedAt: new Date()
      } : null)

      toast({
        title: "Preferences Updated",
        description: "Your preferences have been updated successfully",
      })

      return true

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update preferences'
      setError(errorMessage)
      
      toast({
        title: "Error Updating Preferences",
        description: errorMessage,
        variant: "destructive"
      })
      
      console.error('Error updating preferences:', err)
      return false
    }
  }

  const updateLastActive = async (): Promise<void> => {
    if (!user) return

    try {
      const userRef = doc(db, COLLECTIONS.USERS, user.id)
      await updateDoc(userRef, {
        lastActiveAt: serverTimestamp()
      })
    } catch (err) {
      console.error('Error updating last active:', err)
    }
  }

  return {
    profile,
    loading,
    error,
    updateUserProfile,
    updateUserPreferences,
    updateLastActive,
    refreshProfile: loadProfile
  }
}

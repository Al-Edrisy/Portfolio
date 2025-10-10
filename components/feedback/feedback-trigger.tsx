"use client"

import React, { useState, useEffect } from 'react'
import { FeedbackFormDrawer } from './feedback-form-drawer'
import { useUserFeedbackStatus } from '@/hooks/feedback'
import { useAuth } from '@/contexts/auth-context'

interface FeedbackTriggerProps {
  /**
   * Scroll percentage at which to trigger the feedback drawer (0-100)
   * Default: 70 (70% of page scrolled)
   */
  triggerScrollPercentage?: number
}

export function FeedbackTrigger({ triggerScrollPercentage = 70 }: FeedbackTriggerProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [hasTriggered, setHasTriggered] = useState(false)
  const { hasSubmitted, loading } = useUserFeedbackStatus()
  const { user } = useAuth()

  useEffect(() => {
    // Don't show if user already submitted feedback or is not logged in
    if (loading || hasSubmitted || !user) {
      return
    }

    // Check if user has already seen the drawer in this session
    const hasSeenDrawer = sessionStorage.getItem('feedback-drawer-seen')
    if (hasSeenDrawer) {
      return
    }

    const handleScroll = () => {
      // Calculate scroll percentage
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = (scrollTop / docHeight) * 100

      // Trigger drawer when scroll percentage is reached and hasn't been triggered yet
      if (scrollPercent >= triggerScrollPercentage && !hasTriggered) {
        setHasTriggered(true)
        setDrawerOpen(true)
        // Mark as seen in session storage
        sessionStorage.setItem('feedback-drawer-seen', 'true')
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [triggerScrollPercentage, hasTriggered, hasSubmitted, loading, user])

  // Don't render anything if user already submitted or not logged in
  if (loading || hasSubmitted || !user) {
    return null
  }

  return (
    <FeedbackFormDrawer 
      open={drawerOpen} 
      onOpenChange={(open) => {
        setDrawerOpen(open)
        if (!open) {
          // Mark as seen when user closes the drawer
          sessionStorage.setItem('feedback-drawer-seen', 'true')
        }
      }} 
    />
  )
}


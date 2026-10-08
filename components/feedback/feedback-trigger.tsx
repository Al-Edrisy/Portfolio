"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { FeedbackFormDrawer } from './feedback-form-drawer'
import { useUserFeedbackStatus } from '@/hooks/feedback'
import { MessageSquarePlus, Star, X } from 'lucide-react'

interface FeedbackTriggerProps {
  /**
   * Scroll percentage at which to reveal the feedback pill (0-100)
   * Default: 40 (reveals floating pill smoothly after 40% scroll)
   */
  triggerScrollPercentage?: number
}

export function FeedbackTrigger({ triggerScrollPercentage = 40 }: FeedbackTriggerProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isPillVisible, setIsPillVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const { hasSubmitted, loading } = useUserFeedbackStatus()

  useEffect(() => {
    // Check if user already dismissed or submitted feedback
    if (typeof window === 'undefined') return
    const dismissed = sessionStorage.getItem('feedback-trigger-dismissed') === 'true'
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    const handleScroll = () => {
      if (isDismissed || hasSubmitted) return

      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) return

      const scrollPercent = (scrollTop / docHeight) * 100

      if (scrollPercent >= triggerScrollPercentage) {
        setIsPillVisible(true)
      } else {
        // Hide pill if scrolled back to the top
        setIsPillVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial scroll position

    return () => window.removeEventListener('scroll', handleScroll)
  }, [triggerScrollPercentage, isDismissed, hasSubmitted])

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDismissed(true)
    setIsPillVisible(false)
    sessionStorage.setItem('feedback-trigger-dismissed', 'true')
  }

  // Do not render anything if user already submitted feedback
  if (!loading && hasSubmitted) {
    return null
  }

  return (
    <>
      {/* Non-intrusive floating pill trigger */}
      <AnimatePresence>
        {isPillVisible && !isDismissed && !drawerOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 z-40 flex items-center gap-1.5"
          >
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-background/90 dark:bg-card/90 backdrop-blur-md border border-border/80 shadow-lg hover:shadow-xl hover:border-amber-400/50 hover:bg-card transition-all active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className="relative flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
              </div>
              <span className="text-xs sm:text-sm font-medium text-foreground tracking-tight">
                Leave Feedback
              </span>
            </button>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss feedback prompt"
              className="p-2 rounded-full bg-background/85 dark:bg-card/85 backdrop-blur-md border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all active:scale-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controlled Feedback Form Drawer */}
      <FeedbackFormDrawer 
        open={drawerOpen} 
        onOpenChange={(open) => {
          setDrawerOpen(open)
          if (!open) {
            // Pill stays available or hides gracefully
          }
        }} 
      />
    </>
  )
}

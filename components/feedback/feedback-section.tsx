"use client"

import React from 'react'
import { motion } from 'motion/react'
import { useFeedbackList } from '@/hooks/feedback'
import { AnimatedTooltip, AnimatedTooltipItem } from '@/components/ui/animated-tooltip'
import { Star, MessageSquare, Sparkles, Loader2, AlertCircle, Clock } from 'lucide-react'
import { Feedback } from '@/types'
import LoadingSpinner from '@/components/ui/loading-spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface FeedbackCardProps {
  feedback: Feedback
}

function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
    >
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <img
            src={feedback.userAvatar || '/placeholder-user.jpg'}
            alt={feedback.userName}
            className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
          />
        </div>

        {/* Feedback Content */}
        <div className="flex-1 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-foreground">{feedback.userName}</h4>
              {feedback.projectTitle && (
                <p className="text-xs text-muted-foreground">
                  About: <span className="text-primary">{feedback.projectTitle}</span>
                </p>
              )}
            </div>
            
            {/* Star Rating */}
            <div className="flex items-center gap-1">
              {Array.from({ length: feedback.rating }, (_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>

          {/* Comment */}
          <p className="text-sm text-muted-foreground leading-relaxed">
            {feedback.comment}
          </p>

          {/* Date */}
          <p className="text-xs text-muted-foreground">
            {new Date(feedback.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export function FeedbackSection() {
  const { feedbackList, loading, error } = useFeedbackList({ approvedOnly: true })

  // Don't show anything if loading or error - just hide the section
  if (loading || error || feedbackList.length === 0) {
    return null
  }

  // Show only the latest 7 feedbacks
  const latestFeedbacks = feedbackList.slice(0, 7)

  // Get unique users for AnimatedTooltip
  const uniqueUsers = latestFeedbacks
    .reduce((acc, feedback) => {
      if (!acc.find(u => u.userId === feedback.userId)) {
        acc.push(feedback)
      }
      return acc
    }, [] as Feedback[])

  const tooltipItems: AnimatedTooltipItem[] = uniqueUsers.map((feedback, index) => ({
    id: index,
    name: feedback.userName,
    designation: feedback.projectTitle 
      ? `Reviewed: ${feedback.projectTitle}` 
      : `${feedback.rating} ★ Rating`,
    image: feedback.userAvatar || '/placeholder-user.jpg'
  }))

  // Calculate average rating
  const averageRating = latestFeedbacks.reduce((sum, f) => sum + f.rating, 0) / latestFeedbacks.length

  return (
    <>
      {/* Feedback Overview Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Client Feedback
              </h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              See what others are saying about my work and experience
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center">
                  <span className="text-4xl font-bold text-primary">{averageRating.toFixed(1)}</span>
                  <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{latestFeedbacks.length}</div>
                <div className="text-sm text-muted-foreground">Recent Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{uniqueUsers.length}</div>
                <div className="text-sm text-muted-foreground">Happy Clients</div>
              </div>
            </div>

            {/* Animated Tooltip with User Avatars */}
            <div className="flex items-center justify-center">
              <AnimatedTooltip items={tooltipItems} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feedback Cards Grid */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestFeedbacks.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}


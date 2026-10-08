"use client"

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { useFeedbackList } from '@/hooks/feedback'
import { AnimatedTooltip, AnimatedTooltipItem } from '@/components/ui/animated-tooltip'
import { Star, MessageSquare, Sparkles } from 'lucide-react'
import { Feedback } from '@/types'
import { Button } from '@/components/ui/button'
import { FeedbackFormDrawer } from './feedback-form-drawer'
import { cn } from '@/lib/utils'

interface FeedbackCardProps {
  feedback: Feedback
}

function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      viewport={{ once: true }}
      className="bg-card/70 backdrop-blur-sm border border-border/60 rounded-2xl p-6 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group"
    >
      <div className="flex items-start gap-4">
        {/* User Avatar */}
        <div className="flex-shrink-0">
          <img
            src={feedback.userAvatar || '/placeholder-user.jpg'}
            alt={feedback.userName}
            className="w-11 h-11 rounded-full object-cover border-2 border-border/80 group-hover:border-primary/40 transition-colors"
          />
        </div>

        {/* Feedback Content */}
        <div className="flex-1 min-w-0 space-y-2.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-sm sm:text-base text-foreground leading-tight">
                {feedback.userName}
              </h4>
              {feedback.projectTitle && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Reviewed: <span className="text-primary font-medium">{feedback.projectTitle}</span>
                </p>
              )}
            </div>
            
            {/* 5-Star Rating */}
            <div className="flex items-center gap-0.5 shrink-0" aria-label={`${feedback.rating} out of 5 stars`}>
              {Array.from({ length: 5 }, (_, i) => {
                const isFilled = i < feedback.rating
                return (
                  <Star 
                    key={i} 
                    className={cn(
                      "w-3.5 h-3.5 transition-colors",
                      isFilled 
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]" 
                        : "fill-transparent text-muted-foreground/20"
                    )} 
                  />
                )
              })}
            </div>
          </div>

          {/* Comment */}
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {feedback.comment}
          </p>

          {/* Date */}
          <p className="text-[11px] text-muted-foreground/70 font-medium">
            {new Date(feedback.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
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
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Don't show anything if loading or error or no feedbacks
  if (loading || error || feedbackList.length === 0) {
    return null
  }

  // Show only the latest 6 feedbacks for grid symmetry
  const latestFeedbacks = feedbackList.slice(0, 6)

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
      : `${feedback.rating} / 5 Stars`,
    image: feedback.userAvatar || '/placeholder-user.jpg'
  }))

  // Calculate average rating (out of 5)
  const averageRating = latestFeedbacks.reduce((sum, f) => sum + f.rating, 0) / latestFeedbacks.length

  return (
    <>
      {/* Feedback Overview Section */}
      <section className="py-20 px-6 bg-muted/20 border-t border-border/40">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Testimonials & Reviews</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
              Client & Peer Feedback
            </h2>
            <p className="text-base text-muted-foreground max-w-xl mx-auto mb-8">
              Genuine reviews on collaboration, product quality, code craft, and delivery.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mb-8">
              <div className="text-center">
                <div className="flex items-center gap-1.5 justify-center">
                  <span className="text-3xl sm:text-4xl font-extrabold text-foreground">
                    {averageRating.toFixed(1)}
                  </span>
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                </div>
                <div className="text-xs text-muted-foreground mt-1">Average / 5.0</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-foreground">
                  {feedbackList.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Total Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-extrabold text-foreground">
                  {uniqueUsers.length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Contributors</div>
              </div>
            </div>

            {/* Avatars & CTA button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <div className="flex items-center">
                <AnimatedTooltip items={tooltipItems} />
              </div>
              <Button
                onClick={() => setDrawerOpen(true)}
                variant="outline"
                className="rounded-full px-5 py-2 text-xs sm:text-sm font-medium border-border/80 hover:border-amber-400/50 hover:bg-muted/60 transition-all shadow-sm active:scale-95"
              >
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-2" />
                Leave a Review
              </Button>
            </div>
          </motion.div>

          {/* Feedback Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {latestFeedbacks.map((feedback) => (
              <FeedbackCard key={feedback.id} feedback={feedback} />
            ))}
          </div>
        </div>
      </section>

      {/* Drawer */}
      <FeedbackFormDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  )
}

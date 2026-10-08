"use client"

import React, { useState, useEffect } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StarRating, RATING_MOODS } from './star-rating'
import { useSubmitFeedback } from '@/hooks/feedback'
import { useAuth } from '@/contexts/auth-context'
import { useProjects } from '@/hooks/projects/data/use-projects'
import { toast } from 'sonner'
import { Loader2, MessageSquareHeart, Sparkles } from 'lucide-react'

const FEEDBACK_TAGS = [
  "✨ Clean & polished UI",
  "⚡ Smooth animations",
  "🎯 Intuitive UX & flow",
  "🚀 Great architecture",
  "📱 Responsive on mobile",
]

interface FeedbackFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackFormDrawer({ open, onOpenChange }: FeedbackFormDrawerProps) {
  const { user, signInWithGoogle } = useAuth()
  const { submitFeedback, loading, error } = useSubmitFeedback()
  const { projects } = useProjects({ published: true })
  
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>()

  // Reset form when drawer closes
  useEffect(() => {
    if (!open) {
      setRating(5)
      setComment('')
      setSelectedProjectId(undefined)
    }
  }, [open])

  const handleAddTag = (tag: string) => {
    setComment((prev) => {
      const cleanPrev = prev.trim()
      if (!cleanPrev) return tag
      if (cleanPrev.includes(tag)) return cleanPrev
      return `${cleanPrev} • ${tag}`
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Please sign in to submit feedback')
      try {
        await signInWithGoogle()
      } catch (err) {
        console.error('Sign-in cancelled or failed', err)
      }
      return
    }

    if (comment.length < 10) {
      toast.error('Feedback must be at least 10 characters long')
      return
    }

    if (comment.length > 500) {
      toast.error('Feedback must be less than 500 characters')
      return
    }

    const result = await submitFeedback({
      rating,
      comment,
      projectId: selectedProjectId === 'none' ? undefined : selectedProjectId
    })

    if (result) {
      toast.success('Thank you for your valuable feedback! 🎉')
      onOpenChange(false)
    } else if (error) {
      toast.error(error)
    }
  }

  const currentMood = RATING_MOODS[rating]

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-w-lg mx-auto w-full max-h-[90vh] rounded-t-2xl sm:rounded-t-3xl border-t border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl flex flex-col focus:outline-none">
        <DrawerHeader className="px-6 pt-4 pb-2 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <MessageSquareHeart className="w-4 h-4" />
            </span>
            <DrawerTitle className="text-xl font-bold tracking-tight text-foreground">
              Share Your Feedback
            </DrawerTitle>
          </div>
          <DrawerDescription className="text-xs sm:text-sm text-muted-foreground">
            Your review helps me improve and shape better digital products.
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="overflow-y-auto px-6 py-2 space-y-5 flex-1">
            {/* User Auth Banner */}
            {user ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/50 text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={user.avatar || '/placeholder-user.jpg'}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-primary/20"
                  />
                  <div className="leading-tight">
                    <span className="font-medium text-foreground">{user.name}</span>
                    <span className="text-muted-foreground ml-1.5 text-[11px]">Posting verified review</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Verified
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>Sign in with Google to post your review</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await signInWithGoogle()
                    } catch {
                      toast.error('Failed to sign in with Google')
                    }
                  }}
                  className="h-7 text-xs border-amber-500/30 hover:bg-amber-500/10"
                >
                  Sign In
                </Button>
              </div>
            )}

            {/* Rating Section */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Rating <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center flex-wrap gap-3">
                <StarRating 
                  value={rating} 
                  onChange={setRating} 
                  maxStars={5}
                  size="lg"
                />
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {currentMood?.emoji} {currentMood?.label} ({rating}/5)
                </span>
              </div>
            </div>

            {/* Quick Feedback Chips */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Prompts
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {FEEDBACK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    className="text-xs px-2.5 py-1 rounded-full bg-secondary/60 hover:bg-secondary text-secondary-foreground border border-border/40 transition-colors active:scale-95"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Project Selection (Optional) */}
            <div className="space-y-1.5">
              <Label htmlFor="project" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Related Project <span className="font-normal lowercase text-[11px]">(optional)</span>
              </Label>
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger id="project" className="h-9 text-xs sm:text-sm">
                  <SelectValue placeholder="General Portfolio Feedback" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General Portfolio Feedback</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="comment" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Your Thoughts <span className="text-destructive">*</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  {comment.length}/500 {comment.length < 10 && `(min 10)`}
                </span>
              </div>
              <Textarea
                id="comment"
                placeholder="Share what impressed you, or suggestions on UI/UX, animations, features..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[105px] resize-none text-xs sm:text-sm"
                maxLength={500}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-2 rounded-lg text-xs">
                {error}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <DrawerFooter className="px-6 py-3 border-t border-border/40 mt-auto bg-background/80 backdrop-blur-md">
            <div className="flex items-center gap-3 w-full">
              <DrawerClose asChild>
                <Button variant="outline" type="button" className="flex-1 text-xs sm:text-sm">
                  Cancel
                </Button>
              </DrawerClose>
              <Button 
                type="submit" 
                disabled={loading || !comment || comment.length < 10 || !user}
                className="flex-1 font-medium shadow-sm active:scale-[0.98] transition-all text-xs sm:text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : !user ? (
                  'Sign In to Submit'
                ) : (
                  'Submit Feedback'
                )}
              </Button>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}

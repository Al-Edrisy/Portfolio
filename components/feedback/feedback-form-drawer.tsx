"use client"

import React, { useState, useEffect } from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StarRating } from './star-rating'
import { useSubmitFeedback } from '@/hooks/feedback'
import { useAuth } from '@/contexts/auth-context'
import { useProjects } from '@/hooks/projects/data/use-projects'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface FeedbackFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function FeedbackFormDrawer({ open, onOpenChange }: FeedbackFormDrawerProps) {
  const { user } = useAuth()
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Please sign in to submit feedback')
      return
    }

    if (comment.length < 10) {
      toast.error('Comment must be at least 10 characters long')
      return
    }

    if (comment.length > 500) {
      toast.error('Comment must be less than 500 characters')
      return
    }

    const result = await submitFeedback({
      rating,
      comment,
      projectId: selectedProjectId === 'none' ? undefined : selectedProjectId
    })

    if (result) {
      toast.success('Thank you for your feedback! 🎉')
      onOpenChange(false)
    } else if (error) {
      toast.error(error)
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-2xl">Share Your Feedback</DrawerTitle>
          <DrawerDescription>
            Your feedback helps me improve and grow. Share your thoughts about my work!
          </DrawerDescription>
        </DrawerHeader>

        <form onSubmit={handleSubmit} className="px-4 pb-4 space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label htmlFor="rating" className="text-base font-semibold">
              Rating <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-4">
              <StarRating 
                value={rating} 
                onChange={setRating} 
                maxStars={6}
                size="lg"
              />
              <span className="text-sm text-muted-foreground">
                {rating} out of 6 stars
              </span>
            </div>
          </div>

          {/* Project Selection (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="project" className="text-base font-semibold">
              Related Project <span className="text-sm text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger id="project">
                <SelectValue placeholder="Select a project (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None - General Feedback</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-base font-semibold">
              Your Feedback <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts, suggestions, or what you liked about my work..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <DrawerFooter className="px-0 pt-4">
            <Button 
              type="submit" 
              disabled={loading || !comment || comment.length < 10}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" type="button" className="w-full">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}


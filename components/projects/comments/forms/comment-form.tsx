"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, X, Loader2 } from 'lucide-react'
import { useCreateComment } from '@/hooks/comments'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface CommentFormProps {
  projectId: string
  parentCommentId?: string
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
}

export function CommentForm({
  projectId,
  parentCommentId,
  onSuccess,
  onCancel,
  placeholder = "Write a comment...",
  autoFocus = false,
  className
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { user } = useAuth()
  const { createComment, loading, error } = useCreateComment()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || loading) return

    const comment = await createComment(projectId, {
      content: content.trim(),
      parentCommentId
    })

    if (comment) {
      setContent('')
      setIsFocused(false)
      onSuccess?.()
    }
  }

  const handleCancel = () => {
    setContent('')
    setIsFocused(false)
    onCancel?.()
  }

  if (!user) {
    return (
      <div className={cn(
        "p-4 rounded-lg border border-gray-200 dark:border-gray-700",
        "bg-gray-50 dark:bg-gray-800/50",
        "text-center",
        className
      )}>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please sign in to leave a comment
        </p>
      </div>
    )
  }

  const characterLimit = 1000
  const charactersRemaining = characterLimit - content.length
  const isNearLimit = charactersRemaining < 100
  const isOverLimit = charactersRemaining < 0

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative",
        "rounded-lg border",
        isFocused 
          ? "border-blue-500 dark:border-blue-400 shadow-lg" 
          : "border-gray-200 dark:border-gray-700",
        "bg-white dark:bg-gray-800",
        "transition-all duration-200",
        className
      )}
    >
      {/* User Avatar & Input */}
      <div className="flex gap-3 p-4">
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            disabled={loading}
            className={cn(
              "w-full min-h-[80px] resize-none",
              "text-sm text-gray-900 dark:text-gray-100",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "bg-transparent border-none outline-none",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            maxLength={characterLimit + 50} // Allow some overflow for warning
          />
        </div>
      </div>

      {/* Actions Bar (shown when focused or has content) */}
      {(isFocused || content) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-200 dark:border-gray-700 px-4 py-3"
        >
          <div className="flex items-center justify-between gap-3">
            {/* Character Count */}
            <div className="flex-1">
              {content.length > 0 && (
                <span className={cn(
                  "text-xs font-medium",
                  isOverLimit 
                    ? "text-red-500" 
                    : isNearLimit 
                      ? "text-orange-500" 
                      : "text-gray-400 dark:text-gray-500"
                )}>
                  {charactersRemaining} characters remaining
                </span>
              )}
              {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}

              <Button
                type="submit"
                size="sm"
                disabled={!content.trim() || loading || isOverLimit}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    {parentCommentId ? 'Reply' : 'Comment'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.form>
  )
}

// Compact comment form (for replies)
export function CompactCommentForm({
  projectId,
  parentCommentId,
  onSuccess,
  onCancel,
  className
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const { user } = useAuth()
  const { createComment, loading } = useCreateComment()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!content.trim() || loading || !user) return

    const comment = await createComment(projectId, {
      content: content.trim(),
      parentCommentId
    })

    if (comment) {
      setContent('')
      onSuccess?.()
    }
  }

  if (!user) return null

  return (
    <form onSubmit={handleSubmit} className={cn("flex items-start gap-2", className)}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex-1 flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a reply..."
          disabled={loading}
          className={cn(
            "flex-1 px-3 py-2 rounded-lg text-sm",
            "border border-gray-200 dark:border-gray-700",
            "bg-white dark:bg-gray-800",
            "text-gray-900 dark:text-gray-100",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500",
            "focus:outline-none focus:ring-2 focus:ring-blue-500",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          maxLength={1000}
        />

        <Button
          type="submit"
          size="sm"
          disabled={!content.trim() || loading}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </form>
  )
}

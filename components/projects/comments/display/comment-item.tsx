"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ThumbsUp,
  MessageCircle,
  MoreHorizontal,
  Edit2,
  Trash2,
  Flag,
  Loader2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Comment } from '@/types'
import { useAuth } from '@/contexts/auth-context'
import { useUpdateComment, useDeleteComment, useLikeComment } from '@/hooks/comments'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CompactCommentForm } from '../forms/comment-form'

interface CommentItemProps {
  comment: Comment
  projectId: string
  onReply?: (commentId: string) => void
  onUpdate?: () => void
  depth?: number
  maxDepth?: number
  className?: string
}

export function CommentItem({
  comment,
  projectId,
  onReply,
  onUpdate,
  depth = 0,
  maxDepth = 3,
  className
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const { user } = useAuth()
  const { updateComment, loading: updating } = useUpdateComment()
  const { deleteComment, loading: deleting } = useDeleteComment()
  const { toggleLike, loading: liking } = useLikeComment()

  const isAuthor = user?.id === comment.userId
  const isAdmin = user?.role === 'admin'
  const canEdit = isAuthor
  const canDelete = isAuthor || isAdmin
  const canReply = depth < maxDepth

  const handleEdit = async () => {
    if (!editContent.trim() || updating) return

    const updated = await updateComment(comment.id, editContent.trim())
    if (updated) {
      setIsEditing(false)
      onUpdate?.()
    }
  }

  const handleDelete = async () => {
    if (deleting) return

    const confirmed = window.confirm('Are you sure you want to delete this comment?')
    if (!confirmed) return

    const success = await deleteComment(comment.id, false) // Soft delete
    if (success) {
      onUpdate?.()
    }
  }

  const handleLike = async () => {
    if (!user || liking) return

    // Check if user already liked
    const isLiked = comment.userLikes?.includes(user?.id || '') || false
    await toggleLike(comment.id, isLiked)
    onUpdate?.()
  }

  const handleReply = () => {
    if (canReply) {
      setIsReplying(true)
      onReply?.(comment.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "group relative",
        depth > 0 && "ml-12",
        className
      )}
    >
      {/* Connection Line for nested comments */}
      {depth > 0 && (
        <div className="absolute left-[-24px] top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="w-10 h-10 flex-shrink-0">
          <AvatarImage src={comment.user?.avatar} alt={comment.user?.name} />
          <AvatarFallback>
            {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              {comment.user?.name || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
            </span>
            {comment.updatedAt && comment.updatedAt > comment.createdAt && (
              <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                (edited)
              </span>
            )}
          </div>

          {/* Comment Body */}
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className={cn(
                  "w-full min-h-[80px] p-3 rounded-lg text-sm resize-none",
                  "border border-gray-200 dark:border-gray-700",
                  "bg-white dark:bg-gray-800",
                  "text-gray-900 dark:text-gray-100",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500"
                )}
                maxLength={1000}
              />
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleEdit}
                  disabled={!editContent.trim() || updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false)
                    setEditContent(comment.content)
                  }}
                  disabled={updating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className={cn(
              "text-sm text-gray-700 dark:text-gray-300",
              "break-words prose prose-sm dark:prose-invert max-w-none",
              "prose-p:my-1 prose-p:leading-relaxed",
              "prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline",
              "prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs",
              "prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:p-2 prose-pre:rounded",
              "prose-strong:font-semibold prose-strong:text-gray-900 dark:prose-strong:text-gray-100",
              "prose-em:italic",
              "prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5",
              "prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 prose-blockquote:pl-3 prose-blockquote:italic"
            )}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Prevent dangerous HTML
                  h1: ({ node, ...props }) => <p className="font-bold text-base" {...props} />,
                  h2: ({ node, ...props }) => <p className="font-bold text-sm" {...props} />,
                  h3: ({ node, ...props }) => <p className="font-semibold text-sm" {...props} />,
                  h4: ({ node, ...props }) => <p className="font-semibold text-sm" {...props} />,
                  h5: ({ node, ...props }) => <p className="font-medium text-sm" {...props} />,
                  h6: ({ node, ...props }) => <p className="font-medium text-sm" {...props} />,
                }}
              >
                {comment.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Actions */}
          {!isEditing && (
            <div className="flex items-center gap-4 mt-2">
              {/* Like Button */}
              <button
                onClick={handleLike}
                disabled={!user || liking}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-medium",
                  "text-gray-500 hover:text-blue-500",
                  "dark:text-gray-400 dark:hover:text-blue-400",
                  "transition-colors",
                  !user && "opacity-50 cursor-not-allowed"
                )}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{comment.likes || 0}</span>
              </button>

              {/* Reply Button */}
              {canReply && (
                <button
                  onClick={handleReply}
                  disabled={!user}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium",
                    "text-gray-500 hover:text-blue-500",
                    "dark:text-gray-400 dark:hover:text-blue-400",
                    "transition-colors",
                    !user && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reply</span>
                  {comment.repliesCount > 0 && (
                    <span className="text-gray-400">({comment.repliesCount})</span>
                  )}
                </button>
              )}

              {/* More Actions Menu */}
              {(canEdit || canDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className={cn(
                      "p-1 rounded-md",
                      "text-gray-400 hover:text-gray-600",
                      "dark:text-gray-500 dark:hover:text-gray-300",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "transition-colors",
                      "opacity-0 group-hover:opacity-100"
                    )}>
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && (
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                    {!isAuthor && user && (
                      <DropdownMenuItem>
                        <Flag className="w-4 h-4 mr-2" />
                        Report
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}

          {/* Reply Form */}
          <AnimatePresence>
            {isReplying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <CompactCommentForm
                  projectId={projectId}
                  parentCommentId={comment.id}
                  onSuccess={() => {
                    setIsReplying(false)
                    onUpdate?.()
                  }}
                  onCancel={() => setIsReplying(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

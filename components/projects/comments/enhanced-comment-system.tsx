"use client"

import { useState, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Reply, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { useProjectComments } from '@/hooks/comments/use-project-comments'
import { EnhancedCommentForm, CompactCommentForm } from './forms/enhanced-comment-form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface EnhancedCommentSystemProps {
  projectId: string
  projectTitle?: string
  projectDescription?: string
  className?: string
  maxDepth?: number
  showCount?: boolean
}

interface Comment {
  id: string
  projectId: string
  userId: string
  content: string
  parentCommentId?: string | null
  createdAt: Date
  updatedAt?: Date
  repliesCount?: number
  user?: {
    name: string
    avatar: string
  }
}

export function EnhancedCommentSystem({
  projectId,
  projectTitle,
  projectDescription,
  className,
  maxDepth = 3,
  showCount = true
}: EnhancedCommentSystemProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  
  const { 
    comments, 
    loading, 
    error,
    addComment,
    updateComment,
    deleteComment,
    getReplies: fetchReplies
  } = useProjectComments(projectId)

  // Comments are already top-level only from the hook
  const topLevelComments = useMemo(() => {
    return comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [comments])

  // Get replies for a specific comment (async)
  const [repliesCache, setRepliesCache] = useState<Record<string, Comment[]>>({})
  
  const getReplies = useCallback(async (parentId: string) => {
    if (repliesCache[parentId]) {
      return repliesCache[parentId]
    }
    const replies = await fetchReplies(parentId)
    setRepliesCache(prev => ({ ...prev, [parentId]: replies }))
    return replies
  }, [fetchReplies, repliesCache])

  const toggleExpanded = useCallback((commentId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev)
      if (next.has(commentId)) {
        next.delete(commentId)
      } else {
        next.add(commentId)
      }
      return next
    })
  }, [])

  const handleCommentAdded = useCallback(() => {
    toast({
      title: "Comment posted!",
      description: "Your comment has been added successfully.",
    })
    // Clear replies cache to force refresh
    setRepliesCache({})
  }, [toast])

  if (error) {
    return (
      <div className={cn("p-6 rounded-lg border border-destructive/20 bg-destructive/5", className)}>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <div className="flex-1">
            <p className="font-medium text-destructive">Failed to load comments</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      {showCount && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">
              Comments ({topLevelComments.length})
            </h3>
          </div>
        </div>
      )}

      {/* Add Comment Form */}
      <EnhancedCommentForm
        projectId={projectId}
        projectTitle={projectTitle}
        projectDescription={projectDescription}
        onSuccess={handleCommentAdded}
        placeholder="Share your thoughts..."
        variant="compact"
      />

      {/* Comments List */}
      <div className="space-y-4">
        {loading && comments.length === 0 ? (
          <>
            {[...Array(3)].map((_, i) => (
              <CommentSkeleton key={i} />
            ))}
          </>
        ) : topLevelComments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No comments yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {topLevelComments.map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                projectId={projectId}
                depth={0}
                maxDepth={maxDepth}
                getReplies={getReplies}
                expanded={expandedComments.has(comment.id)}
                onToggleExpanded={() => toggleExpanded(comment.id)}
                currentUser={user}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

interface CommentThreadProps {
  comment: Comment
  projectId: string
  depth: number
  maxDepth: number
  getReplies: (parentId: string) => Promise<Comment[]>
  expanded: boolean
  onToggleExpanded: () => void
  currentUser: any
  isReply?: boolean
}

function CommentThread({
  comment,
  projectId,
  depth,
  maxDepth,
  getReplies,
  expanded,
  onToggleExpanded,
  currentUser,
  isReply = false
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [isDeleting, setIsDeleting] = useState(false)
  const [replies, setReplies] = useState<Comment[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  
  const { toast } = useToast()
  const { updateComment, deleteComment } = useProjectComments(projectId)
  
  const hasReplies = (comment.repliesCount ?? 0) > 0 || replies.length > 0
  const canReply = depth < maxDepth
  const isAuthor = currentUser?.id === comment.userId
  const isDeveloper = currentUser?.role === 'developer'
  const canEdit = isAuthor || isDeveloper
  const canDelete = isAuthor || isDeveloper

  // Load replies when expanded
  useEffect(() => {
    if (expanded && hasReplies && replies.length === 0) {
      setLoadingReplies(true)
      getReplies(comment.id)
        .then(setReplies)
        .finally(() => setLoadingReplies(false))
    }
  }, [expanded, hasReplies, comment.id, getReplies, replies.length])

  const handleEdit = async () => {
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false)
      return
    }

    try {
      await updateComment(comment.id, editContent.trim())
      setIsEditing(false)
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Failed to update",
        description: "Could not update your comment. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return

    const confirmed = window.confirm(
      hasReplies 
        ? 'This comment has replies. Are you sure you want to delete it?' 
        : 'Are you sure you want to delete this comment?'
    )
    
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await deleteComment(comment.id)
      toast({
        title: "Comment deleted",
        description: "The comment has been removed.",
      })
    } catch (error) {
      toast({
        title: "Failed to delete",
        description: "Could not delete the comment. Please try again.",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  const handleReplySuccess = async () => {
    setIsReplying(false)
    // Refresh replies after adding a new one
    const updatedReplies = await getReplies(comment.id)
    setReplies(updatedReplies)
    if (!expanded) {
      onToggleExpanded()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "relative",
        isReply && "ml-4"
      )}
    >
      {/* Comment */}
      <div className={cn(
        "group p-4 rounded-lg transition-colors",
        isDeleting && "opacity-50 pointer-events-none",
        !isReply && "bg-muted/30 hover:bg-muted/50",
        isReply && "bg-background border border-border/50 hover:border-border"
      )}>
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-border/50">
            <AvatarImage src={comment.user?.avatar} alt={comment.user?.name} />
            <AvatarFallback className="text-sm font-semibold">
              {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground">
                  {comment.user?.name || 'Anonymous'}
                </span>
                {isAuthor && (
                  <Badge variant="secondary" className="text-xs px-1.5 py-0">You</Badge>
                )}
                {!isAuthor && isDeveloper && (
                  <Badge 
                    variant="outline" 
                    className="text-xs px-1.5 py-0 border-blue-500 text-blue-600"
                  >
                    Developer
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
                {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                  <span className="text-xs text-muted-foreground italic">(edited)</span>
                )}
                {!isAuthor && isDeveloper && (
                  <span className="text-xs text-muted-foreground/70 italic">(moderated)</span>
                )}
              </div>

              {/* Actions Menu */}
              {(canEdit || canDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {canEdit && !isEditing && (
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={handleDelete}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Content */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full min-h-[80px] p-3 text-sm border-2 border-primary/50 rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleEdit}>
                    Save
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setIsEditing(false)
                      setEditContent(comment.content)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                {comment.content}
              </p>
            )}

            {/* Actions */}
            {!isEditing && (
              <div className="flex items-center gap-4 mt-3">
                {canReply && currentUser && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsReplying(!isReplying)}
                    className="h-7 px-2 text-xs font-medium"
                  >
                    <Reply className="h-3 w-3 mr-1.5" />
                    Reply
                  </Button>
                )}

                {hasReplies && !isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggleExpanded}
                    className="h-7 px-2 text-xs font-medium text-primary"
                    disabled={loadingReplies}
                  >
                    {loadingReplies ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                        Loading...
                      </>
                    ) : expanded ? (
                      <>
                        <ChevronUp className="h-3 w-3 mr-1.5" />
                        Hide replies
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3 w-3 mr-1.5" />
                        {comment.repliesCount || replies.length} {(comment.repliesCount || replies.length) === 1 ? 'reply' : 'replies'}
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Reply Form */}
        <AnimatePresence>
          {isReplying && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 ml-13"
            >
              <CompactCommentForm
                projectId={projectId}
                parentCommentId={comment.id}
                onSuccess={handleReplySuccess}
                onCancel={() => setIsReplying(false)}
                placeholder={`Reply to ${comment.user?.name || 'comment'}...`}
                variant="compact"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Replies */}
      <AnimatePresence>
        {expanded && hasReplies && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 space-y-3"
          >
            {replies.map((reply) => (
              <div key={reply.id} className="relative">
                {/* Twitter-style "Replying to" indicator */}
                <div className="flex items-center gap-2 mb-2 ml-3">
                  <div className="w-4 h-px bg-border/50"></div>
                  <span className="text-xs text-muted-foreground">
                    Replying to <span className="font-medium text-foreground">@{comment.user?.name || 'user'}</span>
                  </span>
                </div>
                
                <CommentThread
                  comment={reply}
                  projectId={projectId}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                  getReplies={getReplies}
                  expanded={false}
                  onToggleExpanded={() => {}}
                  currentUser={currentUser}
                  isReply={true}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CommentSkeleton() {
  return (
    <div className="p-4 rounded-lg bg-muted/30">
      <div className="flex gap-3">
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedCommentSystem

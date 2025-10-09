"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  MessageCircle, 
  Reply, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Send
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { useProjectComments } from '@/hooks/comments'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProjectCommentsProps {
  projectId: string
  compact?: boolean
}

export function ProjectComments({ projectId, compact = false }: ProjectCommentsProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  
  const { 
    comments, 
    addComment, 
    updateComment, 
    deleteComment, 
    getReplies,
    loading: commentsLoading 
  } = useProjectComments(projectId)

  const handleAddComment = async (parentCommentId?: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to comment on projects.",
        variant: "destructive",
      })
      return
    }
    
    const content = parentCommentId ? editContent : newComment
    
    if (!content.trim()) {
      toast({
        title: "Invalid comment",
        description: "Comment cannot be empty.",
        variant: "destructive",
      })
      return
    }
    
    await addComment(content.trim(), parentCommentId)
    
    if (parentCommentId) {
      setEditContent('')
      setReplyingTo(null)
    } else {
      setNewComment('')
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast({
        title: "Invalid comment",
        description: "Comment cannot be empty.",
        variant: "destructive",
      })
      return
    }
    
    await updateComment(commentId, editContent.trim())
    setEditingComment(null)
    setEditContent('')
  }

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      await deleteComment(commentId)
    }
  }

  const startEdit = (commentId: string, currentContent: string) => {
    setEditingComment(commentId)
    setEditContent(currentContent)
  }

  const cancelEdit = () => {
    setEditingComment(null)
    setEditContent('')
  }

  if (compact) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setShowComments(true)}
        className="flex items-center gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        {comments.length} comment{comments.length !== 1 ? 's' : ''}
      </Button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Comments Toggle */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setShowComments(!showComments)}
        className="flex items-center gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        {comments.length} comment{comments.length !== 1 ? 's' : ''}
      </Button>

      {/* Comments List */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={setReplyingTo}
                onEdit={startEdit}
                onDelete={handleDeleteComment}
                onUpdate={handleEditComment}
                editingComment={editingComment}
                editContent={editContent}
                setEditContent={setEditContent}
                onCancelEdit={cancelEdit}
                replyingTo={replyingTo}
                onAddReply={handleAddComment}
                user={user}
              />
            ))}

            {/* Add Comment Form */}
            {user && (
              <div className="flex gap-3 pt-4 border-t">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNewComment('')}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => handleAddComment()}
                      disabled={!newComment.trim() || commentsLoading}
                      size="sm"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      {commentsLoading ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface CommentItemProps {
  comment: any
  onReply: (commentId: string) => void
  onEdit: (commentId: string, content: string) => void
  onDelete: (commentId: string) => void
  onUpdate: (commentId: string) => void
  editingComment: string | null
  editContent: string
  setEditContent: (content: string) => void
  onCancelEdit: () => void
  replyingTo: string | null
  onAddReply: (parentCommentId: string) => void
  user: any
}

function CommentItem({
  comment,
  onReply,
  onEdit,
  onDelete,
  onUpdate,
  editingComment,
  editContent,
  setEditContent,
  onCancelEdit,
  replyingTo,
  onAddReply,
  user
}: CommentItemProps) {
  const [showReplies, setShowReplies] = useState(false)
  const [replies, setReplies] = useState<any[]>([])
  const [loadingReplies, setLoadingReplies] = useState(false)
  const { getReplies } = useProjectComments(comment.projectId)

  const loadReplies = async () => {
    if (showReplies) {
      setShowReplies(false)
      return
    }

    setLoadingReplies(true)
    try {
      const repliesData = await getReplies(comment.id)
      setReplies(repliesData)
      setShowReplies(true)
    } catch (error) {
      console.error('Error loading replies:', error)
    } finally {
      setLoadingReplies(false)
    }
  }

  const isEditing = editingComment === comment.id
  const isReplying = replyingTo === comment.id
  const canEdit = user && (user.id === comment.userId || user.role === 'admin')
  const canDelete = user && (user.id === comment.userId || user.role === 'admin')

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.user.avatar} />
        <AvatarFallback>{comment.user.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{comment.user.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
          </span>
          {comment.updatedAt.getTime() !== comment.createdAt.getTime() && (
            <Badge variant="secondary" className="text-xs">
              edited
            </Badge>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelEdit}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => onUpdate(comment.id)}
                disabled={!editContent.trim()}
              >
                Update
              </Button>
            </div>
          </div>
        ) : (
          <div className={cn(
            "text-sm mt-1 text-gray-700 dark:text-gray-300",
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
                h1: ({node, ...props}) => <p className="font-bold text-base" {...props} />,
                h2: ({node, ...props}) => <p className="font-bold text-sm" {...props} />,
                h3: ({node, ...props}) => <p className="font-semibold text-sm" {...props} />,
                h4: ({node, ...props}) => <p className="font-semibold text-sm" {...props} />,
                h5: ({node, ...props}) => <p className="font-medium text-sm" {...props} />,
                h6: ({node, ...props}) => <p className="font-medium text-sm" {...props} />,
              }}
            >
              {comment.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Comment Actions */}
        {!isEditing && (
          <div className="flex items-center gap-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply(comment.id)}
              className="h-6 px-2 text-xs"
            >
              <Reply className="h-3 w-3 mr-1" />
              Reply
            </Button>

            {comment.repliesCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={loadReplies}
                className="h-6 px-2 text-xs"
                disabled={loadingReplies}
              >
                {showReplies ? 'Hide' : 'Show'} {comment.repliesCount} replies
              </Button>
            )}

            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(comment.id, comment.content)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  {canDelete && (
                    <DropdownMenuItem 
                      onClick={() => onDelete(comment.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        {/* Reply Form */}
        {isReplying && (
          <div className="mt-3 space-y-2">
            <Textarea
              placeholder={`Reply to ${comment.user.name}...`}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[60px]"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditContent('')
                  onReply('')
                }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => onAddReply(comment.id)}
                disabled={!editContent.trim()}
              >
                <Send className="h-4 w-4 mr-1" />
                Reply
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {showReplies && (
          <div className="mt-4 ml-4 space-y-3 border-l-2 border-muted pl-4">
            {replies.map((reply) => (
              <div key={reply.id} className="flex gap-3">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={reply.user.avatar} />
                  <AvatarFallback className="text-xs">{reply.user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-xs">{reply.user.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(reply.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <div className={cn(
                    "text-xs mt-1 text-gray-700 dark:text-gray-300",
                    "break-words prose prose-xs dark:prose-invert max-w-none",
                    "prose-p:my-0.5 prose-p:leading-relaxed",
                    "prose-a:text-blue-500 prose-a:no-underline hover:prose-a:underline",
                    "prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[10px]",
                    "prose-strong:font-semibold"
                  )}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {reply.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


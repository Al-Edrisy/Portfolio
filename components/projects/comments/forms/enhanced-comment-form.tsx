"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  X, 
  Loader2, 
  Smile, 
  Image, 
  Paperclip,
  Mic,
  AtSign,
  Hash,
  Bold,
  Italic,
  Link,
  Code,
  List,
  Quote,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react'
import { useCreateComment } from '@/hooks/comments'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface EnhancedCommentFormProps {
  projectId: string
  parentCommentId?: string
  onSuccess?: () => void
  onCancel?: () => void
  placeholder?: string
  autoFocus?: boolean
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  showRichText?: boolean
}

export function EnhancedCommentForm({
  projectId,
  parentCommentId,
  onSuccess,
  onCancel,
  placeholder = "Share your thoughts...",
  autoFocus = false,
  className,
  variant = 'default',
  showRichText = false
}: EnhancedCommentFormProps) {
  const [content, setContent] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFormatting, setShowFormatting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const { user } = useAuth()
  const { createComment, loading, error } = useCreateComment()
  const { toast } = useToast()

  const characterLimit = 1000
  const charactersRemaining = characterLimit - content.length
  const isNearLimit = charactersRemaining < 100
  const isOverLimit = charactersRemaining < 0
  const hasContent = content.trim().length > 0

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [content])

  // Focus management
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hasContent || loading || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      const comment = await createComment(projectId, {
        content: content.trim(),
        parentCommentId
      })

      if (comment) {
        setContent('')
        setIsFocused(false)
        setIsExpanded(false)
        onSuccess?.()
        
        toast({
          title: "Comment posted!",
          description: "Your comment has been added successfully.",
        })
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setContent('')
    setIsFocused(false)
    setIsExpanded(false)
    onCancel?.()
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (!isExpanded && variant !== 'compact') {
      setIsExpanded(true)
    }
  }

  const handleBlur = () => {
    if (!hasContent) {
      setIsFocused(false)
      setIsExpanded(false)
    }
  }

  const insertFormatting = (format: string) => {
    if (!textareaRef.current) return
    
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    let formattedText = ''
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`
        break
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`
        break
      case 'code':
        formattedText = `\`${selectedText || 'code'}\``
        break
      case 'link':
        formattedText = `[${selectedText || 'link text'}](url)`
        break
      case 'quote':
        formattedText = `> ${selectedText || 'quote'}`
        break
    }
    
    const newContent = content.substring(0, start) + formattedText + content.substring(end)
    setContent(newContent)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + formattedText.length, start + formattedText.length)
    }, 0)
  }

  const addMention = () => {
    const newContent = content + '@'
    setContent(newContent)
    textareaRef.current?.focus()
  }

  if (!user) {
    return (
      <div className={cn(
        "p-6 rounded-xl border-2 border-dashed border-border/50",
        "bg-muted/30 text-center",
        "hover:border-primary/30 hover:bg-muted/50 transition-all duration-200",
        className
      )}>
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Sign in to comment</p>
            <p className="text-sm text-muted-foreground">
              Join the conversation and share your thoughts
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-primary/20">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="text-xs font-semibold">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 flex gap-2">
          <input
            ref={textareaRef}
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
            placeholder={placeholder}
            disabled={loading}
            className="flex-1 px-3 py-2 text-sm bg-muted/50 border border-border rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50
                     disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          />
          
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={!hasContent || loading}
            className="h-8 px-3"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("space-y-3", className)}
      >
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-primary/20">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xs font-semibold">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={loading}
              className="min-h-[60px] resize-none text-sm border-2 focus:border-primary/50 transition-all duration-200"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasContent && (
                  <span className={cn(
                    "text-xs font-medium",
                    isOverLimit ? "text-destructive" : 
                    isNearLimit ? "text-orange-500" : 
                    "text-muted-foreground"
                  )}>
                    {charactersRemaining}
                  </span>
                )}
                
                {showRichText && (
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => insertFormatting('bold')}
                            className="h-6 w-6 p-0"
                          >
                            <Bold className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Bold</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => insertFormatting('italic')}
                            className="h-6 w-6 p-0"
                          >
                            <Italic className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Italic</TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => insertFormatting('code')}
                            className="h-6 w-6 p-0"
                          >
                            <Code className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Code</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {onCancel && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
                
                <Button
                  type="submit"
                  size="sm"
                  disabled={!hasContent || loading || isOverLimit}
                  className="gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {parentCommentId ? 'Reply' : 'Comment'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.form>
    )
  }

  return (
    <TooltipProvider>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative rounded-xl border-2 transition-all duration-200",
          isFocused 
            ? "border-primary/50 shadow-lg shadow-primary/10" 
            : "border-border/50 hover:border-border",
          "bg-background/95 backdrop-blur-sm",
          className
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="font-semibold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <p className="font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">
                {parentCommentId ? 'Replying to comment' : 'Add a comment'}
              </p>
            </div>
            
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Textarea */}
        <div className="p-4">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={loading}
            className="min-h-[120px] resize-none border-0 p-0 text-base focus:ring-0 
                     placeholder:text-muted-foreground/70 disabled:opacity-50"
          />
        </div>

        {/* Formatting Toolbar */}
        <AnimatePresence>
          {showRichText && isFocused && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border/50 p-3"
            >
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-muted-foreground mr-2">Format:</span>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting('bold')}
                      className="h-8 w-8 p-0"
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Bold text</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting('italic')}
                      className="h-8 w-8 p-0"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Italic text</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting('code')}
                      className="h-8 w-8 p-0"
                    >
                      <Code className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Inline code</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting('link')}
                      className="h-8 w-8 p-0"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add link</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting('quote')}
                      className="h-8 w-8 p-0"
                    >
                      <Quote className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Quote</TooltipContent>
                </Tooltip>
                
                <div className="flex-1" />
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addMention}
                  className="h-8 px-3 gap-2"
                >
                  <AtSign className="h-4 w-4" />
                  Mention
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <AnimatePresence>
          {(isFocused || hasContent) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border/50 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Character Count & Status */}
                <div className="flex items-center gap-3">
                  {hasContent && (
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-xs font-medium",
                        isOverLimit ? "text-destructive" : 
                        isNearLimit ? "text-orange-500" : 
                        "text-muted-foreground"
                      )}>
                        {charactersRemaining}
                      </span>
                      {isOverLimit && (
                        <AlertCircle className="h-3 w-3 text-destructive" />
                      )}
                    </div>
                  )}
                  
                  {error && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {error}
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    disabled={!hasContent || loading || isOverLimit}
                    className="gap-2 bg-primary hover:bg-primary/90"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {parentCommentId ? 'Post Reply' : 'Post Comment'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </TooltipProvider>
  )
}

// Export both variants for different use cases
export { EnhancedCommentForm as default }
export const CompactCommentForm = (props: EnhancedCommentFormProps) => (
  <EnhancedCommentForm {...props} variant="compact" />
)
export const MinimalCommentForm = (props: EnhancedCommentFormProps) => (
  <EnhancedCommentForm {...props} variant="minimal" />
)

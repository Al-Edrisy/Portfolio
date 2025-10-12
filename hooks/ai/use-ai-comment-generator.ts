"use client"

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import type { CommentTone, CommentLength, AIModel, AICommentGenerateResponse, AIRateLimitInfo } from '@/types/ai'

interface UseAICommentGeneratorOptions {
  onCommentGenerated?: (comment: string) => void
}

interface UseAICommentGeneratorReturn {
  generateComment: (params: {
    projectTitle: string
    projectDescription: string
    tone: CommentTone
  }) => Promise<string | null>
  loading: boolean
  error: string | null
  rateLimitInfo: AIRateLimitInfo | null
  isAuthenticated: boolean
}

/**
 * Hook for generating AI comments
 * Handles API calls, loading states, error handling, and rate limiting
 */
export function useAICommentGenerator(
  options?: UseAICommentGeneratorOptions
): UseAICommentGeneratorReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateLimitInfo, setRateLimitInfo] = useState<AIRateLimitInfo | null>(null)
  
  const { user } = useAuth()
  const { toast } = useToast()

  // Stable reference to the callback to avoid re-renders
  const onCommentGeneratedRef = useCallback((comment: string) => {
    options?.onCommentGenerated?.(comment)
  }, [options?.onCommentGenerated])

  /**
   * Generate an AI comment
   */
  const generateComment = useCallback(async ({
    projectTitle,
    projectDescription,
    tone,
    length,
    model,
    customInstructions
  }: {
    projectTitle: string
    projectDescription: string
    tone: CommentTone
    length?: CommentLength
    model?: AIModel
    customInstructions?: string
  }): Promise<string | null> => {
    // Validate authentication
    if (!user) {
      const errorMessage = 'You must be signed in to use AI comment generation'
      setError(errorMessage)
      toast({
        title: 'Authentication Required',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    }

    // Validate inputs
    if (!projectTitle || projectTitle.trim().length === 0) {
      const errorMessage = 'Project title is required'
      setError(errorMessage)
      toast({
        title: 'Invalid Input',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    }

    if (!projectDescription || projectDescription.trim().length < 10) {
      const errorMessage = 'Project description is too short (minimum 10 characters)'
      setError(errorMessage)
      toast({
        title: 'Invalid Input',
        description: errorMessage,
        variant: 'destructive'
      })
      return null
    }

    setLoading(true)
    setError(null)

    try {
      // Call API to generate comment
      const response = await fetch('/api/ai/generate-comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectTitle: projectTitle.trim(),
          projectDescription: projectDescription.trim(),
          tone,
          length,
          model,
          customInstructions: customInstructions?.trim(),
          userId: user.id
        })
      })

      // Parse response
      const data: AICommentGenerateResponse = await response.json()
      
      console.log('AI Generation Response:', {
        status: response.status,
        success: data.success,
        hasComment: !!data.comment,
        commentLength: data.comment?.length || 0,
        error: data.error,
        model: data.model
      })
      
      if (!data.success) {
        console.error('❌ AI Generation Failed:', data.error)
      }

      // Handle rate limiting
      if (response.status === 429) {
        const resetHeader = response.headers.get('X-RateLimit-Reset')
        const resetTime = resetHeader ? parseInt(resetHeader) : Date.now() + 3600000
        
        setError(data.error || 'Rate limit exceeded')
        toast({
          title: 'Rate Limit Exceeded',
          description: data.error || 'You have reached your hourly limit for AI-generated comments. Please try again later.',
          variant: 'destructive'
        })
        
        setRateLimitInfo({
          requestsRemaining: 0,
          resetTime,
          totalRequests: 10,
          maxRequests: 10
        })
        
        return null
      }

      // Handle API errors
      if (!response.ok || !data.success) {
        const errorMessage = data.error || 'Failed to generate comment'
        setError(errorMessage)
        
        // Provide helpful suggestions based on error
        let description = errorMessage
        let title = 'Generation Failed'
        
        if (response.status === 500 || errorMessage.includes('API') || errorMessage.includes('service')) {
          title = 'AI Service Unavailable'
          description = 'The AI service is temporarily unavailable. Please try again in a moment, or try a different tone/length.'
        } else if (errorMessage.includes('tone')) {
          description = 'Try selecting a different tone (Professional, Friendly, etc.)'
        } else if (errorMessage.includes('validation')) {
          description = 'Try a different length option or rephrase your custom instructions.'
        }
        
        toast({
          title,
          description,
          variant: 'destructive',
          duration: 6000
        })
        return null
      }

      // Update rate limit info from response headers
      const remainingHeader = response.headers.get('X-RateLimit-Remaining')
      const resetHeader = response.headers.get('X-RateLimit-Reset')
      
      if (remainingHeader && resetHeader) {
        setRateLimitInfo({
          requestsRemaining: parseInt(remainingHeader),
          resetTime: parseInt(resetHeader),
          totalRequests: 10 - parseInt(remainingHeader),
          maxRequests: 10
        })
      }

      // Success
      const generatedComment = data.comment
      
      if (!generatedComment) {
        setError('No comment was generated')
        toast({
          title: 'Generation Failed',
          description: 'No comment was generated. Please try again.',
          variant: 'destructive'
        })
        return null
      }

      // Call success callback
      onCommentGeneratedRef(generatedComment)

      toast({
        title: 'Comment Generated! ✨',
        description: 'AI has created a comment for you. You can edit it before posting.',
      })

      return generatedComment

    } catch (err: any) {
      const errorMessage = err.message || 'Network error. Please check your connection and try again.'
      setError(errorMessage)
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
      console.error('Error generating AI comment:', err)
      return null

    } finally {
      setLoading(false)
    }
  }, [user, toast, onCommentGeneratedRef])

  return {
    generateComment,
    loading,
    error,
    rateLimitInfo,
    isAuthenticated: !!user
  }
}


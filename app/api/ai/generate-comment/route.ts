import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateAIComment } from '@/lib/ai/openrouter-client'
import { checkRateLimit, getRateLimitInfo } from '@/lib/ai/rate-limiter'
import { COMMENT_TONE_OPTIONS, MIN_DESCRIPTION_LENGTH, MAX_COMMENT_LENGTH } from '@/lib/ai/comment-tone-configs'
import type { AICommentGenerateResponse } from '@/types/ai'

/**
 * Zod schema for request validation
 */
const GenerateCommentSchema = z.object({
  projectTitle: z.string()
    .min(1, 'Project title is required')
    .max(200, 'Project title is too long'),
  
  projectDescription: z.string()
    .min(MIN_DESCRIPTION_LENGTH, `Project description must be at least ${MIN_DESCRIPTION_LENGTH} characters`)
    .max(5000, 'Project description is too long'),
  
  tone: z.enum(['professional', 'friendly', 'funny', 'technical', 'enthusiastic'], {
    errorMap: () => ({ message: 'Invalid tone selected' })
  }),
  
  userId: z.string()
    .min(1, 'User ID is required'),
  
  length: z.enum(['short', 'medium', 'long'], {
    errorMap: () => ({ message: 'Invalid length selected' })
  }).optional().default('medium'),
  
  model: z.enum([
    'meta-llama/llama-3.3-8b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'google/gemma-3-12b-it:free',
    'nvidia/nemotron-nano-9b-v2:free',
    'mistralai/mistral-small-24b-instruct-2501:free',
    'deepseek/deepseek-chat',
    'qwen/qwen3-14b:free'
  ], {
    errorMap: () => ({ message: 'Invalid model selected' })
  }).optional(),
  
  customInstructions: z.string()
    .max(200, 'Custom instructions must be 200 characters or less')
    .optional(),
  
  maxLength: z.number()
    .int()
    .min(50)
    .max(MAX_COMMENT_LENGTH)
    .optional()
    .default(MAX_COMMENT_LENGTH)
})

type GenerateCommentInput = z.infer<typeof GenerateCommentSchema>

/**
 * POST /api/ai/generate-comment
 * Generate an AI comment for a project
 */
export async function POST(request: NextRequest) {
  try {
    // Check if API key is configured
    const apiKey = process.env.OPENROUTER_API_KEY
    
    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json<AICommentGenerateResponse>(
        {
          success: false,
          error: 'AI comment generation is not configured. Please contact the site administrator.'
        },
        { status: 503 }
      )
    }

    // Parse and validate request body
    let body: GenerateCommentInput
    
    try {
      const rawBody = await request.json()
      body = GenerateCommentSchema.parse(rawBody)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0]
        return NextResponse.json<AICommentGenerateResponse>(
          {
            success: false,
            error: firstError.message
          },
          { status: 400 }
        )
      }
      
      return NextResponse.json<AICommentGenerateResponse>(
        {
          success: false,
          error: 'Invalid request format'
        },
        { status: 400 }
      )
    }

    // Check rate limit
    const rateLimitResult = checkRateLimit(body.userId)
    
    if (!rateLimitResult.allowed) {
      const minutesUntilReset = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000)
      
      return NextResponse.json<AICommentGenerateResponse>(
        {
          success: false,
          error: `Rate limit exceeded. Try again in ${minutesUntilReset} minute${minutesUntilReset !== 1 ? 's' : ''}.`
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
            'Retry-After': minutesUntilReset.toString()
          }
        }
      )
    }

    // Sanitize inputs (prevent injection attacks)
    const sanitizedTitle = body.projectTitle.trim().slice(0, 200)
    const sanitizedDescription = body.projectDescription.trim().slice(0, 5000)

    // Generate AI comment with error handling
    let result
    try {
      result = await generateAIComment({
        projectTitle: sanitizedTitle,
        projectDescription: sanitizedDescription,
        tone: body.tone,
        length: body.length,
        model: body.model,
        customInstructions: body.customInstructions?.trim(),
        apiKey,
        maxLength: body.maxLength
      })
    } catch (generationError: any) {
      console.error('AI generation exception:', generationError)
      return NextResponse.json<AICommentGenerateResponse>(
        {
          success: false,
          error: 'An error occurred during comment generation. Please try again.'
        },
        { status: 500 }
      )
    }

    if (!result.success) {
      // Log the failure for debugging
      console.error('AI generation failed:', {
        error: result.error,
        tone: body.tone,
        length: body.length,
        hasCustomInstructions: !!body.customInstructions
      })
      
      return NextResponse.json<AICommentGenerateResponse>(
        {
          success: false,
          error: result.error || 'Failed to generate comment. Please try a different tone or setting.'
        },
        { status: 500 }
      )
    }

    // Return successful response
    return NextResponse.json<AICommentGenerateResponse>(
      {
        success: true,
        comment: result.comment,
        tokensUsed: result.tokensUsed,
        model: result.model
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
        }
      }
    )

  } catch (error: any) {
    console.error('Error in AI comment generation API:', error)
    
    return NextResponse.json<AICommentGenerateResponse>(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again later.'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/generate-comment
 * Get rate limit info for a user WITHOUT incrementing the counter
 * This is a read-only operation for checking status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Use getRateLimitInfo instead of checkRateLimit to avoid incrementing
    const rateLimitInfo = getRateLimitInfo(userId)

    return NextResponse.json({
      requestsRemaining: rateLimitInfo.requestsRemaining,
      resetTime: rateLimitInfo.resetTime,
      totalRequests: rateLimitInfo.totalRequests,
      allowed: rateLimitInfo.requestsRemaining > 0
    })

  } catch (error) {
    console.error('Error checking rate limit:', error)
    return NextResponse.json(
      { error: 'Failed to check rate limit' },
      { status: 500 }
    )
  }
}


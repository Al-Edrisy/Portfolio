import type { CommentTone, CommentLength, AIModel } from '@/types/ai'
import { COMMENT_TONE_CONFIGS, MAX_COMMENT_LENGTH } from './comment-tone-configs'
import { COMMENT_LENGTH_CONFIGS } from './comment-length-configs'
import { DEFAULT_AI_MODEL, getModelConfig } from './model-configs'
import { validateCommentContent, sanitizeCommentContent } from './content-filter'

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
const API_TIMEOUT_MS = 30000 // 30 second timeout

/**
 * System prompt for AI comment generation
 */
const SYSTEM_PROMPT = `You are a helpful assistant that generates authentic, engaging comments for project portfolios. 
Your comments should be:
- Genuine and specific to the project described
- Natural and conversational (not robotic)
- CONCISE and to the point (aim for the word limit, but quality over exact count)
- Free of generic phrases like "Great work!" without context
- Focused on specific aspects mentioned in the project

IMPORTANT: 
1. Generate ONLY the comment text. No prefixes like "Comment:", "Here's a comment:", or quotation marks.
2. Aim for the word count specified, but prioritize natural, quality content.
3. Be direct and concise - every word should add value.
4. If you can't generate a comment, return a simple, genuine reaction.`

/**
 * Generate AI comment using OpenRouter API
 */
export async function generateAIComment({
  projectTitle,
  projectDescription,
  tone,
  length = 'medium',
  customInstructions,
  model,
  apiKey,
  maxLength = MAX_COMMENT_LENGTH
}: {
  projectTitle: string
  projectDescription: string
  tone: CommentTone
  length?: CommentLength
  customInstructions?: string
  model?: AIModel
  apiKey: string
  maxLength?: number
}): Promise<{
  success: boolean
  comment?: string
  error?: string
  tokensUsed?: number
  model?: string
}> {
  try {
    // Validate inputs
    if (!apiKey || apiKey.trim() === '') {
      return {
        success: false,
        error: 'OpenRouter API key is not configured'
      }
    }

    if (!projectTitle || projectTitle.trim() === '') {
      return {
        success: false,
        error: 'Project title is required'
      }
    }

    if (!projectDescription || projectDescription.trim().length < 10) {
      return {
        success: false,
        error: 'Project description is too short'
      }
    }

    // Get tone configuration
    const toneConfig = COMMENT_TONE_CONFIGS[tone]
    if (!toneConfig) {
      return {
        success: false,
        error: 'Invalid tone selected'
      }
    }

    // Get length configuration
    const lengthConfig = COMMENT_LENGTH_CONFIGS[length]
    if (!lengthConfig) {
      return {
        success: false,
        error: 'Invalid length selected'
      }
    }

    // Build user prompt with length and custom instructions
    let userPrompt = `${toneConfig.prompt}

Project Title: "${projectTitle}"

Project Description:
${projectDescription}

Generate a ${tone} comment about this project.

Length: Approximately ${lengthConfig.wordRange} (aim for this range, but focus on quality)
Keep it under ${lengthConfig.charLimit} characters.

Be concise and specific. Focus on the most interesting aspects.`

    // Add custom instructions if provided
    if (customInstructions && customInstructions.trim().length > 0) {
      userPrompt += `\n\nAdditional Instructions: ${customInstructions.trim()}`
    }

    // Use provided model or default
    const selectedModel = model || DEFAULT_AI_MODEL
    const modelConfig = getModelConfig(selectedModel)

    console.log('🤖 AI Comment Request:', {
      model: selectedModel,
      modelLabel: modelConfig.label,
      tone,
      length: length,
      customInstructions: customInstructions ? '(provided)' : '(none)',
      projectTitle: projectTitle.substring(0, 50),
      descriptionLength: projectDescription.length,
      timestamp: new Date().toISOString()
    })

    // Set up timeout for API call
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS)

    let response: Response
    try {
      // Call OpenRouter API with timeout
      response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'Portfolio Comment Generator'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: SYSTEM_PROMPT
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          max_tokens: 120,
          temperature: 0.6,
          top_p: 0.8,
          frequency_penalty: 0.2,
          presence_penalty: 0.1
        }),
        signal: controller.signal
      })
    } catch (fetchError: any) {
      clearTimeout(timeoutId)
      
      // Handle abort/timeout
      if (fetchError.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timed out. Please try again.'
        }
      }
      
      // Handle network errors
      throw fetchError
    } finally {
      clearTimeout(timeoutId)
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        model: selectedModel,
        errorMessage: errorData.error?.message,
        timestamp: new Date().toISOString()
      })
      
      // Provide helpful error messages with fallback suggestions
      let errorMessage = errorData.error?.message || `API request failed with status ${response.status}`
      
      if (response.status === 429) {
        errorMessage = 'API rate limit exceeded. Please try again in a moment.'
      } else if (response.status === 401) {
        errorMessage = 'API authentication failed. Please check your API key.'
      } else if (response.status === 503 || response.status === 500) {
        errorMessage = 'AI service is temporarily unavailable. The model may be overloaded - please try again.'
      } else if (response.status === 400) {
        errorMessage = 'Invalid request. Please try a different tone or length.'
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }

    const data = await response.json()

    // Log the response for debugging (production-safe)
    console.log('✅ OpenRouter API Response:', {
      model: selectedModel,
      hasChoices: !!data.choices,
      choicesCount: data.choices?.length,
      tokensUsed: data.usage?.total_tokens,
      finishReason: data.choices?.[0]?.finish_reason
    })
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📄 Full Response:', JSON.stringify(data, null, 2))
    }

    // Extract generated comment with multiple fallbacks
    // Some models (like openai/gpt-oss-20b:free) put the response in 'reasoning' instead of 'content'
    const message = data.choices?.[0]?.message
    let generatedComment = message?.content?.trim()
    
    // Fallback: Check reasoning field if content is empty
    if (!generatedComment && message?.reasoning) {
      console.log('💡 Extracting from reasoning field')
      const reasoning = message.reasoning
      
      // Try multiple extraction strategies
      // 1. Look for quoted text (most common)
      const quotedMatch = reasoning.match(/"([^"]+)"/g)
      if (quotedMatch && quotedMatch.length > 0) {
        // Get the last quoted string (usually the final comment)
        generatedComment = quotedMatch[quotedMatch.length - 1].replace(/"/g, '').trim()
      }
      
      // 2. If still nothing, try to find comment-like text (15-50 words, ends with punctuation)
      if (!generatedComment) {
        const sentences = reasoning.split(/[.!?]+/)
        for (const sentence of sentences) {
          const words = sentence.trim().split(/\s+/)
          if (words.length >= 10 && words.length <= 50 && !sentence.toLowerCase().includes('the user')) {
            generatedComment = sentence.trim()
            break
          }
        }
      }
    }

    if (!generatedComment || generatedComment.length === 0) {
      console.error('❌ Failed to extract comment from response:', {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        hasContent: !!data.choices?.[0]?.message?.content,
        hasReasoning: !!data.choices?.[0]?.message?.reasoning,
        contentPreview: data.choices?.[0]?.message?.content?.substring(0, 100),
        reasoningPreview: data.choices?.[0]?.message?.reasoning?.substring(0, 200),
        model: selectedModel,
        fullResponse: JSON.stringify(data).substring(0, 500),
        timestamp: new Date().toISOString()
      })
      
      // Provide a helpful fallback message
      return {
        success: false,
        error: `The AI model (${modelConfig.label}) could not generate a comment. Try selecting a different model, tone, or length setting.`,
        model: selectedModel
      }
    }

    // Clean up the comment (remove any prefixes, quotes, or model-specific tags)
    let cleanedComment = generatedComment
      .replace(/^(Comment:|Here's a comment:|Generated comment:)/i, '')
      .replace(/^["']|["']$/g, '') // Remove leading/trailing quotes
      .replace(/<s>\s*/gi, '') // Remove Mistral <s> tags
      .replace(/\s*<\/s>/gi, '') // Remove Mistral </s> tags
      .replace(/\[B_INST\]/gi, '') // Remove Mistral instruction markers
      .replace(/\[\/INST\]/gi, '') // Remove Mistral instruction markers
      .replace(/\[INST\]/gi, '') // Remove other instruction markers
      .replace(/\[\/INST\]/gi, '')
      .trim()

    // Sanitize content
    cleanedComment = sanitizeCommentContent(cleanedComment)

    // Validate content (length and appropriateness)
    const validation = validateCommentContent(cleanedComment)
    if (!validation.isValid) {
      // If validation fails due to length, try to salvage it
      if (validation.reason?.includes('too short') && cleanedComment.length > 0) {
        console.warn('Comment too short, using it anyway:', cleanedComment)
        // Return it anyway if it has content
        return {
          success: true,
          comment: cleanedComment,
          tokensUsed: data.usage?.total_tokens,
          model: selectedModel
        }
      }
      
      return {
        success: false,
        error: validation.reason || 'Generated comment did not pass validation. Please try a different tone or length.',
        model: selectedModel
      }
    }

    // Ensure comment doesn't exceed max length
    if (cleanedComment.length > maxLength) {
      // Truncate at last complete sentence within limit
      const truncated = cleanedComment.substring(0, maxLength)
      const lastPeriod = truncated.lastIndexOf('.')
      const lastExclamation = truncated.lastIndexOf('!')
      const lastQuestion = truncated.lastIndexOf('?')
      const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion)
      
      if (lastSentenceEnd > maxLength * 0.7) {
        cleanedComment = truncated.substring(0, lastSentenceEnd + 1)
      } else {
        cleanedComment = truncated + '...'
      }
    }

    return {
      success: true,
      comment: cleanedComment,
      tokensUsed: data.usage?.total_tokens,
      model: selectedModel
    }

  } catch (error: any) {
    console.error('Error generating AI comment:', error)
    return {
      success: false,
      error: error.message || 'Failed to generate comment'
    }
  }
}


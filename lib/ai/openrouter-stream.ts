/**
 * OpenRouter Streaming Client for Real-time AI Comment Generation
 * Uses Server-Sent Events (SSE) for streaming responses
 */

import type { AIModel, CommentTone, CommentLength } from '@/types/ai'
import { COMMENT_TONE_CONFIGS } from './comment-tone-configs'
import { COMMENT_LENGTH_CONFIGS } from './comment-length-configs'
import { getModelConfig } from './model-configs'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

const SYSTEM_PROMPT = `You are a helpful assistant that generates authentic, engaging comments for project portfolios. 
Your comments should be:
- Genuine and specific to the project described
- Natural and conversational (not robotic)
- CONCISE and to the point
- Free of generic phrases like "Great work!" without context
- Focused on specific aspects mentioned in the project

IMPORTANT: 
1. Generate ONLY the comment text. No prefixes like "Comment:", "Here's a comment:", or quotation marks.
2. Be direct and concise - every word should add value.
3. If you can't generate a comment, return a simple, genuine reaction.`

export interface StreamOptions {
  projectTitle: string
  projectDescription: string
  tone: CommentTone
  length?: CommentLength
  model?: AIModel
  customInstructions?: string
  apiKey: string
  onChunk: (chunk: string) => void
  onComplete: (fullComment: string) => void
  onError: (error: string) => void
}

/**
 * Stream AI comment generation with real-time updates
 */
export async function streamAIComment({
  projectTitle,
  projectDescription,
  tone,
  length = 'medium',
  model,
  customInstructions,
  apiKey,
  onChunk,
  onComplete,
  onError
}: StreamOptions): Promise<void> {
  const toneConfig = COMMENT_TONE_CONFIGS[tone]
  const lengthConfig = COMMENT_LENGTH_CONFIGS[length]
  const selectedModel = model || 'meta-llama/llama-3.3-8b-instruct:free'
  const modelConfig = getModelConfig(selectedModel)

  let userPrompt = `${toneConfig.prompt}

Project Title: "${projectTitle}"

Project Description:
${projectDescription}

Generate a ${tone} comment about this project.

Length: Approximately ${lengthConfig.wordRange}
Keep it under ${lengthConfig.charLimit} characters.

Be concise and specific. Focus on the most interesting aspects.`

  if (customInstructions && customInstructions.trim().length > 0) {
    userPrompt += `\n\nAdditional Instructions: ${customInstructions.trim()}`
  }

  console.log('🌊 Starting stream:', {
    model: selectedModel,
    modelLabel: modelConfig.label,
    tone,
    length,
    timestamp: new Date().toISOString()
  })

  try {
    const response = await fetch(OPENROUTER_API_URL, {
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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 120,
        temperature: 0.6,
        top_p: 0.8,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
        stream: true // Enable streaming
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`
      console.error('❌ Stream error:', errorMessage)
      onError(errorMessage)
      return
    }

    const reader = response.body?.getReader()
    if (!reader) {
      onError('Response body is not readable')
      return
    }

    const decoder = new TextDecoder()
    let buffer = ''
    let fullComment = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Append new chunk to buffer
        buffer += decoder.decode(value, { stream: true })

        // Process complete lines from buffer
        while (true) {
          const lineEnd = buffer.indexOf('\n')
          if (lineEnd === -1) break

          const line = buffer.slice(0, lineEnd).trim()
          buffer = buffer.slice(lineEnd + 1)

          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              console.log('✅ Stream complete')
              break
            }

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content
              
              if (content) {
                fullComment += content
                onChunk(content)
              }
            } catch (e) {
              // Ignore invalid JSON chunks
            }
          }
        }
      }

      // Clean up the final comment
      let cleanedComment = fullComment
        .replace(/^(Comment:|Here's a comment:|Generated comment:)/i, '')
        .replace(/^["']|["']$/g, '')
        .replace(/<s>\s*/gi, '')
        .replace(/\s*<\/s>/gi, '')
        .replace(/\[B_INST\]/gi, '')
        .replace(/\[\/INST\]/gi, '')
        .replace(/\[INST\]/gi, '')
        .replace(/\[\/INST\]/gi, '')
        .trim()

      if (cleanedComment.length > 0) {
        onComplete(cleanedComment)
      } else {
        onError('No comment generated')
      }
    } finally {
      reader.cancel()
    }
  } catch (error: any) {
    console.error('❌ Stream exception:', error)
    onError(error.message || 'An error occurred during streaming')
  }
}


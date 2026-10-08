import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { DEFAULT_AI_MODEL } from '@/lib/ai/model-configs'
import { requireAdmin } from '@/lib/auth-utils'

const GenerateStorySchema = z.object({
  title: z.string().min(1, 'Project title is required').max(200),
  description: z.string().min(1, 'Project description is required').max(5000),
  tech: z.array(z.string()).optional().default([]),
  categories: z.array(z.string()).optional().default([]),
  model: z.string().optional()
})

type GenerateStoryInput = z.infer<typeof GenerateStorySchema>

/**
 * Robustly extract JSON object from raw LLM responses
 * Handles raw JSON, markdown code blocks, and reasoning-prefixed outputs
 */
function extractJsonFromText(rawText: string): any {
  if (!rawText) return null

  // 1. Direct JSON parse
  try {
    return JSON.parse(rawText.trim())
  } catch {}

  // 2. Strip markdown code fences (```json ... ``` or ``` ... ```)
  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim())
    } catch {}
  }

  // 3. Search for outermost balanced { ... } braces
  const firstBrace = rawText.indexOf('{')
  const lastBrace = rawText.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = rawText.substring(firstBrace, lastBrace + 1)
    try {
      return JSON.parse(candidate)
    } catch {}
  }

  return null
}

/**
 * Normalizes fields that may be returned as arrays, strings, or objects
 */
function formatField(val: any): string {
  if (!val) return ''
  if (Array.isArray(val)) {
    return val.map(item => (typeof item === 'string' ? item.trim() : JSON.stringify(item))).join('\n')
  }
  if (typeof val === 'string') return val.trim()
  if (typeof val === 'object') return JSON.stringify(val, null, 2)
  return String(val)
}

export async function POST(request: NextRequest) {
  try {
    // Authorize request on server
    try {
      await requireAdmin(request)
    } catch (authError: any) {
      if (authError instanceof Response) {
        return authError
      }
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'AI generation is not configured. OpenRouter API key missing.' },
        { status: 503 }
      )
    }

    let body: GenerateStoryInput
    try {
      const rawBody = await request.json()
      body = GenerateStorySchema.parse(rawBody)
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message || 'Invalid request body' }, { status: 400 })
    }

    const requestedModel = body.model || DEFAULT_AI_MODEL

    const systemPrompt = `You are an expert technical writer and software engineer. You write extremely detailed, professional case studies and technical stories for portfolio projects.
You must return your output strictly in JSON format. The JSON object must contain exactly four keys: "longDescription", "challenges", "solutions", and "results".

JSON Structure:
{
  "longDescription": "A detailed story supporting markdown formatting. Describe the case study history, architectural decisions, diagrams, infrastructure selections, database setup, and workflows.",
  "challenges": "Engineering obstacles, scaling limitations, or complex requirements encountered.",
  "solutions": "Technical resolutions applied, architectures designed, patterns implemented, and technologies chosen.",
  "results": "Performance metrics, scaling outcomes, load test outcomes, or business impacts."
}

Rules:
1. "longDescription" MUST be detailed and comprehensive. It must support clean Markdown (including headers, bullet points, code blocks). Do not write simple placeholders.
2. Return ONLY the valid JSON string. Do not include introductory or concluding conversational text.
3. Be professional, technical, and realistic based on the project's domain.`

    const userPrompt = `Project Title: "${body.title}"
Project Description: "${body.description}"
Technologies: ${body.tech.join(', ') || 'Various modern tech'}
Categories: ${body.categories.join(', ') || 'Development'}

Please generate a highly professional, detailed case study for this project. Keep it realistic, technical, and descriptive.`

    // Filter out obsolete/dead models from fallback chain
    const modelsToTry = [
      requestedModel && !requestedModel.includes('gpt-oss-20b') && !requestedModel.includes('qwen3-coder') ? requestedModel : 'openrouter/free',
      'openrouter/free',
      'openai/gpt-4o-mini',
      'google/gemini-2.5-flash',
      'deepseek/deepseek-chat',
      'nvidia/nemotron-3.5-lightning:free'
    ].filter((val, i, arr) => arr.indexOf(val) === i)

    let parsedResult: any = null
    let successfulModel = ''
    let lastErrorDetails = ''

    for (const modelToTry of modelsToTry) {
      try {
        console.log(`[AI Story Generator] Requesting completion with: ${modelToTry}`)
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://al-edrisy.space',
            'X-Title': 'Portfolio Case Study Generator'
          },
          body: JSON.stringify({
            model: modelToTry,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 2200,
            include_reasoning: false
          })
        })

        const responseText = await response.text()
        if (!response.ok) {
          lastErrorDetails = `Model ${modelToTry} returned status ${response.status}: ${responseText}`
          console.warn(`[AI Story Generator] Warning: ${lastErrorDetails}`)
          continue
        }

        const data = JSON.parse(responseText)
        const rawContent = data.choices?.[0]?.message?.content || data.choices?.[0]?.message?.reasoning || ''
        const extracted = extractJsonFromText(rawContent)

        if (extracted && (extracted.longDescription || extracted.description || extracted.story)) {
          parsedResult = extracted
          successfulModel = modelToTry
          console.log(`[AI Story Generator] Successfully generated story using: ${modelToTry}`)
          break
        } else {
          lastErrorDetails = `Model ${modelToTry} returned unparseable content: ${rawContent.slice(0, 150)}`
          console.warn(`[AI Story Generator] Warning: ${lastErrorDetails}`)
        }
      } catch (err: any) {
        lastErrorDetails = `Model ${modelToTry} exception: ${err.message}`
        console.error(`[AI Story Generator] Error: ${lastErrorDetails}`)
      }
    }

    if (!parsedResult) {
      console.error('All OpenRouter models failed. Details:', lastErrorDetails)
      return NextResponse.json({
        success: false,
        error: `AI Service is currently rate-limited or unavailable. Details: ${lastErrorDetails}`
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        longDescription: formatField(parsedResult.longDescription || parsedResult.description || parsedResult.story),
        challenges: formatField(parsedResult.challenges),
        solutions: formatField(parsedResult.solutions),
        results: formatField(parsedResult.results),
        modelUsed: successfulModel
      }
    })

  } catch (error: any) {
    console.error('Error in generate-story route:', error)
    return NextResponse.json({ success: false, error: error.message || 'An unexpected error occurred' }, { status: 500 })
  }
}

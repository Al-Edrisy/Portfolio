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

    const selectedModel = body.model || DEFAULT_AI_MODEL

    const systemPrompt = `You are an expert technical writer and software engineer. You write extremely detailed, professional case studies/stories for portfolio projects.
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
2. Do not include any text before or after the JSON block. Do not include markdown code block syntax (like \`\`\`json) in your response, just return the raw JSON string.
3. Be professional, technical, and realistic based on the project's domain.`

    const userPrompt = `Project Title: "${body.title}"
Project Description: "${body.description}"
Technologies: ${body.tech.join(', ') || 'Various modern tech'}
Categories: ${body.categories.join(', ') || 'Development'}

Please generate a highly professional, detailed case study for this project. Keep it realistic, technical, and descriptive.`

    let responseText = ''
    let openRouterResponse: Response | null = null
    let lastErrorDetails = ''

    // Unique list of models to try if the first one is rate-limited or fails
    const modelsToTry = [
      selectedModel,
      'qwen/qwen3-coder:free',
      'nvidia/nemotron-nano-9b-v2:free',
      'openai/gpt-oss-20b:free'
    ].filter((val, i, arr) => arr.indexOf(val) === i)

    for (const modelToTry of modelsToTry) {
      try {
        console.log(`[AI Story Generator] Requesting completions using: ${modelToTry}`)
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            'X-Title': 'Portfolio Case Study Generator'
          },
          body: JSON.stringify({
            model: modelToTry,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 1500,
            response_format: { type: 'json_object' }
          })
        })

        responseText = await response.text()
        if (response.ok) {
          openRouterResponse = response
          break
        } else {
          lastErrorDetails = `Model ${modelToTry} returned status ${response.status}: ${responseText}`
          console.warn(`[AI Story Generator] Warning: ${lastErrorDetails}`)
        }
      } catch (err: any) {
        lastErrorDetails = `Model ${modelToTry} exception: ${err.message}`
        console.error(`[AI Story Generator] Error: ${lastErrorDetails}`)
      }
    }

    if (!openRouterResponse) {
      console.error('All OpenRouter models failed. Details:', lastErrorDetails)
      return NextResponse.json({
        success: false,
        error: `AI Service is currently rate-limited or unavailable. Details: ${lastErrorDetails}`
      }, { status: 500 })
    }

    const data = JSON.parse(responseText)
    const content = data.choices?.[0]?.message?.content?.trim()

    if (!content) {
      return NextResponse.json({ success: false, error: 'AI returned an empty response' }, { status: 500 })
    }

    try {
      const parsed = JSON.parse(content)
      return NextResponse.json({
        success: true,
        data: {
          longDescription: parsed.longDescription || '',
          challenges: parsed.challenges || '',
          solutions: parsed.solutions || '',
          results: parsed.results || ''
        }
      })
    } catch (parseError) {
      console.error('Failed to parse AI JSON response:', content)
      return NextResponse.json({ success: false, error: 'AI failed to output valid JSON format. Please try again.' }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Error in generate-story route:', error)
    return NextResponse.json({ success: false, error: error.message || 'An unexpected error occurred' }, { status: 500 })
  }
}

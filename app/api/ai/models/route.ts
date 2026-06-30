import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'pricing-low-to-high'
    const outputModalities = searchParams.get('output_modalities') || 'text'
    const supportedParameters = searchParams.get('supported_parameters')

    const url = new URL(OPENROUTER_MODELS_URL)
    url.searchParams.set('output_modalities', outputModalities)
    if (sort) {
      url.searchParams.set('sort', sort)
    }
    if (supportedParameters) {
      url.searchParams.set('supported_parameters', supportedParameters)
    }

    // Call OpenRouter Models API with Next.js caching (revalidate after 1 hour)
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      console.error(`Failed to fetch models from OpenRouter: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        { error: 'Failed to fetch models from OpenRouter' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching OpenRouter models:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching models' },
      { status: 500 }
    )
  }
}

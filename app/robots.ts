import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://salihbenotman.dev'
  
  return {
    rules: [
      // Standard search engine crawlers (Google, Bing, DuckDuckGo, Yahoo, Yandex, Baidu)
      {
        userAgent: '*',
        allow: ['/', '/llms.txt', '/llms-full.txt'],
        disallow: ['/api/', '/admin/', '/test/', '/profile/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/test/', '/profile/'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api/', '/admin/', '/test/', '/profile/'],
      },
      // Academic crawlers (Google Scholar, Semantic Scholar, Citer)
      {
        userAgent: ['Googlebot-Scholar', 'SemanticScholarBot'],
        allow: ['/', '/cv/', '/projects/'],
        disallow: ['/api/', '/admin/', '/test/', '/profile/'],
      },
      // Generative Engine Optimization (GEO) & AI Crawlers (OpenAI ChatGPT, Anthropic Claude, Google Gemini, Perplexity, Apple)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'Google-Extended',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Applebot',
          'Applebot-Extended',
          'cohere-ai',
          'Bytespider',
          'CCBot',
          'FacebookBot',
          'meta-externalagent',
          'Diffbot',
        ],
        allow: ['/', '/llms.txt', '/llms-full.txt', '/projects/', '/about/', '/skills/'],
        disallow: ['/api/', '/admin/', '/test/', '/profile/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

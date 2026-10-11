import { MetadataRoute } from 'next'
import { getAllPublishedProjects } from '@/lib/firebase/utils/firebase-utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://salihbenotman.dev'
  const currentDate = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/skills`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  try {
    const projects = await getAllPublishedProjects()
    const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => {
      let lastModified = currentDate
      try {
        if (p.updatedAt) {
          lastModified = typeof p.updatedAt === 'string'
            ? new Date(p.updatedAt)
            : ((p.updatedAt as any)?.toDate ? (p.updatedAt as any).toDate() : new Date(p.updatedAt as any))
        } else if (p.createdAt) {
          lastModified = typeof p.createdAt === 'string'
            ? new Date(p.createdAt)
            : ((p.createdAt as any)?.toDate ? (p.createdAt as any).toDate() : new Date(p.createdAt as any))
        }
      } catch {
        lastModified = currentDate
      }

      return {
        url: `${baseUrl}/projects/${p.id}`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.8,
      }
    })

    return [...staticRoutes, ...projectRoutes]
  } catch (error) {
    console.error('Error fetching dynamic project routes for sitemap:', error)
    return staticRoutes
  }
}

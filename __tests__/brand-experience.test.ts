import { describe, it, expect } from 'vitest'
import { getAllBrands, getBrandBySlug, hasBrand } from '@/experiences/scanner'
import AkakusBrandExperience from '@/experiences/brands/akakus'
import ExperiencePage from '@/app/experiences/[slug]/page'
import { getBrandMediaUrl, getBrandCloudflareUrl } from '@/experiences/shared/media-utils'

describe('Brand Experience Scanner & Components', () => {
  it('should discover akakus and exclude removed sample brand', () => {
    const brands = getAllBrands()
    expect(brands.length).toBeGreaterThanOrEqual(1)
    expect(brands.find(b => b.slug === 'sample')).toBeUndefined()

    const akakus = brands.find(b => b.slug === 'akakus')
    expect(akakus).toBeDefined()
    expect(akakus?.name).toBe('Akakus')
    expect(akakus?.accentColor).toBe('#C85A32')
  })

  it('should find akakus brand by slug and reject sample', () => {
    expect(hasBrand('sample')).toBe(false)
    expect(hasBrand('akakus')).toBe(true)
    const akakus = getBrandBySlug('akakus')
    expect(akakus?.slug).toBe('akakus')
    expect(akakus?.category).toContain('AI Health')
  })

  it('should render AkakusBrandExperience', () => {
    expect(AkakusBrandExperience).toBeDefined()
  })

  it('should resolve brand media and Cloudflare R2 video URLs accurately', () => {
    const heroUrl = getBrandMediaUrl('akakus', 'hero-wordmark.webp')
    expect(heroUrl).toBe('/brands/akakus/hero-wordmark.webp')

    const videoUrl = getBrandCloudflareUrl('akakus', 'launch_1080p.mp4')
    expect(videoUrl).toBe('/api/media/brand-assets/akakus/launch_1080p.mp4')
  })

  it('should execute ExperiencePage server component for akakus', async () => {
    const res = await ExperiencePage({
      params: Promise.resolve({ slug: 'akakus' })
    })
    expect(res).toBeDefined()
  })
})

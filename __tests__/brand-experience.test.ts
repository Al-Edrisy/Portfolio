import { describe, it, expect } from 'vitest'
import { getAllBrands, getBrandBySlug, hasBrand } from '@/experiences/scanner'
import AkakusBrandExperience from '@/experiences/brands/akakus'
import ExperiencePage, { generateMetadata } from '@/app/experiences/[slug]/page'
import { getBrandMediaUrl, getBrandCloudflareUrl } from '@/experiences/shared/media-utils'
import { toAbsoluteUrl, getSiteUrl } from '@/lib/utils/site-url'

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

  it('should resolve absolute URLs for social sharing', () => {
    const absUrl = toAbsoluteUrl('/brands/akakus/hero-wordmark.webp')
    expect(absUrl).toMatch(/^https:\/\/.+\/brands\/akakus\/hero-wordmark\.webp$/)
    expect(absUrl).not.toContain('salihbenotman.dev')
  })

  it('should generate rich OpenGraph and Twitter card metadata with images for akakus', async () => {
    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'akakus' }),
    })
    expect(meta.openGraph).toBeDefined()
    expect(meta.openGraph?.images).toBeDefined()
    const ogImages = meta.openGraph?.images as any[]
    expect(ogImages.length).toBeGreaterThan(0)
    expect(ogImages[0].url).toContain('/brands/akakus/hero-wordmark.webp')
    expect(ogImages[0].width).toBe(1200)
    expect(ogImages[0].height).toBe(630)

    expect(meta.twitter).toBeDefined()
    expect((meta.twitter as any)?.card).toBe('summary_large_image')
  })

  it('should execute ExperiencePage server component for akakus', async () => {
    const res = await ExperiencePage({
      params: Promise.resolve({ slug: 'akakus' })
    })
    expect(res).toBeDefined()
  })
})

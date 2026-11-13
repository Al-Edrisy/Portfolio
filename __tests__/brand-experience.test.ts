import { describe, it, expect } from 'vitest'
import { getAllBrands, getBrandBySlug, hasBrand } from '@/experiences/scanner'
import SampleBrandExperience from '@/experiences/brands/sample'
import AkakusBrandExperience from '@/experiences/brands/akakus'
import ExperiencePage from '@/app/experiences/[slug]/page'
import { getBrandMediaUrl } from '@/experiences/shared/media-utils'

describe('Brand Experience Scanner & Components', () => {
  it('should discover sample and akakus brands', () => {
    const brands = getAllBrands()
    expect(brands.length).toBeGreaterThanOrEqual(2)
    const sample = brands.find(b => b.slug === 'sample')
    expect(sample).toBeDefined()
    expect(sample?.name).toBe('Sample Brand Experience')

    const akakus = brands.find(b => b.slug === 'akakus')
    expect(akakus).toBeDefined()
    expect(akakus?.name).toBe('Akakus')
    expect(akakus?.accentColor).toBe('#C85A32')
  })

  it('should find brand by slug', () => {
    expect(hasBrand('sample')).toBe(true)
    expect(hasBrand('akakus')).toBe(true)
    const akakus = getBrandBySlug('akakus')
    expect(akakus?.slug).toBe('akakus')
    expect(akakus?.category).toContain('AI Health')
  })

  it('should render SampleBrandExperience and AkakusBrandExperience', () => {
    expect(SampleBrandExperience).toBeDefined()
    expect(AkakusBrandExperience).toBeDefined()
  })

  it('should resolve brand media URLs accurately', () => {
    const charUrl = getBrandMediaUrl('akakus', 'characters/fuel-up.webp')
    expect(charUrl).toBe('/brands/akakus/characters/fuel-up.webp')
  })

  it('should execute ExperiencePage server component for akakus', async () => {
    const res = await ExperiencePage({
      params: Promise.resolve({ slug: 'akakus' })
    })
    expect(res).toBeDefined()
  })
})

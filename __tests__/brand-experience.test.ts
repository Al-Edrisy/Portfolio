import { describe, it, expect } from 'vitest'
import { getAllBrands, getBrandBySlug, hasBrand } from '@/experiences/scanner'
import SampleBrandExperience from '@/experiences/brands/sample'
import ExperiencePage from '@/app/experiences/[slug]/page'

describe('Brand Experience Scanner & Components', () => {
  it('should discover sample brand', () => {
    const brands = getAllBrands()
    expect(brands.length).toBeGreaterThan(0)
    const sample = brands.find(b => b.slug === 'sample')
    expect(sample).toBeDefined()
    expect(sample?.name).toBe('Sample Brand Experience')
  })

  it('should find brand by slug', () => {
    expect(hasBrand('sample')).toBe(true)
    const sample = getBrandBySlug('sample')
    expect(sample?.slug).toBe('sample')
  })

  it('should render SampleBrandExperience', () => {
    expect(SampleBrandExperience).toBeDefined()
  })

  it('should execute ExperiencePage server component', async () => {
    const res = await ExperiencePage({
      params: Promise.resolve({ slug: 'sample' })
    })
    expect(res).toBeDefined()
  })
})

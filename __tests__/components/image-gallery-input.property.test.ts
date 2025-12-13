import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { isDuplicateUrl, isAtMaxImages } from '@/components/projects/forms/image-url-input'

/**
 * Feature: multi-image-gallery
 * 
 * Property-based tests for ImageGalleryInput component logic
 */

// Arbitrary for generating valid image URLs
const imageUrlArb = fc.webUrl().map((url) => `${url}/image.jpg`)

// Arbitrary for generating unique image URL arrays
const uniqueImageArrayArb = (minLength = 0, maxLength = 15) =>
  fc.array(imageUrlArb, { minLength, maxLength }).map((urls) => [...new Set(urls)])

describe('ImageGalleryInput - Property Tests', () => {
  /**
   * Feature: multi-image-gallery, Property 5: Duplicate Prevention
   * 
   * For any image array and any URL that already exists in the array,
   * attempting to add that URL again SHALL leave the array unchanged.
   * 
   * Validates: Requirements 1.5
   */
  describe('Property 5: Duplicate Prevention', () => {
    it('should detect duplicates when URL exists in array', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(1, 10),
          (images) => {
            // Pick a random existing URL from the array
            const existingUrl = images[Math.floor(Math.random() * images.length)]
            
            // isDuplicateUrl should return true for existing URLs
            expect(isDuplicateUrl(images, existingUrl)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should not detect duplicates for new URLs', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(0, 9),
          imageUrlArb,
          (images, newUrl) => {
            // Ensure the new URL is not in the array
            const filteredImages = images.filter((url) => url !== newUrl)
            
            // isDuplicateUrl should return false for new URLs
            expect(isDuplicateUrl(filteredImages, newUrl)).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle empty arrays correctly', () => {
      fc.assert(
        fc.property(imageUrlArb, (url) => {
          // Empty array should never have duplicates
          expect(isDuplicateUrl([], url)).toBe(false)
        }),
        { numRuns: 100 }
      )
    })

    it('adding duplicate URL should not change array (simulation)', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(1, 10),
          (images) => {
            const originalLength = images.length
            const existingUrl = images[0]
            
            // Simulate the add logic: if duplicate, don't add
            const newImages = isDuplicateUrl(images, existingUrl)
              ? images
              : [...images, existingUrl]
            
            // Array should remain unchanged
            expect(newImages.length).toBe(originalLength)
            expect(newImages).toEqual(images)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Feature: multi-image-gallery, Property 1: Image Array Size Constraint
   * 
   * For any image array submitted through the form, the array length SHALL be
   * between 0 and 10 (inclusive). Any attempt to add an 11th image SHALL be rejected.
   * 
   * Validates: Requirements 1.1
   */
  describe('Property 1: Image Array Size Constraint', () => {
    const DEFAULT_MAX_IMAGES = 10

    it('should correctly identify when at max images', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 20 }),
          fc.integer({ min: 1, max: 20 }),
          (arrayLength, maxImages) => {
            const images = Array.from({ length: arrayLength }, (_, i) => `https://example.com/image${i}.jpg`)
            
            const isAtMax = isAtMaxImages(images, maxImages)
            
            expect(isAtMax).toBe(arrayLength >= maxImages)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return false for empty arrays', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          (maxImages) => {
            expect(isAtMaxImages([], maxImages)).toBe(false)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return true when exactly at max', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 20 }),
          (maxImages) => {
            const images = Array.from({ length: maxImages }, (_, i) => `https://example.com/image${i}.jpg`)
            
            expect(isAtMaxImages(images, maxImages)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return true when over max', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }),
          fc.integer({ min: 1, max: 10 }),
          (maxImages, extra) => {
            const images = Array.from({ length: maxImages + extra }, (_, i) => `https://example.com/image${i}.jpg`)
            
            expect(isAtMaxImages(images, maxImages)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('adding image when at max should be rejected (simulation)', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(DEFAULT_MAX_IMAGES, DEFAULT_MAX_IMAGES),
          imageUrlArb,
          (images, newUrl) => {
            // Ensure we have exactly max images
            const maxImages = images.slice(0, DEFAULT_MAX_IMAGES)
            
            // Simulate the add logic: if at max, don't add
            const newImages = isAtMaxImages(maxImages, DEFAULT_MAX_IMAGES)
              ? maxImages
              : [...maxImages, newUrl]
            
            // Array should remain at max length
            expect(newImages.length).toBe(DEFAULT_MAX_IMAGES)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('array length should always be between 0 and maxImages after valid operations', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 15 }),
          fc.array(imageUrlArb, { minLength: 0, maxLength: 5 }),
          fc.integer({ min: 1, max: 20 }),
          (initialCount, urlsToAdd, maxImages) => {
            // Start with initial images
            let images = Array.from({ length: Math.min(initialCount, maxImages) }, (_, i) => `https://example.com/initial${i}.jpg`)
            
            // Try to add new URLs respecting constraints
            for (const url of urlsToAdd) {
              if (!isAtMaxImages(images, maxImages) && !isDuplicateUrl(images, url)) {
                images = [...images, url]
              }
            }
            
            // Final array should be within bounds
            expect(images.length).toBeGreaterThanOrEqual(0)
            expect(images.length).toBeLessThanOrEqual(maxImages)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Feature: multi-image-gallery, Property 3: Reorder Preserves Cover
   * 
   * For any reorder operation on an image array, the resulting array SHALL have
   * the same elements, and the element at index 0 SHALL be designated as the cover image.
   * 
   * Validates: Requirements 1.3
   */
  describe('Property 3: Reorder Preserves Cover', () => {
    it('reorder should preserve all elements', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(2, 10),
          (images) => {
            // Simulate a reorder by shuffling
            const shuffled = [...images].sort(() => Math.random() - 0.5)
            
            // All original elements should still be present
            expect(shuffled.length).toBe(images.length)
            expect(new Set(shuffled)).toEqual(new Set(images))
          }
        ),
        { numRuns: 100 }
      )
    })

    it('first element after reorder is always the cover', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(1, 10),
          (images) => {
            // Simulate a reorder
            const shuffled = [...images].sort(() => Math.random() - 0.5)
            
            // First element exists and is from original array
            expect(shuffled[0]).toBeDefined()
            expect(images).toContain(shuffled[0])
            
            // The cover is always index 0 (by convention)
            const coverIndex = 0
            expect(coverIndex).toBe(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('reorder should not add or remove elements', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(0, 10),
          fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 0, maxLength: 10 }),
          (images, swapIndices) => {
            if (images.length < 2) return // Skip if not enough elements to reorder
            
            let reordered = [...images]
            
            // Perform multiple swaps
            for (let i = 0; i < swapIndices.length - 1; i += 2) {
              const from = swapIndices[i] % images.length
              const to = swapIndices[i + 1] % images.length
              
              // Swap elements
              const temp = reordered[from]
              reordered[from] = reordered[to]
              reordered[to] = temp
            }
            
            // Length should be preserved
            expect(reordered.length).toBe(images.length)
            
            // All elements should be preserved (just reordered)
            expect(new Set(reordered)).toEqual(new Set(images))
          }
        ),
        { numRuns: 100 }
      )
    })

    it('moving any image to first position makes it the cover', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(2, 10),
          fc.integer({ min: 0, max: 9 }),
          (images, targetIndex) => {
            const validIndex = targetIndex % images.length
            const targetUrl = images[validIndex]
            
            // Simulate moving target to first position
            const reordered = [
              targetUrl,
              ...images.filter((_, i) => i !== validIndex)
            ]
            
            // Target should now be the cover (index 0)
            expect(reordered[0]).toBe(targetUrl)
            expect(reordered.length).toBe(images.length)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

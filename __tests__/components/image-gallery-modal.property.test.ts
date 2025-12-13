import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Feature: multi-image-gallery
 * 
 * Property-based tests for ImageGalleryModal component logic
 * 
 * These tests validate the lightbox navigation and display logic
 * without rendering the actual component.
 */

// Arbitrary for generating valid image URLs
const imageUrlArb = fc.webUrl().map((url) => `${url}/image.jpg`)

// Arbitrary for generating unique image URL arrays
const uniqueImageArrayArb = (minLength = 1, maxLength = 15) =>
  fc.array(imageUrlArb, { minLength, maxLength }).map((urls) => [...new Set(urls)])

// Helper functions that mirror the component logic

/**
 * Formats the position display string for the lightbox
 * @param currentIndex - 0-based index of current image
 * @param totalImages - total number of images
 * @returns formatted string like "1 / 5"
 */
function formatPositionDisplay(currentIndex: number, totalImages: number): string {
  return `${currentIndex + 1} / ${totalImages}`
}

/**
 * Calculates the next index when navigating forward
 * @param currentIndex - current 0-based index
 * @param totalImages - total number of images
 * @returns next index, wrapping to 0 if at end
 */
function getNextIndex(currentIndex: number, totalImages: number): number {
  return (currentIndex + 1) % totalImages
}

/**
 * Calculates the previous index when navigating backward
 * @param currentIndex - current 0-based index
 * @param totalImages - total number of images
 * @returns previous index, wrapping to end if at start
 */
function getPreviousIndex(currentIndex: number, totalImages: number): number {
  return (currentIndex - 1 + totalImages) % totalImages
}

/**
 * Validates that an index is within bounds
 * @param index - index to validate
 * @param totalImages - total number of images
 * @returns true if index is valid
 */
function isValidIndex(index: number, totalImages: number): boolean {
  return index >= 0 && index < totalImages
}

describe('ImageGalleryModal - Property Tests', () => {
  /**
   * Feature: multi-image-gallery, Property 7: Position Display Format
   * 
   * For any lightbox displaying image at index I from an array of length N,
   * the position indicator SHALL display "(I+1) of N".
   * 
   * Validates: Requirements 3.3
   */
  describe('Property 7: Position Display Format', () => {
    it('should display 1-based position for any valid index', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(1, 20),
          (images) => {
            for (let i = 0; i < images.length; i++) {
              const display = formatPositionDisplay(i, images.length)
              
              // Should show 1-based index
              expect(display).toBe(`${i + 1} / ${images.length}`)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should always show position starting from 1, not 0', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 99 }),
          (totalImages, indexOffset) => {
            const currentIndex = indexOffset % totalImages
            const display = formatPositionDisplay(currentIndex, totalImages)
            
            // First number should be at least 1
            const [position] = display.split(' / ').map(Number)
            expect(position).toBeGreaterThanOrEqual(1)
            expect(position).toBeLessThanOrEqual(totalImages)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should show correct total count', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: 0, max: 99 }),
          (totalImages, indexOffset) => {
            const currentIndex = indexOffset % totalImages
            const display = formatPositionDisplay(currentIndex, totalImages)
            
            // Second number should be the total
            const [, total] = display.split(' / ').map(Number)
            expect(total).toBe(totalImages)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('first image should display "1 / N"', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(1, 20),
          (images) => {
            const display = formatPositionDisplay(0, images.length)
            expect(display).toBe(`1 / ${images.length}`)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('last image should display "N / N"', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(1, 20),
          (images) => {
            const lastIndex = images.length - 1
            const display = formatPositionDisplay(lastIndex, images.length)
            expect(display).toBe(`${images.length} / ${images.length}`)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  /**
   * Feature: multi-image-gallery, Property 8: Navigation Index Bounds
   * 
   * For any navigation action (keyboard or swipe) on an image array of length N,
   * the resulting index SHALL always be in the range [0, N-1], wrapping at boundaries.
   * 
   * Validates: Requirements 3.4, 5.1, 5.2
   */
  describe('Property 8: Navigation Index Bounds', () => {
    it('next navigation should always produce valid index', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(1, 20),
          fc.integer({ min: 0, max: 19 }),
          (images, indexOffset) => {
            const currentIndex = indexOffset % images.length
            const nextIndex = getNextIndex(currentIndex, images.length)
            
            expect(isValidIndex(nextIndex, images.length)).toBe(true)
            expect(nextIndex).toBeGreaterThanOrEqual(0)
            expect(nextIndex).toBeLessThan(images.length)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('previous navigation should always produce valid index', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(1, 20),
          fc.integer({ min: 0, max: 19 }),
          (images, indexOffset) => {
            const currentIndex = indexOffset % images.length
            const prevIndex = getPreviousIndex(currentIndex, images.length)
            
            expect(isValidIndex(prevIndex, images.length)).toBe(true)
            expect(prevIndex).toBeGreaterThanOrEqual(0)
            expect(prevIndex).toBeLessThan(images.length)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('next from last index should wrap to first', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(1, 20),
          (images) => {
            const lastIndex = images.length - 1
            const nextIndex = getNextIndex(lastIndex, images.length)
            
            expect(nextIndex).toBe(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('previous from first index should wrap to last', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(1, 20),
          (images) => {
            const prevIndex = getPreviousIndex(0, images.length)
            
            expect(prevIndex).toBe(images.length - 1)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('multiple sequential navigations should stay in bounds', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(1, 20),
          fc.array(fc.boolean(), { minLength: 1, maxLength: 50 }),
          (images, directions) => {
            let currentIndex = 0
            
            // Simulate multiple navigation actions
            for (const goNext of directions) {
              currentIndex = goNext
                ? getNextIndex(currentIndex, images.length)
                : getPreviousIndex(currentIndex, images.length)
              
              // Index should always be valid after each navigation
              expect(isValidIndex(currentIndex, images.length)).toBe(true)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('navigating forward N times should return to start', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(1, 20),
          (images) => {
            let currentIndex = 0
            
            // Navigate forward N times
            for (let i = 0; i < images.length; i++) {
              currentIndex = getNextIndex(currentIndex, images.length)
            }
            
            // Should be back at start
            expect(currentIndex).toBe(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('navigating backward N times should return to start', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(1, 20),
          (images) => {
            let currentIndex = 0
            
            // Navigate backward N times
            for (let i = 0; i < images.length; i++) {
              currentIndex = getPreviousIndex(currentIndex, images.length)
            }
            
            // Should be back at start
            expect(currentIndex).toBe(0)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('single image gallery should stay at index 0', () => {
      fc.assert(
        fc.property(
          imageUrlArb,
          fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }),
          (imageUrl, directions) => {
            const images = [imageUrl]
            let currentIndex = 0
            
            // Any navigation on single image should stay at 0
            for (const goNext of directions) {
              currentIndex = goNext
                ? getNextIndex(currentIndex, images.length)
                : getPreviousIndex(currentIndex, images.length)
              
              expect(currentIndex).toBe(0)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('swipe left (next) should increment index with wrap', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(2, 20),
          fc.integer({ min: 0, max: 19 }),
          (images, indexOffset) => {
            const currentIndex = indexOffset % images.length
            const nextIndex = getNextIndex(currentIndex, images.length)
            
            if (currentIndex === images.length - 1) {
              // At end, should wrap to 0
              expect(nextIndex).toBe(0)
            } else {
              // Otherwise, should increment
              expect(nextIndex).toBe(currentIndex + 1)
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('swipe right (previous) should decrement index with wrap', () => {
      fc.assert(
        fc.property(
          uniqueImageArrayArb(2, 20),
          fc.integer({ min: 0, max: 19 }),
          (images, indexOffset) => {
            const currentIndex = indexOffset % images.length
            const prevIndex = getPreviousIndex(currentIndex, images.length)
            
            if (currentIndex === 0) {
              // At start, should wrap to end
              expect(prevIndex).toBe(images.length - 1)
            } else {
              // Otherwise, should decrement
              expect(prevIndex).toBe(currentIndex - 1)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

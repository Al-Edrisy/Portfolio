import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  getProjectImages,
  getCoverImage,
  getGalleryImages,
  hasMultipleImages,
  getImageCount,
  filterFailedImages,
  getValidImageCount,
  allImagesFailed,
  isImageFailed,
  markImageAsFailed,
  type ImageErrorState,
} from '@/lib/utils/image-helpers'
import type { Project } from '@/types'

/**
 * Feature: multi-image-gallery, Property 9: Legacy Image Migration
 * 
 * For any project with only the legacy `image` field set (and no `images` array),
 * the system SHALL treat it as equivalent to `images: [image]`.
 * 
 * Validates: Requirements 4.3
 */

// Arbitrary for generating valid image URLs
const imageUrlArb = fc.webUrl().map((url) => `${url}/image.jpg`)

// Arbitrary for generating a minimal valid Project object
const baseProjectArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1 }),
  description: fc.string(),
  tech: fc.array(fc.string()),
  categories: fc.array(fc.string()),
  link: fc.webUrl(),
  github: fc.webUrl(),
  createdAt: fc.date(),
  updatedAt: fc.date(),
  published: fc.boolean(),
  authorId: fc.uuid(),
  authorName: fc.string({ minLength: 1 }),
  reactionsCount: fc.constant({
    like: 0,
    love: 0,
    fire: 0,
    wow: 0,
    laugh: 0,
    idea: 0,
    rocket: 0,
    clap: 0,
  }),
  commentsCount: fc.nat(),
  viewsCount: fc.nat(),
})

describe('Image Helpers - Property Tests', () => {
  describe('Property 9: Legacy Image Migration', () => {
    it('should treat legacy image field as images[0] when images array is empty or undefined', () => {
      fc.assert(
        fc.property(baseProjectArb, imageUrlArb, (baseProject, legacyImage) => {
          // Project with only legacy image field (no images array)
          const projectWithLegacyImage: Project = {
            ...baseProject,
            image: legacyImage,
            images: undefined,
          }

          const result = getProjectImages(projectWithLegacyImage)

          // Should return array with single legacy image
          expect(result).toEqual([legacyImage])
          expect(result.length).toBe(1)
          expect(result[0]).toBe(legacyImage)
        }),
        { numRuns: 100 }
      )
    })

    it('should treat legacy image field as images[0] when images array is empty', () => {
      fc.assert(
        fc.property(baseProjectArb, imageUrlArb, (baseProject, legacyImage) => {
          // Project with legacy image and empty images array
          const projectWithEmptyImages: Project = {
            ...baseProject,
            image: legacyImage,
            images: [],
          }

          const result = getProjectImages(projectWithEmptyImages)

          // Should fall back to legacy image
          expect(result).toEqual([legacyImage])
        }),
        { numRuns: 100 }
      )
    })

    it('should prefer images array over legacy image field when both exist', () => {
      fc.assert(
        fc.property(
          baseProjectArb,
          imageUrlArb,
          fc.array(imageUrlArb, { minLength: 1, maxLength: 10 }),
          (baseProject, legacyImage, imagesArray) => {
            // Project with both legacy image and images array
            const projectWithBoth: Project = {
              ...baseProject,
              image: legacyImage,
              images: imagesArray,
            }

            const result = getProjectImages(projectWithBoth)

            // Should use images array, not legacy image
            expect(result).toEqual(imagesArray)
            expect(result).not.toContain(legacyImage) // Unless it happens to be in the array
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should return empty array when no images exist', () => {
      fc.assert(
        fc.property(baseProjectArb, (baseProject) => {
          // Project with no images at all
          const projectWithNoImages: Project = {
            ...baseProject,
            image: undefined,
            images: undefined,
          }

          const result = getProjectImages(projectWithNoImages)

          expect(result).toEqual([])
          expect(result.length).toBe(0)
        }),
        { numRuns: 100 }
      )
    })

    it('getCoverImage should return legacy image when no images array', () => {
      fc.assert(
        fc.property(baseProjectArb, imageUrlArb, (baseProject, legacyImage) => {
          const projectWithLegacyImage: Project = {
            ...baseProject,
            image: legacyImage,
            images: undefined,
          }

          const cover = getCoverImage(projectWithLegacyImage)

          expect(cover).toBe(legacyImage)
        }),
        { numRuns: 100 }
      )
    })

    it('getGalleryImages should return empty array for legacy single-image projects', () => {
      fc.assert(
        fc.property(baseProjectArb, imageUrlArb, (baseProject, legacyImage) => {
          const projectWithLegacyImage: Project = {
            ...baseProject,
            image: legacyImage,
            images: undefined,
          }

          const gallery = getGalleryImages(projectWithLegacyImage)

          // Legacy single image becomes cover, so gallery should be empty
          expect(gallery).toEqual([])
        }),
        { numRuns: 100 }
      )
    })

    it('hasMultipleImages should return false for legacy single-image projects', () => {
      fc.assert(
        fc.property(baseProjectArb, imageUrlArb, (baseProject, legacyImage) => {
          const projectWithLegacyImage: Project = {
            ...baseProject,
            image: legacyImage,
            images: undefined,
          }

          expect(hasMultipleImages(projectWithLegacyImage)).toBe(false)
        }),
        { numRuns: 100 }
      )
    })

    it('getImageCount should return 1 for legacy single-image projects', () => {
      fc.assert(
        fc.property(baseProjectArb, imageUrlArb, (baseProject, legacyImage) => {
          const projectWithLegacyImage: Project = {
            ...baseProject,
            image: legacyImage,
            images: undefined,
          }

          expect(getImageCount(projectWithLegacyImage)).toBe(1)
        }),
        { numRuns: 100 }
      )
    })
  })

  describe('Image Array Consistency', () => {
    it('getCoverImage should always return first element of getProjectImages', () => {
      fc.assert(
        fc.property(
          baseProjectArb,
          fc.option(imageUrlArb),
          fc.option(fc.array(imageUrlArb, { minLength: 0, maxLength: 10 })),
          (baseProject, legacyImage, imagesArray) => {
            const project: Project = {
              ...baseProject,
              image: legacyImage ?? undefined,
              images: imagesArray ?? undefined,
            }

            const allImages = getProjectImages(project)
            const cover = getCoverImage(project)

            if (allImages.length > 0) {
              expect(cover).toBe(allImages[0])
            } else {
              expect(cover).toBeUndefined()
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    it('getGalleryImages should return all images except first', () => {
      fc.assert(
        fc.property(
          baseProjectArb,
          fc.array(imageUrlArb, { minLength: 0, maxLength: 10 }),
          (baseProject, imagesArray) => {
            const project: Project = {
              ...baseProject,
              images: imagesArray,
            }

            const allImages = getProjectImages(project)
            const gallery = getGalleryImages(project)

            expect(gallery).toEqual(allImages.slice(1))
          }
        ),
        { numRuns: 100 }
      )
    })

    it('cover + gallery should equal all images', () => {
      fc.assert(
        fc.property(
          baseProjectArb,
          fc.array(imageUrlArb, { minLength: 1, maxLength: 10 }),
          (baseProject, imagesArray) => {
            const project: Project = {
              ...baseProject,
              images: imagesArray,
            }

            const allImages = getProjectImages(project)
            const cover = getCoverImage(project)
            const gallery = getGalleryImages(project)

            const reconstructed = cover ? [cover, ...gallery] : gallery
            expect(reconstructed).toEqual(allImages)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})


/**
 * Feature: multi-image-gallery, Property 10: Error Resilience
 * 
 * For any image array where some images fail to load, the system SHALL
 * continue displaying the remaining valid images without breaking the layout.
 * 
 * Validates: Requirements 4.4
 */
describe('Property 10: Error Resilience', () => {
  // Arbitrary for generating error states
  const errorStateArb = (images: string[]) =>
    fc.record(
      Object.fromEntries(images.map((url) => [url, fc.boolean()]))
    ) as fc.Arbitrary<ImageErrorState>

  it('should filter out failed images while keeping valid ones', () => {
    fc.assert(
      fc.property(
        fc.array(imageUrlArb, { minLength: 1, maxLength: 10 }),
        (images) => {
          // Create error state where some images fail
          const errorState: ImageErrorState = {}
          images.forEach((url, i) => {
            errorState[url] = i % 2 === 0 // Every other image fails
          })

          const validImages = filterFailedImages(images, errorState)

          // Valid images should not include failed ones
          validImages.forEach((url) => {
            expect(errorState[url]).not.toBe(true)
          })

          // All non-failed images should be included
          const expectedValid = images.filter((url) => !errorState[url])
          expect(validImages).toEqual(expectedValid)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return all images when no errors exist', () => {
    fc.assert(
      fc.property(
        fc.array(imageUrlArb, { minLength: 0, maxLength: 10 }),
        (images) => {
          const emptyErrorState: ImageErrorState = {}

          const validImages = filterFailedImages(images, emptyErrorState)

          expect(validImages).toEqual(images)
          expect(validImages.length).toBe(images.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return empty array when all images fail', () => {
    fc.assert(
      fc.property(
        fc.array(imageUrlArb, { minLength: 1, maxLength: 10 }),
        (images) => {
          // All images fail
          const allFailedState: ImageErrorState = {}
          images.forEach((url) => {
            allFailedState[url] = true
          })

          const validImages = filterFailedImages(images, allFailedState)

          expect(validImages).toEqual([])
          expect(allImagesFailed(images, allFailedState)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('getValidImageCount should equal filtered array length', () => {
    fc.assert(
      fc.property(
        fc.array(imageUrlArb, { minLength: 0, maxLength: 10 }),
        fc.array(fc.boolean(), { minLength: 0, maxLength: 10 }),
        (images, failures) => {
          const errorState: ImageErrorState = {}
          images.forEach((url, i) => {
            if (failures[i]) errorState[url] = true
          })

          const count = getValidImageCount(images, errorState)
          const filtered = filterFailedImages(images, errorState)

          expect(count).toBe(filtered.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('isImageFailed should correctly identify failed images', () => {
    fc.assert(
      fc.property(
        fc.array(imageUrlArb, { minLength: 1, maxLength: 10 }),
        fc.nat({ max: 9 }),
        (images, failIndex) => {
          const validIndex = failIndex % images.length
          const failedUrl = images[validIndex]

          const errorState: ImageErrorState = { [failedUrl]: true }

          expect(isImageFailed(failedUrl, errorState)).toBe(true)

          // Other images should not be marked as failed
          images
            .filter((url) => url !== failedUrl)
            .forEach((url) => {
              expect(isImageFailed(url, errorState)).toBe(false)
            })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('markImageAsFailed should add URL to error state immutably', () => {
    fc.assert(
      fc.property(imageUrlArb, imageUrlArb, (existingFailed, newFailed) => {
        const initialState: ImageErrorState = { [existingFailed]: true }

        const newState = markImageAsFailed(initialState, newFailed)

        // New state should have both URLs marked as failed
        expect(newState[existingFailed]).toBe(true)
        expect(newState[newFailed]).toBe(true)

        // Original state should be unchanged (immutability)
        expect(initialState).toEqual({ [existingFailed]: true })
      }),
      { numRuns: 100 }
    )
  })

  it('valid + failed images should equal total images', () => {
    fc.assert(
      fc.property(
        fc.array(imageUrlArb, { minLength: 1, maxLength: 10 }),
        (images) => {
          // Randomly fail some images
          const errorState: ImageErrorState = {}
          let failedCount = 0
          images.forEach((url, i) => {
            if (i % 3 === 0) {
              errorState[url] = true
              failedCount++
            }
          })

          const validCount = getValidImageCount(images, errorState)

          // Valid + failed should equal total
          expect(validCount + failedCount).toBe(images.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('allImagesFailed should return false for empty arrays', () => {
    const emptyImages: string[] = []
    const errorState: ImageErrorState = {}

    expect(allImagesFailed(emptyImages, errorState)).toBe(false)
  })

  it('filtering should preserve image order', () => {
    fc.assert(
      fc.property(
        fc.array(imageUrlArb, { minLength: 2, maxLength: 10 }),
        (images) => {
          // Fail only the first image
          const errorState: ImageErrorState = { [images[0]]: true }

          const validImages = filterFailedImages(images, errorState)

          // Order should be preserved (remaining images in original order)
          expect(validImages).toEqual(images.slice(1))
        }
      ),
      { numRuns: 100 }
    )
  })
})

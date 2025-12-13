import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

/**
 * Feature: multi-image-gallery, Property 4: Persistence Round-Trip
 * 
 * For any valid project data saved to Firestore, when retrieved via docToProject,
 * the images array SHALL maintain the same order and content as originally saved.
 * 
 * Validates: Requirements 1.4, 4.1, 4.2
 */

// Mock firebase module before imports
vi.mock('../../lib/firebase', () => ({
  db: {},
}))

// Mock Timestamp to avoid Firestore SDK range limitations in tests
const mockTimestamp = (date: Date) => ({
  toDate: () => date,
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: (date.getTime() % 1000) * 1000000,
})

// Mock QueryDocumentSnapshot type
interface MockQueryDocumentSnapshot {
  id: string
  data: () => Record<string, unknown>
  exists: () => boolean
}

// Helper to create a mock QueryDocumentSnapshot
function createMockDocSnapshot(id: string, data: Record<string, unknown>): MockQueryDocumentSnapshot {
  return {
    id,
    data: () => data,
    exists: () => true,
  }
}

// Arbitrary for generating valid image URLs
const imageUrlArb = fc.webUrl().map((url) => `${url}/image.jpg`)

// Constrain dates to valid Firestore range (1970-2100)
const validDateArb = fc.date({
  min: new Date('1970-01-01T00:00:00.000Z'),
  max: new Date('2100-12-31T23:59:59.999Z'),
})

// Arbitrary for generating mock Firestore images structure
const firestoreImagesArb = fc.record({
  cover: imageUrlArb,
  gallery: fc.array(imageUrlArb, { minLength: 0, maxLength: 9 }),
  thumbnails: fc.array(imageUrlArb, { minLength: 0, maxLength: 10 }),
})

// Arbitrary for generating a valid ProjectDocument as stored in Firestore
const projectDocumentArb = fc.record({
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 0, maxLength: 500 }),
  images: firestoreImagesArb,
  tech: fc.array(fc.string({ minLength: 1 }), { minLength: 0, maxLength: 20 }),
  category: fc.string({ minLength: 1 }),
  link: fc.option(fc.webUrl(), { nil: undefined }),
  github: fc.option(fc.webUrl(), { nil: undefined }),
  createdAt: validDateArb.map(mockTimestamp),
  updatedAt: validDateArb.map(mockTimestamp),
  published: fc.boolean(),
  authorId: fc.uuid(),
  authorName: fc.string({ minLength: 1 }),
  authorAvatar: fc.option(fc.webUrl(), { nil: undefined }),
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
  commentsCount: fc.nat({ max: 1000 }),
  viewsCount: fc.nat({ max: 10000 }),
  sharesCount: fc.nat({ max: 1000 }),
})

// Import after mocking
import { docToProject } from '@/lib/firebase/utils/firebase-utils'

describe('Firebase Utils - Property Tests', () => {
  describe('Property 4: Persistence Round-Trip', () => {
    it('should preserve images array order when converting from Firestore document', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          projectDocumentArb,
          (docId, projectData) => {
            const mockDoc = createMockDocSnapshot(docId, projectData)
            const project = docToProject(mockDoc as any)

            // The images array should have cover first, then gallery items in order
            const expectedImages = [
              projectData.images.cover,
              ...projectData.images.gallery,
            ]

            expect(project.images).toEqual(expectedImages)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should set legacy image field to cover image', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          projectDocumentArb,
          (docId, projectData) => {
            const mockDoc = createMockDocSnapshot(docId, projectData)
            const project = docToProject(mockDoc as any)

            // Legacy image field should equal the cover
            expect(project.image).toBe(projectData.images.cover)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should preserve all project metadata through conversion', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          projectDocumentArb,
          (docId, projectData) => {
            const mockDoc = createMockDocSnapshot(docId, projectData)
            const project = docToProject(mockDoc as any)

            // Core fields should be preserved
            expect(project.id).toBe(docId)
            expect(project.title).toBe(projectData.title)
            expect(project.description).toBe(projectData.description)
            expect(project.tech).toEqual(projectData.tech)
            expect(project.category).toBe(projectData.category)
            expect(project.published).toBe(projectData.published)
            expect(project.authorId).toBe(projectData.authorId)
            expect(project.authorName).toBe(projectData.authorName)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle legacy single-image documents', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.record({
            title: fc.string({ minLength: 1 }),
            description: fc.string(),
            image: imageUrlArb, // Legacy field only
            tech: fc.array(fc.string()),
            category: fc.string({ minLength: 1 }),
            createdAt: validDateArb.map(mockTimestamp),
            updatedAt: validDateArb.map(mockTimestamp),
            published: fc.boolean(),
            authorId: fc.uuid(),
            authorName: fc.string({ minLength: 1 }),
          }),
          (docId, legacyProjectData) => {
            const mockDoc = createMockDocSnapshot(docId, legacyProjectData)
            const project = docToProject(mockDoc as any)

            // Should convert legacy image to images array
            expect(project.images).toEqual([legacyProjectData.image])
            expect(project.image).toBe(legacyProjectData.image)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle documents with no images', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          fc.record({
            title: fc.string({ minLength: 1 }),
            description: fc.string(),
            tech: fc.array(fc.string()),
            category: fc.string({ minLength: 1 }),
            createdAt: validDateArb.map(mockTimestamp),
            updatedAt: validDateArb.map(mockTimestamp),
            published: fc.boolean(),
            authorId: fc.uuid(),
            authorName: fc.string({ minLength: 1 }),
          }),
          (docId, noImageProjectData) => {
            const mockDoc = createMockDocSnapshot(docId, noImageProjectData)
            const project = docToProject(mockDoc as any)

            // Should handle missing images gracefully
            expect(project.images).toBeUndefined()
            expect(project.image).toBe('')
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should prefer new images structure over legacy image field', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          imageUrlArb,
          firestoreImagesArb,
          fc.record({
            title: fc.string({ minLength: 1 }),
            description: fc.string(),
            tech: fc.array(fc.string()),
            category: fc.string({ minLength: 1 }),
            createdAt: validDateArb.map(mockTimestamp),
            updatedAt: validDateArb.map(mockTimestamp),
            published: fc.boolean(),
            authorId: fc.uuid(),
            authorName: fc.string({ minLength: 1 }),
          }),
          (docId, legacyImage, newImages, baseData) => {
            const projectData = {
              ...baseData,
              image: legacyImage, // Legacy field
              images: newImages,  // New structure
            }
            
            const mockDoc = createMockDocSnapshot(docId, projectData)
            const project = docToProject(mockDoc as any)

            // Should use new images structure, not legacy
            const expectedImages = [newImages.cover, ...newImages.gallery]
            expect(project.images).toEqual(expectedImages)
            expect(project.image).toBe(newImages.cover)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should maintain image count through round-trip', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          projectDocumentArb,
          (docId, projectData) => {
            const mockDoc = createMockDocSnapshot(docId, projectData)
            const project = docToProject(mockDoc as any)

            // Total images should be cover + gallery
            const expectedCount = 1 + projectData.images.gallery.length
            expect(project.images?.length).toBe(expectedCount)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should handle empty gallery with only cover image', () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          imageUrlArb,
          fc.record({
            title: fc.string({ minLength: 1 }),
            description: fc.string(),
            tech: fc.array(fc.string()),
            category: fc.string({ minLength: 1 }),
            createdAt: validDateArb.map(mockTimestamp),
            updatedAt: validDateArb.map(mockTimestamp),
            published: fc.boolean(),
            authorId: fc.uuid(),
            authorName: fc.string({ minLength: 1 }),
          }),
          (docId, coverImage, baseData) => {
            const projectData = {
              ...baseData,
              images: {
                cover: coverImage,
                gallery: [],
                thumbnails: [],
              },
            }
            
            const mockDoc = createMockDocSnapshot(docId, projectData)
            const project = docToProject(mockDoc as any)

            // Should have single image (cover only)
            expect(project.images).toEqual([coverImage])
            expect(project.image).toBe(coverImage)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

import type { Project } from '@/types'

/**
 * Image helper functions for handling project images
 * Provides backward compatibility for legacy single-image projects
 * and normalizes access to the images array
 */

/**
 * Get all project images, normalizing legacy `image` and new `images` formats
 * 
 * @param project - The project to get images from
 * @returns Array of image URLs (empty array if no images)
 * 
 * Property 9: Legacy Image Migration
 * For any project with only the legacy `image` field set (and no `images` array),
 * the system SHALL treat it as equivalent to `images: [image]`
 */
export function getProjectImages(project: Project): string[] {
  // If images array exists and has items, use it
  if (project.images && project.images.length > 0) {
    return project.images
  }
  
  // Fall back to legacy single image field
  if (project.image) {
    return [project.image]
  }
  
  // No images available
  return []
}

/**
 * Get the cover image (first image) for a project
 * 
 * @param project - The project to get the cover image from
 * @returns The cover image URL or undefined if no images
 */
export function getCoverImage(project: Project): string | undefined {
  const images = getProjectImages(project)
  return images[0]
}

/**
 * Get gallery images (all images except the cover)
 * 
 * @param project - The project to get gallery images from
 * @returns Array of gallery image URLs (excludes cover image)
 */
export function getGalleryImages(project: Project): string[] {
  const images = getProjectImages(project)
  return images.slice(1)
}

/**
 * Check if a project has multiple images
 * 
 * @param project - The project to check
 * @returns True if project has more than one image
 */
export function hasMultipleImages(project: Project): boolean {
  return getProjectImages(project).length > 1
}

/**
 * Get the total count of images for a project
 * 
 * @param project - The project to count images for
 * @returns Number of images
 */
export function getImageCount(project: Project): number {
  return getProjectImages(project).length
}

/**
 * Image error state tracking type
 */
export interface ImageErrorState {
  [url: string]: boolean
}

/**
 * Filter out images that have failed to load
 * 
 * Property 10: Error Resilience
 * For any image array where some images fail to load, the system SHALL
 * continue displaying the remaining valid images without breaking the layout.
 * 
 * @param images - Array of image URLs
 * @param errorState - Object tracking which URLs have failed
 * @returns Array of valid (non-failed) image URLs
 */
export function filterFailedImages(images: string[], errorState: ImageErrorState): string[] {
  return images.filter(url => !errorState[url])
}

/**
 * Get the count of valid (non-failed) images
 * 
 * @param images - Array of image URLs
 * @param errorState - Object tracking which URLs have failed
 * @returns Number of valid images
 */
export function getValidImageCount(images: string[], errorState: ImageErrorState): number {
  return filterFailedImages(images, errorState).length
}

/**
 * Check if all images have failed to load
 * 
 * @param images - Array of image URLs
 * @param errorState - Object tracking which URLs have failed
 * @returns True if all images have failed
 */
export function allImagesFailed(images: string[], errorState: ImageErrorState): boolean {
  if (images.length === 0) return false
  return filterFailedImages(images, errorState).length === 0
}

/**
 * Check if an image URL has failed to load
 * 
 * @param url - The image URL to check
 * @param errorState - Object tracking which URLs have failed
 * @returns True if the image has failed
 */
export function isImageFailed(url: string, errorState: ImageErrorState): boolean {
  return errorState[url] === true
}

/**
 * Create an updated error state with a new failed image
 * 
 * @param errorState - Current error state
 * @param failedUrl - URL that failed to load
 * @returns New error state with the failed URL marked
 */
export function markImageAsFailed(errorState: ImageErrorState, failedUrl: string): ImageErrorState {
  return { ...errorState, [failedUrl]: true }
}

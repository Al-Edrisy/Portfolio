/**
 * Basic content filter for AI-generated comments
 * Prevents obviously inappropriate content
 */

// Basic list of inappropriate words (can be expanded)
const INAPPROPRIATE_PATTERNS = [
  // Keep this list minimal and contextual - too strict filtering can cause false positives
  /\b(fuck|shit|bitch|asshole|damn)\b/gi,
  /\b(stupid|idiot|dumb)\s+(developer|coder|programmer)/gi,
  /\b(hate|terrible|awful|horrible)\s+(project|work)/gi,
]

/**
 * Check if content contains inappropriate language
 * Returns true if content appears safe, false if it contains inappropriate content
 * 
 * @param content - The comment text to check
 * @returns Object with validation result and reason if failed
 */
export function validateCommentContent(content: string): {
  isValid: boolean
  reason?: string
} {
  // Check for empty or suspiciously short content
  if (!content || content.trim().length < 10) {
    return {
      isValid: false,
      reason: 'Comment is too short'
    }
  }

  // Check for suspiciously long single words (might be spam)
  const words = content.split(/\s+/)
  const hasExtremelyLongWord = words.some(word => word.length > 50)
  if (hasExtremelyLongWord) {
    return {
      isValid: false,
      reason: 'Comment contains unusual formatting'
    }
  }

  // Check against inappropriate patterns
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(content)) {
      return {
        isValid: false,
        reason: 'Comment may contain inappropriate language'
      }
    }
  }

  // Check for excessive repetition (spam indicator)
  const repetitionPattern = /(.{3,})\1{3,}/
  if (repetitionPattern.test(content)) {
    return {
      isValid: false,
      reason: 'Comment contains excessive repetition'
    }
  }

  // Check for all caps (shouting - suspicious)
  const capsRatio = (content.match(/[A-Z]/g) || []).length / content.length
  if (capsRatio > 0.7 && content.length > 50) {
    return {
      isValid: false,
      reason: 'Comment contains excessive capitalization'
    }
  }

  return {
    isValid: true
  }
}

/**
 * Sanitize and clean comment content
 * Removes potentially harmful characters while preserving formatting
 * 
 * @param content - The comment text to sanitize
 * @returns Sanitized content
 */
export function sanitizeCommentContent(content: string): string {
  return content
    .trim()
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove any HTML tags (shouldn't be there, but just in case)
    .replace(/<[^>]*>/g, '')
    // Trim to reasonable length
    .slice(0, 1000)
}


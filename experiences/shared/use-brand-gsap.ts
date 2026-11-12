'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * Custom hook to safely run GSAP animations and ScrollTriggers within an isolated context.
 * Automatically cleans up tweens, timelines, and pinned DOM elements on unmount.
 */
export function useBrandGsap<T extends HTMLElement = HTMLDivElement>(
  animationCallback: (context: gsap.Context, element: T) => void,
  dependencies: any[] = []
) {
  const containerRef = useRef<T>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Honor prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const element = containerRef.current
    const ctx = gsap.context(() => {
      animationCallback(ctx, element)
    }, element)

    return () => {
      ctx.revert()
      // Clean up any remaining triggers within this element
      ScrollTrigger.getAll().forEach(trigger => {
        if (element.contains(trigger.trigger as Node)) {
          trigger.kill()
        }
      })
    }
  }, dependencies) // eslint-disable-line react-hooks/exhaustive-deps

  return containerRef
}

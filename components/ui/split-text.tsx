"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  duration?: number
  ease?: string
  splitType?: "chars" | "words" | "lines"
  from?: Record<string, any>
  to?: Record<string, any>
  threshold?: number
  rootMargin?: string
  textAlign?: "left" | "center" | "right"
  fadeOnScroll?: boolean
  onLetterAnimationComplete?: () => void
}

export default function SplitText({
  text,
  className = "",
  delay = 100,
  duration = 0.6,
  ease = "power3.out",
  splitType = "chars",
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = "-100px",
  textAlign = "left",
  fadeOnScroll = false,
  onLetterAnimationComplete,
}: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const elements = container.querySelectorAll(".split-element")

    if (elements.length === 0) return

    try {
      if (fadeOnScroll) {
        // For fadeOnScroll, start with text visible and animate entrance first
        gsap.set(elements, { opacity: 0, y: 40 })
        
        // First animate the entrance
        const entranceTl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top 85%",
            toggleActions: "play none none none",
          },
          onComplete: onLetterAnimationComplete,
        })

        entranceTl.to(elements, {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          stagger: delay / 1000,
        })

        // Then create scroll-triggered fade out animation
        gsap.to(elements, {
          opacity: 0,
          y: -30,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: container,
            start: "top 60%",
            end: "bottom 20%",
            scrub: 1.5,
          },
        })
      } else {
        // Set initial state for normal animation
        gsap.set(elements, from)

        // Create normal entrance animation
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: `top 80%`,
            end: `bottom 20%`,
            toggleActions: "play none none reverse",
          },
          onComplete: onLetterAnimationComplete,
        })

        tl.to(elements, {
          ...to,
          duration,
          ease,
          stagger: delay / 1000,
        })
      }
    } catch (error) {
      console.warn('GSAP animation error:', error)
    }

    return () => {
      try {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      } catch (error) {
        console.warn('Error cleaning up ScrollTrigger:', error)
      }
    }
  }, [text, delay, duration, ease, from, to, threshold, rootMargin, fadeOnScroll, onLetterAnimationComplete])

  const splitText = () => {
    if (splitType === "chars") {
      return text.split("").map((char, index) => (
        <span key={index} className="split-element inline-block">
          {char === " " ? "\u00A0" : char}
        </span>
      ))
    } else if (splitType === "words") {
      return text.split(" ").map((word, index) => (
        <span key={index} className="split-element inline-block mr-1">
          {word}
        </span>
      ))
    } else {
      return text.split("\n").map((line, index) => (
        <span key={index} className="split-element block">
          {line}
        </span>
      ))
    }
  }

  return (
    <div ref={containerRef} className={`${className}`} style={{ textAlign }}>
      {splitText()}
    </div>
  )
}

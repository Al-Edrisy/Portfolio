"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface ScrollRevealProps {
  children: React.ReactNode
  baseOpacity?: number
  enableBlur?: boolean
  baseRotation?: number
  blurStrength?: number
  className?: string
}

export default function ScrollReveal({
  children,
  baseOpacity = 0,
  enableBlur = true,
  baseRotation = 5,
  blurStrength = 10,
  className = "",
}: ScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const element = containerRef.current

    // Set initial state
    gsap.set(element, {
      opacity: baseOpacity,
      rotateX: baseRotation,
      filter: enableBlur ? `blur(${blurStrength}px)` : "none",
      y: 50,
    })

    // Create scroll-triggered animation
    gsap.to(element, {
      opacity: 1,
      rotateX: 0,
      filter: "blur(0px)",
      y: 0,
      duration: 1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        scrub: 1,
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [baseOpacity, enableBlur, baseRotation, blurStrength])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

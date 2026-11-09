"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

interface RevealProps {
  children: ReactNode
  delay?: number
  className?: string
}

/**
 * Consistent scroll-in used by every About section.
 * transform + opacity only, strong ease-out, and no motion at all for users who
 * prefer reduced motion.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, transform: "translateY(12px)" }}
      whileInView={{ opacity: 1, transform: "translateY(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  )
}

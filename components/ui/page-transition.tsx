"use client"

import { motion, AnimatePresence } from 'motion/react'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut"
        }}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// Staggered animation for lists
export function StaggeredList({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Staggered item for individual list items
export function StaggeredItem({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

// Fade in animation
export function FadeIn({ children, delay = 0, className = "" }: { 
  children: ReactNode, 
  delay?: number, 
  className?: string 
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}

// Slide in from left
export function SlideInLeft({ children, delay = 0, className = "" }: { 
  children: ReactNode, 
  delay?: number, 
  className?: string 
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}

// Slide in from right
export function SlideInRight({ children, delay = 0, className = "" }: { 
  children: ReactNode, 
  delay?: number, 
  className?: string 
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}

// Scale in animation
export function ScaleIn({ children, delay = 0, className = "" }: { 
  children: ReactNode, 
  delay?: number, 
  className?: string 
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  )
}

// Bounce in animation
export function BounceIn({ children, delay = 0, className = "" }: { 
  children: ReactNode, 
  delay?: number, 
  className?: string 
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        type: "spring",
        stiffness: 200,
        damping: 10
      }}
    >
      {children}
    </motion.div>
  )
}


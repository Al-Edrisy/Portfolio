"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

interface RotatingTextProps {
  texts: string[]
  mainClassName?: string
  staggerFrom?: "first" | "last"
  initial?: Record<string, any>
  animate?: Record<string, any>
  exit?: Record<string, any>
  staggerDuration?: number
  splitLevelClassName?: string
  transition?: Record<string, any>
  rotationInterval?: number
}

export default function RotatingText({
  texts,
  mainClassName = "px-2 sm:px-2 md:px-3 bg-primary text-primary-foreground overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg",
  staggerFrom = "last",
  initial = { y: "100%" },
  animate = { y: 0 },
  exit = { y: "-120%" },
  staggerDuration = 0.025,
  splitLevelClassName = "overflow-hidden pb-0.5 sm:pb-1 md:pb-1",
  transition = { type: "spring", damping: 30, stiffness: 400 },
  rotationInterval = 2000,
}: RotatingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length)
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [texts.length, rotationInterval])

  const currentText = texts[currentIndex]
  const letters = currentText.split("")

  return (
    <div className={`inline-flex ${mainClassName}`}>
      <AnimatePresence mode="wait">
        <motion.div key={currentIndex} className="flex" initial="initial" animate="animate" exit="exit">
          {letters.map((letter, index) => (
            <div key={index} className={splitLevelClassName}>
              <motion.span
                variants={{
                  initial,
                  animate,
                  exit,
                }}
                transition={{
                  ...transition,
                  delay:
                    staggerFrom === "last" ? (letters.length - 1 - index) * staggerDuration : index * staggerDuration,
                }}
                className="inline-block"
              >
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

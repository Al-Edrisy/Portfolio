"use client"

import { useRef } from "react"
import { motion } from "motion/react"

interface CircularTextProps {
  text: string
  onHover?: "speedUp" | "reverse" | "pause"
  spinDuration?: number
  className?: string
  radius?: number
  fontSize?: number
}

export default function CircularText({
  text,
  onHover = "speedUp",
  spinDuration = 20,
  className = "",
  radius = 80,
  fontSize = 16,
}: CircularTextProps) {
  const textRef = useRef<HTMLDivElement>(null)

  const characters = text.split("")
  const angleStep = 360 / characters.length

  return (
    <motion.div
      ref={textRef}
      className={`relative inline-block ${className}`}
      style={{ width: radius * 2, height: radius * 2 }}
      animate={{ rotate: 360 }}
      transition={{
        duration: spinDuration,
        repeat: Number.POSITIVE_INFINITY,
        ease: "linear",
      }}
      whileHover={
        onHover === "speedUp"
          ? { transition: { duration: spinDuration / 2 } }
          : onHover === "reverse"
            ? { rotate: -360, transition: { duration: spinDuration } }
            : onHover === "pause"
              ? { rotate: 0, transition: { duration: 0.3 } }
              : {}
      }
    >
      {characters.map((char, index) => (
        <span
          key={index}
          className="absolute"
          style={{
            fontSize: `${fontSize}px`,
            transformOrigin: `0 ${radius}px`,
            transform: `rotate(${index * angleStep}deg)`,
            left: "50%",
            top: 0,
          }}
        >
          {char}
        </span>
      ))}
    </motion.div>
  )
}

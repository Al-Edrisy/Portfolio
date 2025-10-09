"use client"

import { motion } from "motion/react"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: string
}

export default function LoadingSpinner({ size = "md", color = "rgb(16, 185, 129)" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizeClasses[size]} border-2 border-transparent rounded-full`}
        style={{
          borderTopColor: color,
          borderRightColor: `${color}40`,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      />
    </div>
  )
}

"use client"

import { motion } from "motion/react"
import { useState, useEffect } from "react"

interface SvgIconProps {
  src: string
  alt: string
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  animated?: boolean
  hoverEffect?: boolean
  style?: React.CSSProperties
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8",
  xl: "w-12 h-12"
}

const svgSizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6", 
  lg: "w-8 h-8",
  xl: "w-12 h-12"
}

export default function SvgIcon({ 
  src, 
  alt, 
  className = "", 
  size = "md", 
  animated = false,
  hoverEffect = false,
  style 
}: SvgIconProps) {
  const [svgContent, setSvgContent] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const loadSvg = async () => {
      try {
        const response = await fetch(src)
        if (response.ok) {
          const svgText = await response.text()
          // Modify SVG to have proper dimensions
          const modifiedSvg = svgText.replace(
            /<svg([^>]*)>/,
            `<svg$1 width="${size === 'sm' ? '16' : size === 'md' ? '24' : size === 'lg' ? '32' : '48'}" height="${size === 'sm' ? '16' : size === 'md' ? '24' : size === 'lg' ? '32' : '48'}" class="${svgSizeClasses[size]}" style="display: block;">`
          )
          setSvgContent(modifiedSvg)
        }
      } catch (error) {
        console.error(`Failed to load SVG: ${src}`, error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSvg()
  }, [src, size])

  if (isLoading) {
    return (
      <div className={`${sizeClasses[size]} ${className} animate-pulse bg-muted rounded`} />
    )
  }

  if (!svgContent) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-muted rounded flex items-center justify-center text-xs text-muted-foreground`}>
        ?
      </div>
    )
  }

  const iconElement = (
    <div
      className={`${sizeClasses[size]} ${className} ${hoverEffect ? 'transition-transform duration-200' : ''} ${isHovered && hoverEffect ? 'scale-110' : ''} flex items-center justify-center overflow-hidden`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        width: size === 'sm' ? '16px' : size === 'md' ? '24px' : size === 'lg' ? '32px' : '48px',
        height: size === 'sm' ? '16px' : size === 'md' ? '24px' : size === 'lg' ? '32px' : '48px',
        ...style
      }}
      dangerouslySetInnerHTML={{ 
        __html: svgContent.replace(
          /<svg([^>]*)>/,
          `<svg$1 style="width: 100%; height: 100%; display: block;">`
        )
      }}
    />
  )

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.1 }}
        className="inline-block"
      >
        {iconElement}
      </motion.div>
    )
  }

  return iconElement
}

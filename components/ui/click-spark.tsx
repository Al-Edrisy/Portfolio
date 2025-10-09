"use client"

import { useRef, useEffect, type ReactNode } from "react"

interface ClickSparkProps {
  children: ReactNode
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
}

export default function ClickSpark({
  children,
  sparkColor = "#fff",
  sparkSize = 10,
  sparkRadius = 15,
  sparkCount = 8,
  duration = 400,
}: ClickSparkProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Create sparks
      for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement("div")
        const angle = (360 / sparkCount) * i
        const distance = sparkRadius + Math.random() * sparkRadius

        spark.style.cssText = `
          position: absolute;
          width: ${sparkSize}px;
          height: ${sparkSize}px;
          background: ${sparkColor};
          border-radius: 50%;
          pointer-events: none;
          z-index: 1000;
          left: ${x}px;
          top: ${y}px;
          transform: translate(-50%, -50%);
        `

        container.appendChild(spark)

        // Animate spark
        const endX = x + Math.cos((angle * Math.PI) / 180) * distance
        const endY = y + Math.sin((angle * Math.PI) / 180) * distance

        spark.animate(
          [
            { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
            {
              transform: `translate(${endX - x - sparkSize / 2}px, ${endY - y - sparkSize / 2}px) scale(0)`,
              opacity: 0,
            },
          ],
          {
            duration,
            easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          },
        ).onfinish = () => {
          spark.remove()
        }
      }
    }

    container.addEventListener("click", handleClick)
    return () => container.removeEventListener("click", handleClick)
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration])

  return (
    <div ref={containerRef} className="relative">
      {children}
    </div>
  )
}

"use client"

import { useEffect, useRef } from "react"

export default function SplashCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0

    const updateCursor = () => {
      const dx = mouseX - cursorX
      const dy = mouseY - cursorY
      cursorX += dx * 0.1
      cursorY += dy * 0.1

      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`
      requestAnimationFrame(updateCursor)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const handleClick = (e: MouseEvent) => {
      const splash = document.createElement("div")
      splash.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.8) 0%, rgba(16, 185, 129, 0.4) 50%, transparent 100%);
        pointer-events: none;
        z-index: 9999;
        left: ${e.clientX - 10}px;
        top: ${e.clientY - 10}px;
        transform: scale(0);
      `

      document.body.appendChild(splash)

      splash.animate(
        [
          { transform: "scale(0)", opacity: 1 },
          { transform: "scale(3)", opacity: 0 },
        ],
        {
          duration: 600,
          easing: "ease-out",
        },
      ).onfinish = () => {
        splash.remove()
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("click", handleClick)
    updateCursor()

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("click", handleClick)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="fixed w-4 h-4 bg-primary/30 rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block"
      style={{ transform: "translate(-50%, -50%)" }}
    />
  )
}

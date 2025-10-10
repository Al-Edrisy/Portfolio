"use client"

import { useEffect, useState, useRef, RefObject } from 'react'

interface UseStickyScrollOptions {
  offsetTop?: number
  offsetBottom?: number
  containerRef?: RefObject<HTMLElement>
}

interface UseStickyScrollReturn {
  isSticky: boolean
  isAtBottom: boolean
  sidebarRef: RefObject<HTMLDivElement>
  style: React.CSSProperties
}

export function useStickyScroll({
  offsetTop = 80,
  offsetBottom = 20,
  containerRef
}: UseStickyScrollOptions = {}): UseStickyScrollReturn {
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [isSticky, setIsSticky] = useState(false)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState<number | undefined>(undefined)

  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar) return

    // Store initial width
    const updateWidth = () => {
      if (sidebar) {
        setSidebarWidth(sidebar.offsetWidth)
      }
    }

    updateWidth()

    const handleScroll = () => {
      if (!sidebar) return

      const scrollTop = window.scrollY
      const viewportHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight

      // Get sidebar initial position
      const sidebarRect = sidebar.getBoundingClientRect()
      const sidebarTop = sidebarRect.top + scrollTop
      const sidebarHeight = sidebarRect.height

      // Calculate container bounds if provided
      let containerBottom = documentHeight
      if (containerRef?.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        containerBottom = containerRect.bottom + scrollTop
      }

      // Determine sticky state
      const shouldBeSticky = scrollTop + offsetTop >= sidebarTop
      const shouldBeAtBottom = scrollTop + sidebarHeight + offsetTop >= containerBottom - offsetBottom

      setIsSticky(shouldBeSticky && !shouldBeAtBottom)
      setIsAtBottom(shouldBeAtBottom)
    }

    // Initial check
    handleScroll()

    // Debounced scroll handler
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', updateWidth, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateWidth)
    }
  }, [offsetTop, offsetBottom, containerRef])

  const style: React.CSSProperties = {}
  
  if (isSticky && !isAtBottom) {
    style.position = 'fixed'
    style.top = `${offsetTop}px`
    style.width = sidebarWidth ? `${sidebarWidth}px` : 'auto'
  } else if (isAtBottom) {
    style.position = 'absolute'
    style.bottom = `${offsetBottom}px`
    style.width = sidebarWidth ? `${sidebarWidth}px` : 'auto'
  }

  return {
    isSticky,
    isAtBottom,
    sidebarRef,
    style
  }
}

export default useStickyScroll


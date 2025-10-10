"use client"

import { useStickyScroll } from '@/hooks/use-sticky-scroll'
import { cn } from '@/lib/utils'

interface StickySidebarProps {
  children: React.ReactNode
  className?: string
  offsetTop?: number
  offsetBottom?: number
}

export function StickySidebar({
  children,
  className,
  offsetTop = 80,
  offsetBottom = 20
}: StickySidebarProps) {
  const { sidebarRef, style, isSticky } = useStickyScroll({
    offsetTop,
    offsetBottom
  })

  return (
    <div className={cn("relative", className)}>
      <div
        ref={sidebarRef}
        style={style}
        className={cn(
          "transition-all duration-200 ease-out",
          isSticky && "z-30"
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default StickySidebar


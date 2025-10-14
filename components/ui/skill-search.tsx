"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { gsap } from "gsap"

interface Skill {
  name: string
  icon: string
  category: string
  proficiency: number
  description: string
  color: string
  featured?: boolean
}

interface SkillSearchProps {
  categories: Array<{
    title: string
    description: string
    color: string
    skills: Skill[]
  }>
  searchQuery: string
  onSearchChange: (query: string) => void
}

const SkillSearch: React.FC<SkillSearchProps> = ({ 
  categories, 
  searchQuery,
  onSearchChange 
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        ease: "power2.out" 
      }
    )
  }, [])

  const clearSearch = useCallback(() => {
    onSearchChange("")
    searchRef.current?.focus()
  }, [onSearchChange])

  return (
    <motion.div 
      ref={containerRef}
      className="relative max-w-2xl mx-auto mb-8 md:mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Search Input */}
      <div className="relative group">
        <div className={`absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${isFocused ? 'opacity-100' : ''}`} />
        
        <div className={`relative bg-card/60 backdrop-blur-sm border-2 rounded-2xl transition-all duration-300 ${
          isFocused 
            ? 'border-primary/50 shadow-lg shadow-primary/10' 
            : 'border-border/40 hover:border-primary/30'
        }`}>
          <div className="flex items-center px-4 md:px-6 py-3 md:py-4">
            {/* Search Icon */}
            <div className="flex-shrink-0 mr-3 md:mr-4">
              <svg 
                className={`w-5 h-5 transition-colors duration-300 ${
                  isFocused ? 'text-primary' : 'text-muted-foreground'
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </div>

            {/* Input Field */}
            <input
              ref={searchRef}
              type="text"
              placeholder="Search skills, technologies, or categories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  onSearchChange("")
                  searchRef.current?.blur()
                }
              }}
              className="flex-1 bg-transparent text-foreground placeholder-muted-foreground text-sm md:text-base focus:outline-none"
              aria-label="Search skills and technologies"
              aria-describedby="search-results-info"
              role="searchbox"
            />

            {/* Clear Button */}
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={clearSearch}
                  className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-muted/50 transition-colors duration-200"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4 text-muted-foreground hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      <AnimatePresence>
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-3 text-center"
          >
            <p id="search-results-info" className="text-sm text-muted-foreground" role="status" aria-live="polite">
              {searchQuery.length > 0 && (
                <>
                  Searching for "<span className="text-primary font-medium">{searchQuery}</span>"
                </>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default SkillSearch

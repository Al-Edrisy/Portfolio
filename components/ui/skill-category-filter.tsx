"use client"

import { useEffect, useRef, useState } from "react"
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

interface SkillCategoryFilterProps {
  categories: Array<{
    title: string
    description: string
    color: string
    skills: Skill[]
  }>
  activeCategory: number
  onCategoryChange: (index: number) => void
}

const SkillCategoryFilter: React.FC<SkillCategoryFilterProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}) => {
  const filterRef = useRef<HTMLDivElement>(null)
  const [allSkillsCount, setAllSkillsCount] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    // Calculate total skills count
    const totalSkills = categories.reduce((sum, category) => sum + category.skills.length, 0)
    setAllSkillsCount(totalSkills)
  }, [categories])

  useEffect(() => {
    if (!filterRef.current) return

    gsap.fromTo(filterRef.current.children,
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: "power2.out" 
      }
    )
  }, [])

  const handleCategoryChange = (index: number) => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    onCategoryChange(index)
    
    // Reset transition state after animation
    setTimeout(() => setIsTransitioning(false), 300)
  }

  return (
    <div 
      ref={filterRef} 
      className="flex flex-wrap justify-center gap-3 md:gap-4 mb-10 md:mb-16 px-4"
      role="tablist"
      aria-label="Filter skills by category"
    >
      {/* All Skills Option */}
      <button
        onClick={() => handleCategoryChange(-1)}
        role="tab"
        aria-selected={activeCategory === -1}
        aria-controls="skills-grid"
        tabIndex={activeCategory === -1 ? 0 : -1}
        className={`group relative px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base transition-all duration-500 ease-out transform hover:scale-105 active:scale-95 ${
          activeCategory === -1
            ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/25 scale-105 border-2 border-primary/50 animate-pulse'
            : 'bg-card/60 backdrop-blur-sm text-foreground hover:bg-card/90 border-2 border-border/40 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10'
        }`}
      >
        {/* Active state glow effect */}
        {activeCategory === -1 && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl md:rounded-2xl blur-sm -z-10" />
        )}
        
        <div className="flex items-center gap-2 md:gap-3">
          <span className="font-bold">All Skills</span>
          <span className={`text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-full transition-all duration-300 ${
            activeCategory === -1
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-primary/20 text-primary group-hover:bg-primary/30'
          }`}>
            {allSkillsCount}
          </span>
        </div>
      </button>

      {/* Category Options */}
      {categories.map((category, index) => (
        <button
          key={index}
          onClick={() => handleCategoryChange(index)}
          role="tab"
          aria-selected={activeCategory === index}
          aria-controls="skills-grid"
          tabIndex={activeCategory === index ? 0 : -1}
          className={`group relative px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-sm md:text-base transition-all duration-500 ease-out transform hover:scale-105 active:scale-95 ${
            activeCategory === index
              ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/25 scale-105 border-2 border-primary/50 animate-pulse'
              : 'bg-card/60 backdrop-blur-sm text-foreground hover:bg-card/90 border-2 border-border/40 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10'
          }`}
        >
          {/* Active state glow effect */}
          {activeCategory === index && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl md:rounded-2xl blur-sm -z-10" />
          )}
          
          <div className="flex items-center gap-2 md:gap-3">
            <span className="font-bold truncate max-w-[140px] md:max-w-none">{category.title}</span>
            <span className={`text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-full transition-all duration-300 flex-shrink-0 ${
              activeCategory === index
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-primary/20 text-primary group-hover:bg-primary/30'
            }`}>
              {category.skills.length}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

export default SkillCategoryFilter


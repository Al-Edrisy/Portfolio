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

  return (
    <div ref={filterRef} className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12 px-2">
      {/* All Skills Option */}
      <button
        onClick={() => onCategoryChange(-1)}
        className={`px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
          activeCategory === -1
            ? 'bg-primary text-primary-foreground shadow-lg scale-105'
            : 'bg-card/50 text-foreground hover:bg-card/80 border border-border/50 hover:scale-105'
        }`}
      >
        <div className="flex items-center gap-1 md:gap-2">
          <span>All Skills</span>
          <span className="text-xs bg-primary/20 text-primary px-1.5 md:px-2 py-0.5 md:py-1 rounded-full">
            {allSkillsCount}
          </span>
        </div>
      </button>

      {/* Category Options */}
      {categories.map((category, index) => (
        <button
          key={index}
          onClick={() => onCategoryChange(index)}
          className={`px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
            activeCategory === index
              ? 'bg-primary text-primary-foreground shadow-lg scale-105'
              : 'bg-card/50 text-foreground hover:bg-card/80 border border-border/50 hover:scale-105'
          }`}
        >
          <div className="flex items-center gap-1 md:gap-2">
            <span className="truncate max-w-[120px] md:max-w-none">{category.title}</span>
            <span className="text-xs bg-primary/20 text-primary px-1.5 md:px-2 py-0.5 md:py-1 rounded-full flex-shrink-0">
              {category.skills.length}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

export default SkillCategoryFilter


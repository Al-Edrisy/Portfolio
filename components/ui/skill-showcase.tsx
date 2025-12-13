"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import SvgIcon from "@/components/ui/svg-icon"
import SkillCategoryFilter from "@/components/ui/skill-category-filter"
import SkillSearch from "@/components/ui/skill-search"

import { Skill } from "@/constants/skills-data"

interface SkillShowcaseProps {
  skill: Skill
  index: number
  isActive: boolean
  onSelect: () => void
}

const SkillCard: React.FC<SkillShowcaseProps> = ({ skill, index, isActive, onSelect }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)

  // Simplified animation setup
  useEffect(() => {
    if (!cardRef.current || !iconRef.current) return

    const tl = gsap.timeline()

    // Initial animation
    tl.fromTo(cardRef.current,
      { opacity: 0, y: 20, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
        delay: index * 0.05
      }
    )

    // Hover animations
    const handleMouseEnter = () => {
      gsap.to(cardRef.current, {
        y: -4,
        scale: 1.02,
        duration: 0.2,
        ease: "power2.out",
        boxShadow: `0 10px 20px -5px ${skill.color}30`
      })
    }

    const handleMouseLeave = () => {
      gsap.to(cardRef.current, {
        y: 0,
        scale: 1,
        duration: 0.2,
        ease: "power2.out",
        boxShadow: "none"
      })
    }

    const card = cardRef.current
    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [index, skill.color])

  return (
    <div
      ref={cardRef}
      className={`relative group cursor-pointer h-full ${isActive ? 'z-10' : 'z-0'}`}
      onClick={onSelect}
    >
      <div className={`relative bg-card/50 backdrop-blur-sm border rounded-xl p-4 transition-colors duration-300 h-full flex flex-row items-center gap-4 ${isActive
        ? 'border-primary/50 bg-accent/10'
        : 'border-border/50 hover:border-primary/30'
        }`}>
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${skill.color}10 0%, transparent 70%)`
          }} />

        {/* Icon */}
        <div
          ref={iconRef}
          className={`p-2 rounded-lg relative flex-shrink-0 w-12 h-12 flex items-center justify-center ${skill.icon.includes('next-3') || skill.icon.includes('github') || skill.icon.includes('vercel') || skill.icon.includes('notion')
            ? 'bg-white dark:bg-gray-100'
            : skill.icon.includes('openai-logo')
              ? 'bg-white dark:bg-gray-100'
              : ''
            }`}
          style={{
            backgroundColor: skill.icon.includes('openai-logo') || skill.icon.includes('next-3') || skill.icon.includes('github') || skill.icon.includes('vercel') || skill.icon.includes('notion')
              ? undefined
              : `${skill.color}15`,
            border: `1px solid ${skill.color}30`
          }}
        >
          <SvgIcon
            src={skill.icon}
            alt={skill.name}
            size="md"
            className={`transition-all duration-300 ${skill.icon.includes('github') || skill.icon.includes('vercel') || skill.icon.includes('notion')
              ? 'invert-0'
              : ''
              } ${skill.icon.includes('next-3')
                ? 'invert dark:invert-0'
                : ''
              } ${skill.icon.includes('openai')
                ? 'invert-0'
                : ''
              }`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-foreground truncate">{skill.name}</h3>
            {skill.featured && (
              <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded-full border border-primary/20 ml-2 flex-shrink-0">
                ★
              </span>
            )}
          </div>

          {/* Proficiency Bar */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${skill.proficiency}%`,
                  backgroundColor: skill.color
                }}
              />
            </div>
            <span className="text-xs font-medium text-muted-foreground w-8 text-right">{skill.proficiency}%</span>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-1">
            {skill.description}
          </p>
        </div>
      </div>
    </div>
  )
}

interface SkillsShowcaseProps {
  categories: Array<{
    title: string
    description: string
    color: string
    skills: Skill[]
  }>
}

const SkillsShowcase: React.FC<SkillsShowcaseProps> = ({ categories }) => {
  const [activeCategory, setActiveCategory] = useState(-1) // -1 means "All" is selected by default
  const [activeSkill, setActiveSkill] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Animate skills grid
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 70%",
      onEnter: () => {
        gsap.fromTo(containerRef.current?.children || [],
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out"
          }
        )
      }
    })
  }, [])

  // Get all skills from all categories
  const allSkills = categories.flatMap(category => category.skills)

  // Filter skills based on search query
  const filteredSkills = searchQuery.length > 0
    ? allSkills.filter(skill =>
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : []

  // Get skills based on search or selected category
  const currentSkills = searchQuery.length > 0
    ? filteredSkills
    : activeCategory === -1
      ? allSkills
      : categories[activeCategory]?.skills || []

  const handleCategoryChange = useCallback((index: number) => {
    setActiveCategory(index)
    setActiveSkill(0)
    setSearchQuery("") // Clear search when category changes
  }, [])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.length > 0) {
      setActiveCategory(-1) // Reset category filter when searching
    }
  }, [])

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Search Component */}
      <SkillSearch
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Category Filter - Hide when searching */}
      {searchQuery.length === 0 && (
        <SkillCategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      )}

      {/* Skills Grid */}
      {currentSkills.length > 0 ? (
        <div
          ref={containerRef}
          id="skills-grid"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8"
          role="tabpanel"
          aria-label={`Displaying ${currentSkills.length} skills`}
        >
          {currentSkills.map((skill, index) => (
            <SkillCard
              key={`${activeCategory}-${index}`}
              skill={skill}
              index={index}
              isActive={activeSkill === index}
              onSelect={() => setActiveSkill(index)}
            />
          ))}
        </div>
      ) : searchQuery.length > 0 ? (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No skills found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or browse by category instead.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default SkillsShowcase

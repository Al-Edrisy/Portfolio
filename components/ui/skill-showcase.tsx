"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import SvgIcon from "@/components/ui/svg-icon"
import SkillCategoryFilter from "@/components/ui/skill-category-filter"

interface Skill {
  name: string
  icon: string
  category: string
  proficiency: number
  description: string
  color: string
  featured?: boolean
}

interface SkillShowcaseProps {
  skill: Skill
  index: number
  isActive: boolean
  onSelect: () => void
}

const SkillCard: React.FC<SkillShowcaseProps> = ({ skill, index, isActive, onSelect }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!cardRef.current || !iconRef.current || !progressRef.current) return

    const tl = gsap.timeline()
    
    // Initial animation
    tl.fromTo(cardRef.current, 
      { 
        opacity: 0, 
        y: 50, 
        scale: 0.8,
        rotationY: -15 
      },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        rotationY: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
        delay: index * 0.1
      }
    )

    // Icon entrance
    tl.fromTo(iconRef.current,
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 0.4, ease: "elastic.out(1, 0.3)" },
      "-=0.3"
    )

    // Progress bar animation
    ScrollTrigger.create({
      trigger: progressRef.current,
      start: "top 80%",
      onEnter: () => {
        gsap.fromTo(progressRef.current,
          { width: "0%" },
          { 
            width: `${skill.proficiency}%`,
            duration: 1.5,
            ease: "power2.out",
            delay: 0.2
          }
        )
      }
    })

    // Hover animations
    const handleMouseEnter = () => {
      gsap.to(cardRef.current, {
        y: -10,
        scale: 1.05,
        rotationY: 5,
        duration: 0.3,
        ease: "power2.out"
      })
      
      gsap.to(iconRef.current, {
        scale: 1.2,
        rotation: 10,
        duration: 0.3,
        ease: "power2.out"
      })
    }

    const handleMouseLeave = () => {
      gsap.to(cardRef.current, {
        y: 0,
        scale: 1,
        rotationY: 0,
        duration: 0.3,
        ease: "power2.out"
      })
      
      gsap.to(iconRef.current, {
        scale: 1,
        rotation: 0,
        duration: 0.3,
        ease: "power2.out"
      })
    }

    const card = cardRef.current
    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [index, skill.proficiency])

  return (
    <div
      ref={cardRef}
      className={`relative group cursor-pointer transform-gpu ${isActive ? 'z-10' : 'z-0'}`}
      onClick={onSelect}
      style={{ perspective: '1000px' }}
    >
      <div className={`relative bg-card/80 backdrop-blur-xl border rounded-xl md:rounded-2xl p-5 md:p-8 transition-all duration-300 min-h-[280px] md:min-h-[320px] ${
        isActive 
          ? 'border-primary/50 shadow-2xl shadow-primary/20 scale-105' 
          : 'border-border/50 hover:border-primary/30 shadow-lg hover:shadow-xl'
      }`}>
        {/* Gradient overlay */}
        <div className={`absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 ${
          isActive ? 'opacity-100' : 'group-hover:opacity-50'
        }`} 
        style={{
          background: `linear-gradient(135deg, ${skill.color}15, transparent)`
        }} />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <div 
              ref={iconRef}
              className={`p-3 md:p-4 rounded-lg md:rounded-xl skill-icon-container relative transition-colors duration-300 ${
                skill.icon.includes('next-3') || skill.icon.includes('github') || skill.icon.includes('vercel') || skill.icon.includes('notion')
                  ? 'bg-white dark:bg-gray-100'
                  : skill.icon.includes('openai-logo')
                  ? 'bg-white dark:bg-gray-100'
                  : ''
              }`}
              data-icon={skill.icon.includes('openai-logo') ? 'openai' : skill.icon.includes('next-3') ? 'next' : ''}
              style={{ 
                backgroundColor: skill.icon.includes('openai-logo') || skill.icon.includes('next-3') || skill.icon.includes('github') || skill.icon.includes('vercel') || skill.icon.includes('notion') 
                  ? undefined 
                  : `${skill.color}20`,
                border: `2px solid ${skill.color}40`
              }}
            >
              <SvgIcon 
                src={skill.icon} 
                alt={skill.name}
                size="lg"
                className={`transition-all duration-300 ${
                  skill.icon.includes('github') || skill.icon.includes('vercel') || skill.icon.includes('notion')
                    ? 'invert-0'
                    : ''
                } ${
                  skill.icon.includes('next-3')
                    ? 'invert dark:invert-0'
                    : ''
                } ${
                  skill.icon.includes('openai')
                    ? 'invert-0'
                    : ''
                }`}
                style={{ 
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                }}
              />
            </div>
            
            {skill.featured && (
              <div className="px-1.5 md:px-2 py-0.5 md:py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full border border-primary/30">
                <span className="hidden sm:inline">Featured</span>
                <span className="sm:hidden">★</span>
              </div>
            )}
          </div>

          {/* Skill info */}
          <div className="mb-4 md:mb-5">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">{skill.name}</h3>
            <span className="text-sm md:text-base text-muted-foreground font-medium">{skill.category}</span>
          </div>

          {/* Progress bar */}
          <div className="mb-4 md:mb-5">
            <div className="flex justify-between items-center mb-2 md:mb-3">
              <span className="text-sm md:text-base font-semibold text-foreground">Proficiency</span>
              <span className="text-sm md:text-base font-bold text-primary">{skill.proficiency}%</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-2 md:h-2.5 overflow-hidden">
              <div 
                ref={progressRef}
                className="h-2 md:h-2.5 rounded-full transition-all duration-300"
                style={{ 
                  background: `linear-gradient(90deg, ${skill.color}, ${skill.color}80)`,
                  boxShadow: `0 0 10px ${skill.color}40`
                }}
              />
            </div>
          </div>

          {/* Description */}
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            {skill.description}
          </p>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${skill.color}10 0%, transparent 70%)`
          }}
        />
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

  // Get skills based on selected category
  const currentSkills = activeCategory === -1 
    ? categories.flatMap(category => category.skills)
    : categories[activeCategory]?.skills || []

  const handleCategoryChange = (index: number) => {
    setActiveCategory(index)
    setActiveSkill(0)
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Category Filter */}
      <SkillCategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      {/* Skills Grid */}
      <div ref={containerRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-8">
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
    </div>
  )
}

export default SkillsShowcase

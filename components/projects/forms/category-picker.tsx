"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProjectCategory } from '@/types'

// Project categories with clean typography and icons
export const categories = {
  'web-development': {
    label: 'Web Development',
    symbol: '🌐',
    description: 'Websites, web apps, and modern online platforms'
  },
  'mobile-app': {
    label: 'Mobile App',
    symbol: '📱',
    description: 'iOS, Android, and cross-platform mobile apps'
  },
  'desktop-app': {
    label: 'Desktop App',
    symbol: '💻',
    description: 'Native and cross-platform desktop applications'
  },
  'ui-ux-design': {
    label: 'UI/UX Design',
    symbol: '🎨',
    description: 'User interface craft, system design & interaction'
  },
  'backend-api': {
    label: 'Backend & API',
    symbol: '💾',
    description: 'Server-side microservices, distributed APIs & pipelines'
  },
  'cloud-devops': {
    label: 'Cloud & DevOps',
    symbol: '☁️',
    description: 'Cloud infrastructure, containers, CI/CD & orchestration'
  },
  'game-development': {
    label: 'Game Development',
    symbol: '🎮',
    description: 'Game engines, WebGL, shaders and interactive media'
  },
  'data-science': {
    label: 'AI & Data Science',
    symbol: '🧠',
    description: 'Machine learning, LLMs, neural networks & data pipelines'
  },
  'business': {
    label: 'Business SaaS',
    symbol: '💼',
    description: 'Enterprise workflows, SaaS tools & productivity platforms'
  },
  'education': {
    label: 'Education',
    symbol: '🎓',
    description: 'Academic tools, LMS systems & learning platforms'
  },
  'healthcare': {
    label: 'Healthcare',
    symbol: '🩺',
    description: 'Health informatics, clinical tools & telemedicine'
  },
  'e-commerce': {
    label: 'E-commerce',
    symbol: '🛒',
    description: 'Storefronts, inventory management & checkout platforms'
  },
  'entertainment': {
    label: 'Media & Entertainment',
    symbol: '🎬',
    description: 'Audio, streaming media and interactive content'
  },
  'portfolio': {
    label: 'Portfolio & Personal',
    symbol: '✨',
    description: 'Personal projects, showcases and developer tools'
  },
  'home-automation': {
    label: 'IoT & Systems',
    symbol: '⚡',
    description: 'Hardware interfaces, automation & embedded devices'
  }
} as const

interface CategoryPickerProps {
  selectedCategories: ProjectCategory[]
  onCategoriesChange: (categories: ProjectCategory[]) => void
  className?: string
  allowClear?: boolean
}

export function CategoryPicker({
  selectedCategories,
  onCategoriesChange,
  className,
  allowClear = true
}: CategoryPickerProps) {
  const [hoveredCategory, setHoveredCategory] = useState<ProjectCategory | null>(null)

  const handleCategoryToggle = (categoryKey: ProjectCategory) => {
    if (selectedCategories.includes(categoryKey)) {
      onCategoriesChange(selectedCategories.filter(c => c !== categoryKey))
    } else {
      onCategoriesChange([...selectedCategories, categoryKey])
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selected Categories Pill Row */}
      {selectedCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-card border border-border/70 space-y-2 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span>Selected Categories</span>
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-mono">
                {selectedCategories.length}
              </Badge>
            </span>
            {allowClear && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onCategoriesChange([])}
                className="text-xs text-muted-foreground hover:text-foreground h-7 px-2 hover:bg-muted"
              >
                Clear all
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <AnimatePresence>
              {selectedCategories.map(categoryKey => {
                const category = categories[categoryKey as keyof typeof categories]
                if (!category) return null
                return (
                  <motion.div
                    key={categoryKey}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.85, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium shadow-sm"
                  >
                    <span className="text-sm leading-none">{category.symbol}</span>
                    <span>{category.label}</span>
                    <button
                      type="button"
                      onClick={() => handleCategoryToggle(categoryKey)}
                      className="ml-1 opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded focus:outline-none"
                      aria-label={`Remove ${category.label}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Category Grid in Monochrome */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {Object.entries(categories).map(([key, category]) => {
          const categoryKey = key as ProjectCategory
          const isSelected = selectedCategories.includes(categoryKey)
          const isHovered = hoveredCategory === categoryKey

          return (
            <motion.button
              key={key}
              type="button"
              onClick={() => handleCategoryToggle(categoryKey)}
              onMouseEnter={() => setHoveredCategory(categoryKey)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={cn(
                "relative group flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 min-h-[92px]",
                isSelected
                  ? "bg-foreground text-background border-foreground shadow-sm shadow-black/10 dark:shadow-white/5 font-semibold"
                  : "bg-card/70 hover:bg-card border-border/70 hover:border-foreground/30 text-muted-foreground hover:text-foreground"
              )}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Symbol */}
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center text-base mb-1.5 transition-colors",
                  isSelected
                    ? "bg-background/15 text-background"
                    : "bg-muted/60 text-foreground group-hover:bg-muted"
                )}
              >
                {category.symbol}
              </div>

              {/* Label */}
              <span className="text-xs tracking-tight line-clamp-1">
                {category.label}
              </span>

              {/* Selection Checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1.5 right-1.5 w-4 h-4 bg-background text-foreground rounded-full flex items-center justify-center shadow-xs"
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </motion.div>
              )}

              {/* Tooltip Description */}
              {isHovered && !isSelected && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                >
                  <div className="bg-popover text-popover-foreground border border-border text-[11px] font-normal rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg">
                    {category.description}
                  </div>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// Compact version for forms
export function CompactCategoryPicker({
  selectedCategories,
  onCategoriesChange,
  className
}: CategoryPickerProps) {
  const handleCategoryToggle = (categoryKey: ProjectCategory) => {
    if (selectedCategories.includes(categoryKey)) {
      onCategoriesChange(selectedCategories.filter(c => c !== categoryKey))
    } else {
      onCategoriesChange([...selectedCategories, categoryKey])
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(categories).map(([key, category]) => {
          const categoryKey = key as ProjectCategory
          const isSelected = selectedCategories.includes(categoryKey)

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleCategoryToggle(categoryKey)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all",
                isSelected
                  ? "bg-foreground text-background border border-foreground font-semibold shadow-xs"
                  : "bg-card border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <span>{category.symbol}</span>
              <span>{category.label}</span>
              {isSelected && <Check className="w-3 h-3 ml-0.5 stroke-[2.5]" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

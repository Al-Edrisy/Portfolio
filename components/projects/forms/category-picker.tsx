"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Code, 
  Palette, 
  Smartphone, 
  Globe, 
  Database, 
  Cloud, 
  Gamepad2, 
  Briefcase,
  Heart,
  Book,
  Music,
  Camera,
  ShoppingCart,
  GraduationCap,
  Home,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Project categories with icons and descriptions
const categories = {
  'web-development': {
    label: 'Web Development',
    icon: Globe,
    description: 'Websites, web apps, and online platforms',
    color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/40'
  },
  'mobile-app': {
    label: 'Mobile App',
    icon: Smartphone,
    description: 'iOS, Android, and cross-platform apps',
    color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/40'
  },
  'desktop-app': {
    label: 'Desktop App',
    icon: Code,
    description: 'Native desktop applications',
    color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/40'
  },
  'ui-ux-design': {
    label: 'UI/UX Design',
    icon: Palette,
    description: 'User interface and experience design',
    color: 'bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100 dark:bg-pink-950/30 dark:text-pink-300 dark:border-pink-800 dark:hover:bg-pink-900/40'
  },
  'backend-api': {
    label: 'Backend & API',
    icon: Database,
    description: 'Server-side development and APIs',
    color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800 dark:hover:bg-orange-900/40'
  },
  'cloud-devops': {
    label: 'Cloud & DevOps',
    icon: Cloud,
    description: 'Infrastructure and deployment',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-800 dark:hover:bg-cyan-900/40'
  },
  'game-development': {
    label: 'Game Development',
    icon: Gamepad2,
    description: 'Video games and interactive media',
    color: 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-900/40'
  },
  'data-science': {
    label: 'Data Science',
    icon: Zap,
    description: 'Analytics, ML, and data visualization',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-300 dark:border-yellow-800 dark:hover:bg-yellow-900/40'
  },
  'business': {
    label: 'Business',
    icon: Briefcase,
    description: 'Business applications and tools',
    color: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-gray-950/30 dark:text-gray-300 dark:border-gray-800 dark:hover:bg-gray-900/40'
  },
  'education': {
    label: 'Education',
    icon: GraduationCap,
    description: 'Educational platforms and tools',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-900/40'
  },
  'healthcare': {
    label: 'Healthcare',
    icon: Heart,
    description: 'Medical and health applications',
    color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-900/40'
  },
  'e-commerce': {
    label: 'E-commerce',
    icon: ShoppingCart,
    description: 'Online stores and marketplaces',
    color: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-950/30 dark:text-teal-300 dark:border-teal-800 dark:hover:bg-teal-900/40'
  },
  'entertainment': {
    label: 'Entertainment',
    icon: Music,
    description: 'Media, music, and entertainment apps',
    color: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100 dark:bg-violet-950/30 dark:text-violet-300 dark:border-violet-800 dark:hover:bg-violet-900/40'
  },
  'photography': {
    label: 'Photography',
    icon: Camera,
    description: 'Photo editing and sharing platforms',
    color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-900/40'
  },
  'portfolio': {
    label: 'Portfolio',
    icon: Book,
    description: 'Personal and professional portfolios',
    color: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-950/30 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-900/40'
  },
  'home-automation': {
    label: 'Home & IoT',
    icon: Home,
    description: 'Smart home and IoT projects',
    color: 'bg-lime-50 text-lime-700 border-lime-200 hover:bg-lime-100 dark:bg-lime-950/30 dark:text-lime-300 dark:border-lime-800 dark:hover:bg-lime-900/40'
  }
} as const

type CategoryKey = keyof typeof categories

interface CategoryPickerProps {
  selectedCategory: CategoryKey | null
  onCategoryChange: (category: CategoryKey | null) => void
  className?: string
  allowClear?: boolean
}

export function CategoryPicker({
  selectedCategory,
  onCategoryChange,
  className,
  allowClear = true
}: CategoryPickerProps) {
  const [hoveredCategory, setHoveredCategory] = useState<CategoryKey | null>(null)

  const selectedCategoryData = selectedCategory ? categories[selectedCategory] : null
  const hoveredCategoryData = hoveredCategory ? categories[hoveredCategory] : null

  return (
    <div className={cn("space-y-4", className)}>
      {/* Selected Category Display */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          {selectedCategoryData && (
            <>
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                selectedCategoryData.color
              )}>
                <selectedCategoryData.icon className="w-6 h-6" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {selectedCategoryData.label}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedCategoryData.description}
                </p>
              </div>

              {allowClear && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onCategoryChange(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Change
                </Button>
              )}
            </>
          )}
        </motion.div>
      )}

      {/* Category Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {Object.entries(categories).map(([key, category]) => {
          const categoryKey = key as CategoryKey
          const isSelected = selectedCategory === categoryKey
          const isHovered = hoveredCategory === categoryKey
          const Icon = category.icon

          return (
            <motion.button
              key={key}
              type="button"
              onClick={() => onCategoryChange(categoryKey)}
              onMouseEnter={() => setHoveredCategory(categoryKey)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={cn(
                "relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all duration-200",
                "hover:scale-105 hover:shadow-md",
                isSelected 
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30" 
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                "bg-white dark:bg-gray-800"
              )}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Icon */}
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                isSelected 
                  ? "bg-blue-500 text-white" 
                  : category.color
              )}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Label */}
              <span className={cn(
                "text-sm font-medium text-center leading-tight",
                isSelected 
                  ? "text-blue-700 dark:text-blue-300" 
                  : "text-gray-700 dark:text-gray-300"
              )}>
                {category.label}
              </span>

              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center"
                >
                  <span className="text-xs">✓</span>
                </motion.div>
              )}

              {/* Hover Description */}
              {(isHovered || isSelected) && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-10"
                >
                  <div className="bg-gray-900 text-white text-xs rounded-md px-3 py-2 whitespace-nowrap shadow-lg">
                    {category.description}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                  </div>
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        Choose a category that best describes your project
      </div>
    </div>
  )
}

// Compact version for forms
interface CompactCategoryPickerProps {
  selectedCategory: CategoryKey | null
  onCategoryChange: (category: CategoryKey | null) => void
  className?: string
}

export function CompactCategoryPicker({
  selectedCategory,
  onCategoryChange,
  className
}: CompactCategoryPickerProps) {
  const selectedCategoryData = selectedCategory ? categories[selectedCategory] : null

  return (
    <div className={cn("space-y-2", className)}>
      {/* Current Selection */}
      <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {selectedCategoryData ? (
          <>
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              selectedCategoryData.color
            )}>
              <selectedCategoryData.icon className="w-4 h-4" />
            </div>
            
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {selectedCategoryData.label}
              </span>
            </div>
          </>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Select a category
          </span>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onCategoryChange(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          {selectedCategory ? 'Change' : 'Select'}
        </Button>
      </div>

      {/* Quick Selection */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(categories).slice(0, 8).map(([key, category]) => {
          const categoryKey = key as CategoryKey
          const Icon = category.icon

          return (
            <button
              key={key}
              type="button"
              onClick={() => onCategoryChange(categoryKey)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm",
                "border transition-colors",
                category.color,
                selectedCategory === categoryKey && "ring-2 ring-blue-500"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{category.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

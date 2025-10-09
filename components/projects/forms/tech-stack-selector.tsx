"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Plus, 
  X, 
  ChevronDown,
  Code,
  Globe,
  Smartphone,
  Database,
  Cloud,
  Palette,
  Wrench
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Popular tech stack categories and items
const techCategories = {
  'Frontend': {
    icon: Globe,
    color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800',
    items: [
      'React', 'Vue.js', 'Angular', 'Svelte', 'Next.js', 'Nuxt.js',
      'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Sass', 'Tailwind CSS',
      'Bootstrap', 'Material-UI', 'Chakra UI', 'Styled Components'
    ]
  },
  'Mobile': {
    icon: Smartphone,
    color: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800',
    items: [
      'React Native', 'Flutter', 'Swift', 'Kotlin', 'Dart', 'Ionic',
      'Xamarin', 'Cordova', 'Expo', 'NativeScript'
    ]
  },
  'Backend': {
    icon: Code,
    color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800',
    items: [
      'Node.js', 'Python', 'Django', 'Flask', 'FastAPI', 'Express.js',
      'Ruby', 'Ruby on Rails', 'PHP', 'Laravel', 'Symfony', 'Java',
      'Spring Boot', 'C#', '.NET', 'Go', 'Rust', 'Elixir'
    ]
  },
  'Database': {
    icon: Database,
    color: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-800',
    items: [
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Firebase', 'Supabase',
      'SQLite', 'DynamoDB', 'Elasticsearch', 'Cassandra', 'Neo4j'
    ]
  },
  'Cloud & DevOps': {
    icon: Cloud,
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-300 dark:border-cyan-800',
    items: [
      'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'Vercel',
      'Netlify', 'Heroku', 'Railway', 'DigitalOcean', 'Terraform', 'Jenkins'
    ]
  },
  'Design & Tools': {
    icon: Palette,
    color: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/30 dark:text-pink-300 dark:border-pink-800',
    items: [
      'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'Framer',
      'Webflow', 'Git', 'GitHub', 'GitLab', 'Bitbucket', 'VS Code'
    ]
  },
  'Other': {
    icon: Wrench,
    color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300 dark:border-gray-800',
    items: [
      'GraphQL', 'REST API', 'WebSocket', 'Socket.io', 'Prisma', 'tRPC',
      'Jest', 'Cypress', 'Storybook', 'Webpack', 'Vite', 'Parcel'
    ]
  }
}

interface TechStackSelectorProps {
  selectedTech: string[]
  onTechChange: (tech: string[]) => void
  maxItems?: number
  className?: string
}

export function TechStackSelector({
  selectedTech,
  onTechChange,
  maxItems = 20,
  className
}: TechStackSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Filter tech items based on search and category
  const getFilteredTech = () => {
    let allItems: Array<{ item: string; category: string; icon: any; color: string }> = []
    
    Object.entries(techCategories).forEach(([category, config]) => {
      if (selectedCategory && selectedCategory !== category) return
      
      config.items.forEach(item => {
        if (searchQuery && !item.toLowerCase().includes(searchQuery.toLowerCase())) return
        
        allItems.push({
          item,
          category,
          icon: config.icon,
          color: config.color
        })
      })
    })

    return allItems
  }

  const handleAddTech = (tech: string) => {
    if (selectedTech.length >= maxItems) {
      alert(`Maximum ${maxItems} technologies allowed`)
      return
    }
    
    if (!selectedTech.includes(tech)) {
      onTechChange([...selectedTech, tech])
      setSearchQuery('')
      setSelectedCategory(null)
    }
  }

  const handleRemoveTech = (tech: string) => {
    onTechChange(selectedTech.filter(t => t !== tech))
  }

  const filteredTech = getFilteredTech()

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      {/* Selected Tech Display */}
      <div className="space-y-3">
        {/* Trigger Button */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full justify-between",
            selectedTech.length > 0 && "border-blue-500"
          )}
        >
          <span className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            {selectedTech.length > 0 
              ? `${selectedTech.length} technologies selected`
              : "Select technologies"
            }
          </span>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            isOpen && "rotate-180"
          )} />
        </Button>

        {/* Selected Items */}
        {selectedTech.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTech.map((tech) => {
              const category = Object.entries(techCategories).find(([_, config]) => 
                config.items.includes(tech)
              )?.[0] || 'Other'
              
              const config = techCategories[category as keyof typeof techCategories]
              const Icon = config.icon

              return (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium",
                    "border-2 shadow-sm hover:shadow-md transition-all duration-200",
                    "bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700",
                    config.color,
                    "hover:scale-105"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tech}</span>
                  <button
                    onClick={() => handleRemoveTech(tech)}
                    className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={cn(
              "absolute top-full left-0 right-0 z-50 mt-2",
              "bg-white dark:bg-gray-800",
              "border border-gray-200 dark:border-gray-700",
              "rounded-xl shadow-xl backdrop-blur-sm",
              "max-h-96 overflow-hidden",
              "ring-1 ring-black/5 dark:ring-white/10"
            )}
          >
            {/* Search & Categories */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              {/* Search Input */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search technologies..."
                  className="pl-10"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant={selectedCategory === null ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs"
                >
                  All
                </Button>
                {Object.entries(techCategories).map(([category, config]) => {
                  const Icon = config.icon
                  return (
                    <Button
                      key={category}
                      type="button"
                      variant={selectedCategory === category ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="text-xs flex items-center gap-1"
                    >
                      <Icon className="w-3 h-3" />
                      {category}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Tech List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredTech.length > 0 ? (
                <div className="p-2">
                  {Object.entries(
                    filteredTech.reduce((acc, item) => {
                      if (!acc[item.category]) acc[item.category] = []
                      acc[item.category].push(item)
                      return acc
                    }, {} as Record<string, typeof filteredTech>)
                  ).map(([category, items]) => {
                    const config = techCategories[category as keyof typeof techCategories]
                    const Icon = config.icon

                    return (
                      <div key={category} className="mb-4 last:mb-0">
                        <div className="flex items-center gap-2 px-2 py-1 mb-2">
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {category}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({items.length})
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-1">
                          {items.map(({ item }) => (
                            <motion.button
                              key={item}
                              type="button"
                              onClick={() => handleAddTech(item)}
                              disabled={selectedTech.includes(item)}
                              onMouseEnter={() => setHoveredItem(item)}
                              onMouseLeave={() => setHoveredItem(null)}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                                "text-left transition-all duration-200",
                                "border border-transparent",
                                "hover:bg-gray-100 dark:hover:bg-gray-700",
                                "hover:border-gray-200 dark:hover:border-gray-600",
                                "hover:shadow-sm",
                                selectedTech.includes(item) 
                                  ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800" 
                                  : "cursor-pointer hover:scale-[1.02]"
                              )}
                              whileHover={!selectedTech.includes(item) ? { scale: 1.02 } : {}}
                              whileTap={!selectedTech.includes(item) ? { scale: 0.98 } : {}}
                            >
                              <Plus className={cn(
                                "w-3 h-3 transition-colors",
                                selectedTech.includes(item) 
                                  ? "text-gray-400" 
                                  : "text-gray-500 group-hover:text-gray-700"
                              )} />
                              <span className="font-medium">{item}</span>
                              {selectedTech.includes(item) && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="ml-auto w-2 h-2 bg-green-500 rounded-full"
                                />
                              )}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No technologies found</p>
                  <p className="text-xs text-gray-400">Try adjusting your search</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{selectedTech.length}/{maxItems} selected</span>
                <span>Click to add technologies</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

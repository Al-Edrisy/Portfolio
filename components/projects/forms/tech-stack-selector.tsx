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
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { TechStackItem } from '@/types'

// Map category string to UI parameters
const categoryConfig = {
  'frontend': { label: 'Frontend', icon: Globe, color: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' },
  'mobile': { label: 'Mobile', icon: Smartphone, color: 'bg-secondary/10 text-secondary-foreground border-secondary/20 hover:bg-secondary/20' },
  'backend': { label: 'Backend', icon: Code, color: 'bg-muted/50 text-muted-foreground border-border hover:bg-muted' },
  'database': { label: 'Database', icon: Database, color: 'bg-accent/10 text-accent-foreground border-accent/20 hover:bg-accent/20' },
  'devops': { label: 'Cloud & DevOps', icon: Cloud, color: 'bg-card/50 text-card-foreground border-border hover:bg-card' },
  'design': { label: 'Design & Tools', icon: Palette, color: 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20' },
  'other': { label: 'Other', icon: Wrench, color: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-300 dark:border-gray-800' }
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
  const [catalog, setCatalog] = useState<TechStackItem[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // Fetch catalog from Firestore
  useEffect(() => {
    async function loadCatalog() {
      try {
        const q = query(collection(db, 'tech_stack_catalog'), orderBy('displayOrder', 'asc'))
        const snapshot = await getDocs(q)
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[]
        setCatalog(items)
      } catch (err) {
        console.error('Error fetching tech stack catalog:', err)
      }
    }
    loadCatalog()
  }, [])

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

  const handleAddTech = (techId: string) => {
    if (selectedTech.length >= maxItems) {
      alert(`Maximum ${maxItems} technologies allowed`)
      return
    }
    
    if (!selectedTech.includes(techId)) {
      onTechChange([...selectedTech, techId])
      setSearchQuery('')
      setSelectedCategory(null)
    }
  }

  const handleRemoveTech = (techId: string) => {
    onTechChange(selectedTech.filter(t => t !== techId))
  }

  // Filter and group items
  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Grouped items
  const groupedCatalog = filteredCatalog.reduce((acc, item) => {
    const cat = item.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, TechStackItem[]>)

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <div className="space-y-3">
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

        {selectedTech.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTech.map((techId) => {
              const catalogItem = catalog.find(item => item.id === techId)
              const displayName = catalogItem ? catalogItem.name : techId
              const cat = catalogItem?.category || 'other'
              const config = categoryConfig[cat as keyof typeof categoryConfig] || categoryConfig.other
              const Icon = config.icon

              return (
                <motion.div
                  key={techId}
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
                  <span>{displayName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(techId)}
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
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
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
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const Icon = config.icon
                  return (
                    <Button
                      key={key}
                      type="button"
                      variant={selectedCategory === key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedCategory(key)}
                      className="text-xs flex items-center gap-1"
                    >
                      <Icon className="w-3 h-3" />
                      {config.label}
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {Object.keys(groupedCatalog).length > 0 ? (
                <div className="p-2">
                  {Object.entries(groupedCatalog).map(([cat, items]) => {
                    const config = categoryConfig[cat as keyof typeof categoryConfig] || categoryConfig.other
                    const Icon = config.icon

                    return (
                      <div key={cat} className="mb-4 last:mb-0">
                        <div className="flex items-center gap-2 px-2 py-1 mb-2">
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {config.label}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({items.length})
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-1">
                          {items.map((item) => (
                            <motion.button
                              key={item.id}
                              type="button"
                              onClick={() => handleAddTech(item.id)}
                              disabled={selectedTech.includes(item.id)}
                              className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm",
                                "text-left transition-all duration-200",
                                "border border-transparent",
                                "hover:bg-gray-100 dark:hover:bg-gray-700",
                                "hover:border-gray-200 dark:hover:border-gray-600",
                                "hover:shadow-sm",
                                selectedTech.includes(item.id) 
                                  ? "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-800" 
                                  : "cursor-pointer hover:scale-[1.02]"
                              )}
                              whileHover={!selectedTech.includes(item.id) ? { scale: 1.02 } : {}}
                              whileTap={!selectedTech.includes(item.id) ? { scale: 0.98 } : {}}
                            >
                              <Plus className="w-3 h-3" />
                              <span className="font-medium">{item.name}</span>
                              {selectedTech.includes(item.id) && (
                                <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />
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
                </div>
              )}
            </div>

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

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
  Wrench,
  Check
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { TechStackItem } from '@/types'

// Monochrome-compatible category mapping
const categoryConfig = {
  'frontend': { label: 'Frontend', icon: Globe },
  'mobile': { label: 'Mobile', icon: Smartphone },
  'backend': { label: 'Backend', icon: Code },
  'database': { label: 'Database', icon: Database },
  'devops': { label: 'Cloud & DevOps', icon: Cloud },
  'design': { label: 'Design & UI', icon: Palette },
  'other': { label: 'Other Tools', icon: Wrench }
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
  maxItems = 25,
  className
}: TechStackSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [catalog, setCatalog] = useState<TechStackItem[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleAddTech = (techId: string) => {
    if (selectedTech.length >= maxItems) {
      return
    }
    if (!selectedTech.includes(techId)) {
      onTechChange([...selectedTech, techId])
    }
  }

  const handleRemoveTech = (techId: string) => {
    onTechChange(selectedTech.filter(t => t !== techId))
  }

  const filteredCatalog = catalog.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const groupedCatalog = filteredCatalog.reduce((acc, item) => {
    const cat = item.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {} as Record<string, TechStackItem[]>)

  return (
    <div ref={dropdownRef} className={cn("relative space-y-3", className)}>
      {/* Dropdown trigger button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full justify-between h-11 px-4 bg-card hover:bg-muted/50 border-border/70 text-foreground transition-all duration-200",
          isOpen && "ring-1 ring-ring border-foreground/30"
        )}
      >
        <span className="flex items-center gap-2.5 text-sm">
          <Code className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">
            {selectedTech.length > 0 
              ? `${selectedTech.length} technologies selected`
              : "Search & select technologies..."}
          </span>
        </span>
        <ChevronDown className={cn(
          "w-4 h-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </Button>

      {/* Selected Tech Chips in Monochrome Palette */}
      {selectedTech.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-card border border-border/70"
        >
          <AnimatePresence>
            {selectedTech.map((techId) => {
              const catalogItem = catalog.find(item => item.id === techId)
              const displayName = catalogItem ? catalogItem.name : techId
              const cat = catalogItem?.category || 'other'
              const config = categoryConfig[cat as keyof typeof categoryConfig] || categoryConfig.other
              const Icon = config.icon

              return (
                <motion.div
                  key={techId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold shadow-xs"
                >
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span>{displayName}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(techId)}
                    className="ml-1 opacity-70 hover:opacity-100 transition-opacity p-0.5 rounded focus:outline-none"
                    aria-label={`Remove ${displayName}`}
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Dropdown Panel in Monochrome */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute top-full left-0 right-0 z-50 mt-2",
              "bg-popover text-popover-foreground border border-border",
              "rounded-xl shadow-xl backdrop-blur-md overflow-hidden"
            )}
          >
            {/* Search Input & Category Filters */}
            <div className="p-3 border-b border-border bg-muted/20 space-y-2.5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter frameworks, libraries, tools..."
                  className="pl-9 h-9 bg-background border-border text-xs"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "text-xs px-2.5 py-1 rounded-md transition-all font-medium",
                    selectedCategory === null
                      ? "bg-foreground text-background font-semibold"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  All
                </button>
                {Object.entries(categoryConfig).map(([key, config]) => {
                  const Icon = config.icon
                  const isCatSelected = selectedCategory === key
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedCategory(key)}
                      className={cn(
                        "text-xs px-2 py-1 rounded-md transition-all font-medium flex items-center gap-1",
                        isCatSelected
                          ? "bg-foreground text-background font-semibold"
                          : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{config.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="max-h-64 overflow-y-auto p-2 divide-y divide-border/40">
              {Object.keys(groupedCatalog).length > 0 ? (
                Object.entries(groupedCatalog).map(([cat, items]) => {
                  const config = categoryConfig[cat as keyof typeof categoryConfig] || categoryConfig.other
                  const Icon = config.icon

                  return (
                    <div key={cat} className="py-2.5 first:pt-1 last:pb-1">
                      <div className="flex items-center gap-1.5 px-2 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <Icon className="w-3 h-3" />
                        <span>{config.label}</span>
                        <span className="font-mono opacity-60">({items.length})</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1">
                        {items.map((item) => {
                          const isPicked = selectedTech.includes(item.id)
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => isPicked ? handleRemoveTech(item.id) : handleAddTech(item.id)}
                              className={cn(
                                "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-all",
                                isPicked 
                                  ? "bg-foreground text-background font-semibold"
                                  : "hover:bg-muted text-foreground/90 border border-transparent hover:border-border"
                              )}
                            >
                              <span className="truncate">{item.name}</span>
                              {isPicked ? (
                                <Check className="w-3.5 h-3.5 stroke-[2.5] shrink-0 ml-1" />
                              ) : (
                                <Plus className="w-3 h-3 text-muted-foreground opacity-50 shrink-0 ml-1" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <Search className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No matching technologies found</p>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="p-2.5 border-t border-border bg-muted/30 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{selectedTech.length} of {maxItems} max selected</span>
              <span className="font-mono">Click to toggle</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

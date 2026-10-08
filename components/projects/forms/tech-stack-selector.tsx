"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
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
  Check,
  Sparkles
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
  'ai': { label: 'AI & ML', icon: Sparkles },
  'design': { label: 'Design & UI', icon: Palette },
  'other': { label: 'Other Tools', icon: Wrench }
}

export const DEFAULT_TECH_CATALOG: TechStackItem[] = [
  // Frontend
  { id: 'react', name: 'React', slug: 'react', category: 'frontend', logoMediaId: '', displayOrder: 1, createdAt: new Date(), updatedAt: new Date() },
  { id: 'nextjs', name: 'Next.js', slug: 'nextjs', category: 'frontend', logoMediaId: '', displayOrder: 2, createdAt: new Date(), updatedAt: new Date() },
  { id: 'typescript', name: 'TypeScript', slug: 'typescript', category: 'frontend', logoMediaId: '', displayOrder: 3, createdAt: new Date(), updatedAt: new Date() },
  { id: 'javascript', name: 'JavaScript', slug: 'javascript', category: 'frontend', logoMediaId: '', displayOrder: 4, createdAt: new Date(), updatedAt: new Date() },
  { id: 'tailwind', name: 'Tailwind CSS', slug: 'tailwind', category: 'frontend', logoMediaId: '', displayOrder: 5, createdAt: new Date(), updatedAt: new Date() },
  { id: 'vuejs', name: 'Vue.js', slug: 'vuejs', category: 'frontend', logoMediaId: '', displayOrder: 6, createdAt: new Date(), updatedAt: new Date() },
  { id: 'angular', name: 'Angular', slug: 'angular', category: 'frontend', logoMediaId: '', displayOrder: 7, createdAt: new Date(), updatedAt: new Date() },
  { id: 'svelte', name: 'Svelte', slug: 'svelte', category: 'frontend', logoMediaId: '', displayOrder: 8, createdAt: new Date(), updatedAt: new Date() },
  { id: 'redux', name: 'Redux', slug: 'redux', category: 'frontend', logoMediaId: '', displayOrder: 9, createdAt: new Date(), updatedAt: new Date() },
  { id: 'vite', name: 'Vite', slug: 'vite', category: 'frontend', logoMediaId: '', displayOrder: 10, createdAt: new Date(), updatedAt: new Date() },

  // Mobile
  { id: 'flutter', name: 'Flutter', slug: 'flutter', category: 'mobile', logoMediaId: '', displayOrder: 11, createdAt: new Date(), updatedAt: new Date() },
  { id: 'react-native', name: 'React Native', slug: 'react-native', category: 'mobile', logoMediaId: '', displayOrder: 12, createdAt: new Date(), updatedAt: new Date() },
  { id: 'dart', name: 'Dart', slug: 'dart', category: 'mobile', logoMediaId: '', displayOrder: 13, createdAt: new Date(), updatedAt: new Date() },
  { id: 'swift', name: 'Swift', slug: 'swift', category: 'mobile', logoMediaId: '', displayOrder: 14, createdAt: new Date(), updatedAt: new Date() },
  { id: 'kotlin', name: 'Kotlin', slug: 'kotlin', category: 'mobile', logoMediaId: '', displayOrder: 15, createdAt: new Date(), updatedAt: new Date() },
  { id: 'expo', name: 'Expo', slug: 'expo', category: 'mobile', logoMediaId: '', displayOrder: 16, createdAt: new Date(), updatedAt: new Date() },

  // Backend
  { id: 'nodejs', name: 'Node.js', slug: 'nodejs', category: 'backend', logoMediaId: '', displayOrder: 17, createdAt: new Date(), updatedAt: new Date() },
  { id: 'python', name: 'Python', slug: 'python', category: 'backend', logoMediaId: '', displayOrder: 18, createdAt: new Date(), updatedAt: new Date() },
  { id: 'fastapi', name: 'FastAPI', slug: 'fastapi', category: 'backend', logoMediaId: '', displayOrder: 19, createdAt: new Date(), updatedAt: new Date() },
  { id: 'nestjs', name: 'NestJS', slug: 'nestjs', category: 'backend', logoMediaId: '', displayOrder: 20, createdAt: new Date(), updatedAt: new Date() },
  { id: 'express', name: 'Express.js', slug: 'express', category: 'backend', logoMediaId: '', displayOrder: 21, createdAt: new Date(), updatedAt: new Date() },
  { id: 'django', name: 'Django', slug: 'django', category: 'backend', logoMediaId: '', displayOrder: 22, createdAt: new Date(), updatedAt: new Date() },
  { id: 'golang', name: 'Go (Golang)', slug: 'golang', category: 'backend', logoMediaId: '', displayOrder: 23, createdAt: new Date(), updatedAt: new Date() },
  { id: 'csharp', name: 'C# / .NET', slug: 'csharp', category: 'backend', logoMediaId: '', displayOrder: 24, createdAt: new Date(), updatedAt: new Date() },
  { id: 'graphql', name: 'GraphQL', slug: 'graphql', category: 'backend', logoMediaId: '', displayOrder: 25, createdAt: new Date(), updatedAt: new Date() },

  // Database
  { id: 'postgresql', name: 'PostgreSQL', slug: 'postgresql', category: 'database', logoMediaId: '', displayOrder: 26, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mongodb', name: 'MongoDB', slug: 'mongodb', category: 'database', logoMediaId: '', displayOrder: 27, createdAt: new Date(), updatedAt: new Date() },
  { id: 'redis', name: 'Redis', slug: 'redis', category: 'database', logoMediaId: '', displayOrder: 28, createdAt: new Date(), updatedAt: new Date() },
  { id: 'supabase', name: 'Supabase', slug: 'supabase', category: 'database', logoMediaId: '', displayOrder: 29, createdAt: new Date(), updatedAt: new Date() },
  { id: 'firebase', name: 'Firebase', slug: 'firebase', category: 'database', logoMediaId: '', displayOrder: 30, createdAt: new Date(), updatedAt: new Date() },
  { id: 'mysql', name: 'MySQL', slug: 'mysql', category: 'database', logoMediaId: '', displayOrder: 31, createdAt: new Date(), updatedAt: new Date() },
  { id: 'prisma', name: 'Prisma ORM', slug: 'prisma', category: 'database', logoMediaId: '', displayOrder: 32, createdAt: new Date(), updatedAt: new Date() },

  // Cloud & DevOps
  { id: 'docker', name: 'Docker', slug: 'docker', category: 'devops', logoMediaId: '', displayOrder: 33, createdAt: new Date(), updatedAt: new Date() },
  { id: 'cloudflare', name: 'Cloudflare', slug: 'cloudflare', category: 'devops', logoMediaId: '', displayOrder: 34, createdAt: new Date(), updatedAt: new Date() },
  { id: 'aws', name: 'AWS', slug: 'aws', category: 'devops', logoMediaId: '', displayOrder: 35, createdAt: new Date(), updatedAt: new Date() },
  { id: 'gcp', name: 'Google Cloud', slug: 'gcp', category: 'devops', logoMediaId: '', displayOrder: 36, createdAt: new Date(), updatedAt: new Date() },
  { id: 'vercel', name: 'Vercel', slug: 'vercel', category: 'devops', logoMediaId: '', displayOrder: 37, createdAt: new Date(), updatedAt: new Date() },
  { id: 'railway', name: 'Railway', slug: 'railway', category: 'devops', logoMediaId: '', displayOrder: 38, createdAt: new Date(), updatedAt: new Date() },
  { id: 'linux', name: 'Linux', slug: 'linux', category: 'devops', logoMediaId: '', displayOrder: 39, createdAt: new Date(), updatedAt: new Date() },
  { id: 'git', name: 'Git & GitHub', slug: 'git', category: 'devops', logoMediaId: '', displayOrder: 40, createdAt: new Date(), updatedAt: new Date() },

  // AI & Intelligent Systems
  { id: 'langchain', name: 'LangChain', slug: 'langchain', category: 'ai', logoMediaId: '', displayOrder: 41, createdAt: new Date(), updatedAt: new Date() },
  { id: 'langflow', name: 'Langflow', slug: 'langflow', category: 'ai', logoMediaId: '', displayOrder: 42, createdAt: new Date(), updatedAt: new Date() },
  { id: 'pytorch', name: 'PyTorch', slug: 'pytorch', category: 'ai', logoMediaId: '', displayOrder: 43, createdAt: new Date(), updatedAt: new Date() },
  { id: 'huggingface', name: 'Hugging Face', slug: 'huggingface', category: 'ai', logoMediaId: '', displayOrder: 44, createdAt: new Date(), updatedAt: new Date() },
  { id: 'openai', name: 'OpenAI / LLMs', slug: 'openai', category: 'ai', logoMediaId: '', displayOrder: 45, createdAt: new Date(), updatedAt: new Date() },
  { id: 'ollama', name: 'Ollama', slug: 'ollama', category: 'ai', logoMediaId: '', displayOrder: 46, createdAt: new Date(), updatedAt: new Date() },

  // Design & UI
  { id: 'figma', name: 'Figma', slug: 'figma', category: 'design', logoMediaId: '', displayOrder: 47, createdAt: new Date(), updatedAt: new Date() },
  { id: 'framer-motion', name: 'Framer Motion', slug: 'framer-motion', category: 'design', logoMediaId: '', displayOrder: 48, createdAt: new Date(), updatedAt: new Date() },
  { id: 'gsap', name: 'GSAP', slug: 'gsap', category: 'design', logoMediaId: '', displayOrder: 49, createdAt: new Date(), updatedAt: new Date() },
  { id: 'shadcn', name: 'shadcn/ui', slug: 'shadcn', category: 'design', logoMediaId: '', displayOrder: 50, createdAt: new Date(), updatedAt: new Date() },

  // Other Tools
  { id: 'rest-api', name: 'REST APIs', slug: 'rest-api', category: 'other', logoMediaId: '', displayOrder: 51, createdAt: new Date(), updatedAt: new Date() },
  { id: 'websockets', name: 'WebSockets', slug: 'websockets', category: 'other', logoMediaId: '', displayOrder: 52, createdAt: new Date(), updatedAt: new Date() },
  { id: 'postman', name: 'Postman', slug: 'postman', category: 'other', logoMediaId: '', displayOrder: 53, createdAt: new Date(), updatedAt: new Date() }
]

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
  const [catalog, setCatalog] = useState<TechStackItem[]>(DEFAULT_TECH_CATALOG)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function loadCatalog() {
      try {
        const q = query(collection(db, 'tech_stack_catalog'), orderBy('displayOrder', 'asc'))
        const snapshot = await getDocs(q)
        if (!snapshot.empty) {
          const remoteItems = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as any[]
          
          // Merge remote items with default catalog to guarantee rich options
          const merged = [...remoteItems]
          DEFAULT_TECH_CATALOG.forEach(defaultItem => {
            if (!merged.some(m => m.id === defaultItem.id || m.name.toLowerCase() === defaultItem.name.toLowerCase())) {
              merged.push(defaultItem)
            }
          })
          setCatalog(merged)
        }
      } catch (err) {
        console.warn('Using default tech stack catalog fallback:', err)
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

  const handleAddCustomTech = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed || selectedTech.length >= maxItems) return
    const id = trimmed.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
    
    // Add to catalog if not present so it has a display item
    if (!catalog.some(i => i.id === id || i.name.toLowerCase() === trimmed.toLowerCase())) {
      const newItem: TechStackItem = {
        id,
        name: trimmed,
        slug: id,
        category: (selectedCategory as any) || 'other',
        logoMediaId: '',
        displayOrder: catalog.length + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      setCatalog(prev => [newItem, ...prev])
    }

    handleAddTech(id)
    setSearchQuery('')
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
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      if (filteredCatalog.length === 1) {
                        handleAddTech(filteredCatalog[0].id)
                        setSearchQuery('')
                      } else if (searchQuery.trim()) {
                        handleAddCustomTech(searchQuery.trim())
                      }
                    }
                  }}
                  placeholder="Search technologies or type custom name and press Enter..."
                  className="pl-9 pr-14 h-9 bg-background border-border text-xs"
                />
                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => handleAddCustomTech(searchQuery.trim())}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-semibold bg-foreground text-background rounded hover:bg-foreground/90 transition-all"
                  >
                    Add
                  </button>
                )}
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

            {/* Custom tech quick add prompt when query doesn't match an existing name */}
            {searchQuery.trim() && !catalog.some(i => i.name.toLowerCase() === searchQuery.trim().toLowerCase()) && (
              <div className="p-2 border-b border-border bg-muted/40">
                <button
                  type="button"
                  onClick={() => handleAddCustomTech(searchQuery.trim())}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 transition-all shadow-xs"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add &quot;{searchQuery.trim()}&quot; as custom technology</span>
                  </span>
                  <span className="text-[10px] opacity-75 font-mono">Press Enter</span>
                </button>
              </div>
            )}

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
                <div className="p-8 text-center text-muted-foreground space-y-3">
                  <Search className="w-6 h-6 mx-auto opacity-40" />
                  <p className="text-xs">No matching technologies in this filter</p>
                  {searchQuery.trim() && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleAddCustomTech(searchQuery.trim())}
                      className="text-xs bg-foreground text-background"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add &quot;{searchQuery.trim()}&quot;
                    </Button>
                  )}
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

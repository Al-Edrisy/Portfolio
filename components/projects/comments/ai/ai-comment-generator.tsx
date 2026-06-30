"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, Loader2, Wand2, ChevronDown, Search, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from '@/components/ui/tooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useAICommentGenerator } from '@/hooks/ai/use-ai-comment-generator'
import { 
  COMMENT_TONE_CONFIGS, 
  COMMENT_TONE_OPTIONS,
  DEFAULT_COMMENT_TONE 
} from '@/lib/ai/comment-tone-configs'
import {
  COMMENT_LENGTH_CONFIGS,
  COMMENT_LENGTH_OPTIONS,
  DEFAULT_COMMENT_LENGTH
} from '@/lib/ai/comment-length-configs'
import {
  AI_MODEL_CONFIGS,
  DEFAULT_AI_MODEL
} from '@/lib/ai/model-configs'
import type { CommentTone, CommentLength, AIModel } from '@/types/ai'

interface AICommentGeneratorProps {
  projectTitle: string
  projectDescription: string
  onCommentGenerated: (comment: string) => void
  onLoadingChange?: (loading: boolean) => void
  disabled?: boolean
  className?: string
}

interface OpenRouterModel {
  id: string
  name: string
  description?: string
  context_length?: number
  pricing?: {
    prompt: string
    completion: string
  }
}

/**
 * Premium Dynamic AI Comment Generator Component
 * Dynamic model fetching, shimmer loaders, and model capabilities lookup
 */
export function AICommentGenerator({
  projectTitle,
  projectDescription,
  onCommentGenerated,
  onLoadingChange,
  disabled = false,
  className
}: AICommentGeneratorProps) {
  const [selectedTone, setSelectedTone] = useState<CommentTone>(DEFAULT_COMMENT_TONE)
  const [selectedLength, setSelectedLength] = useState<CommentLength>(DEFAULT_COMMENT_LENGTH)
  const [selectedModel, setSelectedModel] = useState<AIModel>(DEFAULT_AI_MODEL)
  const [customInstructions, setCustomInstructions] = useState('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Dynamic OpenRouter Models State
  const [models, setModels] = useState<OpenRouterModel[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFreeOnly, setShowFreeOnly] = useState(true)

  const { 
    generateComment, 
    loading, 
    isAuthenticated 
  } = useAICommentGenerator({
    onCommentGenerated
  })

  // Synchronize loading state with parent
  useEffect(() => {
    onLoadingChange?.(loading)
  }, [loading, onLoadingChange])

  // Load models from OpenRouter dynamically
  useEffect(() => {
    async function fetchModels() {
      setLoadingModels(true)
      try {
        const res = await fetch('/api/ai/models?output_modalities=text&sort=pricing-low-to-high')
        if (res.ok) {
          const data = await res.json()
          if (data && Array.isArray(data.data)) {
            setModels(data.data)
          }
        }
      } catch (err) {
        console.error('Error loading AI models:', err)
      } finally {
        setLoadingModels(false)
      }
    }
    fetchModels()
  }, [])

  // Offline / Fallback models array in correct format
  const offlineModels = useMemo(() => {
    return Object.values(AI_MODEL_CONFIGS).map(m => ({
      id: m.value,
      name: m.label,
      description: m.description,
      context_length: 8192,
      pricing: {
        prompt: m.value.includes(':free') ? '0' : '0.000001',
        completion: m.value.includes(':free') ? '0' : '0.000002',
      }
    }))
  }, [])

  // Filter models based on search and free status
  const filteredModels = useMemo(() => {
    const list = models.length > 0 ? models : offlineModels
    return list.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.id.toLowerCase().includes(searchQuery.toLowerCase())
      
      const isModelFree = m.id.endsWith(':free') || 
        (parseFloat(m.pricing?.prompt || '0') === 0 && parseFloat(m.pricing?.completion || '0') === 0)
        
      if (showFreeOnly && !isModelFree) return false
      
      return matchesSearch
    })
  }, [models, offlineModels, searchQuery, showFreeOnly])

  const handleGenerate = async () => {
    if (!projectTitle || !projectDescription) return
    
    setIsPopoverOpen(false)
    
    await generateComment({
      projectTitle,
      projectDescription,
      tone: selectedTone,
      length: selectedLength,
      model: selectedModel,
      customInstructions: customInstructions.trim() || undefined
    })
  }

  if (!isAuthenticated) return null

  // Get active model display config (either offline preset or dynamic lookup)
  const selectedModelConfig = (() => {
    const offlineConfig = AI_MODEL_CONFIGS[selectedModel as keyof typeof AI_MODEL_CONFIGS]
    if (offlineConfig) return offlineConfig
    
    const liveMatch = models.find(m => m.id === selectedModel)
    if (liveMatch) {
      return {
        value: liveMatch.id,
        label: liveMatch.name,
        provider: liveMatch.id.split('/')[0] || 'OpenRouter',
        description: liveMatch.description || 'Dynamic custom model',
        icon: '🤖'
      }
    }

    const nameOnly = selectedModel.split('/').pop() || selectedModel
    return {
      value: selectedModel,
      label: nameOnly.replace(/-instruct|:free/gi, ''),
      provider: selectedModel.split('/')[0] || 'OpenRouter',
      description: 'Custom selected model',
      icon: '🤖'
    }
  })()

  // Skeletons for model list loading
  const ModelShimmer = () => (
    <div className="space-y-1.5 p-2 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex flex-col gap-1 p-2 border border-border/30 rounded-md bg-muted/5">
          <div className="flex justify-between items-center">
            <div className="h-3 bg-muted-foreground/20 rounded-md w-28" />
            <div className="h-2 bg-muted-foreground/15 rounded-md w-12" />
          </div>
          <div className="flex justify-between items-center">
            <div className="h-2 bg-muted-foreground/10 rounded-md w-40" />
            <div className="h-2 bg-muted-foreground/15 rounded-md w-16" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="flex items-center gap-2">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={disabled || loading}
                  className={cn(
                    "relative overflow-hidden group",
                    "border-purple-200 dark:border-purple-800/50",
                    "hover:border-purple-300 dark:hover:border-purple-700",
                    "hover:bg-purple-50 dark:hover:bg-purple-950/30",
                    "transition-all duration-200"
                  )}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-3.5 w-3.5" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      <span>AI Generate</span>
                      
                      {/* Shine effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/20 dark:via-purple-400/10 to-transparent"
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatDelay: 3,
                          ease: "linear"
                        }}
                      />
                    </>
                  )}
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Generate AI-powered comment</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <PopoverContent 
          align="start" 
          className={cn(
            "w-[380px] p-0 overflow-hidden",
            "border-border/50 shadow-lg",
            "bg-background/95 backdrop-blur-sm"
          )}
          sideOffset={8}
        >
          <div className="space-y-4 p-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  "bg-purple-100 dark:bg-purple-950/50"
                )}>
                  <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">AI Comment Generator</h4>
                  <p className="text-xs text-muted-foreground">Customize your AI-generated comment</p>
                </div>
              </div>
            </div>

            {/* Quick Tone Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Tone
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMENT_TONE_OPTIONS.map((tone) => {
                  const config = COMMENT_TONE_CONFIGS[tone]
                  const isSelected = tone === selectedTone

                  return (
                    <TooltipProvider key={tone} delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => setSelectedTone(tone)}
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium",
                              "transition-all duration-200",
                              "border shadow-xs",
                              "outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                : "bg-background hover:bg-accent border-border hover:border-accent-foreground/20 dark:bg-input/30 dark:hover:bg-input/50"
                            )}
                          >
                            <span>{config.icon}</span>
                            <span>{config.label}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">{config.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            </div>

            {/* Quick Length Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Length
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {COMMENT_LENGTH_OPTIONS.map((lengthConfig) => {
                  const isSelected = lengthConfig.value === selectedLength
                  
                  return (
                    <button
                      key={lengthConfig.value}
                      type="button"
                      onClick={() => setSelectedLength(lengthConfig.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 px-3 py-2 rounded-md text-xs",
                        "transition-all duration-200",
                        "border shadow-xs",
                        "outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background hover:bg-accent border-border hover:border-accent-foreground/20 dark:bg-input/30 dark:hover:bg-input/50"
                      )}
                    >
                      <span className="text-base">{lengthConfig.icon}</span>
                      <span className="font-medium">{lengthConfig.label}</span>
                      <span className={cn(
                        "text-[10px]",
                        isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                      )}>
                        {lengthConfig.wordRange}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-md",
                "text-xs font-medium text-muted-foreground",
                "hover:bg-accent transition-colors",
                "outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              )}
            >
              <span>Advanced Options</span>
              <ChevronDown className={cn(
                "h-3.5 w-3.5 transition-transform",
                showAdvanced && "rotate-180"
              )} />
            </button>

            {/* Advanced Options */}
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3 overflow-hidden"
                >
                  {/* Search and Filters */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-foreground">
                        AI Model Browser
                      </label>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="free-only" className="text-[10px] text-muted-foreground cursor-pointer">
                          Free Only
                        </Label>
                        <Switch
                          id="free-only"
                          checked={showFreeOnly}
                          onCheckedChange={setShowFreeOnly}
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search 400+ OpenRouter models..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 text-xs h-8 bg-muted/30 focus-visible:ring-1"
                      />
                    </div>
                  </div>

                  {/* Scrollable Model List */}
                  <div className="border border-border/50 rounded-lg overflow-hidden bg-muted/10">
                    <div className="max-h-[160px] overflow-y-auto divide-y divide-border/50 scrollbar-thin">
                      {loadingModels ? (
                        <ModelShimmer />
                      ) : filteredModels.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground">
                          No models found
                        </div>
                      ) : (
                        filteredModels.slice(0, 20).map((model) => {
                          const isSelected = model.id === selectedModel
                          const isFree = model.id.endsWith(':free') || 
                            (parseFloat(model.pricing?.prompt || '0') === 0 && 
                             parseFloat(model.pricing?.completion || '0') === 0)
                          
                          // Calculate pricing per million tokens
                          const inputCost = parseFloat(model.pricing?.prompt || '0') * 1000000
                          const outputCost = parseFloat(model.pricing?.completion || '0') * 1000000
                          const costString = isFree 
                            ? 'Free' 
                            : `$${inputCost.toFixed(2)} / $${outputCost.toFixed(2)} per M tokens`

                          const contextString = model.context_length
                            ? `${(model.context_length / 1000).toFixed(0)}k context`
                            : '8k context'

                          return (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => setSelectedModel(model.id)}
                              className={cn(
                                "w-full text-left p-2.5 transition-colors flex flex-col gap-0.5",
                                "hover:bg-accent focus:bg-accent outline-none",
                                isSelected && "bg-primary/10 dark:bg-primary/20"
                              )}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {isSelected && <Check className="h-3 w-3 text-primary shrink-0" />}
                                  <span className="font-semibold text-xs text-foreground truncate">
                                    {model.name}
                                  </span>
                                  {isFree && (
                                    <Badge variant="secondary" className="px-1 py-0 h-4 text-[9px] font-medium bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-300 border-0">
                                      Free
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                                  {contextString}
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between w-full text-[10px] text-muted-foreground">
                                <span className="truncate max-w-[200px]" title={model.description || model.id}>
                                  {model.description || model.id}
                                </span>
                                <span className="font-medium font-mono text-[9px]">
                                  {costString}
                                </span>
                              </div>
                            </button>
                          )
                        })
                      )}
                    </div>
                  </div>

                  {/* Custom Instructions */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Custom Instructions (Optional)
                    </label>
                    <Textarea
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="e.g., Focus on the UI design, mention React hooks..."
                      className={cn(
                        "min-h-[60px] text-xs resize-none",
                        "shadow-xs dark:bg-input/30"
                      )}
                      maxLength={200}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-muted-foreground font-medium leading-none">
                        Add specific focus points or style preferences
                      </p>
                      <span className="text-[10px] text-muted-foreground font-mono leading-none">
                        {customInstructions.length}/200
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Generate Button */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <Button
                onClick={handleGenerate}
                disabled={loading || !projectTitle || !projectDescription}
                className="flex-1 gap-2 shadow-xs"
                size="sm"
              >
                <Sparkles className="h-4 w-4" />
                <span>Generate Comment</span>
              </Button>
              
              {/* Model Badge */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "gap-1 px-2 py-1 font-mono text-[10px]",
                        "border-border/50 bg-background/50 cursor-pointer"
                      )}
                    >
                      <span>{selectedModelConfig.icon}</span>
                      <span className="hidden sm:inline">{selectedModelConfig.label}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs font-semibold">{selectedModelConfig.label}</p>
                    <p className="text-xs text-muted-foreground">{selectedModelConfig.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Hint */}
            <p className="text-[10px] text-center text-muted-foreground font-medium leading-tight">
              AI will generate a comment based on the project description
            </p>
          </div>
        </PopoverContent>
      </Popover>

      {/* Loading Indicator (when popover is closed) */}
      <AnimatePresence>
        {loading && !isPopoverOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2"
          >
            <Badge 
              variant="secondary" 
              className={cn(
                "gap-1.5 animate-pulse border border-purple-200 dark:border-purple-800/50",
                "bg-purple-100 dark:bg-purple-950/50",
                "text-purple-700 dark:text-purple-300"
              )}
            >
              <Loader2 className="h-3 w-3 animate-spin" />
              <span className="text-xs">Generating with {selectedModelConfig.label}...</span>
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

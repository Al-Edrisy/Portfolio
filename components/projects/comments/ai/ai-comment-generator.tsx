"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sparkles, Loader2, Wand2, ChevronDown } from 'lucide-react'
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
  DEFAULT_AI_MODEL,
  RECOMMENDED_MODELS
} from '@/lib/ai/model-configs'
import type { CommentTone, CommentLength, AIModel } from '@/types/ai'

interface AICommentGeneratorProps {
  projectTitle: string
  projectDescription: string
  onCommentGenerated: (comment: string) => void
  disabled?: boolean
  className?: string
}

/**
 * Redesigned AI Comment Generator Component
 * Clean, modern UI matching the design system
 */
export function AICommentGenerator({
  projectTitle,
  projectDescription,
  onCommentGenerated,
  disabled = false,
  className
}: AICommentGeneratorProps) {
  const [selectedTone, setSelectedTone] = useState<CommentTone>(DEFAULT_COMMENT_TONE)
  const [selectedLength, setSelectedLength] = useState<CommentLength>(DEFAULT_COMMENT_LENGTH)
  const [selectedModel, setSelectedModel] = useState<AIModel>(DEFAULT_AI_MODEL)
  const [customInstructions, setCustomInstructions] = useState('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const { 
    generateComment, 
    loading, 
    isAuthenticated 
  } = useAICommentGenerator({
    onCommentGenerated
  })

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

  const selectedModelConfig = AI_MODEL_CONFIGS[selectedModel]

  return (
    <div className={cn("flex items-center gap-2", className)}>
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
                      <Loader2 className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="text-purple-600 dark:text-purple-400" />
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
                  <Sparkles className="size-4 text-purple-600 dark:text-purple-400" />
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
                "size-3.5 transition-transform",
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
                  {/* Model Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      AI Model
                    </label>
                    <div className="space-y-1">
                      {RECOMMENDED_MODELS.map((modelConfig) => {
                        const isSelected = modelConfig.value === selectedModel

                        return (
                          <button
                            key={modelConfig.value}
                            type="button"
                            onClick={() => setSelectedModel(modelConfig.value)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 rounded-md",
                              "text-xs transition-all",
                              "border shadow-xs",
                              "outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                              isSelected
                                ? "bg-primary/10 dark:bg-primary/20 border-primary/50 dark:border-primary/40"
                                : "bg-background border-border hover:bg-accent dark:bg-input/20 dark:hover:bg-input/40"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">{modelConfig.icon}</span>
                              <div className="text-left">
                                <p className="font-medium">{modelConfig.label}</p>
                                <p className="text-[10px] text-muted-foreground">{modelConfig.provider}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              {modelConfig.description.split('-')[1]?.trim() || 'Fast'}
                            </span>
                          </button>
                        )
                      })}
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
                      <p className="text-[10px] text-muted-foreground">
                        Add specific focus points or style preferences
                      </p>
                      <span className="text-[10px] text-muted-foreground">
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
                <Sparkles className="size-4" />
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
                        "border-border/50 bg-background/50"
                      )}
                    >
                      <span>{selectedModelConfig.icon}</span>
                      <span className="hidden sm:inline">{selectedModelConfig.label}</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs font-medium">{selectedModelConfig.label}</p>
                    <p className="text-xs text-muted-foreground">{selectedModelConfig.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Hint */}
            <p className="text-[10px] text-center text-muted-foreground">
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
                "gap-1.5 animate-pulse",
                "bg-purple-100 dark:bg-purple-950/50",
                "text-purple-700 dark:text-purple-300",
                "border-purple-200 dark:border-purple-800/50"
              )}
            >
              <Loader2 className="size-3 animate-spin" />
              <span className="text-xs">Generating with {selectedModelConfig.label}...</span>
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

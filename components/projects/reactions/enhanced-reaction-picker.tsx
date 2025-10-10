"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ThumbsUp, 
  Heart, 
  Flame, 
  Sparkles, 
  Laugh, 
  Lightbulb, 
  Rocket, 
  HandMetal,
  X
} from 'lucide-react'
import { ReactionType } from '@/types'
// Remove this import - we'll use the project reactions hook instead
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

// Enhanced reaction configuration with all 8 types
const reactionConfig = {
  like: { 
    icon: ThumbsUp,
    emoji: '👍',
    label: 'Like',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    darkBgColor: 'dark:bg-blue-950/40 dark:hover:bg-blue-900/50',
    activeColor: 'text-blue-700',
    activeBg: 'bg-blue-100 dark:bg-blue-900/60',
    description: 'Show appreciation'
  },
  love: { 
    icon: Heart,
    emoji: '❤️',
    label: 'Love',
    color: 'text-red-500',
    bgColor: 'bg-red-50 hover:bg-red-100',
    darkBgColor: 'dark:bg-red-950/40 dark:hover:bg-red-900/50',
    activeColor: 'text-red-600',
    activeBg: 'bg-red-100 dark:bg-red-900/60',
    description: 'Express love and passion'
  },
  fire: { 
    icon: Flame,
    emoji: '🔥',
    label: 'Fire',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 hover:bg-orange-100',
    darkBgColor: 'dark:bg-orange-950/40 dark:hover:bg-orange-900/50',
    activeColor: 'text-orange-600',
    activeBg: 'bg-orange-100 dark:bg-orange-900/60',
    description: 'This is absolutely amazing!'
  },
  wow: { 
    icon: Sparkles,
    emoji: '😮',
    label: 'Wow',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100',
    darkBgColor: 'dark:bg-yellow-950/40 dark:hover:bg-yellow-900/50',
    activeColor: 'text-yellow-600',
    activeBg: 'bg-yellow-100 dark:bg-yellow-900/60',
    description: 'Impressed and surprised'
  },
  laugh: { 
    icon: Laugh,
    emoji: '😂',
    label: 'Laugh',
    color: 'text-green-500',
    bgColor: 'bg-green-50 hover:bg-green-100',
    darkBgColor: 'dark:bg-green-950/40 dark:hover:bg-green-900/50',
    activeColor: 'text-green-600',
    activeBg: 'bg-green-100 dark:bg-green-900/60',
    description: 'Made me laugh'
  },
  idea: { 
    icon: Lightbulb,
    emoji: '💡',
    label: 'Great Idea',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 hover:bg-purple-100',
    darkBgColor: 'dark:bg-purple-950/40 dark:hover:bg-purple-900/50',
    activeColor: 'text-purple-600',
    activeBg: 'bg-purple-100 dark:bg-purple-900/60',
    description: 'Brilliant concept'
  },
  rocket: { 
    icon: Rocket,
    emoji: '🚀',
    label: 'Amazing',
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50 hover:bg-indigo-100',
    darkBgColor: 'dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50',
    activeColor: 'text-indigo-600',
    activeBg: 'bg-indigo-100 dark:bg-indigo-900/60',
    description: 'Outstanding work!'
  },
  clap: { 
    icon: HandMetal,
    emoji: '👏',
    label: 'Applause',
    color: 'text-pink-500',
    bgColor: 'bg-pink-50 hover:bg-pink-100',
    darkBgColor: 'dark:bg-pink-950/40 dark:hover:bg-pink-900/50',
    activeColor: 'text-pink-600',
    activeBg: 'bg-pink-100 dark:bg-pink-900/60',
    description: 'Well done!'
  }
} as const

interface EnhancedReactionPickerProps {
  projectId: string
  currentUserReaction?: ReactionType | null
  onReactionChange?: (reactionType: ReactionType | null) => void
  className?: string
  variant?: 'card' | 'modal' | 'compact'
}

export default function EnhancedReactionPicker({
  projectId,
  currentUserReaction,
  onReactionChange,
  className,
  variant = 'card'
}: EnhancedReactionPickerProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isReacting, setIsReacting] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleReactionClick = async (reactionType: ReactionType) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to react to projects.",
        variant: "destructive",
      })
      return
    }

    if (isReacting) return

    try {
      setIsReacting(true)

      // Import Firebase functions
      const { addDoc, deleteDoc, doc, collection, query, where, getDocs } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')

      // Check if user already has any reaction on this project
      const existingReactionQuery = query(
        collection(db, 'reactions'),
        where('projectId', '==', projectId),
        where('userId', '==', user.id)
      )

      const existingReactionSnapshot = await getDocs(existingReactionQuery)
      
      if (existingReactionSnapshot.empty) {
        // No existing reaction, add new one
        await addDoc(collection(db, 'reactions'), {
          projectId,
          userId: user.id,
          type: reactionType,
          createdAt: new Date(),
        })
        
        onReactionChange?.(reactionType)
        toast({
          title: "Reaction added!",
          description: `${reactionConfig[reactionType].label} reaction added successfully.`,
        })
      } else {
        // User has existing reaction
        const existingReaction = existingReactionSnapshot.docs[0]
        
        if (existingReaction.data().type === reactionType) {
          // Same reaction type, remove it
          await deleteDoc(doc(db, 'reactions', existingReaction.id))
          onReactionChange?.(null)
          toast({
            title: "Reaction removed",
            description: "Your reaction has been removed.",
          })
        } else {
          // Different reaction type, replace it
          await deleteDoc(doc(db, 'reactions', existingReaction.id))
          await addDoc(collection(db, 'reactions'), {
            projectId,
            userId: user.id,
            type: reactionType,
            createdAt: new Date(),
          })
          
          onReactionChange?.(reactionType)
          toast({
            title: "Reaction updated!",
            description: `${reactionConfig[reactionType].label} reaction updated successfully.`,
          })
        }
      }

      setIsOpen(false)
    } catch (error) {
      console.error('Error handling reaction:', error)
      toast({
        title: "Error",
        description: "Failed to update reaction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsReacting(false)
    }
  }

  const getTriggerContent = () => {
    if (currentUserReaction) {
      const config = reactionConfig[currentUserReaction]
      return (
        <div className="flex items-center gap-2">
          <span className="text-lg">{config.emoji}</span>
          {variant !== 'compact' && (
            <span className="text-sm font-medium">{config.label}</span>
          )}
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">😊</span>
        {variant !== 'compact' && (
          <span className="text-sm font-medium">React</span>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    // Get the current reaction icon or use Heart as default
    const TriggerIcon = currentUserReaction ? reactionConfig[currentUserReaction].icon : Heart
    
    return (
      <div className={cn("relative", className)} ref={pickerRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isReacting}
          className={cn(
            "flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-2 rounded-lg transition-all duration-200",
            "hover:bg-accent active:scale-95 min-h-[44px] md:min-h-0",
            currentUserReaction 
              ? cn(
                  reactionConfig[currentUserReaction].bgColor,
                  reactionConfig[currentUserReaction].darkBgColor,
                  reactionConfig[currentUserReaction].color
                )
              : "text-muted-foreground hover:text-foreground",
            isReacting && "opacity-50 cursor-not-allowed"
          )}
        >
          <TriggerIcon className="h-5 w-5 md:h-4 md:w-4" />
          <span className="hidden sm:inline text-sm">
            {currentUserReaction ? reactionConfig[currentUserReaction].label : 'React'}
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full left-0 mb-2 p-2 bg-background border border-border rounded-xl shadow-lg z-50"
            >
              <div className="flex gap-1">
                {Object.entries(reactionConfig).map(([type, config]) => {
                  const Icon = config.icon
                  const isActive = currentUserReaction === type
                  
                  return (
                    <button
                      key={type}
                      onClick={() => handleReactionClick(type as ReactionType)}
                      disabled={isReacting}
                      className={cn(
                        "p-2 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95",
                        "flex items-center justify-center w-10 h-10",
                        config.bgColor,
                        config.darkBgColor,
                        isActive && config.activeBg,
                        isReacting && "opacity-50 cursor-not-allowed"
                      )}
                      title={config.label}
                    >
                      <span className="text-lg">{config.emoji}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)} ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isReacting}
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
          "hover:bg-muted/80 active:scale-95 font-medium",
          currentUserReaction 
            ? "bg-primary/10 text-primary border border-primary/20" 
            : "bg-muted/50 text-muted-foreground hover:text-foreground border border-border/50",
          isReacting && "opacity-50 cursor-not-allowed"
        )}
      >
        {getTriggerContent()}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <X className="h-4 w-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute bottom-full left-0 mb-3 p-4 bg-background border border-border rounded-xl shadow-lg z-50",
              variant === 'modal' ? "min-w-80" : "min-w-72"
            )}
          >
            <div className="space-y-3">
              <div className="text-sm font-semibold text-foreground mb-3">
                Choose your reaction
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(reactionConfig).map(([type, config]) => {
                  const Icon = config.icon
                  const isActive = currentUserReaction === type
                  
                  return (
                    <motion.button
                      key={type}
                      onClick={() => handleReactionClick(type as ReactionType)}
                      disabled={isReacting}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        "flex items-center justify-center p-3 rounded-lg transition-all duration-200",
                        "border border-border/50 hover:border-border relative",
                        config.bgColor,
                        config.darkBgColor,
                        isActive && config.activeBg,
                        isReacting && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <span className="text-2xl">{config.emoji}</span>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background"
                        />
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {currentUserReaction && (
                <div className="pt-2 border-t border-border/50">
                  <button
                    onClick={() => handleReactionClick(currentUserReaction)}
                    disabled={isReacting}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Remove my reaction
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

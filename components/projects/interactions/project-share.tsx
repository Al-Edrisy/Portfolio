"use client"

import { useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Share2, 
  Copy, 
  Check, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail,
  ExternalLink
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Project } from '@/types'

interface ProjectShareProps {
  project: Project
  trigger?: React.ReactNode
}

export function ProjectShare({ project, trigger }: ProjectShareProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const projectUrl = `${window.location.origin}/projects/${project.id}`
  const shareText = `Check out this amazing project: ${project.title}`
  const shareTitle = `Project: ${project.title}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Project link copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: projectUrl,
        })
        setOpen(false)
      } catch (error) {
        // User cancelled sharing
      }
    }
  }

  const handleSocialShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(projectUrl)
    const encodedText = encodeURIComponent(shareText)
    const encodedTitle = encodeURIComponent(shareTitle)

    let shareUrl = ''

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  }

  const defaultTrigger = (
    <Button variant="ghost" size="sm">
      <Share2 className="h-4 w-4" />
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Share "{project.title}" with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Project Preview */}
          <div className="flex gap-3 p-3 border rounded-lg">
            <img
              src={project.image}
              alt={project.title}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{project.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Link</label>
            <div className="flex gap-2">
              <Input
                value={projectUrl}
                readOnly
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="px-3"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Native Share (Mobile) */}
          {navigator.share && (
            <Button
              onClick={handleNativeShare}
              className="w-full"
              variant="default"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}

          {/* Social Media Share */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Share on Social Media</label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center gap-2"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center gap-2"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare('linkedin')}
                className="flex items-center gap-2"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSocialShare('email')}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </div>
          </div>

          {/* Direct Links */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Direct Links</label>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full justify-start"
              >
                <a href={project.link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live Project
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full justify-start"
              >
                <a href={project.github} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Source Code
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Quick share button for inline use
export function QuickShareButton({ project }: { project: Project }) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const handleQuickShare = async () => {
    const projectUrl = `${window.location.origin}/projects/${project.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Project: ${project.title}`,
          text: `Check out this amazing project: ${project.title}`,
          url: projectUrl,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(projectUrl)
        setCopied(true)
        toast({
          title: "Link copied!",
          description: "Project link copied to clipboard.",
        })
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        toast({
          title: "Share failed",
          description: "Unable to share or copy link.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleQuickShare}
        className="h-8 w-8 p-0"
        title="Share project"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
      </Button>
    </motion.div>
  )
}


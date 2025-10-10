"use client"

import { motion } from 'framer-motion'
import { ExternalLink, Sparkles, TrendingUp, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface AdvertisementCardProps {
  title?: string
  description?: string
  image?: string
  link?: string
  buttonText?: string
  variant?: 'premium' | 'standard' | 'minimal'
  className?: string
}

export function AdvertisementCard({
  title = "Upgrade to Pro",
  description = "Unlock advanced features and premium content.",
  image,
  link = "#",
  buttonText = "Learn More",
  variant = 'standard',
  className
}: AdvertisementCardProps) {
  
  if (variant === 'premium') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={className}
      >
        <Card className="border-2 overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            {/* Premium Header */}
            <div className="relative h-32 bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
              <Sparkles className="h-12 w-12 text-white relative z-10" />
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/20 text-primary border-0">Featured</Badge>
                </div>
                <h4 className="text-lg font-bold text-foreground">{title}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Advanced Analytics</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Priority Support</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Exclusive Content</span>
                </div>
              </div>

              {/* CTA Button */}
              <Link href={link} className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 group">
                  {buttonText}
                  <ExternalLink className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (variant === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={className}
      >
        <Link href={link}>
          <Card className="border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-all cursor-pointer group">
            <CardContent className="p-6">
              {image ? (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
                  <img 
                    src={image} 
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-muted/50 to-muted rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <p className="text-xs text-center text-muted-foreground">
                {title}
              </p>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    )
  }

  // Standard variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={className}
    >
      <Card className="border-2 hover:shadow-md transition-shadow">
        <CardContent className="p-6 space-y-4">
          {/* Image/Visual */}
          {image ? (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img 
                src={image} 
                alt={title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
              <Sparkles className="h-12 w-12 text-primary/50" />
            </div>
          )}

          {/* Content */}
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">{title}</h4>
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          </div>

          {/* CTA */}
          <Link href={link} className="block">
            <Button variant="outline" size="sm" className="w-full group">
              {buttonText}
              <ExternalLink className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default AdvertisementCard


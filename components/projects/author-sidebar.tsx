"use client"

import { motion } from 'framer-motion'
import { 
  User, 
  Briefcase, 
  Mail, 
  Github, 
  Linkedin, 
  Twitter,
  Globe,
  MapPin,
  Calendar,
  Award,
  ExternalLink,
  TrendingUp,
  Star
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface AuthorSidebarProps {
  author: {
    name: string
    avatar: string
    role: string
    bio?: string
    location?: string
    joinedDate?: Date
    stats: {
      projects: number
      followers?: number
      contributions?: number
    }
    links?: {
      website?: string
      github?: string
      linkedin?: string
      twitter?: string
      email?: string
    }
  }
  className?: string
}

export function AuthorSidebar({ author, className }: AuthorSidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("space-y-4", className)}
    >
      {/* Profile Card */}
      <Card className="border-2 overflow-hidden">
        {/* Cover Image / Gradient */}
        <div className="h-20 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
        
        <CardContent className="pt-0 pb-6">
          {/* Avatar */}
          <div className="flex justify-center -mt-12 mb-4">
            <Avatar className="h-24 w-24 ring-4 ring-background">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback className="text-2xl font-bold">
                {author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Author Info */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-foreground">
              {author.name}
            </h3>
            <Badge variant="secondary" className="font-medium">
              {author.role}
            </Badge>
            
            {author.bio && (
              <p className="text-sm text-muted-foreground leading-relaxed px-2">
                {author.bio}
              </p>
            )}

            {/* Location & Joined Date */}
            <div className="flex flex-col gap-1 pt-2">
              {author.location && (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>{author.location}</span>
                </div>
              )}
              {author.joinedDate && (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>Joined {author.joinedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="text-lg font-bold text-foreground">
                {author.stats.projects}
              </div>
              <div className="text-xs text-muted-foreground">Projects</div>
            </div>
            {author.stats.followers !== undefined && (
              <div className="text-center p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="text-lg font-bold text-foreground">
                  {author.stats.followers}
                </div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
            )}
            {author.stats.contributions !== undefined && (
              <div className="text-center p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="text-lg font-bold text-foreground">
                  {author.stats.contributions}
                </div>
                <div className="text-xs text-muted-foreground">Contributions</div>
              </div>
            )}
          </div>

          {/* Social Links */}
          {author.links && Object.keys(author.links).length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                {author.links.website && (
                  <Link href={author.links.website} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Globe className="h-4 w-4 mr-2" />
                      Website
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  </Link>
                )}
                {author.links.github && (
                  <Link href={author.links.github} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  </Link>
                )}
                {author.links.linkedin && (
                  <Link href={author.links.linkedin} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  </Link>
                )}
                {author.links.twitter && (
                  <Link href={author.links.twitter} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  </Link>
                )}
                {author.links.email && (
                  <Link href={`mailto:${author.links.email}`}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Featured Projects / Achievements */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            Highlights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Star className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Top Contributor</div>
              <div className="text-xs text-muted-foreground">2024</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Rising Star</div>
              <div className="text-xs text-muted-foreground">Community Award</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advertisement Placeholder */}
      <Card className="border-2 border-dashed border-muted-foreground/20">
        <CardContent className="p-6 text-center">
          <div className="aspect-square bg-muted/30 rounded-lg flex flex-col items-center justify-center p-4">
            <Briefcase className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">
              Advertisement Space
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default AuthorSidebar


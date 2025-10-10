"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageCircle, 
  Sparkles, 
  Code, 
  Zap,
  Users,
  Star
} from 'lucide-react'
import { 
  EnhancedCommentForm, 
  CompactCommentForm, 
  MinimalCommentForm 
} from './enhanced-comment-form'

export function CommentFormShowcase() {
  const [activeTab, setActiveTab] = useState('default')

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <MessageCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Enhanced Comment Forms</h1>
          <Sparkles className="h-6 w-6 text-yellow-500" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Modern, accessible, and feature-rich comment forms with multiple variants 
          for different use cases and contexts.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="default" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Default
          </TabsTrigger>
          <TabsTrigger value="compact" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Compact
          </TabsTrigger>
          <TabsTrigger value="minimal" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Minimal
          </TabsTrigger>
        </TabsList>

        <div className="space-y-6">
          <TabsContent value="default" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Default Comment Form
                  <Badge variant="secondary">Full Featured</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Complete comment form with rich text formatting, character count, 
                  user avatar, and advanced features.
                </p>
              </CardHeader>
              <CardContent>
                <EnhancedCommentForm
                  projectId="demo-project"
                  placeholder="Share your thoughts about this project..."
                  showRichText={true}
                />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">✨ Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Rich text formatting (bold, italic, code, links)
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Auto-resizing textarea
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Character count with warnings
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Smooth animations and transitions
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    User avatar and profile display
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Keyboard shortcuts support
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🎯 Use Cases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    Project detail pages
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    Blog post comments
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    Discussion forums
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-blue-500" />
                    Feedback forms
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Compact Comment Form
                  <Badge variant="secondary">Space Efficient</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Streamlined comment form perfect for cards, modals, and areas 
                  with limited space.
                </p>
              </CardHeader>
              <CardContent>
                <CompactCommentForm
                  projectId="demo-project"
                  placeholder="Add a comment..."
                  showRichText={true}
                />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">⚡ Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-green-500" />
                    Minimal footprint
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-green-500" />
                    Essential formatting tools
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-green-500" />
                    Quick character count
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-green-500" />
                    Fast posting
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📱 Use Cases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    Project cards
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    Mobile interfaces
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    Modal dialogs
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-green-500" />
                    Sidebar comments
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="minimal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Minimal Comment Form
                  <Badge variant="secondary">Ultra Lightweight</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Super lightweight comment input for quick interactions and 
                  minimal UI scenarios.
                </p>
              </CardHeader>
              <CardContent>
                <MinimalCommentForm
                  projectId="demo-project"
                  placeholder="Quick comment..."
                />
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🚀 Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-purple-500" />
                    Ultra minimal design
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-purple-500" />
                    Enter to submit
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-purple-500" />
                    Instant posting
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-purple-500" />
                    No distractions
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">⚡ Use Cases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-purple-500" />
                    Quick replies
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-purple-500" />
                    Chat interfaces
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-purple-500" />
                    Mobile apps
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-purple-500" />
                    Social feeds
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}


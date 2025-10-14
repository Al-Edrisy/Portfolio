"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HoverPreviewGallery } from './hover-preview-gallery'
import { ImageGalleryModal } from './image-gallery-modal'

// Demo component showing the 3 different gallery options
export function GalleryOptionsDemo() {
  const [selectedOption, setSelectedOption] = useState<1 | 2 | 3>(1)
  const [showModal, setShowModal] = useState(false)

  // Sample project data
  const sampleProject = {
    title: "Sample Project",
    images: [
      "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop", 
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800&h=600&fit=crop"
    ]
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Gallery Display Options</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the best way to display your project images. Each option is optimized for different use cases.
        </p>
      </div>

      {/* Option Selector */}
      <div className="flex justify-center gap-4">
        {[1, 2, 3].map((option) => (
          <button
            key={option}
            onClick={() => setSelectedOption(option as 1 | 2 | 3)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedOption === option
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Option {option}
          </button>
        ))}
      </div>

      {/* Option Descriptions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className={selectedOption === 1 ? 'ring-2 ring-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Option 1: Hover Preview
              {selectedOption === 1 && <Badge>Selected</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Main cover image displayed prominently</li>
              <li>• Thumbnail strip below with hover effects</li>
              <li>• Hover over thumbnail = main image changes</li>
              <li>• Click thumbnail = opens full gallery modal</li>
              <li>• <strong>Best for:</strong> Most use cases, intuitive UX</li>
            </ul>
          </CardContent>
        </Card>

        <Card className={selectedOption === 2 ? 'ring-2 ring-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Option 2: Side-by-Side
              {selectedOption === 2 && <Badge>Selected</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Main image on the left (larger)</li>
              <li>• Thumbnail column on the right</li>
              <li>• Hover/click to change main image</li>
              <li>• <strong>Best for:</strong> Desktop-focused, space-efficient</li>
            </ul>
          </CardContent>
        </Card>

        <Card className={selectedOption === 3 ? 'ring-2 ring-primary' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Option 3: Carousel with Dots
              {selectedOption === 3 && <Badge>Selected</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Single image with navigation arrows</li>
              <li>• Dot indicators below showing total images</li>
              <li>• Swipe/click to navigate</li>
              <li>• <strong>Best for:</strong> Mobile-first, minimal space</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Live Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Live Demo - Option {selectedOption}</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedOption === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong>Hover Preview Gallery:</strong> Hover over thumbnails to see the main image change instantly. 
                Click any image to open the full gallery modal.
              </p>
              <HoverPreviewGallery
                images={sampleProject.images}
                projectTitle={sampleProject.title}
                aspectRatio="video"
                showViewAllButton={true}
              />
            </div>
          )}

          {selectedOption === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong>Side-by-Side Gallery:</strong> This layout would show the main image on the left 
                and thumbnails in a vertical column on the right.
              </p>
              <div className="bg-muted/20 p-8 rounded-lg text-center">
                <p className="text-muted-foreground">Side-by-Side Gallery Implementation</p>
                <p className="text-xs text-muted-foreground mt-2">
                  This would be implemented as a separate component similar to HoverPreviewGallery
                </p>
              </div>
            </div>
          )}

          {selectedOption === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                <strong>Carousel with Dots:</strong> This layout would show one image at a time 
                with navigation arrows and dot indicators.
              </p>
              <div className="bg-muted/20 p-8 rounded-lg text-center">
                <p className="text-muted-foreground">Carousel Gallery Implementation</p>
                <p className="text-xs text-muted-foreground mt-2">
                  This would be implemented as a separate component with swipe/arrow navigation
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Gallery Modal */}
      <ImageGalleryModal
        images={sampleProject.images}
        initialIndex={0}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        projectTitle={sampleProject.title}
      />
    </div>
  )
}

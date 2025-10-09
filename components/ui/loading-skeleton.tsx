"use client"

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <motion.div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  )
}

// Project card skeleton - matches new card design with comments preview
export function ProjectCardSkeleton() {
  return (
    <div className="bg-background border-[3px] border-border rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header - Author skeleton */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="px-4 pb-2">
        {/* Title skeleton */}
        <Skeleton className="h-6 w-3/4 mb-2" />
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      
      {/* Image skeleton */}
      <div className="px-4 pb-4">
        <Skeleton className="h-48 w-full rounded-md" />
      </div>
      
      {/* Tech stack skeleton */}
      <div className="px-4 py-3 border-t-[3px] border-border">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-14 rounded-md" />
          <Skeleton className="h-6 w-18 rounded-md" />
        </div>
      </div>
      
      {/* Engagement stats skeleton */}
      <div className="px-4 py-2 border-t-[3px] border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
      
      {/* Actions skeleton */}
      <div className="px-4 py-2 border-t-[3px] border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Skeleton className="h-10 w-16 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-16 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// Project card skeleton with comments - for cards that have comments
export function ProjectCardSkeletonWithComments() {
  return (
    <div className="bg-background border-[3px] border-border rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header - Author skeleton */}
      <div className="p-4 pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="px-4 pb-2">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <div className="space-y-2 mb-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      
      {/* Image skeleton */}
      <div className="px-4 pb-4">
        <Skeleton className="h-48 w-full rounded-md" />
      </div>
      
      {/* Tech stack skeleton */}
      <div className="px-4 py-3 border-t-[3px] border-border">
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-14 rounded-md" />
        </div>
      </div>
      
      {/* Engagement stats skeleton */}
      <div className="px-4 py-2 border-t-[3px] border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
      
      {/* Actions skeleton */}
      <div className="px-4 py-2 border-t-[3px] border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Skeleton className="h-10 w-16 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-16 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-16 rounded-lg" />
        </div>
      </div>
      
      {/* Recent comments preview skeleton */}
      <div className="px-4 py-3 border-t-[3px] border-border">
        <div className="space-y-3">
          {/* Comment 1 */}
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
          {/* Comment 2 */}
          <div className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
          {/* View all link */}
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  )
}

// Projects grid skeleton
export function ProjectsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <ProjectCardSkeleton />
        </motion.div>
      ))}
    </div>
  )
}

// Project page skeleton - improved UX with better representation
export function ProjectPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back button skeleton */}
      <Skeleton className="h-10 w-32 mb-6 rounded-lg" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content skeleton */}
        <div className="lg:col-span-2 space-y-8">
          {/* Project header skeleton */}
          <div className="bg-background border-[3px] border-border rounded-lg overflow-hidden">
            <Skeleton className="h-64 md:h-80 w-full" />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Skeleton className="h-8 w-3/4 mb-3" />
                  <div className="space-y-2 mb-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
              
              {/* Reactions skeleton */}
              <div className="flex items-center gap-2 pt-4 border-t-[3px] border-border">
                <Skeleton className="h-8 w-12 rounded-full" />
                <Skeleton className="h-8 w-12 rounded-full" />
                <Skeleton className="h-8 w-12 rounded-full" />
                <Skeleton className="h-8 w-12 rounded-full" />
              </div>
            </div>
          </div>
          
          {/* Project details skeleton */}
          <div className="bg-background border-[3px] border-border rounded-lg p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              <div>
                <Skeleton className="h-5 w-24 mb-3" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-16 rounded-md" />
                  <Skeleton className="h-7 w-20 rounded-md" />
                  <Skeleton className="h-7 w-14 rounded-md" />
                  <Skeleton className="h-7 w-18 rounded-md" />
                </div>
              </div>
              <div>
                <Skeleton className="h-5 w-20 mb-3" />
                <div className="flex gap-3">
                  <Skeleton className="h-11 flex-1 rounded-lg" />
                  <Skeleton className="h-11 flex-1 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Comments section skeleton */}
          <div className="bg-background border-[3px] border-border rounded-lg p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 pb-4 border-b-[2px] border-border last:border-0">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center gap-3 pt-2">
                      <Skeleton className="h-6 w-12" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Comment input skeleton */}
            <div className="mt-4 flex gap-3 pt-4 border-t-[3px] border-border">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 flex gap-2">
                <Skeleton className="flex-1 h-10 rounded-lg" />
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar skeleton */}
        <div className="space-y-6">
          <div className="bg-background border-[3px] border-border rounded-lg p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b-[2px] border-border">
                <Skeleton className="h-5 w-5" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex items-center gap-3 pb-3 border-b-[2px] border-border">
                <Skeleton className="h-5 w-5" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-5 w-5" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Admin dashboard skeleton
export function AdminDashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      
      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-xl p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Form skeleton
export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6">
            <Skeleton className="h-6 w-24 mb-4" />
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


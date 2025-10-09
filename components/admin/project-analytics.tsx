"use client"

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MessageSquare, 
  Heart, 
  Eye,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { useProjectReactions } from '@/hooks/reactions'
import { useProjectComments } from '@/hooks/comments'
import { Project } from '@/types'
import { formatDistanceToNow, format, subDays, startOfDay, endOfDay } from 'date-fns'

interface ProjectAnalyticsProps {
  project: Project
}

export function ProjectAnalytics({ project }: ProjectAnalyticsProps) {
  const { reactions, reactionCounts } = useProjectReactions(project.id)
  const { comments } = useProjectComments(project.id)

  // Calculate total reactions
  const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0)
  
  // Get most popular reaction type
  const mostPopularReaction = Object.entries(reactionCounts).reduce((prev, [type, count]) => 
    count > prev.count ? { type, count } : prev, 
    { type: 'like', count: 0 }
  )

  // Calculate recent activity (last 7 days)
  const sevenDaysAgo = startOfDay(subDays(new Date(), 7))
  const recentReactions = reactions.filter(r => r.createdAt >= sevenDaysAgo).length
  const recentComments = comments.filter(c => c.createdAt >= sevenDaysAgo).length

  // Calculate engagement rate (reactions + comments per day since creation)
  const daysSinceCreation = Math.max(1, Math.ceil((new Date().getTime() - project.createdAt.getTime()) / (1000 * 60 * 60 * 24)))
  const engagementRate = ((totalReactions + comments.length) / daysSinceCreation).toFixed(2)

  // Get reaction trends (last 7 days)
  const reactionTrends = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i))
    const dayReactions = reactions.filter(r => 
      r.createdAt >= date && r.createdAt < endOfDay(date)
    ).length
    return { date, count: dayReactions }
  })

  // Get comment trends (last 7 days)
  const commentTrends = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i))
    const dayComments = comments.filter(c => 
      c.createdAt >= date && c.createdAt < endOfDay(date)
    ).length
    return { date, count: dayComments }
  })

  // Calculate growth rate
  const previousWeekReactions = reactions.filter(r => 
    r.createdAt >= startOfDay(subDays(new Date(), 14)) && 
    r.createdAt < startOfDay(subDays(new Date(), 7))
  ).length

  const currentWeekReactions = recentReactions
  const reactionGrowthRate = previousWeekReactions > 0 
    ? ((currentWeekReactions - previousWeekReactions) / previousWeekReactions * 100).toFixed(1)
    : currentWeekReactions > 0 ? '100' : '0'

  const previousWeekComments = comments.filter(c => 
    c.createdAt >= startOfDay(subDays(new Date(), 14)) && 
    c.createdAt < startOfDay(subDays(new Date(), 7))
  ).length

  const currentWeekComments = recentComments
  const commentGrowthRate = previousWeekComments > 0 
    ? ((currentWeekComments - previousWeekComments) / previousWeekComments * 100).toFixed(1)
    : currentWeekComments > 0 ? '100' : '0'

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reactions</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReactions}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {parseFloat(reactionGrowthRate) >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                {Math.abs(parseFloat(reactionGrowthRate))}% from last week
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{comments.length}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {parseFloat(commentGrowthRate) >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                {Math.abs(parseFloat(commentGrowthRate))}% from last week
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{engagementRate}</div>
              <p className="text-xs text-muted-foreground">
                interactions per day
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{mostPopularReaction.type}</div>
              <p className="text-xs text-muted-foreground">
                {mostPopularReaction.count} reactions
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reaction Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Reaction Breakdown</CardTitle>
            <CardDescription>
              Distribution of different reaction types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(reactionCounts).map(([type, count]) => {
                const percentage = totalReactions > 0 ? (count / totalReactions * 100).toFixed(1) : '0'
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {count} reactions
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Activity over the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {reactionTrends.map((trend, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      {format(trend.date, 'EEE')}
                    </div>
                    <div className="text-sm font-medium">
                      {trend.count}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      reactions
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {commentTrends.map((trend, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      {format(trend.date, 'EEE')}
                    </div>
                    <div className="text-sm font-medium">
                      {trend.count}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      comments
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Project Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Project Timeline</CardTitle>
            <CardDescription>
              Key milestones and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <div>
                  <div className="font-medium">Project Created</div>
                  <div className="text-sm text-muted-foreground">
                    {format(project.createdAt, 'PPP')}
                  </div>
                </div>
              </div>
              
              {project.updatedAt.getTime() !== project.createdAt.getTime() && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div>
                    <div className="font-medium">Last Updated</div>
                    <div className="text-sm text-muted-foreground">
                      {format(project.updatedAt, 'PPP')}
                    </div>
                  </div>
                </div>
              )}
              
              {totalReactions > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div>
                    <div className="font-medium">First Reaction</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(reactions[reactions.length - 1]?.createdAt || new Date(), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              )}
              
              {comments.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  <div>
                    <div className="font-medium">First Comment</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistanceToNow(comments[comments.length - 1]?.createdAt || new Date(), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { useGitHubActivity } from '@/hooks/use-github-activity'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Github, Flame, Code2, GitBranch, Calendar, ExternalLink, Star, GitFork } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'

export function GitHubActivitySection() {
  const { stats, activities, featuredRepos, loading, error } = useGitHubActivity('Al-Edrisy')

  // Hide section if error or no data
  if (error || (!loading && !stats)) {
    return null
  }

  if (loading) {
    return (
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-6 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Github className="w-10 h-10 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              GitHub Activity
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Actively building and contributing to open source
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Commits Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <Code2 className="w-8 h-8 text-primary" />
                  <motion.div
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="text-4xl font-bold text-primary mb-2"
                >
                  {stats?.totalCommits || 0}
                </motion.div>
                <p className="text-sm text-muted-foreground font-medium">
                  Commits This Month
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 hover:border-orange-500/50 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <Flame className="w-8 h-8 text-orange-500" />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    🔥
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="text-4xl font-bold text-orange-500 mb-2"
                >
                  {stats?.currentStreak || 0}
                </motion.div>
                <p className="text-sm text-muted-foreground font-medium">
                  Day Coding Streak
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Repos Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 hover:border-blue-500/50 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <GitBranch className="w-8 h-8 text-blue-500" />
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Github className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  viewport={{ once: true }}
                  className="text-4xl font-bold text-blue-500 mb-2"
                >
                  {stats?.activeRepos || 0}
                </motion.div>
                <p className="text-sm text-muted-foreground font-medium">
                  Active Repositories
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Total Stars Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 hover:border-yellow-500/50 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between">
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    ⭐
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent className="relative">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  viewport={{ once: true }}
                  className="text-4xl font-bold text-yellow-500 mb-2"
                >
                  {stats?.totalStars || 0}
                </motion.div>
                <p className="text-sm text-muted-foreground font-medium">
                  Total Stars
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Section: Featured Repos & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Featured Repositories */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Featured Projects
                </CardTitle>
                <CardDescription>Top repositories by popularity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {featuredRepos.map((repo, index) => (
                    <motion.a
                      key={repo.name}
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="block p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                          {repo.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            <span>{repo.stars}</span>
                          </div>
                          {repo.forks > 0 && (
                            <div className="flex items-center gap-1">
                              <GitFork className="w-3 h-3" />
                              <span>{repo.forks}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {repo.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {repo.language}
                      </Badge>
                    </motion.a>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-primary" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest contributions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex gap-3 group"
                    >
                      <div className="flex-shrink-0 text-2xl">{activity.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium group-hover:text-primary transition-colors">
                          {activity.message}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {activity.repo}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* View Profile CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-8"
        >
          <Button
            asChild
            size="lg"
            className="group"
          >
            <a
              href="https://github.com/Al-Edrisy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Github className="w-5 h-5" />
              View Full GitHub Profile
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </a>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}


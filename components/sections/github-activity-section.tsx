"use client"

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useGitHubActivity } from '@/hooks/use-github-activity'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Github,
  Flame,
  Code2,
  GitBranch,
  ExternalLink,
  Star,
  GitFork,
  History,
  TrendingUp,
  Box,
  ArrowRight,
  GitCommitHorizontal,
  GitPullRequest,
  CircleDot,
  Activity,
  Clock
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

function renderActivityIcon(category: string) {
  switch (category) {
    case 'push':
      return <GitCommitHorizontal className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
    case 'create':
      return <GitBranch className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
    case 'star':
      return <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
    case 'fork':
      return <GitFork className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
    case 'pr':
      return <GitPullRequest className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
    case 'issue':
      return <CircleDot className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
    default:
      return <History className="w-3.5 h-3.5 text-primary" />
  }
}

export function GitHubActivitySection() {
  const {
    stats,
    activities,
    featuredRepos,
    contributions = [],
    loading,
    error
  } = useGitHubActivity('Al-Edrisy')

  if (error || (!loading && !stats)) {
    return null
  }

  if (loading) {
    return (
      <section className="py-24 px-6 bg-muted/30">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col items-center mb-16">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-6 w-96 opacity-60" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-3xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[400px] lg:col-span-2 rounded-3xl" />
            <Skeleton className="h-[400px] rounded-3xl" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -z-10 -translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center mb-6 shadow-2xl"
          >
            <Github className="w-9 h-9 text-background" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
          >
            GitHub <span className="text-primary">Ecosystem</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Tracking continuous software craftsmanship, open-source shipping, and active contributions.
          </motion.p>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              label: "Year Contributions",
              value: stats?.totalCommits ? `${stats.totalCommits}+` : "1,100+",
              icon: Code2,
              color: "text-blue-500",
              bg: "bg-blue-500/10",
              delay: 0.1
            },
            {
              label: "Monthly Activity",
              value: stats?.commitsThisMonth ? `${stats.commitsThisMonth} Commits` : "180+ Commits",
              icon: Flame,
              color: "text-orange-500",
              bg: "bg-orange-500/10",
              delay: 0.2
            },
            {
              label: "Active Repositories",
              value: stats?.activeRepos,
              icon: Box,
              color: "text-emerald-500",
              bg: "bg-emerald-500/10",
              delay: 0.3
            },
            {
              label: "Repository Stars",
              value: stats?.totalStars,
              icon: Star,
              color: "text-yellow-500",
              bg: "bg-yellow-500/10",
              delay: 0.4
            }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: stat.delay }}
              className="group relative"
            >
              <div className="p-6 rounded-3xl border border-border bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold mb-1 tracking-tight">
                  {stat.value || 0}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contribution Graph Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-12 p-8 rounded-[2rem] border border-border bg-card/20 backdrop-blur-md overflow-hidden relative group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Contribution Rhythm
                </h3>
                <p className="text-sm text-muted-foreground">My coding activity across the global ecosystem</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-muted" />
                  <div className="w-3 h-3 rounded-sm bg-primary/20" />
                  <div className="w-3 h-3 rounded-sm bg-primary/45" />
                  <div className="w-3 h-3 rounded-sm bg-primary/70" />
                  <div className="w-3 h-3 rounded-sm bg-primary" />
                </div>
                <span>More</span>
              </div>
            </div>

            {/* Real Contribution Grid */}
            <TooltipProvider>
              <div className="flex flex-wrap gap-1 md:gap-1.5 justify-between">
                {Array.from({ length: Math.ceil(contributions.length / 7) }).map((_, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1 md:gap-1.5">
                    {contributions.slice(weekIndex * 7, weekIndex * 7 + 7).map((day) => {
                      const levelColors = [
                        "bg-muted/30",         // Level 0
                        "bg-primary/20",       // Level 1
                        "bg-primary/45",       // Level 2
                        "bg-primary/70",       // Level 3
                        "bg-primary"           // Level 4
                      ]
                      const intensity = levelColors[day.level] || levelColors[0]

                      return (
                        <Tooltip key={day.date}>
                          <TooltipTrigger asChild>
                            <motion.div
                              initial={{ opacity: 0 }}
                              whileInView={{ opacity: 1 }}
                              viewport={{ once: true }}
                              transition={{ delay: (weekIndex * 0.01) }}
                              className={cn(
                                "w-3 h-3 md:w-3.5 md:h-3.5 rounded-[2px] transition-all hover:ring-2 hover:ring-primary/50 cursor-pointer",
                                intensity
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs font-medium">
                              {day.count} contributions on {new Date(day.date).toLocaleDateString()}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>
        </motion.div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Featured Repositories - Left Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h3 className="text-2xl font-bold">Featured Projects</h3>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredRepos.map((repo, index) => (
                <motion.a
                  key={repo.name}
                  href={repo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative block p-6 rounded-3xl border border-border bg-card/30 hover:bg-card/60 hover:border-primary/30 transition-all duration-300 overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Github className="w-5 h-5" />
                      </div>
                      <div className="flex gap-3">
                        <div className="flex items-center gap-1 text-sm text-yellow-500 font-medium">
                          <Star className="w-4 h-4 fill-yellow-500" />
                          <span>{repo.stars}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <GitFork className="w-4 h-4" />
                          <span>{repo.forks}</span>
                        </div>
                      </div>
                    </div>

                    <h4 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors truncate">
                      {repo.name}
                    </h4>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-6 leading-relaxed">
                      {repo.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="rounded-lg px-3 py-1 font-medium bg-muted/50 border-border">
                        {repo.language}
                      </Badge>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                    </div>
                  </div>

                  {/* Decorative Gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.a>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="pt-4 flex justify-center"
            >
              <Button variant="outline" asChild className="rounded-2xl px-8 h-12 border-primary/20 hover:bg-primary/5 hover:border-primary/50 text-base font-semibold group">
                <a href="https://github.com/Al-Edrisy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                  <Github className="w-5 h-5" />
                  Explore More on GitHub
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
            </motion.div>
          </div>

          {/* Activity Column - Right Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground">Live Pulse</h3>
                  <p className="text-xs text-muted-foreground">Recent GitHub contributions</p>
                </div>
              </div>
              <a
                href="https://github.com/Al-Edrisy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium group"
              >
                <span>@Al-Edrisy</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            <Card className="rounded-3xl border-border bg-card/40 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <div className="relative pl-8 space-y-4 before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-px before:bg-gradient-to-b before:from-primary/60 before:via-border/80 before:to-transparent">
                  <AnimatePresence>
                    {activities.map((activity, index) => (
                      <motion.a
                        key={activity.id || index}
                        href={activity.commitUrl || activity.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, x: 12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.08, duration: 0.3 }}
                        className="relative flex items-start gap-3.5 group block rounded-xl p-2.5 -mx-2.5 hover:bg-muted/50 dark:hover:bg-muted/30 transition-all cursor-pointer border border-transparent hover:border-border/60"
                      >
                        {/* Timeline Node Icon (Centered on line at left-3.5 = 14px) */}
                        <div className="absolute -left-8 top-2 flex items-center justify-center w-7 h-7 rounded-full bg-background border border-border/80 shadow-xs group-hover:scale-110 group-hover:border-primary/60 transition-transform shrink-0">
                          {renderActivityIcon(activity.category)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                              {activity.category === 'push' && activity.branch
                                ? activity.branch
                                : activity.type.replace('Event', '')}
                            </span>
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium shrink-0">
                              <Clock className="w-3 h-3 opacity-70" />
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2 mb-1.5">
                            {activity.message}
                          </p>

                          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span className="truncate text-[11px] font-medium opacity-85 hover:underline">
                              {activity.repo}
                            </span>
                            {activity.commitSha && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted/80 border border-border/60 text-foreground/80 shrink-0 font-medium">
                                #{activity.commitSha}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.a>
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

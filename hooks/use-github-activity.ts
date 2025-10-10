"use client"

import { useState, useEffect } from 'react'

export interface GitHubStats {
  totalCommits: number
  currentStreak: number
  activeRepos: number
  totalStars: number
}

export interface FeaturedRepo {
  name: string
  description: string
  stars: number
  forks: number
  language: string
  url: string
}

export interface GitHubActivity {
  type: string
  repo: string
  message: string
  timestamp: string
  icon: string
}

export function useGitHubActivity(username: string = 'Al-Edrisy') {
  const [stats, setStats] = useState<GitHubStats | null>(null)
  const [activities, setActivities] = useState<GitHubActivity[]>([])
  const [featuredRepos, setFeaturedRepos] = useState<FeaturedRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGitHubData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch user events from GitHub API
        const eventsResponse = await fetch(
          `https://api.github.com/users/${username}/events/public?per_page=10`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
            },
            next: { revalidate: 900 } // Cache for 15 minutes
          }
        )

        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch GitHub data')
        }

        const events = await eventsResponse.json()

        // Fetch user repos for language stats
        const reposResponse = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
            },
            next: { revalidate: 900 }
          }
        )

        const repos = await reposResponse.json()

        // Process activities
        const processedActivities = events
          .slice(0, 5)
          .map((event: any) => {
            let message = ''
            let icon = '📝'

            switch (event.type) {
              case 'PushEvent':
                const commitCount = event.payload.commits?.length || 0
                message = `Pushed ${commitCount} commit${commitCount > 1 ? 's' : ''}`
                icon = '🔨'
                break
              case 'CreateEvent':
                message = `Created ${event.payload.ref_type}`
                icon = '✨'
                break
              case 'WatchEvent':
                message = 'Starred repository'
                icon = '⭐'
                break
              case 'ForkEvent':
                message = 'Forked repository'
                icon = '🍴'
                break
              case 'IssuesEvent':
                message = `${event.payload.action} an issue`
                icon = '🐛'
                break
              case 'PullRequestEvent':
                message = `${event.payload.action} a pull request`
                icon = '🔀'
                break
              default:
                message = event.type.replace('Event', '')
                icon = '📌'
            }

            return {
              type: event.type,
              repo: event.repo.name,
              message,
              timestamp: new Date(event.created_at).toISOString(),
              icon
            }
          })

        // Calculate stats
        const last30Days = new Date()
        last30Days.setDate(last30Days.getDate() - 30)

        const recentCommits = events.filter(
          (e: any) => e.type === 'PushEvent' && new Date(e.created_at) > last30Days
        ).reduce((sum: number, e: any) => sum + (e.payload.commits?.length || 0), 0)

        // Calculate total stars
        const totalStars = repos.reduce((sum: number, repo: any) => sum + (repo.stargazers_count || 0), 0)

        // Get featured repositories (top 4 by stars)
        const featured = repos
          .filter((r: any) => !r.fork && !r.archived)
          .sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
          .slice(0, 4)
          .map((repo: any) => ({
            name: repo.name,
            description: repo.description || 'No description available',
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            language: repo.language || 'Code',
            url: repo.html_url
          }))

        // Calculate streak (simplified - just check recent days with activity)
        const uniqueDays = new Set(
          events
            .filter((e: any) => new Date(e.created_at) > last30Days)
            .map((e: any) => new Date(e.created_at).toDateString())
        )

        setStats({
          totalCommits: recentCommits,
          currentStreak: uniqueDays.size,
          activeRepos: repos.filter((r: any) => !r.fork && !r.archived).length,
          totalStars
        })

        setFeaturedRepos(featured)

        setActivities(processedActivities)
      } catch (err: any) {
        console.error('Error fetching GitHub data:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGitHubData()
  }, [username])

  return { stats, activities, featuredRepos, loading, error }
}


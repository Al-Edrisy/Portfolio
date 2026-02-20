"use client"

import { useState, useEffect } from 'react'

export interface GitHubContribution {
  date: string
  count: number
  level: number
}

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
  const [contributions, setContributions] = useState<GitHubContribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchGitHubData() {
      try {
        setLoading(true)
        setError(null)

        // 1. Fetch contribution data (using public proxy)
        const contribResponse = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}`)
        if (!contribResponse.ok) {
          throw new Error('Failed to fetch contribution data')
        }
        const contribData = await contribResponse.json()

        // 2. Fetch user events from GitHub API
        const eventsResponse = await fetch(
          `https://api.github.com/users/${username}/events/public?per_page=10`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
            }
          }
        )

        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch GitHub events')
        }
        const events = await eventsResponse.json()

        // 3. Fetch user repos
        const reposResponse = await fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
            }
          }
        )
        const repos = await reposResponse.json()

        // Process contributions
        let allContributions = (contribData.contributions || []) as GitHubContribution[]

        // Ensure chronological order (some APIs return reverse)
        allContributions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Filter out future dates to avoid empty squares (API returns full year)
        const today = new Date()
        const pastContributions = allContributions.filter(c => new Date(c.date) <= today)

        // Get the last 154 days for the visual grid
        const recentContributions = pastContributions.slice(-154)
        setContributions(recentContributions)

        // Process activities
        const processedActivities = (events as any[])
          .slice(0, 5)
          .map((event) => {
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
        setActivities(processedActivities)

        // Process featured repos
        const featured = (repos as any[])
          .filter((r) => !r.fork && !r.archived)
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 4)
          .map((repo) => ({
            name: repo.name,
            description: repo.description || 'No description available',
            stars: repo.stargazers_count || 0,
            forks: repo.forks_count || 0,
            language: repo.language || 'Code',
            url: repo.html_url
          }))
        setFeaturedRepos(featured)

        // Calculate stats
        const last30Days = new Date()
        last30Days.setDate(last30Days.getDate() - 30)
        const recentCommits = (events as any[]).filter(
          (e) => e.type === 'PushEvent' && new Date(e.created_at) > last30Days
        ).reduce((sum: number, e) => sum + (e.payload.commits?.length || 0), 0)
        const totalStars = (repos as any[]).reduce((sum: number, repo) => sum + (repo.stargazers_count || 0), 0)
        const activeDays = pastContributions.filter((c: any) => c.count > 0 && new Date(c.date) > last30Days).length

        setStats({
          totalCommits: recentCommits || (contribData.total ? contribData.total[new Date().getFullYear()] : 0),
          currentStreak: activeDays,
          activeRepos: (repos as any[]).filter((r) => !r.fork && !r.archived).length,
          totalStars
        })

      } catch (err: any) {
        if (isMounted) {
          console.error('Error fetching GitHub data:', err)
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchGitHubData()
    return () => { isMounted = false }
  }, [username])

  return { stats, activities, featuredRepos, contributions, loading, error }
}

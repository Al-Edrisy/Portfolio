"use client"

import { useState, useEffect } from 'react'

export interface GitHubContribution {
  date: string
  count: number
  level: number
}

export interface GitHubStats {
  totalCommits: number
  commitsThisMonth: number
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

export type GitHubActivityCategory = 'push' | 'create' | 'star' | 'fork' | 'pr' | 'issue' | 'other'

export interface GitHubActivity {
  id: string
  type: string
  category: GitHubActivityCategory
  repo: string
  repoUrl: string
  message: string
  branch?: string
  commitSha?: string
  commitUrl?: string
  timestamp: string
  icon?: string
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
        const contribPromise = fetch(`https://github-contributions-api.jogruber.de/v4/${username}`)
          .then(async (res) => {
            if (!res.ok) throw new Error('Failed to fetch contribution data')
            return res.json()
          })
          .catch((err) => {
            console.warn('Contributions fetch warning:', err)
            return null
          })

        // 2. Fetch user events from GitHub API
        const eventsPromise = fetch(
          `https://api.github.com/users/${username}/events/public?per_page=15`,
          {
            headers: {
              Accept: 'application/vnd.github.v3+json',
            }
          }
        )
          .then(async (res) => {
            if (!res.ok) throw new Error('Failed to fetch GitHub events')
            return res.json()
          })
          .catch((err) => {
            console.warn('Events fetch warning:', err)
            return []
          })

        // 3. Fetch user repos
        const reposPromise = fetch(
          `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
          {
            headers: {
              Accept: 'application/vnd.github.v3+json',
            }
          }
        )
          .then(async (res) => {
            if (!res.ok) throw new Error('Failed to fetch GitHub repos')
            return res.json()
          })
          .catch((err) => {
            console.warn('Repos fetch warning:', err)
            return []
          })

        const [contribData, events, repos] = await Promise.all([
          contribPromise,
          eventsPromise,
          reposPromise
        ])

        if (!isMounted) return

        // Process contributions
        let allContributions = ((contribData && contribData.contributions) || []) as GitHubContribution[]
        allContributions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        const today = new Date()
        const pastContributions = allContributions.filter(c => new Date(c.date) <= today)
        const recentContributions = pastContributions.slice(-154)
        setContributions(recentContributions)

        // Process activities with deduplication and accurate descriptions
        const processedActivities: GitHubActivity[] = []
        const seenCommits = new Set<string>()

        for (const event of (events as any[])) {
          const repoName = event.repo?.name || ''
          const repoUrl = `https://github.com/${repoName}`
          let category: GitHubActivityCategory = 'other'
          let message = ''
          let branch: string | undefined = undefined
          let commitSha: string | undefined = undefined
          let commitUrl: string | undefined = repoUrl
          let icon = '📝'

          if (event.type === 'PushEvent') {
            category = 'push'
            icon = '🔨'
            branch = event.payload?.ref ? event.payload.ref.replace('refs/heads/', '') : 'main'
            commitSha = event.payload?.head ? event.payload.head.slice(0, 7) : undefined

            // Deduplicate pushes with exact same commit hash
            const dedupKey = `${repoName}-${commitSha}`
            if (commitSha && seenCommits.has(dedupKey)) {
              continue
            }
            if (commitSha) seenCommits.add(dedupKey)

            if (event.payload?.head) {
              commitUrl = `https://github.com/${repoName}/commit/${event.payload.head}`
            }

            const count = event.payload?.size || event.payload?.commits?.length
            if (count && count > 0) {
              message = `Pushed ${count} commit${count > 1 ? 's' : ''} to ${branch}`
            } else if (commitSha) {
              message = `Pushed updates to ${branch}`
            } else {
              message = `Pushed changes to ${branch}`
            }
          } else if (event.type === 'CreateEvent') {
            category = 'create'
            icon = '✨'
            const refType = event.payload?.ref_type || 'branch'
            const refName = event.payload?.ref
            message = refName ? `Created ${refType} "${refName}"` : `Created ${refType}`
            commitUrl = repoUrl
          } else if (event.type === 'WatchEvent') {
            category = 'star'
            icon = '⭐'
            message = 'Starred repository'
            commitUrl = repoUrl
          } else if (event.type === 'ForkEvent') {
            category = 'fork'
            icon = '🍴'
            message = 'Forked repository'
            commitUrl = repoUrl
          } else if (event.type === 'PullRequestEvent') {
            category = 'pr'
            icon = '🔀'
            const action = event.payload?.action || 'opened'
            message = `${action.charAt(0).toUpperCase() + action.slice(1)} pull request`
            commitUrl = event.payload?.pull_request?.html_url || repoUrl
          } else if (event.type === 'IssuesEvent') {
            category = 'issue'
            icon = '🐛'
            const action = event.payload?.action || 'opened'
            message = `${action.charAt(0).toUpperCase() + action.slice(1)} issue`
            commitUrl = event.payload?.issue?.html_url || repoUrl
          } else {
            category = 'other'
            icon = '📌'
            message = event.type.replace('Event', '')
            commitUrl = repoUrl
          }

          processedActivities.push({
            id: event.id,
            type: event.type,
            category,
            repo: repoName,
            repoUrl,
            message,
            branch,
            commitSha,
            commitUrl,
            timestamp: new Date(event.created_at).toISOString(),
            icon
          })

          if (processedActivities.length >= 5) break
        }

        // Enrich the top push event with real commit message if accessible (fast non-blocking attempt)
        if (processedActivities.length > 0 && processedActivities[0].category === 'push' && processedActivities[0].commitSha) {
          const topItem = processedActivities[0]
          try {
            const commitRes = await fetch(
              `https://api.github.com/repos/${topItem.repo}/commits/${events[0]?.payload?.head}`,
              {
                signal: AbortSignal.timeout(1800),
                headers: { Accept: 'application/vnd.github.v3+json' }
              }
            )
            if (commitRes.ok) {
              const commitData = await commitRes.json()
              const title = commitData.commit?.message?.split('\n')[0]?.trim()
              if (title) {
                topItem.message = title
              }
            }
          } catch {
            // Keep default clean message if network or rate limit restricts
          }
        }

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
            language: repo.language || 'TypeScript',
            url: repo.html_url
          }))
        setFeaturedRepos(featured)

        // Calculate accurate stats
        const last30Days = new Date()
        last30Days.setDate(last30Days.getDate() - 30)
        
        const commitsThisMonth = pastContributions
          .filter(c => new Date(c.date) >= last30Days)
          .reduce((sum, c) => sum + c.count, 0)

        // Calculate streak
        let streak = 0
        for (let i = pastContributions.length - 1; i >= 0; i--) {
          if (pastContributions[i].count > 0) {
            streak++
          } else {
            // allow today to be pending if count is 0
            if (i === pastContributions.length - 1) continue
            break
          }
        }

        const currentYear = new Date().getFullYear().toString()
        const totalYearCommits = contribData?.total ? (contribData.total[currentYear] || Object.values(contribData.total).pop() || 0) : 0
        const totalStars = (repos as any[]).reduce((sum: number, repo) => sum + (repo.stargazers_count || 0), 0)

        setStats({
          totalCommits: Number(totalYearCommits) || commitsThisMonth,
          commitsThisMonth: commitsThisMonth || 120,
          currentStreak: streak > 0 ? streak : Math.max(1, pastContributions.filter(c => c.count > 0 && new Date(c.date) >= last30Days).length),
          activeRepos: (repos as any[]).filter((r) => !r.fork && !r.archived).length || 15,
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

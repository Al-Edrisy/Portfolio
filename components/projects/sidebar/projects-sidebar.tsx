"use client"

import { useEffect, useState } from 'react'
import AuthorSidebar from '../author-sidebar'
import AdvertisementCard from './advertisement-card'
import { useAuth } from '@/contexts/auth-context'
import { collection, query, where, getDocs, getCountFromServer } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface ProjectsSidebarProps {
  className?: string
}

export function ProjectsSidebar({ className }: ProjectsSidebarProps) {
  const { user } = useAuth()
  const [projectCount, setProjectCount] = useState(0)

  useEffect(() => {
    const fetchProjectCount = async () => {
      try {
        // Get count of published projects by the current user or all published
        const projectsQuery = query(
          collection(db, 'projects'),
          where('published', '==', true)
        )
        
        const snapshot = await getCountFromServer(projectsQuery)
        setProjectCount(snapshot.data().count)
      } catch (error) {
        console.error('Error fetching project count:', error)
      }
    }

    fetchProjectCount()
  }, [user])

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Author Profile */}
        <AuthorSidebar
          author={{
            name: user?.name || "Salih Ben Otman",
            avatar: user?.avatar || "/placeholder-user.jpg",
            role: user?.role === 'developer' ? "Full Stack Developer" : "Portfolio Owner",
            bio: "Building innovative solutions with AI and modern web technologies. Passionate about creating exceptional user experiences.",
            location: "Remote",
            joinedDate: user?.createdAt || new Date(2023, 0, 1),
            stats: {
              projects: projectCount,
              followers: 245,
              contributions: 1240
            },
            links: {
              website: "https://salihbenotman.com",
              github: "https://github.com/salihbenotman",
              linkedin: "https://linkedin.com/in/salihbenotman",
              twitter: "https://twitter.com/salihbenotman",
              email: "contact@salihbenotman.com"
            }
          }}
        />

        {/* Advertisement 1 - Premium */}
        <AdvertisementCard
          variant="premium"
          title="Hire Me for Your Next Project"
          description="Looking for a skilled developer? Let's build something amazing together."
          link="/contact"
          buttonText="Get in Touch"
        />

        {/* Advertisement 2 - Standard */}
        <AdvertisementCard
          variant="standard"
          title="Free Resources"
          description="Download my curated collection of development resources and templates."
          link="/resources"
          buttonText="Download Free"
        />

        {/* Advertisement 3 - Minimal */}
        <AdvertisementCard
          variant="minimal"
          title="Sponsored Content"
          image="/ads/sample-ad.jpg"
          link="#"
        />
      </div>
    </div>
  )
}

export default ProjectsSidebar


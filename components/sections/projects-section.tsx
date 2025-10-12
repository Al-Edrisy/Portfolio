"use client"

import { motion } from "motion/react"
import { useState, useEffect } from "react"
import SplitText from "@/components/ui/split-text"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Plus, Edit } from "lucide-react"
import Link from "next/link"
import { ModernProjectsList } from "@/components/projects/modern-projects-list"

export default function ProjectsSection() {
  const { user } = useAuth()
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatch by only showing auth-dependent content after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check if user can manage projects
  const canManageProjects = isClient && (user?.role === 'developer' || user?.role === 'admin')
  const isAdmin = isClient && user?.role === 'admin'

  return (
    <section id="projects" className="py-8 bg-muted/30 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <SplitText
            text="Featured Projects"
            className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance"
            delay={60}
            duration={0.6}
            splitType="words"
            fadeOnScroll={true}
          />

          {/* Developer/Admin Actions */}
          {canManageProjects && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            >
              <Link href="/projects/create">
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Project
                </Button>
              </Link>
              
              {isAdmin && (
                <Link href="/admin/projects">
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Manage Projects
                  </Button>
                </Link>
              )}
            </motion.div>
          )}
        </motion.div>


        {/* Projects List */}
        <div className="max-w-4xl mx-auto">
          <ModernProjectsList />
        </div>
      </div>
    </section>
  )
}

"use client"

import { motion } from "motion/react"
import SplitText from "@/components/ui/split-text"
import StarBorder from "@/components/ui/star-border"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Plus, Edit } from "lucide-react"
import Link from "next/link"
import { ModernProjectsList } from "@/components/projects/modern-projects-list"

export default function ProjectsSection() {
  const { user } = useAuth()

  // Check if user can manage projects
  const canManageProjects = user?.role === 'developer' || user?.role === 'admin'
  const isAdmin = user?.role === 'admin'

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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-card-foreground mb-4">Interested in Working Together?</h3>
            <p className="text-muted-foreground mb-6 text-pretty">
              I'm always excited to take on new challenges and create innovative solutions. Let's discuss how we can
              bring your ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <StarBorder
                as="button"
                color="rgb(16, 185, 129)"
                speed="4s"
                className="px-6 py-3"
                onClick={() => {
                  const element = document.getElementById("contact")
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" })
                  }
                }}
              >
                Start a Project
              </StarBorder>
              <motion.a
                href="/projects"
                className="text-primary hover:text-primary/80 transition-colors duration-200 font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All Projects →
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

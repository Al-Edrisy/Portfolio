"use client"

import { useProjects } from "@/hooks/projects"
import { motion, AnimatePresence } from "motion/react"
import { LinkedInStyleProjectCardGSAP } from "../projects/cards/project-card-gsap"
import { Button } from "../ui/button"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { ProjectCardSkeleton } from "../ui/loading-skeleton"

export default function HomeFeaturedProjects() {
    const { projects, loading } = useProjects()

    // Only show the top 3 published projects
    const featuredProjects = projects
        ?.filter(p => p.published)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3) || []

    // If not loading and no projects at all, hide the section
    if (!loading && featuredProjects.length === 0) return null

    return (
        <section className="py-24 bg-muted/30 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] -z-10" />

            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Selected Work</span>
                        </motion.div>

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-bold"
                        >
                            Featured <span className="text-primary">Projects</span>
                        </motion.h2>
                    </div>

                    {!loading && featuredProjects.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <Link href="/projects">
                                <Button variant="ghost" className="group text-lg hover:text-primary transition-colors">
                                    View All Projects
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </motion.div>
                    )}
                </div>

                <div className="grid gap-8 grid-cols-1 max-w-4xl mx-auto">
                    {loading ? (
                        <>
                            <ProjectCardSkeleton />
                            <ProjectCardSkeleton />
                        </>
                    ) : (
                        <AnimatePresence>
                            {featuredProjects.map((project, index) => (
                                <LinkedInStyleProjectCardGSAP
                                    key={project.id}
                                    project={project}
                                    index={index}
                                />
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </section>
    )
}

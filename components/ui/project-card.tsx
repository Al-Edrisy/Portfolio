"use client"

import { motion } from "motion/react"
import TiltedCard from "@/components/ui/tilted-card"

interface ProjectCardProps {
  title: string
  description: string
  image: string
  tech: string[]
  category: string
  link: string
  github: string
  index: number
}

export default function ProjectCard({
  title,
  description,
  image,
  tech,
  category,
  link,
  github,
  index,
}: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group h-full"
    >
      <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        {/* Project Image with Enhanced Hover Effects */}
        <div className="relative h-48 overflow-hidden">
          <TiltedCard
            imageSrc={image}
            altText={title}
            captionText={title}
            containerHeight="100%"
            containerWidth="100%"
            imageHeight="100%"
            imageWidth="100%"
            scaleOnHover={1.08}
            rotateAmplitude={12}
            showMobileWarning={false}
            showTooltip={false}
            displayOverlayContent={true}
            overlayContent={
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                <motion.span
                  className="text-white text-sm font-medium bg-primary/90 px-3 py-1 rounded-full backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {category}
                </motion.span>
              </div>
            }
          />

          {/* Hover overlay with links */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
            <motion.a
              href={link}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              View Live
            </motion.a>
            <motion.a
              href={github}
              className="bg-card text-card-foreground px-4 py-2 rounded-lg font-medium border border-border"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              GitHub
            </motion.a>
          </div>
        </div>

        {/* Project Content */}
        <div className="p-6 flex-1 flex flex-col">
          <motion.h3
            className="text-xl font-semibold text-card-foreground mb-3 group-hover:text-primary transition-colors duration-200"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {title}
          </motion.h3>

          <p className="text-muted-foreground text-sm mb-4 leading-relaxed flex-1">{description}</p>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-2 mb-4">
            {tech.map((techItem, techIndex) => (
              <motion.span
                key={techItem}
                className="text-xs px-3 py-1 bg-muted text-muted-foreground rounded-full hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: techIndex * 0.05 }}
              >
                {techItem}
              </motion.span>
            ))}
          </div>

          {/* Project Links */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <motion.a
              href={link}
              className="text-primary hover:text-primary/80 transition-colors duration-200 text-sm font-medium flex items-center space-x-1"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <span>View Project</span>
              <span>→</span>
            </motion.a>
            <motion.a
              href={github}
              className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm flex items-center space-x-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>GitHub</span>
              <span>↗</span>
            </motion.a>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

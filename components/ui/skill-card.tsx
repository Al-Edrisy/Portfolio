"use client"

import { motion } from "motion/react"
import { useState } from "react"
import SvgIcon from "@/components/ui/svg-icon"

interface SkillCardProps {
  name: string
  level: number
  description: string
  icon: string
  index: number
}

export default function SkillCard({ name, level, description, icon, index }: SkillCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        whileHover={{ y: -12, scale: 1.03 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative h-full"
      >
        {/* Card container */}
        <div className="relative bg-card/70 backdrop-blur-md border border-border/60 rounded-3xl p-8 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 transition-all duration-500 h-full overflow-hidden">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 group-hover:animate-[shine_1.5s_ease-in-out]"></div>
          </div>
          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            {/* Header with icon and name */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: isHovered ? 360 : 0 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                      <SvgIcon
                        src={icon}
                        alt={name}
                        size="lg"
                        animated={true}
                        hoverEffect={true}
                      />
                    </div>
                  </motion.div>
        </div>

                <div className="text-right">
                  <div className="flex items-baseline gap-1">
                    <motion.span
                      initial={{ scale: 1 }}
                      animate={{ scale: isHovered ? 1.1 : 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                    >
                      {level}
                    </motion.span>
                    <span className="text-lg font-bold text-muted-foreground">%</span>
                  </div>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">Proficiency</span>
                </div>
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors duration-300 mb-2">
                {name}
              </h3>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="w-full bg-muted/20 rounded-full h-2.5 overflow-hidden border border-border/30 group-hover:border-primary/30 transition-colors duration-300">
          <motion.div
                  className="h-2.5 rounded-full relative bg-gradient-to-r from-primary via-primary/90 to-secondary shadow-lg shadow-primary/30"
            initial={{ width: 0 }}
            whileInView={{ width: `${level}%` }}
                  transition={{ duration: 2, delay: index * 0.1 + 0.6, ease: [0.4, 0, 0.2, 1] }}
            viewport={{ once: true }}
          >
                  {/* Shimmer effect */}
            <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear", repeatDelay: 1 }}
            />
          </motion.div>
              </div>
        </div>

            {/* Description */}
        <motion.p
              className="text-sm md:text-base text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300 flex-grow"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: isHovered ? 1 : 0.7 }}
              transition={{ duration: 0.3 }}
        >
          {description}
        </motion.p>
          </div>
      </div>
      </motion.div>
    </motion.div>
  )
}

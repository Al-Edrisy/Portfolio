"use client"

import { skillCategories } from "@/constants/skills-data"
import { motion } from "motion/react"

export default function SkillsTicker() {
    // Extract all skills and flat them
    const allSkills = skillCategories.flatMap(cat => cat.skills)

    // Repeat skills to create seamless loop
    const duplicatedSkills = [...allSkills, ...allSkills, ...allSkills, ...allSkills]

    return (
        <div className="py-12 bg-muted/20 border-y border-border/40 relative overflow-hidden select-none">
            {/* Masking Edges for smooth fade */}
            <div className="absolute inset-y-0 left-0 w-24 sm:w-36 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 sm:w-36 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="relative flex overflow-hidden">
                <motion.div
                    animate={{
                        x: ["0%", "-50%"],
                    }}
                    transition={{
                        x: {
                            duration: 90,
                            repeat: Infinity,
                            ease: "linear",
                        },
                    }}
                    className="flex whitespace-nowrap gap-4 sm:gap-6 items-center"
                >
                    {duplicatedSkills.map((skill, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card/70 border border-border/60 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-default backdrop-blur-sm"
                        >
                            <div className="w-5 h-5 flex items-center justify-center opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                                <img
                                    src={skill.icon}
                                    alt={skill.name}
                                    className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                                    loading="lazy"
                                />
                            </div>
                            <span className="text-xs sm:text-sm font-semibold tracking-tight text-foreground/90 group-hover:text-primary transition-colors duration-300">
                                {skill.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground group-hover:text-foreground font-mono transition-colors">
                                {skill.category}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}

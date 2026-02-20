"use client"

import { skillCategories } from "@/constants/skills-data"
import { motion } from "motion/react"

export default function SkillsTicker() {
    // Extract all skills and flat them
    const allSkills = skillCategories.flatMap(cat => cat.skills)

    // Repeat skills to create seamless loop
    const duplicatedSkills = [...allSkills, ...allSkills, ...allSkills, ...allSkills]

    return (
        <div className="py-16 bg-muted/30 border-y border-border/50 relative overflow-hidden select-none">
            {/* Masking Edges for smooth fade */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            <div className="relative flex overflow-hidden">
                <motion.div
                    animate={{
                        x: ["0%", "-50%"],
                    }}
                    transition={{
                        x: {
                            duration: 120, // Faster than before but still relaxing
                            repeat: Infinity,
                            ease: "linear",
                        },
                    }}
                    className="flex whitespace-nowrap gap-8 items-center"
                >
                    {duplicatedSkills.map((skill, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group cursor-default"
                        >
                            <div className="w-6 h-6 flex items-center justify-center opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                                <img
                                    src={skill.icon}
                                    alt={skill.name}
                                    className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-500"
                                    loading="lazy"
                                />
                            </div>
                            <span className="text-sm font-bold tracking-tight text-muted-foreground group-hover:text-foreground transition-all duration-300">
                                {skill.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}

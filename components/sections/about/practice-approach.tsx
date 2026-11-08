"use client"

import { motion } from "motion/react"
import { Zap, Boxes, Gauge, CheckCircle2 } from "lucide-react"

const approachPillars = [
  {
    icon: Zap,
    title: "Speed to Working Software",
    description:
      "Projects transition rapidly from initial architecture discussions into working prototypes and interactive sandboxes. Everyone gets something tangible to evaluate immediately, shortening feedback loops and cutting wasted cycles.",
    badge: "Velocity",
  },
  {
    icon: Boxes,
    title: "Clean Architecture & Determinism",
    description:
      "Every system is designed with strict separation of concerns—Domain, Application, Infrastructure, and UI layers. Type-safety from database to client ensures that applications scale gracefully without accumulating technical debt.",
    badge: "Architecture",
  },
  {
    icon: Gauge,
    title: "Meaningful Milestones",
    description:
      "Progress is measured by working software, sub-second latency, and verified resilience rather than speculative slide decks. A practical, high-agency way of working with less time spent on process and more time spent engineering.",
    badge: "Accountability",
  },
]

export default function PracticeApproach() {
  return (
    <section className="py-16 md:py-24 border-b border-border/40 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Section Left Headline */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-28">
            <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Methodology & Cadence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-foreground leading-tight">
              An organic, high-velocity approach centered on tangible code.
            </h2>
            <p className="text-sm md:text-base text-muted-foreground font-normal leading-relaxed">
              Software shouldn't be trapped in speculative design files. From the very first sprint, 
              work is developed and refined directly in context, guided by live user feedback and 
              verifiable system benchmarks.
            </p>
          </div>

          {/* Pillars Column */}
          <div className="lg:col-span-7 space-y-6">
            {approachPillars.map((pillar, idx) => {
              const Icon = pillar.icon
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
                  className="p-6 sm:p-8 rounded-2xl border border-border/60 bg-card/40 hover:bg-card/70 transition-colors duration-300 relative group"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-mono text-sm border border-primary/20">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground px-2.5 py-1 rounded-full bg-muted/50 border border-border/40">
                      {pillar.badge}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-medium text-foreground mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

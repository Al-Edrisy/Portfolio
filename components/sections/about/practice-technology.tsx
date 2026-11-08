"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { Cpu, Brain, ArrowUpRight, ShieldCheck, Binary, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const techCategories = [
  {
    category: "AI & Agentic Orchestration",
    description: "Multi-model reasoning, autonomous tool execution, and contextual RAG architectures.",
    tools: ["LangChain", "Langflow", "Claude 3.5 Sonnet", "GPT-4o", "Gemini 2.0 Pro", "OpenRouter Multi-Routing"],
  },
  {
    category: "Frontend Craft & Ergonomics",
    description: "Zero-slop design tokens, tactile micro-physics, sub-second hydration, and accessibility.",
    tools: ["React 19", "Next.js 15", "TypeScript Strict", "Tailwind CSS", "Motion / GSAP", "Radix UI Primitives"],
  },
  {
    category: "Backend, Edge & Data Resilience",
    description: "High-throughput APIs, domain-driven persistence layers, and edge media delivery.",
    tools: ["Node.js", "Cloud Firestore", "PostgreSQL", "Prisma ORM", "Cloudflare R2", "Server Actions"],
  },
]

export default function PracticeTechnology() {
  return (
    <section className="py-16 md:py-24 border-b border-border/40 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-primary mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Technology & Philosophy</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-foreground mb-6 leading-tight">
            Original engineering judgment amplified by modern AI systems.
          </h2>
          <div className="space-y-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            <p>
              The practice builds custom developer tooling and harnesses autonomous AI agents to accelerate research, 
              exploration, and production. The aim is to eliminate boilerplate and friction, creating expansive 
              headroom for deeper architectural craft and core system design.
            </p>
            <p>
              System architecture, algorithmic rigor, and security boundaries remain decisively human. 
              The methodology unites the discipline of a classical software engineer with the unprecedented 
              velocity and exploratory leverage of new technology.
            </p>
          </div>
        </div>

        {/* Stack Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {techCategories.map((item, idx) => (
            <motion.div
              key={item.category}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
              className="p-6 rounded-2xl border border-border/60 bg-card/40 flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold block mb-2">
                  0{idx + 1} // DOMAIN
                </span>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {item.category}
                </h3>
                <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border/40">
                {item.tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-2.5 py-1 rounded-md bg-muted/60 border border-border/50 text-[11px] font-mono text-foreground/80"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Link to Dedicated Skills Explorer */}
        <div className="flex items-center justify-between p-4 sm:p-6 rounded-2xl border border-border/60 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-mono text-xs">
              <Binary className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-medium text-foreground">
                Looking for the complete technical inventory?
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                Explore 26+ verified languages, frameworks, cloud databases, and AI models.
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" asChild className="rounded-xl border-border/60 gap-1.5 font-mono text-xs">
            <Link href="/skills">
              <span>View Skills Matrix</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

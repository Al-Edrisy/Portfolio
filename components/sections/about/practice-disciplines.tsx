"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { Globe, Bot, Palette, ArrowRight, ShieldCheck, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const disciplines = [
  {
    discipline: "Full-Stack Web",
    tagline: "High-speed Next.js platforms, type-safe APIs, and resilient data architectures.",
    investment: "From $3,500",
    features: [
      "Next.js 15 App Router & Server Components",
      "Full TypeScript strict contracts & Zod validation",
      "Cloud database modeling (Firestore, PostgreSQL, Prisma)",
      "Edge caching, CDN routing & sub-second load times",
    ],
  },
  {
    discipline: "AI & Agent Systems",
    tagline: "Autonomous multi-agent pipelines, RAG systems, and frontier LLM orchestration.",
    investment: "From $4,000",
    features: [
      "Multi-model routing (Claude 3.5, GPT-4o, Gemini 2.0)",
      "LangChain & Langflow autonomous tool-calling agents",
      "Vector search & domain-specific RAG knowledge stores",
      "Streaming responses with SSE & structured JSON output",
    ],
  },
  {
    discipline: "UI/UX & Design Systems",
    tagline: "Tactile digital experiences, zero-slop design tokens, and fluid micro-physics.",
    investment: "From $2,500",
    features: [
      "Handcrafted design tokens & mathematical border radii",
      "Motion & physics transitions via Framer Motion & GSAP",
      "Accessible Radix UI & shadcn component primitives",
      "Responsive ergonomics engineered for Phone, iPad, and PC",
    ],
  },
]

export default function PracticeDisciplines() {
  return (
    <section className="py-16 md:py-24 border-b border-border/40 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-primary mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Engagements & Capabilities</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-foreground mb-6 leading-tight">
            Working Together
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            The practice works across full-stack engineering, AI systems, and interaction design, 
            with each engagement shaped around what needs to be built. Projects can focus on a single 
            discipline or unite all three to take an ambitious venture from zero to production.
          </p>
        </div>

        {/* Disciplines Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {disciplines.map((item, idx) => (
            <motion.div
              key={item.discipline}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1, ease: "easeOut" }}
              className="p-6 sm:p-8 rounded-2xl border border-border/60 bg-card/40 flex flex-col justify-between hover:border-border transition-colors duration-300 relative group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    DISCIPLINE 0{idx + 1}
                  </span>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 font-medium">
                    {item.investment}
                  </span>
                </div>

                <h3 className="text-xl font-medium text-foreground mb-2">
                  {item.discipline}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-6 leading-relaxed">
                  {item.tagline}
                </p>

                <ul className="space-y-2.5 mb-8">
                  {item.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs text-foreground/80">
                      <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                variant="outline"
                size="sm"
                asChild
                className="w-full rounded-xl border-border/60 group-hover:border-primary/40 font-mono text-xs gap-2"
              >
                <Link href="/contact">
                  <span>Inquire For {item.discipline}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Flat Fee Upfront Philosophy */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-6 sm:p-8 rounded-2xl border border-border/60 bg-muted/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-primary uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Transparent Pricing & Predictability</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every project is unique, so pricing is tailored to scope, architecture complexity, and 
              delivery timelines. Projects are charged at a flat fee with clear deliverables and an 
              accurate schedule established upfront—so you know what you are receiving, when it ships, 
              and the exact investment before anyone moves a pixel or writes a line of code.
            </p>
          </div>

          <Button asChild size="lg" className="rounded-xl font-mono text-xs gap-2 flex-shrink-0">
            <Link href="/contact">
              <span>Start an Engagement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

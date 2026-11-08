"use client"

import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, GraduationCap, Award, Compass, Heart, Github, Linkedin, Code2 } from "lucide-react"

interface PersonalNarrativeProps {
  yearsOfExperience: number
}

export default function PersonalNarrative({ yearsOfExperience }: PersonalNarrativeProps) {
  return (
    <section className="py-16 md:py-24 border-b border-border/40 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Photo & Identity Column (Editorial Presentation) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="relative aspect-[4/5] w-full rounded-2xl md:rounded-3xl overflow-hidden border border-border/60 bg-muted shadow-lg">
              <Image
                src="/me.jpg"
                alt="Salih Ben Otman (Al-Edrisy)"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 40vw, 450px"
                className="object-cover object-top hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white font-mono text-xs z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>SALIH BEN OTMAN</span>
                </div>
                <span className="text-white/70">AL-EDRISY</span>
              </div>
            </div>

            {/* Quick Metadata Card */}
            <div className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-3 font-mono text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span>Base Location</span>
                </span>
                <span className="text-foreground">North Cyprus / International</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-primary" />
                  <span>Education</span>
                </span>
                <span className="text-foreground">FIU (B.Sc. Software Eng.)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-primary" />
                  <span>Track Record</span>
                </span>
                <span className="text-foreground">50+ Shipped Applications</span>
              </div>
            </div>
          </motion.div>

          {/* Narrative Storytelling Column */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-primary mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>Biography & Background</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-foreground mb-6 leading-tight">
                About Salih Ben Otman
              </h2>
            </div>

            <div className="space-y-5 text-base sm:text-lg text-muted-foreground font-normal leading-relaxed">
              <p>
                Salih Ben Otman (widely known in developer and open-source communities as <strong className="text-foreground font-medium">Al-Edrisy</strong>) 
                is a Full Stack Software Developer, UI/UX Engineer, and AI Systems Builder based in North Cyprus.
              </p>

              <p>
                His journey in software engineering began in 2020, sparked by an enduring fascination with 
                how distributed computing, interactive user interfaces, and algorithmic data structures could shape real-world human behavior. 
                In 2021, he joined the Department of Software Engineering at <strong className="text-foreground font-medium">Final International University (FIU)</strong>, 
                where he grounded his practical experience in formal computer science fundamentals—from distributed architecture 
                and database normalization to human-computer interaction (HCI).
              </p>

              <p>
                Over the past {yearsOfExperience} years, Salih has architected and delivered more than 50 production systems 
                ranging from AI-driven e-commerce engines and real-time collaboration platforms to complex analytics dashboards. 
                His work is distinguished by an insistence on <strong className="text-foreground font-medium">Clean Architecture</strong>, 
                type safety, and obsessive attention to UI polish—ensuring that every system is as enjoyable to interact with 
                as it is robust under load.
              </p>

              <p>
                With the emergence of agentic AI, his work has expanded into autonomous LLM orchestration, 
                multi-agent tool calling, and generative developer tooling. He combines classical algorithmic problem-solving 
                (sharpened daily on LeetCode) with modern generative capabilities to build software that moves businesses forward.
              </p>
            </div>

            {/* Life & Outside the Terminal */}
            <div className="pt-6 border-t border-border/40 space-y-3">
              <h3 className="text-sm font-mono uppercase tracking-wider text-foreground font-medium">
                Outside the Terminal
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When not designing systems or writing TypeScript, Salih is an active sports enthusiast and endurance swimmer, 
                an avid listener of deep-dive engineering and business podcasts, and dedicated to continuous personal discipline and prayer.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

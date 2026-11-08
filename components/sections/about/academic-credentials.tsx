"use client"

import { motion } from "motion/react"
import Image from "next/image"
import Link from "next/link"
import { GraduationCap, Award, Download, ExternalLink, Github, Linkedin, Code2, Mail, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AcademicCredentials() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-primary mb-3">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Credentials & Verification</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-foreground mb-4 leading-tight">
            Academic Pedigree & Professional Proof
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Verified institutional affiliations, academic documentation, and official developer profiles.
          </p>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
          {/* FIU Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="p-6 sm:p-8 rounded-2xl border border-border/60 bg-card/40 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-white p-2 border border-border/60 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Image
                    src="/university-logo.png"
                    alt="Final International University Logo"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
                    ACADEMIC INSTITUTION
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium text-foreground">
                    Final International University
                  </h3>
                  <div className="text-xs text-muted-foreground">Kyrenia, North Cyprus</div>
                </div>
              </div>

              <div className="space-y-3 mb-6 text-xs sm:text-sm text-foreground/80 font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-muted-foreground">Degree</span>
                  <span className="font-medium text-foreground">B.Sc. in Software Engineering</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-muted-foreground">Period</span>
                  <span>Fall 2021 — Present</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-muted-foreground">Institutional Email</span>
                  <span className="text-primary select-all">salih.otman@final.edu.tr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Core Focus</span>
                  <span>Distributed Systems, HCI, Databases</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full rounded-xl border-border/60 font-mono text-xs gap-2"
            >
              <a
                href="/cv/salih.otman@final.edu.tr.pdf"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Official Academic CV (PDF)</span>
              </a>
            </Button>
          </motion.div>

          {/* Database Mastery & Industry Certs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="p-6 sm:p-8 rounded-2xl border border-border/60 bg-card/40 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                  <Award className="w-7 h-7" />
                </div>

                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-primary font-semibold">
                    VERIFIED CERTIFICATION
                  </div>
                  <h3 className="text-lg sm:text-xl font-medium text-foreground">
                    Complete Database Mastery
                  </h3>
                  <div className="text-xs text-muted-foreground">Zero to Mastery Academy</div>
                </div>
              </div>

              <div className="space-y-3 mb-6 text-xs sm:text-sm text-foreground/80 font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-muted-foreground">Instructors</span>
                  <span>Andrei Neagoie, Mo Binni</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-muted-foreground">Duration</span>
                  <span>24.05 Hours Intensive Training</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <span className="text-muted-foreground">Completion</span>
                  <span>February 8, 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Curriculum</span>
                  <span>PostgreSQL, Redis, Normalization, Query Tuning</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="w-full rounded-xl border-border/60 font-mono text-xs gap-2"
            >
              <a
                href="https://udemy-certificate.s3.amazonaws.com/image/UC-5755ae07-3463-4a72-9460-78bbd2963eb3.jpg?v=1707389293000"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Verify Credential on AWS S3</span>
              </a>
            </Button>
          </motion.div>
        </div>

        {/* Verified Developer Footprint */}
        <div className="p-6 sm:p-8 rounded-2xl border border-border/60 bg-muted/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="text-sm font-mono uppercase tracking-wider text-foreground font-semibold">
                Verified Footprint & Public Repositories
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Explore open-source architectures, algorithmic solutions, and live contributions.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-mono">
              All Channels Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <a
              href="https://github.com/Al-Edrisy"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 sm:p-4 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-border transition-colors flex items-center gap-3 font-mono text-xs"
            >
              <Github className="w-4 h-4 text-foreground" />
              <div>
                <div className="font-medium text-foreground">GitHub</div>
                <div className="text-[11px] text-muted-foreground">@Al-Edrisy</div>
              </div>
            </a>

            <a
              href="https://www.linkedin.com/in/صالح-بن-عثمان-a565a2242"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 sm:p-4 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-border transition-colors flex items-center gap-3 font-mono text-xs"
            >
              <Linkedin className="w-4 h-4 text-blue-500" />
              <div>
                <div className="font-medium text-foreground">LinkedIn</div>
                <div className="text-[11px] text-muted-foreground">Salih Ben Otman</div>
              </div>
            </a>

            <a
              href="https://leetcode.com/u/salehfree33"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 sm:p-4 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-border transition-colors flex items-center gap-3 font-mono text-xs"
            >
              <Code2 className="w-4 h-4 text-amber-500" />
              <div>
                <div className="font-medium text-foreground">LeetCode</div>
                <div className="text-[11px] text-muted-foreground">@salehfree33</div>
              </div>
            </a>

            <a
              href="mailto:salehfree33@gmail.com"
              className="p-3 sm:p-4 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-border transition-colors flex items-center gap-3 font-mono text-xs"
            >
              <Mail className="w-4 h-4 text-primary" />
              <div>
                <div className="font-medium text-foreground">Direct Mail</div>
                <div className="text-[11px] text-muted-foreground">salehfree33@...</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

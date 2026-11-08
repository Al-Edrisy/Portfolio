"use client"

import PracticeHero from "./about/practice-hero"
import VideoShowcase from "./about/video-showcase"
import PracticeApproach from "./about/practice-approach"
import PracticeTechnology from "./about/practice-technology"
import PracticeDisciplines from "./about/practice-disciplines"
import PersonalNarrative from "./about/personal-narrative"
import AcademicCredentials from "./about/academic-credentials"

// Calculate years of experience dynamically from 2020
const calculateYearsOfExperience = (): number => {
  const startYear = 2020
  const currentYear = new Date().getFullYear()
  return currentYear - startYear
}

const yearsOfExperience = calculateYearsOfExperience()

export default function AboutSection() {
  return (
    <article className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* 01: Practice Hero & Vision Statement */}
      <PracticeHero yearsOfExperience={yearsOfExperience} />

      {/* 02: Featured Video Showcase (Cloudflare R2 + Apple-grade controls) */}
      <VideoShowcase />

      {/* 03: Approach & Methodology */}
      <PracticeApproach />

      {/* 04: Technology & AI Engineering Philosophy */}
      <PracticeTechnology />

      {/* 05: Working Together / Disciplines & Engagements */}
      <PracticeDisciplines />

      {/* 06: Personal Narrative & Journey */}
      <PersonalNarrative yearsOfExperience={yearsOfExperience} />

      {/* 07: Academic Pedigree & Verification Credentials */}
      <AcademicCredentials />
    </article>
  )
}

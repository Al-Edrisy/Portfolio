import { skillCategories } from "@/constants/skills-data"

/**
 * Single source of truth for every fact shown on the About page.
 * Change a number here and the hero, narrative, JSON-LD and metadata all agree.
 */

export const CAREER_START_YEAR = 2020

export const yearsOfExperience = () => new Date().getFullYear() - CAREER_START_YEAR

/**
 * Verified public GitHub repositories count queried from https://api.github.com/users/Al-Edrisy.
 * Used in place of an estimated project count for absolute transparency and auditability.
 */
export const GITHUB_REPOS_COUNT = 39

export const technologyCount = new Set(
  skillCategories.flatMap((category) => category.skills.map((skill) => skill.name))
).size

export const SITE_URL = "https://salihbenotman.dev"

export const profile = {
  name: "Salih Ben Otman",
  alias: "Al-Edrisy",
  location: "North Cyprus",
  role: "Full Stack Software Developer, UI/UX Engineer & AI Systems Builder",
  email: "salehfree33@gmail.com",
  cvHref: "/cv/salih.otman@final.edu.tr.pdf",
  university: {
    name: "Final International University",
    short: "FIU",
    city: "Kyrenia, North Cyprus",
    degree: "B.Sc. in Software Engineering",
    period: "Fall 2021 – Present",
    email: "salih.otman@final.edu.tr",
    focus: "Distributed Systems, HCI, Databases, Machine Learning",
  },
  social: {
    github: "https://github.com/Al-Edrisy",
    // Percent-encoded so it is a valid URL in JSON-LD `sameAs` and crawlers.
    linkedin:
      "https://www.linkedin.com/in/%D8%B5%D8%A7%D9%84%D8%AD-%D8%A8%D9%86-%D8%B9%D8%AB%D9%85%D8%A7%D9%86-a565a2242",
    leetcode: "https://leetcode.com/u/salehfree33",
  },
} as const

export const certifications = [
  {
    emoji: "🗄️",
    title: "Database Mastery Course",
    instructor: "Andrei Neagoie, Mo Binni",
    detail: "From Zero to Master – online course",
    completed: "Completed February 8, 2024 · 24.05 hours",
    href: "https://udemy-certificate.s3.amazonaws.com/image/UC-5755ae07-3463-4a72-9460-78bbd2963eb3.jpg?v=1707389293000",
  },
  {
    emoji: "💻",
    title: "Complete Full-Stack Web Development Bootcamp",
    instructor: "Dr. Angela Yu",
    detail: "Developer and Lead Instructor at App Brewery",
  },
  {
    emoji: "⚡",
    title: "Master the Coding Interview: Data Structures + Algorithms",
    instructor: "Andrei Neagoie",
    detail: "Advanced problem-solving and algorithm design",
  },
] as const

export const passions = [
  { emoji: "⚽", label: "Sports" },
  { emoji: "🏊‍♂️", label: "Swimming" },
  { emoji: "💻", label: "Coding" },
  { emoji: "🤲", label: "Prayer" },
  { emoji: "💬", label: "Conversation" },
  { emoji: "🎧", label: "Podcasts" },
] as const

export const video = {
  src: "/api/media/videos/generative-lab-exploration-v2.mp4",
  fallbackSrc: "/videos/generative-lab-exploration-v2.mp4",
  poster: "/videos/generative-lab-poster-v2.jpg",
  title: "Parametric grid and generative scene explorer",
  description:
    "Screen recording of a design tool for exploring 3D wireframe surface distortions and generating blurred landscape scene families.",
  durationSeconds: 24,
  uploadDate: "2026-11-08",
} as const

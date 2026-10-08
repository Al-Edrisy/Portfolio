"use client"

import { useRef, useState, useEffect, Suspense } from "react"
import { motion } from "motion/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Prism from "@/components/ui/prism"
import { AppleHelloEnglishEffect } from "@/components/ui/shadcn-io/apple-hello-effect"
import TextType from "@/components/ui/text-type"
import StarBorder from "@/components/ui/star-border"
import CircularText from "@/components/ui/circular-text"
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"
import { Github, Linkedin, Code, ExternalLink } from "lucide-react"

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true)

  // Calculate years of experience dynamically from 2020
  const calculateYearsOfExperience = (): number => {
    const startYear = 2020
    const currentYear = new Date().getFullYear()
    return currentYear - startYear
  }

  const yearsOfExperience = calculateYearsOfExperience()

  // Pause Prism animation when scrolled away for better performance
  const router = useRouter() // Import from 'next/navigation' (needs to be added to imports at top)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
        })
      },
      { threshold: 0.1 }
    )

    if (heroRef.current) {
      observer.observe(heroRef.current)
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current)
      }
    }
  }, [])

  const navigateToProjects = () => {
    router.push('/projects')
  }

  const navigateToContact = () => {
    router.push('/contact')
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden will-change-transform" ref={heroRef}>
      {/* Lazy load Prism background for better performance */}
      {isVisible ? (
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="absolute inset-0 bg-gradient-to-br from-background via-muted/10 to-background" />}>
            <Prism
              animationType="rotate"
              timeScale={0.3}
              height={3}
              baseWidth={5}
              scale={3}
              hueShift={0}
              colorFrequency={0.8}
              noise={0.2}
              glow={0.6}
              bloom={0.8}
            />
          </Suspense>
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-muted/10 to-background" />
      )}

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background/70 z-10" />

      {/* Hero Content */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6">
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 min-h-screen">
          {/* Left Side - Profile Image with 3D Effect */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="absolute top-24 sm:top-30 left-4 sm:left-8 lg:left-12 order-1 lg:order-1"
          >
            <CardContainer className="inter-var" containerClassName="py-0">
              <CardBody className="w-auto h-auto">
                <CardItem translateZ="100" className="w-full">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-primary/5">
                    <Image
                      src="/me.jpg"
                      alt="Salih Ben Otman"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>
          </motion.div>

          {/* Center-Right - Text Content */}
          <div className="text-center order-2 lg:order-2 flex flex-col justify-center items-center flex-1 max-w-2xl lg:ml-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-4 sm:mb-6 flex justify-center"
            >
              <AppleHelloEnglishEffect
                speed={1.1}
                className="h-16 sm:h-20 md:h-24 lg:h-28 text-foreground"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="mb-6 sm:mb-8 will-change-transform"
            >
              <div className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-4">
                <TextType
                  text={[
                    "Software & AI Systems Engineer",
                    "Full-Stack Developer (Next.js 15 • TypeScript • Python)",
                    "AI Agent & LLM Systems Builder (LangChain • Langflow)",
                    `Production Systems Architect with ${yearsOfExperience}+ Years Experience`,
                  ]}
                  typingSpeed={65}
                  pauseDuration={1800}
                  showCursor={true}
                  cursorCharacter="|"
                  className="font-medium"
                />
              </div>
            </motion.div>

            {/* Interactive Tech & Identity Badges (inspired by best-in-class developer profiles) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
              className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-xl"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-sm backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                Final International Univ. (Cyprus)
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm backdrop-blur-sm">
                Clean Architecture
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm backdrop-blur-sm">
                AI Agents & LLMs
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm backdrop-blur-sm">
                Next.js 15 & TS
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl lg:max-w-none mb-8 sm:mb-10 text-pretty leading-relaxed will-change-transform"
            >
              Every project starts with a question: what if technology could think smarter?
              I design and engineer products that make intelligence feel effortless and intuitive.
            </motion.p>

            {/* Social & Profile Action Badges */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: "easeOut" }}
              className="flex items-center justify-center gap-3 mb-8"
            >
              <a
                href="https://github.com/Al-Edrisy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-card/80 hover:bg-card border border-border/80 hover:border-primary/50 text-foreground transition-all duration-200 hover:scale-105 shadow-sm"
              >
                <Github className="w-3.5 h-3.5 text-foreground" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/%D8%B5%D8%A7%D9%84%D8%AD-%D8%A8%D9%86-%D8%B9%D8%AB%D9%85%D8%A7%D9%86-a565a2242"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 border border-[#0A66C2]/30 text-[#0A66C2] dark:text-[#38BDF8] transition-all duration-200 hover:scale-105 shadow-sm"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
              <a
                href="https://leetcode.com/u/salehfree33"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#FFA116]/10 hover:bg-[#FFA116]/20 border border-[#FFA116]/30 text-[#FFA116] transition-all duration-200 hover:scale-105 shadow-sm"
              >
                <Code className="w-3.5 h-3.5" />
                <span>LeetCode</span>
              </a>
              <a
                href="https://al-edrisy.space"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary transition-all duration-200 hover:scale-105 shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>al-edrisy.space</span>
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 will-change-transform"
            >
              <StarBorder
                as="button"
                color="currentColor"
                speed="5s"
                className="text-sm sm:text-base lg:text-lg px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 w-full sm:w-auto text-primary"
                onClick={navigateToProjects}
              >
                View My Work
              </StarBorder>

              <motion.button
                className="text-sm sm:text-base lg:text-lg px-5 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4 border border-border rounded-[20px] text-foreground hover:bg-muted transition-colors duration-200 w-full sm:w-auto"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={navigateToContact}
              >
                Get In Touch
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Floating circular text - hidden on mobile and tablets for performance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1, ease: "easeOut" }}
          className="absolute bottom-20 right-4 sm:right-10 hidden xl:block"
        >
          <CircularText
            text="SCROLL*DOWN*FOR*MORE*"
            onHover="speedUp"
            spinDuration={15}
            className="text-muted-foreground opacity-60"
            radius={50}
            fontSize={10}
          />
        </motion.div>
      </div>
    </section>
  )
}

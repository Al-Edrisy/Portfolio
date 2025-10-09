"use client"

import { useRef } from "react"
import { motion } from "motion/react"
import Prism from "@/components/ui/prism"
import { AppleHelloEnglishEffect } from "@/components/ui/shadcn-io/apple-hello-effect"
import TextType from "@/components/ui/text-type"
import StarBorder from "@/components/ui/star-border"
import CircularText from "@/components/ui/circular-text"

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)

  const scrollToProjects = () => {
    const element = document.getElementById("projects")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const scrollToContact = () => {
    const element = document.getElementById("contact")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" ref={heroRef}>
      <div className="absolute inset-0 z-0">
        <Prism
          animationType="rotate"
          timeScale={0.2}
          height={3}
          baseWidth={5}
          scale={3}
          hueShift={0} // Neutral colors
          colorFrequency={0.8}
          noise={0.2}
          glow={0.8}
          bloom={1}
        />
      </div>

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background/70 z-10" />

      {/* Hero Content */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
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
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <div className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-4">
            <TextType
              text={[
                "UI/UX Engineer & AI Systems Builder",
                "Full-Stack Developer with 5+ Years Experience",
                "Specialist in OpenAI, Langflow & Modern Web Tech",
              ]}
              typingSpeed={60}
              pauseDuration={2000}
              className="font-medium"
            />
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-12 text-pretty leading-relaxed px-4"
        >
          I craft exceptional digital experiences through innovative design and cutting-edge AI integrations. From
          concept to deployment, I build scalable solutions that drive real business results.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-16 px-4"
        >
          <StarBorder
            as="button"
            color="currentColor"
            speed="5s"
            className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto text-primary"
            onClick={scrollToProjects}
          >
            View My Work
          </StarBorder>

          <motion.button
            className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border border-border rounded-[20px] text-foreground hover:bg-muted transition-colors duration-200 w-full sm:w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToContact}
          >
            Get In Touch
          </motion.button>
        </motion.div>

        {/* Floating circular text - hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-20 right-4 sm:right-10 hidden lg:block"
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

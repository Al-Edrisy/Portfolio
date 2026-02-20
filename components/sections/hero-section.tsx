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
                    "UI/UX Engineer & AI Systems Builder",
                    `Full-Stack Developer with ${yearsOfExperience}+ Years Experience`,
                    "Specialist in OpenAI, Langflow & Modern Web Tech",
                  ]}
                  typingSpeed={75}
                  pauseDuration={1500}
                  showCursor={true}
                  cursorCharacter="|"
                  className="font-medium"
                />
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
              className="text-base sm:text-lg text-muted-foreground max-w-2xl lg:max-w-none mb-8 sm:mb-12 text-pretty leading-relaxed will-change-transform"
            >
              Every project starts with a question: what if technology could think smarter?
              I design and engineer products that make intelligence feel effortless and intuitive.
            </motion.p>

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

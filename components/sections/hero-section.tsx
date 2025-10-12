"use client"

import { useRef } from "react"
import { motion } from "motion/react"
import Image from "next/image"
import Prism from "@/components/ui/prism"
import { AppleHelloEnglishEffect } from "@/components/ui/shadcn-io/apple-hello-effect"
import TextType from "@/components/ui/text-type"
import StarBorder from "@/components/ui/star-border"
import CircularText from "@/components/ui/circular-text"
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"

export default function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)

  // Calculate years of experience dynamically from 2020
  const calculateYearsOfExperience = (): number => {
    const startYear = 2020
    const currentYear = new Date().getFullYear()
    return currentYear - startYear
  }

  const yearsOfExperience = calculateYearsOfExperience()

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
      <div className="relative z-20 container mx-auto px-4 sm:px-6">
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 min-h-screen">
          {/* Left Side - Profile Image with 3D Effect */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute top-30 left-8 lg:left-12 order-1 lg:order-1"
          >
            <CardContainer className="inter-var" containerClassName="py-0">
              <CardBody className="w-auto h-auto">
                <CardItem translateZ="100" className="w-full">
                  <div className="relative w-48 h-48 rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                      src="https://media.licdn.com/dms/image/v2/D4E03AQFM9J33eiWAsQ/profile-displayphoto-shrink_800_800/B4EZhDaJ4wHgAc-/0/1753477588378?e=1762992000&v=beta&t=reJ_IQNrpYVuIrSNvDOpUPWRbMK-bx3F-1kSWSfrslk"
                      alt="Al-Edrisy (Salih Ben Otman) - Full Stack Software Developer"
                      fill
                      className="object-cover grayscale"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 30vw, 20vw"
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
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mb-6 sm:mb-8"
            >
              <div className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-4">
                <TextType
                  text={[
                    "UI/UX Engineer & AI Systems Builder",
                    `Full-Stack Developer with ${yearsOfExperience}+ Years Experience`,
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
              className="text-base sm:text-lg text-muted-foreground max-w-2xl lg:max-w-none mb-8 sm:mb-12 text-pretty leading-relaxed"
            >
              I craft exceptional digital experiences through innovative design and cutting-edge AI integrations. From
              concept to deployment, I build scalable solutions that drive real business results.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
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
          </div>
        </div>

        {/* Floating circular text - hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
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

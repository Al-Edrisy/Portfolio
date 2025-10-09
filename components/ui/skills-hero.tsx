"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

interface StatItem {
  number: string
  label: string
  suffix?: string
}

const stats: StatItem[] = [
  { number: "3+", label: "Years Experience" },
  { number: "50+", label: "Projects Completed" },
  { number: "15+", label: "Technologies Mastered" },
  { number: "100%", label: "Client Satisfaction" }
]

const SkillsHero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const tl = gsap.timeline()

    // Title animation
    tl.fromTo(titleRef.current,
      { opacity: 0, y: 50, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power2.out" }
    )

    // Subtitle animation
    tl.fromTo(subtitleRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    )

    // Stats animation
    tl.fromTo(statsRef.current?.children || [],
      { opacity: 0, y: 40, scale: 0.8 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: "back.out(1.7)" 
      },
      "-=0.2"
    )

    // Number counting animation
    stats.forEach((stat, index) => {
      const statElement = statsRef.current?.children[index]?.querySelector('.stat-number')
      if (!statElement) return

      const targetNumber = parseInt(stat.number.replace(/\D/g, '')) || 0
      const suffix = stat.number.replace(/\d/g, '')

      gsap.fromTo(statElement,
        { textContent: "0" },
        {
          textContent: targetNumber,
          duration: 2,
          ease: "power2.out",
          delay: 0.5 + index * 0.2,
          onUpdate: function() {
            const currentValue = Math.round(this.targets()[0].textContent)
            this.targets()[0].textContent = currentValue + suffix
          }
        }
      )
    })

    // Floating particles
    if (particlesRef.current) {
      const particles = Array.from({ length: 20 }, (_, i) => {
        const particle = document.createElement('div')
        particle.className = 'absolute w-2 h-2 bg-primary/20 rounded-full'
        particle.style.left = `${Math.random() * 100}%`
        particle.style.top = `${Math.random() * 100}%`
        particle.style.animationDelay = `${Math.random() * 3}s`
        particlesRef.current?.appendChild(particle)
        return particle
      })

      particles.forEach(particle => {
        gsap.to(particle, {
          y: -20,
          opacity: 0.6,
          duration: 3 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        })
      })
    }

    // Scroll trigger for entrance
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 80%",
      animation: tl
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background particles */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none" />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Main title */}
        <h1 ref={titleRef} className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Skills
          </span>
        </h1>
        
        {/* Subtitle */}
        <p ref={subtitleRef} className="text-xl md:text-2xl text-muted-foreground mb-16 max-w-3xl mx-auto leading-relaxed">
          Crafting digital experiences with cutting-edge technologies and proven expertise
        </p>

        {/* Statistics */}
        <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:bg-card/80 hover:border-primary/30 transition-all duration-300 hover:scale-105">
                <div className="text-3xl md:text-4xl font-black text-primary mb-2 stat-number">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SkillsHero



"use client"

import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import SvgIcon from "@/components/ui/svg-icon"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface Skill {
  name: string
  icon: string
  category: string
  proficiency: number
  description: string
  color: string
  featured?: boolean
}

const skillCategories = [
  {
    title: "Top Strengths",
    description: "Your strongest technical competencies",
    color: "from-emerald-500 to-green-500",
    skills: [
      {
        name: "Node.js",
        icon: "/svg_tech_stack_icons/Programming Languages/nodejs-1.svg",
        category: "Backend",
        proficiency: 95,
        description: "Server-side JavaScript runtime for scalable applications",
        color: "#339933",
        featured: true
      },
      {
        name: "Python",
        icon: "/svg_tech_stack_icons/Programming Languages/python-5.svg",
        category: "Backend",
        proficiency: 95,
        description: "Versatile language for backend services and automation",
        color: "#3776AB",
        featured: true
      },
      {
        name: "React",
        icon: "/svg_tech_stack_icons/Frameworks/react-2.svg",
        category: "Frontend",
        proficiency: 93,
        description: "Building scalable React applications with modern hooks and patterns",
        color: "#61DAFB",
        featured: true
      },
      {
        name: "PostgreSQL",
        icon: "/svg_tech_stack_icons/Databases/postgresql.svg",
        category: "Database",
        proficiency: 90,
        description: "Relational database design and optimization",
        color: "#336791",
        featured: true
      },
      {
        name: "Next.js",
        icon: "/svg_tech_stack_icons/Frameworks/next-3.svg",
        category: "Frontend",
        proficiency: 89,
        description: "Full-stack React framework with SSR, SSG, and API routes",
        color: "#000000",
        featured: true
      }
    ]
  },
  {
    title: "Frontend Development",
    description: "Modern user interfaces and experiences",
    color: "from-blue-500 to-cyan-500",
    skills: [
      {
        name: "React",
        icon: "/svg_tech_stack_icons/Frameworks/react-2.svg",
        category: "Frontend",
        proficiency: 93,
        description: "Building scalable React applications with modern hooks and patterns",
        color: "#61DAFB",
        featured: true
      },
      {
        name: "Next.js",
        icon: "/svg_tech_stack_icons/Frameworks/next-3.svg",
        category: "Frontend",
        proficiency: 89,
        description: "Full-stack React framework with SSR, SSG, and API routes",
        color: "#000000",
        featured: true
      },
      {
        name: "TypeScript",
        icon: "/svg_tech_stack_icons/Programming Languages/typescript.svg",
        category: "Frontend",
        proficiency: 88,
        description: "Type-safe JavaScript for robust applications",
        color: "#3178C6",
        featured: true
      },
      {
        name: "Expo",
        icon: "/svg_tech_stack_icons/Frameworks/expo-go-app.svg",
        category: "Mobile",
        proficiency: 86,
        description: "Cross-platform mobile development with React Native",
        color: "#000020"
      },
      {
        name: "GSAP",
        icon: "/svg_tech_stack_icons/Animation/gsap-greensock.svg",
        category: "Animation",
        proficiency: 20,
        description: "Advanced web animations and interactions",
        color: "#88CE02"
      }
    ]
  },
  {
    title: "Backend & Infrastructure",
    description: "Scalable server-side solutions",
    color: "from-green-500 to-emerald-500",
    skills: [
      {
        name: "Node.js",
        icon: "/svg_tech_stack_icons/Programming Languages/nodejs-1.svg",
        category: "Backend",
        proficiency: 95,
        description: "Server-side JavaScript runtime for scalable applications",
        color: "#339933",
        featured: true
      },
      {
        name: "Python",
        icon: "/svg_tech_stack_icons/Programming Languages/python-5.svg",
        category: "Backend",
        proficiency: 95,
        description: "Versatile language for backend services and automation",
        color: "#3776AB",
        featured: true
      },
      {
        name: "C",
        icon: "/svg_tech_stack_icons/Programming Languages/c.svg",
        category: "System Programming",
        proficiency: 82,
        description: "Low-level system programming and performance optimization",
        color: "#A8B9CC"
      },
      {
        name: "C++",
        icon: "/svg_tech_stack_icons/Programming Languages/cplusplus.svg",
        category: "System Programming",
        proficiency: 55,
        description: "Object-oriented programming and system development",
        color: "#00599C"
      },
      {
        name: "Swift",
        icon: "/svg_tech_stack_icons/Programming Languages/swift-15.svg",
        category: "Mobile",
        proficiency: 55,
        description: "iOS native app development",
        color: "#FA7343"
      },
      {
        name: "Docker",
        icon: "/svg_tech_stack_icons/Tools & Services/docker-3.svg",
        category: "DevOps",
        proficiency: 82,
        description: "Containerization and orchestration",
        color: "#2496ED"
      }
    ]
  },
  {
    title: "Cloud & Databases",
    description: "Infrastructure and data management",
    color: "from-indigo-500 to-purple-500",
    skills: [
      {
        name: "AWS",
        icon: "/svg_tech_stack_icons/Cloud & Infrastructure/aws-2.svg",
        category: "Cloud",
        proficiency: 82,
        description: "Cloud infrastructure and deployment strategies",
        color: "#FF9900",
        featured: true
      },
      {
        name: "Firebase",
        icon: "/svg_tech_stack_icons/Cloud & Infrastructure/firebase-2.svg",
        category: "Cloud",
        proficiency: 87,
        description: "Backend-as-a-Service for rapid app development",
        color: "#FFCA28",
        featured: true
      },
      {
        name: "PostgreSQL",
        icon: "/svg_tech_stack_icons/Databases/postgresql.svg",
        category: "Database",
        proficiency: 90,
        description: "Relational database design and optimization",
        color: "#336791",
        featured: true
      },
      {
        name: "MongoDB",
        icon: "/svg_tech_stack_icons/Databases/mongodb-icon-2.svg",
        category: "Database",
        proficiency: 53,
        description: "NoSQL database architecture",
        color: "#47A248"
      },
      {
        name: "MySQL",
        icon: "/svg_tech_stack_icons/Databases/mysql-logo-pure.svg",
        category: "Database",
        proficiency: 75,
        description: "Relational database management and optimization",
        color: "#4479A1"
      }
    ]
  },
  {
    title: "AI & Machine Learning",
    description: "Intelligent systems and automation",
    color: "from-purple-500 to-pink-500",
    skills: [
      {
        name: "OpenAI API",
        icon: "/svg_tech_stack_icons/AI & ML/openai-logo-1.svg",
        category: "AI",
        proficiency: 78,
        description: "AI integration and prompt engineering",
        color: "#412991",
        featured: true
      },
      {
        name: "Hugging Face",
        icon: "/svg_tech_stack_icons/AI & ML/huggingface-1.svg",
        category: "AI",
        proficiency: 73,
        description: "Transformer models and NLP pipelines",
        color: "#FFD21E"
      }
    ]
  },
  {
    title: "Tools & Services",
    description: "Development productivity and collaboration",
    color: "from-orange-500 to-red-500",
    skills: [
      {
        name: "GitHub",
        icon: "/svg_tech_stack_icons/Tools & Services/github-2.svg",
        category: "Version Control",
        proficiency: 87,
        description: "Collaborative development and CI/CD",
        color: "#181717",
        featured: true
      },
      {
        name: "Firebase",
        icon: "/svg_tech_stack_icons/Cloud & Infrastructure/firebase-2.svg",
        category: "Cloud",
        proficiency: 87,
        description: "Backend-as-a-Service for rapid app development",
        color: "#FFCA28",
        featured: true
      },
      {
        name: "Jenkins",
        icon: "/svg_tech_stack_icons/Tools & Services/jenkins-1.svg",
        category: "CI/CD",
        proficiency: 55,
        description: "Automated build and deployment pipelines",
        color: "#D24939"
      }
    ]
  }
]

import SkillsHero from "@/components/ui/skills-hero"
import SkillsShowcase from "@/components/ui/skill-showcase"
import MagicBento from "@/components/ui/magic-bento"

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!sectionRef.current) return

    // Create floating tech icons animation
    const createFloatingIcon = () => {
      const icons = [
        "/svg_tech_stack_icons/Frameworks/react-2.svg",
        "/svg_tech_stack_icons/Programming Languages/typescript.svg",
        "/svg_tech_stack_icons/Tools & Services/docker-3.svg",
        "/svg_tech_stack_icons/AI & ML/openai-logo-1.svg"
      ]
      
      const icon = document.createElement('div')
      icon.className = 'absolute pointer-events-none opacity-20'
      icon.style.left = `${Math.random() * 100}%`
      icon.style.top = '100%'
      icon.innerHTML = `<img src="${icons[Math.floor(Math.random() * icons.length)]}" alt="" class="w-8 h-8" />`
      
      sectionRef.current?.appendChild(icon)
      
      gsap.to(icon, {
        y: -window.innerHeight - 100,
        rotation: 360,
        duration: 8 + Math.random() * 4,
        ease: "none",
        onComplete: () => icon.remove()
      })
    }

    // Create floating icons periodically
    const interval = setInterval(createFloatingIcon, 3000)
    createFloatingIcon() // Initial icon

    return () => clearInterval(interval)
  }, [])

  return (
    <section ref={sectionRef} id="skills" className="min-h-screen bg-background relative overflow-hidden">
      {/* Skills Hero */}
      <SkillsHero />
      
      {/* Skills Showcase */}
      <div className="py-24">
        <div className="container mx-auto px-4">
          <SkillsShowcase categories={skillCategories} />
        </div>
                </div>

      {/* Magic Bento Grid */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <MagicBento
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={8}
              glowColor="16, 185, 129"
            />
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 rounded-3xl p-12 md:p-16 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
              
              <div className="relative z-10">
                <h3 className="text-4xl md:text-5xl font-black mb-6">
                  <span className="text-foreground">Ready to </span>
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    collaborate
                  </span>
                  <span className="text-foreground">?</span>
                </h3>
                
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                  Let's combine these skills to create something extraordinary for your next project.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg"
              onClick={() => {
                const element = document.getElementById("contact")
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" })
                }
              }}
            >
                  Start a Project
                  </button>
                
                <button
                    className="px-10 py-4 bg-card/50 backdrop-blur-sm border border-border/60 text-foreground rounded-2xl font-bold text-lg hover:bg-card/80 transition-all duration-300 hover:scale-105"
                  onClick={() => window.open('/resume.pdf', '_blank')}
                >
                  View Resume
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

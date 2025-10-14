"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
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
        icon: "/svg_tech_stack_icons/Programming_Languages/typescript.svg",
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
        proficiency: 75,
        description: "Cross-platform mobile development with React Native",
        color: "#000020"
      },
      {
        name: "GSAP",
        icon: "/svg_tech_stack_icons/Animation/gsap-greensock.svg",
        category: "Animation",
        proficiency: 70,
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
        icon: "/svg_tech_stack_icons/Programming_Languages/nodejs-1.svg",
        category: "Backend",
        proficiency: 95,
        description: "Server-side JavaScript runtime for scalable applications",
        color: "#339933",
        featured: true
      },
      {
        name: "Python",
        icon: "/svg_tech_stack_icons/Programming_Languages/python-5.svg",
        category: "Backend",
        proficiency: 95,
        description: "Versatile language for backend services and automation",
        color: "#3776AB",
        featured: true
      },
      {
        name: "C",
        icon: "/svg_tech_stack_icons/Programming_Languages/c.svg",
        category: "System Programming",
        proficiency: 80,
        description: "Low-level system programming and performance optimization",
        color: "#A8B9CC"
      },
      {
        name: "Swift",
        icon: "/svg_tech_stack_icons/Programming_Languages/swift-15.svg",
        category: "Mobile",
        proficiency: 70,
        description: "iOS native app development",
        color: "#FA7343"
      },
      {
        name: "Docker",
        icon: "/svg_tech_stack_icons/Tools_Services/docker-3.svg",
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
        name: "Firebase",
        icon: "/svg_tech_stack_icons/Cloud_Infrastructure/firebase-2.svg",
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
        name: "AWS",
        icon: "/svg_tech_stack_icons/Cloud_Infrastructure/aws-2.svg",
        category: "Cloud",
        proficiency: 82,
        description: "Cloud infrastructure and deployment strategies",
        color: "#FF9900",
        featured: true
      },
      {
        name: "Google Cloud",
        icon: "/svg_tech_stack_icons/Cloud_Infrastructure/google-cloud-3.svg",
        category: "Cloud",
        proficiency: 75,
        description: "Google's cloud platform for scalable applications",
        color: "#4285F4"
      },
      {
        name: "MongoDB",
        icon: "/svg_tech_stack_icons/Databases/mongodb-icon-2.svg",
        category: "Database",
        proficiency: 75,
        description: "NoSQL database architecture and management",
        color: "#47A248"
      },
      {
        name: "MySQL",
        icon: "/svg_tech_stack_icons/Databases/mysql-logo-pure.svg",
        category: "Database",
        proficiency: 70,
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
        icon: "/svg_tech_stack_icons/AI_ML/openai-logo-1.svg",
        category: "AI",
        proficiency: 78,
        description: "AI integration and prompt engineering",
        color: "#412991",
        featured: true
      },
      {
        name: "TensorFlow",
        icon: "/svg_tech_stack_icons/Frameworks/tensorflow-2.svg",
        category: "ML",
        proficiency: 65,
        description: "Machine learning and deep learning framework",
        color: "#FF6F00"
      },
      {
        name: "PyTorch",
        icon: "/svg_tech_stack_icons/Frameworks/pytorch-2.svg",
        category: "ML",
        proficiency: 60,
        description: "Deep learning framework for research and production",
        color: "#EE4C2C"
      },
      {
        name: "Hugging Face",
        icon: "/svg_tech_stack_icons/AI_ML/huggingface-1.svg",
        category: "AI",
        proficiency: 65,
        description: "Transformer models and NLP pipelines",
        color: "#FFD21E"
      }
    ]
  },
  {
    title: "Development Tools",
    description: "Productivity and collaboration tools",
    color: "from-orange-500 to-red-500",
    skills: [
      {
        name: "GitHub",
        icon: "/svg_tech_stack_icons/Tools_Services/github-2.svg",
        category: "Version Control",
        proficiency: 87,
        description: "Collaborative development and CI/CD",
        color: "#181717",
        featured: true
      },
      {
        name: "Postman",
        icon: "/svg_tech_stack_icons/Tools_Services/postman.svg",
        category: "API Testing",
        proficiency: 80,
        description: "API development and testing platform",
        color: "#FF6C37"
      },
      {
        name: "Jenkins",
        icon: "/svg_tech_stack_icons/Tools_Services/jenkins-1.svg",
        category: "CI/CD",
        proficiency: 70,
        description: "Automated build and deployment pipelines",
        color: "#D24939"
      },
      {
        name: "Jira",
        icon: "/svg_tech_stack_icons/Tools_Services/jira-1.svg",
        category: "Project Management",
        proficiency: 75,
        description: "Agile project management and issue tracking",
        color: "#0052CC"
      },
      {
        name: "Slack",
        icon: "/svg_tech_stack_icons/Tools_Services/slack-new-logo.svg",
        category: "Communication",
        proficiency: 85,
        description: "Team communication and collaboration platform",
        color: "#4A154B"
      },
      {
        name: "Notion",
        icon: "/svg_tech_stack_icons/Tools_Services/notion-2.svg",
        category: "Documentation",
        proficiency: 80,
        description: "All-in-one workspace for notes and documentation",
        color: "#000000"
      }
    ]
  }
]

import SkillsShowcase from "@/components/ui/skill-showcase"
import MagicBento from "@/components/ui/magic-bento"

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const router = useRouter()

  // Calculate years of experience dynamically from 2020
  const calculateYearsOfExperience = (): number => {
    const startYear = 2020
    const currentYear = new Date().getFullYear()
    return currentYear - startYear
  }

  const yearsOfExperience = calculateYearsOfExperience()

  // Handle CV download
  const handleDownloadCV = () => {
    // Create a link element
    const link = document.createElement('a')
    link.href = '/cv/Salih_Ben_Otman_CV.pdf' // Update this path to your actual CV file
    link.download = 'Salih_Ben_Otman_CV.pdf'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  useEffect(() => {
    if (!sectionRef.current) return

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) return

    // Create floating tech icons animation (optimized)
    const createFloatingIcon = () => {
      const icons = [
        "/svg_tech_stack_icons/Frameworks/react-2.svg",
        "/svg_tech_stack_icons/Programming_Languages/typescript.svg",
        "/svg_tech_stack_icons/Tools_Services/docker-3.svg",
        "/svg_tech_stack_icons/AI_ML/openai-logo-1.svg"
      ]
      
      const icon = document.createElement('div')
      icon.className = 'absolute pointer-events-none opacity-10'
      icon.style.left = `${Math.random() * 100}%`
      icon.style.top = '100%'
      icon.innerHTML = `<img src="${icons[Math.floor(Math.random() * icons.length)]}" alt="" class="w-6 h-6" loading="lazy" />`
      
      sectionRef.current?.appendChild(icon)
      
      gsap.to(icon, {
        y: -window.innerHeight - 100,
        rotation: 180, // Reduced rotation for better performance
        duration: 12 + Math.random() * 6, // Slower animation
        ease: "none",
        onComplete: () => {
          if (icon.parentNode) {
            icon.parentNode.removeChild(icon)
          }
        }
      })
    }

    // Create floating icons less frequently for better performance
    const interval = setInterval(createFloatingIcon, 5000) // Increased interval
    createFloatingIcon() // Initial icon

    return () => clearInterval(interval)
  }, [])

  return (
    <section ref={sectionRef} id="skills" className="min-h-screen bg-background relative overflow-hidden">
      {/* Skills Showcase */}
      <div className="pt-24 md:pt-32 pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <header className="text-center mb-12 md:mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Technical Skills
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore my expertise across modern web technologies, frameworks, and development tools
            </p>
          </header>
          <SkillsShowcase categories={skillCategories} />
        </div>
      </div>

      {/* Magic Bento Grid */}
      <div className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Technical Expertise in Action
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore the technologies and methodologies I use to build scalable, modern applications. 
              Each card represents a key aspect of my development approach.
            </p>
          </div>

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
              particleCount={typeof window !== 'undefined' && window.innerWidth < 768 ? 4 : 8}
              glowColor="16, 185, 129"
            />
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-primary/5 border border-primary/10 rounded-2xl md:rounded-3xl p-6 md:p-10 lg:p-12 relative overflow-hidden">
              {/* Decorative elements - reduced opacity */}
              <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 md:w-48 h-32 md:h-48 bg-secondary/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 text-center">
                <h3 className="text-2xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 text-foreground">
                  Ready to collaborate?
                </h3>
                
                <p className="text-base md:text-lg text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
                  Let's combine these skills to create something extraordinary for your next project. 
                  I bring <strong>{yearsOfExperience}+ years of experience</strong> and 
                  <strong>full-stack expertise</strong> to every collaboration.
                </p>

                {/* Simplified Stats */}
                <div className="flex justify-center items-center gap-6 md:gap-8 mb-8 md:mb-10 text-sm md:text-base text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>{yearsOfExperience}+ Years Experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <span>35+ Projects Delivered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>100% Client Satisfaction</span>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
                  <button
                    className="group relative px-8 md:px-12 py-4 md:py-5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl font-bold text-base md:text-lg hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:scale-105 shadow-xl shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-3 overflow-hidden"
                    onClick={() => router.push('/contact')}
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">Start a Project</span>
                    <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                
                  <button
                    className="group relative px-8 md:px-12 py-4 md:py-5 bg-background/80 backdrop-blur-sm border-2 border-primary/20 text-foreground rounded-2xl font-bold text-base md:text-lg hover:bg-background/90 hover:border-primary/40 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                    onClick={handleDownloadCV}
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download CV</span>
                  </button>
                </div>

                {/* Contact Info */}
                <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-border/50">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span>salehfree33@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Available for remote work</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>24/7 Response Available</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

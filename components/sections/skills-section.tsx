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
        proficiency: 80,
        description: "Low-level system programming and performance optimization",
        color: "#A8B9CC"
      },
      {
        name: "Swift",
        icon: "/svg_tech_stack_icons/Programming Languages/swift-15.svg",
        category: "Mobile",
        proficiency: 70,
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
        name: "AWS",
        icon: "/svg_tech_stack_icons/Cloud & Infrastructure/aws-2.svg",
        category: "Cloud",
        proficiency: 82,
        description: "Cloud infrastructure and deployment strategies",
        color: "#FF9900",
        featured: true
      },
      {
        name: "Google Cloud",
        icon: "/svg_tech_stack_icons/Cloud & Infrastructure/google-cloud-3.svg",
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
        icon: "/svg_tech_stack_icons/AI & ML/openai-logo-1.svg",
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
        icon: "/svg_tech_stack_icons/AI & ML/huggingface-1.svg",
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
        icon: "/svg_tech_stack_icons/Tools & Services/github-2.svg",
        category: "Version Control",
        proficiency: 87,
        description: "Collaborative development and CI/CD",
        color: "#181717",
        featured: true
      },
      {
        name: "Postman",
        icon: "/svg_tech_stack_icons/Tools & Services/postman.svg",
        category: "API Testing",
        proficiency: 80,
        description: "API development and testing platform",
        color: "#FF6C37"
      },
      {
        name: "Jenkins",
        icon: "/svg_tech_stack_icons/Tools & Services/jenkins-1.svg",
        category: "CI/CD",
        proficiency: 70,
        description: "Automated build and deployment pipelines",
        color: "#D24939"
      },
      {
        name: "Jira",
        icon: "/svg_tech_stack_icons/Tools & Services/jira-1.svg",
        category: "Project Management",
        proficiency: 75,
        description: "Agile project management and issue tracking",
        color: "#0052CC"
      },
      {
        name: "Slack",
        icon: "/svg_tech_stack_icons/Tools & Services/slack-new-logo.svg",
        category: "Communication",
        proficiency: 85,
        description: "Team communication and collaboration platform",
        color: "#4A154B"
      },
      {
        name: "Notion",
        icon: "/svg_tech_stack_icons/Tools & Services/notion-2.svg",
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
      {/* Skills Showcase */}
      <div className="pt-32 pb-24">
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
          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 rounded-3xl p-8 md:p-16 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
              
              <div className="relative z-10 text-center">
                <h3 className="text-3xl md:text-5xl font-black mb-6">
                  <span className="text-foreground">Ready to </span>
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    collaborate
                  </span>
                  <span className="text-foreground">?</span>
                </h3>
                
                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                  Let's combine these skills to create something extraordinary for your next project. 
                  I bring <strong>{yearsOfExperience}+ years of experience</strong>, <strong>team leadership</strong>, and 
                  <strong>full-stack expertise</strong> to every collaboration.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{yearsOfExperience}+</div>
                    <div className="text-sm text-muted-foreground">Years Experience</div>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-1">35+</div>
                    <div className="text-sm text-muted-foreground">Projects Delivered</div>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-1">100%</div>
                    <div className="text-sm text-muted-foreground">Client Satisfaction</div>
                  </div>
                  <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-1">24h</div>
                    <div className="text-sm text-muted-foreground">Response Time</div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    className="px-8 md:px-10 py-3 md:py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-base md:text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                    onClick={() => router.push('/contact')}
                  >
                    <span>Start a Project</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                
                  <button
                    className="px-8 md:px-10 py-3 md:py-4 bg-card/50 backdrop-blur-sm border border-border/60 text-foreground rounded-2xl font-bold text-base md:text-lg hover:bg-card/80 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
                    onClick={handleDownloadCV}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download CV</span>
                  </button>
                </div>

                {/* Contact Info */}
                <div className="mt-8 pt-8 border-t border-border/50">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
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

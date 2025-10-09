"use client"

import { motion } from "motion/react"
import SplitText from "@/components/ui/split-text"
import ScrollReveal from "@/components/ui/scroll-reveal"
import RotatingText from "@/components/ui/rotating-text"

const achievements = [
  { number: "50+", label: "Projects Completed" },
  { number: "5+", label: "Years Experience" },
  { number: "20+", label: "Happy Clients" },
  { number: "15+", label: "Technologies Mastered" },
]


export default function AboutSection() {
  return (
    <section id="about" className="min-h-screen bg-background relative">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10 py-16">
        {/* Hero Title Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            About Me
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            I'm a{" "}
            <span className="inline-block px-3 py-1 bg-primary text-primary-foreground rounded-lg font-semibold">
              UI/UX Engineer & Full-Stack Developer
            </span>{" "}
            passionate about creating exceptional digital experiences.
          </p>
          </div>

        {/* Main Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-16">
          {/* Text Content */}
          <div className="space-y-8">
            {/* Story Section */}
            <div className="space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">My Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  With over 5 years of experience in full-stack development, I specialize in creating innovative digital
                  solutions that bridge the gap between cutting-edge technology and exceptional user experience. My
                  journey began with a fascination for how technology can solve real-world problems.
                </p>
                <p>
                  My expertise spans across modern web technologies, AI integrations with OpenAI and Langflow, and
                  scalable system architecture. I've had the privilege of working with startups and established
                  companies, helping them transform their ideas into successful digital products.
                </p>
                <p>
                  What drives me is the intersection of design and technology. I believe that great software isn't just
                  functional—it's intuitive, beautiful, and makes people's lives better. Every project I work on is an
                  opportunity to push boundaries and create something meaningful.
                </p>
              </div>
              </div>

          </div>

          {/* Personal Activities & Hobbies Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative w-96 h-96 flex items-center justify-center">
              {/* Central Developer */}
              <motion.div 
                className="text-8xl z-20 relative"
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                👨‍💻
              </motion.div>

              {/* Personal Activities Around Developer */}
              <motion.div 
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary/60 rounded-full p-4 shadow-xl border-2 border-white/30 hover:scale-110 transition-transform duration-300 group"
                initial={{ opacity: 0, y: -50, scale: 0 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <span className="text-3xl">⚽</span>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Sports
                </div>
              </motion.div>
              
              <motion.div 
                className="absolute top-20 -right-6 bg-secondary/60 rounded-full p-4 shadow-xl border-2 border-white/30 hover:scale-110 transition-transform duration-300 group"
                initial={{ opacity: 0, x: 50, scale: 0 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                viewport={{ once: true }}
              >
                <span className="text-3xl">🏊‍♂️</span>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Swimming
                </div>
              </motion.div>
              
                <motion.div
                className="absolute bottom-20 -right-6 bg-accent/60 rounded-full p-4 shadow-xl border-2 border-white/30 hover:scale-110 transition-transform duration-300 group"
                initial={{ opacity: 0, x: 50, scale: 0 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                viewport={{ once: true }}
              >
                <span className="text-3xl">💻</span>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Coding
                </div>
                </motion.div>

                <motion.div
                className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-primary/60 rounded-full p-4 shadow-xl border-2 border-white/30 hover:scale-110 transition-transform duration-300 group"
                initial={{ opacity: 0, y: 50, scale: 0 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                viewport={{ once: true }}
              >
                <span className="text-3xl">🤲</span>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Prayer
                </div>
                </motion.div>
              
              <motion.div 
                className="absolute bottom-20 -left-6 bg-secondary/60 rounded-full p-4 shadow-xl border-2 border-white/30 hover:scale-110 transition-transform duration-300 group"
                initial={{ opacity: 0, x: -50, scale: 0 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.3 }}
                viewport={{ once: true }}
              >
                <span className="text-3xl">💬</span>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Talking
              </div>
              </motion.div>
              
              <motion.div 
                className="absolute top-20 -left-6 bg-accent/60 rounded-full p-4 shadow-xl border-2 border-white/30 hover:scale-110 transition-transform duration-300 group"
                initial={{ opacity: 0, x: -50, scale: 0 }}
                whileInView={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                viewport={{ once: true }}
              >
                <span className="text-3xl">🎧</span>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  Podcasts
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Education & Certifications Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Education & Certifications</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Education */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground mb-6">Academic Background</h3>
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-card/50 rounded-xl border border-border/50 p-6 hover:bg-card/70 transition-colors duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/20 rounded-full p-3 flex-shrink-0">
                    <img 
                      src="/university-logo.png" 
                      alt="FIU Logo" 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-card-foreground mb-2">Bachelor of Science in Software Engineering</h4>
                    <p className="text-primary font-medium mb-1">Final International University (FIU)</p>
                    <p className="text-muted-foreground text-sm mb-2">North Cyprus</p>
                    <p className="text-muted-foreground text-sm">Started Fall 2021 - Present</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Professional Certifications */}
            <div className="space-y-6">
              <h3 className="text-2xl font-semibold text-foreground mb-6">Professional Certifications</h3>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-card/50 rounded-xl border border-border/50 p-6 hover:bg-card/70 transition-colors duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-secondary/20 rounded-full p-3 flex-shrink-0">
                    <span className="text-2xl">🗄️</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-card-foreground mb-2">Database Mastery Course</h4>
                    <p className="text-secondary font-medium mb-1">Instructors: Andrei Neagoie, Mo Binni</p>
                    <p className="text-muted-foreground text-sm mb-2">From Zero to Master - Online Course</p>
                    <p className="text-muted-foreground text-sm">Completed: February 8, 2024 (24.05 hours)</p>
                    <a 
                      href="https://udemy-certificate.s3.amazonaws.com/image/UC-5755ae07-3463-4a72-9460-78bbd2963eb3.jpg?v=1707389293000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary hover:text-primary/80 transition-colors duration-200 text-sm font-medium mt-2"
                    >
                      View Certificate →
                    </a>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                viewport={{ once: true }}
                className="bg-card/50 rounded-xl border border-border/50 p-6 hover:bg-card/70 transition-colors duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-accent/20 rounded-full p-3 flex-shrink-0">
                    <span className="text-2xl">💻</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-card-foreground mb-2">Complete Full-Stack Web Development Bootcamp</h4>
                    <p className="text-accent font-medium mb-1">Instructor: Dr. Angela Yu</p>
                    <p className="text-muted-foreground text-sm">Developer and Lead Instructor of Appbrewery</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
                className="bg-card/50 rounded-xl border border-border/50 p-6 hover:bg-card/70 transition-colors duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-primary/20 rounded-full p-3 flex-shrink-0">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-card-foreground mb-2">Master the Coding Interview: Data Structures + Algorithms</h4>
                    <p className="text-primary font-medium mb-1">Instructor: Andrei Neagoie</p>
                    <p className="text-muted-foreground text-sm">Advanced problem-solving and algorithm design</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-12">By the Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
                className="text-center p-8 bg-card/50 rounded-2xl border border-border/50 hover:bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <motion.div
                  className="text-4xl md:text-5xl font-bold text-primary mb-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                viewport={{ once: true }}
              >
                {achievement.number}
              </motion.div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">{achievement.label}</div>
            </motion.div>
          ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

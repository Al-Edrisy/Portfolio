"use client"

import { motion } from "motion/react"
import Link from "next/link"
import { ArrowRight, Code, Mail, User, Briefcase } from "lucide-react"

const quickLinks = [
  {
    title: "About Me",
    description: "Learn about my journey, experience, and passion for creating exceptional digital experiences.",
    href: "/about",
    icon: User,
    color: "text-blue-500"
  },
  {
    title: "Projects",
    description: "Explore my portfolio of innovative digital solutions and AI-powered applications.",
    href: "/projects",
    icon: Briefcase,
    color: "text-green-500"
  },
  {
    title: "Skills",
    description: "Discover my technical expertise and the technologies I work with.",
    href: "/skills",
    icon: Code,
    color: "text-purple-500"
  },
  {
    title: "Contact",
    description: "Get in touch for collaboration opportunities and project inquiries.",
    href: "/contact",
    icon: Mail,
    color: "text-orange-500"
  }
]

export default function AnimatedCards() {
  return (
    <>
      {/* Quick Links Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Explore My Work
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Dive deeper into my expertise and discover how I can help bring your ideas to life
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <Link key={link.title} href={link.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                >
                  <div className="flex items-center mb-4">
                    <link.icon className={`h-8 w-8 ${link.color} mr-3`} />
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    {link.description}
                  </p>
                  <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                    Learn more
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Let's collaborate on your next project and create exceptional digital experiences together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <motion.button
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get In Touch
                </motion.button>
              </Link>
              <Link href="/projects">
                <motion.button
                  className="px-8 py-3 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Projects
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}

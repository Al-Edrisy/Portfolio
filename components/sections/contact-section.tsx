"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "motion/react"
import SplitText from "@/components/ui/split-text"
import StarBorder from "@/components/ui/star-border"
import ClickSpark from "@/components/ui/click-spark"

const contactMethods = [
  {
    icon: "📧",
    label: "Email",
    value: "salih.otman@final.edu.tr",
    href: "mailto:salih.otman@final.edu.tr",
    description: "Drop me a line anytime",
  },
  {
    icon: "📱",
    label: "Phone",
    value: "+1 (555) 123-4567",
    href: "tel:+15551234567",
    description: "Let's have a conversation",
  },
  {
    icon: "📍",
    label: "Location",
    value: "San Francisco, CA",
    href: "#",
    description: "Available for remote work",
  },
]

const socialLinks = [
  {
    name: "LinkedIn",
    href: "#",
    icon: "💼",
    color: "hover:text-blue-600",
  },
  {
    name: "GitHub",
    href: "#",
    icon: "🐙",
    color: "hover:text-gray-800",
  },
  {
    name: "Twitter",
    href: "#",
    icon: "🐦",
    color: "hover:text-blue-400",
  },
  {
    name: "Dribbble",
    href: "#",
    icon: "🏀",
    color: "hover:text-pink-500",
  },
]

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("Form submitted:", formData)
    setIsSubmitting(false)
    setFormData({ name: "", email: "", subject: "", message: "" })
  }

  return (
    <section id="contact" className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-secondary rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <SplitText
            text="Let's Work Together"
            className="text-4xl md:text-5xl font-bold text-foreground mb-6 text-balance"
            delay={60}
            duration={0.6}
            splitType="words"
            fadeOnScroll={true}
          />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Ready to bring your next project to life? Let's discuss how we can create something amazing together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto mb-20">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-6">Get in Touch</h3>
              <div className="space-y-6">
                {contactMethods.map((method, index) => (
                  <motion.a
                    key={method.label}
                    href={method.href}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-4 p-4 bg-card/50 rounded-xl border border-border/50 hover:bg-card hover:shadow-lg transition-all duration-300 group"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
                        {method.value}
                      </div>
                      <div className="text-sm text-muted-foreground">{method.description}</div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-foreground mb-6">Follow Me</h3>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <ClickSpark key={social.name} sparkColor="rgb(16, 185, 129)" sparkCount={6}>
                    <motion.a
                      href={social.href}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className={`flex items-center justify-center w-12 h-12 bg-card border border-border rounded-xl text-2xl ${social.color} transition-all duration-200 hover:shadow-lg hover:scale-110`}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {social.icon}
                    </motion.a>
                  </ClickSpark>
                ))}
              </div>
            </div>

            {/* Availability Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="p-6 bg-primary/10 border border-primary/20 rounded-xl"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-semibold text-foreground">Available for New Projects</span>
              </div>
              <p className="text-sm text-muted-foreground">
                I'm currently accepting new client work and interesting collaboration opportunities.
              </p>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-primary/50"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-primary/50"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-primary/50"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 hover:border-primary/50 resize-none"
                  placeholder="Tell me about your project, timeline, and budget..."
                />
              </div>

              <ClickSpark sparkColor="rgb(16, 185, 129)" sparkCount={12} sparkRadius={20}>
                <StarBorder
                  as="button"
                  type="submit"
                  color="rgb(16, 185, 129)"
                  speed="4s"
                  className="w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </StarBorder>
              </ClickSpark>

              <p className="text-xs text-muted-foreground text-center">
                I'll get back to you within 24 hours. Promise! 🚀
              </p>
            </form>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center pt-12 border-t border-border"
        >
          <p className="text-muted-foreground mb-4">
            © {new Date().getFullYear()} Salih Ben Otman. Built with Next.js, TypeScript, and lots of ☕
          </p>
          <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
            <motion.a href="#" className="hover:text-primary transition-colors duration-200" whileHover={{ y: -2 }}>
              Privacy Policy
            </motion.a>
            <motion.a href="#" className="hover:text-primary transition-colors duration-200" whileHover={{ y: -2 }}>
              Terms of Service
            </motion.a>
            <motion.a href="#" className="hover:text-primary transition-colors duration-200" whileHover={{ y: -2 }}>
              Sitemap
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

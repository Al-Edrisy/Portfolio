"use client"

import { motion } from "motion/react"
import { Code2, Brain, Layout, Cloud, Sparkles, ArrowRight } from "lucide-react"
import Link from "next/link"

const services = [
    {
        title: "Full-Stack Development",
        description: "Building scalable, high-performance web applications using React, Next.js, and Node.js with a focus on clean architecture.",
        icon: <Code2 className="w-8 h-8" />,
        color: "from-blue-500/20 to-cyan-500/20",
        borderColor: "group-hover:border-blue-500/50",
        iconColor: "text-blue-500"
    },
    {
        title: "AI Systems Builder",
        description: "Crafting intelligent solutions with OpenAI API, Langflow, and custom AI agents to automate complex workflows.",
        icon: <Brain className="w-8 h-8" />,
        color: "from-purple-500/20 to-pink-500/20",
        borderColor: "group-hover:border-purple-500/50",
        iconColor: "text-purple-500"
    },
    {
        title: "UI/UX Engineering",
        description: "Designing and implementing premium, accessible, and highly-performant user interfaces that WOW your users.",
        icon: <Layout className="w-8 h-8" />,
        color: "from-emerald-500/20 to-teal-500/20",
        borderColor: "group-hover:border-emerald-500/50",
        iconColor: "text-emerald-500"
    },
    {
        title: "Scalable Architecture",
        description: "Deploying and managing robust systems on Firebase, Vercel, and modern cloud infrastructure with 99.9% uptime.",
        icon: <Cloud className="w-8 h-8" />,
        color: "from-orange-500/20 to-red-500/20",
        borderColor: "group-hover:border-orange-500/50",
        iconColor: "text-orange-500"
    }
]

export default function ServicesPreview() {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            {/* Dynamic Background Blurs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Specialized Services</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold mb-6"
                    >
                        Solutions Tailored to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            Modern Business Needs
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    >
                        I combine technical excellence with artistic design to deliver products
                        that don't just work—they inspire.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="group relative"
                        >
                            <div className={`h-full p-8 rounded-3xl border border-border bg-card/50 backdrop-blur-sm transition-all duration-300 ${service.borderColor} hover:shadow-2xl hover:shadow-primary/5 overflow-hidden`}>
                                {/* Hover Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <div className="relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-background shadow-sm group-hover:scale-110 transition-transform duration-300 ${service.iconColor}`}>
                                        {service.icon}
                                    </div>

                                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                                        {service.title}
                                    </h3>

                                    <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                                        {service.description}
                                    </p>

                                    <div className="flex items-center gap-2 text-primary text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <span>Learn More</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-16 text-center"
                >
                    <Link href="/contact">
                        <button className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                            Discuss Your Project
                        </button>
                    </Link>
                </motion.div>
            </div>
        </section>
    )
}

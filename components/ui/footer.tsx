"use client"

import React from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import {
    Github,
    Linkedin,
    Facebook,
    Code2,
    Mail,
    ArrowUpRight,
    Copyright,
    Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const footerLinks = [
    {
        title: "Navigation",
        links: [
            { name: "Home", href: "/" },
            { name: "Projects", href: "/projects" },
            { name: "Skills", href: "/skills" },
            { name: "About", href: "/about" },
            { name: "Contact", href: "/contact" },
        ]
    },
    {
        title: "Services",
        links: [
            { name: "Full-Stack Development", href: "/services" },
            { name: "AI Systems Integration", href: "/services" },
            { name: "UI/UX Engineering", href: "/services" },
            { name: "Consultation", href: "/services" },
        ]
    },
    {
        title: "Social",
        links: [
            { name: "GitHub", href: "https://github.com/Al-Edrisy", icon: Github },
            { name: "LinkedIn", href: "https://www.linkedin.com/in/صالح-بن-عثمان-a565a2242", icon: Linkedin },
            { name: "Facebook", href: "https://www.facebook.com/share/14GHt7scAjF/?mibextid=wwXIfr", icon: Facebook },
            { name: "LeetCode", href: "https://leetcode.com/u/salehfree33", icon: Code2 },
        ]
    }
]

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <footer className="relative bg-background border-t border-border overflow-hidden pt-20 pb-10">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 -translate-y-1/2" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <Link href="/" className="inline-block">
                            <motion.span
                                className="text-2xl font-bold tracking-tighter"
                                whileHover={{ scale: 1.05 }}
                            >
                                Salih<span className="text-primary">.dev</span>
                            </motion.span>
                        </Link>
                        <p className="text-muted-foreground text-md max-w-sm leading-relaxed">
                            Engineering modern, scalable digital experiences with a focus on performance, accessibility, and AI integration.
                        </p>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="icon" className="rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300" asChild>
                                <a href="https://github.com/Al-Edrisy" target="_blank" rel="noopener noreferrer">
                                    <Github className="w-5 h-5" />
                                </a>
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300" asChild>
                                <a href="https://www.linkedin.com/in/صالح-بن-عثمان-a565a2242" target="_blank" rel="noopener noreferrer">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300" asChild>
                                <a href="mailto:salehfree33@gmail.com">
                                    <Mail className="w-5 h-5" />
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Links Sections */}
                    {footerLinks.map((section) => (
                        <div key={section.title} className="space-y-6">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-primary">
                                {section.title}
                            </h4>
                            <ul className="space-y-4">
                                {section.links.map((link: any) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-muted-foreground hover:text-foreground transition-colors group flex items-center gap-2"
                                        >
                                            {link.icon && <link.icon className="w-4 h-4" />}
                                            {link.name}
                                            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <Copyright className="w-4 h-4" />
                        <span>{new Date().getFullYear()} Salih Ben Otman. All rights reserved.</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            Built with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> using Next.js
                        </div>
                        <button
                            onClick={scrollToTop}
                            className="text-xs font-bold uppercase tracking-tighter hover:text-primary transition-colors flex items-center gap-1 group"
                        >
                            Back to Top
                            <div className="w-5 h-5 rounded-full border border-border flex items-center justify-center group-hover:border-primary transition-colors">
                                <ArrowUpRight className="w-3 h-3 -rotate-45" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    )
}

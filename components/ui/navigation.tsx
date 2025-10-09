"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AuthButton } from "@/components/auth/auth-button"
import { useAuth } from "@/contexts/auth-context"

const navItems = [
  { name: "About", href: "/about" },
  { name: "Projects", href: "/projects" },
  { name: "Skills", href: "/skills" },
  { name: "Contact", href: "/contact" },
]

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const { user } = useAuth()

  // Check user permissions
  const canManageProjects = user?.role === 'developer' || user?.role === 'admin'
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isActiveRoute = (href: string) => {
    return pathname === href
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/90 backdrop-blur-md border-b border-border shadow-lg" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <motion.div
              className="text-xl font-bold text-foreground hover:text-primary transition-colors duration-200 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Salih Ben Otman
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <motion.div
                  className={`relative text-sm font-medium transition-colors duration-200 cursor-pointer ${
                    isActiveRoute(item.href)
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.name}
                  {isActiveRoute(item.href) && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                      layoutId="activeSection"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {/* Developer Menu */}
            {canManageProjects && (
              <div className="flex items-center space-x-2">
                <Link href="/projects/create">
                  <motion.button
                    className="px-4 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200 border border-primary/20 hover:border-primary/40 rounded-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    + Add Project
                  </motion.button>
                </Link>
                {isAdmin && (
                  <Link href="/admin/projects">
                    <motion.button
                      className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Manage
                    </motion.button>
                  </Link>
                )}
              </div>
            )}

            {mounted && (
              <motion.button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4 text-foreground" />
                ) : (
                  <Moon className="h-4 w-4 text-foreground" />
                )}
              </motion.button>
            )}

            <AuthButton />

            <Link href="/contact">
              <motion.button
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Hire Me
              </motion.button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <motion.button
            className="md:hidden text-foreground p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={isMobileMenuOpen ? "open" : "closed"}
              className="w-6 h-6 flex flex-col justify-center items-center"
            >
              <motion.span
                variants={{
                  closed: { rotate: 0, y: 0 },
                  open: { rotate: 45, y: 6 },
                }}
                className="w-6 h-0.5 bg-current block mb-1.5 origin-center transition-all duration-300"
              />
              <motion.span
                variants={{
                  closed: { opacity: 1 },
                  open: { opacity: 0 },
                }}
                className="w-6 h-0.5 bg-current block mb-1.5 transition-all duration-300"
              />
              <motion.span
                variants={{
                  closed: { rotate: 0, y: 0 },
                  open: { rotate: -45, y: -6 },
                }}
                className="w-6 h-0.5 bg-current block origin-center transition-all duration-300"
              />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background/95 backdrop-blur-md border-t border-border"
          >
            <div className="container mx-auto px-6 py-6">
              <div className="flex flex-col space-y-4">
                {navItems.map((item, index) => (
                  <Link key={item.name} href={item.href} onClick={closeMobileMenu}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`text-left py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer ${
                        isActiveRoute(item.href)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {item.name}
                    </motion.div>
                  </Link>
                ))}

                {/* Developer Mobile Menu */}
                {canManageProjects && (
                  <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                    <Link href="/projects/create" onClick={closeMobileMenu}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-left py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer text-primary hover:text-primary/80 hover:bg-primary/10"
                      >
                        + Add New Project
                      </motion.div>
                    </Link>
                    {isAdmin && (
                      <Link href="/admin/projects" onClick={closeMobileMenu}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                          className="text-left py-2 px-4 rounded-lg transition-colors duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          Manage Projects
                        </motion.div>
                      </Link>
                    )}
                  </div>
                )}

                <div className="flex flex-col space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    {mounted && (
                      <motion.button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors duration-200"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        aria-label="Toggle theme"
                      >
                        {theme === "dark" ? (
                          <Sun className="h-4 w-4 text-foreground" />
                        ) : (
                          <Moon className="h-4 w-4 text-foreground" />
                        )}
                      </motion.button>
                    )}

                    <AuthButton />
                  </div>

                  <Link href="/contact" onClick={closeMobileMenu}>
                    <motion.button
                      className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Hire Me
                    </motion.button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

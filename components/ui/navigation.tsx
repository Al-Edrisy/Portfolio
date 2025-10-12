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
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up')
  const [lastScrollY, setLastScrollY] = useState(0)
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

  // Enhanced scroll behavior - hide on scroll down, show on scroll up
  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          const scrollDifference = Math.abs(currentScrollY - lastScrollY)
          
          // Only trigger if scroll difference is significant (prevents jitter)
          if (scrollDifference > 5) {
            // Determine scroll direction - only hide after scrolling past 150px
            if (currentScrollY > lastScrollY && currentScrollY > 150) {
              setScrollDirection('down')
            } else if (currentScrollY < lastScrollY) {
              setScrollDirection('up')
            }
            
            setLastScrollY(currentScrollY)
          }
          
          // Set scrolled state for backdrop
          setIsScrolled(currentScrollY > 20)
          
          // Close mobile menu on scroll down
          if (isMobileMenuOpen && currentScrollY > lastScrollY) {
            setIsMobileMenuOpen(false)
          }
          
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY, isMobileMenuOpen])

  const isActiveRoute = (href: string) => {
    return pathname === href
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-sm" 
          : "bg-transparent"
      }`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ 
        opacity: 1,
        y: scrollDirection === 'down' && isScrolled && !isMobileMenuOpen ? -100 : 0 
      }}
      transition={{ 
        opacity: { duration: 0.3 },
        y: { duration: 0.4, ease: "easeInOut" }
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18 lg:h-20">
          {/* Logo - Improved touch target */}
          <Link href="/" className="flex-shrink-0 -ml-2 md:ml-0">
            <motion.div
              className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground hover:text-primary transition-colors duration-200 px-2 py-1 rounded-md"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Al-Edrisy
            </motion.div>
          </Link>

          {/* Desktop Navigation - Centered with improved spacing */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-8">
            <div className="flex items-center space-x-2">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    className={`relative px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg ${
                      isActiveRoute(item.href)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {item.name}
                    {isActiveRoute(item.href) && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            {mounted && canManageProjects && (
              <div className="flex items-center gap-1 mr-1">
                <Link href="/projects/create">
                  <motion.button
                    className="px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200 border border-primary/30 hover:border-primary/50 rounded-md hover:bg-primary/5"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    + Project
                  </motion.button>
                </Link>
                {isAdmin && (
                  <Link href="/admin/projects">
                    <motion.button
                      className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 hover:bg-accent/50 rounded-md"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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
                className="p-2 rounded-md hover:bg-accent/50 transition-colors duration-200"
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

            {mounted && <AuthButton />}

            <Link href="/contact">
              <motion.button
                className="ml-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Hire Me
              </motion.button>
            </Link>
          </div>

          {/* Mobile menu button - Improved touch target */}
          <motion.button
            className="lg:hidden p-3 -mr-2 text-foreground rounded-lg hover:bg-accent transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <div className="w-5 h-5 flex flex-col justify-center items-center gap-1">
              <motion.span
                animate={{
                  rotate: isMobileMenuOpen ? 45 : 0,
                  y: isMobileMenuOpen ? 4 : 0,
                }}
                className="w-5 h-0.5 bg-current rounded-full"
                transition={{ duration: 0.2 }}
              />
              <motion.span
                animate={{
                  opacity: isMobileMenuOpen ? 0 : 1,
                  scale: isMobileMenuOpen ? 0 : 1,
                }}
                className="w-5 h-0.5 bg-current rounded-full"
                transition={{ duration: 0.2 }}
              />
              <motion.span
                animate={{
                  rotate: isMobileMenuOpen ? -45 : 0,
                  y: isMobileMenuOpen ? -4 : 0,
                }}
                className="w-5 h-0.5 bg-current rounded-full"
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden bg-background/95 backdrop-blur-lg border-t border-border/50"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
              {/* Navigation Links */}
              <div className="space-y-1 mb-4">
                {navItems.map((item, index) => (
                  <Link key={item.name} href={item.href} onClick={closeMobileMenu}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className={`relative text-left py-3 px-4 rounded-md transition-colors duration-200 ${
                        isActiveRoute(item.href)
                          ? "text-primary bg-primary/10 font-medium"
                          : "text-foreground hover:bg-accent/50"
                      }`}
                    >
                      {item.name}
                      {isActiveRoute(item.href) && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                      )}
                    </motion.div>
                  </Link>
                ))}
              </div>

              {/* Developer Actions */}
              {mounted && canManageProjects && (
                <div className="space-y-1 py-3 border-t border-border/50">
                  <Link href="/projects/create" onClick={closeMobileMenu}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.2 }}
                      className="text-left py-3 px-4 rounded-md transition-colors duration-200 text-primary hover:bg-primary/10 font-medium"
                    >
                      + Add New Project
                    </motion.div>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin/projects" onClick={closeMobileMenu}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25, duration: 0.2 }}
                        className="text-left py-3 px-4 rounded-md transition-colors duration-200 text-foreground hover:bg-accent/50"
                      >
                        Manage Projects
                      </motion.div>
                    </Link>
                  )}
                </div>
              )}

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-border/50 space-y-3">
                <div className="flex items-center justify-between px-4">
                  <span className="text-sm text-muted-foreground">Theme</span>
                  {mounted && (
                    <motion.button
                      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                      className="p-2 rounded-md hover:bg-accent/50 transition-colors duration-200"
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
                </div>

                {mounted && (
                  <div className="px-4">
                    <AuthButton />
                  </div>
                )}

                <div className="px-4">
                  <Link href="/contact" onClick={closeMobileMenu}>
                    <motion.button
                      className="w-full px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors duration-200 shadow-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
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
    </motion.header>
  )
}

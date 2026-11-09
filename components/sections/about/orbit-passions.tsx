"use client"

import { motion, useReducedMotion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { passions } from "@/constants/profile"
import { Reveal } from "./reveal"
import { SectionShell } from "./section-shell"

/**
 * Restored from the original About page: a developer at the centre with the things
 * that fill his life orbiting around him. Rebuilt so it fits any screen (the old
 * version was a fixed 24rem box with negative offsets that overflowed phones), is
 * readable by screen readers through the legend, and respects reduced motion.
 */

const ORBIT_RADIUS = 42 // % of the container, keeps every bubble inside the box

const bubbles = passions.map((passion, index) => {
  // Start at 12 o'clock and step 60° clockwise.
  const angle = (-90 + index * 60) * (Math.PI / 180)
  return {
    ...passion,
    left: 50 + ORBIT_RADIUS * Math.cos(angle),
    top: 50 + ORBIT_RADIUS * Math.sin(angle),
  }
})

export default function OrbitPassions() {
  const reduceMotion = useReducedMotion()

  return (
    <SectionShell
      id="outside-the-terminal"
      eyebrow="Beyond the code"
      title="Outside the terminal."
      description="Sport, swimming, conversation, podcasts and prayer keep the work grounded. They are part of how problems get solved, not a separate life."
    >
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <ul aria-label="Interests" className="flex flex-wrap gap-2">
            {passions.map(({ emoji, label }) => (
              <li key={label}>
                <Badge variant="outline" className="gap-2 rounded-full px-3 py-1.5 text-sm font-normal">
                  <span aria-hidden>{emoji}</span>
                  {label}
                </Badge>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.08} className="order-1 lg:order-2">
          <div
            aria-hidden
            className="relative mx-auto aspect-square w-full max-w-[22rem] sm:max-w-[26rem]"
          >
            {/* Orbit path */}
            <div className="absolute inset-[8%] rounded-full border border-dashed border-border" />

            {/* Centre character */}
            <motion.div
              className="absolute inset-0 grid place-items-center text-7xl sm:text-8xl"
              initial={reduceMotion ? false : { opacity: 0, transform: "scale(0.9)" }}
              whileInView={{ opacity: 1, transform: "scale(1)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              👨‍💻
            </motion.div>

            {/* Orbiting interests */}
            {bubbles.map((bubble, index) => (
              <div
                key={bubble.label}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${bubble.left}%`, top: `${bubble.top}%` }}
              >
                <motion.div
                  className="group relative grid size-14 place-items-center rounded-full border border-border bg-card text-2xl shadow-sm transition-transform duration-200 ease-out hover:scale-110 sm:size-16 sm:text-3xl"
                  initial={reduceMotion ? false : { opacity: 0, transform: "scale(0.9)" }}
                  whileInView={{ opacity: 1, transform: "scale(1)" }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.15 + index * 0.08, ease: [0.23, 1, 0.32, 1] }}
                >
                  <motion.span
                    className="block"
                    animate={reduceMotion ? undefined : { transform: ["translateY(0px)", "translateY(-4px)", "translateY(0px)"] }}
                    transition={{ duration: 5 + index * 0.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {bubble.emoji}
                  </motion.span>
                  <span className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-2.5 py-1 text-xs text-background opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {bubble.label}
                  </span>
                </motion.div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </SectionShell>
  )
}

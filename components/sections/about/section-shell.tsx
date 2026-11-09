import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/** One card recipe for the whole page so radii, borders and padding never drift. */
export const aboutCardClass =
  "gap-0 rounded-2xl border-border/60 bg-card/40 p-6 shadow-none sm:p-8"

interface SectionShellProps {
  id: string
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
  className?: string
}

/**
 * Shared frame for every About section: same vertical rhythm, same header
 * anatomy (eyebrow → h2 → description), labelled landmark and an anchor id for
 * deep links (`/about#working-together`).
 */
export function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: SectionShellProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("scroll-mt-24 border-b border-border/40 py-16 md:py-24", className)}
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-10 max-w-3xl md:mb-14">
          <p className="mb-3 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <span aria-hidden className="size-1.5 rounded-full bg-foreground" />
            {eyebrow}
          </p>
          <h2
            id={`${id}-title`}
            className="text-balance text-2xl font-medium tracking-tight text-foreground sm:text-3xl md:text-4xl"
          >
            {title}
          </h2>
          {description ? (
            <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          ) : null}
        </header>
        {children}
      </div>
    </section>
  )
}

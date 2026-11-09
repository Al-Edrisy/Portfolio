import Link from "next/link"
import { ArrowRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  GITHUB_REPOS_COUNT,
  profile,
  technologyCount,
  yearsOfExperience,
} from "@/constants/profile"

/**
 * Server component on purpose: the h1 and intro are the LCP element, so they ship
 * as plain HTML with no entrance animation and no client JS.
 */
export default function PracticeHero() {
  const stats: { value: string; label: string; href?: string }[] = [
    { value: `${yearsOfExperience()}+`, label: "Years building software" },
    {
      value: String(GITHUB_REPOS_COUNT),
      label: "Public GitHub repositories",
      href: profile.social.github,
    },
    { value: String(technologyCount), label: "Technologies in the stack" },
    { value: "B.Sc.", label: `Software Engineering, ${profile.university.short}` },
  ]

  return (
    <section
      id="practice"
      aria-labelledby="practice-title"
      className="border-b border-border/40 pb-16 pt-8 md:pb-24 md:pt-14"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1.5 font-mono text-xs text-muted-foreground">
          <span aria-hidden className="size-1.5 rounded-full bg-emerald-500" />
          {profile.name} · also known as {profile.alias}
        </p>

        <h1
          id="practice-title"
          className="max-w-4xl text-balance text-3xl font-medium leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
        >
          Salih Ben Otman builds full-stack systems, AI agents and software with craft.
        </h1>

        <p className="mt-6 max-w-3xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-xl">
          A software engineering practice based in {profile.location}, working across web
          platforms, autonomous AI systems and interface design. It partners with founders and
          teams who are inventing something new and need it to work, scale and feel right from the
          first release.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-11 rounded-xl px-6">
            <Link href="/contact" data-cta="hero-start-engagement">
              Start an engagement
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-11 rounded-xl px-6">
            <Link href="/projects" data-cta="hero-see-work">
              See selected work
            </Link>
          </Button>
          <Button asChild size="lg" variant="ghost" className="h-11 rounded-xl px-6">
            <a href={profile.cvHref} download data-cta="hero-download-cv">
              <Download aria-hidden className="size-4" />
              Download CV
            </a>
          </Button>
        </div>

        <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-border/40 pt-10 md:grid-cols-4">
          {stats.map((stat) => {
            const inner = (
              <div className="group/stat flex flex-col-reverse gap-1">
                <dt className="text-xs uppercase tracking-wider text-muted-foreground transition-colors group-hover/stat:text-foreground">
                  {stat.label}
                  {stat.href && (
                    <span
                      aria-hidden
                      className="ml-1 inline-block transition-transform group-hover/stat:-translate-y-0.5 group-hover/stat:translate-x-0.5"
                    >
                      ↗
                    </span>
                  )}
                </dt>
                <dd className="font-mono text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                  {stat.value}
                </dd>
              </div>
            )

            if (stat.href) {
              return (
                <a
                  key={stat.label}
                  href={stat.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${stat.value} ${stat.label} (opens on GitHub in new tab)`}
                  className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  {inner}
                </a>
              )
            }

            return <div key={stat.label}>{inner}</div>
          })}
        </dl>
      </div>
    </section>
  )
}

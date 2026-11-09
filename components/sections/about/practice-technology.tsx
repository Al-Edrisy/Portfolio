import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { technologyCount } from "@/constants/profile"
import { Reveal } from "./reveal"
import { SectionShell, aboutCardClass } from "./section-shell"

const domains = [
  {
    title: "AI & agent systems",
    body: "Multi-model orchestration, tool-calling agents and streaming interfaces.",
    tools: ["OpenAI", "Anthropic Claude", "Google Gemini", "OpenRouter", "LangChain", "Langflow"],
  },
  {
    title: "Frontend craft",
    body: "Accessible, fast interfaces with considered motion and a consistent design system.",
    tools: ["React 19", "Next.js 15", "TypeScript", "Tailwind CSS", "Motion", "GSAP", "Radix UI"],
  },
  {
    title: "Backend & data",
    body: "Typed APIs, resilient data models and edge delivery for media.",
    tools: ["Node.js", "Firebase", "PostgreSQL", "MongoDB", "Cloudflare R2"],
  },
]

export default function PracticeTechnology() {
  return (
    <SectionShell
      id="technology"
      eyebrow="Technology"
      title="AI to move faster. Human judgment to decide."
      description="AI speeds up research, exploration and production. Original thinking, architecture and judgment stay with the engineer, combining the instinct of a traditional practice with the speed of new tools."
    >
      <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
        {domains.map((domain, index) => (
          <li key={domain.title} className="flex">
            <Reveal delay={index * 0.08} className="flex w-full">
              <Card className={`${aboutCardClass} w-full`}>
                <span className="mb-3 block font-mono text-xs text-muted-foreground">
                  0{index + 1}
                </span>
                <h3 className="mb-2 text-lg font-medium text-foreground">{domain.title}</h3>
                <p className="mb-6 min-h-[2.75rem] text-sm leading-relaxed text-muted-foreground">
                  {domain.body}
                </p>
                <ul className="flex flex-wrap gap-1.5 border-t border-border/50 pt-4">
                  {domain.tools.map((tool) => (
                    <li key={tool}>
                      <Badge variant="secondary" className="font-mono text-[11px] font-normal">
                        {tool}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>

      <Reveal className="mt-6">
        <Card
          className={`${aboutCardClass} flex-col items-start justify-between gap-4 bg-muted/20 p-5 sm:flex-row sm:items-center sm:p-6`}
        >
          <p className="text-sm text-muted-foreground">
            The full inventory of {technologyCount} languages, frameworks and platforms lives on
            the skills page.
          </p>
          <Button asChild variant="outline" className="h-11 shrink-0 rounded-xl">
            <Link href="/skills" data-cta="technology-view-skills">
              View skills
              <ArrowUpRight aria-hidden className="size-4" />
            </Link>
          </Button>
        </Card>
      </Reveal>
    </SectionShell>
  )
}

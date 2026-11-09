import Link from "next/link"
import { ArrowRight, Bot, Check, Globe, Palette, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Reveal } from "./reveal"
import { SectionShell, aboutCardClass } from "./section-shell"

const disciplines: {
  icon: LucideIcon
  title: string
  summary: string
  points: string[]
}[] = [
  {
    icon: Globe,
    title: "Full-stack web",
    summary: "Platforms that bring product, data and interface together.",
    points: [
      "Next.js App Router with server components",
      "Typed APIs and validated inputs",
      "Firestore, PostgreSQL and MongoDB data models",
      "Edge-cached media and fast first loads",
    ],
  },
  {
    icon: Bot,
    title: "AI & agent systems",
    summary: "Agents and LLM workflows that solve concrete problems.",
    points: [
      "Multi-model routing across OpenAI, Claude and Gemini",
      "Tool-calling agents with LangChain and Langflow",
      "Streaming responses and structured output",
      "Guardrails, rate limits and content filtering",
    ],
  },
  {
    icon: Palette,
    title: "UI/UX engineering",
    summary: "Interfaces with character, built to be used.",
    points: [
      "Design tokens and a consistent component system",
      "Considered motion with Motion and GSAP",
      "Accessible Radix and shadcn/ui primitives",
      "Responsive from phone to tablet to desktop",
    ],
  },
]

export default function PracticeDisciplines() {
  return (
    <SectionShell
      id="working-together"
      eyebrow="Working together"
      title="One discipline or all three, shaped around what needs to be made."
      description="Engagements can focus on a single discipline or combine several. Scope, deliverables and timeline are agreed up front so you know what you are getting and when."
    >
      <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
        {disciplines.map(({ icon: Icon, title, summary, points }, index) => (
          <li key={title} className="flex">
            <Reveal delay={index * 0.08} className="flex w-full">
              <Card className={`${aboutCardClass} w-full`}>
                <span
                  aria-hidden
                  className="mb-5 grid size-10 place-items-center rounded-lg border border-border/60 bg-muted/50"
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mb-1 text-xl font-medium text-foreground">{title}</h3>
                <p className="mb-5 text-sm text-muted-foreground">{summary}</p>
                <ul className="space-y-2.5 text-sm text-foreground/80">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                      <span>{point}</span>
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
          className={`${aboutCardClass} flex-col items-start justify-between gap-5 bg-muted/20 p-5 sm:flex-row sm:items-center sm:p-6`}
        >
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Every project is different, so pricing is tailored to scope and complexity. Share what
            you are building and you will get a clear scope and timeline before any work starts.
          </p>
          <Button asChild className="h-11 shrink-0 rounded-xl px-6">
            <Link href="/contact" data-cta="disciplines-start-engagement">
              Start an engagement
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </Button>
        </Card>
      </Reveal>
    </SectionShell>
  )
}

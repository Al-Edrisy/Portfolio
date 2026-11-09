import { Boxes, ClipboardCheck, Zap, type LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Reveal } from "./reveal"
import { SectionShell, aboutCardClass } from "./section-shell"

const pillars: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Zap,
    title: "Working software, early",
    body: "Projects move quickly from first conversations into focused prototypes, so everyone has something tangible to respond to instead of a description of it.",
  },
  {
    icon: Boxes,
    title: "Clean architecture",
    body: "Clear layers, strict TypeScript contracts and validated boundaries from database to interface, so a system can keep growing without turning into a rewrite.",
  },
  {
    icon: ClipboardCheck,
    title: "Progress you can verify",
    body: "Check-ins follow meaningful progress rather than arbitrary milestones. Less time on process, more time building and refining in context.",
  },
]

export default function PracticeApproach() {
  return (
    <SectionShell
      id="approach"
      eyebrow="Approach"
      title="A practical, organic way of working."
      description="Strong ideas are developed and refined in context. The aim is a short path between a conversation and something real you can use."
    >
      <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
        {pillars.map(({ icon: Icon, title, body }, index) => (
          <li key={title} className="flex">
            <Reveal delay={index * 0.08} className="flex w-full">
              <Card className={`${aboutCardClass} w-full`}>
                <span
                  aria-hidden
                  className="mb-5 grid size-10 place-items-center rounded-lg border border-border/60 bg-muted/50"
                >
                  <Icon className="size-5" />
                </span>
                <h3 className="mb-2 text-lg font-medium text-foreground">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
              </Card>
            </Reveal>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}

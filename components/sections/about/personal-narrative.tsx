import Image from "next/image"
import { GraduationCap, MapPin, Rocket } from "lucide-react"
import { Card } from "@/components/ui/card"
import {
  PROJECTS_SHIPPED,
  profile,
  yearsOfExperience,
} from "@/constants/profile"
import { Reveal } from "./reveal"
import { SectionShell, aboutCardClass } from "./section-shell"

export default function PersonalNarrative() {
  const facts = [
    { icon: MapPin, label: "Based in", value: profile.location },
    {
      icon: GraduationCap,
      label: "Studying",
      value: `${profile.university.degree}, ${profile.university.short}`,
    },
    { icon: Rocket, label: "Shipped", value: `${PROJECTS_SHIPPED} projects` },
  ]

  return (
    <SectionShell
      id="about-salih"
      eyebrow="About"
      title="About Salih Ben Otman"
    >
      <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="space-y-5 lg:col-span-5">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted">
            <Image
              src="/me.jpg"
              alt={`Portrait of ${profile.name}`}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover object-top"
            />
          </div>

          <Card className={`${aboutCardClass} p-5 sm:p-5`}>
            <dl className="space-y-3 text-sm">
              {facts.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Icon aria-hidden className="size-4" />
                    {label}
                  </dt>
                  <dd className="text-right text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-7">
          <div className="space-y-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              {profile.name}, also known as{" "}
              <strong className="font-medium text-foreground">{profile.alias}</strong>, is a
              Software &amp; AI Systems Engineer based in {profile.location}. He studies at{" "}
              <strong className="font-medium text-foreground">{profile.university.name}</strong>{" "}
              and has spent over {yearsOfExperience()} years building full-stack applications and
              intelligent systems.
            </p>
            <p>
              His engineering philosophy is rooted in{" "}
              <strong className="font-medium text-foreground">Clean Architecture</strong>,
              type safety and modular design: backend robustness meeting careful frontend
              execution, from high-throughput APIs to fluid micro-interactions.
            </p>
            <p>
              Recently his focus has been{" "}
              <strong className="font-medium text-foreground">
                agentic AI and LLM orchestration
              </strong>
              , using Langflow, LangChain and fine-tuned models to build autonomous agents and
              workflows that solve tangible, real-world problems.
            </p>
            <p>
              He also keeps his fundamentals sharp through algorithm practice on LeetCode and
              continuous learning, which shows up in how he designs data models and systems.
            </p>
          </div>
        </Reveal>
      </div>
    </SectionShell>
  )
}

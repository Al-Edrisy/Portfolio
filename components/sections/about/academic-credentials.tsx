import Image from "next/image"
import { Download, ExternalLink, Github, Linkedin, Code2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { certifications, profile } from "@/constants/profile"
import { Reveal } from "./reveal"
import { SectionShell, aboutCardClass } from "./section-shell"

const links = [
  { label: "GitHub", handle: "@Al-Edrisy", href: profile.social.github, icon: Github, external: true },
  { label: "LinkedIn", handle: profile.name, href: profile.social.linkedin, icon: Linkedin, external: true },
  { label: "LeetCode", handle: "@salehfree33", href: profile.social.leetcode, icon: Code2, external: true },
  { label: "Email", handle: profile.email, href: `mailto:${profile.email}`, icon: Mail, external: false },
]

export default function AcademicCredentials() {
  const { university } = profile

  return (
    <SectionShell
      id="credentials"
      eyebrow="Credentials"
      title="Education, certifications and public profiles."
      className="border-b-0"
    >
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        <Reveal className="flex">
          <Card className={`${aboutCardClass} w-full justify-between`}>
            <div>
              <div className="mb-6 flex items-center gap-4">
                <span className="grid size-14 shrink-0 place-items-center rounded-xl border border-border/60 bg-white p-2">
                  <Image
                    src="/university-logo.png"
                    alt={`${university.name} logo`}
                    width={40}
                    height={40}
                    className="size-10 object-contain"
                  />
                </span>
                <div>
                  <h3 className="text-lg font-medium text-foreground">{university.name}</h3>
                  <p className="text-sm text-muted-foreground">{university.city}</p>
                </div>
              </div>

              <dl className="mb-6 space-y-3 text-sm">
                {[
                  ["Degree", university.degree],
                  ["Period", university.period],
                  ["Focus", university.focus],
                  ["Institutional email", university.email],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-col gap-0.5 border-b border-border/40 pb-3 last:border-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-4"
                  >
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="text-foreground sm:text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <Button asChild variant="outline" className="h-11 w-full rounded-xl">
              <a href={profile.cvHref} download data-cta="credentials-download-cv">
                <Download aria-hidden className="size-4" />
                Download CV (PDF)
              </a>
            </Button>
          </Card>
        </Reveal>

        <Reveal delay={0.08} className="flex">
          <Card className={`${aboutCardClass} w-full`}>
            <h3 className="mb-6 text-lg font-medium text-foreground">Professional certifications</h3>
            <ul className="space-y-5">
              {certifications.map((cert) => (
                <li key={cert.title} className="flex gap-4">
                  <span
                    aria-hidden
                    className="grid size-11 shrink-0 place-items-center rounded-xl border border-border/60 bg-muted/50 text-xl"
                  >
                    {cert.emoji}
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-medium text-foreground">{cert.title}</h4>
                    <p className="text-sm text-muted-foreground">{cert.instructor}</p>
                    <p className="text-sm text-muted-foreground">{cert.detail}</p>
                    {"completed" in cert ? (
                      <p className="text-sm text-muted-foreground">{cert.completed}</p>
                    ) : null}
                    {"href" in cert ? (
                      <a
                        href={cert.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        View certificate
                        <ExternalLink aria-hidden className="size-3.5" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>

      <Reveal className="mt-6">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {links.map(({ label, handle, href, icon: Icon, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                data-cta={`credentials-${label.toLowerCase()}`}
                className="flex min-h-14 items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-sm transition-colors duration-150 hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Icon aria-hidden className="size-5 shrink-0" />
                <span className="min-w-0">
                  <span className="block font-medium text-foreground">{label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{handle}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </SectionShell>
  )
}

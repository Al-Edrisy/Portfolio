import Link from "next/link"
import { ArrowRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { profile } from "@/constants/profile"
import { Reveal } from "./reveal"

/**
 * Closing call to action. Heat-map studies consistently show visitors who finish a
 * long page have no next step, so the page ends on one primary action, repeating the
 * exact label used in the hero ("Start an engagement") for consistency.
 */
export default function ClosingCta() {
  return (
    <section
      id="contact-cta"
      aria-labelledby="contact-cta-title"
      className="scroll-mt-24 py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <Card className="items-start gap-0 rounded-3xl border-border/60 bg-muted/30 p-8 shadow-none sm:p-12">
            <h2
              id="contact-cta-title"
              className="max-w-2xl text-balance text-2xl font-medium tracking-tight text-foreground sm:text-4xl"
            >
              Have something new to build?
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              Share what you are making and get a clear scope and timeline before any work starts.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-11 rounded-xl px-6">
                <Link href="/contact" data-cta="closing-start-engagement">
                  Start an engagement
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 rounded-xl px-6">
                <a href={`mailto:${profile.email}`} data-cta="closing-email">
                  Email {profile.email}
                </a>
              </Button>
              <Button asChild size="lg" variant="ghost" className="h-11 rounded-xl px-6">
                <a href={profile.cvHref} download data-cta="closing-download-cv">
                  <Download aria-hidden className="size-4" />
                  Download CV
                </a>
              </Button>
            </div>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}

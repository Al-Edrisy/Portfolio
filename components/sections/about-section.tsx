import PracticeHero from "./about/practice-hero"
import PracticeApproach from "./about/practice-approach"
import PracticeTechnology from "./about/practice-technology"
import VideoShowcase from "./about/video-showcase"
import PracticeDisciplines from "./about/practice-disciplines"
import PersonalNarrative from "./about/personal-narrative"
import OrbitPassions from "./about/orbit-passions"
import AcademicCredentials from "./about/academic-credentials"
import ClosingCta from "./about/closing-cta"

/**
 * Story order (mirrors how a client decides): who → how → with what → proof by
 * demo → how to engage → the person → life beyond code → credentials → next step.
 * Server component; only the interactive pieces (video, orbit, reveals) are client.
 */
export default function AboutSection() {
  return (
    <div className="bg-background text-foreground antialiased">
      <PracticeHero />
      <PracticeApproach />
      <PracticeTechnology />
      <VideoShowcase />
      <PracticeDisciplines />
      <PersonalNarrative />
      <OrbitPassions />
      <AcademicCredentials />
      <ClosingCta />
    </div>
  )
}

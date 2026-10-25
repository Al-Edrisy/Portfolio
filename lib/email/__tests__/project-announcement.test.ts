import { describe, it, expect } from 'vitest'
import {
  DEFAULT_EMAIL_TEMPLATES,
  PROJECT_ANNOUNCEMENT_TEMPLATE_IDS,
  buildProjectTemplateVariables,
  evaluateDeliverabilityHealth,
  renderEmailForRecipient
} from '../template-engine'
import { resolveRecipients, normalizeEmail } from '../recipient-resolver'

describe('Project Publish Announcement & Anti-Slop Templates', () => {
  const sampleProject = {
    id: 'proj_distributed_queue',
    title: 'Idempotent Distributed Queue Engine',
    slug: 'idempotent-distributed-queue-engine',
    description:
      'High-throughput event processing engine with SHA-256 content-hash deduplication and bounded retry workers.',
    challenges:
      'Webhook bursts caused race conditions and duplicate downstream state mutations under concurrent load.',
    solutions:
      'Implemented deterministic content hashing and exponential backoff queues in TypeScript and Next.js.',
    results: 'Eliminated duplicate dispatches across 50,000+ events with sub-35ms p95 latency.',
    tech: ['Next.js 15', 'TypeScript', 'PostgreSQL', 'Redis'],
    categories: ['Systems Architecture', 'Backend Engineering'],
    link: 'https://queue.salihbenotman.dev',
    github: 'https://github.com/Al-Edrisy/Portfolio',
    authorName: 'Salih Ben Otman'
  }

  it('builds complete, deterministic project template variables without undefined values', () => {
    const vars = buildProjectTemplateVariables(sampleProject)
    expect(vars.project_title).toBe('Idempotent Distributed Queue Engine')
    expect(vars.project_category).toBe('Systems Architecture · Backend Engineering')
    expect(vars.project_tech).toBe('Next.js 15, TypeScript, PostgreSQL, Redis')
    expect(vars.project_url).toBe('https://salihbenotman.dev/projects/proj_distributed_queue')
    expect(vars.project_challenge).toContain('Webhook bursts')
    expect(vars.project_solution).toContain('deterministic content hashing')
    expect(vars.project_results).toContain('Eliminated duplicate dispatches')

    for (const [key, value] of Object.entries(vars)) {
      expect(value, `Variable ${key} should be defined and non-empty`).toBeTruthy()
      expect(value).not.toContain('undefined')
    }
  })

  it('includes all 3 anti-slop project announcement templates and achieves 100/100 deliverability health', () => {
    const projectVars = buildProjectTemplateVariables(sampleProject)

    for (const templateId of PROJECT_ANNOUNCEMENT_TEMPLATE_IDS) {
      const tpl = DEFAULT_EMAIL_TEMPLATES.find(t => t.id === templateId)
      expect(tpl, `Template ${templateId} must exist`).toBeDefined()
      expect(tpl!.category).toBe('project_release')

      const rendered = renderEmailForRecipient({
        subjectTemplate: tpl!.subject,
        htmlTemplate: tpl!.htmlBody,
        textTemplate: tpl!.textBody,
        globalVariables: projectVars,
        recipientVariables: {
          first_name: 'Elena',
          recipient_name: 'Elena Rostova',
          recipient_email: 'elena@example.com'
        }
      })

      expect(rendered.missingPlaceholders).toEqual([])
      expect(rendered.subject).toContain('Idempotent Distributed Queue Engine')
      expect(rendered.html).toContain('Hi Elena')
      expect(rendered.text).toContain('Hi Elena')
      expect(rendered.text).toContain('https://salihbenotman.dev/projects/proj_distributed_queue')

      const health = evaluateDeliverabilityHealth({
        subject: rendered.subject,
        textBody: rendered.text,
        htmlBody: rendered.html
      })

      expect(health.spamTriggersFound).toEqual([])
      expect(health.linkCount).toBeLessThanOrEqual(2)
      expect(health.plainTextRatio).toBeGreaterThanOrEqual(80)
      expect(health.score).toBe(100)
    }
  })

  it('flags spam/hype trigger words and excessive links in deliverability health checks', () => {
    const badHealth = evaluateDeliverabilityHealth({
      subject: '100% Free Revolutionary Game-Changer — Act Now!',
      textBody:
        'Click here: https://a.com https://b.com https://c.com https://d.com',
      htmlBody:
        '<a href="https://a.com">1</a><a href="https://b.com">2</a><a href="https://c.com">3</a><a href="https://d.com">4</a>'
    })

    expect(badHealth.spamTriggersFound).toEqual(
      expect.arrayContaining(['free', 'act now', 'click here', 'revolutionary', 'game-changer'])
    )
    expect(badHealth.linkCount).toBe(4)
    expect(badHealth.score).toBeLessThan(50)
    expect(badHealth.warnings.length).toBeGreaterThanOrEqual(2)
  })

  it('pre-selects eligible registered users and allows toggling contacts & individual exclusions', () => {
    const registeredUsers = [
      { id: 'u1', email: 'alice@example.com', name: 'Alice', unsubscribed: false },
      { id: 'u2', email: 'bob@example.com', name: 'Bob', unsubscribed: true },
      { id: 'u3', email: 'carol@example.com', name: 'Carol', unsubscribed: false }
    ]
    const pastContacts = [
      { id: 'c1', email: 'dave@client.org', name: 'Dave', unsubscribed: false },
      { id: 'c2', email: 'alice@example.com', name: 'Alice Duplicate', unsubscribed: false }
    ]

    // Default: only registeredUsers enabled, bob is unsubscribed
    const defaultSummary = resolveRecipients({
      dbUsers: registeredUsers,
      selectAllEligible: true
    })
    expect(defaultSummary.validCount).toBe(2)
    expect(defaultSummary.unsubscribedCount).toBe(1)
    expect(defaultSummary.validRecipients.map(r => r.email)).toEqual([
      'alice@example.com',
      'carol@example.com'
    ])

    // Toggling pastContacts ON + excluding carol@example.com + adding 1 manual email
    const suppressed = new Set([normalizeEmail('carol@example.com')])
    const combinedSummary = resolveRecipients({
      dbUsers: [...registeredUsers, ...pastContacts],
      selectAllEligible: true,
      manualInput: 'frank@partner.io',
      suppressedEmails: suppressed
    })

    expect(combinedSummary.validRecipients.map(r => r.email)).toEqual([
      'alice@example.com',
      'dave@client.org',
      'frank@partner.io'
    ])
    expect(combinedSummary.duplicateCount).toBe(1) // alice@example.com deduplicated across users & contacts
  })
})

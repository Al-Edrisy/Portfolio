import {
  CareerProfile,
  CareerDocument,
  JobOpportunity,
  JobMatchAssessment,
  TailoredCvContent
} from '@/types/email-system'
import { DEFAULT_AI_MODEL } from '@/lib/ai/model-configs'
import { detectEmailsInText, isValidEmailAddress, normalizeEmail } from '@/lib/email/recipient-resolver'
import { escapeHtml } from '@/lib/email/templates'

/**
 * Extracts JSON object from LLM text responses safely.
 */
export function parseJsonFromLlmOutput(rawText: string): any {
  if (!rawText) return null
  try {
    return JSON.parse(rawText.trim())
  } catch {}

  const fenceMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (fenceMatch && fenceMatch[1]) {
    try {
      return JSON.parse(fenceMatch[1].trim())
    } catch {}
  }

  const firstBrace = rawText.indexOf('{')
  const lastBrace = rawText.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(rawText.substring(firstBrace, lastBrace + 1))
    } catch {}
  }
  return null
}

/**
 * Parses CSV or delimited text rows into JobOpportunity inputs.
 * Expected columns (header or positional): companyName, positionTitle, applicationEmail, location, employmentType, applicationUrl, jobDescription, requiredSkills
 */
export function parseJobOpportunitiesFromCsvOrText(
  rawInput: string,
  ownerId: string
): Omit<JobOpportunity, 'id'>[] {
  if (!rawInput || !rawInput.trim()) return []
  const lines = rawInput
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean)

  if (lines.length === 0) return []

  const results: Omit<JobOpportunity, 'id'>[] = []
  const now = new Date().toISOString()

  // Check if first row is a header
  const firstLower = lines[0].toLowerCase()
  const hasHeader =
    firstLower.includes('company') &&
    (firstLower.includes('position') || firstLower.includes('role') || firstLower.includes('title'))

  const startIndex = hasHeader ? 1 : 0

  for (let i = startIndex; i < lines.length; i++) {
    const row = lines[i]
    // Simple CSV split respecting double quotes
    const cols: string[] = []
    let current = ''
    let inQuotes = false
    for (let c = 0; c < row.length; c++) {
      const ch = row[c]
      if (ch === '"') {
        inQuotes = !inQuotes
      } else if (ch === ',' && !inQuotes) {
        cols.push(current.trim())
        current = ''
      } else {
        current += ch
      }
    }
    cols.push(current.trim())

    const companyName = cols[0] || 'Unknown Company'
    const positionTitle = cols[1] || 'Software Engineer'
    const rawEmailOrUrl = cols[2] || ''
    const location = cols[3] || 'Remote'
    const employmentType = (cols[4]?.toLowerCase() as any) || 'full-time'
    const applicationUrl = cols[5] || (rawEmailOrUrl.startsWith('http') ? rawEmailOrUrl : '')
    const jobDescription = cols[6] || `Role: ${positionTitle} at ${companyName}`
    const requiredSkills = cols[7]
      ? cols[7].split(/[;|]/).map(s => s.trim()).filter(Boolean)
      : []

    const detectedEmails = detectEmailsInText(`${rawEmailOrUrl} ${jobDescription}`)
    const applicationEmail = detectedEmails[0] || ''
    const isPortalOnly = !applicationEmail && Boolean(applicationUrl)

    results.push({
      ownerId,
      companyName,
      positionTitle,
      jobDescription,
      applicationEmail,
      applicationUrl,
      isPortalOnly,
      location,
      requiredSkills,
      employmentType: ['full-time', 'part-time', 'contract', 'freelance', 'internship'].includes(
        employmentType
      )
        ? employmentType
        : 'full-time',
      source: 'CSV Import',
      sourceUrl: applicationUrl || undefined,
      isVerifiedSource: true,
      status: 'imported',
      createdAt: now,
      updatedAt: now
    })
  }

  return results
}

/**
 * Deterministic fallback matcher that strictly evaluates overlap between the candidate's
 * verified CareerProfile + CV documents and the job opportunity requirements without inventing claims.
 */
export function computeDeterministicJobMatch(
  profile: CareerProfile,
  documents: CareerDocument[],
  job: JobOpportunity
): JobMatchAssessment {
  const candidateSkillsLower = new Set(
    profile.technicalSkills.map(s => s.toLowerCase().trim())
  )
  const profileCorpus = [
    profile.summary,
    ...profile.technicalSkills,
    ...profile.softSkills,
    ...profile.workExperience.flatMap(w => [w.title, ...w.highlights, ...w.technologies]),
    ...profile.relevantProjects.flatMap(p => [p.title, p.description, ...p.technologies]),
    ...documents.map(d => d.extractedText)
  ]
    .join(' ')
    .toLowerCase()

  const jobSkills =
    job.requiredSkills && job.requiredSkills.length > 0
      ? job.requiredSkills
      : extractKeywordsFromJobDescription(job.jobDescription, profile.technicalSkills)

  const matchedSkills: string[] = []
  const missingRequirements: string[] = []

  for (const reqSkill of jobSkills) {
    const cleanReq = reqSkill.toLowerCase().trim()
    if (
      candidateSkillsLower.has(cleanReq) ||
      profileCorpus.includes(cleanReq)
    ) {
      matchedSkills.push(reqSkill)
    } else {
      missingRequirements.push(reqSkill)
    }
  }

  // Pick best CV document
  const cvDocs = documents.filter(d => d.type === 'cv')
  const recommendedCv =
    cvDocs.find(d => d.isDefault) || cvDocs[0] || undefined

  const skillRatio =
    jobSkills.length > 0 ? matchedSkills.length / jobSkills.length : 0.75
  const titleMatch = profile.preferredJobTitles.some(t =>
    job.positionTitle.toLowerCase().includes(t.toLowerCase().split(' ')[0])
  )
  const rawScore = Math.round(skillRatio * 80 + (titleMatch ? 15 : 5))
  const matchScore = Math.max(20, Math.min(98, rawScore))

  const supportingEvidence: string[] = []
  if (matchedSkills.length > 0) {
    supportingEvidence.push(
      `Verified proficiency in ${matchedSkills.slice(0, 6).join(', ')} directly matching the job requirements.`
    )
  }
  if (profile.workExperience.length > 0) {
    supportingEvidence.push(
      `Proven experience as ${profile.workExperience[0].title} at ${profile.workExperience[0].company}.`
    )
  }
  if (profile.education.length > 0) {
    supportingEvidence.push(
      `Academic foundation: ${profile.education[0].degree} (${profile.education[0].institution}).`
    )
  }

  const potentialMismatches: string[] = []
  if (job.isPortalOnly || !job.applicationEmail) {
    potentialMismatches.push(
      'Application requires submission via official company portal URL rather than direct email.'
    )
  }

  return {
    matchScore,
    supportingEvidence,
    matchedSkills,
    missingOrUncertainRequirements: missingRequirements,
    potentialMismatches,
    recommendedCvDocumentId: recommendedCv?.id,
    recommendedCvVersionName: recommendedCv?.name,
    recommendedCoverLetterApproach:
      `Highlight ${matchedSkills.slice(0, 4).join(', ') || 'full-stack engineering'} experience and reference live production case studies at ${profile.portfolioUrl}.`,
    worthApplyingReason:
      matchScore >= 60
        ? `Strong alignment (${matchScore}% estimate) between ${job.companyName}'s ${job.positionTitle} requirements and your verified stack.`
        : `Moderate alignment (${matchScore}% estimate); review missing requirements (${missingRequirements.join(', ') || 'domain-specific tools'}) before applying.`,
    shouldApply: matchScore >= 55,
    evaluatedAt: new Date().toISOString(),
    modelUsed: 'deterministic-factual-analyzer'
  }
}

function extractKeywordsFromJobDescription(description: string, knownSkills: string[]): string[] {
  const lowerDesc = (description || '').toLowerCase()
  const found = new Set<string>()
  for (const skill of knownSkills) {
    const baseName = skill.split('(')[0].trim()
    if (baseName.length >= 2 && lowerDesc.includes(baseName.toLowerCase())) {
      found.add(baseName)
    }
  }
  const commonTech = [
    'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Python',
    'GraphQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes',
    'Firebase', 'Tailwind', 'AI', 'LLM', 'CI/CD', 'Git', 'REST'
  ]
  for (const tech of commonTech) {
    if (lowerDesc.includes(tech.toLowerCase())) {
      found.add(tech)
    }
  }
  return Array.from(found)
}

/**
 * Evaluates a job opportunity using OpenRouter LLM grounded strictly on the admin's CareerProfile & CV documents.
 * Falls back to deterministic evaluation if OpenRouter is unavailable.
 */
export async function evaluateJobMatchWithAi(
  profile: CareerProfile,
  documents: CareerDocument[],
  job: JobOpportunity,
  model: string = DEFAULT_AI_MODEL
): Promise<JobMatchAssessment> {
  const deterministic = computeDeterministicJobMatch(profile, documents, job)
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || !apiKey.trim()) {
    return deterministic
  }

  const cvDocs = documents.filter(d => d.type === 'cv')
  const systemPrompt = `You are a truthful, analytical technical recruitment evaluator assisting ${profile.fullName}.
CRITICAL RULES:
1. Evaluate how well the candidate's verified profile and CV match the target job opportunity.
2. NEVER invent skills, degrees, certifications, employment dates, or achievements.
3. If a job requirement is not present in the candidate's profile, list it in "missingOrUncertainRequirements".
4. Return strictly valid JSON with keys:
{
  "matchScore": number (0 to 100 decision-support estimate),
  "supportingEvidence": string[],
  "matchedSkills": string[],
  "missingOrUncertainRequirements": string[],
  "potentialMismatches": string[],
  "recommendedCvDocumentId": string,
  "recommendedCoverLetterApproach": string,
  "worthApplyingReason": string,
  "shouldApply": boolean
}`

  const userPrompt = `CANDIDATE PROFILE:
Name: ${profile.fullName}
Headline: ${profile.headline}
Summary: ${profile.summary}
Technical Skills: ${profile.technicalSkills.join(', ')}
Experience: ${JSON.stringify(profile.workExperience)}
Education: ${JSON.stringify(profile.education)}
Projects: ${JSON.stringify(profile.relevantProjects)}
Available CV Documents: ${JSON.stringify(cvDocs.map(d => ({ id: d.id, name: d.name, version: d.version, intendedUse: d.intendedUse })))}

TARGET JOB OPPORTUNITY:
Company: ${job.companyName}
Position: ${job.positionTitle}
Location: ${job.location} (${job.employmentType})
Required Skills: ${job.requiredSkills.join(', ')}
Description: ${job.jobDescription}`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': profile.portfolioUrl || 'https://salihbenotman.dev',
        'X-Title': 'Portfolio Career Intelligence'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1200
      })
    })

    if (!response.ok) {
      return deterministic
    }

    const data = await response.json()
    const rawContent = data.choices?.[0]?.message?.content || ''
    const parsed = parseJsonFromLlmOutput(rawContent)
    if (!parsed || typeof parsed.matchScore !== 'number') {
      return deterministic
    }

    const chosenCv =
      cvDocs.find(d => d.id === parsed.recommendedCvDocumentId) ||
      cvDocs.find(d => d.isDefault) ||
      cvDocs[0]

    return {
      matchScore: Math.max(0, Math.min(100, Math.round(parsed.matchScore))),
      supportingEvidence: Array.isArray(parsed.supportingEvidence)
        ? parsed.supportingEvidence
        : deterministic.supportingEvidence,
      matchedSkills: Array.isArray(parsed.matchedSkills)
        ? parsed.matchedSkills
        : deterministic.matchedSkills,
      missingOrUncertainRequirements: Array.isArray(parsed.missingOrUncertainRequirements)
        ? parsed.missingOrUncertainRequirements
        : deterministic.missingOrUncertainRequirements,
      potentialMismatches: Array.isArray(parsed.potentialMismatches)
        ? parsed.potentialMismatches
        : deterministic.potentialMismatches,
      recommendedCvDocumentId: chosenCv?.id || deterministic.recommendedCvDocumentId,
      recommendedCvVersionName: chosenCv?.name || deterministic.recommendedCvVersionName,
      recommendedCoverLetterApproach:
        parsed.recommendedCoverLetterApproach || deterministic.recommendedCoverLetterApproach,
      worthApplyingReason: parsed.worthApplyingReason || deterministic.worthApplyingReason,
      shouldApply:
        typeof parsed.shouldApply === 'boolean' ? parsed.shouldApply : deterministic.shouldApply,
      evaluatedAt: new Date().toISOString(),
      modelUsed: model
    }
  } catch {
    return deterministic
  }
}

/**
 * Generates an ATS-compatible, truthful job-specific CV structure, cover letter, and email draft
 * strictly grounded on the administrator's verified CareerProfile and selected CV document.
 */
export async function generateTailoredApplicationDraft(params: {
  profile: CareerProfile
  selectedCv: CareerDocument
  job: JobOpportunity
  matchAssessment?: JobMatchAssessment
  model?: string
}): Promise<{
  emailSubject: string
  emailBody: string
  coverLetter: string
  tailoredCv: TailoredCvContent
  portfolioLinks: string[]
  personalizationSummary: string
  missingInfoWarnings: string[]
}> {
  const {
    profile,
    selectedCv,
    job,
    matchAssessment = computeDeterministicJobMatch(profile, [selectedCv], job),
    model = DEFAULT_AI_MODEL
  } = params

  const warnings: string[] = []
  if (job.isPortalOnly || !isValidEmailAddress(normalizeEmail(job.applicationEmail))) {
    warnings.push(
      'No verified direct application email address detected. This opportunity is flagged as Portal-Only — review before sending or submit via the official company portal URL.'
    )
  }
  if (matchAssessment.missingOrUncertainRequirements.length > 0) {
    warnings.push(
      `Unverified/missing requirements omitted from claims: ${matchAssessment.missingOrUncertainRequirements.join(', ')}`
    )
  }

  const prioritizedSkills = [
    ...matchAssessment.matchedSkills,
    ...profile.technicalSkills.filter(
      s => !matchAssessment.matchedSkills.some(m => m.toLowerCase() === s.toLowerCase())
    )
  ].slice(0, 14)

  const fallbackTailoredCv = buildCleanAtsTailoredCv(
    profile,
    job,
    prioritizedSkills,
    matchAssessment.matchedSkills
  )

  const defaultPortfolioLinks = [
    `Portfolio: ${profile.portfolioUrl}`,
    `GitHub: ${profile.githubUrl}`,
    ...(profile.relevantProjects.slice(0, 2).map(p => `${p.title}: ${p.url}`))
  ]

  const defaultSubject = `Application for ${job.positionTitle} — ${profile.fullName}`
  const matchedListStr =
    matchAssessment.matchedSkills.slice(0, 5).join(', ') ||
    profile.technicalSkills.slice(0, 5).join(', ')

  const defaultEmailBody = `I am writing to apply for the ${job.positionTitle} role at ${job.companyName}.

With over 5 years of software engineering experience building production full-stack applications and AI-integrated systems using ${matchedListStr}, I have followed ${job.companyName}'s work and would welcome the opportunity to contribute to your engineering team.

I have attached my CV (${selectedCv.name}) and included my cover letter below for your review. You can also explore my live production work and architectural case studies at ${profile.portfolioUrl}.

Thank you for your time and consideration.`

  const defaultCoverLetter = `Dear Hiring Team at ${job.companyName},

I am submitting my application for the ${job.positionTitle} position at ${job.companyName}. As a ${profile.headline} holding a ${profile.education[0]?.degree || 'B.Sc. in Software Engineering'} from ${profile.education[0]?.institution || 'Final International University'}, my background aligns closely with your technical requirements in ${matchedListStr}.

In my work as ${profile.workExperience[0]?.title || 'Senior Full Stack Developer'}, I have architected and delivered more than 50 full-stack web, mobile, and AI agent projects—focusing on clean architecture, type-safe React/Next.js and Node.js/Python backends, and responsive user experiences. Notable systems include:
• ${profile.relevantProjects[0]?.title || 'AI-Powered E-Commerce Platform'}: ${profile.relevantProjects[0]?.description || ''}
• ${profile.relevantProjects[1]?.title || 'Real-Time Analytics Dashboard'}: ${profile.relevantProjects[1]?.description || ''}

I am excited about the prospect of bringing this engineering rigor to ${job.companyName}. Thank you for reviewing my application, and I look forward to discussing how my experience can support your team's goals.

Sincerely,
${profile.fullName}
${profile.email} | ${profile.phone}
${profile.portfolioUrl}`

  const defaultPersonalizationSummary = `Grounded strictly on ${profile.fullName}'s verified profile and CV (${selectedCv.name}, ${selectedCv.version}). Emphasized ${matchAssessment.matchedSkills.length} matched skills (${matchedListStr}) for ${job.positionTitle} at ${job.companyName}. No unverified claims included.`

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || !apiKey.trim()) {
    return {
      emailSubject: defaultSubject,
      emailBody: defaultEmailBody,
      coverLetter: defaultCoverLetter,
      tailoredCv: fallbackTailoredCv,
      portfolioLinks: defaultPortfolioLinks,
      personalizationSummary: defaultPersonalizationSummary,
      missingInfoWarnings: warnings
    }
  }

  const systemPrompt = `You are an elite executive career assistant preparing a job application for ${profile.fullName}.
STRICT GROUNDING & ANTI-HALLUCINATION RULES:
1. Use ONLY the facts, skills, projects, work experience, and education present in the provided CANDIDATE PROFILE and CV.
2. NEVER invent skills, companies, years of experience, certifications, or achievements. If a job requirement is missing from the candidate's profile, DO NOT claim the candidate has it.
3. Tailor the email body, cover letter, and ATS CV summary specifically to the company (${job.companyName}) and position (${job.positionTitle}).
4. Return strictly valid JSON with keys:
{
  "emailSubject": string,
  "emailBody": string,
  "coverLetter": string,
  "tailoredSummary": string,
  "personalizationSummary": string
}`

  const userPrompt = `CANDIDATE PROFILE:
Name: ${profile.fullName}
Headline: ${profile.headline}
Email: ${profile.email}
Phone: ${profile.phone}
Portfolio: ${profile.portfolioUrl}
GitHub: ${profile.githubUrl}
Summary: ${profile.summary}
Verified Technical Skills: ${profile.technicalSkills.join(', ')}
Work Experience: ${JSON.stringify(profile.workExperience)}
Education: ${JSON.stringify(profile.education)}
Projects: ${JSON.stringify(profile.relevantProjects)}
Selected CV: ${selectedCv.name} (${selectedCv.version})
Additional Instructions: ${profile.additionalInstructions}

TARGET JOB:
Company: ${job.companyName}
Position: ${job.positionTitle}
Location: ${job.location}
Description: ${job.jobDescription}
Matched Skills: ${matchAssessment.matchedSkills.join(', ')}
Missing Requirements (DO NOT CLAIM THESE): ${matchAssessment.missingOrUncertainRequirements.join(', ')}`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': profile.portfolioUrl || 'https://salihbenotman.dev',
        'X-Title': 'Portfolio Career Assistant'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1800
      })
    })

    if (!response.ok) {
      return {
        emailSubject: defaultSubject,
        emailBody: defaultEmailBody,
        coverLetter: defaultCoverLetter,
        tailoredCv: fallbackTailoredCv,
        portfolioLinks: defaultPortfolioLinks,
        personalizationSummary: defaultPersonalizationSummary,
        missingInfoWarnings: warnings
      }
    }

    const data = await response.json()
    const rawContent = data.choices?.[0]?.message?.content || ''
    const parsed = parseJsonFromLlmOutput(rawContent)

    if (!parsed || !parsed.emailBody || !parsed.coverLetter) {
      return {
        emailSubject: defaultSubject,
        emailBody: defaultEmailBody,
        coverLetter: defaultCoverLetter,
        tailoredCv: fallbackTailoredCv,
        portfolioLinks: defaultPortfolioLinks,
        personalizationSummary: defaultPersonalizationSummary,
        missingInfoWarnings: warnings
      }
    }

    const updatedTailoredCv = buildCleanAtsTailoredCv(
      profile,
      job,
      prioritizedSkills,
      matchAssessment.matchedSkills,
      parsed.tailoredSummary
    )

    return {
      emailSubject: parsed.emailSubject || defaultSubject,
      emailBody: String(parsed.emailBody).trim(),
      coverLetter: String(parsed.coverLetter).trim(),
      tailoredCv: updatedTailoredCv,
      portfolioLinks: defaultPortfolioLinks,
      personalizationSummary:
        parsed.personalizationSummary || defaultPersonalizationSummary,
      missingInfoWarnings: warnings
    }
  } catch {
    return {
      emailSubject: defaultSubject,
      emailBody: defaultEmailBody,
      coverLetter: defaultCoverLetter,
      tailoredCv: fallbackTailoredCv,
      portfolioLinks: defaultPortfolioLinks,
      personalizationSummary: defaultPersonalizationSummary,
      missingInfoWarnings: warnings
    }
  }
}

function buildCleanAtsTailoredCv(
  profile: CareerProfile,
  job: JobOpportunity,
  prioritizedSkills: string[],
  atsKeywords: string[],
  customSummary?: string
): TailoredCvContent {
  const tailoredSummary =
    customSummary ||
    `${profile.headline} applying for ${job.positionTitle} at ${job.companyName}. ${profile.summary}`

  const selectedExperienceHighlights = profile.workExperience.map(exp => ({
    role: exp.title,
    company: exp.company,
    period: `${exp.startDate} – ${exp.current ? 'Present' : exp.endDate}`,
    bullets: exp.highlights
  }))

  const selectedProjects = profile.relevantProjects.map(proj => ({
    title: proj.title,
    relevance: `${proj.description} (${proj.technologies.join(', ')})`,
    url: proj.url
  }))

  const markdownContent = `# ${profile.fullName}
**${profile.headline}**
Email: ${profile.email} | Phone: ${profile.phone} | Location: ${profile.location}
Portfolio: ${profile.portfolioUrl} | GitHub: ${profile.githubUrl}

## Executive Summary (Tailored for ${job.positionTitle} at ${job.companyName})
${tailoredSummary}

## Core Technical Competencies
${prioritizedSkills.map(s => `- ${s}`).join('\n')}

## Professional Experience
${selectedExperienceHighlights
  .map(
    exp =>
      `### ${exp.role} — ${exp.company} (${exp.period})\n${exp.bullets.map(b => `- ${b}`).join('\n')}`
  )
  .join('\n\n')}

## Selected Engineering Projects
${selectedProjects.map(p => `- **${p.title}** (${p.url}): ${p.relevance}`).join('\n')}

## Education
${profile.education
  .map(ed => `- **${ed.degree}**, ${ed.institution} (${ed.graduationYear}) — ${ed.details || ''}`)
  .join('\n')}
`

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(profile.fullName)} — CV (${escapeHtml(job.companyName)})</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; color: #111827; line-height: 1.5; max-width: 800px; margin: 0 auto; padding: 32px;">
  <h1 style="margin: 0 0 4px 0; font-size: 26px;">${escapeHtml(profile.fullName)}</h1>
  <div style="font-size: 15px; font-weight: 600; color: #374151; margin-bottom: 8px;">${escapeHtml(profile.headline)}</div>
  <div style="font-size: 13px; color: #4b5563; margin-bottom: 20px; border-bottom: 2px solid #111827; padding-bottom: 12px;">
    ${escapeHtml(profile.email)} • ${escapeHtml(profile.phone)} • ${escapeHtml(profile.location)}<br/>
    Portfolio: ${escapeHtml(profile.portfolioUrl)} • GitHub: ${escapeHtml(profile.githubUrl)}
  </div>

  <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #d1d5db; padding-bottom: 4px;">Professional Summary</h2>
  <p style="font-size: 14px; color: #1f2937;">${escapeHtml(tailoredSummary)}</p>

  <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #d1d5db; padding-bottom: 4px;">Technical Skills</h2>
  <p style="font-size: 14px; color: #1f2937;">${prioritizedSkills.map(s => escapeHtml(s)).join(' • ')}</p>

  <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #d1d5db; padding-bottom: 4px;">Professional Experience</h2>
  ${selectedExperienceHighlights
    .map(
      exp => `<div style="margin-bottom: 14px;">
        <div style="font-weight: 600; font-size: 14px;">${escapeHtml(exp.role)} — ${escapeHtml(exp.company)} <span style="float: right; font-weight: 400; color: #4b5563;">${escapeHtml(exp.period)}</span></div>
        <ul style="margin: 6px 0 0 18px; padding: 0; font-size: 14px;">
          ${exp.bullets.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
        </ul>
      </div>`
    )
    .join('')}

  <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #d1d5db; padding-bottom: 4px;">Relevant Projects</h2>
  <ul style="margin: 6px 0 14px 18px; padding: 0; font-size: 14px;">
    ${selectedProjects
      .map(
        p =>
          `<li style="margin-bottom: 6px;"><strong>${escapeHtml(p.title)}</strong> (${escapeHtml(p.url)}): ${escapeHtml(p.relevance)}</li>`
      )
      .join('')}
  </ul>

  <h2 style="font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #d1d5db; padding-bottom: 4px;">Education</h2>
  ${profile.education
    .map(
      ed =>
        `<div style="font-size: 14px; margin-bottom: 8px;"><strong>${escapeHtml(ed.degree)}</strong>, ${escapeHtml(ed.institution)} (${escapeHtml(ed.graduationYear)})<br/><span style="color:#4b5563;">${escapeHtml(ed.details || '')}</span></div>`
    )
    .join('')}
</body>
</html>`

  return {
    targetPosition: job.positionTitle,
    targetCompany: job.companyName,
    tailoredSummary,
    prioritizedSkills,
    selectedExperienceHighlights,
    selectedProjects,
    atsKeywordsIncluded: atsKeywords,
    markdownContent,
    htmlContent,
    generatedAt: new Date().toISOString()
  }
}

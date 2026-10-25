import fs from 'fs'
import path from 'path'
import { CareerProfile, CareerDocument } from '@/types/email-system'

/**
 * Generates the default verified Career Profile for Salih Ben Otman (Al-Edrisy),
 * strictly bound to the authenticated administrator's UID.
 */
export function getDefaultCareerProfile(adminUid: string, adminEmail?: string): CareerProfile {
  return {
    ownerId: adminUid,
    fullName: 'Salih Ben Otman (Al-Edrisy)',
    headline: 'Full Stack Software Engineer, UI/UX Specialist & AI Systems Builder',
    email: adminEmail || 'salehfree33@gmail.com',
    secondaryEmail: 'salih.otman@final.edu.tr',
    phone: '+218 92 152 70 18',
    location: 'North Cyprus / International (Remote)',
    careerLevel: 'senior',
    summary:
      'Full Stack Software Engineer, UI/UX Engineer, and AI Systems Builder with over 5 years of engineering experience delivering 50+ production client and open-source web, mobile, and AI-integrated applications. Specialized in React 19, Next.js 15, TypeScript, Node.js, Python, Firebase, PostgreSQL, and multi-model LLM agent orchestration.',
    technicalSkills: [
      'React 19',
      'Next.js 15 (App Router, SSR, Server Actions)',
      'TypeScript',
      'Node.js',
      'Python',
      'Tailwind CSS',
      'Radix UI & shadcn/ui',
      'Framer Motion & GSAP',
      'React Native / Expo',
      'Swift',
      'C',
      'Google Cloud Firestore & Firebase Auth',
      'PostgreSQL & Prisma ORM',
      'MongoDB',
      'Cloudflare R2 / AWS S3',
      'OpenAI / Gemini / Claude / OpenRouter API',
      'LangChain & Autonomous AI Agents',
      'Docker & CI/CD'
    ],
    softSkills: [
      'Systems Architecture & Design Patterns',
      'Cross-functional Technical Leadership',
      'UI/UX Product Polish & Accessibility',
      'Agile Delivery & Client Communication',
      'Problem Solving & Algorithmic Optimization'
    ],
    workExperience: [
      {
        id: 'exp_1',
        title: 'Senior Full Stack Developer & AI Systems Engineer',
        company: 'Independent Engineering & Consulting (salihbenotman.dev)',
        location: 'Remote / International',
        startDate: '2021-01',
        endDate: 'Present',
        current: true,
        highlights: [
          'Architected and delivered 50+ full-stack web and mobile applications using React, Next.js, TypeScript, Node.js, and Python.',
          'Built production AI agent pipelines, multi-model LLM routing via OpenRouter/OpenAI/Gemini, and real-time collaborative interfaces.',
          'Designed scalable cloud backends on Firebase, PostgreSQL, and Cloudflare R2 with strict role-based security and sub-second latency.'
        ],
        technologies: ['Next.js', 'React', 'TypeScript', 'Node.js', 'Python', 'Firebase', 'PostgreSQL', 'OpenRouter']
      }
    ],
    education: [
      {
        id: 'edu_1',
        degree: 'Bachelor of Science in Software Engineering (B.Sc.)',
        institution: 'Final International University (FIU)',
        location: 'Kyrenia, North Cyprus',
        graduationYear: '2025',
        details:
          'Focused on Distributed Systems, Human-Computer Interaction (HCI), Object-Oriented Analysis & Design, Database Management Systems, and Machine Learning.'
      }
    ],
    certifications: [],
    preferredJobTitles: [
      'Senior Full Stack Engineer',
      'Full Stack Software Developer',
      'Frontend / UI Engineer (React & Next.js)',
      'AI Systems / LLM Application Engineer',
      'Software Engineer'
    ],
    targetIndustries: [
      'AI & Developer Tools',
      'SaaS & Cloud Platforms',
      'FinTech & E-Commerce',
      'EdTech & Enterprise Software'
    ],
    preferredLocations: ['Remote', 'Europe', 'MENA', 'North Cyprus', 'International'],
    remotePreference: 'remote',
    employmentTypes: ['full-time', 'contract'],
    careerObjectives:
      'Seeking high-impact Full Stack or AI Systems Engineering roles where I can architect resilient, scalable products and craft world-class user experiences.',
    salaryExpectations: 'Competitive / Open to discussion based on role scope and equity',
    portfolioUrl: 'https://salihbenotman.dev',
    githubUrl: 'https://github.com/Al-Edrisy',
    linkedinUrl: 'https://www.linkedin.com/in/%D8%B5%D8%A7%D9%84%D8%AD-%D8%A8%D9%86-%D8%B9%D8%AB%D9%85%D8%A7%D9%86-a565a2242',
    relevantProjects: [
      {
        title: 'AI-Powered E-Commerce Platform',
        description:
          'Multi-vendor commerce engine featuring real-time vector search, AI product recommendations, automated inventory management, and Stripe checkout.',
        technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'OpenAI', 'Tailwind CSS'],
        url: 'https://salihbenotman.dev/projects'
      },
      {
        title: 'Real-Time Analytics Dashboard',
        description:
          'Scalable analytics platform handling live metrics, dynamic Recharts visualizations, user session tracking, and CSV exports.',
        technologies: ['React', 'Next.js', 'Recharts', 'Firebase', 'TypeScript'],
        url: 'https://salihbenotman.dev/projects'
      },
      {
        title: 'Smart Content Management System & Interactive Portfolio',
        description:
          'Next.js 15 App Router platform with multi-role RBAC permissions, Cloudflare R2 media pipeline, OpenRouter AI story generation, and real-time Firestore reactions.',
        technologies: ['Next.js 15', 'React 19', 'Firebase Admin', 'Cloudflare R2', 'GSAP'],
        url: 'https://salihbenotman.dev'
      }
    ],
    preferredApplicationLanguage: 'English',
    additionalInstructions:
      'Always emphasize factual engineering achievements, clean architecture, and live portfolio proof at https://salihbenotman.dev. Never fabricate skills, degrees, or unverified metrics.',
    updatedAt: new Date().toISOString()
  }
}

/**
 * Extracts readable text from a PDF, Markdown, or plain-text buffer for factual AI grounding.
 */
export function extractTextFromDocumentBuffer(
  buffer: Buffer,
  mimeType: string,
  fallbackSummary?: string
): string {
  if (
    mimeType === 'text/plain' ||
    mimeType === 'text/markdown' ||
    mimeType === 'application/json'
  ) {
    return buffer.toString('utf-8').trim()
  }

  // Lightweight printable text extraction from PDF streams if no external binary parser is needed
  if (mimeType === 'application/pdf') {
    const rawLatin = buffer.toString('latin1')
    const textChunks: string[] = []
    // Extract parenthesized PDF text literals (...)
    const literalRegex = /\(([^()\\]{3,})\)/g
    let match: RegExpExecArray | null
    while ((match = literalRegex.exec(rawLatin)) !== null) {
      const cleaned = match[1].replace(/[^\x20-\x7E]/g, ' ').trim()
      if (cleaned.length > 3 && /[a-zA-Z]{2,}/.test(cleaned)) {
        textChunks.push(cleaned)
      }
    }
    const extracted = textChunks.join(' ').replace(/\s+/g, ' ').trim()
    if (extracted.length > 120) {
      return extracted.slice(0, 15000)
    }
  }

  return fallbackSummary || ''
}

/**
 * Loads the built-in default CV from public/cv/salih.otman@final.edu.tr.pdf and public/llms-full.txt
 * so the administrator immediately has their primary CV version ready for applications.
 */
export function getBuiltInDefaultCvDocument(adminUid: string): CareerDocument | null {
  try {
    const cvPath = path.join(process.cwd(), 'public', 'cv', 'salih.otman@final.edu.tr.pdf')
    const dossierPath = path.join(process.cwd(), 'public', 'llms-full.txt')

    let dossierText = ''
    if (fs.existsSync(dossierPath)) {
      dossierText = fs.readFileSync(dossierPath, 'utf-8')
    }

    if (fs.existsSync(cvPath)) {
      const stat = fs.statSync(cvPath)
      return {
        id: 'doc_default_primary_cv',
        ownerId: adminUid,
        name: 'Salih Ben Otman — Primary Full Stack & AI Engineer CV',
        originalFilename: 'Salih_Ben_Otman_CV.pdf',
        type: 'cv',
        version: 'v1.0 (Default)',
        intendedUse: 'Full Stack, Frontend (React/Next.js), and AI Systems Engineering roles',
        mimeType: 'application/pdf',
        fileSize: stat.size,
        storageKey: 'local:public/cv/salih.otman@final.edu.tr.pdf',
        extractedText:
          dossierText ||
          'Salih Ben Otman - Full Stack Software Developer & AI Systems Engineer. B.Sc. Software Engineering, Final International University.',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  } catch (err) {
    // Ignore file read errors in restricted environments
  }
  return null
}

/**
 * Resolves the binary Buffer of a CareerDocument for email attachment.
 * Enforces that the document belongs to the authenticated admin.
 */
export async function resolveCareerDocumentAttachment(
  docRecord: CareerDocument,
  adminUid: string
): Promise<{ filename: string; content: Buffer; contentType: string } | null> {
  if (docRecord.ownerId !== adminUid) {
    throw new Error('Forbidden: Cannot attach a document not owned by the authenticated administrator.')
  }

  if (docRecord.base64Content) {
    const buffer = Buffer.from(docRecord.base64Content, 'base64')
    return {
      filename: docRecord.originalFilename || `${docRecord.name}.pdf`,
      content: buffer,
      contentType: docRecord.mimeType || 'application/pdf'
    }
  }

  if (docRecord.storageKey === 'local:public/cv/salih.otman@final.edu.tr.pdf') {
    const cvPath = path.join(process.cwd(), 'public', 'cv', 'salih.otman@final.edu.tr.pdf')
    if (fs.existsSync(cvPath)) {
      const buffer = fs.readFileSync(cvPath)
      return {
        filename: docRecord.originalFilename || 'Salih_Ben_Otman_CV.pdf',
        content: buffer,
        contentType: 'application/pdf'
      }
    }
  }

  return null
}

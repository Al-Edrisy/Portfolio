// Types for Administrative Email Management & Personal AI-Assisted Job Applications

export type EmailTemplateCategory =
  | 'general_announcement'
  | 'account_notification'
  | 'onboarding'
  | 'service_update'
  | 'invitation'
  | 'admin_notice'
  | 'custom'
  | 'job_application'

export type EmailTemplateStatus = 'draft' | 'active' | 'archived'

export interface EmailTemplate {
  id: string
  name: string
  description: string
  category: EmailTemplateCategory
  subject: string
  htmlBody: string
  textBody: string
  variables: string[]
  requiredVariables: string[]
  sampleData: Record<string, string>
  status: EmailTemplateStatus
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type RecipientSource = 'user_db' | 'manual' | 'group'

export interface ResolvedRecipient {
  email: string
  name?: string
  firstName?: string
  userId?: string
  role?: string
  source: RecipientSource
  valid: boolean
  excludedReason?: 'invalid_format' | 'duplicate' | 'unsubscribed' | 'ineligible'
  customVariables?: Record<string, string>
}

export interface RecipientResolutionSummary {
  totalInputCount: number
  validCount: number
  invalidCount: number
  duplicateCount: number
  unsubscribedCount: number
  validRecipients: ResolvedRecipient[]
  excludedRecipients: ResolvedRecipient[]
}

export type CampaignStatus =
  | 'draft'
  | 'reviewed'
  | 'approved'
  | 'queued'
  | 'sending'
  | 'completed'
  | 'partial_failure'
  | 'failed'

export type DeliveryStatus =
  | 'pending'
  | 'accepted' // Accepted by SMTP provider (250 OK)
  | 'delivered'
  | 'bounced'
  | 'failed'
  | 'skipped'

export interface CampaignRecipientOutcome {
  email: string
  name?: string
  userId?: string
  status: DeliveryStatus
  messageId?: string
  smtpResponse?: string
  attempts: number
  lastAttemptAt?: string
  error?: string
}

export interface EmailCampaign {
  id: string
  name: string
  category: EmailTemplateCategory
  templateId?: string
  subject: string
  htmlBody: string
  textBody: string
  globalVariables: Record<string, string>
  status: CampaignStatus
  recipientSummary: {
    totalSelected: number
    validCount: number
    invalidCount: number
    duplicateCount: number
    unsubscribedCount: number
  }
  outcomes: CampaignRecipientOutcome[]
  stats: {
    total: number
    accepted: number
    failed: number
    pending: number
    retried: number
  }
  createdBy: string
  creatorEmail: string
  approvedBy?: string
  approvedAt?: string
  sentAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Feature B: Personal AI-Assisted Job Application System
// ============================================================================

export interface WorkExperienceEntry {
  id: string
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  current: boolean
  highlights: string[]
  technologies: string[]
}

export interface EducationEntry {
  id: string
  degree: string
  institution: string
  location: string
  graduationYear: string
  details?: string
}

export interface CertificationEntry {
  id: string
  name: string
  issuer: string
  year: string
  url?: string
}

export interface CareerProfile {
  ownerId: string // Strictly bound to authenticated admin UID
  fullName: string
  headline: string
  email: string
  secondaryEmail?: string
  phone: string
  location: string
  careerLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'principal'
  summary: string
  technicalSkills: string[]
  softSkills: string[]
  workExperience: WorkExperienceEntry[]
  education: EducationEntry[]
  certifications: CertificationEntry[]
  preferredJobTitles: string[]
  targetIndustries: string[]
  preferredLocations: string[]
  remotePreference: 'remote' | 'hybrid' | 'onsite' | 'any'
  employmentTypes: ('full-time' | 'part-time' | 'contract' | 'freelance')[]
  careerObjectives: string
  salaryExpectations?: string
  portfolioUrl: string
  githubUrl: string
  linkedinUrl: string
  relevantProjects: {
    title: string
    description: string
    technologies: string[]
    url: string
  }[]
  preferredApplicationLanguage: string
  additionalInstructions: string
  updatedAt: string
}

export type CareerDocumentType =
  | 'cv'
  | 'cover_letter'
  | 'certificate'
  | 'portfolio'
  | 'other'

export interface CareerDocument {
  id: string
  ownerId: string
  name: string
  originalFilename: string
  type: CareerDocumentType
  version: string
  intendedUse: string
  mimeType: string
  fileSize: number
  storageKey?: string
  base64Content?: string // Stored privately for reliable attachment & text extraction
  extractedText: string // Used for factual AI grounding
  isDefault?: boolean
  createdAt: string
  updatedAt: string
}

export type JobApplicationStatus =
  | 'discovered'
  | 'imported'
  | 'to_review'
  | 'matched'
  | 'drafting'
  | 'draft_ready'
  | 'awaiting_approval'
  | 'approved'
  | 'queued'
  | 'sent'
  | 'delivery_failed'
  | 'follow_up_due'
  | 'interview'
  | 'rejected'
  | 'offer_received'
  | 'withdrawn'
  | 'archived'

export interface JobMatchAssessment {
  matchScore: number // 0 - 100 decision-support estimate
  supportingEvidence: string[]
  matchedSkills: string[]
  missingOrUncertainRequirements: string[]
  potentialMismatches: string[]
  recommendedCvDocumentId?: string
  recommendedCvVersionName?: string
  recommendedCoverLetterApproach: string
  worthApplyingReason: string
  shouldApply: boolean
  evaluatedAt: string
  modelUsed: string
}

export interface TailoredCvContent {
  targetPosition: string
  targetCompany: string
  tailoredSummary: string
  prioritizedSkills: string[]
  selectedExperienceHighlights: {
    role: string
    company: string
    period: string
    bullets: string[]
  }[]
  selectedProjects: {
    title: string
    relevance: string
    url: string
  }[]
  atsKeywordsIncluded: string[]
  markdownContent: string
  htmlContent: string
  generatedAt: string
}

export interface JobOpportunity {
  id: string
  ownerId: string
  companyName: string
  positionTitle: string
  jobDescription: string
  applicationEmail: string // Empty if portal-only
  applicationUrl: string
  isPortalOnly: boolean // Flagged if application must go through web portal instead of email
  location: string
  requiredSkills: string[]
  employmentType: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
  source: string
  sourceUrl?: string
  isVerifiedSource: boolean
  applicationDeadline?: string
  status: JobApplicationStatus
  matchAssessment?: JobMatchAssessment
  createdAt: string
  updatedAt: string
}

export interface JobApplicationRecord {
  id: string
  ownerId: string
  jobId: string
  companyName: string
  positionTitle: string
  recipientEmail: string
  applicationUrl?: string
  isPortalOnly: boolean
  status: JobApplicationStatus
  // Draft & content fields
  emailSubject: string
  emailBody: string
  coverLetter: string
  selectedCvDocumentId: string
  selectedCvName?: string
  useTailoredCvSummary: boolean
  tailoredCv?: TailoredCvContent
  additionalAttachmentIds: string[]
  portfolioLinks: string[]
  personalizationSummary: string
  missingInfoWarnings: string[]
  matchAssessment?: JobMatchAssessment
  // Approval integrity fields
  contentHash?: string // SHA-256 hash of (recipientEmail + emailSubject + emailBody + coverLetter + selectedCvDocumentId + additionalAttachmentIds)
  approvedAt?: string
  approvedBy?: string
  isManuallyEdited: boolean
  contentVersion: number
  // Sending & tracking fields
  deliveryStatus?: DeliveryStatus
  smtpMessageId?: string
  smtpResponse?: string
  sentAt?: string
  deliveryError?: string
  followUpDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface EmailAuditLog {
  id: string
  actorId: string
  actorEmail: string
  domain: 'admin_campaign' | 'job_application' | 'template' | 'career_profile'
  action:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'PREVIEW'
    | 'TEST_SEND'
    | 'APPROVE'
    | 'APPROVAL_INVALIDATED'
    | 'QUEUE'
    | 'SEND_SUCCESS'
    | 'SEND_FAILURE'
    | 'DUPLICATE_BLOCKED'
  targetId: string
  details: Record<string, any>
  timestamp: string
}

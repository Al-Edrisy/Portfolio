"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Briefcase,
  UserCheck,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Upload,
  Plus,
  Trash2,
  Eye,
  RefreshCw,
  ExternalLink,
  ShieldAlert
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  CareerProfile,
  CareerDocument,
  JobOpportunity,
  JobApplicationRecord,
  JobApplicationStatus
} from '@/types/email-system'
import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from '@/lib/ai/model-configs'

export function AdminCareerSuite() {
  const { firebaseUser, user } = useAuth()
  const { toast } = useToast()

  const [activeSection, setActiveSection] = useState<'profile' | 'jobs' | 'workspace'>('jobs')
  const [loading, setLoading] = useState(false)
  const [selectedAiModel, setSelectedAiModel] = useState<string>(DEFAULT_AI_MODEL)

  // 1. Career Profile & CV Library state
  const [profile, setProfile] = useState<CareerProfile | null>(null)
  const [skillsInput, setSkillsInput] = useState('')
  const [titlesInput, setTitlesInput] = useState('')
  const [documents, setDocuments] = useState<CareerDocument[]>([])
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [newDocName, setNewDocName] = useState('')
  const [newDocVersion, setNewDocVersion] = useState('v1.0')
  const [newDocType, setNewDocType] = useState<'cv' | 'cover_letter' | 'certificate' | 'portfolio'>('cv')
  const [newDocIntendedUse, setNewDocIntendedUse] = useState('')
  const [newDocBase64, setNewDocBase64] = useState('')
  const [newDocFilename, setNewDocFilename] = useState('')
  const [newDocExtractedText, setNewDocExtractedText] = useState('')

  // 2. Job Opportunities state
  const [jobs, setJobs] = useState<JobOpportunity[]>([])
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([])
  const [newJobCompany, setNewJobCompany] = useState('')
  const [newJobPosition, setNewJobPosition] = useState('')
  const [newJobEmail, setNewJobEmail] = useState('')
  const [newJobUrl, setNewJobUrl] = useState('')
  const [newJobLocation, setNewJobLocation] = useState('Remote')
  const [newJobSkills, setNewJobSkills] = useState('')
  const [newJobDescription, setNewJobDescription] = useState('')
  const [csvImportText, setCsvImportText] = useState('')
  const [evaluatingJobs, setEvaluatingJobs] = useState(false)

  // 3. Application Workspace state
  const [applications, setApplications] = useState<JobApplicationRecord[]>([])
  const [activeAppId, setActiveAppId] = useState<string | null>(null)
  const [preparingDrafts, setPreparingDrafts] = useState(false)
  const [sendingApproved, setSendingApproved] = useState(false)
  const [previewTailoredCvHtml, setPreviewTailoredCvHtml] = useState<string | null>(null)

  const getAuthHeaders = useCallback(async () => {
    const token = await firebaseUser?.getIdToken()
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }, [firebaseUser])

  const loadCareerData = useCallback(async () => {
    if (!firebaseUser) return
    setLoading(true)
    try {
      const headers = await getAuthHeaders()
      const [profRes, docRes, jobRes, appRes] = await Promise.all([
        fetch('/api/admin/career/profile', { headers }),
        fetch('/api/admin/career/documents', { headers }),
        fetch('/api/admin/career/jobs', { headers }),
        fetch('/api/admin/career/applications', { headers })
      ])

      if (profRes.ok) {
        const pData = await profRes.json()
        if (pData.profile) {
          setProfile(pData.profile)
          setSkillsInput((pData.profile.technicalSkills || []).join(', '))
          setTitlesInput((pData.profile.preferredJobTitles || []).join(', '))
        }
      }
      if (docRes.ok) {
        const dData = await docRes.json()
        setDocuments(dData.documents || [])
      }
      if (jobRes.ok) {
        const jData = await jobRes.json()
        setJobs(jData.jobs || [])
      }
      if (appRes.ok) {
        const aData = await appRes.json()
        const appList: JobApplicationRecord[] = aData.applications || []
        setApplications(appList)
        if (appList.length > 0 && !activeAppId) {
          setActiveAppId(appList[0].id)
        }
      }
    } catch (err) {
      console.error('Error loading career suite:', err)
    } finally {
      setLoading(false)
    }
  }, [firebaseUser, getAuthHeaders, activeAppId])

  useEffect(() => {
    loadCareerData()
  }, [loadCareerData])

  // Profile Save
  const handleSaveProfile = async () => {
    if (!profile) return
    try {
      const headers = await getAuthHeaders()
      const updated = {
        ...profile,
        technicalSkills: skillsInput
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        preferredJobTitles: titlesInput
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      }
      const res = await fetch('/api/admin/career/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(updated)
      })
      const data = await res.json()
      if (res.ok && data.profile) {
        setProfile(data.profile)
        toast({
          title: 'Career Profile Updated',
          description: 'Your private career profile is saved and bound to your admin account.'
        })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  // Document File Input Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setNewDocFilename(file.name)
    if (!newDocName) {
      setNewDocName(file.name.replace(/\.[^.]+$/, ''))
    }
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewDocBase64(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleUploadDocument = async () => {
    if (!newDocName.trim()) {
      toast({ title: 'Document name required', variant: 'destructive' })
      return
    }
    setUploadingDoc(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/career/documents', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: newDocName,
          originalFilename: newDocFilename || `${newDocName}.pdf`,
          type: newDocType,
          version: newDocVersion,
          intendedUse: newDocIntendedUse,
          fileBase64: newDocBase64 || undefined,
          extractedText: newDocExtractedText
        })
      })
      const data = await res.json()
      if (res.ok && data.document) {
        setDocuments(prev => [data.document, ...prev])
        setNewDocName('')
        setNewDocIntendedUse('')
        setNewDocBase64('')
        setNewDocFilename('')
        setNewDocExtractedText('')
        toast({
          title: 'Document Added to Private Library',
          description: `${data.document.name} (${data.document.version}) is ready.`
        })
      } else {
        toast({ title: 'Upload Failed', description: data.error, variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setUploadingDoc(false)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`/api/admin/career/documents?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers
      })
      const data = await res.json()
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id))
        toast({ title: 'Document Removed' })
      } else {
        toast({ title: 'Cannot Delete', description: data.error, variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  // Job Opportunity Creation & Bulk CSV Import
  const handleAddJob = async () => {
    if (!newJobCompany.trim() || !newJobPosition.trim()) {
      toast({
        title: 'Company and Position required',
        description: 'Enter both company name and position title.',
        variant: 'destructive'
      })
      return
    }
    setEvaluatingJobs(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/career/jobs', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          companyName: newJobCompany,
          positionTitle: newJobPosition,
          applicationEmail: newJobEmail,
          applicationUrl: newJobUrl,
          location: newJobLocation,
          requiredSkills: newJobSkills,
          jobDescription: newJobDescription,
          autoEvaluate: true,
          model: selectedAiModel
        })
      })
      const data = await res.json()
      if (res.ok && data.job) {
        setJobs(prev => [data.job, ...prev])
        setNewJobCompany('')
        setNewJobPosition('')
        setNewJobEmail('')
        setNewJobUrl('')
        setNewJobSkills('')
        setNewJobDescription('')
        toast({
          title: 'Job Opportunity Added & Evaluated',
          description: `${data.job.companyName} — Match Estimate: ${data.job.matchAssessment?.matchScore || 0}%`
        })
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setEvaluatingJobs(false)
    }
  }

  const handleBulkCsvImport = async () => {
    if (!csvImportText.trim()) return
    setEvaluatingJobs(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/career/jobs', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'import_csv',
          csvText: csvImportText,
          autoEvaluate: true,
          model: selectedAiModel
        })
      })
      const data = await res.json()
      if (res.ok && data.jobs) {
        setJobs(prev => [...data.jobs, ...prev])
        setCsvImportText('')
        toast({
          title: 'Bulk Job Import Complete',
          description: `Imported and evaluated ${data.jobs.length} opportunities.`
        })
      } else {
        toast({ title: 'Import Failed', description: data.error, variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setEvaluatingJobs(false)
    }
  }

  // Prepare Personalized Drafts for Selected Jobs
  const handlePrepareDrafts = async (jobIdsToPrepare: string[], forceRegenerate = false) => {
    if (jobIdsToPrepare.length === 0) {
      toast({ title: 'Select at least one job opportunity', variant: 'destructive' })
      return
    }
    setPreparingDrafts(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/career/applications', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'prepare_drafts',
          jobIds: jobIdsToPrepare,
          overrideDuplicateWarning: forceRegenerate,
          forceRegenerateManual: forceRegenerate,
          model: selectedAiModel
        })
      })
      const data = await res.json()
      if (res.ok && data.applications) {
        await loadCareerData()
        if (data.applications[0]?.id) {
          setActiveAppId(data.applications[0].id)
        }
        setActiveSection('workspace')
        toast({
          title: 'Personalized Drafts Ready for Review',
          description: `Prepared ${data.applications.length} job-specific application drafts. Review and approve before sending.`
        })
      } else {
        toast({ title: 'Preparation Error', description: data.error, variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setPreparingDrafts(false)
    }
  }

  // Update Draft Manually (Invalidates previous approval if content changed)
  const handleUpdateApplicationDraft = async (
    app: JobApplicationRecord,
    patch: Partial<JobApplicationRecord>
  ) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/career/applications', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'update_draft',
          applicationId: app.id,
          ...patch
        })
      })
      const data = await res.json()
      if (res.ok && data.application) {
        setApplications(prev =>
          prev.map(item => (item.id === app.id ? data.application : item))
        )
        if (data.approvalInvalidated) {
          toast({
            title: 'Draft Updated — Re-Approval Required',
            description:
              'Because the subject, body, recipient, or attachments changed after approval, please review and approve again before sending.'
          })
        } else {
          toast({ title: 'Application Draft Saved' })
        }
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  // Approve Application(s)
  const handleApproveApplications = async (appIds: string[]) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/career/applications', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'approve',
          applicationIds: appIds
        })
      })
      const data = await res.json()
      if (data.approvedApplications?.length > 0) {
        await loadCareerData()
        toast({
          title: 'Application(s) Approved',
          description: `${data.approvedApplications.length} application(s) locked and ready for sending.`
        })
      }
      if (data.validationErrors?.length > 0) {
        toast({
          title: 'Approval Blocked for Some Items',
          description: data.validationErrors[0].error,
          variant: 'destructive'
        })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  // Send Test Application Email to Admin
  const handleSendTestApplication = async (appId: string) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/career/applications', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'send_test',
          applicationId: appId,
          testEmail: user?.email
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({
          title: 'Test Application Sent',
          description: `Sent test application with CV attachment to ${user?.email}`
        })
      } else {
        toast({
          title: 'Test Send Failed',
          description: data.result?.error || 'Check SMTP settings',
          variant: 'destructive'
        })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  // Dispatch Approved Applications through Controlled Queue
  const handleSendApprovedApplications = async (appIds: string[]) => {
    setSendingApproved(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/career/applications', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'send_approved',
          applicationIds: appIds
        })
      })
      const data = await res.json()
      await loadCareerData()
      if (res.ok && data.success) {
        const sentCount = (data.applications || []).filter(
          (a: JobApplicationRecord) => a.status === 'sent'
        ).length
        toast({
          title: 'Approved Applications Processed',
          description: `${sentCount} application(s) accepted by SMTP provider.`
        })
      } else {
        toast({
          title: 'Queue Dispatch Warning',
          description:
            data.rejectedPreSend?.[0]?.reason || data.error || 'Could not send applications',
          variant: 'destructive'
        })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSendingApproved(false)
    }
  }

  const activeApp = applications.find(a => a.id === activeAppId) || applications[0] || null
  const approvedApps = applications.filter(a => a.status === 'approved')

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/50 dark:border-white/[0.08]">
        <div>
          <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-muted-foreground mb-1">
            Personal Career Pipeline // OpenRouter AI + ATS
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-foreground" />
            Personal AI-Assisted Job Application Suite
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Private to administrator ({user?.email}). Match job opportunities against your CV &amp; portfolio, generate truthful ATS-tailored applications, and review every draft before sending.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            className="border border-border/60 dark:border-white/[0.08] rounded-md px-3 py-1.5 text-xs bg-background font-medium"
            value={selectedAiModel}
            onChange={e => setSelectedAiModel(e.target.value)}
          >
            {AI_MODEL_OPTIONS.map(m => (
              <option key={m.value} value={m.value}>
                {m.icon} {m.label} ({m.provider})
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={loadCareerData} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </div>

      <Tabs value={activeSection} onValueChange={(v: any) => setActiveSection(v)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <UserCheck className="h-4 w-4 mr-2" />
            1. Career Profile & CV Library
          </TabsTrigger>
          <TabsTrigger value="jobs">
            <Sparkles className="h-4 w-4 mr-2" />
            2. Job Opportunities & AI Matching ({jobs.length})
          </TabsTrigger>
          <TabsTrigger value="workspace">
            <FileText className="h-4 w-4 mr-2" />
            3. Application Review & Workspace ({applications.length})
          </TabsTrigger>
        </TabsList>

        {/* SECTION 1: CAREER PROFILE & CV LIBRARY */}
        <TabsContent value="profile" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Career Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Administrator Career Profile</CardTitle>
                <CardDescription>
                  Used by the AI to ground cover letters, email drafts, and match evaluations strictly on your real qualifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {profile && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Full Name</label>
                        <Input
                          value={profile.fullName}
                          onChange={e => setProfile({ ...profile, fullName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Career Level</label>
                        <select
                          className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                          value={profile.careerLevel}
                          onChange={e =>
                            setProfile({ ...profile, careerLevel: e.target.value as any })
                          }
                        >
                          <option value="junior">Junior</option>
                          <option value="mid">Mid-Level</option>
                          <option value="senior">Senior</option>
                          <option value="lead">Lead / Staff</option>
                          <option value="principal">Principal</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium">Professional Headline</label>
                      <Input
                        value={profile.headline}
                        onChange={e => setProfile({ ...profile, headline: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Contact Email</label>
                        <Input
                          value={profile.email}
                          onChange={e => setProfile({ ...profile, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Phone</label>
                        <Input
                          value={profile.phone}
                          onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Portfolio URL</label>
                        <Input
                          value={profile.portfolioUrl}
                          onChange={e =>
                            setProfile({ ...profile, portfolioUrl: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Location & Remote Preference</label>
                        <Input
                          value={profile.location}
                          onChange={e => setProfile({ ...profile, location: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium">Professional Summary</label>
                      <Textarea
                        rows={3}
                        value={profile.summary}
                        onChange={e => setProfile({ ...profile, summary: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium">
                        Verified Technical Skills (comma-separated)
                      </label>
                      <Textarea
                        rows={2}
                        value={skillsInput}
                        onChange={e => setSkillsInput(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium">
                        Target Job Titles (comma-separated)
                      </label>
                      <Input
                        value={titlesInput}
                        onChange={e => setTitlesInput(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium">
                        Additional AI Application Instructions
                      </label>
                      <Textarea
                        rows={2}
                        value={profile.additionalInstructions}
                        onChange={e =>
                          setProfile({ ...profile, additionalInstructions: e.target.value })
                        }
                      />
                    </div>

                    <Button onClick={handleSaveProfile} className="w-full">
                      Save Career Profile
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* CV & Supporting Document Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Private CV & Document Library</CardTitle>
                <CardDescription>
                  Manage multiple CV versions, cover letter templates, and certificates. Original files are preserved for attachment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/30 space-y-3">
                  <div className="text-sm font-semibold">Upload New CV or Supporting Document</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input
                      placeholder="Document Name (e.g. AI Engineer CV)"
                      value={newDocName}
                      onChange={e => setNewDocName(e.target.value)}
                    />
                    <Input
                      placeholder="Version (e.g. v2.0)"
                      value={newDocVersion}
                      onChange={e => setNewDocVersion(e.target.value)}
                    />
                    <select
                      className="border rounded-md px-3 py-2 text-sm bg-background"
                      value={newDocType}
                      onChange={e => setNewDocType(e.target.value as any)}
                    >
                      <option value="cv">CV / Résumé</option>
                      <option value="cover_letter">Cover Letter Template</option>
                      <option value="certificate">Certificate</option>
                      <option value="portfolio">Portfolio Dossier</option>
                    </select>
                  </div>
                  <Input
                    placeholder="Intended Use (e.g. Best for Senior Next.js / Full Stack roles)"
                    value={newDocIntendedUse}
                    onChange={e => setNewDocIntendedUse(e.target.value)}
                  />
                  <Input
                    type="file"
                    accept=".pdf,.txt,.md,.doc,.docx"
                    onChange={handleFileSelect}
                  />
                  <Textarea
                    rows={2}
                    placeholder="Optional: Paste key text/highlights from this CV version to assist AI matching..."
                    value={newDocExtractedText}
                    onChange={e => setNewDocExtractedText(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={handleUploadDocument}
                    disabled={uploadingDoc}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingDoc ? 'Uploading...' : 'Add Document to Library'}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold">
                    Available Documents ({documents.length})
                  </div>
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 border rounded-lg flex items-center justify-between gap-2 text-sm"
                    >
                      <div className="space-y-0.5">
                        <div className="font-medium flex items-center gap-2">
                          <span>{doc.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {doc.version}
                          </Badge>
                          <Badge variant="secondary" className="text-xs uppercase">
                            {doc.type}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {doc.intendedUse || doc.originalFilename}
                        </div>
                      </div>
                      {doc.id !== 'doc_default_primary_cv' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDeleteDocument(doc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SECTION 2: JOB OPPORTUNITIES & AI MATCHING */}
        <TabsContent value="jobs" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Single Opportunity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Target Job Opportunity</CardTitle>
                <CardDescription>
                  Enter a job posting. The system automatically detects application emails, flags web-portal-only jobs, and runs an AI match assessment.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Company Name *"
                    value={newJobCompany}
                    onChange={e => setNewJobCompany(e.target.value)}
                  />
                  <Input
                    placeholder="Position Title *"
                    value={newJobPosition}
                    onChange={e => setNewJobPosition(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    placeholder="Application Email (e.g. careers@co.com)"
                    value={newJobEmail}
                    onChange={e => setNewJobEmail(e.target.value)}
                  />
                  <Input
                    placeholder="Official Job Portal URL"
                    value={newJobUrl}
                    onChange={e => setNewJobUrl(e.target.value)}
                  />
                  <Input
                    placeholder="Location (e.g. Remote)"
                    value={newJobLocation}
                    onChange={e => setNewJobLocation(e.target.value)}
                  />
                </div>
                <Input
                  placeholder="Required Skills (comma-separated, e.g. React, Next.js, TypeScript, Python)"
                  value={newJobSkills}
                  onChange={e => setNewJobSkills(e.target.value)}
                />
                <Textarea
                  rows={4}
                  placeholder="Paste the Job Description & Application Instructions here (any embedded recruiter email will also be auto-detected)..."
                  value={newJobDescription}
                  onChange={e => setNewJobDescription(e.target.value)}
                />
                <Button
                  type="button"
                  onClick={handleAddJob}
                  disabled={evaluatingJobs}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {evaluatingJobs ? 'Analyzing & Matching...' : 'Add & Evaluate Job Opportunity'}
                </Button>
              </CardContent>
            </Card>

            {/* Bulk CSV Import */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bulk Import Opportunities (CSV)</CardTitle>
                <CardDescription>
                  Import multiple opportunities at once. Format:{' '}
                  <code>Company, Position, Email, Location, Type, URL, Description, Skills</code>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  rows={7}
                  placeholder={`companyName,positionTitle,applicationEmail,location,employmentType,applicationUrl,jobDescription,requiredSkills\nVercel,Senior Next.js Engineer,careers@example.com,Remote,full-time,https://vercel.com/careers,"Build Next.js cloud infrastructure",Next.js|React|TypeScript`}
                  value={csvImportText}
                  onChange={e => setCsvImportText(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleBulkCsvImport}
                  disabled={evaluatingJobs}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {evaluatingJobs ? 'Importing & Scoring...' : 'Import & Run AI Match Assessment'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Job Opportunities List & Bulk Draft Preparation */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">
                    Evaluated Job Opportunities ({jobs.length})
                  </CardTitle>
                  <CardDescription>
                    Select opportunities to generate personalized cover letters, tailored ATS CV summaries, and email drafts.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setSelectedJobIds(
                        selectedJobIds.length === jobs.length ? [] : jobs.map(j => j.id)
                      )
                    }
                  >
                    {selectedJobIds.length === jobs.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button
                    size="sm"
                    disabled={selectedJobIds.length === 0 || preparingDrafts}
                    onClick={() => handlePrepareDrafts(selectedJobIds)}
                  >
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    {preparingDrafts
                      ? 'Generating Drafts...'
                      : `Prepare Personalized Drafts (${selectedJobIds.length})`}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {jobs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No job opportunities added yet. Add a target position above to evaluate your match score.
                </p>
              ) : (
                jobs.map(job => {
                  const score = job.matchAssessment?.matchScore ?? 0
                  return (
                    <div
                      key={job.id}
                      className="p-4 border rounded-lg space-y-2 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedJobIds.includes(job.id)}
                            onCheckedChange={checked =>
                              setSelectedJobIds(prev =>
                                checked ? [...prev, job.id] : prev.filter(id => id !== job.id)
                              )
                            }
                          />
                          <div>
                            <div className="font-semibold text-base flex items-center gap-2">
                              <span>
                                {job.positionTitle} @ {job.companyName}
                              </span>
                              <Badge variant="outline">{job.location}</Badge>
                              <Badge variant="secondary">{job.status}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-3">
                              {job.applicationEmail ? (
                                <span className="font-mono text-foreground">
                                  📧 {job.applicationEmail}
                                </span>
                              ) : (
                                <span className="text-amber-600 font-medium flex items-center gap-1">
                                  <AlertTriangle className="h-3.5 w-3.5" />
                                  Portal-Only (No direct email)
                                </span>
                              )}
                              {job.applicationUrl && (
                                <a
                                  href={job.applicationUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="underline inline-flex items-center gap-1"
                                >
                                  Official Posting <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant={score >= 70 ? 'default' : score >= 50 ? 'secondary' : 'destructive'}
                          >
                            Match Estimate: {score}%
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={preparingDrafts}
                            onClick={() => handlePrepareDrafts([job.id])}
                          >
                            Prepare Application Draft
                          </Button>
                        </div>
                      </div>

                      {job.matchAssessment && (
                        <div className="pl-7 text-xs space-y-1.5 pt-1">
                          <div className="text-muted-foreground">
                            <strong>Assessment:</strong> {job.matchAssessment.worthApplyingReason}
                          </div>
                          {job.matchAssessment.matchedSkills.length > 0 && (
                            <div className="flex flex-wrap gap-1 items-center">
                              <span className="font-medium text-green-600">Matched Skills:</span>
                              {job.matchAssessment.matchedSkills.map(s => (
                                <Badge key={s} variant="secondary" className="text-[11px]">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          )}
                          {job.matchAssessment.missingOrUncertainRequirements.length > 0 && (
                            <div className="text-amber-600">
                              <strong>Missing / Unverified (Omitted from AI claims):</strong>{' '}
                              {job.matchAssessment.missingOrUncertainRequirements.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECTION 3: MANDATORY REVIEW WORKSPACE & CONTROLLED DISPATCH */}
        <TabsContent value="workspace" className="space-y-6 mt-4">
          {/* Bulk Queue Bar for Approved Applications */}
          <Card className="border-primary/40 bg-muted/20">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-sm flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Controlled Application Dispatch Queue
                </div>
                <p className="text-xs text-muted-foreground">
                  Only explicitly reviewed and approved applications ({approvedApps.length} ready) can enter the sending queue.
                </p>
              </div>
              <Button
                disabled={approvedApps.length === 0 || sendingApproved}
                onClick={() => handleSendApprovedApplications(approvedApps.map(a => a.id))}
              >
                <Send className="h-4 w-4 mr-2" />
                {sendingApproved
                  ? 'Dispatching Approved Queue...'
                  : `Send All Approved Applications (${approvedApps.length})`}
              </Button>
            </CardContent>
          </Card>

          {applications.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No application drafts prepared yet. Select a job in "Job Opportunities" and click "Prepare Application Draft".
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Application Pipeline List */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Application Pipeline</CardTitle>
                  <CardDescription>Click an application to review and approve</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[650px] overflow-y-auto">
                  {applications.map(app => (
                    <div
                      key={app.id}
                      onClick={() => setActiveAppId(app.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors space-y-1 ${
                        activeApp?.id === app.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-semibold text-sm truncate">
                          {app.companyName}
                        </span>
                        <Badge
                          variant={
                            app.status === 'sent'
                              ? 'default'
                              : app.status === 'approved'
                                ? 'secondary'
                                : app.status === 'delivery_failed'
                                  ? 'destructive'
                                  : 'outline'
                          }
                          className="text-[10px]"
                        >
                          {app.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {app.positionTitle}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground truncate">
                        {app.recipientEmail || '⚠️ Portal-Only'}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Right Column: Dedicated Mandatory Human Review Screen */}
              {activeApp && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-xl">
                          {activeApp.positionTitle} @ {activeApp.companyName}
                        </CardTitle>
                        <CardDescription>
                          Content Version v{activeApp.contentVersion} • Status:{' '}
                          <strong className="uppercase">{activeApp.status}</strong>
                          {activeApp.approvedAt &&
                            ` (Approved at ${new Date(activeApp.approvedAt).toLocaleTimeString()})`}
                        </CardDescription>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          className="border rounded px-2.5 py-1 text-xs bg-background"
                          value={activeApp.status}
                          onChange={e =>
                            handleUpdateApplicationDraft(activeApp, {
                              status: e.target.value as JobApplicationStatus
                            })
                          }
                        >
                          <option value="awaiting_approval">Awaiting Approval</option>
                          <option value="approved">Approved</option>
                          <option value="sent">Sent</option>
                          <option value="follow_up_due">Follow-Up Due</option>
                          <option value="interview">Interview</option>
                          <option value="offer_received">Offer Received</option>
                          <option value="rejected">Rejected</option>
                          <option value="withdrawn">Withdrawn</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Warnings & Personalization Summary */}
                    {activeApp.missingInfoWarnings?.length > 0 && (
                      <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs space-y-1">
                        <div className="font-semibold flex items-center gap-1.5 text-amber-600">
                          <ShieldAlert className="h-4 w-4" />
                          Review Warnings & Portal Checks
                        </div>
                        {activeApp.missingInfoWarnings.map((w, idx) => (
                          <div key={idx}>• {w}</div>
                        ))}
                      </div>
                    )}

                    <div className="p-3 rounded-lg border bg-muted/30 text-xs space-y-1">
                      <div className="font-semibold">AI Personalization & Grounding Summary</div>
                      <p className="text-muted-foreground">{activeApp.personalizationSummary}</p>
                    </div>

                    {/* Recipient & CV Attachment Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">
                          Verified Recipient Email Address
                        </label>
                        <Input
                          placeholder="careers@company.com"
                          value={activeApp.recipientEmail}
                          onChange={e =>
                            setApplications(prev =>
                              prev.map(a =>
                                a.id === activeApp.id
                                  ? { ...a, recipientEmail: e.target.value }
                                  : a
                              )
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="text-xs font-medium">Selected CV Attachment</label>
                        <select
                          className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                          value={activeApp.selectedCvDocumentId}
                          onChange={e =>
                            setApplications(prev =>
                              prev.map(a =>
                                a.id === activeApp.id
                                  ? { ...a, selectedCvDocumentId: e.target.value }
                                  : a
                              )
                            )
                          }
                        >
                          {documents
                            .filter(d => d.type === 'cv')
                            .map(d => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.version})
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 border rounded bg-background text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={activeApp.useTailoredCvSummary}
                          onCheckedChange={checked =>
                            setApplications(prev =>
                              prev.map(a =>
                                a.id === activeApp.id
                                  ? { ...a, useTailoredCvSummary: Boolean(checked) }
                                  : a
                              )
                            )
                          }
                        />
                        <span>
                          Attach Job-Specific ATS-Tailored CV Supplement alongside original CV PDF
                        </span>
                      </label>
                      {activeApp.tailoredCv?.htmlContent && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setPreviewTailoredCvHtml(
                              previewTailoredCvHtml ? null : activeApp.tailoredCv!.htmlContent
                            )
                          }
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          {previewTailoredCvHtml ? 'Hide ATS CV Preview' : 'Preview Tailored CV'}
                        </Button>
                      )}
                    </div>

                    {previewTailoredCvHtml && (
                      <div className="border rounded-lg p-4 bg-white text-black max-h-72 overflow-y-auto">
                        <div dangerouslySetInnerHTML={{ __html: previewTailoredCvHtml }} />
                      </div>
                    )}

                    {/* Subject Line */}
                    <div>
                      <label className="text-xs font-medium">Email Subject Line</label>
                      <Input
                        value={activeApp.emailSubject}
                        onChange={e =>
                          setApplications(prev =>
                            prev.map(a =>
                              a.id === activeApp.id
                                ? { ...a, emailSubject: e.target.value }
                                : a
                            )
                          )
                        }
                      />
                    </div>

                    {/* Email Body */}
                    <div>
                      <label className="text-xs font-medium">Application Email Body</label>
                      <Textarea
                        rows={5}
                        value={activeApp.emailBody}
                        onChange={e =>
                          setApplications(prev =>
                            prev.map(a =>
                              a.id === activeApp.id ? { ...a, emailBody: e.target.value } : a
                            )
                          )
                        }
                      />
                    </div>

                    {/* Cover Letter */}
                    <div>
                      <label className="text-xs font-medium">
                        Tailored Cover Letter (Included in Email & Application Package)
                      </label>
                      <Textarea
                        rows={7}
                        value={activeApp.coverLetter}
                        onChange={e =>
                          setApplications(prev =>
                            prev.map(a =>
                              a.id === activeApp.id
                                ? { ...a, coverLetter: e.target.value }
                                : a
                            )
                          )
                        }
                      />
                    </div>

                    {/* Follow-up & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium">Follow-up Reminder Date</label>
                        <Input
                          type="date"
                          value={activeApp.followUpDate || ''}
                          onChange={e =>
                            setApplications(prev =>
                              prev.map(a =>
                                a.id === activeApp.id
                                  ? { ...a, followUpDate: e.target.value }
                                  : a
                              )
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Internal Tracking Notes</label>
                        <Input
                          placeholder="e.g., Referred by engineering manager..."
                          value={activeApp.notes || ''}
                          onChange={e =>
                            setApplications(prev =>
                              prev.map(a =>
                                a.id === activeApp.id ? { ...a, notes: e.target.value } : a
                              )
                            )
                          }
                        />
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdateApplicationDraft(activeApp, {
                              recipientEmail: activeApp.recipientEmail,
                              emailSubject: activeApp.emailSubject,
                              emailBody: activeApp.emailBody,
                              coverLetter: activeApp.coverLetter,
                              selectedCvDocumentId: activeApp.selectedCvDocumentId,
                              useTailoredCvSummary: activeApp.useTailoredCvSummary,
                              followUpDate: activeApp.followUpDate,
                              notes: activeApp.notes
                            })
                          }
                        >
                          Save Edits
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendTestApplication(activeApp.id)}
                        >
                          Send Test Email
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              confirm(
                                'Regenerate with AI? This will replace current draft text for this job.'
                              )
                            ) {
                              handlePrepareDrafts([activeApp.jobId], true)
                            }
                          }}
                        >
                          Regenerate AI Draft
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeApp.status !== 'approved' && activeApp.status !== 'sent' && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handleApproveApplications([activeApp.id])}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                            Approve Draft
                          </Button>
                        )}
                        {activeApp.status === 'approved' && (
                          <Button
                            type="button"
                            size="sm"
                            disabled={sendingApproved}
                            onClick={() => handleSendApprovedApplications([activeApp.id])}
                          >
                            <Send className="h-4 w-4 mr-1.5" />
                            Send Approved Application Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

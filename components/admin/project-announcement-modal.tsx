"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Send,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Eye,
  FileText,
  Users,
  ShieldCheck,
  Loader2,
  Search,
  Save,
  Sparkles,
  ExternalLink
} from 'lucide-react'
import { Project } from '@/types'
import { EmailTemplate, RecipientResolutionSummary } from '@/types/email-system'
import {
  DEFAULT_EMAIL_TEMPLATES,
  PROJECT_ANNOUNCEMENT_TEMPLATE_IDS,
  buildProjectTemplateVariables,
  evaluateDeliverabilityHealth,
  renderEmailForRecipient,
  resolvePublicBaseUrl,
  sanitizeOutboundUrl
} from '@/lib/email/template-engine'
import { auth } from '@/lib/firebase'
import { useToast } from '@/hooks/use-toast'
import { normalizeEmail } from '@/lib/email/recipient-resolver'

interface ProjectAnnouncementModalProps {
  project: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onComplete?: (result?: { announced: boolean; announcedAt?: string; recipientCount?: number }) => void
}

interface RecipientItem {
  id: string
  email: string
  name?: string
  role?: string
  unsubscribed?: boolean
  disabled?: boolean
}

export function ProjectAnnouncementModal({
  project,
  open,
  onOpenChange,
  onComplete
}: ProjectAnnouncementModalProps) {
  const { toast } = useToast()

  const builtInProjectTemplates = useMemo(
    () =>
      DEFAULT_EMAIL_TEMPLATES.filter(t =>
        (PROJECT_ANNOUNCEMENT_TEMPLATE_IDS as readonly string[]).includes(t.id)
      ),
    []
  )

  const [templates, setTemplates] = useState<EmailTemplate[]>(builtInProjectTemplates)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl_project_release_note')

  // Editable template content & variables
  const [subjectTemplate, setSubjectTemplate] = useState<string>('')
  const [htmlTemplate, setHtmlTemplate] = useState<string>('')
  const [textTemplate, setTextTemplate] = useState<string>('')
  const [variables, setVariables] = useState<Record<string, string>>({})

  // Recipient pool & selection controls
  const [registeredUsers, setRegisteredUsers] = useState<RecipientItem[]>([])
  const [pastContacts, setPastContacts] = useState<RecipientItem[]>([])
  const [includeRegisteredUsers, setIncludeRegisteredUsers] = useState<boolean>(true)
  const [includePastContacts, setIncludePastContacts] = useState<boolean>(false)
  const [excludedEmails, setExcludedEmails] = useState<string[]>([])
  const [manualInput, setManualInput] = useState<string>('')
  const [recipientSearch, setRecipientSearch] = useState<string>('')
  const [recipientSummary, setRecipientSummary] = useState<RecipientResolutionSummary | null>(null)

  // UI & dispatch state
  const [loadingInit, setLoadingInit] = useState<boolean>(false)
  const [resolvingRecipients, setResolvingRecipients] = useState<boolean>(false)
  const [sendingTest, setSendingTest] = useState<boolean>(false)
  const [savingDraft, setSavingDraft] = useState<boolean>(false)
  const [dispatching, setDispatching] = useState<boolean>(false)
  const [testEmail, setTestEmail] = useState<string>('')
  const [confirmed, setConfirmed] = useState<boolean>(false)
  const [previewMode, setPreviewMode] = useState<'html' | 'text' | 'edit'>('html')

  const getAuthHeaders = useCallback(async () => {
    const token = await auth.currentUser?.getIdToken()
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }, [])

  // Apply template selection
  const selectTemplate = useCallback(
    (tplId: string, availableTemplates: EmailTemplate[] = templates) => {
      const tpl =
        availableTemplates.find(t => t.id === tplId) ||
        builtInProjectTemplates.find(t => t.id === tplId) ||
        builtInProjectTemplates[0]
      if (!tpl) return
      setSelectedTemplateId(tpl.id)
      setSubjectTemplate(tpl.subject)
      setHtmlTemplate(tpl.htmlBody)
      setTextTemplate(tpl.textBody)
      setConfirmed(false)
    },
    [templates, builtInProjectTemplates]
  )

  // Initialize project variables and load recipient pool when modal opens
  useEffect(() => {
    if (!open || !project) return

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : undefined
    const initialVars = buildProjectTemplateVariables(project, { baseUrl: currentOrigin })
    setVariables(initialVars)
    selectTemplate('tpl_project_release_note', builtInProjectTemplates)
    setIncludeRegisteredUsers(true)
    setIncludePastContacts(false)
    setExcludedEmails([])
    setManualInput('')
    setConfirmed(false)

    let cancelled = false
    const fetchInitialData = async () => {
      setLoadingInit(true)
      try {
        const headers = await getAuthHeaders()
        const res = await fetch(
          `/api/admin/projects/announce?projectId=${encodeURIComponent(project.id || '')}`,
          { headers }
        )
        const data = await res.json()
        if (!cancelled && data.success) {
          if (Array.isArray(data.templates) && data.templates.length > 0) {
            setTemplates(data.templates)
          }
          setRegisteredUsers(data.registeredUsers || [])
          setPastContacts(data.pastContacts || [])
          setRecipientSummary(data.defaultSummary || null)
          if (data.variables && Object.keys(data.variables).length > 0) {
            setVariables(prev => ({ ...prev, ...data.variables }))
          }
        }
      } catch {
        // Offline tolerance
      } finally {
        if (!cancelled) setLoadingInit(false)
      }
    }

    fetchInitialData()
    return () => {
      cancelled = true
    }
  }, [open, project, builtInProjectTemplates, getAuthHeaders, selectTemplate])

  // Re-resolve recipients when toggles, exclusions, or manual emails change
  useEffect(() => {
    if (!open || !project) return
    const timer = setTimeout(async () => {
      setResolvingRecipients(true)
      try {
        const headers = await getAuthHeaders()
        const res = await fetch('/api/admin/projects/announce', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            action: 'resolve_recipients',
            projectId: project.id,
            projectData: project,
            subjectTemplate,
            htmlTemplate,
            textTemplate,
            variables,
            includeRegisteredUsers,
            includePastContacts,
            excludedEmails,
            manualInput
          })
        })
        const data = await res.json()
        if (data.success && data.summary) {
          setRecipientSummary(data.summary)
        }
      } catch {
        // Ignore transient errors
      } finally {
        setResolvingRecipients(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [
    open,
    project,
    includeRegisteredUsers,
    includePastContacts,
    excludedEmails,
    manualInput,
    subjectTemplate,
    htmlTemplate,
    textTemplate,
    variables,
    getAuthHeaders
  ])

  // Live local preview & deliverability calculation
  const renderedPreview = useMemo(() => {
    return renderEmailForRecipient({
      subjectTemplate,
      htmlTemplate,
      textTemplate,
      globalVariables: variables,
      recipientVariables: {
        first_name: 'Alex',
        recipient_name: 'Alex Rivera',
        recipient_email: 'alex@example.com'
      }
    })
  }, [subjectTemplate, htmlTemplate, textTemplate, variables])

  const deliverability = useMemo(() => {
    return evaluateDeliverabilityHealth({
      subject: renderedPreview.subject,
      textBody: renderedPreview.text,
      htmlBody: renderedPreview.html
    })
  }, [renderedPreview])

  // Combined visible directory for individual checkbox toggling
  const combinedDirectory = useMemo(() => {
    const map = new Map<string, RecipientItem & { sourceGroup: 'user' | 'contact' }>()
    if (includeRegisteredUsers) {
      for (const u of registeredUsers) {
        const norm = normalizeEmail(u.email)
        if (norm && !map.has(norm)) {
          map.set(norm, { ...u, email: norm, sourceGroup: 'user' })
        }
      }
    }
    if (includePastContacts) {
      for (const c of pastContacts) {
        const norm = normalizeEmail(c.email)
        if (norm && !map.has(norm)) {
          map.set(norm, { ...c, email: norm, sourceGroup: 'contact' })
        }
      }
    }
    const items = Array.from(map.values())
    if (!recipientSearch.trim()) return items
    const q = recipientSearch.toLowerCase()
    return items.filter(
      item =>
        item.email.toLowerCase().includes(q) ||
        (item.name || '').toLowerCase().includes(q)
    )
  }, [registeredUsers, pastContacts, includeRegisteredUsers, includePastContacts, recipientSearch])

  const toggleRecipientEmail = (email: string) => {
    const norm = normalizeEmail(email)
    if (!norm) return
    setExcludedEmails(prev =>
      prev.includes(norm) ? prev.filter(e => e !== norm) : [...prev, norm]
    )
    setConfirmed(false)
  }

  const setRecipientExcluded = (email: string, shouldExclude: boolean) => {
    const norm = normalizeEmail(email)
    if (!norm) return
    setExcludedEmails(prev => {
      const has = prev.includes(norm)
      if (shouldExclude && !has) return [...prev, norm]
      if (!shouldExclude && has) return prev.filter(e => e !== norm)
      return prev
    })
    setConfirmed(false)
  }

  const handleSelectAll = () => {
    setExcludedEmails([])
    setConfirmed(false)
  }

  const handleDeselectAll = () => {
    const allNorms = combinedDirectory.map(item => normalizeEmail(item.email)).filter(Boolean)
    setExcludedEmails(allNorms)
    setConfirmed(false)
  }

  const handleSendTest = async () => {
    setSendingTest(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/projects/announce', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'send_test',
          projectId: project?.id,
          projectData: project,
          templateId: selectedTemplateId,
          subjectTemplate,
          htmlTemplate,
          textTemplate,
          variables,
          testEmail: testEmail.trim() || undefined
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: 'Test Email Accepted',
          description: `Sent [TEST] preview to ${data.result?.recipient || testEmail || 'your admin inbox'}.`
        })
      } else {
        toast({
          title: 'Test Email Failed',
          description: data.result?.error || data.error || 'Could not send test email.',
          variant: 'destructive'
        })
      }
    } catch (err: any) {
      toast({
        title: 'Test Error',
        description: err.message || 'Unexpected error sending test email.',
        variant: 'destructive'
      })
    } finally {
      setSendingTest(false)
    }
  }

  const handleSaveDraft = async () => {
    setSavingDraft(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/projects/announce', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'save_draft',
          projectId: project?.id,
          projectData: project,
          templateId: selectedTemplateId,
          subjectTemplate,
          htmlTemplate,
          textTemplate,
          variables,
          includeRegisteredUsers,
          includePastContacts,
          excludedEmails,
          manualInput
        })
      })
      const data = await res.json()
      if (data.success) {
        toast({
          title: 'Announcement Saved to Drafts',
          description: 'You can review and send this campaign anytime from the Admin Email Center.'
        })
        onOpenChange(false)
        onComplete?.({ announced: false })
      } else {
        toast({
          title: 'Failed to Save Draft',
          description: data.error || 'Unable to save draft.',
          variant: 'destructive'
        })
      }
    } catch (err: any) {
      toast({
        title: 'Save Error',
        description: err.message || 'Unexpected error saving draft.',
        variant: 'destructive'
      })
    } finally {
      setSavingDraft(false)
    }
  }

  const handleApproveAndDispatch = async () => {
    if (!confirmed) {
      toast({
        title: 'Confirmation Required',
        description: 'Please check the approval confirmation box before dispatching.',
        variant: 'destructive'
      })
      return
    }

    setDispatching(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/projects/announce', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'approve_and_send',
          projectId: project?.id,
          projectData: project,
          templateId: selectedTemplateId,
          subjectTemplate,
          htmlTemplate,
          textTemplate,
          variables,
          includeRegisteredUsers,
          includePastContacts,
          excludedEmails,
          manualInput,
          confirmed: true
        })
      })
      const data = await res.json()
      if (data.success) {
        const accepted = data.dispatchSummary?.acceptedCount || 0
        const failed = data.dispatchSummary?.failedCount || 0
        toast({
          title: 'Project Announcement Dispatched',
          description: `Provider accepted ${accepted} email(s)${failed > 0 ? `, ${failed} failed` : ''}.`
        })
        onOpenChange(false)
        onComplete?.({
          announced: accepted > 0,
          announcedAt: data.announcedAt,
          recipientCount: accepted
        })
      } else {
        toast({
          title: 'Dispatch Failed',
          description: data.error || 'Could not dispatch announcement.',
          variant: 'destructive'
        })
      }
    } catch (err: any) {
      toast({
        title: 'Dispatch Error',
        description: err.message || 'Unexpected error dispatching announcement.',
        variant: 'destructive'
      })
    } finally {
      setDispatching(false)
    }
  }

  if (!project) return null

  const validRecipientCount = useMemo(() => {
    if (recipientSummary && !resolvingRecipients) {
      return recipientSummary.validCount
    }
    const dirCount = combinedDirectory.filter(
      item =>
        !excludedEmails.includes(normalizeEmail(item.email)) &&
        !item.unsubscribed &&
        !item.disabled
    ).length
    return dirCount
  }, [recipientSummary, resolvingRecipients, combinedDirectory, excludedEmails])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:w-[94vw] lg:w-full max-w-5xl max-h-[94vh] sm:max-h-[90vh] flex flex-col overflow-hidden border-border/50 bg-background p-0 gap-0">
        {/* Header */}
        <DialogHeader className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-border/50 bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
            <div className="min-w-0 pr-6 sm:pr-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-foreground/[0.08] text-foreground/80 font-semibold">
                  Project Release Dispatch
                </span>
                {project.announcedAt ? (
                  <Badge variant="secondary" className="text-[11px] gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    Previously Announced
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[11px]">
                    Ready for First Announcement
                  </Badge>
                )}
              </div>
              <DialogTitle className="text-base sm:text-lg lg:text-xl font-semibold tracking-tight text-left truncate">
                Review &amp; Send Announcement: {project.title}
              </DialogTitle>
              <DialogDescription className="text-left text-xs text-muted-foreground mt-0.5">
                Inspect the engineering template, verify deliverability hygiene, and confirm recipients before dispatching.
              </DialogDescription>
            </div>
          </div>

          {project.announcedAt && (
            <div className="mt-2.5 flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 sm:p-3 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong>Duplicate Send Protection:</strong> This project was already announced on{' '}
                {new Date(project.announcedAt).toLocaleDateString()}
                {project.announcementRecipientCount
                  ? ` to ${project.announcementRecipientCount} recipient(s)`
                  : ''}. Only proceed if you intentionally want to send a new release note.
              </div>
            </div>
          )}
        </DialogHeader>

        {/* Main Body Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
          {/* Left Column: Template Selection & Recipient Controls (5 cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 space-y-4 sm:space-y-5 min-w-0">
            {/* Step 1: 3 Anti-Slop Template Styles */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                1. Choose Anti-Slop Template Style
              </Label>
              <div className="space-y-2">
                {templates.map(tpl => {
                  const active = tpl.id === selectedTemplateId
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => selectTemplate(tpl.id)}
                      className={`w-full text-left p-2.5 sm:p-3 rounded-lg border transition-[transform,border-color,background-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.985] ${
                        active
                          ? 'border-foreground bg-foreground/[0.04] shadow-2xs'
                          : 'border-border/50 hover:border-border bg-card/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{tpl.name}</span>
                        {tpl.id === 'tpl_project_release_note' && (
                          <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {tpl.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Audience & Recipient Resolution */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  2. Target Audience &amp; Recipients
                </Label>
                {resolvingRecipients || loadingInit ? (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Resolving...
                  </span>
                ) : (
                  <Badge variant="secondary" className="text-xs font-mono">
                    {validRecipientCount} Eligible
                  </Badge>
                )}
              </div>

              <div className="space-y-2 rounded-lg border border-border/50 p-2.5 sm:p-3 bg-muted/10">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium">Eligible Registered Users</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Verified accounts ({registeredUsers.filter(u => !u.unsubscribed && !u.disabled).length} active)
                    </p>
                  </div>
                  <Switch
                    checked={includeRegisteredUsers}
                    onCheckedChange={val => {
                      setIncludeRegisteredUsers(val)
                      setConfirmed(false)
                    }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                  <div className="min-w-0">
                    <p className="text-xs font-medium">Include Past Contact Senders</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      Unique people who messaged via contact form ({pastContacts.length})
                    </p>
                  </div>
                  <Switch
                    checked={includePastContacts}
                    onCheckedChange={val => {
                      setIncludePastContacts(val)
                      setConfirmed(false)
                    }}
                  />
                </div>
              </div>

              {/* Individual user toggle list */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <Input
                      value={recipientSearch}
                      onChange={e => setRecipientSearch(e.target.value)}
                      placeholder="Filter recipients..."
                      className="h-8 pl-8 text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="h-8 px-2 rounded border border-border/60 hover:bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAll}
                    className="h-8 px-2 rounded border border-border/60 hover:bg-muted text-[11px] font-medium text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                  >
                    Deselect All
                  </button>
                </div>

                <div className="max-h-36 sm:max-h-40 overflow-y-auto rounded-md border border-border/50 divide-y divide-border/40 bg-background">
                  {combinedDirectory.length === 0 ? (
                    <div className="p-3 text-center text-xs text-muted-foreground">
                      No directory recipients in active groups. Add manual emails below if needed.
                    </div>
                  ) : (
                    combinedDirectory.map(item => {
                      const norm = normalizeEmail(item.email)
                      const isExcluded =
                        excludedEmails.includes(norm) || Boolean(item.unsubscribed || item.disabled)
                      const isDisabled = Boolean(item.unsubscribed || item.disabled)

                      return (
                        <div
                          key={norm}
                          onClick={() => {
                            if (!isDisabled) {
                              toggleRecipientEmail(item.email)
                            }
                          }}
                          className={`flex items-center justify-between px-2.5 py-1.5 text-xs transition-colors select-none ${
                            isDisabled
                              ? 'opacity-50 cursor-not-allowed bg-muted/20'
                              : isExcluded
                                ? 'bg-muted/15 opacity-70 hover:bg-muted/25 cursor-pointer'
                                : 'hover:bg-muted/30 cursor-pointer'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate pr-2">
                            <Checkbox
                              checked={!isExcluded}
                              disabled={isDisabled}
                              onCheckedChange={checked => {
                                setRecipientExcluded(item.email, checked !== true)
                              }}
                              onClick={e => {
                                e.stopPropagation()
                              }}
                            />
                            <div className="truncate">
                              <span
                                className={`font-medium ${
                                  isExcluded && !isDisabled
                                    ? 'line-through text-muted-foreground'
                                    : 'text-foreground'
                                }`}
                              >
                                {item.name || item.email}
                              </span>
                              <span className="text-muted-foreground ml-1.5 text-[11px]">
                                &lt;{item.email}&gt;
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isExcluded && !isDisabled && (
                              <span className="text-[10px] text-muted-foreground font-mono uppercase bg-muted px-1.5 py-0.5 rounded">
                                Deselected
                              </span>
                            )}
                            {item.unsubscribed ? (
                              <span className="text-[10px] text-amber-600 font-mono">Opted Out</span>
                            ) : (
                              <span className="text-[10px] text-muted-foreground font-mono uppercase">
                                {item.sourceGroup}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>

              {/* Manual additional emails */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Additional Manual Emails (comma, semicolon, or newline separated)
                </Label>
                <Textarea
                  value={manualInput}
                  onChange={e => {
                    setManualInput(e.target.value)
                    setConfirmed(false)
                  }}
                  placeholder="colleague@company.com, Jane Doe <jane@example.org>"
                  rows={2}
                  className="text-xs font-mono"
                />
              </div>

              {/* Recipient Validation Breakdown */}
              {recipientSummary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 text-center">
                  <div className="rounded border border-border/50 p-1.5 bg-muted/10">
                    <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {recipientSummary.validCount}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Valid</div>
                  </div>
                  <div className="rounded border border-border/50 p-1.5 bg-muted/10">
                    <div className="text-xs font-semibold">{recipientSummary.duplicateCount}</div>
                    <div className="text-[10px] text-muted-foreground">Deduped</div>
                  </div>
                  <div className="rounded border border-border/50 p-1.5 bg-muted/10">
                    <div className="text-xs font-semibold text-amber-600">
                      {recipientSummary.unsubscribedCount}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Excluded</div>
                  </div>
                  <div className="rounded border border-border/50 p-1.5 bg-muted/10">
                    <div className="text-xs font-semibold text-destructive">
                      {recipientSummary.invalidCount}
                    </div>
                    <div className="text-[10px] text-muted-foreground">Invalid</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Preview, Deliverability Telemetry & Inline Editor (7 cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 space-y-3.5 sm:space-y-4 min-w-0">
            {/* Deliverability Hygiene Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-border/50 bg-muted/15 px-3 py-2 sm:px-3.5 sm:py-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-xs font-medium">
                  Deliverability Score:{' '}
                  <strong className="font-mono">{deliverability.score}/100</strong>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono text-muted-foreground">
                <span>Text Ratio: {deliverability.plainTextRatio}%</span>
                <span>Links: {deliverability.linkCount}</span>
                <span>Spam Words: {deliverability.spamTriggersFound.length}</span>
              </div>
            </div>

            {deliverability.warnings.length > 0 && (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300 space-y-0.5">
                {deliverability.warnings.map((w, idx) => (
                  <div key={idx}>• {w}</div>
                ))}
              </div>
            )}

            {/* Editable Subject Line */}
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Subject Line</Label>
              <Input
                value={subjectTemplate}
                onChange={e => {
                  setSubjectTemplate(e.target.value)
                  setConfirmed(false)
                }}
                className="text-sm font-medium"
              />
              <p className="text-[11px] text-muted-foreground truncate">
                Rendered Subject: <strong className="text-foreground">{renderedPreview.subject}</strong>
              </p>
            </div>

            {/* Project Dynamic URL Destination Card */}
            <div className="space-y-1.5 rounded-lg border border-border/50 bg-muted/10 p-2.5 sm:p-3">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Email Project Link (&#123;&#123;project_url&#125;&#125;)
                </Label>
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const caseStudy =
                        variables.project_case_study_url ||
                        `${resolvePublicBaseUrl()}/projects/${project.id}`
                      setVariables(prev => ({ ...prev, project_url: caseStudy }))
                      setConfirmed(false)
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                      variables.project_url === variables.project_case_study_url ||
                      (!project.link && !variables.project_url?.includes(project.link || '___'))
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-background hover:bg-muted text-muted-foreground border-border/50'
                    }`}
                  >
                    Case Study Page
                  </button>
                  {project.link && (
                    <button
                      type="button"
                      onClick={() => {
                        setVariables(prev => ({
                          ...prev,
                          project_url: project.link
                        }))
                        setConfirmed(false)
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                        variables.project_url === project.link
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-background hover:bg-muted text-muted-foreground border-border/50'
                      }`}
                    >
                      Live Demo Website
                    </button>
                  )}
                </div>
              </div>
              <Input
                value={variables.project_url || ''}
                onChange={e => {
                  const val = e.target.value
                  setVariables(prev => ({ ...prev, project_url: val }))
                  setConfirmed(false)
                }}
                className="h-8 text-xs font-mono"
                placeholder="https://salihbenotman.dev/projects/..."
              />
            </div>

            {/* Preview / Customize Tabs */}
            <Tabs value={previewMode} onValueChange={v => setPreviewMode(v as any)}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <TabsList className="h-8">
                  <TabsTrigger value="html" className="text-xs px-2.5 sm:px-3 py-1">
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    Preview
                  </TabsTrigger>
                  <TabsTrigger value="text" className="text-xs px-2.5 sm:px-3 py-1">
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    Plain Text
                  </TabsTrigger>
                  <TabsTrigger value="edit" className="text-xs px-2.5 sm:px-3 py-1">
                    Edit Variables
                  </TabsTrigger>
                </TabsList>

                <a
                  href={variables.project_url || `/projects/${project.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  Open Link <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <TabsContent value="html" className="mt-2">
                <div className="rounded-lg border border-border/50 overflow-hidden bg-white">
                  <iframe
                    title="Project Announcement HTML Preview"
                    srcDoc={renderedPreview.html}
                    sandbox=""
                    className="w-full h-[260px] sm:h-[320px] lg:h-[340px] border-0"
                  />
                </div>
              </TabsContent>

              <TabsContent value="text" className="mt-2">
                <pre className="rounded-lg border border-border/50 bg-muted/20 p-3.5 sm:p-4 text-xs font-mono whitespace-pre-wrap h-[260px] sm:h-[320px] lg:h-[340px] overflow-y-auto text-foreground">
                  {renderedPreview.text}
                </pre>
              </TabsContent>

              <TabsContent value="edit" className="mt-2 space-y-3 h-[260px] sm:h-[320px] lg:h-[340px] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-[11px]">Project Title (project_title)</Label>
                    <Input
                      value={variables.project_title || ''}
                      onChange={e =>
                        setVariables(prev => ({ ...prev, project_title: e.target.value }))
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px]">Category (project_category)</Label>
                    <Input
                      value={variables.project_category || ''}
                      onChange={e =>
                        setVariables(prev => ({ ...prev, project_category: e.target.value }))
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-[11px]">Stack (project_tech)</Label>
                    <Input
                      value={variables.project_tech || ''}
                      onChange={e =>
                        setVariables(prev => ({ ...prev, project_tech: e.target.value }))
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-[11px]">Destination URL (project_url)</Label>
                    <Input
                      value={variables.project_url || ''}
                      onChange={e =>
                        setVariables(prev => ({ ...prev, project_url: e.target.value }))
                      }
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-[11px]">Summary (project_description)</Label>
                    <Textarea
                      rows={2}
                      value={variables.project_description || ''}
                      onChange={e =>
                        setVariables(prev => ({ ...prev, project_description: e.target.value }))
                      }
                      className="text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-[11px]">Architecture / Solution Note (project_solution)</Label>
                    <Textarea
                      rows={2}
                      value={variables.project_solution || ''}
                      onChange={e =>
                        setVariables(prev => ({ ...prev, project_solution: e.target.value }))
                      }
                      className="text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-[11px]">Plain-Text Body Template</Label>
                    <Textarea
                      rows={4}
                      value={textTemplate}
                      onChange={e => {
                        setTextTemplate(e.target.value)
                        setConfirmed(false)
                      }}
                      className="text-xs font-mono"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Test Email Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <Input
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                placeholder="Optional test email (defaults to your admin email)"
                className="h-8 text-xs flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSendTest}
                disabled={sendingTest}
                className="shrink-0 h-8 text-xs"
              >
                {sendingTest ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                )}
                Send Test Preview
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Confirmation & Actions */}
        <div className="shrink-0 px-4 sm:px-6 py-3 sm:py-4 border-t border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <label className="flex items-start gap-2.5 text-xs cursor-pointer select-none">
            <Checkbox
              checked={confirmed}
              onCheckedChange={v => setConfirmed(Boolean(v))}
              className="mt-0.5"
            />
            <span className="leading-snug">
              I have reviewed the rendered preview and approve sending this announcement to{' '}
              <strong>{validRecipientCount} eligible recipient(s)</strong>.
            </span>
          </label>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onOpenChange(false)
                onComplete?.({ announced: false })
              }}
              className="w-full sm:w-auto"
            >
              Skip for Now
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={savingDraft || dispatching}
              className="w-full sm:w-auto"
            >
              {savingDraft ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5" />
              )}
              Save Draft
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleApproveAndDispatch}
              disabled={!confirmed || validRecipientCount === 0 || dispatching}
              className="w-full sm:w-auto font-medium"
            >
              {dispatching ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 mr-1.5" />
              )}
              Approve &amp; Send ({validRecipientCount})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

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
  Mail,
  Send,
  Users,
  FileCode2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Copy,
  Trash2,
  RefreshCw,
  ShieldCheck,
  History
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  EmailTemplate,
  EmailTemplateCategory,
  EmailCampaign,
  RecipientResolutionSummary
} from '@/types/email-system'
import { DatabaseUserCandidate } from '@/lib/email/recipient-resolver'

export function AdminEmailCenter() {
  const { firebaseUser, user } = useAuth()
  const { toast } = useToast()

  const [subTab, setSubTab] = useState<'compose' | 'templates' | 'history'>('compose')
  const [loading, setLoading] = useState(false)

  // Recipients state
  const [dbUsers, setDbUsers] = useState<DatabaseUserCandidate[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectAllEligible, setSelectAllEligible] = useState(false)
  const [userGroupFilter, setUserGroupFilter] = useState<string>('')
  const [manualEmailsInput, setManualEmailsInput] = useState('')
  const [recipientSummary, setRecipientSummary] = useState<RecipientResolutionSummary | null>(null)
  const [resolvingRecipients, setResolvingRecipients] = useState(false)

  // Templates state
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl_general_announcement')
  const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate> | null>(null)

  // Compose & Review state
  const [campaignName, setCampaignName] = useState('')
  const [campaignCategory, setCampaignCategory] = useState<EmailTemplateCategory>('general_announcement')
  const [subject, setSubject] = useState('{{subject}}')
  const [htmlBody, setHtmlBody] = useState('')
  const [textBody, setTextBody] = useState('')
  const [globalVariables, setGlobalVariables] = useState<Record<string, string>>({
    subject: 'Portfolio Update from Salih Ben Otman',
    message: 'Hello! Thank you for connecting with my portfolio. Here is our latest update.',
    sender_name: 'Salih Ben Otman'
  })
  const [previewResult, setPreviewResult] = useState<{
    subject: string
    html: string
    text: string
    missingPlaceholders: string[]
  } | null>(null)
  const [testEmailAddress, setTestEmailAddress] = useState('')
  const [explicitConfirmChecked, setExplicitConfirmChecked] = useState(false)
  const [sendingCampaign, setSendingCampaign] = useState(false)

  // Campaigns History
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([])

  const getAuthHeaders = useCallback(async () => {
    const token = await firebaseUser?.getIdToken()
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }, [firebaseUser])

  const loadInitialData = useCallback(async () => {
    if (!firebaseUser) return
    setLoading(true)
    try {
      const headers = await getAuthHeaders()
      const [usersRes, tplRes, cmpRes] = await Promise.all([
        fetch('/api/admin/email/recipients?includeContacts=true', { headers }),
        fetch('/api/admin/email/templates', { headers }),
        fetch('/api/admin/email/campaigns', { headers })
      ])

      if (usersRes.ok) {
        const uData = await usersRes.json()
        setDbUsers(uData.users || [])
      }
      if (tplRes.ok) {
        const tData = await tplRes.json()
        const list: EmailTemplate[] = tData.templates || []
        setTemplates(list)
        const defaultTpl = list.find(t => t.id === 'tpl_general_announcement') || list[0]
        if (defaultTpl) {
          setSelectedTemplateId(defaultTpl.id)
          setSubject(defaultTpl.subject)
          setHtmlBody(defaultTpl.htmlBody)
          setTextBody(defaultTpl.textBody)
          setCampaignCategory(defaultTpl.category)
          setGlobalVariables(defaultTpl.sampleData || {})
        }
      }
      if (cmpRes.ok) {
        const cData = await cmpRes.json()
        setCampaigns(cData.campaigns || [])
      }
    } catch (err) {
      console.error('Failed loading email center:', err)
    } finally {
      setLoading(false)
    }
  }, [firebaseUser, getAuthHeaders])

  useEffect(() => {
    loadInitialData()
    if (user?.email) {
      setTestEmailAddress(user.email)
    }
  }, [loadInitialData, user?.email])

  const handleSelectTemplate = (tplId: string) => {
    setSelectedTemplateId(tplId)
    const found = templates.find(t => t.id === tplId)
    if (found) {
      setSubject(found.subject)
      setHtmlBody(found.htmlBody)
      setTextBody(found.textBody)
      setCampaignCategory(found.category)
      setGlobalVariables(prev => ({ ...found.sampleData, ...prev }))
      setExplicitConfirmChecked(false)
    }
  }

  const handleResolveRecipients = async () => {
    setResolvingRecipients(true)
    setExplicitConfirmChecked(false)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/email/recipients', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          selectedUserIds,
          selectAllEligibleUsers: selectAllEligible,
          userGroup: userGroupFilter,
          manualInput: manualEmailsInput,
          respectUnsubscribe: true
        })
      })
      const data = await res.json()
      if (res.ok && data.summary) {
        setRecipientSummary(data.summary)
        toast({
          title: 'Recipients Validated',
          description: `${data.summary.validCount} valid recipients resolved (${data.summary.duplicateCount} duplicates, ${data.summary.invalidCount} invalid).`
        })
      } else {
        toast({
          title: 'Validation Error',
          description: data.error || 'Could not resolve recipients',
          variant: 'destructive'
        })
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      })
    } finally {
      setResolvingRecipients(false)
    }
  }

  const handlePreviewEmail = async () => {
    try {
      const headers = await getAuthHeaders()
      const sampleRecipient = recipientSummary?.validRecipients[0]
      const res = await fetch('/api/admin/email/templates', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'preview',
          subject,
          htmlBody,
          textBody,
          sampleData: {
            ...globalVariables,
            first_name: sampleRecipient?.firstName || 'Alex',
            name: sampleRecipient?.name || 'Alex Rivera',
            email: sampleRecipient?.email || 'alex@example.com'
          }
        })
      })
      const data = await res.json()
      if (res.ok && data.preview) {
        setPreviewResult(data.preview)
      }
    } catch (err: any) {
      toast({
        title: 'Preview failed',
        description: err.message,
        variant: 'destructive'
      })
    }
  }

  const handleSendTestEmail = async () => {
    if (!testEmailAddress.trim()) {
      toast({
        title: 'Test address required',
        description: 'Enter a test email address first.',
        variant: 'destructive'
      })
      return
    }
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/email/campaigns', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'send_test',
          testRecipientEmail: testEmailAddress,
          subjectTemplate: subject,
          htmlTemplate: htmlBody,
          textTemplate: textBody,
          globalVariables
        })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast({
          title: 'Test Email Accepted by Provider',
          description: data.message
        })
      } else {
        toast({
          title: 'Test Email Failed',
          description: data.error || 'Check SMTP configuration',
          variant: 'destructive'
        })
      }
    } catch (err: any) {
      toast({
        title: 'Test Send Error',
        description: err.message,
        variant: 'destructive'
      })
    }
  }

  const handleSaveDraftCampaign = async () => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/email/campaigns', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'save_draft',
          name: campaignName || globalVariables.subject || 'Untitled Campaign',
          category: campaignCategory,
          templateId: selectedTemplateId,
          subject,
          htmlBody,
          textBody,
          globalVariables,
          recipientSummary: recipientSummary
            ? {
                totalSelected: recipientSummary.totalInputCount,
                validCount: recipientSummary.validCount,
                invalidCount: recipientSummary.invalidCount,
                duplicateCount: recipientSummary.duplicateCount,
                unsubscribedCount: recipientSummary.unsubscribedCount
              }
            : undefined,
          validRecipients: recipientSummary?.validRecipients || []
        })
      })
      const data = await res.json()
      if (res.ok && data.campaign) {
        setCampaigns(prev => [data.campaign, ...prev])
        toast({
          title: 'Draft Saved',
          description: 'Campaign saved as draft. No emails have been sent.'
        })
      } else {
        toast({
          title: 'Failed to save draft',
          description: data.error,
          variant: 'destructive'
        })
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      })
    }
  }

  const handleApproveAndSendCampaign = async () => {
    if (!recipientSummary || recipientSummary.validCount === 0) {
      toast({
        title: 'Validate recipients first',
        description: 'Click "Validate & Resolve Recipients" before sending.',
        variant: 'destructive'
      })
      return
    }
    if (!explicitConfirmChecked) {
      toast({
        title: 'Approval confirmation required',
        description: 'Please check the explicit approval confirmation box before sending.',
        variant: 'destructive'
      })
      return
    }

    setSendingCampaign(true)
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/email/campaigns', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'approve_and_send',
          explicitApprovalConfirmed: true,
          name: campaignName || globalVariables.subject || 'Admin Campaign',
          category: campaignCategory,
          templateId: selectedTemplateId,
          subject,
          htmlBody,
          textBody,
          globalVariables,
          recipientSummary: {
            totalSelected: recipientSummary.totalInputCount,
            validCount: recipientSummary.validCount,
            invalidCount: recipientSummary.invalidCount,
            duplicateCount: recipientSummary.duplicateCount,
            unsubscribedCount: recipientSummary.unsubscribedCount
          },
          validRecipients: recipientSummary.validRecipients
        })
      })
      const data = await res.json()
      if (data.campaign) {
        setCampaigns(prev => [data.campaign, ...prev])
        setExplicitConfirmChecked(false)
        toast({
          title: `Campaign Processed (${data.campaign.status})`,
          description: `Accepted by SMTP: ${data.campaign.stats.accepted} | Failed: ${data.campaign.stats.failed}`
        })
        setSubTab('history')
      } else {
        toast({
          title: 'Campaign Error',
          description: data.error || 'Failed to dispatch campaign',
          variant: 'destructive'
        })
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive'
      })
    } finally {
      setSendingCampaign(false)
    }
  }

  const handleSaveTemplate = async () => {
    if (!editingTemplate?.name || !editingTemplate?.subject || !editingTemplate?.htmlBody) {
      toast({
        title: 'Missing fields',
        description: 'Template name, subject, and HTML body are required.',
        variant: 'destructive'
      })
      return
    }
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/email/templates', {
        method: 'POST',
        headers,
        body: JSON.stringify(editingTemplate)
      })
      const data = await res.json()
      if (res.ok && data.template) {
        setTemplates(prev => {
          const exists = prev.some(t => t.id === data.template.id)
          return exists
            ? prev.map(t => (t.id === data.template.id ? data.template : t))
            : [data.template, ...prev]
        })
        setEditingTemplate(null)
        toast({ title: 'Template Saved', description: `${data.template.name} is ready.` })
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  const handleDuplicateTemplate = async (tpl: EmailTemplate) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch('/api/admin/email/templates', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'duplicate', sourceTemplate: tpl })
      })
      const data = await res.json()
      if (res.ok && data.template) {
        setTemplates(prev => [data.template, ...prev])
        toast({ title: 'Template Duplicated', description: `Created ${data.template.name}` })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      const headers = await getAuthHeaders()
      const res = await fetch(`/api/admin/email/templates?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers
      })
      const data = await res.json()
      if (res.ok) {
        setTemplates(prev => prev.filter(t => t.id !== id))
        toast({ title: 'Template Deleted' })
      } else {
        toast({ title: 'Cannot Delete', description: data.error, variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    }
  }

  const filteredUsers = dbUsers.filter(u => {
    if (!userSearch.trim()) return true
    const q = userSearch.toLowerCase()
    return u.email.toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q)
  })

  const toggleUserSelection = (id: string) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
    setExplicitConfirmChecked(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/50 dark:border-white/[0.08]">
        <div>
          <div className="text-[10px] font-mono uppercase font-bold tracking-wider text-muted-foreground mb-1">
            Outbound Infrastructure // SMTP &amp; Templates
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Mail className="h-5 w-5 text-foreground" />
            Administrative Email Center
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Compose, preview, and dispatch announcements or bulk campaigns with recipient verification and audit tracking.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadInitialData} disabled={loading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={subTab} onValueChange={(v: any) => setSubTab(v)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compose">
            <Send className="h-4 w-4 mr-2" />
            1. Compose, Preview & Send
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileCode2 className="h-4 w-4 mr-2" />
            2. Email Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            3. Campaign History ({campaigns.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: COMPOSE, PREVIEW & SEND */}
        <TabsContent value="compose" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Step 1: Recipient Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-primary" />
                  Step 1: Recipient Selection & Validation
                </CardTitle>
                <CardDescription>
                  Select registered users from Firestore or enter email addresses separated by commas, semicolons, or new lines.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="selectAllEligible"
                      checked={selectAllEligible}
                      onCheckedChange={(checked) => setSelectAllEligible(Boolean(checked))}
                    />
                    <label htmlFor="selectAllEligible" className="text-sm font-medium">
                      All Eligible Registered Users ({dbUsers.length})
                    </label>
                  </div>

                  <select
                    className="border rounded-md px-3 py-1.5 text-sm bg-background"
                    value={userGroupFilter}
                    onChange={e => setUserGroupFilter(e.target.value)}
                  >
                    <option value="">Filter by Group (None)</option>
                    <option value="user">Standard Users</option>
                    <option value="admin">Administrators</option>
                    <option value="contact">Contact Form Senders</option>
                  </select>
                </div>

                {/* Searchable Database Users List */}
                <div className="space-y-2">
                  <Input
                    placeholder="Search users by name or email..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                  />
                  <div className="border rounded-md max-h-48 overflow-y-auto divide-y p-2 space-y-1">
                    {filteredUsers.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">
                        No matching database users found.
                      </p>
                    ) : (
                      filteredUsers.map(u => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between py-1.5 px-2 hover:bg-muted/50 rounded text-sm"
                        >
                          <label className="flex items-center gap-2 cursor-pointer flex-1 truncate">
                            <Checkbox
                              checked={selectedUserIds.includes(u.id) || selectAllEligible}
                              onCheckedChange={() => toggleUserSelection(u.id)}
                            />
                            <span className="font-medium truncate">{u.name || 'Unnamed'}</span>
                            <span className="text-xs text-muted-foreground truncate">
                              &lt;{u.email}&gt;
                            </span>
                          </label>
                          <Badge variant="outline" className="text-xs ml-2">
                            {u.role}
                          </Badge>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Manual Multi-Delimiter Input */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">
                    Manually Entered Emails (comma, semicolon, or newline separated)
                  </label>
                  <Textarea
                    rows={3}
                    placeholder="e.g., alice@example.com, Bob <bob@company.org>; carol@domain.net"
                    value={manualEmailsInput}
                    onChange={e => {
                      setManualEmailsInput(e.target.value)
                      setExplicitConfirmChecked(false)
                    }}
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleResolveRecipients}
                  disabled={resolvingRecipients}
                  className="w-full"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {resolvingRecipients ? 'Validating...' : 'Validate & Resolve Recipients'}
                </Button>

                {/* Recipient Resolution Summary */}
                {recipientSummary && (
                  <div className="p-4 rounded-lg border bg-muted/30 space-y-3 text-sm">
                    <div className="font-semibold flex items-center justify-between">
                      <span>Recipient Resolution Summary</span>
                      <Badge variant={recipientSummary.validCount > 0 ? 'default' : 'destructive'}>
                        {recipientSummary.validCount} Valid Ready
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 rounded bg-background border">
                        <div className="text-muted-foreground">Total Input</div>
                        <div className="font-bold text-base">{recipientSummary.totalInputCount}</div>
                      </div>
                      <div className="p-2 rounded bg-background border">
                        <div className="text-muted-foreground">Valid Unique</div>
                        <div className="font-bold text-base text-green-600">
                          {recipientSummary.validCount}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-background border">
                        <div className="text-muted-foreground">Duplicates Removed</div>
                        <div className="font-bold text-base text-amber-600">
                          {recipientSummary.duplicateCount}
                        </div>
                      </div>
                      <div className="p-2 rounded bg-background border">
                        <div className="text-muted-foreground">Invalid / Unsub</div>
                        <div className="font-bold text-base text-red-600">
                          {recipientSummary.invalidCount + recipientSummary.unsubscribedCount}
                        </div>
                      </div>
                    </div>

                    {recipientSummary.excludedRecipients.length > 0 && (
                      <div className="text-xs space-y-1">
                        <div className="font-medium text-amber-600 flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Excluded Addresses:
                        </div>
                        <div className="max-h-24 overflow-y-auto space-y-1">
                          {recipientSummary.excludedRecipients.map((ex, i) => (
                            <div key={i} className="text-muted-foreground">
                              • <span className="font-mono">{ex.email}</span> ({ex.excludedReason})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Template & Message Composition */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileCode2 className="h-5 w-5 text-primary" />
                  Step 2: Compose & Personalize
                </CardTitle>
                <CardDescription>
                  Select a template and customize variables. Placeholders like{' '}
                  <code>{'{{first_name}}'}</code> are safely interpolated per recipient.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium">Campaign Name</label>
                    <Input
                      placeholder="e.g., October Portfolio Newsletter"
                      value={campaignName}
                      onChange={e => setCampaignName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Select Template</label>
                    <select
                      className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                      value={selectedTemplateId}
                      onChange={e => handleSelectTemplate(e.target.value)}
                    >
                      {templates
                        .filter(t => t.category !== 'job_application')
                        .map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.category})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium">
                      Variable: <code>{'{{subject}}'}</code>
                    </label>
                    <Input
                      value={globalVariables.subject || ''}
                      onChange={e =>
                        setGlobalVariables(prev => ({ ...prev, subject: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">
                      Variable: <code>{'{{sender_name}}'}</code>
                    </label>
                    <Input
                      value={globalVariables.sender_name || ''}
                      onChange={e =>
                        setGlobalVariables(prev => ({ ...prev, sender_name: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium">
                    Main Message Variable: <code>{'{{message}}'}</code>
                  </label>
                  <Textarea
                    rows={4}
                    value={globalVariables.message || ''}
                    onChange={e =>
                      setGlobalVariables(prev => ({ ...prev, message: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="text-xs font-medium">Email Subject Line Template</label>
                  <Input value={subject} onChange={e => setSubject(e.target.value)} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handlePreviewEmail}>
                    <Eye className="h-4 w-4 mr-1.5" />
                    Preview Rendered Email
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={handleSaveDraftCampaign}>
                    Save as Draft
                  </Button>
                </div>

                {/* Test Email Dispatch */}
                <div className="pt-2 border-t flex items-center gap-2">
                  <Input
                    placeholder="Test email address..."
                    value={testEmailAddress}
                    onChange={e => setTestEmailAddress(e.target.value)}
                    className="text-sm"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleSendTestEmail}>
                    Send Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step 3: Draft Preview & Explicit Approval Gate */}
          <Card className="border-primary/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Step 3: Draft Review & Explicit Approval</span>
                {previewResult?.missingPlaceholders?.length ? (
                  <Badge variant="destructive">
                    Missing Variables: {previewResult.missingPlaceholders.join(', ')}
                  </Badge>
                ) : null}
              </CardTitle>
              <CardDescription>
                Inspect the rendered preview and recipient counts before approving bulk dispatch.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {previewResult && (
                <div className="border rounded-lg p-4 bg-background space-y-2">
                  <div className="text-sm font-semibold border-b pb-2">
                    Rendered Subject: <span className="font-normal">{previewResult.subject}</span>
                  </div>
                  <div
                    className="p-3 rounded border bg-white text-black max-h-80 overflow-y-auto text-sm"
                    dangerouslySetInnerHTML={{ __html: previewResult.html }}
                  />
                </div>
              )}

              <div className="p-4 rounded-lg bg-muted/40 border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="confirmBulkSend"
                    checked={explicitConfirmChecked}
                    onCheckedChange={c => setExplicitConfirmChecked(Boolean(c))}
                  />
                  <label htmlFor="confirmBulkSend" className="text-sm leading-tight cursor-pointer">
                    <span className="font-semibold block">
                      I have reviewed the rendered email draft and recipient summary.
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Confirm sending to{' '}
                      <strong>{recipientSummary?.validCount || 0} verified recipients</strong> via
                      rate-limited queue.
                    </span>
                  </label>
                </div>

                <Button
                  type="button"
                  onClick={handleApproveAndSendCampaign}
                  disabled={
                    sendingCampaign ||
                    !explicitConfirmChecked ||
                    !recipientSummary ||
                    recipientSummary.validCount === 0
                  }
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendingCampaign
                    ? 'Sending Campaign...'
                    : `Approve & Send (${recipientSummary?.validCount || 0})`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: TEMPLATES MANAGEMENT */}
        <TabsContent value="templates" className="space-y-6 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Configurable Email Templates</h3>
            <Button
              size="sm"
              onClick={() =>
                setEditingTemplate({
                  name: '',
                  description: '',
                  category: 'custom',
                  subject: '{{subject}}',
                  htmlBody: '<p>Hello {{first_name}},</p><p>{{message}}</p><p>Best regards,<br/>{{sender_name}}</p>',
                  textBody: 'Hello {{first_name}},\n\n{{message}}\n\nBest regards,\n{{sender_name}}',
                  status: 'active'
                })
              }
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Template
            </Button>
          </div>

          {editingTemplate && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="text-base">
                  {editingTemplate.id ? 'Edit Template' : 'Create Template'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Template Name"
                    value={editingTemplate.name || ''}
                    onChange={e =>
                      setEditingTemplate(prev => ({ ...prev, name: e.target.value }))
                    }
                  />
                  <select
                    className="border rounded-md px-3 py-2 text-sm bg-background"
                    value={editingTemplate.category || 'custom'}
                    onChange={e =>
                      setEditingTemplate(prev => ({
                        ...prev,
                        category: e.target.value as EmailTemplateCategory
                      }))
                    }
                  >
                    <option value="general_announcement">General Announcement</option>
                    <option value="account_notification">Account Notification</option>
                    <option value="onboarding">Welcome & Onboarding</option>
                    <option value="service_update">Service Update</option>
                    <option value="invitation">Invitation</option>
                    <option value="admin_notice">Administrative Notice</option>
                    <option value="custom">Custom</option>
                  </select>
                  <Input
                    placeholder="Short Description"
                    value={editingTemplate.description || ''}
                    onChange={e =>
                      setEditingTemplate(prev => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>
                <Input
                  placeholder="Subject Line (supports {{subject}}, {{first_name}})"
                  value={editingTemplate.subject || ''}
                  onChange={e =>
                    setEditingTemplate(prev => ({ ...prev, subject: e.target.value }))
                  }
                />
                <Textarea
                  rows={6}
                  placeholder="HTML Body..."
                  value={editingTemplate.htmlBody || ''}
                  onChange={e =>
                    setEditingTemplate(prev => ({ ...prev, htmlBody: e.target.value }))
                  }
                />
                <Textarea
                  rows={3}
                  placeholder="Plain-text Fallback Body..."
                  value={editingTemplate.textBody || ''}
                  onChange={e =>
                    setEditingTemplate(prev => ({ ...prev, textBody: e.target.value }))
                  }
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" onClick={() => setEditingTemplate(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTemplate}>Save Template</Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(tpl => (
              <Card key={tpl.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{tpl.name}</CardTitle>
                    <Badge variant="outline">{tpl.category}</Badge>
                  </div>
                  <CardDescription>{tpl.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <span className="font-semibold">Subject:</span> {tpl.subject}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tpl.variables.map(v => (
                      <Badge key={v} variant="secondary" className="font-mono text-[11px]">
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        handleSelectTemplate(tpl.id)
                        setSubTab('compose')
                      }}
                    >
                      Use
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingTemplate(tpl)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDuplicateTemplate(tpl)}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1" />
                      Duplicate
                    </Button>
                    {!tpl.id.startsWith('tpl_') && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteTemplate(tpl.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: CAMPAIGN HISTORY & DELIVERY TRACKING */}
        <TabsContent value="history" className="space-y-4 mt-4">
          {campaigns.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No email campaigns created yet.
              </CardContent>
            </Card>
          ) : (
            campaigns.map(cmp => (
              <Card key={cmp.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{cmp.name}</CardTitle>
                      <CardDescription>
                        Subject: {cmp.subject} • Created by {cmp.creatorEmail} on{' '}
                        {new Date(cmp.createdAt).toLocaleString()}
                      </CardDescription>
                    </div>
                    <Badge
                      variant={
                        cmp.status === 'completed'
                          ? 'default'
                          : cmp.status === 'failed'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {cmp.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div className="p-2 border rounded">
                      <span className="text-muted-foreground block">Total Recipients</span>
                      <span className="font-bold text-sm">{cmp.stats?.total || 0}</span>
                    </div>
                    <div className="p-2 border rounded">
                      <span className="text-muted-foreground block">Provider Accepted</span>
                      <span className="font-bold text-sm text-green-600">
                        {cmp.stats?.accepted || 0}
                      </span>
                    </div>
                    <div className="p-2 border rounded">
                      <span className="text-muted-foreground block">Failed / Bounced</span>
                      <span className="font-bold text-sm text-red-600">
                        {cmp.stats?.failed || 0}
                      </span>
                    </div>
                    <div className="p-2 border rounded">
                      <span className="text-muted-foreground block">Retried</span>
                      <span className="font-bold text-sm">{cmp.stats?.retried || 0}</span>
                    </div>
                    <div className="p-2 border rounded">
                      <span className="text-muted-foreground block">Approved At</span>
                      <span className="font-medium">
                        {cmp.approvedAt ? new Date(cmp.approvedAt).toLocaleTimeString() : 'Draft'}
                      </span>
                    </div>
                  </div>

                  {cmp.outcomes && cmp.outcomes.length > 0 && (
                    <div className="max-h-36 overflow-y-auto border rounded divide-y">
                      {cmp.outcomes.map((o, idx) => (
                        <div key={idx} className="px-3 py-1.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {o.status === 'accepted' ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            ) : o.status === 'pending' ? (
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5 text-red-600" />
                            )}
                            <span className="font-mono">{o.email}</span>
                            {o.name && <span className="text-muted-foreground">({o.name})</span>}
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="text-[10px]">
                              {o.status} (tries: {o.attempts})
                            </Badge>
                            {o.error && (
                              <span className="text-red-500 block text-[11px]">{o.error}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Github,
  FileText,
  Image as ImageIcon,
  Code,
  ArrowLeft,
  ArrowRight,
  Rocket,
  Plus,
  Trash,
  Sparkles,
  Lightbulb,
  Target,
  Database,
  HelpCircle,
  BookOpen,
  Link as LinkIcon
} from 'lucide-react'
import { useCreateProject, useUpdateProject } from '@/hooks/projects'
import { useAuth } from '@/contexts/auth-context'
import { Project } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ImageGalleryInput } from './image-url-input'
import { VideoUrlInput } from './video-url-input'
import { TechStackSelector } from './tech-stack-selector'
import { CategoryPicker } from './category-picker'

import { useToast } from '@/hooks/use-toast'

interface EnhancedProjectFormProps {
  project?: Project
  onSuccess?: (project: Project) => void
  onCancel?: () => void
  mode?: 'create' | 'edit'
  className?: string
}

export function EnhancedProjectForm({
  project,
  onSuccess,
  onCancel,
  mode = 'create',
  className
}: EnhancedProjectFormProps) {
  const { user } = useAuth()
  const { createProject, loading: creating } = useCreateProject()
  const { updateProject, loading: updating } = useUpdateProject()
  const { toast } = useToast()

  // Form step management (managed internally)
  const [currentStep, setCurrentStep] = useState(1)
  const formProgress = ((currentStep - 1) / 5) * 100

  // Form state
  const [formData, setFormData] = useState({
    title: project?.title || '',
    slug: (project as any)?.slug || '',
    description: project?.description || '',
    longDescription: (project as any)?.longDescription || '',
    features: (project as any)?.features || [],
    challenges: (project as any)?.challenges || '',
    solutions: (project as any)?.solutions || '',
    results: (project as any)?.results || '',
    thumbnailMediaId: project?.thumbnailMediaId || '',
    coverMediaId: (project as any)?.coverMediaId || '',
    galleryMediaIds: project?.galleryMediaIds || [],
    videoMediaId: project?.videoMediaId || '',
    image: project?.image || '',
    images: project?.images || [],
    videoUrl: project?.videoUrl || '',
    tech: project?.tech || [],
    categories: project?.categories || (project?.category ? [project.category] : []),
    link: project?.link || '',
    github: project?.github || '',
    published: project?.published || false,
    featured: (project as any)?.featured || false,
    documentation: (project as any)?.links?.documentation || '',
    resources: (project as any)?.links?.resources || [],
    documents: project?.documents || [],
    documentsMediaIds: project?.documentsMediaIds || []
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newFeature, setNewFeature] = useState('')
  const [newResourceName, setNewResourceName] = useState('')
  const [newResourceUrl, setNewResourceUrl] = useState('')

  // Document uploads state
  const [docName, setDocName] = useState('')
  const [docType, setDocType] = useState<'readme' | 'srs' | 'erd' | 'mermaid' | 'other'>('readme')
  const [isUploadingDoc, setIsUploadingDoc] = useState(false)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)

  const handleGenerateStory = async () => {
    if (!formData.title || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please enter a project title and short description first.",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingStory(true)
    try {
      const response = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          tech: formData.tech,
          categories: formData.categories
        })
      })

      const result = await response.json()
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          longDescription: result.data.longDescription,
          challenges: result.data.challenges,
          solutions: result.data.solutions,
          results: result.data.results
        }))
        toast({
          title: "Case Study Generated",
          description: "Project story, challenges, solutions, and results populated successfully!",
        })
      } else {
        toast({
          title: "AI Generation Failed",
          description: result.error || "Failed to generate case study details.",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred during generation.",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingStory(false)
    }
  }

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploadingDoc(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64String,
            filename: file.name,
            folder: 'project-documents'
          })
        })

        const data = await response.json()
        if (data.success) {
          const newDoc = {
            name: docName.trim() || file.name,
            url: data.url,
            type: docType
          }
          setFormData(prev => ({
            ...prev,
            documents: [...(prev.documents || []), newDoc],
            documentsMediaIds: [...(prev.documentsMediaIds || []), data.data?.id || '']
          }))
          setDocName('')
          toast({
            title: "Document Uploaded",
            description: `${file.name} has been added successfully.`
          })
        } else {
          toast({
            title: "Upload Failed",
            description: data.error || "Failed to upload document",
            variant: "destructive"
          })
        }
      } catch (err) {
        toast({
          title: "Upload Error",
          description: "An error occurred during file upload",
          variant: "destructive"
        })
      } finally {
        setIsUploadingDoc(false)
        e.target.value = ''
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: (prev.documents || []).filter((_, i) => i !== index),
      documentsMediaIds: (prev.documentsMediaIds || []).filter((_, i) => i !== index)
    }))
  }

  const loading = creating || updating
  const isEdit = mode === 'edit' && project

  // Auto-generate slug from title
  useEffect(() => {
    if (!isEdit && formData.title) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
      setFormData(prev => ({ ...prev, slug: generatedSlug }))
    }
  }, [formData.title, isEdit])

  // Step navigation functions
  const nextStep = () => {
    if (validateStep(currentStep)) {
      const next = Math.min(currentStep + 1, 6)
      setCurrentStep(next)
    }
  }

  const prevStep = () => {
    const prev = Math.max(currentStep - 1, 1)
    setCurrentStep(prev)
  }

  const goToStep = (step: number) => {
    // Only allow going forward if validated
    if (step < currentStep) {
      setCurrentStep(step)
    } else {
      let isAllValid = true
      for (let i = currentStep; i < step; i++) {
        if (!validateStep(i)) {
          isAllValid = false
          setCurrentStep(i)
          break
        }
      }
      if (isAllValid) {
        setCurrentStep(step)
      }
    }
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Project title is required'
        if (!formData.slug.trim()) newErrors.slug = 'Slug is required'
        if (!formData.description.trim()) newErrors.description = 'Short description is required'
        if (!formData.categories || formData.categories.length === 0) newErrors.category = 'At least one category is required'
        break
      case 2:
        if (!formData.image?.trim() && !formData.thumbnailMediaId && formData.images.length === 0) {
          newErrors.image = 'At least one project image or cover image is required'
        }
        break
      case 3:
        if (!formData.tech || formData.tech.length === 0) {
          newErrors.tech = 'At least one technology is required'
        }
        break
      case 4:
        if (!formData.longDescription.trim()) {
          newErrors.longDescription = 'Detailed story is required'
        }
        break
      case 5:
        if (!formData.link.trim() && !formData.github.trim()) {
          newErrors.links = 'At least one link (Live Demo or GitHub) is required'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_: any, i: number) => i !== index)
    }))
  }

  const handleAddResource = () => {
    if (newResourceName.trim() && newResourceUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, { name: newResourceName.trim(), url: newResourceUrl.trim() }]
      }))
      setNewResourceName('')
      setNewResourceUrl('')
    }
  }

  const handleRemoveResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_: any, i: number) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    // Validate all steps
    for (let i = 1; i <= 5; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i)
        return
      }
    }

    try {
      const submissionData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        longDescription: formData.longDescription,
        features: formData.features,
        challenges: formData.challenges,
        solutions: formData.solutions,
        results: formData.results,
        thumbnailMediaId: formData.thumbnailMediaId,
        coverMediaId: formData.coverMediaId,
        galleryMediaIds: formData.galleryMediaIds,
        videoMediaId: formData.videoMediaId,
        image: formData.images[0] || formData.image, // Fallback to first gallery image
        images: formData.images,
        videoUrl: formData.videoUrl,
        tech: formData.tech,
        categories: formData.categories,
        link: formData.link,
        github: formData.github,
        published: formData.published,
        featured: formData.featured,
        documents: formData.documents,
        documentsMediaIds: formData.documentsMediaIds,
        links: {
          demo: formData.link,
          github: formData.github,
          documentation: formData.documentation,
          resources: formData.resources
        }
      }

      let result
      if (isEdit) {
        result = await updateProject(project!.id, submissionData as any)
      } else {
        result = await createProject(submissionData as any)
      }

      if (result) {
        onSuccess?.(result as any)
      }
    } catch (err) {
      console.error('Error saving project:', err)
    }
  }

  const getStepTip = (step: number) => {
    switch (step) {
      case 1:
        return "Slugs are generated automatically from project titles. Choose a short, descriptive title."
      case 2:
        return "Add high-resolution screenshots. You can also upload direct video files (.mp4/.webm) or PDF specifications."
      case 3:
        return "Select the primary languages, frameworks, and databases that power this application."
      case 4:
        return "Detailed stories support markdown formatting. Describe the obstacles, engineering decisions, and metrics."
      case 5:
        return "Provide target links for code repositories, public product links, and API documentation references."
      case 6:
        return "Review the details. Make sure you toggle published if you want this visible on the portfolio index page immediately."
      default:
        return ""
    }
  }

  const steps = [
    { id: 1, title: 'Basic Info', icon: FileText },
    { id: 2, title: 'Media Assets', icon: ImageIcon },
    { id: 3, title: 'Tech Stack', icon: Code },
    { id: 4, title: 'Project Story', icon: BookOpen },
    { id: 5, title: 'Project Links', icon: LinkIcon },
    { id: 6, title: 'Final Review', icon: CheckCircle }
  ]

  return (
    <div className={cn("w-full space-y-8", className)}>
      {/* Title Header */}
      <div className="text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Badge variant="secondary" className="gap-2 px-3 py-1 mb-2 bg-primary/10 text-primary border-primary/10 hover:bg-primary/15 transition-all">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              {isEdit ? 'Refine Details' : 'Portfolio Showcase'}
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
              {isEdit ? 'Update Your Project' : 'Build Your Showcase'}
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl">
              {isEdit
                ? 'Update metadata, replace screenshots, edit code links, and polish long description.'
                : 'Create an impressive case study highlighting architecture, features, and engineering metrics.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-muted/30 border border-border/50 rounded-xl px-4 py-2 text-sm shadow-sm backdrop-blur-md">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Progress</span>
            <div className="w-20 bg-muted rounded-full h-2 overflow-hidden border">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-300"
                style={{ width: `${formProgress}%` }}
              />
            </div>
            <span className="font-bold text-foreground text-xs">{Math.round(formProgress)}%</span>
          </div>
        </div>
      </div>

      {/* Horizontal Connected Steps Timeline (Desktop) */}
      <div className="hidden md:flex items-center justify-between gap-2 p-2 bg-card/60 backdrop-blur-md rounded-xl border border-border/50 shadow-sm">
        {steps.map((step, idx) => {
          const Icon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id
          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-initial">
              <button
                type="button"
                onClick={() => goToStep(step.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.03]" 
                    : isCompleted
                      ? "text-green-500 hover:text-green-600 bg-green-500/5 hover:bg-green-500/10 border border-green-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] border font-bold shrink-0",
                  isActive
                    ? "bg-primary-foreground text-primary border-transparent"
                    : isCompleted
                      ? "bg-green-500 text-white border-transparent"
                      : "bg-background text-muted-foreground border-border"
                )}>
                  {step.id}
                </span>
                <span className="truncate">{step.title}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className="h-[1px] flex-1 bg-border/60 mx-4" />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Timeline Status Bar */}
      <div className="flex md:hidden items-center justify-between bg-card/60 backdrop-blur-md border border-border/50 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md shadow-primary/25">
            {currentStep}
          </span>
          <div>
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Step {currentStep} of 6</p>
            <p className="text-sm font-bold text-foreground">{steps[currentStep - 1].title}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Next:</span>
          <span className="font-bold text-foreground/80">{steps[Math.min(currentStep, 5)].title}</span>
        </div>
      </div>

      {/* Contextual Tips Bar */}
      {getStepTip(currentStep) && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-start gap-3 shadow-sm"
        >
          <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-xs text-foreground/80 leading-relaxed font-medium">
            {getStepTip(currentStep)}
          </div>
        </motion.div>
      )}

      {/* Form Glassmorphism Body */}
      <Card className="border border-border/50 bg-card/50 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
        <div className="p-6 sm:p-8 min-h-[420px]">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-bold">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g. Wiqaya Mobile Application"
                    className={cn(errors.title && "border-destructive", "h-11 bg-background/50")}
                  />
                  {errors.title && <p className="text-xs text-destructive font-semibold">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug" className="text-sm font-bold">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="wiqaya-mobile-app"
                    className={cn(errors.slug && "border-destructive", "h-11 bg-background/50")}
                  />
                  {errors.slug && <p className="text-xs text-destructive font-semibold">{errors.slug}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold">Short Summary *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Summarize the core values and features in a single, high-impact sentence."
                  className={cn(errors.description && "border-destructive", "min-h-[90px] bg-background/50")}
                />
                {errors.description && <p className="text-xs text-destructive font-semibold">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">Project Categories *</Label>
                <CategoryPicker
                  selectedCategories={formData.categories as any}
                  onCategoriesChange={(cats) => handleInputChange('categories', cats)}
                />
                {errors.category && <p className="text-xs text-destructive font-semibold">{errors.category}</p>}
              </div>

              <div className="flex flex-wrap gap-6 p-4 bg-muted/30 border border-border/50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => handleInputChange('featured', checked)}
                  />
                  <div>
                    <Label htmlFor="featured" className="text-sm font-bold">Featured Showcase</Label>
                    <p className="text-[10px] text-muted-foreground">Highlight on top grid row</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 border-l pl-6 border-border/50">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) => handleInputChange('published', checked)}
                  />
                  <div>
                    <Label htmlFor="published" className="text-sm font-bold">Visible to Public</Label>
                    <p className="text-[10px] text-muted-foreground">Published publicly on portfolio index</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Project Media */}
          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="space-y-2">
                <Label className="text-sm font-bold">Main Images Gallery</Label>
                <ImageGalleryInput
                  images={formData.images}
                  onImagesChange={(imgs) => handleInputChange('images', imgs)}
                />
                {errors.image && <p className="text-xs text-destructive font-semibold">{errors.image}</p>}
              </div>

              <div className="space-y-2 pt-6 border-t border-border/50">
                <VideoUrlInput
                  videoUrl={formData.videoUrl}
                  onVideoChange={(url) => handleInputChange('videoUrl', url)}
                />
              </div>

              <div className="space-y-4 pt-6 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Label className="text-base font-bold text-foreground">Architecture & Reference Documents</Label>
                  <span className="text-xs text-muted-foreground">(optional)</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload architectural reference sheets (PDF), README specification layouts, database ERD sketches, or local Markdown guides.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-muted/20 border border-border/50 p-4 rounded-xl">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold">Document Name</Label>
                    <Input 
                      value={docName} 
                      onChange={e => setDocName(e.target.value)} 
                      placeholder="e.g. System ERD Spec v2" 
                      className="bg-background h-10"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-semibold">Document Type</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                      {[
                        { value: 'readme', label: 'README', icon: FileText },
                        { value: 'srs', label: 'SRS Doc', icon: BookOpen },
                        { value: 'erd', label: 'ERD Spec', icon: Database },
                        { value: 'mermaid', label: 'Mermaid', icon: Code },
                        { value: 'other', label: 'Other', icon: HelpCircle }
                      ].map((item) => {
                        const Icon = item.icon
                        const isSelected = docType === item.value
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setDocType(item.value as any)}
                            className={cn(
                              "flex items-center gap-1.5 justify-center py-2 px-2.5 rounded-lg border text-xs font-semibold transition-all duration-200",
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20 scale-[1.02]"
                                : "bg-background text-muted-foreground hover:text-foreground hover:bg-muted border-border"
                            )}
                          >
                            <Icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{item.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="file"
                    accept=".md,.mmd,.pdf,.txt,image/*"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="doc-upload-input"
                    disabled={isUploadingDoc}
                  />
                  <label htmlFor="doc-upload-input" className="block">
                    <div className={cn(
                      "flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/50 group text-center bg-background/30",
                      isUploadingDoc && "pointer-events-none opacity-50"
                    )}>
                      {isUploadingDoc ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary mb-1.5" />
                      ) : (
                        <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary mb-1.5 transition-colors" />
                      )}
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                        {isUploadingDoc ? 'Uploading Document to Cloudflare R2...' : 'Select & Upload Reference File'}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Supports PDF, Markdown (.md, .mmd), Text, or Images</p>
                    </div>
                  </label>
                </div>

                {formData.documents && formData.documents.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-4">
                    {formData.documents.map((doc: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl border border-border/50 text-sm shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-background rounded-lg border">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground truncate max-w-[180px]">{doc.name}</p>
                            <Badge variant="outline" className="text-[9px] uppercase tracking-wider mt-0.5">{doc.type}</Badge>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 h-8 w-8"
                          onClick={() => handleRemoveDocument(idx)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 3: Technology Stack */}
          {currentStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold">Select Technologies Used *</Label>
                <TechStackSelector
                  selectedTech={formData.tech}
                  onTechChange={(tech) => handleInputChange('tech', tech)}
                />
                {errors.tech && <p className="text-xs text-destructive font-semibold">{errors.tech}</p>}
              </div>
            </motion.div>
          )}

          {/* Step 4: Case Study Details */}
          {currentStep === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="longDescription" className="text-sm font-bold">Detailed Story (Markdown supported) *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateStory}
                    disabled={isGeneratingStory}
                    className="gap-2 border-primary/20 hover:border-primary/50 text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    {isGeneratingStory ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating Case Study...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-primary" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => handleInputChange('longDescription', e.target.value)}
                  placeholder="Detail the case study history. Describe architectural diagrams, infrastructure selections, database setup, and workflows."
                  className={cn("min-h-[160px] bg-background/50", errors.longDescription && "border-destructive")}
                />
                {errors.longDescription && <p className="text-xs text-destructive font-semibold">{errors.longDescription}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="challenges" className="text-xs font-semibold">Challenges</Label>
                  <Textarea
                    id="challenges"
                    value={formData.challenges}
                    onChange={(e) => handleInputChange('challenges', e.target.value)}
                    placeholder="Engineering obstacles encountered..."
                    className="min-h-[100px] bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solutions" className="text-xs font-semibold">Solutions</Label>
                  <Textarea
                    id="solutions"
                    value={formData.solutions}
                    onChange={(e) => handleInputChange('solutions', e.target.value)}
                    placeholder="Technical resolutions applied..."
                    className="min-h-[100px] bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="results" className="text-xs font-semibold">Results</Label>
                  <Textarea
                    id="results"
                    value={formData.results}
                    onChange={(e) => handleInputChange('results', e.target.value)}
                    placeholder="Performance metrics, scaling outcomes..."
                    className="min-h-[100px] bg-background/50"
                  />
                </div>
              </div>

              {/* Key Features List */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <Label className="text-sm font-bold">Key Project Features</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="e.g. Real-time Analytics Dashboard"
                    className="h-10 bg-background/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddFeature()
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddFeature}>Add</Button>
                </div>

                {formData.features.length > 0 && (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-muted/20 p-3 rounded-xl border border-border/50">
                    {formData.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-center justify-between text-xs p-2 bg-background rounded-lg border shadow-sm">
                        <span className="font-semibold truncate pr-2">• {feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveFeature(idx)}
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 5: Reference Links */}
          {currentStep === 5 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="link" className="text-sm font-bold">Live Demo URL</Label>
                  <Input
                    id="link"
                    value={formData.link}
                    onChange={(e) => handleInputChange('link', e.target.value)}
                    placeholder="https://example.com"
                    className="h-10 bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="github" className="text-sm font-bold">GitHub Repository</Label>
                  <Input
                    id="github"
                    value={formData.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    placeholder="https://github.com/username/repo"
                    className="h-10 bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentation" className="text-sm font-bold">Documentation URL</Label>
                  <Input
                    id="documentation"
                    value={formData.documentation}
                    onChange={(e) => handleInputChange('documentation', e.target.value)}
                    placeholder="https://docs.example.com"
                    className="h-10 bg-background/50"
                  />
                </div>
              </div>
              {errors.links && <p className="text-xs text-destructive font-semibold">{errors.links}</p>}

              {/* Custom External Resources */}
              <div className="space-y-4 pt-6 border-t border-border/50">
                <Label className="text-sm font-bold">Custom External Links</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    value={newResourceName}
                    onChange={(e) => setNewResourceName(e.target.value)}
                    placeholder="Link Label (e.g. Figma Prototype)"
                    className="bg-background/50"
                  />
                  <Input
                    value={newResourceUrl}
                    onChange={(e) => setNewResourceUrl(e.target.value)}
                    placeholder="Link URL"
                    className="bg-background/50"
                  />
                  <Button type="button" onClick={handleAddResource}>Add Link</Button>
                </div>

                {formData.resources.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {formData.resources.map((res: { name: string, url: string }, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50 text-xs shadow-sm">
                        <span className="font-semibold truncate max-w-[300px]">
                          {res.name}: <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">{res.url}</a>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveResource(idx)}
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 6: Review & Publish */}
          {currentStep === 6 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <Card className="border border-primary/20 bg-gradient-to-br from-background to-primary/5 rounded-xl shadow-inner">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-base text-primary flex items-center gap-2 font-bold">
                    <CheckCircle className="w-5 h-5" />
                    Review Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Project Info</h3>
                      <p className="text-xl font-extrabold text-foreground leading-snug">{formData.title || 'Untitled Project'}</p>
                      <p className="text-xs text-muted-foreground font-semibold">Slug: <span className="font-bold text-foreground">{formData.slug}</span></p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {formData.categories.map((c, i) => (
                          <Badge key={i} variant="secondary">{c}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tech Stack</h3>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.tech.map((t, i) => (
                          <Badge key={i} variant="outline" className="bg-primary/5 font-semibold">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border/60" />

                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Media & Files</h3>
                    {formData.images.length > 0 ? (
                      <div className="flex gap-2.5 overflow-x-auto py-2">
                        {formData.images.map((img, i) => (
                          <div key={i} className="relative w-24 h-16 rounded-xl border border-border/50 overflow-hidden flex-shrink-0 shadow-sm bg-muted">
                            <img src={img} className="object-cover w-full h-full" referrerPolicy="no-referrer" alt="preview" />
                            {i === 0 && <span className="absolute bottom-0 inset-x-0 bg-primary/95 text-primary-foreground text-[9px] text-center font-extrabold py-0.5 uppercase tracking-wider">Cover</span>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic font-medium">No screenshots added yet.</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-muted/40 border border-border/50 rounded-xl shadow-inner">
                    <Switch
                      checked={formData.published}
                      onCheckedChange={(checked) => handleInputChange('published', checked)}
                    />
                    <div>
                      <Label className="text-sm font-bold text-foreground">Published Showcase Visibility</Label>
                      <p className="text-[10px] text-muted-foreground">When toggled, this project will appear live in searches on the portfolio page.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="p-6 border-t border-border/50 bg-muted/10 flex items-center justify-between shadow-inner">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? onCancel : prevStep}
            className="gap-2 px-5 py-2 hover:bg-muted font-bold transition-all shadow-sm border-border"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          {currentStep < 6 ? (
            <Button
              type="button"
              onClick={nextStep}
              className="gap-2 px-6 py-2 shadow font-bold"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4" />
                  {isEdit ? 'Update Project' : 'Publish Project'}
                </>
              )}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

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
  Calendar,
  Tag,
  Image as ImageIcon,
  Code,
  FileText,
  ArrowLeft,
  ArrowRight,
  Rocket
} from 'lucide-react'
import { useCreateProject, useUpdateProject } from '@/hooks/projects'
import { useAuth } from '@/contexts/auth-context'
import { ProjectFormData, Project } from '@/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageUrlInput, ImageGalleryInput } from './image-url-input'
import { VideoUrlInput } from './video-url-input'
import { TechStackSelector } from './tech-stack-selector'
import { CategoryPicker, CompactCategoryPicker } from './category-picker'
import { parseVideoUrl } from '@/lib/utils/video-helpers'

interface EnhancedProjectFormProps {
  project?: Project
  onSuccess?: (project: Project) => void
  onCancel?: () => void
  mode?: 'create' | 'edit'
  className?: string
  onProgressChange?: (progress: number) => void
  currentStep?: number
  onStepChange?: (step: number) => void
}

export function EnhancedProjectForm({
  project,
  onSuccess,
  onCancel,
  mode = 'create',
  className,
  onProgressChange,
  currentStep = 1,
  onStepChange
}: EnhancedProjectFormProps) {
  const { user } = useAuth()
  const { createProject, loading: creating } = useCreateProject()
  const { updateProject, loading: updating } = useUpdateProject()

  // Form state
  const [formData, setFormData] = useState<ProjectFormData>({
    title: project?.title || '',
    description: project?.description || '',
    longDescription: '',
    image: project?.image || '',
    images: project?.images && project.images.length > 0 ? project.images : (project?.image ? [project.image] : []),
    videoUrl: project?.videoUrl || '',
    tech: project?.tech || [],
    categories: project?.categories || (project?.category ? [project.category] : []),
    link: project?.link || '',
    github: project?.github || '',
    published: project?.published || false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [localStep, setLocalStep] = useState(currentStep)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingVideoUrl, setPendingVideoUrl] = useState('')

  const loading = creating || updating
  const isEdit = mode === 'edit' && project
  const activeStep = currentStep || localStep

  // Calculate form progress
  const calculateProgress = () => {
    let completed = 0
    const total = 5

    if (formData.title && formData.description) completed++
    if (formData.image && formData.categories && formData.categories.length > 0) completed++
    if (formData.tech && formData.tech.length > 0) completed++
    if (formData.link || formData.github) completed++
    if (formData.published !== undefined) completed++

    const progress = (completed / total) * 100
    onProgressChange?.(progress)
    return progress
  }

  // Update progress when form data changes
  useEffect(() => {
    calculateProgress()
  }, [formData])

  // Step navigation functions
  const nextStep = () => {
    const next = Math.min(activeStep + 1, 5)
    onStepChange?.(next)
    setLocalStep(next)
  }

  const prevStep = () => {
    const prev = Math.max(activeStep - 1, 1)
    onStepChange?.(prev)
    setLocalStep(prev)
  }

  const goToStep = (step: number) => {
    onStepChange?.(step)
    setLocalStep(step)
  }

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 1:
        if (!formData.title.trim()) newErrors.title = 'Project title is required'
        if (!formData.description.trim()) newErrors.description = 'Project description is required'
        break
      case 2:
        if (!formData.image?.trim()) newErrors.image = 'Project image is required'
        if (!formData.categories || formData.categories.length === 0) newErrors.category = 'Project category is required'
        break
      case 3:
        if (!formData.tech || formData.tech.length === 0) newErrors.tech = 'At least one technology is required'
        break
      case 4:
        if (!formData.link.trim() && !formData.github.trim()) {
          newErrors.links = 'At least one link (demo or GitHub) is required'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    // Check for pending video URL before validation
    let finalVideoUrl = formData.videoUrl
    if (!finalVideoUrl && pendingVideoUrl.trim()) {
      const parsed = parseVideoUrl(pendingVideoUrl.trim())
      if (parsed.isValid) {
        finalVideoUrl = pendingVideoUrl.trim()
      }
    }

    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      goToStep(1) // Go back to first step with errors
      return
    }

    setIsSubmitting(true)
    try {
      // Create submission data with the final video URL
      const submissionData = {
        ...formData,
        videoUrl: finalVideoUrl
      }

      let result
      if (isEdit) {
        result = await updateProject(project!.id, submissionData)
      } else {
        result = await createProject(submissionData)
      }

      if (result) {
        // Add a small delay for better UX
        setTimeout(() => {
          onSuccess?.(result)
        }, 1000)
      }
    } catch (error) {
      console.error('Error saving project:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images,
      image: images[0] || '' // Set first image as cover
    }))
  }

  const steps = [
    { id: 1, title: 'Basic Info', icon: FileText },
    { id: 2, title: 'Details', icon: ImageIcon },
    { id: 3, title: 'Tech Stack', icon: Code },
    { id: 4, title: 'Links', icon: ExternalLink },
    { id: 5, title: 'Review', icon: CheckCircle }
  ]

  return (
    <div className={cn("w-full", className)}>
      <Tabs value={activeStep.toString()} onValueChange={(value) => goToStep(parseInt(value))} className="w-full">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {isEdit ? 'Edit Project' : 'Create New Project'}
              </h2>
              <p className="text-muted-foreground">
                Step {activeStep} of 5
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="gap-2"
              >
                {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPreview ? 'Hide Preview' : 'Preview'}
              </Button>
            </div>
          </div>

          <TabsList className="grid w-full grid-cols-5 p-1 bg-muted/20 backdrop-blur-md border border-border/50 rounded-xl">
            {steps.map((step) => {
              const Icon = step.icon
              const isActive = activeStep === step.id
              return (
                <TabsTrigger
                  key={step.id}
                  value={step.id.toString()}
                  className={cn(
                    "gap-2 transition-all duration-300 rounded-lg",
                    isActive ? "bg-background shadow-sm text-primary" : "hover:text-primary/70"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive && "animate-pulse")} />
                  <span className="hidden sm:inline">{step.title}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>

        <div className="p-6">
          {/* Step 1: Basic Information */}
          <TabsContent value="1" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="border-primary/10 bg-gradient-to-br from-card to-card/50 shadow-sm overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <FileText className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold">Project Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., My Awesome Portfolio"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={cn(
                        "h-11 transition-all focus:ring-2 focus:ring-primary/20",
                        errors.title && 'border-destructive'
                      )}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.title}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold">Short Subtitle *</Label>
                    <Textarea
                      id="description"
                      placeholder="A brief overview of the project (visible on cards)"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={cn(
                        "h-24 resize-none transition-all focus:ring-2 focus:ring-primary/20",
                        errors.description && 'border-destructive'
                      )}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longDescription" className="text-sm font-semibold">Detailed Story</Label>
                    <Textarea
                      id="longDescription"
                      placeholder="Go deep into the challenges, solutions, and tech choices..."
                      value={formData.longDescription}
                      onChange={(e) => handleInputChange('longDescription', e.target.value)}
                      className="min-h-[200px] transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Step 2: Details */}
          <TabsContent value="2" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Project Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Project Category *</Label>
                    <CategoryPicker
                      selectedCategories={formData.categories}
                      onCategoriesChange={(categories) => handleInputChange('categories', categories)}
                    />
                    {errors.category && (
                      <p className="text-sm text-destructive">{errors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Project Images *</Label>
                    <ImageGalleryInput
                      images={formData.images || []}
                      onImagesChange={handleImagesChange}
                    />
                    {errors.image && (
                      <p className="text-sm text-destructive">{errors.image}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <VideoUrlInput
                      videoUrl={formData.videoUrl}
                      onVideoChange={(url) => handleInputChange('videoUrl', url || '')}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Step 3: Tech Stack */}
          <TabsContent value="3" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    Technology Stack
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Technologies Used *</Label>
                    <TechStackSelector
                      selectedTech={formData.tech}
                      onTechChange={(tech) => handleInputChange('tech', tech)}
                    />
                    {errors.tech && (
                      <p className="text-sm text-destructive">{errors.tech}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Step 4: Links */}
          <TabsContent value="4" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-primary" />
                    Project Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="link">Live Demo URL</Label>
                    <Input
                      id="link"
                      type="url"
                      placeholder="https://your-project-demo.com"
                      value={formData.link}
                      onChange={(e) => handleInputChange('link', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub Repository</Label>
                    <Input
                      id="github"
                      type="url"
                      placeholder="https://github.com/username/repository"
                      value={formData.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                    />
                  </div>

                  {errors.links && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{errors.links}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Step 5: Review */}
          <TabsContent value="5" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="border-primary/20 bg-gradient-to-br from-card via-card/50 to-primary/5 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <Rocket className="w-32 h-32 text-primary" />
                </div>

                <CardHeader className="bg-primary/5 border-b border-primary/10">
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <CheckCircle className="w-5 h-5 animate-bounce-slow" />
                    Final Preview & Publish
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Visual Preview */}
                    <div className="lg:col-span-1 space-y-4">
                      <Label className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Appearance</Label>
                      <div className="aspect-video rounded-xl overflow-hidden border-2 border-primary/10 shadow-inner bg-muted">
                        {formData.image ? (
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                            <ImageIcon className="w-8 h-8 opacity-20" />
                            <span className="text-xs">No cover image</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                        <span className="text-sm font-medium">Draft Status</span>
                        <Badge variant={formData.published ? "default" : "secondary"}>
                          {formData.published ? "Ready to fly 🚀" : "Draft ✏️"}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Review */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Title</Label>
                            <p className="text-lg font-bold text-foreground leading-tight">{formData.title || 'Untitled Project'}</p>
                          </div>
                          <div>
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Categories</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {formData.categories?.length ? (
                                formData.categories.map((cat, i) => (
                                  <Badge key={i} variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                                    {cat}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-sm italic text-muted-foreground">No categories</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Tech Stack</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {formData.tech?.map((t, i) => (
                                <Badge key={i} variant="secondary" className="px-2 py-0.5 text-[10px] font-bold">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <Label className="text-xs font-bold uppercase text-muted-foreground">Links</Label>
                            <div className="flex gap-4 mt-1">
                              {formData.link && (
                                <a href={formData.link} target="_blank" className="text-primary hover:scale-110 transition-transform">
                                  <ExternalLink className="w-5 h-5" />
                                </a>
                              )}
                              {formData.github && (
                                <a href={formData.github} target="_blank" className="text-primary hover:scale-110 transition-transform">
                                  <Github className="w-5 h-5" />
                                </a>
                              )}
                              {formData.videoUrl && (
                                <span className="text-primary cursor-help" title="Video included">
                                  <Rocket className="w-5 h-5" />
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-primary/5" />

                      <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label htmlFor="published" className="text-base font-bold text-primary">Ready to publish?</Label>
                            <p className="text-xs text-muted-foreground">
                              Public projects are visible to all visitors in your portfolio.
                            </p>
                          </div>
                          <Switch
                            id="published"
                            checked={formData.published}
                            onCheckedChange={(checked) => handleInputChange('published', checked)}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </div>

        {/* Navigation Footer */}
        <div className="p-6 border-t border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={activeStep === 1 ? onCancel : prevStep}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {activeStep === 1 ? 'Cancel' : 'Previous'}
            </Button>

            <div className="flex items-center gap-3">
              {activeStep < 5 ? (
                <Button
                  onClick={() => {
                    if (validateStep(activeStep)) {
                      nextStep()
                    }
                  }}
                  className="gap-2"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading || isSubmitting}
                  className="gap-2"
                >
                  {loading || isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      {isEdit ? 'Update Project' : 'Create Project'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

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
import { TechStackSelector } from './tech-stack-selector'
import { CategoryPicker, CompactCategoryPicker } from './category-picker'

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
    images: project?.image ? [project.image] : [],
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
        if (!formData.image.trim()) newErrors.image = 'Project image is required'
        if (!formData.category) newErrors.category = 'Project category is required'
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
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
      goToStep(1) // Go back to first step with errors
      return
    }

    setIsSubmitting(true)
    try {
      let result
      if (isEdit) {
        result = await updateProject(project!.id, formData)
      } else {
        result = await createProject(formData)
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

          <TabsList className="grid w-full grid-cols-5">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <TabsTrigger key={step.id} value={step.id.toString()} className="gap-2">
                  <Icon className="w-4 h-4" />
                  {step.title}
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter your project title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className={errors.title ? 'border-destructive' : ''}
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Project Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project in a few sentences"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className={errors.description ? 'border-destructive' : ''}
                      rows={4}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longDescription">Detailed Description</Label>
                    <Textarea
                      id="longDescription"
                      placeholder="Provide more details about your project, challenges faced, solutions implemented, etc."
                      value={formData.longDescription}
                      onChange={(e) => handleInputChange('longDescription', e.target.value)}
                      rows={6}
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
                      selectedCategories={formData.category ? [formData.category] : []}
                      onCategoriesChange={(categories) => handleInputChange('category', categories[0] || '')}
                      maxSelections={1}
                    />
                    {errors.category && (
                      <p className="text-sm text-destructive">{errors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Project Images *</Label>
                    <ImageGalleryInput
                      images={formData.images}
                      onImagesChange={handleImagesChange}
                    />
                    {errors.image && (
                      <p className="text-sm text-destructive">{errors.image}</p>
                    )}
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Review & Publish
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Title</Label>
                        <p className="text-lg font-semibold">{formData.title || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                        <Badge variant="secondary" className="mt-1">
                          {formData.category || 'Not selected'}
                        </Badge>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Technologies</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {formData.tech?.map((tech, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                        <p className="text-sm text-muted-foreground">{formData.description || 'Not provided'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Links</Label>
                        <div className="space-y-1">
                          {formData.link && (
                            <a href={formData.link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" />
                              Live Demo
                            </a>
                          )}
                          {formData.github && (
                            <a href={formData.github} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                              <Github className="w-3 h-3" />
                              GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="published">Publish Project</Label>
                        <p className="text-sm text-muted-foreground">
                          Make your project visible to everyone
                        </p>
                      </div>
                      <Switch
                        id="published"
                        checked={formData.published}
                        onCheckedChange={(checked) => handleInputChange('published', checked)}
                      />
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

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
  FileText
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
import { ImageUrlInput, ImageGalleryInput } from './image-url-input'
import { TechStackSelector } from './tech-stack-selector'
import { CategoryPicker, CompactCategoryPicker } from './category-picker'

interface ProjectFormProps {
  project?: Project // For editing existing project
  onSuccess?: (project: Project) => void
  onCancel?: () => void
  mode?: 'create' | 'edit'
  className?: string
  onProgressChange?: (progress: number) => void
  currentStep?: number
  onStepChange?: (step: number) => void
}

export function ProjectForm({
  project,
  onSuccess,
  onCancel,
  mode = 'create',
  className,
  onProgressChange,
  currentStep = 1,
  onStepChange
}: ProjectFormProps) {
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
    category: project?.category || '',
    link: project?.link || '',
    github: project?.github || '',
    published: project?.published || false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [localStep, setLocalStep] = useState(currentStep)

  const loading = creating || updating
  const isEdit = mode === 'edit' && project
  const activeStep = currentStep || localStep

  // Calculate form progress
  const calculateProgress = () => {
    let completed = 0
    const total = 5

    if (formData.title && formData.description) completed++
    if (formData.image && formData.category) completed++
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

  // Update form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description,
        longDescription: '',
        image: project.image,
        images: project.image ? [project.image] : [],
        tech: project.tech,
        category: project.category,
        link: project.link,
        github: project.github,
        published: project.published
      })
    }
  }, [project])

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Project title is required'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required'
    } else if (formData.description.length > 300) {
      newErrors.description = 'Description must be 300 characters or less'
    }

    if (formData.longDescription && formData.longDescription.length > 2000) {
      newErrors.longDescription = 'Long description must be 2000 characters or less'
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }

    if (formData.tech.length === 0) {
      newErrors.tech = 'Please select at least one technology'
    }

    if (formData.link && !isValidUrl(formData.link)) {
      newErrors.link = 'Please enter a valid URL'
    }

    if (formData.github && !isValidUrl(formData.github)) {
      newErrors.github = 'Please enter a valid GitHub URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert('Please sign in to create/edit projects')
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      let result: Project | null = null

      if (isEdit) {
        result = await updateProject(project.id, formData)
      } else {
        result = await createProject(formData)
      }

      if (result) {
        onSuccess?.(result)
      }
    } catch (error) {
      console.error('Error saving project:', error)
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

  return (
    <div className={cn("space-y-8", className)}>
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm rounded-2xl p-6 border border-border/50"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {isEdit ? 'Edit Project' : 'Project Details'}
            </h2>
          </div>
          <p className="text-muted-foreground">
            {isEdit 
              ? 'Update your project details and settings'
              : 'Fill out the information below to showcase your project'
            }
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Preview
              </>
            )}
          </Button>

          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={loading}
              className="gap-2"
            >
              Cancel
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-6"
        >
          <Card className="border-primary/10 bg-gradient-to-br from-card to-card/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/10">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Title */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
                  Project Title *
                  <span className="text-xs text-muted-foreground font-normal">(Max 100 characters)</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter a compelling project title..."
                  className={cn(
                    "h-12 text-lg transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                    errors.title && "border-red-500 focus:ring-red-500/20"
                  )}
                />
                {errors.title && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </motion.p>
                )}
              </motion.div>

              {/* Description */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="space-y-3"
              >
                <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-2">
                  Short Description *
                  <span className="text-xs text-muted-foreground font-normal">(Max 300 characters)</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Write a compelling description that highlights your project's key features and value..."
                  rows={4}
                  maxLength={300}
                  className={cn(
                    "resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                    errors.description && "border-red-500 focus:ring-red-500/20"
                  )}
                />
                <div className="flex justify-between items-center text-xs">
                  <span className={cn(
                    "transition-colors",
                    formData.description.length > 250 ? "text-amber-600" : "text-muted-foreground"
                  )}>
                    {formData.description.length}/300 characters
                  </span>
                  {errors.description && (
                    <span className="text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.description}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Long Description */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-3"
              >
                <Label htmlFor="longDescription" className="text-sm font-semibold flex items-center gap-2">
                  Detailed Description
                  <span className="text-xs text-muted-foreground font-normal">(Optional - Max 2000 characters)</span>
                </Label>
                <Textarea
                  id="longDescription"
                  value={formData.longDescription}
                  onChange={(e) => handleInputChange('longDescription', e.target.value)}
                  placeholder="Provide detailed information about your project: features, challenges faced, technologies used, lessons learned, etc..."
                  rows={6}
                  maxLength={2000}
                  className={cn(
                    "resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                    errors.longDescription && "border-red-500 focus:ring-red-500/20"
                  )}
                />
                <div className="flex justify-between items-center text-xs">
                  <span className={cn(
                    "transition-colors",
                    formData.longDescription.length > 1800 ? "text-amber-600" : "text-muted-foreground"
                  )}>
                    {formData.longDescription.length}/2000 characters
                  </span>
                  {errors.longDescription && (
                    <span className="text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.longDescription}
                    </span>
                  )}
                </div>
              </motion.div>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-primary/10 bg-gradient-to-br from-card to-card/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/10">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ImageIcon className="w-5 h-5 text-primary" />
                  </div>
                  Project Images
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ImageGalleryInput
                  images={formData.images}
                  onImagesChange={handleImagesChange}
                  maxImages={10}
                />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="border-primary/10 bg-gradient-to-br from-card to-card/50 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/10">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Code className="w-5 h-5 text-primary" />
                  </div>
                  Technology & Category
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 pt-6">
                {/* Category */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-3"
                >
                  <Label className="text-sm font-semibold">Project Category *</Label>
                  <CompactCategoryPicker
                    selectedCategory={formData.category as any}
                    onCategoryChange={(category) => handleInputChange('category', category)}
                  />
                  {errors.category && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.category}
                    </motion.p>
                  )}
                </motion.div>

                {/* Tech Stack */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="space-y-3"
                >
                  <Label className="text-sm font-semibold">Technologies Used *</Label>
                  <TechStackSelector
                    selectedTech={formData.tech}
                    onTechChange={(tech) => handleInputChange('tech', tech)}
                    maxItems={20}
                  />
                  {errors.tech && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" />
                      {errors.tech}
                    </motion.p>
                  )}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Project Link */}
              <div className="space-y-2">
                <Label htmlFor="link">Project URL (Optional)</Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => handleInputChange('link', e.target.value)}
                    placeholder="https://your-project.com"
                    className={cn("pl-10", errors.link && "border-red-500")}
                  />
                </div>
                {errors.link && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.link}
                  </p>
                )}
              </div>

              {/* GitHub Link */}
              <div className="space-y-2">
                <Label htmlFor="github">GitHub Repository (Optional)</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="github"
                    type="url"
                    value={formData.github}
                    onChange={(e) => handleInputChange('github', e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className={cn("pl-10", errors.github && "border-red-500")}
                  />
                </div>
                {errors.github && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.github}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Publishing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published">Publish Project</Label>
                  <p className="text-sm text-gray-500">
                    Make this project visible to others
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => handleInputChange('published', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Submit Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="pt-8"
          >
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        {isEdit ? 'Updating Project...' : 'Creating Project...'}
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-3" />
                        {isEdit ? 'Update Project' : 'Create Project'}
                      </>
                    )}
                  </Button>
                  
                  {onCancel && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onCancel}
                      disabled={loading}
                      className="h-12 px-8 border-primary/20 hover:border-primary/40 transition-all duration-200"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {isEdit 
                      ? 'Your changes will be saved and the project will be updated.'
                      : 'Your project will be created and added to your portfolio.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Enhanced Preview */}
        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/10">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Eye className="w-5 h-5 text-primary" />
                    </div>
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {/* Preview Content */}
                  <div className="space-y-4">
                    {/* Cover Image */}
                    {formData.image && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-muted to-muted/50 shadow-lg"
                      >
                        <img
                          src={formData.image}
                          alt={formData.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </motion.div>
                    )}

                    {/* Title & Description */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent mb-3">
                        {formData.title || 'Project Title'}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {formData.description || 'Project description will appear here...'}
                      </p>
                    </motion.div>

                    {/* Tech Stack */}
                    {formData.tech.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Label className="text-sm font-semibold text-foreground">Technologies Used</Label>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {formData.tech.map((tech, index) => (
                            <motion.span
                              key={tech}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.3 + index * 0.05 }}
                              className="px-3 py-1.5 bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20 text-sm rounded-full font-medium"
                            >
                              {tech}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Links */}
                    {(formData.link || formData.github) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap gap-3"
                      >
                        {formData.link && (
                          <Button size="sm" variant="outline" asChild className="border-primary/20 hover:border-primary/40">
                            <a href={formData.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Live Demo
                            </a>
                          </Button>
                        )}
                        {formData.github && (
                          <Button size="sm" variant="outline" asChild className="border-primary/20 hover:border-primary/40">
                            <a href={formData.github} target="_blank" rel="noopener noreferrer">
                              <Github className="w-4 h-4 mr-2" />
                              View Code
                            </a>
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, 
  Plus, 
  X, 
  Save, 
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const projectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  image: z.string().url('Please enter a valid image URL'),
  tech: z.array(z.string()).min(1, 'At least one technology is required'),
  category: z.string().min(1, 'Category is required'),
  link: z.string().url('Please enter a valid project URL'),
  github: z.string().url('Please enter a valid GitHub URL'),
  published: z.boolean().default(false),
})

type ProjectFormData = z.infer<typeof projectSchema>

const categories = [
  'Full-Stack',
  'Frontend',
  'Backend',
  'Mobile',
  'AI Integration',
  'Data Visualization',
  'Design Tools',
  'E-commerce',
  'CMS',
  'Other'
]

const commonTech = [
  'React',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Python',
  'Firebase',
  'MongoDB',
  'PostgreSQL',
  'Tailwind CSS',
  'OpenAI',
  'AWS',
  'Vercel',
  'Git',
  'Docker',
  'GraphQL',
  'REST API',
  'WebSocket',
  'Redis',
  'Prisma'
]

export function NewProjectPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTech, setNewTech] = useState('')

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      image: '',
      tech: [],
      category: '',
      link: '',
      github: '',
      published: false,
    },
  })

  const watchedTech = form.watch('tech')

  const addTech = (tech: string) => {
    if (tech && !watchedTech.includes(tech)) {
      form.setValue('tech', [...watchedTech, tech])
    }
  }

  const removeTech = (techToRemove: string) => {
    form.setValue('tech', watchedTech.filter(tech => tech !== techToRemove))
  }

  const handleAddCustomTech = () => {
    if (newTech.trim() && !watchedTech.includes(newTech.trim())) {
      addTech(newTech.trim())
      setNewTech('')
    }
  }

  const onSubmit = async (data: ProjectFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create projects.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const projectData = {
        ...data,
        authorId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(collection(db, 'projects'), projectData)

      toast({
        title: "Project created!",
        description: `"${data.title}" has been created successfully.`,
      })

      router.push('/admin/projects')
    } catch (error) {
      console.error('Error creating project:', error)
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/projects')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Project</h1>
          <p className="text-muted-foreground">
            Add a new project to your portfolio
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter project title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your project..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a clear description of what your project does and its key features.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Project Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Live Project URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://your-project.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub Repository URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/username/repo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Technologies */}
              <Card>
                <CardHeader>
                  <CardTitle>Technologies Used</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Selected Technologies</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchedTech.map((tech) => (
                        <Badge key={tech} variant="secondary" className="flex items-center gap-1">
                          {tech}
                          <button
                            type="button"
                            onClick={() => removeTech(tech)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Common Technologies</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonTech.map((tech) => (
                        <Button
                          key={tech}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addTech(tech)}
                          disabled={watchedTech.includes(tech)}
                          className="text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {tech}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom technology..."
                      value={newTech}
                      onChange={(e) => setNewTech(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTech())}
                    />
                    <Button type="button" onClick={handleAddCustomTech} size="sm">
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Image</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('image') && (
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <img
                        src={form.watch('image')}
                        alt="Project preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Publish Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Publish Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="published"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Publish Project
                          </FormLabel>
                          <FormDescription>
                            Make this project visible to visitors
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Create Project
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push('/admin/projects')}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}


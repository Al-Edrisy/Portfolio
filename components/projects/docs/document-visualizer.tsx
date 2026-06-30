"use client"

import { useState, useEffect } from 'react'
import { FileText, Loader2, AlertCircle, ExternalLink, Copy, Check, ChevronRight } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface DocumentVisualizerProps {
  documents: { name: string; url: string; type: 'srs' | 'erd' | 'readme' | 'mermaid' | 'other' }[]
}

export function DocumentVisualizer({ documents }: DocumentVisualizerProps) {
  const [selectedDoc, setSelectedDoc] = useState(documents[0])
  const [content, setContent] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)

  // Fetch document contents if it is text/markdown
  useEffect(() => {
    if (!selectedDoc) return
    
    const isTextDoc = selectedDoc.type === 'readme' || selectedDoc.type === 'srs' || selectedDoc.type === 'mermaid' || selectedDoc.url.endsWith('.md') || selectedDoc.url.endsWith('.mmd') || selectedDoc.url.endsWith('.txt')
    
    if (!isTextDoc) {
      setContent('')
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    setContent('')

    fetch(selectedDoc.url)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load document content')
        return res.text()
      })
      .then(text => {
        setContent(text)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Could not retrieve document contents. Use the link below to open directly.')
        setLoading(false)
      })
  }, [selectedDoc])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
      {/* Sidebar - Document List */}
      <div className="lg:col-span-4 space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Available Documents</h4>
        <div className="flex flex-col gap-2">
          {documents.map((doc, idx) => {
            const isSelected = selectedDoc.url === doc.url
            return (
              <button
                key={idx}
                onClick={() => setSelectedDoc(doc)}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-card text-foreground hover:bg-muted/50 hover:border-border'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <FileText className="w-5 h-5 flex-shrink-0" />
                  <div className="truncate">
                    <p className="font-semibold text-sm truncate">{doc.name}</p>
                    <Badge variant={isSelected ? 'secondary' : 'outline'} className="text-[9px] uppercase mt-0.5">
                      {doc.type}
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 opacity-60" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Viewport - Visualizer */}
      <div className="lg:col-span-8">
        <Card className="border shadow-md h-full min-h-[500px] flex flex-col">
          <CardHeader className="border-b bg-muted/20 flex flex-row items-center justify-between py-4">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {selectedDoc.name}
            </CardTitle>
            <div className="flex items-center gap-2">
              {content && (
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
              <Button variant="outline" size="sm" asChild className="gap-1.5 h-8">
                <a href={selectedDoc.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Link
                </a>
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-6 overflow-y-auto">
            {loading && (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm">Loading document contents...</span>
              </div>
            )}

            {error && (
              <div className="h-64 flex flex-col items-center justify-center gap-2 text-muted-foreground text-center max-w-md mx-auto">
                <AlertCircle className="w-10 h-10 text-destructive" />
                <p className="font-semibold text-sm text-foreground">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                {/* PDF Document View */}
                {selectedDoc.type === 'erd' && selectedDoc.url.endsWith('.pdf') && (
                  <iframe src={selectedDoc.url} className="w-full h-[600px] border rounded-lg" />
                )}

                {/* Image Document View */}
                {selectedDoc.type === 'erd' && (selectedDoc.url.endsWith('.png') || selectedDoc.url.endsWith('.jpg') || selectedDoc.url.endsWith('.webp')) && (
                  <div className="relative rounded-xl overflow-hidden border bg-muted/30 p-2">
                    <img src={selectedDoc.url} className="w-full h-auto object-contain max-h-[600px] rounded-lg" alt={selectedDoc.name} />
                  </div>
                )}

                {/* Markdown documents / Plaintext SRS / README */}
                {(selectedDoc.type === 'readme' || selectedDoc.type === 'srs') && content && (
                  <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                  </article>
                )}

                {/* Mermaid System Architecture Render */}
                {selectedDoc.type === 'mermaid' && content && (
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground">Mermaid chart definition code:</p>
                    <pre className="p-4 bg-muted/60 dark:bg-muted/20 border rounded-xl overflow-x-auto text-xs font-mono">
                      <code>{content}</code>
                    </pre>
                  </div>
                )}

                {/* Fallback View */}
                {!content && selectedDoc.type !== 'erd' && (
                  <div className="h-64 flex flex-col items-center justify-center gap-3 text-center">
                    <FileText className="w-16 h-16 text-muted-foreground/30" />
                    <div>
                      <p className="font-semibold text-foreground">Reference File Attached</p>
                      <p className="text-sm text-muted-foreground">Click the "Open Link" button above to view or download this file.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

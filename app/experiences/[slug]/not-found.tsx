import Link from 'next/link'
import { ArrowLeft, Compass, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ExperienceNotFound() {
  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 mx-auto flex items-center justify-center text-blue-400">
          <Sparkles className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold font-mono">
            404 — Experience Offline
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">
            Brand Canvas Not Found
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            The brand experience you requested does not exist or has not been deployed yet.
            Drop a new JSX file into <code className="text-blue-400 font-mono">experiences/brands/</code> to create it.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/experiences">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-5 text-xs">
              <Compass className="w-4 h-4 mr-2" />
              <span>All Experiences</span>
            </Button>
          </Link>
          <Link href="/projects">
            <Button variant="outline" className="border-slate-800 hover:bg-slate-900 rounded-full text-slate-300 text-xs">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span>Back to Portfolio</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

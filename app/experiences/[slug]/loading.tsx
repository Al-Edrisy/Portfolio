export default function ExperienceLoading() {
  return (
    <div className="min-h-screen bg-[#090A0F] flex items-center justify-center text-slate-400">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <div className="text-center">
          <p className="text-sm font-medium text-slate-200">Initializing Experience</p>
          <p className="text-xs text-slate-500 mt-1">Preparing high-resolution brand canvas...</p>
        </div>
      </div>
    </div>
  )
}

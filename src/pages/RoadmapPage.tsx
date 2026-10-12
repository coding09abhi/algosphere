import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { algorithmCatalog, roadmapLevels } from '../data/algorithms'

const readCompletedSlugs = () => {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem('algosphere:completed') ?? '[]')
    return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

const RoadmapPage = () => {
  const [completedSlugs] = useState<string[]>(readCompletedSlugs)

  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Learning roadmap</p>
        <h1 className="mt-2 text-3xl font-bold text-white">From beginner to advanced DSA</h1>
      </div>

      <div className="grid gap-4">
        {roadmapLevels.map((level) => (
          <div key={level.title} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            {(() => {
              const completedCount = level.algorithmSlugs.filter((slug) => completedSlugs.includes(slug)).length
              const progress = level.algorithmSlugs.length ? Math.round((completedCount / level.algorithmSlugs.length) * 100) : null
              return (
                <>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-cyan-300">{level.title}</div>
                <div className="mt-2 text-xl font-semibold text-white">{level.name}</div>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-cyan-200">
                <CheckCircle2 className="h-4 w-4" />
                {progress === null ? 'Planned' : `${completedCount}/${level.algorithmSlugs.length} complete`}
              </div>
            </div>
            <p className="mb-4 text-slate-300">{level.description}</p>
            {progress !== null && <div className="mb-4 h-2 w-full rounded-full bg-slate-800" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${level.name} completion`}>
              <div className="h-full rounded-full bg-cyan-400 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>}
            <div className="flex flex-wrap gap-2">
              {level.algorithmSlugs.map((slug) => {
                const algorithm = algorithmCatalog.find((entry) => entry.slug === slug)
                if (!algorithm) return null
                return <Link key={slug} to={`/algorithm/${slug}`} className={`rounded-lg border px-2.5 py-1.5 text-xs ${completedSlugs.includes(slug) ? 'border-emerald-500/30 text-emerald-200' : 'border-slate-700 text-slate-300'}`}>{algorithm.title}</Link>
              })}
              {level.plannedTopics?.map((topic) => <span key={topic} className="rounded-lg border border-dashed border-slate-700 px-2.5 py-1.5 text-xs text-slate-500">{topic}</span>)}
            </div>
                </>
              )
            })()}
          </div>
        ))}
      </div>
    </div>
  )
}

export default RoadmapPage

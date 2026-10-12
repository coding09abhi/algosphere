import { useState, type FormEvent } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { algorithmCatalog, featuredAlgorithms, roadmapLevels } from '../data/algorithms'

const readCompletedCount = () => {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem('algosphere:completed') ?? '[]')
    return Array.isArray(stored) ? stored.filter((slug) => typeof slug === 'string').length : 0
  } catch {
    return 0
  }
}

const HomePage = () => {
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const implementedCount = algorithmCatalog.filter((algorithm) => algorithm.implemented).length
  const completedCount = readCompletedCount()
  const categories = Array.from(new Set(algorithmCatalog.map((algorithm) => algorithm.category))).map((category) => ({
    name: category,
    count: algorithmCatalog.filter((algorithm) => algorithm.category === category).length,
  }))

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = search.trim()
    navigate(query ? `/explore?search=${encodeURIComponent(query)}` : '/explore')
  }

  return (
    <div className="space-y-8 pb-8 sm:space-y-10">
      <section className="border-b border-slate-800 pb-8 sm:pb-10">
        <p className="text-sm font-medium text-cyan-300">Interactive DSA learning</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">Algorithms, made visible.</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300">
          Follow real algorithm steps, inspect changing values, and connect each operation to its complexity.
        </p>

        <form onSubmit={submitSearch} className="mt-6 flex w-full max-w-2xl gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 focus-within:border-cyan-400">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search algorithms, patterns, or topics"
              aria-label="Search algorithms, patterns, or topics"
              className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </label>
          <button type="submit" className="min-h-11 rounded-lg bg-cyan-500 px-4 text-sm font-medium text-slate-950 transition-colors hover:bg-cyan-400">Search</button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
          <Link to="/explore" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-800 px-3 text-slate-100 hover:bg-slate-700">
            Browse library <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/complexity-lab" className="inline-flex min-h-10 items-center text-cyan-300 hover:text-cyan-200">Open complexity lab</Link>
          <span>{implementedCount} interactive topics</span>
          <span>{completedCount} marked complete</span>
        </div>
      </section>

      <section aria-labelledby="categories-heading">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="categories-heading" className="text-lg font-semibold text-white">Browse by category</h2>
          <Link to="/explore" className="text-sm text-cyan-300 hover:text-cyan-200">All topics</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map(({ name, count }) => (
            <Link key={name} to={`/explore?category=${encodeURIComponent(name)}`} className="min-h-24 rounded-lg border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-slate-600 hover:bg-slate-800">
              <div className="text-sm font-medium text-slate-100">{name}</div>
              <div className="mt-2 text-xs text-slate-400">{count} topics</div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="featured-heading">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="featured-heading" className="text-lg font-semibold text-white">Featured algorithms</h2>
          <Link to="/explore" className="text-sm text-cyan-300 hover:text-cyan-200">Browse all</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {featuredAlgorithms.slice(0, 4).map((algorithm) => (
            <Link key={algorithm.slug} to={`/algorithm/${algorithm.slug}`} className="rounded-lg border border-slate-800 bg-slate-900 p-4 transition-colors hover:border-slate-600 hover:bg-slate-800">
              <div className="text-xs text-slate-400">{algorithm.category} · {algorithm.difficulty}</div>
              <h3 className="mt-2 font-medium text-white">{algorithm.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{algorithm.description}</p>
              <div className="mt-4 text-xs text-cyan-300">Worst case {algorithm.complexity.worst}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-800 bg-slate-900 p-4 sm:p-5" aria-labelledby="roadmap-heading">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-cyan-300">LEARNING PATH</p>
            <h2 id="roadmap-heading" className="mt-1 text-lg font-semibold text-white">Build skills in sequence</h2>
          </div>
          <Link to="/roadmap" className="text-sm text-cyan-300 hover:text-cyan-200">Full roadmap</Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {roadmapLevels.slice(0, 3).map((level) => (
            <Link key={level.title} to="/roadmap" className="rounded-lg border border-slate-800 bg-slate-950 p-3 hover:border-slate-600">
              <div className="text-xs text-slate-500">{level.title}</div>
              <div className="mt-1 text-sm font-medium text-slate-100">{level.name}</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{level.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HomePage

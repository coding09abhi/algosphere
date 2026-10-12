import { useMemo, useState } from 'react'
import { Bookmark, BookmarkCheck, Filter, Search } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { algorithmCatalog } from '../data/algorithms'

const readSlugList = (key: string): string[] => {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

const ExplorePage = () => {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '')
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') ?? 'All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [bookmarks, setBookmarks] = useState<string[]>(() => readSlugList('algosphere:bookmarks'))
  const [completed] = useState<string[]>(() => readSlugList('algosphere:completed'))

  const categories = ['All', ...new Set(algorithmCatalog.map((item) => item.category))]
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced']

  const filteredAlgorithms = useMemo(() => {
    return algorithmCatalog.filter((algorithm) => {
      const searchableText = [algorithm.title, algorithm.description, ...algorithm.tags, ...algorithm.topics, ...(algorithm.prerequisites ?? [])].join(' ').toLowerCase()
      const matchesSearch = searchableText.includes(search.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || algorithm.category === selectedCategory
      const matchesDifficulty = selectedDifficulty === 'All' || algorithm.difficulty === selectedDifficulty
      return matchesSearch && matchesCategory && matchesDifficulty
    })
  }, [search, selectedCategory, selectedDifficulty])

  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Explore algorithms</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Algorithm library</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-300">
            <Search className="h-4 w-4 text-cyan-300" />
            <input aria-label="Search algorithm catalog" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, topic, or data structure" className="w-full bg-transparent text-white placeholder:text-slate-500 focus:outline-none sm:w-72" />
          </div>
          <div className="text-sm text-slate-400">Progress: <span className="text-emerald-300">{completed.filter((slug) => algorithmCatalog.some((item) => item.slug === slug)).length}</span> / {algorithmCatalog.length} topics</div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-300">
          <Filter className="h-4 w-4 text-cyan-300" />
          Filters
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label htmlFor="category-filter" className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">Category</label>
            <select id="category-filter" value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-none">
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="difficulty-filter" className="mb-2 block text-xs uppercase tracking-[0.18em] text-slate-400">Difficulty</label>
            <select id="difficulty-filter" value={selectedDifficulty} onChange={(event) => setSelectedDifficulty(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:outline-none">
              {difficulties.map((difficulty) => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredAlgorithms.map((algorithm) => (
          <article key={algorithm.slug} className="group rounded-3xl border border-slate-800 bg-slate-900/80 p-5 transition hover:border-cyan-400/40 hover:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-200">{algorithm.implemented ? 'Implemented' : 'Planned'}</span>
                {completed.includes(algorithm.slug) && <span className="text-[10px] uppercase tracking-[0.16em] text-emerald-300">Completed</span>}
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-300">{algorithm.difficulty}</span>
                <button
                  type="button"
                  onClick={() => setBookmarks((current) => {
                    const next = current.includes(algorithm.slug) ? current.filter((slug) => slug !== algorithm.slug) : [...current, algorithm.slug]
                    localStorage.setItem('algosphere:bookmarks', JSON.stringify(next))
                    return next
                  })}
                  aria-label={bookmarks.includes(algorithm.slug) ? `Remove ${algorithm.title} bookmark` : `Bookmark ${algorithm.title}`}
                  aria-pressed={bookmarks.includes(algorithm.slug)}
                  className="rounded-lg border border-slate-700 p-1.5 text-slate-300 hover:border-cyan-400/50 hover:text-cyan-200"
                >
                  {bookmarks.includes(algorithm.slug) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {algorithm.implemented
              ? <Link to={`/algorithm/${algorithm.slug}`} className="text-lg font-semibold text-white hover:text-cyan-200">{algorithm.title}</Link>
              : <div className="text-lg font-semibold text-white">{algorithm.title}</div>}
            <div className="mt-2 text-sm text-slate-400">{algorithm.description}</div>

            <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-300">
              <span className="rounded-full border border-slate-700 px-2 py-1">{algorithm.category}</span>
              <span className="rounded-full border border-slate-700 px-2 py-1">{algorithm.dataStructure}</span>
              <span className="rounded-full border border-slate-700 px-2 py-1">{algorithm.paradigm}</span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3 text-sm text-slate-300">
              <span>Time: {algorithm.complexity.worst}</span>
              {algorithm.implemented ? <Link to={`/algorithm/${algorithm.slug}`} className="text-cyan-300">Open workspace</Link> : <span className="text-slate-400">Planned</span>}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default ExplorePage

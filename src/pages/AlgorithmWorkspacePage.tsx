import { useEffect, useMemo, useRef, useState } from 'react'
import { Editor } from '@monaco-editor/react'
import { AlertTriangle, Check, ChevronRight, Dices, Pause, Play, Redo, RotateCcw, SkipBack, SkipForward } from 'lucide-react'
import { useParams } from 'react-router-dom'
import type * as monaco from 'monaco-editor'
import type { AlgorithmDefinition } from '../types'
import AlgorithmVisualizer from '../components/AlgorithmVisualizer'
import { algorithmCatalog } from '../data/algorithms'
import { getDefaultInput, getSimulationForSlug } from '../lib/simulations/algorithms'

const makeRandomInput = (slug: string) => {
  if (slug === 'fibonacci') return String(5 + Math.floor(Math.random() * 7))
  if (slug === 'kadane-algorithm') return Array.from({ length: 8 }, () => Math.floor(Math.random() * 31) - 15).join(',')
  if (slug === 'binary-search') {
    const sorted = Array.from({ length: 7 }, () => 2 + Math.floor(Math.random() * 45)).sort((a, b) => a - b)
    const target = Math.random() < 0.75 ? sorted[Math.floor(Math.random() * sorted.length)] : 50 + Math.floor(Math.random() * 15)
    return [...sorted, target].join(',')
  }
  if (slug === 'breadth-first-search' || slug === 'depth-first-search') {
    return Math.random() < 0.5 ? 'A-B,C|B-D|C-E|D-E' : 'A-B|B-C,D|C-E|D-E'
  }
  if (slug === 'dijkstras-algorithm' || slug === 'prims-algorithm') {
    return Math.random() < 0.5
      ? 'A-B(4),A-C(2),B-D(5),C-D(1),C-E(6),D-E(2)'
      : 'A-B(3),A-C(7),B-C(2),B-D(6),C-D(4),C-E(5),D-E(1)'
  }
  return Array.from({ length: 6 }, () => 1 + Math.floor(Math.random() * 30)).join(',')
}

const AlgorithmWorkspacePage = () => {
  const { slug } = useParams()
  const algorithm = algorithmCatalog.find((entry) => entry.slug === slug)

  if (!algorithm) {
    return (
      <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-8 text-amber-100">
        <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5" /> Algorithm not found.</div>
      </div>
    )
  }

  return <AlgorithmWorkspace key={algorithm.slug} algorithm={algorithm} />
}

const AlgorithmWorkspace = ({ algorithm }: { algorithm: AlgorithmDefinition }) => {
  const [language, setLanguage] = useState<'python' | 'cpp' | 'java'>('python')
  const [inputValue, setInputValue] = useState(getDefaultInput(algorithm.slug))
  const [speed, setSpeed] = useState(1)
  const simulation = useMemo(() => getSimulationForSlug(algorithm.slug, inputValue), [algorithm.slug, inputValue])
  const [stepIndex, setStepIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const [playbackRun, setPlaybackRun] = useState(0)
  const [completedSlugs, setCompletedSlugs] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('algosphere:completed') ?? '[]')
      return Array.isArray(stored) ? stored.filter((item): item is string => typeof item === 'string') : []
    } catch {
      return []
    }
  })
  const isCompleted = completedSlugs.includes(algorithm.slug)

  const currentStep = simulation[stepIndex] ?? simulation[simulation.length - 1]

  const stopPlayback = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPlaying(false)
  }

  const changeInput = (value: string) => {
    stopPlayback()
    setStepIndex(0)
    setInputValue(value)
  }

  const play = () => {
    if (isPlaying) {
      stopPlayback()
      return
    }

    if (stepIndex >= simulation.length - 1) setStepIndex(0)
    setIsPlaying(true)
  }

  useEffect(() => {
    if (!isPlaying) return

    intervalRef.current = window.setInterval(() => {
      setStepIndex((current) => {
        if (current >= simulation.length - 1) {
          setIsPlaying(false)
          return current
        }
        return current + 1
      })
    }, Math.max(120, 760 / speed))

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [isPlaying, playbackRun, simulation, speed])

  const reset = () => {
    stopPlayback()
    setStepIndex(0)
  }

  const replay = () => {
    setStepIndex(0)
    setPlaybackRun((run) => run + 1)
    setIsPlaying(true)
  }

  const previous = () => {
    stopPlayback()
    setStepIndex((value) => Math.max(0, value - 1))
  }

  const next = () => {
    stopPlayback()
    setStepIndex((value) => Math.min(simulation.length - 1, value + 1))
  }

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const lineNumber = Math.max(1, currentStep.line)
    editor.setPosition({ lineNumber, column: 1 })
    editor.revealLineInCenter(lineNumber)
  }, [currentStep.line])

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">{algorithm.category}</div>
            <h1 className="mt-2 text-3xl font-bold text-white">{algorithm.title}</h1>
            <p className="mt-2 max-w-2xl text-slate-300">{algorithm.description}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <button
              type="button"
              onClick={() => setCompletedSlugs((current) => {
                const next = isCompleted ? current.filter((item) => item !== algorithm.slug) : [...current, algorithm.slug]
                localStorage.setItem('algosphere:completed', JSON.stringify(next))
                return next
              })}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${isCompleted ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200' : 'border-slate-700 bg-slate-950 text-slate-300'}`}
              aria-pressed={isCompleted}
            >
              <Check className="h-3.5 w-3.5" />{isCompleted ? 'Completed' : 'Mark complete'}
            </button>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1">{algorithm.difficulty}</span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1">{algorithm.paradigm}</span>
            <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1">{algorithm.dataStructure}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="space-y-5">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button type="button" onClick={reset} className="rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-200 hover:border-slate-500" aria-label="Reset animation"><RotateCcw className="h-4 w-4" /></button>
                <button type="button" onClick={previous} className="rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-200 hover:border-slate-500" aria-label="Previous step"><SkipBack className="h-4 w-4" /></button>
                <button type="button" onClick={play} className="rounded-xl bg-cyan-400 p-2 text-slate-950 hover:bg-cyan-300" aria-label="Play or pause animation">{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}</button>
                <button type="button" onClick={next} className="rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-200 hover:border-slate-500" aria-label="Next step"><SkipForward className="h-4 w-4" /></button>
                <button type="button" onClick={replay} className="rounded-xl border border-slate-700 bg-slate-950 p-2 text-slate-200 hover:border-slate-500" aria-label="Replay simulation"><Redo className="h-4 w-4" /></button>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm text-slate-200">
                <span>Speed</span>
                <input type="range" min="0.5" max="2" step="0.1" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="accent-cyan-400" aria-label="Animation speed" />
                <span className="w-8 text-right text-cyan-300">{speed.toFixed(1)}x</span>
              </div>
            </div>

            <AlgorithmVisualizer algorithmSlug={algorithm.slug} state={currentStep.state} />
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Simulation controls</h3>
              <div className="text-sm text-cyan-300">Step {Math.min(stepIndex + 1, simulation.length)}/{simulation.length}</div>
            </div>
            <input type="range" min="0" max={Math.max(0, simulation.length - 1)} value={stepIndex} onChange={(event) => { stopPlayback(); setStepIndex(Number(event.target.value)) }} className="mb-4 w-full accent-cyan-400" aria-label="Simulation timeline" />
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="algorithm-input" className="text-xs uppercase tracking-[0.16em] text-slate-400">Custom input</label>
              <button type="button" onClick={() => changeInput(makeRandomInput(algorithm.slug))} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 hover:border-cyan-400/50" aria-label="Generate random input"><Dices className="h-3.5 w-3.5" />Randomize</button>
            </div>
            <textarea id="algorithm-input" value={inputValue} onChange={(event) => changeInput(event.target.value)} className="h-24 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100 focus:outline-none" aria-label="Algorithm input" />
            <div className="mt-4 flex justify-between rounded-2xl border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
              <span>Operation</span>
              <span className="font-medium text-cyan-200">{currentStep.operation}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2" aria-label="Operation counters">
              {Object.entries(currentStep.counters).map(([name, value]) => (
                <span key={name} className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300">{name}: <strong className="text-cyan-200">{value}</strong></span>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-400">Live explanation</div>
            <div className="space-y-3 text-slate-200">
              <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-cyan-300">Current step</div>
                <div className="mt-2 font-medium text-white">{currentStep.title}</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Explanation</div>
                <p className="mt-2">{currentStep.explanation}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Visual change</div>
                <p className="mt-2">{currentStep.description}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Result</div>
                <p className="mt-2">{currentStep.description}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Variable values</div>
                <pre className="mt-2 overflow-x-auto text-xs text-cyan-100">{JSON.stringify(currentStep.state, null, 2)}</pre>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-400">Complexity</div>
            <div className="space-y-3 text-sm text-slate-200">
              <div className="flex justify-between"><span>Best</span><span>{algorithm.complexity.best}</span></div>
              <div className="flex justify-between"><span>Average</span><span>{algorithm.complexity.average ?? algorithm.complexity.worst}</span></div>
              <div className="flex justify-between"><span>Worst</span><span>{algorithm.complexity.worst}</span></div>
              <div className="flex justify-between"><span>Space</span><span>{algorithm.complexity.space}</span></div>
              <p className="border-t border-slate-800 pt-3 text-xs leading-relaxed text-slate-400">{algorithm.complexity.explanation}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-400">Inspector</div>
            <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-3 text-xs text-cyan-100">{JSON.stringify(currentStep.state, null, 2)}</pre>
          </div>
        </aside>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Code panel</h3>
            <div className="flex gap-2">{['python', 'cpp', 'java'].map((option) => (
                <button key={option} type="button" onClick={() => setLanguage(option as 'python' | 'cpp' | 'java')} className={`rounded-full px-2.5 py-1 text-xs uppercase tracking-[0.18em] ${language === option ? 'bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/30' : 'border border-slate-700 text-slate-300'}`}>
                  {option}
                </button>
              ))}</div>
          </div>
          <Editor
            height="280px"
            theme="vs-dark"
            language={language}
            value={algorithm.code[language]}
            onMount={(editor) => {
              editorRef.current = editor
              const lineNumber = Math.max(1, currentStep.line)
              editor.setPosition({ lineNumber, column: 1 })
              editor.revealLineInCenter(lineNumber)
            }}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              renderLineHighlight: 'all',
              lineNumbersMinChars: 3,
            }}
          />
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
          <h3 className="mb-4 text-lg font-semibold text-white">Step history</h3>
          <div className="space-y-2">
            {simulation.slice(0, 8).map((step) => (
              <button key={step.id} type="button" onClick={() => setStepIndex(step.id)} className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left ${step.id === stepIndex ? 'border-cyan-400/40 bg-cyan-500/10' : 'border-slate-700 bg-slate-950/70'}`}>
                <span className="text-sm text-slate-200">{step.title}</span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="mb-3 text-lg font-semibold text-white">Learning notes</h3>
          <div className="grid gap-4 text-sm text-slate-300 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-cyan-300">Prerequisites</div>
              <ul className="list-inside list-disc space-y-1">{(algorithm.prerequisites ?? algorithm.topics).map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            {algorithm.commonMistakes && <div>
              <div className="mb-2 text-amber-300">Common mistakes</div>
              <ul className="list-inside list-disc space-y-1">{algorithm.commonMistakes.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>}
            {algorithm.practiceQuestions && <div className="sm:col-span-2">
              <div className="mb-2 text-emerald-300">Practice prompts</div>
              <ol className="list-inside list-decimal space-y-1">{algorithm.practiceQuestions.map((item) => <li key={item}>{item}</li>)}</ol>
            </div>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="mb-3 text-lg font-semibold text-white">Related topics</h3>
          <div className="flex flex-wrap gap-2">
            {algorithm.topics.map((topic) => (
              <span key={topic} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-200">{topic}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlgorithmWorkspacePage

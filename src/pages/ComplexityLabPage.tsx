import { useMemo, useState } from 'react'

const complexityShapes = [
  { name: 'O(1)', color: 'var(--app-series-cyan)', formula: (_n: number) => 1 },
  { name: 'O(log n)', color: 'var(--app-series-green)', formula: (n: number) => Math.log2(Math.max(n, 2)) },
  { name: 'O(n)', color: 'var(--app-series-blue)', formula: (n: number) => n },
  { name: 'O(n log n)', color: 'var(--app-accent-muted)', formula: (n: number) => n * Math.log2(Math.max(n, 2)) },
  { name: 'O(n²)', color: 'var(--app-series-amber)', formula: (n: number) => n * n },
  { name: 'O(n³)', color: 'var(--app-series-orange)', formula: (n: number) => n * n * n },
  { name: 'O(2ⁿ)', color: 'var(--app-series-red)', formula: (n: number) => 2 ** n },
]

const ComplexityLabPage = () => {
  const [inputSize, setInputSize] = useState(32)
  const [activeCurve, setActiveCurve] = useState('O(n²)')

  const curveSeries = useMemo(() => {
    const xValues = Array.from({ length: 24 }, (_, index) => 1 + ((inputSize - 1) * index) / 23)
    return complexityShapes.map((entry) => ({
      ...entry,
      points: xValues.map((n) => ({ x: n, y: entry.formula(n) })),
    }))
  }, [inputSize])

  const currentInputValues = useMemo(() => {
    const n = inputSize
    return complexityShapes.map((entry) => ({
      name: entry.name,
      color: entry.color,
      value: entry.formula(n),
    }))
  }, [inputSize])

  const svgWidth = 760
  const svgHeight = 280
  const maxLogValue = Math.max(...complexityShapes.map((entry) => Math.log1p(entry.formula(inputSize))), 1)

  return (
    <div className="space-y-8 pb-10">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Complexity Lab</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Big O growth explorer</h1>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-2 text-sm text-slate-200">
            Input size: <span className="font-semibold text-cyan-300">{inputSize}</span>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-5">
          <input type="range" min="8" max="128" step="4" value={inputSize} onChange={(event) => setInputSize(Number(event.target.value))} className="w-full accent-cyan-400" aria-label="Input size slider" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Growth comparison</h2>
            <div className="rounded-full border border-slate-700 bg-slate-950/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">Theoretical</div>
          </div>

          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="h-[300px] w-full overflow-visible rounded-2xl bg-slate-950/60 p-2">
            {[0, 1, 2, 3].map((step) => (
              <line key={step} x1="40" x2={svgWidth - 20} y1={60 + step * 55} y2={60 + step * 55} stroke="var(--viz-grid)" strokeDasharray="4 8" />
            ))}

            {curveSeries.map((curve) => {
              const points = curve.points.map((point) => {
                const x = 40 + (point.x / inputSize) * (svgWidth - 70)
                const y = svgHeight - 24 - ((Math.log1p(point.y) / maxLogValue) * (svgHeight - 60))
                return `${x},${y}`
              })

              return (
                <polyline
                  key={curve.name}
                  points={points.join(' ')}
                  fill="none"
                  stroke={curve.color}
                  strokeWidth={activeCurve === curve.name ? 3.5 : 1.8}
                  opacity={activeCurve === curve.name ? 1 : 0.45}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500"
                />
              )
            })}

            {(() => {
              const selected = complexityShapes.find((entry) => entry.name === activeCurve) ?? complexityShapes[0]
              const x = svgWidth - 30
              const y = svgHeight - 24 - (Math.log1p(selected.formula(inputSize)) / maxLogValue) * (svgHeight - 60)
              return (
                <g>
                  <line x1={x} x2={x} y1="20" y2={svgHeight - 24} stroke="var(--app-muted)" strokeDasharray="4 6" />
                  <circle cx={x} cy={y} r="5" fill={selected.color} stroke="var(--app-text)" strokeWidth="2" />
                </g>
              )
            })()}
            <line x1="40" x2={svgWidth - 20} y1={svgHeight - 24} y2={svgHeight - 24} stroke="var(--app-border-strong)" />
            <line x1="40" x2="40" y1="20" y2={svgHeight - 24} stroke="var(--app-border-strong)" />
            <text x="44" y="18" fill="var(--app-muted)" fontSize="11">Operations (log scale)</text>
            <text x={svgWidth - 86} y={svgHeight - 6} fill="var(--app-muted)" fontSize="11">n = {inputSize}</text>
          </svg>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <h2 className="mb-4 text-xl font-bold text-white">Operation counts</h2>
          <div className="space-y-3 text-sm text-slate-200">
            {currentInputValues.map((entry) => (
              <button
                key={entry.name}
                type="button"
                onClick={() => setActiveCurve(entry.name)}
                className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${activeCurve === entry.name ? 'border-cyan-400/50 bg-cyan-500/10' : 'border-slate-800 bg-slate-950/70'}`}
              >
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}
                </span>
                <span className="font-medium text-cyan-300">{Number(entry.value).toLocaleString(undefined, { maximumFractionDigits: entry.value > 1000 ? 0 : 2 })}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {complexityShapes.map((entry) => (
          <div key={entry.name} className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{entry.name}</h3>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            </div>
            <p className="text-sm text-slate-300">
              {entry.name === 'O(1)' && 'Constant work: the algorithm does not depend on the input size once the operation begins.'}
              {entry.name === 'O(log n)' && 'Each step halves or discards a portion of the remaining search space, so growth is very slow.'}
              {entry.name === 'O(n)' && 'The work scales directly with each input item, usually touched once or a small constant number of times.'}
              {entry.name === 'O(n log n)' && 'This is the classic efficient divide-and-conquer pattern: each level processes all items and splits recursively.'}
              {entry.name === 'O(n²)' && 'Nested loops repeatedly compare or update values, producing a quadratic explosion as inputs grow.'}
              {entry.name === 'O(n³)' && 'Three nested passes create a much steeper growth curve and usually signal an expensive algorithmic pattern.'}
              {entry.name === 'O(2ⁿ)' && 'Each added item doubles the number of possible states, which is why exhaustive search becomes extremely expensive quickly.'}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
        <h3 className="mb-3 text-lg font-semibold text-white">Interpretation</h3>
        <div className="grid gap-4 md:grid-cols-3 text-sm text-slate-300">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-cyan-300">Theoretical growth</div>
            <div className="mt-2">The graph shows how the algorithm scales as input size grows, independent of browser timing.</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-violet-300">Runtime vs theory</div>
            <div className="mt-2">Measured browser runtime is only a real-world approximation; the complexity class explains the structural pattern.</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="text-emerald-300">Why it matters</div>
            <div className="mt-2">A small change in input size can trigger a massive jump in work for quadratic and exponential algorithms.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ComplexityLabPage

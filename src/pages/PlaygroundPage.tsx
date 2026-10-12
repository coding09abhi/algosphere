import { useState } from 'react'

const PlaygroundPage = () => {
  const [numbers, setNumbers] = useState('8, 2, 6, 4, 9')
  const [stackItems, setStackItems] = useState([10, 20, 30])

  const values = numbers.split(',').map((item) => Number(item.trim())).filter((value) => Number.isFinite(value))

  const pushValue = () => {
    setStackItems((current) => [...current, current.length > 0 ? current[current.length - 1] + 10 : 10])
  }

  const popValue = () => {
    setStackItems((current) => current.slice(0, -1))
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Playground</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Data structure sandbox</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <h2 className="mb-3 text-xl font-bold text-white">Array explorer</h2>
          <textarea value={numbers} onChange={(event) => setNumbers(event.target.value)} className="h-28 w-full rounded-2xl border border-slate-700 bg-slate-950 p-3 text-slate-100 focus:outline-none" />
          <div className="mt-4 flex flex-wrap gap-2">
            {values.length ? values.map((value, index) => (
              <div key={`${value}-${index}`} className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-100">{value}</div>
            )) : <span className="text-slate-400">Enter valid numbers to visualize the array.</span>}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <h2 className="mb-3 text-xl font-bold text-white">Stack controls</h2>
          <div className="flex gap-2">
            <button type="button" onClick={pushValue} className="rounded-xl bg-cyan-400 px-3 py-2 font-medium text-slate-950">Push</button>
            <button type="button" onClick={popValue} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 font-medium text-slate-100">Pop</button>
          </div>
          <div className="mt-4 flex min-h-40 flex-col justify-end gap-2">
            {stackItems.map((value, index) => (
              <div key={`${value}-${index}`} className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-center text-sm font-medium text-cyan-100">{value}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaygroundPage

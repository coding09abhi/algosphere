import type { SimulationState } from '../types'

type Props = {
  algorithmSlug: string
  state: SimulationState
}

const graphNodes: Record<string, [number, number]> = {
  A: [320, 64],
  B: [500, 142],
  C: [140, 142],
  D: [470, 278],
  E: [170, 278],
}

const graphEdges = [
  { from: 'A', to: 'B', weight: 4 },
  { from: 'A', to: 'C', weight: 2 },
  { from: 'B', to: 'D', weight: 5 },
  { from: 'C', to: 'D', weight: 1 },
  { from: 'C', to: 'E', weight: 6 },
  { from: 'D', to: 'E', weight: 2 },
]

const strings = (value: unknown): string[] => Array.isArray(value) ? value.map(String) : []
const numbers = (value: unknown): number[] => Array.isArray(value) ? value.map(Number) : []

const GraphVisualization = ({ algorithmSlug, state }: Props) => {
  const nodes = strings(state.nodes)
  const encodedEdges = strings(state.graphEdges)
  const edges = encodedEdges.length
    ? encodedEdges.map((entry) => {
        const [connection, rawWeight] = entry.split(':')
        const [from, to] = (connection ?? '').split('-')
        return { from, to, weight: Number(rawWeight) || 1 }
      })
    : graphEdges
  const visibleNodes = nodes.length ? nodes : Object.keys(graphNodes)
  const nodePosition = (node: string): [number, number] => {
    if (graphNodes[node]) return graphNodes[node]
    const index = visibleNodes.indexOf(node)
    const angle = (index / Math.max(visibleNodes.length, 1)) * Math.PI * 2 - Math.PI / 2
    return [320 + Math.cos(angle) * 210, 170 + Math.sin(angle) * 120]
  }
  const visited = strings(state.visited)
  const frontier = strings(state.frontier)
  const mst = strings(state.mst)
  const selectedEdges = strings(state.selectedEdges)
  const candidates = strings(state.candidates)
  const distances = strings(state.distances).reduce<Record<string, string>>((result, entry) => {
    const [node, distance] = entry.split(':')
    if (node) result[node] = distance ?? '∞'
    return result
  }, {})
  const current = typeof state.current === 'string' ? state.current : ''
  const activeEdge = typeof state.activeEdge === 'string' ? state.activeEdge : ''
  const isWeighted = algorithmSlug === 'dijkstras-algorithm' || algorithmSlug === 'prims-algorithm'
  const traversed = strings(state.traversedEdges)

  return (
    <svg viewBox="0 0 640 340" role="img" aria-label={`${algorithmSlug.replaceAll('-', ' ')} graph visualization`} className="h-full w-full">
      {edges.map(({ from, to, weight }) => {
        const [x1, y1] = nodePosition(from)
        const [x2, y2] = nodePosition(to)
        const edgeKey = `${from}-${to}`
        const reverseKey = `${to}-${from}`
        const chosen = selectedEdges.includes(edgeKey) || selectedEdges.includes(reverseKey)
        const active = activeEdge === edgeKey || activeEdge === reverseKey
        const explored = traversed.includes(edgeKey) || traversed.includes(reverseKey)
        const candidate = candidates.some((entry) => entry.startsWith(`${edgeKey}:`) || entry.startsWith(`${reverseKey}:`))
        const edgeColor = chosen || explored ? 'var(--app-success)' : active ? 'var(--app-warning)' : candidate ? 'var(--app-accent-strong)' : 'var(--app-border-strong)'
        const midpointX = (x1 + x2) / 2
        const midpointY = (y1 + y2) / 2

        return (
          <g key={edgeKey}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={edgeColor} strokeWidth={active || chosen || explored ? 3 : 1.5} className="transition-all duration-500" />
            {(isWeighted || candidates.length > 0) && (
              <g>
                <rect x={midpointX - 13} y={midpointY - 13} width="26" height="22" rx="8" fill="var(--app-bg)" />
                <text x={midpointX} y={midpointY + 3} textAnchor="middle" className="fill-slate-200 text-[12px]">{weight}</text>
              </g>
            )}
          </g>
        )
      })}
      {visibleNodes.map((node) => {
        const [x, y] = nodePosition(node)
        const isVisited = visited.includes(node) || mst.includes(node)
        const isActive = current === node || frontier.includes(node)
        return (
          <g key={node} className="transition-all duration-500">
            <circle cx={x} cy={y} r="28" fill={isActive ? 'var(--app-accent)' : isVisited ? 'var(--app-success)' : 'var(--viz-array-base)'} stroke={isActive ? 'var(--app-accent-strong)' : isVisited ? 'var(--app-success-soft)' : 'var(--app-border-strong)'} strokeWidth={isActive ? 3 : 1.5} className="transition-all duration-500" />
            <text x={x} y={y + 5} textAnchor="middle" className="fill-white text-[15px] font-semibold">{node}</text>
            {isWeighted && <text x={x} y={y + 47} textAnchor="middle" className="fill-slate-300 text-[12px]">d={distances[node] ?? '∞'}</text>}
          </g>
        )
      })}
      {isWeighted && <text x="24" y="28" className="fill-slate-400 text-[12px]">Edge labels show weights; node labels show best-known distance.</text>}
    </svg>
  )
}

const ArrayVisualization = ({ algorithmSlug, state }: Props) => {
  const hasArrayState = Array.isArray(state.array)
  const values = hasArrayState ? numbers(state.array) : [9, 4, 6, 2, 7, 1]
  const safeValues = values
  const compared = numbers(state.compared)
  const sorted = numbers(state.sorted)
  const activeRange = numbers(state.activeRange)
  const isSearch = algorithmSlug === 'binary-search' || algorithmSlug === 'linear-search'
  const isBinarySearch = algorithmSlug === 'binary-search'
  const low = typeof state.low === 'number' ? state.low : 0
  const mid = typeof state.mid === 'number' ? state.mid : -1
  const index = typeof state.index === 'number' ? state.index : -1
  const high = typeof state.high === 'number' ? state.high : safeValues.length - 1
  const target = typeof state.target === 'number' ? state.target : null
  const examined = numbers(state.examined)
  const activeIndex = isBinarySearch ? mid : index
  const width = Math.max(520, safeValues.length * 78 + 48)
  const itemWidth = Math.min(62, (width - 48) / safeValues.length - 10)
  const maxMagnitude = Math.max(...safeValues.map(Math.abs), 1)

  return (
    <svg viewBox={`0 0 ${width} 340`} role="img" aria-label={`${algorithmSlug.replaceAll('-', ' ')} array visualization`} className="h-full w-full">
      <line x1="24" x2={width - 24} y1={isSearch ? 210 : 190} y2={isSearch ? 210 : 190} stroke="var(--app-border-strong)" />
      {safeValues.length === 0 && <text x={width / 2} y="170" textAnchor="middle" className="fill-slate-400 text-[14px]">Enter numeric values to visualize this algorithm.</text>}
      {safeValues.map((value, index) => {
        const x = 24 + index * ((width - 48) / safeValues.length) + ((width - 48) / safeValues.length - itemWidth) / 2
        const inRange = !isSearch || (isBinarySearch ? index >= low && index <= high : !examined.includes(index) || index === activeIndex)
        const isActive = isSearch ? index === activeIndex : compared.includes(index)
        const isSorted = sorted.includes(index)
        const isInRange = activeRange.length === 2 && index >= activeRange[0] && index <= activeRange[1]
        const color = !inRange ? 'var(--app-border-strong)' : isActive ? 'var(--app-accent)' : isSorted ? 'var(--app-success)' : isInRange ? 'var(--app-warning)' : 'var(--viz-array-base)'
        const height = 20 + (Math.abs(value) / maxMagnitude) * 100
        const elementY = isSearch ? 108 : value >= 0 ? 190 - height : 190

        return (
          <g key={`${index}-${value}`} className="transition-all duration-500" style={{ opacity: inRange ? 1 : 0.3 }}>
            {isSearch ? (
              <circle cx={x + itemWidth / 2} cy={elementY + 26} r="25" fill={color} stroke={isActive ? 'var(--app-accent-soft)' : 'var(--app-border-strong)'} strokeWidth={isActive ? 3 : 1} className="transition-all duration-500" />
            ) : (
              <rect x={x} y={elementY} width={itemWidth} height={height} rx="7" fill={color} className="transition-all duration-500" />
            )}
            <text x={x + itemWidth / 2} y={isSearch ? elementY + 31 : value >= 0 ? elementY - 10 : elementY + height + 17} textAnchor="middle" className="fill-white text-[14px] font-semibold">{value}</text>
            <text x={x + itemWidth / 2} y="328" textAnchor="middle" className="fill-slate-500 text-[11px]">{index}</text>
            {isBinarySearch && index === low && <text x={x + itemWidth / 2} y="86" textAnchor="middle" className="fill-cyan-300 text-[12px]">low</text>}
            {isBinarySearch && index === mid && <text x={x + itemWidth / 2} y="72" textAnchor="middle" className="fill-amber-300 text-[12px]">mid</text>}
            {isBinarySearch && index === high && <text x={x + itemWidth / 2} y="86" textAnchor="middle" className="fill-violet-300 text-[12px]">high</text>}
            {!isBinarySearch && isSearch && index === activeIndex && <text x={x + itemWidth / 2} y="86" textAnchor="middle" className="fill-cyan-300 text-[12px]">index</text>}
            {isSearch && target === value && index === activeIndex && <text x={x + itemWidth / 2} y="185" textAnchor="middle" className="fill-emerald-300 text-[12px]">target</text>}
          </g>
        )
      })}
    </svg>
  )
}

const LinearStructureVisualization = ({ algorithmSlug, state }: Props) => {
  const queueMode = algorithmSlug === 'fifo-queue'
  const values = numbers(queueMode ? state.queue : state.stack)
  const top = typeof state.top === 'number' ? state.top : values.length - 1
  const front = typeof state.front === 'number' ? state.front : 0
  const cellWidth = Math.min(78, 560 / Math.max(values.length, 1))
  const width = Math.max(360, values.length * cellWidth + 64)
  const horizontal = queueMode
  const getX = (index: number) => horizontal ? 32 + index * cellWidth + cellWidth / 2 : 300
  const getY = (index: number) => horizontal ? 152 : 274 - index * 54

  return (
    <svg viewBox={`0 0 ${width} 320`} role="img" aria-label={queueMode ? 'FIFO queue visualization' : 'Stack visualization'} className="h-full w-full">
      {values.length === 0 && <text x={width / 2} y="164" textAnchor="middle" className="fill-slate-400 text-[14px]">Structure is empty</text>}
      {values.map((value, index) => {
        const x = getX(index)
        const y = getY(index)
        const isFront = queueMode && index === front
        const isTop = !queueMode && index === top
        return (
          <g key={`${value}-${index}`} className="transition-all duration-500">
            <rect x={x - 24} y={y - 24} width="48" height="48" rx="14" fill={isFront || isTop ? 'var(--app-accent)' : 'var(--viz-array-base)'} stroke={isFront || isTop ? 'var(--app-accent-strong)' : 'var(--app-border-strong)'} className="transition-all duration-500" />
            <text x={x} y={y + 5} textAnchor="middle" className="fill-white text-[14px] font-semibold">{value}</text>
            {(isFront || isTop) && <text x={x} y={y + 44} textAnchor="middle" className="fill-cyan-300 text-[12px]">{isFront ? 'front' : 'top'}</text>}
            {queueMode && index === values.length - 1 && <text x={x} y={y - 38} textAnchor="middle" className="fill-emerald-300 text-[12px]">rear</text>}
          </g>
        )
      })}
      {queueMode && values.length > 0 && <line x1="20" x2={width - 20} y1="202" y2="202" stroke="var(--app-border-strong)" strokeWidth="1" />}
    </svg>
  )
}

const DynamicProgrammingVisualization = ({ state }: Pick<Props, 'state'>) => {
  const values = numbers(state.dp)
  const current = typeof state.current === 'number' ? state.current : -1
  const cellWidth = Math.min(64, 560 / Math.max(values.length, 1))
  const width = Math.max(360, values.length * cellWidth + 48)

  return (
    <svg viewBox={`0 0 ${width} 220`} role="img" aria-label="Fibonacci dynamic programming table" className="h-full w-full">
      <text x="24" y="38" className="fill-slate-400 text-[12px]">fib(index)</text>
      {values.map((value, index) => {
        const x = 24 + index * cellWidth
        const active = index === current
        return (
          <g key={index} className="transition-all duration-500">
            <text x={x + cellWidth / 2} y="70" textAnchor="middle" className="fill-slate-400 text-[11px]">{index}</text>
            <rect x={x + 2} y="82" width={cellWidth - 4} height="54" rx="8" fill={active ? 'var(--app-accent)' : 'var(--app-success)'} stroke={active ? 'var(--app-accent-strong)' : 'var(--app-success-soft)'} className="transition-all duration-500" />
            <text x={x + cellWidth / 2} y="115" textAnchor="middle" className="fill-white text-[14px] font-semibold">{value}</text>
            {index > 1 && <path d={`M ${x + cellWidth / 2} 154 l 0 18 m -4 -4 l 4 4 l 4 -4`} stroke="var(--app-accent-strong)" fill="none" strokeWidth="1.5" />}
          </g>
        )
      })}
      {values.length === 0 && <text x="320" y="120" textAnchor="middle" className="fill-slate-400 text-[14px]">The table fills from the smallest subproblems.</text>}
    </svg>
  )
}

const AlgorithmVisualizer = ({ algorithmSlug, state }: Props) => {
  const isGraph = ['breadth-first-search', 'depth-first-search', 'dijkstras-algorithm', 'prims-algorithm'].includes(algorithmSlug)
  const isStructure = algorithmSlug === 'fifo-queue' || algorithmSlug === 'stack'
  const isDynamic = algorithmSlug === 'fibonacci'

  return (
    <div className="h-[320px] w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70 p-3 sm:h-[360px]" aria-live="polite">
      <div className="h-full min-w-[340px]">
        {isGraph ? <GraphVisualization algorithmSlug={algorithmSlug} state={state} /> : isStructure ? <LinearStructureVisualization algorithmSlug={algorithmSlug} state={state} /> : isDynamic ? <DynamicProgrammingVisualization state={state} /> : <ArrayVisualization algorithmSlug={algorithmSlug} state={state} />}
      </div>
    </div>
  )
}

export default AlgorithmVisualizer
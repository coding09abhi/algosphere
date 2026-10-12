import type { SimulationStep } from '../../types'

const toIntList = (raw: string): number[] => raw.split(/[\s,]+/).map((part) => part.trim()).filter(Boolean).map(Number).filter(Number.isFinite)

const makeStep = (id: number, title: string, description: string, explanation: string, operation: string, line: number, state: Record<string, unknown>, counters: Record<string, number>): SimulationStep => ({
  id,
  title,
  description,
  explanation,
  operation,
  line,
  state: state as Record<string, number[] | string[] | number | string | boolean | null>,
  counters,
})

export const getDefaultInput = (slug: string): string => {
  const defaults: Record<string, string> = {
    'fifo-queue': '10,20,30,40',
    stack: '12,8,5',
    'bubble-sort': '9,4,6,2,7,1',
    'insertion-sort': '8,3,6,2,7,1',
    'selection-sort': '9,4,6,2,7,1',
    'linear-search': '14,3,22,9,17,22',
    'kadane-algorithm': '-2,1,-3,4,-1,2,1,-5,4',
    'binary-search': '2,5,9,12,18,25,30',
    'merge-sort': '7,3,9,1,6,4,8',
    'breadth-first-search': 'A-B,C|B-D|C-E|D-E',
    'depth-first-search': 'A-B,C|B-D|C-E|D-E',
    'dijkstras-algorithm': 'A-B(4),A-C(2),B-D(5),C-D(1),C-E(6),D-E(2)',
    'prims-algorithm': 'A-B(4),A-C(2),B-D(5),C-D(1),C-E(6),D-E(2)',
    fibonacci: '7',
  }

  return defaults[slug] ?? '10,20,30,40'
}

type GraphEdge = { from: string; to: string; weight: number }

const parseGraphInput = (valueInput: string, weighted = false) => {
  const adjacency = new Map<string, { node: string; weight: number }[]>()
  const edges: GraphEdge[] = []
  const edgeKeys = new Set<string>()
  const addNode = (node: string) => {
    if (!adjacency.has(node)) adjacency.set(node, [])
  }
  const addEdge = (from: string, to: string, weight: number) => {
    if (!from || !to || from === to) return
    addNode(from)
    addNode(to)
    adjacency.get(from)?.push({ node: to, weight })
    adjacency.get(to)?.push({ node: from, weight })
    const key = [from, to].sort().join('-')
    if (!edgeKeys.has(key)) {
      edgeKeys.add(key)
      edges.push({ from, to, weight })
    }
  }

  if (weighted) {
    const pattern = /([A-Za-z0-9]+)-([A-Za-z0-9]+)\((\d+(?:\.\d+)?)\)/g
    for (const match of valueInput.matchAll(pattern)) addEdge(match[1], match[2], Number(match[3]))
  } else {
    for (const entry of valueInput.split('|')) {
      const separator = entry.indexOf('-')
      if (separator < 0) continue
      const from = entry.slice(0, separator).trim()
      for (const to of entry.slice(separator + 1).split(',').map((node) => node.trim())) addEdge(from, to, 1)
    }
  }

  if (adjacency.size === 0) return parseGraphInput(getDefaultInput(weighted ? 'dijkstras-algorithm' : 'breadth-first-search'), weighted)
  return { adjacency, edges, nodes: Array.from(adjacency.keys()) }
}

const graphState = (graph: ReturnType<typeof parseGraphInput>) => ({
  nodes: graph.nodes,
  graphEdges: graph.edges.map(({ from, to, weight }) => `${from}-${to}:${weight}`),
})

export const simulateQueue = (valueInput: string): SimulationStep[] => {
  const values = toIntList(valueInput)
  const queue: number[] = []
  const steps: SimulationStep[] = []
  steps.push(makeStep(0, 'Initialize queue', 'Queue is empty and ready to accept new items.', 'The front and rear pointers are positioned to start at the empty state.', 'start', 1, { queue: [], front: 0, rear: -1, size: 0 }, { enqueues: 0, dequeues: 0 }))

  values.forEach((value, index) => {
    queue.push(value)
    const currentRear = queue.length - 1
    steps.push(
      makeStep(
        index + 1,
        'Enqueue',
        `Added ${value} to the rear of the queue.`,
        `${value} enters at the back, while the front pointer stays fixed until the item is removed.`,
        'enqueue', index + 2,
        { queue: [...queue], front: 0, rear: currentRear, size: queue.length },
        { enqueues: index + 1, dequeues: 0 },
      ),
    )
  })

  if (queue.length > 0) {
    const removed = queue.shift()
    steps.push(
      makeStep(
        values.length + 1,
        'Dequeue',
        `Removed ${removed} from the front of the queue.`,
        'FIFO ensures the oldest item leaves first because it was inserted earliest and sits at the head of the queue.',
        'dequeue', values.length + 3,
        { queue: [...queue], front: 0, rear: Math.max(queue.length - 1, -1), size: queue.length },
        { enqueues: values.length, dequeues: 1 },
      ),
    )
  }

  return steps
}

export const simulateStack = (valueInput: string): SimulationStep[] => {
  const values = toIntList(valueInput)
  const stack: number[] = []
  const steps: SimulationStep[] = []
  steps.push(makeStep(0, 'Initialize stack', 'The stack begins empty.', 'The top pointer is positioned at the beginning of the stack.', 'start', 1, { stack: [], top: -1 }, { pushes: 0, pops: 0 }))

  values.forEach((value, index) => {
    stack.push(value)
    steps.push(
      makeStep(
        index + 1,
        'Push',
        `Pushed ${value} onto the stack.`,
        'LIFO behavior means the newest value becomes the top item and is the next one to be removed.',
        'push', index + 2,
        { stack: [...stack], top: stack.length - 1 },
        { pushes: index + 1, pops: 0 },
      ),
    )
  })

  if (stack.length > 0) {
    const popped = stack.pop()
    steps.push(
      makeStep(
        values.length + 1,
        'Pop',
        `Popped ${popped} off the stack.`,
        'The top element was removed first because a stack follows last-in-first-out order.',
        'pop', values.length + 3,
        { stack: [...stack], top: stack.length - 1 },
        { pushes: values.length, pops: 1 },
      ),
    )
  }

  return steps
}

export const simulateBubbleSort = (valueInput: string): SimulationStep[] => {
  const values = toIntList(valueInput)
  const arr = [...values]
  const steps: SimulationStep[] = []
  steps.push(makeStep(0, 'Initial array', 'The unsorted list is ready for comparison.', 'Bubble sort repeatedly checks adjacent values and swaps when they are out of order.', 'start', 1, { array: [...arr], compared: [], sorted: [] }, { comparisons: 0, swaps: 0 }))

  let comparisons = 0
  let swaps = 0
  for (let i = 0; i < arr.length; i += 1) {
    for (let j = 0; j < arr.length - i - 1; j += 1) {
      comparisons += 1
      const compared = [j, j + 1]
      if (arr[j] > arr[j + 1]) {
        ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swaps += 1
        steps.push(
          makeStep(
            steps.length,
            'Swap adjacent items',
            `Compared ${arr[j]} and ${arr[j + 1]} and swapped them because the left value was larger.`,
            'This moves the larger value toward the end of the list, which is the essence of bubble sort.',
            'compare', j + 2,
            { array: [...arr], compared: compared.map((idx) => idx), sorted: Array.from({ length: i }, (_, idx) => arr.length - idx - 1) },
            { comparisons, swaps },
          ),
        )
      } else {
        steps.push(
          makeStep(
            steps.length,
            'Compare adjacent items',
            `Compared ${arr[j]} and ${arr[j + 1]} and kept them in order.`,
            'No swap was needed because the left value was already smaller than the right value.',
            'compare', j + 2,
            { array: [...arr], compared: compared.map((idx) => idx), sorted: Array.from({ length: i }, (_, idx) => arr.length - idx - 1) },
            { comparisons, swaps },
          ),
        )
      }
    }
  }

  steps.push(makeStep(steps.length, 'Array sorted', 'All values are now in ascending order.', 'The final pass confirms that every pair is in correct order.', 'done', arr.length + 2, { array: [...arr], compared: [], sorted: arr.map((_, idx) => idx) }, { comparisons, swaps }))
  return steps
}

export const simulateInsertionSort = (valueInput: string): SimulationStep[] => {
  const arr = toIntList(valueInput)
  const steps: SimulationStep[] = [makeStep(0, 'Initial array', 'The array is ready; the first item is a sorted prefix of length one.', 'Insertion sort grows a sorted prefix by moving each next value left until it reaches its correct position.', 'start', 1, { array: [...arr], compared: [], sorted: arr.length ? [0] : [] }, { comparisons: 0, swaps: 0 })]
  let comparisons = 0
  let swaps = 0

  for (let index = 1; index < arr.length; index += 1) {
    let cursor = index
    while (cursor > 0) {
      comparisons += 1
      const leftValue = arr[cursor - 1]
      const currentValue = arr[cursor]
      const shouldSwap = leftValue > currentValue
      if (shouldSwap) {
        ;[arr[cursor - 1], arr[cursor]] = [arr[cursor], arr[cursor - 1]]
        swaps += 1
      }
      steps.push(makeStep(steps.length, shouldSwap ? 'Move value left' : 'Correct position found', shouldSwap ? `${currentValue} moved left past ${leftValue}.` : `${currentValue} is already after a value no larger than itself.`, 'Compare the next value with its left neighbor. Keep moving left only while the pair is out of order.', 'compare', 4, { array: [...arr], compared: [cursor - 1, cursor], sorted: Array.from({ length: index + 1 }, (_, sortedIndex) => sortedIndex) }, { comparisons, swaps }))
      if (!shouldSwap) break
      cursor -= 1
    }
  }

  steps.push(makeStep(steps.length, 'Array sorted', 'Every value has been inserted into the sorted prefix.', 'The prefix grows until it contains the entire array, so the array is sorted in place.', 'done', 5, { array: [...arr], compared: [], sorted: arr.map((_, index) => index) }, { comparisons, swaps }))
  return steps
}

export const simulateSelectionSort = (valueInput: string): SimulationStep[] => {
  const arr = toIntList(valueInput)
  const steps: SimulationStep[] = [makeStep(0, 'Initial array', 'The unsorted array is ready for its first minimum scan.', 'Selection sort repeatedly finds the smallest remaining value and places it at the next output position.', 'start', 1, { array: [...arr], compared: [], sorted: [] }, { comparisons: 0, swaps: 0 })]
  let comparisons = 0
  let swaps = 0

  for (let boundary = 0; boundary < arr.length; boundary += 1) {
    let minimumIndex = boundary
    for (let index = boundary + 1; index < arr.length; index += 1) {
      comparisons += 1
      const previousMinimum = arr[minimumIndex]
      const isNewMinimum = arr[index] < previousMinimum
      if (isNewMinimum) minimumIndex = index
      steps.push(makeStep(steps.length, isNewMinimum ? 'New minimum found' : 'Check candidate', `${arr[index]} ${isNewMinimum ? 'is smaller than' : 'is not smaller than'} the previous minimum ${previousMinimum}.`, 'Scan the unsorted suffix and keep the index of its smallest value.', 'compare', 5, { array: [...arr], compared: [minimumIndex, index], minIndex: minimumIndex, sorted: Array.from({ length: boundary }, (_, sortedIndex) => sortedIndex) }, { comparisons, swaps }))
    }

    if (minimumIndex !== boundary) {
      ;[arr[boundary], arr[minimumIndex]] = [arr[minimumIndex], arr[boundary]]
      swaps += 1
      steps.push(makeStep(steps.length, 'Place minimum', `Move ${arr[boundary]} into its final position at index ${boundary}.`, 'Only after the full suffix has been checked do we place its minimum at the boundary.', 'swap', 7, { array: [...arr], compared: [boundary, minimumIndex], sorted: Array.from({ length: boundary + 1 }, (_, sortedIndex) => sortedIndex) }, { comparisons, swaps }))
    }
  }

  steps.push(makeStep(steps.length, 'Array sorted', 'The sorted prefix now covers the complete array.', 'Each pass permanently places one minimum value, so no later pass needs to revisit it.', 'done', 8, { array: [...arr], compared: [], sorted: arr.map((_, index) => index) }, { comparisons, swaps }))
  return steps
}

export const simulateLinearSearch = (valueInput: string): SimulationStep[] => {
  const values = toIntList(valueInput)
  const target = values.at(-1) ?? 0
  const arr = values.slice(0, -1)
  const examined: number[] = []
  const steps: SimulationStep[] = [makeStep(0, 'Start at index 0', `Search from left to right for ${target}.`, 'Linear search does not need the array to be sorted; it checks each value until the target is found.', 'start', 1, { array: arr, index: -1, target, examined }, { comparisons: 0 })]

  for (let index = 0; index < arr.length; index += 1) {
    examined.push(index)
    const found = arr[index] === target
    steps.push(makeStep(steps.length, found ? 'Target found' : 'Check next value', found ? `${target} is at index ${index}.` : `${arr[index]} is not ${target}, so continue to the next index.`, 'A value can be ruled out only after comparing it directly with the target; no ordering assumption is used.', 'compare', 3, { array: arr, index, target, examined: [...examined], found }, { comparisons: index + 1 }))
    if (found) return steps
  }

  steps.push(makeStep(steps.length, 'Target not found', `${target} does not appear in the array.`, 'Every array position was checked, so there is no remaining candidate.', 'done', 5, { array: arr, index: -1, target, examined: [...examined], found: false }, { comparisons: arr.length }))
  return steps
}

export const simulateKadane = (valueInput: string): SimulationStep[] => {
  const arr = toIntList(valueInput)
  if (arr.length === 0) return [makeStep(0, 'No numeric values', 'Enter at least one number to find a maximum subarray.', 'A contiguous subarray must contain at least one array value.', 'empty', 1, { array: [], currentSum: 0, maxSum: 0, activeRange: [], bestRange: [] }, { comparisons: 0, bestUpdates: 0 })]
  let currentSum = arr[0]
  let currentStart = 0
  let bestSum = arr[0]
  let bestStart = 0
  let bestEnd = 0
  let comparisons = 0
  const steps: SimulationStep[] = [makeStep(0, 'Initialize running best', `Start with ${arr[0]} as both the current and best sum.`, 'Any maximum subarray must contain at least one value, so the first item is a valid starting answer.', 'start', 2, { array: arr, index: 0, currentSum, maxSum: bestSum, activeRange: [0, 0], bestRange: [0, 0] }, { comparisons, bestUpdates: 0 })]
  let bestUpdates = 0

  for (let index = 1; index < arr.length; index += 1) {
    comparisons += 1
    if (arr[index] > currentSum + arr[index]) {
      currentSum = arr[index]
      currentStart = index
    } else {
      currentSum += arr[index]
    }
    if (currentSum > bestSum) {
      bestSum = currentSum
      bestStart = currentStart
      bestEnd = index
      bestUpdates += 1
    }
    steps.push(makeStep(steps.length, 'Extend or restart window', `At index ${index}, the best ending-here sum is ${currentSum}; the overall best is ${bestSum}.`, 'Compare starting a new subarray here with extending the previous one. A negative running prefix can only make future sums smaller.', 'compare', 3, { array: arr, index, currentSum, maxSum: bestSum, activeRange: [currentStart, index], bestRange: [bestStart, bestEnd] }, { comparisons, bestUpdates }))
  }

  steps.push(makeStep(steps.length, 'Maximum subarray found', `The maximum sum is ${bestSum}, from index ${bestStart} through ${bestEnd}.`, 'The running best-ending-here value was updated once per item, so the largest recorded sum is the answer.', 'done', 4, { array: arr, index: bestEnd, currentSum, maxSum: bestSum, activeRange: [bestStart, bestEnd], bestRange: [bestStart, bestEnd] }, { comparisons, bestUpdates }))
  return steps
}

export const simulateBinarySearch = (valueInput: string): SimulationStep[] => {
  const values = toIntList(valueInput)
  const target = values.at(-1) ?? values[0] ?? 0
  const arr = [...values.slice(0, -1)]
  const steps: SimulationStep[] = []
  let left = 0
  let right = arr.length - 1

  steps.push(makeStep(0, 'Initialize search', `Target ${target} is being searched in the sorted range.`, 'Binary search narrows the search interval by repeatedly discarding half the array.', 'start', 1, { array: [...arr], low: left, mid: -1, high: right, target }, { comparisons: 0 }))

  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const current = arr[mid]
    steps.push(
      makeStep(
        steps.length,
        current === target ? 'Match found' : 'Check middle value',
        current === target ? `The target ${target} was found at index ${mid}.` : `Compared the middle value ${current} to the target ${target}.`,
        current === target ? 'The algorithm stops when the probe reaches the target value.' : 'If the middle value is too small, move the low pointer right; otherwise move the high pointer left.',
        'search', mid + 2,
        { array: [...arr], low: left, mid, high: right, target },
        { comparisons: steps.length },
      ),
    )

    if (current === target) {
      return steps
    }

    if (current < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  steps.push(makeStep(steps.length, 'Target not found', `The target ${target} is not present in the array.`, 'The search interval becomes empty, which means the target does not exist in the input set.', 'done', arr.length + 3, { array: [...arr], low: left, mid: -1, high: right, target }, { comparisons: steps.length }))
  return steps
}

export const simulateMergeSort = (valueInput: string): SimulationStep[] => {
  const values = toIntList(valueInput)
  const arr = [...values]
  const steps: SimulationStep[] = []

  const mergeSort = (data: number[], startIdx: number): number[] => {
    if (data.length <= 1) return data
    const mid = Math.floor(data.length / 2)
    const left = mergeSort(data.slice(0, mid), startIdx)
    const right = mergeSort(data.slice(mid), startIdx + mid)
    const merged: number[] = []
    let i = 0
    let j = 0
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        merged.push(left[i])
        i += 1
      } else {
        merged.push(right[j])
        j += 1
      }
    }
    merged.push(...left.slice(i), ...right.slice(j))
    steps.push(makeStep(steps.length, 'Merge sorted halves', `Merged the current partitions into ${merged.join(', ')}.`, 'A merge combines two sorted sequences while preserving the order of all values.', 'merge', startIdx + 2, { array: [...merged], activeRange: [startIdx, startIdx + merged.length - 1] }, { comparisons: merged.length }))
    return merged
  }

  steps.push(makeStep(0, 'Split array', 'The initial array is divided into smaller recursive segments.', 'Merge sort recursively splits the input until each subarray has a single element.', 'split', 1, { array: [...arr], activeRange: [0, arr.length - 1] }, { comparisons: 0 }))
  mergeSort(arr, 0)
  steps.push(makeStep(steps.length, 'Final order ready', `The arrays are merged back into sorted order: ${arr.slice().sort((a, b) => a - b).join(', ')}.`, 'The final merge phase guarantees a fully ordered array.', 'done', arr.length + 2, { array: [...arr].sort((a, b) => a - b), activeRange: [0, arr.length - 1] }, { comparisons: arr.length }))
  return steps
}

export const simulateBFS = (valueInput: string): SimulationStep[] => {
  const graph = parseGraphInput(valueInput)
  const steps: SimulationStep[] = []
  const visited = new Set<string>()
  const traversedEdges: string[] = []
  const start = graph.nodes[0] ?? 'A'
  const queue: string[] = [start]
  visited.add(start)
  steps.push(makeStep(0, 'Initialize BFS', `${start} starts in the queue and is marked as visited.`, 'BFS explores all nodes in the same depth layer before moving to deeper neighbors.', 'start', 1, { ...graphState(graph), queue: [...queue], visited: Array.from(visited), frontier: [start], traversedEdges }, { visitedCount: visited.size }))

  while (queue.length) {
    const node = queue.shift() ?? ''
    const neighbors = graph.adjacency.get(node) ?? []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.node)) {
        visited.add(neighbor.node)
        traversedEdges.push(`${node}-${neighbor.node}`)
        queue.push(neighbor.node)
        steps.push(
          makeStep(
            steps.length,
            `Discover ${neighbor.node}`,
            `${neighbor.node} was added to the traversal queue from ${node}.`,
            'Because BFS uses a queue, nodes are visited in order of increasing distance from the start.',
            'queue', 3,
            { ...graphState(graph), queue: [...queue], visited: Array.from(visited), frontier: [node, neighbor.node], current: node, activeEdge: `${node}-${neighbor.node}`, traversedEdges: [...traversedEdges] },
            { visitedCount: visited.size },
          ),
        )
      }
    }
    steps.push(makeStep(steps.length, `Process ${node}`, `${node} is expanded and its neighbors are evaluated.`, 'Every edge incident to this node is considered exactly once in a standard BFS traversal.', 'visit', 4, { ...graphState(graph), queue: [...queue], visited: Array.from(visited), frontier: [node], current: node, activeEdge: '', traversedEdges: [...traversedEdges] }, { visitedCount: visited.size }))
  }

  return steps
}

export const simulateDFS = (valueInput: string): SimulationStep[] => {
  const graph = parseGraphInput(valueInput)
  const visited = new Set<string>()
  const recursionPath: string[] = []
  const traversedEdges: string[] = []
  const steps: SimulationStep[] = []

  const dfs = (node: string): void => {
    visited.add(node)
    recursionPath.push(node)
    steps.push(makeStep(steps.length, `Visit ${node}`, `${node} is now active in the DFS call stack.`, 'DFS goes as deep as possible before it backtracks to another branch.', 'visit', 2, { ...graphState(graph), stack: [...recursionPath], visited: Array.from(visited), current: node, traversedEdges: [...traversedEdges] }, { visitedCount: visited.size }))
    for (const neighbor of graph.adjacency.get(node) ?? []) {
      if (!visited.has(neighbor.node)) {
        traversedEdges.push(`${node}-${neighbor.node}`)
        steps.push(makeStep(steps.length, `Explore ${neighbor.node}`, `${node} leads to ${neighbor.node}, which is not yet discovered.`, 'The traversal descends into a new branch and keeps exploring until reaching a dead end.', 'explore', 3, { ...graphState(graph), stack: [...recursionPath, neighbor.node], visited: Array.from(visited), current: neighbor.node, activeEdge: `${node}-${neighbor.node}`, traversedEdges: [...traversedEdges] }, { visitedCount: visited.size }))
        dfs(neighbor.node)
        steps.push(makeStep(steps.length, `Backtrack to ${node}`, `The branch from ${neighbor.node} is complete, so DFS returns to ${node}.`, 'The recursive call returns to its parent when every neighbor in the deeper branch has been checked.', 'backtrack', 5, { ...graphState(graph), stack: [...recursionPath], visited: Array.from(visited), current: node, traversedEdges: [...traversedEdges] }, { visitedCount: visited.size }))
      } else {
        steps.push(makeStep(steps.length, `Skip visited ${neighbor.node}`, `The node ${neighbor.node} is already visited.`, 'Backtracking prevents cycles and avoids redundant work.', 'skip', 4, { ...graphState(graph), stack: [...recursionPath], visited: Array.from(visited), current: node, activeEdge: `${node}-${neighbor.node}`, traversedEdges: [...traversedEdges] }, { visitedCount: visited.size }))
      }
    }
    recursionPath.pop()
  }

  if (graph.nodes[0]) dfs(graph.nodes[0])
  return steps
}

export const simulateDijkstra = (valueInput: string): SimulationStep[] => {
  const graph = parseGraphInput(valueInput, true)
  const start = graph.nodes[0] ?? 'A'
  const distances = new Map<string, number>(graph.nodes.map((node) => [node, Number.POSITIVE_INFINITY]))
  distances.set(start, 0)
  const visited = new Set<string>()
  const parents = new Map<string, string>()
  const steps: SimulationStep[] = []
  const distanceState = () => Array.from(distances.entries()).map(([node, value]) => `${node}:${Number.isFinite(value) ? value : '∞'}`)
  const pathState = () => Array.from(parents.entries()).map(([node, parent]) => `${parent}-${node}`)
  steps.push(makeStep(0, 'Initialize distances', `${start} has a tentative distance of 0 and all others are infinite.`, 'Dijkstra starts from the source vertex and relaxes candidate edges outward.', 'start', 1, { ...graphState(graph), distances: distanceState(), visited: Array.from(visited), current: start, selectedEdges: [] }, { settled: 0 }))

  while (visited.size < graph.nodes.length) {
    const current = Array.from(distances.entries()).filter(([node]) => !visited.has(node)).sort((a, b) => a[1] - b[1])[0]
    if (!current) break
    const [node, distance] = current
    if (!Number.isFinite(distance)) break
    visited.add(node)
    steps.push(makeStep(steps.length, `Settle ${node}`, `${node} is the next closest vertex with a tentative cost of ${distance}.`, 'When a node is settled, its edges are relaxed and shorter candidate paths are remembered.', 'relax', 2, { ...graphState(graph), distances: distanceState(), visited: Array.from(visited), current: node, selectedEdges: pathState() }, { settled: visited.size }))

    const neighbors = graph.adjacency.get(node) ?? []
    for (const edge of neighbors) {
      if (visited.has(edge.node)) continue
      const nextDistance = distance + edge.weight
      const previous = distances.get(edge.node) ?? Number.POSITIVE_INFINITY
      if (nextDistance < previous) {
        distances.set(edge.node, nextDistance)
        parents.set(edge.node, node)
        steps.push(makeStep(steps.length, `Relax ${edge.node}`, `${edge.node} gets a better distance via ${node}: ${nextDistance}.`, 'Edge relaxation updates the best known route if the newly found path is shorter.', 'relax', 3, { ...graphState(graph), distances: distanceState(), visited: Array.from(visited), current: node, activeEdge: `${node}-${edge.node}`, selectedEdges: pathState() }, { settled: visited.size }))
      } else {
        steps.push(makeStep(steps.length, `Keep ${edge.node}`, `The route through ${node} costs ${nextDistance}, so its current distance ${Number.isFinite(previous) ? previous : '∞'} stays.`, 'A longer route cannot improve the best-known distance, so the existing value is kept.', 'compare', 3, { ...graphState(graph), distances: distanceState(), visited: Array.from(visited), current: node, activeEdge: `${node}-${edge.node}`, selectedEdges: pathState() }, { settled: visited.size }))
      }
    }
  }

  return steps
}

export const simulatePrim = (valueInput: string): SimulationStep[] => {
  const graph = parseGraphInput(valueInput, true)
  const start = graph.nodes[0] ?? 'A'
  const visited = new Set<string>([start])
  const available: { weight: number; from: string; to: string }[] = []
  const selectedEdges: string[] = []
  const steps: SimulationStep[] = []
  const candidateState = () => available.map((entry) => `${entry.from}-${entry.to}:${entry.weight}`)

  steps.push(makeStep(0, 'Start MST', `${start} is the initial node of the minimum spanning tree.`, 'Prim starts with a single tree and grows it outward by choosing the cheapest crossing edge.', 'start', 1, { ...graphState(graph), mst: [start], candidates: [], selectedEdges }, { edgesChosen: 0 }))

  for (const edge of graph.adjacency.get(start) ?? []) {
    available.push({ weight: edge.weight, from: start, to: edge.node })
  }

  while (available.length > 0) {
    available.sort((a, b) => a.weight - b.weight)
    const next = available.shift()
    if (!next || visited.has(next.to)) continue
    visited.add(next.to)
    selectedEdges.push(`${next.from}-${next.to}`)
    steps.push(
      makeStep(
        steps.length,
        `Add ${next.to}`,
        `Selected edge ${next.from}-${next.to} with weight ${next.weight}.`,
        'Choosing the minimum edge crossing the cut preserves the cut property and keeps the spanning tree light.',
        'select', 2,
        { ...graphState(graph), mst: Array.from(visited), candidates: candidateState(), selectedEdges: [...selectedEdges], activeEdge: `${next.from}-${next.to}`, current: next.to },
        { edgesChosen: visited.size - 1 },
      ),
    )
    for (const edge of graph.adjacency.get(next.to) ?? []) {
      if (!visited.has(edge.node)) {
        available.push({ weight: edge.weight, from: next.to, to: edge.node })
      }
    }
  }

  return steps
}

export const simulateFibonacci = (valueInput: string): SimulationStep[] => {
  const n = Number.parseInt(valueInput, 10) || 7
  const steps: SimulationStep[] = []
  const memo = new Map<number, number>()
  const fibMemo = (value: number): number => {
    if (value <= 1) return value
    if (memo.has(value)) return memo.get(value) ?? 0
    const result = fibMemo(value - 1) + fibMemo(value - 2)
    memo.set(value, result)
    steps.push(makeStep(steps.length, `Compute fib(${value})`, `Memoized ${value} equals ${result}.`, 'Memoization reuses previously computed subproblems instead of recalculating them.', 'memo', value + 1, { memo: Array.from(memo.entries()).map(([key, val]) => `${key}:${val}`), current: value }, { computed: memo.size }))
    return result
  }

  steps.push(makeStep(0, 'Start dynamic programming', `We solve fib(${n}) using memoization and tabulation.`, 'This comparison highlights why DP is faster than naive recursion when the same states are revisited repeatedly.', 'start', 1, { memo: [], current: n }, { computed: 0 }))
  const memoResult = fibMemo(n)
  const tab = [0, 1]
  for (let i = 2; i <= n; i += 1) {
    tab[i] = tab[i - 1] + tab[i - 2]
    steps.push(makeStep(steps.length, `Tabulate fib(${i})`, `The DP table stores ${tab[i]}.`, 'Tabulation fills the table from the bottom up, producing each value once with a simple recurrence.', 'tabulate', i + 2, { dp: tab, current: i }, { computed: i }))
  }

  steps.push(makeStep(steps.length, 'Result', `fib(${n}) = ${tab[n]} and memoized result = ${memoResult}.`, 'Both strategies avoid repeated recomputation and dramatically reduce the time compared with naive recursion.', 'done', n + 5, { dp: tab, memo: Array.from(memo.entries()).map(([key, val]) => `${key}:${val}`) }, { computed: n }))
  return steps
}

export const getSimulationForSlug = (slug: string, input: string): SimulationStep[] => {
  switch (slug) {
    case 'fifo-queue':
      return simulateQueue(input)
    case 'stack':
      return simulateStack(input)
    case 'bubble-sort':
      return simulateBubbleSort(input)
    case 'insertion-sort':
      return simulateInsertionSort(input)
    case 'selection-sort':
      return simulateSelectionSort(input)
    case 'linear-search':
      return simulateLinearSearch(input)
    case 'kadane-algorithm':
      return simulateKadane(input)
    case 'binary-search':
      return simulateBinarySearch(input)
    case 'merge-sort':
      return simulateMergeSort(input)
    case 'breadth-first-search':
      return simulateBFS(input)
    case 'depth-first-search':
      return simulateDFS(input)
    case 'dijkstras-algorithm':
      return simulateDijkstra(input)
    case 'prims-algorithm':
      return simulatePrim(input)
    case 'fibonacci':
      return simulateFibonacci(input)
    default:
      return simulateQueue(input)
  }
}

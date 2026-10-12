import { describe, expect, it } from 'vitest'
import { algorithmCatalog } from '../../data/algorithms'
import { getSimulationForSlug } from './algorithms'

describe('simulation generators', () => {
  it('creates FIFO queue steps in order', () => {
    const steps = getSimulationForSlug('fifo-queue', '10,20,30')
    expect(steps[0].title).toBe('Initialize queue')
    expect(steps[1].title).toBe('Enqueue')
    expect(steps[steps.length - 1].title).toBe('Dequeue')
  })

  it('sorts a list with bubble sort and keeps deterministic steps', () => {
    const steps = getSimulationForSlug('bubble-sort', '9,4,6,2,7,1')
    expect(steps[steps.length - 1].title).toBe('Array sorted')
    expect(steps[steps.length - 1].state.array).toEqual([1, 2, 4, 6, 7, 9])
  })

  it('sorts with insertion and selection sort', () => {
    const insertion = getSimulationForSlug('insertion-sort', '8,3,6,2,7,1')
    const selection = getSimulationForSlug('selection-sort', '9,4,6,2,7,1')
    expect(insertion.at(-1)?.state.array).toEqual([1, 2, 3, 6, 7, 8])
    expect(selection.at(-1)?.state.array).toEqual([1, 2, 4, 6, 7, 9])
    expect(insertion.at(-1)?.counters.comparisons).toBeGreaterThan(0)
  })

  it('stops linear search at the matching index', () => {
    const steps = getSimulationForSlug('linear-search', '14,3,22,9,17,22')
    expect(steps.at(-1)?.title).toBe('Target found')
    expect(steps.at(-1)?.state.index).toBe(2)
    expect(steps.at(-1)?.counters.comparisons).toBe(3)
  })

  it('tracks the maximum subarray sum and its range', () => {
    const steps = getSimulationForSlug('kadane-algorithm', '-2,1,-3,4,-1,2,1,-5,4')
    expect(steps.at(-1)?.state.maxSum).toBe(6)
    expect(steps.at(-1)?.state.bestRange).toEqual([3, 6])
  })

  it('returns an explanatory step for invalid numeric input', () => {
    const steps = getSimulationForSlug('kadane-algorithm', 'not numbers')
    expect(steps).toHaveLength(1)
    expect(steps[0].title).toBe('No numeric values')
    expect(steps[0].state.array).toEqual([])
  })

  it('registers every new simulation with code in all three languages', () => {
    for (const slug of ['insertion-sort', 'selection-sort', 'linear-search', 'kadane-algorithm']) {
      const algorithm = algorithmCatalog.find((entry) => entry.slug === slug)
      expect(algorithm?.implemented).toBe(true)
      expect(algorithm?.code.python).toBeTruthy()
      expect(algorithm?.code.cpp).toBeTruthy()
      expect(algorithm?.code.java).toBeTruthy()
    }
  })

  it('returns binary search steps that converge on the target', () => {
    const steps = getSimulationForSlug('binary-search', '2,5,9,12,18,25,30,25')
    const found = steps.find((step) => step.title === 'Match found')
    expect(found).toBeTruthy()
  })

  it('generates BFS traversal steps for a graph', () => {
    const steps = getSimulationForSlug('breadth-first-search', 'A-B,C|B-D|C-E|D-E')
    expect(steps.length).toBeGreaterThan(4)
    expect(steps[0].title).toBe('Initialize BFS')
  })

  it('uses custom graph input to drive traversal state', () => {
    const steps = getSimulationForSlug('breadth-first-search', 'P-Q|Q-R')
    expect(steps[0].state.nodes).toEqual(['P', 'Q', 'R'])
    expect(steps[0].state.graphEdges).toEqual(['P-Q:1', 'Q-R:1'])
    expect(steps.some((step) => String(step.state.traversedEdges).includes('P-Q'))).toBe(true)
  })

  it('exposes shortest-path and selected spanning-tree edges', () => {
    const dijkstraSteps = getSimulationForSlug('dijkstras-algorithm', 'P-Q(7),Q-R(3),P-R(20)')
    expect(dijkstraSteps.at(-1)?.state.distances).toEqual(['P:0', 'Q:7', 'R:10'])
    expect(dijkstraSteps.at(-1)?.state.selectedEdges).toEqual(['P-Q', 'Q-R'])

    const primSteps = getSimulationForSlug('prims-algorithm', 'P-Q(7),Q-R(3),P-R(20)')
    expect(primSteps.at(-1)?.state.selectedEdges).toEqual(['P-Q', 'Q-R'])
  })
})

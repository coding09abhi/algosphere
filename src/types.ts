export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export type AlgorithmCategory =
  | 'Foundations'
  | 'Arrays and Strings'
  | 'Linked Lists'
  | 'Stacks and Queues'
  | 'Searching and Sorting'
  | 'Trees and Heaps'
  | 'Graph Algorithms'
  | 'Dynamic Programming'
  | 'Backtracking'
  | 'Greedy Algorithms'
  | 'String Algorithms'

export type AlgorithmDefinition = {
  id: string
  slug: string
  title: string
  category: AlgorithmCategory
  difficulty: Difficulty
  description: string
  paradigm: string
  dataStructure: string
  topics: string[]
  prerequisites?: string[]
  commonMistakes?: string[]
  practiceQuestions?: string[]
  complexity: {
    best: string
    average?: string
    worst: string
    space: string
    explanation: string
  }
  implemented: boolean
  code: {
    python: string
    cpp: string
    java: string
  }
  tags: string[]
}

export type SimulationState = Record<string, number[] | string[] | number | string | boolean | null>

export type SimulationStep = {
  id: number
  title: string
  description: string
  explanation: string
  operation: string
  line: number
  state: SimulationState
  counters: Record<string, number>
}

export type ComplexityPoint = {
  label: string
  value: number
}

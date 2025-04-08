export type Cell = {
  row: number
  col: number
  isWall: boolean
  isVisited: boolean
  isPath: boolean
  isStart: boolean
  isEnd: boolean
  distance: number
  fScore: number
  gScore: number
  hScore: number
  previousNode: [number, number] | null
}

export type GridState = "idle" | "generating" | "visualizing"

export type AlgorithmType = "recursiveBacktracking" | "prims" | "kruskals" | "aStar" | "dijkstra"

export type TabType = "generation" | "pathfinding"

export type ViewMode = "standard" | "comparison"

export type MazeGenerationResult = {
  grid: Cell[][]
  steps: Cell[][]
}

export type PathfindingResult = {
  grid: Cell[][]
  steps: Cell[][]
  visitedNodesCount: number
  pathLength: number
}

export type PerformanceData = {
  visitedNodes: number
  pathLength: number
  executionTime: number
}

export type MazeTemplate = {
  id: string
  name: string
  description: string
  grid: { isWall: boolean }[][]
}

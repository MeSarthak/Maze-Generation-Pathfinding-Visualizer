import { useState, useEffect, useRef } from "react"
import MazeGrid from "./components/maze-grid"
import ControlPanel from "./components/control-panel"
import AlgorithmTabs from "./components/algorithm-tabs"
import PerformanceMetrics from "./components/performance-metrics"
import AlgorithmInfo from "./components/algorithm-info"
import GridControls from "./components/grid-controls"
import { Button } from "./components/ui/button"
import { Download, Upload } from "lucide-react"
import { generateMaze } from "./lib/maze-generators"
import { findPath } from "./lib/pathfinding"

export default function MazeVisualizer() {
  const [gridSize, setGridSize] = useState({ rows: 25, cols: 40 })
  const [grid, setGrid] = useState([])
  const [startCell, setStartCell] = useState([5, 5])
  const [endCell, setEndCell] = useState([20, 35])
  const [animationSpeed, setAnimationSpeed] = useState(50)
  const [gridState, setGridState] = useState("idle")
  const [activeTab, setActiveTab] = useState("generation")
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("recursiveBacktracking")
  const [isDragging, setIsDragging] = useState(null)
  const [performanceData, setPerformanceData] = useState({
    visitedNodes: 0,
    pathLength: 0,
    executionTime: 0,
  })
  const [stepMode, setStepMode] = useState(false)

  const fileInputRef = useRef(null)
  const animationRef = useRef(null)
  const animationStepsRef = useRef([])
  const currentStepRef = useRef(0)

  useEffect(() => {
    initializeGrid()
  }, [gridSize])

  const initializeGrid = () => {
    const newGrid = []
    for (let row = 0; row < gridSize.rows; row++) {
      const currentRow = []
      for (let col = 0; col < gridSize.cols; col++) {
        currentRow.push({
          row,
          col,
          isWall: false,
          isVisited: false,
          isPath: false,
          isStart: row === startCell[0] && col === startCell[1],
          isEnd: row === endCell[0] && col === endCell[1],
          distance: Number.POSITIVE_INFINITY,
          fScore: Number.POSITIVE_INFINITY,
          gScore: Number.POSITIVE_INFINITY,
          hScore: 0,
          previousNode: null,
        })
      }
      newGrid.push(currentRow)
    }
    setGrid(newGrid)
  }

  const handleCellClick = (row, col) => {
    if (gridState !== "idle") return

    const newGrid = [...grid]
    const cell = newGrid[row][col]

    if (cell.isStart || cell.isEnd) return

    cell.isWall = !cell.isWall
    setGrid(newGrid)
  }

  const handleCellMouseDown = (row, col) => {
    if (gridState !== "idle") return

    const cell = grid[row][col]
    if (cell.isStart) {
      setIsDragging("start")
    } else if (cell.isEnd) {
      setIsDragging("end")
    }
  }

  const handleCellMouseEnter = (row, col) => {
    if (!isDragging || gridState !== "idle") return

    const newGrid = [...grid]
    const cell = newGrid[row][col]

    if (cell.isWall || (isDragging === "start" && cell.isEnd) || (isDragging === "end" && cell.isStart)) {
      return
    }

    for (let r = 0; r < newGrid.length; r++) {
      for (let c = 0; c < newGrid[0].length; c++) {
        if (isDragging === "start") {
          newGrid[r][c].isStart = r === row && c === col
        } else if (isDragging === "end") {
          newGrid[r][c].isEnd = r === row && c === col
        }
      }
    }

    if (isDragging === "start") {
      setStartCell([row, col])
    } else if (isDragging === "end") {
      setEndCell([row, col])
    }

    setGrid(newGrid)
  }

  const handleCellMouseUp = () => {
    setIsDragging(null)
  }

  const handleStartMazeGeneration = async () => {
    if (gridState !== "idle") return

    const resetGrid = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        isWall: false,
        isVisited: false,
        isPath: false,
        distance: Number.POSITIVE_INFINITY,
        fScore: Number.POSITIVE_INFINITY,
        gScore: Number.POSITIVE_INFINITY,
        previousNode: null,
      })),
    )
    setGrid(resetGrid)
    setGridState("generating")
    setPerformanceData({
      visitedNodes: 0,
      pathLength: 0,
      executionTime: 0,
    })

    const startTime = performance.now()
    const { steps } = await generateMaze(resetGrid, selectedAlgorithm, startCell, endCell)
    const endTime = performance.now()
    setPerformanceData((prev) => ({
      ...prev,
      executionTime: Math.round(endTime - startTime),
    }))

    animationStepsRef.current = steps
    currentStepRef.current = 0

    if (stepMode) {
      setGrid(steps[0])
    } else {
      animateGeneration()
    }
  }

  const handleVisualizePath = async () => {
    if (gridState !== "idle") return

    const resetGrid = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Number.POSITIVE_INFINITY,
        fScore: Number.POSITIVE_INFINITY,
        gScore: Number.POSITIVE_INFINITY,
        hScore: 0,
        previousNode: null,
      })),
    )
    setGrid(resetGrid)
    setGridState("visualizing")
    setPerformanceData({
      visitedNodes: 0,
      pathLength: 0,
      executionTime: 0,
    })

    const startTime = performance.now()
    const { steps, visitedNodesCount, pathLength } = await findPath(
      resetGrid,
      startCell,
      endCell,
      activeTab === "pathfinding" ? selectedAlgorithm : "aStar",
    )
    const endTime = performance.now()
    setPerformanceData({
      visitedNodes: visitedNodesCount,
      pathLength,
      executionTime: Math.round(endTime - startTime),
    })

    animationStepsRef.current = steps
    currentStepRef.current = 0

    if (stepMode) {
      setGrid(steps[0])
    } else {
      animateGeneration()
    }
  }

  const animateGeneration = () => {
    if (currentStepRef.current >= animationStepsRef.current.length) {
      setGridState("idle")
      return
    }

    setGrid(animationStepsRef.current[currentStepRef.current])
    currentStepRef.current += 1

    animationRef.current = window.setTimeout(animateGeneration, animationSpeed)
  }

  const handleStepForward = () => {
    if (currentStepRef.current >= animationStepsRef.current.length - 1) {
      setGridState("idle")
      return
    }

    currentStepRef.current += 1
    setGrid(animationStepsRef.current[currentStepRef.current])
  }

  const handleStepBackward = () => {
    if (currentStepRef.current <= 0) return

    currentStepRef.current -= 1
    setGrid(animationStepsRef.current[currentStepRef.current])
  }

  const handleClearAll = () => {
    if (gridState !== "idle") {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
        animationRef.current = null
      }
    }

    setGridState("idle")
    initializeGrid()
    setPerformanceData({
      visitedNodes: 0,
      pathLength: 0,
      executionTime: 0,
    })
  }

  const handleClearPath = () => {
    if (gridState !== "idle") return

    const newGrid = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Number.POSITIVE_INFINITY,
        fScore: Number.POSITIVE_INFINITY,
        gScore: Number.POSITIVE_INFINITY,
        hScore: 0,
        previousNode: null,
      })),
    )
    setGrid(newGrid)
    setPerformanceData({
      visitedNodes: 0,
      pathLength: 0,
      executionTime: 0,
    })
  }

  const handleSpeedChange = (value) => {
    setAnimationSpeed(value)
  }

  const handleAlgorithmSelect = (algorithm) => {
    setSelectedAlgorithm(algorithm)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleGridSizeChange = (rows, cols) => {
    setGridSize({ rows, cols })
  }

  const handleStepModeToggle = (enabled) => {
    setStepMode(enabled)
    if (!enabled && gridState !== "idle" && currentStepRef.current < animationStepsRef.current.length) {
      animateGeneration()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 py-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Maze Generation & Pathfinding Visualizer</h1>
        <p className="max-w-2xl mx-auto mt-2 text-gray-600">
          Explore and visualize different maze generation and pathfinding algorithms with this interactive tool.
        </p>
      
      </header>
      <main className="flex flex-col flex-1 w-full gap-4 p-4 mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex flex-col flex-1 gap-4">
            <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md">
              <MazeGrid
                grid={grid}
                onCellClick={handleCellClick}
                onCellMouseDown={handleCellMouseDown}
                onCellMouseEnter={handleCellMouseEnter}
                onCellMouseUp={handleCellMouseUp}
              />
            </div>
            <div className="flex gap-4">
              <PerformanceMetrics data={performanceData} />
              <GridControls
                gridSize={gridSize}
                onGridSizeChange={handleGridSizeChange}
                stepMode={stepMode}
                onStepModeToggle={handleStepModeToggle}
                onStepForward={handleStepForward}
                onStepBackward={handleStepBackward}
                isRunning={gridState !== "idle"}
              />
            </div>
            <AlgorithmInfo algorithm={selectedAlgorithm} tab={activeTab} />
          </div>
          <div className="w-full space-y-4 lg:w-80">
            <ControlPanel
              onGenerate={handleStartMazeGeneration}
              onVisualizePath={handleVisualizePath}
              onClearPath={handleClearPath}
              onClearAll={handleClearAll}
              animationSpeed={animationSpeed}
              onSpeedChange={handleSpeedChange}
              gridState={gridState}
            />
            <AlgorithmTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              selectedAlgorithm={selectedAlgorithm}
              onAlgorithmSelect={handleAlgorithmSelect}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

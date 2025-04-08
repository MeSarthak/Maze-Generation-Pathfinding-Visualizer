import { useState, useEffect, useRef } from "react"
import MazeGrid from "./components/maze-grid"
import ControlPanel from "./components/control-panel"
import AlgorithmTabs from "./components/algorithm-tabs"
import PerformanceMetrics from "./components/performance-metrics"
import AlgorithmInfo from "./components/algorithm-info"
import GridControls from "./components/grid-controls"
import MazeTemplates from "./components/maze-templates"
import ComparisonView from "./components/comparison-view"
import { Tabs, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Button } from "./components/ui/button"
import { Download, Upload } from "lucide-react"
import { generateMaze } from "./lib/maze-generators"
import { findPath } from "./lib/pathfinding"
import { exportMaze, importMaze } from "./lib/maze-io"

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
  const [viewMode, setViewMode] = useState("standard")
  const [stepMode, setStepMode] = useState(false)
  const [comparisonAlgorithms, setComparisonAlgorithms] = useState(["aStar", "dijkstra"])
  const [comparisonGrids, setComparisonGrids] = useState({})
  const [comparisonPerformance, setComparisonPerformance] = useState({})

  const fileInputRef = useRef(null)
  const animationRef = useRef(null)
  const animationStepsRef = useRef([])
  const currentStepRef = useRef(0)

  // Initialize grid
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

    // If start or end cell is clicked, don't toggle wall
    if (cell.isStart || cell.isEnd) return

    // Toggle wall state
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

    // Don't allow dragging to a wall or the other special point
    if (cell.isWall || (isDragging === "start" && cell.isEnd) || (isDragging === "end" && cell.isStart)) {
      return
    }

    // Update the grid with the new start/end position
    for (let r = 0; r < newGrid.length; r++) {
      for (let c = 0; c < newGrid[0].length; c++) {
        if (isDragging === "start") {
          newGrid[r][c].isStart = r === row && c === col
        } else if (isDragging === "end") {
          newGrid[r][c].isEnd = r === row && c === col
        }
      }
    }

    // Update state
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

    // Reset grid before generating new maze
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

    // Generate maze steps
    const { steps } = await generateMaze(resetGrid, selectedAlgorithm, startCell, endCell)

    const endTime = performance.now()
    setPerformanceData((prev) => ({
      ...prev,
      executionTime: Math.round(endTime - startTime),
    }))

    // Store steps for animation
    animationStepsRef.current = steps
    currentStepRef.current = 0

    // Start animation or wait for step in step mode
    if (stepMode) {
      setGrid(steps[0])
    } else {
      animateGeneration()
    }
  }

  const handleVisualizePath = async () => {
    if (gridState !== "idle") return

    if (viewMode === "comparison") {
      await runComparisonAlgorithms()
      return
    }

    // Reset visited and path cells, but keep walls
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

    // Find path steps
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

    // Store steps for animation
    animationStepsRef.current = steps
    currentStepRef.current = 0

    // Start animation or wait for step in step mode
    if (stepMode) {
      setGrid(steps[0])
    } else {
      animateGeneration()
    }
  }

  const runComparisonAlgorithms = async () => {
    if (gridState !== "idle") return

    setGridState("visualizing")

    // Create a copy of the current grid for each algorithm
    const baseGrid = grid.map((row) =>
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

    const newComparisonGrids = {}
    const newComparisonPerformance = {}

    // Run each algorithm
    for (const algorithm of comparisonAlgorithms) {
      const startTime = performance.now()

      const {
        grid: resultGrid,
        visitedNodesCount,
        pathLength,
      } = await findPath(
        JSON.parse(JSON.stringify(baseGrid)), // Deep clone to avoid reference issues
        startCell,
        endCell,
        algorithm,
        false, // Don't generate steps for comparison mode
      )

      const endTime = performance.now()

      newComparisonGrids[algorithm] = resultGrid
      newComparisonPerformance[algorithm] = {
        visitedNodes: visitedNodesCount,
        pathLength,
        executionTime: Math.round(endTime - startTime),
      }
    }

    setComparisonGrids(newComparisonGrids)
    setComparisonPerformance(newComparisonPerformance)
    setGridState("idle")
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
      // Cancel any ongoing animations
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
    setComparisonGrids({})
    setComparisonPerformance({})
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
    setComparisonGrids({})
    setComparisonPerformance({})
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

    // If turning off step mode while in the middle of stepping, continue animation
    if (!enabled && gridState !== "idle" && currentStepRef.current < animationStepsRef.current.length) {
      animateGeneration()
    }
  }

  const handleViewModeChange = (mode) => {
    setViewMode(mode)

    // Clear comparison data when switching away from comparison view
    if (mode !== "comparison") {
      setComparisonGrids({})
      setComparisonPerformance({})
    }
  }

  const handleComparisonAlgorithmsChange = (algorithms) => {
    setComparisonAlgorithms(algorithms)
  }

  const handleApplyTemplate = (template) => {
    if (gridState !== "idle") return

    // Apply the template to the grid
    const newGrid = grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        // Calculate relative position in the template
        const templateRow = Math.floor((rowIndex / gridSize.rows) * template.grid.length)
        const templateCol = Math.floor((colIndex / gridSize.cols) * template.grid[0].length)

        return {
          ...cell,
          isWall: template.grid[templateRow][templateCol].isWall,
          isVisited: false,
          isPath: false,
        }
      }),
    )

    setGrid(newGrid)
  }

  const handleExportMaze = () => {
    const mazeData = exportMaze(grid, startCell, endCell, gridSize)

    // Create a blob and download it
    const blob = new Blob([JSON.stringify(mazeData)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "maze.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImportMaze = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result
        const {
          grid: importedGrid,
          startCell: importedStart,
          endCell: importedEnd,
          gridSize: importedSize,
        } = importMaze(content)

        setGridSize(importedSize)
        setStartCell(importedStart)
        setEndCell(importedEnd)
        setGrid(importedGrid)
      } catch (error) {
        console.error("Error importing maze:", error)
        alert("Invalid maze file format")
      }
    }
    reader.readAsText(file)

    // Reset the input
    if (event.target) {
      event.target.value = ""
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="py-6 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Maze Generation & Pathfinding Visualizer</h1>
        <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
          Explore and visualize different maze generation and pathfinding algorithms with this interactive tool.
        </p>

        <div className="flex justify-center mt-4 gap-2">
          <Tabs value={viewMode} onValueChange={(value) => handleViewModeChange(value)} className="w-auto">
            <TabsList>
              <TabsTrigger value="standard">Standard View</TabsTrigger>
              <TabsTrigger value="comparison">Comparison View</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportMaze} title="Export Maze">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleImportClick} title="Import Maze">
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleImportMaze} accept=".json" className="hidden" />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 gap-4 max-w-7xl mx-auto w-full">
        {viewMode === "standard" ? (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
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
            </div>

            <div className="w-full lg:w-80 space-y-4">
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

              <AlgorithmInfo algorithm={selectedAlgorithm} tab={activeTab} />

              <MazeTemplates onApplyTemplate={handleApplyTemplate} />
            </div>
          </div>
        ) : (
          <ComparisonView
            baseGrid={grid}
            comparisonGrids={comparisonGrids}
            performanceData={comparisonPerformance}
            algorithms={comparisonAlgorithms}
            onAlgorithmsChange={handleComparisonAlgorithmsChange}
            onRunComparison={handleVisualizePath}
            isRunning={gridState !== "idle"}
          />
        )}
      </main>
    </div>
  )
}

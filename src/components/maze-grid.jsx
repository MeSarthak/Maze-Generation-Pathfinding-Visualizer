import { useRef, useEffect } from "react"

/**
 * MazeGrid component
 * Renders the maze grid using HTML Canvas for better performance
 * Handles user interactions with the grid
 */
export default function MazeGrid({ grid, onCellClick, onCellMouseDown, onCellMouseEnter, onCellMouseUp }) {
  const canvasRef = useRef(null)

  // Redraw the canvas whenever the grid changes
  useEffect(() => {
    if (!grid.length || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions based on grid size
    const cellSize = 20 // Size of each cell in pixels
    const rows = grid.length
    const cols = grid[0].length

    canvas.width = cols * cellSize
    canvas.height = rows * cellSize

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw grid cells
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cell = grid[row][col]
        const x = col * cellSize
        const y = row * cellSize

        // Set cell color based on its state
        if (cell.isStart) {
          ctx.fillStyle = "#10b981" // Green for start
        } else if (cell.isEnd) {
          ctx.fillStyle = "#ef4444" // Red for end
        } else if (cell.isPath) {
          ctx.fillStyle = "#3b82f6" // Blue for path
        } else if (cell.isVisited) {
          ctx.fillStyle = "#93c5fd" // Light blue for visited
        } else if (cell.isWall) {
          ctx.fillStyle = "#1f2937" // Dark gray for walls
        } else {
          ctx.fillStyle = "#ffffff" // White for empty cells
        }

        ctx.fillRect(x, y, cellSize, cellSize)

        // Draw grid lines
        ctx.strokeStyle = "#e5e7eb"
        ctx.lineWidth = 0.5
        ctx.strokeRect(x, y, cellSize, cellSize)

        // Add visual indicators for start and end points
        if (cell.isStart || cell.isEnd) {
          ctx.beginPath()
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 3, 0, 2 * Math.PI)
          ctx.fillStyle = cell.isStart ? "#059669" : "#dc2626"
          ctx.fill()
        }
      }
    }
  }, [grid])

  /**
   * Converts mouse coordinates to grid cell coordinates
   * @param {Event} e - Mouse event
   * @returns {Object|null} Cell coordinates or null if outside grid
   */
  const getCellCoordinates = (e) => {
    if (!canvasRef.current) return null

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    // Calculate mouse position relative to canvas
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Convert to grid coordinates
    const cellSize = 20
    const col = Math.floor(x / cellSize)
    const row = Math.floor(y / cellSize)

    // Check if within grid bounds
    if (
      row >= 0 &&
      row < grid.length &&
      col >= 0 &&
      col < grid[0].length
    ) {
      return { row, col }
    }

    return null
  }

  const handleCanvasClick = (e) => {
    const cell = getCellCoordinates(e)
    if (cell) {
      onCellClick(cell.row, cell.col)
    }
  }

  const handleCanvasMouseDown = (e) => {
    if (!onCellMouseDown) return

    const cell = getCellCoordinates(e)
    if (cell) {
      onCellMouseDown(cell.row, cell.col)
    }
  }

  const handleCanvasMouseEnter = (e) => {
    if (!onCellMouseEnter) return

    const cell = getCellCoordinates(e)
    if (cell) {
      onCellMouseEnter(cell.row, cell.col)
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseEnter}
        onMouseUp={onCellMouseUp}
        className="border border-gray-200 bg-white cursor-pointer"
      />
    </div>
  )
}



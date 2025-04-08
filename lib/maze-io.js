/**
 * Exports the current maze state to a serializable format
 */
export function exportMaze(grid, startCell, endCell, gridSize) {
  // Create a simplified version of the grid with only the necessary properties
  const exportGrid = grid.map((row) =>
    row.map((cell) => ({
      isWall: cell.isWall,
      isStart: cell.isStart,
      isEnd: cell.isEnd,
    })),
  )

  return {
    grid: exportGrid,
    startCell,
    endCell,
    gridSize,
  }
}

/**
 * Imports a maze from a serialized format
 */
export function importMaze(jsonData) {
  try {
    const data = JSON.parse(jsonData)

    // Validate the data structure
    if (!data.grid || !Array.isArray(data.grid) || !data.startCell || !data.endCell || !data.gridSize) {
      throw new Error("Invalid maze data format")
    }

    // Create a full grid with all the required Cell properties
    const grid = data.grid.map((row, rowIndex) =>
      row.map((cell, colIndex) => ({
        row: rowIndex,
        col: colIndex,
        isWall: cell.isWall,
        isVisited: false,
        isPath: false,
        isStart: rowIndex === data.startCell[0] && colIndex === data.startCell[1],
        isEnd: rowIndex === data.endCell[0] && colIndex === data.endCell[1],
        distance: Number.POSITIVE_INFINITY,
        fScore: Number.POSITIVE_INFINITY,
        gScore: Number.POSITIVE_INFINITY,
        hScore: 0,
        previousNode: null,
      })),
    )

    return {
      grid,
      startCell: data.startCell,
      endCell: data.endCell,
      gridSize: data.gridSize,
    }
  } catch (error) {
    console.error("Error parsing maze data:", error)
    throw new Error("Failed to import maze data")
  }
}

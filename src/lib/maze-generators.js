export async function generateMaze(grid, algorithm, startCell, endCell) {
  switch (algorithm) {
    case "recursiveBacktracking":
      return recursiveBacktracking(grid, startCell, endCell)
    case "prims":
      return primsAlgorithm(grid, startCell, endCell)
    case "kruskals":
      return kruskalsAlgorithm(grid, startCell, endCell)
    default:
      return { grid, steps: [grid] }
  }
}

// Helper function to create a deep copy of the grid
function cloneGrid(grid) {
  return grid.map((row) => row.map((cell) => ({ ...cell })))
}

// Helper function to get valid neighbors for maze generation
function getNeighbors(grid, row, col, distance = 2) {
  const neighbors = []
  const directions = [
    [-distance, 0], // Up
    [distance, 0], // Down
    [0, -distance], // Left
    [0, distance], // Right
  ]

  for (const [dr, dc] of directions) {
    const newRow = row + dr
    const newCol = col + dc

    if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length) {
      neighbors.push([newRow, newCol])
    }
  }

  return neighbors
}

// Recursive Backtracking Algorithm
function recursiveBacktracking(grid, startCell, endCell) {
  // Create a new grid with all walls
  const newGrid = grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      isWall: true,
      isVisited: false,
      isPath: false,
    })),
  )

  // Make sure start and end cells are not walls
  const [startRow, startCol] = startCell
  const [endRow, endCol] = endCell
  newGrid[startRow][startCol].isWall = false
  newGrid[endRow][endCol].isWall = false

  const steps = [cloneGrid(newGrid)]
  const stack = [[startRow, startCol]]
  newGrid[startRow][startCol].isVisited = true

  while (stack.length > 0) {
    const [currentRow, currentCol] = stack[stack.length - 1]
    const neighbors = getNeighbors(newGrid, currentRow, currentCol)

    // Filter unvisited neighbors
    const unvisitedNeighbors = neighbors.filter(([r, c]) => !newGrid[r][c].isVisited)

    if (unvisitedNeighbors.length > 0) {
      // Choose a random unvisited neighbor
      const randomIndex = Math.floor(Math.random() * unvisitedNeighbors.length)
      const [nextRow, nextCol] = unvisitedNeighbors[randomIndex]

      // Remove the wall between current cell and chosen neighbor
      const wallRow = currentRow + (nextRow - currentRow) / 2
      const wallCol = currentCol + (nextCol - currentCol) / 2
      newGrid[wallRow][wallCol].isWall = false

      // Mark the chosen neighbor as visited and push it to the stack
      newGrid[nextRow][nextCol].isWall = false
      newGrid[nextRow][nextCol].isVisited = true
      stack.push([nextRow, nextCol])

      // Add step
      steps.push(cloneGrid(newGrid))
    } else {
      // Backtrack
      stack.pop()

      // Add step (only if we're not done)
      if (stack.length > 0) {
        steps.push(cloneGrid(newGrid))
      }
    }
  }

  // Reset visited flags for pathfinding
  const finalGrid = newGrid.map((row) =>
    row.map((cell) => ({
      ...cell,
      isVisited: false,
    })),
  )

  return { grid: finalGrid, steps }
}

// Prim's Algorithm
function primsAlgorithm(grid, startCell, endCell) {
  // Create a new grid with all walls
  const newGrid = grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      isWall: true,
      isVisited: false,
      isPath: false,
    })),
  )

  // Make sure start and end cells are not walls
  const [startRow, startCol] = startCell
  const [endRow, endCol] = endCell
  newGrid[startRow][startCol].isWall = false
  newGrid[endRow][endCol].isWall = false

  const steps = [cloneGrid(newGrid)]
  const walls = [] // [row, col, fromRow, fromCol]

  // Start with the start cell
  newGrid[startRow][startCol].isVisited = true

  // Add walls of the start cell to the wall list
  const startNeighbors = getNeighbors(newGrid, startRow, startCol)
  for (const [nRow, nCol] of startNeighbors) {
    walls.push([nRow, nCol, startRow, startCol])
  }

  while (walls.length > 0) {
    // Choose a random wall
    const randomIndex = Math.floor(Math.random() * walls.length)
    const [wallRow, wallCol, fromRow, fromCol] = walls[randomIndex]
    walls.splice(randomIndex, 1)

    // If the cell on the opposite side of the wall is not visited
    if (!newGrid[wallRow][wallCol].isVisited) {
      // Remove the wall
      newGrid[wallRow][wallCol].isWall = false
      newGrid[wallRow][wallCol].isVisited = true

      // Remove the wall between the cells
      const passageRow = fromRow + (wallRow - fromRow) / 2
      const passageCol = fromCol + (wallCol - fromCol) / 2
      newGrid[passageRow][passageCol].isWall = false

      // Add the walls of the new cell to the wall list
      const newNeighbors = getNeighbors(newGrid, wallRow, wallCol)
      for (const [nRow, nCol] of newNeighbors) {
        if (!newGrid[nRow][nCol].isVisited) {
          walls.push([nRow, nCol, wallRow, wallCol])
        }
      }

      // Add step
      steps.push(cloneGrid(newGrid))
    }
  }

  // Reset visited flags for pathfinding
  const finalGrid = newGrid.map((row) =>
    row.map((cell) => ({
      ...cell,
      isVisited: false,
    })),
  )

  return { grid: finalGrid, steps }
}

// Kruskal's Algorithm
function kruskalsAlgorithm(grid, startCell, endCell) {
  // Create a new grid with all walls
  const newGrid = grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      isWall: true,
      isVisited: false,
      isPath: false,
    })),
  )

  const rows = newGrid.length
  const cols = newGrid[0].length

  // Make sure start and end cells are not walls
  const [startRow, startCol] = startCell
  const [endRow, endCol] = endCell
  newGrid[startRow][startCol].isWall = false
  newGrid[endRow][endCol].isWall = false

  const steps = [cloneGrid(newGrid)]

  // Initialize disjoint set for each cell
  const cellSets = new Map()

  // Create a set for each cell
  for (let row = 0; row < rows; row += 2) {
    for (let col = 0; col < cols; col += 2) {
      const cellId = `${row},${col}`
      cellSets.set(cellId, cellId)
      newGrid[row][col].isWall = false
    }
  }

  // Collect all walls
  const walls = [] // [row1, col1, row2, col2]

  for (let row = 0; row < rows; row += 2) {
    for (let col = 0; col < cols; col += 2) {
      // Check right neighbor
      if (col + 2 < cols) {
        walls.push([row, col, row, col + 2])
      }

      // Check bottom neighbor
      if (row + 2 < rows) {
        walls.push([row, col, row + 2, col])
      }
    }
  }

  // Shuffle walls
  for (let i = walls.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[walls[i], walls[j]] = [walls[j], walls[i]]
  }

  // Find function for disjoint set
  function find(cellId) {
    if (cellSets.get(cellId) === cellId) {
      return cellId
    }
    const parent = cellSets.get(cellId)
    const root = find(parent)
    cellSets.set(cellId, root)
    return root
  }

  // Union function for disjoint set
  function union(cellId1, cellId2) {
    const root1 = find(cellId1)
    const root2 = find(cellId2)
    if (root1 !== root2) {
      cellSets.set(root2, root1)
    }
  }

  // Process each wall
  for (const [row1, col1, row2, col2] of walls) {
    const cellId1 = `${row1},${col1}`
    const cellId2 = `${row2},${col2}`

    // If cells are in different sets
    if (find(cellId1) !== find(cellId2)) {
      // Remove the wall between them
      const wallRow = (row1 + row2) / 2
      const wallCol = (col1 + col2) / 2
      newGrid[wallRow][wallCol].isWall = false

      // Merge the sets
      union(cellId1, cellId2)

      // Add step
      steps.push(cloneGrid(newGrid))
    }
  }

  return { grid: newGrid, steps }
}

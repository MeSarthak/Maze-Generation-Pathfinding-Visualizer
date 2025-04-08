export async function findPath(grid, startCell, endCell, algorithm, generateSteps = true) {
  switch (algorithm) {
    case "aStar":
      return aStarAlgorithm(grid, startCell, endCell, generateSteps)
    case "dijkstra":
      return dijkstraAlgorithm(grid, startCell, endCell, generateSteps)
    default:
      return aStarAlgorithm(grid, startCell, endCell, generateSteps)
  }
}

// Helper function to create a deep copy of the grid
function cloneGrid(grid) {
  return grid.map((row) => row.map((cell) => ({ ...cell })))
}

// Helper function to get valid neighbors for pathfinding
function getNeighbors(grid, row, col) {
  const neighbors = []
  const directions = [
    [-1, 0], // Up
    [1, 0], // Down
    [0, -1], // Left
    [0, 1], // Right
  ]

  for (const [dr, dc] of directions) {
    const newRow = row + dr
    const newCol = col + dc

    if (newRow >= 0 && newRow < grid.length && newCol >= 0 && newCol < grid[0].length && !grid[newRow][newCol].isWall) {
      neighbors.push([newRow, newCol])
    }
  }

  return neighbors
}

// Calculate Manhattan distance heuristic
function heuristic(row, col, endRow, endCol) {
  return Math.abs(row - endRow) + Math.abs(col - endCol)
}

// A* Algorithm
function aStarAlgorithm(grid, startCell, endCell, generateSteps = true) {
  const [startRow, startCol] = startCell
  const [endRow, endCol] = endCell

  // Initialize grid for A*
  const newGrid = grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      distance: Number.POSITIVE_INFINITY,
      fScore: Number.POSITIVE_INFINITY,
      gScore: Number.POSITIVE_INFINITY,
      hScore: heuristic(cell.row, cell.col, endRow, endCol),
      previousNode: null,
      isVisited: false,
      isPath: false,
    })),
  )

  // Set start node values
  newGrid[startRow][startCol].gScore = 0
  newGrid[startRow][startCol].fScore = heuristic(startRow, startCol, endRow, endCol)

  const steps = generateSteps ? [cloneGrid(newGrid)] : []
  const openSet = [[startRow, startCol]]
  const closedSet = new Set()
  let visitedNodesCount = 0

  while (openSet.length > 0) {
    // Sort open set by fScore (lowest first)
    openSet.sort((a, b) => {
      return newGrid[a[0]][a[1]].fScore - newGrid[b[0]][b[1]].fScore
    })

    // Get node with lowest fScore
    const [currentRow, currentCol] = openSet.shift()

    // If we've reached the end node
    if (currentRow === endRow && currentCol === endCol) {
      // Reconstruct path
      let current = [endRow, endCol]
      let pathLength = 0

      while (current) {
        const [row, col] = current
        newGrid[row][col].isPath = true
        pathLength++

        // Add step for visualization
        if (generateSteps && (current[0] !== endRow || current[1] !== endCol)) {
          steps.push(cloneGrid(newGrid))
        }

        current = newGrid[row][col].previousNode
      }

      return {
        grid: newGrid,
        steps,
        visitedNodesCount,
        pathLength: pathLength - 1, // Exclude start node
      }
    }

    // Add current node to closed set
    closedSet.add(`${currentRow},${currentCol}`)

    // Mark as visited for visualization
    if (!newGrid[currentRow][currentCol].isStart && !newGrid[currentRow][currentCol].isEnd) {
      newGrid[currentRow][currentCol].isVisited = true
      visitedNodesCount++
      if (generateSteps) {
        steps.push(cloneGrid(newGrid))
      }
    }

    // Check all neighbors
    const neighbors = getNeighbors(newGrid, currentRow, currentCol)

    for (const [neighborRow, neighborCol] of neighbors) {
      // Skip if in closed set
      if (closedSet.has(`${neighborRow},${neighborCol}`)) continue

      // Calculate tentative gScore
      const tentativeGScore = newGrid[currentRow][currentCol].gScore + 1

      // If this path is better than previous one
      if (tentativeGScore < newGrid[neighborRow][neighborCol].gScore) {
        // Update neighbor
        newGrid[neighborRow][neighborCol].previousNode = [currentRow, currentCol]
        newGrid[neighborRow][neighborCol].gScore = tentativeGScore
        newGrid[neighborRow][neighborCol].fScore = tentativeGScore + newGrid[neighborRow][neighborCol].hScore

        // Add to open set if not already there
        if (!openSet.some(([r, c]) => r === neighborRow && c === neighborCol)) {
          openSet.push([neighborRow, neighborCol])
        }
      }
    }
  }

  // No path found
  return {
    grid: newGrid,
    steps,
    visitedNodesCount,
    pathLength: 0,
  }
}

// Dijkstra's Algorithm
function dijkstraAlgorithm(grid, startCell, endCell, generateSteps = true) {
  const [startRow, startCol] = startCell
  const [endRow, endCol] = endCell

  // Initialize grid for Dijkstra
  const newGrid = grid.map((row) =>
    row.map((cell) => ({
      ...cell,
      distance: Number.POSITIVE_INFINITY,
      fScore: Number.POSITIVE_INFINITY,
      gScore: Number.POSITIVE_INFINITY,
      hScore: 0,
      previousNode: null,
      isVisited: false,
      isPath: false,
    })),
  )

  // Set start node distance to 0
  newGrid[startRow][startCol].distance = 0

  const steps = generateSteps ? [cloneGrid(newGrid)] : []
  const unvisitedNodes = []
  let visitedNodesCount = 0

  // Add all nodes to unvisited set
  for (let row = 0; row < newGrid.length; row++) {
    for (let col = 0; col < newGrid[0].length; col++) {
      if (!newGrid[row][col].isWall) {
        unvisitedNodes.push([row, col])
      }
    }
  }

  while (unvisitedNodes.length > 0) {
    // Sort unvisited nodes by distance
    unvisitedNodes.sort((a, b) => {
      return newGrid[a[0]][a[1]].distance - newGrid[b[0]][b[1]].distance
    })

    // Get node with smallest distance
    const [currentRow, currentCol] = unvisitedNodes.shift()

    // If we've reached a node with infinite distance, there's no path
    if (newGrid[currentRow][currentCol].distance === Number.POSITIVE_INFINITY) {
      return {
        grid: newGrid,
        steps,
        visitedNodesCount,
        pathLength: 0,
      }
    }

    // If we've reached the end node
    if (currentRow === endRow && currentCol === endCol) {
      // Reconstruct path
      let current = [endRow, endCol]
      let pathLength = 0

      while (current) {
        const [row, col] = current
        newGrid[row][col].isPath = true
        pathLength++

        // Add step for visualization
        if (generateSteps && (current[0] !== endRow || current[1] !== endCol)) {
          steps.push(cloneGrid(newGrid))
        }

        current = newGrid[row][col].previousNode
      }

      return {
        grid: newGrid,
        steps,
        visitedNodesCount,
        pathLength: pathLength - 1, // Exclude start node
      }
    }

    // Mark as visited for visualization
    if (!newGrid[currentRow][currentCol].isStart && !newGrid[currentRow][currentCol].isEnd) {
      newGrid[currentRow][currentCol].isVisited = true
      visitedNodesCount++
      if (generateSteps) {
        steps.push(cloneGrid(newGrid))
      }
    }

    // Check all neighbors
    const neighbors = getNeighbors(newGrid, currentRow, currentCol)

    for (const [neighborRow, neighborCol] of neighbors) {
      // Calculate new distance
      const newDistance = newGrid[currentRow][currentCol].distance + 1

      // If new distance is better
      if (newDistance < newGrid[neighborRow][neighborCol].distance) {
        // Update neighbor
        newGrid[neighborRow][neighborCol].distance = newDistance
        newGrid[neighborRow][neighborCol].previousNode = [currentRow, currentCol]
      }
    }
  }

  // No path found
  return {
    grid: newGrid,
    steps,
    visitedNodesCount,
    pathLength: 0,
  }
}

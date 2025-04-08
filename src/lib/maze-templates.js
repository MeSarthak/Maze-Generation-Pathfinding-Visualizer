// Helper function to create a grid of a specific size
function createGrid(rows, cols, defaultWall = false) {
  const grid = []
  for (let i = 0; i < rows; i++) {
    const row = []
    for (let j = 0; j < cols; j++) {
      row.push({ isWall: defaultWall })
    }
    grid.push(row)
  }
  return grid
}

// Create a spiral maze template
function createSpiralMaze(size) {
  const grid = createGrid(size, size)

  // Create a spiral pattern
  let direction = 0 // 0: right, 1: down, 2: left, 3: up
  let row = 0
  let col = 0
  let steps = size - 1
  let stepCount = 0

  while (steps > 0) {
    // Mark current cell as wall
    grid[row][col].isWall = true

    // Move in current direction
    switch (direction) {
      case 0: // right
        col++
        break
      case 1: // down
        row++
        break
      case 2: // left
        col--
        break
      case 3: // up
        row--
        break
    }

    stepCount++

    // Change direction if needed
    if (stepCount === steps) {
      direction = (direction + 1) % 4
      stepCount = 0

      // Reduce steps after completing a half cycle (right+down or left+up)
      if (direction === 0 || direction === 2) {
        steps--
      }
    }
  }

  return grid
}

// Create a checkerboard pattern
function createCheckerboard(size) {
  const grid = createGrid(size, size)

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      grid[i][j].isWall = (i + j) % 2 === 0
    }
  }

  return grid
}

// Create a maze with random walls
function createRandomMaze(rows, cols, density) {
  const grid = createGrid(rows, cols)

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      // Add random walls based on density
      grid[i][j].isWall = Math.random() < density
    }
  }

  return grid
}

// Create a maze with horizontal and vertical corridors
function createRoomsMaze(size) {
  const grid = createGrid(size, size, true)

  // Create horizontal corridors
  for (let i = 2; i < size; i += 4) {
    for (let j = 0; j < size; j++) {
      grid[i][j].isWall = false
    }
  }

  // Create vertical corridors
  for (let j = 2; j < size; j += 4) {
    for (let i = 0; i < size; i++) {
      grid[i][j].isWall = false
    }
  }

  return grid
}

// Create a maze with concentric rings
function createConcentricMaze(size) {
  const grid = createGrid(size, size)
  const center = Math.floor(size / 2)

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // Calculate distance from center
      const distance = Math.max(Math.abs(i - center), Math.abs(j - center))

      // Create concentric rings
      grid[i][j].isWall = distance % 2 === 0
    }
  }

  // Add some passages through the rings
  for (let ring = 1; ring < Math.floor(size / 2); ring += 2) {
    // North passage
    grid[center - ring][center].isWall = false

    // East passage
    grid[center][center + ring].isWall = false

    // South passage
    grid[center + ring][center].isWall = false

    // West passage
    grid[center][center - ring].isWall = false
  }

  return grid
}

export const mazeTemplates = [
  {
    id: "empty",
    name: "Empty Grid",
    description: "An empty grid with no walls. Perfect for drawing your own maze.",
    grid: createGrid(20, 20),
  },
  {
    id: "spiral",
    name: "Spiral Maze",
    description: "A challenging spiral-shaped maze with a single path to the center.",
    grid: createSpiralMaze(21),
  },
  {
    id: "checkerboard",
    name: "Checkerboard Pattern",
    description: "A simple checkerboard pattern that creates multiple possible paths.",
    grid: createCheckerboard(20),
  },
  {
    id: "random",
    name: "Random Walls",
    description: "Randomly placed walls with approximately 30% density.",
    grid: createRandomMaze(20, 20, 0.3),
  },
  {
    id: "rooms",
    name: "Rooms and Corridors",
    description: "A maze with regular rooms connected by corridors.",
    grid: createRoomsMaze(20),
  },
  {
    id: "concentric",
    name: "Concentric Rings",
    description: "Concentric rings with passages at the cardinal directions.",
    grid: createConcentricMaze(21),
  },
]

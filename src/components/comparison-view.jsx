import React from "react";
import { useState, useEffect, useRef } from "react";
import MazeGrid from "./maze-grid";
import { Button } from "./ui/button";
import { Play, Zap, RotateCcw, Trash2 } from "lucide-react";
import { generateMaze } from "../lib/maze-generators";
import { findPath } from "../lib/pathfinding";

export default function ComparisonView() {
  // Basic state
  const [gridSize] = useState({ rows: 15, cols: 25 });
  const [leftGrid, setLeftGrid] = useState([]);
  const [rightGrid, setRightGrid] = useState([]);
  const [startCell, setStartCell] = useState([5, 5]);
  const [endCell, setEndCell] = useState([10, 20]);
  const [animationSpeed] = useState(50); // Fixed animation speed
  const [gridState, setGridState] = useState("idle"); // idle, generating, visualizing
  const [isDragging, setIsDragging] = useState(null);
  
  // Algorithm selection - only pathfinding
  const [leftAlgorithm, setLeftAlgorithm] = useState("aStar");
  const [rightAlgorithm, setRightAlgorithm] = useState("dijkstra");
  
  // Performance metrics
  const [leftMetrics, setLeftMetrics] = useState({
    visitedNodes: 0,
    pathLength: 0,
    executionTime: 0,
  });
  
  const [rightMetrics, setRightMetrics] = useState({
    visitedNodes: 0,
    pathLength: 0,
    executionTime: 0,
  });
  
  // Animation refs
  const animationRef = useRef(null);
  const leftAnimationStepsRef = useRef([]);
  const rightAnimationStepsRef = useRef([]);
  const currentStepRef = useRef(0);
  
  // Initialize grids on component mount
  useEffect(() => {
    initializeGrids();
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  const initializeGrids = () => {
    const newGrid = [];
    for (let row = 0; row < gridSize.rows; row++) {
      const currentRow = [];
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
        });
      }
      newGrid.push(currentRow);
    }
    
    setLeftGrid(newGrid);
    setRightGrid(JSON.parse(JSON.stringify(newGrid)));
  };

  // Cell interaction handlers
  const handleCellClick = (row, col, side) => {
    if (gridState !== "idle") return;
    
    const grid = side === "left" ? [...leftGrid] : [...rightGrid];
    const setGrid = side === "left" ? setLeftGrid : setRightGrid;
    
    const cell = grid[row][col];
    
    if (cell.isStart || cell.isEnd) return;
    
    cell.isWall = !cell.isWall;
    setGrid(grid);
    
    // Mirror the wall to the other grid
    const otherGrid = side === "left" ? [...rightGrid] : [...leftGrid];
    const otherSetGrid = side === "left" ? setRightGrid : setLeftGrid;
    
    otherGrid[row][col].isWall = cell.isWall;
    otherSetGrid(otherGrid);
  };
  
  const handleCellMouseDown = (row, col, side) => {
    if (gridState !== "idle") return;
    
    const grid = side === "left" ? leftGrid : rightGrid;
    const cell = grid[row][col];
    
    if (cell.isStart) {
      setIsDragging("start");
    } else if (cell.isEnd) {
      setIsDragging("end");
    }
  };
  
  const handleCellMouseEnter = (row, col, side) => {
    if (!isDragging || gridState !== "idle") return;
    
    const leftNewGrid = [...leftGrid];
    const rightNewGrid = [...rightGrid];
    
    if ((isDragging === "start" && (leftNewGrid[row][col].isEnd || leftNewGrid[row][col].isWall)) ||
        (isDragging === "end" && (leftNewGrid[row][col].isStart || leftNewGrid[row][col].isWall))) {
      return;
    }
    
    // Update both grids
    for (let r = 0; r < leftNewGrid.length; r++) {
      for (let c = 0; c < leftNewGrid[0].length; c++) {
        if (isDragging === "start") {
          leftNewGrid[r][c].isStart = r === row && c === col;
          rightNewGrid[r][c].isStart = r === row && c === col;
        } else if (isDragging === "end") {
          leftNewGrid[r][c].isEnd = r === row && c === col;
          rightNewGrid[r][c].isEnd = r === row && c === col;
        }
      }
    }
    
    if (isDragging === "start") {
      setStartCell([row, col]);
    } else if (isDragging === "end") {
      setEndCell([row, col]);
    }
    
    setLeftGrid(leftNewGrid);
    setRightGrid(rightNewGrid);
  };
  
  const handleCellMouseUp = () => {
    setIsDragging(null);
  };

  // Algorithm handlers
  const handleGenerateMaze = async () => {
    if (gridState !== "idle") return;
    
    // Reset both grids
    const resetGrid = [];
    for (let row = 0; row < gridSize.rows; row++) {
      const currentRow = [];
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
        });
      }
      resetGrid.push(currentRow);
    }
    
    setLeftGrid(resetGrid);
    setRightGrid(JSON.parse(JSON.stringify(resetGrid)));
    
    setGridState("generating");
    
    // Reset metrics
    setLeftMetrics({
      visitedNodes: 0,
      pathLength: 0,
      executionTime: 0,
    });
    
    setRightMetrics({
      visitedNodes: 0,
      pathLength: 0,
      executionTime: 0,
    });
    
    // Generate maze - always use recursiveBacktracking for comparison view
    const startTime = performance.now();
    const { steps } = await generateMaze(resetGrid, "recursiveBacktracking", startCell, endCell);
    const endTime = performance.now();
    
    // Apply final maze to both grids
    const finalMaze = steps[steps.length - 1];
    setLeftGrid(JSON.parse(JSON.stringify(finalMaze)));
    setRightGrid(JSON.parse(JSON.stringify(finalMaze)));
    
    setGridState("idle");
  };
  
  const handleCompareAlgorithms = async () => {
    if (gridState !== "idle") return;
    
    // Reset path visualization but keep walls
    const resetLeftGrid = leftGrid.map(row => 
      row.map(cell => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Number.POSITIVE_INFINITY,
        fScore: Number.POSITIVE_INFINITY,
        gScore: Number.POSITIVE_INFINITY,
        hScore: 0,
        previousNode: null,
      }))
    );
    
    const resetRightGrid = rightGrid.map(row => 
      row.map(cell => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Number.POSITIVE_INFINITY,
        fScore: Number.POSITIVE_INFINITY,
        gScore: Number.POSITIVE_INFINITY,
        hScore: 0,
        previousNode: null,
      }))
    );
    
    setLeftGrid(resetLeftGrid);
    setRightGrid(resetRightGrid);
    
    setGridState("visualizing");
    
    // Run left algorithm
    const leftStartTime = performance.now();
    const { steps: leftSteps, visitedNodesCount: leftVisited, pathLength: leftPath } = 
      await findPath(resetLeftGrid, startCell, endCell, leftAlgorithm);
    const leftEndTime = performance.now();
    
    setLeftMetrics({
      visitedNodes: leftVisited,
      pathLength: leftPath,
      executionTime: Math.round(leftEndTime - leftStartTime),
    });
    
    // Run right algorithm
    const rightStartTime = performance.now();
    const { steps: rightSteps, visitedNodesCount: rightVisited, pathLength: rightPath } = 
      await findPath(resetRightGrid, startCell, endCell, rightAlgorithm);
    const rightEndTime = performance.now();
    
    setRightMetrics({
      visitedNodes: rightVisited,
      pathLength: rightPath,
      executionTime: Math.round(rightEndTime - rightStartTime),
    });
    
    // Store animation steps
    leftAnimationStepsRef.current = leftSteps;
    rightAnimationStepsRef.current = rightSteps;
    currentStepRef.current = 0;
    
    // Start animation
    animateComparison();
  };
  
  const animateComparison = () => {
    const leftMaxSteps = leftAnimationStepsRef.current.length;
    const rightMaxSteps = rightAnimationStepsRef.current.length;
    const maxSteps = Math.max(leftMaxSteps, rightMaxSteps);
    
    if (currentStepRef.current >= maxSteps) {
      setGridState("idle");
      return;
    }
    
    if (currentStepRef.current < leftMaxSteps) {
      setLeftGrid(leftAnimationStepsRef.current[currentStepRef.current]);
    }
    
    if (currentStepRef.current < rightMaxSteps) {
      setRightGrid(rightAnimationStepsRef.current[currentStepRef.current]);
    }
    
    currentStepRef.current++;
    
    // Fix: Use animationSpeed directly instead of 101-animationSpeed
    // Higher animationSpeed value should mean faster animation (less delay)
    const delay = 210 - animationSpeed * 2; // This creates a range from 10ms (fast) to 190ms (slow)
    animationRef.current = setTimeout(animateComparison, delay);
  };
  
  const handleClearPath = () => {
    if (gridState !== "idle") return;
    
    const newLeftGrid = leftGrid.map(row => 
      row.map(cell => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Number.POSITIVE_INFINITY,
        fScore: Number.POSITIVE_INFINITY,
        gScore: Number.POSITIVE_INFINITY,
        hScore: 0,
        previousNode: null,
      }))
    );
    
    const newRightGrid = rightGrid.map(row => 
      row.map(cell => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Number.POSITIVE_INFINITY,
        fScore: Number.POSITIVE_INFINITY,
        gScore: Number.POSITIVE_INFINITY,
        hScore: 0,
        previousNode: null,
      }))
    );
    
    setLeftGrid(newLeftGrid);
    setRightGrid(newRightGrid);
    
    setLeftMetrics({
      visitedNodes: 0,
      pathLength: 0,
      executionTime: 0,
    });
    
    setRightMetrics({
      visitedNodes: 0,
      pathLength: 0,
      executionTime: 0,
    });
  };
  
  const handleClearAll = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
    
    setGridState("idle");
    initializeGrids();
    
    setLeftMetrics({
      visitedNodes: 0,
      pathLength: 0,
      executionTime: 0,
    });
    
    setRightMetrics({
      visitedNodes: 0,
      pathLength: 0,
      executionTime: 0,
    });
  };

  const handleLeftAlgorithmSelect = (algorithm) => {
    setLeftAlgorithm(algorithm);
  };

  const handleRightAlgorithmSelect = (algorithm) => {
    setRightAlgorithm(algorithm);
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-2xl font-bold">Algorithm Comparison</h2>
      
      {/* Controls */}
      <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-md">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button 
              className="flex-1 bg-gray-900 hover:bg-gray-800"
              onClick={handleGenerateMaze}
              disabled={gridState !== "idle"}
            >
              <Play className="w-4 h-4 mr-2" />
              Generate Maze
            </Button>
            <Button 
              className="flex-1"
              onClick={handleCompareAlgorithms}
              disabled={gridState !== "idle"}
            >
              <Zap className="w-4 h-4 mr-2" />
              Compare
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleClearPath}
              disabled={gridState !== "idle"}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear Path
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleClearAll}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </div>
      
      {/* Grids */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left Side */}
        <div>
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-md">
            <h3 className="mb-2 text-lg font-semibold">Left Algorithm</h3>
            <div className="space-y-2">
              <Button
                variant={leftAlgorithm === "aStar" ? "default" : "outline"}
                className="justify-start w-full"
                onClick={() => handleLeftAlgorithmSelect("aStar")}
              >
                A* Algorithm
              </Button>
              <Button
                variant={leftAlgorithm === "dijkstra" ? "default" : "outline"}
                className="justify-start w-full"
                onClick={() => handleLeftAlgorithmSelect("dijkstra")}
              >
                Dijkstra's Algorithm
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4 h-[400px] overflow-hidden">
            {leftGrid.length > 0 && (
              <MazeGrid
                grid={leftGrid}
                onCellClick={(row, col) => handleCellClick(row, col, "left")}
                onCellMouseDown={(row, col) => handleCellMouseDown(row, col, "left")}
                onCellMouseEnter={(row, col) => handleCellMouseEnter(row, col, "left")}
                onCellMouseUp={handleCellMouseUp}
              />
            )}
          </div>
          
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-md">
            <h3 className="mb-2 text-lg font-semibold">Performance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Visited Nodes</p>
                <p className="text-xl font-semibold">{leftMetrics.visitedNodes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Path Length</p>
                <p className="text-xl font-semibold">{leftMetrics.pathLength}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="text-xl font-semibold">{leftMetrics.executionTime} ms</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side */}
        <div>
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-md">
            <h3 className="mb-2 text-lg font-semibold">Right Algorithm</h3>
            <div className="space-y-2">
              <Button
                variant={rightAlgorithm === "aStar" ? "default" : "outline"}
                className="justify-start w-full"
                onClick={() => handleRightAlgorithmSelect("aStar")}
              >
                A* Algorithm
              </Button>
              <Button
                variant={rightAlgorithm === "dijkstra" ? "default" : "outline"}
                className="justify-start w-full"
                onClick={() => handleRightAlgorithmSelect("dijkstra")}
              >
                Dijkstra's Algorithm
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4 h-[400px] overflow-hidden">
            {rightGrid.length > 0 && (
              <MazeGrid
                grid={rightGrid}
                onCellClick={(row, col) => handleCellClick(row, col, "right")}
                onCellMouseDown={(row, col) => handleCellMouseDown(row, col, "right")}
                onCellMouseEnter={(row, col) => handleCellMouseEnter(row, col, "right")}
                onCellMouseUp={handleCellMouseUp}
              />
            )}
          </div>
          
          <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-md">
            <h3 className="mb-2 text-lg font-semibold">Performance</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Visited Nodes</p>
                <p className="text-xl font-semibold">{rightMetrics.visitedNodes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Path Length</p>
                <p className="text-xl font-semibold">{rightMetrics.pathLength}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="text-xl font-semibold">{rightMetrics.executionTime} ms</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}










"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MazeGrid from "@/components/maze-grid"
import { ArrowRightLeft, Play } from "lucide-react"

export default function ComparisonView({
  baseGrid,
  comparisonGrids,
  performanceData,
  algorithms,
  onAlgorithmsChange,
  onRunComparison,
  isRunning,
}) {
  const algorithmOptions = [
    { value: "aStar", label: "A* Algorithm" },
    { value: "dijkstra", label: "Dijkstra's Algorithm" },
    { value: "recursiveBacktracking", label: "Recursive Backtracking" },
    { value: "prims", label: "Prim's Algorithm" },
    { value: "kruskals", label: "Kruskal's Algorithm" },
  ]

  const handleAlgorithm1Change = (value) => {
    onAlgorithmsChange([value, algorithms[1]])
  }

  const handleAlgorithm2Change = (value) => {
    onAlgorithmsChange([algorithms[0], value])
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Algorithm Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Algorithm 1</label>
              <Select value={algorithms[0]} onValueChange={handleAlgorithm1Change}>
                <SelectTrigger>
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  {algorithmOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center">
              <ArrowRightLeft className="h-5 w-5 text-gray-400" />
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">Algorithm 2</label>
              <Select value={algorithms[1]} onValueChange={handleAlgorithm2Change}>
                <SelectTrigger>
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  {algorithmOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full" onClick={onRunComparison} disabled={isRunning}>
            <Play className="mr-2 h-4 w-4" />
            Run Comparison
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(comparisonGrids).length > 0 ? (
          algorithms.map((algorithm) => (
            <Card key={algorithm} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {algorithmOptions.find((opt) => opt.value === algorithm)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-4">
                  <MazeGrid grid={comparisonGrids[algorithm] || baseGrid} onCellClick={() => {}} />
                </div>

                {performanceData[algorithm] && (
                  <div className="bg-gray-50 p-4 border-t border-gray-200">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-500">Nodes Visited</p>
                        <p className="font-semibold">{performanceData[algorithm].visitedNodes}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Path Length</p>
                        <p className="font-semibold">{performanceData[algorithm].pathLength}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-500">Time</p>
                        <p className="font-semibold">{performanceData[algorithm].executionTime} ms</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-2 bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">Select algorithms and click "Run Comparison" to see results side by side</p>
          </div>
        )}
      </div>
    </div>
  )
}

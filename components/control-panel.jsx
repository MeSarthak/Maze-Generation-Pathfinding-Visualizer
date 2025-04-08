"use client"

import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Zap, X, RotateCcw } from "lucide-react"

export default function ControlPanel({
  onGenerate,
  onVisualizePath,
  onClearPath,
  onClearAll,
  animationSpeed,
  onSpeedChange,
  gridState,
}) {
  const isGenerating = gridState === "generating"
  const isVisualizing = gridState === "visualizing"
  const isRunning = isGenerating || isVisualizing

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <Button className="w-full mb-4 bg-gray-900 hover:bg-gray-800" onClick={onGenerate} disabled={isRunning}>
        <Play className="mr-2 h-4 w-4" />
        Generate Maze
      </Button>

      <div className="flex gap-2 mb-4">
        <Button variant="outline" className="flex-1" onClick={onVisualizePath} disabled={isRunning}>
          <Zap className="mr-2 h-4 w-4" />
          Visualize Path
        </Button>

        <Button variant="outline" className="flex-1" onClick={onClearPath} disabled={isRunning}>
          <X className="mr-2 h-4 w-4" />
          Clear Path
        </Button>
      </div>

      <Button variant="outline" className="w-full mb-6" onClick={onClearAll}>
        <RotateCcw className="mr-2 h-4 w-4" />
        Clear All
      </Button>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Animation Speed</span>
          <span className="text-sm text-gray-500">{animationSpeed}ms</span>
        </div>

        <Slider
          value={[animationSpeed]}
          min={10}
          max={200}
          step={10}
          onValueChange={(value) => onSpeedChange(value[0])}
          disabled={isRunning}
        />

        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Fast</span>
          <span>Slow</span>
        </div>
      </div>

      <div className="mt-4 p-2 bg-gray-50 rounded-md text-xs text-gray-500">
        <p className="font-medium mb-1">Tip:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Click to toggle walls</li>
          <li>Drag the green/red points to move start/end</li>
          <li>Generate a maze first, then visualize a path</li>
        </ul>
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Slider } from "./ui/slider"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react"

export default function GridControls({
  gridSize,
  onGridSizeChange,
  stepMode,
  onStepModeToggle,
  onStepForward,
  onStepBackward,
  isRunning,
}) {
  const handleRowsChange = (value) => {
    onGridSizeChange(value[0], gridSize.cols)
  }

  const handleColsChange = (value) => {
    onGridSizeChange(gridSize.rows, value[0])
  }

  const handleStepModeChange = (checked) => {
    onStepModeToggle(checked)
  }

  return (
    <Card className="flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Grid Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm font-medium">Rows: {gridSize.rows}</Label>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => onGridSizeChange(Math.max(10, gridSize.rows - 5), gridSize.cols)}
                disabled={gridSize.rows <= 10 || isRunning}
              >
                <Minimize className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => onGridSizeChange(Math.min(50, gridSize.rows + 5), gridSize.cols)}
                disabled={gridSize.rows >= 50 || isRunning}
              >
                <Maximize className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Slider
            value={[gridSize.rows]}
            min={10}
            max={50}
            step={1}
            onValueChange={handleRowsChange}
            disabled={isRunning}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-sm font-medium">Columns: {gridSize.cols}</Label>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => onGridSizeChange(gridSize.rows, Math.max(10, gridSize.cols - 5))}
                disabled={gridSize.cols <= 10 || isRunning}
              >
                <Minimize className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => onGridSizeChange(gridSize.rows, Math.min(70, gridSize.cols + 5))}
                disabled={gridSize.cols >= 70 || isRunning}
              >
                <Maximize className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Slider
            value={[gridSize.cols]}
            min={10}
            max={70}
            step={1}
            onValueChange={handleColsChange}
            disabled={isRunning}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Switch id="step-mode" checked={stepMode} onCheckedChange={handleStepModeChange} disabled={isRunning} />
            <Label htmlFor="step-mode">Step-by-Step Mode</Label>
          </div>
        </div>

        {stepMode && (
          <div className="flex justify-center gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onStepBackward} disabled={!isRunning} className="flex-1">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button variant="outline" size="sm" onClick={onStepForward} disabled={!isRunning} className="flex-1">
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

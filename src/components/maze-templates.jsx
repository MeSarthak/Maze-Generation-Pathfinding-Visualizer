import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Wand2 } from "lucide-react"
import { mazeTemplates } from "../lib/maze-templates"

export default function MazeTemplates({ onApplyTemplate }) {
  const [selectedTemplate, setSelectedTemplate] = useState(mazeTemplates[0].id)

  const handleTemplateChange = (value) => {
    setSelectedTemplate(value)
  }

  const handleApplyTemplate = () => {
    const template = mazeTemplates.find((t) => t.id === selectedTemplate)
    if (template) {
      onApplyTemplate(template)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Maze Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {mazeTemplates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-sm text-gray-600">{mazeTemplates.find((t) => t.id === selectedTemplate)?.description}</div>

        <Button className="w-full" onClick={handleApplyTemplate}>
          <Wand2 className="mr-2 h-4 w-4" />
          Apply Template
        </Button>
      </CardContent>
    </Card>
  )
}

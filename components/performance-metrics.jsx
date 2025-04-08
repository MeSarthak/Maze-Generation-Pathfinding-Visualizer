import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Eye, Route } from "lucide-react"

export default function PerformanceMetrics({ data }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricItem
            icon={<Eye className="h-5 w-5 text-blue-500" />}
            label="Nodes Visited"
            value={data.visitedNodes.toString()}
          />
          <MetricItem
            icon={<Route className="h-5 w-5 text-green-500" />}
            label="Path Length"
            value={data.pathLength.toString()}
          />
          <MetricItem
            icon={<Clock className="h-5 w-5 text-amber-500" />}
            label="Execution Time"
            value={`${data.executionTime} ms`}
          />
        </div>
      </CardContent>
    </Card>
  )
}

function MetricItem({ icon, label, value }) {
  return (
    <div className="flex items-center space-x-2">
      {icon}
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  )
}

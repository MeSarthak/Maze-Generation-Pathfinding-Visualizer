import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Info } from "lucide-react"

export default function AlgorithmInfo({ algorithm, tab }) {
  const algorithmData = getAlgorithmData(algorithm, tab)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          Algorithm Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">{algorithmData.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{algorithmData.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            <span className="font-medium">Time Complexity:</span>
            <p className="text-gray-600">{algorithmData.timeComplexity}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="font-medium">Space Complexity:</span>
            <p className="text-gray-600">{algorithmData.spaceComplexity}</p>
          </div>
        </div>

        <div className="text-sm">
          <span className="font-medium">Key Characteristics:</span>
          <ul className="list-disc list-inside mt-1 text-gray-600">
            {algorithmData.keyPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

function getAlgorithmData(algorithm, tab) {
  const algorithms = {
    recursiveBacktracking: {
      name: "Recursive Backtracking",
      description:
        "A depth-first search based algorithm that carves passages by visiting cells recursively and removing walls between them.",
      timeComplexity: "O(n)",
      spaceComplexity: "O(n)",
      keyPoints: [
        "Creates perfect mazes (exactly one path between any two points)",
        "Tends to create mazes with long corridors",
        "Uses a stack to keep track of visited cells",
      ],
    },
    prims: {
      name: "Prim's Algorithm",
      description:
        "A minimum spanning tree algorithm that starts from a random cell and expands outward by selecting random walls to remove.",
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      keyPoints: [
        "Creates mazes with shorter, more direct paths",
        "More branching than recursive backtracking",
        "Based on the minimum spanning tree concept",
      ],
    },
    kruskals: {
      name: "Kruskal's Algorithm",
      description:
        "Builds a maze by randomly selecting walls to remove while ensuring no cycles are formed using disjoint-set data structure.",
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      keyPoints: [
        "Creates mazes with a more uniform appearance",
        "Uses a disjoint-set data structure to track connected components",
        "Tends to create mazes with many short dead ends",
      ],
    },
    aStar: {
      name: "A* Algorithm",
      description: "A best-first search algorithm that uses a heuristic to find the shortest path between two points.",
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      keyPoints: [
        "Guarantees the shortest path if the heuristic is admissible",
        "Uses both path cost and heuristic estimate to guide search",
        "More efficient than Dijkstra's for most maze pathfinding",
      ],
    },
    dijkstra: {
      name: "Dijkstra's Algorithm",
      description:
        "A breadth-first search based algorithm that finds the shortest path by exploring all possible paths in order of increasing distance.",
      timeComplexity: "O(n log n)",
      spaceComplexity: "O(n)",
      keyPoints: [
        "Guarantees the shortest path in unweighted graphs",
        "Explores nodes in order of increasing distance from start",
        "Can be slower than A* since it doesn't use a heuristic",
      ],
    },
  }

  return algorithms[algorithm]
}

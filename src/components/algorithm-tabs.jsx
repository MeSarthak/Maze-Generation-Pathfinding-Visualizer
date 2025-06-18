
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Button } from "./ui/button"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

export default function AlgorithmTabs({ activeTab, onTabChange, selectedAlgorithm, onAlgorithmSelect }) {
  const getAlgorithmInfo = (algorithm) => {
    const algorithms = {
      recursiveBacktracking: {
        description: "A depth-first search based algorithm that carves passages by visiting cells recursively.",
        complexity: "Time: O(n), Space: O(n)"
      },
      prims: {
        description: "A minimum spanning tree algorithm that expands outward by selecting random walls to remove.",
        complexity: "Time: O(n log n), Space: O(n)"
      },
      kruskals: {
        description: "Builds a maze by randomly selecting walls while ensuring no cycles are formed.",
        complexity: "Time: O(n log n), Space: O(n)"
      },
      aStar: {
        description: "A best-first search algorithm that uses a heuristic to find the shortest path.",
        complexity: "Time: O(n log n), Space: O(n)"
      },
      dijkstra: {
        description: "A breadth-first search based algorithm that finds the shortest path by exploring all possible paths.",
        complexity: "Time: O(n log n), Space: O(n)"
      }
    };
    
    return algorithms[algorithm];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md">
      <Tabs defaultValue={activeTab} onValueChange={(value) => onTabChange(value)} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generation">Maze Generation</TabsTrigger>
          <TabsTrigger value="pathfinding">Pathfinding</TabsTrigger>
        </TabsList>

        <TabsContent value="generation" className="p-4 space-y-2">
          <AlgorithmButton
            name="Recursive Backtracking"
            algorithm="recursiveBacktracking"
            selected={selectedAlgorithm === "recursiveBacktracking"}
            onClick={() => onAlgorithmSelect("recursiveBacktracking")}
            info={getAlgorithmInfo("recursiveBacktracking")}
          />

          <AlgorithmButton
            name="Prim's Algorithm"
            algorithm="prims"
            selected={selectedAlgorithm === "prims"}
            onClick={() => onAlgorithmSelect("prims")}
            info={getAlgorithmInfo("prims")}
          />

          <AlgorithmButton
            name="Kruskal's Algorithm"
            algorithm="kruskals"
            selected={selectedAlgorithm === "kruskals"}
            onClick={() => onAlgorithmSelect("kruskals")}
            info={getAlgorithmInfo("kruskals")}
          />
        </TabsContent>

        <TabsContent value="pathfinding" className="p-4 space-y-2">
          <AlgorithmButton
            name="A* Algorithm"
            algorithm="aStar"
            selected={selectedAlgorithm === "aStar"}
            onClick={() => onAlgorithmSelect("aStar")}
            info={getAlgorithmInfo("aStar")}
          />

          <AlgorithmButton
            name="Dijkstra's Algorithm"
            algorithm="dijkstra"
            selected={selectedAlgorithm === "dijkstra"}
            onClick={() => onAlgorithmSelect("dijkstra")}
            info={getAlgorithmInfo("dijkstra")}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AlgorithmButton({ name, algorithm, selected, onClick, info }) {
  return (
    <div className="flex items-center w-full">
      <Button
        variant={selected ? "default" : "outline"}
        className={`w-full justify-start ${selected ? "bg-gray-900 hover:bg-gray-800" : ""}`}
        onClick={onClick}
      >
        {name}
      </Button>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="flex-shrink-0 ml-1 h-9 w-9"
              onClick={(e) => e.stopPropagation()}
            >
              <Info className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p>{info.description}</p>
              <p className="text-xs font-medium">{info.complexity}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}


"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

export default function AlgorithmTabs({ activeTab, onTabChange, selectedAlgorithm, onAlgorithmSelect }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
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
          />

          <AlgorithmButton
            name="Prim's Algorithm"
            algorithm="prims"
            selected={selectedAlgorithm === "prims"}
            onClick={() => onAlgorithmSelect("prims")}
          />

          <AlgorithmButton
            name="Kruskal's Algorithm"
            algorithm="kruskals"
            selected={selectedAlgorithm === "kruskals"}
            onClick={() => onAlgorithmSelect("kruskals")}
          />
        </TabsContent>

        <TabsContent value="pathfinding" className="p-4 space-y-2">
          <AlgorithmButton
            name="A* Algorithm"
            algorithm="aStar"
            selected={selectedAlgorithm === "aStar"}
            onClick={() => onAlgorithmSelect("aStar")}
          />

          <AlgorithmButton
            name="Dijkstra's Algorithm"
            algorithm="dijkstra"
            selected={selectedAlgorithm === "dijkstra"}
            onClick={() => onAlgorithmSelect("dijkstra")}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AlgorithmButton({ name, algorithm, selected, onClick }) {
  return (
    <Button
      variant={selected ? "default" : "outline"}
      className={`w-full justify-start ${selected ? "bg-gray-900 hover:bg-gray-800" : ""}`}
      onClick={onClick}
    >
      {name}
    </Button>
  )
}

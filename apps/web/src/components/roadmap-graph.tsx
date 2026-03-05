"use client";

import React, { useCallback } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { TopicNode } from "./nodes/TopicNode";

interface RoadmapGraphProps {
  initialNodesJson: string;
  initialEdgesJson: string;
  topicCount: number;
}

const nodeTypes = {
  topic: TopicNode,
};

// Dummy data fallback
const defaultNodes: Node[] = [
  {
    id: "1",
    position: { x: 250, y: 0 },
    data: { label: "Internet", description: "How does the internet work?" },
    type: "topic",
  },
  {
    id: "2",
    position: { x: 100, y: 150 },
    data: { label: "HTML", description: "HyperText Markup Language" },
    type: "topic",
  },
  {
    id: "3",
    position: { x: 400, y: 150 },
    data: { label: "CSS", description: "Cascading Style Sheets" },
    type: "topic",
  },
  {
    id: "4",
    position: { x: 250, y: 300 },
    data: { label: "JavaScript", description: "The language of the web" },
    type: "topic",
  },
];

const defaultEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3", animated: true },
  { id: "e2-4", source: "2", target: "4" },
  { id: "e3-4", source: "3", target: "4" },
];

export function RoadmapGraph({
  initialNodesJson,
  initialEdgesJson,
}: RoadmapGraphProps) {
  let parsedNodes: Node[] = [];
  let parsedEdges: Edge[] = [];

  try {
    const rawNodes = JSON.parse(initialNodesJson || "[]");
    const rawEdges = JSON.parse(initialEdgesJson || "[]");
    parsedNodes =
      Array.isArray(rawNodes) && rawNodes.length > 0 ? rawNodes : defaultNodes;
    parsedEdges =
      Array.isArray(rawEdges) && rawEdges.length > 0 ? rawEdges : defaultEdges;
  } catch {
    parsedNodes = defaultNodes;
    parsedEdges = defaultEdges;
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(parsedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(parsedEdges);

  React.useEffect(() => {
    let newNodes: Node[] = [];
    let newEdges: Edge[] = [];
    try {
      const rawNodes = JSON.parse(initialNodesJson || "[]");
      const rawEdges = JSON.parse(initialEdgesJson || "[]");
      newNodes =
        Array.isArray(rawNodes) && rawNodes.length > 0
          ? rawNodes
          : defaultNodes;
      newEdges =
        Array.isArray(rawEdges) && rawEdges.length > 0
          ? rawEdges
          : defaultEdges;
    } catch {
      newNodes = defaultNodes;
      newEdges = defaultEdges;
    }
    setNodes(newNodes);
    setEdges(newEdges);
  }, [initialNodesJson, initialEdgesJson, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full flex-1" style={{ minHeight: "600px" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

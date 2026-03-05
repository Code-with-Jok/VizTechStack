"use client";

import React, { useState, useCallback, useEffect } from "react";
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
  Panel,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface RoadmapEditorProps {
  onChange: (nodesJson: string, edgesJson: string, topicCount: number) => void;
}

export function RoadmapEditor({ onChange }: RoadmapEditorProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [newNodeLabel, setNewNodeLabel] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(JSON.stringify(nodes), JSON.stringify(edges), nodes.length);
    }, 300);
    return () => clearTimeout(handler);
  }, [nodes, edges, onChange]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = () => {
    if (!newNodeLabel.trim()) return;
    const newNode: Node = {
      id: Date.now().toString(),
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { label: newNodeLabel },
    };
    setNodes((nds) => [...nds, newNode]);
    setNewNodeLabel("");
  };

  const selectedNodes = nodes.filter((n) => n.selected);
  const selectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;

  const updateSelectedNode = (newLabel: string) => {
    if (!selectedNode) return;
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              label: newLabel,
            },
          };
        }
        return node;
      })
    );
  };

  const deleteSelectedNode = () => {
    if (!selectedNode) return;
    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
    setEdges((eds) =>
      eds.filter(
        (e) => e.source !== selectedNode.id && e.target !== selectedNode.id
      )
    );
  };

  return (
    <div
      style={{ width: "100%", minHeight: "500px" }}
      className="border rounded-md relative bg-white dark:bg-zinc-950 flex-1"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Panel
          position="top-left"
          className="bg-white dark:bg-zinc-900 p-3 border dark:border-zinc-800 rounded shadow-sm flex gap-2"
        >
          <input
            type="text"
            value={newNodeLabel}
            onChange={(e) => setNewNodeLabel(e.target.value)}
            placeholder="Khái niệm / Tool name"
            className="flex h-9 w-48 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 dark:text-zinc-50"
          />
          <button
            type="button"
            onClick={addNode}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 h-9 px-4 py-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
          >
            Thêm Node
          </button>
        </Panel>

        {selectedNode && (
          <Panel
            position="top-right"
            className="bg-white dark:bg-zinc-900 p-3 border dark:border-zinc-800 rounded shadow-sm flex flex-col gap-2"
          >
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              Chỉnh sửa Node
            </div>
            <input
              type="text"
              value={selectedNode.data.label as string}
              onChange={(e) => updateSelectedNode(e.target.value)}
              placeholder="Tên Node..."
              className="flex h-9 w-48 rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 dark:text-zinc-50"
            />
            <button
              type="button"
              onClick={deleteSelectedNode}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-500 bg-red-50 text-red-600 shadow-sm hover:bg-red-100 h-9 px-4 py-2 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/50"
            >
              Xóa Node này
            </button>
          </Panel>
        )}

        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

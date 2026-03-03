"use client";

import { useState } from "react";
import { CodeEditor } from "./CodeEditor";
import { useASTParser, VizNode } from "./useASTParser";
import { FiberTreeScene } from "./FiberTreeScene";
import { Maximize2, RotateCcw } from "lucide-react";

const INITIAL_CODE = `import React, { useState } from 'react';

export default function CounterApp() {
  const [count, setCount] = useState(0);

  return (
    <div className="counter-app">
      <h1>Hello Web-Anatomy</h1>
      <Display value={count} />
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
    </div>
  );
}

function Display({ value }) {
  return <span className="text-xl">Count: {value}</span>;
}
`;

export function WebAnatomyVisualizer() {
  const [code, setCode] = useState(INITIAL_CODE);
  const { root, error } = useASTParser(code);
  const [selectedNode, setSelectedNode] = useState<VizNode | null>(null);

  const resetCode = () => {
    setCode(INITIAL_CODE);
    setSelectedNode(null);
  };

  return (
    <div className="flex h-[800px] w-full rounded-2xl overflow-hidden border border-border bg-background shadow-2xl relative">
      {/* ── LEFT PANEL: CODE EDITOR ── */}
      <div className="w-5/12 border-r border-border flex flex-col relative z-10">
        <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-viz3d-hook"></span>
            JSX / TSX Editor
          </h3>
          <button
            onClick={resetCode}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <CodeEditor code={code} onChange={setCode} />
          {error && (
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-destructive/90 text-destructive-foreground text-xs font-mono max-h-32 overflow-auto">
              Error parsing code: {error}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: 3D CANVAS ── */}
      <div className="w-7/12 relative flex flex-col">
        {/* Canvas Header overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between pointer-events-none">
          <div className="pointer-events-auto bg-card/60 backdrop-blur-md border border-border/50 px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-viz3d-component"></span>{" "}
              Component
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-viz3d-html"></span> HTML
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-viz3d-hook"></span> Hook
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded bg-viz3d-text"></span> Text
            </div>
          </div>

          <button className="pointer-events-auto p-2 rounded-lg bg-card/60 backdrop-blur-md border border-border/50 text-muted-foreground hover:text-foreground">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* 3D Scene */}
        <div className="flex-1 w-full relative">
          <FiberTreeScene rootNode={root} onNodeClick={setSelectedNode} />
          {/* Inspector Overlay */}
          {selectedNode && (
            <div className="absolute bottom-6 right-6 w-64 bg-card/80 backdrop-blur-xl border border-border shadow-2xl rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4 pointer-events-auto text-sm">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-foreground tracking-tight">
                  {selectedNode.name}
                </h4>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded text-viz3d-canvas bg-viz3d-edge">
                  {selectedNode.type}
                </span>
              </div>
              <div className="text-xs text-muted-foreground font-mono bg-background/50 p-2 rounded-md">
                <p>ID: {selectedNode.id}</p>
                {selectedNode.children.length > 0 && (
                  <p>Children: {selectedNode.children.length}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

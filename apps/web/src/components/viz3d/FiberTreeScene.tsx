import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, Environment } from "@react-three/drei";
import { FiberNode } from "./FiberNode";
import { EdgeConnector } from "./EdgeConnector";
import type { VizNode } from "./useASTParser";
import * as THREE from "three";

interface FiberTreeSceneProps {
  rootNode: VizNode | null;
  onNodeClick?: (node: VizNode) => void;
}

// Helper to flatten tree and calculate positions
interface LayoutNode {
  node: VizNode;
  position: [number, number, number];
}

interface LayoutEdge {
  id: string;
  source: [number, number, number];
  target: [number, number, number];
}

export function FiberTreeScene({ rootNode, onNodeClick }: FiberTreeSceneProps) {
  // A simple top-down tree layout algorithm
  const { nodes, edges } = useMemo(() => {
    if (!rootNode) return { nodes: [], edges: [] };

    const outNodes: LayoutNode[] = [];
    const outEdges: LayoutEdge[] = [];

    const HORIZONTAL_SPACING = 2.5;
    const VERTICAL_SPACING = 2;

    // First pass: Compute widths of subtrees to center parents over children
    const subtreeWidths = new Map<VizNode, number>();

    function measure(node: VizNode): number {
      if (!node.children || node.children.length === 0) {
        subtreeWidths.set(node, HORIZONTAL_SPACING);
        return HORIZONTAL_SPACING;
      }
      const w = node.children.map(measure).reduce((a, b) => a + b, 0);
      subtreeWidths.set(node, Math.max(HORIZONTAL_SPACING, w));
      return Math.max(HORIZONTAL_SPACING, w);
    }
    measure(rootNode);

    // Second pass: Assign coordinates
    function layout(
      node: VizNode,
      xStart: number, // start X bound for this subtree
      depth: number,
      parentPos?: [number, number, number]
    ) {
      const w = subtreeWidths.get(node) || HORIZONTAL_SPACING;
      // Center X position of this node is the middle of its allowed bounding width
      const x = xStart + w / 2;
      const y = -depth * VERTICAL_SPACING;
      const z = 0; // Simple 2D tree layout in 3D space

      const pos: [number, number, number] = [x, y, z];
      outNodes.push({ node, position: pos });

      if (parentPos) {
        outEdges.push({
          id: `${node.id}-edge`,
          source: parentPos,
          target: pos,
        });
      }

      // Lay out children left to right
      let childXStart = xStart;
      node.children.forEach((child) => {
        layout(child, childXStart, depth + 1, pos);
        childXStart += subtreeWidths.get(child) || HORIZONTAL_SPACING;
      });
    }

    // Center root at X=0
    const totalW = subtreeWidths.get(rootNode) || HORIZONTAL_SPACING;
    layout(rootNode, -totalW / 2, 0);

    return { nodes: outNodes, edges: outEdges };
  }, [rootNode]);

  return (
    <div className="w-full h-full viz3d-canvas">
      <Canvas camera={{ position: [0, 2, 10], fov: 45 }}>
        {/* Lights */}
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />

        {/* Background effects */}
        <Stars
          radius={100}
          depth={50}
          count={2000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <fog attach="fog" args={["#050810", 10, 30]} />

        {/* The Tree */}
        <group position={[0, Math.max(0, edges.length * 0.5), 0]}>
          {edges.map((edge) => (
            <EdgeConnector
              key={edge.id}
              start={edge.source}
              end={edge.target}
            />
          ))}

          {nodes.map((n) => (
            <FiberNode
              key={n.node.id}
              node={n.node}
              position={n.position}
              onClick={onNodeClick}
            />
          ))}
        </group>

        {/* Orbit Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 + 0.2} // Prevent looking completely from below
          minDistance={2}
          maxDistance={30}
        />
      </Canvas>
    </div>
  );
}

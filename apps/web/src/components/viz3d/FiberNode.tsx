import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Html } from "@react-three/drei";
import * as THREE from "three";
import type { VizNode } from "./useASTParser";

export interface FiberNodeProps {
  node: VizNode;
  position: [number, number, number];
  onHover?: (node: VizNode) => void;
  onClick?: (node: VizNode) => void;
}

const colorMap = {
  html: "var(--viz3d-html-hex)",
  component: "var(--viz3d-component-hex)",
  hook: "var(--viz3d-hook-hex)",
  state: "var(--viz3d-state-hex)",
  text: "var(--viz3d-text-hex)",
  unknown: "#555555",
};

export function FiberNode({
  node,
  position,
  onHover,
  onClick,
}: FiberNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  // Custom floating animation for nodes
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
    }
  });

  const baseColor = colorMap[node.type] || colorMap.unknown;

  // Box geometry for components/html, sphere for hooks
  const Geometry =
    node.type === "hook" || node.type === "state" ? (
      <sphereGeometry args={[0.4, 32, 32]} />
    ) : node.type === "text" ? (
      <planeGeometry args={[0.8, 0.4]} />
    ) : (
      <boxGeometry args={[0.8, 0.8, 0.8]} />
    );

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(node);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          onHover?.(node);
        }}
        onPointerOut={(e) => {
          document.body.style.cursor = "auto";
        }}
      >
        {Geometry}
        <meshPhysicalMaterial
          color={baseColor}
          emissive={baseColor}
          emissiveIntensity={0.5}
          transparent={true}
          opacity={0.8}
          roughness={0.2}
          metalness={0.8}
          clearcoat={1.0}
        />

        {/* Glow effect hack */}
        <pointLight color={baseColor} distance={3} intensity={0.5} />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.25}
        color="#f8fafc"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#050810"
      >
        {node.name}
      </Text>

      {/* Type badge HTML */}
      {node.type !== "unknown" && (
        <Html position={[0.5, 0.5, 0]} center>
          <div
            className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-xl"
            style={{ backgroundColor: baseColor, color: "#fff" }}
          >
            {node.type}
          </div>
        </Html>
      )}
    </group>
  );
}

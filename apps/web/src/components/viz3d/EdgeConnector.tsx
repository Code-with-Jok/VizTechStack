import { QuadraticBezierLine } from "@react-three/drei";

interface EdgeConnectorProps {
  start: [number, number, number];
  end: [number, number, number];
  color?: string;
  lineWidth?: number;
  dashed?: boolean;
}

export function EdgeConnector({
  start,
  end,
  color = "var(--viz3d-edge-hex)",
  lineWidth = 2,
  dashed = true,
}: EdgeConnectorProps) {
  // Calculate a control point for the Bezier curve
  // We want the lines to curve downwards naturally like a tree
  const midX = (start[0] + end[0]) / 2;
  const midY = start[1]; // Keep midY high to bend downwards

  return (
    <QuadraticBezierLine
      start={start}
      end={end}
      mid={[midX, midY, start[2]]}
      color={color}
      lineWidth={lineWidth}
      dashed={dashed}
      dashScale={dashed ? 10 : 1}
      dashSize={dashed ? 1 : 1}
      dashOffset={0}
      transparent={true}
      opacity={0.6}
    />
  );
}

import { z } from "zod";

export const RoadmapNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().default(200),
  height: z.number().default(50),
  group: z.string().optional(),
  style: z
    .enum(["default", "primary", "secondary", "checkpoint"])
    .default("default"),
});

export const RoadmapEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});

export const RoadmapSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(["role", "skill", "best-practice"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  nodes: z.array(RoadmapNodeSchema),
  edges: z.array(RoadmapEdgeSchema),
});

// Infer types từ schemas — KHÔNG cần define type thủ công
export type RoadmapNode = z.infer<typeof RoadmapNodeSchema>;
export type RoadmapEdge = z.infer<typeof RoadmapEdgeSchema>;
export type Roadmap = z.infer<typeof RoadmapSchema>;

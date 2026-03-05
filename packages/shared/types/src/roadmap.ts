import { z } from "zod";

export const ROADMAP_CATEGORY_VALUES = [
  "role",
  "skill",
  "best-practice",
] as const;

export const ROADMAP_DIFFICULTY_VALUES = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export const ROADMAP_STATUS_VALUES = ["public", "draft", "private"] as const;

export const RoadmapCategorySchema = z.enum(ROADMAP_CATEGORY_VALUES);
export const RoadmapDifficultySchema = z.enum(ROADMAP_DIFFICULTY_VALUES);
export const RoadmapStatusSchema = z.enum(ROADMAP_STATUS_VALUES);

export type RoadmapCategory = z.infer<typeof RoadmapCategorySchema>;
export type RoadmapDifficulty = z.infer<typeof RoadmapDifficultySchema>;
export type RoadmapStatus = z.infer<typeof RoadmapStatusSchema>;

export const RoadmapGraphNodeSchema = z.object({
  id: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.unknown()),
  type: z.string().optional(),
}).passthrough();

export const RoadmapGraphEdgeSchema = z.object({
  id: z.string().optional(),
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
}).passthrough();

export const RoadmapSummarySchema = z.object({
  _id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  category: RoadmapCategorySchema,
  difficulty: RoadmapDifficultySchema,
  topicCount: z.number().int().nonnegative(),
  status: RoadmapStatusSchema,
});

export const RoadmapDetailSchema = RoadmapSummarySchema.extend({
  nodesJson: z.string(),
  edgesJson: z.string(),
});

export const RoadmapPageSchema = z.object({
  items: z.array(RoadmapSummarySchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});

export const RoadmapPageInputSchema = z.object({
  category: RoadmapCategorySchema.optional(),
  cursor: z.string().nullable().optional(),
  limit: z.number().int().min(1).max(100).default(24),
});

export const CreateRoadmapInputSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  category: RoadmapCategorySchema,
  difficulty: RoadmapDifficultySchema,
  nodesJson: z.string().default("[]"),
  edgesJson: z.string().default("[]"),
  topicCount: z.number().int().nonnegative().default(0),
  status: RoadmapStatusSchema.default("public"),
});

export type RoadmapGraphNode = z.infer<typeof RoadmapGraphNodeSchema>;
export type RoadmapGraphEdge = z.infer<typeof RoadmapGraphEdgeSchema>;
export type RoadmapSummary = z.infer<typeof RoadmapSummarySchema>;
export type RoadmapDetail = z.infer<typeof RoadmapDetailSchema>;
export type RoadmapPage = z.infer<typeof RoadmapPageSchema>;
export type RoadmapPageInput = z.infer<typeof RoadmapPageInputSchema>;
export type CreateRoadmapInput = z.infer<typeof CreateRoadmapInputSchema>;

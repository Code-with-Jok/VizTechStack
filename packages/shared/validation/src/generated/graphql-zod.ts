import { z } from "zod";
import {
  CreateRoadmapInput,
  RoadmapCategory,
  RoadmapDifficulty,
  RoadmapPageInput,
  RoadmapStatus,
} from "@viztechstack/graphql-generated";

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny =>
  v !== undefined && v !== null;

export const definedNonNullAnySchema = z
  .any()
  .refine((v) => isDefinedNonNullAny(v));

export const RoadmapCategorySchema = z.enum(["BEST_PRACTICE", "ROLE", "SKILL"]);

export const RoadmapDifficultySchema = z.enum([
  "ADVANCED",
  "BEGINNER",
  "INTERMEDIATE",
]);

export const RoadmapStatusSchema = z.enum(["DRAFT", "PRIVATE", "PUBLIC"]);

export function CreateRoadmapInputSchema(): z.ZodObject<
  Properties<CreateRoadmapInput>
> {
  return z.object({
    category: RoadmapCategorySchema,
    description: z.string(),
    difficulty: RoadmapDifficultySchema,
    edgesJson: z.string().default("[]").nullish(),
    nodesJson: z.string().default("[]").nullish(),
    slug: z.string(),
    status: RoadmapStatusSchema.default("PUBLIC").nullish(),
    title: z.string(),
    topicCount: z.number().default(0).nullish(),
  });
}

export function RoadmapPageInputSchema(): z.ZodObject<
  Properties<RoadmapPageInput>
> {
  return z.object({
    category: RoadmapCategorySchema.nullish(),
    cursor: z.string().nullish(),
    limit: z.number().default(24).nullish(),
  });
}

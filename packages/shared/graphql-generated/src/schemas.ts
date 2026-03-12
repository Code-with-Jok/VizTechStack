import { z } from 'zod'
import { CreateRoadmapInput, NodeCategory, Roadmap, UpdateRoadmapInput } from './types'

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v));

export const NodeCategorySchema = z.nativeEnum(NodeCategory);

export function CreateRoadmapInputSchema(): z.ZodObject<Properties<CreateRoadmapInput>> {
  return z.object({
    content: z.string(),
    description: z.string(),
    isPublished: z.boolean(),
    nodeCategory: NodeCategorySchema,
    slug: z.string(),
    tags: z.array(z.string()),
    title: z.string()
  })
}

export function RoadmapSchema(): z.ZodObject<Properties<Roadmap>> {
  return z.object({
    __typename: z.literal('Roadmap').optional(),
    author: z.string(),
    content: z.string(),
    description: z.string(),
    id: z.string(),
    isPublished: z.boolean(),
    nodeCategory: NodeCategorySchema,
    publishedAt: z.number(),
    slug: z.string(),
    tags: z.array(z.string()),
    title: z.string(),
    updatedAt: z.number()
  })
}

export function UpdateRoadmapInputSchema(): z.ZodObject<Properties<UpdateRoadmapInput>> {
  return z.object({
    content: z.string().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    isPublished: z.boolean().nullish(),
    nodeCategory: NodeCategorySchema.nullish(),
    slug: z.string().nullish(),
    tags: z.array(z.string().nullable()).nullish(),
    title: z.string().nullish()
  })
}

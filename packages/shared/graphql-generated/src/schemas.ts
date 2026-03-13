import { z } from 'zod'
import { Article, CreateArticleInput, CreateRoadmapInput, Node, Roadmap, UpdateArticleInput, UpdateRoadmapInput } from './types'

type Properties<T> = Required<{
  [K in keyof T]: z.ZodType<T[K], any, T[K]>;
}>;

type definedNonNullAny = {};

export const isDefinedNonNullAny = (v: any): v is definedNonNullAny => v !== undefined && v !== null;

export const definedNonNullAnySchema = z.any().refine((v) => isDefinedNonNullAny(v));

export function ArticleSchema(): z.ZodObject<Properties<Article>> {
  return z.object({
    __typename: z.literal('Article').optional(),
    author: z.string(),
    content: z.string(),
    createdAt: z.number(),
    id: z.string(),
    isDeleted: z.boolean(),
    isPublished: z.boolean(),
    readingTime: z.number(),
    slug: z.string(),
    tags: z.array(z.string()),
    title: z.string(),
    updatedAt: z.number(),
    wordCount: z.number()
  })
}

export function CreateArticleInputSchema(): z.ZodObject<Properties<CreateArticleInput>> {
  return z.object({
    content: z.string(),
    isPublished: z.boolean(),
    slug: z.string(),
    tags: z.array(z.string()),
    title: z.string()
  })
}

export function CreateRoadmapInputSchema(): z.ZodObject<Properties<CreateRoadmapInput>> {
  return z.object({
    content: z.string(),
    description: z.string(),
    isPublished: z.boolean(),
    slug: z.string(),
    tags: z.array(z.string()),
    title: z.string()
  })
}

export function NodeSchema(): z.ZodObject<Properties<Node>> {
  return z.object({
    author: z.string(),
    createdAt: z.number(),
    id: z.string(),
    isPublished: z.boolean(),
    slug: z.string(),
    title: z.string(),
    updatedAt: z.number()
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
    publishedAt: z.number(),
    slug: z.string(),
    tags: z.array(z.string()),
    title: z.string(),
    updatedAt: z.number()
  })
}

export function UpdateArticleInputSchema(): z.ZodObject<Properties<UpdateArticleInput>> {
  return z.object({
    content: z.string().nullish(),
    id: z.string(),
    isPublished: z.boolean().nullish(),
    slug: z.string().nullish(),
    tags: z.array(z.string().nullable()).nullish(),
    title: z.string().nullish()
  })
}

export function UpdateRoadmapInputSchema(): z.ZodObject<Properties<UpdateRoadmapInput>> {
  return z.object({
    content: z.string().nullish(),
    description: z.string().nullish(),
    id: z.string(),
    isPublished: z.boolean().nullish(),
    slug: z.string().nullish(),
    tags: z.array(z.string().nullable()).nullish(),
    title: z.string().nullish()
  })
}

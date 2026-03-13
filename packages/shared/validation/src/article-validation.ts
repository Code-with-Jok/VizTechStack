import { z } from 'zod';

/**
 * Slug validation regex: lowercase alphanumeric with hyphens only
 * Examples: "my-article", "hello-world-123"
 */
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Article schema for full article validation
 */
export const ArticleSchema = z.object({
    id: z.string().optional(),
    slug: z
        .string()
        .min(1, 'Slug không được để trống')
        .max(100, 'Slug không được vượt quá 100 ký tự')
        .regex(slugRegex, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'),
    title: z
        .string()
        .min(1, 'Tiêu đề không được để trống')
        .max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
    content: z.string().min(1, 'Nội dung không được để trống'),
    author: z.string().optional(),
    tags: z.array(z.string()).default([]),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
    isPublished: z.boolean().default(false),
    isDeleted: z.boolean().default(false),
    readingTime: z.number().optional(),
    wordCount: z.number().optional(),
});

/**
 * Schema for creating a new article
 */
export const CreateArticleInputSchema = z.object({
    slug: z
        .string()
        .min(1, 'Slug không được để trống')
        .max(100, 'Slug không được vượt quá 100 ký tự')
        .regex(slugRegex, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang'),
    title: z
        .string()
        .min(1, 'Tiêu đề không được để trống')
        .max(200, 'Tiêu đề không được vượt quá 200 ký tự'),
    content: z.string().min(1, 'Nội dung không được để trống'),
    tags: z.array(z.string()).default([]),
    isPublished: z.boolean().default(false),
});

/**
 * Schema for updating an existing article
 */
export const UpdateArticleInputSchema = z.object({
    id: z.string().min(1, 'ID không được để trống'),
    slug: z
        .string()
        .min(1, 'Slug không được để trống')
        .max(100, 'Slug không được vượt quá 100 ký tự')
        .regex(slugRegex, 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang')
        .optional(),
    title: z
        .string()
        .min(1, 'Tiêu đề không được để trống')
        .max(200, 'Tiêu đề không được vượt quá 200 ký tự')
        .optional(),
    content: z.string().min(1, 'Nội dung không được để trống').optional(),
    tags: z.array(z.string()).optional(),
    isPublished: z.boolean().optional(),
});

/**
 * Type exports
 */
export type Article = z.infer<typeof ArticleSchema>;
export type CreateArticleInput = z.infer<typeof CreateArticleInputSchema>;
export type UpdateArticleInput = z.infer<typeof UpdateArticleInputSchema>;

/**
 * Validation functions
 */
export function validateArticle(data: unknown): Article {
    return ArticleSchema.parse(data);
}

export function validateCreateArticleInput(data: unknown): CreateArticleInput {
    return CreateArticleInputSchema.parse(data);
}

export function validateUpdateArticleInput(data: unknown): UpdateArticleInput {
    return UpdateArticleInputSchema.parse(data);
}

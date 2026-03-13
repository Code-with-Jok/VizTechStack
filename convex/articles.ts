import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Query: List all published articles (public)
 * Returns articles where isPublished=true and isDeleted=false
 * Ordered by createdAt descending
 * Requirements: 2.6, 2.10
 */
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("articles")
            .withIndex("by_published", (q) => q.eq("isPublished", true))
            .filter((q) => q.eq(q.field("isDeleted"), false))
            .order("desc")
            .collect();
    },
});

/**
 * Query: List all articles (admin only - includes drafts and deleted)
 * Returns all articles ordered by updatedAt descending
 * Used for admin dashboard
 * Requirements: 2.6, 10.8
 */
export const listAll = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db
            .query("articles")
            .order("desc")
            .collect();
    },
});

/**
 * Query: Get article by slug (public)
 * Returns a single published and non-deleted article or null if not found
 * Requirements: 2.6, 2.7, 8.1
 */
export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, { slug }) => {
        const article = await ctx.db
            .query("articles")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .first();

        // Only return if published and not deleted (for public access)
        if (article && article.isPublished && !article.isDeleted) {
            return article;
        }

        return null;
    },
});

/**
 * Mutation: Create article (admin only - enforced by NestJS)
 * Auto-generates createdAt and updatedAt timestamps
 * Requirements: 2.6, 2.7, 2.10, 10.7
 */
export const create = mutation({
    args: {
        slug: v.string(),
        title: v.string(),
        content: v.string(),
        author: v.string(),
        tags: v.array(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
        isPublished: v.boolean(),
        isDeleted: v.boolean(),
        readingTime: v.number(),
        wordCount: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("articles", args);
    },
});

/**
 * Mutation: Update article (admin only - enforced by NestJS)
 * Auto-updates updatedAt timestamp
 * Requirements: 2.8, 2.9, 10.7
 */
export const update = mutation({
    args: {
        id: v.id("articles"),
        slug: v.optional(v.string()),
        title: v.optional(v.string()),
        content: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
        isPublished: v.optional(v.boolean()),
        updatedAt: v.number(),
        readingTime: v.optional(v.number()),
        wordCount: v.optional(v.number()),
    },
    handler: async (ctx, { id, ...updates }) => {
        await ctx.db.patch(id, updates);
        return id;
    },
});

/**
 * Mutation: Soft delete article (admin only - enforced by NestJS)
 * Sets isDeleted=true instead of removing from database
 * Requirements: 2.9, 10.8
 */
export const softDelete = mutation({
    args: { id: v.id("articles") },
    handler: async (ctx, { id }) => {
        await ctx.db.patch(id, {
            isDeleted: true,
            updatedAt: Date.now(),
        });
        return id;
    },
});

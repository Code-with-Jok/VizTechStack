import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Query: List all published roadmaps (public)
 * Returns roadmaps ordered by publishedAt descending
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("roadmaps")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("desc")
      .collect();
  },
});

/**
 * Query: List all roadmaps (admin only - includes drafts)
 * Returns all roadmaps ordered by updatedAt descending
 * Used for admin dashboard
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("roadmaps")
      .order("desc")
      .collect();
  },
});

/**
 * Query: Get roadmap by slug (public)
 * Returns a single roadmap or null if not found
 * Requirements: 4.1, 4.2, 4.3, 4.4
 */
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("roadmaps")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

/**
 * Mutation: Create roadmap (admin only - enforced by NestJS)
 * Auto-generates publishedAt and updatedAt timestamps
 * Requirements: 7.2
 */
export const create = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    author: v.string(),
    // authorName: v.string(), // Temporarily disabled
    tags: v.array(v.string()),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("roadmaps", {
      ...args,
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Mutation: Update roadmap (admin only - enforced by NestJS)
 * Auto-updates updatedAt timestamp
 * Requirements: 7.4
 */
export const update = mutation({
  args: {
    id: v.id("roadmaps"),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    content: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return id;
  },
});

/**
 * Mutation: Delete roadmap (admin only - enforced by NestJS)
 * Requirements: 7.5
 */
export const remove = mutation({
  args: { id: v.id("roadmaps") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});

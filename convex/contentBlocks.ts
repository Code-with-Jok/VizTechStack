import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const blockTypeValidator = v.union(
  v.literal("text"),
  v.literal("code"),
  v.literal("interactive"),
  v.literal("diagram")
);

export const listByLesson = query({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contentBlocks")
      .withIndex("by_lesson", (q) => q.eq("lessonId", args.lessonId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    lessonId: v.id("lessons"),
    type: blockTypeValidator,
    title: v.optional(v.string()),
    content: v.string(),
    language: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("contentBlocks", args);
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("contentBlocks"),
    type: v.optional(blockTypeValidator),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    language: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("contentBlocks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return true;
  },
});

export const reorder = mutation({
  args: {
    updates: v.array(
      v.object({ id: v.id("contentBlocks"), order: v.number() })
    ),
  },
  handler: async (ctx, { updates }) => {
    await Promise.all(
      updates.map(({ id, order }) => ctx.db.patch(id, { order }))
    );
    return true;
  },
});

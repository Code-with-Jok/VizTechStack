import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByChapter = query({
  args: { chapterId: v.id("chapters") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessons")
      .withIndex("by_chapter", (q) => q.eq("chapterId", args.chapterId))
      .order("asc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("lessons") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const create = mutation({
  args: {
    chapterId: v.id("chapters"),
    title: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("lessons", args);
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("lessons"),
    title: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
    return ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("lessons") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return true;
  },
});

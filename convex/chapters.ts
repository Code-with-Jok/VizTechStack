import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByCourse = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chapters")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("chapters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    order: v.number(),
    x: v.number(),
    y: v.number(),
    parentId: v.optional(v.id("chapters")),
    status: v.union(
      v.literal("locked"),
      v.literal("available"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("chapters", args);
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    id: v.id("chapters"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
    parentId: v.optional(v.id("chapters")),
    status: v.optional(
      v.union(
        v.literal("locked"),
        v.literal("available"),
        v.literal("completed")
      )
    ),
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
  args: { id: v.id("chapters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return true;
  },
});

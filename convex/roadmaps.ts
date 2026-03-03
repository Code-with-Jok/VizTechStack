import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    category: v.optional(
      v.union(v.literal("role"), v.literal("skill"), v.literal("best-practice"))
    ),
  },
  handler: async (ctx, args) => {
    if (args.category !== undefined) {
      const category = args.category;
      return await ctx.db
        .query("roadmaps")
        .withIndex("by_category", (q) => q.eq("category", category))
        .collect();
    }
    return await ctx.db.query("roadmaps").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("roadmaps")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

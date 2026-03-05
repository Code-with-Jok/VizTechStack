import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createRoadmap = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("role"),
      v.literal("skill"),
      v.literal("best-practice")
    ),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    topicCount: v.number(),
    nodesJson: v.string(),
    edgesJson: v.string(),
    status: v.union(
      v.literal("public"),
      v.literal("draft"),
      v.literal("private")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to createRoadmap");
    }

    // Role check: Only admin can create
    const role = (identity as any).publicMetadata?.role;
    if (role !== "admin") {
      throw new Error("Unauthorized: Only admins can manage roadmaps.");
    }

    // Check for duplicate slug
    const existing = await ctx.db
      .query("roadmaps")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error(`Roadmap with slug '${args.slug}' already exists.`);
    }

    const roadmapId = await ctx.db.insert("roadmaps", {
      ...args,
      userId: identity.subject,
    });
    return roadmapId;
  },
});

export const list = query({
  args: {
    category: v.optional(
      v.union(v.literal("role"), v.literal("skill"), v.literal("best-practice"))
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const role = (identity as any)?.publicMetadata?.role;
    const isAdmin = role === "admin";

    let results;
    if (args.category !== undefined) {
      if (isAdmin) {
        results = await ctx.db
          .query("roadmaps")
          .withIndex("by_category", (q) =>
            q.eq("category", args.category as any)
          )
          .collect();
      } else {
        results = await ctx.db
          .query("roadmaps")
          .withIndex("by_category_status", (q) =>
            q.eq("category", args.category as any).eq("status", "public")
          )
          .collect();
      }
    } else {
      if (isAdmin) {
        results = await ctx.db.query("roadmaps").collect();
      } else {
        results = await ctx.db
          .query("roadmaps")
          .withIndex("by_status", (q) => q.eq("status", "public"))
          .collect();
      }
    }

    return results;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const roadmap = await ctx.db
      .query("roadmaps")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!roadmap) return null;

    if (roadmap.status === "public") return roadmap;

    const identity = await ctx.auth.getUserIdentity();
    const role = (identity as any)?.publicMetadata?.role;
    if (role === "admin") return roadmap;

    return null; // Restricted
  },
});

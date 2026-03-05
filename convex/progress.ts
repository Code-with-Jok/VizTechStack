import { query, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";

export const getUserProgress = query({
  args: {
    roadmapId: v.id("roadmaps"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to getUserProgress");
    }
    const userId = identity.subject as Id<"users">;

    return await ctx.db
      .query("progress")
      .withIndex("by_user_roadmap", (q) =>
        q.eq("userId", userId).eq("roadmapId", args.roadmapId)
      )
      .collect();
  },
});

export const updateProgress = mutation({
  args: {
    roadmapId: v.id("roadmaps"),
    nodeId: v.string(),
    status: v.union(
      v.literal("done"),
      v.literal("in-progress"),
      v.literal("skipped")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to updateProgress");
    }
    const userId = identity.subject as Id<"users">;

    // Tìm progress hiện có bằng composite index mới
    const existing = await ctx.db
      .query("progress")
      .withIndex("by_user_roadmap_node", (q) =>
        q
          .eq("userId", userId)
          .eq("roadmapId", args.roadmapId)
          .eq("nodeId", args.nodeId)
      )
      .unique();

    // Update nếu đã tồn tại, insert nếu chưa
    if (existing) {
      await ctx.db.patch(existing._id, { status: args.status });
      return existing._id;
    }

    return await ctx.db.insert("progress", {
      userId,
      roadmapId: args.roadmapId,
      nodeId: args.nodeId,
      status: args.status,
    });
  },
});

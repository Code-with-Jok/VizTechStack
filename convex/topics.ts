import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getRole } from "./_utils";

function assertAdmin(identity: unknown, operation: string): void {
    if (getRole(identity) !== "admin") {
        throw new Error(`Unauthorized: admin role is required for ${operation}.`);
    }
}

export const createTopic = mutation({
    args: {
        roadmapId: v.id("roadmaps"),
        nodeId: v.string(),
        title: v.string(),
        content: v.string(),
        resources: v.array(
            v.object({
                title: v.string(),
                url: v.string(),
                type: v.union(
                    v.literal("article"),
                    v.literal("video"),
                    v.literal("course")
                ),
            })
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated call to createTopic");
        }

        assertAdmin(identity, "createTopic");

        // Check if roadmap exists
        const roadmap = await ctx.db.get(args.roadmapId);
        if (!roadmap) {
            throw new Error(`Roadmap with id '${args.roadmapId}' not found.`);
        }

        const topicId = await ctx.db.insert("topics", args);

        return topicId;
    },
});

export const getByNodeId = query({
    args: {
        roadmapId: v.id("roadmaps"),
        nodeId: v.string(),
    },
    handler: async (ctx, args) => {
        const topic = await ctx.db
            .query("topics")
            .withIndex("by_roadmap", (q) => q.eq("roadmapId", args.roadmapId))
            .filter((q) => q.eq(q.field("nodeId"), args.nodeId))
            .first();

        return topic;
    },
});

export const getByRoadmapId = query({
    args: {
        roadmapId: v.id("roadmaps"),
    },
    handler: async (ctx, args) => {
        const topics = await ctx.db
            .query("topics")
            .withIndex("by_roadmap", (q) => q.eq("roadmapId", args.roadmapId))
            .collect();

        return topics;
    },
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProgress = exports.getUserProgress = void 0;
const server_1 = require("./_generated/server");
const values_1 = require("convex/values");
exports.getUserProgress = (0, server_1.query)({
    args: {
        roadmapId: values_1.v.id("roadmaps"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated call to getUserProgress");
        }
        const userId = identity.subject; // Using subject as the user identifier in DB
        return await ctx.db
            .query("progress")
            .withIndex("by_user_roadmap", (q) => q.eq("userId", userId).eq("roadmapId", args.roadmapId))
            .collect();
    },
});
exports.updateProgress = (0, server_1.mutation)({
    args: {
        roadmapId: values_1.v.id("roadmaps"),
        nodeId: values_1.v.string(),
        status: values_1.v.union(values_1.v.literal("done"), values_1.v.literal("in-progress"), values_1.v.literal("skipped")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated call to updateProgress");
        }
        const userId = identity.subject;
        // Tìm progress hiện có bằng composite index mới
        const existing = await ctx.db
            .query("progress")
            .withIndex("by_user_roadmap_node", (q) => q
            .eq("userId", userId)
            .eq("roadmapId", args.roadmapId)
            .eq("nodeId", args.nodeId))
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
//# sourceMappingURL=progress.js.map
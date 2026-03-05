"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBySlug = exports.list = exports.createRoadmap = void 0;
const server_1 = require("./_generated/server");
const values_1 = require("convex/values");
exports.createRoadmap = (0, server_1.mutation)({
    args: {
        slug: values_1.v.string(),
        title: values_1.v.string(),
        description: values_1.v.string(),
        category: values_1.v.union(values_1.v.literal("role"), values_1.v.literal("skill"), values_1.v.literal("best-practice")),
        difficulty: values_1.v.union(values_1.v.literal("beginner"), values_1.v.literal("intermediate"), values_1.v.literal("advanced")),
        topicCount: values_1.v.number(),
        nodesJson: values_1.v.string(),
        edgesJson: values_1.v.string(),
        status: values_1.v.union(values_1.v.literal("public"), values_1.v.literal("draft"), values_1.v.literal("private")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated call to createRoadmap");
        }
        // Role check: Only admin can create
        const role = identity.publicMetadata?.role;
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
exports.list = (0, server_1.query)({
    args: {
        category: values_1.v.optional(values_1.v.union(values_1.v.literal("role"), values_1.v.literal("skill"), values_1.v.literal("best-practice"))),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        const role = identity?.publicMetadata?.role;
        const isAdmin = role === "admin";
        let results;
        if (args.category !== undefined) {
            if (isAdmin) {
                results = await ctx.db
                    .query("roadmaps")
                    .withIndex("by_category", (q) => q.eq("category", args.category))
                    .collect();
            }
            else {
                results = await ctx.db
                    .query("roadmaps")
                    .withIndex("by_category_status", (q) => q.eq("category", args.category).eq("status", "public"))
                    .collect();
            }
        }
        else {
            if (isAdmin) {
                results = await ctx.db.query("roadmaps").collect();
            }
            else {
                results = await ctx.db
                    .query("roadmaps")
                    .withIndex("by_status", (q) => q.eq("status", "public"))
                    .collect();
            }
        }
        return results;
    },
});
exports.getBySlug = (0, server_1.query)({
    args: { slug: values_1.v.string() },
    handler: async (ctx, args) => {
        const roadmap = await ctx.db
            .query("roadmaps")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
        if (!roadmap)
            return null;
        if (roadmap.status === "public")
            return roadmap;
        const identity = await ctx.auth.getUserIdentity();
        const role = identity?.publicMetadata?.role;
        if (role === "admin")
            return roadmap;
        return null; // Restricted
    },
});
//# sourceMappingURL=roadmaps.js.map
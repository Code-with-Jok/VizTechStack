"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("convex/server");
const values_1 = require("convex/values");
exports.default = (0, server_1.defineSchema)({
    // Roadmaps: Frontend, Backend, DevOps...
    roadmaps: (0, server_1.defineTable)({
        slug: values_1.v.string(),
        title: values_1.v.string(),
        description: values_1.v.string(),
        category: values_1.v.union(values_1.v.literal("role"), values_1.v.literal("skill"), values_1.v.literal("best-practice")),
        difficulty: values_1.v.union(values_1.v.literal("beginner"), values_1.v.literal("intermediate"), values_1.v.literal("advanced")),
        nodesJson: values_1.v.string(), // JSON string chứa SVG node definitions
        edgesJson: values_1.v.string(), // JSON string chứa connections giữa nodes
        topicCount: values_1.v.number(),
        userId: values_1.v.optional(values_1.v.string()), // Optional for seeded data
        status: values_1.v.union(values_1.v.literal("public"), values_1.v.literal("draft"), values_1.v.literal("private")),
    })
        .index("by_slug", ["slug"])
        .index("by_category", ["category"])
        .index("by_status", ["status"])
        .index("by_category_status", ["category", "status"]),
    // Topics: nội dung chi tiết của mỗi node trong roadmap
    topics: (0, server_1.defineTable)({
        roadmapId: values_1.v.id("roadmaps"),
        nodeId: values_1.v.string(),
        title: values_1.v.string(),
        content: values_1.v.string(), // Markdown
        resources: values_1.v.array(values_1.v.object({
            title: values_1.v.string(),
            url: values_1.v.string(),
            type: values_1.v.union(values_1.v.literal("article"), values_1.v.literal("video"), values_1.v.literal("course")),
        })),
    }).index("by_roadmap", ["roadmapId"]),
    // Users
    users: (0, server_1.defineTable)({
        email: values_1.v.string(),
        name: values_1.v.string(),
        avatar: values_1.v.optional(values_1.v.string()),
        role: values_1.v.union(values_1.v.literal("user"), values_1.v.literal("admin")),
    }).index("by_email", ["email"]),
    // Progress: tracking user hoàn thành node nào
    progress: (0, server_1.defineTable)({
        userId: values_1.v.id("users"),
        roadmapId: values_1.v.id("roadmaps"),
        nodeId: values_1.v.string(),
        status: values_1.v.union(values_1.v.literal("done"), values_1.v.literal("in-progress"), values_1.v.literal("skipped")),
    })
        .index("by_user_roadmap", ["userId", "roadmapId"])
        .index("by_user_roadmap_node", ["userId", "roadmapId", "nodeId"]),
    // Bookmarks
    bookmarks: (0, server_1.defineTable)({
        userId: values_1.v.id("users"),
        roadmapId: values_1.v.id("roadmaps"),
    }).index("by_user", ["userId"]),
    // Guides: bài viết hướng dẫn
    guides: (0, server_1.defineTable)({
        slug: values_1.v.string(),
        title: values_1.v.string(),
        description: values_1.v.string(),
        content: values_1.v.string(),
        author: values_1.v.string(),
        tags: values_1.v.array(values_1.v.string()),
        publishedAt: values_1.v.number(),
    }).index("by_slug", ["slug"]),
});
//# sourceMappingURL=schema.js.map
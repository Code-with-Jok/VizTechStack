import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Roadmaps: Frontend, Backend, DevOps...
  roadmaps: defineTable({
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
    nodesJson: v.string(), // JSON string chứa SVG node definitions
    edgesJson: v.string(), // JSON string chứa connections giữa nodes
    topicCount: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"]),

  // Topics: nội dung chi tiết của mỗi node trong roadmap
  topics: defineTable({
    roadmapId: v.id("roadmaps"),
    nodeId: v.string(),
    title: v.string(),
    content: v.string(), // Markdown
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
  }).index("by_roadmap", ["roadmapId"]),

  // Users
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
  }).index("by_email", ["email"]),

  // Progress: tracking user hoàn thành node nào
  progress: defineTable({
    userId: v.id("users"),
    roadmapId: v.id("roadmaps"),
    nodeId: v.string(),
    status: v.union(
      v.literal("done"),
      v.literal("in-progress"),
      v.literal("skipped")
    ),
  })
    .index("by_user_roadmap", ["userId", "roadmapId"])
    .index("by_user_roadmap_node", ["userId", "roadmapId", "nodeId"]),

  // Bookmarks
  bookmarks: defineTable({
    userId: v.id("users"),
    roadmapId: v.id("roadmaps"),
  }).index("by_user", ["userId"]),

  // Guides: bài viết hướng dẫn
  guides: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    author: v.string(),
    tags: v.array(v.string()),
    publishedAt: v.number(),
  }).index("by_slug", ["slug"]),
});

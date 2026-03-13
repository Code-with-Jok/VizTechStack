import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
  }).index("by_email", ["email"]),

  articles: defineTable({
    slug: v.string(),
    title: v.string(),
    content: v.string(),
    author: v.string(),
    tags: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    isPublished: v.boolean(),
    isDeleted: v.boolean(),
    readingTime: v.number(),
    wordCount: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_author", ["author"])
    .index("by_published", ["isPublished", "createdAt"])
    .index("by_tags", ["tags"]),

  guides: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    author: v.string(),
    tags: v.array(v.string()),
    publishedAt: v.number(),
  }).index("by_slug", ["slug"]),

  roadmaps: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.optional(v.string()),
    author: v.optional(v.string()),
    // authorName: v.optional(v.string()), // Temporarily disabled
    tags: v.optional(v.array(v.string())),
    publishedAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
    // Legacy fields for old roadmap structure
    category: v.optional(v.string()),
    status: v.optional(v.string()),
    difficulty: v.optional(v.string()),
    topicCount: v.optional(v.number()),
    nodesJson: v.optional(v.string()),
    edgesJson: v.optional(v.string()),
    createdAt: v.optional(v.number()),
    userId: v.optional(v.string()),
    nodeCategory: v.optional(v.string()), // Legacy field from old data
  })
    .index("by_slug", ["slug"])
    .index("by_author", ["author"])
    .index("by_published", ["isPublished", "publishedAt"]),
});

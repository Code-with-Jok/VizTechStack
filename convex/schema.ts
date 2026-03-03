import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  courses: defineTable({
    title: v.string(),
    description: v.string(),
    icon: v.string(),
    slug: v.string(),
  }).index("by_slug", ["slug"]),

  chapters: defineTable({
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
      v.literal("completed"),
    ),
  }).index("by_course", ["courseId", "order"]),

  lessons: defineTable({
    chapterId: v.id("chapters"),
    title: v.string(),
    order: v.number(),
  }).index("by_chapter", ["chapterId", "order"]),

  contentBlocks: defineTable({
    lessonId: v.id("lessons"),
    type: v.union(
      v.literal("text"),
      v.literal("code"),
      v.literal("interactive"),
      v.literal("diagram"),
    ),
    title: v.optional(v.string()),
    content: v.string(),
    language: v.optional(v.string()),
    order: v.number(),
  }).index("by_lesson", ["lessonId", "order"]),
});

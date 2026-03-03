import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export default mutation({
  args: {
    lessonId: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedLessonId = ctx.db.normalizeId(
      "lessons",
      args.lessonId
    ) as Id<"lessons">;
    if (!normalizedLessonId) throw new Error("Invalid lesson ID");

    // 1. Delete all existing blocks for this lesson to clean up
    const existingBlocks = await ctx.db
      .query("contentBlocks")
      .withIndex("by_lesson", (q) => q.eq("lessonId", normalizedLessonId))
      .collect();

    for (const block of existingBlocks) {
      await ctx.db.delete(block._id);
    }

    // 2. Insert test blocks
    await ctx.db.insert("contentBlocks", {
      lessonId: normalizedLessonId,
      type: "text",
      title: "Tổng quan Next.js vs React",
      content:
        "Web-Anatomy 3D Visualizer đang ở chế độ Interactive. Hãy dùng chuột để xoay và xem chi tiết cây DOM 3D bên dưới.",
      order: 0,
    });

    await ctx.db.insert("contentBlocks", {
      lessonId: normalizedLessonId,
      type: "interactive",
      title: "3D Visualization: Trải nghiệm React Hooks & Component Tree",
      content: "", // Content rỗng vì visualizer dùng Editor internal state
      order: 1,
    });

    return "Seeded interactive block into lesson " + args.lessonId;
  },
});

import { mutation } from "./_generated/server";
import type { RegisteredMutation } from "convex/server";
import { getRole } from "./_utils";

export const seed: RegisteredMutation<
  "public",
  Record<string, never>,
  Promise<string>
> = mutation({
  handler: async (ctx) => {
    // TEMPORARY: Comment out auth check for testing
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) throw new Error("Unauthenticated call to seed");

    // const role = getRole(identity);
    // if (role !== "admin") {
    //   throw new Error("Unauthorized: Only admins can seed data");
    // }

    const defaultRoadmaps = [
      {
        slug: "frontend",
        title: "Frontend Developer",
        description:
          "Step by step guide to becoming a modern frontend developer in 2024",
        category: "role" as const,
        difficulty: "beginner" as const,
        topicCount: 6,
        nodesJson: JSON.stringify([
          { id: "1", type: "default", position: { x: 250, y: 0 }, data: { label: "HTML & CSS" } },
          { id: "2", type: "default", position: { x: 100, y: 100 }, data: { label: "JavaScript" } },
          { id: "3", type: "default", position: { x: 400, y: 100 }, data: { label: "Git & GitHub" } },
          { id: "4", type: "default", position: { x: 250, y: 200 }, data: { label: "React" } },
          { id: "5", type: "default", position: { x: 100, y: 300 }, data: { label: "TypeScript" } },
          { id: "6", type: "default", position: { x: 400, y: 300 }, data: { label: "Next.js" } },
        ]),
        edgesJson: JSON.stringify([
          { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
          { id: "e1-3", source: "1", target: "3", type: "smoothstep" },
          { id: "e2-4", source: "2", target: "4", type: "smoothstep" },
          { id: "e3-4", source: "3", target: "4", type: "smoothstep" },
          { id: "e4-5", source: "4", target: "5", type: "smoothstep" },
          { id: "e4-6", source: "4", target: "6", type: "smoothstep" },
        ]),
        status: "public" as const,
      },
      {
        slug: "backend",
        title: "Backend Developer",
        description: "Learn how to build scalable APIs and system architecture",
        category: "role" as const,
        difficulty: "intermediate" as const,
        topicCount: 5,
        nodesJson: JSON.stringify([
          { id: "1", type: "default", position: { x: 250, y: 0 }, data: { label: "Programming Basics" } },
          { id: "2", type: "default", position: { x: 250, y: 100 }, data: { label: "Node.js" } },
          { id: "3", type: "default", position: { x: 100, y: 200 }, data: { label: "Databases" } },
          { id: "4", type: "default", position: { x: 400, y: 200 }, data: { label: "REST APIs" } },
          { id: "5", type: "default", position: { x: 250, y: 300 }, data: { label: "Authentication" } },
        ]),
        edgesJson: JSON.stringify([
          { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
          { id: "e2-3", source: "2", target: "3", type: "smoothstep" },
          { id: "e2-4", source: "2", target: "4", type: "smoothstep" },
          { id: "e3-5", source: "3", target: "5", type: "smoothstep" },
          { id: "e4-5", source: "4", target: "5", type: "smoothstep" },
        ]),
        status: "public" as const,
      },
      {
        slug: "react",
        title: "React",
        description: "Deep dive into React ecosystem and advanced patterns",
        category: "skill" as const,
        difficulty: "intermediate" as const,
        topicCount: 5,
        nodesJson: JSON.stringify([
          { id: "1", type: "default", position: { x: 250, y: 0 }, data: { label: "React Basics" } },
          { id: "2", type: "default", position: { x: 100, y: 100 }, data: { label: "Hooks" } },
          { id: "3", type: "default", position: { x: 400, y: 100 }, data: { label: "State Management" } },
          { id: "4", type: "default", position: { x: 250, y: 200 }, data: { label: "React Router" } },
          { id: "5", type: "default", position: { x: 250, y: 300 }, data: { label: "Advanced Patterns" } },
        ]),
        edgesJson: JSON.stringify([
          { id: "e1-2", source: "1", target: "2", type: "smoothstep" },
          { id: "e1-3", source: "1", target: "3", type: "smoothstep" },
          { id: "e2-4", source: "2", target: "4", type: "smoothstep" },
          { id: "e3-4", source: "3", target: "4", type: "smoothstep" },
          { id: "e4-5", source: "4", target: "5", type: "smoothstep" },
        ]),
        status: "public" as const,
      },
    ];

    // TEMPORARY: Force seed even if data exists (for testing)
    // Check if we already have records to avoid duplicate seeding
    // const existing = await ctx.db.query("roadmaps").first();
    // if (existing) {
    //   return "Data already seeded!";
    // }

    // Delete existing data first
    const existingRoadmaps = await ctx.db.query("roadmaps").collect();
    for (const roadmap of existingRoadmaps) {
      await ctx.db.delete(roadmap._id);
    }

    const existingSummaries = await ctx.db.query("roadmapSummaries").collect();
    for (const summary of existingSummaries) {
      await ctx.db.delete(summary._id);
    }

    for (const roadmap of defaultRoadmaps) {
      const createdAt = Date.now();
      const roadmapId = await ctx.db.insert("roadmaps", {
        ...roadmap,
        createdAt,
      });
      await ctx.db.insert("roadmapSummaries", {
        roadmapId,
        slug: roadmap.slug,
        title: roadmap.title,
        description: roadmap.description,
        category: roadmap.category,
        difficulty: roadmap.difficulty,
        topicCount: roadmap.topicCount,
        status: roadmap.status,
        createdAt,
      });
    }

    return "Seeded 3 roadmaps successfully!";
  },
});

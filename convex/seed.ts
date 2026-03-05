import { mutation } from "./_generated/server";
import type { RegisteredMutation } from "convex/server";

function getRole(identity: unknown): string | undefined {
  if (typeof identity !== "object" || identity === null) {
    return undefined;
  }

  const metadata = Reflect.get(identity, "publicMetadata");
  if (typeof metadata !== "object" || metadata === null) {
    return undefined;
  }

  const role = Reflect.get(metadata, "role");
  return typeof role === "string" ? role : undefined;
}

export const seed: RegisteredMutation<
  "public",
  Record<string, never>,
  Promise<string>
> = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated call to seed");

    const role = getRole(identity);
    if (role !== "admin") {
      throw new Error("Unauthorized: Only admins can seed data");
    }

    const defaultRoadmaps = [
      {
        slug: "frontend",
        title: "Frontend Developer",
        description:
          "Step by step guide to becoming a modern frontend developer in 2024",
        category: "role" as const,
        difficulty: "beginner" as const,
        topicCount: 15,
        nodesJson: "[]",
        edgesJson: "[]",
        status: "public" as const,
      },
      {
        slug: "backend",
        title: "Backend Developer",
        description: "Learn how to build scalable APIs and system architecture",
        category: "role" as const,
        difficulty: "intermediate" as const,
        topicCount: 22,
        nodesJson: "[]",
        edgesJson: "[]",
        status: "public" as const,
      },
      {
        slug: "react",
        title: "React",
        description: "Deep dive into React ecosystem and advanced patterns",
        category: "skill" as const,
        difficulty: "intermediate" as const,
        topicCount: 10,
        nodesJson: "[]",
        edgesJson: "[]",
        status: "public" as const,
      },
    ];

    // Check if we already have records to avoid duplicate seeding
    const existing = await ctx.db.query("roadmaps").first();
    if (existing) {
      return "Data already seeded!";
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

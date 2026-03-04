import { mutation } from "./_generated/server";

export const seed = mutation({
  handler: async (ctx) => {
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
      await ctx.db.insert("roadmaps", roadmap);
    }

    return "Seeded 3 roadmaps successfully!";
  },
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = void 0;
const server_1 = require("./_generated/server");
exports.seed = (0, server_1.mutation)({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Unauthenticated call to seed");
        const role = identity.publicMetadata?.role;
        if (role !== "admin") {
            throw new Error("Unauthorized: Only admins can seed data");
        }
        const defaultRoadmaps = [
            {
                slug: "frontend",
                title: "Frontend Developer",
                description: "Step by step guide to becoming a modern frontend developer in 2024",
                category: "role",
                difficulty: "beginner",
                topicCount: 15,
                nodesJson: "[]",
                edgesJson: "[]",
                status: "public",
            },
            {
                slug: "backend",
                title: "Backend Developer",
                description: "Learn how to build scalable APIs and system architecture",
                category: "role",
                difficulty: "intermediate",
                topicCount: 22,
                nodesJson: "[]",
                edgesJson: "[]",
                status: "public",
            },
            {
                slug: "react",
                title: "React",
                description: "Deep dive into React ecosystem and advanced patterns",
                category: "skill",
                difficulty: "intermediate",
                topicCount: 10,
                nodesJson: "[]",
                edgesJson: "[]",
                status: "public",
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
//# sourceMappingURL=seed.js.map
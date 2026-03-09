import { internalMutation } from "../_generated/server";

/**
 * Migration: Add author field to existing roadmaps that don't have it
 * This fixes schema validation errors for old documents
 */
export const addAuthorToRoadmaps = internalMutation({
    args: {},
    handler: async (ctx) => {
        const roadmaps = await ctx.db.query("roadmaps").collect();

        let updatedCount = 0;
        for (const roadmap of roadmaps) {
            // Check if author field is missing
            if (!roadmap.author) {
                await ctx.db.patch(roadmap._id, {
                    author: "system", // Default author for old documents
                });
                updatedCount++;
            }
        }

        return {
            message: `Migration completed. Updated ${updatedCount} roadmaps.`,
            totalRoadmaps: roadmaps.length,
            updatedCount,
        };
    },
});

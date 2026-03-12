import { internalMutation } from "../_generated/server";

/**
 * Migration: Add nodeCategory field to existing roadmaps
 * 
 * This migration adds a default nodeCategory value to roadmaps that don't have one.
 * Default value is 'TOPIC' which is the most common category.
 */
export const addNodeCategoryToRoadmaps = internalMutation({
    args: {},
    handler: async (ctx) => {
        // Get all roadmaps without nodeCategory
        const roadmaps = await ctx.db.query("roadmaps").collect();

        let updatedCount = 0;

        for (const roadmap of roadmaps) {
            if (!roadmap.nodeCategory) {
                await ctx.db.patch(roadmap._id, {
                    nodeCategory: 'TOPIC', // Default to TOPIC category
                });
                updatedCount++;
            }
        }

        console.log(`Updated ${updatedCount} roadmaps with default nodeCategory`);
        return { updatedCount };
    },
});
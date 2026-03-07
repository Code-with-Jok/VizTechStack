import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const addBookmark = mutation({
    args: {
        roadmapId: v.id("roadmaps"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated call to addBookmark");
        }

        const email = identity.email;
        if (!email) {
            throw new Error("Identity does not have an email address");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        if (!user) {
            throw new Error(`User not found for email: ${email}`);
        }

        const userId: Id<"users"> = user._id;

        // Check if bookmark already exists
        const existing = await ctx.db
            .query("bookmarks")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("roadmapId"), args.roadmapId))
            .first();

        if (existing) {
            // Return existing bookmark ID (idempotent operation)
            return existing._id;
        }

        // Create new bookmark
        const bookmarkId = await ctx.db.insert("bookmarks", {
            userId,
            roadmapId: args.roadmapId,
        });

        return bookmarkId;
    },
});

export const removeBookmark = mutation({
    args: {
        roadmapId: v.id("roadmaps"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated call to removeBookmark");
        }

        const email = identity.email;
        if (!email) {
            throw new Error("Identity does not have an email address");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        if (!user) {
            throw new Error(`User not found for email: ${email}`);
        }

        const userId: Id<"users"> = user._id;

        // Find and delete bookmark
        const bookmark = await ctx.db
            .query("bookmarks")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("roadmapId"), args.roadmapId))
            .first();

        if (bookmark) {
            await ctx.db.delete(bookmark._id);
        }
    },
});

export const getUserBookmarks = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated call to getUserBookmarks");
        }

        const email = identity.email;
        if (!email) {
            throw new Error("Identity does not have an email address");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .unique();

        if (!user) {
            throw new Error(`User not found for email: ${email}`);
        }

        const userId: Id<"users"> = user._id;

        const bookmarks = await ctx.db
            .query("bookmarks")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();

        return bookmarks;
    },
});

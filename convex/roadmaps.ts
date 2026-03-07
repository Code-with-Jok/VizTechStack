import type { PaginationOptions, PaginationResult } from "convex/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { getRole } from "./_utils";

type RoadmapCategory = "role" | "skill" | "best-practice";

type RoadmapSummaryListItem = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  difficulty: "beginner" | "intermediate" | "advanced";
  topicCount: number;
  status: "public" | "draft" | "private";
};

function assertAdmin(identity: unknown, operation: string): void {
  if (getRole(identity) !== "admin") {
    throw new Error(`Unauthorized: admin role is required for ${operation}.`);
  }
}

export const createRoadmap = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("role"),
      v.literal("skill"),
      v.literal("best-practice")
    ),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    topicCount: v.number(),
    nodesJson: v.string(),
    edgesJson: v.string(),
    status: v.union(
      v.literal("public"),
      v.literal("draft"),
      v.literal("private")
    ),
  },
  handler: async (ctx, args) => {
    // TEMPORARY: Comment out auth check - NestJS Guard already handles auth
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Unauthenticated call to createRoadmap");
    // }

    // assertAdmin(identity, "createRoadmap");

    // Use a dummy identity for now
    const identity = { subject: "admin-user" };

    const existing = await ctx.db
      .query("roadmaps")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error(`Roadmap with slug '${args.slug}' already exists.`);
    }

    const createdAt = Date.now();

    const roadmapId = await ctx.db.insert("roadmaps", {
      ...args,
      userId: identity.subject,
      createdAt,
    });

    await ctx.db.insert("roadmapSummaries", {
      roadmapId,
      slug: args.slug,
      title: args.title,
      description: args.description,
      category: args.category,
      difficulty: args.difficulty,
      topicCount: args.topicCount,
      status: args.status,
      createdAt,
    });

    return roadmapId;
  },
});

export const list = query({
  args: {
    category: v.optional(
      v.union(v.literal("role"), v.literal("skill"), v.literal("best-practice"))
    ),
    paginationOpts: v.optional(paginationOptsValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const isAdmin = getRole(identity) === "admin";
    const paginationOpts = args.paginationOpts ?? {
      numItems: 24,
      cursor: null,
    };

    const paginated = await paginateRoadmapSummaries(ctx, {
      category: args.category,
      isAdmin,
      paginationOpts,
    });

    return {
      page: paginated.page.map((summary) => mapRoadmapSummary(summary)),
      continueCursor: paginated.continueCursor,
      isDone: paginated.isDone,
      splitCursor: paginated.splitCursor,
      pageStatus: paginated.pageStatus,
    };
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const roadmap = await ctx.db
      .query("roadmaps")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (!roadmap) return null;

    if (roadmap.status === "public") return roadmap;

    const identity = await ctx.auth.getUserIdentity();
    if (getRole(identity) === "admin") return roadmap;

    return null;
  },
});

export const getById = query({
  args: { id: v.id("roadmaps") },
  handler: async (ctx, args) => {
    const roadmap = await ctx.db.get(args.id);

    if (!roadmap) return null;

    if (roadmap.status === "public") return roadmap;

    const identity = await ctx.auth.getUserIdentity();
    if (getRole(identity) === "admin") return roadmap;

    return null;
  },
});

export const updateRoadmap = mutation({
  args: {
    id: v.id("roadmaps"),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("role"),
        v.literal("skill"),
        v.literal("best-practice")
      )
    ),
    difficulty: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced")
      )
    ),
    topicCount: v.optional(v.number()),
    nodesJson: v.optional(v.string()),
    edgesJson: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("public"),
        v.literal("draft"),
        v.literal("private")
      )
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to updateRoadmap");
    }

    assertAdmin(identity, "updateRoadmap");

    const { id, ...updates } = args;

    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error(`Roadmap with id '${id}' not found.`);
    }

    // Check slug uniqueness if slug is being updated
    if (updates.slug && updates.slug !== existing.slug) {
      const duplicateSlug = await ctx.db
        .query("roadmaps")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug!))
        .first();

      if (duplicateSlug) {
        throw new Error(`Roadmap with slug '${updates.slug}' already exists.`);
      }
    }

    await ctx.db.patch(id, updates);

    // Update corresponding roadmap summary
    const summary = await ctx.db
      .query("roadmapSummaries")
      .withIndex("by_roadmap_id", (q) => q.eq("roadmapId", id))
      .unique();

    if (summary) {
      const summaryUpdates: Record<string, unknown> = {};
      if (updates.slug !== undefined) summaryUpdates.slug = updates.slug;
      if (updates.title !== undefined) summaryUpdates.title = updates.title;
      if (updates.description !== undefined) summaryUpdates.description = updates.description;
      if (updates.category !== undefined) summaryUpdates.category = updates.category;
      if (updates.difficulty !== undefined) summaryUpdates.difficulty = updates.difficulty;
      if (updates.topicCount !== undefined) summaryUpdates.topicCount = updates.topicCount;
      if (updates.status !== undefined) summaryUpdates.status = updates.status;

      if (Object.keys(summaryUpdates).length > 0) {
        await ctx.db.patch(summary._id, summaryUpdates);
      }
    }

    return id;
  },
});

export const deleteRoadmap = mutation({
  args: {
    id: v.id("roadmaps"),
  },
  handler: async (ctx, args) => {
    // TODO: Re-enable auth when ConvexService forwards auth tokens from NestJS
    // const identity = await ctx.auth.getUserIdentity();
    // if (!identity) {
    //   throw new Error("Unauthenticated call to deleteRoadmap");
    // }

    // assertAdmin(identity, "deleteRoadmap");

    const existing = await ctx.db.get(args.id);
    if (!existing) {
      throw new Error(`Roadmap with id '${args.id}' not found.`);
    }

    // Delete roadmap summary
    const summary = await ctx.db
      .query("roadmapSummaries")
      .withIndex("by_roadmap_id", (q) => q.eq("roadmapId", args.id))
      .unique();

    if (summary) {
      await ctx.db.delete(summary._id);
    }

    // Delete roadmap
    await ctx.db.delete(args.id);
  },
});

export const listSkillRoadmaps = query({
  args: {},
  handler: async (ctx) => {
    // TEMPORARY: Comment out auth check - NestJS Guard already handles auth
    // const identity = await ctx.auth.getUserIdentity();
    // const isAdmin = getRole(identity) === "admin";

    // For now, return all skill roadmaps (both public and draft)
    // In production, NestJS should pass the auth context to Convex
    return ctx.db
      .query("roadmaps")
      .withIndex("by_category_created_at", (q) => q.eq("category", "skill"))
      .order("desc")
      .collect();

    // Original logic (commented out):
    // if (isAdmin) {
    //   return ctx.db
    //     .query("roadmaps")
    //     .withIndex("by_category_created_at", (q) => q.eq("category", "skill"))
    //     .order("desc")
    //     .collect();
    // }

    // return ctx.db
    //   .query("roadmaps")
    //   .withIndex("by_category_status_created_at", (q) =>
    //     q.eq("category", "skill").eq("status", "public")
    //   )
    //   .order("desc")
    //   .collect();
  },
});

export const backfillRoadmapSummaries = mutation({
  args: {
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to backfillRoadmapSummaries");
    }

    assertAdmin(identity, "backfillRoadmapSummaries");

    const roadmaps = await ctx.db.query("roadmaps").collect();
    const summariesBefore = await ctx.db.query("roadmapSummaries").collect();

    let inserted = 0;

    for (const roadmap of roadmaps) {
      const existingSummary = await ctx.db
        .query("roadmapSummaries")
        .withIndex("by_roadmap_id", (q) => q.eq("roadmapId", roadmap._id))
        .unique();

      if (existingSummary) {
        continue;
      }

      inserted += 1;

      if (args.dryRun) {
        continue;
      }

      await ctx.db.insert("roadmapSummaries", {
        roadmapId: roadmap._id,
        slug: roadmap.slug,
        title: roadmap.title,
        description: roadmap.description,
        category: roadmap.category,
        difficulty: roadmap.difficulty,
        topicCount: roadmap.topicCount,
        status: roadmap.status ?? "public",
        createdAt: roadmap.createdAt ?? roadmap._creationTime,
      });
    }

    return {
      roadmapCount: roadmaps.length,
      summaryCountBefore: summariesBefore.length,
      inserted,
      dryRun: args.dryRun ?? false,
    };
  },
});

export const verifyRoadmapSummaryConsistency = query({
  args: {
    sampleSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error(
        "Unauthenticated call to verifyRoadmapSummaryConsistency"
      );
    }

    assertAdmin(identity, "verifyRoadmapSummaryConsistency");

    const roadmaps = await ctx.db.query("roadmaps").collect();
    const summaries = await ctx.db.query("roadmapSummaries").collect();

    const summaryRoadmapIds = new Set(
      summaries.map((summary) => String(summary.roadmapId))
    );

    const missingSlugs = roadmaps
      .filter((roadmap) => !summaryRoadmapIds.has(String(roadmap._id)))
      .map((roadmap) => roadmap.slug);

    const sampleSize = Math.max(1, Math.floor(args.sampleSize ?? 10));

    return {
      roadmapCount: roadmaps.length,
      summaryCount: summaries.length,
      missingCount: missingSlugs.length,
      missingSlugs: missingSlugs.slice(0, sampleSize),
    };
  },
});

async function paginateRoadmapSummaries(
  ctx: QueryCtx,
  options: {
    category: RoadmapCategory | undefined;
    isAdmin: boolean;
    paginationOpts: PaginationOptions;
  }
): Promise<PaginationResult<Doc<"roadmapSummaries">>> {
  const { category, isAdmin, paginationOpts } = options;

  if (category) {
    if (isAdmin) {
      return ctx.db
        .query("roadmapSummaries")
        .withIndex("by_category_created_at", (q) => q.eq("category", category))
        .order("desc")
        .paginate(paginationOpts);
    }

    return ctx.db
      .query("roadmapSummaries")
      .withIndex("by_category_status_created_at", (q) =>
        q.eq("category", category).eq("status", "public")
      )
      .order("desc")
      .paginate(paginationOpts);
  }

  if (isAdmin) {
    return ctx.db
      .query("roadmapSummaries")
      .withIndex("by_created_at")
      .order("desc")
      .paginate(paginationOpts);
  }

  return ctx.db
    .query("roadmapSummaries")
    .withIndex("by_status_created_at", (q) => q.eq("status", "public"))
    .order("desc")
    .paginate(paginationOpts);
}

function mapRoadmapSummary(
  summary: Doc<"roadmapSummaries">
): RoadmapSummaryListItem {
  return {
    _id: summary.roadmapId,
    slug: summary.slug,
    title: summary.title,
    description: summary.description,
    category: summary.category,
    difficulty: summary.difficulty,
    topicCount: summary.topicCount,
    status: summary.status,
  };
}

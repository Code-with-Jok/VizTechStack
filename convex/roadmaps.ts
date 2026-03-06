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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthenticated call to createRoadmap");
    }

    assertAdmin(identity, "createRoadmap");

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
        status: roadmap.status,
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

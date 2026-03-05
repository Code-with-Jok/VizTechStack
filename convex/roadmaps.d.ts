export declare const createRoadmap: import("convex/server").RegisteredMutation<"public", {
    status: "public" | "draft" | "private";
    slug: string;
    title: string;
    description: string;
    category: "role" | "skill" | "best-practice";
    difficulty: "beginner" | "intermediate" | "advanced";
    nodesJson: string;
    edgesJson: string;
    topicCount: number;
}, Promise<import("convex/values").GenericId<"roadmaps">>>;
export declare const list: import("convex/server").RegisteredQuery<"public", {
    category?: "role" | "skill" | "best-practice" | undefined;
}, Promise<{
    _id: import("convex/values").GenericId<"roadmaps">;
    _creationTime: number;
    userId?: string | undefined;
    status: "public" | "draft" | "private";
    slug: string;
    title: string;
    description: string;
    category: "role" | "skill" | "best-practice";
    difficulty: "beginner" | "intermediate" | "advanced";
    nodesJson: string;
    edgesJson: string;
    topicCount: number;
}[]>>;
export declare const getBySlug: import("convex/server").RegisteredQuery<"public", {
    slug: string;
}, Promise<{
    _id: import("convex/values").GenericId<"roadmaps">;
    _creationTime: number;
    userId?: string | undefined;
    status: "public" | "draft" | "private";
    slug: string;
    title: string;
    description: string;
    category: "role" | "skill" | "best-practice";
    difficulty: "beginner" | "intermediate" | "advanced";
    nodesJson: string;
    edgesJson: string;
    topicCount: number;
} | null>>;
//# sourceMappingURL=roadmaps.d.ts.map
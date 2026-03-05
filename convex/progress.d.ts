export declare const getUserProgress: import("convex/server").RegisteredQuery<"public", {
    roadmapId: import("convex/values").GenericId<"roadmaps">;
}, Promise<{
    _id: import("convex/values").GenericId<"progress">;
    _creationTime: number;
    status: "done" | "in-progress" | "skipped";
    userId: import("convex/values").GenericId<"users">;
    roadmapId: import("convex/values").GenericId<"roadmaps">;
    nodeId: string;
}[]>>;
export declare const updateProgress: import("convex/server").RegisteredMutation<"public", {
    status: "done" | "in-progress" | "skipped";
    roadmapId: import("convex/values").GenericId<"roadmaps">;
    nodeId: string;
}, Promise<import("convex/values").GenericId<"progress">>>;
//# sourceMappingURL=progress.d.ts.map
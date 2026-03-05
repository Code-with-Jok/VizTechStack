declare const _default: import("convex/server").SchemaDefinition<{
    roadmaps: import("convex/server").TableDefinition<import("convex/values").VObject<{
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
    }, {
        slug: import("convex/values").VString<string, "required">;
        title: import("convex/values").VString<string, "required">;
        description: import("convex/values").VString<string, "required">;
        category: import("convex/values").VUnion<"role" | "skill" | "best-practice", [import("convex/values").VLiteral<"role", "required">, import("convex/values").VLiteral<"skill", "required">, import("convex/values").VLiteral<"best-practice", "required">], "required", never>;
        difficulty: import("convex/values").VUnion<"beginner" | "intermediate" | "advanced", [import("convex/values").VLiteral<"beginner", "required">, import("convex/values").VLiteral<"intermediate", "required">, import("convex/values").VLiteral<"advanced", "required">], "required", never>;
        nodesJson: import("convex/values").VString<string, "required">;
        edgesJson: import("convex/values").VString<string, "required">;
        topicCount: import("convex/values").VFloat64<number, "required">;
        userId: import("convex/values").VString<string | undefined, "optional">;
        status: import("convex/values").VUnion<"public" | "draft" | "private", [import("convex/values").VLiteral<"public", "required">, import("convex/values").VLiteral<"draft", "required">, import("convex/values").VLiteral<"private", "required">], "required", never>;
    }, "required", "status" | "slug" | "title" | "description" | "category" | "difficulty" | "nodesJson" | "edgesJson" | "topicCount" | "userId">, {
        by_slug: ["slug", "_creationTime"];
        by_category: ["category", "_creationTime"];
        by_status: ["status", "_creationTime"];
        by_category_status: ["category", "status", "_creationTime"];
    }, {}, {}>;
    topics: import("convex/server").TableDefinition<import("convex/values").VObject<{
        title: string;
        roadmapId: import("convex/values").GenericId<"roadmaps">;
        nodeId: string;
        content: string;
        resources: {
            type: "article" | "video" | "course";
            title: string;
            url: string;
        }[];
    }, {
        roadmapId: import("convex/values").VId<import("convex/values").GenericId<"roadmaps">, "required">;
        nodeId: import("convex/values").VString<string, "required">;
        title: import("convex/values").VString<string, "required">;
        content: import("convex/values").VString<string, "required">;
        resources: import("convex/values").VArray<{
            type: "article" | "video" | "course";
            title: string;
            url: string;
        }[], import("convex/values").VObject<{
            type: "article" | "video" | "course";
            title: string;
            url: string;
        }, {
            title: import("convex/values").VString<string, "required">;
            url: import("convex/values").VString<string, "required">;
            type: import("convex/values").VUnion<"article" | "video" | "course", [import("convex/values").VLiteral<"article", "required">, import("convex/values").VLiteral<"video", "required">, import("convex/values").VLiteral<"course", "required">], "required", never>;
        }, "required", "type" | "title" | "url">, "required">;
    }, "required", "title" | "roadmapId" | "nodeId" | "content" | "resources">, {
        by_roadmap: ["roadmapId", "_creationTime"];
    }, {}, {}>;
    users: import("convex/server").TableDefinition<import("convex/values").VObject<{
        avatar?: string | undefined;
        role: "user" | "admin";
        email: string;
        name: string;
    }, {
        email: import("convex/values").VString<string, "required">;
        name: import("convex/values").VString<string, "required">;
        avatar: import("convex/values").VString<string | undefined, "optional">;
        role: import("convex/values").VUnion<"user" | "admin", [import("convex/values").VLiteral<"user", "required">, import("convex/values").VLiteral<"admin", "required">], "required", never>;
    }, "required", "role" | "email" | "name" | "avatar">, {
        by_email: ["email", "_creationTime"];
    }, {}, {}>;
    progress: import("convex/server").TableDefinition<import("convex/values").VObject<{
        status: "done" | "in-progress" | "skipped";
        userId: import("convex/values").GenericId<"users">;
        roadmapId: import("convex/values").GenericId<"roadmaps">;
        nodeId: string;
    }, {
        userId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        roadmapId: import("convex/values").VId<import("convex/values").GenericId<"roadmaps">, "required">;
        nodeId: import("convex/values").VString<string, "required">;
        status: import("convex/values").VUnion<"done" | "in-progress" | "skipped", [import("convex/values").VLiteral<"done", "required">, import("convex/values").VLiteral<"in-progress", "required">, import("convex/values").VLiteral<"skipped", "required">], "required", never>;
    }, "required", "status" | "userId" | "roadmapId" | "nodeId">, {
        by_user_roadmap: ["userId", "roadmapId", "_creationTime"];
        by_user_roadmap_node: ["userId", "roadmapId", "nodeId", "_creationTime"];
    }, {}, {}>;
    bookmarks: import("convex/server").TableDefinition<import("convex/values").VObject<{
        userId: import("convex/values").GenericId<"users">;
        roadmapId: import("convex/values").GenericId<"roadmaps">;
    }, {
        userId: import("convex/values").VId<import("convex/values").GenericId<"users">, "required">;
        roadmapId: import("convex/values").VId<import("convex/values").GenericId<"roadmaps">, "required">;
    }, "required", "userId" | "roadmapId">, {
        by_user: ["userId", "_creationTime"];
    }, {}, {}>;
    guides: import("convex/server").TableDefinition<import("convex/values").VObject<{
        slug: string;
        title: string;
        description: string;
        content: string;
        author: string;
        tags: string[];
        publishedAt: number;
    }, {
        slug: import("convex/values").VString<string, "required">;
        title: import("convex/values").VString<string, "required">;
        description: import("convex/values").VString<string, "required">;
        content: import("convex/values").VString<string, "required">;
        author: import("convex/values").VString<string, "required">;
        tags: import("convex/values").VArray<string[], import("convex/values").VString<string, "required">, "required">;
        publishedAt: import("convex/values").VFloat64<number, "required">;
    }, "required", "slug" | "title" | "description" | "content" | "author" | "tags" | "publishedAt">, {
        by_slug: ["slug", "_creationTime"];
    }, {}, {}>;
}, true>;
export default _default;
//# sourceMappingURL=schema.d.ts.map
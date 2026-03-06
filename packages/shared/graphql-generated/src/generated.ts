import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type CreateRoadmapInput = {
  category: RoadmapCategory;
  description: Scalars["String"]["input"];
  difficulty: RoadmapDifficulty;
  edgesJson?: InputMaybe<Scalars["String"]["input"]>;
  nodesJson?: InputMaybe<Scalars["String"]["input"]>;
  slug: Scalars["String"]["input"];
  status?: InputMaybe<RoadmapStatus>;
  title: Scalars["String"]["input"];
  topicCount?: InputMaybe<Scalars["Int"]["input"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  createRoadmap: Scalars["String"]["output"];
};

export type MutationCreateRoadmapArgs = {
  input: CreateRoadmapInput;
};

export type Query = {
  __typename?: "Query";
  getRoadmapBySlug: Maybe<Roadmap>;
  getRoadmaps: Array<Roadmap>;
  getRoadmapsPage: RoadmapPage;
};

export type QueryGetRoadmapBySlugArgs = {
  slug: Scalars["String"]["input"];
};

export type QueryGetRoadmapsArgs = {
  category: InputMaybe<RoadmapCategory>;
};

export type QueryGetRoadmapsPageArgs = {
  input: InputMaybe<RoadmapPageInput>;
};

export type Roadmap = {
  __typename?: "Roadmap";
  _id: Scalars["String"]["output"];
  category: RoadmapCategory;
  description: Scalars["String"]["output"];
  difficulty: RoadmapDifficulty;
  edgesJson: Maybe<Scalars["String"]["output"]>;
  nodesJson: Maybe<Scalars["String"]["output"]>;
  slug: Scalars["String"]["output"];
  status: Maybe<RoadmapStatus>;
  title: Scalars["String"]["output"];
  topicCount: Maybe<Scalars["Int"]["output"]>;
};

export type RoadmapCategory = "BEST_PRACTICE" | "ROLE" | "SKILL";

export type RoadmapDifficulty = "ADVANCED" | "BEGINNER" | "INTERMEDIATE";

export type RoadmapPage = {
  __typename?: "RoadmapPage";
  hasMore: Scalars["Boolean"]["output"];
  items: Array<Roadmap>;
  nextCursor: Maybe<Scalars["String"]["output"]>;
};

export type RoadmapPageInput = {
  category?: InputMaybe<RoadmapCategory>;
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
};

export type RoadmapStatus = "DRAFT" | "PRIVATE" | "PUBLIC";

export type CreateRoadmapMutationVariables = Exact<{
  input: CreateRoadmapInput;
}>;

export type CreateRoadmapMutation = {
  __typename?: "Mutation";
  createRoadmap: string;
};

export type GetRoadmapBySlugQueryVariables = Exact<{
  slug: Scalars["String"]["input"];
}>;

export type GetRoadmapBySlugQuery = {
  __typename?: "Query";
  getRoadmapBySlug: {
    __typename?: "Roadmap";
    _id: string;
    slug: string;
    title: string;
    description: string;
    category: RoadmapCategory;
    difficulty: RoadmapDifficulty;
    topicCount: number | null;
    status: RoadmapStatus | null;
    nodesJson: string | null;
    edgesJson: string | null;
  } | null;
};

export type GetRoadmapsLegacyQueryVariables = Exact<{ [key: string]: never }>;

export type GetRoadmapsLegacyQuery = {
  __typename?: "Query";
  getRoadmaps: Array<{
    __typename?: "Roadmap";
    _id: string;
    slug: string;
    title: string;
    description: string;
    category: RoadmapCategory;
    difficulty: RoadmapDifficulty;
    topicCount: number | null;
    status: RoadmapStatus | null;
  }>;
};

export type GetRoadmapsPageQueryVariables = Exact<{
  input: InputMaybe<RoadmapPageInput>;
}>;

export type GetRoadmapsPageQuery = {
  __typename?: "Query";
  getRoadmapsPage: {
    __typename?: "RoadmapPage";
    nextCursor: string | null;
    hasMore: boolean;
    items: Array<{
      __typename?: "Roadmap";
      _id: string;
      slug: string;
      title: string;
      description: string;
      category: RoadmapCategory;
      difficulty: RoadmapDifficulty;
      topicCount: number | null;
      status: RoadmapStatus | null;
    }>;
  };
};

export const CreateRoadmapDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "CreateRoadmap" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "CreateRoadmapInput" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createRoadmap" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  CreateRoadmapMutation,
  CreateRoadmapMutationVariables
>;
export const GetRoadmapBySlugDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetRoadmapBySlug" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "slug" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "getRoadmapBySlug" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "slug" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "slug" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "slug" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "difficulty" } },
                { kind: "Field", name: { kind: "Name", value: "topicCount" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
                { kind: "Field", name: { kind: "Name", value: "nodesJson" } },
                { kind: "Field", name: { kind: "Name", value: "edgesJson" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetRoadmapBySlugQuery,
  GetRoadmapBySlugQueryVariables
>;
export const GetRoadmapsLegacyDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetRoadmapsLegacy" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "getRoadmaps" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "_id" } },
                { kind: "Field", name: { kind: "Name", value: "slug" } },
                { kind: "Field", name: { kind: "Name", value: "title" } },
                { kind: "Field", name: { kind: "Name", value: "description" } },
                { kind: "Field", name: { kind: "Name", value: "category" } },
                { kind: "Field", name: { kind: "Name", value: "difficulty" } },
                { kind: "Field", name: { kind: "Name", value: "topicCount" } },
                { kind: "Field", name: { kind: "Name", value: "status" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetRoadmapsLegacyQuery,
  GetRoadmapsLegacyQueryVariables
>;
export const GetRoadmapsPageDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "GetRoadmapsPage" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "input" },
          },
          type: {
            kind: "NamedType",
            name: { kind: "Name", value: "RoadmapPageInput" },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "getRoadmapsPage" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "input" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "input" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "_id" } },
                      { kind: "Field", name: { kind: "Name", value: "slug" } },
                      { kind: "Field", name: { kind: "Name", value: "title" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "description" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "category" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "difficulty" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "topicCount" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "status" },
                      },
                    ],
                  },
                },
                { kind: "Field", name: { kind: "Name", value: "nextCursor" } },
                { kind: "Field", name: { kind: "Name", value: "hasMore" } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetRoadmapsPageQuery,
  GetRoadmapsPageQueryVariables
>;

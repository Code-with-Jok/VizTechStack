export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
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
  topicCount: Scalars["Int"]["input"];
};

export type Mutation = {
  __typename?: "Mutation";
  createRoadmap: Scalars["ID"]["output"];
};

export type MutationCreateRoadmapArgs = {
  input: CreateRoadmapInput;
};

export type Query = {
  __typename?: "Query";
  getRoadmapBySlug?: Maybe<Roadmap>;
  getRoadmaps: Array<Roadmap>;
  getRoadmapsPage: RoadmapPage;
};

export type QueryGetRoadmapBySlugArgs = {
  slug: Scalars["String"]["input"];
};

export type QueryGetRoadmapsArgs = {
  category?: InputMaybe<RoadmapCategory>;
};

export type QueryGetRoadmapsPageArgs = {
  input?: InputMaybe<RoadmapPageInput>;
};

export type Roadmap = {
  __typename?: "Roadmap";
  _id: Scalars["ID"]["output"];
  category: RoadmapCategory;
  description: Scalars["String"]["output"];
  difficulty: RoadmapDifficulty;
  edgesJson?: Maybe<Scalars["String"]["output"]>;
  nodesJson?: Maybe<Scalars["String"]["output"]>;
  slug: Scalars["String"]["output"];
  status: RoadmapStatus;
  title: Scalars["String"]["output"];
  topicCount: Scalars["Int"]["output"];
};

export type RoadmapCategory =
  | "BEST_PRACTICE"
  | "ROLE"
  | "SKILL"
  | "%future added value";

export type RoadmapDifficulty =
  | "ADVANCED"
  | "BEGINNER"
  | "INTERMEDIATE"
  | "%future added value";

export type RoadmapPage = {
  __typename?: "RoadmapPage";
  hasMore: Scalars["Boolean"]["output"];
  items: Array<Roadmap>;
  nextCursor?: Maybe<Scalars["String"]["output"]>;
};

export type RoadmapPageInput = {
  category?: InputMaybe<RoadmapCategory>;
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
};

export type RoadmapStatus =
  | "DRAFT"
  | "PRIVATE"
  | "PUBLIC"
  | "%future added value";

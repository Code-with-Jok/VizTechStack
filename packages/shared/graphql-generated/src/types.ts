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

export type Bookmark = {
  __typename?: "Bookmark";
  id: Scalars["ID"]["output"];
  roadmapId: Scalars["ID"]["output"];
  userId: Scalars["ID"]["output"];
};

export type CreateRoadmapInput = {
  category: RoadmapCategory;
  description: Scalars["String"]["input"];
  difficulty: RoadmapDifficulty;
  edges: Array<EdgeInput>;
  nodes: Array<NodeInput>;
  slug: Scalars["String"]["input"];
  status: RoadmapStatus;
  title: Scalars["String"]["input"];
  topicCount: Scalars["Int"]["input"];
};

export type CreateTopicInput = {
  content: Scalars["String"]["input"];
  nodeId: Scalars["String"]["input"];
  resources: Array<ResourceInput>;
  roadmapId: Scalars["ID"]["input"];
  title: Scalars["String"]["input"];
};

export type Edge = {
  __typename?: "Edge";
  id: Scalars["ID"]["output"];
  source: Scalars["String"]["output"];
  target: Scalars["String"]["output"];
  type?: Maybe<Scalars["String"]["output"]>;
};

export type EdgeInput = {
  id: Scalars["ID"]["input"];
  source: Scalars["String"]["input"];
  target: Scalars["String"]["input"];
  type?: InputMaybe<Scalars["String"]["input"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  addBookmark: Bookmark;
  createRoadmap: Roadmap;
  createTopic: Topic;
  deleteRoadmap: Scalars["Boolean"]["output"];
  removeBookmark: Scalars["Boolean"]["output"];
  updateProgress: Progress;
  updateRoadmap: Roadmap;
};

export type MutationAddBookmarkArgs = {
  roadmapId: Scalars["ID"]["input"];
};

export type MutationCreateRoadmapArgs = {
  input: CreateRoadmapInput;
};

export type MutationCreateTopicArgs = {
  input: CreateTopicInput;
};

export type MutationDeleteRoadmapArgs = {
  id: Scalars["ID"]["input"];
};

export type MutationRemoveBookmarkArgs = {
  roadmapId: Scalars["ID"]["input"];
};

export type MutationUpdateProgressArgs = {
  input: UpdateProgressInput;
};

export type MutationUpdateRoadmapArgs = {
  id: Scalars["ID"]["input"];
  input: UpdateRoadmapInput;
};

export type Node = {
  __typename?: "Node";
  data: NodeData;
  id: Scalars["ID"]["output"];
  position: Position;
  type: Scalars["String"]["output"];
};

export type NodeData = {
  __typename?: "NodeData";
  isReusedSkillNode?: Maybe<Scalars["Boolean"]["output"]>;
  label: Scalars["String"]["output"];
  originalRoadmapId?: Maybe<Scalars["String"]["output"]>;
  topicId?: Maybe<Scalars["String"]["output"]>;
};

export type NodeDataInput = {
  isReusedSkillNode?: InputMaybe<Scalars["Boolean"]["input"]>;
  label: Scalars["String"]["input"];
  originalRoadmapId?: InputMaybe<Scalars["String"]["input"]>;
  topicId?: InputMaybe<Scalars["String"]["input"]>;
};

export type NodeInput = {
  data: NodeDataInput;
  id: Scalars["ID"]["input"];
  position: PositionInput;
  type: Scalars["String"]["input"];
};

export type PaginationInput = {
  cursor?: InputMaybe<Scalars["String"]["input"]>;
  limit?: InputMaybe<Scalars["Int"]["input"]>;
};

export type Position = {
  __typename?: "Position";
  x: Scalars["Float"]["output"];
  y: Scalars["Float"]["output"];
};

export type PositionInput = {
  x: Scalars["Float"]["input"];
  y: Scalars["Float"]["input"];
};

export type Progress = {
  __typename?: "Progress";
  id: Scalars["ID"]["output"];
  nodeId: Scalars["String"]["output"];
  roadmapId: Scalars["ID"]["output"];
  status: ProgressStatus;
  userId: Scalars["ID"]["output"];
};

export type ProgressStatus =
  | "DONE"
  | "IN_PROGRESS"
  | "SKIPPED"
  | "%future added value";

export type Query = {
  __typename?: "Query";
  getProgressForRoadmap: Array<Progress>;
  getRoadmapBySlug?: Maybe<Roadmap>;
  getSkillNodesForRoleRoadmap: Array<Node>;
  getTopicByNodeId?: Maybe<Topic>;
  getUserBookmarks: Array<Bookmark>;
  listRoadmaps: RoadmapPage;
};

export type QueryGetProgressForRoadmapArgs = {
  roadmapId: Scalars["ID"]["input"];
};

export type QueryGetRoadmapBySlugArgs = {
  slug: Scalars["String"]["input"];
};

export type QueryGetTopicByNodeIdArgs = {
  nodeId: Scalars["String"]["input"];
  roadmapId: Scalars["ID"]["input"];
};

export type QueryListRoadmapsArgs = {
  input?: InputMaybe<RoadmapPageInput>;
};

export type Resource = {
  __typename?: "Resource";
  title: Scalars["String"]["output"];
  type: ResourceType;
  url: Scalars["String"]["output"];
};

export type ResourceInput = {
  title: Scalars["String"]["input"];
  type: ResourceType;
  url: Scalars["String"]["input"];
};

export type ResourceType =
  | "ARTICLE"
  | "COURSE"
  | "VIDEO"
  | "%future added value";

export type Roadmap = {
  __typename?: "Roadmap";
  category: RoadmapCategory;
  createdAt: Scalars["Float"]["output"];
  description: Scalars["String"]["output"];
  difficulty: RoadmapDifficulty;
  edges: Array<Edge>;
  id: Scalars["ID"]["output"];
  nodes: Array<Node>;
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

export type RoadmapFilters = {
  category?: InputMaybe<RoadmapCategory>;
  status?: InputMaybe<RoadmapStatus>;
};

export type RoadmapPage = {
  __typename?: "RoadmapPage";
  isDone: Scalars["Boolean"]["output"];
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

export type Topic = {
  __typename?: "Topic";
  content: Scalars["String"]["output"];
  id: Scalars["ID"]["output"];
  nodeId: Scalars["String"]["output"];
  resources: Array<Resource>;
  roadmapId: Scalars["ID"]["output"];
  title: Scalars["String"]["output"];
};

export type UpdateProgressInput = {
  nodeId: Scalars["String"]["input"];
  roadmapId: Scalars["ID"]["input"];
  status: ProgressStatus;
};

export type UpdateRoadmapInput = {
  category?: InputMaybe<RoadmapCategory>;
  description?: InputMaybe<Scalars["String"]["input"]>;
  difficulty?: InputMaybe<RoadmapDifficulty>;
  edges?: InputMaybe<Array<EdgeInput>>;
  nodes?: InputMaybe<Array<NodeInput>>;
  slug?: InputMaybe<Scalars["String"]["input"]>;
  status?: InputMaybe<RoadmapStatus>;
  title?: InputMaybe<Scalars["String"]["input"]>;
  topicCount?: InputMaybe<Scalars["Int"]["input"]>;
};

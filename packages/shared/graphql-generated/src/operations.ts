export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Article = Node & {
  __typename?: 'Article';
  author: Scalars['String']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  isDeleted: Scalars['Boolean']['output'];
  isPublished: Scalars['Boolean']['output'];
  readingTime: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['Float']['output'];
  wordCount: Scalars['Int']['output'];
};

export type CreateArticleInput = {
  content: Scalars['String']['input'];
  isPublished: Scalars['Boolean']['input'];
  slug: Scalars['String']['input'];
  tags: Array<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateRoadmapInput = {
  content: Scalars['String']['input'];
  description: Scalars['String']['input'];
  isPublished: Scalars['Boolean']['input'];
  slug: Scalars['String']['input'];
  tags: Array<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createArticle: Article;
  createRoadmap: Roadmap;
  deleteArticle: Article;
  deleteRoadmap: Roadmap;
  updateArticle: Article;
  updateRoadmap: Roadmap;
};


export type MutationCreateArticleArgs = {
  input: CreateArticleInput;
};


export type MutationCreateRoadmapArgs = {
  input: CreateRoadmapInput;
};


export type MutationDeleteArticleArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteRoadmapArgs = {
  id: Scalars['String']['input'];
};


export type MutationUpdateArticleArgs = {
  input: UpdateArticleInput;
};


export type MutationUpdateRoadmapArgs = {
  input: UpdateRoadmapInput;
};

export type Node = {
  author: Scalars['String']['output'];
  createdAt: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  isPublished: Scalars['Boolean']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['Float']['output'];
};

export type Query = {
  __typename?: 'Query';
  article?: Maybe<Article>;
  articles: Array<Article>;
  articlesForAdmin: Array<Article>;
  roadmap?: Maybe<Roadmap>;
  roadmaps: Array<Roadmap>;
  roadmapsForAdmin: Array<Roadmap>;
};


export type QueryArticleArgs = {
  slug: Scalars['String']['input'];
};


export type QueryRoadmapArgs = {
  slug: Scalars['String']['input'];
};

export type Roadmap = {
  __typename?: 'Roadmap';
  author: Scalars['String']['output'];
  content: Scalars['String']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isPublished: Scalars['Boolean']['output'];
  publishedAt: Scalars['Float']['output'];
  slug: Scalars['String']['output'];
  tags: Array<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['Float']['output'];
};

export type UpdateArticleInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  isPublished?: InputMaybe<Scalars['Boolean']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRoadmapInput = {
  content?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  isPublished?: InputMaybe<Scalars['Boolean']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type RoadmapFieldsFragment = { __typename?: 'Roadmap', id: string, slug: string, title: string, description: string, content: string, author: string, tags: Array<string>, publishedAt: number, updatedAt: number, isPublished: boolean };

export type GetRoadmapsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRoadmapsQuery = { __typename?: 'Query', roadmaps: Array<{ __typename?: 'Roadmap', id: string, slug: string, title: string, description: string, content: string, author: string, tags: Array<string>, publishedAt: number, updatedAt: number, isPublished: boolean }> };

export type GetRoadmapsForAdminQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRoadmapsForAdminQuery = { __typename?: 'Query', roadmapsForAdmin: Array<{ __typename?: 'Roadmap', id: string, slug: string, title: string, description: string, content: string, author: string, tags: Array<string>, publishedAt: number, updatedAt: number, isPublished: boolean }> };

export type GetRoadmapBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type GetRoadmapBySlugQuery = { __typename?: 'Query', roadmap?: { __typename?: 'Roadmap', id: string, slug: string, title: string, description: string, content: string, author: string, tags: Array<string>, publishedAt: number, updatedAt: number, isPublished: boolean } | null };

export type CreateRoadmapMutationVariables = Exact<{
  input: CreateRoadmapInput;
}>;


export type CreateRoadmapMutation = { __typename?: 'Mutation', createRoadmap: { __typename?: 'Roadmap', id: string, slug: string, title: string, description: string, content: string, author: string, tags: Array<string>, publishedAt: number, updatedAt: number, isPublished: boolean } };

export type UpdateRoadmapMutationVariables = Exact<{
  input: UpdateRoadmapInput;
}>;


export type UpdateRoadmapMutation = { __typename?: 'Mutation', updateRoadmap: { __typename?: 'Roadmap', id: string, slug: string, title: string, description: string, content: string, author: string, tags: Array<string>, publishedAt: number, updatedAt: number, isPublished: boolean } };

export type DeleteRoadmapMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteRoadmapMutation = { __typename?: 'Mutation', deleteRoadmap: { __typename?: 'Roadmap', id: string, slug: string, title: string, description: string, content: string, author: string, tags: Array<string>, publishedAt: number, updatedAt: number, isPublished: boolean } };

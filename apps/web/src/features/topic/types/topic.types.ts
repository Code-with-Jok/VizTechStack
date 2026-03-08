/**
 * Topic Feature Type Definitions
 * 
 * Shared types used across topic components and hooks.
 */

import type { Node } from "@xyflow/react";

/**
 * Learning resource type
 * Represents external learning materials (articles, videos, courses)
 */
export interface Resource {
    title: string;
    url: string;
    type: 'ARTICLE' | 'VIDEO' | 'COURSE';
}

/**
 * Topic node data structure
 * Used by React Flow for rendering topic nodes in the roadmap graph
 */
export interface TopicData {
    label: string;
    description?: string;
    [key: string]: unknown;
}

/**
 * Topic node type for React Flow
 * Combines TopicData with React Flow's Node type
 */
export type TopicNodeType = Node<TopicData, "topic">;

/**
 * Topic content structure
 * Represents the full topic data returned from GraphQL queries
 */
export interface Topic {
    id: string;
    roadmapId: string;
    nodeId: string;
    title: string;
    content: string;
    resources: Resource[];
}

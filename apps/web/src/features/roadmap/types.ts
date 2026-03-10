/**
 * TypeScript type definitions for Roadmap features
 * 
 * These types are based on the GraphQL schema defined in packages/shared/graphql-schema/src/roadmap.graphql
 * and provide frontend-specific type definitions for roadmap operations.
 */

/**
 * Main Roadmap interface matching the GraphQL Roadmap type
 */
export interface Roadmap {
    /** Unique identifier for the roadmap */
    id: string;
    /** URL-friendly slug for the roadmap */
    slug: string;
    /** Display title of the roadmap */
    title: string;
    /** Brief description of the roadmap */
    description: string;
    /** Full markdown content of the roadmap */
    content: string;
    /** Author of the roadmap (Clerk user ID) */
    author: string;
    /** Array of tags associated with the roadmap */
    tags: string[];
    /** Timestamp when the roadmap was published (Unix timestamp) */
    publishedAt: number;
    /** Timestamp when the roadmap was last updated (Unix timestamp) */
    updatedAt: number;
    /** Whether the roadmap is published and visible to public */
    isPublished: boolean;
}

/**
 * Input interface for creating a new roadmap
 * Matches the GraphQL CreateRoadmapInput type
 */
export interface CreateRoadmapInput {
    /** URL-friendly slug for the roadmap */
    slug: string;
    /** Display title of the roadmap */
    title: string;
    /** Brief description of the roadmap */
    description: string;
    /** Full markdown content of the roadmap */
    content: string;
    /** Array of tags associated with the roadmap */
    tags: string[];
    /** Whether the roadmap should be published immediately */
    isPublished: boolean;
}

/**
 * Input interface for updating an existing roadmap
 * Matches the GraphQL UpdateRoadmapInput type
 * All fields except id are optional for partial updates
 */
export interface UpdateRoadmapInput {
    /** ID of the roadmap to update */
    id: string;
    /** URL-friendly slug for the roadmap */
    slug?: string;
    /** Display title of the roadmap */
    title?: string;
    /** Brief description of the roadmap */
    description?: string;
    /** Full markdown content of the roadmap */
    content?: string;
    /** Array of tags associated with the roadmap */
    tags?: string[];
    /** Whether the roadmap is published and visible to public */
    isPublished?: boolean;
}

/**
 * Form data interface for roadmap forms
 * Used by react-hook-form for form handling
 * Differs from GraphQL input types by using string for tags (comma-separated)
 */
export interface RoadmapFormData {
    /** URL-friendly slug for the roadmap */
    slug: string;
    /** Display title of the roadmap */
    title: string;
    /** Brief description of the roadmap */
    description: string;
    /** Full markdown content of the roadmap */
    content: string;
    /** Comma-separated string of tags (converted to/from string[] for GraphQL) */
    tags: string;
    /** Whether the roadmap should be published */
    isPublished: boolean;
}
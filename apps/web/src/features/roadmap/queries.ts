/**
 * GraphQL queries and mutations for Roadmap operations
 * 
 * This file contains all GraphQL operations for roadmap management including:
 * - ROADMAP_FRAGMENT: Reusable fragment with all roadmap fields
 * - Queries: GET_ROADMAPS, GET_ROADMAP_BY_SLUG
 * - Mutations: CREATE_ROADMAP, UPDATE_ROADMAP, DELETE_ROADMAP
 * 
 * All operations use the ROADMAP_FRAGMENT to ensure consistency
 * and reduce duplication of field definitions.
 */

import { gql } from '@apollo/client';

/**
 * GraphQL fragment containing all Roadmap fields
 * 
 * This fragment is reused across all queries and mutations to ensure
 * consistent field selection and reduce code duplication.
 * 
 * Fields included:
 * - id: Unique identifier
 * - slug: URL-friendly identifier
 * - title: Display title
 * - description: Brief description
 * - content: Full markdown content
 * - author: Author name
 * - tags: Array of tag strings
 * - publishedAt: Publication timestamp
 * - updatedAt: Last update timestamp
 * - isPublished: Publication status
 */
export const ROADMAP_FRAGMENT = gql`
  fragment RoadmapFields on Roadmap {
    id
    slug
    title
    description
    content
    author
    tags
    publishedAt
    updatedAt
    isPublished
  }
`;

/**
 * Query to fetch all roadmaps
 * 
 * Returns an array of all published roadmaps in the system.
 * Used for:
 * - Public roadmap listing page
 * 
 * @returns Array of published Roadmap objects with all fields
 */
export const GET_ROADMAPS = gql`
  ${ROADMAP_FRAGMENT}
  query GetRoadmaps {
    roadmaps {
      ...RoadmapFields
    }
  }
`;

/**
 * Query to fetch all roadmaps for admin (including drafts)
 * 
 * Returns an array of all roadmaps regardless of publication status.
 * Used for:
 * - Admin dashboard roadmap table
 * 
 * @returns Array of all Roadmap objects with all fields
 */
export const GET_ROADMAPS_FOR_ADMIN = gql`
  ${ROADMAP_FRAGMENT}
  query GetRoadmapsForAdmin {
    roadmapsForAdmin {
      ...RoadmapFields
    }
  }
`;

/**
 * Query to fetch a single roadmap by slug
 * 
 * Used for displaying roadmap detail pages.
 * Returns null if no roadmap found with the given slug.
 * 
 * @param slug - URL-friendly identifier for the roadmap
 * @returns Single Roadmap object or null
 */
export const GET_ROADMAP_BY_SLUG = gql`
  ${ROADMAP_FRAGMENT}
  query GetRoadmapBySlug($slug: String!) {
    roadmap(slug: $slug) {
      ...RoadmapFields
    }
  }
`;

/**
 * Mutation to create a new roadmap
 * 
 * Creates a new roadmap with the provided input data.
 * Used in the admin create roadmap form.
 * 
 * @param input - CreateRoadmapInput with all required fields
 * @returns Created Roadmap object with all fields
 */
export const CREATE_ROADMAP = gql`
  ${ROADMAP_FRAGMENT}
  mutation CreateRoadmap($input: CreateRoadmapInput!) {
    createRoadmap(input: $input) {
      ...RoadmapFields
    }
  }
`;

/**
 * Mutation to update an existing roadmap
 * 
 * Updates a roadmap with the provided input data.
 * Only provided fields will be updated (partial update).
 * Used in the admin edit roadmap form.
 * 
 * @param input - UpdateRoadmapInput with id and optional fields to update
 * @returns Updated Roadmap object with all fields
 */
export const UPDATE_ROADMAP = gql`
  ${ROADMAP_FRAGMENT}
  mutation UpdateRoadmap($input: UpdateRoadmapInput!) {
    updateRoadmap(input: $input) {
      ...RoadmapFields
    }
  }
`;

/**
 * Mutation to delete a roadmap
 * 
 * Permanently deletes a roadmap by ID.
 * Used in the admin dashboard delete confirmation dialog.
 * 
 * @param id - ID of the roadmap to delete
 * @returns Deleted Roadmap object (for confirmation/undo purposes)
 */
export const DELETE_ROADMAP = gql`
  ${ROADMAP_FRAGMENT}
  mutation DeleteRoadmap($id: String!) {
    deleteRoadmap(id: $id) {
      ...RoadmapFields
    }
  }
`;
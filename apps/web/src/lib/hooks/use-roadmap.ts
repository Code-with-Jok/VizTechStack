/**
 * Custom hooks for Roadmap operations (CRUD)
 * 
 * This file provides React hooks for all roadmap operations including:
 * - useRoadmaps: Fetch all roadmaps
 * - useRoadmapBySlug: Fetch roadmap by slug
 * - useCreateRoadmap: Create new roadmap with navigation
 * - useUpdateRoadmap: Update existing roadmap with navigation
 * - useDeleteRoadmap: Delete roadmap
 * 
 * All mutation hooks include proper refetchQueries configuration
 * to update Apollo Client cache after operations.
 */

import { useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import {
    GET_ROADMAPS,
    GET_ROADMAPS_FOR_ADMIN,
    GET_ROADMAP_BY_SLUG,
    CREATE_ROADMAP,
    UPDATE_ROADMAP,
    DELETE_ROADMAP,
} from '@/features/roadmap/queries';
import type {
    Roadmap,
    CreateRoadmapInput,
    UpdateRoadmapInput,
} from '@/features/roadmap/types';

/**
 * Hook to fetch all roadmaps (published only)
 * 
 * Provides loading state, error handling, and refetch functionality.
 * Used for public roadmap listing.
 * 
 * @returns Object containing roadmaps array, loading state, error, and refetch function
 */
export function useRoadmaps() {
    const { data, loading, error, refetch } = useQuery(GET_ROADMAPS, {
        // Use cache-and-network to show cached data immediately while fetching fresh data
        fetchPolicy: 'cache-and-network',
        // Enable error policy to return partial data on GraphQL errors
        errorPolicy: 'all',
    });

    return {
        roadmaps: (data?.roadmaps ?? []) as Roadmap[],
        loading,
        error,
        refetch,
    };
}

/**
 * Hook to fetch all roadmaps for admin (including drafts)
 * 
 * Provides loading state, error handling, and refetch functionality.
 * Used for admin dashboard to show both published and draft roadmaps.
 * 
 * @returns Object containing roadmaps array, loading state, error, and refetch function
 */
export function useRoadmapsForAdmin() {
    const { data, loading, error, refetch } = useQuery(GET_ROADMAPS_FOR_ADMIN, {
        // Use cache-and-network to show cached data immediately while fetching fresh data
        fetchPolicy: 'cache-and-network',
        // Enable error policy to return partial data on GraphQL errors
        errorPolicy: 'all',
    });

    return {
        roadmaps: (data?.roadmapsForAdmin ?? []) as Roadmap[],
        loading,
        error,
        refetch,
    };
}

/**
 * Hook to fetch a single roadmap by slug
 * 
 * Used for roadmap detail pages. Skips query if no slug provided.
 * 
 * @param slug - URL-friendly identifier for the roadmap
 * @returns Object containing roadmap data, loading state, and error
 */
export function useRoadmapBySlug(slug: string) {
    const { data, loading, error } = useQuery(GET_ROADMAP_BY_SLUG, {
        variables: { slug },
        // Skip query if no slug provided
        skip: !slug,
        // Use cache-first for detail pages to improve performance
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
    });

    return {
        roadmap: data?.roadmap as Roadmap | null,
        loading,
        error,
    };
}

/**
 * Hook to create a new roadmap
 * 
 * Provides mutation function with automatic navigation to admin dashboard
 * after successful creation. Includes proper cache updates.
 * 
 * @returns Object containing createRoadmap function, loading state, and error
 */
export function useCreateRoadmap() {
    const router = useRouter();
    const [createMutation, { loading, error }] = useMutation(CREATE_ROADMAP, {
        // Refetch both roadmaps queries to update cache after creation
        refetchQueries: [
            { query: GET_ROADMAPS },
            { query: GET_ROADMAPS_FOR_ADMIN }
        ],
        errorPolicy: 'all',
    });

    const createRoadmap = useCallback(
        async (input: CreateRoadmapInput) => {
            try {
                const result = await createMutation({
                    variables: { input },
                });

                if (result.data?.createRoadmap) {
                    // Navigate to admin dashboard after successful creation
                    router.push('/admin/roadmaps');
                }

                return result.data?.createRoadmap;
            } catch (err) {
                // Error is handled by Apollo Client and returned in error state
                console.error('Failed to create roadmap:', err);
                throw err;
            }
        },
        [createMutation, router]
    );

    return { createRoadmap, loading, error };
}

/**
 * Hook to update an existing roadmap
 * 
 * Provides mutation function with automatic navigation to admin dashboard
 * after successful update. Includes proper cache updates.
 * 
 * @returns Object containing updateRoadmap function, loading state, and error
 */
export function useUpdateRoadmap() {
    const router = useRouter();
    const [updateMutation, { loading, error }] = useMutation(UPDATE_ROADMAP, {
        // Refetch both roadmaps queries to update cache after update
        refetchQueries: [
            { query: GET_ROADMAPS },
            { query: GET_ROADMAPS_FOR_ADMIN }
        ],
        errorPolicy: 'all',
    });

    const updateRoadmap = useCallback(
        async (input: UpdateRoadmapInput) => {
            try {
                const result = await updateMutation({
                    variables: { input },
                });

                if (result.data?.updateRoadmap) {
                    // Navigate to admin dashboard after successful update
                    router.push('/admin/roadmaps');
                }

                return result.data?.updateRoadmap;
            } catch (err) {
                // Error is handled by Apollo Client and returned in error state
                console.error('Failed to update roadmap:', err);
                throw err;
            }
        },
        [updateMutation, router]
    );

    return { updateRoadmap, loading, error };
}

/**
 * Hook to delete a roadmap
 * 
 * Provides mutation function with proper cache cleanup.
 * Does not include navigation as it's typically used in dialogs.
 * 
 * @returns Object containing deleteRoadmap function, loading state, and error
 */
export function useDeleteRoadmap() {
    const [deleteMutation, { loading, error }] = useMutation(DELETE_ROADMAP, {
        // Refetch both roadmaps queries to update cache after deletion
        refetchQueries: [
            { query: GET_ROADMAPS },
            { query: GET_ROADMAPS_FOR_ADMIN }
        ],
        errorPolicy: 'all',
    });

    const deleteRoadmap = useCallback(
        async (id: string) => {
            try {
                const result = await deleteMutation({
                    variables: { id },
                });

                return result.data?.deleteRoadmap;
            } catch (err) {
                // Error is handled by Apollo Client and returned in error state
                console.error('Failed to delete roadmap:', err);
                throw err;
            }
        },
        [deleteMutation]
    );

    return { deleteRoadmap, loading, error };
}

/**
 * Hook to fetch a single roadmap by ID
 * 
 * Used for edit forms where we need to fetch roadmap by ID instead of slug.
 * Uses the admin query to ensure we can fetch draft roadmaps for editing.
 * 
 * @param id - Unique identifier for the roadmap
 * @returns Object containing roadmap data, loading state, and error
 */
export function useRoadmapById(id: string) {
    const { data, loading, error } = useQuery(GET_ROADMAPS_FOR_ADMIN, {
        // Skip query if no id provided
        skip: !id,
        fetchPolicy: 'cache-first',
        errorPolicy: 'all',
    });

    // Find the roadmap by ID from the roadmaps list
    const roadmap = data?.roadmapsForAdmin?.find((r: Roadmap) => r.id === id) || null;

    return {
        roadmap,
        loading,
        error,
    };
}
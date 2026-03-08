/**
 * useCreateRoadmap Hook
 * 
 * Custom hook for creating new roadmaps (admin only).
 * 
 * Features:
 * - Creates roadmap via GraphQL mutation
 * - Client-side validation
 * - Error handling with specific error messages
 * - Provides callback for successful creation
 * 
 * @returns Mutation function, loading state, error, and validation
 */
'use client';

import { useState, useCallback } from 'react';
import { gql, useMutation } from '@apollo/client';
import type {
    RoadmapCategory,
    RoadmapDifficulty,
    RoadmapStatus,
} from '@viztechstack/types';
import type {
    CreateRoadmapFormData,
    CreateRoadmapFormErrors,
    UseCreateRoadmapOptions,
} from '../types';

const CREATE_ROADMAP_MUTATION = gql`
  mutation CreateRoadmap($input: CreateRoadmapInput!) {
    createRoadmap(input: $input) {
      id
      slug
      title
      description
      category
      difficulty
      status
      topicCount
      createdAt
    }
  }
`;

export function useCreateRoadmap({ onCompleted }: UseCreateRoadmapOptions = {}) {
    const [errors, setErrors] = useState<CreateRoadmapFormErrors>({});

    const [createRoadmapMutation, { loading }] = useMutation(CREATE_ROADMAP_MUTATION, {
        onCompleted: (data) => {
            if (onCompleted) {
                onCompleted({ slug: data.createRoadmap.slug });
            }
        },
        onError: (error) => {
            // Handle GraphQL errors
            const errorMessage = error.message;

            // Check for specific error types
            if (errorMessage.includes('slug') && errorMessage.includes('exists')) {
                setErrors({ slug: 'A roadmap with this slug already exists' });
            } else if (errorMessage.includes('authorization') || errorMessage.includes('admin')) {
                setErrors({ general: 'You do not have permission to create roadmaps' });
            } else {
                setErrors({ general: errorMessage });
            }
        },
    });

    // Client-side validation
    const validateForm = useCallback((formData: CreateRoadmapFormData): boolean => {
        const newErrors: CreateRoadmapFormErrors = {};

        // Validate slug
        if (!formData.slug.trim()) {
            newErrors.slug = 'Slug is required';
        } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            newErrors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
        }

        // Validate title
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        // Validate description
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, []);

    const createRoadmap = useCallback(
        async (formData: CreateRoadmapFormData) => {
            // Clear previous errors
            setErrors({});

            // Validate form
            if (!validateForm(formData)) {
                return;
            }

            // Prepare mutation input
            // Map lowercase enum values to uppercase GraphQL enum values
            const input = {
                slug: formData.slug.trim(),
                title: formData.title.trim(),
                description: formData.description.trim(),
                category: formData.category.toUpperCase().replace('-', '_') as 'ROLE' | 'SKILL' | 'BEST_PRACTICE',
                difficulty: formData.difficulty.toUpperCase() as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
                status: formData.status.toUpperCase() as 'PUBLIC' | 'DRAFT' | 'PRIVATE',
                nodes: [],
                edges: [],
                topicCount: 0,
            };

            try {
                await createRoadmapMutation({ variables: { input } });
            } catch (err) {
                // Error handling is done in onError callback
                console.error('Failed to create roadmap:', err);
            }
        },
        [createRoadmapMutation, validateForm]
    );

    const clearError = useCallback((field: keyof CreateRoadmapFormErrors) => {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
    }, []);

    return {
        createRoadmap,
        loading,
        errors,
        clearError,
        validateForm,
    };
}

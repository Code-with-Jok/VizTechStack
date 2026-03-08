/**
 * Editor Types
 * 
 * Shared type definitions for the editor feature.
 * These types are used across editor components and hooks.
 */

import type {
    RoadmapCategory,
    RoadmapDifficulty,
    RoadmapStatus,
} from '@viztechstack/types';
import type { Resource } from '@/features/topic/types';

/**
 * Form data for creating a new roadmap
 */
export interface CreateRoadmapFormData {
    slug: string;
    title: string;
    description: string;
    category: RoadmapCategory;
    difficulty: RoadmapDifficulty;
    status: RoadmapStatus;
}

/**
 * Validation errors for roadmap creation form
 */
export interface CreateRoadmapFormErrors {
    slug?: string;
    title?: string;
    description?: string;
    category?: string;
    difficulty?: string;
    status?: string;
    general?: string;
}

/**
 * Form data for roadmap form fields (create/edit)
 */
export interface RoadmapFormData {
    slug: string;
    title: string;
    description: string;
    category: RoadmapCategory;
    difficulty: RoadmapDifficulty;
    status: RoadmapStatus;
}

/**
 * Validation errors for roadmap form fields
 */
export interface RoadmapFormErrors {
    slug?: string;
    title?: string;
    description?: string;
    category?: string;
    difficulty?: string;
    status?: string;
}

/**
 * Form data for creating topic content
 */
export interface CreateTopicFormData {
    nodeId: string;
    title: string;
    content: string;
    resources: Resource[];
}

/**
 * Validation errors for topic creation form
 */
export interface CreateTopicFormErrors {
    nodeId?: string;
    title?: string;
    content?: string;
    resources?: string;
    general?: string;
}

/**
 * Props for CreateTopicForm component
 */
export interface CreateTopicFormProps {
    roadmapId: string;
    nodeId?: string;
    onSuccess?: (topicId: string) => void;
    onCancel?: () => void;
}

/**
 * Props for DeleteRoadmapButton component
 */
export interface DeleteRoadmapButtonProps {
    roadmapId: string;
    roadmapTitle: string;
}

/**
 * Props for RoadmapEditor component
 */
export interface RoadmapEditorProps {
    onChange: (nodesJson: string, edgesJson: string, topicCount: number) => void;
}

/**
 * Props for RoadmapEditorCanvas component
 */
export interface RoadmapEditorCanvasProps {
    slug: string;
    onSave?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Props for RoadmapFormFields component
 */
export interface RoadmapFormFieldsProps {
    value: RoadmapFormData;
    onChange: (data: RoadmapFormData) => void;
    errors?: RoadmapFormErrors;
    disabled?: boolean;
}

/**
 * Props for ResourceFormFields component
 */
export interface ResourceFormFieldsProps {
    resources: Resource[];
    onChange: (resources: Resource[]) => void;
    error?: string;
    disabled?: boolean;
}

/**
 * Options for useCreateRoadmap hook
 */
export interface UseCreateRoadmapOptions {
    onCompleted?: (data: { slug: string }) => void;
}

/**
 * Options for useDeleteRoadmap hook
 */
export interface UseDeleteRoadmapOptions {
    onCompleted?: () => void;
    onError?: (error: Error) => void;
}

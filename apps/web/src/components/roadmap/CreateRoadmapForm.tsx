/**
 * CreateRoadmapForm Component
 * 
 * Form for creating new roadmaps (admin only).
 * 
 * Features:
 * - Form fields: slug, title, description, category, difficulty, status
 * - Client-side validation with Zod schemas
 * - GraphQL mutation to create roadmap
 * - Success and error state handling
 * - Redirects to editor after successful creation
 * - Only accessible to admin users
 * 
 * Validates Requirements: 5.1, 5.2, 5.6
 * 
 * Usage:
 * ```tsx
 * import { CreateRoadmapForm } from '@/components/roadmap/CreateRoadmapForm';
 * 
 * function NewRoadmapPage() {
 *   return (
 *     <div className="container mx-auto py-8">
 *       <CreateRoadmapForm />
 *     </div>
 *   );
 * }
 * ```
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { gql, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2, Save } from 'lucide-react';
import {
    ROADMAP_CATEGORY_VALUES,
    ROADMAP_DIFFICULTY_VALUES,
    ROADMAP_STATUS_VALUES,
    type RoadmapCategory,
    type RoadmapDifficulty,
    type RoadmapStatus,
} from '@viztechstack/types';

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

interface FormData {
    slug: string;
    title: string;
    description: string;
    category: RoadmapCategory;
    difficulty: RoadmapDifficulty;
    status: RoadmapStatus;
}

interface FormErrors {
    slug?: string;
    title?: string;
    description?: string;
    category?: string;
    difficulty?: string;
    status?: string;
    general?: string;
}

export function CreateRoadmapForm() {
    const router = useRouter();
    const { user } = useUser();
    const [formData, setFormData] = useState<FormData>({
        slug: '',
        title: '',
        description: '',
        category: 'role',
        difficulty: 'beginner',
        status: 'draft',
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const [createRoadmap, { loading }] = useMutation(CREATE_ROADMAP_MUTATION, {
        onCompleted: (data) => {
            // Redirect to editor after successful creation
            const slug = data.createRoadmap.slug;
            router.push(`/admin/roadmaps/${slug}/edit`);
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
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setErrors({});

        // Validate form
        if (!validateForm()) {
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
            await createRoadmap({ variables: { input } });
        } catch (err) {
            // Error handling is done in onError callback
            console.error('Failed to create roadmap:', err);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    // Check if user is admin
    const isAdmin = user?.publicMetadata?.role === 'admin';

    if (!isAdmin) {
        return (
            <Card className="p-6">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                            Access Denied
                        </h3>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            Only admin users can create roadmaps.
                        </p>
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    Create New Roadmap
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Fill in the details below to create a new learning roadmap.
                </p>
            </div>

            {errors.general && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                            Error
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {errors.general}
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Slug field */}
                <div>
                    <label
                        htmlFor="slug"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
                    >
                        Slug <span className="text-red-600">*</span>
                    </label>
                    <Input
                        id="slug"
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        placeholder="frontend-developer"
                        aria-invalid={!!errors.slug}
                        disabled={loading}
                    />
                    {errors.slug && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {errors.slug}
                        </p>
                    )}
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        URL-friendly identifier (lowercase, numbers, hyphens only)
                    </p>
                </div>

                {/* Title field */}
                <div>
                    <label
                        htmlFor="title"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
                    >
                        Title <span className="text-red-600">*</span>
                    </label>
                    <Input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Frontend Developer Roadmap"
                        aria-invalid={!!errors.title}
                        disabled={loading}
                    />
                    {errors.title && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {errors.title}
                        </p>
                    )}
                </div>

                {/* Description field */}
                <div>
                    <label
                        htmlFor="description"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
                    >
                        Description <span className="text-red-600">*</span>
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="A comprehensive guide to becoming a frontend developer..."
                        rows={4}
                        aria-invalid={!!errors.description}
                        disabled={loading}
                        className="w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"
                    />
                    {errors.description && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {errors.description}
                        </p>
                    )}
                </div>

                {/* Category field */}
                <div>
                    <label
                        htmlFor="category"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
                    >
                        Category <span className="text-red-600">*</span>
                    </label>
                    <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value as RoadmapCategory)}
                        disabled={loading}
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        {ROADMAP_CATEGORY_VALUES.map((category) => (
                            <option key={category} value={category}>
                                {category === 'best-practice' ? 'Best Practice' : category.charAt(0).toUpperCase() + category.slice(1)}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Type of learning path
                    </p>
                </div>

                {/* Difficulty field */}
                <div>
                    <label
                        htmlFor="difficulty"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
                    >
                        Difficulty <span className="text-red-600">*</span>
                    </label>
                    <select
                        id="difficulty"
                        value={formData.difficulty}
                        onChange={(e) => handleInputChange('difficulty', e.target.value as RoadmapDifficulty)}
                        disabled={loading}
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        {ROADMAP_DIFFICULTY_VALUES.map((difficulty) => (
                            <option key={difficulty} value={difficulty}>
                                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Complexity level for learners
                    </p>
                </div>

                {/* Status field */}
                <div>
                    <label
                        htmlFor="status"
                        className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
                    >
                        Status <span className="text-red-600">*</span>
                    </label>
                    <select
                        id="status"
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value as RoadmapStatus)}
                        disabled={loading}
                        className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                        {ROADMAP_STATUS_VALUES.map((status) => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Visibility: public (all users), draft (admins only), private (admins only)
                    </p>
                </div>

                {/* Submit button */}
                <div className="flex items-center gap-3 pt-4">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="min-w-[120px]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Create Roadmap
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </Card>
    );
}

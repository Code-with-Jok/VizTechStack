"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateRoadmap, useUpdateRoadmap } from '@/lib/hooks/use-roadmap';
import { Roadmap, RoadmapFormData, CreateRoadmapInput, UpdateRoadmapInput, NodeCategory, NODE_CATEGORY_OPTIONS } from '@/features/roadmap/types';

// Zod schema for form validation
const roadmapFormSchema = z.object({
    slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    content: z.string().min(1, 'Content is required'),
    nodeCategory: z.enum(['ROLE', 'SKILL', 'TOPIC', 'MILESTONE', 'RESOURCE'], {
        errorMap: () => ({ message: 'Please select a valid node category' })
    }),
    tags: z.string().min(1, 'At least one tag is required'),
    isPublished: z.boolean(),
});

interface RoadmapFormProps {
    mode: 'create' | 'edit';
    initialData?: Roadmap;
}

export function RoadmapForm({ mode, initialData }: RoadmapFormProps) {
    const router = useRouter();
    const { createRoadmap, loading: createLoading, error: createError } = useCreateRoadmap();
    const { updateRoadmap, loading: updateLoading, error: updateError } = useUpdateRoadmap();
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isLoading = createLoading || updateLoading;
    const error = createError || updateError;

    // Initialize form with react-hook-form and Zod validation
    const form = useForm<RoadmapFormData>({
        resolver: zodResolver(roadmapFormSchema),
        defaultValues: {
            slug: '',
            title: '',
            description: '',
            content: '',
            nodeCategory: 'TOPIC' as NodeCategory,
            tags: '',
            isPublished: false,
        },
    });

    // Pre-fill form with initial data for edit mode
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            form.reset({
                slug: initialData.slug,
                title: initialData.title,
                description: initialData.description,
                content: initialData.content,
                nodeCategory: initialData.nodeCategory,
                tags: initialData.tags.join(', '),
                isPublished: initialData.isPublished,
            });
        }
    }, [mode, initialData, form]);

    // Handle form submission
    const onSubmit = async (data: RoadmapFormData) => {
        try {
            setSubmitError(null);

            // Convert comma-separated tags string to array
            const tagsArray = data.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            if (mode === 'create') {
                const input: CreateRoadmapInput = {
                    slug: data.slug,
                    title: data.title,
                    description: data.description,
                    content: data.content,
                    nodeCategory: data.nodeCategory,
                    tags: tagsArray,
                    isPublished: data.isPublished,
                };
                await createRoadmap(input);
            } else if (mode === 'edit' && initialData) {
                const input: UpdateRoadmapInput = {
                    id: initialData.id,
                    slug: data.slug,
                    title: data.title,
                    description: data.description,
                    content: data.content,
                    nodeCategory: data.nodeCategory,
                    tags: tagsArray,
                    isPublished: data.isPublished,
                };
                await updateRoadmap(input);
            }
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Failed to save roadmap');
        }
    };

    // Handle cancel button
    const handleCancel = () => {
        router.push('/admin/roadmaps');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    {mode === 'create' ? 'Create New Roadmap' : 'Edit Roadmap'}
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                    {mode === 'create'
                        ? 'Fill in the details to create a new technology roadmap'
                        : 'Update the roadmap details below'
                    }
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Slug Field */}
                <div className="space-y-2">
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                        id="slug"
                        placeholder="e.g., react-roadmap"
                        {...form.register('slug')}
                        disabled={isLoading}
                    />
                    {form.formState.errors.slug && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {form.formState.errors.slug.message}
                        </p>
                    )}
                </div>

                {/* Title Field */}
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        placeholder="e.g., React Developer Roadmap"
                        {...form.register('title')}
                        disabled={isLoading}
                    />
                    {form.formState.errors.title && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {form.formState.errors.title.message}
                        </p>
                    )}
                </div>

                {/* Description Field */}
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Brief description of the roadmap..."
                        rows={3}
                        {...form.register('description')}
                        disabled={isLoading}
                    />
                    {form.formState.errors.description && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {form.formState.errors.description.message}
                        </p>
                    )}
                </div>

                {/* Content Field */}
                <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                        id="content"
                        placeholder="Full roadmap content in markdown format..."
                        rows={10}
                        {...form.register('content')}
                        disabled={isLoading}
                    />
                    {form.formState.errors.content && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {form.formState.errors.content.message}
                        </p>
                    )}
                </div>

                {/* Node Category Field */}
                <div className="space-y-2">
                    <Label htmlFor="nodeCategory">Node Category *</Label>
                    <Select
                        value={form.watch('nodeCategory') || ''}
                        onValueChange={(value: NodeCategory) => form.setValue('nodeCategory', value)}
                        disabled={isLoading}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a node category" />
                        </SelectTrigger>
                        <SelectContent>
                            {NODE_CATEGORY_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex flex-col">
                                        <span className="font-medium flex">{option.label}</span>
                                        <span className="text-sm text-zinc-500 dark:text-zinc-400">
                                            {option.description}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Chọn loại node để phân loại roadmap trong visualization
                    </p>
                    {form.formState.errors.nodeCategory && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {form.formState.errors.nodeCategory.message}
                        </p>
                    )}
                </div>

                {/* Tags Field */}
                <div className="space-y-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                        id="tags"
                        placeholder="e.g., react, javascript, frontend"
                        {...form.register('tags')}
                        disabled={isLoading}
                    />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Separate tags with commas
                    </p>
                    {form.formState.errors.tags && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                            {form.formState.errors.tags.message}
                        </p>
                    )}
                </div>

                {/* Published Checkbox */}
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="isPublished"
                        checked={form.watch('isPublished')}
                        onCheckedChange={(checked) => form.setValue('isPublished', !!checked)}
                        disabled={isLoading}
                    />
                    <Label htmlFor="isPublished">Publish roadmap</Label>
                </div>

                {/* Error Alert */}
                {(error || submitError) && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            {submitError || error?.message || 'An error occurred while saving the roadmap'}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                    <Button
                        type="submit"
                        disabled={isLoading || !form.formState.isValid}
                        className="flex-1"
                    >
                        {isLoading ? (
                            <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                {mode === 'create' ? 'Creating...' : 'Updating...'}
                            </>
                        ) : (
                            mode === 'create' ? 'Create Roadmap' : 'Update Roadmap'
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
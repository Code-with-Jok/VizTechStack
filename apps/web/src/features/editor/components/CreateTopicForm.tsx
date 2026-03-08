/**
 * CreateTopicForm Component
 * 
 * Form for creating topic content for roadmap nodes (admin only).
 * 
 * Features:
 * - Form fields: nodeId, title, content (markdown editor), resources
 * - Markdown editor with live preview
 * - Dynamic resource list (add/remove resources)
 * - GraphQL mutation to create topic
 * - Client-side validation with error handling
 * - Success and error state handling
 * 
 * Validates Requirements: 4.1, 4.3, 4.4
 * 
 * Usage:
 * ```tsx
 * import { CreateTopicForm } from '@/components/roadmap/CreateTopicForm';
 * 
 * function TopicCreationPage() {
 *   return (
 *     <div className="container mx-auto py-8">
 *       <CreateTopicForm roadmapId="roadmap-123" />
 *     </div>
 *   );
 * }
 * ```
 */
'use client';

import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2, Save, Plus, X, Eye, EyeOff } from 'lucide-react';
import type { Resource } from '@/features/topic/types';
import type {
    CreateTopicFormData,
    CreateTopicFormErrors,
    CreateTopicFormProps,
} from '../types';

const CREATE_TOPIC_MUTATION = gql`
  mutation CreateTopic($input: CreateTopicInput!) {
    createTopic(input: $input) {
      id
      roadmapId
      nodeId
      title
      content
      resources {
        title
        url
        type
      }
    }
  }
`;

export function CreateTopicForm({ roadmapId, nodeId, onSuccess, onCancel }: CreateTopicFormProps) {
    const { user } = useUser();
    const [formData, setFormData] = useState<CreateTopicFormData>({
        nodeId: nodeId || '',
        title: '',
        content: '',
        resources: [],
    });
    const [errors, setErrors] = useState<CreateTopicFormErrors>({});
    const [showPreview, setShowPreview] = useState(false);

    const [createTopic, { loading }] = useMutation(CREATE_TOPIC_MUTATION, {
        onCompleted: (data) => {
            if (onSuccess) {
                onSuccess(data.createTopic.id);
            }
        },
        onError: (error) => {
            const errorMessage = error.message;

            if (errorMessage.includes('authorization') || errorMessage.includes('admin')) {
                setErrors({ general: 'You do not have permission to create topics' });
            } else if (errorMessage.includes('nodeId')) {
                setErrors({ nodeId: 'Invalid node ID' });
            } else {
                setErrors({ general: errorMessage });
            }
        },
    });

    // Client-side validation
    const validateForm = (): boolean => {
        const newErrors: CreateTopicFormErrors = {};

        if (!formData.nodeId.trim()) {
            newErrors.nodeId = 'Node ID is required';
        }

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Content is required';
        }

        // Validate resources
        for (const resource of formData.resources) {
            if (!resource.title.trim() || !resource.url.trim()) {
                newErrors.resources = 'All resources must have a title and URL';
                break;
            }

            // Basic URL validation
            try {
                new URL(resource.url);
            } catch {
                newErrors.resources = 'All resource URLs must be valid';
                break;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setErrors({});

        if (!validateForm()) {
            return;
        }

        const input = {
            roadmapId,
            nodeId: formData.nodeId.trim(),
            title: formData.title.trim(),
            content: formData.content.trim(),
            resources: formData.resources.map(r => ({
                title: r.title.trim(),
                url: r.url.trim(),
                type: r.type,
            })),
        };

        try {
            await createTopic({ variables: { input } });
        } catch (err) {
            console.error('Failed to create topic:', err);
        }
    };

    const handleInputChange = (field: keyof CreateTopicFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const addResource = () => {
        setFormData((prev) => ({
            ...prev,
            resources: [...prev.resources, { title: '', url: '', type: 'ARTICLE' }],
        }));
    };

    const removeResource = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            resources: prev.resources.filter((_, i) => i !== index),
        }));
    };

    const updateResource = (index: number, field: keyof Resource, value: string) => {
        setFormData((prev) => ({
            ...prev,
            resources: prev.resources.map((r, i) =>
                i === index ? { ...r, [field]: value } : r
            ),
        }));
        if (errors.resources) {
            setErrors((prev) => ({ ...prev, resources: undefined }));
        }
    };

    // Simple markdown to HTML converter (basic implementation)
    const renderMarkdownPreview = (markdown: string): string => {
        let html = markdown;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

        // Code blocks
        html = html.replace(/```(.*?)```/gs, '<pre class="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-md my-2 overflow-x-auto"><code>$1</code></pre>');

        // Inline code
        html = html.replace(/`(.*?)`/g, '<code class="bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-sm">$1</code>');

        // Links
        html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>');

        // Line breaks
        html = html.replace(/\n/g, '<br />');

        return html;
    };

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
                            Only admin users can create topics.
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
                    Create Topic Content
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    Add detailed content and learning resources for a roadmap node.
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
                {/* Node ID field - hidden if nodeId is provided */}
                {!nodeId && (
                    <div>
                        <label
                            htmlFor="nodeId"
                            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2"
                        >
                            Node ID <span className="text-red-600">*</span>
                        </label>
                        <Input
                            id="nodeId"
                            type="text"
                            value={formData.nodeId}
                            onChange={(e) => handleInputChange('nodeId', e.target.value)}
                            placeholder="node-1"
                            aria-invalid={!!errors.nodeId}
                            disabled={loading}
                        />
                        {errors.nodeId && (
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                                {errors.nodeId}
                            </p>
                        )}
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            The ID of the node this topic belongs to
                        </p>
                    </div>
                )}

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
                        placeholder="Introduction to React"
                        aria-invalid={!!errors.title}
                        disabled={loading}
                    />
                    {errors.title && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {errors.title}
                        </p>
                    )}
                </div>

                {/* Content field with markdown editor and preview */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label
                            htmlFor="content"
                            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
                        >
                            Content (Markdown) <span className="text-red-600">*</span>
                        </label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPreview(!showPreview)}
                            className="h-7 text-xs"
                        >
                            {showPreview ? (
                                <>
                                    <EyeOff className="w-3 h-3 mr-1" />
                                    Hide Preview
                                </>
                            ) : (
                                <>
                                    <Eye className="w-3 h-3 mr-1" />
                                    Show Preview
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4" style={{ gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr' }}>
                        <div>
                            <textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => handleInputChange('content', e.target.value)}
                                placeholder="# Introduction&#10;&#10;Write your content here using **Markdown** syntax...&#10;&#10;## Key Concepts&#10;&#10;- Point 1&#10;- Point 2"
                                rows={12}
                                aria-invalid={!!errors.content}
                                disabled={loading}
                                className="w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 font-mono"
                            />
                        </div>

                        {showPreview && (
                            <div className="rounded-md border border-input bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 overflow-y-auto" style={{ maxHeight: '300px' }}>
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2 font-medium">
                                    Preview:
                                </div>
                                <div
                                    className="prose prose-sm dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(formData.content) }}
                                />
                            </div>
                        )}
                    </div>

                    {errors.content && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            {errors.content}
                        </p>
                    )}
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        Use Markdown syntax for formatting (headers, bold, italic, code, links)
                    </p>
                </div>

                {/* Resources section */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            Learning Resources
                        </label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addResource}
                            disabled={loading}
                            className="h-8"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add Resource
                        </Button>
                    </div>

                    {formData.resources.length === 0 ? (
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-6 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md">
                            No resources added yet. Click &quot;Add Resource&quot; to add learning materials.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {formData.resources.map((resource, index) => (
                                <div
                                    key={index}
                                    className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                            Resource {index + 1}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeResource(index)}
                                            disabled={loading}
                                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <X className="w-3 h-3 mr-1" />
                                            Remove
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label
                                                htmlFor={`resource-title-${index}`}
                                                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                                            >
                                                Title
                                            </label>
                                            <Input
                                                id={`resource-title-${index}`}
                                                type="text"
                                                value={resource.title}
                                                onChange={(e) => updateResource(index, 'title', e.target.value)}
                                                placeholder="Official Documentation"
                                                disabled={loading}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor={`resource-type-${index}`}
                                                className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                                            >
                                                Type
                                            </label>
                                            <select
                                                id={`resource-type-${index}`}
                                                value={resource.type}
                                                onChange={(e) => updateResource(index, 'type', e.target.value)}
                                                disabled={loading}
                                                className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            >
                                                <option value="ARTICLE">Article</option>
                                                <option value="VIDEO">Video</option>
                                                <option value="COURSE">Course</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor={`resource-url-${index}`}
                                            className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1"
                                        >
                                            URL
                                        </label>
                                        <Input
                                            id={`resource-url-${index}`}
                                            type="url"
                                            value={resource.url}
                                            onChange={(e) => updateResource(index, 'url', e.target.value)}
                                            placeholder="https://example.com/resource"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {errors.resources && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                            {errors.resources}
                        </p>
                    )}
                </div>

                {/* Submit buttons */}
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
                                Create Topic
                            </>
                        )}
                    </Button>
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </form>
        </Card>
    );
}

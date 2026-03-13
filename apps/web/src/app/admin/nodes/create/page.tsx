'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContentEditor } from '@/components/editor';
import { NodeSwitch } from '@/components/node/NodeSwitch';
import { generateSlug } from '@/lib/utils/generateSlug';
import { CreateArticleInputSchema } from '@viztechstack/validation';
import { useCreateArticleMutation } from '@viztechstack/graphql-generated';
import { z } from 'zod';

type NodeType = 'article' | 'roadmap';

interface FormData {
    title: string;
    content: string;
    tags: string[];
    isPublished: boolean;
}

interface FormErrors {
    title?: string;
    content?: string;
    tags?: string;
    general?: string;
}

export default function CreateNodePage() {
    const router = useRouter();
    const [nodeType, setNodeType] = useState<NodeType>('article');
    const [formData, setFormData] = useState<FormData>({
        title: '',
        content: '<p>Start writing your article...</p>',
        tags: [],
        isPublished: false,
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [tagInput, setTagInput] = useState('');

    // GraphQL mutation hook
    const [createArticleMutation] = useCreateArticleMutation({
        onCompleted: (data) => {
            console.log('Article created successfully:', data.createArticle);
            // Redirect to article view page
            // router.push(`/article/${data.createArticle.slug}`);
            setIsSubmitting(false);

        },

        onError: (error) => {
            console.error('Failed to create article:', error);
            setErrors({
                general: error.message || 'Failed to create article. Please try again.'
            });
            setIsSubmitting(false);
        }
    });

    // Handle form field changes
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, title: e.target.value }));
        // Clear title error when user starts typing
        if (errors.title) {
            setErrors(prev => ({ ...prev, title: undefined }));
        }
    };

    const handleContentChange = (content: string) => {
        setFormData(prev => ({ ...prev, content }));
        // Clear content error when user starts typing
        if (errors.content) {
            setErrors(prev => ({ ...prev, content: undefined }));
        }
    };

    const handlePublishedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, isPublished: e.target.checked }));
    };

    // Handle tags
    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        }
    };

    const addTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, tag]
            }));
            setTagInput('');
            // Clear tags error when user adds a tag
            if (errors.tags) {
                setErrors(prev => ({ ...prev, tags: undefined }));
            }
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    // Client-side validation
    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        try {
            // Validate using Zod schema
            CreateArticleInputSchema.parse({
                slug: generateSlug(formData.title),
                title: formData.title,
                content: formData.content,
                tags: formData.tags,
                isPublished: formData.isPublished,
            });
        } catch (error) {
            if (error instanceof z.ZodError) {
                error.errors.forEach(err => {
                    const field = err.path[0] as keyof FormErrors;
                    if (field === 'title' || field === 'content' || field === 'tags') {
                        newErrors[field] = err.message;
                    }
                });
            }
        }

        // Additional custom validations
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length > 200) {
            newErrors.title = 'Title must be less than 200 characters';
        }

        if (!formData.content || formData.content.trim() === '<p></p>' || formData.content.trim() === '<p>Start writing your article...</p>') {
            newErrors.content = 'Content is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrors({});

        try {
            // Generate slug from title
            const slug = generateSlug(formData.title);

            // Prepare article data
            const articleData = {
                slug,
                title: formData.title,
                content: formData.content,
                tags: formData.tags,
                isPublished: formData.isPublished,
            };

            console.log('Creating article with data:', articleData);

            // Call GraphQL mutation
            await createArticleMutation({
                variables: {
                    input: articleData
                }
            });


        } catch (error) {
            console.error('Failed to create article:', error);
            setErrors({
                general: 'Failed to create article. Please try again.'
            });
            setIsSubmitting(false);
        }
    };

    // Auto-save handler
    const handleAutoSave = async (content: string) => {
        // Save draft to localStorage as backup
        const draft = {
            ...formData,
            content,
            timestamp: new Date().toISOString(),
        };

        try {
            localStorage.setItem('article_draft', JSON.stringify(draft));
            console.log('Draft saved to localStorage');
        } catch (error) {
            console.error('Failed to save draft:', error);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Create New Node</h1>
                    <p className="text-gray-600">
                        Choose the type of content you want to create and fill in the details.
                    </p>
                </div>

                {/* Node Type Switch */}
                <div className="mb-8">
                    <NodeSwitch
                        value={nodeType}
                        onChange={setNodeType}
                    />
                </div>

                {/* Article Form */}
                {nodeType === 'article' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* General Error */}
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-800 text-sm">{errors.general}</p>
                            </div>
                        )}

                        {/* Title Field */}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={formData.title}
                                onChange={handleTitleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                    }`}
                                placeholder="Enter article title..."
                                maxLength={200}
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                {formData.title.length}/200 characters
                            </p>
                        </div>

                        {/* Tags Field */}
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                                Tags
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    id="tags"
                                    value={tagInput}
                                    onChange={handleTagInputChange}
                                    onKeyDown={handleTagInputKeyDown}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.tags ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                    placeholder="Type a tag and press Enter..."
                                />
                                {errors.tags && (
                                    <p className="text-sm text-red-600">{errors.tags}</p>
                                )}

                                {/* Tag List */}
                                {formData.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {formData.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTag(tag)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    aria-label={`Remove ${tag} tag`}
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Press Enter or comma to add tags. Click × to remove.
                            </p>
                        </div>

                        {/* Published Checkbox */}
                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isPublished}
                                    onChange={handlePublishedChange}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Publish immediately
                                </span>
                            </label>
                            <p className="mt-1 text-xs text-gray-500">
                                Uncheck to save as draft. You can publish later.
                            </p>
                        </div>

                        {/* Content Editor */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Content *
                            </label>
                            <div className={`border rounded-lg overflow-hidden ${errors.content ? 'border-red-300' : 'border-gray-300'
                                }`}>
                                <ContentEditor
                                    initialContent={formData.content}
                                    onChange={handleContentChange}
                                    onSave={handleAutoSave}
                                    autoSaveInterval={30000}
                                    showSaveStatus={true}
                                    localStorageKey="article_draft_content"
                                />
                            </div>
                            {errors.content && (
                                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {isSubmitting && (
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                )}
                                {isSubmitting ? 'Creating...' : 'Create Article'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Roadmap Form Placeholder */}
                {nodeType === 'roadmap' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                            Roadmap Creation
                        </h3>
                        <p className="text-yellow-800">
                            Roadmap creation will be implemented in Phase 3.
                            For now, please select "Article" to create content.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

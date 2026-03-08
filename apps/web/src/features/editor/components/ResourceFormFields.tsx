/**
 * ResourceFormFields Component
 * 
 * Reusable form fields for managing learning resources (add/remove/edit).
 * 
 * Features:
 * - Dynamic resource list with add/remove functionality
 * - Input fields for resource title, URL, and type
 * - URL format validation
 * - Controlled component pattern
 * 
 * Validates Requirements: 4.4, 4.5
 * 
 * Usage:
 * ```tsx
 * import { ResourceFormFields } from '@/components/roadmap/ResourceFormFields';
 * 
 * function MyForm() {
 *   const [resources, setResources] = useState<Resource[]>([]);
 *   const [error, setError] = useState<string>();
 * 
 *   return (
 *     <ResourceFormFields
 *       resources={resources}
 *       onChange={setResources}
 *       error={error}
 *       disabled={false}
 *     />
 *   );
 * }
 * ```
 */
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import type { Resource } from '@/features/topic/types';
import type { ResourceFormFieldsProps } from '../types';

export function ResourceFormFields({
    resources,
    onChange,
    error,
    disabled = false,
}: ResourceFormFieldsProps) {
    const addResource = () => {
        onChange([...resources, { title: '', url: '', type: 'ARTICLE' }]);
    };

    const removeResource = (index: number) => {
        onChange(resources.filter((_, i) => i !== index));
    };

    const updateResource = (index: number, field: keyof Resource, value: string) => {
        onChange(
            resources.map((r, i) =>
                i === index ? { ...r, [field]: value } : r
            )
        );
    };

    return (
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
                    disabled={disabled}
                    className="h-8"
                >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Resource
                </Button>
            </div>

            {resources.length === 0 ? (
                <div className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-6 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-md">
                    No resources added yet. Click &quot;Add Resource&quot; to add learning materials.
                </div>
            ) : (
                <div className="space-y-4">
                    {resources.map((resource, index) => (
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
                                    disabled={disabled}
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
                                        disabled={disabled}
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
                                        disabled={disabled}
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
                                    disabled={disabled}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    {error}
                </p>
            )}
        </div>
    );
}

/**
 * RoadmapFormFields Component
 * 
 * Reusable form fields for roadmap creation and editing.
 * 
 * Features:
 * - Controlled component with value and onChange props
 * - Input fields: slug, title, description
 * - Select fields: category, difficulty, status
 * - Client-side validation display
 * - Accessible form labels and error messages
 * - Disabled state support
 * 
 * Validates Requirements: 5.1, 8.1, 9.1
 * 
 * Usage:
 * ```tsx
 * import { RoadmapFormFields } from '@/components/roadmap/RoadmapFormFields';
 * 
 * function MyForm() {
 *   const [formData, setFormData] = useState({
 *     slug: '',
 *     title: '',
 *     description: '',
 *     category: 'role',
 *     difficulty: 'beginner',
 *     status: 'draft',
 *   });
 *   const [errors, setErrors] = useState({});
 * 
 *   return (
 *     <RoadmapFormFields
 *       value={formData}
 *       onChange={setFormData}
 *       errors={errors}
 *       disabled={false}
 *     />
 *   );
 * }
 * ```
 */
'use client';

import { Input } from '@/components/ui/input';
import {
    ROADMAP_CATEGORY_VALUES,
    ROADMAP_DIFFICULTY_VALUES,
    ROADMAP_STATUS_VALUES,
    type RoadmapCategory,
    type RoadmapDifficulty,
    type RoadmapStatus,
} from '@viztechstack/types';
import type {
    RoadmapFormData,
    RoadmapFormErrors,
    RoadmapFormFieldsProps,
} from '../types';

export function RoadmapFormFields({
    value,
    onChange,
    errors = {},
    disabled = false,
}: RoadmapFormFieldsProps) {
    const handleInputChange = (field: keyof RoadmapFormData, fieldValue: string) => {
        onChange({ ...value, [field]: fieldValue });
    };

    return (
        <div className="space-y-6">
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
                    value={value.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="frontend-developer"
                    aria-invalid={!!errors.slug}
                    disabled={disabled}
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
                    value={value.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Frontend Developer Roadmap"
                    aria-invalid={!!errors.title}
                    disabled={disabled}
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
                    value={value.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="A comprehensive guide to becoming a frontend developer..."
                    rows={4}
                    aria-invalid={!!errors.description}
                    disabled={disabled}
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
                    value={value.category}
                    onChange={(e) => handleInputChange('category', e.target.value as RoadmapCategory)}
                    disabled={disabled}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    {ROADMAP_CATEGORY_VALUES.map((category) => (
                        <option key={category} value={category}>
                            {category === 'best-practice' ? 'Best Practice' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                    ))}
                </select>
                {errors.category && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errors.category}
                    </p>
                )}
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
                    value={value.difficulty}
                    onChange={(e) => handleInputChange('difficulty', e.target.value as RoadmapDifficulty)}
                    disabled={disabled}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    {ROADMAP_DIFFICULTY_VALUES.map((difficulty) => (
                        <option key={difficulty} value={difficulty}>
                            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </option>
                    ))}
                </select>
                {errors.difficulty && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errors.difficulty}
                    </p>
                )}
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
                    value={value.status}
                    onChange={(e) => handleInputChange('status', e.target.value as RoadmapStatus)}
                    disabled={disabled}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    {ROADMAP_STATUS_VALUES.map((status) => (
                        <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                    ))}
                </select>
                {errors.status && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {errors.status}
                    </p>
                )}
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Visibility: public (all users), draft (admins only), private (admins only)
                </p>
            </div>
        </div>
    );
}

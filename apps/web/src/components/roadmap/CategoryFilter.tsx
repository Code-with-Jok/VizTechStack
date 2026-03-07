'use client';

import { RoadmapCategory } from '@viztechstack/graphql-generated';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { ChevronDown } from 'lucide-react';

interface CategoryFilterProps {
    selectedCategory: RoadmapCategory | null;
    onCategoryChange: (category: RoadmapCategory | null) => void;
}

const categoryOptions: Array<{ value: RoadmapCategory | null; label: string }> = [
    { value: null, label: 'All Categories' },
    { value: 'ROLE' as RoadmapCategory, label: 'Role' },
    { value: 'SKILL' as RoadmapCategory, label: 'Skill' },
    { value: 'BEST_PRACTICE' as RoadmapCategory, label: 'Best Practice' },
];

export function CategoryFilter({
    selectedCategory,
    onCategoryChange,
}: CategoryFilterProps) {
    const selectedLabel =
        categoryOptions.find((opt) => opt.value === selectedCategory)?.label ||
        'All Categories';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[180px] justify-between">
                    {selectedLabel}
                    <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[180px]">
                {categoryOptions.map((option) => (
                    <DropdownMenuItem
                        key={option.value ?? 'all'}
                        onClick={() => onCategoryChange(option.value)}
                        className={
                            selectedCategory === option.value
                                ? 'bg-gray-100 font-medium'
                                : ''
                        }
                    >
                        {option.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

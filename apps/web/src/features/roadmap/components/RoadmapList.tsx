'use client';

import { useState } from 'react';
import { RoadmapCategory } from '@viztechstack/graphql-generated';
import { RoadmapCard } from './RoadmapCard';
import { CategoryFilter } from './CategoryFilter';
import { Button } from '@/components/ui/button';
import { useRoadmaps } from '../hooks';

interface RoadmapListProps {
    initialCategory?: RoadmapCategory | null;
}

export function RoadmapList({ initialCategory = null }: RoadmapListProps) {
    const [selectedCategory, setSelectedCategory] = useState<RoadmapCategory | null>(
        initialCategory
    );

    const { roadmaps, loading, error, isDone, loadMore } = useRoadmaps({
        category: selectedCategory,
        limit: 24,
    });

    const handleCategoryChange = (category: RoadmapCategory | null) => {
        setSelectedCategory(category);
    };

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">
                        Error loading roadmaps
                    </h3>
                    <p className="text-sm text-gray-600">{error.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Explore Roadmaps</h2>
                <CategoryFilter
                    selectedCategory={selectedCategory}
                    onCategoryChange={handleCategoryChange}
                />
            </div>

            {/* Loading State */}
            {loading && roadmaps.length === 0 && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-sm text-gray-600">Loading roadmaps...</p>
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!loading && roadmaps.length === 0 && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No roadmaps found
                        </h3>
                        <p className="text-sm text-gray-600">
                            {selectedCategory
                                ? `No roadmaps available in the ${selectedCategory.toLowerCase()} category.`
                                : 'No roadmaps available at the moment.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Roadmap Grid */}
            {roadmaps.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {roadmaps.map((roadmap) => (
                            <RoadmapCard key={roadmap.id} roadmap={roadmap} />
                        ))}
                    </div>

                    {/* Load More Button */}
                    {!isDone && (
                        <div className="flex justify-center pt-4">
                            <Button
                                onClick={loadMore}
                                disabled={loading}
                                variant="outline"
                                size="lg"
                            >
                                {loading ? 'Loading...' : 'Load More'}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

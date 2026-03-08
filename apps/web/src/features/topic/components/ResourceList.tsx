/**
 * ResourceList Component
 * 
 * Displays a list of learning resources with icons based on resource type.
 * 
 * Features:
 * - Displays resources with title, URL, and type
 * - Shows appropriate icon for each resource type (article/video/course)
 * - External links open in new tab
 * - Responsive design
 * 
 * Usage:
 * ```tsx
 * import { ResourceList } from '@/features/topic/components/ResourceList';
 * 
 * function TopicPanel() {
 *   const resources = [
 *     { title: "React Docs", url: "https://react.dev", type: "ARTICLE" },
 *     { title: "React Tutorial", url: "https://...", type: "VIDEO" }
 *   ];
 *   return <ResourceList resources={resources} />;
 * }
 * ```
 * 
 * @param resources - Array of learning resources to display
 */
'use client';

import { FileText, Video, BookOpen, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Resource } from '../types';

interface ResourceListProps {
    resources: Resource[];
}

function getResourceIcon(type: Resource['type']) {
    switch (type) {
        case 'ARTICLE':
            return <FileText className="w-4 h-4" />;
        case 'VIDEO':
            return <Video className="w-4 h-4" />;
        case 'COURSE':
            return <BookOpen className="w-4 h-4" />;
        default:
            return <FileText className="w-4 h-4" />;
    }
}

function getResourceTypeBadgeVariant(type: Resource['type']): 'default' | 'secondary' | 'outline' {
    switch (type) {
        case 'ARTICLE':
            return 'secondary';
        case 'VIDEO':
            return 'default';
        case 'COURSE':
            return 'outline';
        default:
            return 'secondary';
    }
}

function formatResourceType(type: Resource['type']): string {
    return type.charAt(0) + type.slice(1).toLowerCase();
}

export function ResourceList({ resources }: ResourceListProps) {
    if (!resources || resources.length === 0) {
        return (
            <div className="text-sm text-gray-500 italic">
                No learning resources available for this topic yet.
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {resources.map((resource, index) => (
                <a
                    key={index}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors group"
                >
                    <div className="flex-shrink-0 mt-0.5 text-gray-600 group-hover:text-gray-900">
                        {getResourceIcon(resource.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                {resource.title}
                            </h4>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                        </div>

                        <div className="mt-1">
                            <Badge variant={getResourceTypeBadgeVariant(resource.type)} className="text-xs">
                                {formatResourceType(resource.type)}
                            </Badge>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
}

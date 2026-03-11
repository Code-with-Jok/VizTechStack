'use client';

/**
 * Test page for roadmap visualization
 * This page demonstrates the visualization with mock data
 */

import React from 'react';
import { RoadmapVisualization } from '@/components/roadmap-visualization';
import { mockGraphData } from '@/lib/mock-data/roadmap-graph';

export default function TestVisualizationPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <h1 className="text-2xl font-bold text-foreground">
                        Roadmap Visualization Test
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Testing visualization with mock Frontend Development roadmap data
                    </p>
                </div>
            </div>

            {/* Visualization container */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="rounded-xl border border-border overflow-hidden shadow-lg">
                    <div className="h-[calc(100vh-200px)]">
                        <RoadmapVisualization
                            graphData={mockGraphData}
                            onNodeClick={(nodeId) => {
                                console.log('Node clicked:', nodeId);
                            }}
                            onEdgeClick={(edgeId) => {
                                console.log('Edge clicked:', edgeId);
                            }}
                        />
                    </div>
                </div>

                {/* Instructions */}
                <div className="mt-6 p-6 bg-card rounded-xl border border-border">
                    <h2 className="text-lg font-semibold text-foreground mb-3">
                        Hướng dẫn sử dụng
                    </h2>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>
                                <strong>Zoom:</strong> Sử dụng nút + / - hoặc cuộn chuột
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>
                                <strong>Pan:</strong> Click và kéo trên canvas
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>
                                <strong>Fit View:</strong> Click nút fit-view để xem toàn bộ roadmap
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>
                                <strong>Layout:</strong> Chọn layout khác nhau từ dropdown (Phân cấp, Lực hút, Vòng tròn, Lưới)
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>
                                <strong>Node Colors:</strong> Xanh lá (Beginner), Vàng cam (Intermediate), Đỏ (Advanced)
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

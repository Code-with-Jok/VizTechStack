/**
 * ValidationErrorHandler - Handle validation errors gracefully
 * 
 * Validates: Requirement 2.5
 */

import { ValidationResult, GraphValidationResult, OrphanedNodeResult, CircularDependencyResult } from './graph-validator';
import { RoadmapNode, RoadmapEdge, GraphData } from '../types';

export interface ValidationErrorSuggestion {
    type: 'fix' | 'warning' | 'info';
    message: string;
    action?: string;
    autoFixable?: boolean;
}

export interface ValidationErrorReport {
    errorId: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'structure' | 'content' | 'performance' | 'accessibility';
    title: string;
    description: string;
    affectedElements: string[];
    suggestions: ValidationErrorSuggestion[];
    debugInfo?: Record<string, any>;
}

export interface ValidationErrorSummary {
    totalErrors: number;
    totalWarnings: number;
    criticalIssues: number;
    reports: ValidationErrorReport[];
    canProceed: boolean;
    recommendedActions: string[];
}

export interface ValidationErrorHandlerOptions {
    includeDebugInfo?: boolean;
    generateSuggestions?: boolean;
    autoFixEnabled?: boolean;
    strictMode?: boolean;
}

export class ValidationErrorHandler {
    private options: ValidationErrorHandlerOptions;

    constructor(options: ValidationErrorHandlerOptions = {}) {
        this.options = {
            includeDebugInfo: false,
            generateSuggestions: true,
            autoFixEnabled: false,
            strictMode: false,
            ...options
        };
    }

    /**
     * Process validation results and generate comprehensive error report
     */
    processValidationResults(result: GraphValidationResult): ValidationErrorSummary {
        const reports: ValidationErrorReport[] = [];

        // Process edge validation errors
        if (!result.edgeValidation.isValid) {
            reports.push(...this.processEdgeValidationErrors(result.edgeValidation));
        }

        // Process orphaned node issues
        if (result.orphanedNodeValidation.hasOrphanedNodes) {
            reports.push(...this.processOrphanedNodeErrors(result.orphanedNodeValidation));
        }

        // Process circular dependency issues
        if (result.circularDependencyValidation.hasCircularDependencies) {
            reports.push(...this.processCircularDependencyErrors(result.circularDependencyValidation));
        }

        // Generate summary
        const summary = this.generateErrorSummary(reports, result);

        return summary;
    }

    /**
     * Process edge validation errors
     */
    private processEdgeValidationErrors(edgeValidation: ValidationResult): ValidationErrorReport[] {
        const reports: ValidationErrorReport[] = [];

        // Group errors by type
        const errorsByType = this.groupErrorsByType(edgeValidation.errors);

        for (const [errorType, errors] of Object.entries(errorsByType)) {
            const report = this.createEdgeErrorReport(errorType, errors);
            if (report) {
                reports.push(report);
            }
        }

        // Process warnings
        if (edgeValidation.warnings.length > 0) {
            const warningReport = this.createEdgeWarningReport(edgeValidation.warnings);
            reports.push(warningReport);
        }

        return reports;
    }

    /**
     * Process orphaned node errors
     */
    private processOrphanedNodeErrors(orphanedResult: OrphanedNodeResult): ValidationErrorReport[] {
        const reports: ValidationErrorReport[] = [];

        // Group by severity
        const criticalOrphans = orphanedResult.details.filter(d => d.severity === 'error');
        const warningOrphans = orphanedResult.details.filter(d => d.severity === 'warning');

        if (criticalOrphans.length > 0) {
            reports.push(this.createOrphanedNodeReport(criticalOrphans, 'critical'));
        }

        if (warningOrphans.length > 0) {
            reports.push(this.createOrphanedNodeReport(warningOrphans, 'warning'));
        }

        return reports;
    }

    /**
     * Process circular dependency errors
     */
    private processCircularDependencyErrors(circularResult: CircularDependencyResult): ValidationErrorReport[] {
        const reports: ValidationErrorReport[] = [];

        // Group cycles by type
        const directCycles = circularResult.cycles.filter(c => c.type === 'direct');
        const indirectCycles = circularResult.cycles.filter(c => c.type === 'indirect');

        if (directCycles.length > 0) {
            reports.push(this.createCircularDependencyReport(directCycles, 'direct'));
        }

        if (indirectCycles.length > 0) {
            reports.push(this.createCircularDependencyReport(indirectCycles, 'indirect'));
        }

        return reports;
    }

    /**
     * Create edge error report
     */
    private createEdgeErrorReport(errorType: string, errors: string[]): ValidationErrorReport | null {
        const errorId = `edge-${errorType.toLowerCase().replace(/\s+/g, '-')}`;

        let severity: ValidationErrorReport['severity'] = 'medium';
        let title = 'Edge Validation Error';
        let description = 'Có lỗi trong validation edges';
        let suggestions: ValidationErrorSuggestion[] = [];

        if (errorType.includes('non-existent')) {
            severity = 'critical';
            title = 'Edge References Non-existent Nodes';
            description = 'Một số edges tham chiếu đến nodes không tồn tại trong graph. Điều này có thể gây crash khi render visualization.';
            suggestions = [
                {
                    type: 'fix',
                    message: 'Kiểm tra và sửa các node IDs trong edges',
                    action: 'Verify node IDs exist in the graph',
                    autoFixable: false
                },
                {
                    type: 'fix',
                    message: 'Loại bỏ các edges không hợp lệ',
                    action: 'Remove invalid edges',
                    autoFixable: true
                }
            ];
        } else if (errorType.includes('self-referencing')) {
            severity = 'high';
            title = 'Self-referencing Edges Detected';
            description = 'Phát hiện edges tự tham chiếu (source = target). Điều này có thể gây vấn đề trong một số layout algorithms.';
            suggestions = [
                {
                    type: 'fix',
                    message: 'Loại bỏ self-referencing edges',
                    action: 'Remove self-referencing edges',
                    autoFixable: true
                },
                {
                    type: 'warning',
                    message: 'Nếu cần thiết, có thể cho phép trong force-directed layouts',
                    action: 'Consider layout compatibility'
                }
            ];
        } else if (errorType.includes('duplicate')) {
            severity = 'medium';
            title = 'Duplicate Edges Found';
            description = 'Phát hiện edges trùng lặp giữa cùng một cặp nodes. Điều này có thể gây confusion trong visualization.';
            suggestions = [
                {
                    type: 'fix',
                    message: 'Merge duplicate edges hoặc loại bỏ duplicates',
                    action: 'Merge or remove duplicate edges',
                    autoFixable: true
                }
            ];
        }

        return {
            errorId,
            severity,
            category: 'structure',
            title,
            description,
            affectedElements: this.extractAffectedElements(errors),
            suggestions,
            debugInfo: this.options.includeDebugInfo ? { errors, errorType } : undefined
        };
    }

    /**
     * Create edge warning report
     */
    private createEdgeWarningReport(warnings: string[]): ValidationErrorReport {
        return {
            errorId: 'edge-warnings',
            severity: 'low',
            category: 'content',
            title: 'Edge Validation Warnings',
            description: `Phát hiện ${warnings.length} warnings trong edge validation. Những issues này không critical nhưng nên được xem xét.`,
            affectedElements: this.extractAffectedElements(warnings),
            suggestions: [
                {
                    type: 'info',
                    message: 'Review warnings để improve graph quality',
                    action: 'Review and address warnings'
                }
            ],
            debugInfo: this.options.includeDebugInfo ? { warnings } : undefined
        };
    }

    /**
     * Create orphaned node report
     */
    private createOrphanedNodeReport(
        orphanedNodes: Array<{ nodeId: string; nodeTitle: string; reason: string; severity: string }>,
        reportType: 'critical' | 'warning'
    ): ValidationErrorReport {
        const severity = reportType === 'critical' ? 'critical' : 'medium';
        const title = reportType === 'critical' ? 'Isolated Nodes Detected' : 'Potential Orphaned Nodes';

        let description: string;
        let suggestions: ValidationErrorSuggestion[];

        if (reportType === 'critical') {
            description = `Phát hiện ${orphanedNodes.length} nodes hoàn toàn isolated (không có connections). Những nodes này sẽ không hiển thị đúng trong visualization.`;
            suggestions = [
                {
                    type: 'fix',
                    message: 'Thêm edges để connect isolated nodes với graph',
                    action: 'Add connecting edges',
                    autoFixable: false
                },
                {
                    type: 'fix',
                    message: 'Loại bỏ isolated nodes nếu không cần thiết',
                    action: 'Remove unnecessary nodes',
                    autoFixable: true
                }
            ];
        } else {
            description = `Phát hiện ${orphanedNodes.length} nodes có thể là orphaned. Đây có thể là root hoặc leaf nodes hợp lệ.`;
            suggestions = [
                {
                    type: 'info',
                    message: 'Verify xem đây có phải là root/leaf nodes hợp lệ không',
                    action: 'Verify node roles'
                },
                {
                    type: 'warning',
                    message: 'Consider thêm connections nếu cần thiết',
                    action: 'Add connections if needed'
                }
            ];
        }

        return {
            errorId: `orphaned-nodes-${reportType}`,
            severity,
            category: 'structure',
            title,
            description,
            affectedElements: orphanedNodes.map(n => n.nodeId),
            suggestions,
            debugInfo: this.options.includeDebugInfo ? { orphanedNodes } : undefined
        };
    }

    /**
     * Create circular dependency report
     */
    private createCircularDependencyReport(
        cycles: Array<{ path: string[]; length: number; strength: number; type: string }>,
        cycleType: 'direct' | 'indirect'
    ): ValidationErrorReport {
        const severity = cycleType === 'direct' ? 'critical' : 'high';
        const title = cycleType === 'direct' ? 'Direct Circular Dependencies' : 'Indirect Circular Dependencies';

        const description = cycleType === 'direct'
            ? `Phát hiện ${cycles.length} direct circular dependencies. Điều này sẽ gây vấn đề trong hierarchical layouts.`
            : `Phát hiện ${cycles.length} indirect circular dependencies. Có thể gây confusion trong navigation.`;

        const suggestions: ValidationErrorSuggestion[] = [
            {
                type: 'fix',
                message: 'Restructure graph để loại bỏ circular dependencies',
                action: 'Remove circular dependencies',
                autoFixable: false
            }
        ];

        if (cycleType === 'indirect') {
            suggestions.push({
                type: 'warning',
                message: 'Consider sử dụng force-directed layout thay vì hierarchical',
                action: 'Use different layout algorithm'
            });
        }

        const affectedElements = cycles.reduce((acc, cycle) => {
            acc.push(...cycle.path);
            return acc;
        }, [] as string[]);

        return {
            errorId: `circular-deps-${cycleType}`,
            severity,
            category: 'structure',
            title,
            description,
            affectedElements: [...new Set(affectedElements)], // Remove duplicates
            suggestions,
            debugInfo: this.options.includeDebugInfo ? { cycles } : undefined
        };
    }

    /**
     * Generate error summary
     */
    private generateErrorSummary(reports: ValidationErrorReport[], result: GraphValidationResult): ValidationErrorSummary {
        const criticalIssues = reports.filter(r => r.severity === 'critical').length;
        const totalErrors = reports.filter(r => r.severity === 'critical' || r.severity === 'high').length;
        const totalWarnings = reports.filter(r => r.severity === 'medium' || r.severity === 'low').length;

        // Determine if can proceed
        const canProceed = criticalIssues === 0 && (!this.options.strictMode || totalErrors === 0);

        // Generate recommended actions
        const recommendedActions = this.generateRecommendedActions(reports, canProceed);

        return {
            totalErrors,
            totalWarnings,
            criticalIssues,
            reports,
            canProceed,
            recommendedActions
        };
    }

    /**
     * Generate recommended actions
     */
    private generateRecommendedActions(reports: ValidationErrorReport[], canProceed: boolean): string[] {
        const actions: string[] = [];

        if (!canProceed) {
            actions.push('Sửa tất cả critical issues trước khi tiếp tục');
        }

        // Count issues by category
        const structureIssues = reports.filter(r => r.category === 'structure').length;
        const contentIssues = reports.filter(r => r.category === 'content').length;

        if (structureIssues > 0) {
            actions.push('Review và fix graph structure issues');
        }

        if (contentIssues > 0) {
            actions.push('Improve content quality và consistency');
        }

        // Auto-fixable suggestions
        const autoFixableCount = reports.reduce((count, report) => {
            return count + report.suggestions.filter(s => s.autoFixable).length;
        }, 0);

        if (autoFixableCount > 0) {
            actions.push(`${autoFixableCount} issues có thể được auto-fixed`);
        }

        if (actions.length === 0) {
            actions.push('Graph validation passed - ready to proceed');
        }

        return actions;
    }

    /**
     * Group errors by type
     */
    private groupErrorsByType(errors: string[]): Record<string, string[]> {
        const grouped: Record<string, string[]> = {};

        for (const error of errors) {
            let type = 'other';

            if (error.includes('non-existent') || error.includes('does not exist')) {
                type = 'non-existent';
            } else if (error.includes('self-referencing')) {
                type = 'self-referencing';
            } else if (error.includes('duplicate')) {
                type = 'duplicate';
            } else if (error.includes('invalid')) {
                type = 'invalid';
            }

            if (!grouped[type]) {
                grouped[type] = [];
            }
            grouped[type].push(error);
        }

        return grouped;
    }

    /**
     * Extract affected elements from error messages
     */
    private extractAffectedElements(errors: string[]): string[] {
        const elements: string[] = [];

        for (const error of errors) {
            // Extract node/edge IDs from error messages
            const matches = error.match(/\b[a-zA-Z0-9-_]+\b/g);
            if (matches) {
                elements.push(...matches.filter(match =>
                    match.length > 2 && // Filter out short matches
                    !['Edge', 'Node', 'has', 'the', 'and', 'for'].includes(match)
                ));
            }
        }

        return [...new Set(elements)]; // Remove duplicates
    }

    /**
     * Generate detailed error message for logging
     */
    generateDetailedErrorMessage(summary: ValidationErrorSummary): string {
        const lines: string[] = [];

        lines.push('=== GRAPH VALIDATION REPORT ===');
        lines.push(`Total Errors: ${summary.totalErrors}`);
        lines.push(`Total Warnings: ${summary.totalWarnings}`);
        lines.push(`Critical Issues: ${summary.criticalIssues}`);
        lines.push(`Can Proceed: ${summary.canProceed ? 'YES' : 'NO'}`);
        lines.push('');

        if (summary.recommendedActions.length > 0) {
            lines.push('RECOMMENDED ACTIONS:');
            summary.recommendedActions.forEach(action => {
                lines.push(`  - ${action}`);
            });
            lines.push('');
        }

        if (summary.reports.length > 0) {
            lines.push('DETAILED ISSUES:');
            summary.reports.forEach((report, index) => {
                lines.push(`${index + 1}. ${report.title} (${report.severity.toUpperCase()})`);
                lines.push(`   ${report.description}`);

                if (report.affectedElements.length > 0) {
                    lines.push(`   Affected: ${report.affectedElements.slice(0, 5).join(', ')}${report.affectedElements.length > 5 ? '...' : ''}`);
                }

                if (report.suggestions.length > 0) {
                    lines.push('   Suggestions:');
                    report.suggestions.forEach(suggestion => {
                        const icon = suggestion.type === 'fix' ? '🔧' : suggestion.type === 'warning' ? '⚠️' : 'ℹ️';
                        lines.push(`     ${icon} ${suggestion.message}`);
                    });
                }
                lines.push('');
            });
        }

        return lines.join('\n');
    }

    /**
     * Generate user-friendly error message
     */
    generateUserFriendlyMessage(summary: ValidationErrorSummary): string {
        if (summary.canProceed && summary.totalErrors === 0 && summary.totalWarnings === 0) {
            return 'Graph validation passed successfully! ✅';
        }

        const lines: string[] = [];

        if (summary.criticalIssues > 0) {
            lines.push(`❌ Phát hiện ${summary.criticalIssues} critical issues cần được sửa trước khi tiếp tục.`);
        } else if (summary.totalErrors > 0) {
            lines.push(`⚠️ Phát hiện ${summary.totalErrors} errors cần được xem xét.`);
        }

        if (summary.totalWarnings > 0) {
            lines.push(`💡 Có ${summary.totalWarnings} warnings có thể improve graph quality.`);
        }

        if (summary.canProceed) {
            lines.push('✅ Graph có thể được sử dụng nhưng nên fix các issues để có trải nghiệm tốt hơn.');
        }

        return lines.join(' ');
    }

    /**
     * Suggest fixes for common validation issues
     */
    suggestFixes(summary: ValidationErrorSummary): ValidationErrorSuggestion[] {
        const allSuggestions: ValidationErrorSuggestion[] = [];

        summary.reports.forEach(report => {
            allSuggestions.push(...report.suggestions);
        });

        // Remove duplicates and prioritize
        const uniqueSuggestions = allSuggestions.filter((suggestion, index, array) => {
            return array.findIndex(s => s.message === suggestion.message) === index;
        });

        // Sort by priority: fix > warning > info
        return uniqueSuggestions.sort((a, b) => {
            const priority = { fix: 3, warning: 2, info: 1 };
            return priority[b.type] - priority[a.type];
        });
    }

    /**
     * Check if validation issues can be auto-fixed
     */
    canAutoFix(summary: ValidationErrorSummary): boolean {
        if (!this.options.autoFixEnabled) {
            return false;
        }

        const autoFixableIssues = summary.reports.filter(report =>
            report.suggestions.some(s => s.autoFixable)
        );

        return autoFixableIssues.length > 0;
    }

    /**
     * Get validation health score (0-100)
     */
    getHealthScore(summary: ValidationErrorSummary): number {
        const totalIssues = summary.totalErrors + summary.totalWarnings;

        if (totalIssues === 0) {
            return 100;
        }

        // Weight critical issues more heavily
        const weightedScore = (summary.criticalIssues * 3) + (summary.totalErrors * 2) + summary.totalWarnings;

        // Assume max reasonable issues is 20 for scoring
        const maxReasonableIssues = 20;
        const healthScore = Math.max(0, 100 - (weightedScore / maxReasonableIssues) * 100);

        return Math.round(healthScore);
    }
}

/**
 * Factory function to create ValidationErrorHandler
 */
export function createValidationErrorHandler(options?: ValidationErrorHandlerOptions): ValidationErrorHandler {
    return new ValidationErrorHandler(options);
}

/**
 * Utility function to process validation results
 */
export function processValidationResults(
    result: GraphValidationResult,
    options?: ValidationErrorHandlerOptions
): ValidationErrorSummary {
    const handler = createValidationErrorHandler(options);
    return handler.processValidationResults(result);
}

/**
 * Utility function to generate error report
 */
export function generateValidationReport(
    result: GraphValidationResult,
    options?: ValidationErrorHandlerOptions
): string {
    const handler = createValidationErrorHandler(options);
    const summary = handler.processValidationResults(result);
    return handler.generateDetailedErrorMessage(summary);
}

/**
 * Utility function to check if graph can proceed
 */
export function canProceedWithValidation(
    result: GraphValidationResult,
    strictMode: boolean = false
): boolean {
    const handler = createValidationErrorHandler({ strictMode });
    const summary = handler.processValidationResults(result);
    return summary.canProceed;
}
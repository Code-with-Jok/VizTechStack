import {
  ROADMAP_CATEGORY_VALUES,
  ROADMAP_DIFFICULTY_VALUES,
  ROADMAP_STATUS_VALUES,
  type RoadmapCategory,
  type RoadmapDifficulty,
  type RoadmapStatus,
} from '@viztechstack/types';
import {
  RoadmapValidationDomainError,
  RoadmapParsingDomainError,
} from '../errors/roadmap-domain-error';

/**
 * Domain policy for validating roadmap input data
 * Validates slug format, graph data structure, and enum values
 */
export class RoadmapInputPolicy {
  private static readonly SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  /**
   * Validates slug format (kebab-case, alphanumeric with hyphens)
   * @param slug - The slug to validate
   * @throws RoadmapValidationDomainError if slug format is invalid
   */
  validateSlug(slug: string): void {
    if (!slug || slug.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'Slug is required and cannot be empty',
        'validateSlug',
      );
    }

    if (!RoadmapInputPolicy.SLUG_REGEX.test(slug)) {
      throw new RoadmapValidationDomainError(
        'Slug must be in kebab-case format (lowercase alphanumeric characters separated by hyphens)',
        'validateSlug',
      );
    }
  }

  /**
   * Validates graph data JSON structure
   * @param nodesJson - JSON string containing node data
   * @param edgesJson - JSON string containing edge data
   * @throws RoadmapParsingDomainError if JSON is invalid
   * @throws RoadmapValidationDomainError if parsed data is not an array
   */
  validateGraphData(nodesJson: string, edgesJson: string): void {
    // Validate nodesJson
    let parsedNodes: unknown;
    try {
      parsedNodes = JSON.parse(nodesJson);
    } catch (error) {
      throw new RoadmapParsingDomainError(
        `Failed to parse nodesJson: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
        'validateGraphData',
      );
    }

    if (!Array.isArray(parsedNodes)) {
      throw new RoadmapValidationDomainError(
        'nodesJson must be a JSON array',
        'validateGraphData',
      );
    }

    // Validate edgesJson
    let parsedEdges: unknown;
    try {
      parsedEdges = JSON.parse(edgesJson);
    } catch (error) {
      throw new RoadmapParsingDomainError(
        `Failed to parse edgesJson: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
        'validateGraphData',
      );
    }

    if (!Array.isArray(parsedEdges)) {
      throw new RoadmapValidationDomainError(
        'edgesJson must be a JSON array',
        'validateGraphData',
      );
    }
  }

  /**
   * Validates category value
   * @param category - The category to validate
   * @throws RoadmapValidationDomainError if category is invalid
   */
  validateCategory(category: string): asserts category is RoadmapCategory {
    if (!ROADMAP_CATEGORY_VALUES.includes(category as RoadmapCategory)) {
      throw new RoadmapValidationDomainError(
        `Invalid category: must be one of ${ROADMAP_CATEGORY_VALUES.join(', ')}`,
        'validateCategory',
      );
    }
  }

  /**
   * Validates difficulty value
   * @param difficulty - The difficulty to validate
   * @throws RoadmapValidationDomainError if difficulty is invalid
   */
  validateDifficulty(
    difficulty: string,
  ): asserts difficulty is RoadmapDifficulty {
    if (!ROADMAP_DIFFICULTY_VALUES.includes(difficulty as RoadmapDifficulty)) {
      throw new RoadmapValidationDomainError(
        `Invalid difficulty: must be one of ${ROADMAP_DIFFICULTY_VALUES.join(', ')}`,
        'validateDifficulty',
      );
    }
  }

  /**
   * Validates status value
   * @param status - The status to validate
   * @throws RoadmapValidationDomainError if status is invalid
   */
  validateStatus(status: string): asserts status is RoadmapStatus {
    if (!ROADMAP_STATUS_VALUES.includes(status as RoadmapStatus)) {
      throw new RoadmapValidationDomainError(
        `Invalid status: must be one of ${ROADMAP_STATUS_VALUES.join(', ')}`,
        'validateStatus',
      );
    }
  }
}

/**
 * Standalone validation function for roadmap slug
 * @param slug - The slug to validate
 * @param operation - The operation context for error reporting
 * @throws RoadmapValidationDomainError if slug is invalid
 */
export function validateRoadmapSlug(slug: string, operation: string): void {
  const policy = new RoadmapInputPolicy();
  policy.validateSlug(slug);
}

/**
 * Standalone validation function for create roadmap input
 * Validates all required fields for roadmap creation
 * @param input - The create roadmap command input
 * @throws RoadmapValidationDomainError if any field is invalid
 */
export function validateCreateRoadmapInput(input: {
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  nodesJson: string;
  edgesJson: string;
  topicCount: number;
  status: string;
}): asserts input is {
  slug: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  difficulty: RoadmapDifficulty;
  nodesJson: string;
  edgesJson: string;
  topicCount: number;
  status: RoadmapStatus;
} {
  const policy: RoadmapInputPolicy = new RoadmapInputPolicy();

  // Validate slug
  policy.validateSlug(input.slug);

  // Validate required string fields
  if (!input.title || input.title.trim().length === 0) {
    throw new RoadmapValidationDomainError(
      'Title is required and cannot be empty',
      'validateCreateRoadmapInput',
    );
  }

  if (!input.description || input.description.trim().length === 0) {
    throw new RoadmapValidationDomainError(
      'Description is required and cannot be empty',
      'validateCreateRoadmapInput',
    );
  }

  // Validate enum fields
  policy.validateCategory(input.category);
  policy.validateDifficulty(input.difficulty);
  policy.validateStatus(input.status);

  // Validate graph data
  policy.validateGraphData(input.nodesJson, input.edgesJson);

  // Validate topicCount
  if (!Number.isInteger(input.topicCount) || input.topicCount < 0) {
    throw new RoadmapValidationDomainError(
      'Topic count must be a non-negative integer',
      'validateCreateRoadmapInput',
    );
  }
}

/**
 * Standalone validation function for update roadmap input
 * Validates provided fields for roadmap update
 * @param input - The update roadmap command input
 * @throws RoadmapValidationDomainError if any field is invalid
 */
export function validateUpdateRoadmapInput(input: {
  slug?: string;
  title?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  nodesJson?: string;
  edgesJson?: string;
  topicCount?: number;
  status?: string;
}): void {
  const policy: RoadmapInputPolicy = new RoadmapInputPolicy();

  // Validate slug if provided
  if (input.slug !== undefined) {
    policy.validateSlug(input.slug);
  }

  // Validate title if provided
  if (input.title !== undefined && input.title.trim().length === 0) {
    throw new RoadmapValidationDomainError(
      'Title cannot be empty',
      'validateUpdateRoadmapInput',
    );
  }

  // Validate description if provided
  if (
    input.description !== undefined &&
    input.description.trim().length === 0
  ) {
    throw new RoadmapValidationDomainError(
      'Description cannot be empty',
      'validateUpdateRoadmapInput',
    );
  }

  // Validate enum fields if provided
  if (input.category !== undefined) {
    policy.validateCategory(input.category);
  }

  if (input.difficulty !== undefined) {
    policy.validateDifficulty(input.difficulty);
  }

  if (input.status !== undefined) {
    policy.validateStatus(input.status);
  }

  // Validate graph data if both are provided
  if (input.nodesJson !== undefined && input.edgesJson !== undefined) {
    policy.validateGraphData(input.nodesJson, input.edgesJson);
  } else if (input.nodesJson !== undefined || input.edgesJson !== undefined) {
    throw new RoadmapValidationDomainError(
      'Both nodesJson and edgesJson must be provided together',
      'validateUpdateRoadmapInput',
    );
  }

  // Validate topicCount if provided
  if (input.topicCount !== undefined) {
    if (!Number.isInteger(input.topicCount) || input.topicCount < 0) {
      throw new RoadmapValidationDomainError(
        'Topic count must be a non-negative integer',
        'validateUpdateRoadmapInput',
      );
    }
  }
}

import { RoadmapValidationDomainError } from '../errors/roadmap-domain-error';

const ROADMAP_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface CreateRoadmapPolicyInput {
  slug: string;
  title: string;
  description: string;
  topicCount: number;
  nodesJson: string;
  edgesJson: string;
}

export function validateCreateRoadmapInput(
  input: CreateRoadmapPolicyInput,
): void {
  if (!ROADMAP_SLUG_REGEX.test(input.slug)) {
    throw new RoadmapValidationDomainError(
      'Slug must be kebab-case and contain only lowercase letters, numbers, and hyphens.',
      'createRoadmap',
    );
  }

  if (input.title.trim().length === 0) {
    throw new RoadmapValidationDomainError(
      'Title must not be empty.',
      'createRoadmap',
    );
  }

  if (input.description.trim().length === 0) {
    throw new RoadmapValidationDomainError(
      'Description must not be empty.',
      'createRoadmap',
    );
  }

  if (input.topicCount < 0) {
    throw new RoadmapValidationDomainError(
      'Topic count must be a non-negative number.',
      'createRoadmap',
    );
  }

  assertJsonArray(input.nodesJson, 'nodesJson');
  assertJsonArray(input.edgesJson, 'edgesJson');
}

export function validateRoadmapSlug(slug: string, operation: string): void {
  if (!ROADMAP_SLUG_REGEX.test(slug)) {
    throw new RoadmapValidationDomainError(
      'Slug must be kebab-case and contain only lowercase letters, numbers, and hyphens.',
      operation,
    );
  }
}

function assertJsonArray(rawValue: string, fieldName: string): void {
  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (!Array.isArray(parsed)) {
      throw new Error('Expected JSON array.');
    }
  } catch {
    throw new RoadmapValidationDomainError(
      `${fieldName} must be a valid JSON array string.`,
      'createRoadmap',
    );
  }
}

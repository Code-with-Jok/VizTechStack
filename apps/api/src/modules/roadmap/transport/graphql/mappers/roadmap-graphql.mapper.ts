import { CreateRoadmapCommand } from '../../../application/commands/create-roadmap.command';
import {
  RoadmapCategory as DomainRoadmapCategory,
  RoadmapDifficulty as DomainRoadmapDifficulty,
  RoadmapEntity,
  RoadmapStatus as DomainRoadmapStatus,
} from '../../../domain/entities/roadmap.entity';
import {
  CreateRoadmapInput,
  Roadmap,
  RoadmapCategory,
  RoadmapDifficulty,
  RoadmapStatus,
} from '../schemas/roadmap.schema';

export function mapRoadmapEntityToGraphql(entity: RoadmapEntity): Roadmap {
  return {
    _id: entity.id,
    slug: entity.slug,
    title: entity.title,
    description: entity.description,
    category: mapDomainCategoryToGraphql(entity.category),
    difficulty: mapDomainDifficultyToGraphql(entity.difficulty),
    nodesJson: entity.nodesJson,
    edgesJson: entity.edgesJson,
    topicCount: entity.topicCount,
    status: mapDomainStatusToGraphql(entity.status),
  };
}

export function mapCategoryInputToDomain(
  category?: RoadmapCategory,
): DomainRoadmapCategory | undefined {
  if (!category) {
    return undefined;
  }

  switch (category) {
    case RoadmapCategory.ROLE:
      return 'role';
    case RoadmapCategory.SKILL:
      return 'skill';
    case RoadmapCategory.BEST_PRACTICE:
      return 'best-practice';
  }
}

export function mapCreateRoadmapInputToCommand(
  input: CreateRoadmapInput,
): CreateRoadmapCommand {
  return {
    slug: input.slug,
    title: input.title,
    description: input.description,
    category: mapCategoryInputToDomain(input.category) ?? 'role',
    difficulty: mapDifficultyInputToDomain(input.difficulty),
    nodesJson: input.nodesJson ?? '[]',
    edgesJson: input.edgesJson ?? '[]',
    topicCount: input.topicCount ?? 0,
    status: mapStatusInputToDomain(input.status),
  };
}

function mapDifficultyInputToDomain(
  difficulty: RoadmapDifficulty,
): DomainRoadmapDifficulty {
  switch (difficulty) {
    case RoadmapDifficulty.BEGINNER:
      return 'beginner';
    case RoadmapDifficulty.INTERMEDIATE:
      return 'intermediate';
    case RoadmapDifficulty.ADVANCED:
      return 'advanced';
  }
}

function mapStatusInputToDomain(
  status: RoadmapStatus | undefined,
): DomainRoadmapStatus {
  if (!status) {
    return 'public';
  }

  switch (status) {
    case RoadmapStatus.PUBLIC:
      return 'public';
    case RoadmapStatus.DRAFT:
      return 'draft';
    case RoadmapStatus.PRIVATE:
      return 'private';
  }
}

function mapDomainCategoryToGraphql(
  category: DomainRoadmapCategory,
): RoadmapCategory {
  switch (category) {
    case 'role':
      return RoadmapCategory.ROLE;
    case 'skill':
      return RoadmapCategory.SKILL;
    case 'best-practice':
      return RoadmapCategory.BEST_PRACTICE;
  }
}

function mapDomainDifficultyToGraphql(
  difficulty: DomainRoadmapDifficulty,
): RoadmapDifficulty {
  switch (difficulty) {
    case 'beginner':
      return RoadmapDifficulty.BEGINNER;
    case 'intermediate':
      return RoadmapDifficulty.INTERMEDIATE;
    case 'advanced':
      return RoadmapDifficulty.ADVANCED;
  }
}

function mapDomainStatusToGraphql(status: DomainRoadmapStatus): RoadmapStatus {
  switch (status) {
    case 'public':
      return RoadmapStatus.PUBLIC;
    case 'draft':
      return RoadmapStatus.DRAFT;
    case 'private':
      return RoadmapStatus.PRIVATE;
  }
}

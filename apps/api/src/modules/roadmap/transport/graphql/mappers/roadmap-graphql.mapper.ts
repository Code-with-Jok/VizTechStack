import { CreateRoadmapCommand } from '../../../application/commands/create-roadmap.command';
import { ListRoadmapsQuery } from '../../../application/queries/list-roadmaps.query';
import {
  RoadmapCategory as DomainRoadmapCategory,
  RoadmapDifficulty as DomainRoadmapDifficulty,
  RoadmapEntity,
  RoadmapPageEntity,
  RoadmapStatus as DomainRoadmapStatus,
} from '../../../domain/entities/roadmap.entity';
import {
  CreateRoadmapInput,
  Roadmap,
  RoadmapCategory,
  RoadmapDifficulty,
  RoadmapPage,
  RoadmapPageInput,
  RoadmapStatus,
} from '../schemas/roadmap.schema';

const MAX_ROADMAPS_PAGE_LIMIT = 100;
const MIN_ROADMAPS_PAGE_LIMIT = 1;

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

export function mapRoadmapPageEntityToGraphql(
  entity: RoadmapPageEntity,
): RoadmapPage {
  return {
    items: entity.items.map((item) => mapRoadmapEntityToGraphql(item)),
    nextCursor: entity.nextCursor,
    hasMore: !entity.isDone,
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

export function mapRoadmapPageInputToQuery(
  input?: RoadmapPageInput,
): ListRoadmapsQuery {
  const boundedLimit = Math.max(
    MIN_ROADMAPS_PAGE_LIMIT,
    Math.min(input?.limit ?? 24, MAX_ROADMAPS_PAGE_LIMIT),
  );

  return {
    category: mapCategoryInputToDomain(input?.category),
    cursor: input?.cursor ?? null,
    limit: boundedLimit,
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

  throw new Error(`Unsupported roadmap category: ${String(category)}`);
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

  throw new Error(`Unsupported roadmap difficulty: ${String(difficulty)}`);
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

  throw new Error(`Unsupported roadmap status: ${String(status)}`);
}

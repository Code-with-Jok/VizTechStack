import { CreateRoadmapCommand } from '../../../application/commands/create-roadmap.command';
import { UpdateRoadmapCommand } from '../../../application/commands/update-roadmap.command';
import type {
  CreateRoadmapInput,
  UpdateRoadmapInput,
  RoadmapCategory,
  RoadmapDifficulty,
  RoadmapStatus,
} from '../schemas/roadmap.schema';

/**
 * Maps CreateRoadmapInput to CreateRoadmapCommand
 */
export function mapCreateRoadmapInputToCommand(
  input: CreateRoadmapInput,
): CreateRoadmapCommand {
  return {
    slug: input.slug,
    title: input.title,
    description: input.description,
    category: mapCategoryToDomain(input.category),
    difficulty: mapDifficultyToDomain(input.difficulty),
    nodesJson: JSON.stringify(input.nodes),
    edgesJson: JSON.stringify(input.edges),
    topicCount: input.topicCount,
    status: mapStatusToDomain(input.status),
  };
}

/**
 * Maps UpdateRoadmapInput to UpdateRoadmapCommand
 */
export function mapUpdateRoadmapInputToCommand(
  id: string,
  input: UpdateRoadmapInput,
): UpdateRoadmapCommand {
  return {
    id,
    slug: input.slug,
    title: input.title,
    description: input.description,
    category: input.category ? mapCategoryToDomain(input.category) : undefined,
    difficulty: input.difficulty
      ? mapDifficultyToDomain(input.difficulty)
      : undefined,
    nodesJson: input.nodes ? JSON.stringify(input.nodes) : undefined,
    edgesJson: input.edges ? JSON.stringify(input.edges) : undefined,
    topicCount: input.topicCount,
    status: input.status ? mapStatusToDomain(input.status) : undefined,
  };
}

/**
 * Maps GraphQL RoadmapCategory to domain category
 */
function mapCategoryToDomain(
  category: RoadmapCategory,
): 'role' | 'skill' | 'best-practice' {
  const categoryMap: Record<
    RoadmapCategory,
    'role' | 'skill' | 'best-practice'
  > = {
    role: 'role',
    skill: 'skill',
    'best-practice': 'best-practice',
  };
  return categoryMap[category];
}

/**
 * Maps GraphQL RoadmapDifficulty to domain difficulty
 */
function mapDifficultyToDomain(
  difficulty: RoadmapDifficulty,
): 'beginner' | 'intermediate' | 'advanced' {
  const difficultyMap: Record<
    RoadmapDifficulty,
    'beginner' | 'intermediate' | 'advanced'
  > = {
    beginner: 'beginner',
    intermediate: 'intermediate',
    advanced: 'advanced',
  };
  return difficultyMap[difficulty];
}

/**
 * Maps GraphQL RoadmapStatus to domain status
 */
function mapStatusToDomain(
  status: RoadmapStatus,
): 'public' | 'draft' | 'private' {
  const statusMap: Record<RoadmapStatus, 'public' | 'draft' | 'private'> = {
    public: 'public',
    draft: 'draft',
    private: 'private',
  };
  return statusMap[status];
}

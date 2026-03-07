import {
  RoadmapCategory,
  RoadmapDifficulty,
  RoadmapStatus,
} from '../../domain/entities/roadmap.entity';

export interface UpdateRoadmapCommand {
  id: string;
  slug?: string;
  title?: string;
  description?: string;
  category?: RoadmapCategory;
  difficulty?: RoadmapDifficulty;
  nodesJson?: string;
  edgesJson?: string;
  topicCount?: number;
  status?: RoadmapStatus;
}

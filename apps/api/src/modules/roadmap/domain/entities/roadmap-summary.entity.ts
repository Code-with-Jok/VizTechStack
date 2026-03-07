import type {
  RoadmapCategory,
  RoadmapDifficulty,
  RoadmapStatus,
} from './roadmap.entity';

export interface RoadmapSummaryEntity {
  id: string;
  roadmapId: string;
  slug: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  difficulty: RoadmapDifficulty;
  topicCount: number;
  status: RoadmapStatus;
  createdAt: number;
}

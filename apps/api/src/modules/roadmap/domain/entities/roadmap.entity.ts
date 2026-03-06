import type {
  RoadmapCategory,
  RoadmapDifficulty,
  RoadmapStatus,
} from '@viztechstack/types';

export type { RoadmapCategory, RoadmapDifficulty, RoadmapStatus };

export interface RoadmapEntity {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  difficulty: RoadmapDifficulty;
  nodesJson?: string;
  edgesJson?: string;
  topicCount: number;
  status: RoadmapStatus;
}

export interface RoadmapPageEntity {
  items: RoadmapEntity[];
  nextCursor: string | null;
  isDone: boolean;
}

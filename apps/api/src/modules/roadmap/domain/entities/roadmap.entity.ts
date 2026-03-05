export type RoadmapCategory = 'role' | 'skill' | 'best-practice';

export type RoadmapDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type RoadmapStatus = 'public' | 'draft' | 'private';

export interface RoadmapEntity {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: RoadmapCategory;
  difficulty: RoadmapDifficulty;
  nodesJson: string;
  edgesJson: string;
  topicCount: number;
  status: RoadmapStatus;
}

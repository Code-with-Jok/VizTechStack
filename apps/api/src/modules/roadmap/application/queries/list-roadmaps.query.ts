import {
  RoadmapCategory,
  RoadmapStatus,
} from '../../domain/entities/roadmap.entity';

export interface ListRoadmapsQuery {
  category?: RoadmapCategory;
  status?: RoadmapStatus;
  cursor?: string | null;
  limit?: number;
  isAdmin?: boolean;
}

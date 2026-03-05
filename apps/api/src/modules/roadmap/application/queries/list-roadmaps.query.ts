import { RoadmapCategory } from '../../domain/entities/roadmap.entity';

export interface ListRoadmapsQuery {
  category?: RoadmapCategory;
}

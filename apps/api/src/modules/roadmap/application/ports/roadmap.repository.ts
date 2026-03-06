import { CreateRoadmapCommand } from '../commands/create-roadmap.command';
import {
  RoadmapEntity,
  RoadmapPageEntity,
} from '../../domain/entities/roadmap.entity';
import { GetRoadmapBySlugQuery } from '../queries/get-roadmap-by-slug.query';
import { ListRoadmapsQuery } from '../queries/list-roadmaps.query';

export const ROADMAP_REPOSITORY = Symbol('ROADMAP_REPOSITORY');

export interface RoadmapRepository {
  listRoadmaps(query: ListRoadmapsQuery): Promise<RoadmapPageEntity>;
  getRoadmapBySlug(query: GetRoadmapBySlugQuery): Promise<RoadmapEntity | null>;
  createRoadmap(command: CreateRoadmapCommand): Promise<string>;
}

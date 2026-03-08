import { ResourceEntity } from '../../domain/entities/topic.entity';

export interface CreateTopicCommand {
  roadmapId: string;
  nodeId: string;
  title: string;
  content: string;
  resources: ResourceEntity[];
}

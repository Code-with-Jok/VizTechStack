export type ResourceType = 'article' | 'video' | 'course';

export interface ResourceEntity {
  title: string;
  url: string;
  type: ResourceType;
}

export interface TopicEntity {
  id: string;
  roadmapId: string;
  nodeId: string;
  title: string;
  content: string;
  resources: ResourceEntity[];
}

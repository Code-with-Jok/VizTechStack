export interface NodePosition {
  x: number;
  y: number;
}

export interface NodeData {
  label: string;
  topicId?: string;
  isReusedSkillNode?: boolean;
  originalRoadmapId?: string;
}

export interface NodeEntity {
  id: string;
  type: string;
  position: NodePosition;
  data: NodeData;
}

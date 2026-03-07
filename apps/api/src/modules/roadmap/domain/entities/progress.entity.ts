export type ProgressStatus = 'done' | 'in-progress' | 'skipped';

export interface ProgressEntity {
  id: string;
  userId: string;
  roadmapId: string;
  nodeId: string;
  status: ProgressStatus;
}

import { ProgressStatus } from '../../domain/entities/progress.entity';

export interface UpdateProgressCommand {
  userId: string;
  roadmapId: string;
  nodeId: string;
  status: ProgressStatus;
}

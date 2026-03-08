import { UpdateProgressCommand } from '../../../application/commands/update-progress.command';
import type {
  UpdateProgressInput,
  ProgressStatus,
} from '../schemas/progress.schema';

/**
 * Maps UpdateProgressInput to UpdateProgressCommand
 */
export function mapUpdateProgressInputToCommand(
  userId: string,
  input: UpdateProgressInput,
): UpdateProgressCommand {
  return {
    userId,
    roadmapId: input.roadmapId,
    nodeId: input.nodeId,
    status: mapProgressStatusToDomain(input.status),
  };
}

/**
 * Maps GraphQL ProgressStatus to domain progress status
 */
function mapProgressStatusToDomain(
  status: ProgressStatus,
): 'done' | 'in-progress' | 'skipped' {
  const statusMap: Record<ProgressStatus, 'done' | 'in-progress' | 'skipped'> =
    {
      done: 'done',
      'in-progress': 'in-progress',
      skipped: 'skipped',
    };
  return statusMap[status];
}

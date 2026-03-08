import { CreateTopicCommand } from '../../../application/commands/create-topic.command';
import type { CreateTopicInput, ResourceType } from '../schemas/topic.schema';

/**
 * Maps CreateTopicInput to CreateTopicCommand
 */
export function mapCreateTopicInputToCommand(
  input: CreateTopicInput,
): CreateTopicCommand {
  return {
    roadmapId: input.roadmapId,
    nodeId: input.nodeId,
    title: input.title,
    content: input.content,
    resources: input.resources.map((resource) => ({
      title: resource.title,
      url: resource.url,
      type: mapResourceTypeToDomain(resource.type),
    })),
  };
}

/**
 * Maps GraphQL ResourceType to domain resource type
 */
function mapResourceTypeToDomain(
  type: ResourceType,
): 'article' | 'video' | 'course' {
  const typeMap: Record<ResourceType, 'article' | 'video' | 'course'> = {
    article: 'article',
    video: 'video',
    course: 'course',
  };
  return typeMap[type];
}

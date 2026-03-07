import { Inject, Injectable } from '@nestjs/common';
import { CreateTopicCommand } from '../commands/create-topic.command';
import { GetTopicByNodeIdQuery } from '../queries/get-topic-by-node-id.query';
import { TOPIC_REPOSITORY } from '../ports/topic.repository';
import type { TopicRepository } from '../ports/topic.repository';
import { TopicEntity } from '../../domain/entities/topic.entity';
import { RoadmapValidationDomainError } from '../../domain/errors/roadmap-domain-error';

/**
 * Application service for topic operations
 * Orchestrates topic-related use cases using repositories
 * Implements use cases: create topic, retrieve topic by node ID
 */
@Injectable()
export class TopicApplicationService {
  constructor(
    @Inject(TOPIC_REPOSITORY)
    private readonly topicRepository: TopicRepository,
  ) {}

  /**
   * Creates a new topic for a roadmap node
   * @param command - Create topic command with roadmap ID, node ID, title, content, and resources
   * @returns Created topic entity
   * @throws RoadmapValidationDomainError if validation fails
   */
  async createTopic(command: CreateTopicCommand): Promise<TopicEntity> {
    // Validate required fields
    if (!command.roadmapId || command.roadmapId.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'Roadmap ID is required and cannot be empty.',
        'createTopic',
      );
    }

    if (!command.nodeId || command.nodeId.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'Node ID is required and cannot be empty.',
        'createTopic',
      );
    }

    if (!command.title || command.title.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'Title is required and cannot be empty.',
        'createTopic',
      );
    }

    if (!command.content || command.content.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'Content is required and cannot be empty.',
        'createTopic',
      );
    }

    // Validate resources array
    if (!Array.isArray(command.resources)) {
      throw new RoadmapValidationDomainError(
        'Resources must be an array.',
        'createTopic',
      );
    }

    // Validate each resource
    for (const resource of command.resources) {
      if (!resource.title || resource.title.trim().length === 0) {
        throw new RoadmapValidationDomainError(
          'Resource title is required and cannot be empty.',
          'createTopic',
        );
      }

      if (!resource.url || resource.url.trim().length === 0) {
        throw new RoadmapValidationDomainError(
          'Resource URL is required and cannot be empty.',
          'createTopic',
        );
      }

      // Validate resource type
      const validTypes = ['article', 'video', 'course'];
      if (!validTypes.includes(resource.type)) {
        throw new RoadmapValidationDomainError(
          `Invalid resource type: must be one of ${validTypes.join(', ')}`,
          'createTopic',
        );
      }
    }

    // Normalize string fields
    const topicToCreate: Omit<TopicEntity, 'id'> = {
      roadmapId: command.roadmapId.trim(),
      nodeId: command.nodeId.trim(),
      title: command.title.trim(),
      content: command.content.trim(),
      resources: command.resources.map((resource) => ({
        title: resource.title.trim(),
        url: resource.url.trim(),
        type: resource.type,
      })),
    };

    return this.topicRepository.create(topicToCreate);
  }

  /**
   * Retrieves a topic by roadmap ID and node ID
   * @param query - Query with roadmap ID and node ID
   * @returns Topic entity or null if not found
   * @throws RoadmapValidationDomainError if validation fails
   */
  async getTopicByNodeId(
    query: GetTopicByNodeIdQuery,
  ): Promise<TopicEntity | null> {
    // Validate required fields
    if (!query.roadmapId || query.roadmapId.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'Roadmap ID is required and cannot be empty.',
        'getTopicByNodeId',
      );
    }

    if (!query.nodeId || query.nodeId.trim().length === 0) {
      throw new RoadmapValidationDomainError(
        'Node ID is required and cannot be empty.',
        'getTopicByNodeId',
      );
    }

    return this.topicRepository.findByNodeId(
      query.roadmapId.trim(),
      query.nodeId.trim(),
    );
  }
}

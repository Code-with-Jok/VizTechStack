import type { TopicEntity } from '../../domain/entities/topic.entity';

/**
 * Repository interface for Topic entity operations
 * Defines the contract for topic data access without implementation details
 */
export interface TopicRepository {
  /**
   * Creates a new topic
   * @param topic - The topic entity to create
   * @returns The created topic with generated ID
   */
  create(topic: Omit<TopicEntity, 'id'>): Promise<TopicEntity>;

  /**
   * Finds a topic by roadmap ID and node ID
   * @param roadmapId - The roadmap ID
   * @param nodeId - The node ID within the roadmap
   * @returns The topic entity or null if not found
   */
  findByNodeId(roadmapId: string, nodeId: string): Promise<TopicEntity | null>;

  /**
   * Finds all topics for a specific roadmap
   * @param roadmapId - The roadmap ID
   * @returns Array of topic entities
   */
  findByRoadmapId(roadmapId: string): Promise<TopicEntity[]>;
}

/**
 * Dependency injection token for TopicRepository
 */
export const TOPIC_REPOSITORY = Symbol('TOPIC_REPOSITORY');

import { Injectable } from '@nestjs/common';
import { ConvexService } from '../../../../common/convex/convex.service';
import { api } from '@viztechstack/convex';
import type { Id } from '@viztechstack/convex/dataModel';
import type { TopicRepository } from '../../application/ports/topic.repository';
import type { TopicEntity } from '../../domain/entities/topic.entity';

/**
 * Convex implementation of TopicRepository
 * Handles markdown content and learning resources
 */
@Injectable()
export class ConvexTopicRepository implements TopicRepository {
  constructor(private readonly convexService: ConvexService) {}

  async create(topic: Omit<TopicEntity, 'id'>): Promise<TopicEntity> {
    await this.convexService.client.mutation(api.topics.createTopic, {
      roadmapId: topic.roadmapId as Id<'roadmaps'>,
      nodeId: topic.nodeId,
      title: topic.title,
      content: topic.content,
      resources: topic.resources,
    });

    // Fetch the created topic to return complete entity
    const created = await this.convexService.client.query(
      api.topics.getByNodeId,
      {
        roadmapId: topic.roadmapId as Id<'roadmaps'>,
        nodeId: topic.nodeId,
      },
    );

    if (!created) {
      throw new Error('Failed to retrieve created topic');
    }

    return this.mapToEntity(created);
  }

  async findByNodeId(
    roadmapId: string,
    nodeId: string,
  ): Promise<TopicEntity | null> {
    const topic = await this.convexService.client.query(
      api.topics.getByNodeId,
      {
        roadmapId: roadmapId as Id<'roadmaps'>,
        nodeId,
      },
    );

    if (!topic) {
      return null;
    }

    return this.mapToEntity(topic);
  }

  async findByRoadmapId(roadmapId: string): Promise<TopicEntity[]> {
    const topics = await this.convexService.client.query(
      api.topics.getByRoadmapId,
      {
        roadmapId: roadmapId as Id<'roadmaps'>,
      },
    );

    return topics.map(
      (topic: {
        _id: string;
        roadmapId: string;
        nodeId: string;
        title: string;
        content: string;
        resources: Array<{
          title: string;
          url: string;
          type: 'article' | 'video' | 'course';
        }>;
      }) => this.mapToEntity(topic),
    );
  }

  /**
   * Maps Convex document to TopicEntity
   * Handles the conversion of Convex _id to entity id
   */
  private mapToEntity(doc: {
    _id: string;
    roadmapId: string;
    nodeId: string;
    title: string;
    content: string;
    resources: Array<{
      title: string;
      url: string;
      type: 'article' | 'video' | 'course';
    }>;
  }): TopicEntity {
    return {
      id: doc._id,
      roadmapId: doc.roadmapId,
      nodeId: doc.nodeId,
      title: doc.title,
      content: doc.content,
      resources: doc.resources,
    };
  }
}

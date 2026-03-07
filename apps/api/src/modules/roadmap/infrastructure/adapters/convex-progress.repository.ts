import { Injectable } from '@nestjs/common';
import { ConvexService } from '../../../../common/convex/convex.service';
import { api } from '@viztechstack/convex';
import type { Id } from '@viztechstack/convex/dataModel';
import type { ProgressRepository } from '../../application/ports/progress.repository';
import type { ProgressEntity } from '../../domain/entities/progress.entity';

/**
 * Convex implementation of ProgressRepository
 * Handles upsert logic to avoid duplicate records
 */
@Injectable()
export class ConvexProgressRepository implements ProgressRepository {
  constructor(private readonly convexService: ConvexService) {}

  async upsert(progress: Omit<ProgressEntity, 'id'>): Promise<ProgressEntity> {
    // The Convex updateProgress mutation already handles upsert logic
    const progressId = await this.convexService.client.mutation(
      api.progress.updateProgress,
      {
        roadmapId: progress.roadmapId as Id<'roadmaps'>,
        nodeId: progress.nodeId,
        status: progress.status,
      },
    );

    // Fetch all progress for the user and roadmap to find the updated record
    const allProgress = await this.convexService.client.query(
      api.progress.getUserProgress,
      {
        roadmapId: progress.roadmapId as Id<'roadmaps'>,
      },
    );

    // Find the specific progress record by nodeId
    const updated = allProgress.find(
      (p: { nodeId: string }) => p.nodeId === progress.nodeId,
    );

    if (!updated) {
      throw new Error('Failed to retrieve upserted progress record');
    }

    return this.mapToEntity(updated);
  }

  async findByUserAndRoadmap(
    userId: string,
    roadmapId: string,
  ): Promise<ProgressEntity[]> {
    // Note: The Convex query uses authenticated user from context
    // The userId parameter is not directly used in the Convex query
    const progressRecords = await this.convexService.client.query(
      api.progress.getUserProgress,
      {
        roadmapId: roadmapId as Id<'roadmaps'>,
      },
    );

    return progressRecords.map(
      (record: {
        _id: string;
        userId: string;
        roadmapId: string;
        nodeId: string;
        status: 'done' | 'in-progress' | 'skipped';
      }) => this.mapToEntity(record),
    );
  }

  /**
   * Maps Convex document to ProgressEntity
   * Handles the conversion of Convex _id to entity id
   */
  private mapToEntity(doc: {
    _id: string;
    userId: string;
    roadmapId: string;
    nodeId: string;
    status: 'done' | 'in-progress' | 'skipped';
  }): ProgressEntity {
    return {
      id: doc._id,
      userId: doc.userId,
      roadmapId: doc.roadmapId,
      nodeId: doc.nodeId,
      status: doc.status,
    };
  }
}

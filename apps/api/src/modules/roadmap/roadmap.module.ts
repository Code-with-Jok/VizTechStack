import { Module } from '@nestjs/common';
import { RoadmapApplicationService } from './application/services/roadmap-application.service';
import { ROADMAP_REPOSITORY } from './application/ports/roadmap.repository';
import { ConvexRoadmapRepository } from './infrastructure/adapters/convex-roadmap.repository';
import { RoadmapResolver } from './transport/graphql/resolvers/roadmap.resolver';

@Module({
  providers: [
    RoadmapResolver,
    RoadmapApplicationService,
    {
      provide: ROADMAP_REPOSITORY,
      useClass: ConvexRoadmapRepository,
    },
  ],
})
export class RoadmapModule {}

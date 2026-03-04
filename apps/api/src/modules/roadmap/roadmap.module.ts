import { Module } from '@nestjs/common';
import { RoadmapResolver } from './roadmap.resolver';

@Module({
  providers: [RoadmapResolver],
})
export class RoadmapModule {}

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseFilters, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../../../../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../../../../common/guards/roles.guard';
import { Public } from '../../../../../common/decorators/public.decorator';
import { Roles } from '../../../../../common/decorators/roles.decorator';
import { RoadmapApplicationService } from '../../../application/services/roadmap-application.service';
import {
  mapCategoryInputToDomain,
  mapCreateRoadmapInputToCommand,
  mapRoadmapEntityToGraphql,
} from '../mappers/roadmap-graphql.mapper';
import {
  CreateRoadmapInput,
  Roadmap,
  RoadmapCategory,
} from '../schemas/roadmap.schema';
import { RoadmapDomainExceptionFilter } from '../filters/roadmap-domain-exception.filter';

@Resolver(() => Roadmap)
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseFilters(RoadmapDomainExceptionFilter)
export class RoadmapResolver {
  constructor(
    private readonly roadmapApplicationService: RoadmapApplicationService,
  ) {}

  @Query(() => [Roadmap])
  @Public()
  async getRoadmaps(
    @Args('category', { type: () => RoadmapCategory, nullable: true })
    category?: RoadmapCategory,
  ): Promise<Roadmap[]> {
    const roadmaps = await this.roadmapApplicationService.listRoadmaps({
      category: mapCategoryInputToDomain(category),
    });

    return roadmaps.map((roadmap) => mapRoadmapEntityToGraphql(roadmap));
  }

  @Query(() => Roadmap, { nullable: true })
  @Public()
  async getRoadmapBySlug(
    @Args('slug', { type: () => String }) slug: string,
  ): Promise<Roadmap | null> {
    const roadmap = await this.roadmapApplicationService.getRoadmapBySlug({
      slug,
    });

    if (!roadmap) {
      return null;
    }

    return mapRoadmapEntityToGraphql(roadmap);
  }

  @Mutation(() => String)
  @Roles('admin')
  createRoadmap(@Args('input') input: CreateRoadmapInput): Promise<string> {
    return this.roadmapApplicationService.createRoadmap(
      mapCreateRoadmapInputToCommand(input),
    );
  }
}

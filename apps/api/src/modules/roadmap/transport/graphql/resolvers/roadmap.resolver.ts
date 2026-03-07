import { Args, Mutation, Query, Resolver, ID } from '@nestjs/graphql';
import { UseFilters, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../../../../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../../../../common/guards/roles.guard';
import { Public } from '../../../../../common/decorators/public.decorator';
import { Roles } from '../../../../../common/decorators/roles.decorator';
import {
  CurrentUser,
  type CurrentUserData,
} from '../../../../../common/decorators/current-user.decorator';
import { RoadmapApplicationService } from '../../../application/services/roadmap-application.service';
import {
  mapRoadmapEntityToGraphQL,
  mapRoadmapPageEntityToGraphQL,
  mapNodeEntitiesToGraphQL,
  mapCreateRoadmapInputToCommand,
  mapUpdateRoadmapInputToCommand,
} from '../mappers';
import {
  CreateRoadmapInput,
  UpdateRoadmapInput,
  Roadmap,
  RoadmapPage,
  RoadmapCategory,
  RoadmapPageInput,
} from '../schemas/roadmap.schema';
import { Node } from '../schemas/node.schema';
import { RoadmapDomainExceptionFilter } from '../filters/roadmap-domain-exception.filter';

@Resolver(() => Roadmap)
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseFilters(RoadmapDomainExceptionFilter)
export class RoadmapResolver {
  constructor(
    private readonly roadmapApplicationService: RoadmapApplicationService,
  ) {}

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

    return mapRoadmapEntityToGraphQL(roadmap);
  }

  @Query(() => RoadmapPage)
  @Public()
  async listRoadmaps(
    @Args('input', { type: () => RoadmapPageInput, nullable: true })
    input?: RoadmapPageInput,
    @CurrentUser() user?: CurrentUserData | null,
  ): Promise<RoadmapPage> {
    const isAdmin = user?.role === 'admin';

    const category = input?.category;
    const limit = input?.limit ?? 24;
    const cursor = input?.cursor ?? null;

    const roadmapPage = await this.roadmapApplicationService.listRoadmaps({
      category: category ? this.mapCategoryToDomain(category) : undefined,
      limit,
      cursor,
      isAdmin,
    });

    return mapRoadmapPageEntityToGraphQL(roadmapPage);
  }

  @Query(() => [Node])
  @Roles('admin')
  async getSkillNodesForRoleRoadmap(
    @CurrentUser() user: CurrentUserData,
  ): Promise<Node[]> {
    const isAdmin = user.role === 'admin';

    const nodes =
      await this.roadmapApplicationService.getSkillNodesForRoleRoadmap({
        isAdmin,
      });

    return mapNodeEntitiesToGraphQL(nodes);
  }

  @Mutation(() => Roadmap)
  @Roles('admin')
  async createRoadmap(
    @Args('input', { type: () => CreateRoadmapInput })
    input: CreateRoadmapInput,
  ): Promise<Roadmap> {
    const roadmap = await this.roadmapApplicationService.createRoadmap(
      mapCreateRoadmapInputToCommand(input),
    );
    return mapRoadmapEntityToGraphQL(roadmap);
  }

  @Mutation(() => Roadmap)
  @Roles('admin')
  async updateRoadmap(
    @Args('id', { type: () => ID }) id: string,
    @Args('input', { type: () => UpdateRoadmapInput })
    input: UpdateRoadmapInput,
  ): Promise<Roadmap> {
    const roadmap = await this.roadmapApplicationService.updateRoadmap(
      mapUpdateRoadmapInputToCommand(id, input),
    );
    return mapRoadmapEntityToGraphQL(roadmap);
  }

  @Mutation(() => Boolean)
  @Roles('admin')
  async deleteRoadmap(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    await this.roadmapApplicationService.deleteRoadmap({ id });
    return true;
  }

  private mapCategoryToDomain(
    category: RoadmapCategory,
  ): 'role' | 'skill' | 'best-practice' {
    const categoryMap: Record<
      RoadmapCategory,
      'role' | 'skill' | 'best-practice'
    > = {
      role: 'role',
      skill: 'skill',
      'best-practice': 'best-practice',
    };
    return categoryMap[category];
  }
}

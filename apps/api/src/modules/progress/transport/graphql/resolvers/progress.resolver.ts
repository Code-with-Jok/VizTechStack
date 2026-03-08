import { Args, Mutation, Query, Resolver, ID } from '@nestjs/graphql';
import { UseFilters, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../../../../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../../../../common/guards/roles.guard';
import {
  CurrentUser,
  type CurrentUserData,
} from '../../../../../common/decorators/current-user.decorator';
import { ProgressApplicationService } from '../../../application/services/progress-application.service';
import {
  mapProgressEntityToGraphQL,
  mapProgressEntitiesToGraphQL,
  mapUpdateProgressInputToCommand,
} from '../mappers';
import { Progress, UpdateProgressInput } from '../schemas/progress.schema';
import { RoadmapDomainExceptionFilter } from '../../../../roadmap/transport/graphql/filters/roadmap-domain-exception.filter';

@Resolver(() => Progress)
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseFilters(RoadmapDomainExceptionFilter)
export class ProgressResolver {
  constructor(
    private readonly progressApplicationService: ProgressApplicationService,
  ) {}

  @Query(() => [Progress])
  async getProgressForRoadmap(
    @Args('roadmapId', { type: () => ID }) roadmapId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Progress[]> {
    const progressList =
      await this.progressApplicationService.getProgressForRoadmap({
        userId: user.id,
        roadmapId,
      });

    return mapProgressEntitiesToGraphQL(progressList);
  }

  @Mutation(() => Progress)
  async updateProgress(
    @Args('input', { type: () => UpdateProgressInput })
    input: UpdateProgressInput,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Progress> {
    const progress = await this.progressApplicationService.updateProgress(
      mapUpdateProgressInputToCommand(user.id, input),
    );
    return mapProgressEntityToGraphQL(progress);
  }
}

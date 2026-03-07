import { Args, Mutation, Query, Resolver, ID } from '@nestjs/graphql';
import { UseFilters, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../../../../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../../../../common/guards/roles.guard';
import { Public } from '../../../../../common/decorators/public.decorator';
import { Roles } from '../../../../../common/decorators/roles.decorator';
import { TopicApplicationService } from '../../../application/services/topic-application.service';
import {
  mapTopicEntityToGraphQL,
  mapCreateTopicInputToCommand,
} from '../mappers';
import { Topic, CreateTopicInput } from '../schemas/topic.schema';
import { RoadmapDomainExceptionFilter } from '../filters/roadmap-domain-exception.filter';

@Resolver(() => Topic)
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseFilters(RoadmapDomainExceptionFilter)
export class TopicResolver {
  constructor(
    private readonly topicApplicationService: TopicApplicationService,
  ) {}

  @Query(() => Topic, { nullable: true })
  @Public()
  async getTopicByNodeId(
    @Args('roadmapId', { type: () => ID }) roadmapId: string,
    @Args('nodeId', { type: () => ID }) nodeId: string,
  ): Promise<Topic | null> {
    const topic = await this.topicApplicationService.getTopicByNodeId({
      roadmapId,
      nodeId,
    });

    if (!topic) {
      return null;
    }

    return mapTopicEntityToGraphQL(topic);
  }

  @Mutation(() => Topic)
  @Roles('admin')
  async createTopic(
    @Args('input', { type: () => CreateTopicInput }) input: CreateTopicInput,
  ): Promise<Topic> {
    const topic = await this.topicApplicationService.createTopic(
      mapCreateTopicInputToCommand(input),
    );
    return mapTopicEntityToGraphQL(topic);
  }
}

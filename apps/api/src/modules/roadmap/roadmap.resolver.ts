import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Roadmap, CreateRoadmapInput, RoadmapCategory } from './roadmap.schema';
import { ConvexService } from '../../common/convex/convex.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { api } from '@viztechstack/convex/api';

@Resolver(() => Roadmap)
@UseGuards(ClerkAuthGuard, RolesGuard)
export class RoadmapResolver {
  constructor(private readonly convex: ConvexService) {}

  @Query(() => [Roadmap])
  @Public()
  async getRoadmaps(
    @Args('category', { type: () => RoadmapCategory, nullable: true })
    category?: RoadmapCategory,
  ): Promise<Roadmap[]> {
    const roadmaps = (await this.convex.client.query(api.roadmaps.list, {
      category: category as 'role' | 'skill' | 'best-practice' | undefined,
    })) as Array<Roadmap & { _id: string }>;

    return roadmaps.map((r) => ({
      ...r,
      _id: r._id,
    }));
  }

  @Query(() => Roadmap, { nullable: true })
  @Public()
  async getRoadmapBySlug(
    @Args('slug', { type: () => String }) slug: string,
  ): Promise<Roadmap | null> {
    const roadmap = (await this.convex.client.query(api.roadmaps.getBySlug, {
      slug,
    })) as (Roadmap & { _id: string }) | null;

    if (!roadmap) return null;
    return {
      ...roadmap,
      _id: roadmap._id,
    };
  }

  @Mutation(() => String)
  @Roles('admin')
  async createRoadmap(
    @Args('input') input: CreateRoadmapInput,
  ): Promise<string> {
    // Gọi convex mutation
    // Note: Since we use ConvexHttpClient in NestJS, we can't easily pass the
    // Clerk identity context directly like on the frontend.
    // In a real monorepo, NestJS might use the Secret or we'd use convex-backend-sdk.
    // For this demo, we assume NestJS is a trusted server.
    const roadmapId = await this.convex.client.mutation(
      api.roadmaps.createRoadmap,
      {
        slug: input.slug,
        title: input.title,
        description: input.description,
        category: input.category as 'role' | 'skill' | 'best-practice',
        difficulty: input.difficulty as
          | 'beginner'
          | 'intermediate'
          | 'advanced',
        topicCount: input.topicCount ?? 0,
        nodesJson: input.nodesJson ?? '[]',
        edgesJson: input.edgesJson ?? '[]',
        status: (input.status ?? 'public') as 'public' | 'draft' | 'private',
      },
    );

    return roadmapId as string;
  }
}

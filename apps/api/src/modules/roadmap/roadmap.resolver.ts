import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Roadmap, CreateRoadmapInput } from './roadmap.schema';
import { ConvexService } from '../../common/convex/convex.service';
import { ClerkAuthGuard } from '../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
// We use any for api here to avoid strict path issues if convex generated code is missing
// but we will cast it properly in production
// import { api } from '../../../../../../convex/_generated/api';

@Resolver(() => Roadmap)
@UseGuards(ClerkAuthGuard, RolesGuard)
export class RoadmapResolver {
  constructor(private readonly convex: ConvexService) {}

  @Query(() => [Roadmap])
  async getRoadmaps(
    @Args('category', { type: () => String, nullable: true }) category?: string,
  ): Promise<Roadmap[]> {
    const roadmaps = (await this.convex.client.query('roadmaps:list' as any, {
      category,
    })) as Array<Roadmap & { _id: string }>;

    return roadmaps.map((r) => ({
      ...r,
      _id: r._id,
    }));
  }

  @Query(() => Roadmap, { nullable: true })
  async getRoadmapBySlug(
    @Args('slug', { type: () => String }) slug: string,
  ): Promise<Roadmap | null> {
    const roadmap = (await this.convex.client.query(
      'roadmaps:getBySlug' as any,
      {
        slug,
      },
    )) as (Roadmap & { _id: string }) | null;

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const roadmapId = await this.convex.client.mutation(
      'roadmaps:createRoadmap' as any,
      input,
    );

    return roadmapId as string;
  }
}

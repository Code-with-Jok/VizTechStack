import { Args, Mutation, Query, Resolver, ID } from '@nestjs/graphql';
import { UseFilters, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from '../../../../../common/guards/clerk-auth.guard';
import { RolesGuard } from '../../../../../common/guards/roles.guard';
import {
  CurrentUser,
  type CurrentUserData,
} from '../../../../../common/decorators/current-user.decorator';
import { BookmarkApplicationService } from '../../../application/services/bookmark-application.service';
import {
  mapBookmarkEntityToGraphQL,
  mapBookmarkEntitiesToGraphQL,
} from '../mappers';
import { Bookmark } from '../schemas/bookmark.schema';
import { RoadmapDomainExceptionFilter } from '../filters/roadmap-domain-exception.filter';

@Resolver(() => Bookmark)
@UseGuards(ClerkAuthGuard, RolesGuard)
@UseFilters(RoadmapDomainExceptionFilter)
export class BookmarkResolver {
  constructor(
    private readonly bookmarkApplicationService: BookmarkApplicationService,
  ) {}

  @Query(() => [Bookmark])
  async getUserBookmarks(
    @CurrentUser() user: CurrentUserData,
  ): Promise<Bookmark[]> {
    const bookmarks = await this.bookmarkApplicationService.getUserBookmarks({
      userId: user.id,
    });

    return mapBookmarkEntitiesToGraphQL(bookmarks);
  }

  @Mutation(() => Bookmark)
  async addBookmark(
    @Args('roadmapId', { type: () => ID }) roadmapId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<Bookmark> {
    const bookmark = await this.bookmarkApplicationService.addBookmark({
      userId: user.id,
      roadmapId,
    });
    return mapBookmarkEntityToGraphQL(bookmark);
  }

  @Mutation(() => Boolean)
  async removeBookmark(
    @Args('roadmapId', { type: () => ID }) roadmapId: string,
    @CurrentUser() user: CurrentUserData,
  ): Promise<boolean> {
    await this.bookmarkApplicationService.removeBookmark({
      userId: user.id,
      roadmapId,
    });
    return true;
  }
}

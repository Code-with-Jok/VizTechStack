import { Module } from '@nestjs/common';
import { ArticleService } from './application/services/article.service';
import { ArticleResolver } from './transport/graphql/resolvers/article.resolver';
import { ArticleController } from './transport/rest/controllers/article.controller';
import { ConvexService } from '../../common/convex/convex.service';
import { ClerkService } from '../../common/clerk/clerk.service';

@Module({
  controllers: [ArticleController],
  providers: [ArticleService, ArticleResolver, ConvexService, ClerkService],
  exports: [ArticleService],
})
export class ArticleModule {}

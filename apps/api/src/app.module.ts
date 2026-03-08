import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PingModule } from './modules/ping/ping.module';
import { ConvexModule } from './common/convex/convex.module';
import { RoadmapModule } from './modules/roadmap/roadmap.module';
import { TopicModule } from './modules/topic/topic.module';
import { ProgressModule } from './modules/progress/progress.module';
import { BookmarkModule } from './modules/bookmark/bookmark.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot(
      process.env.NODE_ENV === 'production'
        ? { isGlobal: true, ignoreEnvFile: true }
        : { isGlobal: true, envFilePath: ['.env.local', '.env'] },
    ),
    ConvexModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      path: '/graphql',
    }),
    PingModule,
    RoadmapModule,
    TopicModule,
    ProgressModule,
    BookmarkModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

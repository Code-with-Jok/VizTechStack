import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { CourseModule } from "./modules/course/course.module";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      sortSchema: true,
      playground: process.env.NODE_ENV !== "production",
      context: ({ req }: { req: Request }) => ({ req }),
    }),
    CourseModule,
  ],
})
export class AppModule {}

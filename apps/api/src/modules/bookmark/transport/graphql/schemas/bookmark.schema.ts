import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Bookmark {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  userId!: string;

  @Field(() => ID)
  roadmapId!: string;
}

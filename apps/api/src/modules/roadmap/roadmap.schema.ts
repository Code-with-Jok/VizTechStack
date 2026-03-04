import { ObjectType, Field, Int, InputType } from '@nestjs/graphql';

@ObjectType()
export class Roadmap {
  @Field()
  _id!: string;

  @Field()
  slug!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  category!: string;

  @Field()
  difficulty!: string;

  @Field(() => String, { nullable: true })
  nodesJson?: string;

  @Field(() => String, { nullable: true })
  edgesJson?: string;

  @Field(() => Int, { nullable: true })
  topicCount?: number;

  @Field()
  status!: string;
}

@InputType()
export class CreateRoadmapInput {
  @Field()
  slug!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  category!: string;

  @Field()
  difficulty!: string;

  @Field(() => String, { nullable: true, defaultValue: '[]' })
  nodesJson?: string;

  @Field(() => String, { nullable: true, defaultValue: '[]' })
  edgesJson?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  topicCount?: number;

  @Field({ defaultValue: 'public' })
  status?: string;
}

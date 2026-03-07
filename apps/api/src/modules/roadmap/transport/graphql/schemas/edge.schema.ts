import { ObjectType, Field, InputType, ID } from '@nestjs/graphql';

@ObjectType()
export class Edge {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  source!: string;

  @Field(() => ID)
  target!: string;

  @Field({ nullable: true })
  type?: string;
}

@InputType()
export class EdgeInput {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  source!: string;

  @Field(() => ID)
  target!: string;

  @Field({ nullable: true })
  type?: string;
}

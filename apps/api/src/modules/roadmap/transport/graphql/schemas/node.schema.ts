import { ObjectType, Field, Float, InputType, ID } from '@nestjs/graphql';

@ObjectType()
export class Position {
  @Field(() => Float)
  x!: number;

  @Field(() => Float)
  y!: number;
}

@ObjectType()
export class NodeData {
  @Field()
  label!: string;

  @Field(() => ID, { nullable: true })
  topicId?: string;

  @Field({ nullable: true })
  isReusedSkillNode?: boolean;

  @Field(() => ID, { nullable: true })
  originalRoadmapId?: string;
}

@ObjectType()
export class Node {
  @Field(() => ID)
  id!: string;

  @Field()
  type!: string;

  @Field(() => Position)
  position!: Position;

  @Field(() => NodeData)
  data!: NodeData;
}

@InputType()
export class PositionInput {
  @Field(() => Float)
  x!: number;

  @Field(() => Float)
  y!: number;
}

@InputType()
export class NodeDataInput {
  @Field()
  label!: string;

  @Field(() => ID, { nullable: true })
  topicId?: string;

  @Field({ nullable: true })
  isReusedSkillNode?: boolean;

  @Field(() => ID, { nullable: true })
  originalRoadmapId?: string;
}

@InputType()
export class NodeInput {
  @Field(() => ID)
  id!: string;

  @Field()
  type!: string;

  @Field(() => PositionInput)
  position!: PositionInput;

  @Field(() => NodeDataInput)
  data!: NodeDataInput;
}

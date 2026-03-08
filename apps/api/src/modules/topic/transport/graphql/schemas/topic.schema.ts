import {
  ObjectType,
  Field,
  InputType,
  registerEnumType,
  ID,
} from '@nestjs/graphql';

export enum ResourceType {
  ARTICLE = 'article',
  VIDEO = 'video',
  COURSE = 'course',
}

registerEnumType(ResourceType, { name: 'ResourceType' });

@ObjectType()
export class Resource {
  @Field()
  title!: string;

  @Field()
  url!: string;

  @Field(() => ResourceType)
  type!: ResourceType;
}

@ObjectType()
export class Topic {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  roadmapId!: string;

  @Field(() => ID)
  nodeId!: string;

  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field(() => [Resource])
  resources!: Resource[];
}

@InputType()
export class ResourceInput {
  @Field()
  title!: string;

  @Field()
  url!: string;

  @Field(() => ResourceType)
  type!: ResourceType;
}

@InputType()
export class CreateTopicInput {
  @Field(() => ID)
  roadmapId!: string;

  @Field(() => ID)
  nodeId!: string;

  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field(() => [ResourceInput])
  resources!: ResourceInput[];
}

import {
  ObjectType,
  Field,
  Int,
  InputType,
  registerEnumType,
} from '@nestjs/graphql';

export enum RoadmapCategory {
  ROLE = 'role',
  SKILL = 'skill',
  BEST_PRACTICE = 'best-practice',
}

export enum RoadmapDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum RoadmapStatus {
  PUBLIC = 'public',
  DRAFT = 'draft',
  PRIVATE = 'private',
}

registerEnumType(RoadmapCategory, { name: 'RoadmapCategory' });
registerEnumType(RoadmapDifficulty, { name: 'RoadmapDifficulty' });
registerEnumType(RoadmapStatus, { name: 'RoadmapStatus' });

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

  @Field(() => RoadmapCategory)
  category!: RoadmapCategory;

  @Field(() => RoadmapDifficulty)
  difficulty!: RoadmapDifficulty;

  @Field(() => String, { nullable: true })
  nodesJson?: string;

  @Field(() => String, { nullable: true })
  edgesJson?: string;

  @Field(() => Int, { nullable: true })
  topicCount?: number;

  @Field(() => RoadmapStatus, {
    nullable: true,
    defaultValue: RoadmapStatus.PUBLIC,
  })
  status!: RoadmapStatus;
}

@InputType()
export class CreateRoadmapInput {
  @Field()
  slug!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field(() => RoadmapCategory)
  category!: RoadmapCategory;

  @Field(() => RoadmapDifficulty)
  difficulty!: RoadmapDifficulty;

  @Field(() => String, { nullable: true, defaultValue: '[]' })
  nodesJson?: string;

  @Field(() => String, { nullable: true, defaultValue: '[]' })
  edgesJson?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  topicCount?: number;

  @Field(() => RoadmapStatus, { defaultValue: RoadmapStatus.PUBLIC })
  status?: RoadmapStatus;
}

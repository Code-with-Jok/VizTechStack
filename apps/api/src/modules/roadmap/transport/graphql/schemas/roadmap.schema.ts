import {
  ObjectType,
  Field,
  Int,
  InputType,
  registerEnumType,
  ID,
} from '@nestjs/graphql';
import { Node, NodeInput } from './node.schema';
import { Edge, EdgeInput } from './edge.schema';

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
  @Field(() => ID)
  id!: string;

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

  @Field(() => [Node])
  nodes!: Node[];

  @Field(() => [Edge])
  edges!: Edge[];

  @Field(() => Int)
  topicCount!: number;

  @Field(() => RoadmapStatus)
  status!: RoadmapStatus;

  @Field(() => Number)
  createdAt!: number;
}

@InputType()
export class RoadmapFilters {
  @Field(() => RoadmapCategory, { nullable: true })
  category?: RoadmapCategory;

  @Field(() => RoadmapStatus, { nullable: true })
  status?: RoadmapStatus;
}

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 24 })
  limit?: number;

  @Field(() => String, { nullable: true })
  cursor?: string;
}

@InputType()
export class RoadmapPageInput {
  @Field(() => RoadmapCategory, { nullable: true })
  category?: RoadmapCategory;

  @Field(() => String, { nullable: true })
  cursor?: string;

  @Field(() => Int, { nullable: true, defaultValue: 24 })
  limit?: number;
}

@ObjectType()
export class RoadmapPage {
  @Field(() => [Roadmap])
  items!: Roadmap[];

  @Field(() => String, { nullable: true })
  nextCursor!: string | null;

  @Field(() => Boolean)
  isDone!: boolean;
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

  @Field(() => [NodeInput])
  nodes!: NodeInput[];

  @Field(() => [EdgeInput])
  edges!: EdgeInput[];

  @Field(() => Int)
  topicCount!: number;

  @Field(() => RoadmapStatus)
  status!: RoadmapStatus;
}

@InputType()
export class UpdateRoadmapInput {
  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => RoadmapCategory, { nullable: true })
  category?: RoadmapCategory;

  @Field(() => RoadmapDifficulty, { nullable: true })
  difficulty?: RoadmapDifficulty;

  @Field(() => [NodeInput], { nullable: true })
  nodes?: NodeInput[];

  @Field(() => [EdgeInput], { nullable: true })
  edges?: EdgeInput[];

  @Field(() => Int, { nullable: true })
  topicCount?: number;

  @Field(() => RoadmapStatus, { nullable: true })
  status?: RoadmapStatus;
}

import {
  ObjectType,
  Field,
  InputType,
  registerEnumType,
  ID,
} from '@nestjs/graphql';

export enum ProgressStatus {
  DONE = 'done',
  IN_PROGRESS = 'in-progress',
  SKIPPED = 'skipped',
}

registerEnumType(ProgressStatus, { name: 'ProgressStatus' });

@ObjectType()
export class Progress {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  userId!: string;

  @Field(() => ID)
  roadmapId!: string;

  @Field(() => ID)
  nodeId!: string;

  @Field(() => ProgressStatus)
  status!: ProgressStatus;
}

@InputType()
export class UpdateProgressInput {
  @Field(() => ID)
  roadmapId!: string;

  @Field(() => ID)
  nodeId!: string;

  @Field(() => ProgressStatus)
  status!: ProgressStatus;
}

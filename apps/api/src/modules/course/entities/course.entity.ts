import { ObjectType, Field, ID } from "@nestjs/graphql";
import { ChapterStatus } from "@viztechstack/types";

@ObjectType()
export class ContentBlockEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  lessonId!: string;

  @Field()
  type!: string;

  @Field({ nullable: true })
  title?: string;

  @Field()
  content!: string;

  @Field({ nullable: true })
  language?: string;

  @Field()
  order!: number;
}

@ObjectType()
export class LessonEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  chapterId!: string;

  @Field()
  title!: string;

  @Field()
  order!: number;
}

@ObjectType()
export class ChapterEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  courseId!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  order!: number;

  @Field()
  x!: number;

  @Field()
  y!: number;

  @Field({ nullable: true })
  parentId?: string;

  @Field()
  status!: string;

  @Field(() => [LessonEntity], { nullable: true })
  lessons?: LessonEntity[];
}

@ObjectType()
export class CourseEntity {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  icon!: string;

  @Field()
  slug!: string;

  @Field(() => [ChapterEntity], { nullable: true })
  chapters?: ChapterEntity[];
}

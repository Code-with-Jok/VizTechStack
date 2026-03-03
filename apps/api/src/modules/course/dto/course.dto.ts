import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class CreateCourseInput {
  @Field() title!: string;
  @Field() description!: string;
  @Field() icon!: string;
  @Field() slug!: string;
}

@InputType()
export class CreateChapterInput {
  @Field() courseId!: string;
  @Field() title!: string;
  @Field() description!: string;
  @Field() order!: number;
  @Field() x!: number;
  @Field() y!: number;
  @Field({ nullable: true }) parentId?: string;
  @Field({ defaultValue: "available" }) status!: string;
}

@InputType()
export class UpdateChapterInput {
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) description?: string;
  @Field({ nullable: true }) x?: number;
  @Field({ nullable: true }) y?: number;
  @Field({ nullable: true }) parentId?: string;
  @Field({ nullable: true }) status?: string;
}

@InputType()
export class CreateLessonInput {
  @Field() chapterId!: string;
  @Field() title!: string;
  @Field() order!: number;
}

@InputType()
export class CreateContentBlockInput {
  @Field() lessonId!: string;
  @Field() type!: string;
  @Field({ nullable: true }) title?: string;
  @Field() content!: string;
  @Field({ nullable: true }) language?: string;
  @Field() order!: number;
}

@InputType()
export class UpdateContentBlockInput {
  @Field({ nullable: true }) type?: string;
  @Field({ nullable: true }) title?: string;
  @Field({ nullable: true }) content?: string;
  @Field({ nullable: true }) language?: string;
  @Field({ nullable: true }) order?: number;
}

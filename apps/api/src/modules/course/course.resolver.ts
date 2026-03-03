import { Resolver, Query, Mutation, Args, ID } from "@nestjs/graphql";
import { CourseService } from "./course.service";
import {
  CourseEntity, ChapterEntity, LessonEntity, ContentBlockEntity,
} from "./entities/course.entity";
import {
  CreateCourseInput, CreateChapterInput, UpdateChapterInput,
  CreateLessonInput, CreateContentBlockInput, UpdateContentBlockInput,
} from "./dto/course.dto";

@Resolver(() => CourseEntity)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  // ─── Course Queries ─────────────────────────────────────────────────
  @Query(() => [CourseEntity], { name: "courses" })
  listCourses() {
    return this.courseService.listCourses();
  }

  @Query(() => CourseEntity, { name: "course", nullable: true })
  getCourse(@Args("id", { type: () => ID }) id: string) {
    return this.courseService.getCourseById(id);
  }

  @Query(() => CourseEntity, { name: "courseBySlug", nullable: true })
  getCourseBySlug(@Args("slug") slug: string) {
    return this.courseService.getCourseBySlug(slug);
  }

  // ─── Course Mutations ───────────────────────────────────────────────
  @Mutation(() => CourseEntity)
  createCourse(@Args("input") input: CreateCourseInput) {
    return this.courseService.createCourse(input);
  }

  // ─── Chapter Queries ────────────────────────────────────────────────
  @Query(() => [ChapterEntity], { name: "chapters" })
  listChapters(@Args("courseId", { type: () => ID }) courseId: string) {
    return this.courseService.listChapters(courseId);
  }

  // ─── Chapter Mutations ──────────────────────────────────────────────
  @Mutation(() => ChapterEntity)
  createChapter(@Args("input") input: CreateChapterInput) {
    return this.courseService.createChapter(input);
  }

  @Mutation(() => ChapterEntity)
  updateChapter(
    @Args("id", { type: () => ID }) id: string,
    @Args("updates") updates: UpdateChapterInput,
  ) {
    return this.courseService.updateChapter(id, updates);
  }

  @Mutation(() => Boolean)
  deleteChapter(@Args("id", { type: () => ID }) id: string) {
    return this.courseService.deleteChapter(id);
  }

  // ─── Lesson Queries ─────────────────────────────────────────────────
  @Query(() => [LessonEntity], { name: "lessons" })
  listLessons(@Args("chapterId", { type: () => ID }) chapterId: string) {
    return this.courseService.listLessons(chapterId);
  }

  @Mutation(() => LessonEntity)
  createLesson(@Args("input") input: CreateLessonInput) {
    return this.courseService.createLesson(input);
  }

  // ─── Content Block Queries ──────────────────────────────────────────
  @Query(() => [ContentBlockEntity], { name: "contentBlocks" })
  listContentBlocks(@Args("lessonId", { type: () => ID }) lessonId: string) {
    return this.courseService.listContentBlocks(lessonId);
  }

  @Mutation(() => ContentBlockEntity)
  createContentBlock(@Args("input") input: CreateContentBlockInput) {
    return this.courseService.createContentBlock(input);
  }

  @Mutation(() => ContentBlockEntity)
  updateContentBlock(
    @Args("id", { type: () => ID }) id: string,
    @Args("updates") updates: UpdateContentBlockInput,
  ) {
    return this.courseService.updateContentBlock(id, updates);
  }

  @Mutation(() => Boolean)
  deleteContentBlock(@Args("id", { type: () => ID }) id: string) {
    return this.courseService.deleteContentBlock(id);
  }
}

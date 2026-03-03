import type {
  Course,
  Chapter,
  Lesson,
  ContentBlock,
} from "@viztechstack/types";

// Hỗ trợ cả Server Components (API_URL) và Client Components (NEXT_PUBLIC_API_URL)
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env["API_URL"] ??
  "http://localhost:4000/graphql";

// ─── GraphQL Fetcher ─────────────────────────────────────────────────────────
async function gqlFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };
  if (json.errors?.length)
    throw new Error(json.errors[0]?.message ?? "GraphQL error");
  return json.data as T;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────
export const queryKeys = {
  courses: ["courses"] as const,
  course: (id: string) => ["courses", id] as const,
  courseBySlug: (slug: string) => ["courses", "slug", slug] as const,
  chapters: (courseId: string) => ["chapters", courseId] as const,
  chapter: (id: string) => ["chapters", "detail", id] as const,
  lessons: (chapterId: string) => ["lessons", chapterId] as const,
  contentBlocks: (lessonId: string) => ["contentBlocks", lessonId] as const,
};

// ─── API Functions ────────────────────────────────────────────────────────────
export const api = {
  courses: {
    list: () =>
      gqlFetch<{ courses: Course[] }>(`
        query { courses { id title description icon slug } }
      `).then((d) => d.courses),

    // BUG-03 fix: dùng ID! thay vì String!
    get: (id: string) =>
      gqlFetch<{ course: Course }>(
        `
        query Course($id: ID!) {
          course(id: $id) { id title description icon slug }
        }
      `,
        { id }
      ).then((d) => d.course),

    // ISSUE-04 fix: thêm getBySlug để web pages tìm course theo slug qua NestJS
    getBySlug: (slug: string) =>
      gqlFetch<{ courseBySlug: Course | null }>(
        `
        query CourseBySlug($slug: String!) {
          courseBySlug(slug: $slug) { id title description icon slug }
        }
      `,
        { slug }
      ).then((d) => d.courseBySlug),

    create: (input: Pick<Course, "title" | "description" | "icon" | "slug">) =>
      gqlFetch<{ createCourse: Course }>(
        `
        mutation CreateCourse($input: CreateCourseInput!) {
          createCourse(input: $input) { id title description icon slug }
        }
      `,
        { input }
      ).then((d) => d.createCourse),
  },

  chapters: {
    // BUG-03 fix: dùng ID! thay vì String!
    list: (courseId: string) =>
      gqlFetch<{ chapters: Chapter[] }>(
        `
        query Chapters($courseId: ID!) {
          chapters(courseId: $courseId) {
            id courseId title description order x y parentId status
          }
        }
      `,
        { courseId }
      ).then((d) => d.chapters),

    create: (input: Omit<Chapter, "id" | "lessons">) =>
      gqlFetch<{ createChapter: Chapter }>(
        `
        mutation CreateChapter($input: CreateChapterInput!) {
          createChapter(input: $input) { id courseId title description order x y parentId status }
        }
      `,
        { input }
      ).then((d) => d.createChapter),

    update: (
      id: string,
      updates: Partial<Omit<Chapter, "id" | "courseId" | "lessons">>
    ) =>
      gqlFetch<{ updateChapter: Chapter }>(
        `
        mutation UpdateChapter($id: ID!, $updates: UpdateChapterInput!) {
          updateChapter(id: $id, updates: $updates) { id title status x y parentId }
        }
      `,
        { id, updates }
      ).then((d) => d.updateChapter),

    delete: (id: string) =>
      gqlFetch<{ deleteChapter: boolean }>(
        `
        mutation DeleteChapter($id: ID!) { deleteChapter(id: $id) }
      `,
        { id }
      ).then((d) => d.deleteChapter),
  },

  lessons: {
    // BUG-03 fix: dùng ID! thay vì String!
    list: (chapterId: string) =>
      gqlFetch<{ lessons: Lesson[] }>(
        `
        query Lessons($chapterId: ID!) {
          lessons(chapterId: $chapterId) { id chapterId title order }
        }
      `,
        { chapterId }
      ).then((d) => d.lessons),

    create: (input: Omit<Lesson, "id" | "content">) =>
      gqlFetch<{ createLesson: Lesson }>(
        `
        mutation CreateLesson($input: CreateLessonInput!) {
          createLesson(input: $input) { id chapterId title order }
        }
      `,
        { input }
      ).then((d) => d.createLesson),
  },

  contentBlocks: {
    // BUG-03 fix: dùng ID! thay vì String!
    list: (lessonId: string) =>
      gqlFetch<{ contentBlocks: ContentBlock[] }>(
        `
        query ContentBlocks($lessonId: ID!) {
          contentBlocks(lessonId: $lessonId) { id type title content language order }
        }
      `,
        { lessonId }
      ).then((d) => d.contentBlocks),

    create: (input: Omit<ContentBlock, "id">) =>
      gqlFetch<{ createContentBlock: ContentBlock }>(
        `
        mutation CreateContentBlock($input: CreateContentBlockInput!) {
          createContentBlock(input: $input) { id type title content language order }
        }
      `,
        { input }
      ).then((d) => d.createContentBlock),

    update: (id: string, updates: Partial<Omit<ContentBlock, "id">>) =>
      gqlFetch<{ updateContentBlock: ContentBlock }>(
        `
        mutation UpdateContentBlock($id: ID!, $updates: UpdateContentBlockInput!) {
          updateContentBlock(id: $id, updates: $updates) { id type title content language order }
        }
      `,
        { id, updates }
      ).then((d) => d.updateContentBlock),

    delete: (id: string) =>
      gqlFetch<{ deleteContentBlock: boolean }>(
        `
        mutation DeleteContentBlock($id: ID!) { deleteContentBlock(id: $id) }
      `,
        { id }
      ).then((d) => d.deleteContentBlock),
  },
};

export type { Course, Chapter, Lesson, ContentBlock };

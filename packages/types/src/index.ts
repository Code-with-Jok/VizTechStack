// ─── Content Block ──────────────────────────────────────────────────────────
export type ContentBlockType = "text" | "code" | "interactive" | "diagram";

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  title?: string;
  content: string;
  language?: string;
  order: number;
}

// ─── Lesson ─────────────────────────────────────────────────────────────────
export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  order: number;
  content?: ContentBlock[]; // populated client-side
}

// ─── Chapter ────────────────────────────────────────────────────────────────
export type ChapterStatus = "locked" | "available" | "completed";

export interface Chapter {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  x: number;
  y: number;
  parentId?: string;
  status: ChapterStatus;
  lessons?: Lesson[]; // populated client-side
}

// ─── Course ──────────────────────────────────────────────────────────────────
export interface Course {
  id: string;
  title: string;
  description: string;
  icon: string;
  slug: string;
  chapters?: Chapter[]; // populated client-side
}

// ─── GraphQL Input Types ─────────────────────────────────────────────────────
export interface CreateCourseInput {
  title: string;
  description: string;
  icon: string;
  slug: string;
}

export interface CreateChapterInput {
  courseId: string;
  title: string;
  description: string;
  order: number;
  x: number;
  y: number;
  parentId?: string;
  status?: ChapterStatus;
}

export interface CreateLessonInput {
  chapterId: string;
  title: string;
  order: number;
}

export interface CreateContentBlockInput {
  lessonId: string;
  type: ContentBlockType;
  title?: string;
  content: string;
  language?: string;
  order: number;
}

// ─── 3D Scene ────────────────────────────────────────────────────────────────
export type SceneKey =
  | "virtual-dom"
  | "component-tree"
  | "jsx"
  | "props-flow"
  | "state"
  | "app-router"
  | "server-components"
  | "data-fetching"
  | "default";

export interface SceneConfig {
  key: SceneKey;
  label: string;
  lessonIds: string[];
  chapterIds: string[];
}

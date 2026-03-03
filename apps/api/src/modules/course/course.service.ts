import { Injectable } from "@nestjs/common";
import type {
  CreateCourseInput,
  CreateChapterInput,
  UpdateChapterInput,
  CreateLessonInput,
  CreateContentBlockInput,
  UpdateContentBlockInput,
} from "./dto/course.dto";

// ─── Convex document type ─────────────────────────────────────────────────────
type ConvexDoc = Record<string, unknown> & {
  _id: string;
  _creationTime?: number;
};

/**
 * Map Convex document: `_id` → `id`, bỏ `_creationTime`
 * Convex luôn trả về `_id` thay vì `id`
 */
function mapDoc<T extends ConvexDoc>(
  doc: T
): Omit<T, "_id" | "_creationTime"> & { id: string } {
  const { _id, _creationTime, ...rest } = doc;
  return { id: _id, ...rest } as Omit<T, "_id" | "_creationTime"> & {
    id: string;
  };
}

function mapDocs<T extends ConvexDoc>(docs: T[] | null | undefined) {
  if (!docs || !Array.isArray(docs)) return [];
  return docs.map(mapDoc);
}

/**
 * Service layer: gọi Convex HTTP API để đọc/ghi dữ liệu.
 * Convex HTTP API format: POST /api/query với body { path: "module:function", args: {...} }
 */
@Injectable()
export class CourseService {
  private get convexUrl(): string {
    return process.env["CONVEX_URL"] ?? "";
  }

  private async query<T>(
    fn: string,
    args: Record<string, unknown> = {}
  ): Promise<T> {
    const res = await fetch(`${this.convexUrl}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: fn, args, format: "json" }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Convex query error [${fn}]: ${res.status} ${text}`);
    }
    const json = (await res.json()) as {
      value?: T;
      status: string;
      errorMessage?: string;
    };
    if (json.status === "error") {
      throw new Error(`Convex query error [${fn}]: ${json.errorMessage}`);
    }
    return json.value as T;
  }

  private async mutation<T>(
    fn: string,
    args: Record<string, unknown> = {}
  ): Promise<T> {
    const res = await fetch(`${this.convexUrl}/api/mutation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: fn, args, format: "json" }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Convex mutation error [${fn}]: ${res.status} ${text}`);
    }
    const json = (await res.json()) as {
      value?: T;
      status: string;
      errorMessage?: string;
    };
    if (json.status === "error") {
      throw new Error(`Convex mutation error [${fn}]: ${json.errorMessage}`);
    }
    return json.value as T;
  }

  // ─── Courses ────────────────────────────────────────────────────────
  async listCourses() {
    const docs = await this.query<ConvexDoc[]>("courses:list");
    return mapDocs(docs);
  }

  async getCourseById(id: string) {
    const doc = await this.query<ConvexDoc | null>("courses:getById", { id });
    return doc ? mapDoc(doc) : null;
  }

  async getCourseBySlug(slug: string) {
    const doc = await this.query<ConvexDoc | null>("courses:getBySlug", {
      slug,
    });
    return doc ? mapDoc(doc) : null;
  }

  async createCourse(input: CreateCourseInput) {
    const doc = await this.mutation<ConvexDoc>(
      "courses:create",
      input as unknown as Record<string, unknown>
    );
    return mapDoc(doc);
  }

  // ─── Chapters ───────────────────────────────────────────────────────
  async listChapters(courseId: string) {
    const docs = await this.query<ConvexDoc[]>("chapters:listByCourse", {
      courseId,
    });
    return mapDocs(docs);
  }

  async createChapter(input: CreateChapterInput) {
    const doc = await this.mutation<ConvexDoc>(
      "chapters:create",
      input as unknown as Record<string, unknown>
    );
    return mapDoc(doc);
  }

  async updateChapter(id: string, updates: UpdateChapterInput) {
    const doc = await this.mutation<ConvexDoc>("chapters:update", {
      id,
      ...(updates as unknown as Record<string, unknown>),
    });
    return mapDoc(doc);
  }

  async deleteChapter(id: string) {
    return this.mutation<boolean>("chapters:remove", { id });
  }

  // ─── Lessons ────────────────────────────────────────────────────────
  async listLessons(chapterId: string) {
    const docs = await this.query<ConvexDoc[]>("lessons:listByChapter", {
      chapterId,
    });
    return mapDocs(docs);
  }

  async createLesson(input: CreateLessonInput) {
    const doc = await this.mutation<ConvexDoc>(
      "lessons:create",
      input as unknown as Record<string, unknown>
    );
    return mapDoc(doc);
  }

  // ─── Content Blocks ─────────────────────────────────────────────────
  async listContentBlocks(lessonId: string) {
    const docs = await this.query<ConvexDoc[]>("contentBlocks:listByLesson", {
      lessonId,
    });
    return mapDocs(docs);
  }

  async createContentBlock(input: CreateContentBlockInput) {
    const doc = await this.mutation<ConvexDoc>(
      "contentBlocks:create",
      input as unknown as Record<string, unknown>
    );
    return mapDoc(doc);
  }

  async updateContentBlock(id: string, updates: UpdateContentBlockInput) {
    const doc = await this.mutation<ConvexDoc>("contentBlocks:update", {
      id,
      ...(updates as unknown as Record<string, unknown>),
    });
    return mapDoc(doc);
  }

  async deleteContentBlock(id: string) {
    return this.mutation<boolean>("contentBlocks:remove", { id });
  }
}

import { notFound } from "next/navigation";
import type { Chapter, Lesson } from "@viztechstack/types";
import { ChapterClient } from "./chapter-client";

interface Props {
  params: { slug: string; chapterId: string };
}

const INTERNAL_API_URL =
  process.env["INTERNAL_API_URL"] ??
  process.env["API_URL"] ??
  "http://localhost:4000/graphql";

async function gql<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T | null> {
  try {
    const res = await fetch(INTERNAL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: T; errors?: unknown[] };
    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors);
      return null;
    }
    return json.data ?? null;
  } catch (e) {
    console.error("gql error:", e);
    return null;
  }
}

export default async function ChapterPage({ params }: Props) {
  const { slug, chapterId } = params;

  // Fetch chapter + lessons song song
  const [chapterResult, lessonsResult] = await Promise.all([
    gql<{ chapters: Chapter[] }>(
      `query Chapters($courseId: ID!) {
        chapters(courseId: $courseId) {
          id courseId title description order x y parentId status
        }
      }`,
      { courseId: chapterId } // fallback — sẽ dùng chapters query để find chapter
    ),
    gql<{ lessons: Lesson[] }>(
      `query Lessons($chapterId: ID!) {
        lessons(chapterId: $chapterId) { id chapterId title order }
      }`,
      { chapterId }
    ),
  ]);

  // Tìm chapter hiện tại từ danh sách
  // Convex: chapters được query bởi courseId, không có getById endpoint qua NestJS
  // Dùng lessons để confirm chapter tồn tại
  const lessons = lessonsResult?.lessons ?? [];

  if (!lessons && !chapterResult) notFound();

  return (
    <ChapterClient courseSlug={slug} chapterId={chapterId} lessons={lessons} />
  );
}

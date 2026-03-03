import { notFound } from "next/navigation";
import type { Lesson, ContentBlock } from "@viztechstack/types";
import { LessonClient } from "./lesson-client";

interface Props {
  params: { slug: string; chapterId: string; lessonId: string };
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
      cache: "no-store",
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

export default async function LessonPage({ params }: Props) {
  const { slug, chapterId, lessonId } = params;

  // Fetch lessons + content blocks song song
  const [lessonsResult, contentBlocksResult] = await Promise.all([
    gql<{ lessons: Lesson[] }>(
      `query Lessons($chapterId: ID!) {
        lessons(chapterId: $chapterId) { id chapterId title order }
      }`,
      { chapterId }
    ),
    gql<{ contentBlocks: ContentBlock[] }>(
      `query ContentBlocks($lessonId: ID!) {
        contentBlocks(lessonId: $lessonId) {
          id lessonId type title content language order
        }
      }`,
      { lessonId }
    ),
  ]);

  const lessons = lessonsResult?.lessons ?? [];
  const lesson =
    lessons.find((l) => l.id === lessonId) ?? (lessons[0] ? null : null);
  const contentBlocks = contentBlocksResult?.contentBlocks ?? [];

  if (lessons.length === 0 || !lesson) notFound();

  return (
    <LessonClient
      courseSlug={slug}
      chapterId={chapterId}
      lessonId={lessonId}
      lessons={lessons}
      contentBlocks={contentBlocks}
    />
  );
}

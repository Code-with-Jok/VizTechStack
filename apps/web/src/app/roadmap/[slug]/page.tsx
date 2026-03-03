import { notFound } from "next/navigation";
import { RoadmapClient } from "./roadmap-client";
import type { Course, Chapter } from "@viztechstack/types";

interface Props {
  params: { slug: string };
}

// Server-side fetch — dùng trực tiếp thay vì api-client (tránh NEXT_PUBLIC_ env var issue trong RSC)
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

export default async function RoadmapPage({ params }: Props) {
  // 1. Fetch course by slug
  const courseData = await gql<{ courseBySlug: Course | null }>(
    `query CourseBySlug($slug: String!) {
      courseBySlug(slug: $slug) { id title description icon slug }
    }`,
    { slug: params.slug }
  );

  const course = courseData?.courseBySlug;
  if (!course) notFound();

  // 2. Fetch chapters bằng course.id (Convex Id)
  const chaptersData = await gql<{ chapters: Chapter[] }>(
    `query Chapters($courseId: ID!) {
      chapters(courseId: $courseId) {
        id courseId title description order x y parentId status
      }
    }`,
    { courseId: course.id }
  );

  const chapters = chaptersData?.chapters ?? [];

  return <RoadmapClient course={course} chapters={chapters} />;
}

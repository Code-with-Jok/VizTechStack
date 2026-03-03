import Link from "next/link";
import type { Course } from "@viztechstack/types";

// Server Component: dùng server-only env var (không có NEXT_PUBLIC_ prefix)
// hoặc fallback về localhost:4000 (default cho dev)
const INTERNAL_API_URL =
  process.env["INTERNAL_API_URL"] ??
  process.env["API_URL"] ??
  "http://localhost:4000/graphql";

async function getCourses(): Promise<Course[]> {
  try {
    const res = await fetch(INTERNAL_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "query { courses { id title description icon slug } }",
      }),
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      data?: { courses: Course[] };
      errors?: unknown[];
    };
    if (json.errors?.length) {
      console.error("GraphQL errors:", json.errors);
      return [];
    }
    return json.data?.courses ?? [];
  } catch (e) {
    console.error("getCourses error:", e);
    return [];
  }
}

export default async function HomePage() {
  const courses = await getCourses();

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">V</span>
          </div>
          <h1 className="text-lg font-semibold text-foreground">
            Viz<span className="text-primary">TechStack</span>
          </h1>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-4">
            Học bằng cách{" "}
            <span className="text-primary glow-text">Nhìn thấy</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Lộ trình học tương tác với mô phỏng 3D trực quan
          </p>
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/roadmap/${course.slug}`}
      className="group relative cursor-pointer rounded-xl border border-border bg-card p-6
                 transition-all hover:border-primary/50 hover:glow-primary hover:-translate-y-1
                 block"
    >
      <div className="text-5xl mb-4">{course.icon}</div>
      <h3 className="text-xl font-semibold text-foreground mb-2">
        {course.title}
      </h3>
      <p className="text-sm text-muted-foreground">{course.description}</p>
      <div className="mt-4 text-xs text-primary flex items-center gap-1">
        <span>Bắt đầu học</span>
        <span>→</span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 text-muted-foreground">
      <p className="text-lg mb-3">Chưa có khóa học nào.</p>
      <p className="text-sm">
        Đảm bảo NestJS API đang chạy tại{" "}
        <code className="px-2 py-0.5 rounded bg-secondary text-primary font-mono text-xs">
          http://localhost:4000
        </code>
      </p>
    </div>
  );
}

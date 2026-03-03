"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Lock, CheckCircle } from "lucide-react";
import type { Lesson } from "@viztechstack/types";

interface Props {
  courseSlug: string;
  chapterId: string;
  lessons: Lesson[];
}

export function ChapterClient({ courseSlug, chapterId, lessons }: Props) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push(`/roadmap/${courseSlug}`)}
            className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Lessons</h1>
            <p className="text-xs text-muted-foreground">
              Chapter · {chapterId.slice(-8)}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-2xl">
        {lessons.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Chưa có bài học nào cho chương này.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lessons
              .sort((a, b) => a.order - b.order)
              .map((lesson, i) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  index={i}
                  courseSlug={courseSlug}
                  chapterId={chapterId}
                />
              ))}
          </div>
        )}
      </main>
    </div>
  );
}

function LessonCard({
  lesson,
  index,
  courseSlug,
  chapterId,
}: {
  lesson: Lesson;
  index: number;
  courseSlug: string;
  chapterId: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
    >
      <Link
        href={`/roadmap/${courseSlug}/${chapterId}/${lesson.id}`}
        className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card
                   hover:border-primary/50 hover:glow-primary transition-all group"
      >
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary
                        flex items-center justify-center font-semibold text-sm"
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {lesson.title}
          </p>
        </div>
        <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </Link>
    </motion.div>
  );
}

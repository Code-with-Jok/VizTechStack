"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import type { Lesson, ContentBlock } from "@viztechstack/types";
import { WebAnatomyVisualizer } from "@/components/viz3d/WebAnatomyVisualizer";
import { MermaidDiagram } from "@/components/MermaidDiagram";

interface Props {
  courseSlug: string;
  chapterId: string;
  lessonId: string;
  lessons: Lesson[];
  contentBlocks: ContentBlock[];
}

export function LessonClient({
  courseSlug,
  chapterId,
  lessonId,
  lessons,
  contentBlocks,
}: Props) {
  const router = useRouter();
  const currentIndex = lessons.findIndex((l) => l.id === lessonId);
  const currentLesson = lessons[currentIndex];
  const prevLesson = lessons[currentIndex - 1];
  const nextLesson = lessons[currentIndex + 1];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/roadmap/${courseSlug}/${chapterId}`)}
              className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-foreground">
                {currentLesson?.title ?? "Lesson"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {currentIndex + 1} / {lessons.length}
              </p>
            </div>
          </div>

          {/* Prev / Next navigation */}
          <div className="flex items-center gap-2">
            {prevLesson && (
              <Link
                href={`/roadmap/${courseSlug}/${chapterId}/${prevLesson.id}`}
                className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            )}
            {nextLesson && (
              <Link
                href={`/roadmap/${courseSlug}/${chapterId}/${nextLesson.id}`}
                className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium
                           hover:bg-primary/90 transition-colors flex items-center gap-1"
              >
                Tiếp theo
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container mx-auto px-6 py-12 max-w-3xl">
        {contentBlocks.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">
            Chưa có nội dung.
          </p>
        ) : (
          <div className="space-y-8">
            {contentBlocks
              .sort((a, b) => a.order - b.order)
              .map((block, i) => (
                <ContentBlockView key={block.id} block={block} index={i} />
              ))}
          </div>
        )}
      </main>
    </div>
  );
}

function ContentBlockView({
  block,
  index,
}: {
  block: ContentBlock;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      {block.title && (
        <h2 className="text-xl font-semibold text-foreground mb-3">
          {block.title}
        </h2>
      )}

      {block.type === "text" ? (
        <div className="prose prose-invert max-w-none">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {block.content}
          </p>
        </div>
      ) : block.type === "code" ? (
        <div className="rounded-xl overflow-hidden border border-border">
          <div className="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border">
            <span className="text-xs text-muted-foreground font-mono">
              {block.language ?? "code"}
            </span>
          </div>
          <pre className="p-4 overflow-x-auto bg-card text-sm">
            <code className="text-foreground font-mono leading-relaxed">
              {block.content}
            </code>
          </pre>
        </div>
      ) : block.type === "interactive" ? (
        <div className="w-full mt-8 border border-border rounded-2xl overflow-hidden shadow-2xl">
          <WebAnatomyVisualizer />
        </div>
      ) : block.type === "diagram" ? (
        <div className="rounded-xl border border-primary/20 bg-card p-6 overflow-x-auto">
          <MermaidDiagram chart={block.content} />
        </div>
      ) : block.type === "quiz" ? (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
          <p className="text-foreground">{block.content}</p>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-muted-foreground">{block.content}</p>
        </div>
      )}
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { Course, Chapter } from "@viztechstack/types";

interface Props {
  course: Course;
  chapters: Chapter[];
}

export function RoadmapClient({ course, chapters }: Props) {
  const router = useRouter();

  // SVG connectors between parent-child chapters
  const connectors = chapters
    .filter((ch) => ch.parentId)
    .map((ch) => {
      const parent = chapters.find((p) => p.id === ch.parentId);
      if (!parent) return null;
      return { from: parent, to: ch, key: `${parent.id}-${ch.id}` };
    })
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded-lg hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-2xl">{course.icon}</span>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Roadmap {course.title}</h1>
            <p className="text-xs text-muted-foreground">{course.description}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="relative" style={{ minHeight: "700px" }}>
          {/* SVG Connectors */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {connectors.map((conn) => {
              if (!conn) return null;
              const { from, to, key } = conn;
              const fromX = from.x + 80;
              const fromY = from.y + 40;
              const toX = to.x + 80;
              const toY = to.y;
              const midY = (fromY + toY) / 2;
              return (
                <motion.path
                  key={key}
                  d={`M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`}
                  className="node-connector"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  style={{ stroke: "hsl(var(--node-border))", fill: "none", strokeWidth: 2 }}
                />
              );
            })}
          </svg>

          {/* Chapter Nodes */}
          {chapters.map((chapter, i) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute"
              style={{ left: chapter.x, top: chapter.y, zIndex: 1 }}
            >
              <Link
                href={`/roadmap/${course.slug}/${chapter.id}`}
                className={`block w-40 rounded-xl border p-4 text-center transition-all
                  ${chapter.status === "completed"
                    ? "border-green-500/50 bg-green-500/10"
                    : chapter.status === "available"
                    ? "border-node-border bg-node-bg hover:border-primary/50 hover:glow-primary cursor-pointer"
                    : "border-border/30 bg-muted/20 opacity-40 pointer-events-none cursor-not-allowed"
                  }`}
              >
                <h3 className="text-sm font-semibold text-foreground">{chapter.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{chapter.description}</p>
                <span className="mt-2 inline-block text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {chapter.status}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

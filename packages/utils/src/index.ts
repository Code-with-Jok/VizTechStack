import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Tailwind helper ──────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── ID Generation ───────────────────────────────────────────────────────────
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ─── 3D Scene Mapping ────────────────────────────────────────────────────────
import type { SceneKey } from "@viztechstack/types";

const LESSON_SCENE_MAP: Record<string, SceneKey> = {
  // Next.js module
  "what-is-nextjs": "default",
  "app-router-intro": "app-router",
  "server-components": "server-components",
  "client-components": "component-tree",
  "data-fetching-nextjs": "data-fetching",
  "nextjs-routing": "app-router",
  // React fundamentals (nếu có)
  "what-is-react": "virtual-dom",
  "what-is-component": "component-tree",
  "jsx-basics": "jsx",
  "props-basics": "props-flow",
  "usestate": "state",
};

const CHAPTER_SCENE_MAP: Record<string, SceneKey> = {
  "app-router": "app-router",
  "server-components": "server-components",
  "data-fetching": "data-fetching",
  "components-jsx": "jsx",
  "props": "props-flow",
  "state": "state",
};

export function getSceneKey(chapterId?: string, lessonId?: string): SceneKey {
  if (lessonId && LESSON_SCENE_MAP[lessonId]) return LESSON_SCENE_MAP[lessonId]!;
  if (chapterId && CHAPTER_SCENE_MAP[chapterId]) return CHAPTER_SCENE_MAP[chapterId]!;
  return "default";
}

export const SCENE_LABELS: Record<SceneKey, string> = {
  "virtual-dom": "Virtual DOM & Diffing",
  "component-tree": "Component Tree",
  "jsx": "JSX → createElement",
  "props-flow": "Props & Data Flow",
  "state": "State & Re-render",
  "app-router": "App Router Architecture",
  "server-components": "Server vs Client Components",
  "data-fetching": "Data Fetching Patterns",
  "default": "3D Visualization",
};

// ─── String helpers ───────────────────────────────────────────────────────────
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

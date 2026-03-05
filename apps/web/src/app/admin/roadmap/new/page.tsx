"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import type {
  CreateRoadmapInput,
  RoadmapCategory,
  RoadmapDifficulty,
  RoadmapStatus,
} from "@viztechstack/types";
import { RoadmapEditor } from "@/components/roadmap-editor";
import Link from "next/link";
import { createRoadmapClient } from "@/lib/api-client/roadmaps";

type RoadmapFormState = Pick<
  CreateRoadmapInput,
  "title" | "slug" | "description" | "category" | "difficulty" | "status"
>;

export default function NewRoadmapPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [formData, setFormData] = useState<RoadmapFormState>({
    title: "",
    slug: "",
    description: "",
    category: "role",
    difficulty: "beginner",
    status: "public",
  });
  const [graphData, setGraphData] = useState({
    nodesJson: "[]",
    edgesJson: "[]",
    topicCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Missing access token");
      }

      await createRoadmapClient(
        {
          ...formData,
          ...graphData,
        },
        token
      );

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create roadmap");
    } finally {
      setLoading(false);
    }
  };

  const handleGraphChange = useCallback(
    (nodes: string, edges: string, count: number) => {
      setGraphData({ nodesJson: nodes, edgesJson: edges, topicCount: count });
    },
    []
  );

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
      <header className="border-b bg-white dark:bg-zinc-950 dark:border-zinc-800">
        <div className="container mx-auto max-w-5xl flex h-16 items-center px-4 justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono"
          >
            roadmap.sh
          </Link>
          <div className="flex items-center space-x-2 text-sm text-zinc-500 font-medium">
            <span>Admin Control Panel</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-5xl px-4 py-8">
        <div className="flex justify-between items-center mb-8 border-b dark:border-zinc-800 pb-4">
          <h1 className="text-3xl font-bold dark:text-zinc-50">
            Tạo mới Roadmap
          </h1>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
          >
            Huỷ bỏ
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 p-4 rounded-md mb-6 border border-red-200 dark:border-red-900 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded-xl shadow-sm">
            <div className="space-y-3">
              <label className="text-sm font-semibold dark:text-zinc-200">
                Tiêu đề (Title)
              </label>
              <input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="VD: DevOps Engineer"
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 dark:text-zinc-50"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold dark:text-zinc-200">
                Đường dẫn tĩnh (Slug)
              </label>
              <input
                required
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
                placeholder="VD: devops"
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 dark:text-zinc-50"
              />
            </div>

            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-semibold dark:text-zinc-200">
                Mô tả (Description)
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Nhập mô tả chi tiết lộ trình..."
                className="flex min-h-[100px] w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 dark:text-zinc-50"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold dark:text-zinc-200">
                Phân loại (Category)
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 dark:text-zinc-50"
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as RoadmapCategory,
                  })
                }
              >
                <option value="role">Role (Nghề nghiệp)</option>
                <option value="skill">Skill (Kỹ năng)</option>
                <option value="best-practice">Best Practice</option>
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold dark:text-zinc-200">
                Độ khó (Difficulty)
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 dark:text-zinc-50"
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as RoadmapDifficulty,
                  })
                }
              >
                <option value="beginner">Beginner (Ngôn ngữ)</option>
                <option value="intermediate">Intermediate (Trung cấp)</option>
                <option value="advanced">Advanced (Nâng cao)</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold dark:text-zinc-200">
                Trạng thái (Status)
              </label>
              <select
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 dark:focus-visible:ring-zinc-300 dark:text-zinc-50 font-bold"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as RoadmapStatus,
                  })
                }
              >
                <option value="public" className="text-green-500 font-bold">
                  Public (Công khai)
                </option>
                <option value="draft" className="text-yellow-500 font-bold">
                  Draft (Bản nháp)
                </option>
                <option value="private" className="text-zinc-500 font-bold">
                  Private (Riêng tư)
                </option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold dark:text-zinc-50">
              Builder Graph Editor
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Hãy thêm các Node mới và nối các dây kết nối lại với nhau bằng
              cách kéo thả con trỏ chuột. Dữ liệu sẽ được trích xuất dưới dạng
              toạ độ JSON map 1:1 với UI chi tiết.
            </p>
            <RoadmapEditor onChange={handleGraphChange} />
          </div>

          <div className="flex justify-end pt-4 border-t dark:border-zinc-800 border-zinc-200">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-zinc-900 text-zinc-50 shadow hover:bg-zinc-900/90 h-11 px-8 py-2 w-full md:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90 disabled:opacity-50"
            >
              {loading ? "Đang lưu vào Convex..." : "📝 Xác nhận tạo Roadmap"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

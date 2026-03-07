import { auth } from "@clerk/nextjs/server";
import type { RoadmapSummary } from "@viztechstack/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getRoadmapsPageServer } from "@/lib/api-client/roadmaps";
import { DeleteRoadmapButton } from "@/components/admin/delete-roadmap-button";

export default async function AdminRoadmapsPage() {
    const { getToken } = await auth();
    const token = await getToken();
    const roadmapsPage = await getRoadmapsPageServer({
        token: token ?? undefined,
        cache: "no-store",
        limit: 100,
    });
    const roadmaps = roadmapsPage.items;

    return (
        <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
            <main className="flex-1 container mx-auto max-w-5xl px-4 py-8">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold dark:text-zinc-50 tracking-tight">
                            Quản lý Lộ trình
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                            Danh sách tất cả các roadmap hiện có trong hệ thống
                        </p>
                    </div>
                    <Link href="/admin/roadmaps/new">
                        <Button className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 shadow-lg hover:shadow-zinc-500/20 transition-all">
                            <Plus className="mr-2 h-4 w-4" /> Tạo Roadmap mới
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-4">
                    {roadmaps.length === 0 ? (
                        <div className="text-center py-20 border-2 border-dashed rounded-2xl dark:border-zinc-800 text-zinc-500">
                            Chưa có dữ liệu roadmap nào. Hãy click &quot;Tạo Roadmap mới&quot;
                            hoặc chạy script Seed.
                        </div>
                    ) : (
                        roadmaps.map((r: RoadmapSummary) => (
                            <div
                                key={r.id}
                                className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:border-purple-500/50 transition-all duration-300"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 font-bold border border-purple-500/20">
                                        {r.title.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center space-x-2">
                                            <h3 className="text-lg font-bold dark:text-zinc-50">
                                                {r.title}
                                            </h3>
                                            <Badge
                                                className={
                                                    r.status === "public"
                                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                        : r.status === "draft"
                                                            ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                                            : "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                                                }
                                                variant="outline"
                                            >
                                                {r.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-xs text-zinc-500 font-mono">
                                                {r.slug}
                                            </span>
                                            <span className="text-zinc-300 dark:text-zinc-800">
                                                •
                                            </span>
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] h-4 uppercase"
                                            >
                                                {r.category}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className="text-[10px] h-4 uppercase"
                                            >
                                                {r.difficulty}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/roadmaps/${r.slug}`}>
                                        <Button variant="ghost" size="icon" className="h-9 w-9">
                                            <Eye className="h-4 w-4 text-zinc-500" />
                                        </Button>
                                    </Link>
                                    <Link href={`/admin/roadmaps/${r.slug}/edit`}>
                                        <Button variant="ghost" size="icon" className="h-9 w-9">
                                            <Settings className="h-4 w-4 text-zinc-500" />
                                        </Button>
                                    </Link>
                                    <DeleteRoadmapButton roadmapId={r.id} roadmapTitle={r.title} />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

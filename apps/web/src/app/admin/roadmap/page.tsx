import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const GET_ROADMAPS = `
  query GetRoadmaps {
    getRoadmaps {
      _id
      slug
      title
      category
      difficulty
      topicCount
      status
    }
  }
`;

async function fetchRoadmaps() {
  const { getToken } = await auth();
  const token = await getToken();

  try {
    const graphqlUrl =
      process.env.GRAPHQL_URL || "http://localhost:4000/graphql";
    if (!graphqlUrl)
      throw new Error("Missing GRAPHQL_URL environment variable");
    const res = await fetch(graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ query: GET_ROADMAPS }),
      cache: "no-store",
    });
    const json = await res.json();
    return json?.data?.getRoadmaps || [];
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    return [];
  }
}

export default async function AdminRoadmapPage() {
  const roadmaps = await fetchRoadmaps();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
      <header className="border-b bg-white dark:bg-zinc-950 dark:border-zinc-800 sticky top-0 z-50">
        <div className="container mx-auto max-w-5xl flex h-16 items-center px-4 justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono"
          >
            roadmap.sh
          </Link>
          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className="text-purple-500 border-purple-500/30 bg-purple-500/5 mr-4"
            >
              Admin
            </Badge>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium hover:underline text-zinc-900 dark:text-zinc-50 cursor-pointer">
                  Đăng nhập
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>

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
          <Link href="/admin/roadmap/new">
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
            roadmaps.map(
              (r: {
                _id: string;
                title: string;
                slug: string;
                category: string;
                difficulty: string;
                status: string;
              }) => (
                <div
                  key={r._id}
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
                    <Link href={`/roadmap/${r.slug}`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Eye className="h-4 w-4 text-zinc-500" />
                      </Button>
                    </Link>
                    <Link href={`/admin/roadmap/${r.slug}/settings`}>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Settings className="h-4 w-4 text-zinc-500" />
                      </Button>
                    </Link>
                    <form
                      action={async () => {
                        "use server";
                        console.log("Delete roadmap", r._id);
                        // TODO: Implement actual deletion
                      }}
                    >
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </main>
    </div>
  );
}

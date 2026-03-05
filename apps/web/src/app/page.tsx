import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { RoadmapSummary } from "@viztechstack/types";
import Link from "next/link";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { getRoadmapsPageServer } from "@/lib/api-client/roadmaps";

interface ClerkSessionClaims {
  metadata?: {
    role?: string;
  };
}

export default async function Home() {
  let roadmaps: RoadmapSummary[] = [];

  try {
    const roadmapsPage = await getRoadmapsPageServer({
      limit: 24,
      cache: "force-cache",
      revalidate: 120,
      tags: ["roadmaps-public"],
    });
    roadmaps = roadmapsPage.items;
  } catch {
    // Keep homepage available even when API is unreachable at build/runtime.
  }

  const { sessionClaims } = await auth();

  const claims = sessionClaims as ClerkSessionClaims | null;
  const isAdmin = claims?.metadata?.role === "admin";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black font-sans">
      <header className="border-b bg-white dark:bg-zinc-950 dark:border-zinc-800">
        <div className="container mx-auto max-w-5xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              roadmap.sh
            </Link>
            {isAdmin && (
              <Button
                asChild
                variant="ghost"
                className="text-purple-600 font-bold hover:bg-purple-50 hover:text-purple-700"
              >
                <Link href="/admin/roadmap">
                  <ShieldCheck className="mr-2 h-4 w-4" /> Admin Dashboard
                </Link>
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4">
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

      <main className="flex-1 container mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-col items-center mb-16 space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl text-zinc-900 dark:text-zinc-50">
            Developer Roadmaps
          </h1>
          <p className="max-w-[85%] text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl">
            Step by step guides and paths to learn different tools or
            technologies
          </p>
        </div>

        {roadmaps.length === 0 ? (
          <div className="text-center text-zinc-500 py-12">
            No roadmaps found or Backend is not running yet.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roadmaps.map((r: RoadmapSummary) => (
                <Link key={r._id} href={`/roadmap/${r.slug}`}>
                  <Card className="h-full transition-all hover:border-zinc-400 dark:hover:border-zinc-700 hover:shadow-md cursor-pointer flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="capitalize">
                          {r.category || "Role"}
                        </Badge>
                        <Badge variant="outline" className="capitalize text-xs">
                          {r.difficulty || "Beginner"}
                        </Badge>
                      </div>
                      <CardTitle className="text-xl">{r.title}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-2">
                        {r.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            )}
          </div>
        )}
      </main>
    </div>
  );
}

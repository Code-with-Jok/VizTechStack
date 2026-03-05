import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const GET_ROADMAP = `
  query GetRoadmapBySlug($slug: String!) {
    getRoadmapBySlug(slug: $slug) {
      _id
      slug
      title
      description
      category
      difficulty
      nodesJson
      edgesJson
      topicCount
    }
  }
`;

async function fetchRoadmap(slug: string) {
  try {
    const graphqlUrl =
      process.env.GRAPHQL_URL || "http://localhost:4000/graphql";
    const res = await fetch(graphqlUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: GET_ROADMAP, variables: { slug } }),
      cache: "no-store",
    });
    const json = await res.json();
    if (json.errors) {
      console.error("GraphQL errors fetching roadmap:", json.errors);
      return null;
    }
    return json?.data?.getRoadmapBySlug || null;
  } catch (error) {
    console.error("Error fetching roadmap:", error);
    return null;
  }
}

import { RoadmapGraph } from "@/components/roadmap-graph";

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const roadmap = await fetchRoadmap(slug);

  if (!roadmap) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black font-sans">
        <h1 className="text-2xl font-bold mb-4 dark:text-zinc-50">
          Roadmap not found
        </h1>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

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
      <main className="flex-1 container mx-auto max-w-5xl px-4 py-8 flex flex-col h-full">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="-ml-4 text-zinc-500">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to roadmaps
            </Button>
          </Link>
        </div>
        <div className="flex flex-col mb-4 border-b pb-4 dark:border-zinc-800 shrink-0">
          <div className="flex gap-2 mb-4">
            <Badge variant="secondary" className="capitalize">
              {roadmap.category || "Role"}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {roadmap.difficulty || "Beginner"}
            </Badge>
          </div>
          <h1 className="text-4xl font-bold mb-2 dark:text-zinc-50">
            {roadmap.title}
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            {roadmap.description}
          </p>
        </div>

        <div className="flex flex-1 min-h-[60vh] border rounded-lg overflow-hidden bg-white dark:bg-zinc-900">
          <RoadmapGraph
            initialNodesJson={roadmap.nodesJson}
            initialEdgesJson={roadmap.edgesJson}
            topicCount={roadmap.topicCount}
          />
        </div>
      </main>
    </div>
  );
}

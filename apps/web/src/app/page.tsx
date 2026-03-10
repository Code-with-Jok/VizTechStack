import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, BookOpen } from "lucide-react";

interface ClerkSessionClaims {
  metadata?: {
    role?: string;
  };
}

export default async function Home() {
  const { sessionClaims } = await auth();
  const claims = sessionClaims as ClerkSessionClaims | null;
  const isAdmin = claims?.metadata?.role === "admin";

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-16">
      <section className="rounded-[2rem] border border-zinc-200 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.18),transparent_40%),linear-gradient(135deg,#ffffff,#f4f4f5)] p-8 shadow-sm sm:p-12">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
              Technology Roadmaps
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              Welcome to VizTechStack
            </h1>
            <p className="text-base leading-7 text-zinc-700 sm:text-lg">
              Explore curated learning paths for modern technologies.
              Discover structured roadmaps to guide your development journey
              and stay up-to-date with the latest tech trends.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/75 p-4 text-sm font-medium text-zinc-700 backdrop-blur">
              <BookOpen className="h-5 w-5 mb-2 text-blue-600" />
              Curated learning paths for developers
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/75 p-4 text-sm font-medium text-zinc-700 backdrop-blur">
              <ArrowRight className="h-5 w-5 mb-2 text-green-600" />
              Step-by-step progression guides
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/75 p-4 text-sm font-medium text-zinc-700 backdrop-blur">
              <Shield className="h-5 w-5 mb-2 text-purple-600" />
              Industry best practices included
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="group">
              <Link href="/roadmaps">
                Explore Roadmaps
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>

            {isAdmin && (
              <Button asChild variant="outline" size="lg">
                <Link href="/admin/roadmaps">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Panel
                </Link>
              </Button>
            )}
          </div>

          {isAdmin && (
            <p className="rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 text-sm text-zinc-600">
              <Shield className="inline h-4 w-4 mr-2" />
              Admin access detected. You can manage roadmaps through the admin panel.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

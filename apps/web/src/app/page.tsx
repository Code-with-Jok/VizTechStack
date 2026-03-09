import { auth } from "@clerk/nextjs/server";

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
        <div className="max-w-3xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-500">
            Product reset
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
            VizTechStack is being rebuilt
          </h1>
          <p className="text-base leading-7 text-zinc-700 sm:text-lg">
            The previous product implementation has been cleared out. What remains is a clean shell for the next product direction.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/75 p-4 text-sm font-medium text-zinc-700 backdrop-blur">
              Only the base layout and authentication shell remain.
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/75 p-4 text-sm font-medium text-zinc-700 backdrop-blur">
              API and data contracts were reduced to the minimum surface.
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/75 p-4 text-sm font-medium text-zinc-700 backdrop-blur">
              The app is ready for a fresh redesign pass.
            </div>
          </div>
          {isAdmin && (
            <p className="rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 text-sm text-zinc-600">
              Admin-only feature surfaces were removed together with the previous implementation.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

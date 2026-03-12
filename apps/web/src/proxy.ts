import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const isAdmin = isAdminRoute(req);

  if (isAdmin) {
    try {
      const session = await auth();
      type ClerkSessionClaims = { metadata?: { role?: string } };
      const claims = session.sessionClaims as ClerkSessionClaims | null;
      const role = claims?.metadata?.role;

      if (role !== "admin") {
        // Nếu không phải admin, redirect về trang chủ
        const url = new URL("/", req.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // If there's an auth error, redirect to home
      console.error("Auth error in middleware:", error);
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }

  // Return NextResponse.next() to continue processing
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

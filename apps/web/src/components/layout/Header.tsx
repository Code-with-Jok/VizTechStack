"use client";

import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import UserButtonWrapper from "../auth/user-button-wrapper";

export function Header() {
  return (
    <header className="border-b bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          VizTechStack
        </Link>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="cursor-pointer text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButtonWrapper />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

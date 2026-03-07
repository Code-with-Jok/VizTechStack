'use client';

import Link from 'next/link';
import { useUser, SignedOut, SignInButton, SignedIn } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import UserButtonWrapper from '../auth/user-button-wrapper';

export function Header() {
    const { user } = useUser();
    const isAdmin = user?.publicMetadata?.role === 'admin';

    return (
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
                            <Link href="/admin/roadmaps">
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
                        <UserButtonWrapper />
                    </SignedIn>
                </div>
            </div>
        </header>
    )
}

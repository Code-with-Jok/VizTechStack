"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to roadmaps management page
        router.push('/admin/roadmaps');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-64">
            <p className="text-zinc-600 dark:text-zinc-400">
                Redirecting to roadmaps management...
            </p>
        </div>
    );
}
"use client";

import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAdmin, isLoading, isSignedIn } = useAuth();
    const router = useRouter();

    // Redirect về homepage nếu !isSignedIn
    useEffect(() => {
        if (!isLoading && !isSignedIn) {
            router.push('/');
        }
    }, [isLoading, isSignedIn, router]);

    // Show loading state khi isLoading
    if (isLoading) {
        return (
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show permission denied nếu !isAdmin
    if (!isAdmin) {
        return (
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <Alert variant="destructive">
                    <AlertDescription>
                        Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể quản lý roadmaps.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Render children nếu isAdmin
    return (
        <div className="container mx-auto max-w-6xl px-4 py-8">
            {children}
        </div>
    );
}
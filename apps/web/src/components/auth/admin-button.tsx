"use client";

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';

/**
 * Admin Button Component
 * 
 * Component này hiển thị button "Admin" chỉ khi user có role admin.
 * Sử dụng conditional rendering để ẩn button với non-admin users.
 * 
 * @returns {JSX.Element | null} Admin button hoặc null nếu user không phải admin
 * 
 * @example
 * ```tsx
 * // Trong Header component
 * <AdminButton />
 * ```
 */
export function AdminButton() {
    const { isAdmin, isLoading, role, userId } = useAuth();

    // Debug log để kiểm tra giá trị
    console.log('AdminButton Debug:', { isAdmin, isLoading, role, userId });

    // Return null nếu đang loading hoặc user không phải admin
    // Điều này sẽ ẩn hoàn toàn component khỏi DOM
    if (isLoading || !isAdmin) {
        return null;
    }

    return (
        <Button asChild variant="outline" size="sm">
            <Link href="/admin/roadmaps">
                <Shield className="mr-2 h-4 w-4" />
                Admin
            </Link>
        </Button>
    );
}
"use client";

import { useAuth } from '@/lib/hooks/use-auth';

/**
 * Demo component để minh họa cách sử dụng useAuth hook
 * Component này có thể được sử dụng để test hook trong development
 */
export function AuthDemo() {
    const { isSignedIn, isAdmin, isUser, userId, role, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold mb-2">Auth Status</h3>
                <p>Loading authentication state...</p>
            </div>
        );
    }

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold mb-2">Auth Status</h3>
            <div className="space-y-1 text-sm">
                <p><strong>Signed In:</strong> {isSignedIn ? 'Yes' : 'No'}</p>
                <p><strong>User ID:</strong> {userId || 'N/A'}</p>
                <p><strong>Role:</strong> {role || 'No role assigned'}</p>
                <p><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</p>
                <p><strong>Is User:</strong> {isUser ? 'Yes' : 'No'}</p>
                <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            </div>

            {isAdmin && (
                <div className="mt-3 p-2 bg-blue-100 rounded text-blue-800 text-sm">
                    🛡️ Admin access granted - You can access admin features
                </div>
            )}

            {isUser && !isAdmin && (
                <div className="mt-3 p-2 bg-green-100 rounded text-green-800 text-sm">
                    👤 User access - You have standard user permissions
                </div>
            )}

            {!isSignedIn && (
                <div className="mt-3 p-2 bg-yellow-100 rounded text-yellow-800 text-sm">
                    🔒 Please sign in to access protected features
                </div>
            )}
        </div>
    );
}
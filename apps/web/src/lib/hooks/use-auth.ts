import { useUser } from '@clerk/nextjs';

export interface UseAuthReturn {
    isSignedIn: boolean;
    isAdmin: boolean;
    isUser: boolean;
    userId: string | null;
    role: string | null;
    isLoading: boolean;
}

/**
 * Custom hook để quản lý authentication state và role-based access
 * 
 * @returns {UseAuthReturn} Object chứa authentication state và user role information
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isSignedIn, isAdmin, isUser, userId, role, isLoading } = useAuth();
 *   
 *   if (isLoading) return <div>Loading...</div>;
 *   
 *   if (!isSignedIn) return <div>Please sign in</div>;
 *   
 *   if (isAdmin) {
 *     return <AdminPanel />;
 *   }
 *   
 *   return <UserContent />;
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
    const { isSignedIn, user, isLoaded } = useUser();

    // Extract role từ user.publicMetadata
    // Role được lưu trong publicMetadata.role bởi Clerk
    const role = user?.publicMetadata?.role as string | undefined;

    // Set isAdmin = true khi role === "admin"
    const isAdmin = role === 'admin';

    // Set isUser = true khi role === "user" hoặc không có role (default)
    const isUser = role === 'user' || !role;

    return {
        // isSignedIn từ Clerk, fallback về false nếu undefined
        isSignedIn: isSignedIn ?? false,
        isAdmin,
        isUser,
        // userId từ Clerk user object
        userId: user?.id ?? null,
        // role từ publicMetadata, fallback về null nếu không có
        role: role ?? null,
        // isLoading = true khi Clerk chưa load xong user data
        isLoading: !isLoaded,
    };
}
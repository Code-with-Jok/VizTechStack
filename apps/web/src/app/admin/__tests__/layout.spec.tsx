/**
 * Admin Layout Protection Test
 *
 * Tests the admin layout component to ensure proper route protection
 * and permission checks for different user states.
 *
 * **Validates: Requirement 6**
 *
 * Test Strategy:
 * - Test loading state when Clerk is loading
 * - Test redirect behavior for unauthenticated users
 * - Test permission denied for non-admin users
 * - Test successful rendering for admin users
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import AdminLayout from "../layout";
import { useAuth } from "@/lib/hooks/use-auth";

// Mock next/navigation
jest.mock("next/navigation", () => ({
    useRouter: jest.fn(),
}));

// Mock useAuth hook
jest.mock("@/lib/hooks/use-auth", () => ({
    useAuth: jest.fn(),
}));

const mockPush = jest.fn();
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe("AdminLayout", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRouter.mockReturnValue({
            push: mockPush,
            back: jest.fn(),
            forward: jest.fn(),
            refresh: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
        });
    });

    it("should show loading state when isLoading is true", () => {
        // Arrange: User is loading
        mockUseAuth.mockReturnValue({
            isAdmin: false,
            isLoading: true,
            isSignedIn: false,
            isUser: false,
            userId: null,
            role: null,
        });

        // Act: Render layout
        render(
            <AdminLayout>
                <div>Admin Content</div>
            </AdminLayout>
        );

        // Assert: Loading state is shown
        expect(screen.getByText("Đang tải...")).toBeInTheDocument();
        expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
    });

    it("should redirect to homepage when user is not signed in", () => {
        // Arrange: User is not signed in
        mockUseAuth.mockReturnValue({
            isAdmin: false,
            isLoading: false,
            isSignedIn: false,
            isUser: false,
            userId: null,
            role: null,
        });

        // Act: Render layout
        render(
            <AdminLayout>
                <div>Admin Content</div>
            </AdminLayout>
        );

        // Assert: Redirect to homepage is called
        expect(mockPush).toHaveBeenCalledWith("/");
    });

    it("should show permission denied when user is signed in but not admin", () => {
        // Arrange: User is signed in but not admin
        mockUseAuth.mockReturnValue({
            isAdmin: false,
            isLoading: false,
            isSignedIn: true,
            isUser: true,
            userId: "user123",
            role: "user",
        });

        // Act: Render layout
        render(
            <AdminLayout>
                <div>Admin Content</div>
            </AdminLayout>
        );

        // Assert: Permission denied message is shown
        expect(
            screen.getByText(
                "Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể quản lý roadmaps."
            )
        ).toBeInTheDocument();
        expect(screen.queryByText("Admin Content")).not.toBeInTheDocument();
    });

    it("should render children when user is admin", () => {
        // Arrange: User is admin
        mockUseAuth.mockReturnValue({
            isAdmin: true,
            isLoading: false,
            isSignedIn: true,
            isUser: false,
            userId: "admin123",
            role: "admin",
        });

        // Act: Render layout
        render(
            <AdminLayout>
                <div>Admin Content</div>
            </AdminLayout>
        );

        // Assert: Admin content is rendered
        expect(screen.getByText("Admin Content")).toBeInTheDocument();
        expect(
            screen.queryByText("Bạn không có quyền truy cập trang này")
        ).not.toBeInTheDocument();
    });

    it("should not redirect when user is admin", () => {
        // Arrange: User is admin
        mockUseAuth.mockReturnValue({
            isAdmin: true,
            isLoading: false,
            isSignedIn: true,
            isUser: false,
            userId: "admin123",
            role: "admin",
        });

        // Act: Render layout
        render(
            <AdminLayout>
                <div>Admin Content</div>
            </AdminLayout>
        );

        // Assert: No redirect is called
        expect(mockPush).not.toHaveBeenCalled();
    });

    it("should handle edge case where user is signed in but role is undefined", () => {
        // Arrange: User is signed in but role is undefined (should default to user)
        mockUseAuth.mockReturnValue({
            isAdmin: false,
            isLoading: false,
            isSignedIn: true,
            isUser: true,
            userId: "user123",
            role: null,
        });

        // Act: Render layout
        render(
            <AdminLayout>
                <div>Admin Content</div>
            </AdminLayout>
        );

        // Assert: Permission denied is shown (not admin)
        expect(
            screen.getByText(
                "Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể quản lý roadmaps."
            )
        ).toBeInTheDocument();
    });
});
# Implementation Plan: Frontend User Access Logic và RBAC Integration

## Tổng quan

Triển khai logic truy cập người dùng và tích hợp RBAC cho frontend VizTechStack với 3 loại người dùng: Guest (chưa đăng nhập), User (đã đăng nhập), và Admin (quản trị viên). 

**Điểm quan trọng về quyền truy cập:**
- Guest và User có **CÙNG quyền** (chỉ xem roadmaps - read-only)
- Sự khác biệt duy nhất: Guest thấy "Sign in" button, User thấy User button
- Chỉ Admin có quyền CRUD roadmaps

**Tech Stack:** Next.js 16.1.6, React 19.2.3, TypeScript 5.7, Clerk authentication, Tailwind CSS 4, shadcn/ui

## Tasks

- [ ] 1. Setup Authentication Hook và Core Types
  - [ ] 1.1 Tạo useAuth hook với TypeScript interfaces
    - Tạo file `apps/web/src/lib/hooks/use-auth.ts`
    - Implement interface `UseAuthReturn` với các field: isSignedIn, isAdmin, isUser, userId, role, isLoading
    - Implement hook `useAuth()` sử dụng Clerk's `useUser()` hook
    - Extract role từ `user.publicMetadata.role`
    - Set `isAdmin = true` khi `role === "admin"`
    - Set `isUser = true` khi `role === "user"` hoặc không có role
    - Return authentication state object
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 12.4, 12.5_
  
  - [ ]* 1.2 Write property test for useAuth hook
    - **Property 1: Authentication State Consistency**
    - **Property 2: useAuth Hook Return Structure**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
    - Test với fast-check: admin users are always signed in
    - Test role exclusivity: user cannot be both admin and regular user
    - Test return object structure contains all required fields

- [ ] 2. Implement Admin Button Component
  - [ ] 2.1 Tạo AdminButton component
    - Tạo file `apps/web/src/components/auth/admin-button.tsx`
    - Import useAuth hook, Button component từ shadcn/ui, Shield icon từ lucide-react
    - Component return null nếu `isLoading === true` hoặc `isAdmin === false`
    - Render Button với variant="outline", size="sm"
    - Button link đến "/admin/roadmaps"
    - Hiển thị Shield icon và text "Admin"
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 2.2 Write unit tests for AdminButton component
    - **Validates: Requirement 3.1**
    - Test: returns null when user is not admin
    - Test: renders button when user is admin
    - Test: button links to correct route
    - Test: shows correct icon and text

- [ ] 3. Update Header Component với Role-Based Rendering
  - [ ] 3.1 Update Header component
    - Mở file `apps/web/src/components/layout/Header.tsx`
    - Import AdminButton component
    - Thêm Link component cho "Roadmaps" (href="/roadmaps") vào navigation
    - Đặt AdminButton component trong `<SignedIn>` block, trước UserButtonWrapper
    - Verify rendering logic: Guest → Sign in button, User → User button, Admin → Admin button + User button
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [ ]* 3.2 Write integration tests for Header component
    - **Property 5: Roadmaps Link Visibility**
    - **Property 9: UI Element Visibility Based on Auth State**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5**
    - Test: Roadmaps link visible for all user types
    - Test: Sign in button visible only for guests
    - Test: User button visible only for signed-in users
    - Test: Admin button visible only for admin users

- [ ] 4. Checkpoint - Verify authentication UI
  - Chạy `pnpm dev` và kiểm tra Header component
  - Test với Guest user: thấy "Sign in" button và "Roadmaps" link
  - Test với User: thấy User button và "Roadmaps" link (không thấy Admin button)
  - Test với Admin: thấy Admin button, User button và "Roadmaps" link
  - Chạy `pnpm typecheck` và `pnpm lint` - phải pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Create Public Roadmaps Page
  - [ ] 5.1 Tạo public roadmaps page
    - Tạo file `apps/web/src/app/roadmaps/page.tsx`
    - Export metadata với title "Technology Roadmaps | VizTechStack" và description phù hợp
    - Implement Server Component (không cần "use client")
    - Render page header với title "Technology Roadmaps"
    - Render description "Khám phá các lộ trình học tập được tuyển chọn cho các công nghệ hiện đại"
    - Thêm placeholder content cho roadmap list (sẽ implement data fetching ở phase sau)
    - Style với Tailwind CSS: container, max-width, padding, responsive
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 5.2 Write integration tests for Roadmaps page
    - **Property 6: Public Roadmap Access**
    - **Validates: Requirement 4.1**
    - Test: page accessible without authentication
    - Test: page accessible for guest users
    - Test: page accessible for signed-in users
    - Test: page accessible for admin users
    - Test: correct SEO metadata rendered

- [ ] 6. Implement Admin Layout với Authorization Check
  - [ ] 6.1 Tạo AdminLayout component
    - Tạo file `apps/web/src/app/admin/layout.tsx`
    - Add "use client" directive (cần client-side auth check)
    - Import useAuth hook, useRouter từ next/navigation, Alert components
    - Implement authorization logic:
      - Nếu `!isLoading && !isSignedIn`: redirect đến "/" bằng `router.push('/')`
      - Nếu `isLoading`: hiển thị loading message "Đang kiểm tra quyền truy cập..."
      - Nếu `!isAdmin`: hiển thị Alert với message "Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể quản lý roadmaps."
      - Nếu `isAdmin`: render children trong container
    - Style với Tailwind CSS: container, max-width, padding
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 7.1, 7.2_
  
  - [ ]* 6.2 Write property tests for AdminLayout
    - **Property 3: Route Protection Invariant**
    - **Property 4: Admin Button Visibility**
    - **Validates: Requirements 5.1, 5.3, 5.4**
    - Test: redirects unauthenticated users
    - Test: shows Vietnamese error for non-admin users
    - Test: renders children for admin users
    - Test: shows loading state correctly

- [ ] 7. Create Admin Dashboard Page
  - [ ] 7.1 Tạo admin roadmaps dashboard page
    - Tạo file `apps/web/src/app/admin/roadmaps/page.tsx`
    - Add "use client" directive
    - Import Button, Plus icon từ lucide-react
    - Render dashboard header với title "Quản lý Roadmap"
    - Render description "Tạo, chỉnh sửa và quản lý các technology roadmaps"
    - Render Button "Tạo Roadmap Mới" với Plus icon, link đến "/admin/roadmaps/new"
    - Thêm placeholder content cho roadmap table (sẽ implement ở phase sau)
    - Style với Tailwind CSS: flex layout, spacing, responsive
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 7.2 Write unit tests for Admin Dashboard page
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4**
    - Test: renders correct title and description
    - Test: "Create New Roadmap" button links to correct route
    - Test: button has correct icon and text

- [ ] 8. Checkpoint - Verify admin access control
  - Test với Guest user: truy cập `/admin/roadmaps` → redirect về "/"
  - Test với User (non-admin): truy cập `/admin/roadmaps` → thấy error message tiếng Việt
  - Test với Admin: truy cập `/admin/roadmaps` → thấy dashboard với button "Tạo Roadmap Mới"
  - Click "Admin" button trong header → navigate đến `/admin/roadmaps`
  - Chạy `pnpm typecheck` và `pnpm lint` - phải pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Create Developer Documentation
  - [ ] 9.1 Tạo developer guide cho authentication flow
    - Tạo file `.kiro/specs/frontend-user-access-rbac/docs/01-authentication-setup.md`
    - Document useAuth hook usage với code examples
    - Explain Guest vs User vs Admin access rights
    - Clarify: Guest và User có CÙNG quyền (read-only), chỉ khác UI
    - Explain `isUser` flag chỉ dùng cho UI rendering, không dùng cho access control
    - Include common pitfalls và best practices
    - Viết bằng tiếng Việt cho intern/fresher developers
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ] 9.2 Tạo developer guide cho admin access control
    - Tạo file `.kiro/specs/frontend-user-access-rbac/docs/02-admin-access-control.md`
    - Document AdminLayout usage và authorization flow
    - Explain route protection mechanism
    - Document error messages và error handling
    - Include testing guidelines
    - Viết bằng tiếng Việt cho intern/fresher developers
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 7.1, 7.2_
  
  - [ ] 9.3 Tạo developer guide cho component integration
    - Tạo file `.kiro/specs/frontend-user-access-rbac/docs/03-component-integration.md`
    - Document Header component updates
    - Document AdminButton component usage
    - Document public pages vs admin pages
    - Include routing structure và navigation flow
    - Include responsive design considerations
    - Viết bằng tiếng Việt cho intern/fresher developers
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3_

- [ ] 10. Environment Configuration và Type Safety
  - [ ] 10.1 Verify environment variables
    - Check `.env.local` có các variables: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
    - Verify `.env.example` có placeholder values
    - Document environment setup trong developer guide
    - _Requirements: 13.1, 13.2, 13.3, 13.6, 13.7_
  
  - [ ] 10.2 Verify TypeScript strict mode và code quality
    - Check `tsconfig.json` có `strict: true`
    - Chạy `pnpm check:no-any` - phải pass (không có any types)
    - Chạy `pnpm typecheck` - phải pass
    - Chạy `pnpm lint` - phải pass
    - Chạy `pnpm format` để format code
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 11. Final Integration và Testing
  - [ ] 11.1 Run full test suite
    - Chạy `pnpm test` - tất cả tests phải pass
    - Verify test coverage >= 80% cho custom hooks
    - Verify test coverage >= 90% cho authentication logic
    - _Requirements: Unit testing approach_
  
  - [ ]* 11.2 Write property-based tests for authentication state
    - **Property 1: Authentication State Consistency**
    - **Property 7: Role Extraction from Metadata**
    - **Validates: Requirements 1.2, 1.3, 1.4, 12.4**
    - Implement với fast-check library
    - Test authentication state consistency across all scenarios
    - Test role extraction from Clerk metadata
  
  - [ ]* 11.3 Write property-based tests for route protection
    - **Property 3: Route Protection Invariant**
    - **Property 10: CRUD Operation Authorization**
    - **Validates: Requirements 5.1, 5.3, 5.4, 15.1**
    - Test route protection for all admin routes
    - Test authorization for CRUD operations
  
  - [ ]* 11.4 Write property-based tests for error messages
    - **Property 8: Error Message Language**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**
    - Test all error messages are in Vietnamese
    - Test error message format consistency

- [ ] 12. CI/CD Pipeline Verification
  - [ ] 12.1 Verify husky hooks
    - Test pre-commit hook: chạy lint, typecheck, check:no-any
    - Test commit-msg hook: validate conventional commit format
    - Commit với message format: "feat: implement user access logic"
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  
  - [ ] 12.2 Verify CI pipeline
    - Push code hoặc tạo PR
    - Verify GitHub Actions chạy: lint, typecheck, check:no-any, test, build
    - Tất cả checks phải pass
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

- [ ] 13. Final Checkpoint - Complete Feature Verification
  - Test complete authentication flow: Guest → Sign in → User/Admin
  - Test Header rendering cho tất cả user types
  - Test public roadmaps page accessible cho tất cả users
  - Test admin dashboard chỉ accessible cho admin
  - Test tất cả error messages bằng tiếng Việt
  - Test responsive design trên mobile, tablet, desktop
  - Chạy `pnpm build` - phải build thành công
  - Verify không có console errors hoặc warnings
  - Review developer documentation đã complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional và có thể skip cho faster MVP
- Mỗi task reference đến specific requirements để traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples và edge cases
- Tất cả error messages PHẢI bằng tiếng Việt
- Developer documentation PHẢI viết bằng tiếng Việt cho intern/fresher
- Code PHẢI pass CI/CD pipeline (lint, typecheck, build, test)
- **QUAN TRỌNG**: Guest và User có CÙNG quyền (read-only), chỉ khác UI presentation
- `isUser` flag chỉ dùng cho UI rendering, KHÔNG dùng cho access control
- Chỉ Admin có quyền CRUD operations

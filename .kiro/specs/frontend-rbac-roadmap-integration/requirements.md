# Requirements Document - Frontend RBAC và Roadmap Integration

## Giới thiệu

Tài liệu này mô tả các yêu cầu chức năng cho việc tích hợp frontend với hệ thống RBAC (Role-Based Access Control) và CRUD operations cho roadmap. Hệ thống cho phép admin quản lý roadmaps thông qua giao diện quản trị, trong khi users và guests có thể xem roadmaps công khai.

### Trạng thái hiện tại

- Backend GraphQL API đã hoàn thành với queries và mutations cho roadmap
- Frontend Next.js đã có Clerk authentication
- Cần thêm Apollo Client dependencies (@apollo/client, graphql)
- Cần tạo GraphQL schema definitions và code generation setup
- Cần xây dựng toàn bộ UI components cho roadmap management

## Glossary

- **System**: Ứng dụng web VizTechStack bao gồm frontend Next.js và backend GraphQL API
- **Apollo_Client**: GraphQL client library quản lý data fetching và caching
- **Clerk**: Authentication service cung cấp JWT tokens và user management
- **Admin**: User có role "admin" trong Clerk metadata, có quyền CRUD roadmaps
- **User**: User đã đăng nhập nhưng không phải admin
- **Guest**: Người dùng chưa đăng nhập
- **Roadmap**: Tài liệu hướng dẫn học công nghệ với các trường: id, slug, title, description, content, tags, author, publishedAt, updatedAt, isPublished
- **JWT_Token**: JSON Web Token từ Clerk dùng để xác thực requests
- **GraphQL_Request**: HTTP request đến backend API với query hoặc mutation
- **Authorization_Header**: HTTP header chứa Bearer token cho authentication
- **Cache**: Apollo Client in-memory cache lưu trữ dữ liệu đã fetch
- **Form_Validation**: Kiểm tra dữ liệu input sử dụng Zod schemas
- **Role_Check**: Kiểm tra role của user từ Clerk publicMetadata
- **Protected_Route**: Route chỉ accessible cho users có quyền cụ thể
- **Public_Route**: Route accessible cho tất cả users (bao gồm guests)

## Requirements

### Requirement 0: Project Dependencies Setup

**User Story:** Là một developer, tôi muốn cài đặt các dependencies cần thiết cho GraphQL integration, để có thể sử dụng Apollo Client và code generation.

#### Acceptance Criteria

1. THE System SHALL thêm @apollo/client vào apps/web/package.json dependencies
2. THE System SHALL thêm graphql vào apps/web/package.json dependencies
3. THE System SHALL thêm @graphql-codegen/cli vào root devDependencies
4. THE System SHALL thêm @graphql-codegen/typescript vào root devDependencies
5. THE System SHALL thêm @graphql-codegen/typescript-operations vào root devDependencies
6. THE System SHALL thêm @graphql-codegen/typescript-react-apollo vào root devDependencies
7. THE System SHALL thêm @graphql-codegen/typescript-validation-schema vào root devDependencies
8. WHEN developer chạy pnpm install, THE System SHALL cài đặt tất cả dependencies thành công
9. THE System SHALL tạo codegen.ts config file ở root directory
10. THE System SHALL thêm codegen scripts vào root package.json

### Requirement 1: Apollo Client Authentication Setup

**User Story:** Là một developer, tôi muốn Apollo Client tự động gắn JWT token vào mọi GraphQL request, để backend có thể xác thực và authorize user.

#### Acceptance Criteria

1. WHEN Apollo_Client khởi tạo, THE System SHALL tạo authentication link với Clerk getToken function
2. WHEN một GraphQL_Request được gửi, THE Apollo_Client SHALL lấy JWT_Token từ Clerk
3. WHEN JWT_Token có sẵn, THE Apollo_Client SHALL thêm Authorization_Header với format "Bearer {token}"
4. WHEN JWT_Token không có sẵn, THE Apollo_Client SHALL gửi request không có Authorization_Header
5. WHEN backend trả về 401 Unauthorized error, THE System SHALL log authentication error
6. WHEN backend trả về 403 Forbidden error, THE System SHALL log permission error

### Requirement 2: Apollo Client Error Handling

**User Story:** Là một user, tôi muốn thấy thông báo lỗi rõ ràng khi có vấn đề với network hoặc GraphQL, để tôi biết cần làm gì tiếp theo.

#### Acceptance Criteria

1. WHEN một GraphQL error xảy ra, THE System SHALL log error message và extension code
2. WHEN một network error xảy ra, THE System SHALL log network error details
3. WHEN error có code "UNAUTHENTICATED", THE System SHALL log authentication error message
4. WHEN error có code "FORBIDDEN", THE System SHALL log permission denied message
5. WHEN Apollo_Client nhận response, THE System SHALL update Cache với dữ liệu mới

### Requirement 3: Apollo Client Cache Configuration

**User Story:** Là một developer, tôi muốn Apollo Client cache hoạt động hiệu quả, để giảm số lượng requests không cần thiết đến backend.

#### Acceptance Criteria

1. THE Apollo_Client SHALL sử dụng InMemoryCache để lưu trữ dữ liệu
2. WHEN roadmaps query được fetch, THE Apollo_Client SHALL merge incoming data thay vì append
3. THE Apollo_Client SHALL sử dụng cache-and-network fetch policy cho watchQuery
4. WHEN một mutation thành công, THE Apollo_Client SHALL refetch các queries liên quan
5. WHEN Cache được update, THE System SHALL trigger re-render cho components sử dụng dữ liệu đó

### Requirement 4: Role-Based Access Control

**User Story:** Là một admin, tôi muốn có quyền truy cập admin panel, trong khi users thường chỉ xem được public content, để bảo mật hệ thống.

#### Acceptance Criteria

1. WHEN user đăng nhập, THE System SHALL lấy role từ Clerk publicMetadata
2. WHEN role là "admin", THE System SHALL set isAdmin flag thành true
3. WHEN role không phải "admin" hoặc không có, THE System SHALL set isAdmin flag thành false
4. WHEN user chưa đăng nhập, THE System SHALL set isSignedIn flag thành false
5. WHEN Clerk đang loading, THE System SHALL set isLoading flag thành true

### Requirement 5: Admin Button Conditional Rendering

**User Story:** Là một admin, tôi muốn thấy Admin button trong header, để tôi có thể nhanh chóng truy cập admin panel.

#### Acceptance Criteria

1. THE System SHALL tạo AdminButton component trong apps/web/src/components/auth/admin-button.tsx
2. WHEN user có isAdmin flag là true, THE AdminButton SHALL render visible button
3. WHEN user không phải admin, THE AdminButton SHALL return null (không render gì)
4. WHEN Clerk đang loading, THE AdminButton SHALL return null
5. WHEN Admin button được click, THE System SHALL navigate đến /admin/roadmaps
6. THE Admin button SHALL hiển thị Shield icon từ lucide-react và text "Admin"
7. THE Admin button SHALL sử dụng Button component từ shadcn/ui với variant="outline" và size="sm"
8. THE Header component SHALL import và render AdminButton giữa navigation links và UserButtonWrapper
9. THE Header component SHALL thêm "Roadmaps" navigation link trước SignedOut/SignedIn blocks

### Requirement 6: Admin Route Protection

**User Story:** Là một system administrator, tôi muốn chỉ admin mới truy cập được admin routes, để ngăn unauthorized access.

#### Acceptance Criteria

1. WHEN user truy cập admin route và chưa đăng nhập, THE System SHALL redirect về homepage
2. WHEN user truy cập admin route và không phải admin, THE System SHALL hiển thị permission denied message
3. WHEN user truy cập admin route và là admin, THE System SHALL render admin content
4. WHEN Clerk đang loading, THE System SHALL hiển thị loading indicator
5. THE permission denied message SHALL nói rõ chỉ admin mới có quyền truy cập

### Requirement 7: Public Roadmap Listing

**User Story:** Là một guest hoặc user, tôi muốn xem danh sách tất cả roadmaps công khai, để tìm tài liệu học phù hợp.

#### Acceptance Criteria

1. THE System SHALL tạo page.tsx trong apps/web/src/app/roadmaps/
2. THE System SHALL tạo RoadmapList component trong apps/web/src/components/roadmap/roadmap-list.tsx
3. WHEN user truy cập /roadmaps page, THE System SHALL fetch tất cả roadmaps từ backend sử dụng useRoadmaps hook
4. WHEN roadmaps đang loading, THE System SHALL hiển thị 6 skeleton loading cards trong grid layout
5. WHEN roadmaps fetch thành công, THE System SHALL hiển thị roadmap cards trong grid layout
6. WHEN roadmaps fetch thất bại, THE System SHALL hiển thị Alert component với variant="destructive"
7. WHEN không có roadmaps, THE System SHALL hiển thị empty state message "No roadmaps available yet."
8. WHEN roadmap card được click, THE System SHALL navigate đến /roadmaps/[slug] page
9. THE page SHALL có heading "Technology Roadmaps" và description text
10. THE grid layout SHALL sử dụng Tailwind classes: "grid gap-6 md:grid-cols-2 lg:grid-cols-3"

### Requirement 8: Roadmap Card Display

**User Story:** Là một user, tôi muốn thấy thông tin tóm tắt của roadmap trong card, để quyết định có đọc chi tiết không.

#### Acceptance Criteria

1. THE System SHALL tạo RoadmapCard component trong apps/web/src/components/roadmap/roadmap-card.tsx
2. THE roadmap card SHALL sử dụng Card, CardHeader, CardTitle, CardDescription, CardContent từ shadcn/ui
3. THE roadmap card SHALL wrap trong Link component từ next/link với href="/roadmaps/[slug]"
4. THE roadmap card SHALL hiển thị title với Tailwind class "line-clamp-2"
5. THE roadmap card SHALL hiển thị description với Tailwind class "line-clamp-3"
6. THE roadmap card SHALL hiển thị tối đa 3 tags đầu tiên sử dụng Badge component
7. WHEN roadmap có nhiều hơn 3 tags, THE System SHALL hiển thị Badge với text "+N" và variant="outline"
8. THE roadmap card SHALL hiển thị published date với format "MMM DD, YYYY" sử dụng toLocaleDateString
9. WHEN user hover roadmap card, THE Card SHALL có transition-shadow và hover:shadow-lg classes
10. THE component SHALL accept roadmap prop với type Roadmap từ @/features/roadmap/types

### Requirement 9: Roadmap Detail Display

**User Story:** Là một user, tôi muốn xem chi tiết đầy đủ của roadmap, để học theo lộ trình được hướng dẫn.

#### Acceptance Criteria

1. WHEN user truy cập /roadmaps/[slug] page, THE System SHALL fetch roadmap theo slug
2. WHEN roadmap đang loading, THE System SHALL hiển thị skeleton loading states
3. WHEN roadmap fetch thành công, THE System SHALL hiển thị title, description, tags, published date, và content
4. WHEN roadmap không tồn tại, THE System SHALL hiển thị "Roadmap not found" error
5. WHEN roadmap fetch thất bại, THE System SHALL hiển thị error message
6. THE System SHALL hiển thị "Back to Roadmaps" button để navigate về listing page
7. THE System SHALL render markdown content với proper styling

### Requirement 10: Admin Dashboard Display

**User Story:** Là một admin, tôi muốn thấy danh sách tất cả roadmaps trong admin panel, để quản lý chúng hiệu quả.

#### Acceptance Criteria

1. THE System SHALL tạo page.tsx trong apps/web/src/app/admin/roadmaps/
2. THE System SHALL tạo RoadmapTable component trong apps/web/src/components/admin/roadmap-table.tsx
3. WHEN admin truy cập /admin/roadmaps page, THE RoadmapTable SHALL fetch tất cả roadmaps sử dụng useRoadmaps hook
4. THE page SHALL hiển thị heading "Roadmap Management" với description text
5. THE page SHALL hiển thị "New Roadmap" button với Plus icon ở header section
6. THE System SHALL hiển thị roadmaps trong Table component với columns: Title, Slug, Tags, Status, Updated, Actions
7. WHEN roadmaps đang loading, THE System SHALL hiển thị "Loading roadmaps..." text
8. WHEN roadmaps fetch thất bại, THE System SHALL hiển thị error message với error.message
9. WHEN không có roadmaps, THE System SHALL hiển thị empty state với "Create your first roadmap" button
10. WHEN "New Roadmap" button được click, THE System SHALL navigate đến /admin/roadmaps/new
11. THE page SHALL sử dụng "use client" directive vì có interactive elements

### Requirement 11: Admin Roadmap Table Display

**User Story:** Là một admin, tôi muốn thấy thông tin chi tiết và actions cho mỗi roadmap trong table, để dễ dàng quản lý.

#### Acceptance Criteria

1. THE table SHALL hiển thị roadmap title trong font-medium
2. THE table SHALL hiển thị slug trong font-mono
3. THE table SHALL hiển thị tối đa 2 tags đầu tiên
4. WHEN roadmap có nhiều hơn 2 tags, THE System SHALL hiển thị "+N" badge
5. THE table SHALL hiển thị status badge: "Published" hoặc "Draft"
6. THE table SHALL hiển thị updated date với format "MM/DD/YYYY"
7. THE table SHALL hiển thị 3 action buttons: View, Edit, Delete

### Requirement 12: Create Roadmap Form

**User Story:** Là một admin, tôi muốn tạo roadmap mới thông qua form, để thêm nội dung học mới vào hệ thống.

#### Acceptance Criteria

1. THE System SHALL tạo page.tsx trong apps/web/src/app/admin/roadmaps/new/
2. THE System SHALL tạo RoadmapForm component trong apps/web/src/components/admin/roadmap-form.tsx
3. THE form SHALL có các fields: slug (Input), title (Input), description (Textarea), content (Textarea), tags (Input với comma-separated values), isPublished (Checkbox)
4. THE form SHALL sử dụng react-hook-form để quản lý form state
5. THE form SHALL sử dụng Zod schema để validate form data
6. WHEN admin submit form với valid data, THE System SHALL gọi createRoadmap function từ useCreateRoadmap hook
7. WHEN createRoadmap thành công, THE System SHALL navigate về /admin/roadmaps
8. WHEN createRoadmap thất bại, THE System SHALL hiển thị error message trong Alert component
9. WHEN form đang submit, THE System SHALL disable submit button và hiển thị loading state
10. THE System SHALL refetch roadmaps query sau khi create thành công (handled by useCreateRoadmap hook)
11. THE form SHALL có "Cancel" button để navigate về /admin/roadmaps
12. THE RoadmapForm component SHALL accept mode prop: "create" | "edit" để reuse cho cả create và edit

### Requirement 13: Update Roadmap Form

**User Story:** Là một admin, tôi muốn chỉnh sửa roadmap đã có, để cập nhật nội dung hoặc sửa lỗi.

#### Acceptance Criteria

1. WHEN admin truy cập /admin/roadmaps/[id]/edit page, THE System SHALL fetch roadmap theo id
2. THE System SHALL pre-fill form với dữ liệu roadmap hiện tại
3. WHEN admin submit form với valid data, THE System SHALL gọi updateRoadmap mutation
4. WHEN updateRoadmap thành công, THE System SHALL navigate về /admin/roadmaps
5. WHEN updateRoadmap thất bại, THE System SHALL hiển thị error message
6. WHEN form đang submit, THE System SHALL disable submit button và hiển thị loading state
7. THE System SHALL refetch roadmaps query sau khi update thành công

### Requirement 14: Delete Roadmap Confirmation

**User Story:** Là một admin, tôi muốn xác nhận trước khi xóa roadmap, để tránh xóa nhầm.

#### Acceptance Criteria

1. WHEN admin click Delete button trong table, THE System SHALL mở confirmation dialog
2. THE dialog SHALL hiển thị roadmap title trong confirmation message
3. THE dialog SHALL có 2 buttons: Cancel và Delete
4. WHEN admin click Cancel, THE System SHALL đóng dialog không làm gì
5. WHEN admin click Delete, THE System SHALL gọi deleteRoadmap mutation
6. WHEN deleteRoadmap thành công, THE System SHALL đóng dialog và refetch roadmaps
7. WHEN deleteRoadmap thất bại, THE System SHALL hiển thị error message trong dialog
8. WHEN delete đang process, THE System SHALL disable buttons và hiển thị loading state

### Requirement 15: Form Validation

**User Story:** Là một admin, tôi muốn form validation ngăn tôi submit invalid data, để đảm bảo data integrity.

#### Acceptance Criteria

1. WHEN slug field trống, THE System SHALL hiển thị "Slug is required" error
2. WHEN title field trống, THE System SHALL hiển thị "Title is required" error
3. WHEN description field trống, THE System SHALL hiển thị "Description is required" error
4. WHEN content field trống, THE System SHALL hiển thị "Content is required" error
5. WHEN tags field trống, THE System SHALL hiển thị "At least one tag is required" error
6. WHEN form có validation errors, THE System SHALL disable submit button
7. THE System SHALL validate form fields on blur và on submit

### Requirement 16: GraphQL Schema Definition and Code Generation

**User Story:** Là một developer, tôi muốn có GraphQL schema definitions và automated code generation, để có type-safe operations và tránh runtime errors.

#### Acceptance Criteria

1. THE System SHALL tạo roadmap.graphql file trong packages/shared/graphql-schema/src/
2. THE graphql file SHALL define Roadmap type với tất cả fields: id, slug, title, description, content, author, tags, publishedAt, updatedAt, isPublished
3. THE graphql file SHALL define CreateRoadmapInput với required fields
4. THE graphql file SHALL define UpdateRoadmapInput với optional fields
5. THE graphql file SHALL define Query type với roadmaps và roadmap(slug) operations
6. THE graphql file SHALL define Mutation type với createRoadmap, updateRoadmap, deleteRoadmap operations
7. WHEN developer chạy pnpm codegen, THE System SHALL generate TypeScript types trong packages/shared/graphql-generated/src/types.ts
8. WHEN developer chạy pnpm codegen, THE System SHALL generate Zod schemas trong packages/shared/graphql-generated/src/schemas.ts
9. WHEN developer chạy pnpm codegen, THE System SHALL generate React Apollo hooks trong packages/shared/graphql-generated/src/hooks.ts
10. THE generated types SHALL match với backend GraphQL schema
11. WHEN GraphQL schema thay đổi, THE System SHALL detect outdated generated files khi chạy pnpm codegen:check
12. THE System SHALL fail CI/CD build nếu generated files outdated

### Requirement 17: Responsive Design

**User Story:** Là một user trên mobile device, tôi muốn UI responsive và dễ sử dụng, để có trải nghiệm tốt trên mọi thiết bị.

#### Acceptance Criteria

1. WHEN viewport width < 768px, THE roadmap grid SHALL hiển thị 1 column
2. WHEN viewport width >= 768px và < 1024px, THE roadmap grid SHALL hiển thị 2 columns
3. WHEN viewport width >= 1024px, THE roadmap grid SHALL hiển thị 3 columns
4. THE admin table SHALL scroll horizontally trên mobile devices
5. THE form fields SHALL stack vertically và full-width trên mobile devices
6. THE header navigation SHALL remain accessible trên tất cả screen sizes

### Requirement 18: Loading States

**User Story:** Là một user, tôi muốn thấy loading indicators khi data đang fetch, để biết hệ thống đang xử lý.

#### Acceptance Criteria

1. WHEN roadmaps đang fetch, THE System SHALL hiển thị skeleton cards
2. WHEN roadmap detail đang fetch, THE System SHALL hiển thị skeleton content
3. WHEN form đang submit, THE System SHALL hiển thị loading spinner trong button
4. WHEN delete đang process, THE System SHALL hiển thị "Deleting..." text
5. THE loading states SHALL có animation để indicate progress

### Requirement 19: Error Handling và User Feedback

**User Story:** Là một user, tôi muốn thấy error messages rõ ràng khi có lỗi, để biết vấn đề và cách khắc phục.

#### Acceptance Criteria

1. WHEN GraphQL query thất bại, THE System SHALL hiển thị error alert với message
2. WHEN GraphQL mutation thất bại, THE System SHALL hiển thị error message trong form
3. WHEN network error xảy ra, THE System SHALL hiển thị "Network error" message
4. WHEN authentication error xảy ra, THE System SHALL hiển thị "Please sign in" message
5. WHEN permission error xảy ra, THE System SHALL hiển thị "Permission denied" message
6. THE error messages SHALL có destructive variant để highlight severity

### Requirement 20: Developer Documentation

**User Story:** Là một intern/fresher developer, tôi muốn có tài liệu chi tiết bằng tiếng Việt sau mỗi task, để dễ dàng onboard và hiểu codebase.

#### Acceptance Criteria

1. WHEN một task hoàn thành, THE System SHALL tạo folder .docs/frontend-rbac-roadmap-integration/task-[phase].[number]/
2. THE System SHALL tạo file guide.md trong folder đó
3. THE documentation SHALL bằng tiếng Việt 100%
4. THE documentation SHALL có cấu trúc: Tổng quan, Kiến thức cần biết, Hướng dẫn từng bước, Code examples, Troubleshooting, Checklist
5. THE documentation SHALL giải thích WHY (tại sao) và HOW (làm thế nào), không chỉ WHAT (cái gì)
6. THE documentation SHALL có code snippets với comments tiếng Việt
7. THE documentation SHALL có screenshots hoặc diagrams nếu cần
8. THE documentation SHALL có troubleshooting section với common errors
9. THE documentation SHALL có links đến related files và resources
10. THE documentation SHALL có checklist để verify task completion
11. THE System SHALL tạo index.md trong .docs/frontend-rbac-roadmap-integration/ để list tất cả task guides
12. THE documentation SHALL được tạo NGAY SAU KHI task hoàn thành và pass CI/CD checks

### Requirement 21: CI/CD Compliance

**User Story:** Là một developer, tôi muốn code pass tất cả CI/CD checks, để đảm bảo code quality và có thể merge vào main branch.

#### Acceptance Criteria

1. WHEN code được commit, THE System SHALL pass pre-commit hook (lint + typecheck)
2. WHEN commit message được tạo, THE System SHALL pass commit-msg hook (conventional commits format)
3. WHEN code được push, THE System SHALL pass GitHub Actions CI workflow
4. THE CI workflow SHALL run: build, lint, typecheck, test, check:no-any
5. WHEN CI fails, THE System SHALL provide clear error messages
6. THE System SHALL ensure no 'any' types in code (pnpm check:no-any)
7. THE System SHALL ensure all tests pass with >80% coverage
8. THE System SHALL ensure no linting errors
9. THE System SHALL ensure no TypeScript errors
10. THE System SHALL ensure all packages build successfully

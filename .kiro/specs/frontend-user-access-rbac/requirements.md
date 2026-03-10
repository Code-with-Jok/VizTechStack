# Tài liệu Yêu cầu - Frontend User Access Logic và RBAC Integration

## Giới thiệu

Tài liệu này mô tả các yêu cầu chức năng cho việc triển khai logic truy cập người dùng và tích hợp RBAC (Role-Based Access Control) cho frontend của VizTechStack. Hệ thống sẽ hỗ trợ 3 loại người dùng với các quyền truy cập khác nhau: Guest (khách), User (người dùng đã đăng nhập), và Admin (quản trị viên).

## Bảng thuật ngữ

- **Guest**: Người dùng chưa đăng nhập vào hệ thống
- **User**: Người dùng đã đăng nhập với role "user" hoặc không có role
- **Admin**: Người dùng đã đăng nhập với role "admin" trong Clerk metadata
- **Clerk**: Dịch vụ authentication bên thứ ba cung cấp JWT tokens và quản lý user
- **Header**: Component thanh điều hướng phía trên của ứng dụng
- **Roadmap**: Tài liệu hướng dẫn học tập cho một công nghệ cụ thể
- **AdminLayout**: Component layout bảo vệ các trang admin
- **useAuth**: Custom React hook cung cấp thông tin authentication state
- **GraphQL_API**: Backend API sử dụng GraphQL để truy vấn và thay đổi dữ liệu

## Yêu cầu

### Yêu cầu 1: Authentication State Management

**User Story:** Là một developer, tôi muốn có một hook để quản lý authentication state, để tôi có thể dễ dàng kiểm tra trạng thái đăng nhập và role của user trong bất kỳ component nào.

#### Acceptance Criteria

1. THE useAuth_Hook SHALL trả về object chứa các field: isSignedIn, isAdmin, isUser, userId, role, isLoading
2. WHEN user chưa đăng nhập, THE useAuth_Hook SHALL trả về isSignedIn = false và isAdmin = false và isUser = false
3. WHEN user đã đăng nhập với role "admin", THE useAuth_Hook SHALL trả về isSignedIn = true và isAdmin = true và isUser = false
4. WHEN user đã đăng nhập với role "user" hoặc không có role, THE useAuth_Hook SHALL trả về isSignedIn = true và isAdmin = false và isUser = true
5. WHILE Clerk authentication state đang loading, THE useAuth_Hook SHALL trả về isLoading = true
6. WHEN Clerk authentication state đã load xong, THE useAuth_Hook SHALL trả về isLoading = false

### Yêu cầu 2: Header Navigation với Role-Based Rendering

**User Story:** Là một user, tôi muốn thấy các nút điều hướng phù hợp với quyền của mình trong header, để tôi có thể dễ dàng truy cập các trang mà tôi được phép.

#### Acceptance Criteria

1. THE Header_Component SHALL hiển thị logo "VizTechStack" và link đến trang chủ "/"
2. THE Header_Component SHALL hiển thị link "Roadmaps" đến trang "/roadmaps" cho tất cả users
3. WHEN user là Guest, THE Header_Component SHALL hiển thị nút "Sign in"
4. WHEN user đã đăng nhập, THE Header_Component SHALL hiển thị User Button từ Clerk
5. WHEN user là Admin, THE Header_Component SHALL hiển thị nút "Admin" với icon Shield
6. WHEN user click vào nút "Admin", THE Header_Component SHALL điều hướng đến "/admin/roadmaps"
7. WHILE authentication state đang loading, THE Header_Component SHALL hiển thị loading spinner

### Yêu cầu 3: Admin Button Component

**User Story:** Là một admin, tôi muốn thấy nút "Admin" trong header, để tôi có thể nhanh chóng truy cập vào trang quản lý.

#### Acceptance Criteria

1. WHEN user không phải admin, THE AdminButton_Component SHALL trả về null (không hiển thị gì)
2. WHEN user là admin, THE AdminButton_Component SHALL hiển thị button với text "Admin" và icon Shield
3. WHEN admin click vào AdminButton, THE System SHALL điều hướng đến "/admin/roadmaps"
4. THE AdminButton_Component SHALL sử dụng variant "outline" và size "sm"

### Yêu cầu 4: Public Roadmap List Page

**User Story:** Là một user (bao gồm Guest, User, Admin), tôi muốn xem danh sách các roadmaps, để tôi có thể khám phá các lộ trình học tập.

#### Acceptance Criteria

1. THE Roadmaps_Page SHALL accessible cho tất cả user types (Guest, User, Admin) mà không cần authentication
2. THE Roadmaps_Page SHALL hiển thị tiêu đề "Technology Roadmaps"
3. THE Roadmaps_Page SHALL hiển thị mô tả "Khám phá các lộ trình học tập được tuyển chọn cho các công nghệ hiện đại"
4. THE Roadmaps_Page SHALL có SEO metadata với title và description phù hợp
5. THE Roadmaps_Page SHALL sử dụng Server Component để tối ưu SEO

### Yêu cầu 5: Admin Layout với Authorization Check

**User Story:** Là một system architect, tôi muốn bảo vệ các trang admin, để chỉ admin users mới có thể truy cập các chức năng quản lý.

#### Acceptance Criteria

1. WHEN user chưa đăng nhập và truy cập admin route, THE AdminLayout SHALL redirect user đến trang chủ "/"
2. WHILE authentication state đang loading, THE AdminLayout SHALL hiển thị message "Đang kiểm tra quyền truy cập..."
3. WHEN user đã đăng nhập nhưng không phải admin, THE AdminLayout SHALL hiển thị error alert với message "Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể quản lý roadmaps."
4. WHEN user là admin, THE AdminLayout SHALL render children components
5. THE AdminLayout SHALL sử dụng useAuth hook để kiểm tra authorization
6. THE AdminLayout SHALL sử dụng Next.js router để redirect

### Yêu cầu 6: Admin Dashboard Page

**User Story:** Là một admin, tôi muốn có trang dashboard để quản lý roadmaps, để tôi có thể tạo, chỉnh sửa và xóa roadmaps.

#### Acceptance Criteria

1. THE Admin_Dashboard_Page SHALL hiển thị tiêu đề "Quản lý Roadmap"
2. THE Admin_Dashboard_Page SHALL hiển thị mô tả "Tạo, chỉnh sửa và quản lý các technology roadmaps"
3. THE Admin_Dashboard_Page SHALL hiển thị button "Tạo Roadmap Mới" với icon Plus
4. WHEN admin click vào button "Tạo Roadmap Mới", THE System SHALL điều hướng đến "/admin/roadmaps/new"
5. THE Admin_Dashboard_Page SHALL chỉ accessible cho admin users (được bảo vệ bởi AdminLayout)

### Yêu cầu 7: Error Messages trong Tiếng Việt

**User Story:** Là một Vietnamese user, tôi muốn tất cả error messages hiển thị bằng tiếng Việt, để tôi có thể dễ dàng hiểu và xử lý lỗi.

#### Acceptance Criteria

1. WHEN authentication check đang loading, THE System SHALL hiển thị message "Đang kiểm tra quyền truy cập..."
2. WHEN user không có quyền truy cập admin page, THE System SHALL hiển thị message "Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể quản lý roadmaps."
3. WHEN GraphQL query fails, THE System SHALL hiển thị message "Không thể tải danh sách roadmaps. Vui lòng thử lại sau."
4. WHEN create roadmap fails, THE System SHALL hiển thị message "Không thể tạo roadmap. [error details]"
5. WHEN update roadmap fails, THE System SHALL hiển thị message "Không thể cập nhật roadmap. [error details]"
6. WHEN delete roadmap fails, THE System SHALL hiển thị message "Không thể xóa roadmap. [error details]"
7. WHEN create roadmap succeeds, THE System SHALL hiển thị message "Roadmap đã được tạo thành công!"
8. WHEN update roadmap succeeds, THE System SHALL hiển thị message "Roadmap đã được cập nhật thành công!"
9. WHEN delete roadmap succeeds, THE System SHALL hiển thị message "Roadmap đã được xóa thành công!"

### Yêu cầu 8: Client-Side Routing và Navigation

**User Story:** Là một user, tôi muốn điều hướng giữa các trang một cách mượt mà, để tôi có trải nghiệm sử dụng tốt.

#### Acceptance Criteria

1. THE System SHALL sử dụng Next.js App Router cho routing
2. WHEN user click vào logo, THE System SHALL điều hướng đến "/"
3. WHEN user click vào link "Roadmaps", THE System SHALL điều hướng đến "/roadmaps"
4. WHEN admin click vào nút "Admin", THE System SHALL điều hướng đến "/admin/roadmaps"
5. WHEN admin click vào "Tạo Roadmap Mới", THE System SHALL điều hướng đến "/admin/roadmaps/new"
6. THE System SHALL sử dụng client-side navigation (không reload trang)

### Yêu cầu 9: Responsive Design

**User Story:** Là một mobile user, tôi muốn ứng dụng hoạt động tốt trên thiết bị di động, để tôi có thể sử dụng mọi lúc mọi nơi.

#### Acceptance Criteria

1. THE Header_Component SHALL responsive trên mobile, tablet và desktop
2. THE Roadmaps_Page SHALL responsive với grid layout phù hợp cho từng kích thước màn hình
3. THE Admin_Dashboard_Page SHALL responsive và dễ sử dụng trên tablet
4. THE System SHALL sử dụng Tailwind CSS breakpoints cho responsive design
5. THE System SHALL test trên các kích thước màn hình: mobile (< 640px), tablet (640px - 1024px), desktop (> 1024px)

### Yêu cầu 10: Type Safety và Code Quality

**User Story:** Là một developer, tôi muốn code có type safety cao, để tránh bugs và dễ dàng maintain.

#### Acceptance Criteria

1. THE System SHALL sử dụng TypeScript với strict mode enabled
2. THE System SHALL không có any types trong code mới
3. THE System SHALL pass tất cả ESLint checks
4. THE System SHALL pass TypeScript type checking
5. THE System SHALL pass Prettier formatting checks
6. THE System SHALL pass husky pre-commit hooks (lint, typecheck, check:no-any)

### Yêu cầu 11: CI/CD Pipeline

**User Story:** Là một developer, tôi muốn có CI/CD pipeline tự động, để đảm bảo code quality trước khi merge.

#### Acceptance Criteria

1. WHEN developer push code hoặc tạo pull request, THE CI_Pipeline SHALL chạy lint check
2. WHEN developer push code hoặc tạo pull request, THE CI_Pipeline SHALL chạy type check
3. WHEN developer push code hoặc tạo pull request, THE CI_Pipeline SHALL chạy check:no-any
4. WHEN developer push code hoặc tạo pull request, THE CI_Pipeline SHALL chạy build
5. WHEN developer push code hoặc tạo pull request, THE CI_Pipeline SHALL chạy tests
6. IF bất kỳ check nào fail, THE CI_Pipeline SHALL block merge
7. THE System SHALL sử dụng GitHub Actions cho CI/CD

### Yêu cầu 12: Clerk Authentication Integration

**User Story:** Là một user, tôi muốn đăng nhập dễ dàng và an toàn, để tôi có thể truy cập các tính năng của hệ thống.

#### Acceptance Criteria

1. THE System SHALL sử dụng Clerk SDK cho authentication
2. WHEN user click "Sign in", THE System SHALL mở Clerk sign-in modal
3. WHEN user đăng nhập thành công, THE System SHALL lưu JWT token trong httpOnly cookies
4. THE System SHALL extract user role từ Clerk publicMetadata.role
5. WHEN user không có role trong metadata, THE System SHALL default role thành "user"
6. THE System SHALL wrap root layout với ClerkProvider
7. THE System SHALL sử dụng SignInButton, SignedIn, SignedOut components từ Clerk

### Yêu cầu 13: Environment Configuration

**User Story:** Là một developer, tôi muốn quản lý environment variables một cách an toàn, để bảo vệ sensitive data.

#### Acceptance Criteria

1. THE System SHALL sử dụng .env.local file cho local development
2. THE System SHALL require NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable
3. THE System SHALL require CLERK_SECRET_KEY environment variable
4. THE System SHALL require NEXT_PUBLIC_GRAPHQL_ENDPOINT environment variable
5. THE System SHALL không commit .env.local file vào Git
6. THE System SHALL có .env.example file với placeholder values
7. THE System SHALL validate environment variables khi application khởi động

### Yêu cầu 14: Performance Optimization

**User Story:** Là một user, tôi muốn ứng dụng load nhanh, để tôi có trải nghiệm sử dụng tốt.

#### Acceptance Criteria

1. THE System SHALL sử dụng Next.js automatic code splitting
2. THE System SHALL lazy load admin components (chỉ load khi truy cập admin routes)
3. THE System SHALL cache authentication state trong memory (Clerk SDK)
4. THE System SHALL sử dụng Server Components cho public pages để tối ưu SEO
5. THE System SHALL sử dụng Client Components chỉ khi cần thiết (authentication, interactivity)
6. THE Landing_Page bundle size SHALL nhỏ hơn 100KB (gzipped)

### Yêu cầu 15: Security Requirements

**User Story:** Là một system administrator, tôi muốn hệ thống an toàn, để bảo vệ dữ liệu và quyền truy cập của users.

#### Acceptance Criteria

1. THE System SHALL enforce authorization checks trên cả frontend và backend
2. THE System SHALL không lưu JWT tokens trong localStorage hoặc sessionStorage
3. THE System SHALL sử dụng httpOnly cookies cho JWT tokens (Clerk default)
4. THE System SHALL validate admin role trên backend trước khi thực hiện CRUD operations
5. THE System SHALL không expose sensitive data trong client-side code
6. THE System SHALL sử dụng HTTPS cho tất cả API requests trong production
7. THE System SHALL implement CSRF protection (Clerk JWT tokens)
8. THE System SHALL sanitize user input trước khi render (React default escaping)

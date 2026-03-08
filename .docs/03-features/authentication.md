# Authentication & Authorization

## Tổng Quan

VizTechStack sử dụng Clerk cho authentication và triển khai role-based access control (RBAC) cho authorization.

## Vai Trò Người Dùng

### User
- Xem roadmap công khai
- Theo dõi tiến độ học tập
- Bookmark roadmap
- Xem topic

### Admin
- Tất cả quyền của User
- Tạo/sửa/xóa roadmap
- Quản lý topic
- Publish/unpublish nội dung

## Triển Khai

### Backend (NestJS)

**Guards**:
- `ClerkAuthGuard` - Xác thực JWT token
- `RolesGuard` - Kiểm tra vai trò người dùng

**Decorators**:
- `@Public()` - Bỏ qua authentication
- `@Roles('admin')` - Yêu cầu vai trò admin

### Frontend (Next.js)

**Clerk Components**:
- `<SignIn />` - Trang đăng nhập
- `<SignUp />` - Trang đăng ký
- `<UserButton />` - Menu người dùng

**Hooks**:
- `useUser()` - Lấy thông tin người dùng hiện tại
- `useAuth()` - Lấy trạng thái authentication

## Cấu Hình

Biến môi trường:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## Xem Thêm

- [Hướng Dẫn Thiết Lập Admin](../01-getting-started/admin-setup.md)

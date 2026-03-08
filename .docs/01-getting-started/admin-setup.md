# Hướng Dẫn Thiết Lập Admin

## Thiết Lập Quyền Admin

Để tạo và quản lý roadmap, bạn cần quyền admin. Làm theo các bước sau:

### Bước 1: Đăng Nhập Vào Ứng Dụng

1. Truy cập http://localhost:3000
2. Click "Đăng nhập" (Sign In) ở góc trên bên phải
3. Tạo tài khoản mới hoặc đăng nhập bằng tài khoản hiện có

### Bước 2: Thiết Lập Vai Trò Admin Trong Clerk Dashboard

1. Truy cập [Clerk Dashboard](https://dashboard.clerk.com/)
2. Chọn ứng dụng của bạn: "summary-wren-91"
3. Điều hướng đến **Users** trong sidebar bên trái
4. Tìm và click vào tài khoản người dùng của bạn
5. Cuộn xuống phần **Public metadata**
6. Click **Edit**
7. Thêm JSON sau:
   ```json
   {
     "role": "admin"
   }
   ```
8. Click **Save**

### Bước 3: Làm Mới Session

1. Quay lại http://localhost:3000
2. Đăng xuất và đăng nhập lại (để làm mới JWT token với metadata mới)
3. Bây giờ bạn sẽ thấy nút "Admin Dashboard" trong header

### Bước 4: Seed Database

Bạn có hai lựa chọn:

#### Lựa Chọn A: Sử Dụng Convex Dashboard (Khuyến Nghị)

1. Truy cập [Convex Dashboard](https://dashboard.convex.dev/)
2. Chọn deployment của bạn: "joyous-hedgehog-239"
3. Vào tab **Functions**
4. Tìm và chạy function `seed`
5. Lệnh này sẽ tạo 3 roadmap mẫu:
   - Frontend Developer (beginner)
   - Backend Developer (intermediate)
   - React (intermediate, skill)

#### Lựa Chọn B: Sử Dụng Giao Diện Admin

1. Truy cập http://localhost:3000
2. Click nút "Admin Dashboard"
3. Điều hướng đến trang tạo roadmap
4. Điền form để tạo roadmap mới:
   - Slug: định danh duy nhất (ví dụ: "nodejs")
   - Title: Tên hiển thị (ví dụ: "Node.js Developer")
   - Description: Mô tả ngắn gọn
   - Category: role, skill, hoặc best-practice
   - Difficulty: beginner, intermediate, hoặc advanced
   - Status: public, draft, hoặc private

## Xác Minh Quyền Admin

Sau khi có quyền admin, bạn sẽ thấy:

1. Nút **Admin Dashboard** trong header
2. Khả năng tạo/sửa/xóa roadmap
3. Truy cập vào các GraphQL mutation dành cho admin

## Xử Lý Sự Cố

### Lỗi "Unauthorized" Khi Seed

- Đảm bảo bạn đã thêm `role: "admin"` vào public metadata của user trong Clerk
- Đăng xuất và đăng nhập lại để làm mới JWT token
- Kiểm tra browser console để tìm lỗi authentication

### Admin Dashboard Không Hiển Thị

- Xác minh role đã được thiết lập đúng trong Clerk dashboard
- Xóa browser cache và cookies
- Kiểm tra JWT token có chứa role trong metadata:
  ```javascript
  // Trong browser console
  console.log(await clerk.session.getToken())
  ```

### Seed Function Thất Bại

- Đảm bảo bạn đã đăng nhập (signed in)
- Xác minh role của bạn là "admin"
- Kiểm tra Convex dashboard logs để xem thông báo lỗi chi tiết

## Kiểm Tra Nhanh

Để xác minh mọi thứ hoạt động:

1. Đăng nhập với tư cách admin
2. Truy cập http://localhost:3000/admin/roadmap (nếu route này tồn tại)
3. Hoặc sử dụng GraphQL Playground tại http://localhost:4000/graphql
4. Thử mutation này:
   ```graphql
   mutation {
     createRoadmap(input: {
       slug: "test-roadmap"
       title: "Test Roadmap"
       description: "A test roadmap"
       category: ROLE
       difficulty: BEGINNER
       nodes: []
       edges: []
       topicCount: 0
       status: PUBLIC
     }) {
       id
       slug
       title
     }
   }
   ```

## Bước Tiếp Theo

Sau khi thiết lập quyền admin và seed data:

1. Truy cập http://localhost:3000 để xem roadmap trên trang chủ
2. Truy cập http://localhost:3000/roadmaps để xem danh sách roadmap
3. Click vào roadmap để xem chi tiết
4. Sử dụng giao diện admin để tạo thêm roadmap

## Biến Môi Trường

Đảm bảo các biến này được thiết lập trong `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c3VtbWFyeS13cmVuLTkxLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_FlNucecqOLuaeNSil8tnFhZEnjSYU1R7WwZ19rtf6M
CLERK_JWT_ISSUER_DOMAIN=https://summary-wren-91.clerk.accounts.dev

# GraphQL
GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql

# Convex
CONVEX_DEPLOYMENT=dev:joyous-hedgehog-239
CONVEX_URL=https://joyous-hedgehog-239.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://joyous-hedgehog-239.convex.cloud
```

# Hướng Dẫn Cài Đặt

Tài liệu này cung cấp hướng dẫn chi tiết để thiết lập môi trường development cho VizTechStack.

## Yêu Cầu Hệ Thống

### Phần Mềm Bắt Buộc

- **Node.js**: >= 20.11.0
  - Tải từ [nodejs.org](https://nodejs.org/)
  - Kiểm tra: `node --version`

- **pnpm**: 9.15.0
  - Cài đặt: `npm install -g pnpm@9.15.0`
  - Kiểm tra: `pnpm --version`

- **Git**: Phiên bản mới nhất
  - Tải từ [git-scm.com](https://git-scm.com/)
  - Kiểm tra: `git --version`

### Công Cụ Tùy Chọn

- **VS Code**: IDE được khuyến nghị với các extension:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - GraphQL: Language Feature Support

## Các Bước Cài Đặt

### 1. Clone Repository

```bash
git clone <repository-url>
cd viztechstack
```

### 2. Cài Đặt Dependencies

```bash
pnpm install
```

Lệnh này sẽ:
- Cài đặt tất cả workspace dependencies
- Thiết lập Git hooks (Husky)
- Liên kết các workspace packages

### 3. Cấu Hình Environment

Tạo file environment:

```bash
# Copy file environment mẫu
cp .env.example .env.local
```

Cấu hình các biến sau trong `.env.local`:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Convex Database
CONVEX_DEPLOYMENT=your_convex_deployment_url
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
```

### 4. Thiết Lập Database

Khởi tạo Convex database:

```bash
cd convex
pnpm convex dev
```

Lệnh này sẽ:
- Tạo Convex project mới (nếu cần)
- Thiết lập database schema
- Chạy migrations

### 5. Xác Minh Cài Đặt

Chạy các lệnh sau để xác minh mọi thứ đã được thiết lập đúng:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Build
pnpm build
```

Tất cả lệnh phải hoàn thành không có lỗi.

## Quy Trình Development

### Khởi Động Development Servers

```bash
# Khởi động tất cả services (khuyến nghị)
pnpm dev

# Hoặc khởi động từng service riêng lẻ
pnpm dev --filter @viztechstack/web    # Chỉ frontend
pnpm dev --filter @viztechstack/api    # Chỉ backend
```

### Truy Cập Ứng Dụng

- **Frontend**: http://localhost:3000
- **API GraphQL Playground**: http://localhost:4000/graphql
- **Convex Dashboard**: https://dashboard.convex.dev

## Xử Lý Sự Cố

### Port Đã Được Sử Dụng

Nếu port 3000 hoặc 4000 đã được sử dụng:

```bash
# Tìm và kill process đang sử dụng port
# Trên Windows
netstat -ano | findstr :3000
taskkill /PID <process_id> /F

# Trên macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### pnpm Install Thất Bại

1. Xóa pnpm cache:
   ```bash
   pnpm store prune
   ```

2. Xóa node_modules và lockfile:
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

### Lỗi TypeScript

1. Khởi động lại TypeScript server trong VS Code:
   - Nhấn `Ctrl+Shift+P` (hoặc `Cmd+Shift+P` trên macOS)
   - Gõ "TypeScript: Restart TS Server"

2. Rebuild packages:
   ```bash
   pnpm clean
   pnpm build
   ```

### Lỗi Kết Nối Convex

1. Kiểm tra Convex deployment URL trong `.env.local`
2. Kiểm tra trạng thái deployment trên Convex dashboard
3. Khởi động lại Convex dev server:
   ```bash
   cd convex
   pnpm convex dev
   ```

## Bước Tiếp Theo

- [Quy Trình Development](./development.md) - Tìm hiểu về best practices
- [Thiết Lập Admin](./admin-setup.md) - Thiết lập quyền admin
- [Tổng Quan Kiến Trúc](../02-architecture/README.md) - Hiểu về kiến trúc hệ thống

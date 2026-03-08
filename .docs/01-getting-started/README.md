# Getting Started

Chào mừng đến với VizTechStack! Phần này sẽ giúp bạn bắt đầu với project.

## Tổng Quan

VizTechStack là nền tảng học tập tương tác giúp users khám phá và theo dõi technology learning roadmaps. Nền tảng này visualize learning paths dưới dạng interactive graphs, cho phép users điều hướng qua các topics, theo dõi progress, và truy cập educational content.

## Bắt Đầu Nhanh

1. **Yêu Cầu Trước**
   - Node.js >= 20.11.0
   - pnpm 9.15.0
   - Git

2. **Cài Đặt**
   ```bash
   # Clone repository
   git clone <repository-url>
   cd viztechstack

   # Cài đặt dependencies
   pnpm install
   ```

3. **Development**
   ```bash
   # Start tất cả services
   pnpm dev

   # Hoặc start services cụ thể
   pnpm dev --filter @viztechstack/web    # Chỉ Frontend
   pnpm dev --filter @viztechstack/api    # Chỉ Backend
   ```

4. **Truy Cập Application**
   - Frontend: http://localhost:3000
   - API: http://localhost:4000/graphql

## Nội Dung

- [Hướng Dẫn Cài Đặt](./installation.md) - Hướng dẫn cài đặt chi tiết
- [Quy Trình Development](./development.md) - Best practices và workflows development
- [Hướng Dẫn Cài Đặt Admin](./admin-setup.md) - Cài đặt admin access

## Tech Stack

- **Frontend**: Next.js 16.1.6, React 19.2.3, TypeScript 5.7, Tailwind CSS 4
- **Backend**: NestJS 11.0.1, GraphQL (Apollo Server 5.4.0)
- **Database**: Convex (serverless database)
- **Monorepo**: pnpm workspaces với Turbo 2.4.0

## Điều Hướng

→ [Tiếp: Architecture](../02-architecture/README.md)  
↑ [Mục Lục Documentation](../README.md)

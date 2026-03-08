# Architecture

Phần này cung cấp documentation toàn diện về architecture, quyết định thiết kế, và technical implementation của VizTechStack.

## Tổng Quan

VizTechStack tuân theo architecture hiện đại, có khả năng mở rộng với sự tách biệt rõ ràng các concerns:

- **Cấu Trúc Monorepo**: pnpm workspaces với Turbo cho build orchestration
- **Backend**: NestJS với hexagonal architecture
- **Frontend**: Next.js với feature-based structure
- **Database**: Convex serverless database
- **API**: GraphQL với code-first approach

## Nội Dung

- [Tổng Quan](./overview.md) - Tổng quan architecture cấp cao
- [Tech Stack](./tech-stack.md) - Lựa chọn công nghệ và đánh giá
- [Business Logic](./business-logic.md) - Business logic flow và patterns
- [Cải Tiến](./improvements.md) - Issues đã xác định và cải tiến

## Nguyên Tắc Architectural Chính

### 1. Hexagonal Architecture (Backend)

Mỗi backend module tuân theo hexagonal architecture với sự tách biệt layer rõ ràng:

```
Transport Layer (GraphQL) → Application Layer → Domain Layer → Infrastructure Layer
```

Lợi ích:
- Tách biệt concerns rõ ràng
- Business logic có thể test
- Dễ dàng swap implementations
- Độc lập với frameworks

### 2. Feature-Based Structure (Frontend)

Frontend code được tổ chức theo feature thay vì theo type:

```
features/
├── roadmap/
│   ├── components/
│   ├── hooks/
│   └── types/
├── topic/
└── progress/
```

Lợi ích:
- Tổ chức code tốt hơn
- Cải thiện HMR performance
- Dễ dàng locate code
- Giảm coupling

### 3. Monorepo với Workspaces

Sử dụng pnpm workspaces và Turbo cho:
- Tái sử dụng shared code
- Tooling nhất quán
- Builds hiệu quả với caching
- Atomic changes across packages

### 4. Type Safety

Type safety end-to-end:
- TypeScript throughout
- GraphQL code generation
- Zod runtime validation
- Shared types across frontend/backend

## Sơ Đồ Architecture

### System Architecture

```
┌─────────────────┐
│   Next.js Web   │
│   (Frontend)    │
└────────┬────────┘
         │ GraphQL
         ↓
┌─────────────────┐
│   NestJS API    │
│   (Backend)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│     Convex      │
│   (Database)    │
└─────────────────┘
```

### Cấu Trúc Backend Module

```
Module
├── Transport Layer
│   └── GraphQL (Resolvers, Schemas, Mappers)
├── Application Layer
│   ├── Commands (Write operations)
│   ├── Queries (Read operations)
│   ├── Services (Use case orchestration)
│   └── Ports (Repository interfaces)
├── Domain Layer
│   ├── Entities (Business objects)
│   ├── Errors (Domain exceptions)
│   └── Policies (Business rules)
└── Infrastructure Layer
    └── Adapters (Repository implementations)
```

### Data Flow

```
User Request
    ↓
GraphQL Resolver (Transport)
    ↓
Application Service
    ↓
Domain Entity (Business Logic)
    ↓
Repository (Infrastructure)
    ↓
Convex Database
```

## Quyết Định Thiết Kế

### Tại Sao NestJS?

- Enterprise-grade framework
- Built-in dependency injection
- Hỗ trợ TypeScript xuất sắc
- Tích hợp GraphQL
- Modular architecture

### Tại Sao Next.js?

- React framework với SSR/SSG
- App Router cho routing hiện đại
- Server Components cho performance
- Built-in optimization
- Tích hợp Vercel deployment

### Tại Sao Convex?

- Serverless database
- Real-time sync
- TypeScript-first
- Built-in validation
- Deployment dễ dàng

### Tại Sao GraphQL?

- Type-safe API
- Flexible queries
- Code generation
- Single endpoint
- Strong tooling

### Tại Sao Monorepo?

- Code sharing
- Tooling nhất quán
- Atomic changes
- Collaboration tốt hơn
- Dependencies đơn giản hóa

## Điều Hướng

← [Trước: Getting Started](../01-getting-started/README.md)  
→ [Tiếp: Features](../03-features/README.md)  
↑ [Mục Lục Documentation](../README.md)

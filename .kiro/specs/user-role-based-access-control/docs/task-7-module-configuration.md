# Task 7: Cấu hình Module Roadmap và Đăng ký trong App

## Tổng quan

Task 7 hoàn thành việc cấu hình module roadmap trong NestJS và đăng ký nó vào ứng dụng chính. Đây là bước cuối cùng để kết nối tất cả các thành phần đã được tạo ra (resolver, service, Convex service) thành một module hoàn chỉnh có thể hoạt động.

## Mục tiêu

- **Task 7.1**: Tạo RoadmapModule để đóng gói tất cả các provider liên quan đến roadmap
- **Task 7.2**: Đăng ký RoadmapModule vào AppModule để tích hợp vào ứng dụng

## Yêu cầu liên quan

- **7.2**: Admin có thể tạo roadmap mới
- **7.3**: Admin có thể xem roadmap
- **7.4**: Admin có thể cập nhật roadmap
- **7.5**: Admin có thể xóa roadmap

## Task 7.1: Tạo RoadmapModule

### File được tạo

```
apps/api/src/modules/roadmap/roadmap.module.ts
```

### Giải thích code

```typescript
import { Module } from '@nestjs/common';
import { RoadmapResolver } from './transport/graphql/resolvers/roadmap.resolver';
import { RoadmapService } from './application/services/roadmap.service';
import { ConvexService } from '../../common/convex/convex.service';

@Module({
    providers: [RoadmapResolver, RoadmapService, ConvexService],
    exports: [RoadmapService],
})
export class RoadmapModule { }
```

#### Các thành phần chính

1. **@Module decorator**: Đánh dấu class này là một NestJS module
   - `providers`: Danh sách các class sẽ được NestJS quản lý và inject dependencies
   - `exports`: Danh sách các provider có thể được sử dụng bởi các module khác

2. **Providers được đăng ký**:
   - **RoadmapResolver**: GraphQL resolver xử lý các query và mutation cho roadmap
   - **RoadmapService**: Service chứa business logic cho CRUD operations
   - **ConvexService**: Service kết nối với Convex database

3. **Exports**:
   - **RoadmapService**: Được export để các module khác có thể sử dụng nếu cần trong tương lai

### Tại sao cần Module?

Trong NestJS, module là cách tổ chức code theo tính năng (feature). Mỗi module đóng gói:
- **Providers**: Các service, resolver, guard, etc.
- **Controllers**: Các REST controller (không có trong trường hợp này vì dùng GraphQL)
- **Imports**: Các module khác cần thiết
- **Exports**: Các provider muốn chia sẻ với module khác

Module giúp:
- **Tổ chức code**: Tách biệt các tính năng thành các phần độc lập
- **Dependency Injection**: NestJS tự động inject dependencies giữa các provider
- **Tái sử dụng**: Có thể import module vào nhiều nơi khác nhau
- **Testing**: Dễ dàng test từng module riêng biệt

## Task 7.2: Đăng ký RoadmapModule vào AppModule

### File được cập nhật

```
apps/api/src/app.module.ts
```

### Thay đổi

#### 1. Thêm import statement

```typescript
import { RoadmapModule } from './modules/roadmap/roadmap.module';
```

#### 2. Thêm RoadmapModule vào imports array

```typescript
@Module({
  imports: [
    ConfigModule.forRoot(...),
    GraphQLModule.forRoot<ApolloDriverConfig>(...),
    PingModule,
    HealthModule,
    RoadmapModule,  // ← Module mới được thêm vào
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
```

### Giải thích

**AppModule** là root module của ứng dụng NestJS. Tất cả các module khác phải được import vào đây để:
- NestJS biết về sự tồn tại của module
- GraphQL có thể tự động phát hiện các resolver và tạo schema
- Dependency injection hoạt động đúng cách

Khi RoadmapModule được import:
1. NestJS khởi tạo tất cả providers trong RoadmapModule
2. GraphQL tự động phát hiện RoadmapResolver và thêm queries/mutations vào schema
3. ConvexService được khởi tạo và kết nối với Convex database
4. RoadmapService sẵn sàng xử lý business logic

## Kiến trúc Module trong NestJS

```
AppModule (Root)
├── ConfigModule (Global configuration)
├── GraphQLModule (GraphQL server)
├── PingModule (Health check)
├── HealthModule (Health monitoring)
└── RoadmapModule (Roadmap feature) ← Module mới
    ├── RoadmapResolver (GraphQL endpoints)
    ├── RoadmapService (Business logic)
    └── ConvexService (Database connection)
```

## Dependency Injection Flow

```
1. NestJS khởi động AppModule
   ↓
2. NestJS phát hiện RoadmapModule trong imports
   ↓
3. NestJS khởi tạo các providers trong RoadmapModule:
   - ConvexService (không có dependencies)
   - RoadmapService (inject ConvexService)
   - RoadmapResolver (inject RoadmapService)
   ↓
4. GraphQL phát hiện RoadmapResolver và đăng ký queries/mutations
   ↓
5. Ứng dụng sẵn sàng nhận requests
```

## Kiểm tra kết quả

### 1. Kiểm tra TypeScript errors

```bash
pnpm typecheck --filter @viztechstack/api
```

Kết quả: Không có lỗi TypeScript

### 2. Khởi động API server

```bash
pnpm dev --filter @viztechstack/api
```

### 3. Truy cập GraphQL Playground

Mở trình duyệt và truy cập: `http://localhost:3001/graphql`

### 4. Kiểm tra schema

Trong GraphQL Playground, bạn sẽ thấy các queries và mutations mới:

**Queries** (Public - không cần authentication):
```graphql
roadmaps: [RoadmapSchema!]!
roadmap(slug: String!): RoadmapSchema
```

**Mutations** (Admin only - cần JWT token với role admin):
```graphql
createRoadmap(input: CreateRoadmapInput!): String!
updateRoadmap(input: UpdateRoadmapInput!): String!
deleteRoadmap(id: String!): String!
```

## Lưu ý quan trọng

### 1. Provider Scope

Mặc định, providers trong NestJS có **singleton scope**, nghĩa là:
- Mỗi provider chỉ được khởi tạo một lần
- Cùng một instance được sử dụng trong toàn bộ ứng dụng
- Tiết kiệm bộ nhớ và tăng hiệu suất

### 2. ConvexService trong nhiều modules

Nếu trong tương lai có module khác cũng cần sử dụng ConvexService, có 2 cách:

**Cách 1**: Tạo ConvexModule riêng và import vào các module cần dùng
```typescript
@Module({
  providers: [ConvexService],
  exports: [ConvexService],
})
export class ConvexModule {}
```

**Cách 2**: Đăng ký ConvexService ở AppModule với scope global
```typescript
@Module({
  providers: [
    {
      provide: ConvexService,
      useClass: ConvexService,
      scope: Scope.DEFAULT,
    },
  ],
  exports: [ConvexService],
})
export class AppModule {}
```

Hiện tại, chúng ta sử dụng cách đơn giản nhất: đăng ký trực tiếp trong RoadmapModule.

### 3. Circular Dependencies

Tránh tạo circular dependencies giữa các module:
```
❌ BAD: RoadmapModule imports UserModule, UserModule imports RoadmapModule
✅ GOOD: Tạo SharedModule chứa các service dùng chung
```

## Bước tiếp theo

Sau khi hoàn thành Task 7, hệ thống backend đã sẵn sàng để:
1. Nhận GraphQL requests từ client
2. Xác thực JWT token qua ClerkAuthGuard
3. Kiểm tra quyền truy cập qua RolesGuard
4. Thực hiện CRUD operations trên Convex database

**Task tiếp theo**: Task 8 - Checkpoint để verify basic functionality hoạt động đúng.

## Tài liệu tham khảo

- [NestJS Modules](https://docs.nestjs.com/modules)
- [NestJS Dependency Injection](https://docs.nestjs.com/fundamentals/custom-providers)
- [NestJS GraphQL](https://docs.nestjs.com/graphql/quick-start)

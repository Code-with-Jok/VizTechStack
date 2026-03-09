# ConvexService Documentation

## Tổng quan (Overview)

ConvexService là một service trong NestJS giúp kết nối và tương tác với Convex database. Nó hoạt động như một "cầu nối" giữa ứng dụng backend NestJS của chúng ta và Convex database.

**Tại sao chúng ta cần ConvexService?**

Thay vì mỗi module trong ứng dụng phải tự tạo kết nối đến Convex, chúng ta tạo một service duy nhất để:
- Quản lý kết nối đến Convex một cách tập trung
- Cung cấp các phương thức đơn giản để thực hiện query (đọc dữ liệu) và mutation (thay đổi dữ liệu)
- Đảm bảo kết nối được khởi tạo đúng cách khi ứng dụng khởi động
- Ghi log để dễ dàng debug khi có vấn đề

## Cấu trúc Code

```typescript
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConvexClient } from 'convex/browser';

@Injectable()
export class ConvexService implements OnModuleInit {
    private client!: ConvexClient;
    private readonly logger = new Logger(ConvexService.name);

    onModuleInit() {
        const convexUrl = process.env.CONVEX_URL;
        if (!convexUrl) {
            throw new Error('CONVEX_URL environment variable is required');
        }
        this.client = new ConvexClient(convexUrl);
        this.logger.log('Convex client initialized');
    }

    getClient(): ConvexClient {
        return this.client;
    }

    async query<T>(name: string, args?: Record<string, unknown>): Promise<T> {
        return await this.client.query(name as any, args);
    }

    async mutation<T>(name: string, args?: Record<string, unknown>): Promise<T> {
        return await this.client.mutation(name as any, args);
    }
}
```

### Giải thích từng phần

#### 1. Decorators và Imports

```typescript
@Injectable()
export class ConvexService implements OnModuleInit
```

- `@Injectable()`: Decorator của NestJS cho phép service này được "inject" (tiêm) vào các class khác
- `implements OnModuleInit`: Interface này yêu cầu class phải có method `onModuleInit()`, method này sẽ được NestJS tự động gọi khi module được khởi tạo

#### 2. Properties (Thuộc tính)

```typescript
private client!: ConvexClient;
private readonly logger = new Logger(ConvexService.name);
```

- `client`: Lưu trữ instance của ConvexClient để tái sử dụng
- `!`: Dấu này (definite assignment assertion) báo cho TypeScript biết rằng chúng ta sẽ gán giá trị cho `client` trước khi sử dụng (trong `onModuleInit`)
- `logger`: Dùng để ghi log, giúp theo dõi hoạt động của service

#### 3. Khởi tạo kết nối

```typescript
onModuleInit() {
    const convexUrl = process.env.CONVEX_URL;
    if (!convexUrl) {
        throw new Error('CONVEX_URL environment variable is required');
    }
    this.client = new ConvexClient(convexUrl);
    this.logger.log('Convex client initialized');
}
```

Method này:
1. Đọc URL của Convex từ biến môi trường `CONVEX_URL`
2. Kiểm tra xem URL có tồn tại không, nếu không thì throw error
3. Tạo ConvexClient với URL đó
4. Ghi log để xác nhận kết nối đã được khởi tạo

#### 4. Các phương thức public

**getClient()**: Trả về ConvexClient instance nếu bạn cần truy cập trực tiếp

**query()**: Thực hiện query (đọc dữ liệu) từ Convex
- `name`: Tên của query function trong Convex (format: "tableName:functionName")
- `args`: Các tham số truyền vào query
- `T`: Generic type cho kết quả trả về

**mutation()**: Thực hiện mutation (thay đổi dữ liệu) trong Convex
- Tương tự như query nhưng dùng cho các thao tác create, update, delete

## Cách sử dụng ConvexService

### Bước 1: Đăng ký ConvexService trong Module

Trước khi sử dụng, bạn cần đăng ký ConvexService trong module của mình:

```typescript
// roadmap.module.ts
import { Module } from '@nestjs/common';
import { ConvexService } from '../../common/convex/convex.service';
import { RoadmapService } from './application/services/roadmap.service';

@Module({
  providers: [
    ConvexService,  // Đăng ký ConvexService
    RoadmapService,
  ],
  exports: [RoadmapService],
})
export class RoadmapModule {}
```

### Bước 2: Inject ConvexService vào Service của bạn

```typescript
// roadmap.service.ts
import { Injectable } from '@nestjs/common';
import { ConvexService } from '../../../../common/convex/convex.service';

@Injectable()
export class RoadmapService {
  constructor(private readonly convexService: ConvexService) {}
  
  // Bây giờ bạn có thể sử dụng this.convexService
}
```

### Bước 3: Sử dụng query() và mutation()

#### Ví dụ 1: Query - Lấy danh sách roadmaps

```typescript
async findAll(): Promise<Roadmap[]> {
  // Gọi query function 'list' trong file 'roadmaps.ts' của Convex
  return await this.convexService.query<Roadmap[]>('roadmaps:list');
}
```

**Giải thích:**
- `'roadmaps:list'`: Format là `fileName:functionName`
- `Roadmap[]`: Type của dữ liệu trả về (mảng các Roadmap)
- Không cần truyền args vì query này không cần tham số

#### Ví dụ 2: Query với tham số - Tìm roadmap theo slug

```typescript
async findBySlug(slug: string): Promise<Roadmap | null> {
  return await this.convexService.query<Roadmap | null>(
    'roadmaps:getBySlug',
    { slug }  // Truyền slug làm tham số
  );
}
```

**Giải thích:**
- `{ slug }`: Shorthand cho `{ slug: slug }`, truyền slug vào query
- `Roadmap | null`: Có thể trả về Roadmap hoặc null nếu không tìm thấy

#### Ví dụ 3: Mutation - Tạo roadmap mới

```typescript
async create(input: CreateRoadmapInput, authorId: string): Promise<string> {
  return await this.convexService.mutation<string>(
    'roadmaps:create',
    {
      ...input,        // Spread operator: copy tất cả properties từ input
      author: authorId, // Thêm author ID
    }
  );
}
```

**Giải thích:**
- `mutation()`: Dùng cho thao tác thay đổi dữ liệu
- `...input`: Spread operator copy tất cả fields từ input object
- Trả về `string`: ID của roadmap vừa tạo

#### Ví dụ 4: Mutation - Cập nhật roadmap

```typescript
async update(input: UpdateRoadmapInput): Promise<string> {
  return await this.convexService.mutation<string>(
    'roadmaps:update',
    input
  );
}
```

#### Ví dụ 5: Mutation - Xóa roadmap

```typescript
async delete(id: string): Promise<string> {
  return await this.convexService.mutation<string>(
    'roadmaps:remove',
    { id }
  );
}
```

## Ví dụ hoàn chỉnh: RoadmapService

Đây là một service hoàn chỉnh sử dụng ConvexService:

```typescript
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConvexService } from '../../../../common/convex/convex.service';
import type { 
  Roadmap, 
  CreateRoadmapInput, 
  UpdateRoadmapInput 
} from '../../domain/models/roadmap.model';

@Injectable()
export class RoadmapService {
  private readonly logger = new Logger(RoadmapService.name);

  constructor(private readonly convexService: ConvexService) {}

  async findAll(): Promise<Roadmap[]> {
    this.logger.log('Fetching all roadmaps');
    return await this.convexService.query<Roadmap[]>('roadmaps:list');
  }

  async findBySlug(slug: string): Promise<Roadmap | null> {
    this.logger.log(`Fetching roadmap with slug: ${slug}`);
    return await this.convexService.query<Roadmap | null>(
      'roadmaps:getBySlug',
      { slug }
    );
  }

  async create(input: CreateRoadmapInput, authorId: string): Promise<string> {
    this.logger.log(`Creating roadmap: ${input.slug}`);
    
    // Kiểm tra slug đã tồn tại chưa
    const existing = await this.findBySlug(input.slug);
    if (existing) {
      throw new BadRequestException(
        `Roadmap with slug "${input.slug}" already exists`
      );
    }
    
    return await this.convexService.mutation<string>('roadmaps:create', {
      ...input,
      author: authorId,
    });
  }

  async update(input: UpdateRoadmapInput): Promise<string> {
    this.logger.log(`Updating roadmap: ${input.id}`);
    return await this.convexService.mutation<string>('roadmaps:update', input);
  }

  async delete(id: string): Promise<string> {
    this.logger.log(`Deleting roadmap: ${id}`);
    return await this.convexService.mutation<string>('roadmaps:remove', { id });
  }
}
```

## Các lỗi thường gặp và cách khắc phục

### Lỗi 1: "CONVEX_URL environment variable is required"

**Nguyên nhân:** Biến môi trường CONVEX_URL chưa được thiết lập

**Cách khắc phục:**
1. Kiểm tra file `.env.local` trong thư mục `apps/api/`
2. Đảm bảo có dòng: `CONVEX_URL=https://your-deployment.convex.cloud`
3. Restart ứng dụng sau khi thêm biến môi trường

### Lỗi 2: "Cannot read properties of undefined (reading 'query')"

**Nguyên nhân:** ConvexService chưa được inject đúng cách

**Cách khắc phục:**
1. Đảm bảo ConvexService được đăng ký trong `providers` của module
2. Kiểm tra constructor có inject đúng: `constructor(private readonly convexService: ConvexService)`

### Lỗi 3: Query/Mutation không tìm thấy function

**Nguyên nhân:** Tên function không đúng hoặc function chưa được export trong Convex

**Cách khắc phục:**
1. Kiểm tra file Convex (ví dụ: `convex/roadmaps.ts`)
2. Đảm bảo function được export: `export const list = query({ ... })`
3. Sử dụng đúng format: `'fileName:functionName'` (ví dụ: `'roadmaps:list'`)

### Lỗi 4: Type error với generic types

**Nguyên nhân:** TypeScript không biết type của dữ liệu trả về

**Cách khắc phục:**
```typescript
// ❌ Sai: Không chỉ định type
const roadmaps = await this.convexService.query('roadmaps:list');

// ✅ Đúng: Chỉ định type rõ ràng
const roadmaps = await this.convexService.query<Roadmap[]>('roadmaps:list');
```

### Lỗi 5: Connection timeout

**Nguyên nhân:** Không thể kết nối đến Convex server

**Cách khắc phục:**
1. Kiểm tra internet connection
2. Verify CONVEX_URL có đúng không
3. Kiểm tra Convex deployment có đang hoạt động không (truy cập Convex dashboard)

## Best Practices (Thực hành tốt)

### 1. Luôn chỉ định Generic Type

```typescript
// ✅ Tốt
const result = await this.convexService.query<Roadmap[]>('roadmaps:list');

// ❌ Tránh
const result = await this.convexService.query('roadmaps:list');
```

### 2. Xử lý lỗi đúng cách

```typescript
async findBySlug(slug: string): Promise<Roadmap | null> {
  try {
    return await this.convexService.query<Roadmap | null>(
      'roadmaps:getBySlug',
      { slug }
    );
  } catch (error) {
    this.logger.error(`Failed to fetch roadmap: ${slug}`, error);
    throw new InternalServerErrorException('Failed to fetch roadmap');
  }
}
```

### 3. Sử dụng Logger để debug

```typescript
async create(input: CreateRoadmapInput): Promise<string> {
  this.logger.log(`Creating roadmap: ${input.slug}`);
  
  const result = await this.convexService.mutation<string>(
    'roadmaps:create',
    input
  );
  
  this.logger.log(`Successfully created roadmap with ID: ${result}`);
  return result;
}
```

### 4. Validate input trước khi gọi Convex

```typescript
async create(input: CreateRoadmapInput, authorId: string): Promise<string> {
  // Validate trước
  if (!input.slug || input.slug.trim() === '') {
    throw new BadRequestException('Slug is required');
  }
  
  // Kiểm tra duplicate
  const existing = await this.findBySlug(input.slug);
  if (existing) {
    throw new BadRequestException('Slug already exists');
  }
  
  // Sau đó mới gọi mutation
  return await this.convexService.mutation<string>('roadmaps:create', {
    ...input,
    author: authorId,
  });
}
```

### 5. Đặt tên function rõ ràng

```typescript
// ✅ Tốt: Tên rõ ràng, dễ hiểu
'roadmaps:list'
'roadmaps:getBySlug'
'roadmaps:create'

// ❌ Tránh: Tên mơ hồ
'roadmaps:get'
'roadmaps:do'
'roadmaps:handle'
```

## Tài liệu tham khảo

### Convex Documentation
- [Convex Quickstart](https://docs.convex.dev/quickstart) - Hướng dẫn bắt đầu với Convex
- [Convex Client API](https://docs.convex.dev/client/javascript) - API reference cho ConvexClient
- [Queries and Mutations](https://docs.convex.dev/functions) - Cách viết query và mutation functions

### NestJS Documentation
- [NestJS Providers](https://docs.nestjs.com/providers) - Hiểu về Injectable services
- [NestJS Lifecycle Events](https://docs.nestjs.com/fundamentals/lifecycle-events) - OnModuleInit và các lifecycle hooks khác
- [NestJS Dependency Injection](https://docs.nestjs.com/fundamentals/custom-providers) - Cách DI hoạt động trong NestJS

### TypeScript
- [TypeScript Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) - Hiểu về generic types (`<T>`)
- [TypeScript Async/Await](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-1-7.html#asyncawait) - Làm việc với async code

## Câu hỏi thường gặp (FAQ)

**Q: Tại sao phải dùng ConvexService thay vì gọi ConvexClient trực tiếp?**

A: ConvexService cung cấp:
- Centralized connection management (quản lý kết nối tập trung)
- Consistent error handling (xử lý lỗi nhất quán)
- Easy testing (dễ dàng mock trong tests)
- Logging capabilities (khả năng ghi log)

**Q: Có thể sử dụng ConvexService trong nhiều modules không?**

A: Có! Chỉ cần đăng ký ConvexService trong `providers` của module đó, hoặc tạo một shared module và export ConvexService.

**Q: Làm sao để test code sử dụng ConvexService?**

A: Sử dụng mocking:

```typescript
const mockConvexService = {
  query: jest.fn(),
  mutation: jest.fn(),
};

const module = await Test.createTestingModule({
  providers: [
    RoadmapService,
    { provide: ConvexService, useValue: mockConvexService },
  ],
}).compile();
```

**Q: ConvexService có thread-safe không?**

A: Có, ConvexClient được thiết kế để sử dụng an toàn trong môi trường concurrent.

**Q: Có giới hạn số lượng query/mutation đồng thời không?**

A: Convex có rate limits, xem [Convex Limits](https://docs.convex.dev/production/state/limits) để biết chi tiết.

## Tóm tắt

ConvexService là một wrapper service đơn giản nhưng mạnh mẽ giúp:
- ✅ Kết nối đến Convex database
- ✅ Thực hiện queries (đọc dữ liệu)
- ✅ Thực hiện mutations (thay đổi dữ liệu)
- ✅ Quản lý kết nối tập trung
- ✅ Dễ dàng sử dụng và test

Hãy luôn nhớ:
1. Đăng ký ConvexService trong module providers
2. Inject vào constructor của service
3. Chỉ định generic type khi gọi query/mutation
4. Xử lý lỗi và log đầy đủ
5. Validate input trước khi gọi Convex

Chúc bạn code vui vẻ! 🚀

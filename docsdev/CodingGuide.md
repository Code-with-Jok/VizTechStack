# 🚀 VizTechStack Roadmap — Coding Guide

> **Vai trò**: Tôi là mentor/architect, bạn là developer.
> **Tech Stack**: Next.js 15 · NestJS · Convex · GraphQL · shadcn/ui · TailwindCSS 4 · Turborepo · pnpm · Vercel

---

## Phase 1 — Monorepo Foundation

### Bước 1.1: Khởi tạo pnpm workspace

> [!NOTE] > **Tại sao?** Monorepo = tất cả code trong 1 repo nhưng chia thành nhiều packages độc lập. `pnpm workspace` cho phép các packages reference lẫn nhau bằng `workspace:*` thay vì publish lên npm. Nó cũng **hoist dependencies** — nếu 5 packages đều dùng React, pnpm chỉ cài 1 bản duy nhất.
>
> **Nếu không làm?** Mỗi package phải có `node_modules` riêng → tốn dung lượng gấp 5-10 lần. Không thể import code giữa `apps/web` và `packages/ui` mà không publish lên npm trước.

```bash
cd d:/lh222k/CWJ/VizTechStack

# Init root package.json
pnpm init
```

Tạo cấu trúc thư mục:

```bash
mkdir -p apps/web apps/api
mkdir -p packages/core/roadmap-renderer packages/core/content-engine
mkdir -p packages/shared/types packages/shared/utils
mkdir -p packages/ui
mkdir -p configs/eslint-config configs/typescript-config configs/tailwind-config
mkdir -p tooling/env
mkdir -p content/roadmaps content/guides content/questions
```

> [!NOTE] > **Tại sao chia thư mục thế này?**
>
> - `apps/` = các ứng dụng chạy được (web, api) — đây là "sản phẩm cuối"
> - `packages/core/` = logic nghiệp vụ cốt lõi (renderer, content engine) — tái sử dụng được
> - `packages/shared/` = types và utils dùng chung — nền tảng cho mọi thứ
> - `packages/ui/` = UI components — dùng lại giữa nhiều apps
> - `configs/` = config files dùng chung — đảm bảo consistency
> - `tooling/` = dev tools nội bộ (env validation)
>
> **Nếu không chia?** Khi project lớn lên (50+ files), code sẽ thành "big ball of mud" — không biết file nào thuộc layer nào, import chéo lung tung, 1 thay đổi nhỏ có thể break toàn bộ app.

Tạo file `pnpm-workspace.yaml` tại root:

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "packages/core/*"
  - "packages/shared/*"
  - "configs/*"
  - "tooling/*"
```

> [!IMPORTANT] > **File này CỰC KỲ quan trọng.** Nó nói cho pnpm biết thư mục nào là "package" trong monorepo. Nếu thiếu file này, pnpm sẽ coi root là 1 project đơn lẻ — `workspace:*` trong dependencies sẽ không resolve được và `pnpm install` sẽ lỗi ngay.

---

### Bước 1.2: Root package.json

Sửa `package.json` root thành:

```json
{
  "name": "viztechstack",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "clean": "turbo clean",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\""
  },
  "devDependencies": {
    "turbo": "^2.4.0",
    "typescript": "^5.7.0",
    "prettier": "^3.5.0"
  },
  "packageManager": "pnpm@9.15.0"
}
```

> [!NOTE] > **Tại sao `private: true`?** Ngăn vô tình publish root package lên npm. Root chỉ là "điều phối viên", không phải package thật.
>
> **Tại sao scripts chỉ gọi `turbo`?** Thay vì chạy `cd apps/web && next dev` rồi `cd apps/api && nest start`, ta chỉ cần `pnpm dev` — Turborepo sẽ **chạy song song** tất cả `dev` scripts trong mọi packages. Nhanh hơn, ít sai hơn.
>
> **`packageManager` dùng để làm gì?** Đảm bảo mọi developer trong team đều dùng đúng phiên bản pnpm. Nếu ai đó dùng npm hoặc pnpm version khác, Corepack sẽ cảnh báo ngay.

---

### Bước 1.3: Turborepo config

Tạo `turbo.json` tại root:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

> [!NOTE] > **Turbo là gì?** Turborepo là "task runner thông minh" cho monorepo. Nó hiểu dependency graph giữa các packages và chạy tasks theo đúng thứ tự + **cache kết quả**.
>
> **`dependsOn: ["^build"]` nghĩa là gì?** Ký tự `^` = "build dependencies trước". Ví dụ: `apps/web` phụ thuộc `packages/ui` → Turbo sẽ build `packages/ui` TRƯỚC, rồi mới build `apps/web`. Không có `^`, chúng sẽ build song song và `apps/web` có thể fail vì `packages/ui` chưa build xong.
>
> **`outputs` dùng để làm gì?** Turbo cache kết quả build. Lần build thứ 2, nếu code không đổi, Turbo **bỏ qua build** và dùng cache → từ 2 phút xuống 2 giây.
>
> **`dev.cache: false` — tại sao?** Dev server chạy liên tục (persistent), không có "kết quả" để cache. Cache `dev` sẽ gây lỗi.
>
> **Nếu không dùng Turbo?** Bạn phải tự tay chạy build từng package theo đúng thứ tự, không có caching → CI/CD chậm gấp 3-5 lần, developer phải đợi lâu hơn.

---

### Bước 1.4: TypeScript configs

> [!NOTE] > **Tại sao tách tsconfig thành nhiều file?** Mỗi framework (Next.js, NestJS, React library) cần config TypeScript khác nhau. Thay vì copy-paste 50 dòng config giống nhau vào mỗi package, ta tạo 1 "base" rồi các preset extends từ đó → thay đổi 1 chỗ, áp dụng mọi nơi.
>
> **Nếu mỗi package tự config?** 10 packages = 10 tsconfigs khác nhau. Khi cần bật `strict: true`, phải sửa 10 files. Chắc chắn sẽ quên 1-2 cái → type-safety không đồng nhất.

Tạo `configs/typescript-config/package.json`:

```json
{
  "name": "@viztechstack/typescript-config",
  "version": "0.0.0",
  "private": true,
  "files": ["*.json"]
}
```

Tạo `configs/typescript-config/base.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "exclude": ["node_modules", "dist"]
}
```

> [!NOTE] > **Giải thích các option quan trọng:**
>
> - `strict: true` — Bật tất cả type-checking nghiêm ngặt. Phát hiện lỗi sớm hơn, production ổn định hơn. **Không bật = đánh mất 60% giá trị của TypeScript.**
> - `isolatedModules: true` — Bắt buộc cho bundlers (Vite, Next.js). Nếu tắt, một số code TS hợp lệ nhưng bundler không compile được → lỗi runtime bí ẩn.
> - `declaration: true` — Generate file `.d.ts` khi build. Các package khác cần file này để biết types của package hiện tại. Nếu tắt → import từ package khác sẽ mất type safety.

Tạo `configs/typescript-config/nextjs.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "plugins": [{ "name": "next" }],
    "allowJs": true,
    "noEmit": true
  }
}
```

> [!NOTE] > **`jsx: "preserve"` — tại sao không phải `"react-jsx"`?** Next.js tự handle JSX transform trong build pipeline. Nếu dùng `react-jsx`, TypeScript và Next.js sẽ transform JSX 2 lần → lỗi hoặc performance kém.
>
> **`noEmit: true`** — Next.js dùng SWC/Babel để compile, không dùng `tsc`. TypeScript chỉ check types, không output files.

Tạo `configs/typescript-config/nestjs.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node",
    "target": "ES2021",
    "outDir": "./dist",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "noEmit": false
  }
}
```

> [!NOTE] > **`emitDecoratorMetadata` + `experimentalDecorators`** — NestJS dùng decorators (`@Module`, `@Injectable`, `@Query`). Hai option này BẮT BUỘC. Thiếu một trong hai → NestJS dependency injection sẽ fail hoàn toàn, app crash ngay khi start.
>
> **`module: "CommonJS"`** — NestJS chạy trên Node.js với CommonJS. Nếu dùng ESNext, `require()` sẽ không work → hàng loạt lỗi import.

Tạo `configs/typescript-config/react-library.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "outDir": "./dist"
  }
}
```

> [!NOTE] > **Dùng cho `packages/ui` và `packages/core/roadmap-renderer`** — nơi viết React components dạng library (không phải app). `react-jsx` transform JSX thành `_jsx()` calls tự động, không cần `import React from 'react'`.

---

### Bước 1.5: Install dependencies

```bash
pnpm install
```

> **✅ Checkpoint 1**: Chạy `pnpm install` thành công, không lỗi. Nếu lỗi "workspace package not found" → kiểm tra lại `pnpm-workspace.yaml` đã liệt kê đúng paths chưa.

---

### Bước 1.6: Khởi tạo Next.js app

> [!NOTE] > **Tại sao dùng Next.js App Router?** App Router (thư mục `app/`) là kiến trúc mới nhất của Next.js 15, hỗ trợ React Server Components (RSC). RSC cho phép render component trên server → page load nhanh hơn, SEO tốt hơn. roadmap.sh cần SEO tốt (Google phải index được roadmaps).
>
> **Nếu dùng Pages Router cũ?** Vẫn chạy được, nhưng mất RSC, mất streaming, và Next.js đang dần deprecate Pages Router.

```bash
cd apps/web
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --no-turbopack
```

Sau khi init, sửa `apps/web/tsconfig.json` để dùng shared config:

```json
{
  "extends": "@viztechstack/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

Thêm vào `apps/web/package.json` → `devDependencies`:

```json
"@viztechstack/typescript-config": "workspace:*"
```

> [!NOTE] > **`workspace:*` nghĩa là gì?** "Dùng package từ monorepo local, bất kỳ version nào". pnpm sẽ symlink trực tiếp đến `configs/typescript-config/` thay vì download từ npm. Thay đổi config → tất cả packages tự cập nhật, không cần publish.

---

### Bước 1.7: Setup shadcn/ui

> [!NOTE] > **Tại sao shadcn/ui thay vì tự viết?** shadcn/ui không phải library — nó **copy code** components vào project của bạn. Bạn sở hữu 100% code, tự customize bất kỳ thứ gì. Kết hợp với Radix UI (headless, accessible) + TailwindCSS → có ngay components đẹp, accessible, production-ready mà không bị lock-in.
>
> **Nếu tự viết từ đầu?** Button thì đơn giản, nhưng Dropdown Menu, Dialog, Command Palette cần xử lý focus management, keyboard navigation, screen reader... Tốn 2-3 tuần chỉ cho UI cơ bản.

```bash
cd apps/web
npx -y shadcn@latest init
```

Chọn:

- Style: **New York**
- Base color: **Slate** _(dark theme giống roadmap.sh)_
- CSS variables: **Yes**

Cài components cơ bản:

```bash
npx shadcn@latest add button card badge dialog dropdown-menu input tooltip command separator avatar
```

> [!NOTE] > **`command` component** — đây là Command Menu (Cmd+K search) — một UX pattern rất phổ biến trên roadmap.sh. User nhấn Cmd+K → search roadmaps, guides. Cài trước để dùng ở Phase 4.

---

### Bước 1.8: Khởi tạo NestJS app

> [!NOTE] > **NestJS đóng vai trò gì?** NestJS là **BFF (Backend For Frontend)** — cầu nối giữa Next.js và Convex. Nó xử lý:
>
> 1. **Auth** — JWT tokens, login/register logic
> 2. **Business logic** — validation, data transformation, aggregation
> 3. **GraphQL API** — cung cấp schema rõ ràng cho frontend query
>
> **Nếu không có NestJS?** Next.js gọi Convex trực tiếp cũng được cho app nhỏ. Nhưng khi app lớn: auth logic rải rác khắp nơi, không có API contract rõ ràng, khó test, khó thêm middleware (rate limit, logging).

```bash
cd apps/api
npx -y @nestjs/cli@latest new . --package-manager pnpm --skip-git --strict
```

Sửa `apps/api/tsconfig.json`:

```json
{
  "extends": "@viztechstack/typescript-config/nestjs.json",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": "./"
  }
}
```

Thêm `@viztechstack/typescript-config": "workspace:*"` vào devDependencies.

Cài GraphQL:

```bash
cd apps/api
pnpm add @nestjs/graphql @nestjs/apollo @apollo/server graphql
```

> [!NOTE] > **Tại sao GraphQL thay vì REST?**
>
> - Roadmap page cần: roadmap info + nodes + edges + user progress + bookmarks = 5 REST calls → 1 GraphQL query
> - Frontend tự chọn fields cần thiết → không over-fetch
> - Auto-generated types từ schema → type-safe end-to-end
>
> **Trade-off**: GraphQL phức tạp hơn REST. Cho project nhỏ, REST đủ dùng. Nhưng với app kiểu roadmap.sh (nhiều data relationships), GraphQL shine.

> **✅ Checkpoint 2**: Chạy `pnpm install` từ root, sau đó `pnpm turbo dev` — cả Next.js (port 3000) và NestJS (port 3001) phải start được. Nếu port conflict, sửa port trong `apps/api/src/main.ts`.

---

## Phase 2 — Convex + Shared Packages

### Bước 2.1: Convex setup

> [!NOTE] > **Convex là gì?** Convex là database-as-a-service cung cấp: database (document-based), server functions (queries/mutations), real-time sync, file storage — tất cả trong 1 SDK. Thay vì setup PostgreSQL + Prisma + WebSocket server, bạn chỉ cần Convex.
>
> **Tại sao không dùng PostgreSQL?** Cho giai đoạn MVP, Convex giúp ship nhanh hơn 5-10x. Real-time progress tracking (user click "done" → UI update ngay) miễn phí với Convex, trong khi PostgreSQL cần thêm WebSocket layer. Có thể migrate sang PostgreSQL sau nếu cần.

```bash
# Từ root
pnpm add convex -w
npx convex init
```

> [!IMPORTANT] > **`-w` flag** = install vào workspace root. Convex cần ở root vì thư mục `convex/` nằm ở root và cả `apps/web` lẫn `apps/api` đều cần access.
>
> **`npx convex init`** sẽ yêu cầu login → tạo project trên dashboard.convex.dev. Nó tạo file `.env.local` chứa `CONVEX_DEPLOYMENT` URL. **KHÔNG commit file này lên git**.

Tạo `convex/schema.ts` — đây là database schema:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Roadmaps: Frontend, Backend, DevOps...
  roadmaps: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("role"),
      v.literal("skill"),
      v.literal("best-practice")
    ),
    difficulty: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    ),
    nodesJson: v.string(), // JSON string chứa SVG node definitions
    edgesJson: v.string(), // JSON string chứa connections giữa nodes
    topicCount: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"]),

  // Topics: nội dung chi tiết của mỗi node trong roadmap
  topics: defineTable({
    roadmapId: v.id("roadmaps"),
    nodeId: v.string(),
    title: v.string(),
    content: v.string(), // Markdown
    resources: v.array(
      v.object({
        title: v.string(),
        url: v.string(),
        type: v.string(), // "article", "video", "course"
      })
    ),
  }).index("by_roadmap", ["roadmapId"]),

  // Users
  users: defineTable({
    email: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
    role: v.union(v.literal("user"), v.literal("admin")),
  }).index("by_email", ["email"]),

  // Progress: tracking user hoàn thành node nào
  progress: defineTable({
    userId: v.id("users"),
    roadmapId: v.id("roadmaps"),
    nodeId: v.string(),
    status: v.union(
      v.literal("done"),
      v.literal("in-progress"),
      v.literal("skipped")
    ),
  }).index("by_user_roadmap", ["userId", "roadmapId"]),

  // Bookmarks
  bookmarks: defineTable({
    userId: v.id("users"),
    roadmapId: v.id("roadmaps"),
  }).index("by_user", ["userId"]),

  // Guides: bài viết hướng dẫn
  guides: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    content: v.string(),
    author: v.string(),
    tags: v.array(v.string()),
    publishedAt: v.number(),
  }).index("by_slug", ["slug"]),
});
```

> [!NOTE] > **Tại sao dùng `.index()`?** Index = "mục lục" cho database. Khi query `roadmaps.by_slug("frontend")`, Convex dùng index để tìm ngay → O(log n). Không có index → quét toàn bộ bảng → O(n). Với 100+ roadmaps, khác biệt: 1ms vs 100ms.
>
> **`nodesJson` là string, không phải object?** Convex chưa hỗ trợ nested complex types sâu. JSON string là pattern phổ biến — parse khi cần, tiết kiệm Convex bandwidth.

Deploy schema:

```bash
npx convex dev
```

> **✅ Checkpoint 3**: `npx convex dev` thành công, dashboard.convex.dev hiển thị tables.

---

### Bước 2.2: Convex functions

Tạo `convex/roadmaps.ts`:

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("roadmaps")
        .withIndex("by_category", (q) => q.eq("category", args.category as any))
        .collect();
    }
    return await ctx.db.query("roadmaps").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("roadmaps")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});
```

> [!NOTE] > **`query` vs `mutation`?** `query` = read only, Convex auto-cache và real-time subscribe. `mutation` = write, Convex auto-invalidate cache. Đặt sai loại → query có side effects sẽ bị gọi lặp lại, mutation không reactive sẽ không auto-update UI.

Tạo `convex/progress.ts`:

```typescript
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserProgress = query({
  args: {
    userId: v.id("users"),
    roadmapId: v.id("roadmaps"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("progress")
      .withIndex("by_user_roadmap", (q) =>
        q.eq("userId", args.userId).eq("roadmapId", args.roadmapId)
      )
      .collect();
  },
});

export const updateProgress = mutation({
  args: {
    userId: v.id("users"),
    roadmapId: v.id("roadmaps"),
    nodeId: v.string(),
    status: v.union(
      v.literal("done"),
      v.literal("in-progress"),
      v.literal("skipped")
    ),
  },
  handler: async (ctx, args) => {
    // Tìm progress hiện có
    const existing = await ctx.db
      .query("progress")
      .withIndex("by_user_roadmap", (q) =>
        q.eq("userId", args.userId).eq("roadmapId", args.roadmapId)
      )
      .filter((q) => q.eq(q.field("nodeId"), args.nodeId))
      .first();

    // Update nếu đã tồn tại, insert nếu chưa
    if (existing) {
      await ctx.db.patch(existing._id, { status: args.status });
      return existing._id;
    }
    return await ctx.db.insert("progress", args);
  },
});
```

---

### Bước 2.3: packages/shared/types

> [!NOTE] > **Tại sao cần shared types?** Đây là "hợp đồng" giữa Frontend và Backend. Cả Next.js lẫn NestJS đều import types từ đây → đảm bảo data format ĐỒNG NHẤT. Dùng Zod schemas vì vừa define type, vừa validate data runtime.
>
> **Nếu không shared?** FE define `type Roadmap = { title: string }`, BE define `interface Roadmap { name: string }` → mismatch → bug tại runtime mà TypeScript không bắt được.

Tạo `packages/shared/types/package.json`:

```json
{
  "name": "@viztechstack/types",
  "version": "0.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@viztechstack/typescript-config": "workspace:*",
    "typescript": "^5.7.0"
  }
}
```

Tạo `packages/shared/types/tsconfig.json`:

```json
{
  "extends": "@viztechstack/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": ["src"]
}
```

Tạo `packages/shared/types/src/roadmap.ts`:

```typescript
import { z } from "zod";

export const RoadmapNodeSchema = z.object({
  id: z.string(),
  label: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number().default(200),
  height: z.number().default(50),
  group: z.string().optional(),
  style: z
    .enum(["default", "primary", "secondary", "checkpoint"])
    .default("default"),
});

export const RoadmapEdgeSchema = z.object({
  source: z.string(),
  target: z.string(),
  label: z.string().optional(),
});

export const RoadmapSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(["role", "skill", "best-practice"]),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  nodes: z.array(RoadmapNodeSchema),
  edges: z.array(RoadmapEdgeSchema),
});

// Infer types từ schemas — KHÔNG cần define type thủ công
export type RoadmapNode = z.infer<typeof RoadmapNodeSchema>;
export type RoadmapEdge = z.infer<typeof RoadmapEdgeSchema>;
export type Roadmap = z.infer<typeof RoadmapSchema>;
```

> [!NOTE] > **`z.infer<typeof Schema>`** — đây là "magic" của Zod. Define schema 1 lần, tự động có cả runtime validation VÀ compile-time types. Nếu thay đổi schema, type tự update → zero drift giữa validation và type definition.

Tạo `packages/shared/types/src/index.ts`:

```typescript
export * from "./roadmap";
```

> [!IMPORTANT] > **Barrel export qua `index.ts`** — Quy tắc quan trọng: mỗi package CHỈ export qua `index.ts`. Import đúng: `from "@viztechstack/types"`. Import sai: `from "@viztechstack/types/src/roadmap"`. Deep import tạo coupling chặt vào internal structure → khi refactor sẽ break consumers.

---

## Phase 3 → 5: Tiếp tục

> Sau khi hoàn thành Phase 1-2, hãy cho tôi biết kết quả checkpoint. Tôi sẽ hướng dẫn tiếp Phase 3 (NestJS GraphQL), Phase 4 (Next.js pages), Phase 5 (CI/CD + Vercel) với cùng mức độ chi tiết.

---

## 📋 Thứ tự thực hiện

| #   | Bước                                     | Thời gian |
| --- | ---------------------------------------- | --------- |
| 1   | 1.1 → 1.5: Monorepo foundation + install | ~30 phút  |
| 2   | 1.6: Next.js app                         | ~10 phút  |
| 3   | 1.7: shadcn/ui                           | ~10 phút  |
| 4   | 1.8: NestJS app + GraphQL                | ~15 phút  |
| 5   | 2.1: Convex setup + schema               | ~20 phút  |
| 6   | 2.2: Convex functions                    | ~15 phút  |
| 7   | 2.3: Shared types                        | ~15 phút  |

> Hỏi tôi bất cứ lúc nào nếu gặp lỗi hoặc cần giải thích thêm! 🎯

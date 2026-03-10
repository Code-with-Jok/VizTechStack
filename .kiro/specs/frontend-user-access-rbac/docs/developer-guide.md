# Hướng dẫn Developer - Frontend User Access Logic và RBAC Integration

> Tài liệu này được viết cho intern/fresher developers để dễ dàng hiểu và triển khai feature.

## Mục lục

1. [Tổng quan](#tổng-quan)
2. [Kiến thức cần có](#kiến-thức-cần-có)
3. [Cấu trúc dự án](#cấu-trúc-dự-án)
4. [Hướng dẫn từng bước](#hướng-dẫn-từng-bước)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)

## Tổng quan

### Feature này làm gì?

Feature này xây dựng hệ thống phân quyền người dùng cho VizTechStack với 3 loại user:

1. **Guest (Khách)**: Chưa đăng nhập, chỉ xem được roadmaps
2. **User (Người dùng)**: Đã đăng nhập, xem được roadmaps
3. **Admin (Quản trị viên)**: Đã đăng nhập, có thể quản lý (CRUD) roadmaps

### Luồng hoạt động cơ bản

```
Guest vào trang web
  ↓
Thấy nút "Sign in" ở header
  ↓
Click "Sign in" → Clerk modal mở ra
  ↓
Đăng nhập thành công
  ↓
Nếu là Admin → Thấy nút "Admin" ở header
Nếu là User → Không thấy nút "Admin"
  ↓
Admin click "Admin" → Vào trang quản lý roadmaps
User không thể vào trang quản lý
```

## Kiến thức cần có

### 1. React Hooks

Bạn cần hiểu các hooks cơ bản:

```typescript
// useState - Quản lý state
const [count, setCount] = useState(0);

// useEffect - Chạy side effects
useEffect(() => {
  console.log('Component mounted');
}, []);

// Custom hooks - Tái sử dụng logic
function useAuth() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  return { isSignedIn };
}
```

### 2. Next.js App Router

```typescript
// Server Component (mặc định)
export default function Page() {
  return <div>Server Component</div>;
}

// Client Component (cần "use client")
"use client";
export default function Page() {
  const [state, setState] = useState(0);
  return <div>Client Component</div>;
}
```

### 3. TypeScript Basics

```typescript
// Interface - Định nghĩa kiểu dữ liệu
interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
}

// Type - Tương tự interface
type AuthState = {
  isSignedIn: boolean;
  isAdmin: boolean;
};

// Function với types
function greet(name: string): string {
  return `Hello ${name}`;
}
```

### 4. Clerk Authentication

Clerk là service xử lý authentication (đăng nhập/đăng ký):

```typescript
// Các components Clerk cung cấp
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

// Hook để lấy thông tin user
import { useUser } from '@clerk/nextjs';
const { user, isSignedIn } = useUser();
```

## Cấu trúc dự án

```
apps/web/src/
├── app/
│   ├── layout.tsx              # Root layout (đã có)
│   ├── page.tsx                # Landing page (đã có)
│   ├── roadmaps/
│   │   └── page.tsx            # ✨ MỚI: Trang danh sách roadmaps
│   └── admin/
│       ├── layout.tsx          # ✨ MỚI: Layout bảo vệ admin routes
│       └── roadmaps/
│           └── page.tsx        # ✨ MỚI: Trang quản lý roadmaps
├── components/
│   ├── layout/
│   │   └── Header.tsx          # 🔄 CẬP NHẬT: Thêm nút Admin
│   └── auth/
│       ├── user-button-wrapper.tsx  # Đã có
│       └── admin-button.tsx    # ✨ MỚI: Nút Admin
└── lib/
    └── hooks/
        └── use-auth.ts         # ✨ MỚI: Hook kiểm tra quyền
```

**Chú thích:**
- ✨ MỚI: File cần tạo mới
- 🔄 CẬP NHẬT: File cần chỉnh sửa
- Không có icon: File đã có, không cần sửa

## Hướng dẫn từng bước

### Bước 1: Tạo useAuth Hook

**Mục đích**: Hook này giúp kiểm tra user đã đăng nhập chưa và có quyền gì.

**File**: `apps/web/src/lib/hooks/use-auth.ts`

```typescript
"use client";

import { useUser } from '@clerk/nextjs';

// Interface định nghĩa kiểu dữ liệu trả về
export interface UseAuthReturn {
  isSignedIn: boolean;      // Đã đăng nhập chưa?
  isAdmin: boolean;         // Có phải admin không?
  isUser: boolean;          // Có phải user thường không?
  userId: string | null;    // ID của user
  role: string | null;      // Role của user
  isLoading: boolean;       // Đang load thông tin không?
}

export function useAuth(): UseAuthReturn {
  // useUser là hook của Clerk, cho ta thông tin user
  const { isSignedIn, user, isLoaded } = useUser();
  
  // Lấy role từ metadata của user
  // Clerk lưu role trong publicMetadata
  const role = user?.publicMetadata?.role as string | undefined;
  
  // Kiểm tra xem có phải admin không
  const isAdmin = role === 'admin';
  
  // Nếu không có role hoặc role là 'user' thì là user thường
  const isUser = role === 'user' || !role;

  return {
    isSignedIn: isSignedIn ?? false,  // ?? là nullish coalescing
    isAdmin,
    isUser,
    userId: user?.id ?? null,
    role: role ?? null,
    isLoading: !isLoaded,  // Nếu chưa load xong thì isLoading = true
  };
}
```

**Giải thích chi tiết:**

1. `"use client"`: Bắt buộc vì hook này dùng Clerk hooks (chỉ chạy trên client)
2. `useUser()`: Hook của Clerk, trả về thông tin user hiện tại
3. `user?.publicMetadata?.role`: Dùng optional chaining (?.) để tránh lỗi nếu user null
4. `??`: Nullish coalescing operator - trả về giá trị bên phải nếu bên trái là null/undefined

**Cách sử dụng:**

```typescript
function MyComponent() {
  const { isSignedIn, isAdmin } = useAuth();
  
  if (isAdmin) {
    return <div>Xin chào Admin!</div>;
  }
  
  if (isSignedIn) {
    return <div>Xin chào User!</div>;
  }
  
  return <div>Xin chào Guest!</div>;
}
```

### Bước 2: Tạo Admin Button Component

**Mục đích**: Nút "Admin" chỉ hiển thị cho admin users.

**File**: `apps/web/src/components/auth/admin-button.tsx`

```typescript
"use client";

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';

export function AdminButton() {
  // Lấy thông tin auth từ hook
  const { isAdmin, isLoading } = useAuth();
  
  // Nếu đang loading hoặc không phải admin → không hiển thị gì
  if (isLoading || !isAdmin) {
    return null;  // null = không render gì cả
  }
  
  // Nếu là admin → hiển thị nút
  return (
    <Button asChild variant="outline" size="sm">
      <Link href="/admin/roadmaps">
        <Shield className="mr-2 h-4 w-4" />
        Admin
      </Link>
    </Button>
  );
}
```

**Giải thích chi tiết:**

1. `asChild`: Prop của shadcn/ui Button, cho phép Button render như Link
2. `variant="outline"`: Style của button (viền)
3. `size="sm"`: Kích thước nhỏ
4. `Shield`: Icon từ lucide-react
5. `return null`: Không render gì cả (component biến mất)

**Tại sao cần check isLoading?**

Khi trang mới load, Clerk chưa biết user là ai. Nếu không check `isLoading`, button có thể nhấp nháy (hiện rồi mất).

### Bước 3: Cập nhật Header Component

**Mục đích**: Thêm link "Roadmaps" và nút "Admin" vào header.

**File**: `apps/web/src/components/layout/Header.tsx`

```typescript
"use client";

import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import UserButtonWrapper from "../auth/user-button-wrapper";
import { AdminButton } from "../auth/admin-button";  // ✨ THÊM DÒNG NÀY

export function Header() {
  return (
    <header className="border-b bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
        >
          VizTechStack
        </Link>
        <nav className="flex items-center gap-4">
          {/* ✨ THÊM LINK ROADMAPS */}
          <Link
            href="/roadmaps"
            className="text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-50"
          >
            Roadmaps
          </Link>
          
          <SignedOut>
            <SignInButton mode="modal">
              <button className="cursor-pointer text-sm font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                Sign in
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <AdminButton />  {/* ✨ THÊM NÚT ADMIN */}
            <UserButtonWrapper />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
```

**Giải thích chi tiết:**

1. `<SignedOut>`: Component của Clerk, chỉ hiển thị khi user chưa đăng nhập
2. `<SignedIn>`: Component của Clerk, chỉ hiển thị khi user đã đăng nhập
3. `<AdminButton />`: Component ta vừa tạo, tự động ẩn/hiện dựa trên role

**Kết quả:**

- Guest: Thấy "Roadmaps" và "Sign in"
- User: Thấy "Roadmaps" và User button
- Admin: Thấy "Roadmaps", "Admin", và User button



### Bước 4: Tạo Public Roadmaps Page

**Mục đích**: Trang hiển thị danh sách roadmaps, ai cũng xem được.

**File**: `apps/web/src/app/roadmaps/page.tsx`

```typescript
import { Metadata } from 'next';

// Metadata cho SEO (Google search)
export const metadata: Metadata = {
  title: 'Technology Roadmaps | VizTechStack',
  description: 'Explore curated learning paths for modern technologies',
};

// Server Component (không cần "use client")
export default function RoadmapsPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header của trang */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Technology Roadmaps
        </h1>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
          Khám phá các lộ trình học tập được tuyển chọn cho các công nghệ hiện đại
        </p>
      </div>
      
      {/* Placeholder - sẽ thay bằng danh sách thật sau */}
      <div className="text-center py-12 border rounded-lg border-zinc-200 dark:border-zinc-800">
        <p className="text-zinc-600 dark:text-zinc-400">
          Danh sách roadmaps sẽ được hiển thị ở đây
        </p>
      </div>
    </div>
  );
}
```

**Giải thích chi tiết:**

1. **Server Component**: Không có `"use client"` → render trên server → tốt cho SEO
2. **Metadata**: Next.js dùng để set title và description cho trang
3. **Tailwind classes**:
   - `container mx-auto`: Căn giữa và giới hạn width
   - `max-w-5xl`: Width tối đa 5xl (1024px)
   - `px-4 py-8`: Padding ngang 4, dọc 8
   - `text-4xl`: Font size rất lớn
   - `font-bold`: Font đậm
   - `tracking-tight`: Giảm khoảng cách giữa các chữ

**Tại sao không cần authentication?**

Trang này public, ai cũng xem được. Không cần check `isSignedIn` hay `isAdmin`.

### Bước 5: Tạo Admin Layout (Bảo vệ Admin Routes)

**Mục đích**: Layout này bảo vệ tất cả trang admin, chỉ admin mới vào được.

**File**: `apps/web/src/app/admin/layout.tsx`

```typescript
"use client";

import { useAuth } from '@/lib/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading, isSignedIn } = useAuth();
  const router = useRouter();
  
  // useEffect: Chạy sau khi component render
  useEffect(() => {
    // Nếu không đăng nhập → redirect về trang chủ
    if (!isLoading && !isSignedIn) {
      router.push('/');
    }
  }, [isLoading, isSignedIn, router]);
  // [isLoading, isSignedIn, router] = dependencies
  // useEffect chạy lại khi các giá trị này thay đổi
  
  // Đang loading → hiển thị loading
  if (isLoading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-zinc-600 dark:text-zinc-400">
            Đang kiểm tra quyền truy cập...
          </p>
        </div>
      </div>
    );
  }
  
  // Không phải admin → hiển thị lỗi
  if (!isAdmin) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <Alert variant="destructive">
          <AlertDescription>
            Bạn không có quyền truy cập trang này. 
            Chỉ Admin mới có thể quản lý roadmaps.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Là admin → hiển thị nội dung
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {children}
    </div>
  );
}
```

**Giải thích chi tiết:**

1. **useEffect với redirect**:
   ```typescript
   useEffect(() => {
     if (!isLoading && !isSignedIn) {
       router.push('/');  // Chuyển về trang chủ
     }
   }, [isLoading, isSignedIn, router]);
   ```
   - Chỉ redirect khi `!isLoading` (đã load xong)
   - Nếu redirect ngay khi loading → có thể redirect nhầm

2. **3 trạng thái render**:
   - Loading: Hiển thị "Đang kiểm tra..."
   - Not admin: Hiển thị lỗi tiếng Việt
   - Is admin: Hiển thị children (nội dung trang)

3. **children prop**:
   - `children` là nội dung bên trong layout
   - Ví dụ: `/admin/roadmaps/page.tsx` sẽ là children

**Cách hoạt động:**

```
User vào /admin/roadmaps
  ↓
AdminLayout render
  ↓
Check isLoading → true → Hiển thị "Đang kiểm tra..."
  ↓
Clerk load xong → isLoading = false
  ↓
Check isSignedIn → false → Redirect về /
  ↓
Hoặc check isAdmin → false → Hiển thị lỗi
  ↓
Hoặc check isAdmin → true → Hiển thị children
```

### Bước 6: Tạo Admin Dashboard Page

**Mục đích**: Trang quản lý roadmaps cho admin.

**File**: `apps/web/src/app/admin/roadmaps/page.tsx`

```typescript
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminRoadmapsPage() {
  return (
    <div>
      {/* Header với nút tạo mới */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Quản lý Roadmap
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Tạo, chỉnh sửa và quản lý các technology roadmaps
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/roadmaps/new">
            <Plus className="mr-2 h-4 w-4" />
            Tạo Roadmap Mới
          </Link>
        </Button>
      </div>
      
      {/* Placeholder - sẽ thay bằng bảng quản lý thật sau */}
      <div className="text-center py-12 border rounded-lg border-zinc-200 dark:border-zinc-800">
        <p className="text-zinc-600 dark:text-zinc-400">
          Bảng quản lý roadmaps sẽ được hiển thị ở đây
        </p>
      </div>
    </div>
  );
}
```

**Giải thích chi tiết:**

1. **flex items-center justify-between**:
   - `flex`: Dùng flexbox
   - `items-center`: Căn giữa theo chiều dọc
   - `justify-between`: Đẩy 2 phần tử ra 2 đầu

2. **Button với Link**:
   ```typescript
   <Button asChild>
     <Link href="/admin/roadmaps/new">...</Link>
   </Button>
   ```
   - `asChild`: Button render như Link (giữ style của Button)
   - Khi click → chuyển đến `/admin/roadmaps/new`

**Trang này được bảo vệ như thế nào?**

- Trang này nằm trong `/admin/` folder
- AdminLayout tự động bảo vệ tất cả trang trong `/admin/`
- Không cần check auth trong page này

## Testing

### Test thủ công (Manual Testing)

**Checklist test cho Guest:**

1. ✅ Mở browser ở chế độ incognito
2. ✅ Vào `http://localhost:3000`
3. ✅ Kiểm tra header:
   - Có link "Roadmaps"? ✓
   - Có nút "Sign in"? ✓
   - Không có nút "Admin"? ✓
4. ✅ Click "Roadmaps" → Vào được trang `/roadmaps`? ✓
5. ✅ Thử vào `/admin/roadmaps` → Redirect về `/`? ✓

**Checklist test cho User:**

1. ✅ Đăng nhập với tài khoản user (không có role admin)
2. ✅ Kiểm tra header:
   - Có link "Roadmaps"? ✓
   - Có User button (avatar)? ✓
   - Không có nút "Admin"? ✓
3. ✅ Click "Roadmaps" → Vào được trang `/roadmaps`? ✓
4. ✅ Thử vào `/admin/roadmaps` → Thấy lỗi tiếng Việt? ✓

**Checklist test cho Admin:**

1. ✅ Đăng nhập với tài khoản admin (role = "admin")
2. ✅ Kiểm tra header:
   - Có link "Roadmaps"? ✓
   - Có nút "Admin"? ✓
   - Có User button (avatar)? ✓
3. ✅ Click "Admin" → Vào được `/admin/roadmaps`? ✓
4. ✅ Thấy trang "Quản lý Roadmap"? ✓
5. ✅ Có nút "Tạo Roadmap Mới"? ✓

### Test tự động (Unit Tests)

**Test useAuth hook:**

```typescript
// apps/web/src/lib/hooks/__tests__/use-auth.test.ts
import { renderHook } from '@testing-library/react';
import { useAuth } from '../use-auth';

// Mock Clerk's useUser hook
jest.mock('@clerk/nextjs', () => ({
  useUser: jest.fn(),
}));

describe('useAuth', () => {
  it('should return not signed in for guest', () => {
    // Setup mock
    const { useUser } = require('@clerk/nextjs');
    useUser.mockReturnValue({
      isSignedIn: false,
      user: null,
      isLoaded: true,
    });
    
    // Render hook
    const { result } = renderHook(() => useAuth());
    
    // Assertions
    expect(result.current.isSignedIn).toBe(false);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isUser).toBe(false);
  });
  
  it('should return admin for admin user', () => {
    const { useUser } = require('@clerk/nextjs');
    useUser.mockReturnValue({
      isSignedIn: true,
      user: {
        id: 'user_123',
        publicMetadata: { role: 'admin' },
      },
      isLoaded: true,
    });
    
    const { result } = renderHook(() => useAuth());
    
    expect(result.current.isSignedIn).toBe(true);
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.isUser).toBe(false);
  });
});
```

**Chạy tests:**

```bash
# Chạy tất cả tests
pnpm test

# Chạy tests cho web app
pnpm test --filter @viztechstack/web

# Chạy tests với coverage
pnpm test --coverage
```

## Troubleshooting

### Lỗi 1: "Cannot find module '@/lib/hooks/use-auth'"

**Nguyên nhân**: File chưa được tạo hoặc path sai.

**Giải pháp**:
1. Kiểm tra file có tồn tại: `apps/web/src/lib/hooks/use-auth.ts`
2. Kiểm tra tsconfig.json có config `@` alias:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

### Lỗi 2: AdminButton không hiển thị cho admin

**Nguyên nhân**: Role không được set trong Clerk metadata.

**Giải pháp**:
1. Vào Clerk Dashboard
2. Chọn user cần set admin
3. Vào tab "Metadata"
4. Thêm vào Public metadata:
   ```json
   {
     "role": "admin"
   }
   ```
5. Save và refresh trang

### Lỗi 3: "Hydration failed" error

**Nguyên nhân**: Server render khác client render.

**Giải pháp**:
1. Đảm bảo components dùng auth phải có `"use client"`
2. Không render conditional content dựa trên auth trong Server Components
3. Dùng `suppressHydrationWarning` nếu cần:
   ```typescript
   <div suppressHydrationWarning>
     {isAdmin && <AdminButton />}
   </div>
   ```

### Lỗi 4: Redirect loop (trang cứ reload mãi)

**Nguyên nhân**: useEffect redirect không check `isLoading`.

**Giải pháp**:
```typescript
// ❌ SAI - Redirect ngay cả khi đang loading
useEffect(() => {
  if (!isSignedIn) {
    router.push('/');
  }
}, [isSignedIn, router]);

// ✅ ĐÚNG - Chỉ redirect khi đã load xong
useEffect(() => {
  if (!isLoading && !isSignedIn) {
    router.push('/');
  }
}, [isLoading, isSignedIn, router]);
```

### Lỗi 5: TypeScript error "Property 'role' does not exist"

**Nguyên nhân**: TypeScript không biết publicMetadata có field role.

**Giải pháp**: Thêm type assertion:
```typescript
const role = user?.publicMetadata?.role as string | undefined;
```

## Checklist trước khi commit

- [ ] Code chạy được: `pnpm dev`
- [ ] Không có TypeScript errors: `pnpm typecheck`
- [ ] Không có linting errors: `pnpm lint`
- [ ] Tests pass: `pnpm test`
- [ ] Đã test thủ công với 3 loại user (Guest, User, Admin)
- [ ] Error messages đều bằng tiếng Việt
- [ ] Commit message theo format: `feat: add user access logic and RBAC`

## Tài liệu tham khảo

- [Next.js App Router](https://nextjs.org/docs/app)
- [Clerk Documentation](https://clerk.com/docs)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

## Câu hỏi thường gặp (FAQ)

**Q: Tại sao phải dùng "use client" cho useAuth?**

A: Vì useAuth dùng Clerk's useUser hook, mà hook này chỉ chạy trên client (cần access browser APIs).

**Q: Có thể dùng useAuth trong Server Component không?**

A: Không. Server Components không thể dùng hooks. Phải dùng trong Client Components.

**Q: Làm sao để thêm role "admin" cho user?**

A: Vào Clerk Dashboard → Users → Chọn user → Metadata → Thêm `{"role": "admin"}` vào Public metadata.

**Q: Tại sao không check auth trong public roadmaps page?**

A: Vì trang đó public, ai cũng xem được. Không cần authentication.

**Q: AdminLayout có bảo vệ tất cả trang trong /admin/ không?**

A: Có. Next.js App Router tự động apply layout cho tất cả routes con.

---

**Chúc bạn code vui vẻ! 🚀**

Nếu gặp vấn đề, hãy hỏi senior developer hoặc tạo issue trên GitHub.

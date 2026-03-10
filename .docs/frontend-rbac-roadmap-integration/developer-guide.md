# Hướng dẫn Developer - Frontend RBAC Roadmap Integration

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

Feature này xây dựng hệ thống quản lý roadmaps với phân quyền người dùng cho VizTechStack:

1. **Guest (Khách)**: Chưa đăng nhập, chỉ xem được roadmaps công khai
2. **User (Người dùng)**: Đã đăng nhập, xem được roadmaps công khai
3. **Admin (Quản trị viên)**: Đã đăng nhập, có thể quản lý (CRUD) roadmaps

### Luồng hoạt động cơ bản

```
Guest vào trang web
↓
Thấy danh sách roadmaps công khai
↓
Click "Sign in" → Clerk modal mở ra
↓
Đăng nhập thành công
↓
Nếu là Admin → Thấy nút "Admin" ở header → Click vào admin panel
Nếu là User → Chỉ xem roadmaps, không có quyền admin
↓
Admin có thể: Tạo, sửa, xóa roadmaps
User chỉ có thể: Xem roadmaps
```

## Kiến thức cần có

### 1. React Hooks
Bạn cần hiểu các hooks cơ bản:

```typescript
// useState - Quản lý state
const [roadmaps, setRoadmaps] = useState([]);

// useEffect - Chạy side effects
useEffect(() => {
  fetchRoadmaps();
}, []);

// Custom hooks - Tái sử dụng logic
function useRoadmaps() {
  const [roadmaps, setRoadmaps] = useState([]);
  return { roadmaps };
}
```

### 2. Apollo Client & GraphQL
Apollo Client là thư viện quản lý GraphQL requests:

```typescript
// Query - Lấy dữ liệu
const { data, loading, error } = useQuery(GET_ROADMAPS);

// Mutation - Thay đổi dữ liệu
const [createRoadmap] = useMutation(CREATE_ROADMAP);

// GraphQL Query
const GET_ROADMAPS = gql`
  query GetRoadmaps {
    roadmaps {
      id
      title
      description
    }
  }
`;
```

### 3. Next.js App Router

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

### 4. TypeScript Basics

```typescript
// Interface - Định nghĩa kiểu dữ liệu
interface Roadmap {
  id: string;
  title: string;
  description: string;
  tags: string[];
  isPublished: boolean;
}

// Type - Tương tự interface
type RoadmapFormData = {
  title: string;
  description: string;
  content: string;
};
```

### 5. Clerk Authentication
Clerk là service xử lý authentication:

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
│   │   ├── page.tsx            # ✨ MỚI: Trang danh sách roadmaps
│   │   └── [slug]/page.tsx     # ✨ MỚI: Trang chi tiết roadmap
│   └── admin/
│       ├── layout.tsx          # ✨ MỚI: Layout bảo vệ admin routes
│       └── roadmaps/
│           ├── page.tsx        # ✨ MỚI: Admin dashboard
│           ├── new/page.tsx    # ✨ MỚI: Tạo roadmap mới
│           └── [id]/edit/page.tsx # ✨ MỚI: Chỉnh sửa roadmap
├── components/
│   ├── layout/
│   │   └── Header.tsx          # 🔄 CẬP NHẬT: Thêm nút Admin
│   ├── auth/
│   │   ├── user-button-wrapper.tsx  # Đã có
│   │   └── admin-button.tsx    # ✨ MỚI: Nút Admin
│   ├── roadmap/
│   │   ├── roadmap-list.tsx    # ✨ MỚI: Danh sách roadmaps
│   │   ├── roadmap-card.tsx    # ✨ MỚI: Card roadmap
│   │   └── roadmap-content.tsx # ✨ MỚI: Nội dung roadmap
│   └── admin/
│       ├── roadmap-table.tsx   # ✨ MỚI: Bảng quản lý roadmaps
│       ├── roadmap-form.tsx    # ✨ MỚI: Form tạo/sửa roadmap
│       └── delete-roadmap-dialog.tsx # ✨ MỚI: Dialog xóa roadmap
├── lib/
│   ├── apollo/
│   │   └── client.ts           # ✨ MỚI: Apollo Client setup
│   └── hooks/
│       ├── use-auth.ts         # ✨ MỚI: Hook kiểm tra quyền
│       └── use-roadmap.ts      # ✨ MỚI: Hook CRUD roadmaps
└── features/
    └── roadmap/
        ├── types.ts            # ✨ MỚI: TypeScript types
        └── queries.ts          # ✨ MỚI: GraphQL queries
```

**Chú thích:**
- ✨ MỚI: File cần tạo mới
- 🔄 CẬP NHẬT: File cần chỉnh sửa
- Không có icon: File đã có, không cần sửa

## Hướng dẫn từng bước

### Bước 1: Setup Apollo Client với Authentication

**Mục đích**: Kết nối frontend với GraphQL API backend, tự động gắn JWT token vào requests.

**File**: `apps/web/src/lib/apollo/client.ts`

```typescript
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

interface CreateApolloClientOptions {
  getToken: () => Promise<string | null>;
}

export function createApolloClient({ getToken }: CreateApolloClientOptions) {
  // HTTP connection đến GraphQL API
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  });

  // Authentication link - tự động gắn JWT token
  const authLink = setContext(async (_, { headers }) => {
    const token = await getToken();
    
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  // Error handling link
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        if (extensions?.code === 'UNAUTHENTICATED') {
          console.error('[Auth Error]:', message);
        } else if (extensions?.code === 'FORBIDDEN') {
          console.error('[Permission Error]:', message);
        }
      });
    }
    
    if (networkError) {
      console.error('[Network Error]:', networkError);
    }
  });

  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            roadmaps: {
              merge(existing = [], incoming) {
                return incoming; // Replace thay vì append
              },
            },
            roadmapsForAdmin: {
              merge(existing = [], incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
      },
    },
  });
}
```

**Giải thích chi tiết:**
1. **authLink**: Tự động lấy JWT token từ Clerk và gắn vào header
2. **errorLink**: Xử lý lỗi authentication và network
3. **cache typePolicies**: Cấu hình cách Apollo merge data vào cache
4. **fetchPolicy**: `cache-and-network` = hiển thị cache ngay, fetch data mới

## 🐛 Troubleshooting Guide

### Common Issues

#### 1. Authentication Issues
```typescript
// Problem: JWT token not being sent
// Solution: Check Apollo Client auth link configuration
const authLink = setContext(async (_, { headers }) => {
  const token = await getToken();
  console.log('Token:', token); // Debug log
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Problem: Role not detected correctly
// Solution: Check Clerk publicMetadata
const { user } = useUser();
console.log('User metadata:', user?.publicMetadata);
console.log('Role:', user?.publicMetadata?.role);
```

#### 2. GraphQL Issues
```typescript
// Problem: Query not updating after mutation
// Solution: Add refetchQueries to mutation
const [createMutation] = useMutation(CREATE_ROADMAP, {
  refetchQueries: [
    { query: GET_ROADMAPS },
    { query: GET_ROADMAPS_FOR_ADMIN }
  ],
});

// Problem: Cache not updating
// Solution: Check cache policies and merge functions
cache: new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        roadmaps: {
          merge(existing = [], incoming) {
            return incoming; // Replace instead of append
          },
        },
      },
    },
  },
})
```

#### 3. Component Issues
```typescript
// Problem: Component not re-rendering
// Solution: Check dependencies in useEffect/useMemo
useEffect(() => {
  // Effect logic
}, [dependency1, dependency2]); // Make sure all dependencies are included

// Problem: Form not submitting
// Solution: Check form validation and error handling
const onSubmit = async (data: FormData) => {
  try {
    await submitFunction(data);
  } catch (error) {
    console.error('Submit error:', error);
    // Handle error appropriately
  }
};
```

### Debugging Tools

#### 1. Apollo Client DevTools
```typescript
// Enable Apollo DevTools in development
const client = new ApolloClient({
  // ... config
  connectToDevTools: process.env.NODE_ENV === 'development',
});
```

#### 2. React DevTools
- Install React DevTools browser extension
- Use Profiler to identify performance issues
- Inspect component props and state

#### 3. Network Debugging
```typescript
// Log GraphQL requests/responses
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  console.log('Operation:', operation.operationName);
  console.log('Variables:', operation.variables);
  
  if (graphQLErrors) {
    console.log('GraphQL Errors:', graphQLErrors);
  }
  
  if (networkError) {
    console.log('Network Error:', networkError);
  }
});
```

## 📚 Best Practices

### Code Organization
```typescript
// File naming conventions
components/
├── admin/
│   ├── roadmap-form.tsx        // kebab-case for files
│   └── delete-roadmap-dialog.tsx
└── roadmap/
    ├── roadmap-list.tsx
    └── roadmap-card.tsx

// Component naming conventions
export function RoadmapForm() {}     // PascalCase for components
export function useRoadmaps() {}     // camelCase with 'use' prefix for hooks
export const ROADMAP_FRAGMENT = gql``; // UPPER_CASE for constants
```

### Error Handling
```typescript
// 1. Component-level error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <RoadmapList />
</ErrorBoundary>

// 2. Hook-level error processing
export function useRoadmapsWithErrorHandling() {
  const { data, loading, error } = useRoadmaps();
  
  const processedError = useMemo(() => {
    if (!error) return null;
    
    if (error.networkError) {
      return 'Network error. Please check your connection.';
    }
    
    if (error.graphQLErrors?.length > 0) {
      const firstError = error.graphQLErrors[0];
      if (firstError.extensions?.code === 'UNAUTHENTICATED') {
        return 'Please sign in to continue.';
      }
      if (firstError.extensions?.code === 'FORBIDDEN') {
        return 'You do not have permission to access this resource.';
      }
    }
    
    return 'An unexpected error occurred.';
  }, [error]);
  
  return { data, loading, error: processedError };
}

// 3. Global error handling in Apollo Client
const errorLink = onError(({ graphQLErrors, networkError }) => {
  // Log errors, show notifications, etc.
});
```

### Security Best Practices
```typescript
// 1. Input validation with Zod
const roadmapSchema = z.object({
  title: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  content: z.string().min(1),
});

// 2. Sanitize user input
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(userInput);

// 3. Role-based access control
const { isAdmin } = useAuth();
if (!isAdmin) {
  return <PermissionDenied />;
}

// 4. Secure API calls
// Always use HTTPS in production
// Validate JWT tokens on backend
// Implement rate limiting
```

### Testing Strategy
```typescript
// 1. Unit tests for utilities
describe('formatDate', () => {
  it('formats date correctly', () => {
    expect(formatDate(timestamp)).toBe('Jan 01, 2024');
  });
});

// 2. Component tests
describe('RoadmapCard', () => {
  it('renders roadmap information', () => {
    render(<RoadmapCard roadmap={mockRoadmap} />);
    expect(screen.getByText(mockRoadmap.title)).toBeInTheDocument();
  });
});

// 3. Integration tests
describe('RoadmapList integration', () => {
  it('fetches and displays roadmaps', async () => {
    render(<RoadmapList />);
    await waitFor(() => {
      expect(screen.getByText('Test Roadmap')).toBeInTheDocument();
    });
  });
});

// 4. E2E tests with Playwright
test('admin can create roadmap', async ({ page }) => {
  await page.goto('/admin/roadmaps/new');
  await page.fill('[data-testid="title-input"]', 'Test Roadmap');
  await page.click('[data-testid="submit-button"]');
  await expect(page).toHaveURL('/admin/roadmaps');
});
```

## 📖 Resources & Documentation

### Internal Documentation
- [Requirements](../../.kiro/specs/frontend-rbac-roadmap-integration/requirements.md)
- [Design Document](../../.kiro/specs/frontend-rbac-roadmap-integration/design.md)
- [Task List](../../.kiro/specs/frontend-rbac-roadmap-integration/tasks.md)
- [Tech Stack](../../tech.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Clerk Documentation](https://clerk.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Learning Path
1. **Week 1**: Next.js App Router, React Server/Client Components
2. **Week 2**: Apollo Client, GraphQL, Authentication with Clerk
3. **Week 3**: Component architecture, State management patterns
4. **Week 4**: Testing strategies, Performance optimization
5. **Week 5**: Advanced patterns, Troubleshooting, Best practices

---

**Last Updated:** 2024-12-19  
**Version:** 1.0.0  
**Maintainer:** VizTechStack Frontend Team  
**Review Status:** ✅ Ready for Development

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
5. ✅ Thấy danh sách roadmaps công khai? ✓
6. ✅ Thử vào `/admin/roadmaps` → Redirect về `/`? ✓

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
6. ✅ Thấy bảng danh sách roadmaps? ✓
7. ✅ Có thể xóa roadmap? ✓

### Test GraphQL Operations

**Test Apollo Client:**
```bash
# 1. Mở browser DevTools
# 2. Vào tab Network
# 3. Filter "XHR/Fetch"
# 4. Thực hiện các actions:

# - Load roadmaps page → Thấy request GET_ROADMAPS
# - Login as admin → Load admin page → Thấy request GET_ROADMAPS_FOR_ADMIN
# - Delete roadmap → Thấy request DELETE_ROADMAP
# - Sau delete → Thấy refetch GET_ROADMAPS và GET_ROADMAPS_FOR_ADMIN
```

**Test Error Handling:**
```bash
# 1. Tắt backend API server
# 2. Reload trang roadmaps
# 3. Kiểm tra:
#    - Có hiển thị error message tiếng Việt?
#    - Console có log network error?
#    - Không crash app?

# 4. Bật lại backend
# 5. Reload trang
# 6. Kiểm tra data load bình thường
```

### Test tự động (Unit Tests)

**Test useRoadmaps hook:**
```typescript
// apps/web/src/lib/hooks/__tests__/use-roadmap.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { useRoadmaps } from '../use-roadmap';
import { GET_ROADMAPS } from '@/features/roadmap/queries';

const mocks = [
  {
    request: {
      query: GET_ROADMAPS,
    },
    result: {
      data: {
        roadmaps: [
          {
            id: '1',
            title: 'React Roadmap',
            slug: 'react-roadmap',
            description: 'Learn React step by step',
            content: 'Content here',
            author: 'user_123',
            tags: ['react', 'javascript'],
            publishedAt: Date.now(),
            updatedAt: Date.now(),
            isPublished: true,
          },
        ],
      },
    },
  },
];

describe('useRoadmaps', () => {
  it('should fetch roadmaps successfully', async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    );

    const { result } = renderHook(() => useRoadmaps(), { wrapper });

    expect(result.current.loading).toBe(true);
    expect(result.current.roadmaps).toEqual([]);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.roadmaps).toHaveLength(1);
    expect(result.current.roadmaps[0].title).toBe('React Roadmap');
  });
});
```

**Test RoadmapCard component:**
```typescript
// apps/web/src/components/roadmap/__tests__/roadmap-card.test.tsx
import { render, screen } from '@testing-library/react';
import { RoadmapCard } from '../roadmap-card';
import type { Roadmap } from '@/features/roadmap/types';

const mockRoadmap: Roadmap = {
  id: '1',
  title: 'React Roadmap',
  slug: 'react-roadmap',
  description: 'Learn React step by step',
  content: 'Content here',
  author: 'user_123',
  tags: ['react', 'javascript', 'frontend'],
  publishedAt: Date.now(),
  updatedAt: Date.now(),
  isPublished: true,
};

describe('RoadmapCard', () => {
  it('renders roadmap information correctly', () => {
    render(<RoadmapCard roadmap={mockRoadmap} />);
    
    expect(screen.getByText('React Roadmap')).toBeInTheDocument();
    expect(screen.getByText('Learn React step by step')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument(); // +1 for remaining tags
  });

  it('creates correct link to roadmap detail', () => {
    render(<RoadmapCard roadmap={mockRoadmap} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/roadmaps/react-roadmap');
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

# Chạy tests trong watch mode
pnpm test --watch
```

## Troubleshooting

### Lỗi 1: "Cannot find module '@/lib/hooks/use-roadmap'"

**Nguyên nhân**: File chưa được tạo hoặc path alias sai.

**Giải pháp**:
1. Kiểm tra file có tồn tại: `apps/web/src/lib/hooks/use-roadmap.ts`
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

### Lỗi 2: "GraphQL error: Cannot return null for non-nullable field"

**Nguyên nhân**: Backend trả về null cho field bắt buộc.

**Giải pháp**:
1. Kiểm tra backend resolver có handle null values:
```typescript
// Backend resolver
return {
  ...roadmap,
  content: roadmap.content || '',  // Fallback cho null
  author: roadmap.author || '',
  tags: roadmap.tags || [],
};
```

### Lỗi 3: AdminButton không hiển thị cho admin

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

### Lỗi 4: "Apollo Client cache not updating after mutation"

**Nguyên nhân**: Không có refetchQueries trong mutation.

**Giải pháp**:
```typescript
// ❌ SAI - Không refetch
const [createMutation] = useMutation(CREATE_ROADMAP);

// ✅ ĐÚNG - Có refetch
const [createMutation] = useMutation(CREATE_ROADMAP, {
  refetchQueries: [
    { query: GET_ROADMAPS },
    { query: GET_ROADMAPS_FOR_ADMIN }
  ],
});
```

### Lỗi 5: "Hydration failed" error

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

### Lỗi 6: "Network error: Failed to fetch"

**Nguyên nhân**: GraphQL endpoint URL sai hoặc backend không chạy.

**Giải pháp**:
1. Kiểm tra backend đang chạy: `http://localhost:4000/graphql`
2. Kiểm tra environment variable:
```bash
# apps/web/.env.local
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:4000/graphql
```
3. Restart frontend sau khi thay đổi env

### Lỗi 7: Redirect loop (trang cứ reload mãi)

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

### Lỗi 8: TypeScript error "Property 'role' does not exist"

**Nguyên nhân**: TypeScript không biết publicMetadata có field role.

**Giải pháp**: Thêm type assertion:
```typescript
const role = user?.publicMetadata?.role as string | undefined;
```

### Lỗi 9: "Cannot read properties of undefined (reading 'map')"

**Nguyên nhân**: Component render trước khi data load xong.

**Giải pháp**:
```typescript
// ❌ SAI - Không check data
return (
  <div>
    {roadmaps.map(roadmap => <RoadmapCard key={roadmap.id} roadmap={roadmap} />)}
  </div>
);

// ✅ ĐÚNG - Check data trước khi map
if (loading) return <div>Loading...</div>;
if (!roadmaps || roadmaps.length === 0) return <div>No data</div>;

return (
  <div>
    {roadmaps.map(roadmap => <RoadmapCard key={roadmap.id} roadmap={roadmap} />)}
  </div>
);
```

## Checklist trước khi commit

- [ ] Code chạy được: `pnpm dev`
- [ ] Không có TypeScript errors: `pnpm typecheck`
- [ ] Không có linting errors: `pnpm lint`
- [ ] Tests pass: `pnpm test`
- [ ] Đã test thủ công với 3 loại user (Guest, User, Admin)
- [ ] GraphQL operations hoạt động đúng
- [ ] Error messages đều bằng tiếng Việt
- [ ] Cache updates sau mutations
- [ ] Loading states hiển thị đúng
- [ ] Commit message theo format: `feat: implement roadmap CRUD with RBAC`

## Performance Tips

### 1. Optimize GraphQL Queries
```typescript
// ✅ GOOD - Chỉ fetch fields cần thiết
const GET_ROADMAPS = gql`
  query GetRoadmaps {
    roadmaps {
      id
      title
      slug
      description
      tags
      publishedAt
      isPublished
      # Không fetch content (quá lớn) cho listing
    }
  }
`;

// ❌ BAD - Fetch tất cả fields
const GET_ROADMAPS = gql`
  query GetRoadmaps {
    roadmaps {
      id
      title
      slug
      description
      content  # Không cần cho listing
      author
      tags
      publishedAt
      updatedAt
      isPublished
    }
  }
`;
```

### 2. Memoize Components
```typescript
// Memoize RoadmapCard để tránh re-render không cần thiết
import { memo } from 'react';

export const RoadmapCard = memo(({ roadmap }: RoadmapCardProps) => {
  return <Card>...</Card>;
});
```

### 3. Use Proper Fetch Policies
```typescript
// Cho listing pages - luôn fetch fresh data
fetchPolicy: 'cache-and-network'

// Cho detail pages - dùng cache nếu có
fetchPolicy: 'cache-first'

// Cho admin operations - luôn fetch fresh
fetchPolicy: 'network-only'
```

## Security Best Practices

### 1. Input Validation
```typescript
// Validate trên frontend (UX) và backend (security)
const roadmapSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được trống').max(100, 'Tiêu đề quá dài'),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  content: z.string().min(1, 'Nội dung không được trống'),
});
```

### 2. Role-Based Access Control
```typescript
// Luôn check quyền trên cả frontend và backend
const { isAdmin } = useAuth();

if (!isAdmin) {
  return <PermissionDenied />;
}
```

### 3. Sanitize User Input
```typescript
// Nếu render HTML từ user input
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(roadmap.content);
```

## Tài liệu tham khảo

- [Next.js App Router](https://nextjs.org/docs/app)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Clerk Documentation](https://clerk.com/docs)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)

## Câu hỏi thường gặp (FAQ)

**Q: Tại sao phải dùng "use client" cho useRoadmaps?**
A: Vì useRoadmaps dùng Apollo Client hooks (useQuery, useMutation), mà các hooks này chỉ chạy trên client.

**Q: Có thể dùng useRoadmaps trong Server Component không?**
A: Không. Server Components không thể dùng hooks. Phải dùng trong Client Components.

**Q: Làm sao để thêm role "admin" cho user?**
A: Vào Clerk Dashboard → Users → Chọn user → Metadata → Thêm `{"role": "admin"}` vào Public metadata.

**Q: Tại sao cần refetchQueries trong mutations?**
A: Để Apollo Client tự động update cache sau khi mutation thành công, đảm bảo UI hiển thị data mới nhất.

**Q: AdminLayout có bảo vệ tất cả trang trong /admin/ không?**
A: Có. Next.js App Router tự động apply layout cho tất cả routes con.

**Q: Cache policy nào nên dùng khi nào?**
A: 
- `cache-and-network`: Listing pages (hiển thị cache ngay, fetch fresh data)
- `cache-first`: Detail pages (dùng cache nếu có)
- `network-only`: Admin operations (luôn fetch fresh)

**Q: Làm sao debug GraphQL requests?**
A: Mở Browser DevTools → Network tab → Filter "XHR/Fetch" → Thực hiện actions để xem requests.

---

**Chúc bạn code vui vẻ! 🚀**

Nếu gặp vấn đề, hãy hỏi senior developer hoặc tạo issue trên GitHub.

---

**Last Updated:** 2024-12-19  
**Version:** 2.0.0  
**Maintainer:** VizTechStack Frontend Team  
**Review Status:** ✅ Ready for Development
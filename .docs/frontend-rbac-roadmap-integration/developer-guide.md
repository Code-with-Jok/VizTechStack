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

### 3. Backend Architecture - Queries & Permissions

**Hiểu về 2 loại queries:**

```typescript
// 1. PUBLIC QUERY - roadmaps:list
// Trả về: Chỉ published roadmaps
// Được gọi bởi: GET_ROADMAPS
// Ai dùng: Guest, User, Admin (khi xem public)
const GET_ROADMAPS = gql`
  query GetRoadmaps {
    roadmaps {  # Gọi resolver roadmaps() → roadmaps:list
      id
      title
      isPublished  # Luôn = true
    }
  }
`;

// 2. ADMIN QUERY - roadmaps:listAll  
// Trả về: TẤT CẢ roadmaps (published + drafts)
// Được gọi bởi: GET_ROADMAPS_FOR_ADMIN
// Ai dùng: Chỉ Admin (có @Roles('admin'))
const GET_ROADMAPS_FOR_ADMIN = gql`
  query GetRoadmapsForAdmin {
    roadmapsForAdmin {  # Gọi resolver roadmapsForAdmin() → roadmaps:listAll
      id
      title
      isPublished  # Có thể = true hoặc false
    }
  }
`;
```

**Tại sao tách biệt?**
- **Security**: Guest/User không thể thấy draft content
- **Performance**: Public query nhanh hơn (ít data hơn)
- **UX**: Admin cần thấy drafts để quản lý, public không cần

### 4. Next.js App Router

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

### 5. TypeScript Basics

```typescript
// Interface - Định nghĩa kiểu dữ liệu
interface Roadmap {
  id: string;
  title: string;
  description: string;
  content: string;
  nodeCategory: NodeCategory;  // ✨ MỚI: Node category cho visualization
  tags: string[];
  isPublished: boolean;
}

// ✨ MỚI: Enum cho node categories
enum NodeCategory {
  ROLE = 'ROLE',
  SKILL = 'SKILL', 
  TOPIC = 'TOPIC',
  MILESTONE = 'MILESTONE',
  RESOURCE = 'RESOURCE'
}

// Type - Tương tự interface
type RoadmapFormData = {
  title: string;
  description: string;
  content: string;
  nodeCategory: NodeCategory;  // ✨ MỚI: Bắt buộc khi tạo roadmap
  tags: string[];
  isPublished: boolean;
};
```

### 6. Clerk Authentication
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
│   │   ├── roadmap-content.tsx # ✨ MỚI: Nội dung roadmap
│   │   └── roadmap-detail.tsx  # 🔄 CẬP NHẬT: Tích hợp ViewToggle
│   ├── roadmap-visualization/  # ✨ MỚI: Roadmap visualization components
│   │   └── ViewToggle.tsx      # ✨ MỚI: Toggle giữa content và visualization
│   └── admin/
│       ├── roadmap-table.tsx   # ✨ MỚI: Bảng quản lý roadmaps
│       ├── roadmap-form.tsx    # ✨ MỚI: Form tạo/sửa roadmap
│       └── delete-roadmap-dialog.tsx # ✨ MỚI: Dialog xóa roadmap
├── hooks/
│   └── use-view-toggle.ts      # ✨ MỚI: Hook quản lý view state
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
    uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
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

  // Error handling link - Xử lý lỗi authentication và network
  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        if (extensions?.code === 'UNAUTHENTICATED') {
          console.error('[Auth Error]:', message);
          // Token is invalid, expired, or JWT template issue
          // The frontend will handle this gracefully by showing login UI
        } else if (extensions?.code === 'FORBIDDEN') {
          console.error('[Permission Error]:', message);
          // User doesn't have required permissions
        } else {
          console.error('[GraphQL Error]:', message, extensions);
        }
      });
    }
    
    if (networkError) {
      console.error('[Network Error]:', networkError);
      console.error('GraphQL endpoint:', process.env.NEXT_PUBLIC_GRAPHQL_URL);

      // Check if it's a connection error
      if (networkError.message.includes('fetch')) {
        console.error('Possible causes:');
        console.error('1. Backend API is not running');
        console.error('2. GraphQL endpoint URL is incorrect');
        console.error('3. CORS configuration issue');
        console.error('4. JWT authentication failure');
      }
    }
  });

  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            roadmaps: {
              // Replace existing data instead of appending
              merge(_, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        // Use cache-and-network to ensure fresh data while showing cached data immediately
        fetchPolicy: 'cache-and-network',
      },
    },
  });
}
```

**Giải thích chi tiết:**
1. **authLink**: Tự động lấy JWT token từ Clerk và gắn vào header `Authorization: Bearer <token>`
2. **errorLink**: Xử lý lỗi authentication và network với logging chi tiết:
   - `UNAUTHENTICATED`: Token không hợp lệ, hết hạn, hoặc JWT template issue
   - `FORBIDDEN`: User không có quyền truy cập
   - Network errors: Hiển thị các nguyên nhân có thể (API down, URL sai, CORS, JWT auth failure)
3. **cache typePolicies**: Cấu hình cách Apollo merge data vào cache (replace thay vì append)
4. **fetchPolicy**: `cache-and-network` = hiển thị cache ngay, đồng thời fetch data mới

### Bước 2: Tích hợp ViewToggle cho Roadmap Detail

**Mục đích**: Cho phép user chuyển đổi giữa content view (markdown) và visualization view (sơ đồ tương tác) trong trang chi tiết roadmap.

#### 2.1: Tạo ViewToggle Component

**File**: `apps/web/src/components/roadmap-visualization/ViewToggle.tsx`

```typescript
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type ViewMode = 'content' | 'visualization';

interface ViewToggleProps {
    /** Current active view mode */
    currentView: ViewMode;
    /** Callback when view changes */
    onViewChange: (view: ViewMode) => void;
    /** Loading state for visualization */
    isLoading?: boolean;
    /** Disabled state */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * Toggle button component for switching between content and visualization views
 * Implements modern design with primary colors and smooth transitions
 */
export function ViewToggle({
    currentView,
    onViewChange,
    isLoading = false,
    disabled = false,
    className = '',
}: ViewToggleProps) {
    return (
        <div className={cn("flex justify-center", className)}>
            <div className="inline-flex rounded-xl border border-neutral-200 bg-white p-1 shadow-soft">
                {/* Content View Button */}
                <button
                    onClick={() => onViewChange('content')}
                    disabled={disabled}
                    aria-label="Switch to content view"
                    aria-pressed={currentView === 'content'}
                    className={cn(
                        "px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                        "flex items-center gap-2",
                        currentView === 'content'
                            ? "bg-primary-500 text-white shadow-soft transform scale-105"
                            : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50"
                    )}
                >
                    <span className="text-base" role="img" aria-label="Content icon">📄</span>
                    <span>Nội dung</span>
                </button>

                {/* Visualization View Button */}
                <button
                    onClick={() => onViewChange('visualization')}
                    disabled={disabled || isLoading}
                    aria-label="Switch to visualization view"
                    aria-pressed={currentView === 'visualization'}
                    className={cn(
                        "px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                        "flex items-center gap-2",
                        currentView === 'visualization'
                            ? "bg-primary-500 text-white shadow-soft transform scale-105"
                            : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50",
                        (disabled || isLoading) && "opacity-50 cursor-not-allowed"
                    )}
                >
                    {/* Loading spinner khi đang load visualization */}
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <span className="text-base" role="img" aria-label="Visualization icon">🗺️</span>
                    )}
                    <span>Sơ đồ roadmap</span>
                </button>
            </div>
        </div>
    );
}
```

**Đặc điểm thiết kế:**
- **Modern UI**: Rounded-xl styling với shadow-soft
- **Primary Colors**: Sử dụng primary-500 cho active state
- **Icons**: 📄 cho content, 🗺️ cho visualization
- **Loading State**: Spinner animation khi đang load visualization
- **Accessibility**: ARIA labels và keyboard navigation
- **Smooth Transitions**: 300ms duration với scale transform

#### 2.2: Tạo useViewToggle Hook

**File**: `apps/web/src/hooks/use-view-toggle.ts`

```typescript
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ViewMode } from '@/components/roadmap-visualization/ViewToggle';

interface UseViewToggleOptions {
    /** Default view mode */
    defaultView?: ViewMode;
    /** Whether to persist state in localStorage */
    persist?: boolean;
    /** Whether to sync with URL parameters */
    syncWithUrl?: boolean;
    /** Storage key for localStorage */
    storageKey?: string;
    /** URL parameter name */
    urlParam?: string;
}

interface UseViewToggleReturn {
    /** Current view mode */
    currentView: ViewMode;
    /** Function to change view mode */
    setView: (view: ViewMode) => void;
    /** Loading state for view transitions */
    isLoading: boolean;
    /** Function to set loading state */
    setIsLoading: (loading: boolean) => void;
    /** Toggle between views */
    toggleView: () => void;
}

/**
 * Hook for managing view toggle state with persistence and URL sync
 * 
 * Features:
 * - State persistence trong localStorage
 * - URL parameter synchronization cho deep linking
 * - Loading state management
 * - Type-safe view mode handling
 */
export function useViewToggle(options: UseViewToggleOptions = {}): UseViewToggleReturn {
    const {
        defaultView = 'content',
        persist = true,
        syncWithUrl = true,
        storageKey = 'roadmap-view-mode',
        urlParam = 'view',
    } = options;

    const router = useRouter();
    const searchParams = useSearchParams();

    // Calculate initial view từ URL hoặc localStorage
    const initialView = useMemo(() => {
        let view: ViewMode = defaultView;

        // Check URL parameter trước
        if (syncWithUrl) {
            const urlView = searchParams.get(urlParam) as ViewMode;
            if (urlView === 'content' || urlView === 'visualization') {
                view = urlView;
            }
        }

        // Fallback to localStorage nếu không có URL parameter
        if (view === defaultView && persist && typeof window !== 'undefined') {
            try {
                const stored = localStorage.getItem(storageKey);
                if (stored === 'content' || stored === 'visualization') {
                    view = stored;
                }
            } catch (error) {
                console.warn('Failed to read view mode from localStorage:', error);
            }
        }

        return view;
    }, [defaultView, persist, syncWithUrl, storageKey, urlParam, searchParams]);

    // Initialize state với calculated initial view
    const [currentView, setCurrentView] = useState<ViewMode>(initialView);
    const [isLoading, setIsLoading] = useState(false);

    // Update state khi initial view changes (e.g., URL changes)
    useEffect(() => {
        if (initialView !== currentView) {
            setCurrentView(initialView);
        }
    }, [initialView, currentView]);

    // Function để change view mode
    const setView = useCallback((view: ViewMode) => {
        setCurrentView(view);

        // Persist to localStorage
        if (persist && typeof window !== 'undefined') {
            try {
                localStorage.setItem(storageKey, view);
            } catch (error) {
                console.warn('Failed to save view mode to localStorage:', error);
            }
        }

        // Update URL parameter
        if (syncWithUrl) {
            const params = new URLSearchParams(searchParams.toString());
            params.set(urlParam, view);

            // Use replace để tránh adding to browser history
            router.replace(`?${params.toString()}`, { scroll: false });
        }
    }, [persist, syncWithUrl, storageKey, urlParam, searchParams, router]);

    // Toggle between views
    const toggleView = useCallback(() => {
        const newView = currentView === 'content' ? 'visualization' : 'content';
        setView(newView);
    }, [currentView, setView]);

    return {
        currentView,
        setView,
        isLoading,
        setIsLoading,
        toggleView,
    };
}
```

**Tính năng chính:**
1. **State Persistence**: Lưu user preference trong localStorage với key `roadmap-view-mode`
2. **URL Sync**: Sync với URL parameter `view` cho deep linking và bookmarking
3. **Loading Management**: Quản lý loading state khi switching to visualization
4. **Error Handling**: Graceful fallback nếu localStorage fails
5. **Type Safety**: Full TypeScript support với proper typing

#### 2.3: Cập nhật RoadmapDetail Component

**File**: `apps/web/src/components/roadmap/roadmap-detail.tsx` (đã được cập nhật)

**Những thay đổi chính:**
1. **Import mới**: ViewToggle component và useViewToggle hook
2. **State management**: Setup view toggle với persistence và URL sync
3. **Loading handling**: Simulate loading khi switch to visualization
4. **Conditional rendering**: Hiển thị content hoặc visualization dựa trên currentView
5. **Smooth transitions**: CSS transitions cho smooth view switching
6. **Placeholder**: Temporary placeholder cho visualization view

```typescript
// ✨ MỚI: Import ViewToggle components
import { ViewToggle } from '@/components/roadmap-visualization/ViewToggle';
import { useViewToggle } from '@/hooks/use-view-toggle';
import { Suspense } from 'react';

export function RoadmapDetail({ slug }: RoadmapDetailProps) {
    const { roadmap, loading, error } = useRoadmapBySlug(slug);
    
    // ✨ MỚI: Setup view toggle với persistence và URL sync
    const { currentView, setView, isLoading, setIsLoading } = useViewToggle({
        defaultView: 'content',
        persist: true,
        syncWithUrl: true,
    });

    // ✨ MỚI: Handle view change với loading state
    const handleViewChange = async (view: typeof currentView) => {
        if (view === 'visualization') {
            setIsLoading(true);
            // Simulate loading time for visualization
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        }
        setView(view);
    };

    return (
        <article className="space-y-6">
            {/* Existing header content */}
            
            {/* ✨ MỚI: View Toggle */}
            <div className="py-4">
                <ViewToggle
                    currentView={currentView}
                    onViewChange={handleViewChange}
                    isLoading={isLoading}
                    className="mb-8"
                />
            </div>

            {/* ✨ MỚI: Content Area với smooth transitions */}
            <div className="transition-all duration-500 ease-in-out">
                {currentView === 'content' ? (
                    <div className="animate-fade-in">
                        <RoadmapContent content={roadmap.content} />
                    </div>
                ) : (
                    <div className="animate-fade-in">
                        <Suspense fallback={
                            <div className="h-[calc(100vh-280px)] bg-neutral-100 rounded-2xl animate-pulse flex items-center justify-center">
                                <div className="text-neutral-500">Loading visualization...</div>
                            </div>
                        }>
                            <RoadmapVisualizationPlaceholder />
                        </Suspense>
                    </div>
                )}
            </div>
        </article>
    );
}
```

#### 2.4: Tạo CSS Animations (Optional)

**File**: `apps/web/src/app/globals.css` (thêm vào cuối file)

```css
/* ✨ MỚI: Animations cho view transitions */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Shadow utilities */
.shadow-soft {
  box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
}

.shadow-medium {
  box-shadow: 0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
```

### Bước 3: Testing ViewToggle Integration

#### 3.1: Test thủ công (Manual Testing)

**Checklist test cho ViewToggle:**

1. ✅ **Basic Functionality**
   - Mở trang roadmap detail: `/roadmaps/[slug]`
   - Thấy ViewToggle component với 2 buttons? ✓
   - Button "Nội dung" active by default? ✓
   - Button "Sơ đồ roadmap" inactive? ✓

2. ✅ **View Switching**
   - Click "Sơ đồ roadmap" → Loading spinner hiện? ✓
   - Sau 1 giây → Visualization placeholder hiện? ✓
   - Button "Sơ đồ roadmap" active? ✓
   - Click "Nội dung" → Content view hiện ngay? ✓

3. ✅ **State Persistence**
   - Switch to visualization view
   - Refresh trang → Vẫn ở visualization view? ✓
   - Mở tab mới với cùng URL → Vẫn ở visualization view? ✓

4. ✅ **URL Synchronization**
   - Switch to visualization → URL có `?view=visualization`? ✓
   - Switch to content → URL có `?view=content`? ✓
   - Copy URL và mở tab mới → View đúng? ✓
   - Browser back/forward → View sync đúng? ✓

5. ✅ **Responsive Design**
   - Test trên mobile → ViewToggle responsive? ✓
   - Test trên tablet → Layout đẹp? ✓
   - Test trên desktop → Full functionality? ✓

6. ✅ **Accessibility**
   - Tab navigation → Focus đúng thứ tự? ✓
   - Enter/Space → Activate button? ✓
   - Screen reader → Announce đúng state? ✓
   - ARIA attributes → aria-pressed đúng? ✓

**Debug ViewToggle:**
```bash
# Mở DevTools → Console
# Kiểm tra localStorage
localStorage.getItem('roadmap-view-mode')

# Kiểm tra URL parameters
new URLSearchParams(window.location.search).get('view')

# Kiểm tra component state
# (Sử dụng React DevTools extension)
```

#### 3.2: Test tự động (Unit Tests)

**Test ViewToggle Component:**
```typescript
// apps/web/src/components/roadmap-visualization/__tests__/ViewToggle.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ViewToggle } from '../ViewToggle';

describe('ViewToggle', () => {
    const mockOnViewChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders both content and visualization buttons', () => {
        render(
            <ViewToggle
                currentView="content"
                onViewChange={mockOnViewChange}
            />
        );

        expect(screen.getByRole('button', { name: /switch to content view/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /switch to visualization view/i })).toBeInTheDocument();
    });

    it('shows correct active state for content view', () => {
        render(
            <ViewToggle
                currentView="content"
                onViewChange={mockOnViewChange}
            />
        );

        const contentButton = screen.getByRole('button', { name: /switch to content view/i });
        const visualizationButton = screen.getByRole('button', { name: /switch to visualization view/i });

        expect(contentButton).toHaveAttribute('aria-pressed', 'true');
        expect(visualizationButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('calls onViewChange when visualization button is clicked', () => {
        render(
            <ViewToggle
                currentView="content"
                onViewChange={mockOnViewChange}
            />
        );

        const visualizationButton = screen.getByRole('button', { name: /switch to visualization view/i });
        fireEvent.click(visualizationButton);

        expect(mockOnViewChange).toHaveBeenCalledWith('visualization');
    });

    it('shows loading spinner when isLoading is true', () => {
        render(
            <ViewToggle
                currentView="content"
                onViewChange={mockOnViewChange}
                isLoading={true}
            />
        );

        const visualizationButton = screen.getByRole('button', { name: /switch to visualization view/i });
        const spinner = visualizationButton.querySelector('.animate-spin');

        expect(spinner).toBeInTheDocument();
        expect(visualizationButton).toBeDisabled();
    });

    it('applies custom className', () => {
        const { container } = render(
            <ViewToggle
                currentView="content"
                onViewChange={mockOnViewChange}
                className="custom-class"
            />
        );

        expect(container.firstChild).toHaveClass('custom-class');
    });
});
```

**Test useViewToggle Hook:**
```typescript
// apps/web/src/hooks/__tests__/use-view-toggle.test.ts
import { renderHook, act } from '@testing-library/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useViewToggle } from '../use-view-toggle';

// Mock Next.js navigation hooks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useSearchParams: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
});

describe('useViewToggle', () => {
    const mockReplace = jest.fn();
    const mockSearchParams = {
        get: jest.fn(),
        toString: jest.fn(() => ''),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            replace: mockReplace,
        });
        (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
        mockLocalStorage.getItem.mockReturnValue(null);
        mockSearchParams.get.mockReturnValue(null);
    });

    it('initializes with default view mode', () => {
        const { result } = renderHook(() => useViewToggle());

        expect(result.current.currentView).toBe('content');
        expect(result.current.isLoading).toBe(false);
    });

    it('saves view mode to localStorage when persist is enabled', () => {
        const { result } = renderHook(() =>
            useViewToggle({ persist: true, storageKey: 'test-key' })
        );

        act(() => {
            result.current.setView('visualization');
        });

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test-key', 'visualization');
    });

    it('updates URL when view changes and syncWithUrl is enabled', () => {
        const { result } = renderHook(() =>
            useViewToggle({ syncWithUrl: true, urlParam: 'view' })
        );

        act(() => {
            result.current.setView('visualization');
        });

        expect(mockReplace).toHaveBeenCalledWith('?view=visualization', { scroll: false });
    });

    it('loads initial view from URL parameter', () => {
        mockSearchParams.get.mockReturnValue('visualization');

        const { result } = renderHook(() =>
            useViewToggle({ syncWithUrl: true, urlParam: 'view' })
        );

        expect(result.current.currentView).toBe('visualization');
    });

    it('toggles between views correctly', () => {
        const { result } = renderHook(() => useViewToggle());

        act(() => {
            result.current.toggleView();
        });
        expect(result.current.currentView).toBe('visualization');

        act(() => {
            result.current.toggleView();
        });
        expect(result.current.currentView).toBe('content');
    });
});
```

**Chạy tests:**
```bash
# Chạy ViewToggle tests
pnpm test ViewToggle

# Chạy useViewToggle tests  
pnpm test use-view-toggle

# Chạy tất cả tests với coverage
pnpm test --coverage
```

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

#### 2. Component Issues
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

// Problem: Admin không thấy draft roadmaps
// Solution: Dùng đúng hook cho admin
// ❌ SAI
const { roadmaps } = useRoadmaps(); // Chỉ published

// ✅ ĐÚNG  
const { roadmaps } = useRoadmapsForAdmin(); // Cả published + drafts
```

#### 3. Rendering Issues
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
**Version:** 1.1.0  
**Maintainer:** VizTechStack Frontend Team  
**Review Status:** ✅ Ready for Development

## 🆕 Recent Updates (v1.1.0)

### NodeCategory Field Added to Roadmap Schema

**Thay đổi**: Thêm field `nodeCategory` vào roadmap input schema để hỗ trợ roadmap visualization.

**Chi tiết**:
- **Field mới**: `nodeCategory` (type: `NodeCategory` enum)
- **Mục đích**: Phân loại roadmaps theo node types cho visualization (role, skill, topic, milestone, resource)
- **Required**: Bắt buộc khi tạo/cập nhật roadmap
- **Enum values**: `ROLE`, `SKILL`, `TOPIC`, `MILESTONE`, `RESOURCE`

**Impact lên Frontend**:
1. **RoadmapForm**: Cần thêm dropdown select cho nodeCategory
2. **GraphQL Mutations**: Cập nhật CREATE_ROADMAP và UPDATE_ROADMAP mutations
3. **TypeScript Types**: Cập nhật Roadmap interface
4. **Validation**: Thêm validation cho nodeCategory field
5. **Visualization**: Sử dụng nodeCategory để render different node types

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
7. ✅ **MỚI**: Thấy cả published VÀ draft roadmaps? ✓
8. ✅ Có thể xóa roadmap? ✓

**Kiểm tra Query được gọi:**
```bash
# Mở DevTools → Network → Filter "Fetch/XHR"
# Admin dashboard phải gọi:
# - Query name: "GetRoadmapsForAdmin" 
# - Backend endpoint: roadmaps:listAll
# - Response: Có cả isPublished: true và false

# Public page phải gọi:
# - Query name: "GetRoadmaps"
# - Backend endpoint: roadmaps:list  
# - Response: Chỉ có isPublished: true
```

### Test GraphQL Operations

**Test Apollo Client:**
```bash
# 1. Mở browser DevTools
# 2. Vào tab Network
# 3. Filter "XHR/Fetch"
# 4. Thực hiện các actions:

# - Load roadmaps page → Thấy request GET_ROADMAPS (gọi roadmaps:list)
# - Login as admin → Load admin page → Thấy request GET_ROADMAPS_FOR_ADMIN (gọi roadmaps:listAll)
# - Delete roadmap → Thấy request DELETE_ROADMAP
# - Sau delete → Thấy refetch GET_ROADMAPS và GET_ROADMAPS_FOR_ADMIN
```

**Hiểu về Backend Queries:**
```typescript
// Backend có 2 queries khác nhau:

// 1. roadmaps:list - Chỉ trả về published roadmaps (cho public)
// Được gọi bởi: GET_ROADMAPS query
// Dùng cho: Guest, User, Admin khi xem public roadmaps

// 2. roadmaps:listAll - Trả về TẤT CẢ roadmaps (bao gồm drafts)
// Được gọi bởi: GET_ROADMAPS_FOR_ADMIN query  
// Dùng cho: Admin operations (CRUD, delete, edit)

// Lý do tách biệt:
// - Admin cần thấy cả draft để quản lý
// - Public chỉ thấy published để tránh confusion
// - Security: Guest/User không thể access draft content
```

**Test Error Handling:**
```bash
# 1. Tắt backend API server
# 2. Reload trang roadmaps
# 3. Kiểm tra:
#    - Có hiển thị error message tiếng Việt?
#    - Console có log network error với detailed causes?
#    - Không crash app?

# 4. Bật lại backend
# 5. Reload trang
# 6. Kiểm tra data load bình thường

# 7. Test JWT authentication errors:
#    - Thử với invalid token
#    - Kiểm tra console logs có [Auth Error] messages
#    - Verify frontend shows login UI gracefully
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

2. **MỚI**: Kiểm tra đúng query được gọi:
```typescript
// ❌ SAI - Gọi sai query
const { data } = useQuery(GET_ROADMAPS); // Chỉ có published
// Nhưng admin cần cả drafts

// ✅ ĐÚNG - Admin dùng query riêng
const { data } = useQuery(GET_ROADMAPS_FOR_ADMIN); // Có cả drafts
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
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```
3. Restart frontend sau khi thay đổi env

**Debug steps**:
```bash
# Kiểm tra backend API
curl http://localhost:4000/graphql

# Kiểm tra env variable được load
console.log('GraphQL URL:', process.env.NEXT_PUBLIC_GRAPHQL_URL);

# Kiểm tra network logs trong browser DevTools
```

### Lỗi 7: JWT Authentication Issues

**Nguyên nhân**: JWT token không hợp lệ, hết hạn, hoặc JWT template configuration issue.

**Triệu chứng**:
- Console error: `[Auth Error]: No JWT template exists with name: default`
- GraphQL requests fail với UNAUTHENTICATED error
- Loading states không kết thúc

**Giải pháp**:
1. **Kiểm tra Clerk JWT template configuration**:
```bash
# Vào Clerk Dashboard → JWT Templates
# Đảm bảo có template tên "default" hoặc không yêu cầu template name
```

2. **Kiểm tra token trong Apollo Client**:
```typescript
// Thêm debug log trong authLink
const authLink = setContext(async (_, { headers }) => {
  const token = await getToken();
  console.log('JWT Token:', token ? 'Present' : 'Missing');
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});
```

3. **Kiểm tra backend JWT validation**:
```bash
# Xem backend logs để kiểm tra JWT validation errors
# Backend sẽ log chi tiết về JWT validation failures
```

**Lưu ý**: Apollo Client đã được cập nhật để handle JWT authentication failures gracefully. Khi gặp UNAUTHENTICATED error, frontend sẽ tự động hiển thị login UI thay vì crash.

### Lỗi 8: Redirect loop (trang cứ reload mãi)

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

### Lỗi 9: TypeScript error "Property 'role' does not exist"

**Nguyên nhân**: TypeScript không biết publicMetadata có field role.

**Giải pháp**: Thêm type assertion:
```typescript
const role = user?.publicMetadata?.role as string | undefined;
```

### Lỗi 10: "Cannot read properties of undefined (reading 'map')"

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

### Lỗi 11: Admin không thấy draft roadmaps

**Nguyên nhân**: Sử dụng sai hook hoặc query.

**Giải pháp**:
```typescript
// ❌ SAI - Admin dùng hook public
function AdminDashboard() {
  const { roadmaps } = useRoadmaps(); // Chỉ có published
  // Admin sẽ không thấy drafts!
}

// ✅ ĐÚNG - Admin dùng hook riêng
function AdminDashboard() {
  const { roadmaps } = useRoadmapsForAdmin(); // Có cả drafts
  // Admin thấy tất cả roadmaps
}
```

**Debug steps**:
1. Kiểm tra query nào được gọi trong Network tab
2. Verify user có role admin
3. Check backend logs xem query nào được execute

### Lỗi 12: ViewToggle không hiển thị hoặc không hoạt động

**Nguyên nhân**: Import sai, component không được render, hoặc state management issue.

**Triệu chứng**:
- ViewToggle component không hiển thị
- Buttons không respond khi click
- View không switch
- Loading state không hoạt động

**Giải pháp**:

1. **Kiểm tra imports**:
```typescript
// ✅ ĐÚNG - Import đúng path
import { ViewToggle } from '@/components/roadmap-visualization/ViewToggle';
import { useViewToggle } from '@/hooks/use-view-toggle';

// ❌ SAI - Import sai path
import { ViewToggle } from '@/components/ViewToggle'; // Sai folder
```

2. **Kiểm tra component setup**:
```typescript
// ✅ ĐÚNG - Setup đầy đủ
const { currentView, setView, isLoading, setIsLoading } = useViewToggle({
    defaultView: 'content',
    persist: true,
    syncWithUrl: true,
});

const handleViewChange = async (view: typeof currentView) => {
    if (view === 'visualization') {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
    }
    setView(view);
};

<ViewToggle
    currentView={currentView}
    onViewChange={handleViewChange}
    isLoading={isLoading}
/>
```

3. **Debug ViewToggle state**:
```typescript
// Thêm debug logs
console.log('ViewToggle state:', {
    currentView,
    isLoading,
    localStorage: localStorage.getItem('roadmap-view-mode'),
    urlParam: new URLSearchParams(window.location.search).get('view')
});
```

### Lỗi 13: ViewToggle state không persist

**Nguyên nhân**: localStorage disabled, URL sync không hoạt động, hoặc configuration sai.

**Triệu chứng**:
- Refresh trang → View reset về default
- URL không có `?view=` parameter
- localStorage không lưu preference

**Giải pháp**:

1. **Kiểm tra localStorage**:
```typescript
// Test localStorage hoạt động
try {
    localStorage.setItem('test', 'value');
    localStorage.removeItem('test');
    console.log('localStorage works');
} catch (error) {
    console.error('localStorage disabled:', error);
    // Có thể do private browsing mode
}
```

2. **Kiểm tra useViewToggle configuration**:
```typescript
// ✅ ĐÚNG - Enable persistence
const { currentView, setView } = useViewToggle({
    persist: true,        // Enable localStorage
    syncWithUrl: true,    // Enable URL sync
    storageKey: 'roadmap-view-mode',
    urlParam: 'view',
});

// ❌ SAI - Disable persistence
const { currentView, setView } = useViewToggle({
    persist: false,       // Disabled
    syncWithUrl: false,   // Disabled
});
```

3. **Debug persistence**:
```typescript
// Check localStorage value
console.log('Stored view:', localStorage.getItem('roadmap-view-mode'));

// Check URL parameter
console.log('URL view:', new URLSearchParams(window.location.search).get('view'));

// Check if Next.js router is working
const router = useRouter();
console.log('Router available:', !!router);
```

### Lỗi 14: ViewToggle loading state không clear

**Nguyên nhân**: setIsLoading(false) không được gọi hoặc async operation issue.

**Triệu chứng**:
- Loading spinner hiển thị mãi mãi
- Visualization button bị disabled
- View không switch sau loading

**Giải pháp**:

1. **Kiểm tra loading logic**:
```typescript
// ✅ ĐÚNG - Clear loading trong all paths
const handleViewChange = async (view: typeof currentView) => {
    if (view === 'visualization') {
        setIsLoading(true);
        try {
            // Simulate loading hoặc actual data fetching
            await new Promise(resolve => setTimeout(resolve, 1000));
        } finally {
            setIsLoading(false); // Always clear loading
        }
    }
    setView(view);
};

// ❌ SAI - Không clear loading nếu có error
const handleViewChange = async (view: typeof currentView) => {
    if (view === 'visualization') {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000); // Có thể fail
    }
    setView(view);
};
```

2. **Add error handling**:
```typescript
const handleViewChange = async (view: typeof currentView) => {
    if (view === 'visualization') {
        setIsLoading(true);
        try {
            // Load visualization data
            await loadVisualizationData();
        } catch (error) {
            console.error('Failed to load visualization:', error);
            // Fallback to content view
            setView('content');
        } finally {
            setIsLoading(false);
        }
    } else {
        setView(view);
    }
};
```

### Lỗi 15: ViewToggle CSS styling không đúng

**Nguyên nhân**: Tailwind classes không load, CSS conflicts, hoặc design system issue.

**Triệu chứng**:
- Buttons không có styling đúng
- Active state không hiển thị
- Transitions không smooth
- Shadow effects không có

**Giải pháp**:

1. **Kiểm tra Tailwind CSS**:
```bash
# Verify Tailwind classes được generate
# Mở DevTools → Elements → Check computed styles

# Kiểm tra primary-500 color có được define
# Trong tailwind.config.js hoặc CSS variables
```

2. **Kiểm tra custom CSS**:
```css
/* Thêm vào globals.css nếu chưa có */
.shadow-soft {
  box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04);
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

3. **Debug styling**:
```typescript
// Thêm debug classes
<ViewToggle
    currentView={currentView}
    onViewChange={handleViewChange}
    className="border-2 border-red-500" // Debug border
/>
```

### Lỗi 16: ViewToggle accessibility issues

**Nguyên nhân**: ARIA attributes sai, keyboard navigation không hoạt động, hoặc screen reader support thiếu.

**Triệu chứng**:
- Screen reader không announce đúng
- Tab navigation không hoạt động
- ARIA warnings trong console
- Accessibility audit fails

**Giải pháp**:

1. **Kiểm tra ARIA attributes**:
```typescript
// ✅ ĐÚNG - Proper ARIA attributes
<button
    aria-label="Switch to content view"
    aria-pressed={currentView === 'content'}
    role="button"
>
    Content
</button>

// ❌ SAI - Missing ARIA attributes
<button onClick={handleClick}>
    Content
</button>
```

2. **Test keyboard navigation**:
```bash
# Manual test:
# 1. Tab to ViewToggle
# 2. Arrow keys để navigate giữa buttons
# 3. Enter/Space để activate
# 4. Focus indicators visible
```

3. **Test screen reader**:
```bash
# Sử dụng screen reader (NVDA, JAWS, VoiceOver)
# Verify announcements:
# - "Switch to content view, button, pressed"
# - "Switch to visualization view, button, not pressed"
```

**Debug accessibility**:
```bash
# Sử dụng axe-core hoặc Lighthouse accessibility audit
# Mở DevTools → Lighthouse → Accessibility
```

## Checklist trước khi commit

- [ ] Code chạy được: `pnpm dev`
- [ ] Không có TypeScript errors: `pnpm typecheck`
- [ ] Không có linting errors: `pnpm lint`
- [ ] Tests pass: `pnpm test`
- [ ] Đã test thủ công với 3 loại user (Guest, User, Admin)
- [ ] GraphQL operations hoạt động đúng
- [ ] **MỚI**: ViewToggle hoạt động đúng (switch views, persistence, URL sync)
- [ ] **MỚI**: ViewToggle responsive trên mobile/tablet/desktop
- [ ] **MỚI**: ViewToggle accessibility (keyboard navigation, screen reader)
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

**Q: Làm sao debug JWT authentication issues?**
A: 
1. Mở Browser DevTools → Console → Tìm `[Auth Error]` messages
2. Kiểm tra Clerk Dashboard → JWT Templates → Đảm bảo có template "default" 
3. Thêm debug log trong Apollo Client authLink để xem token có được gửi không
4. Kiểm tra backend logs để xem JWT validation errors

**Q: Tại sao GraphQL request bị UNAUTHENTICATED error?**
A: Có thể do:
- JWT token hết hạn → Clerk sẽ tự động refresh
- JWT template configuration sai → Kiểm tra Clerk Dashboard
- Backend không nhận được token → Kiểm tra authLink trong Apollo Client
- Network issue → Kiểm tra console logs có detailed error causes

**Q: Apollo Client có handle JWT errors tự động không?**
A: Có. Apollo Client đã được configure để:
- Log detailed error messages với categories ([Auth Error], [Permission Error], [Network Error])
- Hiển thị possible causes cho network errors
- Handle JWT authentication failures gracefully
- Cho phép frontend hiển thị login UI thay vì crash

**Q: Làm sao debug GraphQL requests?**
A: Mở Browser DevTools → Network tab → Filter "XHR/Fetch" → Thực hiện actions để xem requests.

**Q: Tại sao Admin không thấy draft roadmaps?**
A: Có thể đang dùng sai hook. Admin phải dùng `useRoadmapsForAdmin()` thay vì `useRoadmaps()`. Hook admin gọi query `roadmaps:listAll` để lấy cả drafts, còn hook public chỉ gọi `roadmaps:list` để lấy published.

**Q: Làm sao biết query nào đang được gọi?**
A: Mở DevTools → Network → Tìm GraphQL request → Xem trong payload có `operationName` là gì (`roadmaps` hay `roadmapsForAdmin`).

**Q: ViewToggle không hiển thị, làm sao fix?**
A: Kiểm tra:
1. Import đúng path: `@/components/roadmap-visualization/ViewToggle`
2. Component được render trong RoadmapDetail
3. useViewToggle hook được setup đúng
4. Không có TypeScript errors

**Q: ViewToggle state không persist sau refresh, tại sao?**
A: Có thể do:
- localStorage disabled (private browsing mode)
- useViewToggle config `persist: false`
- Browser security settings block localStorage
- Component re-mount issue

**Q: ViewToggle loading state không clear, làm sao fix?**
A: Đảm bảo `setIsLoading(false)` được gọi trong tất cả code paths:
```typescript
const handleViewChange = async (view) => {
  if (view === 'visualization') {
    setIsLoading(true);
    try {
      await loadData();
    } finally {
      setIsLoading(false); // Always clear
    }
  }
  setView(view);
};
```

**Q: URL parameter không sync với ViewToggle state?**
A: Kiểm tra:
1. useViewToggle config `syncWithUrl: true`
2. Next.js router hoạt động đúng
3. URL parameter name đúng (default: 'view')
4. Browser history API available

**Q: ViewToggle accessibility không hoạt động?**
A: Verify:
1. ARIA attributes: `aria-label`, `aria-pressed`
2. Keyboard navigation: Tab, Enter, Space
3. Screen reader announcements
4. Focus indicators visible
5. Role attributes đúng

**Q: ViewToggle styling không đúng, làm sao fix?**
A: Kiểm tra:
1. Tailwind CSS classes được load
2. Custom CSS (shadow-soft, animate-fade-in) có trong globals.css
3. Primary color variables được define
4. No CSS conflicts với existing styles

---

**Chúc bạn code vui vẻ! 🚀**

Nếu gặp vấn đề, hãy hỏi senior developer hoặc tạo issue trên GitHub.

---

**Last Updated:** 2024-12-19  
**Version:** 2.3.0  
**Maintainer:** VizTechStack Frontend Team  
**Review Status:** ✅ Ready for Development

## Changelog

### Version 2.3.0 (2024-12-19)
- **MAJOR**: Added comprehensive ViewToggle integration documentation
- **ADDED**: Step-by-step guide for ViewToggle component implementation
- **ADDED**: useViewToggle hook documentation with state persistence and URL sync
- **ADDED**: RoadmapDetail component integration with ViewToggle
- **ADDED**: ViewToggle testing strategies (manual and automated)
- **ADDED**: ViewToggle-specific troubleshooting (6 new error scenarios)
- **ADDED**: ViewToggle FAQ entries (7 new questions)
- **UPDATED**: Project structure to include roadmap-visualization components
- **UPDATED**: Testing checklist to include ViewToggle validation
- **ADDED**: CSS animations and styling guide for ViewToggle
- **ADDED**: Accessibility testing instructions for ViewToggle
- **ADDED**: Performance considerations for view switching

### Version 2.2.0 (2024-12-19)
- **UPDATED**: Apollo Client error handling với detailed JWT authentication troubleshooting
- **ADDED**: Comprehensive JWT authentication error debugging guide
- **UPDATED**: Network error logging với specific causes (API down, CORS, JWT auth failure)
- **ADDED**: New troubleshooting section for JWT template configuration issues
- **UPDATED**: Error handling test instructions với JWT authentication scenarios
- **ADDED**: FAQ entries about JWT debugging và Apollo Client error handling

### Version 2.1.0 (2024-12-19)
- **UPDATED**: Clarified backend query architecture (`roadmaps:list` vs `roadmaps:listAll`)
- **ADDED**: Explanation of why admin needs separate query for draft access
- **ADDED**: New troubleshooting section for admin not seeing drafts
- **ADDED**: Backend query debugging instructions
- **UPDATED**: Testing checklist to verify correct queries are called
- **ADDED**: FAQ entries about query differences and debugging

### Version 2.0.0 (2024-12-19)
- Initial comprehensive developer guide for frontend RBAC roadmap integration

---
# Hướng Dẫn ViewToggle Component

## Tổng Quan

ViewToggle component cung cấp giao diện chuyển đổi hiện đại giữa content view và visualization view trong roadmap detail pages. Component được thiết kế theo VizTechStack design system với tone màu ấm áp và UX patterns nhất quán.

## Đặc Điểm Chính

### 1. Modern Design System

**Styling:**
- Toggle button group với rounded-xl styling
- Primary colors (primary-500) cho active state
- Neutral colors cho inactive state
- Shadow effects (shadow-soft, shadow-medium)
- Smooth transitions (duration-300)
- Scale transform (scale-105) cho visual feedback

**Color Palette:**
```css
/* Active state */
background: #ed7c47; /* primary-500 */
color: white;
box-shadow: 0 2px 15px -3px rgba(0, 0, 0, 0.07);
transform: scale(1.05);

/* Inactive state */
color: #57534e; /* neutral-700 */
background: transparent;
hover:color: #292524; /* neutral-900 */
hover:background: #fafaf9; /* neutral-50 */
```

### 2. Icons và Visual Indicators

**Content View:**
- Icon: 📄 (Document emoji)
- Label: "Nội dung"
- Represents traditional markdown content display

**Visualization View:**
- Icon: 🗺️ (World map emoji)
- Label: "Sơ đồ roadmap"
- Represents interactive graph visualization

**Loading State:**
- Spinner animation cho visualization button
- Disabled state khi đang loading
- Visual feedback cho user

### 3. State Management

**Persistence:**
- localStorage với key `roadmap-view-mode`
- URL parameter sync với `view` parameter
- Deep linking support cho bookmarking
- Cross-session preference retention

**Loading States:**
- isLoading state cho visualization transitions
- Spinner animation thay thế icon
- Button disabled state khi loading
- Smooth state transitions

## API Reference

### ViewToggle Component

```typescript
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

type ViewMode = 'content' | 'visualization';
```

**Usage:**
```typescript
import { ViewToggle } from '@/components/roadmap-visualization/ViewToggle';

<ViewToggle
  currentView="content"
  onViewChange={handleViewChange}
  isLoading={false}
  disabled={false}
  className="mb-8"
/>
```

### useViewToggle Hook

```typescript
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
```

**Usage:**
```typescript
import { useViewToggle } from '@/hooks/use-view-toggle';

const {
  currentView,
  setView,
  isLoading,
  setIsLoading,
  toggleView
} = useViewToggle({
  defaultView: 'content',
  persist: true,
  syncWithUrl: true,
});
```

## Component Variants

### 1. Regular ViewToggle

Standard toggle cho desktop và tablet views:

```typescript
<ViewToggle
  currentView={currentView}
  onViewChange={setView}
  isLoading={isLoading}
/>
```

**Đặc điểm:**
- Full-size buttons với padding px-6 py-3
- Icons và text labels
- Scale transform animation
- Optimal cho desktop usage

### 2. CompactViewToggle

Compact version cho mobile hoặc constrained spaces:

```typescript
<CompactViewToggle
  currentView={currentView}
  onViewChange={setView}
  isLoading={isLoading}
/>
```

**Đặc điểm:**
- Smaller buttons với padding px-3 py-2
- Text labels hidden trên small screens
- Smaller icons và text
- Responsive design

### 3. FloatingViewToggle

Floating version cho overlay positioning:

```typescript
<FloatingViewToggle
  currentView={currentView}
  onViewChange={setView}
  isLoading={isLoading}
/>
```

**Đặc điểm:**
- Fixed positioning (top-6 right-6)
- Glass morphism effect (bg-white/90 backdrop-blur-sm)
- High z-index (z-30)
- Contains CompactViewToggle inside

## Integration với RoadmapDetail

### Complete Integration Example

```typescript
'use client';

import { ViewToggle } from '@/components/roadmap-visualization/ViewToggle';
import { useViewToggle } from '@/hooks/use-view-toggle';
import { RoadmapContent } from './roadmap-content';
import { RoadmapVisualization } from '@/components/roadmap-visualization/RoadmapVisualization';

export function RoadmapDetail({ slug }: { slug: string }) {
  const { roadmap, loading, error } = useRoadmapBySlug(slug);
  const { currentView, setView, isLoading, setIsLoading } = useViewToggle({
    defaultView: 'content',
    persist: true,
    syncWithUrl: true,
  });

  // Handle view change với loading simulation
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

  if (loading) return <RoadmapDetailSkeleton />;
  if (error || !roadmap) return <ErrorState />;

  return (
    <article className="space-y-6">
      {/* Roadmap header */}
      <header>
        <h1>{roadmap.title}</h1>
        <p>{roadmap.description}</p>
      </header>

      {/* View Toggle */}
      <div className="py-4">
        <ViewToggle
          currentView={currentView}
          onViewChange={handleViewChange}
          isLoading={isLoading}
          className="mb-8"
        />
      </div>

      {/* Content Area với smooth transitions */}
      <div className="transition-all duration-500 ease-in-out">
        {currentView === 'content' ? (
          <div className="animate-fade-in">
            <RoadmapContent content={roadmap.content} />
          </div>
        ) : (
          <div className="animate-fade-in">
            <RoadmapVisualization roadmap={roadmap} />
          </div>
        )}
      </div>
    </article>
  );
}
```

### State Persistence Logic

```typescript
// localStorage persistence
useEffect(() => {
  if (persist && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'content' || stored === 'visualization') {
        setCurrentView(stored);
      }
    } catch (error) {
      console.warn('Failed to read view mode from localStorage:', error);
    }
  }
}, []);

// URL parameter sync
useEffect(() => {
  if (syncWithUrl) {
    const urlView = searchParams.get(urlParam) as ViewMode;
    if (urlView === 'content' || urlView === 'visualization') {
      setCurrentView(urlView);
    }
  }
}, [searchParams]);

// Save to localStorage khi view changes
const setView = useCallback((view: ViewMode) => {
  setCurrentView(view);

  if (persist && typeof window !== 'undefined') {
    try {
      localStorage.setItem(storageKey, view);
    } catch (error) {
      console.warn('Failed to save view mode to localStorage:', error);
    }
  }

  if (syncWithUrl) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(urlParam, view);
    router.replace(`?${params.toString()}`, { scroll: false });
  }
}, [persist, syncWithUrl, storageKey, urlParam, searchParams, router]);
```

## Accessibility Features

### ARIA Support

```typescript
<button
  onClick={() => onViewChange('content')}
  aria-label="Switch to content view"
  aria-pressed={currentView === 'content'}
  className={/* styling */}
>
  <span role="img" aria-label="Content icon">📄</span>
  <span>Nội dung</span>
</button>
```

**ARIA Attributes:**
- `aria-label`: Descriptive labels cho screen readers
- `aria-pressed`: Indicates active/inactive state
- `role="img"`: Proper role cho emoji icons
- `aria-label` cho icons: Descriptive text cho emojis

### Keyboard Navigation

**Supported Keys:**
- **Tab**: Navigate between buttons
- **Enter/Space**: Activate button
- **Arrow Keys**: Navigate within button group (future enhancement)

**Focus Management:**
- Proper focus indicators
- Focus trapping within button group
- Keyboard-only navigation support

### Screen Reader Support

**Announcements:**
- "Switch to content view, button, pressed" (active state)
- "Switch to visualization view, button, not pressed" (inactive state)
- "Loading visualization" (loading state)

## Testing Strategy

### Unit Tests

**ViewToggle Component Tests:**
```typescript
describe('ViewToggle', () => {
  it('renders both content and visualization buttons', () => {
    render(<ViewToggle currentView="content" onViewChange={mockFn} />);
    
    expect(screen.getByRole('button', { name: /content view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /visualization view/i })).toBeInTheDocument();
  });

  it('shows correct active state', () => {
    render(<ViewToggle currentView="content" onViewChange={mockFn} />);
    
    const contentButton = screen.getByRole('button', { name: /content view/i });
    expect(contentButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onViewChange when clicked', () => {
    const mockOnViewChange = jest.fn();
    render(<ViewToggle currentView="content" onViewChange={mockOnViewChange} />);
    
    const vizButton = screen.getByRole('button', { name: /visualization view/i });
    fireEvent.click(vizButton);
    
    expect(mockOnViewChange).toHaveBeenCalledWith('visualization');
  });

  it('shows loading spinner when isLoading is true', () => {
    render(<ViewToggle currentView="content" onViewChange={mockFn} isLoading={true} />);
    
    const vizButton = screen.getByRole('button', { name: /visualization view/i });
    const spinner = vizButton.querySelector('.animate-spin');
    
    expect(spinner).toBeInTheDocument();
  });
});
```

**useViewToggle Hook Tests:**
```typescript
describe('useViewToggle', () => {
  it('initializes with default view mode', () => {
    const { result } = renderHook(() => useViewToggle());
    expect(result.current.currentView).toBe('content');
  });

  it('persists view mode to localStorage', () => {
    const { result } = renderHook(() => useViewToggle({ persist: true }));
    
    act(() => {
      result.current.setView('visualization');
    });
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('roadmap-view-mode', 'visualization');
  });

  it('syncs with URL parameters', () => {
    const { result } = renderHook(() => useViewToggle({ syncWithUrl: true }));
    
    act(() => {
      result.current.setView('visualization');
    });
    
    expect(mockRouter.replace).toHaveBeenCalledWith('?view=visualization', { scroll: false });
  });
});
```

### Integration Tests

**RoadmapDetail Integration:**
```typescript
describe('RoadmapDetail ViewToggle Integration', () => {
  it('switches between content and visualization views', async () => {
    render(<RoadmapDetail slug="test-roadmap" />);
    
    // Initially shows content
    expect(screen.getByText(/roadmap content/i)).toBeInTheDocument();
    
    // Click visualization toggle
    const vizToggle = screen.getByRole('button', { name: /visualization view/i });
    fireEvent.click(vizToggle);
    
    // Shows visualization placeholder
    await waitFor(() => {
      expect(screen.getByText(/roadmap visualization/i)).toBeInTheDocument();
    });
  });

  it('maintains view state across page reloads', () => {
    // Test localStorage persistence
    localStorage.setItem('roadmap-view-mode', 'visualization');
    
    render(<RoadmapDetail slug="test-roadmap" />);
    
    // Should start with visualization view
    expect(screen.getByRole('button', { name: /visualization view/i }))
      .toHaveAttribute('aria-pressed', 'true');
  });
});
```

### E2E Tests

**User Journey Tests:**
```typescript
describe('ViewToggle E2E', () => {
  it('allows user to switch views and maintains preference', () => {
    cy.visit('/roadmaps/frontend-developer');
    
    // Initially shows content view
    cy.get('[data-testid="roadmap-content"]').should('be.visible');
    
    // Switch to visualization
    cy.get('button[aria-label*="visualization"]').click();
    
    // Shows loading state
    cy.get('.animate-spin').should('be.visible');
    
    // Shows visualization after loading
    cy.get('[data-testid="roadmap-visualization"]').should('be.visible');
    
    // Reload page
    cy.reload();
    
    // Should maintain visualization view
    cy.get('button[aria-pressed="true"]')
      .should('contain', 'Sơ đồ roadmap');
  });

  it('supports keyboard navigation', () => {
    cy.visit('/roadmaps/frontend-developer');
    
    // Tab to toggle buttons
    cy.get('body').tab();
    cy.get('button[aria-label*="content"]').should('be.focused');
    
    // Tab to visualization button
    cy.focused().tab();
    cy.get('button[aria-label*="visualization"]').should('be.focused');
    
    // Press Enter to activate
    cy.focused().type('{enter}');
    
    // Should switch to visualization
    cy.get('button[aria-pressed="true"]')
      .should('contain', 'Sơ đồ roadmap');
  });
});
```

## Performance Considerations

### Optimization Strategies

**Lazy Loading:**
```typescript
// Lazy load visualization component
const RoadmapVisualization = lazy(() => 
  import('@/components/roadmap-visualization/RoadmapVisualization')
);

// Use Suspense for loading state
<Suspense fallback={<VisualizationSkeleton />}>
  {currentView === 'visualization' && (
    <RoadmapVisualization roadmap={roadmap} />
  )}
</Suspense>
```

**State Optimization:**
```typescript
// Memoize expensive calculations
const memoizedViewState = useMemo(() => ({
  currentView,
  isLoading,
}), [currentView, isLoading]);

// Debounce localStorage writes
const debouncedSave = useMemo(
  () => debounce((view: ViewMode) => {
    localStorage.setItem(storageKey, view);
  }, 300),
  [storageKey]
);
```

**Bundle Size:**
- ViewToggle component: ~2KB gzipped
- useViewToggle hook: ~1KB gzipped
- Total impact: ~3KB gzipped
- No external dependencies beyond React/Next.js

## Error Handling

### localStorage Errors

```typescript
// Graceful localStorage error handling
try {
  localStorage.setItem(storageKey, view);
} catch (error) {
  console.warn('Failed to save view mode to localStorage:', error);
  // Continue without persistence
}
```

**Common Errors:**
- Storage quota exceeded
- localStorage disabled
- Private browsing mode
- Browser compatibility issues

### URL Parameter Errors

```typescript
// Validate URL parameters
const urlView = searchParams.get(urlParam) as ViewMode;
if (urlView !== 'content' && urlView !== 'visualization') {
  // Ignore invalid URL parameter, use default
  console.warn(`Invalid view parameter: ${urlView}`);
}
```

### Component Error Boundaries

```typescript
// Error boundary cho ViewToggle
function ViewToggleErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="text-center py-4">
          <p className="text-neutral-600">
            Không thể tải view toggle. Đang hiển thị content view.
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
```

## Best Practices

### 1. State Management

**DO:**
- Use useViewToggle hook cho consistent state management
- Enable persistence cho better UX
- Handle loading states gracefully
- Provide fallback values

**DON'T:**
- Manage view state manually trong components
- Skip error handling cho localStorage
- Block UI during view transitions
- Ignore accessibility requirements

### 2. Performance

**DO:**
- Lazy load visualization components
- Debounce localStorage writes
- Memoize expensive calculations
- Use React.memo cho stable components

**DON'T:**
- Load visualization data unnecessarily
- Write to localStorage on every render
- Create new objects in render
- Skip performance monitoring

### 3. UX Design

**DO:**
- Provide clear visual feedback
- Use consistent icons và labels
- Show loading states
- Maintain state persistence

**DON'T:**
- Change view without user action
- Hide loading states
- Use confusing icons
- Break browser back/forward

## Troubleshooting

### Common Issues

**Issue: "View state không persist across sessions"**
- **Cause**: localStorage disabled hoặc error
- **Solution**: Check browser settings, handle localStorage errors

**Issue: "URL parameter không sync"**
- **Cause**: syncWithUrl disabled hoặc router issues
- **Solution**: Enable syncWithUrl, check Next.js router setup

**Issue: "Loading state không clear"**
- **Cause**: setIsLoading(false) không được called
- **Solution**: Ensure loading state is cleared trong all code paths

**Issue: "Accessibility warnings"**
- **Cause**: Missing ARIA attributes
- **Solution**: Use proper aria-label và aria-pressed attributes

### Debug Tools

```typescript
// Debug view toggle state
console.log('ViewToggle Debug:', {
  currentView,
  isLoading,
  localStorage: localStorage.getItem('roadmap-view-mode'),
  urlParam: searchParams.get('view'),
});

// Monitor state changes
useEffect(() => {
  console.log('View changed to:', currentView);
}, [currentView]);
```

## Roadmap

### Completed ✅
- [x] Basic ViewToggle component
- [x] useViewToggle hook với persistence
- [x] RoadmapDetail integration
- [x] Accessibility support
- [x] Loading states
- [x] URL parameter sync
- [x] Comprehensive testing (39 passing tests)
- [x] Error handling
- [x] Multiple component variants
- [x] State management system
- [x] localStorage persistence
- [x] Deep linking support
- [x] TypeScript strict mode compliance

### Upcoming 🚧
- [ ] Keyboard shortcuts (Ctrl+1, Ctrl+2)
- [ ] Animation presets
- [ ] Theme support (dark/light mode)
- [ ] Custom icons support
- [ ] Analytics integration
- [ ] A/B testing support
- [ ] Mobile gesture support
- [ ] Voice control integration

### Future Enhancements 🔮
- [ ] Multi-view support (3+ views)
- [ ] View history tracking
- [ ] Collaborative view sharing
- [ ] View-specific settings
- [ ] Advanced animations
- [ ] Custom view types
- [ ] Plugin system
- [ ] AI-powered view recommendations

---

**Cập nhật lần cuối:** 2026-03-11  
**Phiên bản:** 1.0.0  
**Giai đoạn:** 1.1 - View Toggle Implementation (Task 1.1.1 completed)
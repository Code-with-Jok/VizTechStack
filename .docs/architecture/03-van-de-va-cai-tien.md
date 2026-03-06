# Vấn Đề Tiềm Ẩn & Điểm Cần Cải Thiện

## 1. 🔴 Critical Issues (Ưu Tiên Cao)

### 1.1 Vendor Lock-in với Convex

**Vấn Đề:**
```typescript
// Toàn bộ data layer phụ thuộc vào Convex
import { api } from '@viztechstack/convex';
await this.convexService.client.query(api.roadmaps.list, {...});
```

**Rủi Ro:**
- ❌ Không thể migrate sang database khác dễ dàng
- ❌ Phụ thuộc vào pricing và policies của Convex
- ❌ Limited query capabilities (no complex JOINs)
- ❌ Nếu Convex shutdown hoặc thay đổi pricing → disaster

**Impact:** 🔴 Critical
**Effort:** 🔴 High (3-6 months)

**Giải Pháp:**

**Option 1: Abstract Database Layer (Đã làm một phần)**
```typescript
// ✅ Good: Repository pattern đã được implement
export interface RoadmapRepository {
  listRoadmaps(query: ListRoadmapsQuery): Promise<RoadmapPageEntity>;
  getRoadmapBySlug(query: GetRoadmapBySlugQuery): Promise<RoadmapEntity>;
  createRoadmap(command: CreateRoadmapCommand): Promise<string>;
}

// ✅ Convex implementation
export class ConvexRoadmapRepository implements RoadmapRepository { ... }

// 🎯 TODO: Add PostgreSQL implementation
export class PostgresRoadmapRepository implements RoadmapRepository { ... }
```

**Option 2: Migration Strategy**
```
Phase 1: Dual Write (3 months)
├── Write to both Convex và PostgreSQL
├── Read from Convex (primary)
└── Validate data consistency

Phase 2: Gradual Migration (2 months)
├── Switch reads to PostgreSQL
├── Monitor performance
└── Keep Convex as backup

Phase 3: Complete Migration (1 month)
├── Remove Convex dependencies
├── Update all queries
└── Decommission Convex
```

**Khuyến Nghị:**
1. **Immediate (Tuần này):**
   - Document tất cả Convex-specific logic
   - List all Convex queries/mutations
   - Estimate migration effort

2. **Short-term (1-3 tháng):**
   - Implement PostgreSQL repository
   - Add feature flag cho database switching
   - Test với PostgreSQL in staging

3. **Long-term (6-12 tháng):**
   - Complete migration to PostgreSQL
   - Remove Convex dependency

**Alternative Database Stack:**
```typescript
// Recommended: PostgreSQL + Prisma + tRPC
PostgreSQL (Database)
  ↓
Prisma (ORM)
  ↓
tRPC (Type-safe API)
  ↓
Next.js Client

Benefits:
✅ No vendor lock-in
✅ Powerful SQL queries
✅ Better performance at scale
✅ Lower cost
✅ Industry standard
```

---

### 1.2 JSON Storage trong Database

**Vấn Đề:**
```typescript
// ❌ Bad: Storing graph as JSON strings
roadmaps: defineTable({
  nodesJson: v.string(),  // JSON string
  edgesJson: v.string(),  // JSON string
})
```

**Rủi Ro:**
- ❌ Cannot query individual nodes
- ❌ Must parse entire JSON on every read
- ❌ No schema validation
- ❌ Difficult to update single node
- ❌ No relational integrity

**Impact:** 🟡 Medium
**Effort:** 🟡 Medium (1-2 months)

**Giải Pháp:**

**Option 1: Normalize Schema (Recommended)**
```typescript
// ✅ Good: Relational schema
roadmaps: defineTable({
  slug: v.string(),
  title: v.string(),
  description: v.string(),
  category: v.union(...),
  difficulty: v.union(...),
  status: v.union(...),
})

roadmapNodes: defineTable({
  roadmapId: v.id("roadmaps"),
  nodeId: v.string(),
  type: v.string(),
  positionX: v.number(),
  positionY: v.number(),
  label: v.string(),
  metadata: v.optional(v.any()),  // Flexible data
})
  .index("by_roadmap", ["roadmapId"])
  .index("by_roadmap_node", ["roadmapId", "nodeId"])

roadmapEdges: defineTable({
  roadmapId: v.id("roadmaps"),
  edgeId: v.string(),
  source: v.string(),
  target: v.string(),
  label: v.optional(v.string()),
})
  .index("by_roadmap", ["roadmapId"])
  .index("by_source", ["roadmapId", "source"])
  .index("by_target", ["roadmapId", "target"])
```

**Benefits:**
```typescript
// ✅ Query individual nodes
const node = await ctx.db
  .query("roadmapNodes")
  .withIndex("by_roadmap_node", (q) => 
    q.eq("roadmapId", roadmapId).eq("nodeId", nodeId)
  )
  .first();

// ✅ Update single node
await ctx.db.patch(nodeId, { 
  positionX: newX, 
  positionY: newY 
});

// ✅ Find all edges from a node
const edges = await ctx.db
  .query("roadmapEdges")
  .withIndex("by_source", (q) => 
    q.eq("roadmapId", roadmapId).eq("source", nodeId)
  )
  .collect();
```

**Migration Plan:**
```typescript
// Step 1: Create new tables
// Step 2: Backfill data from JSON
export const migrateRoadmapToRelational = internalMutation({
  handler: async (ctx) => {
    const roadmaps = await ctx.db.query("roadmaps").collect();
    
    for (const roadmap of roadmaps) {
      const nodes = JSON.parse(roadmap.nodesJson);
      const edges = JSON.parse(roadmap.edgesJson);
      
      // Insert nodes
      for (const node of nodes) {
        await ctx.db.insert("roadmapNodes", {
          roadmapId: roadmap._id,
          nodeId: node.id,
          type: node.type,
          positionX: node.position.x,
          positionY: node.position.y,
          label: node.data.label,
          metadata: node.data,
        });
      }
      
      // Insert edges
      for (const edge of edges) {
        await ctx.db.insert("roadmapEdges", {
          roadmapId: roadmap._id,
          edgeId: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
        });
      }
    }
  },
});

// Step 3: Update queries to use new tables
// Step 4: Remove old JSON fields
```

**Khuyến Nghị:**
- Priority: 🟡 Medium (after Convex migration decision)
- Timeline: 1-2 months
- Risk: Low (can run in parallel with old schema)

---

### 1.3 Thiếu Monitoring & Observability

**Vấn Đề:**
- ❌ No error tracking (Sentry, Rollbar)
- ❌ No performance monitoring (DataDog, New Relic)
- ❌ No logging infrastructure (CloudWatch, Logtail)
- ❌ No alerting system
- ❌ No uptime monitoring

**Impact:** 🔴 Critical
**Effort:** 🟢 Low (1-2 weeks)

**Giải Pháp:**

**Phase 1: Error Tracking (Week 1)**
```bash
pnpm add @sentry/nextjs @sentry/node
```

```typescript
// apps/web/sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// apps/api/src/main.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Phase 2: Logging (Week 2)**
```bash
pnpm add pino pino-pretty
```

```typescript
// apps/api/src/common/logger/logger.service.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: { colorize: true }
  }
});

// Usage
logger.info({ userId, action: 'create_roadmap' }, 'Roadmap created');
logger.error({ error, context }, 'Failed to fetch roadmap');
```

**Phase 3: Performance Monitoring (Week 3)**
```typescript
// Add custom metrics
import { performance } from 'perf_hooks';

export function measurePerformance(name: string) {
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    logger.info({ name, duration }, 'Performance metric');
    
    // Send to monitoring service
    Sentry.metrics.distribution(name, duration, {
      unit: 'millisecond',
    });
  };
}

// Usage
const endMeasure = measurePerformance('roadmap.list');
const roadmaps = await this.roadmapService.list();
endMeasure();
```

**Phase 4: Uptime Monitoring**
- Use: UptimeRobot (free), Pingdom, or Better Uptime
- Monitor: `/api/health`, `/graphql`
- Alert: Email, Slack, PagerDuty

**Khuyến Nghị:**
- Priority: 🔴 High
- Timeline: 2-3 weeks
- Cost: ~$50-100/month (Sentry free tier available)

---

## 2. 🟡 Medium Priority Issues

### 2.1 Thiếu Test Coverage

**Vấn Đề:**
```bash
# Current test coverage: Unknown
# No E2E tests
# Limited unit tests
```

**Impact:** 🟡 Medium
**Effort:** 🟡 Medium (ongoing)

**Giải Pháp:**

**Phase 1: Unit Tests (Ongoing)**
```typescript
// apps/api/src/modules/roadmap/application/services/roadmap-application.service.spec.ts
describe('RoadmapApplicationService', () => {
  let service: RoadmapApplicationService;
  let repository: jest.Mocked<RoadmapRepository>;

  beforeEach(() => {
    repository = {
      listRoadmaps: jest.fn(),
      getRoadmapBySlug: jest.fn(),
      createRoadmap: jest.fn(),
    } as any;

    service = new RoadmapApplicationService(repository);
  });

  describe('listRoadmaps', () => {
    it('should return paginated roadmaps', async () => {
      const mockPage = {
        items: [{ _id: '1', slug: 'frontend', ... }],
        nextCursor: null,
        isDone: true,
      };

      repository.listRoadmaps.mockResolvedValue(mockPage);

      const result = await service.listRoadmaps({ limit: 24 });

      expect(result).toEqual(mockPage);
      expect(repository.listRoadmaps).toHaveBeenCalledWith({ limit: 24 });
    });

    it('should handle repository errors', async () => {
      repository.listRoadmaps.mockRejectedValue(new Error('DB error'));

      await expect(service.listRoadmaps({ limit: 24 }))
        .rejects.toThrow('DB error');
    });
  });
});
```

**Phase 2: Integration Tests**
```typescript
// apps/api/test/roadmap.e2e-spec.ts
describe('Roadmap (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/graphql (POST) - getRoadmaps', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            getRoadmaps {
              _id
              slug
              title
            }
          }
        `,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.getRoadmaps).toBeInstanceOf(Array);
      });
  });
});
```

**Phase 3: E2E Tests (Playwright)**
```bash
pnpm add -D @playwright/test
```

```typescript
// apps/web/e2e/roadmap.spec.ts
import { test, expect } from '@playwright/test';

test('should display roadmap list', async ({ page }) => {
  await page.goto('/');
  
  // Wait for roadmaps to load
  await page.waitForSelector('[data-testid="roadmap-card"]');
  
  // Check if roadmaps are displayed
  const roadmaps = await page.locator('[data-testid="roadmap-card"]').count();
  expect(roadmaps).toBeGreaterThan(0);
});

test('should navigate to roadmap detail', async ({ page }) => {
  await page.goto('/');
  
  // Click first roadmap
  await page.click('[data-testid="roadmap-card"]:first-child');
  
  // Check if redirected to detail page
  await expect(page).toHaveURL(/\/roadmaps\/.+/);
  
  // Check if graph is rendered
  await page.waitForSelector('.react-flow');
});
```

**Coverage Goals:**
- Unit Tests: 80%+ coverage
- Integration Tests: Critical paths
- E2E Tests: User journeys

**Khuyến Nghị:**
- Priority: 🟡 Medium
- Timeline: Ongoing (add tests with new features)
- Target: 80% coverage in 3 months

---

### 2.2 GraphQL N+1 Query Problem

**Vấn Đề:**
```typescript
// ❌ Potential N+1 problem
@ResolveField(() => [Topic])
async topics(@Parent() roadmap: Roadmap) {
  // This runs for EACH roadmap in a list
  return this.topicService.getTopicsByRoadmapId(roadmap._id);
}

// If fetching 20 roadmaps:
// 1 query for roadmaps + 20 queries for topics = 21 queries!
```

**Impact:** 🟡 Medium (performance degradation)
**Effort:** 🟢 Low (1 week)

**Giải Pháp:**

**Option 1: DataLoader (Recommended)**
```bash
pnpm add dataloader
```

```typescript
// apps/api/src/common/dataloader/topic.dataloader.ts
import DataLoader from 'dataloader';

export class TopicDataLoader {
  private loader: DataLoader<string, Topic[]>;

  constructor(private topicService: TopicService) {
    this.loader = new DataLoader(async (roadmapIds: string[]) => {
      // Batch load topics for all roadmaps in one query
      const topics = await this.topicService.getTopicsByRoadmapIds(roadmapIds);
      
      // Group by roadmapId
      const topicsByRoadmap = new Map<string, Topic[]>();
      for (const topic of topics) {
        const existing = topicsByRoadmap.get(topic.roadmapId) || [];
        topicsByRoadmap.set(topic.roadmapId, [...existing, topic]);
      }
      
      // Return in same order as input
      return roadmapIds.map(id => topicsByRoadmap.get(id) || []);
    });
  }

  load(roadmapId: string): Promise<Topic[]> {
    return this.loader.load(roadmapId);
  }
}

// Usage in resolver
@ResolveField(() => [Topic])
async topics(
  @Parent() roadmap: Roadmap,
  @Context() { topicLoader }: { topicLoader: TopicDataLoader }
) {
  return topicLoader.load(roadmap._id);
}
```

**Option 2: Query Complexity Limit**
```typescript
// apps/api/src/app.module.ts
GraphQLModule.forRoot({
  validationRules: [
    depthLimit(5),  // Max query depth
    createComplexityLimitRule(1000),  // Max complexity
  ],
})
```

**Khuyến Nghị:**
- Priority: 🟡 Medium
- Timeline: 1 week
- Implement DataLoader cho all nested resolvers

---

### 2.3 Thiếu Rate Limiting

**Vấn Đề:**
- ❌ No rate limiting on API
- ❌ Vulnerable to DDoS
- ❌ No protection against abuse

**Impact:** 🟡 Medium (security risk)
**Effort:** 🟢 Low (1 day)

**Giải Pháp:**

```bash
pnpm add @nestjs/throttler
```

```typescript
// apps/api/src/app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,  // 60 seconds
      limit: 100,  // 100 requests per minute
    }]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

// Custom rate limit for specific endpoints
@Throttle({ default: { limit: 10, ttl: 60000 } })
@Mutation(() => Roadmap)
async createRoadmap() { ... }
```

**Khuyến Nghị:**
- Priority: 🟡 Medium
- Timeline: 1 day
- Limits:
  - Public queries: 100 req/min
  - Mutations: 10 req/min
  - Admin: 1000 req/min

---

### 2.4 Environment Variable Validation

**Vấn Đề:**
```typescript
// ❌ No validation at startup
const CONVEX_URL = process.env.CONVEX_URL;  // Could be undefined!
```

**Impact:** 🟡 Medium
**Effort:** 🟢 Low (1 day)

**Giải Pháp:**

```typescript
// packages/shared/env/src/server.ts
import { z } from 'zod';

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.coerce.number().default(4000),
  CONVEX_URL: z.string().url(),
  CONVEX_DEPLOYMENT: z.string(),
  CLERK_SECRET_KEY: z.string().min(1),
  CLERK_JWT_ISSUER_DOMAIN: z.string().url(),
  GRAPHQL_URL: z.string().url(),
});

export const serverEnv = serverEnvSchema.parse(process.env);

// Usage
import { serverEnv } from '@viztechstack/env/server';
console.log(serverEnv.CONVEX_URL);  // Type-safe and validated!
```

**Benefits:**
- ✅ Fail fast at startup
- ✅ Type-safe environment variables
- ✅ Clear error messages
- ✅ Documentation through schema

**Khuyến Nghị:**
- Priority: 🟡 Medium
- Timeline: 1 day
- Already partially implemented, complete it

---

## 3. 🟢 Low Priority (Nice to Have)

### 3.1 Code Documentation

**Vấn Đề:**
- Limited JSDoc comments
- No architecture documentation
- No API documentation (beyond GraphQL schema)

**Giải Pháp:**
```typescript
/**
 * Application service for managing roadmaps.
 * 
 * This service orchestrates roadmap operations by:
 * - Validating input through domain policies
 * - Delegating to repository for data access
 * - Transforming domain entities to DTOs
 * 
 * @example
 * ```typescript
 * const roadmaps = await service.listRoadmaps({ 
 *   category: 'role', 
 *   limit: 24 
 * });
 * ```
 */
export class RoadmapApplicationService {
  /**
   * Lists roadmaps with optional filtering and pagination.
   * 
   * @param query - Query parameters for filtering and pagination
   * @param query.category - Optional category filter
   * @param query.limit - Maximum number of items to return (default: 24)
   * @param query.cursor - Pagination cursor for next page
   * @returns Paginated list of roadmaps
   * @throws {RoadmapValidationDomainError} If query parameters are invalid
   */
  async listRoadmaps(query: ListRoadmapsQuery): Promise<RoadmapPageEntity> {
    // ...
  }
}
```

**Tools:**
- TypeDoc for API documentation
- Storybook for component documentation
- ADR (Architecture Decision Records)

---

### 3.2 Performance Optimization

**Opportunities:**
1. **Image Optimization**
   - Use next/image for all images
   - Implement lazy loading
   - Use WebP format

2. **Code Splitting**
   - Lazy load React Flow
   - Dynamic imports for heavy components

3. **Caching**
   - Implement Redis for API caching
   - Use SWR/React Query for client caching
   - CDN caching headers

4. **Bundle Size**
   - Analyze with @next/bundle-analyzer
   - Remove unused dependencies
   - Tree-shaking optimization

---

### 3.3 Accessibility (a11y)

**Current State:** Unknown
**Target:** WCAG 2.1 AA compliance

**Checklist:**
- [ ] Keyboard navigation
- [ ] Screen reader support
- [ ] Color contrast ratios
- [ ] Focus indicators
- [ ] ARIA labels
- [ ] Alt text for images

**Tools:**
- axe DevTools
- Lighthouse accessibility audit
- WAVE browser extension

---

## 4. Tổng Kết & Action Plan

### Priority Matrix

| Issue | Impact | Effort | Priority | Timeline |
|-------|--------|--------|----------|----------|
| Convex Lock-in | 🔴 Critical | 🔴 High | P0 | 3-6 months |
| Monitoring | 🔴 Critical | 🟢 Low | P0 | 2-3 weeks |
| JSON Storage | 🟡 Medium | 🟡 Medium | P1 | 1-2 months |
| Test Coverage | 🟡 Medium | 🟡 Medium | P1 | Ongoing |
| N+1 Queries | 🟡 Medium | 🟢 Low | P1 | 1 week |
| Rate Limiting | 🟡 Medium | 🟢 Low | P1 | 1 day |
| Env Validation | 🟡 Medium | 🟢 Low | P2 | 1 day |
| Documentation | 🟢 Low | 🟡 Medium | P2 | Ongoing |
| Performance | 🟢 Low | 🟡 Medium | P3 | 1-2 months |
| Accessibility | 🟢 Low | 🟡 Medium | P3 | 1-2 months |

### Roadmap (Next 6 Months)

**Month 1:**
- ✅ Add Sentry error tracking
- ✅ Implement logging infrastructure
- ✅ Add rate limiting
- ✅ Complete env validation
- ✅ Implement DataLoader

**Month 2:**
- 📊 Set up performance monitoring
- 🧪 Increase test coverage to 50%
- 📝 Document Convex dependencies
- 🔍 Evaluate PostgreSQL migration

**Month 3:**
- 🗄️ Design PostgreSQL schema
- 🔄 Implement PostgreSQL repository
- 🧪 Test coverage to 70%
- 📈 Performance optimization

**Month 4-6:**
- 🚀 Gradual migration to PostgreSQL
- 🧪 Test coverage to 80%
- ♿ Accessibility improvements
- 📚 Complete documentation

### Success Metrics

**Technical Health:**
- Test Coverage: 80%+
- Error Rate: < 0.1%
- API Response Time: < 200ms (p95)
- Uptime: 99.9%+

**Code Quality:**
- TypeScript strict mode: ✅
- ESLint errors: 0
- Security vulnerabilities: 0
- Documentation coverage: 80%+

**Performance:**
- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Bundle Size: < 200KB (gzipped)

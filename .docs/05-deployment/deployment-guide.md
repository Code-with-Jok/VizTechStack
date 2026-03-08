# Hướng Dẫn Deployment: Tái Cấu Trúc Codebase

## Tổng Quan

Tài liệu này cung cấp hướng dẫn từng bước để deploy codebase VizTechStack đã được tái cấu trúc lên môi trường staging và production.

## Yêu Cầu Trước Khi Deploy

- [ ] Hoàn thành tất cả tasks Phase 1-5
- [ ] Tất cả tests pass ở local (`pnpm test`)
- [ ] Build thành công ở local (`pnpm build`)
- [ ] Không có lỗi TypeScript (`pnpm typecheck`)
- [ ] Không có lỗi linting (`pnpm lint`)
- [ ] Đã merge changes vào main branch
- [ ] Đã cài đặt Vercel CLI (`npm i -g vercel`)
- [ ] Đã cài đặt Convex CLI (có trong devDependencies)
- [ ] Có quyền truy cập Vercel project
- [ ] Có quyền truy cập Convex project

## Kiến Trúc Deployment

```
┌─────────────────────────────────────────┐
│           Vercel Platform               │
│  ┌─────────────────┐  ┌──────────────┐ │
│  │   Web App       │  │   API        │ │
│  │   (Next.js)     │  │   (NestJS)   │ │
│  │   Port: 3000    │  │   Port: 4000 │ │
│  └────────┬────────┘  └──────┬───────┘ │
└───────────┼────────────────────┼─────────┘
            │                    │
            └────────┬───────────┘
                     │
                     ↓
            ┌────────────────┐
            │  Convex Cloud  │
            │   (Database)   │
            └────────────────┘
```

## Phase 1: Kiểm Tra Trước Khi Deploy

### 1.1 Chạy Full Test Suite

```bash
# Chạy tất cả tests
pnpm test

# Kiểm tra coverage
pnpm test --coverage

# Kỳ vọng: Tất cả tests pass, coverage ≥ 25%
```

### 1.2 Kiểm Tra Build

```bash
# Xóa builds cũ
pnpm clean

# Chạy full build
pnpm build

# Kỳ vọng: Build thành công cho tất cả packages
```

### 1.3 Kiểm Tra Dependencies

```bash
# Kiểm tra circular dependencies
pnpm validate:deps

# Chạy security audit
pnpm audit

# Kỳ vọng: Không có circular dependencies, không có lỗ hổng nghiêm trọng
```

### 1.4 Kiểm Tra Code Quality

```bash
# Chạy linting
pnpm lint

# Chạy type checking
pnpm typecheck

# Kiểm tra 'any' types
pnpm check:no-any

# Kỳ vọng: Tất cả checks pass
```

## Phase 2: Deploy Lên Staging

### 2.1 Deploy Database Lên Staging

```bash
# Di chuyển vào thư mục convex
cd convex

# Deploy lên staging environment
npx convex deploy --preview

# Ghi lại deployment URL
# Ví dụ: https://your-deployment-staging.convex.cloud
```

**Kiểm Tra:**
- [ ] Convex dashboard hiển thị staging deployment
- [ ] Tất cả tables đã được tạo (roadmaps, topics, progress, bookmarks)
- [ ] Tất cả indexes đang active

### 2.2 Cấu Hình Environment Variables Cho Staging

Tạo file `.env.staging`:

```env
# Convex
CONVEX_DEPLOYMENT=preview:your-staging-deployment
CONVEX_URL=https://your-deployment-staging.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-staging.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-staging.clerk.accounts.dev

# API
PORT=4000
GRAPHQL_URL=https://your-staging-api.vercel.app/graphql
NEXT_PUBLIC_GRAPHQL_URL=https://your-staging-api.vercel.app/graphql

# Web App
WEB_APP_ORIGIN=https://your-staging-web.vercel.app
NODE_ENV=staging
```

### 2.3 Deploy API Lên Staging

```bash
# Từ project root
cd apps/api

# Link với Vercel project (nếu chưa link)
vercel link

# Deploy lên staging (preview)
vercel --env-file=../../.env.staging

# Ghi lại deployment URL
# Ví dụ: https://viz-tech-stack-api-staging.vercel.app
```

**Kiểm Tra:**
- [ ] API deployment thành công
- [ ] GraphQL playground truy cập được tại `/graphql`
- [ ] Health check endpoint phản hồi

### 2.4 Deploy Web App Lên Staging

```bash
# Từ project root
cd apps/web

# Link với Vercel project (nếu chưa link)
vercel link

# Deploy lên staging (preview)
vercel --env-file=../../.env.staging

# Ghi lại deployment URL
# Ví dụ: https://viztechstack-staging.vercel.app
```

**Kiểm Tra:**
- [ ] Web app deployment thành công
- [ ] Homepage load đúng
- [ ] Không có lỗi console

## Phase 3: Smoke Tests Trên Staging

### 3.1 Manual Smoke Tests

**Test 1: Homepage**
- [ ] Truy cập staging URL
- [ ] Kiểm tra homepage load
- [ ] Kiểm tra console errors
- [ ] Kiểm tra navigation hoạt động

**Test 2: Danh Sách Roadmap**
- [ ] Truy cập `/roadmaps`
- [ ] Kiểm tra roadmap list load
- [ ] Kiểm tra category filters hoạt động
- [ ] Kiểm tra chức năng search

**Test 3: Roadmap Viewer**
- [ ] Click vào một roadmap
- [ ] Kiểm tra graph render đúng
- [ ] Kiểm tra node interactions hoạt động
- [ ] Kiểm tra topic panel mở được

**Test 4: Authentication**
- [ ] Click sign in
- [ ] Kiểm tra Clerk authentication hoạt động
- [ ] Kiểm tra user profile load
- [ ] Test sign out

**Test 5: Tính Năng Admin (nếu là admin)**
- [ ] Truy cập admin panel
- [ ] Kiểm tra create roadmap form load
- [ ] Test tạo một test roadmap
- [ ] Kiểm tra chức năng edit
- [ ] Xóa test roadmap

**Test 6: Progress Tracking**
- [ ] Đánh dấu một node là completed
- [ ] Kiểm tra progress được lưu
- [ ] Kiểm tra progress vẫn còn sau khi reload
- [ ] Test progress statistics

**Test 7: Bookmarks**
- [ ] Bookmark một roadmap
- [ ] Kiểm tra bookmark xuất hiện trong list
- [ ] Test xóa bookmark
- [ ] Kiểm tra bookmark persistence

### 3.2 Automated Smoke Tests

Chạy smoke test script:

```bash
# Từ project root
pnpm test:smoke:staging

# Kỳ vọng: Tất cả smoke tests pass
```

### 3.3 Performance Tests

```bash
# Test API response times
curl -w "@curl-format.txt" -o /dev/null -s https://your-staging-api.vercel.app/graphql

# Kỳ vọng: Response time < 500ms
```

**Kiểm Tra Metrics:**
- [ ] Page load time < 3s
- [ ] Time to Interactive < 5s
- [ ] First Contentful Paint < 2s
- [ ] API response time < 500ms

## Phase 4: Deploy Lên Production

### 4.1 Deploy Database Lên Production

```bash
# Di chuyển vào thư mục convex
cd convex

# Deploy lên production
npx convex deploy --prod

# Ghi lại production URL
# Ví dụ: https://your-deployment-prod.convex.cloud
```

**Kiểm Tra:**
- [ ] Convex dashboard hiển thị production deployment
- [ ] Tất cả tables đã được tạo
- [ ] Tất cả indexes đang active
- [ ] Data migration hoàn thành (nếu có)

### 4.2 Cấu Hình Production Environment Variables

**Trong Vercel Dashboard:**

1. Vào Project Settings → Environment Variables
2. Thêm production variables:

```
CONVEX_DEPLOYMENT=prod:your-production-deployment
CONVEX_URL=https://your-deployment-prod.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-prod.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-prod.clerk.accounts.dev
GRAPHQL_URL=https://your-api.vercel.app/graphql
NEXT_PUBLIC_GRAPHQL_URL=https://your-api.vercel.app/graphql
WEB_APP_ORIGIN=https://viztechstack.com
NODE_ENV=production
```

### 4.3 Deploy API Lên Production

```bash
# Từ project root
cd apps/api

# Deploy lên production
vercel --prod

# Xác nhận deployment
# Kỳ vọng: Deployment thành công
```

**Kiểm Tra:**
- [ ] Production API URL active
- [ ] GraphQL playground truy cập được (nếu enabled)
- [ ] Health check phản hồi
- [ ] Không có errors trong logs

### 4.4 Deploy Web App Lên Production

```bash
# Từ project root
cd apps/web

# Deploy lên production
vercel --prod

# Xác nhận deployment
# Kỳ vọng: Deployment thành công
```

**Kiểm Tra:**
- [ ] Production web URL active
- [ ] Homepage load đúng
- [ ] Không có console errors
- [ ] Tất cả features hoạt động

## Phase 5: Monitoring Production

### 5.1 Monitoring Ban Đầu (Giờ Đầu Tiên)

**Monitor Vercel Dashboard:**
- [ ] Kiểm tra deployment status
- [ ] Monitor error rates
- [ ] Kiểm tra function execution times
- [ ] Xác nhận không có 5xx errors

**Monitor Convex Dashboard:**
- [ ] Kiểm tra query performance
- [ ] Monitor database operations
- [ ] Xác nhận không có failed queries
- [ ] Kiểm tra real-time sync latency

### 5.2 Monitoring Mở Rộng (24 Giờ Đầu)

**Metrics Quan Trọng Cần Theo Dõi:**

1. **Error Rates**
   - Mục tiêu: < 0.1% error rate
   - Cảnh báo nếu: > 1% error rate

2. **Response Times**
   - API: < 500ms trung bình
   - Web: < 3s page load
   - Cảnh báo nếu: > 2x baseline

3. **Database Performance**
   - Query time: < 100ms trung bình
   - Cảnh báo nếu: > 500ms

4. **User Experience**
   - Monitor user feedback
   - Kiểm tra support tickets
   - Review error reports

### 5.3 Công Cụ Monitoring

**Vercel Analytics:**
- Truy cập: Vercel Dashboard → Analytics
- Monitor: Page views, performance, errors

**Convex Dashboard:**
- Truy cập: https://dashboard.convex.dev
- Monitor: Query performance, function logs

**Error Tracking:**
- Kiểm tra Vercel function logs
- Review browser console errors
- Monitor API error logs

## Phase 6: Ghi Chép Issues

### 6.1 Template Theo Dõi Issues

Tạo `deployment-issues.md`:

```markdown
# Deployment Issues Log

## Issue #1: [Tiêu đề]

**Ngày:** YYYY-MM-DD HH:MM
**Mức độ:** Critical | High | Medium | Low
**Môi trường:** Staging | Production
**Component:** Web | API | Database

**Mô tả:**
[Mô tả chi tiết về issue]

**Tác động:**
[Ảnh hưởng đến users như thế nào]

**Nguyên nhân:**
[Nguyên nhân gây ra issue]

**Giải pháp:**
[Cách fix issue]

**Phòng ngừa:**
[Cách phòng ngừa trong tương lai]

---
```

### 6.2 Issues Thường Gặp và Giải Pháp

**Issue: Build Fails Trên Vercel**

**Triệu chứng:**
- Deployment fails trong build step
- TypeScript errors trong build logs

**Giải pháp:**
```bash
# Chạy build ở local trước
pnpm build

# Fix các TypeScript errors
pnpm typecheck

# Commit fixes và redeploy
```

**Issue: Environment Variables Chưa Set**

**Triệu chứng:**
- Runtime errors về missing env vars
- Features không hoạt động

**Giải pháp:**
1. Kiểm tra Vercel Dashboard → Environment Variables
2. Đảm bảo tất cả required vars đã được set
3. Redeploy để apply changes

**Issue: Database Connection Fails**

**Triệu chứng:**
- API trả về 500 errors
- "Cannot connect to Convex" errors

**Giải pháp:**
1. Xác nhận CONVEX_URL đúng
2. Kiểm tra Convex deployment status
3. Xác nhận API có credentials đúng

**Issue: Authentication Fails**

**Triệu chứng:**
- Users không thể sign in
- JWT validation errors

**Giải pháp:**
1. Xác nhận Clerk environment variables
2. Kiểm tra JWT issuer domain khớp
3. Xác nhận Clerk webhook configuration

## Quy Trình Rollback

### Khi Nào Cần Rollback

Rollback nếu:
- Critical bugs ảnh hưởng tất cả users
- Data corruption hoặc loss
- Security vulnerabilities
- Performance degradation > 50%

### Các Bước Rollback

**1. Rollback Web App:**
```bash
# Trong Vercel Dashboard
# Vào Deployments → Tìm previous stable deployment → Promote to Production
```

**2. Rollback API:**
```bash
# Trong Vercel Dashboard
# Vào Deployments → Tìm previous stable deployment → Promote to Production
```

**3. Rollback Database (nếu cần):**
```bash
# Liên hệ Convex support để point-in-time recovery
# Hoặc revert về previous schema version
npx convex rollback
```

**4. Thông Báo Team:**
- Post trong team chat
- Update status page
- Thông báo affected users

## Checklist Sau Deployment

- [ ] Tất cả deployments thành công
- [ ] Smoke tests passed
- [ ] Không có critical errors trong logs
- [ ] Performance metrics trong acceptable range
- [ ] User feedback tích cực
- [ ] Documentation đã update
- [ ] Team đã được thông báo về deployment
- [ ] Monitoring alerts đã cấu hình
- [ ] Rollback procedure đã test
- [ ] Deployment retrospective đã schedule

## Tiêu Chí Thành Công

✅ **Deployment Thành Công Nếu:**
- Tất cả services deploy không có errors
- Tất cả smoke tests pass
- Error rate < 0.1%
- Response times trong SLA
- Không có critical bugs được báo cáo
- User experience không thay đổi hoặc cải thiện

## Thông Tin Liên Hệ

**On-Call Engineer:** [Thông tin liên hệ của bạn]
**DevOps Lead:** [Thông tin liên hệ của bạn]
**Database Admin:** [Thông tin liên hệ của bạn]

**Liên Hệ Khẩn Cấp:**
- Vercel Support: support@vercel.com
- Convex Support: support@convex.dev
- Clerk Support: support@clerk.dev

---

**Cập Nhật Lần Cuối:** 2026-03-08
**Phiên Bản:** 1.0
**Trạng Thái:** Sẵn sàng sử dụng

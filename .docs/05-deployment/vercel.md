# Hướng Dẫn Deployment Vercel

## Tổng Quan

Tài liệu này hướng dẫn deploy ứng dụng VizTechStack (cả Web và API) lên Vercel.

## Kiến Trúc

VizTechStack sử dụng cấu trúc monorepo với hai ứng dụng chính:

```
viztechstack/
├── apps/
│   ├── web/          # Next.js frontend (Port 3000)
│   └── api/          # NestJS backend (Port 4000)
```

Cả hai ứng dụng được deploy như các Vercel projects riêng biệt.

## Yêu Cầu Trước Khi Bắt Đầu

- Vercel account với quyền truy cập team
- Vercel CLI đã cài đặt: `npm i -g vercel`
- Quyền truy cập environment variables
- Convex database đã deploy

## Cấu Hình Project

### 1. Web App Project

**Tên Project:** `viztechstack-web`

**Framework:** Next.js 16.1.6

**Root Directory:** `apps/web`

**Build Settings:**
- Build Command: `cd ../.. && pnpm build --filter @viztechstack/web`
- Output Directory: `.next`
- Install Command: `pnpm install`
- Development Command: `pnpm dev`

**Node Version:** 20.x

### 2. API Project

**Tên Project:** `viz-tech-stack-api`

**Framework:** NestJS 11.0.1

**Root Directory:** `apps/api`

**Build Settings:**
- Build Command: `cd ../.. && pnpm build --filter @viztechstack/api`
- Output Directory: `dist`
- Install Command: `pnpm install`
- Development Command: `pnpm dev`

**Node Version:** 24.x (theo cấu hình trong `.vercel/project.json`)

## Environment Variables

### Web App Environment Variables

**Production:**
```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-prod.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-prod.clerk.accounts.dev

# API
NEXT_PUBLIC_GRAPHQL_URL=https://api.viztechstack.com/graphql

# App
WEB_APP_ORIGIN=https://viztechstack.com
NODE_ENV=production
```

**Staging/Preview:**
```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-staging.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-staging.clerk.accounts.dev

# API
NEXT_PUBLIC_GRAPHQL_URL=https://viz-tech-stack-api-staging.vercel.app/graphql

# App
WEB_APP_ORIGIN=https://viztechstack-staging.vercel.app
NODE_ENV=staging
```

### API Environment Variables

**Production:**
```env
# Convex
CONVEX_DEPLOYMENT=prod:your-production-deployment
CONVEX_URL=https://your-deployment-prod.convex.cloud

# Clerk Authentication
CLERK_SECRET_KEY=sk_live_...
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-prod.clerk.accounts.dev

# API
PORT=4000
GRAPHQL_URL=https://api.viztechstack.com/graphql

# App
WEB_APP_ORIGIN=https://viztechstack.com
NODE_ENV=production
```

**Staging/Preview:**
```env
# Convex
CONVEX_DEPLOYMENT=preview:your-staging-deployment
CONVEX_URL=https://your-deployment-staging.convex.cloud

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-staging.clerk.accounts.dev

# API
PORT=4000
GRAPHQL_URL=https://viz-tech-stack-api-staging.vercel.app/graphql

# App
WEB_APP_ORIGIN=https://viztechstack-staging.vercel.app
NODE_ENV=staging
```

## Commands Deployment

### Cài Đặt Ban Đầu

```bash
# Cài đặt Vercel CLI
npm i -g vercel

# Đăng nhập Vercel
vercel login

# Link projects (chạy trong mỗi thư mục app)
cd apps/web
vercel link

cd ../api
vercel link
```

### Deploy Lên Staging (Preview)

```bash
# Deploy Web App
cd apps/web
vercel

# Deploy API
cd ../api
vercel
```

### Deploy Lên Production

```bash
# Deploy Web App
cd apps/web
vercel --prod

# Deploy API
cd ../api
vercel --prod
```

### Deploy Với Environment File

```bash
# Deploy với environment cụ thể
vercel --env-file=../../.env.staging

# Hoặc cho production
vercel --prod --env-file=../../.env.production
```

## Cấu Hình Vercel

### vercel.json (Web App)

Tạo `apps/web/vercel.json`:

```json
{
  "buildCommand": "cd ../.. && pnpm build --filter @viztechstack/web",
  "devCommand": "cd ../.. && pnpm dev --filter @viztechstack/web",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### vercel.json (API)

Tạo `apps/api/vercel.json`:

```json
{
  "buildCommand": "cd ../.. && pnpm build --filter @viztechstack/api",
  "devCommand": "cd ../.. && pnpm dev --filter @viztechstack/api",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nestjs",
  "outputDirectory": "dist"
}
```

## Cấu Hình Domain

### Web App Domains

**Production:**
- Primary: `viztechstack.com`
- Alternate: `www.viztechstack.com`

**Staging:**
- `viztechstack-staging.vercel.app`

### API Domains

**Production:**
- Primary: `api.viztechstack.com`

**Staging:**
- `viz-tech-stack-api-staging.vercel.app`

### Cấu Hình DNS

Thêm các DNS records này trong domain provider của bạn:

```
# Web App
Type: CNAME
Name: @
Value: cname.vercel-dns.com

Type: CNAME
Name: www
Value: cname.vercel-dns.com

# API
Type: CNAME
Name: api
Value: cname.vercel-dns.com
```

## Quy Trình Deployment

### Automatic Deployments

Vercel có thể tự động deploy khi git push:

**Production:**
- Branch: `main`
- Trigger: Push to main
- Environment: Production

**Preview:**
- Branch: Bất kỳ branch nào trừ main
- Trigger: Push hoặc PR
- Environment: Preview

### Manual Deployments

Sử dụng Vercel CLI để kiểm soát thủ công:

```bash
# Deploy branch hiện tại lên preview
vercel

# Deploy lên production
vercel --prod

# Deploy branch cụ thể
vercel --branch=feature/new-feature
```

## Monitoring và Logs

### Vercel Dashboard

Truy cập: https://vercel.com/dashboard

**Tính năng:**
- Deployment history
- Build logs
- Runtime logs
- Analytics
- Performance metrics

### Xem Logs

```bash
# Xem deployment logs
vercel logs [deployment-url]

# Stream real-time logs
vercel logs --follow

# Filter theo function
vercel logs --function=api
```

### Analytics

**Web Vitals:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

**Traffic:**
- Page views
- Unique visitors
- Geographic distribution

## Troubleshooting

### Build Failures

**Issue:** Build fails với module not found

**Giải pháp:**
```bash
# Đảm bảo build command bao gồm monorepo context
"buildCommand": "cd ../.. && pnpm build --filter @viztechstack/web"

# Không chỉ:
"buildCommand": "pnpm build"
```

**Issue:** TypeScript errors trong quá trình build

**Giải pháp:**
```bash
# Chạy typecheck ở local trước
pnpm typecheck

# Fix tất cả errors trước khi deploy
```

### Runtime Errors

**Issue:** Environment variables không available

**Giải pháp:**
1. Kiểm tra Vercel Dashboard → Settings → Environment Variables
2. Đảm bảo variables được set cho đúng environment (Production/Preview)
3. Redeploy để apply changes

**Issue:** API trả về 500 errors

**Giải pháp:**
1. Kiểm tra Vercel function logs
2. Verify database connection
3. Kiểm tra environment variables
4. Review error stack trace

### Performance Issues

**Issue:** Page loads chậm

**Giải pháp:**
1. Kiểm tra Vercel Analytics để tìm bottlenecks
2. Tối ưu images (sử dụng Next.js Image component)
3. Enable caching headers
4. Sử dụng Vercel Edge Network

**Issue:** Function timeouts

**Giải pháp:**
1. Tối ưu database queries
2. Thêm indexes vào Convex tables
3. Implement caching
4. Cân nhắc Edge Functions để response nhanh hơn

## Best Practices

### 1. Sử Dụng Preview Deployments

- Test tất cả changes trong preview trước production
- Chia sẻ preview URLs với team để review
- Chạy smoke tests trên preview deployments

### 2. Environment Variables

- Không bao giờ commit secrets vào git
- Sử dụng environment variable management của Vercel
- Tách biệt staging và production variables
- Sử dụng prefix `NEXT_PUBLIC_` cho client-side variables

### 3. Tối Ưu Build

- Enable Turbo cache để builds nhanh hơn
- Sử dụng incremental static regeneration (ISR)
- Tối ưu bundle size
- Remove unused dependencies

### 4. Monitoring

- Cài đặt Vercel Analytics
- Monitor Web Vitals
- Theo dõi error rates
- Cài đặt alerts cho critical issues

### 5. Chiến Lược Rollback

- Giữ previous deployments available
- Test rollback procedure trong staging
- Document rollback steps
- Có on-call engineer sẵn sàng

## Tích Hợp CI/CD

### GitHub Actions

Tạo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9.15.0
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Build
        run: pnpm build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Tối Ưu Chi Phí

### Vercel Pricing Tiers

**Hobby (Free):**
- 100 GB bandwidth
- Unlimited deployments
- Automatic HTTPS
- Tốt cho staging

**Pro ($20/tháng mỗi user):**
- 1 TB bandwidth
- Advanced analytics
- Team collaboration
- Khuyến nghị cho production

### Tips Tối Ưu

1. **Giảm bandwidth usage:**
   - Tối ưu images
   - Enable compression
   - Sử dụng CDN caching

2. **Giảm function execution time:**
   - Tối ưu database queries
   - Implement caching
   - Sử dụng Edge Functions

3. **Giảm build time:**
   - Enable Turbo cache
   - Tối ưu dependencies
   - Sử dụng incremental builds

## Hỗ Trợ

### Vercel Support

- **Documentation:** https://vercel.com/docs
- **Support:** support@vercel.com
- **Community:** https://github.com/vercel/vercel/discussions
- **Status:** https://www.vercel-status.com

### Liên Hệ Nội Bộ

- **DevOps Lead:** [Thông tin liên hệ của bạn]
- **On-Call Engineer:** [Thông tin liên hệ của bạn]
- **Team Lead:** [Thông tin liên hệ của bạn]

---

**Cập Nhật Lần Cuối:** 2026-03-08
**Người Duy Trì:** DevOps Team
**Tần Suất Review:** Hàng quý

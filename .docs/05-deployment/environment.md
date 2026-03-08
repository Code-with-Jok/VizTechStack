# Hướng Dẫn Cấu Hình Environment

## Tổng Quan

Tài liệu này hướng dẫn cấu hình environment variables cho VizTechStack trên các môi trường khác nhau (development, staging, production).

## Environment Files

### Cấu Trúc Files

```
viztechstack/
├── .env.example          # Template với tất cả variables
├── .env.local            # Local development (gitignored)
├── .env.preview          # Staging/preview environment
├── .env.production       # Production environment (gitignored)
└── .vercel/
    └── .env.preview.local  # Vercel preview environment
```

### Thứ Tự Ưu Tiên Files

1. `.env.production` (chỉ production)
2. `.env.preview` (chỉ staging/preview)
3. `.env.local` (local development)
4. `.env.example` (template, không được load)

## Environment Variables

### Convex Database

**Development:**
```env
CONVEX_DEPLOYMENT=dev:your-deployment-name
CONVEX_URL=https://your-deployment-dev.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-dev.convex.cloud
```

**Staging:**
```env
CONVEX_DEPLOYMENT=preview:your-staging-deployment
CONVEX_URL=https://your-deployment-staging.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-staging.convex.cloud
```

**Production:**
```env
CONVEX_DEPLOYMENT=prod:your-production-deployment
CONVEX_URL=https://your-deployment-prod.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://your-deployment-prod.convex.cloud
```

**Cách lấy:**
1. Chạy `npx convex dev` cho development
2. Chạy `npx convex deploy --preview` cho staging
3. Chạy `npx convex deploy --prod` cho production
4. Copy URL từ Convex dashboard

### Clerk Authentication

**Development:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-dev.clerk.accounts.dev
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-dev.clerk.accounts.dev
```

**Staging:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-staging.clerk.accounts.dev
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-staging.clerk.accounts.dev
```

**Production:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-prod.clerk.accounts.dev
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-prod.clerk.accounts.dev
```

**Cách lấy:**
1. Vào Clerk Dashboard: https://dashboard.clerk.com
2. Chọn application của bạn
3. Vào API Keys
4. Copy publishable key và secret key
5. JWT issuer domain ở phần JWT Templates

### Cấu Hình API

**Development:**
```env
PORT=4000
GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
```

**Staging:**
```env
PORT=4000
GRAPHQL_URL=https://viz-tech-stack-api-staging.vercel.app/graphql
NEXT_PUBLIC_GRAPHQL_URL=https://viz-tech-stack-api-staging.vercel.app/graphql
```

**Production:**
```env
PORT=4000
GRAPHQL_URL=https://api.viztechstack.com/graphql
NEXT_PUBLIC_GRAPHQL_URL=https://api.viztechstack.com/graphql
```

### Cấu Hình Web App

**Development:**
```env
WEB_APP_ORIGIN=http://localhost:3000
NODE_ENV=development
```

**Staging:**
```env
WEB_APP_ORIGIN=https://viztechstack-staging.vercel.app
NODE_ENV=staging
```

**Production:**
```env
WEB_APP_ORIGIN=https://viztechstack.com
NODE_ENV=production
```

### Convex Site URL

**Development:**
```env
CONVEX_SITE_URL=http://localhost:3000
```

**Staging:**
```env
CONVEX_SITE_URL=https://viztechstack-staging.vercel.app
```

**Production:**
```env
CONVEX_SITE_URL=https://viztechstack.com
```

## Các Loại Variables

### Public Variables (Client-Side)

Variables có prefix `NEXT_PUBLIC_` được expose ra browser:

```env
NEXT_PUBLIC_CONVEX_URL=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
NEXT_PUBLIC_CLERK_JWT_ISSUER_DOMAIN=...
NEXT_PUBLIC_GRAPHQL_URL=...
```

**⚠️ Cảnh báo:** Không bao giờ đặt secrets trong `NEXT_PUBLIC_` variables!

### Private Variables (Server-Side)

Variables không có prefix `NEXT_PUBLIC_` chỉ dùng server:

```env
CLERK_SECRET_KEY=...
CONVEX_DEPLOYMENT=...
CONVEX_URL=...
```

**✅ An toàn:** Những variables này không bao giờ bị expose ra browser.

## Cài Đặt Environments

### Local Development

1. Copy `.env.example` sang `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Điền các giá trị development của bạn:
   ```bash
   # Edit .env.local
   nano .env.local
   ```

3. Start development servers:
   ```bash
   pnpm dev
   ```

### Staging (Vercel)

1. Vào Vercel Dashboard
2. Chọn project của bạn
3. Vào Settings → Environment Variables
4. Thêm variables cho "Preview" environment
5. Deploy lên staging:
   ```bash
   vercel
   ```

### Production (Vercel)

1. Vào Vercel Dashboard
2. Chọn project của bạn
3. Vào Settings → Environment Variables
4. Thêm variables cho "Production" environment
5. Deploy lên production:
   ```bash
   vercel --prod
   ```

## Validation Environment

### Sử Dụng @viztechstack/env

Project sử dụng package `@viztechstack/env` để validation:

```typescript
// packages/tooling/env/src/index.ts
import { z } from 'zod'

const envSchema = z.object({
  // Convex
  CONVEX_DEPLOYMENT: z.string(),
  CONVEX_URL: z.string().url(),
  NEXT_PUBLIC_CONVEX_URL: z.string().url(),
  
  // Clerk
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  CLERK_SECRET_KEY: z.string(),
  CLERK_JWT_ISSUER_DOMAIN: z.string().url(),
  
  // API
  PORT: z.string().default('4000'),
  GRAPHQL_URL: z.string().url(),
  NEXT_PUBLIC_GRAPHQL_URL: z.string().url(),
  
  // App
  WEB_APP_ORIGIN: z.string().url(),
  NODE_ENV: z.enum(['development', 'staging', 'production'])
})

export const env = envSchema.parse(process.env)
```

### Validation Errors

Nếu environment variables thiếu hoặc không hợp lệ:

```
Error: Invalid environment variables:
  - CONVEX_URL: Required
  - CLERK_SECRET_KEY: Required
  - GRAPHQL_URL: Invalid url
```

**Giải pháp:** Thêm missing variables vào environment của bạn.

## Best Practices Bảo Mật

### 1. Không Bao Giờ Commit Secrets

Thêm vào `.gitignore`:
```
.env.local
.env.production
.env*.local
```

### 2. Sử Dụng Keys Khác Nhau Cho Mỗi Environment

- Development: Test keys
- Staging: Test keys (khác với dev)
- Production: Live keys

### 3. Rotate Keys Thường Xuyên

- Rotate production keys mỗi 90 ngày
- Rotate sau khi team member rời đi
- Rotate nếu bị compromise

### 4. Giới Hạn Quyền Truy Cập

- Chỉ cấp production keys cho team members cần thiết
- Sử dụng team permissions của Vercel
- Audit access thường xuyên

### 5. Sử Dụng Secret Management

Cho các giá trị nhạy cảm, cân nhắc:
- Vercel Environment Variables (encrypted)
- AWS Secrets Manager
- HashiCorp Vault
- 1Password for Teams

## Troubleshooting

### Issue: Environment Variables Không Load

**Triệu chứng:**
- `undefined` khi truy cập `process.env.VARIABLE`
- Validation errors khi startup

**Giải pháp:**

1. **Kiểm tra tên file:**
   ```bash
   # Phải là .env.local, không phải .env
   ls -la | grep .env
   ```

2. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   # Start lại
   pnpm dev
   ```

3. **Kiểm tra variable prefix:**
   ```typescript
   // Client-side: Phải có NEXT_PUBLIC_ prefix
   const url = process.env.NEXT_PUBLIC_CONVEX_URL
   
   // Server-side: Không cần prefix
   const secret = process.env.CLERK_SECRET_KEY
   ```

### Issue: Variables Hoạt Động Ở Local Nhưng Không Trên Vercel

**Triệu chứng:**
- Hoạt động trong development
- Fails trong staging/production

**Giải pháp:**

1. **Kiểm tra Vercel environment variables:**
   - Vào Vercel Dashboard
   - Settings → Environment Variables
   - Verify tất cả variables đã được set

2. **Kiểm tra environment scope:**
   - Production variables chỉ apply cho production
   - Preview variables chỉ apply cho preview
   - Set variables cho đúng environment

3. **Redeploy sau khi thêm variables:**
   ```bash
   vercel --prod
   ```

### Issue: CORS Errors

**Triệu chứng:**
- API requests bị block bởi CORS
- "Access-Control-Allow-Origin" errors

**Giải pháp:**

1. **Kiểm tra WEB_APP_ORIGIN:**
   ```env
   # Phải khớp với web app URL của bạn
   WEB_APP_ORIGIN=https://viztechstack.com
   ```

2. **Update CORS configuration trong API:**
   ```typescript
   // apps/api/src/main.ts
   app.enableCors({
     origin: process.env.WEB_APP_ORIGIN,
     credentials: true
   })
   ```

## Environment Checklist

### Development Setup
- [ ] `.env.local` đã tạo
- [ ] Tất cả variables đã điền
- [ ] Convex dev deployment đã tạo
- [ ] Clerk test keys đã cấu hình
- [ ] Dev servers start thành công

### Staging Setup
- [ ] Vercel preview environment đã cấu hình
- [ ] Tất cả preview variables đã set
- [ ] Convex staging deployment đã tạo
- [ ] Clerk staging keys đã cấu hình
- [ ] Staging deployment thành công

### Production Setup
- [ ] Vercel production environment đã cấu hình
- [ ] Tất cả production variables đã set
- [ ] Convex production deployment đã tạo
- [ ] Clerk production keys đã cấu hình
- [ ] Production deployment thành công
- [ ] Tất cả secrets đã rotate từ staging

## Tham Khảo

### Danh Sách Variables Đầy Đủ

```env
# Convex Database
CONVEX_DEPLOYMENT=
CONVEX_URL=
CONVEX_SITE_URL=
NEXT_PUBLIC_CONVEX_URL=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_JWT_ISSUER_DOMAIN=
NEXT_PUBLIC_CLERK_JWT_ISSUER_DOMAIN=

# API Configuration
PORT=4000
GRAPHQL_URL=
NEXT_PUBLIC_GRAPHQL_URL=

# Web App Configuration
WEB_APP_ORIGIN=
NODE_ENV=

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=

# Optional: Error Tracking
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

### Environment URLs

**Development:**
- Web: http://localhost:3000
- API: http://localhost:4000
- Convex: https://your-dev.convex.cloud

**Staging:**
- Web: https://viztechstack-staging.vercel.app
- API: https://viz-tech-stack-api-staging.vercel.app
- Convex: https://your-staging.convex.cloud

**Production:**
- Web: https://viztechstack.com
- API: https://api.viztechstack.com
- Convex: https://your-prod.convex.cloud

---

**Cập Nhật Lần Cuối:** 2026-03-08
**Người Duy Trì:** DevOps Team
**Tần Suất Review:** Hàng tháng

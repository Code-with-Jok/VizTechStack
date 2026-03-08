# Deployment

Phần này bao gồm các quy trình deployment và cấu hình cho VizTechStack.

## Nội Dung

- [Hướng Dẫn Deployment](./deployment-guide.md) - Hướng dẫn deployment từng bước đầy đủ
- [Checklist Deployment](./deployment-checklist.md) - Checklist deployment toàn diện
- [Issues Deployment](./deployment-issues.md) - Log theo dõi và giải quyết issues
- [Convex Database](./convex.md) - Cài đặt và deployment Convex database
- [Vercel Deployment](./vercel.md) - Deployment Frontend và API
- [Cấu Hình Environment](./environment.md) - Environment variables và secrets

## Kiến Trúc Deployment

```
┌─────────────────┐
│   Vercel        │
│   (Frontend +   │
│    API)         │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Convex Cloud  │
│   (Database)    │
└─────────────────┘
```

## Deployment Nhanh

### 1. Deploy Database

```bash
cd convex
pnpm convex deploy
```

### 2. Deploy Application

```bash
# Kết nối với Vercel
vercel link

# Deploy
vercel --prod
```

## Environment Variables

Yêu cầu cho production:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Convex Database
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=

# API Configuration
NEXT_PUBLIC_API_URL=
```

## Điều Hướng

← [Trước: Implementation](../04-implementation/README.md)  
→ [Tiếp: Analysis](../06-analysis/README.md)  
↑ [Mục Lục Documentation](../README.md)

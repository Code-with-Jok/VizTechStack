# Deployment

This section covers deployment procedures and configuration for VizTechStack.

## Contents

- [Convex Database](./convex.md) - Convex database setup and deployment
- [Vercel Deployment](./vercel.md) - Frontend and API deployment
- [Environment Configuration](./environment.md) - Environment variables and secrets

## Deployment Architecture

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

## Quick Deployment

### 1. Deploy Database

```bash
cd convex
pnpm convex deploy
```

### 2. Deploy Application

```bash
# Connect to Vercel
vercel link

# Deploy
vercel --prod
```

## Environment Variables

Required for production:

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

## Navigation

← [Previous: Implementation](../04-implementation/README.md)  
→ [Next: Analysis](../06-analysis/README.md)  
↑ [Documentation Index](../README.md)

# Authentication & Authorization

## Overview

VizTechStack uses Clerk for authentication and implements role-based access control (RBAC) for authorization.

## User Roles

### User
- Browse public roadmaps
- Track progress
- Bookmark roadmaps
- View topics

### Admin
- All User permissions
- Create/edit/delete roadmaps
- Manage topics
- Publish/unpublish content

## Implementation

### Backend (NestJS)

**Guards**:
- `ClerkAuthGuard` - Validates JWT tokens
- `RolesGuard` - Checks user roles

**Decorators**:
- `@Public()` - Skip authentication
- `@Roles('admin')` - Require admin role

### Frontend (Next.js)

**Clerk Components**:
- `<SignIn />` - Sign in page
- `<SignUp />` - Sign up page
- `<UserButton />` - User menu

**Hooks**:
- `useUser()` - Get current user
- `useAuth()` - Get auth state

## Configuration

Environment variables:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

## See Also

- [Admin Setup Guide](../01-getting-started/admin-setup.md)

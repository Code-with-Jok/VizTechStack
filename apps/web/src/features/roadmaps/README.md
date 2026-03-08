# Roadmaps Feature

## Overview

This feature follows the feature-based structure with clear separation of concerns.

## Structure

- `components/` - React components for this feature
- `hooks/` - Custom React hooks for this feature
- `types/` - TypeScript types and interfaces for this feature

## Usage

Import components, hooks, or types from this feature:

```typescript
import { MyComponent, useMyHook, MyType } from '@/features/roadmaps'
```

## Guidelines

1. Keep components focused and single-purpose
2. Extract reusable logic into custom hooks
3. Define shared types in the types directory
4. Use barrel exports (index.ts) for clean imports
5. Co-locate related components, hooks, and types

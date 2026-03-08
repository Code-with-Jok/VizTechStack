# Progress Tracking Feature

## Overview

The Progress Tracking feature allows users to track their learning progress across roadmaps by marking topics as not-started, in-progress, or completed.

## Module Structure

Located at `apps/api/src/modules/progress/` following hexagonal architecture.

## Data Model

```typescript
interface ProgressEntity {
  id: string
  userId: string
  nodeId: string
  roadmapId: string
  status: 'not-started' | 'in-progress' | 'completed'
  completedAt?: Date
  updatedAt: Date
}
```

## Key Operations

- Update progress status
- Get user progress for a roadmap
- Calculate completion statistics

## Frontend Components

Located at `apps/web/src/features/progress/components/ProgressTracker.tsx`

## See Also

- [Roadmap Feature](./roadmap.md)

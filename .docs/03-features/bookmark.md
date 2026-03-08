# Bookmark Feature

## Overview

The Bookmark feature allows users to save their favorite roadmaps for quick access.

## Module Structure

Located at `apps/api/src/modules/bookmark/` following hexagonal architecture.

## Data Model

```typescript
interface BookmarkEntity {
  id: string
  userId: string
  roadmapId: string
  createdAt: Date
}
```

## Key Operations

- Add bookmark
- Remove bookmark
- Get user bookmarks
- Check if roadmap is bookmarked

## Frontend Components

Located at `apps/web/src/features/bookmark/`:
- `BookmarkButton.tsx` - Toggle bookmark
- `BookmarkedRoadmapsList.tsx` - List of bookmarked roadmaps

## See Also

- [Roadmap Feature](./roadmap.md)

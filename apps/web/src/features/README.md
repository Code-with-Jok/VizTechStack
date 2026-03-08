# Features Directory

This directory contains feature-based organization of frontend components, hooks, and types. Each feature is self-contained with its own components, custom hooks, and type definitions.

## Structure

Each feature follows this structure:

```
feature-name/
├── components/       # React components specific to this feature
│   └── index.ts     # Barrel export for components
├── hooks/           # Custom React hooks for this feature
│   └── index.ts     # Barrel export for hooks
├── types/           # TypeScript types and interfaces
│   └── index.ts     # Barrel export for types
└── index.ts         # Main barrel export for the entire feature
```

## Features

### 1. Roadmap Feature (`roadmap/`)

Handles all roadmap-related UI components, hooks, and types.

**Components:**
- RoadmapCard - Display roadmap summary cards
- RoadmapList - List of roadmaps with filtering
- RoadmapViewer - Main roadmap viewing interface
- RoadmapControls - Controls for roadmap interaction
- RoadmapGraph - Graph visualization using React Flow
- RoadmapNode - Individual nodes in the graph
- CategoryFilter - Filter roadmaps by category

**Hooks:**
- useRoadmaps - Fetch and manage roadmaps list
- useRoadmapBySlug - Fetch single roadmap by slug
- useCreateRoadmap - Create new roadmap

### 2. Topic Feature (`topic/`)

Handles topic content display and management.

**Components:**
- TopicPanel - Side panel for topic details
- TopicNode - Topic node in the graph
- ResourceList - List of learning resources
- MarkdownRenderer - Render markdown content

**Hooks:**
- useTopicByNodeId - Fetch topic by node ID
- useCreateTopic - Create new topic

### 3. Progress Feature (`progress/`)

Handles user progress tracking UI.

**Components:**
- ProgressTracker - Track and display user progress

**Hooks:**
- useProgress - Fetch user progress data
- useUpdateProgress - Update progress status

### 4. Bookmark Feature (`bookmark/`)

Handles bookmark management UI.

**Components:**
- BookmarkButton - Button to add/remove bookmarks
- BookmarkedRoadmapsList - List of bookmarked roadmaps

**Hooks:**
- useBookmarks - Fetch user bookmarks
- useAddBookmark - Add bookmark
- useRemoveBookmark - Remove bookmark

### 5. Editor Feature (`editor/`)

Handles admin roadmap editing functionality.

**Components:**
- RoadmapEditor - Main roadmap editor interface
- CreateRoadmapForm - Form for creating roadmaps
- CreateTopicForm - Form for creating topics
- RoadmapFormFields - Reusable roadmap form fields
- ResourceFormFields - Reusable resource form fields
- DeleteRoadmapButton - Button to delete roadmaps

**Hooks:**
- useRoadmapEditor - Manage editor state
- useDeleteRoadmap - Delete roadmap

## Usage

Import from features using barrel exports:

```typescript
// Import entire feature
import { RoadmapCard, RoadmapList, useRoadmaps } from '@/features/roadmap';

// Import specific subdirectory
import { RoadmapCard } from '@/features/roadmap/components';
import { useRoadmaps } from '@/features/roadmap/hooks';
import type { RoadmapCardProps } from '@/features/roadmap/types';
```

## Guidelines

### When to Create a New Feature

Create a new feature when:
- The functionality is a distinct domain concept
- Multiple components work together for a specific purpose
- The feature has its own state management needs
- The feature could be developed/tested independently

### When to Use Shared Components

Use `src/components/` for:
- Layout components (Header, Footer, Sidebar)
- Authentication components (LoginButton, UserMenu)
- UI primitives from shadcn/ui (Button, Card, Dialog)
- Truly generic components used across multiple features

### Component Organization

Within each feature:
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Define types close to where they're used
- Use barrel exports for clean imports

### Naming Conventions

- Components: PascalCase (e.g., `RoadmapCard.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useRoadmaps.ts`)
- Types: PascalCase with descriptive suffix (e.g., `RoadmapCardProps`)
- Files: Match the export name (e.g., `RoadmapCard.tsx` exports `RoadmapCard`)

## Benefits

This feature-based structure provides:

1. **Better Organization**: Related code is co-located
2. **Improved Discoverability**: Easy to find feature-specific code
3. **Faster Development**: Clear boundaries for new features
4. **Better HMR**: Smaller dependency graphs improve hot reload
5. **Easier Testing**: Features can be tested in isolation
6. **Team Scalability**: Multiple developers can work on different features

## Migration Status

This structure is part of Phase 2 of the codebase restructuring. Components will be gradually migrated from `src/components/` to their respective feature directories.

See `.kiro/specs/codebase-restructuring/` for the full migration plan.

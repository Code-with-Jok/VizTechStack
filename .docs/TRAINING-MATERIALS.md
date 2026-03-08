# Team Training Materials - Codebase Restructuring

**Training Date**: 2026-03-08  
**Duration**: 60 minutes  
**Audience**: All developers  
**Status**: ✅ Ready for Delivery

## Training Agenda

### Part 1: Overview (10 minutes)
- Why we restructured
- What changed
- Benefits for the team

### Part 2: Backend Changes (15 minutes)
- Module-based architecture
- Hexagonal architecture patterns
- Finding and creating modules

### Part 3: Frontend Changes (15 minutes)
- Feature-based structure
- Component organization
- Custom hooks and types

### Part 4: Tooling & Documentation (10 minutes)
- New utility commands
- Documentation structure
- Finding information

### Part 5: Hands-On & Q&A (10 minutes)
- Live demo
- Questions and answers

---

## Part 1: Overview

### Why We Restructured

**Problems We Had**:
1. **Large roadmap module** - 56 files mixing different concerns
2. **Flat component structure** - Hard to find related code
3. **Empty packages** - Cluttering the workspace
4. **Scattered documentation** - Difficult to navigate

**Goals**:
1. ✅ Improve code organization
2. ✅ Reduce coupling between features
3. ✅ Make code easier to find and understand
4. ✅ Better developer experience
5. ✅ Prepare for future growth

### What Changed

#### Backend: 1 Module → 5 Modules

```
Before:                    After:
roadmap/ (56 files)       health/
                          roadmap/ (~15 files)
                          topic/
                          progress/
                          bookmark/
```

#### Frontend: Flat → Feature-Based

```
Before:                    After:
components/               features/
  roadmap/                  roadmap/
  nodes/                      components/
  admin/                      hooks/
                              types/
                            topic/
                            progress/
                            bookmark/
                            editor/
```

#### Documentation: Flat → Hierarchical

```
Before:                    After:
.docs/                    .docs/
  architecture/             01-getting-started/
  deployment/               02-architecture/
  analysis/                 03-features/
  (mixed files)             04-implementation/
                            05-deployment/
                            06-analysis/
```

### Benefits for the Team

1. **Easier to Find Code**
   - Clear module boundaries
   - Features are self-contained
   - Logical organization

2. **Faster Development**
   - Less time searching for files
   - Better HMR performance (20-30% faster)
   - Utility scripts for common tasks

3. **Better Collaboration**
   - Multiple developers can work on different modules
   - Clear ownership boundaries
   - Reduced merge conflicts

4. **Improved Onboarding**
   - New developers can understand structure quickly
   - Comprehensive documentation
   - Clear patterns to follow

---

## Part 2: Backend Changes

### Module-Based Architecture

Each module is **independent** and **self-contained**:

```
apps/api/src/modules/
├── health/          # Health checks
├── roadmap/         # Roadmap management
├── topic/           # Topic content
├── progress/        # Progress tracking
└── bookmark/        # Bookmarks
```

**Key Principle**: Each module handles ONE domain concept.

### Hexagonal Architecture

Every module follows the same structure:

```
module-name/
├── application/       # Use cases (what the module does)
│   ├── commands/     # Write operations (Create, Update, Delete)
│   ├── queries/      # Read operations (Get, List)
│   ├── services/     # Orchestration logic
│   └── ports/        # Interfaces (contracts)
├── domain/           # Business logic (rules and entities)
│   ├── entities/     # Domain models
│   ├── errors/       # Domain-specific errors
│   └── policies/     # Business rules
├── infrastructure/   # External systems (database, etc.)
│   └── adapters/     # Implementations of ports
└── transport/        # API layer (how external world talks to us)
    └── graphql/      # GraphQL resolvers, schemas, mappers
```

**Dependency Flow**: Transport → Application → Domain ← Infrastructure

### Example: Topic Module

Let's trace a request through the topic module:

1. **GraphQL Request** arrives at `transport/graphql/resolvers/topic.resolver.ts`
2. **Resolver** calls `application/services/topic-application.service.ts`
3. **Service** uses `domain/entities/topic.entity.ts` for business logic
4. **Service** calls `application/ports/topic.repository.ts` (interface)
5. **Infrastructure** provides `infrastructure/adapters/convex-topic.repository.ts` (implementation)

### Finding Code in Modules

**Question**: Where do I add a new query to get topics by category?

**Answer**:
1. Create query: `topic/application/queries/get-topics-by-category.query.ts`
2. Add to service: `topic/application/services/topic-application.service.ts`
3. Add resolver: `topic/transport/graphql/resolvers/topic.resolver.ts`
4. Update schema: `topic/transport/graphql/schemas/topic.schema.ts`

### Creating New Modules

Use the generator script:

```bash
pnpm generate:module <module-name>
```

This creates:
- Complete directory structure
- Module file with providers
- Index files for exports
- README template

**Demo**: Let's generate a sample module together!

---

## Part 3: Frontend Changes

### Feature-Based Structure

Components are organized by **feature**, not by type:

```
apps/web/src/features/
├── roadmap/         # Everything related to roadmap viewing
│   ├── components/  # Roadmap components
│   ├── hooks/       # Roadmap-specific hooks
│   └── types/       # Roadmap types
├── topic/           # Everything related to topics
├── progress/        # Everything related to progress
├── bookmark/        # Everything related to bookmarks
└── editor/          # Everything related to admin editor
```

**Key Principle**: Related code lives together.

### Feature Structure

Each feature has three directories:

```
feature-name/
├── components/       # React components
│   ├── FeatureCard.tsx
│   ├── FeatureList.tsx
│   └── FeatureDetail.tsx
├── hooks/           # Custom hooks
│   ├── useFeature.ts
│   ├── useFeatureList.ts
│   └── useCreateFeature.ts
├── types/           # TypeScript types
│   └── feature.types.ts
└── index.ts         # Barrel exports
```

### Example: Roadmap Feature

```typescript
// apps/web/src/features/roadmap/components/RoadmapCard.tsx
export function RoadmapCard({ roadmap }: RoadmapCardProps) {
  // Component implementation
}

// apps/web/src/features/roadmap/hooks/useRoadmaps.ts
export function useRoadmaps() {
  // Hook implementation using GraphQL
}

// apps/web/src/features/roadmap/types/roadmap.types.ts
export interface RoadmapCardProps {
  roadmap: Roadmap
}

// apps/web/src/features/roadmap/index.ts
export { RoadmapCard } from './components/RoadmapCard'
export { useRoadmaps } from './hooks/useRoadmaps'
export type { RoadmapCardProps } from './types/roadmap.types'
```

### Importing from Features

**Barrel exports** make imports clean:

```typescript
// ✅ Good - Import from feature
import { RoadmapCard, useRoadmaps } from '@/features/roadmap'

// ❌ Bad - Don't import from deep paths
import { RoadmapCard } from '@/features/roadmap/components/RoadmapCard'
```

### Shared Components

Not everything goes in features. Shared components stay in `components/`:

```
apps/web/src/components/
├── layout/          # Layout components (Header, Footer, etc.)
├── auth/            # Authentication components
└── ui/              # shadcn/ui components (Button, Card, etc.)
```

**Rule**: If it's used by multiple features, it's shared.

### Creating New Features

Use the generator script:

```bash
pnpm generate:feature <feature-name>
```

This creates:
- Feature directory with components/, hooks/, types/
- Index file for barrel exports
- README template

**Demo**: Let's generate a sample feature together!

---

## Part 4: Tooling & Documentation

### New Utility Commands

We added 4 new commands to make your life easier:

#### 1. Generate Module

```bash
pnpm generate:module <module-name>
```

Creates a new backend module with hexagonal architecture.

#### 2. Generate Feature

```bash
pnpm generate:feature <feature-name>
```

Creates a new frontend feature with components/hooks/types.

#### 3. Validate Dependencies

```bash
pnpm validate:deps
```

Checks for circular dependencies between modules.

#### 4. Analyze Bundle

```bash
pnpm analyze:bundle
```

Analyzes bundle size and dependencies.

### Documentation Structure

Documentation is now organized in 6 levels:

```
.docs/
├── 01-getting-started/    # Start here!
│   ├── installation.md
│   ├── development.md
│   └── admin-setup.md
├── 02-architecture/       # System design
│   ├── overview.md
│   ├── tech-stack.md
│   └── business-logic.md
├── 03-features/           # Feature docs
│   ├── roadmap.md
│   ├── topic.md
│   └── progress.md
├── 04-implementation/     # How to implement
│   ├── hexagonal-architecture.md
│   └── graphql-codegen.md
├── 05-deployment/         # Deployment
│   ├── vercel.md
│   └── convex.md
└── 06-analysis/           # Analysis
    └── codebase-analysis.md
```

### Finding Information

**Question**: Where do I find...?

| What | Where |
|------|-------|
| How to install | `.docs/01-getting-started/installation.md` |
| Architecture overview | `.docs/02-architecture/overview.md` |
| How roadmap works | `.docs/03-features/roadmap.md` |
| Hexagonal architecture | `.docs/04-implementation/hexagonal-architecture.md` |
| How to deploy | `.docs/05-deployment/README.md` |
| Codebase analysis | `.docs/06-analysis/codebase-analysis.md` |

**Start Point**: [.docs/README.md](.docs/README.md)

### Key Documentation Files

1. **[Team Onboarding](.docs/TEAM-ONBOARDING.md)** - Read this first!
2. **[Migration Complete](.docs/MIGRATION-COMPLETE.md)** - What changed
3. **[Main README](README.md)** - Project overview

---

## Part 5: Hands-On Demo

### Demo 1: Finding Code

**Task**: Find the code that handles creating a new topic.

**Steps**:
1. Go to `apps/api/src/modules/topic/`
2. Look in `application/commands/create-topic.command.ts`
3. Check the service: `application/services/topic-application.service.ts`
4. See the resolver: `transport/graphql/resolvers/topic.resolver.ts`

### Demo 2: Adding a Component

**Task**: Add a new component to the roadmap feature.

**Steps**:
1. Go to `apps/web/src/features/roadmap/components/`
2. Create `RoadmapStats.tsx`
3. Export from `index.ts`
4. Import in your page: `import { RoadmapStats } from '@/features/roadmap'`

### Demo 3: Using Utility Commands

**Task**: Check for circular dependencies.

**Steps**:
```bash
# Run the validation
pnpm validate:deps

# Should see: ✅ No circular dependencies found
```

### Demo 4: Navigating Documentation

**Task**: Find how to deploy to production.

**Steps**:
1. Open `.docs/README.md`
2. Click on "05. Deployment"
3. Read the deployment guide

---

## Q&A Session

### Common Questions

**Q: What if I have an open PR?**

A: Rebase on main, update import paths, run tests. See [Team Onboarding](.docs/TEAM-ONBOARDING.md#if-you-have-open-prs).

**Q: Where do I put shared utilities?**

A: 
- Backend: `apps/api/src/common/`
- Frontend: `apps/web/src/lib/`
- Cross-app: `packages/shared/`

**Q: How do I know which module to put code in?**

A: Ask: "What domain concept does this belong to?" If it's about topics, it goes in the topic module.

**Q: Can modules depend on each other?**

A: Yes, but avoid circular dependencies. Use `pnpm validate:deps` to check.

**Q: What if I can't find something?**

A: 
1. Check the documentation
2. Use your IDE's search (Cmd/Ctrl + Shift + F)
3. Ask the team

**Q: Do I need to learn everything today?**

A: No! Start with:
1. Read [Team Onboarding](.docs/TEAM-ONBOARDING.md)
2. Explore the structure
3. Learn as you work

---

## Training Checklist

After this training, you should be able to:

- [ ] Understand why we restructured
- [ ] Navigate the new backend module structure
- [ ] Navigate the new frontend feature structure
- [ ] Use the new utility commands
- [ ] Find information in the documentation
- [ ] Know where to put new code
- [ ] Know where to get help

---

## Additional Resources

### Documentation
- [Team Onboarding Guide](.docs/TEAM-ONBOARDING.md)
- [Migration Summary](.docs/MIGRATION-COMPLETE.md)
- [Documentation Index](.docs/README.md)

### Guides
- [Hexagonal Architecture](.docs/04-implementation/hexagonal-architecture.md)
- [Feature Structure](../apps/web/src/features/README.md)

### Specs
- [Restructuring Spec](.kiro/specs/codebase-restructuring/)

---

## Feedback

Please provide feedback on this training:
- What was helpful?
- What was confusing?
- What would you like to learn more about?

---

**Training Complete!** 🎉

Remember: The restructuring is here to help you. Take time to explore and don't hesitate to ask questions!


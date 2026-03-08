# Architecture

This section provides comprehensive documentation of VizTechStack's architecture, design decisions, and technical implementation.

## Overview

VizTechStack follows a modern, scalable architecture with clear separation of concerns:

- **Monorepo Structure**: pnpm workspaces with Turbo for build orchestration
- **Backend**: NestJS with hexagonal architecture
- **Frontend**: Next.js with feature-based structure
- **Database**: Convex serverless database
- **API**: GraphQL with code-first approach

## Contents

- [Overview](./overview.md) - High-level architecture overview
- [Tech Stack](./tech-stack.md) - Technology choices and evaluation
- [Business Logic](./business-logic.md) - Business logic flow and patterns
- [Improvements](./improvements.md) - Identified issues and improvements

## Key Architectural Principles

### 1. Hexagonal Architecture (Backend)

Each backend module follows hexagonal architecture with clear layer separation:

```
Transport Layer (GraphQL) → Application Layer → Domain Layer → Infrastructure Layer
```

Benefits:
- Clear separation of concerns
- Testable business logic
- Easy to swap implementations
- Independent of frameworks

### 2. Feature-Based Structure (Frontend)

Frontend code is organized by feature rather than by type:

```
features/
├── roadmap/
│   ├── components/
│   ├── hooks/
│   └── types/
├── topic/
└── progress/
```

Benefits:
- Better code organization
- Improved HMR performance
- Easier to locate code
- Reduced coupling

### 3. Monorepo with Workspaces

Using pnpm workspaces and Turbo for:
- Shared code reuse
- Consistent tooling
- Efficient builds with caching
- Atomic changes across packages

### 4. Type Safety

End-to-end type safety:
- TypeScript throughout
- GraphQL code generation
- Zod runtime validation
- Shared types across frontend/backend

## Architecture Diagrams

### System Architecture

```
┌─────────────────┐
│   Next.js Web   │
│   (Frontend)    │
└────────┬────────┘
         │ GraphQL
         ↓
┌─────────────────┐
│   NestJS API    │
│   (Backend)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│     Convex      │
│   (Database)    │
└─────────────────┘
```

### Backend Module Structure

```
Module
├── Transport Layer
│   └── GraphQL (Resolvers, Schemas, Mappers)
├── Application Layer
│   ├── Commands (Write operations)
│   ├── Queries (Read operations)
│   ├── Services (Use case orchestration)
│   └── Ports (Repository interfaces)
├── Domain Layer
│   ├── Entities (Business objects)
│   ├── Errors (Domain exceptions)
│   └── Policies (Business rules)
└── Infrastructure Layer
    └── Adapters (Repository implementations)
```

### Data Flow

```
User Request
    ↓
GraphQL Resolver (Transport)
    ↓
Application Service
    ↓
Domain Entity (Business Logic)
    ↓
Repository (Infrastructure)
    ↓
Convex Database
```

## Design Decisions

### Why NestJS?

- Enterprise-grade framework
- Built-in dependency injection
- Excellent TypeScript support
- GraphQL integration
- Modular architecture

### Why Next.js?

- React framework with SSR/SSG
- App Router for modern routing
- Server Components for performance
- Built-in optimization
- Vercel deployment integration

### Why Convex?

- Serverless database
- Real-time sync
- TypeScript-first
- Built-in validation
- Easy deployment

### Why GraphQL?

- Type-safe API
- Flexible queries
- Code generation
- Single endpoint
- Strong tooling

### Why Monorepo?

- Code sharing
- Consistent tooling
- Atomic changes
- Better collaboration
- Simplified dependencies

## Navigation

← [Previous: Getting Started](../01-getting-started/README.md)  
→ [Next: Features](../03-features/README.md)  
↑ [Documentation Index](../README.md)

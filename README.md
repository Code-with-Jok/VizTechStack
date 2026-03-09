# VizTechStack

This repository is in transition.

The previous product implementation has been removed from the frontend, backend, data layer, and shared contracts. What remains is a minimal application shell that can support the next redesign.

## Active surfaces

- `apps/web`: Next.js shell with authentication and base layout
- `apps/api`: NestJS API with health and ping endpoints plus GraphQL shell
- `convex`: minimal data schema for users and guides

## Commands

- `pnpm dev`
- `pnpm build`
- `pnpm typecheck`
- `pnpm lint`

## Notes

- The current workspace keeps only the base shell, health endpoints, and supporting infrastructure.
- Workspace docs may still be revised further as the next product direction is defined.

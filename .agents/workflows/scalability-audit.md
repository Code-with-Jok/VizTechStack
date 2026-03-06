# Scalability Audit (CTO View) - VizTechStack

Scope audited:

- Web: `apps/web` (Next.js 16)
- API: `apps/api` (NestJS + GraphQL)
- Data layer: `convex/` (Convex schema + functions)
- Monorepo: Turborepo + pnpm workspace

## 0) Architecture Snapshot

- UI pages call GraphQL using raw query strings and manual `fetch`.
- API resolver calls Convex directly via `ConvexHttpClient`.
- Data graph (`nodesJson`, `edgesJson`) is persisted as JSON strings.
- Shared typing exists (`packages/shared/types`) but not enforced end-to-end.

## 1) Data Bottlenecks (100x user growth)

### Findings

1. `collect()` without pagination in list queries can become memory/latency heavy.
2. Large JSON blobs (`nodesJson`, `edgesJson`) increase payload and parse costs.
3. `cache: "no-store"` on key pages removes cache leverage under high read traffic.
4. API re-fetches full records from Convex even when UI asks for summary fields.

### Decision (Speed/Quality/Cost)

- Speed-first quick fix: add pagination + field-level projections now.
- Quality-first durable fix: split graph data into normalized node/edge tables with versioned snapshots.
- Cost-aware path (recommended): phased migration.

Recommended:

1. Add cursor pagination and limit defaults in Convex queries (immediate).
2. Add read model for listing pages (summary table/materialized projection).
3. Introduce graph snapshot table (`roadmap_versions`) and lazy-load graph payload.
4. Add cache policy:

- public list pages: short revalidate window.
- admin and mutable pages: no-store.

Debt warning:

- Keeping graph as single JSON string is `Medium` debt now, will become `High` when roadmap complexity grows.

## 2) Decoupling Audit

### Tight Coupling Found

1. Resolver directly depends on Convex client and generated API paths.
2. Auth/role assumptions are duplicated across layers.
3. Web pages duplicate GraphQL request construction and error parsing.
4. Domain contract mismatch risk between Convex schema, GraphQL schema, and Zod schemas.

### Decoupling Plan

- Introduce `RoadmapApplicationService` and `RoadmapRepository` interface.
- Move Convex calls into adapter (`infrastructure/convex-roadmap.repository.ts`).
- Centralize auth policy in one reusable service.
- Add web `api-client` module (single place for GraphQL transport).
- Keep monolith deploy initially; split into microservices only when scaling signal appears:
  - Signal: API p95 > target for 2 consecutive sprints or team ownership conflicts.

Microservice candidate order:

1. `content-read-service` (high read traffic, cache friendly).
2. `authoring-service` (admin writes).
3. `progress-service` (user tracking and analytics).

## 3) Infrastructure as Code + Monorepo Deployment

Current gap:

- CI exists, but no full IaC workflow for environment provisioning.
- Deploy boundaries are app-level, not service-level.

Recommended structure:

```text
infra/
  terraform/
    envs/{dev,staging,prod}/
    modules/{api,web,convex,monitoring}/
```

Monorepo changes:

1. Add `turbo` pipeline tasks per deployable unit:

- `build:api`, `build:web`, `deploy:api`, `deploy:web`, `deploy:convex`.

2. Use `--filter` in CI/CD to deploy only changed services.
3. Add independent release manifests per service:

- `apps/api/release.yaml`
- `apps/web/release.yaml`
- `convex/release.yaml`

4. Add contract tests between services before independent deploy.

## 4) Business Alignment (Real-time roadmap experience)

Business target example:

- Faster real-time roadmap loading and editing with stable reliability.

Technical logic contribution:

- Pagination + read model reduces perceived load time.
- Decoupled authoring/read paths avoids admin traffic impacting learners.
- IaC + independent deploy reduces incident blast radius and recovery time.

## 5) 6-Month Technical Roadmap

### Month 1-2 (Foundation)

- Add pagination and selective fields in Convex queries.
- Introduce API service/repository layers for roadmap module.
- Establish typed error model and centralized handling.
- Enable strict no-`any` lint gate.

### Month 3-4 (Scale Read Path)

- Build read model for homepage and category browsing.
- Add cache strategy (revalidate windows + cache tags).
- Add load tests and baseline SLO dashboards.
- Implement first ADR automation in CI.

### Month 5-6 (Independent Delivery)

- Introduce service-level deploy workflows with changed-service detection.
- Add infra modules (dev/staging/prod parity).
- Add DORA dashboards and incident drill process.
- Decide whether to split first microservice based on observed metrics.

## 6) Tech Stack Justification

Current stack:

- TypeScript + Turborepo + Convex + Next.js + NestJS.

Why this stack works:

- TypeScript improves shared contracts and team velocity.
- Turborepo optimizes monorepo build graph and cache reuse.
- Convex accelerates product iteration with typed server functions.
- NestJS gives structured backend boundaries for growth.

Alternative comparison:

- Versus `Postgres + Prisma + Redis`:
  - Better control and query flexibility at scale.
  - Higher operational cost and longer feature cycle initially.
- Versus `tRPC-only`:
  - Faster fullstack typing, but weaker for external API governance needs.
- Versus `Nx`:
  - Strong policy tooling, but Turborepo is lighter and currently sufficient.

Known weaknesses and mitigations:

1. Convex query flexibility and cost at very large scale:
   - Mitigation: read models, caching, and selective migration for heavy analytics.
2. Split backend ownership between Convex and NestJS:
   - Mitigation: clear bounded contexts and repository interfaces.
3. Type drift across schema layers:
   - Mitigation: schema generation + CI contract checks.

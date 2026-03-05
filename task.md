# Refactor Task Plan - VizTechStack

## 1) Baseline Analysis (03/06/2026)

### Findings

- Architecture boundary chưa rõ trong API: resolver đang chứa orchestration và gọi Convex trực tiếp.
  - `apps/api/src/modules/roadmap/roadmap.resolver.ts`
- Import xuyên package theo đường dẫn source nội bộ thay vì public API package.
  - `apps/api/src/main.ts`
  - `apps/api/src/common/convex/convex.service.ts`
  - `apps/api/src/app.controller.ts`
- Type safety chưa end-to-end:
  - Nhiều `any`/`as any` ở Convex/Auth.
  - `convex/roadmaps.ts`
  - `convex/progress.ts`
  - `convex/seed.ts`
  - `apps/api/src/common/guards/roles.guard.ts`
- Data contract lệch nhau:
  - Shared schema định nghĩa `nodes/edges` dạng object (`packages/shared/types/src/roadmap.ts`),
  - nhưng DB/API/UI đang dùng `nodesJson/edgesJson` dạng string (`convex/schema.ts`, `apps/web/src/components/roadmap-editor.tsx`, `apps/web/src/components/roadmap-graph.tsx`).
- Web client lặp logic GraphQL và error handling ở nhiều page.
  - `apps/web/src/app/page.tsx`
  - `apps/web/src/app/roadmap/[slug]/page.tsx`
  - `apps/web/src/app/admin/roadmap/page.tsx`
  - `apps/web/src/app/admin/roadmap/new/page.tsx`
- Read path chưa tối ưu scale:
  - list query dùng `collect()` không pagination (`convex/roadmaps.ts`).
  - Web dùng `cache: "no-store"` cho nhiều route public.
- Hygiene repo chưa tốt:
  - Build artifacts bị commit trong source tree (`tooling/env/src/*.js`, `convex/*.js`, `*.d.ts`, `*.map`).

### Validation snapshot

- `pnpm turbo lint`: pass
- `pnpm turbo typecheck`: pass
- `pnpm turbo test --filter='./apps/**'`: pass (chỉ có 1 unit test)
- `pnpm turbo build --filter='./packages/**'`: pass
- `pnpm turbo build --filter='./apps/**'`: pass
- Lưu ý: runtime đang dùng Node `v24.12.0`, nhưng `apps/api` yêu cầu `20.x`.

## 2) Decision (Speed / Quality / Cost)

### Option A - Refactor Big-Bang (1 đợt lớn)

- Speed: 2/5
- Quality: 4/5
- Cost: 2/5
- Rủi ro cao do thay đổi đồng thời nhiều lớp (API, Convex, Web, contracts).

### Option B - Phased Refactor (khuyến nghị)

- Speed: 4/5
- Quality: 4/5
- Cost: 4/5
- Chia nhỏ theo phase, có thể release an toàn và rollback từng phần.

### Selected

- Chọn **Option B - Phased Refactor**.
- Debt level hiện tại: **Medium** (có nguy cơ lên High nếu tiếp tục mở rộng tính năng trên nền hiện trạng).

## 3) Refactor Roadmap (Phased Tasks)

## Phase 0 - Guardrails & Repo Hygiene (P0)

### Goals

- Thiết lập hàng rào chất lượng để ngăn nợ kỹ thuật mới.

### Tasks

- [ ] Bật rule ESLint nghiêm ngặt:
  - `@typescript-eslint/no-explicit-any: error`
  - `@typescript-eslint/no-unsafe-assignment: error`
  - `@typescript-eslint/no-unsafe-member-access: error`
- [ ] Thêm CI check chặn `any` trái phép (allow-list cho generated code).
- [ ] Chuẩn hóa Node version (`.nvmrc` hoặc Volta) về `20.x`.
- [ ] Dọn artifacts build khỏi source tree, chỉ giữ output ở `dist`/`_generated` theo policy.
- [ ] Cập nhật `.gitignore`/scripts để tránh tái phát.

### Definition of Done

- Lint fail nếu có `any` mới ngoài allow-list.
- CI chạy ổn định trên Node 20.
- Không còn file build rơi trong `src` của `tooling/env` và root `convex`.

## Phase 1 - API Layering (P0)

### Goals

- Tách rõ `transport -> application -> domain -> infrastructure` cho module roadmap.

### Tasks

- [ ] Tạo cấu trúc thư mục chuẩn trong `apps/api/src/modules/roadmap/`.
- [ ] Tách use case:
  - `CreateRoadmap`
  - `GetRoadmapBySlug`
  - `ListRoadmaps`
- [ ] Tạo `RoadmapRepository` (port) + `ConvexRoadmapRepository` (adapter).
- [ ] Giữ resolver mỏng: chỉ map input/output + gọi service.
- [ ] Thêm typed domain errors + centralized exception mapping.

### Definition of Done

- Resolver không gọi Convex trực tiếp.
- Không còn business logic trong resolver.
- Lỗi nghiệp vụ trả về typed GraphQL errors nhất quán.

## Phase 2 - Contract & Type Unification (P0)

### Goals

- Đồng bộ model giữa Convex, API, Web, shared types.

### Tasks

- [ ] Chốt single source of truth cho roadmap contract ở `packages/shared/types`.
- [ ] Loại bỏ cast thủ công enum/string giữa các layer.
- [ ] Tạo mapper chuẩn giữa Convex document và GraphQL DTO.
- [ ] Thống nhất import qua public package exports (không import `tooling/env/src/*` hay relative vào generated internals nếu đã có package alias).

### Definition of Done

- Web/API dùng type dùng chung từ package shared.
- Không còn cast `as 'role' | ...` lặp lại trong resolver/service.

## Phase 3 - Data Model & Scalability (P1)

### Goals

- Giảm payload lớn và chuẩn bị cho tăng trưởng traffic.

### Tasks

- [ ] Thêm pagination/cursor cho `roadmaps.list`.
- [ ] Tách read model cho listing (summary fields only).
- [ ] Thiết kế migration từ `nodesJson/edgesJson` sang snapshot versioned (`roadmap_versions`) hoặc typed graph document.
- [ ] Backfill script + verification script.
- [ ] Tối ưu index theo access patterns mới.

### Definition of Done

- Query list trả về có cursor + limit.
- Homepage/admin list không cần tải full graph JSON.
- Có kế hoạch rollback dữ liệu rõ ràng trước khi migrate prod.

## Phase 4 - Web API Client Refactor (P1)

### Goals

- Xóa lặp GraphQL fetch logic, chuẩn hóa error handling và cache strategy.

### Tasks

- [ ] Tạo `apps/web/src/lib/api-client` (typed request/response wrapper).
- [ ] Di chuyển toàn bộ GraphQL query/mutation khỏi page components.
- [ ] Chuẩn hóa auth token injection + error mapping.
- [ ] Thiết lập cache policy theo route:
  - public pages: `revalidate` phù hợp
  - admin/edit pages: `no-store`

### Definition of Done

- Không còn logic fetch GraphQL raw lặp trong 4 page hiện tại.
- Cơ chế xử lý lỗi đồng nhất giữa các route.

## Phase 5 - Test Strategy & Governance (P1)

### Goals

- Nâng mức tin cậy khi refactor.

### Tasks

- [ ] Bổ sung unit test cho application services roadmap.
- [ ] Bổ sung integration test cho repository adapter Convex.
- [ ] Bổ sung e2e test cho:
  - list roadmap
  - get roadmap by slug
  - create roadmap (admin only)
- [ ] Đặt coverage threshold tối thiểu cho `apps/api`.
- [ ] Viết/ cập nhật ADR cho thay đổi kiến trúc và contract.

### Definition of Done

- Không còn tình trạng chỉ 1 test cơ bản.
- Pipeline governance pass với test matrix đầy đủ.

## 4) Execution Order & Dependencies

1. Phase 0
2. Phase 1 + Phase 2 (song song một phần, ưu tiên API contract trước)
3. Phase 3
4. Phase 4
5. Phase 5

## 5) Risk & Rollback

- Mọi thay đổi schema/data ở Phase 3 phải có:
  - migration idempotent
  - dual-read/dual-write tạm thời (nếu cần)
  - rollback script đã test trên staging
- Refactor API/Web phải giữ backward compatibility cho GraphQL contract cho đến khi migration hoàn tất.

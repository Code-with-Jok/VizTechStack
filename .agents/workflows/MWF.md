# Prompt: Build Feature With Governance Flow

Ban la AI Engineering Agent trong monorepo `VizTechStack`.

Nhiem vu: trien khai **[feature]** end-to-end, tuan thu toan bo governance hien co.

Bat buoc lam theo dung thu tu sau:

## 0) Production Incident Override (neu dang loi prod)

Neu task lien quan production incident:

1. Doc `.agents/rules/prod-incident-access.md`.
2. Duoc phep truy cap `browser`, `terminal`, va `PR` de dieu tra (e2e).
3. Thu thap bang chung tu ca 3 nguon truoc khi ket luan nguyen nhan.
4. Uu tien mitigation/rollback an toan truoc, roi moi fix root cause.

## 1) Decision First (Speed / Quality / Cost)

1. Doc `.agents/rules/decision-framework.md`.
2. De xuat toi thieu 2 phuong an.
3. So sanh theo `Speed`, `Quality`, `Cost` (1-5).
4. Chon 1 phuong an va neu ro ly do.
5. Neu co technical debt, bat buoc canh bao + de xuat cach giam debt.

## 2) Zero-Debt Design

1. Doc `.agents/rules/zero-debt-engineering.md`.
2. Thiet ke theo cac lop:
   - `application`
   - `domain`
   - `infrastructure`
   - `transport/graphql`
3. Khong de resolver chua business logic.
4. Khong dung `any`; dung typed errors + centralized error mapping.

## 3) Scalability Guard

1. Doc `.agents/workflows/scalability-audit.md`.
2. Ap dung cho CRUD/read-heavy flows:
   - List co pagination/cursor.
   - Tranh payload graph qua lon neu khong can.
   - Co cache strategy phu hop read/write.

## 4) Implementation Scope

Thuc hien day du:

1. Backend (`apps/api`): query/mutation + service/repository + guard/policy.
2. Data (`convex`): cap nhat function/schema/index can thiet.
3. Frontend (`apps/web`): UI va API client layer.
4. Shared contracts (`packages/shared/types`): cap nhat type/schema dung chung.

## 5) Validation Before PR

Chay va bao ket qua:

1. `pnpm turbo lint`
2. `pnpm turbo typecheck`
3. `pnpm turbo test --filter='./apps/**'`
4. `pnpm turbo build --filter='./packages/**'`
5. `pnpm turbo build --filter='./apps/**'`

Neu co loi, fix truoc khi tao PR.

## 6) PR Governance

1. Tao PR description theo `.github/PULL_REQUEST_TEMPLATE.md`.
2. Dien day du: `Risk Profile`, `Rollback Plan`, `DORA Notes`, `Technical Debt`, `Speed/Quality/Cost Decision`.
3. Neu thay doi kien truc/contract chinh:
   - gan label `architecture-impact`
   - tao/cap nhat ADR trong `docs/adr/` theo `docs/adr/0000-template.md`.

## 7) Review and Merge Readiness

1. Tu review theo `.agents/workflows/review-strategy.md`.
2. Dam bao khong vi pham `CODEOWNERS`.
3. Dam bao PR pass `.github/workflows/governance-check.yml`.

## 8) Output Format (bat buoc)

Tra ket qua theo format:

1. `Decision Summary`
2. `Files Changed`
3. `Technical Debt`
4. `Test Results`
5. `ADR & Governance`
6. `Deployment/Rollback Notes`

Khong bo qua buoc nao. Neu bi block, neu ro blocker + cach go block.

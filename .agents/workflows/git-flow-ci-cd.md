---
description: CI/CD workflow for Git Flow-based branch management and deployment
---

# Git Flow and CI/CD Workflow

This workflow applies to all code changes from branch creation to production.

## 1) Branch Strategy

- `main`: production-ready.
- `develop`: integration branch.
- Feature branch naming:
  - `feat/<ticket>-<short-name>`
  - `fix/<ticket>-<short-name>`
  - `chore/<ticket>-<short-name>`

Rules:

- Rebase feature branch on latest `develop` before opening PR.
- Keep PR size small: target <= 400 changed lines excluding generated files.

## 2) Local Pre-Commit Gates

Current hooks already run:

- `pnpm turbo lint typecheck`
- `commitlint` on commit message

Agent must also run before PR:

1. `pnpm turbo test --filter='./apps/**'`
2. `pnpm turbo build --filter='./packages/**'`
3. `pnpm turbo build --filter='./apps/**'`
4. `pnpm turbo build`

## 3) CI Stages (Pull Request)

Stage order:

1. `Install`
2. `Lint`
3. `Typecheck`
4. `Unit/Integration Tests`
5. `Build`
6. `Security Scan`
7. `Preview Deploy`

Security scan requirements:

- Dependency audit: `pnpm audit --prod` (or SCA tool in CI).
- Secret scan: `gitleaks` (or equivalent).
- Static security scan: `semgrep` baseline policies.

Blocking policy:

- Any failing stage blocks merge.
- Security critical/high findings block merge unless exception approved.

## 4) CD Promotion Flow

1. Merge to `develop`:
   - Deploy to `staging`.
   - Run smoke tests + contract tests.
2. Promote to `main`:
   - Deploy to `production`.
   - Run post-deploy health checks.
3. Auto rollback:
   - Trigger rollback when error budget burn or health check fails.

## 5) Monorepo Deployment Isolation

Use changed-package detection:

- If only `apps/web/**` changed -> deploy web only.
- If only `apps/api/**` changed -> deploy api only.
- If only `convex/**` changed -> deploy convex only.
- If shared contract package changed -> run full integration matrix.

Required:

- Every service has independent deploy command and version metadata.
- Every deployment stores release artifact and git SHA.

## 6) Definition of Done

A PR is done only if:

1. All CI gates pass.
2. At least one reviewer approves.
3. ADR updated when architectural impact exists.
4. Release notes include risk and rollback plan.

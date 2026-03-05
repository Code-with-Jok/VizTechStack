# Decision Framework (Speed, Quality, Cost)

Use this framework before every architecture, implementation, or delivery decision.

## Required Output Format

For each proposal, produce:

1. `Context`: What problem and scope.
2. `Options`: At least 2 options.
3. `Trade-off`: Compare Speed, Quality, Cost for each option.
4. `Decision`: One selected option and why.
5. `Debt Warning`: What debt is created, impact window, and mitigation.

## Scoring Model

Score each option from `1` (worst) to `5` (best):

- `Speed`: time-to-delivery and lead time impact.
- `Quality`: reliability, security, scalability, maintainability.
- `Cost`: infrastructure and engineering effort.

Use weighted score:

- `Quality`: 0.45
- `Speed`: 0.35
- `Cost`: 0.20

Exception:

- For incidents or outages, temporarily set `Speed` to 0.50 and `Quality` to 0.35.
- After recovery, open a follow-up task to restore quality baseline.

## Technical Debt Policy

Always mark debt level:

- `Low`: reversible in < 1 sprint.
- `Medium`: requires cross-team coordination or schema changes.
- `High`: affects architecture boundaries, security, or data correctness.

If debt is `Medium` or `High`, agent must:

1. Add a mitigation task in roadmap/backlog.
2. Add an ADR or update existing ADR.
3. Define deadline and owner for debt payoff.

## Escalation Rules

Block release if any of the following is true:

- Security controls are bypassed.
- `any` is introduced in domain/data contracts without explicit exception.
- No rollback plan exists for schema or infra changes.
- A module adds direct imports across bounded contexts (tight coupling regression).

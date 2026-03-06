## Summary

Describe what changed and why.

## Business Goal

- Goal linked to this PR:
- Expected business impact:

## Speed / Quality / Cost Decision

- Option selected:
- Why this option:
- Trade-off considered:

## Risk Profile

- Risk level: `low` | `medium` | `high`
- Main risk:
- Mitigation:

## Technical Debt

- Debt introduced? `yes` | `no`
- If yes, debt ticket:
- Debt payoff deadline:

## Rollback Plan

Describe exact rollback steps if deploy fails.

## DORA Notes

- Expected deployment frequency impact:
- Expected lead time impact:
- Expected change failure rate impact:
- Expected MTTR impact:

## Testing

- [ ] `pnpm turbo lint`
- [ ] `pnpm turbo typecheck`
- [ ] `pnpm turbo test --filter='./apps/**'`
- [ ] `pnpm turbo build --filter='./packages/**'`
- [ ] `pnpm turbo build --filter='./apps/**'`

## Governance Checklist

- [ ] I followed `.agents/rules/decision-framework.md`
- [ ] I followed `.agents/rules/zero-debt-engineering.md`
- [ ] If architecture changed, I added/updated ADR in `docs/adr/`

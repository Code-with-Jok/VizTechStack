# Review Strategy and Checklist

Goal: increase review quality while reducing lead time.

## 1) Review SLA

- First reviewer response: <= 4 business hours.
- Re-review after author updates: <= 2 business hours.
- Escalate to backup reviewer if SLA is missed.

## 2) Review Focus Order (by severity)

1. Correctness and business logic.
2. Security and authorization.
3. Data integrity and migration safety.
4. Performance and scalability risks.
5. Maintainability and code style.

## 3) Mandatory Checklist

### Logic

- Does the change satisfy acceptance criteria?
- Are edge cases and failure paths handled?
- Are domain invariants preserved?

### Security

- AuthN/AuthZ checked at every protected boundary?
- Sensitive data exposure prevented in logs and responses?
- Input validation done at transport boundary?

### Performance

- Any unbounded loops, scans, or full-table collects?
- Any N+1 query risk?
- Caching policy correct for read-heavy endpoints?

### Type Safety

- Any new `any` introduced?
- Are shared schemas/types reused rather than duplicated?
- Are runtime validators aligned with compile-time types?

### Tests

- Unit test added for changed domain logic?
- Integration/contract tests updated where relevant?
- Negative path tests included?

## 4) How To Reduce Lead Time

1. Require small PRs with one clear intent.
2. Use PR template with risk profile and checklist.
3. Enable CODEOWNERS for auto-routing reviewers.
4. Add bot auto-comments for lint/type/test/security outputs.
5. Use stacked PRs for large features.

## 5) Review Decision Tags

Use one of:

- `APPROVE`
- `REQUEST_CHANGES`
- `APPROVE_WITH_FOLLOW_UP` (only for low-risk debt with ticket reference)

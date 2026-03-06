# Rule: Technical Architecture Document

Use this rule when the user asks for:

- "Technical Architecture Document: [feature]"
- architecture design/planning for a new feature
- system design that must include implementation direction

## Required Title Format

The document title must be:

`Technical Architecture Document: [feature]`

Replace `[feature]` with the exact feature name from the user request.

## Required Sections

The document must include all sections below in this order:

1. System Architecture Overview
2. Data Flow
3. Folder Structure (Monorepo Friendly)
4. GraphQL Code Generator configuration (example `codegen.ts`)
5. Zod Integration Strategy
6. Example Implementation
7. Error Handling Strategy
8. Performance Considerations
9. Best Practices

## Decision Framework (Mandatory)

Before the section content, include:

1. Context
2. At least 2 options
3. Speed/Quality/Cost comparison (score 1-5)
4. Selected option with rationale
5. Debt warning and mitigation

## Content Standards

- Must be TypeScript-first.
- Must support modern React clients.
- Must minimize duplicate type definitions.
- Must be scalable for monorepo growth.
- Must separate compile-time guarantees from runtime guarantees.
- Must include at least one pseudo diagram or architecture flow diagram.

## Implementation Detail Minimum

The document must provide:

- A real `codegen.ts` sample (not pseudocode only).
- At least one GraphQL schema example.
- At least one generated type example.
- At least one Zod schema example.
- At least one React usage example with runtime validation handling.

## Error and Runtime Policy

The document must define:

- where runtime validation is required
- how validation errors are normalized and surfaced to UI
- when validation can be reduced for performance

## Output Style

- Write as a technical architecture document.
- Be precise, structured, and implementation-ready.
- Avoid generic statements without concrete examples.

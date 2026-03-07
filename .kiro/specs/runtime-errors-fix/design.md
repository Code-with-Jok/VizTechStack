# Runtime Errors Fix - Bugfix Design

## Overview

This bugfix addresses three critical runtime errors preventing the VizTechStack application from functioning correctly. The first error is a network connectivity issue where the web application cannot reach the GraphQL API server during development. The second error is a React hydration mismatch caused by the Clerk `<UserButton />` component rendering differently on server versus client. The third error is a GraphQL schema mismatch where the client sends queries with a single `input` parameter but the server resolver expects separate `filters` and `pagination` parameters. The fix strategy involves: (1) ensuring proper development server startup documentation and error handling, (2) wrapping the UserButton in a client-side boundary to prevent SSR hydration issues, and (3) aligning the GraphQL schema by either updating the server resolver to accept `input` or updating the client to send separate parameters.

## Glossary

- **Bug_Condition_1 (C1)**: Network fetch failure when web app attempts to connect to GraphQL API at `http://localhost:4000/graphql`
- **Bug_Condition_2 (C2)**: React hydration mismatch when `<UserButton />` renders with different HTML on server vs client
- **Bug_Condition_3 (C3)**: GraphQL schema mismatch where client query structure doesn't match server resolver signature
- **Property_1 (P1)**: Successful GraphQL connection and data retrieval when API server is running
- **Property_2 (P2)**: Matching HTML output on server and client for authentication UI components
- **Property_3 (P3)**: Successful GraphQL query execution with aligned client-server schema
- **Preservation**: Existing error handling, fallback behavior, and backward compatibility must remain unchanged
- **executeServerGraphql**: Function in `apps/web/src/lib/api-client/graphql-client.ts` that executes GraphQL queries from Next.js server components
- **getRoadmapsPageServer**: Function in `apps/web/src/lib/api-client/roadmaps.ts` that fetches paginated roadmaps data
- **listRoadmaps**: GraphQL resolver in `apps/api/src/modules/roadmap/transport/graphql/resolvers/roadmap.resolver.ts` that handles roadmap listing queries
- **RoadmapPageInput**: GraphQL input type with single object containing category, cursor, and limit fields
- **RoadmapFilters + PaginationInput**: Separate GraphQL input types expected by the current server resolver

## Bug Details

### Bug Condition 1: API Fetch Failure

The bug manifests when the Next.js web application (port 3000) attempts to fetch data from the NestJS API server (port 4000) but the API server is either not running or not accessible. The `executeServerGraphql` function in `graphql-client.ts` tries to connect to `http://localhost:4000/graphql` but receives a network error.

**Formal Specification:**
```
FUNCTION isBugCondition1(context)
  INPUT: context of type { apiServerRunning: boolean, webAppAttemptingFetch: boolean }
  OUTPUT: boolean
  
  RETURN context.webAppAttemptingFetch === true
         AND context.apiServerRunning === false
         AND fetchAttemptThrowsNetworkError()
END FUNCTION
```

### Bug Condition 2: React Hydration Mismatch

The bug manifests when the Clerk `<UserButton />` component is rendered in a Server Component (page.tsx) and React attempts to hydrate it on the client. The server renders one HTML structure while the client expects a different structure, causing React to throw a hydration error and fail to render the page correctly.

**Formal Specification:**
```
FUNCTION isBugCondition2(component)
  INPUT: component of type { name: string, renderContext: 'server' | 'client', isInteractive: boolean }
  OUTPUT: boolean
  
  RETURN component.name === 'UserButton'
         AND component.renderContext === 'server'
         AND component.isInteractive === true
         AND serverHTML !== clientHTML
END FUNCTION
```

### Bug Condition 3: GraphQL Schema Mismatch

The bug manifests when the admin dashboard or homepage calls `getRoadmapsPageServer()` which sends a GraphQL query with a single `input: RoadmapPageInput` parameter, but the server's `listRoadmaps` resolver expects two separate parameters: `filters: RoadmapFilters` and `pagination: PaginationInput`. This causes a 400 Bad Request error.

**Formal Specification:**
```
FUNCTION isBugCondition3(query)
  INPUT: query of type { clientParams: string[], serverParams: string[] }
  OUTPUT: boolean
  
  RETURN query.clientParams === ['input']
         AND query.serverParams === ['filters', 'pagination']
         AND clientParamsStructure !== serverParamsStructure
END FUNCTION
```

### Examples

**Bug 1 Examples:**
- User runs `pnpm dev --filter @viztechstack/web` without starting the API server → fetch fails with `TypeError: fetch failed`
- API server crashes during development → all GraphQL queries fail with network errors
- API server runs on different port (not 4000) → connection refused errors

**Bug 2 Examples:**
- Homepage loads with signed-in user → `<UserButton />` causes hydration error: "Hydration failed because the server rendered HTML didn't match the client"
- Admin dashboard renders with `<UserButton />` in header → React throws hydration mismatch warning
- User navigates between pages → hydration errors persist on every page with UserButton

**Bug 3 Examples:**
- Admin visits `/admin/roadmap` → GraphQL query fails with 400 Bad Request
- Homepage calls `getRoadmapsPageServer({ limit: 24 })` → server rejects query due to parameter mismatch
- Client sends `{ input: { category: 'role', limit: 24 } }` but server expects `{ filters: { category: 'role' }, pagination: { limit: 24 } }` → 400 error

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Fallback error handling when API is unreachable must continue to display "No roadmaps found or Backend is not running yet"
- Legacy `getRoadmaps` query fallback must continue to work for backward compatibility
- Environment variable resolution priority order must remain unchanged
- Vercel production fallback endpoints must continue to work
- Authentication flow for signed-out users must remain unchanged
- Public routes must continue to work without authentication
- Admin role checking and authorization must remain unchanged

**Scope:**
All inputs that do NOT involve the three specific bug conditions should be completely unaffected by this fix. This includes:
- Production deployments where API is always available
- Client-side GraphQL queries (not affected by server-side fetch issues)
- Other Clerk components that don't have hydration issues (SignInButton, SignedIn, SignedOut)
- GraphQL queries that already have matching client-server schemas
- Non-roadmap related API calls

## Hypothesized Root Cause

### Bug 1: API Fetch Failure

Based on the bug description and code analysis, the root cause is:

1. **Development Workflow Issue**: The monorepo requires both `pnpm dev --filter @viztechstack/api` and `pnpm dev --filter @viztechstack/web` to be running simultaneously, but this is not clearly documented or enforced
   - Users may start only the web app without the API server
   - The error message "TypeError: fetch failed" is not user-friendly

2. **Missing Development Checks**: The application doesn't gracefully handle the case where the API server is not running during development
   - No clear error message indicating the API server needs to be started
   - The existing fallback only works after the error is caught, but doesn't prevent the initial error

### Bug 2: React Hydration Mismatch

Based on the bug description and code analysis, the root cause is:

1. **Server-Side Rendering of Interactive Component**: The `<UserButton />` component from Clerk is being rendered in Server Components (page.tsx files) but it's an interactive client component that requires JavaScript
   - Clerk's UserButton likely uses client-side state, event listeners, or browser APIs
   - The server renders a placeholder or different HTML structure than what the client expects

2. **Missing Client Boundary**: The component is not wrapped in a Client Component boundary (no `'use client'` directive)
   - Next.js 13+ App Router requires explicit client boundaries for interactive components
   - Server Components cannot directly render components that use hooks or browser APIs

### Bug 3: GraphQL Schema Mismatch

Based on the bug description and code analysis, the root cause is:

1. **Schema Evolution Inconsistency**: The GraphQL schema defines `RoadmapPageInput` as a single input type, but the resolver was updated to use separate `filters` and `pagination` parameters
   - Client query: `getRoadmapsPage(input: $input)` with `RoadmapPageInput`
   - Server resolver: `listRoadmaps(@Args('filters') filters?, @Args('pagination') pagination?)`
   - The schema file defines both `RoadmapPageInput` (single object) and `RoadmapFilters + PaginationInput` (separate objects)

2. **Incomplete Migration**: It appears the schema was partially migrated from single-input to separate-parameters pattern but the client wasn't updated
   - The resolver signature changed but the client query still uses the old pattern
   - The `RoadmapPageInput` type still exists in the schema but is not used by the resolver

## Correctness Properties

Property 1: Bug Condition 1 - API Server Connectivity

_For any_ development environment where the web application attempts to fetch GraphQL data and the API server is running on port 4000, the fixed system SHALL successfully connect to `http://localhost:4000/graphql` and retrieve data without network errors.

**Validates: Requirements 2.1, 2.2**

Property 2: Bug Condition 2 - Hydration Consistency

_For any_ page that renders the UserButton component, the fixed system SHALL produce matching HTML on both server and client, preventing hydration mismatches and allowing the page to render correctly without React errors.

**Validates: Requirements 2.3, 2.4**

Property 3: Bug Condition 3 - GraphQL Schema Alignment

_For any_ GraphQL query that fetches roadmaps data (homepage or admin dashboard), the fixed system SHALL use a query structure that matches the server resolver's expected parameters, successfully retrieving data without 400 Bad Request errors.

**Validates: Requirements 2.5, 2.6**

Property 4: Preservation - Error Handling and Fallbacks

_For any_ scenario where the API server is unreachable or GraphQL queries fail, the fixed system SHALL produce the same fallback behavior as the original system, displaying appropriate error messages and using legacy query fallbacks where applicable.

**Validates: Requirements 3.1, 3.2, 3.4, 3.5, 3.6**

Property 5: Preservation - Authentication and Authorization

_For any_ user interaction with authentication components (signed-out users, admin role checks), the fixed system SHALL produce the same behavior as the original system, preserving all existing authentication flows and authorization checks.

**Validates: Requirements 3.3, 3.7**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

#### Bug 1: API Fetch Failure

**File**: `apps/web/src/lib/api-client/graphql-client.ts`

**Function**: `executeGraphql`

**Specific Changes**:
1. **Improve Error Messages**: Add more descriptive error messages when fetch fails
   - Catch network errors specifically and provide guidance to start the API server
   - Include the endpoint URL in error messages for debugging

2. **Development Mode Detection**: Add better error handling for development mode
   - Check if error is `ECONNREFUSED` or `fetch failed`
   - Provide actionable error message: "API server not running. Start it with: pnpm dev --filter @viztechstack/api"

**Alternative Approach**: Update documentation and development scripts
- Add a root-level `pnpm dev` command that starts both servers
- Update README with clear instructions on starting both servers
- This is a non-code fix that may be sufficient

#### Bug 2: React Hydration Mismatch

**File**: `apps/web/src/app/page.tsx` and `apps/web/src/app/admin/roadmap/page.tsx`

**Component**: `<UserButton />` usage

**Specific Changes**:
1. **Create Client Component Wrapper**: Create a new client component that wraps UserButton
   - File: `apps/web/src/components/auth/user-button-wrapper.tsx`
   - Add `'use client'` directive at the top
   - Import and re-export UserButton from Clerk

2. **Update Page Components**: Replace direct UserButton imports with the wrapper
   - Import `UserButtonWrapper` instead of `UserButton`
   - This creates a client boundary that prevents SSR hydration issues

**Alternative Approach**: Use dynamic import with `ssr: false`
- Use Next.js `dynamic()` to import UserButton with `{ ssr: false }`
- This prevents server-side rendering of the component entirely
- Trade-off: Slight delay in rendering the button on initial page load

#### Bug 3: GraphQL Schema Mismatch

**Approach A: Update Server Resolver (Recommended)**

**File**: `apps/api/src/modules/roadmap/transport/graphql/resolvers/roadmap.resolver.ts`

**Function**: `listRoadmaps`

**Specific Changes**:
1. **Change Resolver Signature**: Update to accept single `input` parameter
   - Change from: `@Args('filters') filters?, @Args('pagination') pagination?`
   - Change to: `@Args('input', { type: () => RoadmapPageInput, nullable: true }) input?: RoadmapPageInput`

2. **Update Parameter Extraction**: Extract filters and pagination from input object
   - `const category = input?.category`
   - `const limit = input?.limit ?? 24`
   - `const cursor = input?.cursor ?? null`

**Rationale**: This approach maintains backward compatibility with the client and follows the single-input pattern used by other queries.

**Approach B: Update Client Queries (Alternative)**

**File**: `apps/web/src/lib/api-client/roadmaps.ts`

**Constant**: `GET_ROADMAPS_PAGE_QUERY`

**Specific Changes**:
1. **Update GraphQL Query**: Change query to use separate parameters
   - Change from: `getRoadmapsPage(input: $input)`
   - Change to: `listRoadmaps(filters: $filters, pagination: $pagination)`

2. **Update Variables Structure**: Split input into filters and pagination
   - Create separate `filters` and `pagination` variable objects
   - Update TypeScript interfaces to match

**Rationale**: This approach aligns with the current server implementation but requires more client-side changes.

**Recommended Approach**: Approach A (Update Server Resolver) because:
- Minimal changes required (single file)
- Maintains consistency with existing client code
- Follows the pattern already established in the codebase
- Less risk of breaking other parts of the application

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that simulate each bug condition and observe failures on the UNFIXED code to understand the root causes.

**Test Cases**:
1. **API Server Not Running Test**: Start only web app, attempt to fetch roadmaps (will fail with fetch error on unfixed code)
2. **UserButton Hydration Test**: Render page with UserButton, check for hydration errors in console (will fail on unfixed code)
3. **GraphQL Schema Mismatch Test**: Call getRoadmapsPageServer, observe 400 Bad Request error (will fail on unfixed code)
4. **Multiple Endpoints Fallback Test**: Configure multiple endpoints, verify fallback behavior (may work on unfixed code)

**Expected Counterexamples**:
- Bug 1: `TypeError: fetch failed` with `ECONNREFUSED` when API server is not running
- Bug 2: React hydration error: "Hydration failed because the server rendered HTML didn't match the client"
- Bug 3: GraphQL 400 Bad Request with message about unexpected query structure
- Possible causes: network connectivity, SSR/CSR mismatch, schema version mismatch

### Fix Checking

**Goal**: Verify that for all inputs where the bug conditions hold, the fixed functions produce the expected behavior.

**Pseudocode:**
```
FOR ALL context WHERE isBugCondition1(context) DO
  result := executeServerGraphql_fixed(query)
  ASSERT result.success === true OR result.fallbackUsed === true
END FOR

FOR ALL component WHERE isBugCondition2(component) DO
  serverHTML := renderOnServer(component)
  clientHTML := renderOnClient(component)
  ASSERT serverHTML === clientHTML
END FOR

FOR ALL query WHERE isBugCondition3(query) DO
  result := getRoadmapsPageServer_fixed(options)
  ASSERT result.items.length >= 0 AND result.status === 200
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed functions produce the same result as the original functions.

**Pseudocode:**
```
FOR ALL context WHERE NOT isBugCondition1(context) DO
  ASSERT executeServerGraphql_original(query) = executeServerGraphql_fixed(query)
END FOR

FOR ALL component WHERE NOT isBugCondition2(component) DO
  ASSERT renderComponent_original(component) = renderComponent_fixed(component)
END FOR

FOR ALL query WHERE NOT isBugCondition3(query) DO
  ASSERT getRoadmapsPageServer_original(options) = getRoadmapsPageServer_fixed(options)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for non-bug scenarios, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Production API Connectivity Preservation**: Verify production endpoints continue to work after fix
2. **SignInButton Preservation**: Verify SignInButton component continues to render without hydration errors
3. **Other GraphQL Queries Preservation**: Verify getRoadmapBySlug and other queries continue to work
4. **Legacy Fallback Preservation**: Verify legacy getRoadmaps query fallback continues to work
5. **Environment Variable Resolution Preservation**: Verify endpoint resolution priority order remains unchanged

### Unit Tests

- Test `executeServerGraphql` with API server running and not running
- Test `executeServerGraphql` with multiple endpoint fallbacks
- Test UserButton wrapper component renders correctly
- Test `listRoadmaps` resolver with various input combinations
- Test GraphQL query parameter mapping functions
- Test error handling for network failures
- Test hydration consistency for auth components

### Property-Based Tests

- Generate random GraphQL query options and verify successful execution when API is available
- Generate random component render scenarios and verify no hydration mismatches
- Generate random roadmap filter/pagination combinations and verify correct data retrieval
- Test that all non-buggy scenarios produce identical results before and after fix

### Integration Tests

- Test full development workflow: start both servers, fetch data, render pages
- Test homepage rendering with and without API server running
- Test admin dashboard with authenticated user and various query parameters
- Test error fallback behavior when API is unreachable
- Test authentication flow with UserButton in various states (signed in, signed out)
- Test navigation between pages with UserButton to ensure no hydration errors persist

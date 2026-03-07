# Implementation Plan

- [x] 1. Write bug condition exploration tests
  - **Property 1: Bug Condition** - API Fetch Failure, Hydration Mismatch, and Schema Mismatch
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bugs exist
  - **Scoped PBT Approach**: For deterministic bugs, scope properties to concrete failing cases to ensure reproducibility
  - Test implementation details from Bug Conditions in design
  - The test assertions should match the Expected Behavior Properties from design
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bugs exist)
  - Document counterexamples found to understand root causes
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

  - [x] 1.1 Write Bug 1 exploration test - API server not running causes fetch failure
    - Create test file: `apps/web/src/lib/api-client/__tests__/graphql-client-bug.spec.ts`
    - Test that executeServerGraphql throws network error when API server is not accessible
    - Scope property to concrete case: fetch to `http://localhost:4000/graphql` with server not running
    - Assert: throws `TypeError: fetch failed` or `ECONNREFUSED`
    - Run on UNFIXED code - expect FAILURE
    - Document counterexample: specific error message and stack trace
    - _Requirements: 1.1, 1.2_

  - [x] 1.2 Write Bug 2 exploration test - UserButton causes hydration mismatch
    - Create test file: `apps/web/src/components/auth/__tests__/user-button-hydration.spec.tsx`
    - Test that UserButton component causes hydration error when rendered in Server Component
    - Scope property to concrete case: render UserButton with SSR enabled
    - Assert: React throws hydration mismatch error
    - Run on UNFIXED code - expect FAILURE
    - Document counterexample: hydration error message from React
    - _Requirements: 1.3, 1.4_

  - [x] 1.3 Write Bug 3 exploration test - GraphQL schema mismatch
    - Create test file: `apps/web/src/lib/api-client/__tests__/roadmaps-schema-bug.spec.ts`
    - Test that getRoadmapsPageServer fails with 400 Bad Request
    - Scope property to concrete case: call with `{ limit: 24, category: 'role' }`
    - Assert: throws GraphQL error with 400 status
    - Run on UNFIXED code - expect FAILURE
    - Document counterexample: exact error message and response structure
    - _Requirements: 1.5, 1.6_

- [ ] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Error Handling, Fallbacks, and Authentication
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

  - [ ] 2.1 Write preservation test - API unreachable fallback behavior
    - Create test file: `apps/web/src/lib/api-client/__tests__/graphql-client-preservation.spec.ts`
    - Observe: When API is unreachable, fallback message is displayed
    - Write property: for all scenarios where API is unreachable, fallback behavior is triggered
    - Verify test passes on UNFIXED code
    - _Requirements: 3.1, 3.4, 3.5_

  - [ ] 2.2 Write preservation test - Environment variable resolution
    - Observe: Environment variables are resolved in correct priority order
    - Write property: for all valid env configurations, endpoint resolution works correctly
    - Verify test passes on UNFIXED code
    - _Requirements: 3.2, 3.4_

  - [ ] 2.3 Write preservation test - SignInButton renders without hydration errors
    - Create test file: `apps/web/src/components/auth/__tests__/sign-in-button-preservation.spec.tsx`
    - Observe: SignInButton component renders correctly without hydration issues
    - Write property: for all signed-out user scenarios, SignInButton renders without errors
    - Verify test passes on UNFIXED code
    - _Requirements: 3.3_

  - [ ] 2.4 Write preservation test - Legacy getRoadmaps fallback
    - Observe: Legacy getRoadmaps query works as fallback
    - Write property: for all scenarios requiring fallback, legacy query succeeds
    - Verify test passes on UNFIXED code
    - _Requirements: 3.6_

- [-] 3. Fix for runtime errors

  - [x] 3.1 Implement Bug 1 fix - Improve API fetch error handling
    - File: `apps/web/src/lib/api-client/graphql-client.ts`
    - Function: `executeGraphql`
    - Add specific error handling for network failures (ECONNREFUSED, fetch failed)
    - Improve error messages to include endpoint URL and guidance
    - Add development mode detection and actionable error message
    - Suggest command: "API server not running. Start it with: pnpm dev --filter @viztechstack/api"
    - _Bug_Condition: isBugCondition1(context) where context.apiServerRunning === false AND context.webAppAttemptingFetch === true_
    - _Expected_Behavior: Property 1 from design - successful connection or clear error message with guidance_
    - _Preservation: Requirements 3.1, 3.4, 3.5 - fallback behavior and endpoint resolution unchanged_
    - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.4, 3.5_

  - [x] 3.2 Implement Bug 2 fix - Create UserButton client wrapper
    - Create file: `apps/web/src/components/auth/user-button-wrapper.tsx`
    - Add 'use client' directive at top
    - Import UserButton from @clerk/nextjs
    - Re-export as default component
    - Update `apps/web/src/app/page.tsx` to import UserButtonWrapper instead of UserButton
    - Update `apps/web/src/app/admin/roadmap/page.tsx` to import UserButtonWrapper instead of UserButton
    - _Bug_Condition: isBugCondition2(component) where component.name === 'UserButton' AND component.renderContext === 'server' AND serverHTML !== clientHTML_
    - _Expected_Behavior: Property 2 from design - matching HTML on server and client_
    - _Preservation: Requirements 3.3 - SignInButton and other auth components unchanged_
    - _Requirements: 1.3, 1.4, 2.3, 2.4, 3.3_

  - [x] 3.3 Implement Bug 3 fix - Update server resolver to accept input parameter
    - File: `apps/api/src/modules/roadmap/transport/graphql/resolvers/roadmap.resolver.ts`
    - Function: `listRoadmaps`
    - Change resolver signature from `@Args('filters') filters?, @Args('pagination') pagination?` to `@Args('input', { type: () => RoadmapPageInput, nullable: true }) input?: RoadmapPageInput`
    - Extract filters and pagination from input object: `const category = input?.category`, `const limit = input?.limit ?? 24`, `const cursor = input?.cursor ?? null`
    - Update service call to use extracted values
    - _Bug_Condition: isBugCondition3(query) where query.clientParams === ['input'] AND query.serverParams === ['filters', 'pagination']_
    - _Expected_Behavior: Property 3 from design - successful query execution with aligned schema_
    - _Preservation: Requirements 3.6 - legacy getRoadmaps fallback unchanged_
    - _Requirements: 1.5, 1.6, 2.5, 2.6, 3.6_

  - [x] 3.4 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - API Fetch, Hydration, and Schema Alignment
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied
    - Run bug condition exploration tests from step 1
    - **EXPECTED OUTCOME**: Tests PASS (confirms bugs are fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Error Handling, Fallbacks, and Authentication
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [x] 4. Checkpoint - Ensure all tests pass
  - Run all tests: `pnpm test`
  - Verify no TypeScript errors: `pnpm typecheck`
  - Verify no linting errors: `pnpm lint`
  - Test development workflow: start both servers and verify homepage loads
  - Test admin dashboard: verify roadmaps load without errors
  - Ask the user if questions arise

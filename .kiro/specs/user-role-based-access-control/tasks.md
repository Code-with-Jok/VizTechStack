# Implementation Plan: User Role-Based Access Control (Backend)

## Overview

This implementation plan focuses on Phase 1: Backend Implementation of the role-based access control system for roadmap CRUD operations. The backend will be built using NestJS with GraphQL, integrating Clerk for JWT authentication, and using Convex as the database. The implementation follows a test-driven approach with property-based testing using fast-check.

## Tasks

- [x] 1. Set up Convex database schema and functions
  - [x] 1.1 Update Convex schema with roadmap table
    - Add roadmap table definition to `convex/schema.ts`
    - Define indexes for slug, author, and published status
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

  - [x] 1.2 Implement Convex functions for roadmap operations
    - Create `convex/roadmaps.ts` with query and mutation functions
    - Implement list, getBySlug, create, update, and remove functions
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.2, 7.3, 7.4, 7.5_

- [x] 2. Create Convex service wrapper in NestJS
  - [x] 2.1 Implement ConvexService
    - Create `apps/api/src/common/convex/convex.service.ts`
    - Implement query and mutation wrapper methods
    - Add connection initialization with CONVEX_URL
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [x] 3. Implement roadmap domain models and types
  - [x] 3.1 Create domain model interfaces
    - Create `apps/api/src/modules/roadmap/domain/models/roadmap.model.ts`
    - Define Roadmap, CreateRoadmapInput, and UpdateRoadmapInput interfaces
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [x] 4. Implement GraphQL schemas for roadmap
  - [x] 4.1 Create GraphQL object type schema
    - Create `apps/api/src/modules/roadmap/transport/graphql/schemas/roadmap.schema.ts`
    - Define RoadmapSchema with all fields decorated with @Field
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.2, 7.3, 7.4, 7.5_

  - [x] 4.2 Create GraphQL input schemas
    - Create `apps/api/src/modules/roadmap/transport/graphql/schemas/roadmap-input.schema.ts`
    - Define CreateRoadmapInput and UpdateRoadmapInput with @InputType decorators
    - _Requirements: 7.2, 7.4_

- [x] 5. Implement roadmap application service
  - [x] 5.1 Create RoadmapService with CRUD methods
    - Create `apps/api/src/modules/roadmap/application/services/roadmap.service.ts`
    - Implement findAll, findBySlug, create, update, and delete methods
    - Add validation for duplicate slugs and non-existent IDs
    - Add error logging for all operations
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.2, 7.3, 7.4, 7.5, 10.4_

- [x] 6. Implement GraphQL resolver with authorization
  - [x] 6.1 Create RoadmapResolver with queries and mutations
    - Create `apps/api/src/modules/roadmap/transport/graphql/resolvers/roadmap.resolver.ts`
    - Implement roadmaps and roadmap queries with @Public decorator
    - Implement createRoadmap, updateRoadmap, deleteRoadmap mutations with @Roles('admin')
    - Apply ClerkAuthGuard and RolesGuard to resolver
    - Use @CurrentUser decorator to extract user context
    - _Requirements: 1.3, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 7. Configure roadmap module and register in app
  - [x] 7.1 Create RoadmapModule
    - Create `apps/api/src/modules/roadmap/roadmap.module.ts`
    - Register RoadmapResolver, RoadmapService, and ConvexService as providers
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

  - [x] 7.2 Register RoadmapModule in AppModule
    - Update `apps/api/src/app.module.ts` to import RoadmapModule
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

- [x] 8. Checkpoint - Verify basic functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement property-based tests for authentication
  - [x] 9.1 Write property test for JWT token validation
    - **Property 1: JWT Token Validation**
    - **Validates: Requirements 2.2, 8.1**
    - Create `apps/api/src/modules/roadmap/__tests__/properties/auth.properties.spec.ts`
    - Test that any valid Clerk JWT token is successfully verified

  - [x] 9.2 Write property test for role extraction
    - **Property 2: Role Extraction from JWT**
    - **Validates: Requirements 2.3, 8.2**
    - Test that role is correctly extracted from any authenticated request, defaulting to "user"

  - [x] 9.3 Write property test for invalid token rejection
    - **Property 8: Invalid Token Error Response**
    - **Validates: Requirements 8.5**
    - Test that any invalid JWT token is rejected with 401 error

- [x] 10. Implement property-based tests for authorization
  - [x] 10.1 Write property test for public read access
    - **Property 3: Public Read Access**
    - **Validates: Requirements 1.3, 4.1, 4.2, 4.3, 4.4, 5.1, 6.1**
    - Test that any request (authenticated or not) can query roadmaps

  - [x] 10.2 Write property test for unauthenticated write rejection
    - **Property 4: Unauthenticated Write Rejection**
    - **Validates: Requirements 5.2, 8.5**
    - Test that any write operation without authentication is rejected with 401

  - [x] 10.3 Write property test for non-admin write rejection
    - **Property 5: Non-Admin Write Rejection**
    - **Validates: Requirements 6.2, 6.3, 6.4, 8.4**
    - Test that any write operation by non-admin users is rejected with 403

  - [x] 10.4 Write property test for admin full CRUD access
    - **Property 6: Admin Full CRUD Access**
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.5**
    - Test that any CRUD operation by admin users is allowed

  - [x] 10.5 Write property test for authorization check execution
    - **Property 7: Authorization Check Execution**
    - **Validates: Requirements 8.3**
    - Test that both ClerkAuthGuard and RolesGuard execute in sequence for protected mutations

  - [x] 10.6 Write property test for forbidden error response
    - **Property 9: Forbidden Error Response**
    - **Validates: Requirements 8.4, 10.1, 10.2**
    - Test that operations rejected due to insufficient permissions return 403 with clear message

  - [x] 10.7 Write property test for authentication error logging
    - **Property 10: Authentication Error Logging**
    - **Validates: Requirements 10.4**
    - Test that authentication/authorization errors are logged with sufficient context

- [x] 11. Implement property-based tests for CRUD operations
  - [x] 11.1 Write property test for roadmap creation persistence
    - **Property 11: Roadmap Creation Persistence**
    - **Validates: Requirements 7.2**
    - Test that any valid roadmap created by admin can be queried back with matching fields

  - [x] 11.2 Write property test for roadmap update idempotency
    - **Property 12: Roadmap Update Idempotency**
    - **Validates: Requirements 7.4**
    - Test that applying the same update twice produces the same result as applying it once

  - [x] 11.3 Write property test for roadmap deletion completeness
    - **Property 13: Roadmap Deletion Completeness**
    - **Validates: Requirements 7.5**
    - Test that any deleted roadmap becomes unqueryable

- [x] 12. Implement unit tests for RoadmapService
  - [x] 12.1 Write unit tests for create method
    - Create `apps/api/src/modules/roadmap/__tests__/unit/roadmap.service.spec.ts`
    - Test duplicate slug rejection
    - Test empty tags array handling
    - Test author ID assignment
    - _Requirements: 7.2_

  - [x] 12.2 Write unit tests for update method
    - Test non-existent roadmap rejection
    - Test partial updates
    - Test updatedAt timestamp update
    - _Requirements: 7.4_

  - [x] 12.3 Write unit tests for delete method
    - Test non-existent roadmap handling
    - Test successful deletion
    - _Requirements: 7.5_

  - [x] 12.4 Write unit tests for query methods
    - Test findAll returns published roadmaps
    - Test findBySlug with existing and non-existing slugs
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 13. Implement unit tests for RoadmapResolver
  - [x] 13.1 Write unit tests for query resolvers
    - Create `apps/api/src/modules/roadmap/__tests__/unit/roadmap.resolver.spec.ts`
    - Test roadmaps query without authentication
    - Test roadmap query by slug
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 6.1_

  - [x] 13.2 Write unit tests for mutation resolvers
    - Test createRoadmap with admin role
    - Test updateRoadmap with admin role
    - Test deleteRoadmap with admin role
    - Test mutations rejection without admin role
    - _Requirements: 6.2, 6.3, 6.4, 7.2, 7.3, 7.4, 7.5_

- [x] 14. Implement E2E tests for complete workflows
  - [x] 14.1 Write E2E test for full CRUD workflow as admin
    - Create `apps/api/test/e2e/roadmap.e2e-spec.ts`
    - Test complete create → read → update → delete flow
    - Verify data persistence and state changes
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

  - [x] 14.2 Write E2E test for access control scenarios
    - Test guest read access
    - Test user read-only access
    - Test admin full access
    - Test proper error responses for unauthorized attempts
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4, 8.4, 8.5, 10.1, 10.2_

- [x] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check with minimum 100 iterations per property
- All 13 correctness properties from the design document are covered
- Implementation uses TypeScript with NestJS, GraphQL, and Convex
- Guards (ClerkAuthGuard, RolesGuard) and decorators (@Public, @Roles, @CurrentUser) are already implemented and will be reused
- Error messages should be in Vietnamese as per requirements 10.2, 10.3
- All authentication and authorization errors must be logged per requirement 10.4

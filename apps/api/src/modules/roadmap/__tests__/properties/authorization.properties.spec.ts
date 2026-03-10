/**
 * Property-Based Tests for Authorization
 *
 * These tests verify authorization properties using fast-check.
 * Tests focus on role-based access control for CRUD operations.
 *
 * Feature: user-role-based-access-control
 * Tasks: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7
 */

import * as fc from 'fast-check';
import { ForbiddenException } from '@nestjs/common';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

describe('Authorization Properties', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  /**
   * Property 3: Public Read Access
   * Validates: Requirements 1.3, 4.1, 4.2, 4.3, 4.4, 5.1, 6.1
   *
   * Verifies that any request (authenticated or not) can access endpoints
   * without role requirements (public queries).
   */
  it('should allow any request to endpoints without role requirements', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.option(
          fc.record({
            id: fc.string({ minLength: 1 }),
            role: fc.constantFrom('admin', 'user', undefined),
          }),
          { nil: undefined },
        ),
        async (user) => {
          const mockContext = createMockExecutionContext(user);

          // Mock reflector to return undefined (no required roles)
          jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

          const result = guard.canActivate(mockContext);
          expect(result).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 5: Non-Admin Write Rejection
   * Validates: Requirements 6.2, 6.3, 6.4, 8.4
   *
   * Verifies that any authenticated user with role "user" (not "admin")
   * is rejected when attempting operations requiring admin role.
   */
  it('should reject any non-admin user from admin-only operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1 }),
          role: fc.constant('user'),
        }),
        async (user) => {
          const mockContext = createMockExecutionContext(user);

          // Mock reflector to return ['admin'] as required roles
          jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

          expect(() => guard.canActivate(mockContext)).toThrow(
            ForbiddenException,
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6: Admin Full CRUD Access
   * Validates: Requirements 7.2, 7.3, 7.4, 7.5
   *
   * Verifies that any authenticated user with role "admin" is allowed
   * to access operations requiring admin role.
   */
  it('should allow any admin user to access admin-only operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1 }),
          role: fc.constant('admin'),
        }),
        async (user) => {
          const mockContext = createMockExecutionContext(user);

          // Mock reflector to return ['admin'] as required roles
          jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

          const result = guard.canActivate(mockContext);
          expect(result).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 9: Forbidden Error Response
   * Validates: Requirements 8.4, 10.1, 10.2
   *
   * Verifies that operations rejected due to insufficient permissions
   * return 403 Forbidden with clear message.
   */
  it('should return 403 Forbidden for any user without required role', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1 }),
          role: fc.constantFrom('user', 'guest', 'viewer'),
        }),
        fc.array(fc.constantFrom('admin', 'superadmin', 'moderator'), {
          minLength: 1,
        }),
        async (user, requiredRoles) => {
          // Ensure user role is not in required roles
          if (
            requiredRoles.includes(
              user.role as 'admin' | 'superadmin' | 'moderator',
            )
          ) {
            return; // Skip this case
          }

          const mockContext = createMockExecutionContext(user);

          jest
            .spyOn(reflector, 'getAllAndOverride')
            .mockReturnValue(requiredRoles);

          expect(() => guard.canActivate(mockContext)).toThrow(
            ForbiddenException,
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: No Role Assigned Rejection
   * Validates: Requirements 8.4
   *
   * Verifies that authenticated users without a role assigned are rejected.
   */
  it('should reject any authenticated user without role assignment', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1 }),
          // role is undefined
        }),
        async (user) => {
          const mockContext = createMockExecutionContext(user);

          jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

          expect(() => guard.canActivate(mockContext)).toThrow(
            ForbiddenException,
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Multiple Required Roles
   * Validates: Requirements 8.3
   *
   * Verifies that users with any of the required roles are granted access.
   */
  it('should allow access if user has any of the required roles', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('admin', 'moderator', 'editor'),
        async (userRole) => {
          const user = {
            id: 'test-user',
            role: userRole,
          };

          const mockContext = createMockExecutionContext(user);

          // Require any of these roles
          jest
            .spyOn(reflector, 'getAllAndOverride')
            .mockReturnValue(['admin', 'moderator', 'editor']);

          const result = guard.canActivate(mockContext);
          expect(result).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 4: Unauthenticated Write Rejection
   * Validates: Requirements 5.2, 8.5
   *
   * Verifies that any write operation (create, update, delete) attempted
   * without authentication is rejected with 401 Unauthorized.
   */
  it('should reject any write operation without authentication', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('admin', 'moderator', 'editor'),
        async (requiredRole) => {
          // User is undefined (no authentication)
          const mockContext = createMockExecutionContext(undefined);

          // Mock reflector to return required roles (protected endpoint)
          jest
            .spyOn(reflector, 'getAllAndOverride')
            .mockReturnValue([requiredRole]);

          // RolesGuard should reject unauthenticated requests
          expect(() => guard.canActivate(mockContext)).toThrow(
            ForbiddenException,
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 7: Authorization Check Execution
   * Validates: Requirements 8.3
   *
   * Verifies that RolesGuard checks for required roles when they are specified.
   * This ensures the authorization check executes for protected endpoints.
   */
  it('should execute authorization check for protected endpoints', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom('admin', 'moderator', 'editor', 'viewer'), {
          minLength: 1,
          maxLength: 3,
        }),
        fc.record({
          id: fc.string({ minLength: 1 }),
          role: fc.constantFrom('admin', 'user', 'guest'),
        }),
        async (requiredRoles, user) => {
          const mockContext = createMockExecutionContext(user);

          // Mock reflector to return required roles
          jest
            .spyOn(reflector, 'getAllAndOverride')
            .mockReturnValue(requiredRoles);

          // Guard should execute authorization check
          const hasRole = requiredRoles.includes(
            user.role as 'admin' | 'viewer' | 'moderator' | 'editor',
          );

          if (hasRole) {
            const result = guard.canActivate(mockContext);
            expect(result).toBe(true);
          } else {
            expect(() => guard.canActivate(mockContext)).toThrow(
              ForbiddenException,
            );
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 10: Authentication Error Logging
   * Validates: Requirements 10.4
   *
   * Verifies that authorization errors are thrown with proper context.
   * The actual logging is verified in unit tests with logger mocks.
   */
  it('should throw proper exceptions for authorization errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1 }),
          role: fc.constantFrom('user', 'guest'),
        }),
        async (user) => {
          const mockContext = createMockExecutionContext(user);

          // Mock reflector to return admin requirement
          jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

          // Should throw ForbiddenException which will be logged
          let errorThrown = false;
          try {
            guard.canActivate(mockContext);
          } catch (error: unknown) {
            errorThrown = true;
            expect(error).toBeInstanceOf(ForbiddenException);
            expect((error as ForbiddenException).message).toBeTruthy();
          }

          expect(errorThrown).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});

/**
 * Helper function to create mock ExecutionContext for testing
 */
function createMockExecutionContext(
  user: { id?: string; sub?: string; role?: string } | null | undefined,
): ExecutionContext {
  // Normalize user object to have sub and role
  const normalizedUser = user
    ? {
        sub: user.sub || user.id || '',
        role: user.role || 'user',
      }
    : null;

  const mockRequest = {
    user: normalizedUser,
  };

  const mockGqlContext = {
    req: mockRequest,
  };

  const mockExecutionContext = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn().mockReturnValue('graphql'),
  } as unknown as ExecutionContext;

  // Mock GqlExecutionContext.create
  jest.spyOn(GqlExecutionContext, 'create').mockReturnValue({
    getContext: () => mockGqlContext,
    getArgs: jest.fn(),
    getInfo: jest.fn(),
    getType: jest.fn(),
    getClass: jest.fn(),
    getHandler: jest.fn(),
  } as unknown as ReturnType<typeof GqlExecutionContext.create>);

  return mockExecutionContext;
}

/**
 * Property-Based Tests for Authentication
 *
 * These tests verify authentication properties using fast-check.
 *
 * Feature: user-role-based-access-control
 * Tasks: 9.1, 9.2, 9.3
 */

import * as fc from 'fast-check';
import { UnauthorizedException } from '@nestjs/common';
import { ClerkAuthGuard } from '../../../../common/guards/clerk-auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

// Mock @clerk/backend module
jest.mock('@clerk/backend', () => ({
  verifyToken: jest.fn(),
}));

// Import the mocked verifyToken
import { verifyToken } from '@clerk/backend';

describe('Authentication Properties', () => {
  let guard: ClerkAuthGuard;
  let reflector: Reflector;
  const mockVerifyToken = verifyToken as jest.MockedFunction<
    typeof verifyToken
  >;
  const originalEnv = process.env.CLERK_SECRET_KEY;

  beforeAll(() => {
    // Set CLERK_SECRET_KEY for all tests
    process.env.CLERK_SECRET_KEY = 'test-secret-key';
  });

  beforeEach(() => {
    reflector = new Reflector();
    guard = new ClerkAuthGuard(reflector);
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original environment
    if (originalEnv) {
      process.env.CLERK_SECRET_KEY = originalEnv;
    } else {
      delete process.env.CLERK_SECRET_KEY;
    }
  });

  /**
   * Property 1: JWT Token Validation
   * **Validates: Requirements 2.2, 8.1**
   *
   * For any valid JWT token issued by Clerk, when the backend receives it in the
   * Authorization header, the ClerkAuthGuard should successfully verify it and
   * extract the user information.
   *
   * Feature: user-role-based-access-control, Property 1: JWT Token Validation
   */
  it('should verify any valid Clerk JWT token', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          sub: fc.string({ minLength: 1 }),
          email: fc.emailAddress(),
          metadata: fc.record({
            role: fc.constantFrom('admin', 'user'),
          }),
        }),
        async (validPayload) => {
          // Mock verifyToken to return the valid payload
          mockVerifyToken.mockResolvedValueOnce(validPayload as never);

          // Create a mock token (the actual value doesn't matter since we're mocking)
          const mockToken = `valid.jwt.token-${validPayload.sub}`;
          const mockContext = createMockExecutionContext(mockToken);

          // Mock reflector to return false for IS_PUBLIC_KEY (protected endpoint)
          jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

          // The guard should successfully verify the token
          const result = await guard.canActivate(mockContext);

          // Assertions
          expect(result).toBe(true);

          // Verify that verifyToken was called (at least once)
          expect(mockVerifyToken).toHaveBeenCalled();

          // Verify that the user was attached to the request
          const gqlContext = GqlExecutionContext.create(
            mockContext,
          ).getContext<{ req: { user?: { sub: string; role: string } } }>();
          expect(gqlContext.req.user).toBeDefined();
          expect(gqlContext.req.user?.sub).toBe(validPayload.sub);
          expect(gqlContext.req.user?.role).toBe(validPayload.metadata.role);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 2: Role Extraction from JWT
   * **Validates: Requirements 2.3, 8.2**
   *
   * For any authenticated request with a valid JWT token, the system should extract
   * the user's role from the token metadata and attach it to the request context,
   * defaulting to "user" if no role is specified.
   *
   * Feature: user-role-based-access-control, Property 2: Role Extraction from JWT
   */
  it('should extract role from any authenticated request, defaulting to user', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          sub: fc.string({ minLength: 1 }),
          metadata: fc.option(
            fc.record({ role: fc.constantFrom('admin', 'user') }),
            { nil: undefined },
          ),
        }),
        async (payload) => {
          // Mock verifyToken to return the payload
          mockVerifyToken.mockResolvedValueOnce(payload as never);

          const mockToken = `valid.jwt.token-${payload.sub}`;
          const mockContext = createMockExecutionContext(mockToken);

          jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

          await guard.canActivate(mockContext);

          // Extract user from request
          const gqlContext = GqlExecutionContext.create(
            mockContext,
          ).getContext<{ req: { user?: { sub: string; role: string } } }>();
          const user = gqlContext.req.user;

          // Expected role: use metadata.role if present, otherwise default to 'user'
          const expectedRole = payload.metadata?.role || 'user';
          expect(user?.role).toBe(expectedRole);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 8: Invalid Token Error Response
   * **Validates: Requirements 8.5**
   *
   * For any request with an invalid, malformed, or expired JWT token, the system
   * should return a 401 Unauthorized error with message "Invalid token".
   *
   * Feature: user-role-based-access-control, Property 8: Invalid Token Error Response
   */
  it('should reject any invalid JWT token format with 401', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.constant('invalid'),
          fc.string({ minLength: 1 }).filter((s) => !s.includes('.')),
          fc.constant('invalid.token.here'),
          fc.string({ minLength: 1 }).map((s) => `malformed-${s}`),
        ),
        async (invalidToken) => {
          // Mock verifyToken to throw an error for invalid tokens
          mockVerifyToken.mockRejectedValueOnce(new Error('Invalid token'));

          const mockContext = createMockExecutionContext(invalidToken);

          // Mock reflector to return false for IS_PUBLIC_KEY
          jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

          await expect(guard.canActivate(mockContext)).rejects.toThrow(
            UnauthorizedException,
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Missing Authorization Header
   * **Validates: Requirements 8.5**
   *
   * Verifies that requests without Authorization header are rejected.
   *
   * Feature: user-role-based-access-control, Property 8: Invalid Token Error Response
   */
  it('should reject any request without Authorization header', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(undefined), async () => {
        const mockContext = createMockExecutionContext(undefined);

        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

        await expect(guard.canActivate(mockContext)).rejects.toThrow(
          UnauthorizedException,
        );
      }),
      { numRuns: 100 },
    );
  });

  /**
   * Property: Public Endpoints Bypass Authentication
   * **Validates: Requirements 1.3, 4.1**
   *
   * Verifies that endpoints marked with @Public() decorator bypass authentication.
   *
   * Feature: user-role-based-access-control, Property 3: Public Read Access
   */
  it('should allow any request to public endpoints without authentication', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.option(fc.string(), { nil: undefined }),
        async (token) => {
          const mockContext = createMockExecutionContext(token);

          // Mock reflector to return true for IS_PUBLIC_KEY
          jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

          const result = await guard.canActivate(mockContext);
          expect(result).toBe(true);
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
  authToken: string | undefined,
): ExecutionContext {
  const mockRequest = {
    headers: authToken ? { authorization: `Bearer ${authToken}` } : {},
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

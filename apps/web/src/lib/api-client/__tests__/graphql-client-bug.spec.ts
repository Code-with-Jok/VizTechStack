/**
 * Bug Condition 1 Exploration Test
 * 
 * This test explores Bug Condition 1: API server not running causes fetch failure.
 * 
 * **Validates: Requirements 1.1, 1.2**
 * 
 * EXPECTED BEHAVIOR ON UNFIXED CODE:
 * This test MUST FAIL on unfixed code to confirm the bug exists.
 * The failure proves that error messages lack endpoint information and actionable guidance.
 * 
 * Test Strategy:
 * - Attempt to execute a GraphQL query against http://localhost:4000/graphql
 * - Assume the API server is NOT running (manual setup required)
 * - Assert that error messages include endpoint URL and actionable guidance
 * - Document the specific error message and stack trace as counterexample
 */

import { executeServerGraphql, GraphqlRequestError } from '../graphql-client';

describe('Bug Condition 1: API Server Not Running', () => {
    // Set NODE_ENV to development for these tests
    const originalEnv = process.env.NODE_ENV;

    beforeAll(() => {
        Object.defineProperty(process.env, 'NODE_ENV', {
            value: 'development',
            writable: true,
            configurable: true,
        });
    });

    afterAll(() => {
        Object.defineProperty(process.env, 'NODE_ENV', {
            value: originalEnv,
            writable: true,
            configurable: true,
        });
    });

    /**
     * Property Test: Error Message Quality on Unreachable API Server
     * 
     * For any GraphQL query executed when the API server is not running at
     * http://localhost:4000/graphql, the system should throw an error with:
     * 1. The specific endpoint that failed (localhost:4000)
     * 2. Actionable guidance to start the API server
     * 
     * EXPECTED ON UNFIXED CODE:
     * This test SHOULD FAIL because the error message does not provide
     * endpoint information or actionable guidance.
     */
    it('should throw error with endpoint information and actionable guidance', async () => {
        // Arrange: Simple GraphQL query to fetch roadmaps
        const query = `
      query GetRoadmaps {
        getRoadmaps {
          items {
            id
            title
          }
        }
      }
    `;

        // Act & Assert: Attempt to execute query and capture error
        try {
            await executeServerGraphql({
                query,
                variables: undefined,
            });

            // If we reach here, the test should fail because no error was thrown
            fail('Expected executeServerGraphql to throw an error, but it succeeded');
        } catch (error) {
            // Document the counterexample: specific error type and message
            console.log('\n=== COUNTEREXAMPLE FOUND ===');
            console.log('Error type:', error instanceof Error ? error.constructor.name : typeof error);
            console.log('Error message:', error instanceof Error ? error.message : String(error));
            console.log('Error cause:', error instanceof Error && 'cause' in error ? error.cause : 'N/A');

            // Assert error is thrown
            expect(error).toBeInstanceOf(Error);

            if (error instanceof Error) {
                // BUG CONDITION 1: The error message should include the endpoint URL
                // This assertion SHOULD FAIL on unfixed code
                const hasEndpointInfo = error.message.includes('localhost:4000') ||
                    error.message.includes('http://localhost:4000/graphql');

                console.log('\nBug Check 1 - Has endpoint in error:', hasEndpointInfo);
                console.log('Expected: true (error should mention localhost:4000)');
                console.log('Actual:', hasEndpointInfo);

                // BUG CONDITION 2: The error message should provide actionable guidance
                // This assertion SHOULD FAIL on unfixed code
                const hasActionableGuidance = error.message.includes('start') ||
                    error.message.includes('running') ||
                    error.message.includes('pnpm dev') ||
                    error.message.includes('API server');

                console.log('\nBug Check 2 - Has actionable guidance:', hasActionableGuidance);
                console.log('Expected: true (error should tell user to start API server)');
                console.log('Actual:', hasActionableGuidance);
                console.log('===========================\n');

                // These assertions document the bug - they SHOULD FAIL on unfixed code
                expect(hasEndpointInfo).toBe(true);
                expect(hasActionableGuidance).toBe(true);
            }
        }
    });

    /**
     * Additional Test: Verify Network Error is Thrown
     * 
     * This test confirms that a network error occurs when the API server is not running.
     * This should pass even on unfixed code, confirming the bug condition exists.
     */
    it('should throw network-related error when API server is not accessible', async () => {
        const query = `
      query GetRoadmaps {
        getRoadmaps {
          items {
            id
          }
        }
      }
    `;

        // This should throw an error
        await expect(
            executeServerGraphql({
                query,
                variables: undefined,
            })
        ).rejects.toThrow();

        // Verify it's a network-related error
        try {
            await executeServerGraphql({
                query,
                variables: undefined,
            });
            fail('Expected error to be thrown');
        } catch (error) {
            expect(error).toBeInstanceOf(Error);

            if (error instanceof Error) {
                // Should be some kind of network or GraphQL error
                const isRelevantError =
                    error instanceof GraphqlRequestError ||
                    error.constructor.name === 'TypeError' ||
                    error.message.includes('fetch') ||
                    error.message.includes('ECONNREFUSED') ||
                    error.message.includes('endpoints');

                expect(isRelevantError).toBe(true);
            }
        }
    });
});

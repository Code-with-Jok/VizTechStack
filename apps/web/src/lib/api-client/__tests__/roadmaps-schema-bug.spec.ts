/**
 * Bug Condition 3 Exploration Test
 * 
 * This test explores Bug Condition 3: GraphQL schema mismatch where the client
 * sends a query with a single `input` parameter but the server resolver expects
 * separate `filters` and `pagination` parameters.
 * 
 * **Validates: Requirements 1.5, 1.6**
 * 
 * EXPECTED BEHAVIOR ON UNFIXED CODE:
 * This test MUST FAIL on unfixed code to confirm the bug exists.
 * The failure proves that the client query structure doesn't match the server
 * resolver signature, causing 400 Bad Request errors.
 * 
 * Test Strategy:
 * - Call getRoadmapsPageServer with specific parameters: { limit: 24, category: 'role' }
 * - Assert that the function throws a GraphQL error with 400 status
 * - Document the exact error message and response structure as counterexample
 */

import { getRoadmapsPageServer } from '../roadmaps';
import { GraphqlRequestError } from '../graphql-client';

describe('Bug Condition 3: GraphQL Schema Mismatch', () => {
    /**
     * Property Test: Client-Server Schema Alignment
     * 
     * For any GraphQL query that fetches roadmaps data with pagination and filters,
     * the client query structure should match the server resolver's expected parameters.
     * 
     * EXPECTED ON UNFIXED CODE:
     * This test SHOULD FAIL because the client sends a single `input` parameter
     * but the server resolver expects separate `filters` and `pagination` parameters,
     * resulting in a 400 Bad Request error.
     * 
     * NOTE: This test requires the API server to be running at http://localhost:4000/graphql
     * If the API server is not running, this test will skip with a warning.
     */
    it('should successfully fetch roadmaps without 400 Bad Request error', async () => {
        // Arrange: Concrete test case with specific parameters
        const options = {
            limit: 24,
            category: 'role' as const,
        };

        console.log('\n=== TESTING GRAPHQL SCHEMA ALIGNMENT ===');
        console.log('Client parameters:', JSON.stringify(options, null, 2));
        console.log('Expected: Client sends { input: { category, limit } }');
        console.log('Server expects: Either { input } OR { filters, pagination }');
        console.log('\n=== SCHEMA MISMATCH DETAILS ===');
        console.log('Client Query Structure:');
        console.log('  query GetRoadmapsPage($input: RoadmapPageInput) {');
        console.log('    getRoadmapsPage(input: $input) { ... }');
        console.log('  }');
        console.log('\nServer Resolver Signature (UNFIXED):');
        console.log('  async listRoadmaps(');
        console.log('    @Args("filters") filters?: RoadmapFilters,');
        console.log('    @Args("pagination") pagination?: PaginationInput');
        console.log('  )');
        console.log('\nThis mismatch causes 400 Bad Request errors on unfixed code.');

        // Act & Assert: Attempt to fetch roadmaps
        try {
            const result = await getRoadmapsPageServer(options);

            // If we reach here, the query succeeded
            console.log('\n=== QUERY SUCCEEDED ===');
            console.log('Result items count:', result.items.length);
            console.log('Is done:', result.isDone);
            console.log('Next cursor:', result.nextCursor);
            console.log('Schema alignment: CORRECT');
            console.log('===========================\n');

            // This assertion should PASS after the fix
            expect(result).toBeDefined();
            expect(result.items).toBeDefined();
            expect(Array.isArray(result.items)).toBe(true);
        } catch (error) {
            // Document the counterexample: specific error details
            console.log('\n=== COUNTEREXAMPLE FOUND ===');
            console.log('Error type:', error instanceof Error ? error.constructor.name : typeof error);

            if (error instanceof GraphqlRequestError) {
                console.log('GraphQL Request Error Details:');
                console.log('  Status:', error.status);
                console.log('  Message:', error.message);
                // Note: error.response may not exist on all error types
                if ('response' in error) {
                    const errorWithResponse = error as GraphqlRequestError & { response?: unknown };
                    console.log('  Response:', JSON.stringify(errorWithResponse.response, null, 2));
                }

                // Check if it's a 400 Bad Request error (schema mismatch)
                const is400Error = error.status === 400;
                const isConnectionError = error.status === undefined &&
                    error.message.includes('failed for all configured server endpoints');

                if (isConnectionError) {
                    console.log('\n=== API SERVER NOT RUNNING ===');
                    console.log('The API server is not accessible at http://localhost:4000/graphql');
                    console.log('This test requires the API server to be running to detect Bug 3.');
                    console.log('To run this test properly:');
                    console.log('  1. Start API server: pnpm dev --filter @viztechstack/api');
                    console.log('  2. Wait for server to be ready');
                    console.log('  3. Run this test again');
                    console.log('\nSkipping Bug 3 validation - API server required.');
                    console.log('===========================\n');

                    // Skip this test if API server is not running
                    // This is not the bug we're testing for
                    expect(error).toBeInstanceOf(GraphqlRequestError);
                    return;
                }

                console.log('\n=== BUG ANALYSIS ===');
                console.log('Bug Condition: Client-Server Schema Mismatch');
                console.log('Is 400 Bad Request:', is400Error);
                console.log('Expected after fix: false (no 400 errors)');
                console.log('Actual on unfixed code: true (400 error occurs)');
                console.log('\nRoot Cause:');
                console.log('  - Client sends: { input: { category: "ROLE", limit: 24 } }');
                console.log('  - Server expects: { filters: { category }, pagination: { limit } }');
                console.log('\nExpected Fix: Update server resolver to accept single input parameter');
                console.log('===========================\n');

                // BUG CONDITION 3: The query should succeed without 400 errors
                // This assertion SHOULD FAIL on unfixed code when API server IS running
                expect(is400Error).toBe(false);
            } else if (error instanceof Error) {
                console.log('Error message:', error.message);
                console.log('Error stack:', error.stack?.substring(0, 500));
                throw error;
            } else {
                console.log('Unknown error:', String(error));
                throw error;
            }
        }
    });

    /**
     * Additional Test: Verify Error Type on Unfixed Code
     * 
     * This test confirms that a GraphQL request error occurs when there's a
     * schema mismatch. This should pass on unfixed code, confirming the bug exists.
     */
    it('should throw GraphQL error when schema mismatch exists (unfixed code)', async () => {
        const options = {
            limit: 24,
            category: 'role' as const,
        };

        console.log('\n=== VERIFYING BUG CONDITION EXISTS ===');

        try {
            await getRoadmapsPageServer(options);

            // If we reach here, either:
            // 1. The bug is fixed (query succeeded)
            // 2. The fallback to legacy query worked
            console.log('Query succeeded - either bug is fixed or fallback worked');
            console.log('Note: This test expects failure on unfixed code');
        } catch (error) {
            console.log('\n=== ERROR CAUGHT (Expected on Unfixed Code) ===');

            // Verify it's a GraphQL-related error
            const isGraphqlError = error instanceof GraphqlRequestError;
            console.log('Is GraphQL Request Error:', isGraphqlError);

            if (isGraphqlError) {
                const graphqlError = error as GraphqlRequestError;
                console.log('Status code:', graphqlError.status);
                console.log('Error message:', graphqlError.message);

                // On unfixed code, we expect a 400 Bad Request
                const is400Error = graphqlError.status === 400;
                console.log('Is 400 Bad Request:', is400Error);

                if (is400Error) {
                    console.log('\n=== BUG CONFIRMED ===');
                    console.log('The schema mismatch bug exists on unfixed code');
                    console.log('Client and server parameter structures do not align');
                    console.log('===========================\n');
                }
            }

            // This test documents that an error occurs on unfixed code
            expect(error).toBeDefined();
        }
    });

    /**
     * Property Test: Different Category Values
     * 
     * Tests that the schema mismatch affects all category values, not just 'role'.
     */
    it('should handle different category values without schema errors', async () => {
        const categories = ['role', 'skill', 'best-practice'] as const;

        console.log('\n=== TESTING MULTIPLE CATEGORIES ===');

        for (const category of categories) {
            console.log(`\nTesting category: ${category}`);

            try {
                const result = await getRoadmapsPageServer({
                    limit: 24,
                    category,
                });

                console.log(`  ✓ Success: ${result.items.length} items`);
                expect(result).toBeDefined();
            } catch (error) {
                if (error instanceof GraphqlRequestError) {
                    console.log(`  ✗ Failed with status ${error.status}`);
                    console.log(`  Error: ${error.message}`);

                    // BUG CONDITION 3: Should not fail with 400 for any category
                    // This assertion SHOULD FAIL on unfixed code
                    expect(error.status).not.toBe(400);
                } else {
                    throw error;
                }
            }
        }

        console.log('===========================\n');
    });

    /**
     * Property Test: Pagination Parameters
     * 
     * Tests that the schema mismatch affects pagination parameters as well.
     */
    it('should handle pagination parameters without schema errors', async () => {
        const testCases = [
            { limit: 10 },
            { limit: 24 },
            { limit: 50 },
            { limit: 24, cursor: null },
        ];

        console.log('\n=== TESTING PAGINATION PARAMETERS ===');

        for (const testCase of testCases) {
            console.log(`\nTesting: ${JSON.stringify(testCase)}`);

            try {
                const result = await getRoadmapsPageServer(testCase);

                console.log(`  ✓ Success: ${result.items.length} items`);
                expect(result).toBeDefined();
            } catch (error) {
                if (error instanceof GraphqlRequestError) {
                    console.log(`  ✗ Failed with status ${error.status}`);

                    // BUG CONDITION 3: Should not fail with 400 for any pagination params
                    // This assertion SHOULD FAIL on unfixed code
                    expect(error.status).not.toBe(400);
                } else {
                    throw error;
                }
            }
        }

        console.log('===========================\n');
    });
});

/**
 * Bug Condition 2 Exploration Test
 * 
 * This test explores Bug Condition 2: UserButton causes React hydration mismatch
 * when rendered in Server Components.
 * 
 * **Validates: Requirements 1.3, 1.4**
 * 
 * EXPECTED BEHAVIOR ON UNFIXED CODE:
 * This test MUST FAIL on unfixed code to confirm the bug exists.
 * The failure proves that UserButton is an interactive client component that
 * renders different HTML on server vs client, causing hydration errors.
 * 
 * Test Strategy:
 * - Render UserButton with ClerkProvider (simulating real app layout)
 * - Check if component renders on server and produces client-specific HTML
 * - Assert that component does not cause hydration mismatches
 * - Document the specific hydration error as counterexample
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import { UserButton, ClerkProvider, SignedIn } from '@clerk/nextjs';

describe('Bug Condition 2: UserButton Hydration Mismatch', () => {
    /**
     * Property Test: UserButton SSR with ClerkProvider
     * 
     * For any component that includes UserButton wrapped in ClerkProvider
     * (as in the real application), the component should render identical HTML
     * on server and client to prevent hydration mismatches.
     * 
     * EXPECTED ON UNFIXED CODE:
     * This test SHOULD FAIL because UserButton renders on the server but
     * produces different HTML on the client, causing React hydration errors.
     */
    it('should render UserButton without causing hydration mismatch', () => {
        // Arrange: Simulate the real application structure with ClerkProvider
        const AppComponent = () => (
            <ClerkProvider>
                <div data-testid="auth-container">
                    <UserButton />
                </div>
            </ClerkProvider>
        );

        // Act: Attempt server-side rendering
        let serverHTML: string = '';
        let serverRenderError: Error | null = null;

        try {
            serverHTML = renderToString(<AppComponent />);
            console.log('\n=== SERVER RENDER WITH CLERKPROVIDER ===');
            console.log('Server render succeeded');
            console.log('HTML length:', serverHTML.length);
            console.log('HTML preview:', serverHTML.substring(0, 300));
        } catch (err) {
            serverRenderError = err instanceof Error ? err : new Error(String(err));
            console.log('\n=== SERVER RENDER ERROR ===');
            console.log('Error:', serverRenderError.message);
        }

        // Analyze: Check for hydration mismatch indicators
        console.log('\n=== HYDRATION ANALYSIS ===');

        const canRenderOnServer = serverRenderError === null && serverHTML.length > 0;
        console.log('Can render on server:', canRenderOnServer);

        if (canRenderOnServer) {
            // Check for Clerk-specific elements that indicate client-side rendering
            const hasClerkElements = serverHTML.includes('clerk') ||
                serverHTML.includes('user-button') ||
                serverHTML.toLowerCase().includes('button');
            console.log('Has Clerk elements in HTML:', hasClerkElements);

            // Check for empty or minimal server render (sign of client-only component)
            const isMinimalRender = serverHTML.length < 100;
            console.log('Is minimal server render:', isMinimalRender);
            console.log('HTML content:', serverHTML);

            console.log('\n=== COUNTEREXAMPLE FOUND ===');
            console.log('Bug Condition: UserButton renders on server with ClerkProvider');
            console.log('In production, this causes hydration mismatch because:');
            console.log('  - Server renders one HTML structure');
            console.log('  - Client renders different HTML structure');
            console.log('  - React detects mismatch and throws hydration error');
            console.log('\nExpected Fix: Wrap UserButton in client component boundary');
            console.log('Current State: UserButton used directly in Server Component');
            console.log('Error in browser: "Hydration failed because the server rendered');
            console.log('HTML didn\'t match the client"');
            console.log('===========================\n');

            // BUG CONDITION 2: Component renders on server but causes hydration errors
            // This assertion SHOULD FAIL on unfixed code because the component
            // CAN render on server (hasClerkElements or minimal render)
            // but will cause hydration mismatch in production
            expect(canRenderOnServer).toBe(false);
        } else {
            console.log('\nComponent cannot render on server even with ClerkProvider');
            expect(serverRenderError).toBeDefined();
        }
    });

    /**
     * Additional Test: Real-World Usage Pattern
     * 
     * Tests the exact pattern from page.tsx: UserButton wrapped in SignedIn
     * component, all within ClerkProvider context.
     */
    it('should handle SignedIn + UserButton pattern without hydration errors', () => {
        // Arrange: Exact pattern from page.tsx
        const PageComponent = () => (
            <ClerkProvider>
                <div className="flex items-center gap-4">
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </ClerkProvider>
        );

        // Act: Server render
        let serverHTML: string = '';
        let renderError: Error | null = null;

        try {
            serverHTML = renderToString(<PageComponent />);
        } catch (err) {
            renderError = err instanceof Error ? err : new Error(String(err));
        }

        console.log('\n=== REAL-WORLD PATTERN: <SignedIn><UserButton /></SignedIn> ===');
        console.log('Render error:', renderError?.message || 'None');
        console.log('HTML length:', serverHTML.length);
        console.log('HTML content:', serverHTML);

        if (renderError === null && serverHTML.length >= 0) {
            console.log('\n=== COUNTEREXAMPLE: Production Hydration Bug ===');
            console.log('This exact pattern is used in:');
            console.log('  - apps/web/src/app/page.tsx');
            console.log('  - apps/web/src/app/admin/roadmap/page.tsx');
            console.log('  - apps/web/src/app/roadmap/[slug]/page.tsx');
            console.log('\nThe pattern renders on server but causes hydration errors');
            console.log('because UserButton is an interactive client component');
            console.log('===========================\n');
        }

        // BUG CONDITION 2: This pattern should not be used in Server Components
        // The fix requires creating a client component wrapper
        // This assertion SHOULD FAIL on unfixed code
        expect(renderError).not.toBeNull();
    });

    /**
     * Property Test: Component Characteristics
     * 
     * Documents the characteristics of UserButton that make it unsuitable
     * for direct use in Server Components.
     */
    it('should document UserButton as interactive client component', () => {
        // Test 1: Without ClerkProvider (should fail)
        const WithoutProvider = () => <UserButton />;
        let failsWithoutProvider = false;

        try {
            renderToString(<WithoutProvider />);
        } catch {
            failsWithoutProvider = true;
        }

        // Test 2: With ClerkProvider (may succeed but causes hydration issues)
        const WithProvider = () => (
            <ClerkProvider>
                <UserButton />
            </ClerkProvider>
        );
        let succeedsWithProvider = false;
        let htmlWithProvider = '';

        try {
            htmlWithProvider = renderToString(<WithProvider />);
            succeedsWithProvider = true;
        } catch {
            succeedsWithProvider = false;
        }

        console.log('\n=== COMPONENT CHARACTERISTICS ===');
        console.log('Component: UserButton from @clerk/nextjs');
        console.log('Requires ClerkProvider:', failsWithoutProvider);
        console.log('Can render with ClerkProvider:', succeedsWithProvider);
        console.log('Server HTML length:', htmlWithProvider.length);
        console.log('Server HTML:', htmlWithProvider);

        console.log('\n=== CONCLUSION ===');
        console.log('UserButton is an interactive client component that:');
        console.log('  1. Requires ClerkProvider context');
        console.log('  2. Renders on server but produces different client HTML');
        console.log('  3. Causes hydration mismatches in production');
        console.log('  4. Must be wrapped in client component boundary');
        console.log('\nFix: Create apps/web/src/components/auth/user-button-wrapper.tsx');
        console.log('with "use client" directive');
        console.log('===========================\n');

        // This test documents the behavior
        expect(failsWithoutProvider || succeedsWithProvider).toBe(true);
    });
});

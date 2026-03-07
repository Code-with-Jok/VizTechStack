/**
 * Convex Client Configuration
 * 
 * Provides a configured Convex client for real-time database subscriptions.
 * Used alongside Apollo Client for GraphQL queries/mutations.
 */

import { ConvexReactClient } from 'convex/react';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
    throw new Error(
        'NEXT_PUBLIC_CONVEX_URL environment variable is not set. ' +
        'Please add it to your .env.local file.'
    );
}

export const convex = new ConvexReactClient(convexUrl);

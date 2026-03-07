'use client';

/**
 * Client-side Providers
 * 
 * Wraps all client-side providers (Apollo, Convex, Tooltip) that use React Context.
 * This component must be a Client Component due to createContext usage.
 * 
 * Apollo Client is configured with Clerk authentication to automatically
 * attach JWT tokens to GraphQL requests.
 */

import { useMemo } from 'react';
import { ApolloProvider } from '@apollo/client';
import { useAuth } from '@clerk/nextjs';
import { ConvexProvider } from 'convex/react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { convex } from '@/lib/convex';
import { createApolloClient } from '@viztechstack/api-client';

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    const { getToken } = useAuth();

    // Create Apollo Client with Clerk token provider
    const apolloClient = useMemo(() => {
        return createApolloClient(
            process.env.NEXT_PUBLIC_GRAPHQL_URL,
            async () => {
                try {
                    return await getToken();
                } catch (error) {
                    console.error('Failed to get Clerk token:', error);
                    return null;
                }
            }
        );
    }, [getToken]);

    return (
        <ApolloProvider client={apolloClient}>
            <ConvexProvider client={convex}>
                <TooltipProvider>{children}</TooltipProvider>
            </ConvexProvider>
        </ApolloProvider>
    );
}

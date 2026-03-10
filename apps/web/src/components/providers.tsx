"use client";

import { ApolloProvider } from '@apollo/client';
import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { createApolloClient } from '@/lib/apollo/client';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const { getToken } = useAuth();

  const apolloClient = useMemo(() => {
    return createApolloClient({
      getToken: async () => {
        try {
          // Call getToken without template parameter to avoid "No JWT template exists with name: default" error
          // This ensures compatibility with Clerk's default JWT configuration
          const token = await getToken();
          return token;
        } catch (error) {
          console.error('Failed to get JWT token:', error);
          // Return null to allow GraphQL operations to proceed without authentication
          // Public operations will still work, protected operations will be handled by backend guards
          return null;
        }
      },
    });
  }, [getToken]);

  return (
    <ApolloProvider client={apolloClient}>
      <TooltipProvider>{children}</TooltipProvider>
    </ApolloProvider>
  );
}

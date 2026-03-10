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
      getToken: () => getToken(),
    });
  }, [getToken]);

  return (
    <ApolloProvider client={apolloClient}>
      <TooltipProvider>{children}</TooltipProvider>
    </ApolloProvider>
  );
}

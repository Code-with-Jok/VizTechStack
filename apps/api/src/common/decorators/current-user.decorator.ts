import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { GraphQLContext } from '../guards/roles.guard';

export interface CurrentUserData {
  id: string;
  role?: string;
}

/**
 * Decorator to extract the current user from the GraphQL context
 * Use with @UseGuards(ClerkAuthGuard) to ensure user is authenticated
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext): CurrentUserData | null => {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<GraphQLContext>();
    return gqlContext.req?.user ?? null;
  },
);

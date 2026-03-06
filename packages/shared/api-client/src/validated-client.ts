import { ApolloClient, ApolloQueryResult, FetchResult } from '@apollo/client';
import { z } from 'zod';
import { handleValidationError } from '@viztechstack/validation';

/**
 * Validated GraphQL Client
 * Wraps Apollo Client with runtime validation using Zod
 */
export class ValidatedGraphQLClient {
  constructor(private client: ApolloClient<any>) {}

  /**
   * Execute query with runtime validation
   * @param options - Query options with schema for validation
   * @returns Validated query result
   * @throws ValidationError if response doesn't match schema
   */
  async query<TData, TVariables extends Record<string, any>, TSchema extends z.ZodType<TData>>(
    options: {
      query: any;
      variables?: TVariables;
      schema: TSchema;
      context?: any;
    }
  ): Promise<z.infer<TSchema>> {
    try {
      // Execute GraphQL query
      const result: ApolloQueryResult<TData> = await this.client.query({
        query: options.query,
        variables: options.variables as any,
        context: options.context,
      });

      // Validate response with Zod
      const validated = options.schema.parse(result.data);

      return validated;
    } catch (error) {
      throw handleValidationError(error);
    }
  }

  /**
   * Execute mutation with runtime validation
   * @param options - Mutation options with schema for validation
   * @returns Validated mutation result
   * @throws ValidationError if response doesn't match schema
   */
  async mutate<TData, TVariables extends Record<string, any>, TSchema extends z.ZodType<TData>>(
    options: {
      mutation: any;
      variables?: TVariables;
      schema: TSchema;
      context?: any;
    }
  ): Promise<z.infer<TSchema>> {
    try {
      // Execute GraphQL mutation
      const result: FetchResult<TData> = await this.client.mutate({
        mutation: options.mutation,
        variables: options.variables as any,
        context: options.context,
      });

      if (!result.data) {
        throw new Error('Mutation returned no data');
      }

      // Validate response with Zod
      const validated = options.schema.parse(result.data);

      return validated;
    } catch (error) {
      throw handleValidationError(error);
    }
  }

  /**
   * Get underlying Apollo Client instance
   * Use this for operations that don't need validation
   */
  getClient(): ApolloClient<any> {
    return this.client;
  }
}

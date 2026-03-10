import * as Types from './types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export const RoadmapFieldsFragmentDoc = gql`
    fragment RoadmapFields on Roadmap {
  id
  slug
  title
  description
  content
  author
  tags
  publishedAt
  updatedAt
  isPublished
}
    `;
export const GetRoadmapsDocument = gql`
    query GetRoadmaps {
  roadmaps {
    ...RoadmapFields
  }
}
    ${RoadmapFieldsFragmentDoc}`;

/**
 * __useGetRoadmapsQuery__
 *
 * To run a query within a React component, call `useGetRoadmapsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoadmapsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoadmapsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetRoadmapsQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetRoadmapsQuery, Types.GetRoadmapsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetRoadmapsQuery, Types.GetRoadmapsQueryVariables>(GetRoadmapsDocument, options);
      }
export function useGetRoadmapsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetRoadmapsQuery, Types.GetRoadmapsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetRoadmapsQuery, Types.GetRoadmapsQueryVariables>(GetRoadmapsDocument, options);
        }
// @ts-ignore
export function useGetRoadmapsSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetRoadmapsQuery, Types.GetRoadmapsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRoadmapsQuery, Types.GetRoadmapsQueryVariables>;
export function useGetRoadmapsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRoadmapsQuery, Types.GetRoadmapsQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRoadmapsQuery | undefined, Types.GetRoadmapsQueryVariables>;
export function useGetRoadmapsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRoadmapsQuery, Types.GetRoadmapsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetRoadmapsQuery, Types.GetRoadmapsQueryVariables>(GetRoadmapsDocument, options);
        }
export type GetRoadmapsQueryHookResult = ReturnType<typeof useGetRoadmapsQuery>;
export type GetRoadmapsLazyQueryHookResult = ReturnType<typeof useGetRoadmapsLazyQuery>;
export type GetRoadmapsSuspenseQueryHookResult = ReturnType<typeof useGetRoadmapsSuspenseQuery>;
export type GetRoadmapsQueryResult = Apollo.QueryResult<Types.GetRoadmapsQuery, Types.GetRoadmapsQueryVariables>;
export const GetRoadmapsForAdminDocument = gql`
    query GetRoadmapsForAdmin {
  roadmapsForAdmin {
    ...RoadmapFields
  }
}
    ${RoadmapFieldsFragmentDoc}`;

/**
 * __useGetRoadmapsForAdminQuery__
 *
 * To run a query within a React component, call `useGetRoadmapsForAdminQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoadmapsForAdminQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoadmapsForAdminQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetRoadmapsForAdminQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetRoadmapsForAdminQuery, Types.GetRoadmapsForAdminQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetRoadmapsForAdminQuery, Types.GetRoadmapsForAdminQueryVariables>(GetRoadmapsForAdminDocument, options);
      }
export function useGetRoadmapsForAdminLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetRoadmapsForAdminQuery, Types.GetRoadmapsForAdminQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetRoadmapsForAdminQuery, Types.GetRoadmapsForAdminQueryVariables>(GetRoadmapsForAdminDocument, options);
        }
// @ts-ignore
export function useGetRoadmapsForAdminSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetRoadmapsForAdminQuery, Types.GetRoadmapsForAdminQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRoadmapsForAdminQuery, Types.GetRoadmapsForAdminQueryVariables>;
export function useGetRoadmapsForAdminSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRoadmapsForAdminQuery, Types.GetRoadmapsForAdminQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRoadmapsForAdminQuery | undefined, Types.GetRoadmapsForAdminQueryVariables>;
export function useGetRoadmapsForAdminSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRoadmapsForAdminQuery, Types.GetRoadmapsForAdminQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetRoadmapsForAdminQuery, Types.GetRoadmapsForAdminQueryVariables>(GetRoadmapsForAdminDocument, options);
        }
export type GetRoadmapsForAdminQueryHookResult = ReturnType<typeof useGetRoadmapsForAdminQuery>;
export type GetRoadmapsForAdminLazyQueryHookResult = ReturnType<typeof useGetRoadmapsForAdminLazyQuery>;
export type GetRoadmapsForAdminSuspenseQueryHookResult = ReturnType<typeof useGetRoadmapsForAdminSuspenseQuery>;
export type GetRoadmapsForAdminQueryResult = Apollo.QueryResult<Types.GetRoadmapsForAdminQuery, Types.GetRoadmapsForAdminQueryVariables>;
export const GetRoadmapBySlugDocument = gql`
    query GetRoadmapBySlug($slug: String!) {
  roadmap(slug: $slug) {
    ...RoadmapFields
  }
}
    ${RoadmapFieldsFragmentDoc}`;

/**
 * __useGetRoadmapBySlugQuery__
 *
 * To run a query within a React component, call `useGetRoadmapBySlugQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoadmapBySlugQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoadmapBySlugQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetRoadmapBySlugQuery(baseOptions: Apollo.QueryHookOptions<Types.GetRoadmapBySlugQuery, Types.GetRoadmapBySlugQueryVariables> & ({ variables: Types.GetRoadmapBySlugQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetRoadmapBySlugQuery, Types.GetRoadmapBySlugQueryVariables>(GetRoadmapBySlugDocument, options);
      }
export function useGetRoadmapBySlugLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetRoadmapBySlugQuery, Types.GetRoadmapBySlugQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetRoadmapBySlugQuery, Types.GetRoadmapBySlugQueryVariables>(GetRoadmapBySlugDocument, options);
        }
// @ts-ignore
export function useGetRoadmapBySlugSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetRoadmapBySlugQuery, Types.GetRoadmapBySlugQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRoadmapBySlugQuery, Types.GetRoadmapBySlugQueryVariables>;
export function useGetRoadmapBySlugSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRoadmapBySlugQuery, Types.GetRoadmapBySlugQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetRoadmapBySlugQuery | undefined, Types.GetRoadmapBySlugQueryVariables>;
export function useGetRoadmapBySlugSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetRoadmapBySlugQuery, Types.GetRoadmapBySlugQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetRoadmapBySlugQuery, Types.GetRoadmapBySlugQueryVariables>(GetRoadmapBySlugDocument, options);
        }
export type GetRoadmapBySlugQueryHookResult = ReturnType<typeof useGetRoadmapBySlugQuery>;
export type GetRoadmapBySlugLazyQueryHookResult = ReturnType<typeof useGetRoadmapBySlugLazyQuery>;
export type GetRoadmapBySlugSuspenseQueryHookResult = ReturnType<typeof useGetRoadmapBySlugSuspenseQuery>;
export type GetRoadmapBySlugQueryResult = Apollo.QueryResult<Types.GetRoadmapBySlugQuery, Types.GetRoadmapBySlugQueryVariables>;
export const CreateRoadmapDocument = gql`
    mutation CreateRoadmap($input: CreateRoadmapInput!) {
  createRoadmap(input: $input) {
    ...RoadmapFields
  }
}
    ${RoadmapFieldsFragmentDoc}`;
export type CreateRoadmapMutationFn = Apollo.MutationFunction<Types.CreateRoadmapMutation, Types.CreateRoadmapMutationVariables>;

/**
 * __useCreateRoadmapMutation__
 *
 * To run a mutation, you first call `useCreateRoadmapMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRoadmapMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRoadmapMutation, { data, loading, error }] = useCreateRoadmapMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateRoadmapMutation(baseOptions?: Apollo.MutationHookOptions<Types.CreateRoadmapMutation, Types.CreateRoadmapMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.CreateRoadmapMutation, Types.CreateRoadmapMutationVariables>(CreateRoadmapDocument, options);
      }
export type CreateRoadmapMutationHookResult = ReturnType<typeof useCreateRoadmapMutation>;
export type CreateRoadmapMutationResult = Apollo.MutationResult<Types.CreateRoadmapMutation>;
export type CreateRoadmapMutationOptions = Apollo.BaseMutationOptions<Types.CreateRoadmapMutation, Types.CreateRoadmapMutationVariables>;
export const UpdateRoadmapDocument = gql`
    mutation UpdateRoadmap($input: UpdateRoadmapInput!) {
  updateRoadmap(input: $input) {
    ...RoadmapFields
  }
}
    ${RoadmapFieldsFragmentDoc}`;
export type UpdateRoadmapMutationFn = Apollo.MutationFunction<Types.UpdateRoadmapMutation, Types.UpdateRoadmapMutationVariables>;

/**
 * __useUpdateRoadmapMutation__
 *
 * To run a mutation, you first call `useUpdateRoadmapMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRoadmapMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRoadmapMutation, { data, loading, error }] = useUpdateRoadmapMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateRoadmapMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateRoadmapMutation, Types.UpdateRoadmapMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateRoadmapMutation, Types.UpdateRoadmapMutationVariables>(UpdateRoadmapDocument, options);
      }
export type UpdateRoadmapMutationHookResult = ReturnType<typeof useUpdateRoadmapMutation>;
export type UpdateRoadmapMutationResult = Apollo.MutationResult<Types.UpdateRoadmapMutation>;
export type UpdateRoadmapMutationOptions = Apollo.BaseMutationOptions<Types.UpdateRoadmapMutation, Types.UpdateRoadmapMutationVariables>;
export const DeleteRoadmapDocument = gql`
    mutation DeleteRoadmap($id: String!) {
  deleteRoadmap(id: $id) {
    ...RoadmapFields
  }
}
    ${RoadmapFieldsFragmentDoc}`;
export type DeleteRoadmapMutationFn = Apollo.MutationFunction<Types.DeleteRoadmapMutation, Types.DeleteRoadmapMutationVariables>;

/**
 * __useDeleteRoadmapMutation__
 *
 * To run a mutation, you first call `useDeleteRoadmapMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteRoadmapMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteRoadmapMutation, { data, loading, error }] = useDeleteRoadmapMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteRoadmapMutation(baseOptions?: Apollo.MutationHookOptions<Types.DeleteRoadmapMutation, Types.DeleteRoadmapMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.DeleteRoadmapMutation, Types.DeleteRoadmapMutationVariables>(DeleteRoadmapDocument, options);
      }
export type DeleteRoadmapMutationHookResult = ReturnType<typeof useDeleteRoadmapMutation>;
export type DeleteRoadmapMutationResult = Apollo.MutationResult<Types.DeleteRoadmapMutation>;
export type DeleteRoadmapMutationOptions = Apollo.BaseMutationOptions<Types.DeleteRoadmapMutation, Types.DeleteRoadmapMutationVariables>;
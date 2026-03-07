# Bugfix Requirements Document

## Introduction

This document addresses three critical runtime errors preventing the VizTechStack application from functioning correctly after the development environment setup was fixed. The first error is a fetch failure when the web application attempts to communicate with the GraphQL API server. The second error is a React hydration mismatch caused by the Clerk `<UserButton />` component rendering differently on the server versus the client. The third error is a GraphQL schema mismatch where the client sends a query with a single `input` parameter but the server resolver expects separate `filters` and `pagination` parameters, causing the admin dashboard to fail loading roadmaps. These errors prevent users from viewing roadmaps, cause the homepage to fail rendering, and block admin functionality.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the web application attempts to fetch roadmaps from the GraphQL API THEN the system throws `TypeError: fetch failed` at the `executeGraphql` function in `apps/web/src/lib/api-client/graphql-client.ts`

1.2 WHEN the API server is not running or not accessible at `http://localhost:4000/graphql` THEN the system fails all GraphQL requests with network errors

1.3 WHEN the homepage renders with the `<UserButton />` component from Clerk THEN the system throws a hydration error: "Hydration failed because the server rendered HTML didn't match the client"

1.4 WHEN React attempts to hydrate the `<UserButton />` component THEN the system encounters a mismatch between server-rendered HTML and client-rendered HTML, causing the page to fail rendering

1.5 WHEN the admin dashboard page calls `getRoadmapsPage` query with a single `input` parameter THEN the system throws `GraphQL request failed: 400 Bad Request` because the server resolver expects separate `filters` and `pagination` parameters

1.6 WHEN there is a mismatch between client GraphQL query structure and server resolver signature THEN the system fails with 400 Bad Request preventing the admin dashboard from loading

### Expected Behavior (Correct)

2.1 WHEN the web application attempts to fetch roadmaps from the GraphQL API THEN the system SHALL successfully connect to the API server at `http://localhost:4000/graphql` and retrieve data

2.2 WHEN both development servers (API on port 4000 and Web on port 3000) are running THEN the system SHALL successfully execute GraphQL queries without network errors

2.3 WHEN the homepage renders with the `<UserButton />` component from Clerk THEN the system SHALL render without hydration errors

2.4 WHEN React hydrates the `<UserButton />` component THEN the system SHALL produce matching HTML on both server and client, allowing the page to render correctly

2.5 WHEN the admin dashboard page calls the roadmaps query THEN the system SHALL use a query structure that matches the server resolver's expected parameters (either both use `input` or both use separate `filters` and `pagination`)

2.6 WHEN the client and server GraphQL schemas are aligned THEN the system SHALL successfully fetch roadmaps data for the admin dashboard without 400 errors

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the API server is unreachable during build time or initial page load THEN the system SHALL CONTINUE TO display the homepage with a fallback message "No roadmaps found or Backend is not running yet" without crashing

3.2 WHEN environment variables are configured correctly in `.env.local` THEN the system SHALL CONTINUE TO use those values for API endpoint resolution

3.3 WHEN users are signed out THEN the system SHALL CONTINUE TO display the `<SignInButton />` component without hydration errors

3.4 WHEN the GraphQL client resolves endpoints using `resolveServerGraphqlEndpoints()` THEN the system SHALL CONTINUE TO check multiple endpoint sources in the correct priority order

3.5 WHEN the application runs in production mode THEN the system SHALL CONTINUE TO use production-appropriate GraphQL endpoints and Vercel fallbacks

3.6 WHEN the legacy `getRoadmaps` query is used as fallback THEN the system SHALL CONTINUE TO work correctly for backward compatibility

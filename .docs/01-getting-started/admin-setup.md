# Admin Setup Guide

## Setting Up Admin Access

To create and manage roadmaps, you need admin privileges. Follow these steps:

### Step 1: Sign In to the Application

1. Go to http://localhost:3000
2. Click "Đăng nhập" (Sign In) in the top right
3. Create an account or sign in with an existing account

### Step 2: Set Admin Role in Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application: "summary-wren-91"
3. Navigate to **Users** in the left sidebar
4. Find and click on your user account
5. Scroll down to **Public metadata** section
6. Click **Edit**
7. Add the following JSON:
   ```json
   {
     "role": "admin"
   }
   ```
8. Click **Save**

### Step 3: Refresh Your Session

1. Go back to http://localhost:3000
2. Sign out and sign in again (to refresh the JWT token with new metadata)
3. You should now see "Admin Dashboard" button in the header

### Step 4: Seed the Database

You have two options:

#### Option A: Use Convex Dashboard (Recommended)

1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Select your deployment: "joyous-hedgehog-239"
3. Go to **Functions** tab
4. Find and run the `seed` function
5. This will create 3 sample roadmaps:
   - Frontend Developer (beginner)
   - Backend Developer (intermediate)
   - React (intermediate, skill)

#### Option B: Use the Admin Interface

1. Go to http://localhost:3000
2. Click "Admin Dashboard" button
3. Navigate to the roadmap creation page
4. Fill in the form to create a new roadmap:
   - Slug: unique identifier (e.g., "nodejs")
   - Title: Display name (e.g., "Node.js Developer")
   - Description: Brief description
   - Category: role, skill, or best-practice
   - Difficulty: beginner, intermediate, or advanced
   - Status: public, draft, or private

## Verifying Admin Access

Once you have admin access, you should see:

1. **Admin Dashboard** button in the header
2. Ability to create/edit/delete roadmaps
3. Access to admin-only GraphQL mutations

## Troubleshooting

### "Unauthorized" Error When Seeding

- Make sure you've added the `role: "admin"` to your user's public metadata in Clerk
- Sign out and sign in again to refresh your JWT token
- Check the browser console for any authentication errors

### Admin Dashboard Not Showing

- Verify the role is set correctly in Clerk dashboard
- Clear browser cache and cookies
- Check that the JWT token includes the role in metadata:
  ```javascript
  // In browser console
  console.log(await clerk.session.getToken())
  ```

### Seed Function Fails

- Make sure you're authenticated (signed in)
- Verify your role is "admin"
- Check Convex dashboard logs for detailed error messages

## Quick Test

To verify everything is working:

1. Sign in as admin
2. Go to http://localhost:3000/admin/roadmap (if this route exists)
3. Or use GraphQL Playground at http://localhost:4000/graphql
4. Try this mutation:
   ```graphql
   mutation {
     createRoadmap(input: {
       slug: "test-roadmap"
       title: "Test Roadmap"
       description: "A test roadmap"
       category: ROLE
       difficulty: BEGINNER
       nodes: []
       edges: []
       topicCount: 0
       status: PUBLIC
     }) {
       id
       slug
       title
     }
   }
   ```

## Next Steps

After setting up admin access and seeding data:

1. Visit http://localhost:3000 to see the roadmaps on the homepage
2. Visit http://localhost:3000/roadmaps to see the roadmaps listing page
3. Click on a roadmap to view its details
4. Use the admin interface to create more roadmaps

## Environment Variables

Make sure these are set in your `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c3VtbWFyeS13cmVuLTkxLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_FlNucecqOLuaeNSil8tnFhZEnjSYU1R7WwZ19rtf6M
CLERK_JWT_ISSUER_DOMAIN=https://summary-wren-91.clerk.accounts.dev

# GraphQL
GRAPHQL_URL=http://localhost:4000/graphql
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql

# Convex
CONVEX_DEPLOYMENT=dev:joyous-hedgehog-239
CONVEX_URL=https://joyous-hedgehog-239.convex.cloud
NEXT_PUBLIC_CONVEX_URL=https://joyous-hedgehog-239.convex.cloud
```

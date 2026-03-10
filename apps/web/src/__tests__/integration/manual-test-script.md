# Manual Integration Testing Script

This document provides a comprehensive manual testing checklist for the Frontend RBAC Roadmap Integration.

## Prerequisites

1. ✅ Frontend server running on http://localhost:3000
2. ✅ Backend API server running on http://localhost:4000
3. ✅ Database (Convex) connected and accessible

## Test Scenarios

### 1. Guest User Flow

#### 1.1 Homepage Access
- [ ] Navigate to http://localhost:3000
- [ ] Verify homepage loads without errors
- [ ] Check that "Sign in" button is visible in header
- [ ] Verify "Roadmaps" navigation link is present
- [ ] Confirm no "Admin" button is visible for guests

#### 1.2 Public Roadmaps Listing
- [ ] Click "Roadmaps" link in navigation
- [ ] Verify navigation to /roadmaps page
- [ ] Check page title: "Technology Roadmaps"
- [ ] Verify description: "Explore curated learning paths for modern technologies"
- [ ] Observe loading state (skeleton cards should appear briefly)
- [ ] Wait for roadmaps to load or empty state to appear
- [ ] If roadmaps exist: verify cards display title, description, tags, and published date
- [ ] If no roadmaps: verify "No roadmaps available yet." message

#### 1.3 Roadmap Detail View
- [ ] If roadmaps exist, click on a roadmap card
- [ ] Verify navigation to /roadmaps/[slug] page
- [ ] Check that roadmap title, description, tags, and content are displayed
- [ ] Verify "Back to Roadmaps" button works
- [ ] Test navigation back to listing page

#### 1.4 Responsive Design (Guest)
- [ ] Test on mobile viewport (375px width)
  - [ ] Verify single column layout for roadmaps
  - [ ] Check header remains accessible
  - [ ] Ensure navigation works on mobile
- [ ] Test on tablet viewport (768px width)
  - [ ] Verify 2-column layout for roadmaps
- [ ] Test on desktop viewport (1024px+ width)
  - [ ] Verify 3-column layout for roadmaps

### 2. Authentication Flow

#### 2.1 Sign In Process
- [ ] Click "Sign in" button
- [ ] Verify Clerk authentication modal opens
- [ ] Test sign in process (if Clerk is configured)
- [ ] After sign in, verify "Sign in" button is replaced with user button
- [ ] Check if "Admin" button appears (depends on user role)

#### 2.2 User Session
- [ ] Refresh page after sign in
- [ ] Verify user remains signed in
- [ ] Test sign out functionality
- [ ] Verify return to guest state after sign out

### 3. Regular User Flow

#### 3.1 Authenticated User Access
- [ ] Sign in as regular user (non-admin)
- [ ] Verify user can access all public roadmap features
- [ ] Confirm "Admin" button is NOT visible
- [ ] Test that direct navigation to /admin/roadmaps shows permission denied

### 4. Admin User Flow

#### 4.1 Admin Authentication
- [ ] Sign in as admin user
- [ ] Verify "Admin" button appears in header
- [ ] Click "Admin" button
- [ ] Verify navigation to /admin/roadmaps

#### 4.2 Admin Dashboard
- [ ] Check admin dashboard loads correctly
- [ ] Verify page title: "Roadmap Management"
- [ ] Check "New Roadmap" button is present
- [ ] If roadmaps exist: verify table displays with columns (Title, Slug, Tags, Status, Updated, Actions)
- [ ] If no roadmaps: verify empty state with "Create your first roadmap" button

#### 4.3 Create Roadmap
- [ ] Click "New Roadmap" button
- [ ] Verify navigation to /admin/roadmaps/new
- [ ] Test form validation:
  - [ ] Try submitting empty form - should show validation errors
  - [ ] Fill required fields: slug, title, description, content, tags
  - [ ] Test published checkbox
- [ ] Submit valid form
- [ ] Verify redirect to admin dashboard
- [ ] Check new roadmap appears in table

#### 4.4 Edit Roadmap
- [ ] In admin table, click "Edit" button on a roadmap
- [ ] Verify navigation to /admin/roadmaps/[id]/edit
- [ ] Check form is pre-filled with existing data
- [ ] Make changes to form fields
- [ ] Submit form
- [ ] Verify redirect to admin dashboard
- [ ] Check changes are reflected in table

#### 4.5 Delete Roadmap
- [ ] In admin table, click "Delete" button
- [ ] Verify confirmation dialog appears
- [ ] Test "Cancel" button - should close dialog
- [ ] Click "Delete" again and confirm deletion
- [ ] Verify roadmap is removed from table
- [ ] Check roadmap no longer appears in public listing

#### 4.6 View Roadmap (Admin)
- [ ] In admin table, click "View" button
- [ ] Verify opens roadmap detail page in new tab
- [ ] Check roadmap displays correctly for admin

### 5. Error Scenarios

#### 5.1 Network Errors
- [ ] Stop the backend API server
- [ ] Navigate to /roadmaps page
- [ ] Verify error message appears: "Backend Service Unavailable"
- [ ] Check "Retry Connection" button is present
- [ ] Restart API server and test retry functionality

#### 5.2 GraphQL Errors
- [ ] Use browser dev tools to simulate GraphQL errors
- [ ] Verify appropriate error messages are displayed
- [ ] Check error handling doesn't break the UI

#### 5.3 Form Validation Errors
- [ ] Test all form validation scenarios:
  - [ ] Empty required fields
  - [ ] Invalid slug format
  - [ ] Duplicate slug (if applicable)
  - [ ] Maximum length validations

#### 5.4 Permission Errors
- [ ] As non-admin user, try to access /admin/roadmaps directly
- [ ] Verify permission denied message
- [ ] Test that admin-only mutations are blocked for regular users

### 6. Loading States

#### 6.1 Data Fetching
- [ ] Navigate to /roadmaps and observe loading skeletons
- [ ] Check loading states appear before data loads
- [ ] Verify smooth transition from loading to content

#### 6.2 Form Submissions
- [ ] Submit create/edit forms and observe loading states
- [ ] Check submit buttons become disabled during submission
- [ ] Verify loading text appears ("Creating...", "Updating...")

#### 6.3 Delete Operations
- [ ] Initiate delete operation and observe loading state
- [ ] Check "Deleting..." text appears
- [ ] Verify UI updates after successful deletion

### 7. Responsive Design Testing

#### 7.1 Mobile (375px)
- [ ] Test all pages on mobile viewport
- [ ] Verify single column layouts
- [ ] Check touch interactions work properly
- [ ] Test form usability on mobile

#### 7.2 Tablet (768px)
- [ ] Test 2-column roadmap grid
- [ ] Verify admin table scrolls horizontally if needed
- [ ] Check form layouts adapt properly

#### 7.3 Desktop (1024px+)
- [ ] Test 3-column roadmap grid
- [ ] Verify admin table displays all columns
- [ ] Check optimal spacing and layout

### 8. Cross-Browser Testing

#### 8.1 Chrome
- [ ] Test all functionality in Chrome
- [ ] Check console for errors
- [ ] Verify performance is acceptable

#### 8.2 Firefox
- [ ] Test core functionality in Firefox
- [ ] Check for browser-specific issues

#### 8.3 Safari (if available)
- [ ] Test on Safari/WebKit
- [ ] Verify CSS compatibility

### 9. Performance Testing

#### 9.1 Load Times
- [ ] Measure initial page load time
- [ ] Check Time to First Contentful Paint
- [ ] Verify images and assets load efficiently

#### 9.2 Runtime Performance
- [ ] Test smooth scrolling and animations
- [ ] Check for memory leaks during navigation
- [ ] Verify responsive interactions

### 10. Accessibility Testing

#### 10.1 Keyboard Navigation
- [ ] Test tab navigation through all interactive elements
- [ ] Verify focus indicators are visible
- [ ] Check keyboard shortcuts work

#### 10.2 Screen Reader Compatibility
- [ ] Test with screen reader (if available)
- [ ] Verify proper heading structure
- [ ] Check alt text for images

## Bug Tracking

### Issues Found
| Issue | Severity | Description | Status |
|-------|----------|-------------|--------|
| | | | |

### Test Results Summary
- [ ] All guest user flows working
- [ ] Authentication flows working
- [ ] Admin CRUD operations working
- [ ] Error handling working
- [ ] Loading states working
- [ ] Responsive design working
- [ ] Performance acceptable
- [ ] Accessibility compliant

## Sign-off

**Tester:** _______________  
**Date:** _______________  
**Overall Status:** ⭕ Pass / ❌ Fail  
**Notes:** _______________
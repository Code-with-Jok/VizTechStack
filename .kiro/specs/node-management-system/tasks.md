# Implementation Plan: Node Management System

## Overview

Hệ thống Node Management System cho phép admin tạo và quản lý hai loại node: Article (với editor giống Notion) và Roadmap (với visualization drag-and-drop). Hệ thống được xây dựng với Next.js 16, NestJS, TypeScript, React Flow, và Convex database.

**Tech Stack**:
- Frontend: Next.js 16, React 19, TypeScript 5.7, Tailwind CSS 4, React Flow, Apollo Client
- Backend: NestJS 11, GraphQL, Clerk authentication, Zod validation
- Database: Convex serverless
- Testing: Jest, fast-check (property-based testing), Playwright (E2E)

**Implementation Approach**: 6 phases với incremental delivery, mỗi phase build trên phase trước.

## Tasks

- [-] 1. Phase 1: Foundation - Backend Article Module và Authentication
  - Setup Article module structure, GraphQL schema, Convex database, và authentication guards
  - _Requirements: 1.1, 1.4, 2.6, 2.7, 2.10, 9.1, 9.3, 9.5, 9.9, 9.10, 9.11, 10.1, 10.3, 10.5, 10.6_

- [-] 1.1 Tạo Article Module Structure trong Backend
  - Tạo folder structure: `apps/api/src/modules/article/` với subfolders: `transport/graphql/`, `application/services/`, `domain/models/`
  - Tạo `article.module.ts` với NestJS module configuration
  - _Requirements: 9.1_

- [ ] 1.2 Define Article GraphQL Schema
  - Tạo `packages/shared/graphql-schema/src/article.graphql`
  - Define Article type implementing Node interface với fields: id, slug, title, content, author, tags, timestamps, isPublished
  - Define CreateArticleInput và UpdateArticleInput types
  - Define mutations: createArticle, updateArticle, deleteArticle
  - Define queries: articles, articlesForAdmin, article(slug)
  - _Requirements: 9.1, 9.3, 9.5, 9.6, 9.7, 9.8_

- [ ] 1.3 Implement Article Convex Schema
  - Update `convex/schema.ts` với articles table definition
  - Add fields: slug, title, content, author, tags, timestamps, isPublished, isDeleted, readingTime, wordCount
  - Create indexes: by_slug, by_author, by_published, by_tags
  - _Requirements: 10.1, 10.3, 10.5, 10.6_

- [ ] 1.4 Create Zod Validation Schemas
  - Tạo `packages/shared/validation/src/article-validation.ts`
  - Implement ArticleSchema với validation rules: slug format (lowercase, hyphens, alphanumeric), title (1-200 chars), content (required), tags array
  - Implement CreateArticleInputSchema và UpdateArticleInputSchema
  - _Requirements: 9.9, 13.1, 13.2, 13.3, 13.4_


- [ ] 1.5 Implement ClerkAuthGuard
  - Tạo `apps/api/src/common/guards/clerk-auth.guard.ts`
  - Implement JWT token extraction từ Authorization header
  - Verify token với Clerk SDK
  - Extract user metadata (id, email, role) và attach to request context
  - Throw UnauthorizedException cho invalid/missing tokens
  - _Requirements: 1.1, 9.10_

- [ ] 1.6 Implement RolesGuard
  - Tạo `apps/api/src/common/guards/roles.guard.ts`
  - Implement role checking logic với Reflector
  - Create @Roles decorator để specify required roles
  - Throw ForbiddenException khi user không có required role
  - _Requirements: 1.4, 9.11_

- [ ] 1.7 Implement Article Service
  - Tạo `apps/api/src/modules/article/application/services/article.service.ts`
  - Implement findAll(): query published articles từ Convex
  - Implement findAllForAdmin(): query all articles including drafts
  - Implement findBySlug(slug): query article by slug, throw NotFoundException nếu không tồn tại
  - Implement create(input, authorId): validate input, check slug uniqueness, generate timestamps, save to Convex
  - Implement update(input): validate input, update timestamps, save to Convex
  - Implement delete(id): soft delete (set isDeleted=true)
  - _Requirements: 2.6, 2.7, 2.8, 2.9, 2.10, 10.7, 10.8_

- [ ] 1.8 Implement Article Resolver
  - Tạo `apps/api/src/modules/article/transport/graphql/resolvers/article.resolver.ts`
  - Implement articles() query: public, return published articles
  - Implement articlesForAdmin() query: require admin role, return all articles
  - Implement article(slug) query: public, return article by slug
  - Implement createArticle(input) mutation: require admin role, call service.create()
  - Implement updateArticle(input) mutation: require admin role, call service.update()
  - Implement deleteArticle(id) mutation: require admin role, call service.delete()
  - Apply guards: @UseGuards(ClerkAuthGuard, RolesGuard)
  - _Requirements: 9.1, 9.3, 9.5_

- [ ]* 1.9 Write Unit Tests cho Article Service
  - Tạo `apps/api/src/modules/article/__tests__/unit/article.service.spec.ts`
  - Test create() với valid input: should create article successfully
  - Test create() với duplicate slug: should throw ConflictException
  - Test create() với invalid input: should throw validation error
  - Test findBySlug() với existing slug: should return article
  - Test findBySlug() với non-existing slug: should throw NotFoundException
  - Test update() với valid input: should update article
  - Test delete(): should soft delete article (isDeleted=true)
  - Mock ConvexService dependencies
  - _Requirements: 2.6, 2.7, 2.8, 2.9, 2.10_

- [ ]* 1.10 Write Integration Tests cho Article CRUD
  - Tạo `apps/api/src/modules/article/__tests__/integration/article-crud.integration.spec.ts`
  - Test createArticle mutation với admin token: should succeed
  - Test createArticle mutation với user token: should return 403 Forbidden
  - Test createArticle mutation without token: should return 401 Unauthorized
  - Test article query với valid slug: should return article data
  - Test article query với invalid slug: should return null
  - Setup test app với real Convex connection (test database)
  - _Requirements: 1.1, 1.4, 9.10, 9.11_

- [ ] 1.11 Setup Frontend Routing và Authentication Middleware
  - Tạo `apps/web/app/admin/nodes/create/page.tsx` với admin-only access
  - Configure Clerk middleware trong `apps/web/middleware.ts` để protect /admin routes
  - Redirect non-admin users to home page với error message
  - _Requirements: 1.2, 1.4_

- [ ] 1.12 Create NodeSwitch Component
  - Tạo `apps/web/src/components/node/NodeSwitch.tsx`
  - Implement toggle UI với 2 options: Article và Roadmap
  - Add keyboard navigation support (Tab, Arrow keys, Enter)
  - Add ARIA labels cho accessibility
  - Style với Tailwind CSS và shadcn/ui components
  - _Requirements: 1.2, 1.3, 15.1, 15.2_

- [ ]* 1.13 Write Unit Tests cho NodeSwitch Component
  - Tạo `apps/web/src/components/node/__tests__/NodeSwitch.test.tsx`
  - Test rendering: should display both Article and Roadmap options
  - Test onChange callback: should call onChange when option selected
  - Test keyboard navigation: should work with Enter key
  - Test accessibility: should have proper ARIA labels
  - Use React Testing Library
  - _Requirements: 1.2, 1.3, 15.1, 15.2_

- [ ] 1.14 Checkpoint - Verify Phase 1 Complete
  - Run all tests: `pnpm turbo test --filter @viztechstack/api`
  - Verify Article CRUD API works via GraphQL playground
  - Verify authentication guards work correctly
  - Verify NodeSwitch component renders correctly
  - Ensure all tests pass, ask user if questions arise


- [ ] 2. Phase 2: Article Editor - Rich Text Editor với Auto-save
  - Integrate Tiptap/Novel editor, implement rich text formatting, blocks, auto-save, và Article view page
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.9, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.10, 13.6, 13.9, 14.4, 14.9_

- [ ] 2.1 Integrate Tiptap Editor
  - Install dependencies: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-*`
  - Tạo `apps/web/src/components/editor/ContentEditor.tsx`
  - Setup Tiptap editor với StarterKit extensions
  - Configure editor với initial content, onChange callback, readOnly mode
  - _Requirements: 2.1, 2.2_

- [ ] 2.2 Implement Rich Text Formatting
  - Add formatting extensions: Bold, Italic, Underline, Strike, Code
  - Add heading extensions: Heading (levels 1-3)
  - Add list extensions: BulletList, OrderedList, TaskList
  - Implement keyboard shortcuts: Cmd+B (bold), Cmd+I (italic), etc.
  - Add formatting toolbar với buttons cho each format
  - _Requirements: 2.2_

- [ ] 2.3 Implement Block Types
  - Add Paragraph block
  - Add Image block với upload functionality
  - Add CodeBlock với syntax highlighting (using highlight.js)
  - Add Blockquote block
  - Add HorizontalRule (divider)
  - Implement drag-and-drop để reorder blocks
  - _Requirements: 2.3_

- [ ] 2.4 Implement Slash Commands
  - Add slash command menu: trigger với "/" character
  - Add commands: /heading1, /heading2, /heading3, /code, /quote, /image, /divider
  - Implement fuzzy search trong command menu
  - Add keyboard navigation trong menu (Arrow keys, Enter)
  - _Requirements: 2.3_

- [ ] 2.5 Implement Auto-save Functionality
  - Create auto-save hook: `apps/web/src/hooks/useAutoSave.ts`
  - Implement debounced save với 30 second interval
  - Save draft to localStorage as backup
  - Show save status indicator: "Saving...", "Saved", "Error"
  - Implement retry logic với exponential backoff cho failed saves
  - _Requirements: 2.4, 13.7, 14.9_

- [ ] 2.6 Create Article Create Page
  - Update `apps/web/app/admin/nodes/create/page.tsx`
  - Add form fields: title input, tags input, isPublished checkbox
  - Integrate ContentEditor component
  - Implement form validation với Zod schema (client-side)
  - Implement createArticle GraphQL mutation
  - Handle validation errors và display inline error messages
  - Redirect to /article/[slug] on success
  - _Requirements: 2.5, 2.6, 2.7, 2.8, 2.9, 13.6_

- [ ] 2.7 Implement Slug Generation
  - Create utility function: `apps/web/src/lib/utils/generateSlug.ts`
  - Convert title to lowercase, replace spaces với hyphens, remove special characters
  - Handle collision: append numeric suffix if slug exists
  - Validate slug format: lowercase alphanumeric với hyphens only
  - _Requirements: 2.7, 13.2_


- [ ] 2.8 Create Article View Page
  - Tạo `apps/web/app/article/[slug]/page.tsx`
  - Implement getArticle GraphQL query với SSR
  - Render article title (H1), metadata (author, date, reading time)
  - Render content với Notion-style formatting
  - Implement breadcrumb navigation nếu article thuộc roadmap
  - Add lazy loading cho images
  - Add syntax highlighting cho code blocks (using Prism.js)
  - Show 404 page nếu article không tồn tại
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [ ] 2.9 Implement Reading Time Calculation
  - Create utility: `apps/web/src/lib/utils/calculateReadingTime.ts`
  - Calculate based on word count (average 200 words/minute)
  - Store readingTime trong database khi create/update article
  - Display trong article metadata
  - _Requirements: 8.4_

- [ ] 2.10 Implement Related Articles Section
  - Add query để fetch related articles based on tags
  - Display 3-5 related articles ở cuối article page
  - Show article title, description, và link
  - _Requirements: 8.10_

- [ ] 2.11 Implement Responsive Layout cho Article Pages
  - Mobile layout (< 640px): single column, full-width
  - Tablet layout (640px - 1024px): centered content với max-width
  - Desktop layout (> 1024px): centered content với sidebar space
  - Test trên multiple screen sizes
  - _Requirements: 8.3, 15.5, 15.6_

- [ ]* 2.12 Write Unit Tests cho ContentEditor Component
  - Tạo `apps/web/src/components/editor/__tests__/ContentEditor.test.tsx`
  - Test rendering: should render editor với initial content
  - Test onChange: should call onChange when content changes
  - Test formatting: should apply bold/italic formatting
  - Test auto-save: should trigger save after 30 seconds
  - Mock Tiptap editor
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 2.13 Write Property Test cho Slug Generation Idempotence
  - Tạo `apps/web/src/lib/utils/__tests__/generateSlug.properties.spec.ts`
  - **Property 3: Slug Generation Idempotence**
  - **Validates: Requirements 2.7, 5.5**
  - Test: generateSlug(title) === generateSlug(title) cho random titles
  - Use fast-check với fc.string() arbitrary
  - Verify slug format: lowercase, hyphens, alphanumeric only
  - _Requirements: 2.7_

- [ ]* 2.14 Write E2E Test cho Article Create Flow
  - Tạo `apps/web/e2e/article-create.spec.ts`
  - Test: admin can create and view article
  - Steps: login as admin → navigate to create page → select Article → fill form → save → verify redirect → verify content displayed
  - Use Playwright
  - _Requirements: 2.1, 2.5, 2.6, 2.8, 8.1_

- [ ] 2.15 Checkpoint - Verify Phase 2 Complete
  - Test article creation flow end-to-end
  - Verify auto-save works correctly
  - Verify article view page renders correctly
  - Verify responsive layout works on mobile/tablet/desktop
  - Ensure all tests pass, ask user if questions arise


- [ ] 3. Phase 3: Roadmap Builder - Interactive Visualization với Drag-and-Drop
  - Extend Roadmap backend, integrate React Flow, implement drag-and-drop, split-screen layout, và roadmap view page
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 10.2, 10.4, 10.9_

- [ ] 3.1 Extend Roadmap Convex Schema
  - Update `convex/schema.ts` roadmaps table
  - Add fields: nodesJson (string), edgesJson (string), nodeCount (number)
  - Keep existing fields: slug, title, description, content, author, tags, timestamps, isPublished, isDeleted
  - Update indexes nếu cần
  - _Requirements: 10.2, 10.4_

- [ ] 3.2 Update Roadmap Validation Schema
  - Update `packages/shared/validation/src/roadmap-validation.ts`
  - Define RoadmapStructureSchema: nodes array (min 1), edges array
  - Define RoadmapNodeSchema: id, type (article/roadmap), position (x, y), data (slug, title, description)
  - Define RoadmapEdgeSchema: id, source, target, type
  - Update RoadmapSchema với structure field
  - _Requirements: 5.2, 13.5_

- [ ] 3.3 Implement Roadmap Structure Validation trong Service
  - Update `apps/api/src/modules/roadmap/application/services/roadmap.service.ts`
  - Add validateStructure() method: verify all node references exist trong database
  - Add checkReferentialIntegrity(): verify Article nodes referenced trong roadmap exist
  - Throw BadRequestException cho invalid structure
  - _Requirements: 5.2, 10.9_

- [ ] 3.4 Update Roadmap Service Methods
  - Update create() method: validate structure, serialize nodes/edges to JSON, calculate nodeCount
  - Update update() method: validate structure, update nodeCount
  - Add method getArticlesForRoadmap(): fetch all Article nodes cho sidebar
  - _Requirements: 5.3, 5.4, 5.8_

- [ ] 3.5 Update Roadmap Resolver
  - Update createRoadmap mutation: accept structure input
  - Update updateRoadmap mutation: accept structure input
  - Add query articlesForRoadmap: return all published articles cho sidebar
  - _Requirements: 5.3, 9.2, 9.4_

- [ ]* 3.6 Write Property Test cho Roadmap Referential Integrity
  - Tạo `apps/api/src/modules/roadmap/__tests__/properties/referential-integrity.properties.spec.ts`
  - **Property 6: Roadmap Referential Integrity**
  - **Validates: Requirements 5.2, 10.9**
  - Test: all Article node references trong roadmap structure must exist trong database
  - Use fast-check to generate random roadmap structures
  - Verify validation rejects invalid references
  - _Requirements: 5.2, 10.9_

- [ ] 3.7 Integrate React Flow
  - Install dependencies: `@xyflow/react`
  - Tạo `apps/web/src/components/roadmap/RoadmapVisualization.tsx`
  - Setup ReactFlow component với nodes, edges, onNodesChange, onEdgesChange props
  - Configure controls: zoom, pan, minimap
  - Add custom node styles: Article nodes (blue), Roadmap nodes (purple)
  - _Requirements: 3.3, 6.3, 6.6, 6.7, 6.8_


- [ ] 3.8 Create NodeSidebar Component
  - Tạo `apps/web/src/components/roadmap/NodeSidebar.tsx`
  - Fetch available Article nodes từ GraphQL query
  - Display articles as draggable items với HTML5 Drag API
  - Show empty state với warning message "Bạn phải tạo node (article) trước" nếu no articles
  - Add link to create Article page trong empty state
  - Implement search/filter trong sidebar
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 3.9 Implement Drag-and-Drop từ Sidebar to Visualization
  - Add onDragStart handler trong NodeSidebar: set drag data
  - Add onDrop handler trong RoadmapVisualization: create new node at drop position
  - Show drag preview khi dragging
  - Validate drop position (within bounds)
  - _Requirements: 4.6, 4.7, 4.11_

- [ ] 3.10 Implement Auto-Connection Logic
  - Add logic trong onDrop handler: check distance to nearby nodes
  - If distance < 100px, automatically create edge between nodes
  - Use Euclidean distance calculation
  - Allow manual edge creation via React Flow controls
  - _Requirements: 4.8_

- [ ] 3.11 Implement Node Repositioning và Deletion
  - Enable node dragging trong ReactFlow: nodesDraggable={true}
  - Add delete button on node hover
  - Implement onNodesChange handler: update positions
  - Implement onEdgesChange handler: update connections
  - _Requirements: 4.9, 4.10_

- [ ] 3.12 Create Roadmap Create Page với Split Layout
  - Update `apps/web/app/admin/nodes/create/page.tsx` cho Roadmap type
  - Implement split layout: 40% form (left), 60% visualization (right)
  - Form fields: title, description, tags, isPublished
  - Add NodeSidebar ở bottom của visualization
  - Implement real-time sync: form changes update visualization
  - Responsive: vertical layout cho mobile (< 768px)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [ ] 3.13 Implement Roadmap Save Functionality
  - Add "Tạo Roadmap" button
  - Validate form fields và structure (min 1 node)
  - Serialize nodes và edges to JSON
  - Call createRoadmap GraphQL mutation
  - Handle validation errors và display messages
  - Redirect to /roadmap/[slug] on success
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [ ] 3.14 Create Roadmap View Page
  - Tạo `apps/web/app/roadmap/[slug]/page.tsx`
  - Implement getRoadmap GraphQL query với SSR
  - Render roadmap title, description, metadata (author, date, node count)
  - Render optional text content
  - Render RoadmapVisualization với readOnly mode
  - Add explanatory notes overlay ở top-right của visualization
  - Show 404 page nếu roadmap không tồn tại
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.9_

- [ ] 3.15 Add Explanatory Notes Overlay
  - Create overlay component trong RoadmapVisualization
  - Position ở top-right corner
  - Content: "Click vào node để navigate. Zoom với scroll wheel. Pan với drag."
  - Dismissible với close button
  - Save dismiss state to localStorage
  - _Requirements: 6.4, 6.5_


- [ ]* 3.16 Write Property Test cho Drag-and-Drop Position Preservation
  - Tạo `apps/web/src/components/roadmap/__tests__/position-preservation.properties.spec.ts`
  - **Property 7: Drag-and-Drop Position Preservation**
  - **Validates: Requirements 4.7, 5.4, 6.6**
  - Test: reload(save(positions)) === positions
  - Use fast-check to generate random node positions
  - Verify positions preserved after save and reload
  - _Requirements: 4.7, 5.4, 6.6_

- [ ]* 3.17 Write Property Test cho Auto-Connection Logic
  - Tạo `apps/web/src/components/roadmap/__tests__/auto-connection.properties.spec.ts`
  - **Property 8: Auto-Connection Logic Consistency**
  - **Validates: Requirements 4.8, 4.11**
  - Test: nodes within 100px should auto-connect, nodes > 100px should not
  - Use fast-check to generate random node positions
  - Verify connection logic consistent
  - _Requirements: 4.8, 4.11_

- [ ]* 3.18 Write Unit Tests cho RoadmapVisualization Component
  - Tạo `apps/web/src/components/roadmap/__tests__/RoadmapVisualization.test.tsx`
  - Test rendering: should render nodes and edges
  - Test node click: should call onNodeClick callback
  - Test drag-and-drop: should update node positions
  - Test controls: should enable zoom and pan
  - Mock React Flow
  - _Requirements: 3.3, 6.3, 6.6, 6.7_

- [ ]* 3.19 Write Integration Tests cho Roadmap CRUD
  - Tạo `apps/api/src/modules/roadmap/__tests__/integration/roadmap-crud.integration.spec.ts`
  - Test createRoadmap với valid structure: should succeed
  - Test createRoadmap với invalid references: should return validation error
  - Test createRoadmap với empty structure: should return validation error
  - Test getRoadmap query: should return roadmap với structure
  - _Requirements: 5.2, 5.3, 5.7, 10.9_

- [ ] 3.20 Checkpoint - Verify Phase 3 Complete
  - Test roadmap creation flow end-to-end
  - Verify drag-and-drop works correctly
  - Verify auto-connection logic works
  - Verify roadmap view page renders correctly
  - Verify split layout responsive on mobile
  - Ensure all tests pass, ask user if questions arise

- [ ] 4. Phase 4: Navigation và Search - Node Navigation và Search Functionality
  - Implement node click navigation, hover tooltips, search module, và filter functionality
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9_

- [ ] 4.1 Implement Node Click Navigation
  - Add onClick handler trong RoadmapVisualization custom nodes
  - Navigate to /article/[slug] cho Article nodes
  - Navigate to /roadmap/[slug] cho Roadmap nodes
  - Show loading state during navigation
  - Preserve browser history cho back/forward navigation
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 4.2 Implement Node Hover Tooltips
  - Add onMouseEnter/onMouseLeave handlers trong custom nodes
  - Show tooltip với node title và type
  - Position tooltip above node
  - Add hover highlight effect
  - Change cursor to pointer on hover
  - _Requirements: 7.5, 7.6, 7.7_


- [ ] 4.3 Add Analytics Logging cho Navigation
  - Create analytics utility: `apps/web/src/lib/analytics.ts`
  - Log navigation events: node_clicked, page_viewed
  - Include metadata: node_type, node_slug, user_id, timestamp
  - Send to analytics service (e.g., Google Analytics, Mixpanel)
  - _Requirements: 7.8, 8.9, 6.10_

- [ ] 4.4 Create Search Module Backend
  - Tạo `apps/api/src/modules/search/` với structure: transport/graphql/, application/services/
  - Define Search GraphQL schema: `packages/shared/graphql-schema/src/search.graphql`
  - Define SearchResults type, SearchFilters input (type, tags, sortBy)
  - Define search(query, filters) query
  - _Requirements: 12.1, 12.2_

- [ ] 4.5 Implement Search Service
  - Tạo `apps/api/src/modules/search/application/services/search.service.ts`
  - Implement searchNodes(query, filters): full-text search trong title và content
  - Implement filterByType(results, type): filter by Article/Roadmap
  - Implement filterByTags(results, tags): filter by tags
  - Implement sortResults(results, sortBy): sort by date, title, popularity
  - Return results với highlighting snippets
  - _Requirements: 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

- [ ] 4.6 Implement Search Resolver
  - Tạo `apps/api/src/modules/search/transport/graphql/resolvers/search.resolver.ts`
  - Implement search(query, filters) query: public access
  - Call searchService.searchNodes()
  - Return SearchResults với nodes và total count
  - _Requirements: 12.1, 12.2_

- [ ] 4.7 Create Search UI Component
  - Tạo `apps/web/src/components/search/SearchBar.tsx`
  - Add search input với icon
  - Implement debounced search với 300ms delay
  - Show search results dropdown
  - Display results với highlighting
  - Add "View all results" link
  - _Requirements: 12.1, 12.2, 12.3, 12.9_

- [ ] 4.8 Create Search Results Page
  - Tạo `apps/web/app/search/page.tsx`
  - Display search query và result count
  - Show filter options: type (Article/Roadmap), tags
  - Show sort options: date, title, popularity
  - Display results với title, snippet, type badge
  - Implement pagination hoặc infinite scroll
  - Show empty state khi no results
  - _Requirements: 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [ ] 4.9 Add Search Bar to Header
  - Update `apps/web/src/components/layout/Header.tsx`
  - Add SearchBar component
  - Position ở center hoặc right của header
  - Responsive: collapse to icon on mobile
  - _Requirements: 12.1_

- [ ]* 4.10 Write Property Test cho Search Results Relevance
  - Tạo `apps/api/src/modules/search/__tests__/properties/search-relevance.properties.spec.ts`
  - **Property 14: Search Results Relevance Ordering**
  - **Validates: Requirements 12.2, 12.3**
  - Test: results("tech") ⊇ results("tech stack")
  - Use fast-check to generate random query pairs
  - Verify subset relationship
  - _Requirements: 12.2, 12.3_


- [ ]* 4.11 Write Property Test cho Navigation Type Preservation
  - Tạo `apps/web/src/components/roadmap/__tests__/navigation.properties.spec.ts`
  - **Property 9: Navigation Preserves Node Type**
  - **Validates: Requirements 7.1, 7.2**
  - Test: Article nodes → /article/[slug], Roadmap nodes → /roadmap/[slug]
  - Use fast-check to generate random node types và slugs
  - Verify correct URL generation
  - _Requirements: 7.1, 7.2_

- [ ]* 4.12 Write E2E Test cho Navigation Flow
  - Tạo `apps/web/e2e/navigation.spec.ts`
  - Test: user can navigate between nodes
  - Steps: open roadmap → click Article node → verify redirect to article → click back → verify return to roadmap
  - Test: hover shows tooltip
  - Use Playwright
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 4.13 Write E2E Test cho Search Flow
  - Tạo `apps/web/e2e/search.spec.ts`
  - Test: user can search and find nodes
  - Steps: enter search query → verify results displayed → click result → verify navigation
  - Test: filter by type works
  - Test: sort by date works
  - Use Playwright
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

- [ ] 4.14 Checkpoint - Verify Phase 4 Complete
  - Test navigation between nodes works correctly
  - Test hover tooltips display correctly
  - Test search functionality works end-to-end
  - Test filters và sort options work
  - Ensure all tests pass, ask user if questions arise

- [ ] 5. Phase 5: Polish và Optimization - Performance, Accessibility, và Security
  - Implement performance optimizations, accessibility features, security hardening, và comprehensive testing
  - _Requirements: 13.6, 13.7, 13.8, 13.9, 13.10, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 14.10, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 15.10_

- [ ] 5.1 Implement Code Splitting
  - Use Next.js dynamic imports cho ContentEditor: `dynamic(() => import('@/components/editor/ContentEditor'), { ssr: false })`
  - Use dynamic imports cho RoadmapVisualization: `dynamic(() => import('@/components/roadmap/RoadmapVisualization'), { ssr: false })`
  - Add loading skeletons cho lazy-loaded components
  - Verify bundle size reduction với `pnpm analyze`
  - _Requirements: 14.1, 14.5_

- [ ] 5.2 Implement Image Optimization
  - Replace `<img>` tags với Next.js `<Image>` component
  - Configure image domains trong `next.config.js`
  - Add lazy loading: `loading="lazy"`
  - Add blur placeholders: `placeholder="blur"`
  - Optimize image formats (WebP, AVIF)
  - _Requirements: 14.4, 8.6_

- [ ] 5.3 Configure Apollo Client Caching
  - Update Apollo Client configuration trong `apps/web/src/lib/apollo-client.ts`
  - Configure InMemoryCache với type policies
  - Set fetchPolicy: 'cache-and-network' cho queries
  - Implement cache invalidation strategies
  - _Requirements: 14.3_

- [ ] 5.4 Implement Virtualization cho Large Roadmaps
  - Update RoadmapVisualization: enable virtualization khi nodes.length > 50
  - Configure React Flow: `onlyRenderVisibleElements={nodes.length > 50}`
  - Disable dragging và selection cho large roadmaps
  - Add performance warning message
  - _Requirements: 14.8_


- [ ] 5.5 Implement Link Prefetching
  - Update Link components: add `prefetch={true}` prop
  - Prefetch linked pages on hover
  - Configure prefetch strategy trong next.config.js
  - _Requirements: 14.7_

- [ ] 5.6 Add API Timeout Configuration
  - Configure Apollo Client với timeout: 30 seconds
  - Use AbortSignal.timeout(30000) trong fetch
  - Handle timeout errors gracefully
  - Show retry option to user
  - _Requirements: 14.10_

- [ ] 5.7 Implement Input Sanitization
  - Install DOMPurify: `pnpm add isomorphic-dompurify`
  - Create sanitization utility: `apps/web/src/lib/utils/sanitize.ts`
  - Sanitize HTML content từ editor trước khi save
  - Configure allowed tags và attributes
  - Sanitize on render as well (defense in depth)
  - _Requirements: 13.10_

- [ ]* 5.8 Write Property Test cho Content Sanitization
  - Tạo `apps/web/src/lib/utils/__tests__/sanitize.properties.spec.ts`
  - **Property 10: Content Sanitization Prevents XSS**
  - **Validates: Requirements 13.10**
  - Test: malicious scripts (script tags, event handlers, javascript: URLs) should be sanitized
  - Use fast-check to generate random XSS payloads
  - Verify all payloads escaped hoặc removed
  - _Requirements: 13.10_

- [ ] 5.9 Add Rate Limiting
  - Install @nestjs/throttler: `pnpm add @nestjs/throttler`
  - Configure ThrottlerModule trong app.module.ts: 10 requests per minute
  - Apply ThrottlerGuard to mutations
  - Return 429 Too Many Requests khi limit exceeded
  - _Requirements: Security (non-functional)_

- [ ] 5.10 Implement Keyboard Navigation
  - Audit all interactive elements: buttons, links, form inputs
  - Ensure tabIndex set correctly
  - Add keyboard event handlers: Enter, Space, Arrow keys
  - Test navigation với keyboard only
  - Add skip-to-content link
  - _Requirements: 15.1, 15.8_

- [ ] 5.11 Add ARIA Labels và Roles
  - Add aria-label to all icon buttons
  - Add role attributes: region, navigation, main, complementary
  - Add aria-describedby cho complex components
  - Add aria-required và aria-invalid cho form inputs
  - Add aria-live regions cho dynamic content
  - _Requirements: 15.2, 15.9, 15.10_

- [ ] 5.12 Implement Focus Management
  - Add focus trap trong modals với @headlessui/react FocusTrap
  - Focus main heading after navigation
  - Restore focus after modal close
  - Ensure focus visible với outline styles
  - _Requirements: 15.3_

- [ ] 5.13 Verify Color Contrast
  - Audit all text colors với contrast checker tool
  - Ensure minimum 4.5:1 contrast ratio cho normal text
  - Ensure minimum 3:1 contrast ratio cho large text
  - Update Tailwind config với WCAG AA compliant colors
  - _Requirements: 15.4_


- [ ] 5.14 Implement Touch Support
  - Add touch event handlers cho drag-and-drop
  - Ensure touch targets minimum 44x44px
  - Enable touch gestures trong React Flow: panOnDrag, zoomOnPinch, zoomOnScroll
  - Test on mobile devices (iOS, Android)
  - _Requirements: 15.7_

- [ ] 5.15 Add Error Boundaries
  - Create ErrorBoundary component: `apps/web/src/components/ErrorBoundary.tsx`
  - Wrap main app với ErrorBoundary
  - Display user-friendly error message
  - Log errors to Sentry
  - Provide reset button
  - _Requirements: 13.8_

- [ ] 5.16 Implement Error Logging với Sentry
  - Install Sentry: `pnpm add @sentry/nextjs @sentry/node`
  - Configure Sentry trong `sentry.client.config.ts` và `sentry.server.config.ts`
  - Set environment, tracesSampleRate
  - Filter sensitive data trong beforeSend
  - Test error reporting
  - _Requirements: 13.8_

- [ ]* 5.17 Write Property Test cho Slug Uniqueness
  - Tạo `apps/api/src/modules/article/__tests__/properties/slug-uniqueness.properties.spec.ts`
  - **Property 1: Slug Uniqueness Across All Nodes**
  - **Validates: Requirements 2.7, 5.5, 10.5, 13.3**
  - Test: creating node với duplicate slug should reject
  - Use fast-check to generate random node data
  - Verify ConflictException thrown
  - _Requirements: 2.7, 5.5, 10.5, 13.3_

- [ ]* 5.18 Write Property Test cho Node Creation Round-Trip
  - Tạo `apps/api/src/modules/article/__tests__/properties/round-trip.properties.spec.ts`
  - **Property 2: Node Creation Round-Trip Preservation**
  - **Validates: Requirements 2.6, 2.10, 5.3, 5.8, 10.7**
  - Test: getNode(createNode(data)).content ≈ data.content
  - Use fast-check to generate random valid node data
  - Verify data equivalence (excluding auto-generated fields)
  - _Requirements: 2.6, 2.10, 5.3, 5.8, 10.7_

- [ ]* 5.19 Write Property Test cho Authorization Enforcement
  - Tạo `apps/api/src/common/guards/__tests__/authorization.properties.spec.ts`
  - **Property 4: Authorization Enforcement for Mutations**
  - **Validates: Requirements 1.1, 1.4, 9.10, 9.11**
  - Test: non-admin users should be rejected với 403 Forbidden
  - Use fast-check to generate random user roles và mutation types
  - Verify ForbiddenException thrown cho non-admin
  - _Requirements: 1.1, 1.4, 9.10, 9.11_

- [ ]* 5.20 Write Property Test cho Validation Consistency
  - Tạo `packages/shared/validation/__tests__/validation-consistency.properties.spec.ts`
  - **Property 5: Validation Consistency Between Client and Server**
  - **Validates: Requirements 2.9, 5.7, 9.9, 13.6**
  - Test: client và server validation should reject với same errors
  - Use fast-check to generate random invalid inputs
  - Verify both Zod schemas reject với equivalent errors
  - _Requirements: 2.9, 5.7, 9.9, 13.6_

- [ ]* 5.21 Write Property Test cho Metadata Completeness
  - Tạo `apps/api/src/modules/article/__tests__/properties/metadata.properties.spec.ts`
  - **Property 11: Metadata Completeness Invariant**
  - **Validates: Requirements 2.10, 5.8**
  - Test: all created nodes must have complete metadata (author, createdAt, updatedAt)
  - Use fast-check to generate random nodes
  - Verify all metadata fields present và valid
  - _Requirements: 2.10, 5.8_


- [ ]* 5.22 Write Property Test cho Update Timestamp Monotonicity
  - Tạo `apps/api/src/modules/article/__tests__/properties/timestamp-monotonicity.properties.spec.ts`
  - **Property 12: Update Timestamp Monotonicity**
  - **Validates: Requirements 10.7**
  - Test: updatedAt after update > updatedAt before update
  - Use fast-check to generate random updates
  - Verify timestamp strictly increases
  - _Requirements: 10.7_

- [ ]* 5.23 Write Property Test cho Soft Delete Preservation
  - Tạo `apps/api/src/modules/article/__tests__/properties/soft-delete.properties.spec.ts`
  - **Property 13: Soft Delete Preservation**
  - **Validates: Requirements 10.8**
  - Test: deleted nodes should exist với isDeleted=true, absent từ public queries, present trong admin queries
  - Use fast-check to generate random nodes
  - Verify soft delete behavior
  - _Requirements: 10.8_

- [ ]* 5.24 Write Property Test cho Error Recovery
  - Tạo `apps/api/src/modules/article/__tests__/properties/error-recovery.properties.spec.ts`
  - **Property 15: Error Recovery Without Data Loss**
  - **Validates: Requirements 13.7, 13.8, 10.10**
  - Test: retry after error should eventually succeed với correct result
  - Use fast-check to inject random errors
  - Verify data integrity maintained
  - _Requirements: 13.7, 13.8, 10.10_

- [ ]* 5.25 Run Accessibility Audit
  - Use axe-core hoặc Lighthouse accessibility audit
  - Test với screen reader (NVDA, JAWS, VoiceOver)
  - Test keyboard navigation
  - Fix all critical và serious issues
  - Document remaining minor issues
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.8, 15.9, 15.10_

- [ ]* 5.26 Run Performance Testing
  - Use Lighthouse performance audit
  - Measure page load time (target: < 2s)
  - Measure API response time (target: < 500ms p95)
  - Measure editor input latency (target: < 100ms)
  - Measure roadmap render time (target: < 1s for 100 nodes)
  - Optimize bottlenecks
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 14.10_

- [ ]* 5.27 Run Security Audit
  - Test XSS prevention với malicious inputs
  - Test authentication bypass attempts
  - Test authorization bypass attempts
  - Test rate limiting
  - Test CORS configuration
  - Fix all security issues
  - _Requirements: 13.10, 1.1, 1.4, 9.10, 9.11_

- [ ] 5.28 Checkpoint - Verify Phase 5 Complete
  - Verify all performance optimizations working
  - Verify accessibility compliance (WCAG 2.1 AA)
  - Verify security hardening complete
  - Verify all property-based tests passing
  - Run full test suite: `pnpm turbo test`
  - Ensure all tests pass, ask user if questions arise


- [ ] 6. Phase 6: Documentation và Deployment - Final Documentation và Production Deployment
  - Create comprehensive documentation, setup monitoring, và deploy to production
  - _Requirements: All (documentation và deployment support)_

- [ ] 6.1 Create API Documentation
  - Document all GraphQL queries và mutations
  - Add examples cho each operation
  - Document input types và validation rules
  - Document error responses
  - Use GraphQL schema comments
  - Generate documentation với GraphQL Code Generator
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8_

- [ ] 6.2 Create Component Documentation
  - Document all shared components với JSDoc comments
  - Add usage examples
  - Document props và types
  - Add Storybook stories cho visual documentation
  - _Requirements: All component requirements_

- [ ] 6.3 Create User Guide
  - Write guide cho admin users: how to create Article, how to create Roadmap, how to use editor, how to build roadmap
  - Write guide cho regular users: how to navigate, how to search, how to view content
  - Add screenshots và videos
  - Publish to documentation site
  - _Requirements: All user-facing requirements_

- [ ] 6.4 Create Developer Guide
  - Document architecture và design decisions
  - Document tech stack và dependencies
  - Document development workflow
  - Document testing strategy
  - Document deployment process
  - Add troubleshooting section
  - _Requirements: All technical requirements_

- [ ] 6.5 Setup Monitoring với Vercel Analytics
  - Enable Vercel Analytics trong project settings
  - Configure custom events tracking
  - Setup performance monitoring
  - Setup error tracking
  - Create monitoring dashboard
  - _Requirements: Performance và reliability (non-functional)_

- [ ] 6.6 Setup Error Tracking với Sentry
  - Verify Sentry integration working
  - Configure alert rules: critical errors, high error rate
  - Setup Slack notifications
  - Create error dashboard
  - Test error reporting end-to-end
  - _Requirements: 13.8_

- [ ] 6.7 Configure Production Environment Variables
  - Setup environment variables trong Vercel
  - Configure Clerk production keys
  - Configure Convex production deployment
  - Configure Sentry DSN
  - Configure API URLs
  - Verify all secrets secure
  - _Requirements: Security (non-functional)_

- [ ] 6.8 Deploy to Production
  - Merge feature branch to main
  - Trigger production deployment via Vercel
  - Run smoke tests on production
  - Verify all features working
  - Monitor error rates và performance
  - _Requirements: All requirements_


- [ ] 6.9 Setup Backup Strategy
  - Configure Convex automatic backups
  - Document backup restoration process
  - Test backup restoration
  - Setup backup monitoring
  - _Requirements: Reliability (non-functional)_

- [ ] 6.10 Create Runbook cho Common Issues
  - Document common errors và solutions
  - Document rollback procedure
  - Document scaling procedures
  - Document incident response process
  - Add contact information
  - _Requirements: Operational support_

- [ ] 6.11 Final Checkpoint - Production Ready
  - Verify all documentation complete
  - Verify monitoring và alerting working
  - Verify production deployment successful
  - Verify backup strategy in place
  - Run full regression test suite
  - Get stakeholder sign-off
  - Ensure all tests pass, ask user if questions arise

## Notes

- Tasks marked với `*` are optional testing tasks và can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation và user feedback
- Property-based tests validate universal correctness properties
- Unit tests validate specific examples và edge cases
- Integration tests validate end-to-end flows
- E2E tests validate critical user journeys

## Estimated Timeline

- **Phase 1 (Foundation)**: 1-2 weeks
- **Phase 2 (Article Editor)**: 2-3 weeks
- **Phase 3 (Roadmap Builder)**: 3-4 weeks
- **Phase 4 (Navigation & Search)**: 1-2 weeks
- **Phase 5 (Polish & Optimization)**: 2-3 weeks
- **Phase 6 (Documentation & Deployment)**: 1 week

**Total Estimated Time**: 10-15 weeks

## Success Criteria

- ✅ All functional requirements implemented
- ✅ All acceptance criteria met
- ✅ All property-based tests passing
- ✅ Test coverage > 80%
- ✅ Performance targets met (page load < 2s, API < 500ms)
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Security audit passed
- ✅ Production deployment successful
- ✅ Documentation complete
- ✅ Monitoring và alerting operational

## Risk Mitigation

**High Priority Risks**:
1. **Editor Performance**: Implement virtual scrolling và lazy loading
2. **React Flow Performance**: Enable virtualization cho 50+ nodes
3. **XSS Attacks**: Strict input sanitization với DOMPurify
4. **Authorization Bypass**: Comprehensive testing và defense in depth
5. **Data Loss**: Local storage backup và retry logic

**Mitigation Strategy**: Address high priority risks trong Phase 5 với comprehensive testing và security audits.


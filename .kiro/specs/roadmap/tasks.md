# Kế hoạch Triển khai: Tính năng Roadmap

## Tổng quan

Tính năng Roadmap là chức năng cốt lõi của VizTechStack, cung cấp hệ thống trực quan hóa lộ trình học tập dựa trên đồ thị tương tác. Triển khai này bao gồm backend API (NestJS với kiến trúc hexagonal), database schema (Convex), và frontend components (React Flow visualization).

Hệ thống cho phép người dùng duyệt, xem và theo dõi tiến độ qua các roadmap công nghệ, trong khi admin có thể tạo và quản lý nội dung roadmap. Một tính năng đặc biệt là khả năng tái sử dụng skill nodes giữa các role roadmaps thông qua drag-and-drop.

## Nhiệm vụ

- [x] 1. Thiết lập cấu trúc dự án và schema cơ sở dữ liệu
  - [x] 1.1 Tạo Convex database schema cho roadmaps
    - Định nghĩa bảng `roadmaps` với các trường: id, slug, title, description, category, difficulty, nodesJson, edgesJson, topicCount, status, createdAt
    - Định nghĩa bảng `roadmapSummaries` để tối ưu hóa list queries
    - Định nghĩa bảng `topics` cho nội dung chi tiết của nodes
    - Định nghĩa bảng `progress` để theo dõi tiến độ người dùng
    - Định nghĩa bảng `bookmarks` cho tính năng đánh dấu yêu thích
    - Thêm indexes cho slug, category, status, createdAt
    - Tạo file `convex/roadmap/schema.ts`
    - _Yêu cầu: 1.1, 1.2, 1.4, 5.1, 7.1, 7.2, 10.1_

  - [ ]* 1.2 Viết property test cho round-trip serialization của graph data
    - **Property 7: Graph Data Round-Trip (Nodes)**
    - **Property 8: Graph Data Round-Trip (Edges)**
    - **Validates: Yêu cầu 2.1, 2.2, 7.1-7.5**

- [x] 2. Triển khai Domain Layer
  - [x] 2.1 Tạo domain entities
    - Tạo `RoadmapEntity` với các trường và phương thức serialize/parse cho nodesJson và edgesJson
    - Tạo `NodeEntity` và `EdgeEntity` cho graph data
    - Tạo `TopicEntity` cho nội dung chi tiết
    - Tạo `ProgressEntity` cho tracking
    - Tạo `BookmarkEntity` cho bookmarks
    - Tạo `RoadmapSummaryEntity` cho denormalized data
    - Tạo file trong `apps/api/src/modules/roadmap/domain/entities/`
    - _Yêu cầu: 2.1, 2.2, 3.1, 4.1, 6.1, 10.1_

  - [x] 2.2 Tạo domain errors
    - Tạo `RoadmapValidationDomainError` cho lỗi validation
    - Tạo `RoadmapNotFoundDomainError` cho lỗi không tìm thấy
    - Tạo `RoadmapDuplicateDomainError` cho lỗi trùng slug
    - Tạo `RoadmapAuthorizationDomainError` cho lỗi phân quyền
    - Tạo `RoadmapParsingDomainError` cho lỗi parse JSON
    - Tạo file trong `apps/api/src/modules/roadmap/domain/errors/`
    - _Yêu cầu: 5.2, 5.3, 5.6, 7.6_


  - [x] 2.3 Triển khai domain policies
    - Tạo `RoadmapInputPolicy` với các phương thức validation:
      - `validateSlug()` - kiểm tra format và tính duy nhất
      - `validateGraphData()` - kiểm tra cấu trúc JSON
      - `validateCategory()` - kiểm tra giá trị hợp lệ (role, skill, best-practice)
      - `validateDifficulty()` - kiểm tra giá trị hợp lệ (beginner, intermediate, advanced)
      - `validateStatus()` - kiểm tra giá trị hợp lệ (public, draft, private)
    - Tạo file `apps/api/src/modules/roadmap/domain/policies/roadmap-input.policy.ts`
    - _Yêu cầu: 5.1, 5.2, 8.1, 9.1_

  - [ ]* 2.4 Viết property tests cho domain policies
    - **Property 22: Slug Uniqueness Constraint**
    - **Property 31: Category Validation**
    - **Property 33: Difficulty Validation**
    - **Validates: Yêu cầu 5.2, 8.1, 9.1_

- [x] 3. Triển khai Infrastructure Layer - Repositories
  - [x] 3.1 Tạo repository interfaces (ports)
    - Định nghĩa `RoadmapRepository` interface với các phương thức:
      - `create()`, `update()`, `delete()`, `findBySlug()`, `findById()`, `list()`, `findSkillRoadmaps()`
    - Định nghĩa `TopicRepository` interface
    - Định nghĩa `ProgressRepository` interface
    - Định nghĩa `BookmarkRepository` interface
    - Tạo file trong `apps/api/src/modules/roadmap/application/ports/`
    - _Yêu cầu: 1.1, 2.4, 3.1, 4.1, 6.1_

  - [x] 3.2 Triển khai ConvexRoadmapRepository
    - Implement `RoadmapRepository` interface
    - Xử lý serialization/deserialization của nodesJson và edgesJson
    - Tự động tạo roadmapSummary khi tạo roadmap mới
    - Implement pagination với cursor-based approach
    - Implement filtering theo category và status
    - Tạo file `apps/api/src/modules/roadmap/infrastructure/adapters/convex-roadmap.repository.ts`
    - _Yêu cầu: 1.1, 1.2, 1.3, 5.1, 5.5, 7.1, 7.2, 8.2, 10.1_

  - [ ]* 3.3 Viết unit tests cho ConvexRoadmapRepository
    - Test create, update, delete operations
    - Test findBySlug với các trường hợp khác nhau
    - Test list với pagination và filtering
    - Mock Convex client
    - _Yêu cầu: 1.1, 1.2, 1.3, 5.1_

  - [x] 3.4 Triển khai ConvexTopicRepository
    - Implement `TopicRepository` interface
    - Xử lý markdown content và resources
    - Tạo file `apps/api/src/modules/roadmap/infrastructure/adapters/convex-topic.repository.ts`
    - _Yêu cầu: 4.1, 4.3, 4.4_

  - [x] 3.5 Triển khai ConvexProgressRepository
    - Implement `ProgressRepository` interface
    - Xử lý upsert logic để tránh duplicate records
    - Tạo file `apps/api/src/modules/roadmap/infrastructure/adapters/convex-progress.repository.ts`
    - _Yêu cầu: 3.1, 3.4_

  - [x] 3.6 Triển khai ConvexBookmarkRepository
    - Implement `BookmarkRepository` interface
    - Xử lý uniqueness constraint cho user-roadmap combination
    - Tạo file `apps/api/src/modules/roadmap/infrastructure/adapters/convex-bookmark.repository.ts`
    - _Yêu cầu: 6.1, 6.2, 6.5_


- [x] 4. Triển khai Application Layer - Commands và Queries
  - [x] 4.1 Tạo Commands cho write operations
    - Tạo `CreateRoadmapCommand` với validation
    - Tạo `UpdateRoadmapCommand` với validation
    - Tạo `DeleteRoadmapCommand`
    - Tạo `CreateTopicCommand`
    - Tạo `UpdateProgressCommand`
    - Tạo `AddBookmarkCommand`
    - Tạo `RemoveBookmarkCommand`
    - Tạo file trong `apps/api/src/modules/roadmap/application/commands/`
    - _Yêu cầu: 5.1, 3.1, 6.1, 6.2_

  - [ ]* 4.2 Viết property tests cho Commands
    - **Property 21: Roadmap Creation Required Fields**
    - **Property 15: Progress Update Idempotence**
    - **Property 29: Bookmark Uniqueness Constraint**
    - **Validates: Yêu cầu 5.1, 3.4, 6.5**

  - [x] 4.3 Tạo Queries cho read operations
    - Tạo `GetRoadmapBySlugQuery`
    - Tạo `ListRoadmapsQuery` với pagination và filtering
    - Tạo `GetSkillNodesQuery` cho drag-and-drop feature
    - Tạo `GetTopicByNodeIdQuery`
    - Tạo `GetProgressQuery`
    - Tạo `GetUserBookmarksQuery`
    - Tạo file trong `apps/api/src/modules/roadmap/application/queries/`
    - _Yêu cầu: 1.1, 1.2, 1.3, 2.4, 4.1, 3.3, 6.3, 11.1_

  - [ ]* 4.4 Viết property tests cho Queries
    - **Property 1: Roadmap List Ordering**
    - **Property 2: Pagination Page Size**
    - **Property 3: Category Filter Correctness**
    - **Property 5: Unauthenticated User Visibility**
    - **Property 6: Admin User Visibility**
    - **Validates: Yêu cầu 1.1, 1.2, 1.3, 1.5, 1.6**

  - [x] 4.5 Triển khai RoadmapApplicationService
    - Orchestrate commands và queries
    - Implement các phương thức:
      - `createRoadmap()`, `updateRoadmap()`, `deleteRoadmap()`
      - `getRoadmapBySlug()`, `listRoadmaps()`
      - `getSkillNodesForRoleRoadmap()`
    - Inject repositories qua dependency injection
    - Tạo file `apps/api/src/modules/roadmap/application/services/roadmap-application.service.ts`
    - _Yêu cầu: 1.1, 2.4, 5.1, 11.1_

  - [x] 4.6 Triển khai TopicApplicationService
    - Implement `createTopic()` và `getTopicByNodeId()`
    - Tạo file `apps/api/src/modules/roadmap/application/services/topic-application.service.ts`
    - _Yêu cầu: 4.1_

  - [x] 4.7 Triển khai ProgressApplicationService
    - Implement `updateProgress()` và `getProgressForRoadmap()`
    - Tạo file `apps/api/src/modules/roadmap/application/services/progress-application.service.ts`
    - _Yêu cầu: 3.1, 3.3_

  - [x] 4.8 Triển khai BookmarkApplicationService
    - Implement `addBookmark()`, `removeBookmark()`, `getUserBookmarks()`
    - Tạo file `apps/api/src/modules/roadmap/application/services/bookmark-application.service.ts`
    - _Yêu cầu: 6.1, 6.2, 6.3_

  - [ ]* 4.9 Viết unit tests cho Application Services
    - Test orchestration logic
    - Mock repositories
    - Test error handling
    - _Yêu cầu: 1.1, 2.4, 3.1, 4.1, 5.1, 6.1_


- [x] 5. Triển khai Transport Layer - GraphQL API
  - [x] 5.1 Tạo GraphQL schema definitions
    - Định nghĩa types: Roadmap, Node, Edge, Topic, Progress, Bookmark
    - Định nghĩa enums: RoadmapCategory, RoadmapDifficulty, RoadmapStatus, ProgressStatus, ResourceType
    - Định nghĩa inputs: CreateRoadmapInput, UpdateProgressInput, RoadmapFilters, PaginationInput
    - Định nghĩa queries và mutations
    - Tạo file `packages/shared/graphql-schema/src/roadmap.graphql`
    - _Yêu cầu: 1.1, 2.4, 3.1, 4.1, 5.1, 6.1_

  - [x] 5.2 Tạo GraphQL mappers
    - Tạo `RoadmapMapper` để chuyển đổi giữa Entity và GraphQL DTO
    - Tạo `TopicMapper`, `ProgressMapper`, `BookmarkMapper`
    - Xử lý parsing nodesJson/edgesJson thành arrays
    - Tạo file trong `apps/api/src/modules/roadmap/transport/graphql/mappers/`
    - _Yêu cầu: 2.1, 2.2, 7.1, 7.2_

  - [x] 5.3 Triển khai GraphQL resolvers
    - Tạo `RoadmapResolver` với queries:
      - `getRoadmapBySlug()`, `listRoadmaps()`, `getSkillNodesForRoleRoadmap()`
    - Tạo `RoadmapResolver` với mutations:
      - `createRoadmap()`, `updateRoadmap()`, `deleteRoadmap()`
    - Tạo `TopicResolver` với queries và mutations
    - Tạo `ProgressResolver` với queries và mutations
    - Tạo `BookmarkResolver` với queries và mutations
    - Apply guards: `@UseGuards(ClerkAuthGuard, RolesGuard)`
    - Apply decorators: `@Public()` cho public queries, `@Roles('admin')` cho admin mutations
    - Tạo file trong `apps/api/src/modules/roadmap/transport/graphql/resolvers/`
    - _Yêu cầu: 1.1, 1.5, 1.6, 2.4, 2.5, 3.1, 4.1, 5.1, 5.6, 6.1_

  - [ ]* 5.4 Viết property tests cho authorization
    - **Property 9: Public Roadmap Access**
    - **Property 10: Non-Public Roadmap Access Restriction**
    - **Property 25: Non-Admin Creation Restriction**
    - **Validates: Yêu cầu 2.4, 2.5, 5.6**

  - [x] 5.5 Tạo GraphQL exception filters
    - Tạo `RoadmapExceptionFilter` để map domain errors sang GraphQL errors
    - Map status codes: 400, 403, 404, 409, 422
    - Tạo file `apps/api/src/modules/roadmap/transport/graphql/filters/roadmap-exception.filter.ts`
    - _Yêu cầu: 5.2, 5.3, 5.6, 7.6_

  - [x] 5.6 Cấu hình NestJS module
    - Tạo `RoadmapModule` với providers, controllers, imports
    - Bind repository interfaces với implementations qua DI
    - Register guards và filters
    - Tạo file `apps/api/src/modules/roadmap/roadmap.module.ts`
    - _Yêu cầu: Tất cả_

- [x] 6. Checkpoint - Kiểm tra backend implementation
  - Đảm bảo tất cả tests pass
  - Kiểm tra GraphQL schema được generate đúng
  - Hỏi người dùng nếu có thắc mắc


- [ ] 7. Chạy GraphQL Code Generation
  - [x] 7.1 Cập nhật codegen.ts configuration
    - Đảm bảo roadmap.graphql được include trong source files
    - Kiểm tra output paths cho generated types và Zod schemas
    - _Yêu cầu: Tất cả_

  - [x] 7.2 Generate TypeScript types và Zod schemas
    - Chạy `pnpm codegen` để generate types từ GraphQL schema
    - Verify generated files trong `packages/shared/graphql-generated/`
    - Kiểm tra types cho Roadmap, Node, Edge, Topic, Progress, Bookmark
    - _Yêu cầu: Tất cả_

- [x] 8. Triển khai Frontend Components - Roadmap List
  - [x] 8.1 Tạo RoadmapList component
    - Sử dụng Apollo Client để query `listRoadmaps`
    - Hiển thị roadmap cards với title, description, category, difficulty, topicCount
    - Implement pagination với "Load More" button
    - Implement category filter dropdown
    - Xử lý loading và error states
    - Tạo file `apps/web/src/components/roadmap/RoadmapList.tsx`
    - _Yêu cầu: 1.1, 1.2, 1.3, 1.4, 8.2_

  - [x] 8.2 Tạo RoadmapCard component
    - Hiển thị roadmap summary information
    - Hiển thị category badge và difficulty badge
    - Link đến roadmap detail page
    - Hiển thị bookmark button cho authenticated users
    - Tạo file `apps/web/src/components/roadmap/RoadmapCard.tsx`
    - _Yêu cầu: 1.4, 6.1, 9.2_

  - [x] 8.3 Tạo CategoryFilter component
    - Dropdown với options: All, Role, Skill, Best Practice
    - Update query variables khi filter changes
    - Tạo file `apps/web/src/components/roadmap/CategoryFilter.tsx`
    - _Yêu cầu: 1.3, 8.1, 8.2_

  - [ ]* 8.4 Viết unit tests cho RoadmapList components
    - Test rendering với mock data
    - Test pagination behavior
    - Test filter behavior
    - Mock Apollo Client
    - _Yêu cầu: 1.1, 1.2, 1.3, 1.4_

- [x] 9. Triển khai Frontend Components - Roadmap Viewer
  - [x] 9.1 Tạo RoadmapViewer component
    - Sử dụng React Flow để render graph
    - Query `getRoadmapBySlug` để lấy roadmap data
    - Parse nodes và edges từ roadmap data
    - Implement zoom, pan, fit-to-view controls
    - Hiển thị node với custom styling
    - Handle node click để show topic content
    - Tạo file `apps/web/src/components/roadmap/RoadmapViewer.tsx`
    - _Yêu cầu: 2.1, 2.2, 2.3, 2.4_

  - [x] 9.2 Tạo custom Node component cho React Flow
    - Hiển thị node label
    - Hiển thị progress status indicator (colored border/badge)
    - Handle click events
    - Support different node types
    - Tạo file `apps/web/src/components/roadmap/RoadmapNode.tsx`
    - _Yêu cầu: 2.3, 3.3_

  - [x] 9.3 Tạo RoadmapControls component
    - Zoom in/out buttons
    - Fit to view button
    - Reset view button
    - Tạo file `apps/web/src/components/roadmap/RoadmapControls.tsx`
    - _Yêu cầu: 2.1, 2.2_

  - [ ]* 9.4 Viết unit tests cho RoadmapViewer components
    - Test rendering với mock roadmap data
    - Test node interactions
    - Test controls functionality
    - Mock React Flow
    - _Yêu cầu: 2.1, 2.2, 2.3_


- [x] 10. Triển khai Frontend Components - Topic Panel
  - [x] 10.1 Tạo TopicPanel component
    - Query `getTopicByNodeId` khi node được click
    - Hiển thị topic title và content
    - Parse và render markdown content as HTML
    - Hiển thị learning resources list
    - Implement modal hoặc side panel UI
    - Tạo file `apps/web/src/components/roadmap/TopicPanel.tsx`
    - _Yêu cầu: 4.1, 4.2, 4.3, 4.4_

  - [x] 10.2 Tạo ResourceList component
    - Hiển thị resources với title, URL, và type
    - Hiển thị icon theo resource type (article/video/course)
    - External links mở trong tab mới
    - Tạo file `apps/web/src/components/roadmap/ResourceList.tsx`
    - _Yêu cầu: 4.4, 4.5_

  - [x] 10.3 Tạo MarkdownRenderer component
    - Sử dụng markdown parser (react-markdown hoặc marked)
    - Sanitize HTML để prevent XSS
    - Apply styling cho markdown elements
    - Support code blocks với syntax highlighting
    - Tạo file `apps/web/src/components/roadmap/MarkdownRenderer.tsx`
    - _Yêu cầu: 4.2_

  - [ ]* 10.4 Viết unit tests cho TopicPanel components
    - Test rendering với mock topic data
    - Test markdown parsing
    - Test resource list rendering
    - _Yêu cầu: 4.1, 4.2, 4.3, 4.4_

- [ ] 11. Triển khai Frontend Components - Progress Tracking
  - [x] 11.1 Tạo ProgressTracker component
    - Query `getProgressForRoadmap` để lấy user progress
    - Hiển thị status buttons (Done, In Progress, Skipped)
    - Mutation `updateProgress` khi user clicks button
    - Update local cache sau mutation
    - Chỉ hiển thị cho authenticated users
    - Tạo file `apps/web/src/components/roadmap/ProgressTracker.tsx`
    - _Yêu cầu: 3.1, 3.2, 3.3, 3.4_

  - [x] 11.2 Integrate ProgressTracker với RoadmapViewer
    - Hiển thị progress status trên nodes
    - Update node styling dựa trên progress status
    - Show ProgressTracker UI khi node được select
    - _Yêu cầu: 3.3_

  - [ ]* 11.3 Viết property tests cho progress tracking
    - **Property 12: Progress Tracking Round-Trip**
    - **Property 13: Progress Status Validation**
    - **Property 14: Progress Retrieval Completeness**
    - **Validates: Yêu cầu 3.1, 3.2, 3.3**

- [ ] 12. Triển khai Frontend Components - Bookmark Management
  - [x] 12.1 Tạo BookmarkButton component
    - Mutation `addBookmark` và `removeBookmark`
    - Toggle bookmark state
    - Hiển thị bookmarked state với icon
    - Chỉ hiển thị cho authenticated users
    - Tạo file `apps/web/src/components/roadmap/BookmarkButton.tsx`
    - _Yêu cầu: 6.1, 6.2_

  - [x] 12.2 Tạo BookmarkedRoadmapsList component
    - Query `getUserBookmarks` để lấy bookmarked roadmaps
    - Hiển thị list of bookmarked roadmaps
    - Reuse RoadmapCard component
    - Tạo file `apps/web/src/components/roadmap/BookmarkedRoadmapsList.tsx`
    - _Yêu cầu: 6.3, 6.4_

  - [ ]* 12.3 Viết property tests cho bookmark management
    - **Property 26: Bookmark Creation Round-Trip**
    - **Property 27: Bookmark Deletion Completeness**
    - **Property 28: Bookmark Query Includes Summaries**
    - **Validates: Yêu cầu 6.1, 6.2, 6.4**


- [x] 13. Checkpoint - Kiểm tra frontend basic features
  - Đảm bảo tất cả tests pass
  - Test manually: list, view, progress tracking, bookmarks
  <!-- - Hỏi người dùng nếu có thắc mắc -->

- [ ] 14. Triển khai Drag-and-Drop Node Reuse Feature (Requirement 11)
  - [x] 14.1 Tạo NodeSidebar component
    - Query `getSkillNodesForRoleRoadmap` để lấy available skill nodes
    - Hiển thị list of skill nodes với search/filter
    - Implement drag source cho skill nodes
    - Hiển thị node preview với title và description
    - Chỉ hiển thị khi editing role roadmaps
    - Tạo file `apps/web/src/components/roadmap/NodeSidebar.tsx`
    - _Yêu cầu: 11.1, 11.2_

  - [x] 14.2 Tạo RoadmapEditor component
    - Extend RoadmapViewer với editing capabilities
    - Implement drop target cho skill nodes từ sidebar
    - Handle node position updates
    - Handle edge creation/deletion
    - Mutation `updateRoadmap` để save changes
    - Debounce mutations để tránh excessive API calls
    - Tạo file `apps/web/src/components/roadmap/RoadmapEditor.tsx`
    - _Yêu cầu: 11.3, 11.4_

  - [x] 14.3 Implement drag-and-drop logic
    - Sử dụng React Flow's drag-and-drop API
    - Handle onDrop event để add node to canvas
    - Set node metadata: `isReusedSkillNode: true`, `originalRoadmapId`
    - Update nodesJson với new node
    - Validate JSON structure trước khi save
    - _Yêu cầu: 11.3, 11.4_

  - [x] 14.4 Setup Convex real-time subscriptions
    - Subscribe to roadmap changes trong RoadmapEditor
    - Update local state khi Convex broadcasts changes
    - Handle concurrent edits (last-write-wins)
    - Show notification khi other users make changes
    - _Yêu cầu: 11.6_

  - [ ]* 14.5 Viết property tests cho node reuse
    - **Property 36: Skill Node Query Filtering**
    - **Property 37: Node Addition Preserves JSON Validity**
    - **Property 38: Reused Node Metadata Presence**
    - **Property 39: Node Reference Tracking**
    - **Validates: Yêu cầu 11.1, 11.3, 11.4, 11.5**

  - [ ]* 14.6 Viết integration tests cho drag-and-drop
    - Test drag skill node from sidebar to canvas
    - Test node metadata is set correctly
    - Test save functionality
    - Test real-time sync
    - _Yêu cầu: 11.3, 11.4, 11.6_

- [ ] 15. Triển khai Admin Features - Roadmap Creation
  - [x] 15.1 Tạo CreateRoadmapForm component
    - Form với fields: slug, title, description, category, difficulty, status
    - Validation với Zod schemas
    - Mutation `createRoadmap` on submit
    - Handle success và error states
    - Redirect to editor sau khi create thành công
    - Chỉ accessible cho admin users
    - Tạo file `apps/web/src/components/roadmap/CreateRoadmapForm.tsx`
    - _Yêu cầu: 5.1, 5.2, 5.6_

  - [x] 15.2 Tạo RoadmapFormFields component
    - Reusable form fields cho create và update
    - Input cho slug (với validation)
    - Input cho title và description
    - Select cho category, difficulty, status
    - Tạo file `apps/web/src/components/roadmap/RoadmapFormFields.tsx`
    - _Yêu cầu: 5.1, 8.1, 9.1_

  - [ ]* 15.3 Viết unit tests cho CreateRoadmapForm
    - Test form validation
    - Test submission
    - Test error handling
    - _Yêu cầu: 5.1, 5.2_


- [ ] 16. Triển khai Admin Features - Topic Management
  - [x] 16.1 Tạo CreateTopicForm component
    - Form với fields: nodeId, title, content (markdown editor), resources
    - Markdown editor với preview
    - Dynamic resource list (add/remove resources)
    - Mutation `createTopic` on submit
    - Tạo file `apps/web/src/components/roadmap/CreateTopicForm.tsx`
    - _Yêu cầu: 4.1, 4.3, 4.4_

  - [x] 16.2 Tạo ResourceFormFields component
    - Input cho resource title, URL, type
    - Add/remove resource buttons
    - Validation cho URL format
    - Tạo file `apps/web/src/components/roadmap/ResourceFormFields.tsx`
    - _Yêu cầu: 4.4, 4.5_

  - [x] 16.3 Integrate topic creation với RoadmapEditor
    - Show "Add Topic" button trên nodes chưa có topic
    - Open CreateTopicForm modal khi click
    - Update node data với topicId sau khi create
    - _Yêu cầu: 4.1_

  - [ ]* 16.4 Viết unit tests cho topic management
    - Test form validation
    - Test markdown editor
    - Test resource management
    - _Yêu cầu: 4.1, 4.3, 4.4_

- [x] 17. Triển khai Next.js Pages và Routing
  - [x] 17.1 Tạo roadmaps list page
    - Page route: `/roadmaps`
    - Render RoadmapList component
    - Server-side rendering với Apollo Client
    - SEO metadata
    - Tạo file `apps/web/src/app/roadmaps/page.tsx`
    - _Yêu cầu: 1.1_

  - [x] 17.2 Tạo roadmap detail page
    - Page route: `/roadmaps/[slug]`
    - Render RoadmapViewer component
    - Handle authentication state
    - Handle not found case
    - SEO metadata với roadmap info
    - Tạo file `apps/web/src/app/roadmaps/[slug]/page.tsx`
    - _Yêu cầu: 2.4, 2.5, 2.6_

  - [x] 17.3 Tạo roadmap editor page (admin only)
    - Page route: `/admin/roadmaps/[slug]/edit`
    - Render RoadmapEditor component
    - Protect route với admin guard
    - Tạo file `apps/web/src/app/admin/roadmaps/[slug]/edit/page.tsx`
    - _Yêu cầu: 5.6, 11.3_

  - [x] 17.4 Tạo create roadmap page (admin only)
    - Page route: `/admin/roadmaps/new`
    - Render CreateRoadmapForm component
    - Protect route với admin guard
    - Tạo file `apps/web/src/app/admin/roadmaps/new/page.tsx`
    - _Yêu cầu: 5.1, 5.6_

  - [x] 17.5 Tạo bookmarked roadmaps page
    - Page route: `/my/bookmarks`
    - Render BookmarkedRoadmapsList component
    - Require authentication
    - Tạo file `apps/web/src/app/my/bookmarks/page.tsx`
    - _Yêu cầu: 6.3, 6.4_

- [x] 18. Checkpoint - Kiểm tra full feature integration
  - Đảm bảo tất cả tests pass
  - Test manually: tất cả user flows và admin flows
  - Test authentication và authorization
  - Test drag-and-drop và real-time sync
  - Hỏi người dùng nếu có thắc mắc


- [x] 19. Error Handling và Edge Cases
  - [x] 19.1 Implement comprehensive error handling
    - Handle network errors trong GraphQL queries/mutations
    - Display user-friendly error messages
    - Implement retry logic cho failed requests
    - Log errors cho debugging
    - _Yêu cầu: 5.2, 5.3, 7.6_

  - [x] 19.2 Handle edge cases
    - Empty roadmap list
    - Roadmap với no nodes/edges
    - Invalid JSON trong nodesJson/edgesJson
    - Concurrent edits conflicts
    - Slow network conditions
    - _Yêu cầu: 2.6, 7.6, 11.6_

  - [ ]* 19.3 Viết property tests cho error handling
    - **Property 11: Non-Existent Roadmap Handling**
    - **Property 30: Invalid JSON Error Handling**
    - **Validates: Yêu cầu 2.6, 7.6**

- [x] 20. Performance Optimization
  - [x] 20.1 Optimize GraphQL queries
    - Implement query batching
    - Use Apollo Client cache effectively
    - Implement pagination cursors correctly
    - Avoid over-fetching data
    - _Yêu cầu: 1.2, 3.5_

  - [x] 20.2 Optimize React Flow rendering
    - Memoize node và edge components
    - Use React.memo cho expensive components
    - Debounce position updates
    - Lazy load topic content
    - _Yêu cầu: 2.1, 2.2_

  - [x] 20.3 Optimize Convex queries
    - Use indexes effectively
    - Avoid parsing JSON trong list queries (use summaries)
    - Implement efficient filtering
    - _Yêu cầu: 1.1, 1.2, 1.3, 10.3_

- [-] 21. Testing và Quality Assurance
  - [ ] 21.1 Chạy tất cả unit tests
    - Verify coverage thresholds (25% minimum)
    - Fix failing tests
    - _Yêu cầu: Tất cả_

  - [ ] 21.2 Chạy tất cả property-based tests
    - Verify 100 iterations per property test
    - Fix failing properties
    - Document any discovered edge cases
    - _Yêu cầu: Tất cả_

  - [ ] 21.3 Run integration tests
    - Test end-to-end user flows
    - Test admin workflows
    - Test authentication và authorization
    - _Yêu cầu: Tất cả_

  - [ ] 21.4 Manual testing
    - Test trên different browsers
    - Test responsive design
    - Test accessibility (keyboard navigation, screen readers)
    - Test performance với large roadmaps
    - _Yêu cầu: Tất cả_

  - [x] 21.5 Code quality checks
    - Run `pnpm lint` và fix issues
    - Run `pnpm typecheck` và fix type errors
    - Run `pnpm check:no-any` và eliminate 'any' types
    - Run `pnpm format` để format code
    - _Yêu cầu: Tất cả_


- [-] 22. Documentation Updates
  - [x] 22.1 Cập nhật architecture documentation
    - Document roadmap module architecture trong `.docs/architecture/`
    - Explain hexagonal architecture implementation
    - Document data flow patterns
    - Add diagrams nếu cần
    - _Yêu cầu: Tất cả_

  - [ ] 22.2 Cập nhật API documentation
    - Document GraphQL schema trong README
    - Add examples cho queries và mutations
    - Document authentication requirements
    - Document error codes và messages
    - _Yêu cầu: Tất cả_

  - [ ] 22.3 Cập nhật component documentation
    - Add JSDoc comments cho components
    - Document props và usage examples
    - Add Storybook stories nếu có
    - _Yêu cầu: Tất cả_

  - [ ] 22.4 Cập nhật steering rules
    - Update `.kiro/steering/structure.md` với roadmap module structure
    - Update `.kiro/steering/product.md` với roadmap features
    - Add conventions cho roadmap development
    - _Yêu cầu: Tất cả_

  - [ ] 22.5 Tạo user guide
    - Document how to browse roadmaps
    - Document how to track progress
    - Document how to bookmark roadmaps
    - Document admin features (create, edit, manage)
    - _Yêu cầu: Tất cả_

- [x] 23. Deployment Preparation
  - [x] 23.1 Environment configuration
    - Verify environment variables trong `.env.example`
    - Document required Convex configuration
    - Document Clerk configuration
    - _Yêu cầu: Tất cả_

  - [x] 23.2 Database migration
    - Verify Convex schema deployment
    - Test với production-like data
    - Prepare rollback plan
    - _Yêu cầu: 1.1, 10.1_

  - [x] 23.3 Build và deployment testing
    - Run `pnpm build` và verify success
    - Test production build locally
    - Verify Vercel deployment configuration
    - _Yêu cầu: Tất cả_

- [x] 24. Final Checkpoint và Review
  - Đảm bảo tất cả tests pass (unit, property-based, integration)
  - Verify code coverage meets thresholds
  - Review code quality và best practices
  - Verify documentation completeness
  - Test deployment readiness
  - Hỏi người dùng để final approval

## Ghi chú

- Tasks được đánh dấu `*` là optional và có thể skip để có MVP nhanh hơn
- Mỗi task tham chiếu đến requirements cụ thể để dễ traceability
- Checkpoints đảm bảo validation từng bước
- Property tests validate các correctness properties phổ quát
- Unit tests validate các examples và edge cases cụ thể
- Tất cả code phải tuân thủ project conventions (naming, structure, imports)
- Sử dụng TypeScript strict mode và tránh 'any' types
- Follow hexagonal architecture pattern cho backend
- Sử dụng Convex real-time capabilities cho collaborative editing
- Implement proper error handling và user feedback
- Optimize performance cho large roadmaps (100+ nodes)

## Tech Stack Summary

- **Backend**: NestJS 11.0.1, Apollo Server 5.4.0, Convex
- **Frontend**: Next.js 16.1.6, React 19.2.3, React Flow, Apollo Client 3.8.8
- **Testing**: Jest 30.0.0, fast-check (property-based testing)
- **Authentication**: Clerk JWT validation
- **Code Generation**: GraphQL Codegen
- **Styling**: Tailwind CSS 4, shadcn/ui

## Implementation Order Rationale

1. **Database First**: Schema là foundation cho tất cả
2. **Domain Layer**: Business logic không phụ thuộc vào infrastructure
3. **Infrastructure**: Repositories implement domain contracts
4. **Application Layer**: Orchestrate use cases
5. **Transport Layer**: Expose API endpoints
6. **Code Generation**: Generate types từ GraphQL schema
7. **Frontend Basic**: List, view, basic interactions
8. **Frontend Advanced**: Drag-and-drop, real-time sync
9. **Admin Features**: Create, edit, manage
10. **Polish**: Error handling, optimization, documentation

# Requirements Document - Node Management System

## Introduction

Hệ thống quản lý node là một tính năng toàn diện cho phép người dùng tạo, quản lý và điều hướng giữa hai loại node: Article và Roadmap. Hệ thống này cung cấp khả năng tạo nội dung giống Notion cho Article nodes và khả năng trực quan hóa tương tác với drag-and-drop cho Roadmap nodes. Người dùng có thể điều hướng liền mạch giữa các nodes và xây dựng các roadmap phức tạp từ các article nodes có sẵn.

## Glossary

- **Node**: Đơn vị nội dung cơ bản trong hệ thống, có thể là Article hoặc Roadmap
- **Article_Node**: Node chứa nội dung văn bản với editor giống Notion
- **Roadmap_Node**: Node chứa visualization của các nodes khác được sắp xếp theo roadmap
- **Admin_User**: Người dùng có quyền tạo và quản lý nodes
- **Node_Switch**: Nút chuyển đổi để chọn loại node (Article/Roadmap) khi tạo
- **Roadmap_Visualization**: Component hiển thị và cho phép tương tác với roadmap sử dụng React Flow
- **Node_Sidebar**: Thanh bên chứa danh sách các nodes có sẵn để kéo vào roadmap
- **Content_Editor**: Editor giống Notion để tạo và chỉnh sửa nội dung Article
- **Node_Slug**: Định danh duy nhất dạng URL-friendly cho mỗi node
- **GraphQL_API**: API backend sử dụng NestJS và Apollo Server
- **Convex_Database**: Cơ sở dữ liệu serverless lưu trữ node data
- **Clerk_Auth**: Hệ thống xác thực và phân quyền người dùng

## Requirements

### Requirement 1: Phân quyền tạo Node

**User Story:** Là một admin user, tôi muốn có quyền tạo nodes, để tôi có thể quản lý nội dung trong hệ thống.

#### Acceptance Criteria

1. THE Clerk_Auth SHALL xác thực người dùng có role admin
2. WHEN Admin_User truy cập trang tạo node, THE System SHALL hiển thị Node_Switch
3. THE Node_Switch SHALL cho phép chọn giữa Article và Roadmap
4. IF người dùng không phải admin, THEN THE System SHALL từ chối quyền truy cập trang tạo node
5. THE System SHALL log mọi attempt tạo node với user ID và timestamp

### Requirement 2: Tạo Article Node

**User Story:** Là một admin user, tôi muốn tạo Article node với editor giống Notion, để tôi có thể viết nội dung chi tiết.

#### Acceptance Criteria

1. WHEN Admin_User chọn Article từ Node_Switch, THE System SHALL hiển thị Content_Editor
2. THE Content_Editor SHALL hỗ trợ rich text formatting (bold, italic, headings, lists)
3. THE Content_Editor SHALL hỗ trợ blocks (paragraphs, images, code blocks, quotes)
4. THE Content_Editor SHALL tự động lưu draft mỗi 30 giây
5. WHEN Admin_User nhấn nút Save, THE System SHALL validate nội dung
6. WHEN validation thành công, THE GraphQL_API SHALL tạo Article_Node trong Convex_Database
7. THE System SHALL generate Node_Slug duy nhất từ title
8. WHEN Article_Node được tạo thành công, THE System SHALL redirect đến /article/[slug]
9. IF validation thất bại, THEN THE System SHALL hiển thị error messages cụ thể
10. FOR ALL Article_Node được tạo, THE System SHALL lưu metadata (author, createdAt, updatedAt)

### Requirement 3: Tạo Roadmap Node - Layout và UI

**User Story:** Là một admin user, tôi muốn tạo Roadmap node với layout split-screen, để tôi có thể cấu hình roadmap trong khi xem visualization.

#### Acceptance Criteria

1. WHEN Admin_User chọn Roadmap từ Node_Switch, THE System SHALL hiển thị split layout
2. THE System SHALL hiển thị form fields ở bên trái màn hình
3. THE System SHALL hiển thị Roadmap_Visualization ở bên phải màn hình
4. THE form fields SHALL bao gồm: title, description, tags, visibility settings
5. THE Roadmap_Visualization SHALL chiếm 60% chiều rộng màn hình
6. THE form fields SHALL chiếm 40% chiều rộng màn hình
7. WHILE màn hình nhỏ hơn 768px, THE System SHALL chuyển sang layout vertical
8. THE System SHALL đồng bộ real-time giữa form và visualization

### Requirement 4: Node Sidebar và Drag-and-Drop

**User Story:** Là một admin user, tôi muốn kéo thả các Article nodes và Roadnap  nodes có sẵn vào roadmap visualization, để tôi có thể xây dựng roadmap một cách trực quan.

#### Acceptance Criteria

1. THE Roadmap_Visualization SHALL hiển thị Node_Sidebar ở phía dưới
2. WHEN page load, THE GraphQL_API SHALL fetch tất cả Article_Node và Roadnap  nodes có sẵn
3. THE Node_Sidebar SHALL hiển thị danh sách Article_Node dạng draggable items
4. IF không có Article_Node nào, THEN THE System SHALL hiển thị warning message "Bạn phải tạo node (article) trước"
5. THE warning message SHALL bao gồm link đến trang tạo Article
6. WHEN Admin_User kéo Article_Node từ sidebar, THE System SHALL hiển thị drag preview
7. WHEN Admin_User thả node vào Roadmap_Visualization, THE System SHALL thêm node vào position đó
8. THE System SHALL tự động tạo connections giữa các nodes khi thả gần nhau
9. THE Roadmap_Visualization SHALL cho phép di chuyển và sắp xếp lại nodes
10. THE Roadmap_Visualization SHALL cho phép xóa nodes khỏi roadmap
11. FOR ALL drag-and-drop operations, THE System SHALL validate vị trí hợp lệ

### Requirement 5: Lưu Roadmap Node

**User Story:** Là một admin user, tôi muốn lưu roadmap đã tạo, để tôi có thể chia sẻ và xem lại sau.

#### Acceptance Criteria

1. WHEN Admin_User nhấn nút "Tạo Roadmap", THE System SHALL validate form fields
2. THE System SHALL validate ít nhất một Article_Node được thêm vào roadmap
3. WHEN validation thành công, THE GraphQL_API SHALL tạo Roadmap_Node trong Convex_Database
4. THE System SHALL lưu roadmap structure (nodes, positions, connections)
5. THE System SHALL generate Node_Slug duy nhất từ roadmap title
6. WHEN Roadmap_Node được tạo thành công, THE System SHALL redirect đến /roadmap/[slug]
7. IF validation thất bại, THEN THE System SHALL hiển thị error messages với field cụ thể
8. THE System SHALL lưu metadata (author, createdAt, updatedAt, nodeCount)

### Requirement 6: Hiển thị Roadmap View Page

**User Story:** Là một user, tôi muốn xem roadmap với content và visualization, để tôi có thể hiểu roadmap một cách toàn diện.

#### Acceptance Criteria

1. WHEN user truy cập /roadmap/[slug], THE GraphQL_API SHALL fetch Roadmap_Node data
2. THE System SHALL hiển thị roadmap content ở phần trên
3. THE System SHALL hiển thị Roadmap_Visualization ở phần dưới
4. THE Roadmap_Visualization SHALL hiển thị explanatory notes ở góc trên bên phải
5. THE explanatory notes SHALL giải thích cách sử dụng và điều hướng roadmap
6. THE Roadmap_Visualization SHALL render tất cả nodes với positions đã lưu
7. THE Roadmap_Visualization SHALL render connections giữa các nodes
8. THE nodes trong visualization SHALL có màu sắc khác nhau cho Article và Roadmap
9. IF Roadmap_Node không tồn tại, THEN THE System SHALL hiển thị 404 page
10. THE System SHALL track page views cho analytics

### Requirement 7: Navigation giữa Nodes

**User Story:** Là một user, tôi muốn click vào nodes trong visualization để navigate, để tôi có thể khám phá nội dung liên quan.

#### Acceptance Criteria

1. WHEN user click vào Article_Node trong Roadmap_Visualization, THE System SHALL navigate đến /article/[slug]
2. WHEN user click vào Roadmap_Node trong Roadmap_Visualization, THE System SHALL navigate đến /roadmap/[slug]
3. THE System SHALL hiển thị loading state trong khi navigate
4. THE System SHALL preserve browser history cho back/forward navigation
5. WHEN hover trên node, THE System SHALL hiển thị tooltip với node title và type
6. THE System SHALL highlight node khi hover
7. THE System SHALL thay đổi cursor thành pointer khi hover trên clickable node
8. FOR ALL navigation actions, THE System SHALL log analytics events

### Requirement 8: Hiển thị Article View Page

**User Story:** Là một user, tôi muốn xem Article với UI giống Notion, để tôi có thể đọc nội dung một cách thoải mái.

#### Acceptance Criteria

1. WHEN user truy cập /article/[slug], THE GraphQL_API SHALL fetch Article_Node data
2. THE System SHALL render nội dung với formatting giống Notion
3. THE System SHALL hỗ trợ responsive layout cho mobile và desktop
4. THE System SHALL hiển thị metadata (author, publish date, reading time)
5. THE System SHALL hiển thị breadcrumb navigation nếu article thuộc roadmap
6. THE System SHALL render images với lazy loading
7. THE System SHALL render code blocks với syntax highlighting
8. IF Article_Node không tồn tại, THEN THE System SHALL hiển thị 404 page
9. THE System SHALL track reading time và scroll depth cho analytics
10. THE System SHALL hiển thị related articles ở cuối trang

### Requirement 9: GraphQL API cho Node Management

**User Story:** Là một developer, tôi muốn có GraphQL API đầy đủ cho node operations, để frontend có thể tương tác với backend một cách type-safe.

#### Acceptance Criteria

1. THE GraphQL_API SHALL cung cấp mutation createArticleNode
2. THE GraphQL_API SHALL cung cấp mutation createRoadmapNode
3. THE GraphQL_API SHALL cung cấp mutation updateArticleNode
4. THE GraphQL_API SHALL cung cấp mutation updateRoadmapNode
5. THE GraphQL_API SHALL cung cấp mutation deleteNode
6. THE GraphQL_API SHALL cung cấp query getNodeBySlug
7. THE GraphQL_API SHALL cung cấp query listArticleNodes
8. THE GraphQL_API SHALL cung cấp query listRoadmapNodes
9. THE GraphQL_API SHALL validate input với Zod schemas
10. THE GraphQL_API SHALL require authentication cho tất cả mutations
11. THE GraphQL_API SHALL require admin role cho create và delete operations
12. WHEN validation error xảy ra, THE GraphQL_API SHALL return descriptive error messages
13. THE GraphQL_API SHALL log tất cả operations với user context

### Requirement 10: Data Persistence với Convex

**User Story:** Là một developer, tôi muốn lưu trữ node data trong Convex, để đảm bảo data consistency và real-time sync.

#### Acceptance Criteria

1. THE Convex_Database SHALL có schema cho Article_Node
2. THE Convex_Database SHALL có schema cho Roadmap_Node
3. THE Article_Node schema SHALL bao gồm: id, slug, title, content, author, timestamps
4. THE Roadmap_Node schema SHALL bao gồm: id, slug, title, description, structure, author, timestamps
5. THE System SHALL enforce unique constraint trên slug field
6. THE System SHALL tạo indexes trên slug và author fields
7. WHEN node được update, THE System SHALL update updatedAt timestamp
8. THE System SHALL soft delete nodes thay vì hard delete
9. THE System SHALL maintain referential integrity giữa Roadmap và Article nodes
10. FOR ALL database operations, THE System SHALL handle errors gracefully

### Requirement 11: Real-time Collaboration (Optional)

**User Story:** Là một admin user, tôi muốn thấy real-time updates khi người khác đang edit, để tránh conflicts.

#### Acceptance Criteria

1. WHERE real-time collaboration được enable, THE System SHALL broadcast changes đến tất cả connected clients
2. WHERE real-time collaboration được enable, THE System SHALL hiển thị presence indicators
3. WHERE real-time collaboration được enable, THE System SHALL lock sections đang được edit
4. WHERE real-time collaboration được enable, THE System SHALL merge changes automatically khi có thể

### Requirement 12: Search và Filter Nodes

**User Story:** Là một user, tôi muốn search và filter nodes, để tôi có thể tìm nội dung nhanh chóng.

#### Acceptance Criteria

1. THE System SHALL cung cấp search bar trên header
2. WHEN user nhập search query, THE GraphQL_API SHALL search trong title và content
3. THE System SHALL hiển thị search results với highlighting
4. THE System SHALL cho phép filter theo node type (Article/Roadmap)
5. THE System SHALL cho phép filter theo tags
6. THE System SHALL cho phép sort theo date, title, popularity
7. THE search results SHALL hiển thị snippet của matching content
8. WHEN search query rỗng, THE System SHALL hiển thị tất cả nodes
9. THE System SHALL debounce search input với 300ms delay

### Requirement 13: Validation và Error Handling

**User Story:** Là một developer, tôi muốn có comprehensive validation và error handling, để đảm bảo data integrity và user experience tốt.

#### Acceptance Criteria

1. THE System SHALL validate title không rỗng và không quá 200 ký tự
2. THE System SHALL validate slug format (lowercase, hyphens, alphanumeric)
3. THE System SHALL validate slug uniqueness trước khi tạo node
4. THE System SHALL validate content không rỗng cho Article_Node
5. THE System SHALL validate ít nhất một node trong roadmap structure
6. WHEN validation error xảy ra, THE System SHALL hiển thị inline error messages
7. WHEN network error xảy ra, THE System SHALL hiển thị retry option
8. WHEN server error xảy ra, THE System SHALL log error và hiển thị generic message
9. THE System SHALL validate file uploads (type, size) cho images
10. FOR ALL user inputs, THE System SHALL sanitize để prevent XSS attacks

### Requirement 14: Performance Optimization

**User Story:** Là một user, tôi muốn hệ thống load nhanh và responsive, để có trải nghiệm tốt.

#### Acceptance Criteria

1. THE System SHALL lazy load Roadmap_Visualization component
2. THE System SHALL implement infinite scroll cho node lists
3. THE System SHALL cache GraphQL queries với Apollo Client
4. THE System SHALL optimize images với Next.js Image component
5. THE System SHALL code split routes với Next.js dynamic imports
6. WHEN page load, THE System SHALL prioritize above-the-fold content
7. THE System SHALL prefetch linked pages khi hover
8. THE Roadmap_Visualization SHALL virtualize nodes khi có hơn 50 nodes
9. THE System SHALL debounce auto-save operations
10. FOR ALL API calls, THE System SHALL implement timeout với 30 seconds

### Requirement 15: Accessibility và Responsive Design

**User Story:** Là một user với disabilities, tôi muốn sử dụng hệ thống với assistive technologies, để tôi có thể truy cập nội dung.

#### Acceptance Criteria

1. THE System SHALL support keyboard navigation cho tất cả interactive elements
2. THE System SHALL provide ARIA labels cho screen readers
3. THE System SHALL maintain focus management khi navigate
4. THE System SHALL có color contrast ratio ít nhất 4.5:1
5. THE System SHALL support responsive breakpoints (mobile, tablet, desktop)
6. WHILE màn hình nhỏ hơn 640px, THE System SHALL hiển thị mobile-optimized layout
7. THE System SHALL support touch gestures cho mobile devices
8. THE System SHALL có skip-to-content link
9. THE System SHALL announce dynamic content changes cho screen readers
10. FOR ALL forms, THE System SHALL associate labels với inputs

## Correctness Properties

### Property 1: Slug Uniqueness (Invariant)

**Property:** Mọi Node_Slug trong hệ thống phải unique.

**Test Strategy:** Property-based test generate random node data và verify không có duplicate slugs trong database.

**Rationale:** Đảm bảo mỗi node có URL duy nhất và không có conflicts.

### Property 2: Roadmap Structure Integrity (Invariant)

**Property:** Mọi Article_Node được reference trong Roadmap_Node structure phải tồn tại trong database.

**Test Strategy:** Property-based test tạo roadmaps với random node references và verify tất cả references valid.

**Rationale:** Đảm bảo referential integrity và tránh broken links trong roadmap visualization.

### Property 3: Node Creation Round-Trip (Round Trip)

**Property:** Tạo node rồi fetch node phải return data tương đương với input.

**Test Strategy:** Property-based test với random node data: `getNode(createNode(data)).content == data.content`

**Rationale:** Đảm bảo data persistence chính xác và không mất dữ liệu.

### Property 4: Slug Generation Idempotence (Idempotence)

**Property:** Generate slug từ cùng một title nhiều lần phải cho cùng kết quả (với collision handling).

**Test Strategy:** Property-based test generate slug từ random titles: `generateSlug(title) == generateSlug(title)`

**Rationale:** Đảm bảo slug generation consistent và predictable.

### Property 5: Authorization Enforcement (Security)

**Property:** Mọi mutation phải enforce authorization rules.

**Test Strategy:** Property-based test với random user roles và verify non-admin users không thể create/delete nodes.

**Rationale:** Đảm bảo security và prevent unauthorized access.

### Property 6: Validation Consistency (Metamorphic)

**Property:** Validation rules phải consistent giữa client và server.

**Test Strategy:** Property-based test với random invalid inputs và verify cả client và server reject với same reasons.

**Rationale:** Đảm bảo consistent user experience và prevent invalid data reaching server.

### Property 7: Search Results Relevance (Metamorphic)

**Property:** Search với query cụ thể hơn phải return subset của results từ query general hơn.

**Test Strategy:** Property-based test: `results("tech") ⊇ results("tech stack")`

**Rationale:** Đảm bảo search logic correct và intuitive.

### Property 8: Drag-and-Drop Position Preservation (Invariant)

**Property:** Vị trí của nodes trong roadmap phải được preserve sau khi save và reload.

**Test Strategy:** Property-based test với random node positions: `reload(save(positions)) == positions`

**Rationale:** Đảm bảo user's layout work không bị mất.

### Property 9: Content Sanitization (Security)

**Property:** Mọi user input phải được sanitize để prevent XSS.

**Test Strategy:** Property-based test với malicious inputs (script tags, event handlers) và verify chúng được escaped.

**Rationale:** Đảm bảo security và protect users khỏi XSS attacks.

### Property 10: Error Recovery (Error Conditions)

**Property:** System phải handle gracefully mọi error conditions.

**Test Strategy:** Property-based test inject random errors (network, database, validation) và verify system không crash và hiển thị appropriate messages.

**Rationale:** Đảm bảo robust error handling và good user experience.

## Non-Functional Requirements

### Performance

- Page load time < 2 seconds
- API response time < 500ms (p95)
- Roadmap visualization render < 1 second cho 100 nodes
- Auto-save latency < 100ms

### Scalability

- Support 10,000+ nodes
- Support 100+ concurrent users
- Handle roadmaps với 200+ nodes

### Security

- All API endpoints require authentication
- Admin operations require admin role
- Input sanitization cho XSS prevention
- Rate limiting cho API calls

### Reliability

- 99.9% uptime
- Automatic error recovery
- Data backup mỗi ngày
- Zero data loss guarantee

### Usability

- Intuitive UI không cần training
- Consistent với Notion UX patterns
- Mobile-friendly interface
- Accessible theo WCAG 2.1 AA standards

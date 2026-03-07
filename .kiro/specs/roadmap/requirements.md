# Requirements Document

## Introduction

The Roadmap feature is the core functionality of VizTechStack, enabling users to visualize, navigate, and track their learning journey through technology stacks and skills. A roadmap represents a structured learning path with interconnected topics displayed as an interactive node-based graph. Users can explore different categories (roles, skills, best practices), track their progress through nodes, bookmark roadmaps, and access detailed content for each topic.

## Glossary

- **Roadmap_System**: The complete system managing roadmap creation, visualization, and interaction
- **Roadmap**: A structured learning path containing nodes and edges representing topics and their relationships
- **Node**: A visual element in the roadmap graph representing a single topic or concept
- **Edge**: A connection between two nodes showing the relationship or learning sequence
- **Topic**: The detailed content associated with a node, including markdown content and learning resources
- **Progress_Tracker**: The subsystem managing user completion status for roadmap nodes
- **Roadmap_Viewer**: The component rendering the interactive roadmap visualization
- **Content_Parser**: The component parsing and rendering markdown content for topics
- **Bookmark_Manager**: The subsystem managing user roadmap bookmarks
- **Category**: The classification of a roadmap (role, skill, or best-practice)
- **Difficulty_Level**: The complexity rating of a roadmap (beginner, intermediate, or advanced)
- **Node_Status**: The completion state of a node (done, in-progress, or skipped)
- **Roadmap_Status**: The visibility state of a roadmap (public, draft, or private)

## Requirements

### Requirement 1: Display Roadmap List

**User Story:** As a user, I want to browse available roadmaps, so that I can find learning paths relevant to my goals

#### Acceptance Criteria

1. THE Roadmap_System SHALL display roadmaps ordered by creation date in descending order
2. WHEN a user requests roadmaps, THE Roadmap_System SHALL return paginated results with 24 items per page
3. WHERE a category filter is applied, THE Roadmap_System SHALL display only roadmaps matching that Category
4. THE Roadmap_System SHALL display roadmap title, description, Category, Difficulty_Level, and topic count for each roadmap
5. WHEN a user is not authenticated, THE Roadmap_System SHALL display only roadmaps with Roadmap_Status set to public
6. WHEN an admin user requests roadmaps, THE Roadmap_System SHALL display roadmaps with any Roadmap_Status

### Requirement 2: View Roadmap Details

**User Story:** As a user, I want to view a specific roadmap with its visual graph, so that I can understand the learning path structure

#### Acceptance Criteria

1. WHEN a user selects a roadmap, THE Roadmap_Viewer SHALL render the node graph from the nodesJson data
2. WHEN a user selects a roadmap, THE Roadmap_Viewer SHALL render the connections from the edgesJson data
3. THE Roadmap_Viewer SHALL display each Node with its title visible
4. WHEN a roadmap has Roadmap_Status set to public, THE Roadmap_System SHALL allow any user to view it
5. WHEN a roadmap has Roadmap_Status set to draft or private, THE Roadmap_System SHALL allow only admin users to view it
6. IF a requested roadmap does not exist, THEN THE Roadmap_System SHALL return null

### Requirement 3: Track Node Progress

**User Story:** As an authenticated user, I want to mark nodes as completed or in-progress, so that I can track my learning journey

#### Acceptance Criteria

1. WHEN an authenticated user marks a node, THE Progress_Tracker SHALL store the Node_Status for that user, roadmap, and node combination
2. THE Progress_Tracker SHALL support three Node_Status values: done, in-progress, and skipped
3. WHEN a user views a roadmap, THE Roadmap_Viewer SHALL display the Node_Status for each node the user has interacted with
4. WHEN a user updates a node status, THE Progress_Tracker SHALL replace the previous status with the new status
5. THE Progress_Tracker SHALL retrieve all progress records for a specific user and roadmap combination within 500ms

### Requirement 4: View Topic Content

**User Story:** As a user, I want to view detailed content for a topic, so that I can learn about that specific subject

#### Acceptance Criteria

1. WHEN a user selects a Node, THE Roadmap_System SHALL retrieve the associated Topic content
2. THE Content_Parser SHALL render the Topic markdown content as formatted HTML
3. THE Roadmap_System SHALL display the Topic title, content, and learning resources
4. WHEN a Topic has learning resources, THE Roadmap_System SHALL display each resource with its title, URL, and type
5. THE Roadmap_System SHALL support three resource types: article, video, and course

### Requirement 5: Create Roadmap

**User Story:** As an admin, I want to create new roadmaps, so that I can add learning paths to the platform

#### Acceptance Criteria

1. WHEN an admin creates a roadmap, THE Roadmap_System SHALL require slug, title, description, Category, Difficulty_Level, topicCount, nodesJson, edgesJson, and Roadmap_Status
2. THE Roadmap_System SHALL validate that the slug is unique before creating a roadmap
3. IF a roadmap with the same slug exists, THEN THE Roadmap_System SHALL return an error message indicating the slug conflict
4. WHEN an admin creates a roadmap, THE Roadmap_System SHALL store the creation timestamp
5. WHEN an admin creates a roadmap, THE Roadmap_System SHALL create a corresponding roadmap summary record
6. WHEN a non-admin user attempts to create a roadmap, THE Roadmap_System SHALL return an authorization error

### Requirement 6: Manage Roadmap Bookmarks

**User Story:** As an authenticated user, I want to bookmark roadmaps, so that I can quickly access my favorite learning paths

#### Acceptance Criteria

1. WHEN an authenticated user bookmarks a roadmap, THE Bookmark_Manager SHALL store the user and roadmap association
2. WHEN an authenticated user removes a bookmark, THE Bookmark_Manager SHALL delete the user and roadmap association
3. THE Bookmark_Manager SHALL retrieve all bookmarks for a specific user within 300ms
4. WHEN a user views their bookmarks, THE Roadmap_System SHALL display the roadmap summaries for all bookmarked roadmaps
5. THE Bookmark_Manager SHALL prevent duplicate bookmarks for the same user and roadmap combination

### Requirement 7: Parse and Serialize Roadmap Graph Data

**User Story:** As a developer, I want to parse roadmap graph data, so that the system can render and manipulate roadmap visualizations

#### Acceptance Criteria

1. WHEN a roadmap is stored, THE Roadmap_System SHALL serialize the node definitions as a JSON string in nodesJson
2. WHEN a roadmap is stored, THE Roadmap_System SHALL serialize the edge definitions as a JSON string in edgesJson
3. WHEN a roadmap is retrieved, THE Roadmap_System SHALL parse the nodesJson string into node objects
4. WHEN a roadmap is retrieved, THE Roadmap_System SHALL parse the edgesJson string into edge objects
5. FOR ALL valid roadmap graph data, serializing then parsing then serializing SHALL produce equivalent JSON strings (round-trip property)
6. IF nodesJson or edgesJson contains invalid JSON, THEN THE Roadmap_System SHALL return a descriptive parsing error

### Requirement 8: Filter Roadmaps by Category

**User Story:** As a user, I want to filter roadmaps by category, so that I can find roadmaps relevant to my learning focus

#### Acceptance Criteria

1. THE Roadmap_System SHALL support three Category values: role, skill, and best-practice
2. WHEN a user filters by Category, THE Roadmap_System SHALL return only roadmaps matching that Category
3. WHEN a user filters by Category, THE Roadmap_System SHALL maintain pagination with 24 items per page
4. WHEN a user filters by Category, THE Roadmap_System SHALL order results by creation date in descending order
5. WHEN no category filter is applied, THE Roadmap_System SHALL return roadmaps from all categories

### Requirement 9: Display Roadmap Difficulty

**User Story:** As a user, I want to see the difficulty level of roadmaps, so that I can choose paths appropriate for my skill level

#### Acceptance Criteria

1. THE Roadmap_System SHALL support three Difficulty_Level values: beginner, intermediate, and advanced
2. WHEN displaying a roadmap, THE Roadmap_System SHALL show the Difficulty_Level
3. THE Roadmap_System SHALL require a Difficulty_Level when creating a roadmap
4. THE Roadmap_System SHALL store the Difficulty_Level in both the roadmap and roadmap summary records

### Requirement 10: Maintain Roadmap Summary Consistency

**User Story:** As a system administrator, I want roadmap summaries to stay synchronized with roadmaps, so that list queries perform efficiently

#### Acceptance Criteria

1. WHEN a roadmap is created, THE Roadmap_System SHALL create a corresponding roadmap summary with matching slug, title, description, Category, Difficulty_Level, topicCount, Roadmap_Status, and creation timestamp
2. THE Roadmap_System SHALL ensure each roadmap has exactly one corresponding roadmap summary
3. WHEN querying roadmap lists, THE Roadmap_System SHALL use roadmap summaries instead of full roadmap records
4. THE Roadmap_System SHALL provide an admin function to verify roadmap and summary consistency
5. THE Roadmap_System SHALL provide an admin function to backfill missing roadmap summaries

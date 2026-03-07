# Roadmap Components

This directory contains components for displaying and interacting with roadmaps.

## NodeSidebar Component

Displays available skill nodes from existing skill roadmaps for drag-and-drop composition into role roadmaps.

### Features
- Queries skill nodes using GraphQL `getSkillNodesForRoleRoadmap`
- Displays searchable/filterable list of skill nodes
- Implements drag source for skill nodes
- Shows node preview with title and description
- Only visible when editing role roadmaps
- Requires admin authentication
- Real-time updates via Apollo Client cache

### Usage

```tsx
import { NodeSidebar } from '@/components/roadmap/NodeSidebar';

function RoadmapEditor() {
  return (
    <div className="flex h-screen">
      <NodeSidebar />
      <RoadmapCanvas />
    </div>
  );
}
```

### Features Detail

**Search & Filter**
- Real-time search by node label
- Case-insensitive filtering
- Empty state when no results found

**Drag & Drop**
- Drag nodes from sidebar to canvas
- Automatically marks nodes as reused skill nodes
- Preserves node metadata (topicId, originalRoadmapId)
- Uses React Flow's drag-and-drop API

**Authentication**
- Only renders for authenticated users
- Requires admin role (enforced by GraphQL query)
- Gracefully hides for non-authenticated users

### GraphQL Query

```graphql
query GetSkillNodesForRoleRoadmap {
  getSkillNodesForRoleRoadmap {
    id
    type
    position { x y }
    data {
      label
      topicId
      isReusedSkillNode
      originalRoadmapId
    }
  }
}
```

## TopicPanel Component

Displays detailed topic content in a modal dialog when a node is clicked.

### Features
- Queries topic data using GraphQL `getTopicByNodeId`
- Displays topic title and markdown content
- Shows learning resources list with icons
- Modal UI with close button
- Loading and error states
- Handles cases where topic doesn't exist

### Usage

```tsx
import { TopicPanel } from '@/components/roadmap/TopicPanel';

function RoadmapPage() {
  const [selectedNode, setSelectedNode] = useState<{roadmapId: string, nodeId: string} | null>(null);

  return (
    <>
      <RoadmapViewer onNodeClick={(nodeId) => setSelectedNode({roadmapId: "...", nodeId})} />
      <TopicPanel
        roadmapId={selectedNode?.roadmapId}
        nodeId={selectedNode?.nodeId}
        isOpen={!!selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </>
  );
}
```

### Props

- `roadmapId?: string` - The roadmap ID containing the topic
- `nodeId?: string` - The node ID to fetch topic for
- `isOpen: boolean` - Whether the panel is open
- `onClose: () => void` - Callback when panel is closed

## ResourceList Component

Displays a list of learning resources with icons based on resource type.

### Features
- Displays resources with title, URL, and type
- Shows appropriate icon for each resource type (article/video/course)
- External links open in new tab
- Responsive design

### Usage

```tsx
import { ResourceList } from '@/components/roadmap/ResourceList';

function TopicContent() {
  const resources = [
    { title: "React Docs", url: "https://react.dev", type: "ARTICLE" },
    { title: "React Tutorial", url: "https://...", type: "VIDEO" }
  ];
  return <ResourceList resources={resources} />;
}
```

### Props

- `resources: Resource[]` - Array of learning resources to display
  - `title: string` - Resource title
  - `url: string` - Resource URL
  - `type: 'ARTICLE' | 'VIDEO' | 'COURSE'` - Resource type

## MarkdownRenderer Component

Renders markdown content as formatted HTML with syntax highlighting support.

### Features
- Parses markdown to HTML
- Sanitizes HTML to prevent XSS attacks
- Applies styling for markdown elements
- Supports code blocks, lists, headings, links, etc.

### Usage

```tsx
import { MarkdownRenderer } from '@/components/roadmap/MarkdownRenderer';

function TopicContent() {
  const markdown = "# Hello\n\nThis is **bold** text.";
  return <MarkdownRenderer content={markdown} />;
}
```

### Props

- `content: string` - The markdown string to render

### Supported Markdown Features

- Headings (h1, h2, h3)
- Bold and italic text
- Links (open in new tab)
- Inline code
- Code blocks with language support
- Unordered and ordered lists
- Paragraphs

## Integration Example

For a complete integration with RoadmapGraph, use the `RoadmapGraphWithTopic` component:

```tsx
import { RoadmapGraphWithTopic } from '@/components/roadmap-graph-with-topic';

export default function RoadmapDetailPage({ roadmap }) {
  return (
    <RoadmapGraphWithTopic
      roadmapId={roadmap.id}
      initialNodesJson={roadmap.nodesJson}
      initialEdgesJson={roadmap.edgesJson}
      topicCount={roadmap.topicCount}
    />
  );
}
```

This component automatically handles node clicks and displays the TopicPanel when a node is selected.

## Styling

Markdown content uses custom CSS classes defined in `apps/web/src/app/globals.css`:

- `.markdown-content` - Base container
- `.markdown-content h1, h2, h3` - Headings
- `.markdown-content code.inline-code` - Inline code
- `.markdown-content pre.code-block` - Code blocks
- `.markdown-content a` - Links
- `.markdown-content ul, ol, li` - Lists

Dark mode is automatically supported through Tailwind's dark mode utilities.

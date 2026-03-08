# Topic Feature

## Overview

The Topic feature manages topic content and learning resources associated with roadmap nodes.

## Architecture

Topics follow the hexagonal architecture pattern in the backend:

```
apps/api/src/modules/topic/
├── application/
│   ├── commands/
│   │   ├── create-topic.command.ts
│   │   ├── update-topic.command.ts
│   │   └── delete-topic.command.ts
│   ├── queries/
│   │   ├── get-topic-by-node-id.query.ts
│   │   └── get-topics-by-roadmap.query.ts
│   ├── services/
│   │   └── topic-application.service.ts
│   └── ports/
│       └── topic.repository.ts
├── domain/
│   ├── entities/
│   │   └── topic.entity.ts
│   └── errors/
│       └── topic-not-found.error.ts
├── infrastructure/
│   └── adapters/
│       └── convex-topic.repository.ts
└── transport/
    └── graphql/
        ├── resolvers/
        │   └── topic.resolver.ts
        ├── schemas/
        │   └── topic.schema.ts
        └── mappers/
            └── topic.mapper.ts
```

## Data Model

```typescript
interface TopicEntity {
  id: string
  nodeId: string
  roadmapId: string
  title: string
  description: string
  content: string  // Markdown content
  resources: ResourceEntity[]
  createdAt: Date
  updatedAt: Date
}

interface ResourceEntity {
  id: string
  title: string
  url: string
  type: 'article' | 'video' | 'course' | 'documentation'
}
```

## Use Cases

### Create Topic (Admin Only)

```typescript
const topic = await topicService.createTopic({
  nodeId: 'node-123',
  roadmapId: 'roadmap-456',
  title: 'Introduction to TypeScript',
  description: 'Learn TypeScript basics',
  content: '# TypeScript Basics\n\n...',
  resources: [
    {
      title: 'TypeScript Handbook',
      url: 'https://www.typescriptlang.org/docs/',
      type: 'documentation'
    }
  ]
})
```

### Get Topic by Node ID

```typescript
const topic = await topicService.getTopicByNodeId('node-123')
```

### Update Topic (Admin Only)

```typescript
await topicService.updateTopic('topic-123', {
  content: '# Updated Content\n\n...',
  resources: [...]
})
```

## Frontend Components

```
apps/web/src/features/topic/
├── components/
│   ├── TopicPanel.tsx        # Main topic display panel
│   ├── TopicNode.tsx         # Topic node in graph
│   ├── ResourceList.tsx      # List of learning resources
│   └── MarkdownRenderer.tsx  # Markdown content renderer
├── hooks/
│   ├── useTopicByNodeId.ts
│   └── useCreateTopic.ts
└── types/
    └── topic.types.ts
```

## GraphQL API

### Queries

```graphql
type Query {
  getTopicByNodeId(nodeId: ID!): Topic
  getTopicsByRoadmap(roadmapId: ID!): [Topic!]!
}
```

### Mutations

```graphql
type Mutation {
  createTopic(input: CreateTopicInput!): Topic! @requireRole(role: ADMIN)
  updateTopic(id: ID!, input: UpdateTopicInput!): Topic! @requireRole(role: ADMIN)
  deleteTopic(id: ID!): Boolean! @requireRole(role: ADMIN)
}
```

## See Also

- [Roadmap Feature](./roadmap.md)
- [Implementation Guide](../04-implementation/hexagonal-architecture.md)

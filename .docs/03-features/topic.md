# Tính Năng Topic

## Tổng Quan

Tính năng Topic quản lý nội dung topic và tài nguyên học tập liên kết với roadmap node.

## Kiến Trúc

Topic tuân theo mẫu hexagonal architecture trong backend:

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
  content: string  // Nội dung Markdown
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

### Tạo Topic (Chỉ Admin)

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

### Lấy Topic Theo Node ID

```typescript
const topic = await topicService.getTopicByNodeId('node-123')
```

### Cập Nhật Topic (Chỉ Admin)

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
│   ├── TopicPanel.tsx        # Panel hiển thị topic chính
│   ├── TopicNode.tsx         # Topic node trong graph
│   ├── ResourceList.tsx      # Danh sách tài nguyên học tập
│   └── MarkdownRenderer.tsx  # Renderer nội dung markdown
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

## Xem Thêm

- [Tính Năng Roadmap](./roadmap.md)
- [Hướng Dẫn Triển Khai](../04-implementation/hexagonal-architecture.md)

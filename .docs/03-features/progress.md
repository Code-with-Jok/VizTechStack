# Tính Năng Theo Dõi Tiến Độ

## Tổng Quan

Tính năng Theo Dõi Tiến Độ cho phép người dùng theo dõi tiến độ học tập của họ trên các roadmap bằng cách đánh dấu topic là not-started, in-progress, hoặc completed.

## Cấu Trúc Module

Nằm tại `apps/api/src/modules/progress/` tuân theo hexagonal architecture.

## Data Model

```typescript
interface ProgressEntity {
  id: string
  userId: string
  nodeId: string
  roadmapId: string
  status: 'not-started' | 'in-progress' | 'completed'
  completedAt?: Date
  updatedAt: Date
}
```

## Các Thao Tác Chính

- Cập nhật trạng thái tiến độ
- Lấy tiến độ người dùng cho một roadmap
- Tính toán thống kê hoàn thành

## Frontend Components

Nằm tại `apps/web/src/features/progress/components/ProgressTracker.tsx`

## Xem Thêm

- [Tính Năng Roadmap](./roadmap.md)

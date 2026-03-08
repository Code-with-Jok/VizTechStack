# Tính Năng Bookmark

## Tổng Quan

Tính năng Bookmark cho phép người dùng lưu roadmap yêu thích để truy cập nhanh.

## Cấu Trúc Module

Nằm tại `apps/api/src/modules/bookmark/` tuân theo hexagonal architecture.

## Data Model

```typescript
interface BookmarkEntity {
  id: string
  userId: string
  roadmapId: string
  createdAt: Date
}
```

## Các Thao Tác Chính

- Thêm bookmark
- Xóa bookmark
- Lấy bookmark của người dùng
- Kiểm tra roadmap đã được bookmark chưa

## Frontend Components

Nằm tại `apps/web/src/features/bookmark/`:
- `BookmarkButton.tsx` - Toggle bookmark
- `BookmarkedRoadmapsList.tsx` - Danh sách roadmap đã bookmark

## Xem Thêm

- [Tính Năng Roadmap](./roadmap.md)

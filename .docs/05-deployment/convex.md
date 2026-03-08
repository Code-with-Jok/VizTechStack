# Kế Hoạch Migration Convex Database

## Tổng Quan

Tài liệu này mô tả chiến lược migration database để deploy tính năng VizTechStack Roadmap lên production.

## Trạng Thái Schema Hiện Tại

**Vị trí:** `convex/schema.ts`

**Tables Đã Định Nghĩa:**
- `roadmaps` - Dữ liệu roadmap chính với cấu trúc graph
- `roadmapSummaries` - Dữ liệu denormalized cho list queries
- `topics` - Nội dung chi tiết cho nodes
- `progress` - Theo dõi progress của user
- `bookmarks` - Bookmarks của user

**Indexes:**
- `by_slug` trên roadmaps
- `by_category` trên roadmaps
- `by_status` trên roadmaps
- `by_createdAt` trên roadmaps
- User-specific indexes trên progress và bookmarks

## Chiến Lược Deployment

### Phase 1: Schema Deployment

1. **Deploy Lên Convex Cloud**
   ```bash
   npx convex deploy
   ```
   - Convex tự động xử lý schema migrations
   - Không cần downtime cho additive changes
   - Indexes được tạo tự động

2. **Verify Schema**
   - Kiểm tra Convex dashboard để xem table creation
   - Verify indexes đang active
   - Test queries trong Convex dashboard

### Phase 2: Data Seeding (Tùy Chọn)

Nếu seeding initial data:

1. **Tạo Seed Script**
   - Vị trí: `convex/seed.ts`
   - Seed sample roadmaps để testing
   - Seed admin user data nếu cần

2. **Chạy Seed**
   ```bash
   npx convex run seed:seedRoadmaps
   ```

### Phase 3: Verification

1. **Test Queries**
   - List roadmaps: `npx convex run roadmaps:list`
   - Get by slug: `npx convex run roadmaps:getBySlug --slug "frontend-developer"`
   - Verify real-time subscriptions hoạt động

2. **Test Mutations**
   - Tạo test roadmap qua GraphQL API
   - Update roadmap
   - Xóa test roadmap

3. **Performance Testing**
   - Test với roadmap có 100+ nodes
   - Verify query performance
   - Kiểm tra real-time sync latency

## Kế Hoạch Rollback

### Scenario 1: Schema Issues

**Vấn đề:** Schema deployment fails hoặc gây ra errors

**Giải pháp:**
1. Convex duy trì schema history
2. Revert về previous deployment:
   ```bash
   npx convex rollback
   ```
3. Fix schema issues ở local
4. Redeploy khi sẵn sàng

### Scenario 2: Data Corruption

**Vấn đề:** Data bị corrupted hoặc invalid

**Giải pháp:**
1. Convex cung cấp point-in-time recovery
2. Liên hệ Convex support để data restoration
3. Hoặc, clear affected tables và reseed:
   ```bash
   npx convex run admin:clearTable --table "roadmaps"
   npx convex run seed:seedRoadmaps
   ```

### Scenario 3: Performance Issues

**Vấn đề:** Queries chậm hoặc timing out

**Giải pháp:**
1. Kiểm tra index usage trong Convex dashboard
2. Thêm missing indexes nếu cần
3. Tối ưu queries để sử dụng indexes
4. Cân nhắc denormalization (đã làm với roadmapSummaries)

## Production Checklist

- [ ] Convex project đã tạo trong production environment
- [ ] Environment variables đã cấu hình trong Vercel
  - `CONVEX_URL` - Production Convex URL
  - `NEXT_PUBLIC_CONVEX_URL` - Public Convex URL
- [ ] Schema đã deploy lên production
- [ ] Indexes đã verify active
- [ ] Test queries đã thực thi thành công
- [ ] Real-time subscriptions đã test
- [ ] Performance benchmarks đạt yêu cầu
- [ ] Monitoring và alerts đã cấu hình

## Monitoring

### Metrics Quan Trọng Cần Theo Dõi

1. **Query Performance**
   - Average query time < 100ms
   - P95 query time < 500ms
   - Real-time subscription latency < 50ms

2. **Database Size**
   - Monitor table sizes
   - Cài đặt alerts cho rapid growth
   - Lên kế hoạch scaling nếu cần

3. **Error Rates**
   - Monitor failed queries
   - Track validation errors
   - Alert khi error spikes

### Convex Dashboard

- Truy cập: https://dashboard.convex.dev
- Monitor real-time metrics
- Xem query logs
- Kiểm tra function execution times

## Chiến Lược Backup

**Convex Automatic Backups:**
- Convex duy trì automatic backups
- Point-in-time recovery available
- Liên hệ support để restoration

**Manual Backups (Tùy Chọn):**
- Export data định kỳ qua queries
- Lưu exports ở vị trí an toàn
- Document restoration procedure

## Timeline Migration

**Thời Gian Ước Tính:** 30 phút

1. Schema deployment: 5 phút
2. Verification: 10 phút
3. Performance testing: 10 phút
4. Monitoring setup: 5 phút

**Khung Giờ Khuyến Nghị:** Thời gian ít traffic (ví dụ: đêm khuya)

## Tasks Sau Migration

1. Monitor error logs trong 24 giờ
2. Verify tất cả features hoạt động trong production
3. Kiểm tra performance metrics
4. Thu thập user feedback
5. Ghi chép các issues gặp phải

## Thông Tin Liên Hệ

**Convex Support:**
- Email: support@convex.dev
- Discord: https://discord.gg/convex
- Documentation: https://docs.convex.dev

**Liên Hệ Team:**
- Database Admin: [Thông tin liên hệ của bạn]
- DevOps Lead: [Thông tin liên hệ của bạn]
- On-call Engineer: [Thông tin liên hệ của bạn]

---

**Cập Nhật Lần Cuối:** 2026-03-07
**Trạng Thái:** Sẵn sàng để deployment

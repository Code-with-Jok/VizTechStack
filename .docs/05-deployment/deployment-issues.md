# Log Issues Deployment: Tái Cấu Trúc Codebase

## Tổng Quan

Tài liệu này theo dõi tất cả issues gặp phải trong quá trình deployment codebase đã được tái cấu trúc lên môi trường staging và production.

---

## Template Issue

```markdown
## Issue #X: [Tiêu đề]

**Ngày:** YYYY-MM-DD HH:MM UTC
**Mức độ:** Critical | High | Medium | Low
**Môi trường:** Staging | Production | Cả hai
**Component:** Web | API | Database | Infrastructure

**Trạng thái:** Open | In Progress | Resolved | Won't Fix

**Mô tả:**
[Mô tả chi tiết về issue]

**Tác động:**
- Users bị ảnh hưởng: [số lượng hoặc phần trăm]
- Features bị ảnh hưởng: [danh sách]
- Tác động business: [mô tả]

**Nguyên nhân gốc:**
[Nguyên nhân gây ra issue - cụ thể]

**Giải pháp:**
[Cách fix - bao gồm commands, code changes, etc.]

**Timeline:**
- Phát hiện: YYYY-MM-DD HH:MM
- Xác nhận: YYYY-MM-DD HH:MM
- Giải quyết: YYYY-MM-DD HH:MM
- Tổng downtime: [thời gian]

**Phòng ngừa:**
[Cách phòng ngừa issue này trong tương lai]

**Issues liên quan:**
- Issue #X
- Ticket #Y

**Người phụ trách:** [Tên]
**Người báo cáo:** [Tên]

---
```

## Log Issues

### Issue #1: [Ví dụ - Xóa trong production]

**Ngày:** 2026-03-08 14:30 UTC
**Mức độ:** Medium
**Môi trường:** Staging
**Component:** Web

**Trạng thái:** Resolved

**Mô tả:**
Homepage không load được trên staging deployment với lỗi "Module not found" cho import `@/features/roadmap`.

**Tác động:**
- Users bị ảnh hưởng: 0 (chỉ staging)
- Features bị ảnh hưởng: Homepage
- Tác động business: Staging testing bị block

**Nguyên nhân gốc:**
Import path trong `app/page.tsx` không được update sau khi move components sang feature-based structure. Import vẫn reference path cũ `@/components/roadmap/RoadmapList` thay vì `@/features/roadmap`.

**Giải pháp:**
1. Update import trong `apps/web/src/app/page.tsx`:
   ```typescript
   // Trước
   import { RoadmapList } from '@/components/roadmap/RoadmapList'
   
   // Sau
   import { RoadmapList } from '@/features/roadmap'
   ```
2. Chạy build ở local để verify: `pnpm build --filter @viztechstack/web`
3. Commit fix và redeploy lên staging
4. Verify homepage load đúng

**Timeline:**
- Phát hiện: 2026-03-08 14:30
- Xác nhận: 2026-03-08 14:32
- Giải quyết: 2026-03-08 14:45
- Tổng downtime: 15 phút

**Phòng ngừa:**
- Thêm automated import path validation trong CI/CD
- Chạy full build trước deployment
- Thêm smoke test cho homepage trong CI pipeline

**Issues liên quan:**
- Không có

**Người phụ trách:** Developer
**Người báo cáo:** QA Team

---

## Thống Kê Issues

### Theo Mức Độ
- Critical: 0
- High: 0
- Medium: 0
- Low: 0

### Theo Môi Trường
- Staging: 0
- Production: 0
- Cả hai: 0

### Theo Component
- Web: 0
- API: 0
- Database: 0
- Infrastructure: 0

### Theo Trạng Thái
- Open: 0
- In Progress: 0
- Resolved: 0
- Won't Fix: 0

## Issues Thường Gặp và Quick Fixes

### Build Failures

**Triệu chứng:** Deployment fails trong build step

**Quick Fix:**
```bash
# Chạy build ở local
pnpm build

# Kiểm tra TypeScript errors
pnpm typecheck

# Fix errors và redeploy
```

### Environment Variables Missing

**Triệu chứng:** Runtime errors về missing environment variables

**Quick Fix:**
1. Kiểm tra Vercel Dashboard → Environment Variables
2. Thêm missing variables
3. Redeploy để apply changes

### Import Path Errors

**Triệu chứng:** "Module not found" errors

**Quick Fix:**
```bash
# Tìm old import paths
grep -r "@/components/roadmap" apps/web/src

# Update sang new paths
# @/components/roadmap → @/features/roadmap
```

### Database Connection Issues

**Triệu chứng:** API trả về 500 errors, "Cannot connect to Convex"

**Quick Fix:**
1. Verify `CONVEX_URL` environment variable
2. Kiểm tra Convex deployment status
3. Verify API có credentials đúng

### Authentication Failures

**Triệu chứng:** Users không thể sign in, JWT validation errors

**Quick Fix:**
1. Verify Clerk environment variables
2. Kiểm tra JWT issuer domain khớp
3. Verify Clerk webhook configuration

## Quy Trình Escalation

### Mức Độ Nghiêm Trọng

**Critical:**
- Tất cả users bị ảnh hưởng
- Core functionality bị hỏng
- Data loss hoặc corruption
- Security breach

**Hành động:** Rollback ngay lập tức, thông báo tất cả stakeholders

**High:**
- Nhiều users bị ảnh hưởng
- Important features bị hỏng
- Performance giảm nghiêm trọng

**Hành động:** Fix trong 1 giờ hoặc rollback

**Medium:**
- Một số users bị ảnh hưởng
- Non-critical features bị hỏng
- Minor performance issues

**Hành động:** Fix trong 4 giờ

**Low:**
- Ít users bị ảnh hưởng
- Minor issues
- Cosmetic problems

**Hành động:** Fix trong deployment tiếp theo

### Thông Tin Liên Hệ

**On-Call Engineer:**
- Tên: [Tên của bạn]
- Điện thoại: [Số điện thoại]
- Email: [Email]

**DevOps Lead:**
- Tên: [Tên]
- Điện thoại: [Số điện thoại]
- Email: [Email]

**Database Admin:**
- Tên: [Tên]
- Điện thoại: [Số điện thoại]
- Email: [Email]

**External Support:**
- Vercel Support: support@vercel.com
- Convex Support: support@convex.dev
- Clerk Support: support@clerk.dev

## Bài Học Rút Ra

### Best Practices Cho Deployment

1. **Luôn chạy full build ở local trước khi deploy**
   - Phát hiện import errors sớm
   - Verify tất cả dependencies resolve
   - Đảm bảo TypeScript compiles

2. **Test trong staging trước**
   - Phát hiện environment-specific issues
   - Validates configuration
   - Cho phép testing an toàn

3. **Monitor ngay sau deployment**
   - 5 phút đầu là quan trọng nhất
   - Theo dõi error rates chặt chẽ
   - Kiểm tra logs để tìm anomalies

4. **Có rollback plan sẵn sàng**
   - Biết cách rollback nhanh chóng
   - Document rollback procedure
   - Test rollback trong staging

5. **Communicate chủ động**
   - Thông báo team trước deployment
   - Update status trong quá trình deployment
   - Báo cáo completion và issues

### Những Gì Làm Tốt

- [Ghi chép những thành công]

### Những Gì Có Thể Cải Thiện

- [Ghi chép các lĩnh vực cần cải thiện]

### Action Items

- [ ] [Action item 1]
- [ ] [Action item 2]
- [ ] [Action item 3]

---

**Cập Nhật Lần Cuối:** 2026-03-08
**Người Duy Trì:** DevOps Team
**Tần Suất Review:** Sau mỗi deployment

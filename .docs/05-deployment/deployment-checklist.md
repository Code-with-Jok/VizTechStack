# Checklist Deployment: Tái Cấu Trúc Codebase

## Kiểm Tra Trước Khi Deploy

### Code Quality
- [ ] Tất cả tests passing (`pnpm test`)
- [ ] Test coverage ≥ 25%
- [ ] Build thành công (`pnpm build`)
- [ ] Không có TypeScript errors (`pnpm typecheck`)
- [ ] Không có linting errors (`pnpm lint`)
- [ ] Không có 'any' types (`pnpm check:no-any`)
- [ ] Không có circular dependencies (`pnpm validate:deps`)
- [ ] Security audit passed (`pnpm audit`)

### Git Status
- [ ] Tất cả changes đã commit
- [ ] Branch đã merge vào main
- [ ] Không có uncommitted changes
- [ ] Git tags đã tạo cho release

### Documentation
- [ ] CHANGELOG.md đã update
- [ ] README.md đã update
- [ ] Migration guide đã tạo
- [ ] API documentation đã update
- [ ] Deployment guide đã review

## Staging Deployment

### Database (Convex)
- [ ] Convex CLI đã cài đặt
- [ ] Staging deployment đã tạo
- [ ] Schema deploy thành công
- [ ] Tất cả tables đã tạo
- [ ] Tất cả indexes active
- [ ] Staging URL đã ghi lại

### API (NestJS trên Vercel)
- [ ] Vercel CLI đã cài đặt
- [ ] Project đã link với Vercel
- [ ] Environment variables đã cấu hình
- [ ] Staging deployment thành công
- [ ] GraphQL endpoint truy cập được
- [ ] Health check phản hồi
- [ ] Staging URL đã ghi lại

### Web App (Next.js trên Vercel)
- [ ] Project đã link với Vercel
- [ ] Environment variables đã cấu hình
- [ ] Staging deployment thành công
- [ ] Homepage load đúng
- [ ] Không có console errors
- [ ] Staging URL đã ghi lại

## Smoke Tests Trên Staging

### Manual Tests
- [ ] Homepage loads
- [ ] Roadmap list page hoạt động
- [ ] Roadmap viewer render graph
- [ ] Topic panel mở được
- [ ] Authentication hoạt động (Clerk)
- [ ] User profile loads
- [ ] Admin panel truy cập được (nếu admin)
- [ ] Create roadmap hoạt động
- [ ] Edit roadmap hoạt động
- [ ] Delete roadmap hoạt động
- [ ] Progress tracking hoạt động
- [ ] Bookmark functionality hoạt động
- [ ] Search functionality hoạt động
- [ ] Category filters hoạt động

### Automated Tests
- [ ] Smoke tests passed (`pnpm test:smoke:staging`)
- [ ] Tất cả API endpoints phản hồi
- [ ] GraphQL queries hoạt động
- [ ] Database operations thành công

### Performance Tests
- [ ] Page load time < 3s
- [ ] Time to Interactive < 5s
- [ ] First Contentful Paint < 2s
- [ ] API response time < 500ms
- [ ] Database query time < 100ms

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Production Deployment

### Pre-Production
- [ ] Staging tests tất cả passed
- [ ] Không có critical issues
- [ ] Team approval đã có
- [ ] Deployment window đã schedule
- [ ] Rollback plan đã review
- [ ] On-call engineer đã assign

### Database (Convex)
- [ ] Production deployment đã tạo
- [ ] Schema deploy thành công
- [ ] Tất cả tables đã tạo
- [ ] Tất cả indexes active
- [ ] Data migration hoàn thành (nếu có)
- [ ] Production URL đã ghi lại

### API (NestJS trên Vercel)
- [ ] Production environment variables đã set
- [ ] Production deployment thành công
- [ ] GraphQL endpoint truy cập được
- [ ] Health check phản hồi
- [ ] Không có errors trong logs
- [ ] Production URL đã ghi lại

### Web App (Next.js trên Vercel)
- [ ] Production environment variables đã set
- [ ] Production deployment thành công
- [ ] Homepage load đúng
- [ ] Không có console errors
- [ ] Tất cả features hoạt động
- [ ] Production URL đã ghi lại

## Kiểm Tra Production

### Kiểm Tra Ngay Lập Tức (5 Phút Đầu)
- [ ] Tất cả services phản hồi
- [ ] Không có 5xx errors
- [ ] Homepage loads
- [ ] Authentication hoạt động
- [ ] Database queries thành công
- [ ] Không có critical errors trong logs

### Monitoring Ngắn Hạn (Giờ Đầu Tiên)
- [ ] Error rate < 0.1%
- [ ] Response times bình thường
- [ ] Không có user complaints
- [ ] Tất cả features hoạt động
- [ ] Performance metrics bình thường

### Monitoring Dài Hạn (24 Giờ Đầu)
- [ ] Error rate ổn định
- [ ] Performance metrics ổn định
- [ ] User feedback tích cực
- [ ] Không có critical bugs báo cáo
- [ ] Support tickets bình thường

## Sau Deployment

### Documentation
- [ ] Deployment notes đã ghi chép
- [ ] Issues log đã update
- [ ] Lessons learned đã ghi chép
- [ ] Team đã thông báo về deployment

### Monitoring Setup
- [ ] Vercel analytics đã cấu hình
- [ ] Convex monitoring active
- [ ] Error tracking enabled
- [ ] Performance alerts đã set
- [ ] Uptime monitoring active

### Communication
- [ ] Team đã thông báo trong Slack/Teams
- [ ] Stakeholders đã thông báo
- [ ] Users đã thông báo (nếu cần)
- [ ] Status page đã update

### Cleanup
- [ ] Staging environment đã cleanup (nếu cần)
- [ ] Old deployments đã archive
- [ ] Temporary resources đã remove
- [ ] Documentation đã update

## Quy Trình Rollback

### Khi Nào Cần Rollback
- [ ] Critical bugs ảnh hưởng tất cả users
- [ ] Data corruption hoặc loss
- [ ] Security vulnerabilities
- [ ] Performance degradation > 50%
- [ ] Error rate > 5%

### Các Bước Rollback
- [ ] Thông báo team về quyết định rollback
- [ ] Rollback web app trong Vercel
- [ ] Rollback API trong Vercel
- [ ] Rollback database (nếu cần)
- [ ] Xác nhận rollback thành công
- [ ] Update status page
- [ ] Thông báo users (nếu cần)
- [ ] Ghi chép lý do rollback
- [ ] Schedule fix và redeploy

## Tiêu Chí Thành Công

### Deployment Thành Công Nếu:
- [ ] Tất cả services deploy không có errors
- [ ] Tất cả smoke tests pass
- [ ] Error rate < 0.1%
- [ ] Response times trong SLA
- [ ] Không có critical bugs báo cáo
- [ ] User experience không thay đổi hoặc cải thiện
- [ ] Performance metrics đạt targets
- [ ] Team hài lòng với deployment

## Ký Duyệt

### Deployment Team
- [ ] Developer: _________________ Ngày: _______
- [ ] Tech Lead: _________________ Ngày: _______
- [ ] DevOps: _________________ Ngày: _______
- [ ] QA: _________________ Ngày: _______

### Stakeholders
- [ ] Product Owner: _________________ Ngày: _______
- [ ] Engineering Manager: _________________ Ngày: _______

## Ghi Chú

### Issues Gặp Phải:
```
[Ghi chép các issues gặp phải trong quá trình deployment]
```

### Giải Pháp:
```
[Ghi chép cách giải quyết các issues]
```

### Bài Học Rút Ra:
```
[Ghi chép bài học cho các lần deployment sau]
```

### Performance Metrics:
```
Baseline (Trước):
- Build time: _______
- Page load: _______
- API response: _______

Sau Deployment:
- Build time: _______
- Page load: _______
- API response: _______

Cải thiện: _______
```

---

**Ngày Deployment:** _______
**Phiên Bản Deployment:** _______
**Người Deploy:** _______
**Trạng Thái:** ☐ Thành công ☐ Một phần ☐ Rollback

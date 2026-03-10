---
inclusion: auto
fileMatchPattern: 'tasks.md'
---

# Quy trình Implement/Refactor từ Spec

Khi thực hiện implement hoặc refactor dựa trên file tasks.md, hãy tuân thủ quy trình 4 bước sau:

## Bước 1: Chạy các task theo thứ tự

- Đọc file tasks.md và xác định các task cần thực hiện
- Thực hiện từng task một cách tuần tự
- Đánh dấu task là "in_progress" khi bắt đầu và "completed" khi hoàn thành
- Commit code sau mỗi task hoàn thành (nếu có thay đổi đáng kể)

## Bước 2: Cập nhật tài liệu sau mỗi task

**QUAN TRỌNG**: Sau khi hoàn thành mỗi task, kiểm tra và cập nhật các tài liệu bị outdate.

**TẤT CẢ TÀI LIỆU PHẢI ĐƯỢC VIẾT BẰNG TIẾNG VIỆT**

### Tài liệu cần kiểm tra:
- **Thư mục .docs/**: Tài liệu hướng dẫn, architecture, features
- **Unit tests**: Các file test *.spec.ts, *.test.ts
- **E2E tests**: Các file test e2e nếu có

### Tiêu chí cập nhật:
- Nếu code thay đổi logic nghiệp vụ → Cập nhật tài liệu trong .docs/
- Nếu thêm/sửa function/component → Cập nhật hoặc thêm unit test
- Nếu thay đổi user flow → Cập nhật e2e test
- Nếu thay đổi API/interface → Cập nhật tài liệu API

### Cách cập nhật:
1. Đọc tài liệu hiện tại
2. So sánh với code mới implement
3. Cập nhật phần nào không còn chính xác
4. Thêm phần mới nếu cần

## Bước 3: Đảm bảo pass Husky và CI

Trước khi commit hoặc push code, đảm bảo:

### Husky hooks:
```bash
# Pre-commit sẽ tự động chạy:
pnpm lint          # Kiểm tra linting
pnpm typecheck     # Kiểm tra TypeScript types
```

### CI/CD (.github/workflows/ci.yml):
```bash
# Chạy local để kiểm tra trước:
pnpm build         # Build toàn bộ project
pnpm test          # Chạy tất cả tests
pnpm lint          # Lint check
pnpm typecheck     # Type check
```

### Xử lý lỗi:
- Nếu có lỗi lint → Sửa hoặc chạy `pnpm format`
- Nếu có lỗi type → Sửa type definitions
- Nếu có test fail → Sửa code hoặc cập nhật test
- Nếu build fail → Kiểm tra dependencies và imports

## Bước 4: Tạo tài liệu hướng dẫn cho Intern/Fresher

**Khi hoàn thành TẤT CẢ các task**, tạo một tài liệu hướng dẫn chi tiết **BẰNG TIẾNG VIỆT**:

### Vị trí file:
```
.docs/frontend-rbac-roadmap-integration/GUIDE_TEMPLATE.md
```
(Hoặc tương tự tùy theo feature)

### Nội dung cần có:

**LƯU Ý: Toàn bộ tài liệu phải viết bằng tiếng Việt, bao gồm tiêu đề, mô tả, code comments**

#### 1. Tổng quan
- Feature này làm gì?
- Tại sao cần implement/refactor?
- Các thành phần chính

#### 2. Kiến trúc và thiết kế
- Sơ đồ kiến trúc (nếu có)
- Các component/module chính
- Data flow
- State management

#### 3. Hướng dẫn implement từng bước
- Bước 1: Setup và dependencies
- Bước 2: Tạo các component/service cơ bản
- Bước 3: Implement logic nghiệp vụ
- Bước 4: Tích hợp với hệ thống
- Bước 5: Testing
- Bước 6: Documentation

#### 4. Code examples
- Ví dụ code cho các pattern quan trọng
- Best practices
- Common pitfalls và cách tránh

#### 5. Testing guide
- Cách viết unit test
- Cách viết e2e test
- Test cases quan trọng cần cover

#### 6. Troubleshooting
- Các lỗi thường gặp
- Cách debug
- FAQs

#### 7. Checklist hoàn thành
- [ ] Code implementation
- [ ] Unit tests
- [ ] E2E tests (nếu cần)
- [ ] Documentation
- [ ] Code review
- [ ] CI/CD pass
- [ ] Deployed to staging/production

### Template mẫu:
Tham khảo file `.docs/frontend-rbac-roadmap-integration/GUIDE_TEMPLATE.md` đã có sẵn trong project.

---

## Lưu ý quan trọng

1. **Không bỏ qua bước 2**: Cập nhật docs ngay sau mỗi task, đừng để đến cuối mới làm
2. **Commit thường xuyên**: Mỗi task hoàn thành nên có ít nhất 1 commit
3. **Test trước khi commit**: Luôn chạy test local trước khi push
4. **Documentation is code**: Tài liệu cũng quan trọng như code, cần maintain cẩn thận
5. **Think about future developers**: Viết tài liệu như thể bạn đang hướng dẫn chính mình sau 6 tháng

## Công cụ hỗ trợ

- **Hook tự động**: Hook "update-docs-after-task" sẽ tự động nhắc bạn cập nhật docs sau mỗi task
- **Husky**: Tự động chạy lint và typecheck trước commit
- **CI/CD**: Tự động chạy full test suite khi push
- **Turbo**: Cache build để tăng tốc độ

---

*Quy trình này được thiết kế để đảm bảo chất lượng code và tài liệu luôn đồng bộ, giúp team dễ dàng maintain và onboard thành viên mới.*

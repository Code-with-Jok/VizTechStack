# Production Incident Access Rule

Rule này áp dụng khi có lỗi trên production (`prod incident`).

## Mandatory Access Permissions

Khi điều tra lỗi prod, AI Agent được phép và phải sử dụng:

1. `Browser access`
   - Xem dashboard deploy, log viewer, monitoring, error tracking.
   - Xác nhận trạng thái service, health check, rollout, rollback.
2. `Terminal access`
   - Chạy lệnh điều tra: logs, git diff, test reproduction, config verification.
   - Thực thi lệnh khắc phục an toàn theo runbook.
3. `PR access`
   - Đọc PR gần nhất liên quan service bị lỗi.
   - Đọc thay đổi code, CI result, review notes, rollback plan.

## Incident Flow (Fast + Safe)

1. Xác nhận phạm vi ảnh hưởng và mức độ nghiêm trọng.
2. Thu thập bằng chứng từ browser + terminal + PR.
3. Khoanh vùng nguyên nhân gốc theo thay đổi gần nhất.
4. Chọn phương án `mitigation` nhanh nhất với rủi ro thấp nhất.
5. Nếu chưa chắc chắn, ưu tiên rollback an toàn trước.
6. Sau khi ổn định, tạo task/ADR để xử lý root cause triệt để.

## Guardrails

- Không bỏ qua kiểm tra PR liên quan trước khi kết luận nguyên nhân.
- Không deploy hotfix trực tiếp nếu không có rollback plan.
- Không tắt security controls để "chữa cháy".
- Mọi workaround tạm thời phải có debt ticket + deadline xử lý dứt điểm.

## Required Incident Report Output

Sau khi xử lý prod incident, phải báo cáo:

1. Impact summary.
2. Root cause.
3. Evidence (browser/terminal/PR).
4. Mitigation and rollback action taken.
5. Follow-up actions (owner + deadline).

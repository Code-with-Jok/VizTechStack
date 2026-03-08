# Git Hooks với Husky

## Tổng Quan

VizTechStack sử dụng Husky để quản lý Git hooks nhằm đảm bảo chất lượng code và chuẩn commit message trước khi code được commit vào repository.

## Kiến Trúc

```
git commit
    ↓
Pre-commit Hook
    ↓
turbo lint typecheck
    ↓ (nếu pass)
Commit-msg Hook
    ↓
commitlint
    ↓ (nếu pass)
Commit Created ✅
```

## Hooks

### Pre-commit Hook

**Mục Đích**: Đảm bảo chất lượng code trước khi commit

**Chạy**:
- ESLint (code linting)
- TypeScript type checking

**Vị Trí**: `.husky/pre-commit`

```bash
#!/usr/bin/env sh
pnpm turbo lint typecheck
```

### Commit-msg Hook

**Mục Đích**: Đảm bảo format commit message theo chuẩn conventional

**Chạy**: Commitlint validation

**Vị Trí**: `.husky/commit-msg`

```bash
#!/usr/bin/env sh
pnpm commitlint --edit $1
```

## Format Commit Message

Tuân theo [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: Tính năng mới
- `fix`: Sửa bug
- `docs`: Thay đổi documentation
- `style`: Thay đổi code style (formatting)
- `refactor`: Code refactoring
- `test`: Thêm hoặc cập nhật tests
- `chore`: Maintenance tasks

### Ví Dụ

```bash
feat(roadmap): add bookmark functionality
fix(api): resolve circular dependency in modules
docs(readme): update installation instructions
refactor(web): extract hooks from components
```

## Cấu Hình

### Commitlint Config

Nằm trong `.commitlintrc.json`:

```json
{
  "extends": ["@commitlint/config-conventional"]
}
```

### Husky Setup

Tự động cài đặt qua script `pnpm prepare` trong `package.json`:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

## Lợi Ích

- **Early Error Detection**: Bắt lỗi trước khi đến CI/CD
- **Consistent Code Quality**: Đảm bảo standards tự động
- **Clean Git History**: Commit messages chuyên nghiệp
- **Faster CI/CD**: Giảm failed builds
- **Better Onboarding**: Developer mới tự động tuân theo standards

## Xử Lý Sự Cố

### Hooks Không Chạy

```bash
# Cài đặt lại Husky
rm -rf .husky
pnpm prepare
```

### Bypass Hooks (Chỉ Khẩn Cấp)

```bash
# Bỏ qua pre-commit hook
git commit --no-verify

# Không khuyến nghị sử dụng thường xuyên!
```

## Xem Thêm

- [Quy Trình Development](../01-getting-started/development.md)
- [Conventional Commits](https://www.conventionalcommits.org/)

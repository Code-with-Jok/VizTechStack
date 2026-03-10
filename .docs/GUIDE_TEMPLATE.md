# Task [Number]: [Task Name]

> **Template này dùng để tạo guide.md cho mỗi task. Copy template này và điền thông tin cụ thể.**

## 📋 Tổng quan

[Mô tả ngắn gọn task này làm gì và tại sao cần thiết. Giải thích context và vị trí của task trong big picture.]

**Ví dụ:**
> Task này cài đặt các dependencies cần thiết cho Apollo Client và GraphQL Code Generation. Đây là bước đầu tiên và quan trọng nhất vì tất cả các task sau đều phụ thuộc vào các packages này.

## 🎯 Mục tiêu

Sau khi hoàn thành task này, bạn sẽ:

- [ ] Mục tiêu 1 (cụ thể, đo lường được)
- [ ] Mục tiêu 2
- [ ] Mục tiêu 3

**Ví dụ:**
- [ ] Hiểu được Apollo Client là gì và tại sao dùng nó
- [ ] Biết cách cài đặt dependencies trong monorepo
- [ ] Có thể verify dependencies đã được cài đặt đúng

## 📚 Kiến thức cần biết trước

### Concepts

**[Concept 1]**
- **Là gì:** [Định nghĩa ngắn gọn]
- **Tại sao quan trọng:** [Giải thích]
- **Ví dụ:** [Ví dụ thực tế]

**Ví dụ - Apollo Client:**
- **Là gì:** GraphQL client library giúp fetch và cache data từ GraphQL API
- **Tại sao quan trọng:** Giúp quản lý state, caching, và error handling tự động
- **Ví dụ:** Thay vì dùng fetch() và quản lý cache thủ công, Apollo Client làm tất cả

### Technologies

**[Technology 1]**
- **Version:** [Version number]
- **Tại sao dùng:** [Lý do chọn tech này]
- **Alternatives:** [Các lựa chọn khác và tại sao không chọn]

**Ví dụ - pnpm:**
- **Version:** 9.15.0
- **Tại sao dùng:** Nhanh hơn npm/yarn, tiết kiệm disk space, hỗ trợ workspaces tốt
- **Alternatives:** npm (chậm hơn), yarn (không tối ưu cho monorepo)

### Prerequisites

- [ ] Đã hoàn thành task [X]
- [ ] Đã cài đặt [Tool/Package]
- [ ] Đã hiểu về [Concept]
- [ ] Có quyền access vào [Resource]

## 🔧 Hướng dẫn từng bước

### Bước 1: [Tên bước]

**Mục đích:** [Giải thích tại sao cần bước này]

**Thực hiện:**

```bash
# Command với comment giải thích
pnpm add package-name  # Cài đặt package vào workspace
```

**Giải thích chi tiết:**

[Giải thích từng phần của command/code]
- `pnpm add`: Command để thêm dependency
- `package-name`: Tên package cần cài
- Tại sao dùng pnpm thay vì npm: [Lý do]

**Kết quả mong đợi:**

```
✓ Package installed successfully
✓ package.json updated
✓ pnpm-lock.yaml updated
```

**Verify:**

- [ ] Check package.json có package-name
- [ ] Check node_modules có folder package-name
- [ ] Run `pnpm list package-name` thấy version

**Nếu có lỗi:** Xem [Troubleshooting](#troubleshooting) section

---

### Bước 2: [Tên bước]

[Tương tự bước 1...]

---

## 💻 Code Examples

### Example 1: [Tên example]

**Scenario:** [Khi nào dùng code này]

```typescript
// File: path/to/file.ts

/**
 * [Mô tả function/component]
 * 
 * @param param1 - [Mô tả parameter]
 * @returns [Mô tả return value]
 * 
 * @example
 * ```typescript
 * const result = exampleFunction('input');
 * console.log(result); // Output: 'expected output'
 * ```
 */
export function exampleFunction(param1: string): string {
  // Bước 1: Validate input
  if (!param1) {
    throw new Error('param1 is required');
  }
  
  // Bước 2: Process data
  const processed = param1.toUpperCase();
  
  // Bước 3: Return result
  return processed;
}
```

**Giải thích code:**

1. **Line 1-10:** JSDoc comment để document function
   - Giúp IDE show hints khi dùng function
   - Giúp developers khác hiểu cách dùng

2. **Line 12-14:** Input validation
   - Luôn validate input để tránh bugs
   - Throw error với message rõ ràng

3. **Line 16-17:** Business logic
   - Xử lý data theo yêu cầu
   - Giữ logic đơn giản và dễ hiểu

4. **Line 19-20:** Return result
   - Return type phải match với declaration
   - Không return undefined nếu không cần thiết

**Khi nào dùng:**
- Khi cần [use case 1]
- Khi muốn [use case 2]

**Khi nào KHÔNG dùng:**
- Khi [anti-pattern 1]
- Khi [anti-pattern 2]

---

### Example 2: [Tên example]

[Tương tự example 1...]

---

## ✅ Verification

### Kiểm tra thủ công

**Step 1: Visual Check**
- [ ] Mở file [X] và verify [Y]
- [ ] Check UI hiển thị đúng
- [ ] Test user interaction

**Step 2: Functional Check**
- [ ] Feature hoạt động như expected
- [ ] Error handling works
- [ ] Edge cases handled

### Chạy automated tests

```bash
# Build packages
pnpm turbo build --filter affected-package

# Expected output:
# ✓ Build completed successfully
# ✓ No errors

# Run linting
pnpm turbo lint --filter affected-package

# Expected output:
# ✓ No linting errors

# Run type checking
pnpm turbo typecheck --filter affected-package

# Expected output:
# ✓ No type errors

# Run tests
pnpm turbo test --filter affected-package

# Expected output:
# ✓ All tests pass
# ✓ Coverage > 80%

# Check for 'any' types
pnpm check:no-any

# Expected output:
# ✓ No explicit 'any' types found
```

### CI/CD Verification

```bash
# Run full CI pipeline locally
pnpm turbo build && \
pnpm turbo lint && \
pnpm turbo typecheck && \
pnpm turbo test && \
pnpm check:no-any

# Expected: Tất cả pass ✅
```

**Commit và push:**

```bash
# Stage changes
git add .

# Commit với conventional format
git commit -m "feat(scope): add feature X"

# Push
git push origin branch-name

# Check GitHub Actions
# Tất cả checks phải pass ✅
```

---

## 🐛 Troubleshooting

### Lỗi 1: [Tên lỗi phổ biến]

**Triệu chứng:**

```
Error: [Error message]
  at [stack trace]
```

**Nguyên nhân:**

[Giải thích tại sao lỗi xảy ra. Có thể có nhiều nguyên nhân:]

1. **Nguyên nhân 1:** [Mô tả]
   - Xảy ra khi: [Điều kiện]
   - Ảnh hưởng: [Impact]

2. **Nguyên nhân 2:** [Mô tả]
   - Xảy ra khi: [Điều kiện]
   - Ảnh hưởng: [Impact]

**Cách fix:**

**Option 1: [Tên solution]**

```bash
# Commands để fix
pnpm install
pnpm turbo build
```

**Giải thích:** [Tại sao solution này work]

**Option 2: [Tên solution]**

```bash
# Alternative solution
rm -rf node_modules
pnpm install
```

**Giải thích:** [Tại sao solution này work]

**Verify fix:**

- [ ] Error không còn xuất hiện
- [ ] Feature hoạt động bình thường
- [ ] Tests pass

---

### Lỗi 2: [Tên lỗi]

[Tương tự lỗi 1...]

---

### Lỗi 3: CI/CD Failures

**Lỗi: Pre-commit hook fails**

```bash
# Lỗi
✖ pnpm lint-staged failed
```

**Fix:**

```bash
# Fix linting errors
pnpm lint --fix

# Fix type errors manually
# Then commit again
```

**Lỗi: GitHub Actions fails**

```bash
# Check logs
gh run view [run-id]

# Fix issues locally
pnpm turbo build
pnpm turbo test

# Push fix
git push
```

---

## 📖 Tài liệu tham khảo

### Official Documentation

- [Apollo Client Docs](https://www.apollographql.com/docs/react/): Official Apollo Client documentation
- [GraphQL Codegen Docs](https://the-guild.dev/graphql/codegen): Code generation documentation
- [Next.js Docs](https://nextjs.org/docs): Next.js App Router documentation

### Internal Documentation

- [Tech Stack](../../.kiro/steering/tech.md): Project tech stack overview
- [Feature Implementation Standard](../../.agents/rules/feature-implementation-standard.md): Coding standards
- [Feature Development Workflow](../../.agents/workflows/feature-development-workflow.md): Development workflow

### Related Files

- `apps/web/package.json`: Web app dependencies
- `package.json`: Root package.json
- `pnpm-workspace.yaml`: Workspace configuration

### Related Tasks

- [Task X.X](../task-x.x/guide.md): Previous task
- [Task Y.Y](../task-y.y/guide.md): Next task
- [Task Z.Z](../task-z.z/guide.md): Related task

### External Resources

- [Article/Tutorial](url): Description
- [Video](url): Description
- [GitHub Repo](url): Example implementation

---

## 🎓 Bài tập thực hành (Optional)

### Bài 1: [Tên bài tập]

**Mục tiêu:** [Học được gì từ bài này]

**Yêu cầu:**

1. Requirement 1
2. Requirement 2
3. Requirement 3

**Gợi ý:**

- Hint 1
- Hint 2
- Hint 3

**Solution:** [Link to solution hoặc giải thích]

---

### Bài 2: [Tên bài tập]

[Tương tự bài 1...]

---

## ✅ Checklist hoàn thành Task

### Code Quality

- [ ] Code hoàn thành và hoạt động đúng
- [ ] Code follow coding standards
- [ ] No console.log statements
- [ ] No commented out code
- [ ] Proper error handling
- [ ] Input validation implemented

### Testing

- [ ] Unit tests written và pass
- [ ] Integration tests written và pass (if applicable)
- [ ] Test coverage > 80%
- [ ] Edge cases tested
- [ ] Error scenarios tested

### Type Safety

- [ ] No TypeScript errors
- [ ] No 'any' types (pnpm check:no-any pass)
- [ ] Proper type definitions
- [ ] Types exported correctly

### Code Quality Checks

- [ ] Lint pass (pnpm turbo lint)
- [ ] Typecheck pass (pnpm turbo typecheck)
- [ ] Build pass (pnpm turbo build)
- [ ] Tests pass (pnpm turbo test)

### Documentation

- [ ] Code có JSDoc comments
- [ ] Complex logic có inline comments
- [ ] README updated (if needed)
- [ ] This guide.md created và complete

### Git & CI/CD

- [ ] Pre-commit hooks pass
- [ ] Commit message đúng format (conventional commits)
- [ ] Branch name đúng format
- [ ] GitHub Actions CI pass
- [ ] No merge conflicts

### Review

- [ ] Self-review completed
- [ ] Code reviewed by peer (if applicable)
- [ ] Feedback addressed
- [ ] Ready to merge

---

## 📝 Notes

[Thêm notes quan trọng, gotchas, hoặc tips khác ở đây]

**Important:**
- Note 1
- Note 2

**Tips:**
- Tip 1
- Tip 2

**Common Mistakes:**
- Mistake 1: [Mô tả và cách tránh]
- Mistake 2: [Mô tả và cách tránh]

---

**Created:** [Date]
**Last Updated:** [Date]
**Author:** [Your name]
**Reviewers:** [Reviewer names]
**Status:** ✅ Complete / 🚧 In Progress / ⏳ Pending

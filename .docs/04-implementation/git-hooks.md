# Git Hooks with Husky

## Overview

VizTechStack uses Husky to manage Git hooks that enforce code quality and commit message standards before code is committed to the repository.

## Architecture

```
git commit
    ↓
Pre-commit Hook
    ↓
turbo lint typecheck
    ↓ (if pass)
Commit-msg Hook
    ↓
commitlint
    ↓ (if pass)
Commit Created ✅
```

## Hooks

### Pre-commit Hook

**Purpose**: Ensure code quality before commit

**Runs**:
- ESLint (code linting)
- TypeScript type checking

**Location**: `.husky/pre-commit`

```bash
#!/usr/bin/env sh
pnpm turbo lint typecheck
```

### Commit-msg Hook

**Purpose**: Enforce conventional commit message format

**Runs**: Commitlint validation

**Location**: `.husky/commit-msg`

```bash
#!/usr/bin/env sh
pnpm commitlint --edit $1
```

## Commit Message Format

Follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(roadmap): add bookmark functionality
fix(api): resolve circular dependency in modules
docs(readme): update installation instructions
refactor(web): extract hooks from components
```

## Configuration

### Commitlint Config

Located in `.commitlintrc.json`:

```json
{
  "extends": ["@commitlint/config-conventional"]
}
```

### Husky Setup

Automatically installed via `pnpm prepare` script in `package.json`:

```json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

## Benefits

- **Early Error Detection**: Catch issues before they reach CI/CD
- **Consistent Code Quality**: Enforce standards automatically
- **Clean Git History**: Professional commit messages
- **Faster CI/CD**: Reduce failed builds
- **Better Onboarding**: New developers follow standards automatically

## Troubleshooting

### Hooks Not Running

```bash
# Reinstall Husky
rm -rf .husky
pnpm prepare
```

### Bypass Hooks (Emergency Only)

```bash
# Skip pre-commit hook
git commit --no-verify

# Not recommended for regular use!
```

## See Also

- [Development Workflow](../01-getting-started/development.md)
- [Conventional Commits](https://www.conventionalcommits.org/)

# Contributing to DoksAI

Thank you for your interest in contributing to DoksAI! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Naming Convention](#branch-naming-convention)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Project Roadmap](#project-roadmap)
- [Getting Help](#getting-help)

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- **Bun** >= 1.0.0 (Package manager)
- **Node.js** >= 18.0.0
- **Git** >= 2.0.0
- A code editor (VS Code recommended)

### Installation

1. **Fork the repository**

   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/doksAI.git
   cd doksAI
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/abdullah4tech/doksAI.git
   ```

4. **Install dependencies**

   ```bash
   bun install
   ```

5. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Start development server**
   ```bash
   bun run dev
   ```

## 🔄 Development Workflow

### 1. Sync with Upstream

Before starting work, always sync with the upstream repository:

```bash
git checkout main
git pull upstream main
git push origin main
```

### 2. Create a Feature Branch

```bash
# For version-specific features
git checkout -b feature/v0.2.0-conversation-sidebar

# For bug fixes
git checkout -b fix/sidebar-scroll-issue

# For tests
git checkout -b test/vitest-setup
```

### 3. Make Your Changes

- Write clean, readable code
- Follow the coding standards (below)
- Add tests for new features
- Update documentation if needed

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat(v0.2.0): add conversation sidebar component"
```

### 5. Push to Your Fork

```bash
git push origin feature/v0.2.0-conversation-sidebar
```

### 6. Create a Pull Request

- Go to your fork on GitHub
- Click "New Pull Request"
- Select your branch
- Fill out the PR template
- Request review

## 🌳 Branch Naming Convention

We use a structured branch naming convention to keep the repository organized.

### Format

```
<type>/<version>-<short-description>
```

### Types

- `feature/` - New features
- `fix/` - Bug fixes
- `test/` - Testing-related changes
- `docs/` - Documentation updates
- `infra/` - Infrastructure/DevOps changes
- `refactor/` - Code refactoring
- `style/` - UI/styling changes
- `perf/` - Performance improvements
- `experimental/` - Experimental features

### Examples

```bash
feature/v0.2.0-conversation-sidebar
feature/v0.3.0-bookmark-system
fix/v0.2.0-sidebar-scroll-issue
test/vitest-setup
docs/update-readme
infra/ci-cd-pipeline
refactor/optimize-chat-store
```

## 💬 Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks (dependencies, config, etc.)
- `ci` - CI/CD changes
- `build` - Build system changes

### Scope

Use the version number when applicable:

- `v0.2.0` - Conversation Management features
- `v0.3.0` - Bookmarks & Labels features
- `v0.4.0` - Advanced Interaction features
- `v0.5.0` - Document Intelligence features
- `v0.6.0` - Smart Suggestions features

Or use component/feature names:

- `sidebar` - Sidebar component
- `store` - State management
- `api` - API services
- `ui` - User interface

### Examples

```bash
# Feature
feat(v0.2.0): add conversation sidebar component
feat(sidebar): implement search functionality

# Bug Fix
fix(v0.3.0): resolve bookmark persistence issue
fix(api): handle timeout errors correctly

# Documentation
docs(readme): update installation instructions
docs(contributing): add testing guidelines

# Testing
test(sidebar): add unit tests for search
test(store): add tests for chat session management

# Refactoring
refactor(store): optimize message handling
refactor(ui): improve button component structure

# Performance
perf(v0.5.0): optimize chart rendering

# Chore
chore(deps): update vue to 3.5.13
chore(config): update vite configuration
```

### Rules

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Limit first line to 72 characters
- Reference issues when applicable (#123)

## 🔀 Pull Request Process

### Before Creating a PR

- [ ] Code follows project coding standards
- [ ] All tests pass locally
- [ ] New code has appropriate tests
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] Branch is up to date with main/develop

### PR Title Format

```
[v0.2.0] Add Conversation Sidebar
[v0.3.0] Implement Bookmark System
[FIX] Resolve sidebar scroll issue
[TEST] Add Vitest configuration
[DOCS] Update README
```

### PR Description Template

## Description

Brief description of changes

## Related Issue

Closes #123

## Type of Change

- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Screenshots (if applicable)

Add screenshots or GIFs

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have updated the documentation accordingly
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

### Review Process

1. **Automated Checks** - CI/CD pipeline runs tests and linting
2. **Code Review** - At least one maintainer reviews the code
3. **Changes Requested** - Address feedback if needed
4. **Approval** - Once approved, the PR can be merged
5. **Merge** - Maintainer merges using squash or merge commit

## 🎨 Coding Standards

### TypeScript

```typescript
// Use explicit types
const message: string = 'Hello'
const count: number = 42

// Use interfaces for objects
interface User {
  id: string
  name: string
  email: string
}

// Use type for unions/intersections
type Status = 'pending' | 'completed' | 'failed'

// Prefer const over let
const API_URL = 'http://localhost:8000'

// Use arrow functions for consistency
const getUserName = (user: User): string => user.name
```

### Vue 3 Composition API

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Message } from '@/store/types'

// Use refs for reactive state
const message = ref<string>('')
const isLoading = ref<boolean>(false)

// Use computed for derived state
const messageCount = computed(() => messages.value.length)

// Type your functions
const sendMessage = (text: string): void => {
  // Implementation
}

// Use lifecycle hooks appropriately
onMounted(() => {
  // Initialize
})
</script>
```

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Keep custom CSS minimal
- Use scoped styles when necessary

```vue
<template>
  <!-- Mobile-first responsive -->
  <div class="p-4 sm:p-6 lg:p-8">
    <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold">Title</h1>
  </div>
</template>

<style scoped>
/* Custom styles only when necessary */
.custom-gradient {
  background: linear-gradient(to right, #667eea 0%, #764ba2 100%);
}
</style>
```

### File Organization

```
src/
├── components/        # Reusable components
│   ├── MyComponent.vue
│   └── __tests__/     # Component tests
├── pages/            # Page components
├── store/            # Pinia stores
│   ├── index.ts
│   ├── types.ts
│   └── __tests__/    # Store tests
├── services/         # API services
├── utils/            # Utility functions
├── composables/      # Vue composables
└── styles/           # Global styles
```

### Naming Conventions

- **Components**: PascalCase (`MyComponent.vue`)
- **Files**: camelCase (`userService.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Functions**: camelCase (`getUserData()`)
- **Interfaces/Types**: PascalCase (`interface User {}`)
- **Store**: camelCase with 'use' prefix (`useUserStore`)

## 🧪 Testing Guidelines

### Writing Tests

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { mount } from '@vue/test-utils'

describe('Component/Feature Name', () => {
  beforeEach(() => {
    // Setup
  })

  it('should describe what the test does', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = functionUnderTest(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

### Test Coverage

- Aim for >80% code coverage
- Write tests for:
  - All store actions and getters
  - Utility functions
  - Component props and events
  - Edge cases and error handling

### Running Tests

```bash
# Run all tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run tests with coverage
bun run test:coverage

# Run tests with UI
bun run test:ui
```

## 🗺️ Project Roadmap

We follow a versioned release strategy. Contributions should align with the current version in development.

### Current Version: v0.1.0 (Beta)

### Upcoming Versions

| Version    | Focus                   | Status     |
| ---------- | ----------------------- | ---------- |
| **v0.2.0** | Conversation Management | 🔜 Next    |
| **v0.3.0** | Bookmarks & Labels      | 📋 Planned |
| **v0.4.0** | Advanced Interaction    | 📋 Planned |
| **v0.5.0** | Document Intelligence   | 📋 Planned |
| **v0.6.0** | Smart Suggestions       | 📋 Planned |
| **v1.0.0** | Production Release      | 🎯 Goal    |

See [ROADMAP.md](./ROADMAP.md) for detailed feature descriptions.

### Finding Issues to Work On

1. Check [GitHub Issues](https://github.com/abdullah4tech/doksAI/issues)
2. Look for issues labeled:
   - `good first issue` - Great for newcomers
   - `help wanted` - Need contributors
   - `v0.2.0`, `v0.3.0`, etc. - Version-specific features
3. Comment on the issue to claim it
4. Follow the issue template guidelines

## 💡 Getting Help

### Questions?

- 💬 [GitHub Discussions](https://github.com/abdullah4tech/doksAI/discussions) - Ask questions
- 📝 [Documentation](./README.md) - Read the docs
- 🐛 [Issues](https://github.com/abdullah4tech/doksAI/issues) - Report bugs

### Communication

- Be clear and concise
- Provide context and examples
- Be patient and respectful
- Search existing issues/discussions first

## 📝 Documentation

When adding features, please update:

- `README.md` - If user-facing features change
- `CHANGELOG.md` - Document all changes
- Code comments - For complex logic
- Type definitions - Keep types up to date
- Tests - Document test scenarios

## 🎉 Recognition

Contributors will be:

- Listed in the project README
- Mentioned in release notes
- Celebrated in project discussions

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project (check LICENSE file).

---

Thank you for contributing to DoksAI! Your efforts help make this project better for everyone. 🚀

**Questions?** Open a [discussion](https://github.com/abdullah4tech/doksAI/discussions) or reach out to the maintainers.

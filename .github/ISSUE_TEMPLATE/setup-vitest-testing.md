---
name: 'Setup Vitest for Testing Infrastructure'
about: Configure Vitest as the testing framework for DoksAI
title: 'Setup Vitest for Testing Infrastructure'
labels: testing, infrastructure, enhancement
assignees: ''
---

## Description

Set up Vitest as the primary testing framework for DoksAI. Vitest is a blazing fast unit test framework powered by Vite, providing native TypeScript support and Vue component testing capabilities.

## User Stories

- As a developer, I want a fast and reliable testing framework to ensure code quality
- As a developer, I want to write unit tests for store modules and utilities
- As a developer, I want to write component tests for Vue components
- As a developer, I want test coverage reports to identify untested code
- As a developer, I want tests to run in CI/CD pipeline automatically

## Tasks

### Installation & Configuration

- [ ] Install Vitest and dependencies

  ```bash
  bun add -D vitest @vitest/ui @vitest/coverage-v8
  bun add -D @vue/test-utils jsdom
  bun add -D happy-dom # Alternative to jsdom (faster)
  ```

- [ ] Create `vitest.config.ts`

  ```typescript
  import { defineConfig } from 'vitest/config'
  import vue from '@vitejs/plugin-vue'
  import { fileURLToPath } from 'node:url'

  export default defineConfig({
    plugins: [vue()],
    test: {
      globals: true,
      environment: 'jsdom', // or 'happy-dom'
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/mockData',
          'src/main.ts',
        ],
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  })
  ```

- [ ] Create test setup file `src/test/setup.ts`
  - Configure Vue Test Utils
  - Mock global objects (window, localStorage, etc.)
  - Set up test utilities and helpers

- [ ] Update `package.json` scripts

  ```json
  {
    "scripts": {
      "test": "vitest",
      "test:ui": "vitest --ui",
      "test:run": "vitest run",
      "test:coverage": "vitest run --coverage",
      "test:watch": "vitest watch"
    }
  }
  ```

### Test Structure Setup

- [ ] Create test directory structure

  ```
  src/
  ├── test/
  │   ├── setup.ts
  │   ├── utils/
  │   │   ├── testHelpers.ts
  │   │   └── mockData.ts
  │   └── __mocks__/
  │       ├── localStorage.ts
  │       └── api.ts
  ```

- [ ] Create test helpers
  - [ ] `testHelpers.ts` - Common test utilities
  - [ ] `mockData.ts` - Mock data for tests
  - [ ] Mock functions for API calls
  - [ ] Mock functions for localStorage

### Sample Tests

- [ ] Write sample store tests
  - [ ] Create `src/store/__tests__/documents.test.ts`
  - [ ] Test document upload functionality
  - [ ] Test document deletion
  - [ ] Test document state management

- [ ] Write sample component tests
  - [ ] Create `src/components/__tests__/Toast.test.ts`
  - [ ] Test component rendering
  - [ ] Test component props
  - [ ] Test component events

- [ ] Write sample utility tests
  - [ ] Create `src/utils/__tests__/markdown.test.ts`
  - [ ] Test markdown parsing
  - [ ] Test code highlighting

- [ ] Write sample API tests
  - [ ] Create `src/services/__tests__/api.test.ts`
  - [ ] Test API endpoints
  - [ ] Test error handling
  - [ ] Test request/response transformation

### Configuration Files

- [ ] Update `tsconfig.json` for tests

  ```json
  {
    "compilerOptions": {
      "types": ["vitest/globals", "@vue/test-utils"]
    }
  }
  ```

- [ ] Create `.vscode/settings.json` for Vitest

  ```json
  {
    "vitest.enable": true,
    "vitest.commandLine": "bun run test"
  }
  ```

- [ ] Update `.gitignore`

  ```
  # Test coverage
  coverage/
  .nyc_output/

  # Vitest
  .vitest/
  ```

### Documentation

- [ ] Create `docs/TESTING.md`
  - [ ] Testing philosophy and guidelines
  - [ ] How to run tests
  - [ ] How to write tests
  - [ ] Testing best practices
  - [ ] Coverage requirements

- [ ] Update main `README.md`
  - [ ] Add testing section
  - [ ] Add badges for test coverage
  - [ ] Link to testing documentation

### CI/CD Integration

- [ ] Create GitHub Actions workflow `.github/workflows/test.yml`

  ```yaml
  name: Tests

  on:
    push:
      branches: [main, develop]
    pull_request:
      branches: [main, develop]

  jobs:
    test:
      runs-on: ubuntu-latest

      steps:
        - uses: actions/checkout@v4

        - name: Setup Bun
          uses: oven-sh/setup-bun@v1

        - name: Install dependencies
          run: bun install

        - name: Run tests
          run: bun run test:run

        - name: Generate coverage
          run: bun run test:coverage

        - name: Upload coverage to Codecov
          uses: codecov/codecov-action@v3
          with:
            files: ./coverage/coverage-final.json
            flags: unittests
            name: codecov-umbrella
  ```

- [ ] Set up coverage reporting (Codecov or Coveralls)
- [ ] Add status badges to README

## Acceptance Criteria

- [ ] Vitest is installed and configured correctly
- [ ] Tests can be run with `bun run test`
- [ ] Test UI is accessible with `bun run test:ui`
- [ ] Coverage reports are generated correctly
- [ ] At least 3 sample tests are written and passing:
  - [ ] Store test
  - [ ] Component test
  - [ ] Utility test
- [ ] Test helpers and mocks are set up
- [ ] Documentation is complete
- [ ] CI/CD pipeline runs tests automatically
- [ ] Coverage badge is displayed in README
- [ ] All tests pass in CI/CD

## Sample Test Examples

### Store Test Example

```typescript
// src/store/__tests__/documents.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDocumentStore } from '../documents'

describe('Document Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with empty documents', () => {
    const store = useDocumentStore()
    expect(store.documents).toEqual([])
  })

  it('should add document to store', () => {
    const store = useDocumentStore()
    const mockDoc = {
      id: '1',
      filename: 'test.pdf',
      uploadDate: new Date(),
      size: 1024,
      status: 'completed',
    }

    store.documents.push(mockDoc)
    expect(store.documents).toHaveLength(1)
    expect(store.documents[0].filename).toBe('test.pdf')
  })
})
```

### Component Test Example

```typescript
// src/components/__tests__/Toast.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Toast from '../Toast.vue'

describe('Toast Component', () => {
  it('renders toast with message', () => {
    const wrapper = mount(Toast, {
      props: {
        message: 'Test message',
        type: 'success',
      },
    })

    expect(wrapper.text()).toContain('Test message')
    expect(wrapper.classes()).toContain('toast-success')
  })

  it('emits close event when dismissed', async () => {
    const wrapper = mount(Toast, {
      props: {
        message: 'Test',
        type: 'info',
      },
    })

    await wrapper.find('.close-button').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('close')
  })
})
```

### Utility Test Example

````typescript
// src/utils/__tests__/markdown.test.ts
import { describe, it, expect } from 'vitest'
import { parseMarkdown } from '../markdown'

describe('Markdown Utils', () => {
  it('should parse basic markdown', () => {
    const input = '# Hello World'
    const result = parseMarkdown(input)
    expect(result).toContain('<h1')
    expect(result).toContain('Hello World')
  })

  it('should highlight code blocks', () => {
    const input = '```javascript\nconst x = 1;\n```'
    const result = parseMarkdown(input)
    expect(result).toContain('hljs')
  })
})
````

## Dependencies

- Current v0.1.0 codebase
- Vite configuration
- TypeScript setup
- Vue 3 and Pinia

## Technical Considerations

### Performance

- Vitest runs tests in parallel by default (fast)
- Use `test.concurrent` for independent tests
- Mock expensive operations (API calls, file I/O)

### Best Practices

- Write descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Keep tests isolated and independent
- Mock external dependencies
- Aim for >80% code coverage
- Test edge cases and error scenarios

### File Naming

- Test files: `*.test.ts` or `*.spec.ts`
- Place tests in `__tests__` directories
- Match test file names to source files

## Testing Strategy

### Unit Tests (Priority)

- Store modules (`src/store/`)
- Utilities (`src/utils/`)
- Composables (`src/composables/`)
- Services (`src/services/`)

### Component Tests (Priority)

- Individual Vue components
- Component props and events
- Component state changes
- User interactions

### Integration Tests (Future)

- Store + Component interactions
- API + Store integration
- Router navigation flows

### E2E Tests (Future - v1.0.0)

- Critical user flows
- Full application scenarios
- Use Playwright or Cypress

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils Documentation](https://test-utils.vuejs.org/)
- [Testing Pinia Stores](https://pinia.vuejs.org/cookbook/testing.html)
- [Vitest UI](https://vitest.dev/guide/ui.html)

## Related Issues

- Related to: #6 (v1.0.0 Production Release - Testing section)
- Enables: Better code quality for all future versions
- Blocks: None (can be done in parallel with feature development)

## Milestone

Infrastructure / v0.1.1

## Additional Notes

- This is foundational work that will benefit all future versions
- Should be completed before or in parallel with v0.2.0
- Can be done incrementally (setup first, then add more tests)
- Consider adding VSCode Vitest extension for better DX

## Success Metrics

- [ ] Test suite runs successfully
- [ ] Coverage reports are generated
- [ ] CI/CD pipeline passes
- [ ] At least 20% initial code coverage
- [ ] Test execution time < 10 seconds for current codebase
- [ ] All team members can run tests locally

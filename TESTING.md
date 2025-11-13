# Testing Guide for doksAI

This document outlines the testing setup, structure, and best practices for the doksAI project.

## Quick Start

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with UI
npm test:ui

# Generate coverage report
npm run coverage
```

## Test Structure Overview

The project uses **Vitest** with **Vue Test Utils** for comprehensive testing:

- **79+ tests** covering components, stores, utilities, and API services
- **4 test suites** organized by feature area
- **Comprehensive mocks** for API calls, localStorage, and Pinia stores

### File Organization

```
src/
├── __tests__/
│   ├── setup.ts                    # Global test config
│   ├── utils/testHelpers.ts        # Testing utilities
│   ├── utils/mockData.ts           # Mock API responses
│   ├── __mocks__/api.ts            # Mock API service
│   ├── __mocks__/localStorage.ts   # Mock storage
│   └── README.md                   # Detailed test guide
├── components/__tests__/
│   └── Toast.test.ts               # 17 component tests
├── store/__tests__/
│   └── documents.test.ts           # 14 store tests
├── services/__tests__/
│   └── api.test.ts                 # 20 API tests
└── utils/__tests__/
    └── markdown.test.ts            # 28 utility tests
```

## Test Coverage Summary

### Component Tests (Toast.test.ts)
**17 tests** - Vue component functionality

- Component rendering and props
- Event emissions
- Conditional styling based on toast type
- Icon rendering and colors
- Accessibility attributes (role, aria-label)

**Run:** `npm test -- src/components/__tests__/`

### Store Tests (documents.test.ts)
**14 tests** - Pinia store state management

- Document CRUD operations (add, remove, update)
- Computed properties (filtering, sorting)
- Upload progress tracking
- File validation and initialization
- State mutations and side effects

**Run:** `npm test -- src/store/__tests__/`

### Utility Tests (markdown.test.ts)
**28 tests** - Pure function utilities

- Markdown parsing (headings, emphasis, links, code)
- HTML class injection for styling
- Markdown stripping and text extraction
- Edge cases and error handling
- Complex multi-element markdown

**Run:** `npm test -- src/utils/__tests__/`

### API Tests (api.test.ts)
**20 tests** - API service integration

- Document ingestion endpoints
- Document querying and retrieval
- Health check monitoring
- Statistics collection
- File utility functions (base64 conversion, validation)
- Network error handling
- Request/response transformation

**Run:** `npm test -- src/services/__tests__/`

## Key Testing Tools & Features

### Test Helpers (testHelpers.ts)

Reusable utilities for testing:

```typescript
// Pinia setup
setupTestPinia()

// Create mock objects
const toast = createMockToast({ type: 'success' })
const doc = createMockDocument({ status: 'ready' })
const file = createMockFile('test.pdf', 1024 * 1024)

// Async utilities
await flushPromises()
await mockLocalStorage()

// Verification
verifyFetchCall(fetchMock, 'http://api.com', { method: 'POST' })
```

### Mock Data (mockData.ts)

Pre-built mock responses for:
- Document objects (various states)
- API ingest responses (success/error)
- API query responses (with sources)
- Health check responses
- Statistics responses

### Mocking Strategy

**API Mocking:**
```typescript
vi.mock('@/services/api')  // Use __mocks__/api.ts
```

**Store Mocking:**
```typescript
vi.mock('@/store/toast')   // Use __mocks__/toast.ts
```

**Fetch Mocking:**
```typescript
global.fetch = vi.fn()
fetchMock.mockResolvedValueOnce(new Response(...))
```

## Testing Patterns

### Testing Vue Components

```typescript
import { mount } from '@vue/test-utils'
import Toast from '@/components/Toast.vue'

it('should render the toast', () => {
  const wrapper = mount(Toast, {
    props: { toast: { title: 'Test', type: 'success' } }
  })
  expect(wrapper.text()).toContain('Test')
})

it('should emit close event', async () => {
  const wrapper = mount(Toast, { props: { toast } })
  await wrapper.find('button').trigger('click')
  expect(wrapper.emitted('close')).toBeTruthy()
})
```

### Testing Pinia Stores

```typescript
import { useDocumentStore } from '@/store/documents'
import { setupTestPinia } from '@/__tests__/utils/testHelpers'

beforeEach(() => setupTestPinia())

it('should add document', () => {
  const store = useDocumentStore()
  const id = store.addDocument(file)
  expect(store.documents[id]).toBeDefined()
})
```

### Testing Utilities

```typescript
import { parseMarkdown } from '@/utils/markdown'

it('should parse markdown', () => {
  const html = parseMarkdown('# Title')
  expect(html).toContain('text-2xl')
})
```

### Testing API Services

```typescript
global.fetch = vi.fn()

it('should ingest document', async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(mockIngestSuccessResponse))
  )
  const response = await api.ingestDocument(request)
  expect(response.success).toBe(true)
})
```

## Best Practices

### 1. Descriptive Test Names
```typescript
// ✓ Good
it('should display title and description when both are provided', () => {...})

// ✗ Avoid
it('renders correctly', () => {...})
```

### 2. Organize with Describe Blocks
```typescript
describe('Component Rendering', () => {...})
describe('Component Props', () => {...})
describe('Component Events', () => {...})
```

### 3. Test Behavior, Not Implementation
```typescript
// ✓ Good - tests visible behavior
expect(wrapper.text()).toContain('Expected text')

// ✗ Avoid - tests internal state
expect(component.internalVar).toBe(true)
```

### 4. Use Setup and Teardown
```typescript
beforeEach(() => {
  setupTestPinia()
  // other setup
})

afterEach(() => {
  vi.clearAllMocks()
})
```

### 5. Mock External Dependencies
```typescript
vi.mock('@/services/api')
vi.mock('@/store/toast')
vi.mock('@/composables/useApi')
```

### 6. Keep Tests Independent
- Each test should be runnable independently
- Don't depend on test execution order
- Clean up state between tests
- Use `beforeEach` for common setup

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Mock not working | Ensure `vi.mock()` at top level, check path matches |
| Test timeout | Increase timeout: `it('test', async () => {...}, 10000)` |
| Async test failing | Use `await flushPromises()` after async operations |
| Component prop changes | Use `await wrapper.setProps()` |
| Store not initializing | Call `setupTestPinia()` in `beforeEach` |
| Memory issues | Avoid large test data arrays, clean up mocks |

## CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm test -- --run

- name: Generate coverage
  run: npm run coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Development Workflow

### Writing a New Test

1. **Create test file** in appropriate `__tests__` directory
2. **Import helpers** from `src/__tests__/utils/testHelpers.ts`
3. **Set up mocks** with `vi.mock()` declarations
4. **Write describe blocks** for logical grouping
5. **Use helper functions** for setup (setupTestPinia, createMock*)
6. **Run tests** in watch mode: `npm test -- --watch`
7. **Check coverage** with `npm run coverage`

### Adding Test Utilities

1. Add function to `src/__tests__/utils/testHelpers.ts`
2. Export the function
3. Import and use in tests
4. Document in README.md

### Adding Mock Data

1. Add mock response to `src/__tests__/utils/mockData.ts`
2. Export as named constant
3. Import in test files
4. Use in mock fetch/API calls

## Resources

- [Vitest Docs](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Pinia Testing](https://pinia.vuejs.org/cookbook/testing.html)
- [Testing Library](https://testing-library.com/)

## Test Checklist

When adding new features, ensure:

- [ ] Unit tests for new components (if applicable)
- [ ] Store tests for new state mutations
- [ ] Utility function tests for new helpers
- [ ] API service tests for new endpoints
- [ ] Mock data created for new API responses
- [ ] Tests pass locally before committing
- [ ] Coverage report generated
- [ ] Test descriptions are clear and descriptive

# Test Directory Structure

Comprehensive test suite for the doksAI project using Vitest and Vue Test Utils.

## Directory Structure

```
src/__tests__/
├── setup.ts                 # Global test configuration
├── utils/
│   ├── testHelpers.ts       # Reusable test utilities
│   └── mockData.ts          # Mock data for tests
├── __mocks__/
│   ├── api.ts               # Mock API responses
│   └── localStorage.ts      # Mock localStorage
└── README.md                # This file

src/components/__tests__/
├── Toast.test.ts            # Toast component tests

src/store/__tests__/
└── documents.test.ts        # Pinia store tests

src/services/__tests__/
└── api.test.ts              # API service tests

src/utils/__tests__/
└── markdown.test.ts         # Utility function tests
```

## Setup and Configuration

### Global Setup (setup.ts)

The `setup.ts` file runs before all tests and configures:
- Mock `Element.prototype.scrollTo` for jsdom environment
- Global mock cleanup after each test

### Test Helpers (testHelpers.ts)

Common utilities for testing:

- **setupTestPinia()** - Initialize Pinia store for tests
- **createMockToast()** - Create mock Toast objects
- **createMockDocument()** - Create mock Document objects
- **createMockFile()** - Create mock File objects for upload testing
- **flushPromises()** - Wait for async operations to complete
- **mockLocalStorage()** - Mock browser localStorage
- **createMockFetchResponse()** - Create mock fetch responses
- **verifyFetchCall()** - Verify fetch was called correctly

### Mock Data (mockData.ts)

Pre-configured mock data for API responses:

- `mockDocuments` - Sample document objects
- `mockIngestSuccessResponse` - Successful document ingestion response
- `mockIngestErrorResponse` - Failed document ingestion response
- `mockQuerySuccessResponse` - Successful query response
- `mockQueryErrorResponse` - Failed query response
- `mockHealthResponse` - API health check response
- `mockHealthDegradedResponse` - Degraded health response

## Test Suites

### Component Tests (Toast.test.ts)

Tests for Vue components using `@vue/test-utils`:

- **Component Rendering** - Verify component renders correctly
- **Component Props** - Test prop binding and updates
- **Component Events** - Verify emitted events
- **Styling & Icons** - Test conditional CSS classes and icons
- **Accessibility** - Verify ARIA attributes and semantic HTML

**Coverage:**
- 17 tests covering all toast types (success, error, warning, info)
- Icon and styling verification
- Accessibility attributes

### Store Tests (documents.test.ts)

Tests for Pinia stores:

- **Document Addition** - Adding new documents to store
- **Document Deletion** - Removing documents
- **State Management** - Computed properties and filtering
- **Document Updates** - Updating document properties
- **Progress Tracking** - Upload progress management
- **File Upload** - File validation and initialization

**Coverage:**
- 14 tests for document store state management
- File validation and size formatting
- Upload progress tracking

### Utility Tests (markdown.test.ts)

Tests for utility functions:

**parseMarkdown()**
- Heading, paragraph, and text formatting
- Bold, italic, and code styling
- Links with proper attributes
- Code blocks and blockquotes
- Lists (ordered and unordered)
- Tables with responsive styling
- Complex markdown with mixed content
- Error handling and edge cases

**stripMarkdown()**
- Removal of all markdown syntax
- Preservation of text content
- Line break normalization
- Edge case handling

**Coverage:**
- 28 tests covering all markdown features
- Error handling for malformed markdown
- Empty string and whitespace handling

### API Tests (api.test.ts)

Tests for API service integration:

- **Document Ingestion** - Upload and validation
- **Document Querying** - Search and retrieval
- **Health Checks** - Service health monitoring
- **Statistics** - Collection stats retrieval
- **File Utilities** - Base64 conversion and validation
- **Error Handling** - Network and timeout errors
- **Request/Response** - Data transformation

**Coverage:**
- 20 tests for API endpoints
- Network error handling
- Request/response validation

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test -- --watch
```

### Run UI mode
```bash
npm test:ui
```

### Run specific test file
```bash
npm test -- src/utils/__tests__/markdown.test.ts
```

### Generate coverage report
```bash
npm run coverage
```

## Best Practices

### Writing Tests

1. **Use descriptive names** - Test names should clearly describe what is being tested
   ```typescript
   it('should display the title when provided', () => { ... })
   ```

2. **Organize with describe blocks** - Group related tests
   ```typescript
   describe('Component Rendering', () => { ... })
   ```

3. **Test behavior, not implementation** - Focus on what the component/function does
   ```typescript
   // Good: Tests visible behavior
   expect(wrapper.text()).toContain('Test Title')
   
   // Avoid: Tests internal implementation
   expect(component.title).toBe('Test Title')
   ```

4. **Use beforeEach for setup** - Avoid repeating initialization
   ```typescript
   beforeEach(() => {
     setupTestPinia()
   })
   ```

5. **Mock external dependencies** - Use `vi.mock()` for external modules
   ```typescript
   vi.mock('@/services/api')
   vi.mock('@/store/toast')
   ```

### Test Naming Conventions

- Use `describe()` for grouping related tests
- Use `it()` for individual test cases
- Prefix assertions with "should" in test descriptions
- Group by feature/functionality

### Mock Data

- Keep mock data simple and realistic
- Store reusable mocks in `mockData.ts`
- Create specific mocks only when needed
- Document what each mock represents

### Async Testing

- Use `flushPromises()` to wait for async operations
- Mock `fetch()` for API calls
- Use `await wrapper.setProps()` for prop updates
- Be careful with timing in component tests

## Common Patterns

### Testing Component Events
```typescript
it('should emit close event when close button is clicked', async () => {
  const wrapper = mount(Toast, { props: { toast } })
  await wrapper.find('button').trigger('click')
  expect(wrapper.emitted('close')).toBeTruthy()
})
```

### Testing Store State
```typescript
it('should add a document to the store', () => {
  const store = useDocumentStore()
  const docId = store.addDocument(file)
  expect(store.documents[docId]).toBeDefined()
})
```

### Testing Computed Properties
```typescript
it('should filter ready documents', () => {
  const store = useDocumentStore()
  store.documents['doc-1'] = createMockDocument({ status: 'ready' })
  const ready = store.readyDocuments
  expect(ready).toHaveLength(1)
})
```

### Testing API Calls
```typescript
it('should ingest a document successfully', async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(mockIngestSuccessResponse))
  )
  const response = await api.ingestDocument(request)
  expect(response.success).toBe(true)
})
```

## Troubleshooting

### Test Timeouts
- Increase timeout: `it('test', async () => {...}, 10000)`
- Check for missing `vi.clearAllMocks()` in `afterEach`

### Mock Not Working
- Ensure `vi.mock()` calls are at top level
- Check that mock path matches import path
- Verify manual mocks exist in `__mocks__` directory

### Component Tests Failing
- Use `await flushPromises()` after async operations
- Check that Pinia is set up with `setupTestPinia()`
- Verify component uses correct prop names

### Memory Issues
- Avoid creating large test data arrays
- Use `vi.resetAllMocks()` between tests
- Check for memory leaks in async tests

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Pinia Testing](https://pinia.vuejs.org/cookbook/testing.html)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)

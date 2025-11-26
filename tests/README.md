# Testing Guidelines for FructoSahel

This document provides guidelines for writing and running tests in the FructoSahel Next.js application.

## Test Stack

- **Test Framework**: [Vitest](https://vitest.dev/) - A blazing fast unit test framework powered by Vite
- **Testing Library**: [@testing-library/react](https://testing-library.com/react) - For testing React components
- **DOM Testing**: [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) - Custom matchers for DOM assertions
- **User Interactions**: [@testing-library/user-event](https://testing-library.com/docs/user-event/intro) - Simulating user interactions
- **Environment**: [jsdom](https://github.com/jsdom/jsdom) - DOM implementation for Node.js

## Running Tests

```bash
# Run tests in watch mode
bun test

# Run tests with UI
bun test:ui

# Run tests with coverage report
bun test:coverage

# Run tests once (CI mode)
bun run vitest run
```

## Project Structure

```
tests/
├── setup.ts                    # Global test setup and mocks
├── components/                 # Component tests
│   └── button.test.tsx
├── hooks/                      # Custom hook tests
│   └── use-farms.test.ts
├── utils/                      # Utility function tests
│   └── format.test.ts
└── README.md                   # This file
```

## Writing Tests

### Component Tests

When testing components, follow these best practices:

1. **Test user-facing behavior**, not implementation details
2. **Use accessible queries** (getByRole, getByLabelText, etc.)
3. **Test user interactions** with userEvent
4. **Test different variants and props**

Example:

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('handles onClick event', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Hook Tests

Test custom hooks using `renderHook` from @testing-library/react:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useFarms } from '@/lib/hooks/use-farms'

describe('useFarms', () => {
  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches farms successfully', async () => {
    const mockData = [{ id: '1', name: 'Test Farm' }]
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    })

    const { result } = renderHook(() => useFarms())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
  })
})
```

### Utility Function Tests

Test pure functions with straightforward input/output assertions:

```typescript
import { describe, it, expect } from 'vitest'
import { formatCurrency } from '@/lib/utils/format'

describe('formatCurrency', () => {
  it('formats currency in West African CFA Franc', () => {
    const result = formatCurrency(150000)
    expect(result).toContain('150')
    expect(result).toContain('000')
  })
})
```

## Best Practices

### 1. Arrange-Act-Assert Pattern

Structure your tests using the AAA pattern:

```typescript
it('should do something', () => {
  // Arrange - Set up test data and conditions
  const initialValue = 5

  // Act - Execute the code being tested
  const result = myFunction(initialValue)

  // Assert - Verify the result
  expect(result).toBe(10)
})
```

### 2. Use Descriptive Test Names

Test names should clearly describe what is being tested:

```typescript
// Good
it('formats currency in West African CFA Franc', () => {})
it('displays error message when API request fails', () => {})

// Bad
it('works', () => {})
it('test 1', () => {})
```

### 3. Mock External Dependencies

Always mock external dependencies like API calls, navigation, and third-party libraries:

```typescript
// Already mocked in tests/setup.ts
// - next/navigation
// - next-intl

// Mock fetch for API calls
beforeEach(() => {
  global.fetch = vi.fn()
})
```

### 4. Clean Up After Tests

Use `afterEach` to clean up mocks and restore original implementations:

```typescript
afterEach(() => {
  vi.restoreAllMocks()
})
```

### 5. Use waitFor for Async Operations

When testing async code, use `waitFor` to wait for state updates:

```typescript
await waitFor(() => {
  expect(result.current.isLoading).toBe(false)
})
```

### 6. Test Edge Cases

Don't just test the happy path. Test edge cases:

- Empty states
- Error states
- Loading states
- Boundary values
- Null/undefined inputs

### 7. Keep Tests Isolated

Each test should be independent and not rely on the state from other tests:

```typescript
// Good - Each test is isolated
describe('Counter', () => {
  it('increments count', () => {
    const counter = new Counter()
    counter.increment()
    expect(counter.value).toBe(1)
  })

  it('decrements count', () => {
    const counter = new Counter()
    counter.decrement()
    expect(counter.value).toBe(-1)
  })
})
```

## Mocking

### Global Mocks

Global mocks are configured in `tests/setup.ts`:

- `next/navigation` - Router, pathname, search params
- `next-intl` - Translations and locale

### Mocking fetch

For API tests, mock fetch in individual test files:

```typescript
beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: 'mock data' }),
  })
})
```

### Mocking Modules

Use `vi.mock()` to mock entire modules:

```typescript
vi.mock('@/lib/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))
```

## Coverage

Aim for:

- **80%+ overall coverage**
- **100% coverage for critical business logic**
- **Focus on meaningful tests**, not just coverage metrics

View coverage report:

```bash
bun test:coverage
```

Coverage reports are generated in:
- Text format (console)
- JSON format (`coverage/coverage-final.json`)
- HTML format (`coverage/index.html`)

## Continuous Integration

Tests should:

1. Run automatically on every commit
2. Pass before merging PRs
3. Generate coverage reports
4. Fail the build if coverage drops below threshold

## Common Issues

### Tests failing due to missing DOM APIs

If you see errors about missing DOM APIs, ensure `jsdom` is configured in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
})
```

### Mock not working

Make sure mocks are defined before importing the tested module:

```typescript
// Good
vi.mock('@/lib/api')
import { useApi } from '@/lib/api'

// Bad - mock won't work
import { useApi } from '@/lib/api'
vi.mock('@/lib/api')
```

### Async tests timing out

Increase the timeout for specific tests:

```typescript
it('long running test', async () => {
  // test code
}, 10000) // 10 second timeout
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Vitest UI](https://vitest.dev/guide/ui.html)

## Contributing

When adding new features:

1. Write tests first (TDD approach recommended)
2. Ensure all tests pass
3. Maintain or improve code coverage
4. Follow existing test patterns and conventions
5. Document complex test scenarios

Happy testing!

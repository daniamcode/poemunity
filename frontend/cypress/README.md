# Cypress E2E Tests

## Overview

This directory contains end-to-end tests for Poemunity using Cypress.

## Why These Tests Were Added

These E2E tests were created to prevent regression of **two critical bugs** that were discovered in the "create poem" flow:

### Bug #1: Null Pointer Exception
**Problem**: When creating a poem on a fresh page load (no cache), the app crashed with:
```
Cannot read properties of undefined (reading 'push')
```

**Root Cause**: The `updateAllPoemsCacheAfterCreatePoemAction` tried to call `.push()` on a null/undefined cache array.

**Fixed In**: `src/redux/actions/poemsActions.ts` - Added null checks to all cache update functions

**Tested By**:
- `cypress/e2e/create-poem.cy.ts` → "Bug Fix: Create poem when cache is not loaded" tests

### Bug #2: My Poems Tab Not Updating
**Problem**: After creating a poem, the success toast appeared but the "My Poems" tab didn't show the new poem.

**Root Cause**: The create poem success callback only updated `allPoemsQuery` cache, not `myPoemsQuery` or `poemsListQuery`.

**Fixed In**:
- `src/redux/actions/poemsActions.ts` - Added `updateMyPoemsCacheAfterCreatePoemAction` and `updatePoemsListCacheAfterCreatePoemAction`
- `src/components/Profile/hooks/useProfileForm.ts` - Now calls all three cache update actions

**Tested By**:
- `cypress/e2e/create-poem.cy.ts` → "Bug Fix: Create poem and verify My Poems tab updates" tests

## Test Coverage

### Unit Tests (Jest)
Added comprehensive unit tests for cache update actions:
- `src/redux/actions/poemsActions.test.ts`
  - Tests for `updateAllPoemsCacheAfterCreatePoemAction`
  - Tests for `updateMyPoemsCacheAfterCreatePoemAction`
  - Tests for `updatePoemsListCacheAfterCreatePoemAction`
  - All include null/undefined cache handling tests

**Total**: 50 passing unit tests

### E2E Tests (Cypress)
- `cypress/e2e/create-poem.cy.ts`
  - Create poem and verify My Poems tab updates
  - Create multiple poems sequentially
  - Create poem on fresh page load (no cache)
  - Create poem with empty localStorage
  - Verify dashboard list updates
  - Form validation tests
  - Console error checking

**Total**: 10 E2E tests

## Prerequisites

Before running E2E tests, you need:

1. **Frontend running** on `http://localhost:3000`
   ```bash
   cd frontend
   pnpm dev
   ```

2. **Test user**: The tests use the test user with credentials:
   - Username: `test`
   - Password: `1234`

   The test user is created automatically in the in-memory database when you run the tests

**Note**: The backend is automatically managed by Cypress:
- ✅ When you run Cypress, it automatically starts the backend in TEST mode **on port 4201**
- ✅ **Your dev backend on port 4200 is unaffected** - you can run both simultaneously!
- ✅ When you close Cypress, it automatically stops the test backend
- ✅ The backend uses an **in-memory MongoDB database** (no database pollution!)

## Running Tests

### Interactive Mode (Recommended for Development)
Open Cypress Test Runner to run tests interactively:

```bash
pnpm cypress
```

Then click on `create-poem.cy.ts` to run the tests in the browser.

### Headless Mode (CI/CD)
Run all Cypress tests in headless mode:

```bash
pnpm cypress:run
```

### Run All Tests (Unit + E2E)
Run Jest unit tests followed by Cypress E2E tests:

```bash
pnpm test:all
```

**Note**: The tests include strategic waits and scroll operations to handle:
- Async operations (API calls, cache updates)
- Toast notifications that may overlap elements
- Elements that need to be scrolled into view
- Tab navigation and content loading

## Test Structure

```
cypress/
├── e2e/
│   └── create-poem.cy.ts       # Create poem flow tests
├── fixtures/                    # Test data (if needed)
├── support/
│   └── e2e.ts                  # Custom commands and setup
└── README.md                    # This file
```

## Custom Commands

Defined in `cypress/support/e2e.ts`:

### `cy.login(username?, password?)`
Logs in a user. Defaults to `test` / `1234`.

**How it works:**
- Visits `/login` page
- Fills username and password fields using name selectors
- Clicks the "Login" button
- Waits for redirect to `/profile`
- Verifies `loggedUser` is stored in localStorage

```typescript
cy.login() // Uses default credentials (test/1234)
cy.login('customuser', 'custompass')
```

### `cy.createTestUser()`
Creates a test user via API (if needed for setup).

```typescript
cy.createTestUser()
```

## Writing New Tests

### Example Test

```typescript
describe('My Feature', () => {
    beforeEach(() => {
        cy.clearCookies()
        cy.clearLocalStorage()
        cy.login()
    })

    it('should do something', () => {
        cy.visit('/some-page')
        cy.findByRole('button', { name: /click me/i }).click()
        cy.contains('Success!').should('be.visible')
    })
})
```

### Best Practices

1. **Selector strategy**: Since this app's forms don't use proper accessible labels, use name/id selectors:
   - Login: `cy.get('input[name="Username"]')`, `cy.get('input[name="Password"]')`
   - Poem form: `cy.get('input[name="title"]')`, `cy.get('select[name="category"]')`, `cy.get('textarea[name="poem"]')`
   - Buttons: `cy.get('button').contains('Text')`
   - Tabs: `cy.contains('Tab Name')`
2. **Clean state**: Always clear cookies/localStorage in `beforeEach()`
3. **Scroll into view**: Use `.scrollIntoView()` before interacting with elements
4. **Clear fields**: Use `.clear()` before typing to ensure clean input
5. **Strategic waits**:
   - `cy.wait(1000)` after page loads/visits for React hydration
   - `cy.wait(2000)` after form submission for API + cache updates + toast dismissal
   - `{ timeout: 15000 }` for API operations that show toasts
6. **Element visibility**: Use `.should('exist').scrollIntoView().should('be.visible')` for assertions
7. **Console error checks**: Verify no errors in console after critical operations
8. **Authentication verification**: After login, verify localStorage contains `loggedUser` token

## Debugging Tests

### Watch tests run in browser
```bash
pnpm e2e:open
```

Click on a test file to run it with the browser visible.

### Screenshots and Videos
Failed tests automatically capture:
- **Screenshots**: `cypress/screenshots/`
- **Videos**: Disabled by default (see `cypress.config.ts`)

### Enable video recording
Edit `cypress.config.ts`:
```typescript
export default defineConfig({
    e2e: {
        video: true  // Change to true
    }
})
```

## CI/CD Integration

### GitHub Actions Example
```yaml
- name: Run E2E Tests
  run: |
    pnpm dev &
    cd ../backend && pnpm dev &
    sleep 10
    pnpm e2e
```

## Troubleshooting

### Tests fail with "Cannot find user"
The tests use credentials:
- Username: `test`
- Password: `1234`

The test user is automatically created in the **in-memory database** when the backend starts in test mode. If tests fail:

1. Check that the backend started successfully (look for "✅ Connected to in-memory MongoDB" in logs)
2. The first test run creates the test user - subsequent tests reuse it
3. Each test run starts with a fresh in-memory database

**Note**: The in-memory database is destroyed when Cypress closes, so no cleanup needed!

### Tests timeout
- Check backend is running on port 4200
- Check frontend is running on port 3000
- Increase timeout in test: `cy.get('...', { timeout: 20000 })`

### "baseUrl" error
Ensure `cypress.config.ts` has correct URL:
```typescript
baseUrl: 'http://localhost:3000'
```

## Future Test Ideas

- [ ] Edit poem flow
- [ ] Delete poem flow
- [ ] Like/unlike poem
- [ ] Filter poems by genre
- [ ] Pagination tests
- [ ] Search functionality
- [ ] User registration flow
- [ ] Logout flow

## Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Testing Library](https://testing-library.com/docs/cypress-testing-library/intro/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)

# Frontend Code Cleanup Plan

This document outlines potential code cleanups and improvements for the Poemunity frontend codebase.

## Current State Analysis

-   **TypeScript Migration**: 🔄 **IN PROGRESS** - Type checking passes, but files remain to migrate (December 2025)
    -   ✅ All TypeScript errors resolved
    -   ✅ Type system fully working
    -   ⚠️ 4 component files still in .jsx format
    -   ⚠️ 4 utility files still in .js format
    -   ⚠️ 12 test files still in .test.js format
-   **ESLint**: ✅ **PASSING** - All linting errors fixed (December 2025)
-   **Build System**: Custom esbuild (migrated from Create React App)
-   **State Management**: Redux with Redux Toolkit
-   **React Version**: 17.0.2
-   **UI Library**: Material-UI v4 (deprecated)
-   **Test Coverage**: Partial
-   **TypeScript Version**: 5.5.4 (compatible with typescript-eslint)

---

## 1. TypeScript Migration & Type Safety 🔄 **IN PROGRESS**

### Issues Resolved (December 2025)

#### 1.1 Type System & Checking ✅

-   [x] All TypeScript type errors resolved
-   [x] `pnpm typecheck` passes with zero errors
-   [x] All Redux action files now have proper types
-   [x] Proper type annotations throughout existing TypeScript files

#### 1.2 Remaining JavaScript Files ⚠️

**Components to migrate (.jsx → .tsx):**

-   [ ] `src/components/MyPoems/MyPoems.jsx`
-   [ ] `src/components/Register/Register.jsx`
-   [ ] `src/components/Profile/Profile.jsx`
-   [ ] `src/components/MyFavouritePoems/MyFavouritePoems.jsx`

**Utilities to migrate (.js → .ts):**

-   [ ] `src/utils/parseJWT.js`
-   [ ] `src/utils/notifications.js`
-   [ ] `src/utils/sortPoems.js`
-   [ ] `src/redux/actions/axiosInstance.js`

**Test files to consider migrating (.test.js → .test.ts/.test.tsx):**

-   [ ] `src/utils/urlUtils.test.js`
-   [ ] `src/components/Components.test.js`
-   [ ] `src/components/ListItem/ListItem.test.js`
-   [ ] 9 snapshot test files (`.snapshot.test.js`)

**Files that should remain JavaScript:**

-   ✓ `src/utils/webserver.js` - esbuild plugin (Node.js CommonJS)
-   ✓ `src/serviceWorker.js` - legacy Create React App file
-   ✓ `src/__mocks__/styleMock.js` - Jest mock configuration

#### 1.3 Implicit 'any' Types ✅

-   [x] `src/redux/actions/poemsActions.ts` - Added explicit `(poem: Poem)` type annotations
-   [x] `src/components/Profile/hooks/useProfileForm.ts` - Context properly typed
-   [x] `src/utils/urlUtils.ts` - Added `Record<string, any>` and proper interfaces

#### 1.4 Missing Type Definitions ✅

-   [x] Installed `@types/lodash` for lodash/cloneDeep
-   [x] Installed `@types/react-helmet` and `@types/react-swipeable-views`
-   [x] Fixed `react-router` module resolution (changed to `react-router-dom`)

#### 1.5 Type Assertion Issues ✅

-   [x] Created `createMockPoem()` helper function for complete test fixtures
-   [x] All test files use properly typed mock objects
-   [x] Added proper HTMLElement type assertions where needed

#### 1.6 Strict Null Checks ✅

-   [x] Fixed optional chaining issues (`.item?.` syntax)
-   [x] Changed `null` to `undefined` in test states to match types
-   [x] All TypeScript strict checks passing

---

## 2. Testing & Test Coverage

### Issues Identified

#### 2.1 Missing Tests

-   [ ] `src/utils/poemUtils.ts` - Helper functions need tests (created but not verified)
-   [ ] `src/components/Profile/components/TabPanel.tsx` - No tests
-   [ ] `src/components/Profile/components/ProfileTabs.tsx` - No tests
-   [ ] Many Redux actions lack comprehensive test coverage
-   [ ] Reducer tests exist but could be more thorough

#### 2.2 Test Quality Issues

-   [ ] Tests using incomplete mock data (missing required properties)
-   [ ] Some tests rely on implementation details rather than behavior
-   [ ] Test wrapper types not properly defined in `useProfileForm.test.tsx`
-   [ ] Snapshot tests may be outdated or missing
-   [ ] **Inconsistent test selectors**: Replace `getByRole`, `getByText`, etc. with `getByTestId` for more stable tests

    -   Current: Mix of semantic queries (`getByRole('progressbar')`) and text queries (`getByText('Title')`)
    -   Target: Consistent use of `data-testid` attributes for all test selections
    -   Benefits: More stable tests, less brittle to UI text changes, explicit test hooks
    -   Files affected: All `.test.tsx`, `.test.jsx` files
    -   Example:

        ```typescript
        // Before
        expect(screen.getByRole('progressbar')).toBeInTheDocument()
        expect(screen.getByText('Submit')).toBeInTheDocument()

        // After
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
        expect(screen.getByTestId('submit-button')).toBeInTheDocument()
        ```

#### 2.3 Test Organization

-   [ ] Inconsistent test file naming (some `.test.tsx`, some `.test.ts`)
-   [ ] Test utilities could be centralized
-   [ ] Mock factories would improve test maintainability

#### 2.4 Integration Testing with Cypress

-   [ ] **Add Cypress for integration testing**
    -   Install Cypress: `pnpm add -D cypress @testing-library/cypress`
    -   Set up Cypress configuration and folder structure
    -   Configure with TypeScript support
    -   Add to CI/CD pipeline
-   [ ] **Create integration test suites**
    -   Component integration tests (multiple components working together)
    -   API integration tests (frontend + backend interactions)
    -   Navigation and routing (especially nested routes like `/detail/:id`)
    -   Form submission and validation flows
    -   State management integration (Redux + components)
    -   Authentication state and protected routes

#### 2.5 E2E Testing with Selenium

-   [ ] **Set up Selenium for E2E testing**
    -   Install Selenium WebDriver: `pnpm add -D selenium-webdriver`
    -   Configure WebDriver for multiple browsers (Chrome, Firefox, Safari)
    -   Set up test environment and configuration
    -   Add to CI/CD pipeline
-   [ ] **Create E2E test suites**
    -   User authentication flow (login, register, logout)
    -   Poem creation and editing workflow
    -   Like/unlike poem functionality
    -   Profile management
    -   Infinite scroll pagination
-   [ ] **Test critical user journeys**
    -   New user registration → create poem → view in feed
    -   User login → browse poems → like poem → view favorites
    -   Author → edit own poem → delete poem
    -   Navigation bug regression (detail route not caught by genre route)
    -   Cross-browser compatibility testing
-   [ ] **Visual regression testing** (optional)
    -   Consider Percy or Chromatic integration with Selenium
    -   Screenshot testing for critical pages
    -   Ensure UI doesn't break with changes across browsers

---

## 3. Dependencies & Security

### Current Status (December 2025)

**Total Dependencies**: 857 **Security Vulnerabilities**: ✅ **0 vulnerabilities** (fixed December 26, 2025)
**Deprecated Packages**: Material-UI v4, ESLint 8.57.1

### Issues Identified

#### 3.1 Security Vulnerabilities ✅ **ALL FIXED**

-   [x] **esbuild** (moderate) ✅ **FIXED December 26, 2025**

    -   Upgraded from 0.21.5 to 0.27.2
    -   Issue: Dev server allows any website to send requests and read responses
    -   Impact: Development only (not production)
    -   Status: Resolved by upgrading to latest version

-   [x] **@babel/runtime** (moderate) ✅ **FIXED December 26, 2025**
    -   Fixed using pnpm overrides to force >=7.26.10
    -   Issue: Inefficient RegExp complexity with named capturing groups
    -   Impact: Performance in transpiled code
    -   Paths affected: react-swipeable-views (transitive dependency)
    -   Status: Resolved using package.json pnpm.overrides

#### 3.2 Major Version Updates Needed

-   [ ] **Material-UI v4** → Migrate to MUI v5
    -   Breaking changes in API
    -   Component naming changes
    -   Styling system overhaul (makeStyles deprecated)
    -   Affects: All components using Material-UI
    -   Security: v4 is deprecated and no longer receives updates

#### 3.3 Minor Updates

-   [ ] **ESLint 8.57.1** → Update to ESLint 9.x (already using flat config)
    -   Note: Currently deprecated but still functional
-   [ ] **React 17** → Consider React 18 migration
    -   Benefits: Automatic batching, concurrent features
    -   Requires: Testing for breaking changes
    -   Affects: Entire application

#### 3.4 Peer Dependency Warnings ✅ **RESOLVED**

-   [x] `@types/react-dom@18.3.7` expects `@types/react@^18.0.0` ✅ **FIXED December 2025**
    -   Downgraded from `@types/react-dom@18.3.7` to `@types/react-dom@17.0.26`
    -   Now properly aligned with React 17
-   [x] `react-event-listener` expects `react@^16.3.0` ✅ **ACCEPTABLE**
    -   React 17 is backward compatible with React 16
    -   This is a transitive dependency from `react-swipeable-views`
    -   Warning can be safely ignored
    -   Will be resolved when migrating to React 18 or updating to MUI v5

---

## 4. Code Quality & Patterns

### Issues Identified

#### 4.1 Anti-Patterns

-   [ ] **Context overuse**: `AppContext` holds too much state, consider splitting
-   [ ] **Prop drilling**: Components passing through many props (fixed in Profile, but may exist elsewhere)
-   [ ] **Magic strings**: Action types could use constants
-   [ ] **setState usage**: `context.setState({ ...context, elementToEdit: '' })` spreads entire context

#### 4.2 Complex Components

-   [ ] `src/components/Dashboard/Dashboard.jsx` - May need breakdown (check file size)
-   [ ] `src/components/Detail/Detail.tsx` - Complex detail view
-   [ ] Redux actions with complex nested logic

#### 4.3 Duplicated Code

-   [ ] Poem data transformation logic appears in multiple places
-   [ ] Date formatting repeated (now in poemUtils, but usage needs verification)
-   [ ] Similar pagination logic might be extractable

#### 4.4 Performance Concerns

-   [ ] `JSON.stringify()` in useEffect dependencies (multiple files)
    -   `src/components/Profile/hooks/useProfileForm.ts` (removed in recent refactor)
    -   `src/components/Ranking/Ranking.tsx` (still present)
    -   Other files may have this pattern
-   [ ] Missing React.memo for expensive components
-   [ ] List components may benefit from virtualization (react-window or react-virtuoso)
-   [ ] **Investigate multiple API calls on navigation**
    -   Check why the same endpoint is called multiple times during route changes
    -   **Root cause**: Frontend is fetching all data then filtering client-side (by category, genre, etc.)
    -   **Proposed solution**: Move filtering logic to backend
        -   Create dedicated endpoints for filtered data (e.g., `/api/poems/category/:category`)
        -   Use query parameters for filtering (e.g., `/api/poems?category=love&genre=classic`)
        -   Reduce data transfer and improve performance
        -   Prevent unnecessary re-fetches
    -   **Impact**: Significant performance improvement, especially on mobile/slow connections
    -   **Files to audit**: All components that fetch poems and filter client-side

---

## 5. Accessibility & UX

### Issues Identified

#### 5.1 Missing Accessibility Features

-   [ ] Images without alt text in `Ranking.tsx`
-   [ ] Missing ARIA labels on interactive elements
-   [ ] Keyboard navigation may not work properly everywhere
-   [ ] Focus management after modals/dialogs

#### 5.2 Form Validation

-   [ ] Client-side validation exists but may need improvement
-   [ ] Error messages could be more descriptive
-   [ ] Async validation patterns not consistent

---

## 6. Build & Bundle Optimization

### Issues Identified

#### 6.1 Bundle Size

-   [ ] Audit bundle size and identify large dependencies
-   [ ] Check if tree-shaking is working properly
-   [ ] Consider code splitting for routes
-   [ ] Lazy load heavy components

#### 6.2 Build Configuration

-   [ ] Review esbuild configuration for optimization opportunities
-   [ ] Source maps configuration for production
-   [ ] Asset optimization (images, fonts)

---

## 7. Documentation

### Issues Identified

#### 7.1 Missing Documentation

-   [ ] Component prop documentation (JSDoc or TypeScript comments)
-   [ ] Redux store shape documentation
-   [ ] API integration patterns not documented
-   [ ] Setup/installation docs could be more detailed

#### 7.2 Code Comments

-   [ ] Some complex logic lacks explanatory comments
-   [ ] TODOs and FIXMEs should be tracked
-   [ ] Magic numbers need explanation

---

## 8. Security & Best Practices

### Issues Identified

#### 8.1 Security Concerns

-   [ ] Review token storage and handling
-   [ ] XSS prevention - check dangerouslySetInnerHTML usage
-   [ ] CSRF protection in API calls
-   [ ] Input sanitization for user-generated content (poems)

#### 8.2 Environment Configuration

-   [ ] Environment variables validation
-   [ ] Separate configs for dev/staging/prod
-   [ ] Sensitive data not hardcoded

---

## 9. Styling & CSS

### Issues Identified

#### 9.1 Styling Approach & Tooling

-   [ ] **Add stylelint** for SCSS linting

    -   Currently no linter for SCSS files
    -   Would enforce consistent style rules
    -   Integrate with existing lint workflow
    -   Add to `pnpm format` and pre-commit hooks

-   [ ] **Evaluate styling strategy**: SCSS vs CSS Modules vs CSS-in-JS
    -   Current: SCSS with esbuild-sass-plugin
    -   Alternative 1: CSS Modules (better scoping, TypeScript support)
    -   Alternative 2: CSS-in-JS (emotion/styled-components) - aligns with MUI v5
    -   Consider: Migration effort, bundle size, developer experience
    -   Decision needed before major refactoring

#### 9.2 Current Styling Issues

-   [ ] Mix of SCSS and Material-UI styles (makeStyles)
-   [ ] CSS class naming inconsistency (BEM in some places, not in others)
-   [ ] Global styles vs component styles organization
-   [ ] No style linting or formatting
-   [ ] **Audit z-index usage across SCSS files**
    -   Search for all `z-index` properties in `.scss` files
    -   Determine if z-index values are necessary
    -   Create a z-index scale/system if needed (e.g., modal: 1000, dropdown: 100, etc.)
    -   Remove unnecessary z-index declarations
    -   Document z-index usage and rationale

#### 9.3 Responsive Design

-   [ ] **Comprehensive responsiveness audit across all devices**
    -   Test on mobile devices (320px - 480px width)
    -   Test on tablets (481px - 768px width)
    -   Test on desktop (769px+ width)
    -   Test all components and pages on each device size
    -   Verify layout doesn't break at common breakpoints
    -   Check horizontal scrolling issues
    -   Test portrait and landscape orientations
-   [ ] Audit mobile responsiveness (specific issues)
-   [ ] Touch target sizes for mobile (minimum 44x44px)
-   [ ] Tablet breakpoint handling
-   [ ] Test with real devices, not just browser dev tools

---

## 10. File Organization & Structure

### Issues Identified

#### 10.1 Directory Structure

-   [ ] Consider feature-based organization vs current type-based
-   [ ] Shared/common components directory structure
-   [ ] Constants organization (currently scattered)

#### 10.2 Naming Conventions

-   [ ] Inconsistent file naming (some PascalCase, some camelCase)
-   [ ] Test file placement (co-located vs separate test directory)

---

## 11. Code Comments & Documentation Quality

### Issues Identified

#### 11.1 TODO Comments Audit

-   [ ] Search for all `// todo:` and `// TODO:` comments in codebase
-   [ ] Categorize TODOs by priority (critical, nice-to-have, wishlist)
-   [ ] Create GitHub issues for actionable TODOs
-   [ ] Remove or update stale TODOs that are no longer relevant
-   [ ] Examples found:
    -   `src/components/ListItem/ListItem.tsx`: Cache optimization TODO
    -   `src/redux/actions/poemsActions.ts`: Multiple refactoring TODOs
    -   `src/components/Profile/Profile.jsx`: Test refactoring TODO

#### 11.2 Manually Disabled ESLint Warnings

-   [ ] Review all `eslint-disable` comments to see if they can be removed
-   [ ] Check if code can be refactored instead of disabling rules
-   [ ] Document why certain rules must be disabled
-   [ ] Files with disabled rules:
    -   `src/index.tsx`: `no-console`, `no-undef`, `react/no-deprecated`
    -   `src/redux/reducers/rootReducer.ts`: `no-unused-vars` for destructured ACTIONS
    -   `src/serviceWorker.js`: `no-undef` for Node.js globals
    -   `src/utils/webserver.js`: Multiple rules for Node.js/CommonJS code
    -   `src/data/normalizeSwaps.ts`: `max-lines` (517 lines of data)
    -   `src/components/Ranking/Ranking.tsx`: Removed `react-hooks/exhaustive-deps` comments
    -   `src/components/List/List.tsx`: Removed `react-hooks/exhaustive-deps` comments

#### 11.3 Comment Quality & Clarity

-   [ ] Remove redundant comments that just restate the code
-   [ ] Add comments where complex logic needs explanation
-   [ ] Update outdated comments that no longer match the code
-   [ ] Use JSDoc format for function documentation
-   [ ] Remove commented-out code (use git history instead)
-   [ ] Examples to review:
    -   `src/components/ListItem/ListItem.tsx`: Long multi-line comment about cache updates
    -   `src/App.tsx`: Commented out export statement
    -   Various files with commented imports

#### 11.4 Magic Numbers & Constants

-   [ ] Extract magic numbers to named constants
-   [ ] Document why certain values are used
-   [ ] Examples:
    -   `PAGINATION_LIMIT = 10` in `List.tsx` (good example)
    -   `POEM_POINTS`, `LIKE_POINTS` in `Ranking.tsx` (good example)
    -   Port numbers in webserver (8942) - add comment explaining choice

---

## 12. ESLint Configuration Improvements

### Issues Identified

#### 12.1 Rules to Review

-   [ ] Consider enabling stricter rules now that codebase is cleaner
-   [ ] Review `@typescript-eslint/no-explicit-any`: Currently disabled, could be enabled gradually
-   [ ] Consider adding `eslint-plugin-jsx-a11y` for accessibility linting
-   [ ] Review deprecated React patterns (ReactDOM.render) - disabled but should migrate to React 18

#### 12.2 Configuration Improvements

-   [x] React version detection configured (`version: 'detect'`)
-   [x] TypeScript version compatible with typescript-eslint (5.5.4)
-   [ ] Consider organizing rules into categories (security, performance, style)
-   [ ] Document why certain rules are configured the way they are

---

## Cleanup Implementation Plan

### Phase 0: Preparation & Safety (Week 1-2)

**Goal**: Establish safety nets before making changes

1. **Add Missing Tests** ⚠️ **CRITICAL - DO THIS FIRST**

    - [ ] Audit current test coverage
    - [ ] Create test factories for common mock data (Poem, User, etc.)
    - [ ] Write tests for all untested components
    - [ ] Write tests for all untested utilities
    - [ ] Write integration tests for critical user flows
    - [ ] Achieve minimum 80% code coverage before proceeding
    - **Why**: Tests prevent regressions during refactoring

2. **Document Current Behavior**

    - [ ] Document current API contracts
    - [ ] Document current component props
    - [ ] Screenshot current UI for visual regression testing
    - [ ] Document known bugs/issues

3. **Set Up Tooling**
    - [ ] Configure visual regression testing (Percy, Chromatic, or similar)
    - [ ] Set up bundle size monitoring
    - [ ] Configure CI/CD quality gates
    - [ ] Set up error tracking (Sentry or similar)

---

### Phase 1: TypeScript Migration 🔄 **PARTIALLY COMPLETE** (December 2025)

**Goal**: Complete TypeScript migration for type safety

**Status**:

-   ✅ All TypeScript type errors resolved
-   ✅ `pnpm typecheck` passing with zero errors
-   ⚠️ File migration incomplete (8 components/utilities + 12 tests remain in .js/.jsx)

1. **Fix Existing TypeScript Errors** ✅

    - [x] Add proper types to `poemsActions.ts` parameters
    - [x] Fix react-router module resolution (changed to `react-router-dom`)
    - [x] Install missing type definitions (@types/lodash, @types/react-helmet, @types/react-swipeable-views)
    - [x] Fix test mock data to match interfaces (created `createMockPoem()` helper)
    - [x] Downgrade TypeScript to 5.5.4 for compatibility with typescript-eslint
    - **Tests**: ✅ `pnpm typecheck` passes with zero errors

2. **Migrate Remaining JavaScript Files** ⚠️ **IN PROGRESS**

    - [ ] Migrate `MyPoems.jsx` to TypeScript
    - [ ] Migrate `Register.jsx` to TypeScript
    - [ ] Migrate `Profile.jsx` to TypeScript
    - [ ] Migrate `MyFavouritePoems.jsx` to TypeScript
    - [ ] Migrate utility files (`parseJWT.js`, `notifications.js`, `sortPoems.js`, `axiosInstance.js`)
    - [ ] Migrate test files to `.test.ts`/`.test.tsx` (optional but recommended)
    - **Tests**: All tests should continue passing after migration

3. **Improve Type Safety** ✅

    - [x] Replaced `any` types with proper interfaces (`RankItem`, `RankAccumulator`, etc.)
    - [x] Fixed optional chaining and null checks
    - [x] Created shared type definitions
    - [x] All ESLint TypeScript rules passing
    - **Tests**: ✅ Type-check passes without errors

4. **ESLint Configuration** ✅
    - [x] Fixed all 61 ESLint errors
    - [x] Configured React version detection
    - [x] Removed/fixed all linting issues
    - **Tests**: ✅ `pnpm lint` passes with zero errors

---

### Phase 2: Testing Improvements (Week 5-6)

**Goal**: Achieve comprehensive test coverage

**Pre-requisite**: ✅ TypeScript migration complete

1. **Test Infrastructure**

    - [ ] Create test utilities and factories
    - [ ] Set up MSW for API mocking
    - [ ] Configure test coverage reporting
    - **Tests**: Baseline coverage established

2. **Write Missing Tests**

    - [ ] Add tests for all components (target 90% coverage)
    - [ ] Add tests for all Redux actions/reducers
    - [ ] Add tests for utilities
    - [ ] Add integration tests
    - **Tests**: Coverage > 80%

3. **Improve Existing Tests**

    - [ ] Refactor tests to use test factories
    - [ ] Replace implementation-focused tests with behavior tests
    - [ ] Add edge case coverage
    - [ ] **Standardize test selectors**: Replace all `getByRole`, `getByText`, etc. with `getByTestId`
        - Add `data-testid` attributes to all components
        - Update all test files to use `getByTestId` consistently
        - Benefits: More stable tests, less brittle to text/role changes
    - **Tests**: All tests pass and are maintainable

4. **Integration Testing with Cypress**

    - [ ] Install and configure Cypress
    - [ ] Set up TypeScript support for Cypress
    - [ ] Create integration test suites for component interactions
    - [ ] Add navigation/routing tests (prevent route ordering bugs)
    - [ ] Test API integration (frontend + backend)
    - [ ] Test authentication flows and protected routes
    - [ ] Integrate Cypress into CI/CD pipeline
    - **Tests**: Component and API integrations covered

5. **E2E Testing with Selenium**
    - [ ] Install and configure Selenium WebDriver
    - [ ] Set up multi-browser testing (Chrome, Firefox, Safari)
    - [ ] Create E2E test suites for critical user journeys
    - [ ] Test complete user flows from start to finish
    - [ ] Add cross-browser compatibility tests
    - [ ] Integrate Selenium into CI/CD pipeline
    - [ ] Consider visual regression testing (Percy/Chromatic)
    - **Tests**: Critical user flows covered across browsers

---

### Phase 3: Security Fixes & Dependency Updates (Week 7-8)

**Goal**: Fix security vulnerabilities and update deprecated dependencies

**Pre-requisite**: ✅ Test coverage > 80%

**Current State**: ✅ **0 vulnerabilities** (fixed December 26, 2025)

1. **Security Vulnerability Fixes** ✅ **COMPLETED December 26, 2025**

    - [x] **Upgrade esbuild** from 0.21.5 to >=0.25.0 ✅ **DONE**

        - Upgraded to esbuild@0.27.2
        - Impact: Fixes moderate security issue in dev server
        - Compatibility verified with: esbuild-sass-plugin, ts-jest
        - **Tests**: ✅ All tests pass, builds succeed

    - [x] **Update @babel/runtime** to >=7.26.10 ✅ **DONE**

        - Fixed using pnpm overrides in package.json
        - Added `"pnpm": { "overrides": { "@babel/runtime": ">=7.26.10" } }`
        - Transitive dependency via react-swipeable-views now uses safe version
        - **Tests**: ✅ No build errors, transpilation works correctly

    - [x] **Run audit after fixes**: `pnpm audit` ✅ **0 vulnerabilities**
    - **Tests**: ✅ All tests pass, ESLint passes, TypeScript compiles

2. **Material-UI v4 → MUI v5 Migration**

    - [ ] Audit all Material-UI usage in codebase
    - [ ] Read MUI v5 migration guide
    - [ ] Install @mui/material and codemod tools
    - [ ] Run codemods for automatic migration:
        ```bash
        npx @mui/codemod v5.0.0/preset-safe src
        ```
    - [ ] Update makeStyles to styled-components or sx prop
    - [ ] Update component imports (@material-ui → @mui)
    - [ ] Fix breaking changes component-by-component
    - [ ] Remove old @material-ui packages
    - **Tests**: All component tests pass, visual regression tests pass

3. **React 17 → React 18 (Optional but Recommended)**

    - [ ] Update React and ReactDOM to v18
    - [ ] Update @types/react and @types/react-dom to v18
    - [ ] Replace ReactDOM.render with createRoot:

        ```typescript
        // Before (React 17)
        ReactDOM.render(<App />, root)

        // After (React 18)
        import { createRoot } from 'react-dom/client'
        createRoot(root!).render(<App />)
        ```

    - [ ] Test for breaking changes (mainly in testing library)
    - [ ] Enable React 18 features gradually (Suspense, transitions)
    - [ ] Remove eslint-disable comments for ReactDOM.render
    - **Tests**: All tests pass, no console errors, no deprecation warnings

4. **Minor Updates & Maintenance**

    - [ ] Update ESLint to latest (currently deprecated 8.57.1)
    - [ ] Update TypeScript to latest compatible with typescript-eslint
    - [ ] Update testing libraries (@testing-library/react, jest, etc.)
    - [ ] Update other dependencies (run `pnpm outdated`)
    - [ ] Fix any breaking changes
    - **Tests**: All tests pass

5. **Verify & Document**
    - [ ] Run full test suite
    - [ ] Check bundle size hasn't increased significantly
    - [ ] Run `pnpm audit` to confirm 0 vulnerabilities
    - [ ] Update CLEANUP.md with results
    - **Success criteria**: Zero vulnerabilities, all tests passing

---

### Phase 4: Code Quality Refactoring (Week 9-11)

**Goal**: Improve code maintainability and performance

**Pre-requisite**: ✅ All dependencies updated, tests passing

1. **Context Refactoring**

    - [ ] Split AppContext into smaller contexts
    - [ ] Move state closer to where it's used
    - [ ] Consider Zustand or Jotai for simpler state
    - **Tests**: Context consumers still work correctly

2. **Component Refactoring**

    - [ ] Break down large components (Dashboard, Detail)
    - [ ] Extract custom hooks
    - [ ] Implement React.memo where appropriate
    - **Tests**: Component tests pass, performance improved

3. **Performance Optimization**

    - [ ] Replace JSON.stringify in useEffect dependencies
    - [ ] Add virtualization for long lists
    - [ ] Implement code splitting
    - [ ] Lazy load routes
    - **Tests**: Performance benchmarks improved

4. **Redux Cleanup**
    - [ ] Migrate to RTK Query if using REST APIs
    - [ ] Simplify action creators
    - [ ] Normalize state shape
    - **Tests**: Redux tests pass

---

### Phase 5: Accessibility & UX (Week 12)

**Goal**: Ensure application is accessible and user-friendly

**Pre-requisite**: ✅ Code quality improvements complete

1. **Accessibility Audit**

    - [ ] Run automated accessibility tests (axe, pa11y)
    - [ ] Add missing ARIA labels
    - [ ] Fix keyboard navigation
    - [ ] Add alt text to images
    - **Tests**: Accessibility tests pass

2. **Form Improvements**
    - [ ] Better validation messages
    - [ ] Error state handling
    - [ ] Loading states
    - **Tests**: Form tests cover all states

---

### Phase 6: Documentation & Polish (Week 13)

**Goal**: Make codebase maintainable for future developers

**Pre-requisite**: ✅ All cleanup phases complete

1. **Code Documentation**

    - [ ] Add JSDoc comments to public APIs
    - [ ] Document complex algorithms
    - [ ] Add README files to major directories
    - **Tests**: Documentation builds successfully

2. **Developer Experience**
    - [ ] Update setup instructions
    - [ ] Create troubleshooting guide
    - [ ] Document common patterns
    - **Tests**: New developer can set up project

---

### Phase 7: Code Comments & TODO Cleanup (Week 14)

**Goal**: Improve code documentation quality and address technical debt markers

**Pre-requisite**: ✅ Documentation phase complete

1. **TODO Comments Audit**

    - [ ] Run search for all `// todo:`, `// TODO:`, `// FIXME:` comments
    - [ ] Create spreadsheet/document categorizing all TODOs:
        - Critical (blocks features or causes bugs)
        - Important (technical debt that should be addressed)
        - Nice-to-have (improvements but not urgent)
        - Obsolete (no longer relevant)
    - [ ] Create GitHub issues for critical and important TODOs
    - [ ] Remove obsolete TODOs
    - [ ] Update TODO comments with issue numbers for tracking
    - **Example**: `// TODO(#123): Refactor this function` instead of `// todo: refactor`
    - **Tests**: No orphaned TODOs remain

2. **ESLint Disable Comments Review**

    - [ ] List all `eslint-disable` comments and their locations
    - [ ] For each disabled rule, ask:
        - Can the code be refactored to follow the rule?
        - Is there a better rule configuration?
        - Is the disable truly necessary?
    - [ ] Priority fixes:
        - `no-undef` in `App.tsx`: Use environment variable typing
        - `react/no-deprecated` in `index.tsx`: Migrate to React 18 createRoot
        - `no-unused-vars` in `rootReducer.ts`: Consider alternative destructuring pattern
        - Remove `react-hooks/exhaustive-deps` if dependency arrays are correct
    - [ ] Document remaining disabled rules in code comments
    - **Tests**: ESLint warnings reduced by 50%

3. **Comment Quality Improvement**

    - [ ] Remove comments that just restate the code:
        - Bad: `// Set loading to true`
        - Good: `// Prevent duplicate API calls during pagination`
    - [ ] Add JSDoc comments to all exported functions
    - [ ] Remove commented-out code (verify in git history first)
    - [ ] Update outdated comments that no longer match the code
    - [ ] Add inline comments for complex algorithms
    - **Tests**: Code review confirms comment quality

4. **Magic Numbers & Constants Extraction**

    - [ ] Search for hardcoded numbers and strings
    - [ ] Extract to named constants with documentation:

        ```typescript
        // Default number of poems to fetch per page
        const PAGINATION_LIMIT = 10

        // Live reload server port - must not conflict with dev server (3000)
        const LIVE_RELOAD_PORT = 8942
        ```

    - [ ] Group related constants in dedicated files
    - [ ] Add comments explaining why values were chosen
    - **Tests**: No unexplained magic numbers remain

---

## Success Criteria

-   [x] Zero TypeScript errors (`pnpm typecheck` passes) ✅ **ACHIEVED December 2025**
-   [x] No ESLint errors or warnings ✅ **ACHIEVED December 2025**
-   [x] Peer dependency warnings resolved ✅ **ACHIEVED December 2025**
-   [ ] Zero security vulnerabilities ⚠️ **2 moderate vulnerabilities remaining**
    -   esbuild needs upgrade to >=0.25.0
    -   @babel/runtime needs upgrade to >=7.26.10
-   [ ] All files migrated to TypeScript ⚠️ **8 files + 12 tests remaining**
-   [ ] Test coverage > 80%
-   [ ] All tests passing (current tests passing, need more tests)
-   [ ] Bundle size not increased (or optimized)
-   [ ] No accessibility violations (automated tools)
-   [ ] All deprecated dependencies updated (Material-UI v4, ESLint 8, React 17)
-   [ ] Documentation complete
-   [ ] All TODO comments categorized and tracked
-   [ ] ESLint disable comments reviewed and minimized

---

## Risk Mitigation

1. **Always write tests before refactoring**

    - Tests are your safety net
    - If a test doesn't exist, create it first
    - Never refactor without tests

2. **Small, incremental changes**

    - Make small PRs
    - One logical change per commit
    - Easy to review and revert if needed

3. **Feature flags for large changes**

    - Use feature flags for risky migrations
    - Allow gradual rollout
    - Easy rollback if issues found

4. **Monitoring & Observability**
    - Set up error tracking before changes
    - Monitor performance metrics
    - Track user impact

---

## Priority Matrix

### ✅ Completed (December 2025)

-   ✅ Fix all TypeScript type checking errors
-   ✅ Fix all ESLint errors
-   ✅ Configure TypeScript & ESLint tooling
-   ✅ Get `pnpm typecheck` and `pnpm lint` passing
-   ✅ **Fix security vulnerabilities** (December 26, 2025)
    -   ✅ Upgraded esbuild 0.21.5 → 0.27.2
    -   ✅ Updated @babel/runtime to >=7.26.10 via pnpm overrides
    -   ✅ Verified with `pnpm audit` - 0 vulnerabilities

### High Priority (Do Next)

-   **Complete TypeScript file migration** (8 components/utilities + 12 test files)
    -   Priority: MyPoems.jsx, Register.jsx, Profile.jsx, MyFavouritePoems.jsx
    -   Then: parseJWT.js, notifications.js, sortPoems.js, axiosInstance.js
    -   Optional: Migrate .test.js files to .test.ts/.test.tsx
-   Add missing tests (achieve 80% coverage)
-   Update Material-UI v4 → MUI v5
-   Code comments & TODO cleanup
-   Review and minimize ESLint disable comments

### Medium Priority (Do After High Priority)

-   Performance optimizations
-   Accessibility improvements
-   Context refactoring
-   Component breakdown
-   React 18 migration (enables better performance features)

### Low Priority (Nice to Have)

-   File organization
-   Documentation improvements
-   Advanced optimizations
-   Bundle size optimization

---

## Notes

-   **NEVER skip writing tests before refactoring**
-   Each phase should leave the codebase in a deployable state
-   Continuously deploy to staging and test
-   Get stakeholder buy-in for large migrations
-   Budget time for unexpected issues (add 20% buffer)
-   Celebrate small wins with the team

---

## 13. Pagination Implementation & API Optimization

### Recent Changes (December 26, 2025)

#### 13.1 Pagination Constants ✅ **COMPLETED**

**What Changed:**

-   [x] Created `PAGINATION_LIMIT = 10` constant in `/frontend/src/data/constants.ts`
-   [x] Updated all paginated components to use this shared constant:
    -   `List.tsx` (main feed, infinite scroll)
    -   `MyPoems.jsx` (user's own poems, infinite scroll)
    -   `MyFavouritePoems.jsx` (user's liked poems, infinite scroll)

**Why:**

-   Centralizes pagination configuration
-   Easy to adjust limit across all components from one place
-   Prevents inconsistencies between components

**Tests:**

-   ✅ All components import and use `PAGINATION_LIMIT` correctly
-   ✅ No hardcoded `const PAGINATION_LIMIT = 10` remains in component files

---

#### 13.2 Backend API Enhancements ✅ **COMPLETED**

**What Changed:**

-   [x] Enhanced `GET /api/poems` endpoint with new filters:
    -   `?userId=xxx` - Filter poems by author (for MyPoems component)
    -   `?likedBy=xxx` - Filter poems liked by user (for MyFavouritePoems component)
    -   `?origin=xxx` - Filter by origin (existing, still works)
-   [x] Restored dual-mode API behavior:
    -   **With pagination params (`?page=x&limit=y`)**: Returns paginated response
        `{ poems, total, page, limit, totalPages, hasMore }`
    -   **Without pagination params**: Returns simple array `[poem1, poem2, ...]` (for ranking calculation)

**Backend Code** (`backend/src/controllers/poems.js`):

```javascript
// Check if pagination is requested
const isPaginationRequested = req.query.page !== undefined || req.query.limit !== undefined

if (isPaginationRequested) {
    // ... paginated response
} else {
    // No pagination - return all poems (used for ranking)
    // TODO: In the future, move ranking calculation to backend
    const poems = await Poem.find(filter).sort({ date: -1 })
    res.json(poems)
}
```

**Why:**

-   MyPoems/MyFavouritePoems need server-side filtering for efficiency
-   Ranking needs ALL poems for accurate point calculation
-   Flexible API supports both use cases without breaking changes

**Tests:**

-   ✅ Backend tests verify both paginated and non-paginated responses
-   ✅ Tests verify `userId` and `likedBy` filters work correctly
-   ✅ Tests verify filters can be combined (e.g., `userId` + `origin`)

---

#### 13.3 Ranking Component Optimization ⚠️ **TEMPORARY SOLUTION**

**Current Implementation:**

-   [x] Ranking component fetches **ALL** user poems (no pagination params)
-   [x] Frontend calculates ranking using `getRanking()` utility
-   [x] Displays **top 10 authors** using `.slice(0, 10)`
-   [x] Accurate point calculation: `(poems × 3) + (likes × 1)`

**Component Code** (`frontend/src/components/Ranking/Ranking.tsx`):

```typescript
useEffect(() => {
  // Fetch all user poems for ranking calculation (no pagination params)
  // TODO: In the future, move ranking calculation to backend to avoid fetching all poems
  dispatch(
    getRankingAction({
      params: {
        origin: 'user'
        // No page/limit - fetches all poems for accurate ranking
      }
    })
  )
}, [dispatch])

// Display only top 10
{rank.slice(0, 10).map((item, index) => (
  <TableRow key={index}>...</TableRow>
))}
```

**Why This Approach:**

-   ✅ **Accurate**: Calculates ranking from ALL poems, not just a sample
-   ✅ **Simple**: Reuses existing frontend calculation logic
-   ⚠️ **Performance**: Fetches all poems (could be hundreds/thousands)

**Future Optimization (TODO):**

```javascript
// TODO: backend/src/controllers/poems.js
// Add new endpoint: GET /api/poems/ranking
// Calculate ranking on backend:
//   1. Aggregate poems by userId
//   2. Calculate points per user
//   3. Sort by points descending
//   4. Return top 10 users only
// Benefits:
//   - Reduces frontend data transfer
//   - Faster ranking calculation (database aggregation)
//   - Scales better with large datasets
```

**Tests:**

-   ✅ Frontend tests verify top 10 slice works
-   ✅ Tests verify ranking with large datasets (100+ poems)
-   ✅ Backend tests verify non-paginated response returns full array

---

#### 13.4 Component Pagination Implementation ✅ **COMPLETED**

**MyPoems Component:**

-   [x] Uses `getMyPoemsAction({ params: { userId, page, limit } })`
-   [x] Infinite scroll with `useInfiniteScroll` hook
-   [x] Fetches user's own poems only (server-side filter)
-   [x] Refreshes on delete

**MyFavouritePoems Component:**

-   [x] Uses `getMyFavouritePoemsAction({ params: { likedBy, page, limit } })`
-   [x] Infinite scroll with `useInfiniteScroll` hook
-   [x] Fetches poems user has liked (server-side filter)
-   [x] Refreshes on like/unlike (removes from list when unliked)

**List Component:**

-   [x] Already had pagination (no changes needed)
-   [x] Now uses `PAGINATION_LIMIT` constant

**Tests:**

-   ✅ Component tests verify loading states
-   ✅ Component tests verify infinite scroll behavior
-   ✅ Component tests verify correct actions dispatched

---

#### 13.5 Redux State Management ✅ **COMPLETED**

**New Actions:**

-   [x] `getMyPoemsAction` - Fetches user's poems with pagination
-   [x] `getMyFavouritePoemsAction` - Fetches liked poems with pagination

**New Reducers:**

-   [x] `myPoemsQuery` - Handles pagination for user's poems
-   [x] `myFavouritePoemsQuery` - Handles pagination for liked poems

**Updated Reducer:**

-   [x] `rankingQuery` - Reverted to handle plain array (non-paginated)

**Reducer Logic:**

```typescript
// Paginated reducers (myPoemsQuery, myFavouritePoemsQuery)
const { poems, page, hasMore, total } = action.payload
const isFirstPage = page === 1
const newPoems = isFirstPage ? poems : [...(state.item || []), ...poems]
// Appends on page 2+, replaces on page 1

// Non-paginated reducer (rankingQuery)
// Receives plain array: [poem1, poem2, ...]
// Uses commonReducer for simple state management
```

**Tests:**

-   ✅ Reducer tests verify pagination append/replace logic
-   ✅ Reducer tests verify reset behavior
-   ✅ Action tests verify correct API calls
-   ✅ 24 new unit tests added total

---

### Implementation Summary

| Component            | Method                 | Page Size | Filter  | Total Tests |
| -------------------- | ---------------------- | --------- | ------- | ----------- |
| **List**             | Infinite scroll        | 10        | origin  | Existing    |
| **MyPoems**          | Infinite scroll        | 10        | userId  | 3 new       |
| **MyFavouritePoems** | Infinite scroll        | 10        | likedBy | 3 new       |
| **Ranking**          | Fetch all, show top 10 | N/A       | origin  | 2 new       |

**Backend:**

-   2 new filter parameters added
-   2 new test cases (non-paginated mode)
-   Dual-mode API (paginated vs full array)

**Frontend:**

-   1 shared constant (`PAGINATION_LIMIT`)
-   2 new Redux actions
-   2 new Redux reducers (paginated)
-   1 updated reducer (non-paginated)
-   24 new unit tests total

---

### Performance Considerations

**Current Performance:**

-   ✅ MyPoems/MyFavouritePoems: Only fetches 10 poems per page
-   ✅ List: Only fetches 10 poems per page
-   ⚠️ Ranking: Fetches ALL poems (could be 1000+)

**Future Optimizations:**

1. **Ranking Backend Calculation** (High Priority)

    ```
    TODO: Create GET /api/poems/ranking endpoint
    - Calculate top 10 on backend using MongoDB aggregation
    - Return only top 10 users (not all poems)
    - Reduces data transfer by 90%+
    ```

2. **Implement Caching** (Medium Priority)

    ```
    TODO: Add Redis caching for ranking
    - Cache ranking for 5 minutes
    - Invalidate on new poem/like
    - Reduces database load
    ```

3. **Database Indexing** (Medium Priority)
    ```
    TODO: Add indexes to Poem collection
    - Index on userId (for MyPoems filter)
    - Index on likes array (for MyFavouritePoems filter)
    - Index on origin + date (for ranking)
    ```

---

### Migration Notes

**Breaking Changes:**

-   None - All changes are backward compatible
-   Components using old `getAllPoemsAction()` still work

**Deprecated Patterns:**

-   ❌ **Don't**: Fetch all poems then filter client-side
-   ✅ **Do**: Use server-side filters (`userId`, `likedBy`)
-   ❌ **Don't**: Use hardcoded `const PAGINATION_LIMIT = 10` in components
-   ✅ **Do**: Import from `data/constants.ts`

**Future Cleanup:**

-   [ ] Consider removing `getAllPoemsAction` if no longer used
-   [ ] Consider removing `allPoemsQuery` reducer if no longer used
-   [ ] Migrate old client-side filtering to server-side

---

### Related Files Modified

**Backend:**

-   `backend/src/controllers/poems.js` - Enhanced with filters and dual-mode
-   `backend/src/__tests__/poems.pagination.test.js` - 8 new tests

**Frontend Constants:**

-   `frontend/src/data/constants.ts` - Added `PAGINATION_LIMIT`

**Frontend Redux:**

-   `frontend/src/redux/reducers/poemsReducers.ts` - New reducers
-   `frontend/src/redux/reducers/poemsReducers.pagination.test.ts` - 14 new tests
-   `frontend/src/redux/actions/poemsActions.ts` - New actions
-   `frontend/src/redux/actions/poemsActions.test.ts` - 4 new tests

**Frontend Components:**

-   `frontend/src/components/List/List.tsx` - Uses constant
-   `frontend/src/components/MyPoems/MyPoems.jsx` - Pagination added
-   `frontend/src/components/MyPoems/MyPoems.test.jsx` - 3 new tests
-   `frontend/src/components/MyFavouritePoems/MyFavouritePoems.jsx` - Pagination added
-   `frontend/src/components/MyFavouritePoems/MyFavouritePoems.test.jsx` - 3 new tests
-   `frontend/src/components/Ranking/Ranking.tsx` - Updated for top 10
-   `frontend/src/components/Ranking/Ranking.test.tsx` - 2 new tests

---

### Next Steps

1. **Monitor Performance** (Week 15)

    - [ ] Track ranking API response times
    - [ ] Monitor frontend bundle size
    - [ ] Set up performance budgets

2. **Optimize Ranking** (Week 16)

    - [ ] Implement backend ranking calculation
    - [ ] Add database indexes
    - [ ] Add caching layer

3. **Cleanup** (Week 17)
    - [ ] Remove unused `getAllPoemsAction` if applicable
    - [ ] Document new API endpoints
    - [ ] Update API documentation

---

## 14. Routing & Asset Loading Bug Fixes

### Recent Bug Fixes (December 27, 2025)

#### 14.1 Route Ordering Bug ✅ **FIXED**

**Issue:**

-   Clicking on poem comments icon (`poem__comments-icon`) caused error: `Uncaught SyntaxError: Unexpected token '<'`
-   React Router was matching `/detail/:poemId` against the `/:genre` route instead of the specific `/detail/:poemId`
    route

**Root Cause:**

-   Generic route `/:genre` was defined BEFORE specific route `/detail/:poemId` in `App.tsx`
-   React Router matches routes in order, so `/detail/123` was being caught by `/:genre` with "detail" as the genre

**Fix Applied:**

```tsx
// Before (WRONG - caused bug)
<Route path='/:genre' exact component={Dashboard} />
<Route path='/detail/:poemId' exact component={Detail} />

// After (CORRECT - specific routes first)
<Route path='/detail/:poemId' exact component={Detail} />
<Route path='/:genre' exact component={Dashboard} />
```

**Files Modified:**

-   `frontend/src/App.tsx` - Reordered routes (line 57-58)

**Tests Added:**

-   `frontend/src/App.test.tsx` - Comprehensive routing tests including:
    -   Route matching for all paths
    -   Route ordering verification (detail route takes precedence)
    -   Multiple poem ID formats tested
    -   Genre routes still work correctly

---

#### 14.2 Asset Loading Bug ✅ **FIXED** (Root Cause)

**Issue:**

-   When navigating to `/detail/:poemId`, browser tried to load assets from wrong paths
-   `index.js` loaded as `/detail/index.js` instead of `/index.js`
-   `index.css` loaded as `/detail/index.css` instead of `/index.css`
-   Dev server returned HTML for these 404s (client-side routing fallback)
-   Browser received HTML (`<`) when expecting JavaScript → `Unexpected token '<'`

**Root Cause:**

-   `public/index.html` used **relative paths** for assets:
    ```html
    <link rel="stylesheet" href="index.css" />
    <!-- WRONG -->
    <script src="index.js"></script>
    <!-- WRONG -->
    ```
-   On nested routes like `/detail/123`, relative paths resolve incorrectly

**Fix Applied:**

-   Changed to **absolute paths** with leading slash:
    ```html
    <link rel="stylesheet" href="/index.css" />
    <!-- CORRECT -->
    <script src="/index.js"></script>
    <!-- CORRECT -->
    ```

**Why This Works:**

-   Absolute paths always resolve from root, regardless of current route depth
-   `/index.js` works from `/`, `/detail/123`, `/profile`, etc.
-   Relative `index.js` would try to load from `/detail/index.js` on detail pages

**Files Modified:**

-   `frontend/public/index.html` - Changed to absolute paths (line 8, 12)
-   `frontend/build/index.html` - Updated build output

**Tests Added:**

-   `frontend/src/index.html.test.ts` - Validates HTML structure:
    -   Script tags use absolute paths (`/index.js`)
    -   Stylesheet links use absolute paths (`/index.css`)
    -   No relative paths that would break on nested routes
    -   Prevents regression of this bug

---

#### 14.3 Lessons Learned

**Best Practices:**

1. **Route Ordering**: Always define specific routes before generic catch-all routes
2. **Asset Paths**: Use absolute paths for assets in SPAs with client-side routing
3. **Testing**: Add routing tests to catch route ordering issues
4. **Testing**: Add HTML validation tests to ensure asset paths are correct

**Deprecated Patterns:**

-   ❌ **Don't**: Define generic routes before specific ones
-   ✅ **Do**: Order routes from most specific to least specific
-   ❌ **Don't**: Use relative paths for assets in `index.html`
-   ✅ **Do**: Use absolute paths (leading `/`) for all assets

**Future Prevention:**

-   Unit tests verify route ordering in `App.test.tsx`
-   Unit tests verify asset paths in `index.html.test.ts`
-   Integration tests with Cypress will test navigation (planned)
-   E2E tests with Selenium will test across browsers (planned)

---

## Maintenance After Cleanup

-   Set up Dependabot for automatic dependency updates
-   Enforce test coverage in CI/CD
-   Regular TypeScript strict mode improvements
-   Periodic accessibility audits
-   Performance monitoring dashboards
-   Code review checklist based on these standards
-   Search for unused code and remove it

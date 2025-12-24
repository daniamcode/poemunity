# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Poemunity is a social poetry website with a React frontend and Node.js/Express backend. The project has migrated away from Create React App to a custom esbuild-based build system. It uses Redux for state management and custom token-based authentication.

**Monorepo Structure:**

- `frontend/`: React application with TypeScript
- `backend/`: Node.js/Express API server
- Deployed on AWS with CI/CD via GitHub Actions

## Common Commands

### Frontend (run from `frontend/` directory)

```bash
# Development with hot reload
pnpm dev

# Production build
pnpm prod

# Clean build directory
pnpm clean:build

# Linting
pnpm lint           # Check for errors
pnpm lint:fix       # Auto-fix lint issues

# Code formatting
pnpm prettier       # Format with Prettier
pnpm format         # Format and fix linting

# Testing
pnpm test           # Run all tests
pnpm test:watch     # Run tests in watch mode
pnpm test:changed   # Run tests for changed files only
pnpm test:failing   # Re-run only failing tests
pnpm test:update    # Update snapshots
pnpm coverage       # Run tests with coverage report
```

### Backend (run from `backend/` directory)

```bash
# Development with nodemon
pnpm dev            # Runs on port 4200 with DEBUG=app,app:*

# Staging
pnpm stg

# Production
pnpm prod

# Testing
pnpm test           # Run Jest tests
pnpm test-coverage  # Run with coverage

# Linting
pnpm lint           # Uses Standard.js, auto-fixes
```

## Architecture

### Frontend Architecture

**Build System:**

- Custom esbuild configuration in `build.js` (not Create React App)
- Dev server runs on port 3000 with live reload on port 8942
- Uses esbuild context API for watch mode with custom proxy server
- SASS plugin for styling, supports various loaders (.tsx, .svg, .png, etc.)

**State Management:**

- Redux with Redux Toolkit (`@reduxjs/toolkit`)
- Store configured in `src/redux/store/index.ts`
- Root reducer in `src/redux/reducers/rootReducer`
- Actions organized by domain: `loginActions`, `poemActions`, `poemsActions`, `commonActions`
- TypeScript types: `RootState` and `AppDispatch` exported from store

**React Context:**

- `AppContext` defined in `App.tsx` for shared state (user info, admin ID, etc.)
- Used alongside Redux for component-level state

**Routing:**

- React Router v5 (`react-router-dom@^5.2.0`)
- Routes defined in `App.tsx`:
  - `/` - Dashboard (main feed)
  - `/:genre` - Genre-filtered dashboard
  - `/detail/:poemId` - Poem detail page
  - `/profile` - User profile
  - `/login` - Login page
  - `/register` - Registration page

**Component Structure:**

- Main components: Dashboard, Detail, Header, List, Profile, Ranking, Register
- Material-UI v4 for UI components
- Components typically include TypeScript interfaces, styles (SCSS), and tests

**API Integration:**

- Axios for HTTP requests
- Custom axios instance in `src/redux/actions/axiosInstance.js`
- Requests made through Redux actions (async thunks)

### Backend Architecture

**Entry Point:**

- `index.js` → loads `./bin/dev` (env config) → loads `app.js`

**Express App (`app.js`):**

- MongoDB connection via `mongo.js`
- CORS enabled for `http://localhost:3000`
- Serves static files from `public/` in production
- API routes under `/api/*`:
  - `/api/login` → login controller
  - `/api/register` → register controller
  - `/api/users` → users controller
  - `/api/poems` → poems/poem controllers

**Database:**

- MongoDB with Mongoose ODM
- Connection string from env vars: `MONGODB_PRE` (dev) or `MONGODB` (prod)
- Models: `User.js`, `Poem.js` in `src/models/`

**Controllers:**

- Located in `src/controllers/`: login, register, users, poems, poem
- Handle API endpoints and business logic

**Authentication:**

- Custom token-based authentication (JWT via `jsonwebtoken`)
- Bcrypt for password hashing
- No third-party auth providers

**Middleware:**

- Custom middleware in `src/middleware/`

### Testing

**Frontend:**

- Jest with React Testing Library (`@testing-library/react`)
- TypeScript support via `ts-jest`
- Babel for transforming JS/JSX files
- Test files: `*.test.ts`, `*.test.tsx`, `*.test.js`
- Component tests: `App.test.tsx`, `Components.test.js`, `List.test.tsx`, `ListItem.test.js`
- Redux tests: `poemsActions.test.ts`, `poemsReducers.test.ts`, `store/index.test.ts`
- Snapshot tests in `__snapshots__/` directories
- Custom hooks testing with `@testing-library/react-hooks`
- Test configuration in `jest.config.js`

**Backend:**

- Jest for unit tests
- Mocha/Chai for some tests
- Supertest for API testing
- Coverage with nyc

### Code Style

**Frontend:**

- ESLint with TypeScript support (`typescript-eslint`)
- React plugin, Prettier integration
- Custom rules in `eslint.config.mjs`: Stroustrup brace style, no trailing commas, strict equality
- Prettier for formatting

**Backend:**

- Standard.js for linting (runs with auto-fix)

### TypeScript Migration

The frontend is in active TypeScript migration:

- `tsconfig.json` with strict mode enabled
- Mix of `.ts`, `.tsx`, and legacy `.js` files
- 44+ TypeScript files currently
- Types/interfaces in `src/typescript/` directory

### Environment Variables

**Frontend:**

- `NODE_ENV`: development/production
- `REACT_APP_ADMIN`: Admin user ID

**Backend:**

- `NODE_ENV`: development/production
- `PORT`: Server port (default 8080, dev uses 4200)
- `MONGODB`: Production MongoDB connection string
- `MONGODB_PRE`: Development MongoDB connection string
- `DEBUG`: Debug namespaces (e.g., `app,app:*`)

### Deployment

- GitHub Actions for CI/CD
- Deployed to AWS
- Production builds serve static files from backend's `public/` directory
- Frontend production build outputs to `build/` directory

# AGENTS.md

Guidance for working in this repository. Poemunity is a social poetry website.

## Project Overview

Monorepo with two independently-deployed apps:

- `frontend/`: Next.js (Pages Router) + TypeScript, SSR via `getServerSideProps`. Package manager: **pnpm**.
- `backend/`: Node.js/Express REST API, deployed as a **single Vercel serverless function**. Package manager: **npm**.

Both deploy on Vercel (two separate projects) against MongoDB Atlas; CI via GitHub Actions (lint, typecheck, tests — no deploy step, Vercel deploys on push). Custom domain: `poemunity.com` (apex is canonical; `www` and the `.vercel.app` URL redirect to it).

State is split: **server state** in Redux Toolkit caches, **client/auth state** in `AppContext`. See "Planned: single source of truth" below — the manual server-cache syncing is slated for replacement by a normalized store.

## Common Commands

### Frontend (run from `frontend/`, pnpm)

```bash
pnpm dev            # next dev (http://localhost:3000)
pnpm build          # next build
pnpm start          # next start (serve the production build)
pnpm lint           # ESLint (--max-warnings=0)
pnpm lint:fix       # ESLint --fix
pnpm typecheck      # tsc --noEmit
pnpm test           # TZ=UTC NODE_ENV=test jest  (TZ pinned for deterministic date snapshots)
pnpm test:watch     # jest --watch
pnpm test:changed   # jest --onlyChanged
pnpm test:update    # jest --updateSnapshot
pnpm coverage       # jest --coverage
pnpm prettier       # format src with Prettier
pnpm format         # prettier + lint:fix
pnpm cypress:run    # cypress run (e2e)
pnpm selenium       # Selenium + Applitools visual regression
```

Notes:
- Tests **must** run with `NODE_ENV=test` (RTL `act()` breaks under `production`) and `TZ=UTC` (date-fns snapshots are timezone-sensitive). The `test` script sets both; when invoking jest directly, prefix `TZ=UTC NODE_ENV=test`.
- Vercel's frontend build gate runs `pnpm lint && pnpm typecheck && pnpm test --no-coverage && pnpm build` (`frontend/vercel.json`).

### Backend (run from `backend/`, npm)

```bash
npm run dev         # nodemon, port 4200, DEBUG=app,app:*
npm test            # NODE_ENV=test jest (uses mongodb-memory-server)
npm run coverage    # jest --coverage
npm run lint        # standard --fix (Standard.js)
npm run stg | prod  # forever (legacy long-running host; prod on Vercel is serverless)
```

## Architecture

### Frontend

**Framework & routing**
- Next.js **Pages Router**. Routes live in `frontend/pages/`: `index.tsx` (dashboard), `[genre].tsx`, `detail/[poemId].tsx`, `profile.tsx`, `login.tsx`, `register.tsx`, `authors/`, `privacy.tsx`, `terms.tsx`, `sitemap.xml.ts`, and API routes under `pages/api/`.
- SSR via `getServerSideProps`. `middleware.ts` guards protected routes (redirects to `/login` when the cookie is absent).

**State management**
- **Redux Toolkit** for server-state caches: query slices in `src/redux/reducers/` (`poemsReducers`, `poemReducers`, `authorsReducers`, `loginReducers`) combined in `rootReducer`. Store at `src/redux/store/index.ts` (`RootState`, `AppDispatch`, `useAppDispatch`).
- Async thunks + cache updaters in `src/redux/actions/` (`poemsActions`, `poemActions`, `loginActions`, `commonActions`). Cache consistency after mutations is currently hand-maintained via `updateXCacheAfterY` thunks (fragile — see "Planned: single source of truth").
- **`AppContext`** (`src/App.tsx`) holds client/auth state (current user, picture, isAdmin, …), hydrated from the DB (not the token — see Auth).

**API integration**
- axios instance in `src/redux/actions/axiosInstance.js`. Client-side, `baseURL` is the Next proxy **`/api/backend`**; server-side it's `NEXT_PUBLIC_API_URL`.
- The proxy `pages/api/backend/[...path].ts` forwards to the backend, attaches the httpOnly cookie as a Bearer token, and refreshes the cookie when a response body carries a `token`.

**Auth & session (identity-only JWT)**
- The session cookie holds a JWT with **identity only** (`id`, `username`, `isAdmin`). Profile/display data (picture, bio, birthYear, …) is fetched from the DB via `GET /api/v1/users/profile`, never carried in the token — this keeps the cookie under the ~4KB limit (a base64 picture would overflow it) and keeps context in sync with the database.
- `fetchServerUser` (`src/lib/serverApi.ts`) loads the profile; used by `/api/auth/session` (client hydration) and every page's `getServerSideProps` (`initialUser`).

**Styling**: SCSS + MUI v7 (`@mui/material`) with Emotion. Config in `next.config.js`, `eslint.config.mjs`, `jest.config.js`, `tsconfig.json` (strict).

### Backend

**Entry points**
- `index.js` → `app.js` for local/long-running hosts (`app.listen`).
- **Vercel** uses `api/index.js`, which exports a handler wrapping the Express `app` and caches the Mongo connection across warm invocations. Do **not** rely on `app.listen` on Vercel. `backend/vercel.json` routes all traffic to `api/index.js` and gates deploy on `npm test`.

**Routes** (`app.js`), all under `/api/v1/`: `login`, `register`, `users`, `poems`, `poem`, `authors`, `comments`. `helmet`, `morgan` (non-test), and `express-rate-limit` on login/register. CORS allowlist from `FRONTEND_URLS` (comma-separated, preferred) else `FRONTEND_URL`.

**Models** (`src/models/`): **`Author`** is the primary identity (registered users, fake seeded users, and famous poets — distinguished by `origin`/`fake`). `Poem` stores `authorId` and derives display fields from the populated Author (`name || username`). `Comment`. `User` is **legacy/unused** (kept only for reference).

**Auth**: JWT via `jsonwebtoken` in `src/utils/authToken.js` — `buildAuthorTokenPayload` (identity-only, signed into the cookie) and `buildAuthorProfile` (full profile for `GET /users/profile` and PATCH responses). `bcryptjs` for passwords. `userExtractor` middleware sets `req.userId`.

**Controllers** (`src/controllers/`): `login`, `register`, `users`, `poems`, `poem`, `authors`, `comments`.

### Testing

- **Frontend**: Jest + React Testing Library, `ts-jest`/`babel-jest`, jsdom. Snapshots in `__snapshots__/`. Always run under `TZ=UTC NODE_ENV=test`.
- **Backend**: Jest + Supertest + `mongodb-memory-server`.

### Deployment

- Two Vercel projects: `poemunity-frontend` (root `frontend/`) and `poemunity-backend` (root `backend/`), both triggered by pushes to `master`/`development`. Consider per-project **Ignored Build Step** (`git diff --quiet HEAD^ HEAD -- .`) so each only builds when its own directory changes.
- MongoDB Atlas (Network Access `0.0.0.0/0` for Vercel's dynamic IPs). No AWS static file serving — the frontend is served by Vercel/Next, the backend is a serverless function.

### Environment Variables

**Frontend Vercel project**: `NEXT_PUBLIC_API_URL` (full backend URL). Locally optional — axios defaults to `http://localhost:4200`.

**Backend Vercel project**: `MONGODB` (prod) / `MONGODB_PRE` (dev), `SECRET` (JWT), `REACT_APP_ADMIN` (prod) / `REACT_APP_ADMIN_PRE` (dev) admin ObjectId, `FRONTEND_URL` (required in prod) and/or `FRONTEND_URLS`, `NODE_ENV`, `DEBUG`.

## Planned: single source of truth (normalized Redux store)

**Problem.** Server data is **denormalized** in Redux: each poem is cached as a full copy across six list caches (`ALL_POEMS`, `POEMS_LIST`, `MY_POEMS`, `MY_FAVOURITE_POEMS`, `RANKING`, `AUTHOR_POEMS`), and each author's name/picture is copied onto every poem (`poem.author`, `poem.picture`, `poem.authorSlug`). The same mutable fact lives in many places, so copies drift (deleted poem lingers; changed username/picture doesn't propagate). They're kept in sync by hand-written `updateXCacheAfterY` thunks — a fragile matrix (mutation × cache) that grows with every field.

**Decision.** Normalize into a **single source of truth** using **`createEntityAdapter`** (plain Redux Toolkit — **not** RTK Query). RTK Query was evaluated and rejected: its query-cache/refetch model is the React Query idiom the project deliberately left, and the project prefers explicit REST + Redux control. Store each author once and each poem once, keyed by id; list caches hold arrays of ids; components read by id. One update propagates to every view; the whole `updateXCacheAfterY` family is deleted.

**Two phases (sequential — both touch the same reducers/actions):**
- **Phase 1 — Authors SSoT:** `authorsAdapter` slice keyed by author id; split author fields off poems into `upsertMany` (by `poem.userId`) on fetch; `ListItem`/`AuthorAvatar` use `selectAuthorById(state, poem.userId)`; profile edits `updateOne`; delete `updateCachesAfterAuthorChangeAction`.
- **Phase 2 — Poems SSoT:** `poemsAdapter` entity store; the six list caches become arrays of ids + pagination meta; delete/like become `removeOne`/`updateOne`; delete the delete-cache and like thunks.

**Status:** in progress (Phase 1 first, then Phase 2). Until a phase lands, when adding a mutation still update **every** relevant cache or data will look stale until refresh.

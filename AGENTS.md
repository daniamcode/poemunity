# AGENTS.md

Guidance for working in this repository. Poemunity is a social poetry website.

## Project Overview

Monorepo with two independently-deployed apps:

- `frontend/`: Next.js (Pages Router) + TypeScript, SSR via `getServerSideProps`. Package manager: **pnpm**.
- `backend/`: Node.js/Express REST API, deployed as a **single Vercel serverless function**. Package manager: **npm**.

Both deploy on Vercel (two separate projects) against MongoDB Atlas; CI via GitHub Actions (lint, typecheck, tests — no deploy step, Vercel deploys on push). Custom domain: `poemunity.com` (apex is canonical; `www` and the `.vercel.app` URL redirect to it).

State is split: **server state** in Redux Toolkit caches, **client/auth state** in `AppContext`. Server state is normalized — authors and poems live once in `createEntityAdapter` entity stores and list caches hold arrays of ids (see "Done: single source of truth" below).

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
- Async thunks in `src/redux/actions/` (`poemsActions`, `poemActions`, `loginActions`, `commonActions`). Cache consistency after mutations is automatic: mutations dispatch `poemUpdated`/`poemRemoved`/`authorUpdated` against the normalized entity stores and every id-based view re-reads them (see "Done: single source of truth"). The old `updateXCacheAfterY` thunk family is gone.
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

**Registration/login integrity (shipped):** `Author` has case-insensitive **unique** indexes on `username` and `email` (collation `{ locale:'en', strength:2 }`); register trims/lowercases input, maps `E11000`→`409` (race-safe), and exposes `GET /register/availability`. Login accepts **username or email** (`$or` + collation) and is non-enumerating (generic 401 + dummy bcrypt compare for constant timing). The frontend Register form mirrors the password policy (8–128, letter+number) with an always-visible helper and debounced availability hints.

**Planned: transactional email via Resend (not built yet).** Password reset + email verification are the next auth phase; both need one new capability — sending a transactional email. **Provider is decided: [Resend](https://resend.com)** (HTTP API suits the single serverless function; SMTP with a persistent connection does not). Keep it behind a lazy-required `sendEmail()` util that **no-ops when `RESEND_API_KEY` is unset** (tests/local stay hermetic), mirroring the `@vercel/blob` fallback in `users.js`. Store only `sha256(token)` for reset/verify tokens (never the raw token), strip those fields in `toJSON`, and read `emailVerified` from `buildAuthorProfile` (keep the JWT identity-only). New env vars when built: `RESEND_API_KEY`, `EMAIL_FROM` (needs the `poemunity.com` domain verified in Resend — owner action). **Resend free-tier limits (at time of writing):** 3,000 emails/month, **100/day**, 1 custom domain, 30-day retention — ample for reset/verify volume, but keep the 100/day cap in mind before any bulk send, and note that **until the domain is verified, Resend only sends from its `onboarding@resend.dev` sandbox to the account owner's own address** (dev-testing only, not real users). Full design in `docs/EMAIL_AUTH_PLAN.md` (gitignored; contains real addresses). OAuth/social login is a later phase, scoped in the same doc.

### Testing

- **Frontend**: Jest + React Testing Library, `ts-jest`/`babel-jest`, jsdom. Snapshots in `__snapshots__/`. Always run under `TZ=UTC NODE_ENV=test`.
- **Backend**: Jest + Supertest + `mongodb-memory-server`.

### Deployment

- Two Vercel projects: `poemunity-frontend` (root `frontend/`) and `poemunity-backend` (root `backend/`), both triggered by pushes to `master`/`development`. Consider per-project **Ignored Build Step** (`git diff --quiet HEAD^ HEAD -- .`) so each only builds when its own directory changes.
- MongoDB Atlas (Network Access `0.0.0.0/0` for Vercel's dynamic IPs). No AWS static file serving — the frontend is served by Vercel/Next, the backend is a serverless function.

### Environment Variables

**Frontend Vercel project**: `NEXT_PUBLIC_API_URL` (full backend URL). Locally optional — axios defaults to `http://localhost:4200`.

**Backend Vercel project**: `MONGODB` (prod) / `MONGODB_PRE` (dev), `SECRET` (JWT), `REACT_APP_ADMIN` (prod) / `REACT_APP_ADMIN_PRE` (dev) admin ObjectId, `FRONTEND_URL` (required in prod) and/or `FRONTEND_URLS`, `NODE_ENV`, `DEBUG`.

## Done: single source of truth (normalized Redux store)

**Problem.** Server data is **denormalized** in Redux: each poem is cached as a full copy across six list caches (`ALL_POEMS`, `POEMS_LIST`, `MY_POEMS`, `MY_FAVOURITE_POEMS`, `RANKING`, `AUTHOR_POEMS`), and each author's name/picture is copied onto every poem (`poem.author`, `poem.picture`, `poem.authorSlug`). The same mutable fact lives in many places, so copies drift (deleted poem lingers; changed username/picture doesn't propagate). They're kept in sync by hand-written `updateXCacheAfterY` thunks — a fragile matrix (mutation × cache) that grows with every field.

**Decision.** Normalize into a **single source of truth** using **`createEntityAdapter`** (plain Redux Toolkit — **not** RTK Query). RTK Query was evaluated and rejected: its query-cache/refetch model is the React Query idiom the project deliberately left, and the project prefers explicit REST + Redux control. Store each author once and each poem once, keyed by id; list caches hold arrays of ids; components read by id. One update propagates to every view; the whole `updateXCacheAfterY` family is deleted.

**Two phases (both shipped):**
- **Phase 1 — Authors SSoT:** `authorEntities` slice (`createEntityAdapter`) keyed by author id; poem fetches `authorsUpserted` (by `poem.userId`); `ListItem`/avatar resolve the author via `selectAuthorEntityById`; profile edits `authorUpdated`.
- **Phase 2 — Poems SSoT:** `poemEntities` entity store; the six list caches hold arrays of ids + pagination meta (resolved via memoized selectors in `redux/selectors/poemCacheSelectors.ts`); like/delete are `poemUpdated`/`poemRemoved`; Detail reads `selectPoemEntityById`. The whole `updateXCacheAfterY` family is deleted.

**Status:** done. Mutations now touch one record; every view re-reads it. When you add a new poem/author field or mutation, feed it through the entity store — do **not** reintroduce per-cache copies. The former follow-ups are also done: the `authorsReducers` list caches resolve identity through `authorEntities` (`redux/selectors/authorCacheSelectors.ts`); **ranking is computed server-side** (`GET /api/v1/poems/ranking`) rather than fetching all poems client-side, so `rankingQuery` holds a ready-to-render `RankItem[]` and is no longer part of the mutation cache-patching path; the unused `allPoemsQuery` cache was removed.

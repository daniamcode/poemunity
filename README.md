# Poemunity

A social poetry website. Frontend: Next.js (SSR). Backend: Node.js/Express deployed as a Vercel serverless function. Authentication is custom token-based (JWT + httpOnly cookies).

Deployed on Vercel (two separate projects). CI via GitHub Actions (lint, typecheck, tests — no deploy step; Vercel triggers automatically on push).


# TL;DR:
## Flux 
In the flux folder we have the original project, made during the bootcamp and deployed afterwards. 

This Fullstack Bootcamp took place at _Skylab Coders Academy_ (Barcelona) from the 6th of July to the 25th of September of 2020.

My final Project was **Poemunity**, a social poetry website made in 2,5 weeks with the following technologies and methodologies:

- JavaScript
- React
- Flux
- Node.js
- Express
- MongoDB & Mongoose
- SCSS
- Material UI
- Git & Github
- TDD & BDD Testing (Jasmine, Jest, Mocha, Chai)
- Agile (Scrum)
- SOLID principles

Presentation: https://www.youtube.com/watch?v=WAyod6lGboE&t=4s

## React-Query
Then, I created the Poemunity-React-Query folder and continued from there, managing Server State (cache) with React-Query and Client State with useContext (a Global State Manager like Flux or Redux is not needed anymore with this approach since we divide it into these two differenciated parts (Server State (asynchronous) and Client State)). By the way, a middleware like Thunk manages asynchrony for Redux, and all that becomes transparent to me with React Query.

## Redux
The current app uses Redux (Redux Toolkit). The earlier `Flux` and `React-Query` folders are deprecated and kept only for reference.

Historically this project was a learning exercise — the three folders (Flux → React Query → Redux) exist because the original goal was to explore as many approaches as possible. **That is no longer the goal: Poemunity is now a production product, and architectural decisions prioritize robustness, correctness, and maintainability over breadth of technologies explored.** Where a past choice was made "to learn X," it is re-evaluated on product merit (see "Planned: server state → RTK Query" below).

### Done: single source of truth (normalized Redux store)

**Problem.** Server data is **denormalized** in the Redux store: each poem is cached as a *full copy* across six separate list caches (`ALL_POEMS`, `POEMS_LIST`, `MY_POEMS`, `MY_FAVOURITE_POEMS`, `RANKING`, `AUTHOR_POEMS`), and each author's name/picture is *copied onto every poem* (`poem.author`, `poem.picture`, `poem.authorSlug`, …). The same mutable fact is therefore stored in many places, so the copies **drift** — a deleted poem lingers on the author page, a changed username/picture doesn't propagate. These copies are kept in sync by hand-written `updateXCacheAfterY` thunks (one per mutation × per cache) — a fragile matrix that grows with every field and mutation.

**Decision.** Normalize the store into a **single source of truth** using **`createEntityAdapter`** (plain Redux Toolkit — *not* RTK Query). RTK Query was considered and rejected: its query-cache / refetch-on-invalidation model is the React Query idiom the project deliberately moved away from, and the project prefers explicit REST + Redux control. Instead, store each author **once** and each poem **once**, keyed by id; list caches hold **arrays of ids**; components read author/poem **by id**. Change a record once → every view re-reads it, no propagation code. The entire `updateXCacheAfterY` family is deleted.

**Approach (two phases, sequential — both touch the same reducers/actions).**

*Phase 1 — Authors as the single source of truth (fixes the name/picture drift):*
1. Add an `authorsAdapter` (`createEntityAdapter`) → an `authors` slice keyed by author id (`{ id, name, picture, slug, type }`).
2. On every poems fetch, split the author fields off each poem into `authorsAdapter.upsertMany` (keyed by `poem.userId`).
3. `ListItem` / `AuthorAvatar` look the author up via `selectAuthorById(state, poem.userId)` instead of reading `poem.picture` / `poem.author`.
4. Profile edits dispatch `authorsAdapter.updateOne({ id, changes })`; **delete** `updateCachesAfterAuthorChangeAction`.

*Phase 2 — Poems as the single source of truth (fixes deleted-poem-lingers, like drift):*
5. Add a `poemsAdapter` → a `poems` entity store (each poem once, by id).
6. Convert the six list caches from arrays of full poems to **arrays of poem ids** + their pagination meta.
7. Delete/like become `poemsAdapter.removeOne` / `updateOne`; **delete** the delete-cache and like thunks.

**Status:** done. Both phases shipped — authors and poems are each stored once and read by id, the Detail page reads the poem entity, and the entire `updateXCacheAfterY` family (author, create, save, like, delete variants, plus the Detail like-cache thunk) is deleted. A like/delete/rename now mutates one record and every view re-reads it.

**Follow-ups (now also done):** the `authorsReducers` list caches (top-authors, authors-by-letter) resolve name/picture/slug through `authorEntities` (memoized selectors in `redux/selectors/authorCacheSelectors.ts`), so a rename propagates without a refetch; **ranking is computed server-side** (`GET /api/v1/poems/ranking` aggregation) instead of shipping every poem to the browser; and the unused `allPoemsQuery` cache was removed.

### Auth & session (identity-only JWT)

The session cookie holds a **JWT with identity only** (`id`, `username`, `isAdmin`). Profile/display data (picture, bio, birthYear, …) is **never** in the token — it is fetched from the DB via `GET /api/v1/users/profile` (see `fetchServerUser` in `frontend/src/lib/serverApi.ts`), used by both `/api/auth/session` and `getServerSideProps`. This keeps the cookie well under the ~4KB limit (a base64 profile picture would blow past it) and means context always reflects the database. Client API calls go through the Next proxy `/api/backend/[...path]`, which attaches the httpOnly cookie and refreshes it when a response carries a (now-slim) token.

### Planned: transactional email (Resend) → password reset + email verification

Auth today is username/password only — **no email sending, password reset, or email verification** yet. The next auth phase adds all three on top of one new capability: sending a trusted transactional email.

- **Provider: [Resend](https://resend.com) (decided).** The backend is a single Vercel serverless function, so email must be sent over an HTTP API within the request (not persistent SMTP). Resend fits that, has a serverless-first API, and a free tier well above this app's volume. It sits behind a single `sendEmail()` util so it stays swappable, and no-ops when unconfigured (keeps tests hermetic).
- **Prerequisite (owner action, not code):** production deliverability needs the **`poemunity.com` sending domain verified** — add Resend's SPF/DKIM DNS records, then set `EMAIL_FROM=no-reply@poemunity.com`. Until then, only Resend's sandbox sender works.
- **Order:** (1) email infrastructure, (2) password reset — fixes a real lockout (a user who forgets their password is currently stuck), (3) email verification — abuse/quality gate. Three separate PRs.
- **New backend env vars (added when built):** `RESEND_API_KEY` (absent → email features safely no-op) and `EMAIL_FROM`. No new frontend env vars.
- **Free-tier limits (Resend, at time of writing):** **3,000 emails/month** and **100 emails/day**, **1 custom domain**, **30-day** log/data retention. Comfortably above this app's transactional volume (reset/verify are low-frequency), but the **100/day cap** is the one to watch if verification emails ever go out in bulk (e.g. a backfill). Also note the pre-verification restriction below: without a verified domain, Resend only sends from its `onboarding@resend.dev` sandbox sender **to the account owner's own email** — fine for local/dev testing, not for real users.
- **Already shipped groundwork:** registration is now case-insensitive-unique on username **and** email (collation indexes), race-safe (`E11000`→409), trimmed/lowercased, with email-or-username non-enumerating login and a public availability endpoint — so email lookups for reset/verify build on an already-unique, normalized email column.

Full design (endpoints, token model, gating, security caveats) lives in `docs/EMAIL_AUTH_PLAN.md` (gitignored — it contains real addresses). Social login (OAuth) is scoped there too, as a later phase after reset + verification.

### Next.js migration
With the introduction of agentic AI, the frontend was migrated from a custom esbuild SPA to Next.js (Pages Router) for SSR and SEO. See `docs/NEXTJS_MIGRATION.md` for the full migration log. The `old` branch still has the three deprecated folders (flux, React-Query, Redux+esbuild) for reference.

## Author / User types

The app uses a single `Author` collection (after migrating away from a separate `User` collection). Authors are distinguished by two fields:

| Type | `origin` | `fake` | Has credentials? |
|---|---|---|---|
| Real registered user | `'user'` | `false` | Yes (username, email, passwordHash) |
| Fake seeded user | `'user'` | `true` | Maybe |
| Famous poet (manually added) | `'famous'` | `false` | No |
| Famous poet (Poetry Foundation) | `'Poetry Foundation'` | `false` | No |

**Important:** the `origin=famous` filter used in the API (`/api/poems?origin=famous` and `/api/authors?origin=famous`) is the **union** of `'famous'` and `'Poetry Foundation'` — both map to the same "famous" concept in the UI.

The legacy `User` model still exists in `backend/src/models/User.js` but is no longer used after the Author migration.

## Poem data

The famous poets and poems were seeded from the **Poetry Foundation Kaggle dataset**:
https://www.kaggle.com/datasets/tgdivy/poetry-foundation-poems

The CSV contains `Title`, `Poem`, `Poet`, and `Tags` columns. Tags are mapped to the app's genre system; the seed script is at `backend/scripts/seed-poems.js`.

## Deployment (Vercel + MongoDB Atlas)

Two separate Vercel projects, both connected to this GitHub repo:

| Project | Framework | Root directory | Triggers deploy on push to |
|---|---|---|---|
| `poemunity-frontend` | Next.js | `frontend/` | `master`, `development` |
| `poemunity-backend` | Node.js (Express) | `backend/` | `master`, `development` |

### How deploys work

Vercel detects pushes to the connected branches and deploys automatically — no manual step needed.

GitHub Actions and Vercel run **in parallel and independently**. Vercel now has its own repo-defined build gates, so a failing Vercel gate blocks that deployment. Branch protection is still recommended so broken branches cannot be merged before Vercel sees them.

| Step | GitHub Actions | Vercel |
|---|---|---|
| Lint | ✅ | ✅ frontend build gate |
| Typecheck | ✅ | ✅ frontend build gate |
| Frontend tests | ✅ | ✅ frontend build gate |
| Backend tests | ✅ | ✅ backend build gate |
| Build (frontend) | ✅ verification | ✅ actual deploy |
| Build (backend) | ✗ | ✅ test-gated serverless deploy |

To make Actions gate the deploy (block bad code from reaching production), enable **branch protection rules** in GitHub → Settings → Branches → require status checks to pass before merging.

### Backend

Express app wrapped in a single Vercel serverless function at `backend/index.js`. MongoDB connections are cached across warm invocations to avoid pool exhaustion. `backend/vercel.json` routes all traffic to that handler.

### Frontend

Next.js (Pages Router) with SSR via `getServerSideProps`. `frontend/vercel.json` sets `buildCommand: "pnpm lint && pnpm typecheck && pnpm test --no-coverage && pnpm build"` — framework detection is automatic.

`NEXT_PUBLIC_API_URL` is baked into the bundle at build time. In local dev the axios instance falls back to `http://localhost:4200` so the env var is only required in Vercel.

### Required env vars

**Backend Vercel project:**
| Variable | Description |
|---|---|
| `MONGODB` | MongoDB Atlas connection string |
| `SECRET` | JWT signing secret (generate with `openssl rand -base64 32`) |
| `REACT_APP_ADMIN` | Admin author ObjectId used by backend admin checks |
| `FRONTEND_URL` | Frontend URL, no trailing slash. Required in production (a startup guard throws without it) |
| `FRONTEND_URLS` | Optional, preferred: comma-separated CORS allowlist (e.g. `https://poemunity.com,https://www.poemunity.com,https://poemunity-frontend.vercel.app`). When set it is used exclusively; otherwise `FRONTEND_URL` is used |
| `NODE_ENV` | `production` |

**Frontend Vercel project:**
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Full backend URL with protocol (e.g. `https://poemunity-backend.vercel.app`) |

`NEXT_PUBLIC_ADMIN` is no longer used for frontend authorization decisions. Admin status comes from the backend-issued JWT (`isAdmin`). It has been removed from repo config and CI build envs; also remove any stale value from the Vercel dashboard.

### Database backup / restore

Production uses MongoDB Atlas backups. Before production AI seeding or other bulk writes, create an on-demand Atlas snapshot and complete the restore drill in `docs/DATABASE_BACKUP_RESTORE.md`.

## Testing

### Backend unit tests

```bash
cd backend && pnpm test
```

Covers registration (happy path, missing fields, email validation, duplicate detection).

### Frontend unit / integration tests

```bash
cd frontend && pnpm test
```

### Selenium + Applitools visual regression

```bash
cd frontend && pnpm selenium
```

Requires a running dev stack (backend on 4200, frontend on 3000) and the following env vars in `frontend/.env`:

| Variable | Description |
|---|---|
| `APPLITOOLS_API_KEY` | From eyes.applitools.com → Account → API Key |
| `SELENIUM_USERNAME` | Username of a real account in the dev database |
| `SELENIUM_PASSWORD` | Password for that account |

**Note:** Visual diffs do not fail the test run (`eyes.closeAsync()` is used). Diff results are still recorded in the Applitools dashboard for review. When you want to enforce visual quality (e.g. pre-release), switch to `eyes.close()` in `frontend/selenium/visual.spec.ts` — any unaccepted diff will then fail the test.

### Local development

```bash
# Terminal 1 — backend (port 4200)
cd backend && pnpm dev

# Terminal 2 — frontend (port 3000)
cd frontend && pnpm dev
```

`frontend/.env.local` does not need `NEXT_PUBLIC_ADMIN` for admin features. Admin status comes from the backend JWT. `NEXT_PUBLIC_API_URL` is not needed locally either — the axios instance defaults to `http://localhost:4200`. For local admin checks, set `REACT_APP_ADMIN_PRE` in `backend/.env`.

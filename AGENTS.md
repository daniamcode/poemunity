# AGENTS.md

Guidance for working in this repository. Poemunity is a social poetry website.

This is the single source of truth for agent guidance — `CLAUDE.md` just imports it.
Edit this file, not that one.

## Project Overview

Monorepo with two independently-deployed apps:

- `frontend/`: Next.js (Pages Router) + TypeScript, SSR via `getServerSideProps`.
- `backend/`: Node.js/Express REST API, deployed as a **single Vercel serverless function**.

**Use pnpm in both workspaces.** CI installs with `pnpm --frozen-lockfile`, so an
npm-generated lockfile fails the build before deploy.

Both deploy on Vercel (two separate projects) against MongoDB Atlas; CI via GitHub Actions (lint, typecheck, tests — no deploy step, Vercel deploys on push). **CI and deploys are scoped per app** — see Deployment. Custom domain: `poemunity.com` (apex is canonical; `www` and the `.vercel.app` URL redirect to it).

State is split: **server state** in Redux Toolkit caches, **client/auth state** in `AppContext`. Server state is normalized — authors and poems live once in `createEntityAdapter` entity stores and list caches hold arrays of ids (see "Done: single source of truth" below).

## ⚠️ Gotchas (read before running anything)

- **`MONGODB_PRE` points at the same cluster and database as `MONGODB`.** There is no
  separate dev/staging database, so any script run in "development" mode writes to
  **production**. Treat every seed/migration script in `backend/scripts/` as a production
  write: dry-run first (they are dry-run by default — keep it that way) and take a
  `mongodump` snapshot. See `TODO.md`.
- **Frontend tests must run with `TZ=UTC NODE_ENV=test`.** RTL `act()` breaks under
  `production`, and date-fns snapshots are timezone-sensitive. The `test` script sets
  both; when invoking jest directly, prefix them yourself.
- **Backend test servers must bind loopback.** `backend/jest.setup.js` listens once per
  test file on `127.0.0.1` and hands that server to supertest. Do not revert to
  supertest's default per-request `app.listen(0)`: it binds the wildcard address, and
  with `SO_REUSEADDR` the suite starts talking to unrelated processes on the machine
  (~25% of runs failed with foreign 302/404/401s or `socket hang up`).
  `src/__tests__/test-harness.test.js` guards it.
- **Do not rely on `app.listen` on Vercel** — the serverless entry point is
  `backend/api/index.js` (see Backend entry points).
- **`TODO.md` is the backlog's single source of truth**, including deliberately deferred
  decisions. Check it before proposing work.

## Common Commands

Scripts live in each workspace's `package.json` (`pnpm dev`, `pnpm test`, `pnpm lint`,
`pnpm typecheck`, `pnpm coverage`, frontend `pnpm cypress:run` / `pnpm selenium`).
Only the non-obvious parts are worth recording:

- Backend `pnpm dev` runs nodemon on port 4200 with `DEBUG=app,app:*`.
- Backend `pnpm test` uses `mongodb-memory-server`, so no live database is needed.
- In **both** workspaces `pnpm lint` **checks** and `pnpm lint:fix` auto-fixes (backend is
  Standard.js, frontend is ESLint). CI runs the check-only form, so never point it at the
  `--fix` variant — that would repair errors in the runner and pass a hollow gate.
- Vercel's frontend build gate runs `pnpm lint && pnpm typecheck && pnpm test --no-coverage && pnpm build` (`frontend/vercel.json`).
- The backend deploy is **not** gated on tests — `backend/vercel.json` only routes traffic
  to `api/index.js`. CI-on-push is the guard. Adding a real gate means migrating off the
  legacy `builds` config (deferred; see `TODO.md`).
- `backend/scripts/set-account-password.js` sets a password from a hidden prompt, for
  accounts unreachable via the email reset flow.

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
- **Vercel** uses `api/index.js`, which exports a handler wrapping the Express `app` and caches the Mongo connection across warm invocations. `backend/vercel.json` routes all traffic to it.

**Routes** (`app.js`), all under `/api/v1/`: `login`, `register`, `password`, `verify`, `admin`, `users`, `poems`, `poem`, `authors`, `comments`. `helmet`, `morgan` (non-test), and `express-rate-limit` on login/register/password/verify (all limiters skip when `NODE_ENV=test`). CORS allowlist from `FRONTEND_URLS` (comma-separated, preferred) else `FRONTEND_URL`.

**Models** (`src/models/`): **`Author`** is the primary identity (registered users, fake seeded users, and famous poets — distinguished by `origin`/`fake`). `Poem` stores `authorId` and derives display fields from the populated Author (`name || username`); `Poem.likes` is `[String]`, holding author ids as strings. `Comment`. `User` is **legacy/unused** (kept only for reference).

**Auth**: JWT via `jsonwebtoken` in `src/utils/authToken.js` — `buildAuthorTokenPayload` (identity-only, signed into the cookie) and `buildAuthorProfile` (full profile for `GET /users/profile` and PATCH responses). `bcryptjs` for passwords. `userExtractor` middleware sets `req.userId` (a **string** — the JWT payload is JSON-serialized, so compare it strictly against `likes` entries).

**Registration/login integrity (shipped):** `Author` has case-insensitive **unique** indexes on `username` and `email` (collation `{ locale:'en', strength:2 }`); register trims/lowercases input, maps `E11000`→`409` (race-safe), and exposes `GET /register/availability`. Login accepts **username or email** (`$or` + collation) and is non-enumerating (generic 401 + dummy bcrypt compare for constant timing). The frontend Register form mirrors the password policy (8–128, letter+number) with an always-visible helper and debounced availability hints.

Email uniqueness for real accounts is enforced by a **partial** unique index on `email`
(`{ email exists, testAccount: false }`), which deliberately exempts `testAccount: true`
accounts so several of them can share one inbox.

**Email & verification (shipped, live in prod).** Transactional email goes through
[Resend](https://resend.com) behind `src/utils/email.js`, which **no-ops when
`RESEND_API_KEY` is unset** so tests and local runs stay hermetic. Password reset
(`controllers/password.js`) and email verification (`controllers/verify.js`) store only
`sha256(token)`, never the raw token, and strip those fields in `toJSON`.
`passwordChangedAt` revokes existing sessions on reset. `REQUIRE_EMAIL_VERIFICATION`
gates publishing/commenting (`requireVerified`), and the admin (`REACT_APP_ADMIN`) is
exempt. There is **no logged-in "change password" route** yet — the only path is the
emailed reset link, which resolves by `findOne({ email })` and so is ambiguous for
shared-inbox test accounts (use `set-account-password.js`). Full design in
`docs/EMAIL_AUTH_PLAN.md` (gitignored; contains real addresses). OAuth/social login is a
later phase, scoped in the same doc.

### Testing

- **Frontend**: Jest + React Testing Library, `ts-jest`/`babel-jest`, jsdom. Snapshots in `__snapshots__/`. Always run under `TZ=UTC NODE_ENV=test`.
- **Backend**: Jest + Supertest + `mongodb-memory-server`. `jest.setup.js` owns the shared loopback server and per-test collection cleanup — see Gotchas before changing it.

### Deployment

- Two Vercel projects: `poemunity-frontend` (root `frontend/`) and `poemunity-backend` (root `backend/`), triggered by pushes to `master`/`development`.
- **Each app builds only when its own directory changes.** Both `vercel.json`s carry
  `"ignoreCommand": "git diff --quiet HEAD^ HEAD -- ."`, which Vercel runs from the
  project's Root Directory — exit 0 (no changes there) means skip the build. A commit
  touching only shared root files (`AGENTS.md`, `TODO.md`, `.github/`) deploys neither.
- **CI is one workflow per app**, `.github/workflows/frontend.yml` and `backend.yml`,
  each with a `paths` filter and both branches. They replaced the old per-branch
  `poemunity-master.yml` / `poemunity-development.yml` pair, which duplicated every
  step across four copies. Each workflow also watches its own file, so a change to the
  steps can prove itself when no app code moved. The frontend build is **two `if`-guarded
  steps** rather than one with a ternary on the secret: `cond && A || B` silently falls
  through to `B` when `A` is empty, which would build `master` against the pre backend.
- Path-filtered jobs are safe only because `master` has **no required status checks**. If
  those are ever added, a skipped job hangs as "Expected" and blocks the merge.
- MongoDB Atlas (Network Access `0.0.0.0/0` for Vercel's dynamic IPs). No AWS static file serving — the frontend is served by Vercel/Next, the backend is a serverless function.
- Work is committed directly to `master` (branch protection blocks force-push and deletion). A `develop` branch workflow is deliberately deferred — see `TODO.md`.

### Environment Variables

**Frontend Vercel project**: `NEXT_PUBLIC_API_URL` (full backend URL). Locally optional — axios defaults to `http://localhost:4200`.

**Backend Vercel project**: `MONGODB` (prod) / `MONGODB_PRE` (dev — but see Gotchas: same database), `SECRET` (JWT), `REACT_APP_ADMIN` (prod) / `REACT_APP_ADMIN_PRE` (dev) admin ObjectId, `FRONTEND_URL` (required in prod) and/or `FRONTEND_URLS`, `RESEND_API_KEY` + `EMAIL_FROM` (email; unset ⇒ sending is a logged no-op), `REQUIRE_EMAIL_VERIFICATION`, `SIMULATION_INTERNAL_SECRET` (lets the simulation scripts bypass the login rate limiter), `NODE_ENV`, `DEBUG`.

## Done: single source of truth (normalized Redux store)

**Problem.** Server data was **denormalized** in Redux: each poem was cached as a full copy across six list caches (`ALL_POEMS`, `POEMS_LIST`, `MY_POEMS`, `MY_FAVOURITE_POEMS`, `RANKING`, `AUTHOR_POEMS`), and each author's name/picture was copied onto every poem. The same mutable fact lived in many places, so copies drifted (deleted poem lingers; changed username/picture doesn't propagate), kept in sync by hand-written `updateXCacheAfterY` thunks — a fragile matrix (mutation × cache) that grew with every field.

**Decision.** Normalize into a **single source of truth** using **`createEntityAdapter`** (plain Redux Toolkit — **not** RTK Query). RTK Query was evaluated and rejected: its query-cache/refetch model is the React Query idiom the project deliberately left, and the project prefers explicit REST + Redux control. Store each author once and each poem once, keyed by id; list caches hold arrays of ids; components read by id.

**Two phases (both shipped):**
- **Phase 1 — Authors SSoT:** `authorEntities` slice keyed by author id; poem fetches `authorsUpserted` (by `poem.userId`); `ListItem`/avatar resolve the author via `selectAuthorEntityById`; profile edits `authorUpdated`.
- **Phase 2 — Poems SSoT:** `poemEntities` entity store; the six list caches hold arrays of ids + pagination meta (resolved via memoized selectors in `redux/selectors/poemCacheSelectors.ts`); like/delete are `poemUpdated`/`poemRemoved`; Detail reads `selectPoemEntityById`.

**Status:** done. Mutations touch one record; every view re-reads it. When you add a new poem/author field or mutation, feed it through the entity store — do **not** reintroduce per-cache copies. `authorsReducers` list caches resolve identity through `authorEntities` (`redux/selectors/authorCacheSelectors.ts`); **ranking is computed server-side** (`GET /api/v1/poems/ranking`); the unused `allPoemsQuery` cache was removed.

**Ranking freshness after mutations.** The author ranking (`rankingQuery`, the sidebar) is a **server-computed aggregate** (points = `3×poems + 1×likes`, top-10) — *not* part of the normalized entity store, because the client doesn't hold every poem and so can't recompute it. The three mutations that change author points — **like** (`PUT /poem/:id`), **create** (`POST /poems`), **delete** (`DELETE /poem/:id`) — **recompute and return the fresh ranking in their own response** (poem fields stay top-level, `ranking` is a sibling; delete returns `200 { ranking }` instead of `204`). The frontend adopts it verbatim via `setRanking(response.ranking)`, so points/order/tie-breaks stay 100% server-owned. `computeRanking()` lives in `backend/src/utils/ranking.js`, shared with `GET /poems/ranking`. A missing `ranking` field is a safe no-op, so frontend/backend can deploy in either order. Rejected alternatives: **(A)** optimistically patch cached points client-side — re-encodes the server formula and can't cross the top-N boundary; **(B)** refetch `GET /ranking` after each mutation — a second round-trip per like. Editing a poem (no point change) and profile edits (identity only — handled by the `authorEntities` overlay in `selectRanking`) deliberately carry no ranking.

## Search (server-backed)

Search is a **server** query, not a client-side filter. `GET /api/v1/poems?q=`
matches poem **titles** and **author names** (case-insensitive), composed under
`$and` so it narrows the existing `genre`/`origin`/`userId`/`likedBy` filters
rather than replacing them, and paginates like any other list. Poem **body text
is deliberately excluded** — without snippet highlighting, full-text hits are
unscannable.

The regex is **unanchored and escaped**, and therefore does a collection scan.
That is the intended trade at this size. Do not "optimise" it into an anchored
`^term` regex to make it indexable: that only matches titles *starting* with the
term, so "love" stops finding "A Song of Love". `$text` is also not a substitute
— it stems whole words, so the partial words produced by search-as-you-type
match nothing. The real upgrade path is **Atlas Search**.

Client side, `useSearchQuery` (`frontend/src/hooks/`) owns the whole policy and
is shared by all three search bars (dashboard/genre list, My Poems, My
Favourites): 300ms debounce, a 2-character minimum, and a fresh AbortController
per fetch. `getAction` accepts that `signal` and treats `Axios.isCancel` as a
non-event — without that, superseding a request would dispatch `rejected` and
flash the list's error state on every keystroke. Aborting the request being
replaced is what makes "latest wins" structural rather than luck.

`SearchBar` is **not** an ARIA combobox — there is no popup listbox, results
replace the page content. It is a `searchbox` plus a polite `role="status"`
region announcing the result count and the minimum-length hint (a silent
threshold is the actual anti-pattern). Pass `resultCount: undefined` while a
request is in flight so nothing is announced until the count is real.

Lists must keep the search box mounted while a query runs — the full-page
spinner is gated on `!q`, or the input unmounts mid-search and the user loses
focus and caret on every keystroke.


## Next poem (the dimension walk)

The poem detail page carries one "Next poem" control. It is **never hidden and
never dead-ends**, and it never changes what you are browsing by — it only
advances along it.

**Two levels, and keeping them separate is the whole design.**

**Level 1 — which poems are in play (dimension & bucket).** A *dimension* is what
the reader is browsing by: `genre` or `author`. A *bucket* is one value of it (the
Love genre; Marta Ruiz). Buckets **partition** the collection — every poem has
exactly one author and exactly one genre — and that partition is why one lap
visits every poem exactly once. An earlier design widened scope instead
(author → genre → global); it skipped poems, because a widening step jumps over
everything between two poems of the same author. Do not reintroduce that shape.

Genre bucket keys are **lowercased** (`$toLower` in the aggregation,
`toLowerCase()` on the current poem). Membership is matched case-insensitively to
mirror the list filter, so if `Love` and `love` were listed as two buckets each
would match *all* love poems, the buckets would overlap instead of partition, and
the lap would revisit poems. Pinned by the mixed-case lap test. Author buckets sort
by display name with `_id` as tie-break, since two poets can share a name.

**Level 2 — the order inside a bucket: `date` DESC, `_id` DESC.** "Next" is the
first poem *strictly after* the current one:
`{ $or: [{ date: { $lt: cur.date } }, { date: cur.date, _id: { $lt: cur._id } }] }`.
The `_id` tie-break is not decoration — seeded poems share an identical `date`,
and with `date` alone "next" would ping-pong between two of them forever.
**Undated poems must be named explicitly**: BSON sorts null/missing lowest (so
they land at the end of a `date: -1` sort), but MongoDB's range operators never
compare across BSON types, so `{ date: { $lt: <Date> } }` does *not* match them.
Without the extra `{ date: null }` branch the undated tail is unreachable. See
`strictlyAfter()` in `backend/src/controllers/poem.js`.

**Endpoint** — `GET /api/v1/poem/:poemId/next?dimension=genre|author` (`:poemId`
resolves by ObjectId **or** slug via the shared `findPoemByIdOrSlug` helper;
declared before `GET /:poemId` so it cannot be shadowed). `dimension` is optional
and defaults to `genre` — the no-context case: a direct link, a refresh, a
crawler. Each step runs only when the previous returned nothing:

1. **`same-bucket`** — next poem in the current bucket.
2. **`next-bucket`** — first poem of the next bucket alphabetically. "First"
   means first in the same total order, i.e. the newest.
3. **`wrap`** — first poem of the first bucket alphabetically. If that resolves
   to the current poem (a single-poem collection) the response is
   `{ poem: null, scope: null }` and the frontend hides the control — the only
   case where it is hidden.

Response: `{ poem, scope: 'same-bucket' | 'next-bucket' | 'wrap' }`. The scope is
part of the contract because the UI needs to know whether a bucket was crossed.

**Cross-bucket entry is always by date**, even when the list the reader came from
was ordered by likes or title. Honouring those would mean re-running the ranking
aggregate on every hop. The inconsistency is deliberate and noted in the code.

**Genreless-poem guard.** Every poem currently has a genre, so the partition
holds. A poem with a missing/empty genre (or no resolvable author, in the author
dimension) belongs to no bucket, and rather than drop out of the walk it degrades
to the plain global date order, reported as `next-bucket` so the card labels
itself from the destination. A malformed record degrades; it does not become
permanently unreachable.

**When you add a poem field, do not introduce a second ordering source.** Both
levels read from exactly one place each — bucket membership from `genre`/
`authorId`, order from `date`+`_id`. A new "featured", "pinned" or "sort weight"
field that quietly participates in either breaks the partition or the total order,
and with them the visit-everything-once guarantee.

**Frontend: SSR answer first, client upgrade after.** `getServerSideProps`
(`pages/detail/[poemId].tsx`) fetches `/next` **in parallel** with the poem via
`Promise.all` — `/next` resolves the poem itself, so making it serial would just
add a hop to TTFB. A failed/absent answer is `null` and renders nothing. SSR sends
no `dimension` (it has no browsing context), so it gets the `genre` default.

After hydration `useNextPoem` (`src/components/Detail/hooks/`) upgrades the href
to the neighbour in whichever ordered list cache holds the current poem — zero
network calls, and it automatically respects the reader's genre, `origin`,
`orderBy` and active `?q=`. At the tail of the poems-list cache with `hasMore` it
takes the same load-more path infinite scroll uses. The cache also names the
dimension: `authorPoemsQuery` ⇒ `author`, an active genre filter ⇒ `genre`,
anything else ⇒ none. **`author` is the only dimension worth a client round-trip**
(`GET /next?dimension=author`), because SSR already answered for `genre`.

**Browsing context is client state only** — `listContextQuery`
(`src/redux/reducers/listContextReducers.ts`), which `usePoemsList` fills with the
active query, because the list caches keep ids + `page`/`hasMore` but not the
filters that produced them. Never put it in the URL: a `?from=my-favourites` in a
shared link is meaningless or leaky to the recipient.

The card (`components/NextPoemCard.tsx`) is a real `<Link>` inside
`<nav aria-label="Poem navigation">`, rendered **between `.poem__block` and the
comments sentinel** — never below the comments, which lazy-load and grow
unbounded. It always names the bucket being **arrived in**, so `same-bucket` and
`next-bucket` share one label formula (for `same-bucket` the destination's
bucket is the current one anyway); only `wrap` reads differently. Its
**responsive labels are a pure CSS swap**: both strings are in the DOM and a
`$bp-md` media query picks one. Branching on viewport width in JS would differ
between server and client render and cause a hydration mismatch on every detail
page. Both spans are `aria-hidden`; the accessible name is stated once via
`aria-label`.

Indexes backing the walk are declared on the schema but **not yet built in
production** — see `TODO.md`.

## Reference Docs

- `TODO.md` — the backlog (priorities, deferred decisions, recently shipped).
- `docs/NEXTJS_MIGRATION.md` — Next.js migration status.
- `docs/AI_COMMUNITY_SIMULATION.md` — AI activity seed plan + scripts.
- `docs/DATABASE_BACKUP_RESTORE.md` — backup/restore drill.
- `docs/PRODUCTION_CHECKLIST.md` — launch checklist.
- `frontend/CLEANUP.md` — frontend cleanup plan.

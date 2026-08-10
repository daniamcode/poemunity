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
- **Mongoose `autoIndex` is ON in production** (`backend/mongo.js` sets no
  `autoIndex: false`). A new schema index therefore builds itself on deploy — but
  autoIndex only ever **creates**. Remove an index from a schema and it lives on
  in the database forever, costing writes for a query that no longer exists.
  After removing one, drop it explicitly; `node backend/scripts/check-index-drift.js`
  reports both directions and is read-only.
- **`autoCreate` is a SEPARATE switch from `autoIndex`, and also defaults to
  true.** Setting `autoIndex: false` does not imply it. It creates the
  *collection* when a model compiles, so any script that merely `require`s a
  model writes to the database — `check-index-drift.js` created an empty
  `follows` collection in production while calling itself read-only. A script
  that must not write needs **both** `mongoose.set('autoIndex', false)` and
  `mongoose.set('autoCreate', false)`, before any model is required.
- **Every model with declared indexes must be listed in `check-index-drift.js`.**
  Its `MODELS` array is hardcoded, and a model left off is not reported as
  clean — it is not reported at all, which prints identically ("No drift").
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

**SSR props seeded into Redux must ALSO be read directly, or the server renders
nothing.** Every list here seeds its `getServerSideProps` data into the store
inside a `useEffect`, and **effects do not run during server rendering** — so the
component reads an empty store and emits an empty page, shipping the data twice
(once as JSON in `__NEXT_DATA__`, never as markup) and drawing nothing until the
browser has hydrated. The fix is one line: fall back to the prop when the store
is still empty (`storePoems.length ? storePoems : initialData.poems`). It is
hydration-safe because the client's FIRST render has not run the effect either,
so the markup is byte-identical; once seeded the store wins, including on every
client-side navigation.

Any count or flag DERIVED from that data needs the same fallback (`total`,
`hasMore`), or the page reports 0 poems above a list it is about to draw.

**This has bitten three times: the poem lists, the author page, and the authors
index.** The last two cost the site its internal linking rather than just speed —
`/authors` rendered 0 links to 3,364 author pages and each author page rendered
0 links to its poems, so everything below `/authors` was reachable only through
the sitemap. A crawl from the homepage reached 11% of poems within five clicks.
The author page also emitted JSON-LD listing 10 poems it had not rendered.

**RTL cannot catch this.** `render()` runs effects, so the store gets seeded and
everything looks fine. The guards are `renderToString` tests —
`List.ssr.test.tsx` and `Authors.ssr.test.tsx` — and a new SSR-seeded list needs
one too.

**API integration**
- axios instance in `src/redux/actions/axiosInstance.js`. Client-side, `baseURL` is the Next proxy **`/api/backend`**; server-side it's `NEXT_PUBLIC_API_URL`.
- The proxy `pages/api/backend/[...path].ts` forwards to the backend, attaches the httpOnly cookie as a Bearer token, and refreshes the cookie when a response body carries a `token`.

**Auth & session (identity-only JWT)**
- The session cookie holds a JWT with **identity only** (`id`, `username`, `isAdmin`). Profile/display data (picture, bio, birthYear, …) is fetched from the DB via `GET /api/v1/users/profile`, never carried in the token — this keeps the cookie under the ~4KB limit (a base64 picture would overflow it) and keeps context in sync with the database.
- `fetchServerUser` (`src/lib/serverApi.ts`) loads the profile; used by `/api/auth/session` (client hydration) and every page's `getServerSideProps` (`initialUser`).

**Styling**: SCSS + MUI v7 (`@mui/material`) with Emotion. Config in `next.config.js`, `eslint.config.mjs`, `jest.config.js`, `tsconfig.json` (strict).

**Fonts**: EB Garamond (body) and Quattrocento (headings) are loaded by
`src/lib/fonts.ts` via `next/font/google` and published as `--font-body` /
`--font-heading` on `:root` by `_app.tsx`; `$font-body` / `$font-heading` in
`_variables.scss` are `var()` references to those. **Naming a family in SCSS
loads nothing** — that was the bug: both families were named and never loaded, so
every visitor got the generic `serif` (Times) and the site never rendered in its
own typefaces. To check whether a family is real, measure it against `serif` on a
canvas; identical widths mean it fell back. Adding a weight or style (e.g. an
italic) means adding it in `fonts.ts`, or the browser synthesises one.

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

**Three habits, each of which caught a real bug that a passing suite had missed.**

1. **Red-check every new test.** Break the implementation, watch the test fail,
   restore it. Tests that pass against broken code are worse than no tests — four
   shipped-looking ones were caught this way in a single day (mixed-case genre
   buckets, alphabetical author ordering, the next-poem arrow, `scrollIntoView`),
   each passing happily against a deliberately broken implementation.

2. **Give selection and ordering tests a distractor.** Build the fixture so a
   WRONG implementation returns a DIFFERENT answer. An author-ordering test
   passed with an `_id` sort because creation order happened to match alphabetical
   order cyclically; a mixed-case genre test passed with the lowercasing removed
   because the only spelling that mattered sat on the one poem that never decided
   a crossing.

3. **Never let one value play two roles in a fixture.** Records are addressed by
   **slug** in the URL and by **id** in the normalized store. `src/test-utils/fixtures.ts`
   keeps them deliberately different — use `makePoem()` rather than a hand-rolled
   literal. This is not hypothetical: `useDetailPoem` looked its entity up with the
   URL parameter, so every visit to `/detail/<slug>` missed the store and likes
   never re-rendered. All 984 tests passed, because every one addressed the hook
   by id.

**Integration tests earn their place where units are mocked past each other.**
`Detail.test.tsx` mocks `useDetailPoem`, and the hook's own tests addressed it by
id — so between them nobody exercised the path a reader actually takes.
`src/__tests__/detailLike.integration.test.tsx` renders the real components,
hooks, thunks and reducers with **only axios mocked**, and fails if that bug is
reintroduced.

**Know what tests cannot reach.** A sticky rail taller than the viewport hid
Poem of the week completely; the right rail vanishes below `$bp-xl`; a commit
adding a needed backend fallback never deployed at all despite green CI. Lint,
typecheck, 984 tests and the build all passed through every one of those. Layout
needs a browser, and a deploy needs verifying against the live URL — never
inferred from CI.


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
- **Plus a third workflow, `e2e.yml` (Cypress)** — the one job that is not per-app: the
  specs drive the frontend but exercise the real backend, so it watches `frontend/**`
  *and* `backend/**`. It is separate because it needs two servers and is the most
  flake-prone, so a browser hiccup must not obscure whether lint and unit tests passed.
  It runs **`next dev`, not a production build**: in development React *throws* on a
  hydration mismatch and Cypress fails the test, while a production build silently
  recovers by re-rendering client-side and the suite would go green over a real bug.
  It sets `NEXT_PUBLIC_API_URL=http://localhost:4201`; unset, the app defaults to
  :4200 and `create-poem.cy.ts` writes poems into whatever lives there. Cypress starts
  the test backend itself — the job only starts the frontend.
- Path-filtered jobs are safe only because `master` has **no required status checks**. If
  those are ever added, a skipped job hangs as "Expected" and blocks the merge.
  CI also cannot *block a deploy* today: pushes go straight to `master` and Vercel
  deploys on push, so the two race. Green CI is a signal, not a gate.
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

## Drafts (one visibility fragment)

`Poem.status` is `'draft' | 'published'`, **defaulted to `published` and never
backfilled**. The ~16k poems that predate the field carry no `status` at all, so
"published" has to mean *published or absent* — that equivalence is what let this
ship without a write to the production database, and it is why a filter written
as `{ status: 'published' }` is a bug that hides the entire existing collection.

**There is exactly one visibility fragment**, `PUBLISHED_MATCH` /
`publishedOnly()` in `backend/src/utils/poemVisibility.js`, and every public read
composes it: the list endpoint (search, genre, origin, userId, likedBy, and the
paginated `total` — a filtered list with an unfiltered count advertises what it
refused to show), `computeRanking()`, poem-of-the-week, `GET /poem/:id`, the
next-poem walk (inside `findNext` and `firstAuthorAfter`, not at the call sites),
author poem counts, comment creation, and the legacy `GET /users` populate. The
frontend sitemap needs no change of its own — it crawls `GET /poems`.

Two things about that fragment are deliberate. It is a single **top-level key**,
so it composes with the `$or` (userId) and `$and` (search) the list endpoint
already builds. And it is an **allowlist** (`$in: ['published', null]`), not
`{ $ne: 'draft' }`: a status added later — scheduled, archived — stays invisible
until somebody decides otherwise. Getting this wrong publishes private writing,
which is why it is one helper rather than a line repeated at fifteen call sites.

`src/__tests__/drafts.test.js` **enumerates the public endpoints in a table** and
asserts none of them mentions a draft. Add a row when you add a route. Its
fixture is built from distractors — a drafts-only author who sorts first, a draft
that is the newest poem, a draft between two published ones so the within-author
walk steps onto it, and a published poem inserted through the driver with no
`status` key at all.

Reading a draft is owner-or-admin and answers **404, not 403** — a 403 confirms
that a poem exists at that slug. `req.userId` is a string from a JSON-serialized
JWT, and `poem.authorId` may be populated, so the comparison goes through
`authorIdOf()`. `userExtractor.optional` is the non-rejecting variant for routes
that are public but answer differently for the owner.

`GET /poems?status=draft` is the Drafts tab, scoped **by the session**, never by
`?userId=`. Publish/withdraw is `PATCH /poem/:id { status }`, which returns a
freshly recomputed `ranking` because it changes the author's poem count — an
ordinary edit still returns none. Client-side, publishing is purely a
**membership move** between id-lists (`movePoemBetweenDraftAndPublished`); the
poem is one entity that both sides resolve through.

The Drafts tab searches like any other list — `?q=` composes under `$and` and
the session scoping is applied *last*, so it cannot be widened by a query
param. That ordering is the reason `MyDrafts` must send **no `userId`**: on this
route the server ignores one, and a component that sent it would read as though
client-supplied scope were what keeps a private list private.

`PATCH /poem/:id` accepts only `poem`, `title`, `genre` and `status` from an
author. `likes`, `date`, `origin` and `userId` are **admin-only** on both write
routes — see "Server-owned poem fields" below.

## Server-owned poem fields

`Poem` is **`strict: false`**, so anything the handler passes to the model is
persisted, declared in the schema or not. Both write routes therefore name what
they accept instead of forwarding the request body:

- `POST /poems` builds the document from an **explicit allowlist**. It used to
  spread `...poemData` and override only a few keys.
- `PATCH /poem/:id` allows `poem`, `title`, `genre`, `status` — and nothing
  else. Its allowlist used to include the four fields below.

**`likes`, `date`, `origin` and `userId` are admin-only on both routes.** Not
style: the author ranking is `3×poems + 1×likes`, computed server-side and shown
in the public sidebar, so a client that could set `likes` bought a place in it
with one request and never touched the like endpoint. `date` is the sort key for
every list and for the next-poem walk. `origin` decides whether a poem is
presented as a famous poet's work. Editing is **owner-gated, not admin-gated**,
which is why the PATCH allowlist was as exploitable as the create spread.

An allowlist, not a delete-list, and it is the same choice as `PUBLISHED_MATCH`
being an `$in` allowlist: a field added to the form later is inert until someone
decides it should be writable, whereas a delete-list silently admits whatever it
was not updated to exclude.

Rejected fields are **dropped, not 400'd** — the profile form posts the whole
poem object on every save, so rejecting would break ordinary editing rather than
block anything. That is also why `poemFieldAllowlist.test.js` asserts on what
was **persisted**: both routes answer 200/201 either way, and a test checking
only the status code passes against the vulnerable version.

`buildPoemData` mirrors the split client-side and sends none of the four for an
ordinary poet. Not merely wasted bytes — the edit success handler merges the
*posted* fields into the Redux poem entity, so sending them would show a date and
an origin the database never stored.

## Notifications

Four event types — `like`, `comment`, `follow`, `newPoem` — each with a
per-author preference, **all on by default**.

**Collapsing is a property of the storage, not the rendering.** Twelve likes on
one poem is ONE row saying twelve. Grouping on read cannot work here: read state
is per-row and a group has no single read state. `notify()` merges into an
existing **unread** row of the same `(recipient, type, poem)`; a **read** row is
never merged into, because you already saw it and a new like has to be able to
raise a fresh unread one.

`count` is deliberately **not** `actors.length`. The actor array is capped
(`MAX_ACTORS`, so the UI can render "Ada, Milo and 10 others") and the count is
not, so past the cap they disagree and the count is the honest one. Anything
computing "and N others" from the array length is a bug —
`notificationText.test.ts` pins it with a fixture where the two differ.

Ordered by **`updatedAt`**, not `createdAt`: a collapse updates in place, and
ordering by creation would leave a poem that gathered fifty likes this morning
wherever its first like landed last week.

`notify()` **never throws** — a notification is a side effect of somebody else's
action and must not fail the like that caused it — but it **is awaited**, because
an un-awaited write on a serverless function that may freeze at response time is
a write that sometimes does not happen. Self-actions are dropped inside `notify()`
rather than at the call sites, so a new trigger cannot forget.

**Unliking RETRACTS the notification it raised** — but only while that row is
still **unread**. A notification you have already seen is part of what happened
to you, and deleting it rewrites something you witnessed; unread means nobody
has looked, so removing it costs no one a memory. The actor bookkeeping has one
trap: `count` is uncapped while `actors` is capped, so an actor absent from the
array may still be counted. Decrement without removing only when
`count > actors.length`; if they are absent and the two agree, they are not one
of the actors and touching the count would silently eat somebody else's like.
The row is deleted when the last actor leaves, rather than left saying zero.

Trigger edges that are easy to get wrong: the like route **toggles**, so
unliking must notify nobody; **withdrawing** a poem notifies nobody (a poet
toggling status while they fiddle would otherwise spam their followers);
**profile** comments share the comment route but their `targetId` is an author
id, so they are dropped rather than misrouted; and the publish fan-out uses the
**author** as actor, not the requester, which differ on the admin's
post-on-behalf path. Seed scripts write the model directly rather than through
the API, which is what stops bulk AI seeding fanning out thousands of rows —
load-bearing, not incidental.

Every route is scoped by `recipient: req.userId`, never a query parameter, and
marking-read by id narrows that scope but cannot widen it.

**Absent preference means ON.** Every author predates `notificationPrefs`, so
nothing is stored for any of them. Mongoose fills schema defaults on
*hydration*, so the model path survives a truthiness check today — but add
`.lean()` to that lookup, an ordinary performance change, and the safety net
vanishes. `isNotificationEnabled()` is the single place the rule lives, and it
is unit-tested on a plain object for exactly that reason. (The end-to-end tests
cannot prove this rule; a red-check established that.)

The list is **10 per page** with a "Show more" button, and `hasMore` comes from
asking for one row MORE than the page rather than a second `countDocuments` per
open — so `total` is deliberately not known and nothing displays one. The probe
row is sliced off before responding, or it renders an eleventh row and then
reappears on page two.

The badge is fetched **once on mount and never polled** — a poll on every open
tab is a request per user per interval, forever, to learn a number that is
usually unchanged. If freshness matters later, refetch on window focus rather
than on an interval. There is **no sixth profile tab**: the bell's panel is the
notifications surface, and preferences live in the profile settings column.

## Follow / followers (the social graph)

Stored as **edges** in a `Follow` collection (`follower`, `following`,
`createdAt`), never as an array on `Author`. The array is fewer lines and wrong
three ways: a document caps at 16MB so a popular poet's follower list has a hard
ceiling; an array cannot be paginated without loading all of it; and "who
follows X" would need a scan of every author's array, because an array only
indexes the side that owns it.

**Three indexes, none redundant.** `{ follower, following }` is **unique** and
is the entire concurrency story: a read-then-write check ("do I already follow
them?") loses to a double-clicked button, because both requests read *no* before
either writes. The unique index makes the second insert impossible at the
storage layer, and the controller maps `E11000` to **success, not 409** —
double-clicking Follow is not an error, and the state you asked for is the state
you got. (`register` maps E11000 to 409 because a taken username is genuinely
somebody else's; a follow you already have is your own.) The other two,
`{ following, createdAt: -1, _id: -1 }` and `{ follower, createdAt: -1, _id: -1 }`,
serve one list direction each — a compound index is only usable from a prefix,
so the unique index cannot answer "everyone who follows B" at all.

The `_id` in those two is not decoration. Batch-created edges share a
`createdAt` to the millisecond, and a paginated sort whose ties break
arbitrarily can show the same follower on page 1 and page 2 while dropping
another entirely. Same lesson as the next-poem walk.

**`follower` always comes from the session**, never the request body — a
body-supplied follower would let anyone forge follows in someone else's name.
Self-follow is rejected 400, and the comparison goes through `String()` on both
sides because `req.userId` is a string from a JSON-serialized JWT while
`author._id` is an ObjectId, so `===` between them is always false.

**Followers do not affect ranking — yet.** `computeRanking()` is
`3×poems + 1×likes` as shipped. A change to `+ 2×followers` has since been
decided and is pending in `TODO.md`; when it lands, `follow` and `unfollow`
join the mutations that must return a freshly recomputed `ranking`, alongside
like/create/delete/publish.

`followerCount`, `followingCount` and `isFollowing` ride on
**`GET /authors/:slug`** rather than a call of their own: a separate endpoint
would cost a second round-trip to a possibly-cold serverless backend and land
*after* first paint, so the button would render in a default state and then
flip — briefly telling you that you do not follow someone you do. `isFollowing`
is always present, never omitted for logged-out visitors, because `undefined`
and `false` mean the same thing to the client but only one is a stated answer.

**All three author kinds are followable** — real users, famous poets and AI
personas. Famous poets never publish, so following one is a reading list rather
than a feed; that is accepted. **AI personas keep the AI badge on every follow
surface**, which is why `authorType` travels onto every list row: following a
bot is in tension with the disclosure the footer and per-poem badges exist to
make, and the badge is how that tension is managed.

Logged out, the button is a **link to `/login`**, not a hidden or disabled
control. Hiding it hides the affordance entirely, so a visitor never learns the
site has following at all and the counts beside it read as decoration.

One known limit, found by red-check and recorded so it is not rediscovered: the
tie-break ordering test passes if you delete `_id` from the **sort spec** alone,
because the index's own third key already returns ties in `_id` order. It fails
only when both lose it. The sort spec is still where the guarantee lives — index
order for an unspecified tie is an implementation detail MongoDB does not
promise — so `follows.test.js` pins the **declared indexes** separately. That
also guards what the ordering test cannot see: `autoIndex` only ever creates, so
an index dropped from the schema lives on in Atlas forever.

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
is shared by all four search bars (dashboard/genre list, My Poems, My
Favourites, Drafts): 300ms debounce, a 2-character minimum, and a fresh AbortController
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


## Next poem (one rule)

The poem detail page carries one **"Next poem"** control. It is never hidden and
never dead-ends, and it answers the same way for every reader:

1. the **author's next poem**;
2. that author exhausted → the **next author alphabetically**, at their newest
   poem;
3. the last author → **wrap** to the first author.

**It deliberately ignores where the reader came from.** An earlier version
followed the list you were browsing (genre lists walked genres, author pages
walked authors) and upgraded the href client-side from the Redux list caches.
That was removed on purpose: the same poem offered different destinations
depending on your history, and a refresh — which wipes the caches — silently
changed the answer. If you are tempted to reintroduce list-awareness, that is
the tradeoff you are re-opening.

**Two orderings, both fixed.** Within an author, `date` DESC with `_id` DESC as
tie-break; between authors, display name (`name || username`) ASC with `_id` ASC
as tie-break. Neither tie-break is decoration: poems seeded in one batch share an
identical `date` and two poets can share a display name, and without the second
key "next" is ambiguous and the walk can ping-pong between two records forever.

**Why one lap covers everything.** Authors partition the collection — every poem
has exactly one — so following the walk from any poem visits every poem exactly
once before returning to the start. `poem.next.test.js` pins this from *every*
starting point on a fixture with interleaved authors and repeated dates. Two
traps that fixture exists to catch, both of which produced hollow green tests
before being fixed: a shared date across two *different* authors never exercises
the within-author tie-break, and an author creation order that matches name order
cyclically makes an `_id` sort indistinguishable from an alphabetical one.

**Poems with no author are skipped** as destinations — they belong to no author,
so the walk cannot place them. Landing *on* one still moves forward: it starts
the reader at the first author rather than dead-ending.

**Undated poems** are the subtle one. BSON sorts null/missing lowest so they sort
last, but MongoDB range operators never compare across BSON types, meaning
`{ date: { $lt: <a Date> } }` does **not** match a missing date. Left unhandled
the undated tail is unreachable, so `strictlyAfter()` names it explicitly.

### API and frontend

`GET /api/v1/poem/:poemId/next` (`:poemId` = ObjectId or slug, unauthenticated)
takes **no parameters** — the rule is entirely server-owned. It returns
`200 { poem }`, with `poem: null` when the collection holds nothing else, or
`404` when the current poem does not exist.

`getServerSideProps` fetches it **in parallel** with the poem itself (the
endpoint resolves the poem on its own, so it must not add a hop to TTFB), and a
failure is swallowed to `null` — the control renders nothing rather than breaking
the page. It also re-runs on client-side navigation between detail pages, so the
answer stays fresh as the reader walks; `useNextPoem` only fetches when props
arrive without one.

The card (`components/NextPoemCard.tsx`) is a real `<Link>` inside
`<nav aria-label="Poem navigation">`, rendered **between `.poem__block` and the
comments sentinel** — never below the comments, which lazy-load and grow
unbounded. Its label is the single string **"Next poem"** at every width: it once
varied by scope and viewport ("Next poem in Garden" / "In Garden"), which took
four strings and a CSS swap to express a distinction the reader never asked for.
The visible text is `aria-hidden` and the accessible name is stated once via
`aria-label`; the trailing arrow is decorative for the same reason, and holds
still under `prefers-reduced-motion`.

The index backing the walk is declared on the schema but **not yet built in
production** — see `TODO.md`.

## SEO metadata

Titles and descriptions for the listing pages are built in `src/utils/seo.ts`;
JSON-LD in `src/utils/structuredData.ts`, serialised by `components/JsonLd.tsx`.

Word order differs by page type **on purpose**, mirroring how people search:
`46 Love poems` (the phrase is "love poems", so the count leads and the phrase
stays intact) but `35 poems by John Doe` (nobody searches "John Doe poems"). A
count of 0 drops the number entirely and 1 is singular — `0 Love poems` and
`1 Love poems` both shipped-looking bad enough to be pinned by tests.

**`?q=` pages are `noindex,follow`** with a canonical to the clean genre URL.
Otherwise every query anyone types becomes an indexable page claiming the genre
holds only what it matched, since the SSR `total` is the FILTERED total. `follow`
rather than `nofollow` because the poems it links to are worth crawling — hence
`SeoHead`'s `followLinks` prop, which the auth pages deliberately do not set.

The genre `<h1>` reads the **live** total from the store, not the SSR one, or it
keeps claiming the unfiltered count while the reader looks at search results.

Two rules for the structured data:

- **It must describe what the page actually renders.** Item lists are built from
  the poems that were rendered, never from the total. Claiming more is a
  spam-policy violation, not an optimisation.
- **AI personas get no `Person` entity.** Emitting one would assert in
  machine-readable form that a real human exists — undoing the AI disclosure the
  footer and the per-poem badges exist to make. Their pages describe the
  collection and stay silent about authorship. This is also why the `/authors`
  index emits flat `ListItem`s rather than `Person`s: that page mixes real
  users, famous poets and AI personas, and a name plus a URL is the most it can
  say truthfully about all three.

**Site-level markup lives on the homepage, and only on page 1.** `WebSite`
(carrying the `SearchAction` that can earn a sitelinks searchbox, targeting
`/?q=` because that is the URL the search bar really produces) and
`Organization`. Both describe the *site*, not the page, so repeating them across
125 paginated URLs asserts one entity at 125 addresses; the listing pages
reference the same site through `isPartOf` instead.

**`og:image:width`/`height` are only emitted for the default card.** They are a
claim about a specific file. The author pages pass the poet's avatar as `image`,
and stating 1200x630 for a ~44px square tells a scraper to reserve a slot the
image cannot fill — the same mismatch that got avatars pulled from the poem
pages' social cards. Note `next/head` **flattens one level only**: two tags
wrapped in a fragment never reach `<head>` at all, so a conditional pair is two
separate expressions. That shipped-looking bug was caught by a test, not review.

`/privacy` and `/terms` canonicalise via `canonicalUrl()` against
`NEXT_PUBLIC_SITE_URL`, not the request host, because they are statically
optimised — adding `getServerSideProps` just to learn the host would cost a
render per request for a document that never changes.

**Poem pages** canonicalise to the **slug**, never to the requested URL: a poem
resolves by both id and slug, so the two are duplicates, and echoing whichever
form the visitor arrived on made id URLs declare themselves canonical and
disagree with the sitemap (which emits slugs). They pass **no** `image` — that
used to be the author's ~44px avatar being served as a 1200x630 social card. The
description is the poem with whitespace collapsed and the cut moved to a word
boundary; a poem is mostly line breaks, and they travel into the meta tag
verbatim. The title is `<title> by <author>` with no count — people search a
poem's title next to its poet. JSON-LD uses schema.org's exact `Poem` type,
carries the like count (visible in the footer) and deliberately omits
`commentCount`, which is not known at render time because comments lazy-load.

**Breadcrumbs** (`components/Breadcrumbs.tsx`) are the one type here Google
renders as an actual search feature — `CollectionPage`, `Poem` and `Person` are
**not** rich-result types, so the Rich Results Test reports "no items detected"
for them and that is correct, not a fault. Use validator.schema.org to check the
rest. The trail is rendered as well as marked up, and the final crumb is neither
a link on screen nor an `item` in the markup.

`JsonLd` escapes `<` as `\u003c`. This is not cosmetic: the payload carries poem
titles and author names into a raw `<script>`, where the HTML parser ends the
element at the first literal `</script>` regardless of JSON quoting.

## Paginated list URLs

The lists load by **infinite scroll**, which no crawler performs, and the routes
hardcoded `page: 1` — so `/love?page=2` returned byte-identical poems to `/love`
and poems 11..1,247 had **no URL that reached them**. A genre page exposed 10 of
its 1,247 poems. Measured before the fix: a crawl from the homepage following
only server-rendered links reached 11% of poems within five clicks.

Infinite scroll stays; `?page=N` is honoured server-side underneath it, and
`components/Pagination.tsx` renders real `<a href>` links into the HTML.
`src/utils/pagination.ts` owns the rules and `pagination.test.tsx` pins them.

**One page of results has one address.** Page 1 is the CLEAN URL and `?page=1`
redirects rather than rendering. So does junk — and the validation is a
`/^[1-9]\d*$/` test, not `Number()`, which accepts `'1.5'`, `' 2 '`, `'0x3'`,
`'1e3'` and `'02'`. Silently falling back to page 1 is what the genre route used
to do, and it mints a limitless supply of URLs serving poems they do not name.

**A page past the end is a 404.** `?page=9999` rendered a heading over nothing —
the soft-404 shape — and there are infinitely many of them. Page 1 is exempt: an
empty genre is a real page that says so.

**Each page canonicalises to ITSELF, never back to page 1.** Page 2 holds
different poems, so folding it into page 1 declares it a duplicate of a page it
shares nothing with, and Google drops the links on a URL it has folded away —
which is the entire reason these URLs exist. Titles carry the page number for
the same reason: 125 pages under one title read as one page.

The nav lists **first and last**, not just prev/next: page 125 would otherwise
sit 124 hops from page 1 and no crawler walks that far.

**Three routes carry these rules**: `/`, `/[genre]` and `/authors/<slug>`. The
author page was added last (408 authors have more than ten poems, and 3,381
poems — 21% of the collection — sat past page 1 of theirs); it reuses
`utils/pagination.ts` and `components/Pagination.tsx` unchanged, so a fourth
paginated list is wiring, not new rules.

### A page link is a client-side navigation, and the store must follow it

Every one of these lists seeds Redux from its SSR props inside an effect, and
the effect ran **once, on mount**. Clicking a page link does not unmount
anything — `getServerSideProps` re-runs and hands down page 3's poems while the
component keeps the store it already had. Two different wrong outcomes hide
there, and the paginated URLs work perfectly on a cold load in both:

- **Stale** — the seed is skipped and the reader keeps looking at page 1 under a
  URL naming page 3.
- **Appended** — the seed runs without a reset first. The list caches *append*
  any payload whose `page` is not 1, because that is how infinite scroll grows
  the list, so page 3 lands under page 1 and twenty poems render.

So the seed watches `currentPage`, and **resets the cache before re-seeding**
whenever the page it last seeded differs. In `usePoemsList` only the FIRST seed
sets the flag that suppresses the filter-change fetch: that effect does not
watch the page, so on a page navigation it never runs to clear the flag, and a
flag left standing would swallow the fetch for the next real search instead.

A `renderHook` test with **one store across both renders** is what pins this;
building the store inside the wrapper component rebuilds it on every render, the
hook falls back to its prop, and every assertion passes against both bugs. That
is not hypothetical — a red-check caught exactly that hollow version here.

The other half of the same class: `/[genre]` computed `currentPage` and **never
passed it to `<Dashboard>`**, so on `/love?page=7` the nav marked page 1 current
and `usePageUrlSync` rewrote the address bar back to `/love`. Server-side
paging was right; nothing rendered from it.

### The address bar follows the scroll

`hooks/usePageUrlSync.ts` rewrites the URL via `history.replaceState` as the
reader crosses from one page of poems into the next. Infinite scroll is
untouched; nothing refetches and the list does not re-render.

**This is not an SEO device** — crawlers do not scroll and already have the
`<a href>` nav. It fixes two reader-facing problems: scrolling to poem 400 and
sharing the URL used to send someone to poem 1, and opening a poem then hitting
Back used to return you to the top with everything you had loaded gone.

`replaceState`, never `pushState`: one history entry per boundary would mean
forty taps of Back to escape a list you scrolled through once. Back lands on
`?page=41`, which server-renders poems 401-410 rather than all 400 you had
scrolled — accepted, since restoring the whole list means caching it.

The page is recomputed from **every** marker, not from the observer entry that
fired: scroll upward out of page 3 and its marker stops intersecting before page
2's arrives, leaving a gap where the last event is simply wrong. There is a
120px activation offset so a boundary grazing the top edge does not renumber the
page on a one-pixel jitter.

The nav's current page is this synced page, so the nav and the address bar can
never disagree about where the reader is. Syncing is **disabled while the typed
search query differs from the URL's** — the list is then showing results the
address bar does not describe, and writing `?page=3` onto it would name a page
of a different result set.

### The author index is letters, not buttons

The alphabet was 26 `<button onClick>` handlers over client state, so there was
**no URL for "authors starting with B"**: the page server-rendered letter A and
the other 25 letters — 3,100-odd of the 3,364 author pages — existed only after
a click. `?letter=` was ignored server-side too.

They are `<Link>`s now, which also makes `AuthorsIndex` **purely prop-driven**:
every letter and filter is a real navigation that re-runs `getServerSideProps`,
so there is no seeding effect and no window where the store holds the previous
letter's authors under a URL naming a different one.

Rules mirror pagination: **letter A is the clean `/authors` URL**, `?letter=A`
redirects, and **lowercase REDIRECTS rather than being uppercased in place** —
uppercasing would leave `?letter=b` and `?letter=B` both answering 200 with the
same authors. A letter nobody's name begins with is a **404** and is not linked.

**Letters are indexable and self-canonical; the origin filter is
`noindex,follow`.** Letters *partition* the authors, so no two letter pages list
the same person. An origin-filtered view is a strict SUBSET of one, so indexing
it would put the same people on two URLs — the same treatment `?q=` gets, and
`follow` because its links are still worth crawling. Changing the filter returns
to letter A, because the letters holding authors differ per filter and carrying
one across can land on a letter that filter has emptied.

All 3,364 author pages are now linked, verified by walking A-Z against the real
backend.

## Sitemaps (an index over four sections)

`/sitemap.xml` is a **sitemap index**, not a urlset. It lists four children —
`pages`, `authors`, `poems-community`, `poems-famous` — served by
`pages/sitemaps/[section].ts` over the helpers in `src/lib/sitemap.ts`. 19,587
URLs in total, the same set the single file carried.

**The split is a diagnostic, not a ranking trick.** Splitting a sitemap does not
make Google index faster. Search Console reports coverage **per submitted
sitemap**, so one 19,587-URL file gave one number that answered nothing about
*which* class was stuck. The famous/community split is the one that earns its
place: **15,652 of the 16,087 poems are famous ones that exist verbatim on
hundreds of other sites**, against **435 that exist only here**. Those two groups
have completely different prospects in search, and averaging them hides the only
comparison worth making. Submit each child in GSC, not just the index, to get
per-file numbers.

**A sitemap never ships partial.** Every fetch helper **throws**; the route
builds all entries before writing a byte, so a failure is a 500. It used to
`break` out of the pagination loop and return what it had, which meant a timeout
on page 90 of 157 published a 200 — cached 24 hours — silently missing 6,700
URLs. URLs *disappearing* from a sitemap reads as "those pages are gone", so half
a sitemap is worse than none; Google retries a 500 and keeps trusting its copy.
`fetchAllPoems` also compares the collected count against the server's own
`total` and throws on a mismatch — a short page fails no individual request, so
nothing else can see it.

**`COMMUNITY_ORIGINS` is the one list that can silently lose a whole class.**
The list endpoint filters `origin` by equality with no "not this one", so
community is enumerated by hand (`user`, `ai`) while famous is defined
positively. `assertOriginsPartitionPoems` runs on the **community** section for
exactly that reason: add a fourth origin and famous + community stops equalling
the total, which fails the response instead of quietly omitting those poems.

**`pages` costs 136 `limit=1` probes, not a walk of every poem.** The list is
sorted `date` DESC, so row one of a genre is its newest poem and its `total`
says whether the genre has any at all — the two facts the section needs.
Deriving them by paginating the collection took 26s and 3.6MB to produce 136
dates. Presence is the map **key** and freshness its **value**: a genre whose
poems are all undated is still listed, just without a claim. Genre slugs go to
the API verbatim — the database stores genres already in slug form
(`arts-and-sciences`, not `Arts & Sciences`).

Poem pages after the first are fetched **concurrently** off the page count that
`total` gives up front (`FETCH_CONCURRENCY`, bounded by `mapWithConcurrency`).
157 sequential round-trips was ~30s of pure latency, and a fetch-everything
route that slow is one that eventually hits a platform timeout.

**The Next routing trap, which fails silently.** `pages/sitemaps/[section].xml.ts`
is the obvious spelling and it does not work: Next only treats a segment as
dynamic when the brackets span the **whole** segment, so `[section].xml` is read
as a literal directory name — `isDynamicRoute('/sitemaps/[section].xml')` is
`false`. Every child 404s while the index linking them keeps answering 200.
Hence the `.xml` → extensionless **rewrite** in `next.config.js`. It cannot be a
redirect instead: the rewrite maps back and the two would loop. The extensionless
form answers 200 as well; it is an unlinked internal alias, not a second
advertised URL.

The `<lastmod>` policy is unchanged and is pinned by
`frontend/src/__tests__/sitemap.test.ts`.

**`stale-while-revalidate` needs a value, or the whole directive is dropped.**
Both routes send `SITEMAP_CACHE_CONTROL` (one constant, so the index and the
sections cannot drift). It was sent bare, so only `public` survived to the CDN
and `poems-famous.xml` — 15,652 URLs, 157 backend round-trips to build —
regenerated on every crawl. Nothing local can see this: the header parses either
way and the XML is byte-identical, so the test asserts on the STRING and the
proof is `x-vercel-cache: HIT` with a rising `age:` on the deployed response.
The stale window deliberately outlasts `s-maxage`; when they expire together a
crawler hitting a slow backend gets the 500 the stale copy exists to prevent.

Sitemaps are also the **only** routes here safe to cache publicly — they are
identical for every visitor, while the SSR pages embed `initialUser` and would
serve one reader's signed-in header to everyone. See `TODO.md` for that
decision, which is parked behind the Search Console numbers.

## Poem of the week

`GET /api/v1/poems/poem-of-the-week` returns one famous poem plus the Monday its
week began. Famous only — filtered on the poem's own `origin: 'famous'` rather
than joined through the author, which is the same field the list endpoint uses
and avoids an `$in` over 3,300 author ids.

**The pick is derived, never stored.** A week number indexes into the famous
poems, so every visitor sees the same poem all week, it rotates on its own, and
there is no cron job, no state and nothing to back up — a stored "current pick"
would need a scheduler *and* a fallback for the week the scheduler misses.

1 Jan 1970 was a Thursday, so `Math.floor((day + 3) / 7)` is what moves the
boundary to **Monday**. Drop the `+ 3` and the poem changes mid-weekend.

Sorted by `_id` so the seek walks the `_id` index instead of sorting 15k
documents in memory. Famous poems are ~97% of the collection, so the scan rejects
almost nothing — **no extra index is worth carrying** for one query a week.

The weekly **stride** matters as much as the week number. The collection is
stored in TITLE order, so stepping one position per week served eight consecutive
"Dear ..." poems — different poets, but it reads as broken curation. Multiplying
by a large prime (`WEEK_STRIDE`) jumps thousands of entries a week, and staying
coprime with the total is what keeps it visiting every poem before repeating.

Adding famous poems shifts `index % total`, so future picks reshuffle. Accepted:
that set is effectively static, and the alternative is storing state.

The card is **desktop-only by design** — it sits under the ranking in the right
rail, which is already hidden below `$bp-xl`, so it carries no display rules of
its own. It renders **nothing** while loading, on error, or when there is no poem:
a spinner in the corner of the page costs more attention than a sidebar extra is
worth.

## Reference Docs

- `TODO.md` — the backlog (priorities, deferred decisions, recently shipped).
- `docs/NEXTJS_MIGRATION.md` — Next.js migration status.
- `docs/AI_COMMUNITY_SIMULATION.md` — AI activity seed plan + scripts.
- `docs/DATABASE_BACKUP_RESTORE.md` — backup/restore drill.
- `docs/PRODUCTION_CHECKLIST.md` — launch checklist.
- `frontend/CLEANUP.md` — frontend cleanup plan.

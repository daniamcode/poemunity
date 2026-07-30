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
  reports both directions and is strictly read-only.
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
  collection and stay silent about authorship.

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

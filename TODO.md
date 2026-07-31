# Poemunity — TODO

Single source of truth for the backlog (frontend + backend). Ordered by priority.
Deeper detail lives in the linked reference docs; this file is the curated,
actionable list.

**Legend:** 👤 = you (manual / ops / dashboard) · 🤖 = code (Claude can do) · 🤝 = both

---

## 🔴 P0 — Production go-live (blocks a real launch)

- 👤 **Rotate the MongoDB password and `RESEND_API_KEY`** (exposed 2026-07-30).
  An agent session sourced `backend/.env` in a way that made the shell echo it,
  so the **Atlas connection string including the password** and the **Resend API
  key** ended up in that session's transcript and tool logs. `.env` is gitignored
  and untracked, so nothing reached the repository and the exposure is limited to
  those logs — but both should be treated as compromised until rotated.
  1. Atlas → Database Access → edit user → Edit Password → autogenerate. Update
     `MONGODB` **and** `MONGODB_PRE` in the Vercel backend project and in local
     `.env` (they point at the same cluster — see Gotchas).
  2. Resend → API Keys → revoke and recreate. Update `RESEND_API_KEY` in Vercel
     and locally.
  While there: the current database **password is identical to the username**,
  which is worth fixing on its own merits regardless of this incident.
  **Never source `.env` from a shell** to read a value — unquoted values get
  executed and echoed. Load it through `dotenv` in a script instead.

_All other P0 launch blockers are complete._ 🎉 (email on, prod migration, deploy
verification, database backup + restore drill — see Recently shipped.)

Ongoing operational practice (not a blocker): **always take a `mongodump` snapshot
before any bulk production write** (e.g. the P1 AI seed), and enable Atlas Cloud
Backup if/when you move to a tier that supports it.

## 🟠 P1 — AI community activity (review & extend)

_A **first round is already live in prod** (seeded 2026-06-12): runs
`seed-activity-v1` (1,785 likes · 132 poem comments · 49 replies · 35 profile
comments) + `seed-activity-v1.1-likes` (+440 likes). Current totals: 50 AI
authors, ~416 AI poems, 216 AI comments, 2,225 like events. Note: `pre === prod`,
so there is **no separate env to "promote from"** — this IS the production data._

- 👤 **Review the live AI activity** — run `inspect-run.mjs` on the existing runs
  (read-only); eyeball ordering/density/plausibility. (`docs/AI_COMMUNITY_SIMULATION.md`)
- 👤 **Decide on further rounds** — keep as-is, add another activity round (more
  comments/likes/poems via the simulation scripts or `seed-ai-community.js`), or
  trim. Any new seed is a prod write: dry-run + `mongodump` snapshot first, and keep
  `rollback-run.mjs` ready (rollback is per-`runId`).

## 🟡 P2 — Launch hardening (recommended)

- 👤 **Watch the first few `E2E (Cypress)` CI runs.** The workflow
  (`.github/workflows/e2e.yml`) is in, but it has only ever been proven on a
  laptop — a cold GitHub runner compiles routes on demand and is slower and more
  contended, which is exactly where a suite that is green locally starts to
  flake. If it goes red without an app change, fix the wait/timeout rather than
  retrying, and do **not** reach for `uncaught:exception` to quiet it.

  Two things about that workflow worth not undoing:
  - It runs **`next dev`, not a production build.** In development React THROWS
    on a hydration mismatch and Cypress fails the test; a production build
    silently recovers by re-rendering client-side, so the suite would go green
    over a real bug. That is not hypothetical — it is precisely the `/profile`
    bug fixed on 2026-07-30.
  - It sets `NEXT_PUBLIC_API_URL=http://localhost:4201`. Unset, the app defaults
    to :4200, which locally is a real backend — and `create-poem.cy.ts` writes
    poems. Same rule when running it by hand:
    `NEXT_PUBLIC_API_URL=http://localhost:4201 pnpm dev`, then `npx cypress run`.

  **Caveat on "blocking":** CI still cannot block a deploy, because pushes go
  straight to `master` and Vercel deploys on push — the two race. Real gating
  needs the deferred `develop` → PR → `master` flow, where required checks
  finally have a PR to hold. Note the existing trap: required checks plus
  path-filtered workflows leave skipped jobs hanging as "Expected" forever, so
  that move needs an always-run aggregator job.

- 🤖 **Extend Cypress/E2E coverage to the features shipped since it was written.**
  The four existing specs (comments, create-poem, ranking, register) predate most
  of the current product, so whole features have **no browser coverage at all** —
  and repairing the suite just demonstrated that a browser catches a class of bug
  jest cannot: an unclickable button caused by an overlapping pseudo-element, and
  a hydration mismatch caused by invalid HTML nesting. Both passed lint,
  typecheck and ~990 jest tests. Uncovered, roughly in order of what would hurt
  most if broken:
  - **Login / logout / session** — the cookie-to-Bearer proxy path is now
    exercised incidentally by every spec, but nothing tests logging in through
    the form, logging out, or an expired/invalid token.
  - **Like a poem** — the exact bug fixed on 2026-07-30 (the heart and counter
    not updating on a `/detail/<slug>` URL). There is a jest integration test;
    a browser test would also cover the ranking refresh that rides along in the
    like response.
  - **Search** — debounce, 2-character minimum, "latest wins" when typing fast,
    and that the input keeps focus and caret mid-query (the failure mode that
    motivated keeping the search box mounted).
  - **Next poem** — that the control appears, goes somewhere, and keeps going
    across an author boundary.
  - **Poem edit and delete**, including the confirmation modal.
  - **Profile edit** — bio, picture, private fields.
  - **Password reset and email verification** — both are live in prod and
    entirely untested end to end.
  - **Poem of the week** — desktop only; a viewport-dependent feature is exactly
    what jsdom cannot see.
  - **Responsive layout checks at `$bp-xl` and just below it.** Both browser bugs
    found on 2026-07-30 lived at specific viewport widths.
  Do this **after** the suite is in CI, so new specs land against a gate that is
  already green, and keep each one meaningful: red-check it by breaking the
  implementation before trusting it.

- 🤝 **Decide what to do with the Selenium/Applitools visual suite** (`frontend/selenium/visual.spec.ts`).
  It is **not** in CI, and it should not be added as-is. Three blockers, in order:
  1. **It logs in with real credentials against `API_URL`, which defaults to
     :4200.** In CI that would mean an automated login against production on
     every push. It must be repointed at the test backend (:4201) first.
  2. **It cannot fail.** It still calls `eyes.closeAsync()`, so visual diffs never
     fail the run, and the baselines were never accepted in the Applitools
     dashboard. A job that cannot go red is worse than no job — it just trains
     people to ignore a green tick.
  3. **It needs secrets** — `APPLITOOLS_API_KEY`, `SELENIUM_USERNAME`,
     `SELENIUM_PASSWORD` as repo secrets.
  Also note its DOM assertions now **overlap Cypress**, which covers those paths
  properly. The genuinely additive part is the *visual* diffing.
  **If it goes into CI, make it `schedule:`-only, never per-push.** Visual diffs
  are very sensitive to font rendering differing between environments, so a
  weekly run someone triages beats a per-commit gate that cries wolf. The honest
  alternative is to delete the suite and rely on Cypress — decide which, rather
  than leaving it in the repo unrun.

- 🤝 **Run a security review of the whole app** — never done end to end; the
  hardening that exists (helmet, rate limiters, hashed reset tokens, non-enumerating
  login) was added feature by feature, so nobody has looked for the gaps *between*
  those features. Worth a dedicated pass rather than folding into other work.
  Concrete things to check, roughly in order of what would hurt most:
  - **Authorization, not just authentication.** Every mutating route: does it check
    that `req.userId` OWNS the poem/comment/profile it is editing or deleting, or
    only that *someone* is logged in? An IDOR here is a stranger deleting your poem.
    Same question for the admin routes — is `isAdmin` re-checked server-side on each
    request, or trusted from the token/client?
  - **Injection into Mongo queries.** Any place a request body or query string
    reaches a filter object unvalidated can smuggle operators (`{$ne: null}`,
    `{$gt: ''}`) — classic auth bypass. Also confirm the search regex is still
    escaped (it is by design — keep a test on it).
  - **XSS in user content.** Poems, comments, bios and display names are shown
    everywhere and now also travel into `<script type="application/ld+json">`
    (JsonLd escapes `<`) and into meta tags. Check the rendering paths for
    `dangerouslySetInnerHTML` and confirm nothing reflects raw input.
  - **Session and cookie posture.** httpOnly/secure/sameSite flags, JWT expiry,
    whether `passwordChangedAt` revocation covers every route, and what happens to
    a token whose author was deleted.
  - **Rate limiting coverage.** Limiters exist on login/register/password/verify —
    but not, as far as anyone has checked, on poem/comment creation or the
    availability endpoint, which are the cheap spam and enumeration surfaces.
  - **Dependency and header baseline.** `pnpm audit` in both workspaces, plus a
    look at the live response headers (helmet defaults vs what Vercel actually
    sends) and at CORS: `FRONTEND_URLS` should not be permissive in prod.
  - **Secrets handling.** `SIMULATION_INTERNAL_SECRET` bypasses the login limiter —
    confirm it is compared in constant time and cannot be probed. See also the P0
    rotation item above.
  Deliverable: a findings list with severities, then fixes as their own tasks.
  Each finding that gets fixed needs a regression test — a security fix without one
  silently un-fixes itself in six months.

- 👤 **No separate dev/staging database** — `MONGODB_PRE` is byte-for-byte identical
  to `MONGODB` (same cluster, same `poemsAPI` db). So every "pre"/dev-mode script
  writes straight to **production**, and there's nowhere safe to rehearse a seed or
  migration. Stand up a real pre/staging cluster (or at least repoint `MONGODB_PRE`
  at a throwaway DB). Until then, treat all seed/migration scripts as prod writes:
  dry-run + `mongodump` snapshot first. (Seed logic is now validated via ephemeral
  in-memory Mongo in tests instead — see `aiSeed.test.js`.)
  **Plan (deferred, not now):** create a copy of prod and point `MONGODB_PRE` at it
  so `pre` becomes a real separate environment.

- 🤝 **Applitools CI** — accept the known baselines in the Applitools dashboard (👤),
  then switch `eyes.closeAsync()` → `eyes.close()` in `frontend/selenium/visual.spec.ts`
  so visual diffs fail the run (🤖).
- 👤 **Toast QA in the browser** — comment post/reply/delete, poem like-failure,
  delete, create/save. (A regression test already guards `manageError` against
  `[object Object]`.)

## 🟣 P2.5 — Profile & social features (product roadmap, 2026-07-31)

Ordered by impact. Seeded by a competitor review (Yavendras' "Zona Privada":
tabs for Perfil / Sube Contenido / Mi Actividad / Usuarios Seguidos / Seguidores /
Notificaciones, a stats panel and a profile-completion bar) plus conventions from
Allpoetry / HelloPoetry. **Today's profile** = picture, personal fields with
per-field public/private toggles, bio, preferred genres, and two tabs (My Poems,
My Favourites). Structurally missing: no social graph anywhere in the codebase,
no notifications, and `Poem` has no `status` field — publishing is all-or-nothing.

**Cross-cutting caveat for every item here:** all of them need a schema change, and
`MONGODB_PRE` is the same cluster and database as `MONGODB`. Any backfill is a
production write — `mongodump` snapshot first, dry-run first. `autoIndex` is on in
prod, so new indexes build themselves on deploy but are never dropped when removed.

1. ✅ **Drafts — private poems before publishing.** SHIPPED (2026-07-31) — see
   Recently shipped. Remaining product decision: drafts are excluded from the
   author's public poem count, which means an author whose whole body of work is
   drafted disappears from the author index until they publish.
2. 🤝 **Follow / followers.** The reference's `Usuarios Seguidos` / `Seguidores`, and
   the thing that makes everything after it possible — there is currently no way to
   keep up with a poet you liked. A `Follow` collection (`follower`, `following`,
   compound unique index), **not** an array on `Author` (doesn't scale, can't
   paginate). Follow button on `/authors/[slug]`, counts + two tabs on the profile.
   Three product calls (👤), with recommendations: **famous poets** (~3,300)
   followable? → yes, but they never publish so it's a reading list, not a feed.
   **AI personas** followable? → yes, but keep the AI badge on every follow surface;
   following a bot is in tension with the disclosure the footer and per-poem badges
   exist to make. **Do followers affect ranking points?** → no. Currently
   `3×poems + 1×likes` in `computeRanking()`; follower counts are gameable and it
   would reshuffle everyone's rank overnight.
3. 🤖 **Notifications.** Nothing currently brings a user back to the site. The
   likes/comments half works standalone and can ship before item 2. In-app first
   (header bell + a Notifications tab), then an optional weekly email digest —
   Resend is already wired up behind `src/utils/email.js`. **Must collapse and
   batch** ("12 people liked your poem", not twelve rows) or it becomes noise;
   self-actions never notify.
4. 🤖 **Your stats panel** (cheapest win). The reference's `Mis Estadísticas`, but
   honest: poems published, likes received, rank if in the top 10 — `computeRanking()`
   already computes this server-side, so it's mostly UI. **Deliberately drop the
   day/week/month/year breakdown** from the reference: four unexplained decimals
   (`2.12`, `2.10`, `64.54`) are decoration pretending to be feedback, and would
   need time-bucketed aggregation that doesn't exist.
5. 🤖 **Pinned poem.** One `featuredPoemId` on `Author`, rendered first on the public
   author page. Poets have a piece they want read first; today the newest wins.
6. 🤖 **Activity tab** — the reference's `Mi Actividad`: merged timeline of your
   poems, comments and likes given. Mostly a query over data already stored.
   (Supersedes the older P4 note about showing commented-on poems in the profile —
   including its open question about whether the MUI tabs component handles a third
   tab well, or should be swapped for something more modern and reusable.)
7. 🤖 **Free-form tags.** Genres are a fixed `CATEGORIES` list; tags (`#grief`,
   `#sonnet`, `#villanelle`) allow discovery by form and subject. Needs guardrails or
   the namespace becomes noise: lowercase, deduped, capped per poem, autocomplete
   from existing tags.
8. 🤖 **Collections / series** (higher value later). Poets think in sequences and
   chapbooks, but this only earns its place once users have enough poems for
   grouping to matter.

**Deliberately rejected from the reference site:**
- **The "profile 45% complete" bar** — a nag that treats the user as an incomplete
  record. The underlying goal is real (author pages look empty without bio/picture),
  so instead: *one* dismissible contextual prompt on your own author page.
- **The four-way points breakdown** — see item 4.
- **`Vacío` placeholders on every empty field** — six red "Empty" labels make the
  profile read as a form you failed. Omit empty fields; show one "add details" link.

## 🟢 P3 — Frontend quality & refactors (code)

- SEO: Add a section with links to online poetry contests in english. Then write them to let them know that they are on my web, so a backlink would be appreciated
- 🤖 **Finish the TypeScript migration** — `MyPoems.jsx`, `Register.jsx`,
  `Profile.jsx`, `MyFavouritePoems.jsx`, plus util files (`parseJWT.js`,
  `notifications.js`, `sortPoems.js`, `axiosInstance.js`). (`frontend/CLEANUP.md` §1)
- 🤖 **Split `AppContext`** into `AuthContext` + a separate context so consumers
  only re-render on fields they use; remove the now-unused `elementToEdit` from the
  `Context` interface (and its ~20 test mocks). Finishes the `ListItem` memo work
  and the checklist's "AppContext re-renders all consumers" item.
- 🤖 **Duplicate links on poem list items** — accessibility/UX bug from the checklist
  (`docs/PRODUCTION_CHECKLIST.md` → Frontend UI). Verify and fix.

- 🤖 **Audit for wasted React renders; add `memo` / `useMemo` / `useCallback`
  where they earn it.** Never done systematically. Start by *measuring* — React
  DevTools Profiler with "record why each component rendered", or a temporary
  `useEffect` render counter — because the whole point is to find renders nobody
  suspected, and adding memoization by intuition usually just adds noise.
  Known-suspicious places to look first:
  - **`AppContext`** — one context object holding user, picture, isAdmin, config…
    Every consumer re-renders when any field changes, and the provider's value is
    rebuilt on each render. Splitting it is already its own item above; this is
    the measurement that would justify it.
  - **Lists** — `ListItem` is rendered once per poem on every list page. Check it
    is `memo`'d and that the `context` and handler props it receives are stable,
    or the memo does nothing.
  - **Handlers passed into memoized children** — an inline arrow prop defeats
    `memo` completely, which is the classic way this work gets undone silently.
  - **Selectors** — confirm every selector returning a new array/object is
    memoized (`createSelector`); an unmemoized one re-renders its subscriber on
    *every* store action. `poemCacheSelectors`/`authorCacheSelectors` already do
    this; new ones must too.
  Rules for this task: **memoize only what a measurement showed**, note the
  before/after in the commit, and remember `memo` has a cost of its own (a props
  comparison per render). A component that always gets new props is *slower*
  memoized. Do not blanket-wrap the codebase.

- 🤖 **Hunt for performance problems, dead code and over-complication — including
  with AI review.** No pass like this has been done. Worth doing as its own
  focused sweep rather than folded into feature work, and worth pointing an AI
  agent at with a concrete brief per area rather than "find issues", which
  produces confident noise. Suggested areas:
  - **Backend query cost** — N+1 patterns, missing/duplicate indexes
    (`check-index-drift.js` reports both directions), aggregations that could be
    a find, and the deliberately-unindexed search regex (documented in AGENTS.md
    — that one is a known, accepted trade, not a finding).
  - **Bundle size** — `@next/bundle-analyzer` on the frontend. MUI and date-fns
    are the usual suspects for accidental full-package imports.
  - **Core Web Vitals on real pages** — Lighthouse against poemunity.com, not
    localhost. Images, font loading and layout shift, especially on the dashboard.
  - **Dead code** — unused exports, components, SCSS, the legacy `User` model,
    leftovers in `frontend/CLEANUP.md`.
  - **Duplication and over-abstraction** — repeated fetch/normalise logic, hooks
    that only ever have one caller, components with more props than behaviour.
  **Ground rule: every finding needs a measurement or a concrete failure case
  before anyone changes code.** An AI will happily propose refactors that trade
  working code for churn; treat its output as a list of leads to verify, not a
  work order. Anything that changes behaviour needs a red-checked test first.

## 🔵 P4 — Maintenance & product decisions (low / when convenient)

- 🤖 **Raise test coverage** — add tests for still-untested components/utilities.
  (`frontend/CLEANUP.md` Phase 2 has the full breakdown.)
- 🤖 **Dependency & tooling upkeep** — `pnpm outdated`, update ESLint, keep
  `pnpm audit` clean. (`frontend/CLEANUP.md` Phase 3)
- 🤖 **Backend TypeScript migration** — backend is still plain JS. (checklist "Low")
- 🤝 **Public backend URL review** — is exposing `poemunity-backend.vercel.app`
  directly acceptable? Audit what's reachable.
- 👤 **Likes distribution for the simulation** — weight famous poems / themes matched
  to each AI personality.
- 👤 **Monarch idea** — what's script vs. AI-generated, and how to invoke Claude
  invisibly (as Monarch does with Copilot).

### Genre URLs & the CATEGORIES/database drift (raised 2026-07-31)

Prompted by "is `/home` a duplicate of `/`?" — **it is not**: `Home` is a real
entry in `CATEGORIES`, so `/home` is the genre page (63 poems), with its own
title, its own canonical and a sitemap entry. Nothing to fix there. The
investigation did surface three real things:

- ✅ **Fixed — genre slugs were case-insensitive duplicates.** `/Home`, `/HOME`,
  `/hOmE` all returned 200 with the same poems, each canonicalising to the URL it
  was requested on — unbounded duplicate content, every genre times every casing,
  each copy claiming to be the original. Now 308-redirects to the lowercase slug.
- ✅ **Fixed — nonsense URLs were soft 404s.** `/asdfnonsense` returned 200 with an
  "Asdfnonsense poems" heading and a self-referencing canonical, i.e. unlimited
  crawlable self-canonical pages. Now `notFound: true` — but only for slugs that
  are *also* backed by no poems (see below), so the four orphan genres survive.
- ✅ **Fixed — four genres existed in the DB but not in `CATEGORIES`.**
  `anger` (22 poems), `imagination` (51), `spirituality` (77), `sports` (18) —
  **168 poems** whose pages rendered but which were absent from the sitemap and
  unreachable from the category nav: orphaned from search. Now added to
  `CATEGORIES` (a pure frontend change; no database write).

  **Root cause, confirmed from `scripts/categorize-poems-progress.md`:** not
  scraper drift (an earlier guess, and wrong). A deliberate **140-category
  taxonomy** was designed for SEO; `categorize-poems.js` applied all 140 to the
  database ("All 15,668 DB poems now have a genre from the 140-category slug
  system"), and the doc's own mapping table lists e.g. `anger | Anger`. The list
  was then transcribed into `frontend/src/data/constants.ts` — and four entries
  never made it. One list, two copies, one lossy transcription. The count is
  now **143**, not the 136 first reported here: that number came from a parser
  that only understood single quotes and silently dropped `"Father's Day"`,
  `"Mother's Day"` and `"Valentine's Day"`.
- ✅ **Fixed — genre was never validated server-side.** `POST /poems` spreads the
  request body into a `strict: false` model, so **any client could store any
  genre string** — the dropdown constrained the UI only. `PATCH /poem/:id`
  likewise. Both now 400 on a genre outside the curated list, and accept either
  the display name or the slug (storing `Nature` beside `nature` would split one
  category in two). The AI seed pipeline validates through the same helper and
  **throws** rather than defaulting — it had been writing `p.genre` verbatim, and
  its own docblock example used Title Case while the database stores slugs.
- ✅ **Fixed — the mirrored list can no longer drift silently.** Runtime backend
  code cannot read `frontend/src/data/constants.ts` (the Vercel root is
  `backend/`), so the slugs are mirrored in `backend/src/data/categories.js` —
  the same shape of risk that caused the original bug. `categoryDrift.test.js`
  reads the real constants.ts and fails if the two disagree, and
  `.github/workflows/backend.yml` now watches `frontend/src/data/constants.ts`
  so editing the frontend list runs that check. Regenerate the mirror with
  `node backend/scripts/sync-categories.js`.

### Open after the 2026-07-31 session (drafts, genres, fonts)

- 🤖 **`POST /poems` lets the client set `likes` and `date` directly.** The handler
  spreads `...poemData` into the model and overrides only `genre`, `authorId`,
  `origin`, `status` and `slug` — **`likes` is not overridden**, and `Poem` is
  `strict: false`, so arbitrary extra fields persist too. A hand-made request
  with `likes: [...]` therefore creates a poem that already has likes, and likes
  are worth a ranking point each (`computeRanking`: `3×poems + 1×likes`), so this
  is a direct self-promotion vector into the public sidebar; `date` is likewise
  free, which moves list ordering and the next-poem walk. **Fix:** build the
  document from an explicit allowlist rather than a spread (`title`, `poem`,
  `genre`, `status` — nothing else), and force `likes: []` and a server-side
  `date`. Genre validation shipped this session closed one field of this hole;
  the rest is still open. Worth doing before the P2 security review, not as part
  of it.
- 👤 **Verify the drafts work against the live URL.** CI's `E2E (Cypress)` job
  went green on `7cf9127`, so the browser paths (including `create-poem.cy.ts`,
  which drives the form that gained "Save as draft") ARE covered, and Vercel's
  frontend build gate runs `pnpm build` — so neither needs running locally.
  What is still unverified is the deploy itself: per AGENTS.md a deploy is
  never inferred from green CI (a needed backend fallback once passed CI and
  never deployed at all). Load the live site and exercise the Drafts tab.
- 👤 **The header tagline's baseline offset is an estimate, not a measurement.**
  `top: 5px / 6px` on `.header .list__presentation` was reasoned, not measured:
  the Chrome tab was in a background window (`document.hidden`), so the browser
  skipped layout and every rect read 0. The previous 2px/3px WAS measured, but
  for EB Garamond italic — a script face puts its baseline elsewhere in the em
  box, so the old number does not transfer. Re-measure with the window in the
  foreground, or just nudge it by eye.
- 👤 **Product call — an author whose poems are all drafts vanishes from `/authors`.**
  Follows from the `HAS_POEMS` filter now excluding drafts. The alternative is a
  letter index that opens onto an empty author page. Raised by the drafts work;
  no action taken.
- 🤖 **(Low) No search box on the Drafts tab** — deliberate for now: it would need
  its own owner-scoped server query for a list that usually fits on one screen.

### Housekeeping / follow-ups raised this session

- 🤖 **Index drift — run `check-index-drift.js` after any schema-index change.**
  `autoIndex` is ON in production (`backend/mongo.js` sets no `autoIndex: false`),
  which is **asymmetric**: adding an index to a schema builds it automatically on
  deploy, but *removing* the line never drops it — the index lives on in Atlas
  forever, costing write throughput for a query no longer issued, and invisibly,
  since the code no longer mentions it. Nothing is broken today; this is a
  standing rule, and it matters now because the P2.5 features each add indexes
  (the `Follow` compound index, the drafts `status` filter). After removing an
  index from a schema, drop it explicitly.
  `node backend/scripts/check-index-drift.js` reports both directions and is
  strictly read-only. Worth a run after each P2.5 item ships.

- 🤖 **Speed up the sitemap** — `pages/sitemap.xml.ts` pages the poems API 100 at
  a time (~160 sequential calls for 16k poems → ~25 s cold generation, risking the
  serverless timeout). It's already CDN-cached (`s-maxage=86400`), so this only
  bites on a cold cache. To fix, raise the poems endpoint's `limit` cap (currently
  `Math.min(limit, 100)` in `poems.js`) so the sitemap can fetch bigger pages, or
  split into a sitemap index + per-section child sitemaps. Backend change, deferred.
- 🤖 **(Low) Authenticated "change password" endpoint + UI** — there's no logged-in
  "change password" today; the only path is Forgot → emailed reset link, which
  resolves the account by `findOne({ email })` (`password.js`). **Low priority
  because this only bites shared-inbox accounts** — i.e. the `testAccount:true`
  accounts you create on one email (real users are one-per-email, so their reset
  is unambiguous). For those shared accounts the reset only ever hits the oldest
  doc, so the others aren't reachable via the UI (use `set-account-password.js`
  meanwhile). A logged-in route keyed on `req.userId` (verify current password,
  set new hash, bump `passwordChangedAt`) + Profile UI would remove the ambiguity.
- 🤖 **(Optional) Admin UI for test accounts** — a small screen for
  `POST /api/v1/admin/test-users` instead of calling the API by hand.
- 👤 **Adopt a `develop` branch workflow (deferred)** — plan is to work from a
  `develop` branch and merge to `master` for releases, instead of committing to
  `master` directly. **Not now** — while shipping fast toward stability, direct-to-
  `master` is the intentional tradeoff. Revisit once the app is stable.
- 🤝 **(Optional) Hard backend deploy-gate** — deploy currently isn't gated on tests
  (guarded by CI-on-push instead). A true gate needs migrating the backend off the
  legacy `builds` config in `backend/vercel.json`; deferred as risky, low value.
- 👤 **Skip unaffected Vercel builds (monorepo)** — verify each Vercel project's
  **Root Directory** is set to its subfolder (`frontend/`, `backend/`) so a commit
  touching only one side redeploys only that project, and root-only changes (e.g.
  `TODO.md`) skip both. If both projects still rebuild on every push, set the Root
  Directory (or an "Ignored Build Step" `git diff` guard) to skip the unchanged side.

---

## ✅ Recently shipped (context — do not re-add)

- **Drafts — private poems before publishing** (2026-07-31, P2.5 item 1).
  `Poem.status: 'draft' | 'published'`, **defaulted, never backfilled**: the
  ~16k existing poems carry no `status` at all, and every read treats a missing
  one as published, so shipping this required no production write. Visibility is
  ONE fragment — `PUBLISHED_MATCH` / `publishedOnly()` in
  `backend/src/utils/poemVisibility.js` — composed by every public read path, an
  allowlist (`$in: ['published', null]`) rather than `$ne: 'draft'` so a status
  added later is invisible by default. `src/__tests__/drafts.test.js` enumerates
  the public endpoints in a table, so a route that forgets the filter fails a
  test instead of leaking. A **Drafts** tab on the profile (`?status=draft`,
  scoped by the SESSION, never by a query param), "Save as draft" on the create
  form, and publish/withdraw as a `PATCH { status }` that returns a recomputed
  ranking (publishing changes the author's poem count, so it changes points).

- **Cypress suite repaired: 34/34, five consecutive clean runs** (2026-07-30),
  up from 1 passing. Three root causes, none of them a stale assertion:
  the `window.Cypress` branch in `axiosInstance` that made the suite test an app
  that does not ship; an E2E environment inherited from a developer's `.env`; and
  two genuine app bugs (below). Now runs in CI as its own workflow,
  `.github/workflows/e2e.yml`.

- **Hydration mismatch on `/profile`** (2026-07-30). Every load threw "Hydration
  failed because the initial UI does not match what was rendered on the server"
  and re-rendered the whole page client-side, losing the SSR benefit. Cause:
  `TabPanel` wrapped its children in MUI `<Typography>`, which renders a `<p>` —
  and the children are the poem list: divs, sections, an `<svg>`. The HTML parser
  closes an open `<p>` when it meets flow content, so the DOM the browser built
  from the SSR html could not match the tree React was hydrating. Fixed by
  dropping the wrapper (`Typography` is for text).
  **Correction to an earlier note in this file:** invalid nesting *was* the cause.
  It had been "ruled out" by re-parsing the server HTML with `DOMParser` and
  comparing tag+class+depth against the live DOM — that comparison is worthless
  here, because by the time you run it React has already recovered by
  **client-rendering the whole page**, and a client render builds div-inside-p
  happily through the DOM API. Both trees end up identical. What actually found it
  was bisection against a 1-second Cypress probe: delete half the tree, re-run,
  repeat. `TabPanel.test.tsx` now guards the shape (no `<p>` ancestor around
  flow content) — jsdom can never catch the symptom, since it does not parse
  server HTML.

- **Comment delete "×" was unclickable on wide screens** (2026-07-30). Between
  `$bp-xl` (1200px) and ~1310px the comments section — `width: 90vw`, capped at
  800px — was wider than the poem page's centre column (~58vw once the rail and
  its counterweight take their share), so it overflowed to the right and slid
  UNDER `.poem-page::after`. That pseudo-element is the empty counterweight that
  keeps the poem centred, it paints after its siblings, and it swallowed the
  click. Nobody could delete their own comment at those widths. Fixed both ends:
  `width: min(90vw, 100%)` keeps the section inside its column, and the
  counterweight is now `pointer-events: none` because presentational space should
  never be able to take a click. **Found by `comments.cy.ts`** — lint, typecheck
  and 990 jest tests were all green through it, which is the whole argument for
  having a browser in CI.

- **Poem text cleanup** (2026-07-30): scraper artifacts removed from production —
  **1,962 titles** cleaned (trailing "Launch Audio in a New Window", raw newlines,
  double spaces), **885 bodies** and 69 titles had HTML entities decoded
  (`&amp;` 5,418 · `&gt;` 49 · `&lt;` 24), **1,433 slugs** regenerated with 14
  collisions suffixed. Old slugs live on in `Poem.slugHistory` and
  `GET /poem/:idOrSlug` falls back to them, so nothing 404s; the page
  canonicalises to the new slug. Re-runnable: `backend/scripts/clean-poem-text.js`
  is dry-run by default. The sitemap needed no change — it is generated from the
  API and picks up new slugs within its 24h CDN cache.
  **Lesson worth keeping:** the migration was canaried with `--commit --limit 1`
  first, which caught that the commit adding the `slugHistory` fallback had never
  deployed (Vercel showed the previous commit as the latest backend build). Had
  the full run gone ahead, 1,433 live URLs would have 404'd at once.

- **Next-poem index + orphan cleanup** (2026-07-30): `{ authorId: 1, date: -1,
  _id: -1 }` on `poems` was **already live** — `autoIndex` is on (`mongo.js` sets
  no `autoIndex: false`), so it built itself on deploy. The earlier TODO claiming
  it was schema-only and that autoIndex could not be relied on was wrong. The
  check also found two **orphans** left by the next-poem simplification
  (`genre_1_date_-1__id_-1`, `date_-1__id_-1`): autoIndex only ever CREATES, so
  indexes removed from a schema live on, costing writes for queries that no
  longer exist. Both dropped after a `mongodump`. `backend/scripts/check-index-drift.js`
  now reports this class of drift (read-only, never creates or drops).
  **autoIndex stays ON deliberately** — at ~16k documents builds take seconds, and
  the failure mode it guards against is a large-collection problem. The discipline
  it needs instead: when you remove an index from a schema, drop it explicitly.

- **Own comments system, replacing Disqus**: comments were once a third-party
  Disqus embed. They are now first-party end to end — `Comment` model, the
  `/api/v1/comments` routes, and `CommentsSection` on both poems and profiles —
  which is what made AI-authored comments and profile comments possible at all.
  The provider question is closed; do not reopen it.
- **Server-backed search** (2026-07-28): search was a client-side filter over the
  poems already on screen, matching **author name only** (`ListItem` returned
  `null` for non-matches), so anything past the first page was unreachable and
  infinite scroll had to be frozen while filtering to avoid fetching the whole
  dataset. Now `GET /api/v1/poems?q=` searches poem **titles and author names**
  across the collection, composed with the existing genre/origin/userId/likedBy
  filters and paginated normally. Client side: `useSearchQuery` (300ms debounce,
  2-character minimum, one AbortController per fetch) feeds `q` to all three
  search bars — dashboard/genre list, My Poems, My Favourites. `getAction` now
  accepts a `signal` and treats a cancellation as a non-event rather than an
  error. Design notes:
  - The regex is **unanchored** and therefore cannot use an index — deliberate.
    An indexable `^term` regex would only match titles *starting* with the term
    ("love" would miss "A Song of Love"), and `$text` stems whole words so the
    partial words of search-as-you-type match nothing. The upgrade path when the
    collection outgrows a scan is **Atlas Search**, not an index on this query.
  - Poem **body text is deliberately not searched** — every result becomes a
    partial-text hit that needs snippet highlighting to be scannable. Revisit
    together with highlighting.
  - The search box is **not** an ARIA combobox: there is no popup listbox, the
    results replace page content. It is a `searchbox` plus a polite `role=status`
    region announcing the result count and the minimum-length hint.

- **Fixed the flaky backend test suite** (2026-07-28): ~25% of runs failed on a
  random test with a bogus status (302/404/401) or a bare `socket hang up`.
  Root cause was **not** in our code: supertest opens a new `http.Server` per
  request via `app.listen(0)`, which binds the **wildcard** address. With
  `SO_REUSEADDR` the OS hands out an ephemeral port even though another local
  process already holds it on `127.0.0.1` (the allocator sees a different bind
  address) — then supertest points its client at `127.0.0.1:<port>` and the
  kernel routes to the *more specific* binding. The suite was literally talking
  to other apps on the machine (a stray Cypress runner answering `302 -> /__/`,
  Chrome answering `404`). `jest.setup.js` now listens **once per test file on
  loopback** and hands supertest that server, so it never opens its own. Guarded
  by `src/__tests__/test-harness.test.js`. Measured 0/30 failures after the fix
  (vs 3/12 before) with the colliding processes still running.

- **Backend lint is clean** (2026-07-27): fixed the 6 pre-existing `standard`
  errors — `poem.js` like-toggle `==`→`===` (safe: `likes` is `[String]` and the
  JWT `id` deserialises to a string, and the adjacent `indexOf` already relied on
  strict equality), unused `jwt`/`mongoose`/`user2` bindings, and a real latent bug
  in `migrate-to-authors.js` where a duplicate `$ne` key (`{ $ne: null, $ne: '' }`)
  silently dropped the null check — now `$nin: [null, '']`.

- **Backend lint gated in CI** (2026-07-28): both workflows now run `pnpm lint` in the
  backend job before tests. Backend scripts were realigned with the frontend convention
  — `lint` **checks**, `lint:fix` auto-fixes — because the old `lint` was
  `standard --fix`, which in CI would have silently repaired errors in the runner and
  passed a hollow gate. Verified: the step exits non-zero on bad code and leaves the file
  unmodified.

- Email/auth: transactional email infra (Resend), password reset (forgot + reset),
  email verification + admin test accounts (`POST /api/v1/admin/test-users`),
  `passwordChangedAt` session revocation on reset.
- **Email turned on in prod** (2026-07-27): Resend domain verified + keys set;
  confirmed by receiving a live send. Sending pipeline is active.
- **Prod deployment verified** (2026-07-27): SSR pages, static assets (new logo +
  og-image), backend API, CORS (allows apex, rejects others), Vercel env vars, and
  login all confirmed live. og:image made absolute so social cards render.
- **Database backup + restore drill** (2026-07-27): full prod `mongodump` archived
  off-repo; verified it restores cleanly into an ephemeral MongoDB with all six
  collection counts matching prod. Backup is proven restorable.
- **`REQUIRE_EMAIL_VERIFICATION=true` in prod** (2026-07-27): publishing/commenting
  now require a verified email. Verified end-to-end — an unverified account is
  blocked from `POST /poems` with `403 EMAIL_UNVERIFIED`. AI seed is unaffected
  (it writes via direct DB, not the gated routes).
- **Admin bypasses the publish gate** (2026-07-27): `requireVerified` now exempts
  the admin (`REACT_APP_ADMIN`), and the admin account `daniamcode` was marked
  `emailVerified:true` in prod (it was the lone unverified real user). Code + test.
- **Single-step AI generator** (2026-07-27): `scripts/lib/aiSeed.js` +
  `scripts/seed-ai-community.js` create schema-correct AI authors/poems in one
  place (idempotent, email-uniqueness-safe, dry-run by default); 7 regression
  tests. `add-ai-personalities.js` now also stamps `emailVerified`/`testAccount`,
  and all 50 existing AI authors were backfilled `emailVerified:true`.
- **Prod email migration run** (`verify-existing-users.js`, 2026-07-27): backfilled
  11 users `emailVerified:true` + 3,370 authors `testAccount:false`, and rebuilt
  `email_1` as the partial **unique** index (`{ email exists, testAccount:false }`).
  Real-account email uniqueness is now enforced at the DB level (closing the
  concurrent-signup race) and the multi-account-per-email exemption is live.
  Pre-migration backup archived off-repo via `mongodump`.
- Ranking sidebar drift fix (server returns fresh ranking in mutation responses).
- E2E registration flow test (`frontend/cypress/e2e/register.cy.ts`).
- CI: backend installs with `pnpm --frozen-lockfile` (dropped `package-lock.json`),
  so lockfile drift fails CI before deploy; removed dead `buildCommand` from
  `backend/vercel.json`.
- Branch protection on `master`: force-push + deletion blocked (no PRs required).
- `ListItem` context memoization, responsive display typography via `clamp()`,
  `manageError` toast guard.
- Brand refresh: header now uses the `lg-1` wordmark image (`public/poemunity-logo.png`);
  favicon/PWA icon set + `og-image.png` recolored to the wordmark red `#e90913`.
  Also fixed a latent bug — `og-image.png` was caught by the blanket `*.png`
  gitignore and had never actually deployed (social card 404'd); now whitelisted.
- `backend/scripts/set-account-password.js` — securely set an account's password
  from a hidden terminal prompt (for accounts unreachable via the email reset flow,
  e.g. test accounts sharing an inbox).
- Absolute `og:image`/`twitter:image` in `SeoHead.tsx` (relative paths are ignored
  by social scrapers, so the card rendered blank) + regression test. Stopped
  tracking `frontend/tsconfig.tsbuildinfo` (incremental-build cache; now gitignored).

## 📚 Reference docs

- `frontend/CLEANUP.md` — full frontend cleanup plan (testing, deps, refactors).
- `docs/PRODUCTION_CHECKLIST.md` — launch checklist (mostly complete).
- `docs/NEXTJS_MIGRATION.md` — Next.js migration status (Phase 8 = prod deploy verify).
- `docs/AI_COMMUNITY_SIMULATION.md` — AI activity seed plan + scripts.
- `docs/DATABASE_BACKUP_RESTORE.md` — Atlas backup/restore drill.
- `docs/EMAIL_AUTH_PLAN.md` — email/auth design (local-only, gitignored).
- `backend/scripts/*-plan.md`, `*-progress.md` — historical migration notes.

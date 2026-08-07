# Poemunity — TODO

Single source of truth for the backlog (frontend + backend). Ordered by priority. Deeper detail lives in the linked reference docs; this file is the curated, actionable list.

**Legend:** 👤 = you (manual / ops / dashboard) · 🤖 = code (Claude can do) · 🤝 = both

---

## 🔴 P0 — Production go-live (blocks a real launch)

- 👤 **Rotate the MongoDB password and `RESEND_API_KEY`** (exposed 2026-07-30). An agent session sourced `backend/.env` in a way that made the shell echo it, so the **Atlas connection string including the password** and the **Resend API key** ended up in that session's transcript and tool logs. `.env` is gitignored and untracked, so nothing reached the repository and the exposure is limited to those logs — but both should be treated as compromised until rotated.
  1. Atlas → Database Access → edit user → Edit Password → autogenerate. Update `MONGODB` **and** `MONGODB_PRE` in the Vercel backend project and in local `.env` (they point at the same cluster — see Gotchas).
  2. Resend → API Keys → revoke and recreate. Update `RESEND_API_KEY` in Vercel and locally.

  While there: the current database **password is identical to the username**, which is worth fixing on its own merits regardless of this incident. **Never source `.env` from a shell** to read a value — unquoted values get executed and echoed. Load it through `dotenv` in a script instead.

_All other P0 launch blockers are complete._ 🎉 (email on, prod migration, deploy verification, database backup + restore drill — see Recently shipped.)

Ongoing operational practice (not a blocker): **always take a `mongodump` snapshot before any bulk production write** (e.g. the P1 AI seed), and enable Atlas Cloud Backup if/when you move to a tier that supports it.

## 🟠 P1 — AI community activity (review & extend)

_A **first round is already live in prod** (seeded 2026-06-12): runs `seed-activity-v1` (1,785 likes · 132 poem comments · 49 replies · 35 profile comments) + `seed-activity-v1.1-likes` (+440 likes). Current totals: 50 AI authors, ~416 AI poems, 216 AI comments, 2,225 like events. Note: `pre === prod`, so there is **no separate env to "promote from"** — this IS the production data._

- 👤 **Review the live AI activity** — run `inspect-run.mjs` on the existing runs (read-only); eyeball ordering/density/plausibility. (`docs/AI_COMMUNITY_SIMULATION.md`)
- 👤 **Decide on further rounds** — keep as-is, add another activity round (more comments/likes/poems via the simulation scripts or `seed-ai-community.js`), or trim. Any new seed is a prod write: dry-run + `mongodump` snapshot first, and keep `rollback-run.mjs` ready (rollback is per-`runId`).

## 🟡 P2 — Launch hardening (recommended)

- 👤 **Watch the first few `E2E (Cypress)` CI runs.** The workflow (`.github/workflows/e2e.yml`) is in, but it has only ever been proven on a laptop — a cold GitHub runner compiles routes on demand and is slower and more contended, which is exactly where a suite that is green locally starts to flake. If it goes red without an app change, fix the wait/timeout rather than retrying, and do **not** reach for `uncaught:exception` to quiet it.

Two things about that workflow worth not undoing:
  - It runs **`next dev`, not a production build.** In development React THROWS on a hydration mismatch and Cypress fails the test; a production build silently recovers by re-rendering client-side, so the suite would go green over a real bug. That is not hypothetical — it is precisely the `/profile` bug fixed on 2026-07-30.
  - It sets `NEXT_PUBLIC_API_URL=http://localhost:4201`. Unset, the app defaults to :4200, which locally is a real backend — and `create-poem.cy.ts` writes poems. Same rule when running it by hand: `NEXT_PUBLIC_API_URL=http://localhost:4201 pnpm dev`, then `npx cypress run`.

**Caveat on "blocking":** CI still cannot block a deploy, because pushes go straight to `master` and Vercel deploys on push — the two race. Real gating needs the deferred `develop` → PR → `master` flow, where required checks finally have a PR to hold. Note the existing trap: required checks plus path-filtered workflows leave skipped jobs hanging as "Expected" forever, so that move needs an always-run aggregator job.

- 🤖 **Extend Cypress/E2E coverage to the features shipped since it was written.** The four existing specs (comments, create-poem, ranking, register) predate most of the current product, so whole features have **no browser coverage at all** — and repairing the suite just demonstrated that a browser catches a class of bug jest cannot: an unclickable button caused by an overlapping pseudo-element, and a hydration mismatch caused by invalid HTML nesting. Both passed lint, typecheck and ~990 jest tests. Uncovered, roughly in order of what would hurt most if broken:
  - **Login / logout / session** — the cookie-to-Bearer proxy path is now exercised incidentally by every spec, but nothing tests logging in through the form, logging out, or an expired/invalid token.
  - **Like a poem** — the exact bug fixed on 2026-07-30 (the heart and counter not updating on a `/detail/<slug>` URL). There is a jest integration test; a browser test would also cover the ranking refresh that rides along in the like response.
  - **Search** — debounce, 2-character minimum, "latest wins" when typing fast, and that the input keeps focus and caret mid-query (the failure mode that motivated keeping the search box mounted).
  - **Next poem** — that the control appears, goes somewhere, and keeps going across an author boundary.
  - **Poem edit and delete**, including the confirmation modal.
  - **Profile edit** — bio, picture, private fields.
  - **Password reset and email verification** — both are live in prod and entirely untested end to end.
  - **Poem of the week** — desktop only; a viewport-dependent feature is exactly what jsdom cannot see.
  - **Responsive layout checks at `$bp-xl` and just below it.** Both browser bugs found on 2026-07-30 lived at specific viewport widths.

  Do this **after** the suite is in CI, so new specs land against a gate that is already green, and keep each one meaningful: red-check it by breaking the implementation before trusting it.

- 🤝 **Decide what to do with the Selenium/Applitools visual suite** (`frontend/selenium/visual.spec.ts`). It is **not** in CI, and it should not be added as-is. Three blockers, in order:
  1. **It logs in with real credentials against `API_URL`, which defaults to :4200.** In CI that would mean an automated login against production on every push. It must be repointed at the test backend (:4201) first.
  2. **It cannot fail.** It still calls `eyes.closeAsync()`, so visual diffs never fail the run, and the baselines were never accepted in the Applitools dashboard. A job that cannot go red is worse than no job — it just trains people to ignore a green tick.
  3. **It needs secrets** — `APPLITOOLS_API_KEY`, `SELENIUM_USERNAME`, `SELENIUM_PASSWORD` as repo secrets.

  Also note its DOM assertions now **overlap Cypress**, which covers those paths properly. The genuinely additive part is the *visual* diffing. **If it goes into CI, make it `schedule:`-only, never per-push.** Visual diffs are very sensitive to font rendering differing between environments, so a weekly run someone triages beats a per-commit gate that cries wolf. The honest alternative is to delete the suite and rely on Cypress — decide which, rather than leaving it in the repo unrun.

- 🤝 **Run a security review of the whole app** — never done end to end; the hardening that exists (helmet, rate limiters, hashed reset tokens, non-enumerating login) was added feature by feature, so nobody has looked for the gaps *between* those features. Worth a dedicated pass rather than folding into other work. Concrete things to check, roughly in order of what would hurt most:
  - **Authorization, not just authentication.** Every mutating route: does it check that `req.userId` OWNS the poem/comment/profile it is editing or deleting, or only that *someone* is logged in? An IDOR here is a stranger deleting your poem. Same question for the admin routes — is `isAdmin` re-checked server-side on each request, or trusted from the token/client?
  - **Injection into Mongo queries.** Any place a request body or query string reaches a filter object unvalidated can smuggle operators (`{$ne: null}`, `{$gt: ''}`) — classic auth bypass. Also confirm the search regex is still escaped (it is by design — keep a test on it).
  - **XSS in user content.** Poems, comments, bios and display names are shown everywhere and now also travel into `<script type="application/ld+json">` (JsonLd escapes `<`) and into meta tags. Check the rendering paths for `dangerouslySetInnerHTML` and confirm nothing reflects raw input.
  - **Session and cookie posture.** httpOnly/secure/sameSite flags, JWT expiry, whether `passwordChangedAt` revocation covers every route, and what happens to a token whose author was deleted.
  - **Rate limiting coverage.** Limiters exist on login/register/password/verify — but not, as far as anyone has checked, on poem/comment creation or the availability endpoint, which are the cheap spam and enumeration surfaces.
  - **Dependency and header baseline.** `pnpm audit` in both workspaces, plus a look at the live response headers (helmet defaults vs what Vercel actually sends) and at CORS: `FRONTEND_URLS` should not be permissive in prod.
  - **Secrets handling.** `SIMULATION_INTERNAL_SECRET` bypasses the login limiter — confirm it is compared in constant time and cannot be probed. See also the P0 rotation item above.

  Deliverable: a findings list with severities, then fixes as their own tasks. Each finding that gets fixed needs a regression test — a security fix without one silently un-fixes itself in six months.

- 👤 **No separate dev/staging database** — `MONGODB_PRE` is byte-for-byte identical to `MONGODB` (same cluster, same `poemsAPI` db). So every "pre"/dev-mode script writes straight to **production**, and there's nowhere safe to rehearse a seed or migration. Stand up a real pre/staging cluster (or at least repoint `MONGODB_PRE` at a throwaway DB). Until then, treat all seed/migration scripts as prod writes: dry-run + `mongodump` snapshot first. (Seed logic is now validated via ephemeral in-memory Mongo in tests instead — see `aiSeed.test.js`.) **Plan (deferred, not now):** create a copy of prod and point `MONGODB_PRE` at it so `pre` becomes a real separate environment.

- 🤝 **Applitools CI** — accept the known baselines in the Applitools dashboard (👤), then switch `eyes.closeAsync()` → `eyes.close()` in `frontend/selenium/visual.spec.ts` so visual diffs fail the run (🤖).
- 👤 **Toast QA in the browser** — comment post/reply/delete, poem like-failure, delete, create/save. (A regression test already guards `manageError` against `[object Object]`.)

## 🟣 P2.5 — Profile & social features (product roadmap, 2026-07-31)

Ordered by impact. Seeded by a competitor review (Yavendras' "Zona Privada": tabs for Perfil / Sube Contenido / Mi Actividad / Usuarios Seguidos / Seguidores / Notificaciones, a stats panel and a profile-completion bar) plus conventions from Allpoetry / HelloPoetry. **Today's profile** = picture, personal fields with per-field public/private toggles, bio, preferred genres, and two tabs (My Poems, My Favourites). Structurally missing: no social graph anywhere in the codebase, no notifications, and `Poem` has no `status` field — publishing is all-or-nothing.

**Cross-cutting caveat for every item here:** all of them need a schema change, and `MONGODB_PRE` is the same cluster and database as `MONGODB`. Any backfill is a production write — `mongodump` snapshot first, dry-run first. `autoIndex` is on in prod, so new indexes build themselves on deploy but are never dropped when removed.

1. ✅ **Drafts** (2026-07-31). Open product decision: an author whose whole body of work is drafted disappears from the author index until they publish.
2. ✅ **Follow / followers** (2026-07-31). All three product calls went as recommended — everyone followable, AI badge on every follow surface, ranking formula untouched at the time.
3. ✅ **Notifications** (2026-07-31, fixed and extended 2026-08-04). **Six types**: like, comment, profileComment, reply, follow, newPoem — the last two of those were added on 2026-08-04 after both turned out to notify nobody at all. In-app only; **no tab for it**, deliberately — the bell's panel already is the surface, and preferences open from a button beside "Edit profile".
4. ✅ **Your stats panel** (2026-08-04). Poems, likes, and rank when in the top 10.
5. 🤖 **Pinned poem.** One `featuredPoemId` on `Author`, rendered first on the public author page. Poets have a piece they want read first; today the newest wins.
6. ✅ **"My comments" tab, Written + Received** (2026-08-04), **narrowed from "Activity"**. Received covers three sources — comments on your poems, comments on your author page, and **replies to you anywhere**, which was reachable nowhere before. A toggle inside the tab, not a seventh tab. The original item wanted a merged timeline of your poems, comments and likes — but poems and likes already have their own tabs, so that would repeat two tabs to deliver one capability. Comments were the only unreachable part. If a chronological cross-type feed is ever genuinely wanted, it is a NEW decision, not this item being finished.

7. 🤖 **Free-form tags.** Genres are a fixed `CATEGORIES` list; tags (`#grief`, `#sonnet`, `#villanelle`) allow discovery by form and subject. Needs guardrails or the namespace becomes noise: lowercase, deduped, capped per poem, autocomplete from existing tags.
8. 🤖 **Collections / series** (higher value later). Poets think in sequences and chapbooks, but this only earns its place once users have enough poems for grouping to matter.

**Deliberately rejected from the reference site:**
- **The "profile 45% complete" bar** — a nag that treats the user as an incomplete record. The underlying goal is real (author pages look empty without bio/picture), so instead: *one* dismissible contextual prompt on your own author page.
- **The four-way points breakdown** — see item 4.
- **`Vacío` placeholders on every empty field** — six red "Empty" labels make the profile read as a form you failed. Omit empty fields; show one "add details" link.

## 🟢 P3 — Frontend quality & refactors (code)

- 🤝 **Backlinks / off-site SEO (raised 2026-08-04).** Ordered by what is actually worth the effort. **First, the constraint that decides where to point any of this:** ~16,000 of the poems here are famous ones that exist verbatim on hundreds of other sites, so those pages cannot rank however many links they get — the content is not unique. Aim every link at what only Poemunity has: community poems, author pages, and the AI experiment.
  - 🤝 **Write up the AI-poets experiment.** The highest-value item, and it is writing rather than SEO work: "I seeded a poetry community with 50 labelled AI poets — here's what happened" is a story a small tech or writing newsletter would cover, and it is genuinely novel. Everything else on this list is a link; this one is a reason for somebody to link.
  - 🤝 **Poetry contest / resource page** (the original note). Add a section listing online poetry contests in English, then tell those sites they are featured. It works because it gives them something first, which is the only reliable form of outreach.
  - 👤 **Own profiles** — GitHub, personal site, Bluesky/Twitter bio, Reddit profile. Low weight but legitimate and immediate.
  - 👤 **Poetry communities** (`r/OCPoetry`, `r/poetry`, poetry Discords) — only with genuine participation. A drive-by link gets removed and can get the account banned, which costs more than the link was worth.
  - ⛔ **Not worth doing:** directory submissions, comment links, paid "free backlink" services. Search engines discount them and some are actively harmful.
- 🤖 **Finish the TypeScript migration** — `MyPoems.jsx`, `Register.jsx`, `Profile.jsx`, `MyFavouritePoems.jsx`, plus util files (`parseJWT.js`, `notifications.js`, `sortPoems.js`, `axiosInstance.js`). (`frontend/CLEANUP.md` §1)
- ✅ **`elementToEdit` removed from `AppContext`** (2026-08-04) — it was dead: `useProfileForm` reads it from the URL query param, never from context. Gone from the interface, the provider and 23 test mocks. **The context SPLIT was investigated and deliberately not done**, per this section's own ground rule that a finding needs a measurement first: the provider's value is the state object itself, not an inline literal, so its identity changes only when `setState` is called — and `setState` has exactly three callers (saving profile info, changing the picture, logging out). That is roughly three re-renders per session, against a refactor touching ~40 consumers. Revisit only if something starts calling `setState` frequently.
- 🤖 **Duplicate links on poem list items** — accessibility/UX bug from the checklist (`docs/PRODUCTION_CHECKLIST.md` → Frontend UI). Verify and fix.

- 🤖 **Audit for wasted React renders; add `memo` / `useMemo` / `useCallback` where they earn it.** Never done systematically. Start by *measuring* — React DevTools Profiler with "record why each component rendered", or a temporary `useEffect` render counter — because the whole point is to find renders nobody suspected, and adding memoization by intuition usually just adds noise. Known-suspicious places to look first:
  - **`AppContext`** — one context object holding user, picture, isAdmin, config… Every consumer re-renders when any field changes, and the provider's value is rebuilt on each render. Splitting it is already its own item above; this is the measurement that would justify it.
  - **Lists** — `ListItem` is rendered once per poem on every list page. Check it is `memo`'d and that the `context` and handler props it receives are stable, or the memo does nothing.
  - **Handlers passed into memoized children** — an inline arrow prop defeats `memo` completely, which is the classic way this work gets undone silently.
  - **Selectors** — confirm every selector returning a new array/object is memoized (`createSelector`); an unmemoized one re-renders its subscriber on *every* store action. `poemCacheSelectors`/`authorCacheSelectors` already do this; new ones must too.

  Rules for this task: **memoize only what a measurement showed**, note the before/after in the commit, and remember `memo` has a cost of its own (a props comparison per render). A component that always gets new props is *slower* memoized. Do not blanket-wrap the codebase.

- 🤖 **Hunt for performance problems, dead code and over-complication — including with AI review.** No pass like this has been done. Worth doing as its own focused sweep rather than folded into feature work, and worth pointing an AI agent at with a concrete brief per area rather than "find issues", which produces confident noise. Suggested areas:
  - **Backend query cost** — N+1 patterns, missing/duplicate indexes (`check-index-drift.js` reports both directions), aggregations that could be a find, and the deliberately-unindexed search regex (documented in AGENTS.md — that one is a known, accepted trade, not a finding).
  - **Bundle size** — `@next/bundle-analyzer` on the frontend. MUI and date-fns are the usual suspects for accidental full-package imports.
  - **Core Web Vitals on real pages** — Lighthouse against poemunity.com, not localhost. Images, font loading and layout shift, especially on the dashboard.
  - **Dead code** — unused exports, components, SCSS, the legacy `User` model, leftovers in `frontend/CLEANUP.md`.
  - **Duplication and over-abstraction** — repeated fetch/normalise logic, hooks that only ever have one caller, components with more props than behaviour.

  **Ground rule: every finding needs a measurement or a concrete failure case before anyone changes code.** An AI will happily propose refactors that trade working code for churn; treat its output as a list of leads to verify, not a work order. Anything that changes behaviour needs a red-checked test first.

## 🔵 P4 — Maintenance & product decisions (low / when convenient)

- 🤖 **Raise test coverage** — add tests for still-untested components/utilities. (`frontend/CLEANUP.md` Phase 2 has the full breakdown.)
- 🤖 **Dependency & tooling upkeep** — `pnpm outdated`, update ESLint, keep `pnpm audit` clean. (`frontend/CLEANUP.md` Phase 3)
- 🤖 **Backend TypeScript migration** — backend is still plain JS. (checklist "Low")
- 🤝 **Public backend URL review** — is exposing `poemunity-backend.vercel.app` directly acceptable? Audit what's reachable.
- 👤 **Likes distribution for the simulation** — weight famous poems / themes matched to each AI personality.
- 👤 **Monarch idea** — what's script vs. AI-generated, and how to invoke Claude invisibly (as Monarch does with Copilot).

### Genre URLs & the CATEGORIES/database drift (raised 2026-07-31)

- ✅ **Fixed — genre slugs were case-insensitive duplicates.** `/Home`, `/HOME`, `/hOmE` all returned 200 with the same poems, each canonicalising to the URL it was requested on — unbounded duplicate content, every genre times every casing, each copy claiming to be the original. Now 308-redirects to the lowercase slug.
- ✅ **Fixed — nonsense URLs were soft 404s.** `/asdfnonsense` returned 200 with an "Asdfnonsense poems" heading and a self-referencing canonical, i.e. unlimited crawlable self-canonical pages. Now `notFound: true` — but only for slugs that are *also* backed by no poems (see below), so the four orphan genres survive.
- ✅ **Fixed — four genres existed in the DB but not in `CATEGORIES`.** `anger` (22 poems), `imagination` (51), `spirituality` (77), `sports` (18) — **168 poems** whose pages rendered but which were absent from the sitemap and unreachable from the category nav: orphaned from search. Now added to `CATEGORIES` (a pure frontend change; no database write).

**Root cause, confirmed from `scripts/categorize-poems-progress.md`:** not scraper drift (an earlier guess, and wrong). A deliberate **140-category taxonomy** was designed for SEO; `categorize-poems.js` applied all 140 to the database ("All 15,668 DB poems now have a genre from the 140-category slug system"), and the doc's own mapping table lists e.g. `anger | Anger`. The list was then transcribed into `frontend/src/data/constants.ts` — and four entries never made it. One list, two copies, one lossy transcription. The count is now **143**, not the 136 first reported here: that number came from a parser that only understood single quotes and silently dropped `"Father's Day"`, `"Mother's Day"` and `"Valentine's Day"`.
- ✅ **Fixed — genre was never validated server-side.** `POST /poems` spreads the request body into a `strict: false` model, so **any client could store any genre string** — the dropdown constrained the UI only. `PATCH /poem/:id` likewise. Both now 400 on a genre outside the curated list, and accept either the display name or the slug (storing `Nature` beside `nature` would split one category in two). The AI seed pipeline validates through the same helper and **throws** rather than defaulting — it had been writing `p.genre` verbatim, and its own docblock example used Title Case while the database stores slugs.
- ✅ **Fixed — the mirrored list can no longer drift silently.** Runtime backend code cannot read `frontend/src/data/constants.ts` (the Vercel root is `backend/`), so the slugs are mirrored in `backend/src/data/categories.js` — the same shape of risk that caused the original bug. `categoryDrift.test.js` reads the real constants.ts and fails if the two disagree, and `.github/workflows/backend.yml` now watches `frontend/src/data/constants.ts` so editing the frontend list runs that check. Regenerate the mirror with `node backend/scripts/sync-categories.js`.

### Open after the 2026-07-31 session (drafts, genres, fonts)

- 🤖 **No Cypress coverage for follow.** The whole feature is unit-tested but has never run in a browser, and the one bug that reached the screen — the follow row sitting hard left under a centred name — was invisible to 1079 passing tests, because `text-align` does not reach a flex container's items. That is the standing lesson in AGENTS.md ("layout needs a browser"), and follow is now the largest surface with no e2e spec. Worth one: follow a poet, see the count change, find them in the Following tab, unfollow.
- 🤖 **Audit the remaining dynamic routes for soft 404s.** `/[genre]`, `/detail/[poemId]` and `/authors/[slug]` now answer 404 via `serverFetchResult` (status-based, so a backend blip cannot 404 the whole site). Nothing else was checked. Any page whose `getServerSideProps` swallows a failure into `null` and renders a shell is the same bug — worth one pass over `pages/` to confirm the list is complete.

- ✅ **Fixed — the poem write endpoints no longer take the client's word for server-owned fields.** `POST /poems` spread `...poemData` into a `strict: false` model and overrode only `genre`/`authorId`/`origin`/`status`/ `slug`, so `likes` and `date` were the client's to set; `PATCH /poem/:id` had an allowlist, but it *included* `likes`, `date`, `origin` and `userId`, and editing is owner-gated — so the same hole existed one hop later. Likes are worth a ranking point each (`3×poems + 1×likes`), which made both routes a one-request path into the public sidebar ranking. Create now builds the document from an **explicit allowlist**, and PATCH's list narrows to `poem`/`title`/`genre`/`status`. `date`, `likes`, `origin` and `userId` become **admin-only** on both routes rather than disappearing — the admin seeds and backdates fake-poet content from the same form, and the `userId` override was already admin-gated. `buildPoemData` stops sending them for an ordinary poet, because the edit success handler merges the *posted* fields into the Redux entity and would otherwise show values the database never stored. `poemFieldAllowlist.test.js` sends a hostile payload and asserts on what was **persisted**, not on the status code — both routes answer 200/201 either way, which is how this survived a green suite. 9 of its 14 tests fail against the old code.
- 👤 **Verify the drafts work against the live URL.** CI's `E2E (Cypress)` job went green on `7cf9127`, so the browser paths (including `create-poem.cy.ts`, which drives the form that gained "Save as draft") ARE covered, and Vercel's frontend build gate runs `pnpm build` — so neither needs running locally. What is still unverified is the deploy itself: per AGENTS.md a deploy is never inferred from green CI (a needed backend fallback once passed CI and never deployed at all). Load the live site and exercise the Drafts tab.
- 👤 **The header tagline's baseline offset is an estimate, not a measurement.** `top: 5px / 6px` on `.header .list__presentation` was reasoned, not measured: the Chrome tab was in a background window (`document.hidden`), so the browser skipped layout and every rect read 0. The previous 2px/3px WAS measured, but for EB Garamond italic — a script face puts its baseline elsewhere in the em box, so the old number does not transfer. Re-measure with the window in the foreground, or just nudge it by eye.
- 👤 **Product call — an author whose poems are all drafts vanishes from `/authors`.** Follows from the `HAS_POEMS` filter now excluding drafts. The alternative is a letter index that opens onto an empty author page. Raised by the drafts work; no action taken.
- ✅ **Done — the Drafts tab has a search box.** The stated reason for leaving it out ("it would need its own owner-scoped server query") turned out not to hold: `GET /poems?status=draft` already composes `?q=` under `$and` like any other list, and the session scoping is applied *last*, so it cannot be widened by a query param. No backend change at all — `MyDrafts` now uses the same `useSearchQuery` policy as the other three bars. It deliberately sends **no `userId`** (the server ignores one here, and sending it would read as though client-supplied scope were what keeps a private list private), and an empty result under a query says "no results" rather than "you have no drafts".

### Eleven categories hold no poems (found 2026-08-04)

- 👤 **Decide what these eleven are for.** `broken-heart`, `easter`, `fathers-day`, `graduation`, `mothers-day`, `success`, `sun`, `sympathy`, `teacher`, `valentines-day`, `wedding` — every other category in `CATEGORIES` has at least one poem; these have none. Three options, and it is a product call, not a technical one: **seed them** (the occasion ones — Easter, Mother's Day, Valentine's, Wedding, Graduation — are exactly the queries people search seasonally, so they are the most valuable empty pages on the site); **drop them** from `CATEGORIES`, which shortens a 136-item list nobody reads to the end of; or **leave them** as aspirational buckets. Note the famous-poem corpus was scraped with its own topic vocabulary, which is why the occasion categories are empty while `nature` has 1,630 — nobody tagged a scraped poem "Graduation".

- ✅ **Already handled, so this is not urgent** (2026-08-04): those pages are `noindex,follow` while empty and are no longer listed in the sitemap, so Google is not being sent to crawl eleven headings with nothing under them. Both reverse themselves automatically the moment a category gets its first poem — nothing to remember and nothing to undo. Whichever option is chosen above, neither needs unpicking first.

### Auth hardening follow-ups (raised 2026-08-04, after the serverApi fix)

- 🤖 **`middleware.ts` gates protected routes on cookie PRESENCE only.** A forged or expired token therefore gets past the middleware and reaches the page, which now correctly renders signed-out (see the `serverApi` fix) — but the redirect to `/login` never fires, so `/profile` renders an empty shell instead of sending you to log in. Cosmetic today, not a leak. The fix is not "verify the JWT in middleware": the signing secret lives on the backend and copying it into the frontend to satisfy a redirect would be a worse trade than the bug. Either accept the shell, or have the page itself return `redirect: { destination: '/login' }` when `fetchServerUser` comes back null.

- 🤖 **`buildServerUser` and `decodeServerToken` are exported but used nowhere outside `serverApi.ts`.** `buildServerUser` returns UNVERIFIED identity by construction — that is the whole reason it hardcodes `isAdmin: false` — so a future caller importing it directly is the exact shape of the bug just fixed. Stop exporting them, or rename to say so (`buildUnverifiedUserFromToken`). Cheap, and it removes the trap rather than documenting it.

### Verification debt (raised 2026-08-03/04)

- 🤖 **Cypress specs for notifications and follow.** Neither feature has ever run in a browser — both are covered only by unit and API tests, which is precisely the gap that produced the misaligned follow row. Specs worth having, in order: **notifications** — sign in as a poet, have a second account like their poem, reload, assert the bell shows a badge; open the panel and assert the row text and that the badge clears; assert the row links to the poem; toggle a preference off and assert no new badge. **follow** — follow from an author page, assert the count increments and the button flips, reload and assert it persisted, unfollow. Two things to respect: the suite runs `next dev` (not a production build) so hydration mismatches actually throw, and it must point at `NEXT_PUBLIC_API_URL=http://localhost:4201` — :4200 is a real backend and the specs write data. Note the bell fetches its count **once on mount**, so a spec that expects the badge to update without a reload will fail correctly.

- 👤 **Verify the recent deploys against the live URL.** `d3adb85` (notifications UI), `8283b88` (notification fan-out + index) and `8d113ba` (author listing aggregation) are all CI-green and none has been looked at in production. `8d113ba` is the one that matters most: it changed a **public read path** — `/authors` and `/authors/letters` now count poems through a different aggregation, so confirm the real 3,300-author collection returns the same letters and counts it did before.

- 🤖 **Drop the redundant `recipient_1` index** — the schema change shipped in `8283b88`, so nothing recreates it, but `autoIndex` only ever CREATES and the index built in Atlas is still there, costing a write on every notification insert and collapse. `node backend/scripts/check-index-drift.js` will now report it as orphaned; `node backend/scripts/drop-redundant-notification-index.js` (dry-run by default, `--apply` to act) drops it. `mongodump` first — same rule as every script here. The same run also confirms the 3 follow + 2 notification indexes actually built in Atlas, which has not been checked since either feature shipped.

- 🤖 **Standing rule: green CI is not a deploy.** Worth stating here because it keeps being assumed otherwise. Pushes go straight to `master` and Vercel deploys on push, so CI and the deploy **race** — CI cannot block a bad deploy, it can only tell you afterwards. The backend is not gated on tests at all (`backend/vercel.json` only routes traffic). And each app builds only when its own directory changes, so a commit touching only root files deploys neither. This has bitten before: a commit adding a needed backend fallback never deployed despite green CI. **A feature is verified when it has been seen working on the live URL, never when CI is green.** The real fix is the deploy-gate item below, which stays deferred.

### Raised 2026-08-04 (notifications, stats, perf)

- 🤖 **A read notification is never retracted.** Unliking removes the row while it is unread, deliberately stopping there: a notification you have already seen is part of what happened to you, and deleting it rewrites something you witnessed. The visible consequence is a row saying "X liked your poem" next to a poem whose like count no longer includes them, and a stats panel showing the lower number. Accepted, not forgotten — if it ever reads as a bug rather than as history, the alternative is marking the row as withdrawn rather than deleting it, never a silent delete.

- 🤖 **The `actors` array is best-effort after a retraction.** It is capped at `MAX_ACTORS` (5) and holds the most recent actors; when a listed actor unlikes, the array shrinks and cannot be refilled, because the older ids were never stored. `count` stays correct, and all the rendered text derives from `count`, so nothing is wrong today. It matters only if something ever tries to use `actors` as a complete list — for that, use the poem's `likes`.

- 🤖 **`GET /notifications` no longer returns `total`.** It asks for one row more than the page instead of running a second `countDocuments` per open, so "is there another page" is known and "how many are there" is not. If a "37 notifications" display is ever wanted, bring the count query back rather than inferring one from the page count.

- ✅ **RESOLVED: the "preference that would not persist" was never a preference problem.** The comment that produced no notification was left on an AUTHOR PAGE, not on a poem, and profile comments notified nobody at all — `comments.js` gated the notify on `targetType === 'poem'`. Fixed 2026-08-04 with a fifth type, `profileComment`. The wrong diagnosis is worth remembering: the symptom was investigated as a client-side persistence bug for an hour before anyone asked WHERE the comment was.

- 🤖 **No browser coverage for anything shipped on 2026-08-04** — the stats panel, the notification timestamps, the email "Soon" section, or the new **My comments** tab. All are layout, and layout is the one thing the 1190 frontend tests provably cannot see: two of that day's bugs were pure geometry, found by looking at a screenshot. Fold into the Cypress work above.

- 🤖 **The new `Comment` index has not been checked against Atlas.** `{ authorId: 1, createdAt: -1, _id: -1 }` was added for the My comments tab and builds itself on deploy (`autoIndex` is ON), but that has never been confirmed — and without it the query scans every comment. Run `node backend/scripts/check-index-drift.js` on the same pass as the `recipient_1` drop below; `Comment` is already in its `MODELS` list.

- 🤖 **My comments has no behavioural tie-break test, on purpose.** One was written and deleted: it passed with `_id` removed from BOTH the sort spec and the index, because at fixture size the driver returns ties in a stable order anyway. A test that cannot fail is worse than none. The declared-index test carries the guarantee. Same known limit as the follow lists — do not "restore" it without making it actually fail first.

### Housekeeping / follow-ups raised this session

- 🤖 **Index drift — run `check-index-drift.js` after any schema-index change.** `autoIndex` is ON in production (`backend/mongo.js` sets no `autoIndex: false`), which is **asymmetric**: adding an index to a schema builds it automatically on deploy, but *removing* the line never drops it — the index lives on in Atlas forever, costing write throughput for a query no longer issued, and invisibly, since the code no longer mentions it. Nothing is broken today; this is a standing rule, and it matters now because the P2.5 features each add indexes (the `Follow` compound index, the drafts `status` filter). After removing an index from a schema, drop it explicitly. `node backend/scripts/check-index-drift.js` reports both directions and is strictly read-only. Worth a run after each P2.5 item ships.

- ✅ **Escaped the `?letter=` regex** (2026-08-04). `escapeRegex` moved out of `controllers/poems.js` into `src/utils/escapeRegex.js` and used by both call sites — a "make this safe" helper only one of two callers can reach is how the second one ends up unsafe. Input is also length-capped (`MAX_REGEX_INPUT`). The charset was deliberately NOT narrowed to A-Z: escaping removes the vulnerability without dropping authors whose names start with an accented character, which that query can currently reach. `regexInjection.test.js` asserts on RESULTS, not status codes — a wildcard match is a perfectly successful 200. Two of its tests were hollow on the first pass and were given teeth: proving a pattern is literal needs an author whose name literally contains it, and proving truncation needs input whose tail would have changed the answer.

- 🤖 **`computeRanking()` is the heaviest thing on the like path.** It is a `$group` over *every* published poem (~16k) with no index able to serve it, and it runs on **every like, create, delete and publish** because those embed a freshly recomputed ranking in their response. It dwarfs everything the notification writes do. Options, none chosen yet: cache the top-10 with a short TTL and accept staleness; keep incremental per-author counters (poems, likes) updated on the same mutations and rank from those; or accept it as-is while the collection is this size. **Measure before the follower-points change lands** — that adds a `$lookup` over `follows` to this same aggregation, i.e. it makes the most frequently-run expensive query more expensive. See the ranking item in P2.5.

- 🤝 **PageSpeed: render-blocking CSS on mobile** (reported 2026-08-04). Two stylesheets, 14.2 KiB total, ~450ms modelled saving. **The number that matters is 490ms for a 1.9 KiB file** — that is round-trip latency on throttled mobile, not bytes, so minifying or splitting will not help; only taking the request off the critical path will. The standard fix is Next's `experimental.optimizeCss` (Critters), which inlines critical CSS — it is experimental and can produce a flash of unstyled content, so it needs verifying on the DEPLOYED site, not locally. **Do the image item first**: the same report offers 294 KiB from image delivery, which is a bigger and safer win that risks nothing. And treat "estimated savings" as modelled rather than measured — the only real check is a Lighthouse run against production before and after.

- 👤 **Submit the four child sitemaps in Search Console and compare their indexed ratios** (2026-08-07, follows the sitemap split). This is the payoff for the split and the whole reason it was done — GSC reports coverage per submitted sitemap, so submit `poems-famous.xml`, `poems-community.xml`, `authors.xml` and `pages.xml` individually, not just `sitemap.xml`. Then read the ratios against each other, because the split cannot make Google index faster, only tell you why it isn't:
  - **Community high, famous near zero** — duplication confirmed. The 15,652 famous poems exist verbatim on hundreds of other sites and cannot rank; the decision then is whether to `noindex` them (recovering crawl budget for the 435 that are unique) or keep them as reader traffic and stop expecting search traffic from them. **Do not act on this before the numbers arrive** — `noindex`ing 97% of the collection on a hunch is not reversible cheaply.
  - **Everything near zero, including community** — not a duplication problem. Site-level signal, and a completely different investigation.
  - Give it a couple of weeks; per-sitemap numbers do not populate immediately.

- 🤖 **(Low) Authenticated "change password" endpoint + UI** — there's no logged-in "change password" today; the only path is Forgot → emailed reset link, which resolves the account by `findOne({ email })` (`password.js`). **Low priority because this only bites shared-inbox accounts** — i.e. the `testAccount:true` accounts you create on one email (real users are one-per-email, so their reset is unambiguous). For those shared accounts the reset only ever hits the oldest doc, so the others aren't reachable via the UI (use `set-account-password.js` meanwhile). A logged-in route keyed on `req.userId` (verify current password, set new hash, bump `passwordChangedAt`) + Profile UI would remove the ambiguity.
- 🤖 **(Optional) Admin UI for test accounts** — a small screen for `POST /api/v1/admin/test-users` instead of calling the API by hand.
- 👤 **Adopt a `develop` branch workflow (deferred)** — plan is to work from a `develop` branch and merge to `master` for releases, instead of committing to `master` directly. **Not now** — while shipping fast toward stability, direct-to- `master` is the intentional tradeoff. Revisit once the app is stable.
- 🤝 **(Optional) Hard backend deploy-gate** — deploy currently isn't gated on tests (guarded by CI-on-push instead). A true gate needs migrating the backend off the legacy `builds` config in `backend/vercel.json`; deferred as risky, low value.
- 👤 **Skip unaffected Vercel builds (monorepo)** — verify each Vercel project's **Root Directory** is set to its subfolder (`frontend/`, `backend/`) so a commit touching only one side redeploys only that project, and root-only changes (e.g. `TODO.md`) skip both. If both projects still rebuild on every push, set the Root Directory (or an "Ignored Build Step" `git diff` guard) to skip the unchanged side.

---

## ✅ Recently shipped (context — do not re-add)

**One line each, by design.** The reasoning that outlives the change lives in `AGENTS.md`; this list exists only so nobody proposes the work again.

- **Paginated list URLs + author-index letters** (2026-08-07) — `?page=N` and `?letter=X` are honoured server-side with real `<a>` navs; one address per view (`?page=1`/`?letter=A` redirect), out-of-range is 404, each page self-canonical. All 3,364 author pages are now linked.
- **Author pages render their links on the server** (2026-08-07) — `/authors` emitted 0 links to 3,364 author pages and each author page 0 links to its poems, both from seeding SSR props inside a `useEffect`. Guarded by `Authors.ssr.test.tsx`; RTL cannot see this class of bug.
- **Sitemap split into an index over four sections** (2026-08-07) — `pages`, `authors`, `poems-community`, `poems-famous`, so Search Console reports coverage per class instead of one number over 19,587 URLs. Same URL set as before. **The fetchers now throw instead of `break`ing**: a failure is a 500, not a silently-truncated sitemap cached for a day. Poem pages fetch concurrently off the page count (~30s → ~5s), and `pages` costs 136 `limit=1` probes rather than a walk of every poem.
- **Sitemap `<lastmod>`** (2026-08-06) — emitted only where it is true; poems carry their own date, a genre is as fresh as its newest poem, author/privacy/terms carry none.
- **Header logo srcset** (2026-08-07) — no `sizes` meant next/image upscaled a 547px source to 640px and shipped 17 KiB to fill a 91px box on a phone.
- **Comments RECEIVED, alongside written** (2026-08-04) — `GET /comments/received`, three sources: comments on your poems, on your author page, and **replies to you anywhere**, which was reachable nowhere. A Written/Received toggle inside the tab, not a seventh tab. `isReply` rides on each row so it reads "replied to you", not the weaker "commented on your poem".
- **Reply notifications** (2026-08-04) — `parentId` was stored from the first commit and never read. Up to two people per comment, never the same one twice: the thread owner and the parent's author, and when those are the same person only the reply is sent.
- **Profile-comment notifications** (2026-08-04) — comments on an author page notified NOBODY, which is what actually caused the "preference that would not persist" mystery. The destination is served (`profile.slug`), never derived: the client builds a slug from the username, the real one comes from the display name.
- **"Join Poemunity" sidebar panel + mobile line** (2026-08-04) — signed-out only, last in the column. Every promise is something an account genuinely unlocks (a draft listed "browse by category", which is free). The AI poets are a draw, but "always badged" is pinned by a test, and so is the absence of any claim about other sites. Mobile gets a one-line prompt after the list, because the sidebar is `display: none` below `$bp-xl`.
- **Notification settings behind a button beside "Edit profile"** (2026-08-04) — three arrangements preceded it; the worst put them BELOW the tabs, whose panels scroll infinitely, so nothing under them can be reached.
- **Breadcrumbs: top-left, and one label instead of three** (2026-08-04) — a genre page said "Beauty poems" three times (breadcrumb, `h1`, "Category: BEAUTY"). The `Category:` line is gone, the crumbs name the category rather than a phrase, and the trail is anchored to the page gutter instead of floating 118px inside the content.
- **Dashboard rails balanced** (2026-08-04) — left 21%, right was 20%, so the content column was not page-centred and anything page-centred sat 9px off anything column-centred. Balanced rather than nudged: the columns shrink, so no hardcoded offset holds at every width.
- **Comments aligned to the poem card** (2026-08-04) — the `$bp-xl` `width: 40vw` rule named `.poem__block` and `.next-poem` but not the comments, leaving them 80px narrower. Also: sidebar rails no longer scroll sideways (`overflow-y: auto` computes `overflow-x` to `auto` too), and the header tagline dropped from 1.8rem so it stops competing with the wordmark.
- **My comments tab** (2026-08-04) — `GET /comments/mine`, session-scoped, sixth profile tab; comments whose poem was deleted or withdrawn are dropped rather than linked to a 404. Deliberately NOT the merged "Activity" timeline: poems and likes already have tabs.
- **Notifications: mark-read never sent its request** (2026-08-04) — `options: { fetch: false }` skips the axios call in `postAction`, so nothing was ever marked read and the badge never cleared; now a bare request, chained after the list fetch so rows still show what was new.
- **Notifications: unlike retracts its notification** (2026-08-04), while the row is unread only.
- **Notifications: per-row timestamps** (2026-08-04) from `updatedAt`, matching the list's own ordering.
- **Notifications: 10 per page, one query instead of two** (2026-08-04) — asks for one row more than the page instead of a second `countDocuments`; `total` is gone from the response.
- **Notification preference checkboxes are independent and optimistic** (2026-08-04) — every input had shared `disabled={query.isFetching}`, so saving one greyed out all four.
- **Email announced as "Soon"** (2026-08-04) — disabled, bound to no state, with the in-app intro stating that nothing is emailed.
- **Profile stats panel** (2026-08-04, P2.5 item 4) — poems, likes, rank when in the top 10; rank read from the ranking already cached for the sidebar, so the two cannot disagree.
- **Perf: notification fan-out fetches preferences once** (2026-08-04) — 3 serial round trips per follower became 1 + 2N.
- **Perf: author listings count by grouping poems** (2026-08-04) — 98ms → 43ms on `?limit=`, 99ms → 46ms on `/letters`; `?letter=` keeps the per-author `$lookup`, where it is 8x faster.
- **Security: `?letter=` regex escaped** (2026-08-04) — raw interpolation on a public endpoint was a ReDoS vector; `escapeRegex` moved to `utils/` and shared with `?q=`.
- **Follow / followers** (2026-07-31, P2.5 item 2) — `Follow` edge collection, unique `{follower, following}` index mapping E11000 to success, counts and `isFollowing` riding on `GET /authors/:slug`.
- **Notifications** (2026-07-31, P2.5 item 3) — four event types, collapsed in storage, four preference toggles, header bell with an unpolled badge.
- **Drafts** (2026-07-31, P2.5 item 1) — `Poem.status` defaulted and never backfilled, so "published" means published OR ABSENT; one visibility fragment composed by every public read.
- **Server-owned poem fields** (2026-07-31) — `likes`/`date`/`origin`/`userId` are admin-only on both write routes; `Poem` is `strict: false`, so a spread persisted anything sent.
- **Cypress suite repaired: 34/34** (2026-07-30), up from 1 passing, now its own CI workflow; root causes were a `window.Cypress` branch in `axiosInstance`, an inherited `.env`, and two real app bugs.
- **Hydration mismatch on `/profile`** (2026-07-30) — `TabPanel` wrapped flow content in a `<p>` via MUI `Typography`; found by bisection, not by DOM comparison, which cannot see it after React has recovered.
- **Comment delete "×" unclickable between 1200–1310px** (2026-07-30) — the comments section overflowed under `.poem-page::after`; found by Cypress with lint, typecheck and 990 jest tests green.
- **Poem text cleanup** (2026-07-30) — 1,962 titles, 885 bodies, 1,433 slugs; old slugs live on in `slugHistory`. Canarying with `--limit 1` caught that the fallback commit had never deployed.
- **Next-poem index + orphan cleanup** (2026-07-30) — `autoIndex` is ON and only ever CREATES; two orphaned indexes dropped, and `check-index-drift.js` now reports the drift.
- **Poem of the week** (2026-07-29) — derived from the week number, no cron and no stored state; a large prime stride stops consecutive picks reading as broken curation.
- **Own comments system, replacing Disqus** — first-party end to end, which is what made AI-authored and profile comments possible. Closed; do not reopen.
- **Server-backed search** (2026-07-28) — `?q=` over titles and author names, unanchored on purpose; `useSearchQuery` owns debounce, minimum length and abort.
- **Fixed the flaky backend suite** (2026-07-28) — supertest's per-request `app.listen(0)` binds the wildcard address, so the suite talked to other processes; `jest.setup.js` now listens once on loopback.
- **Backend lint clean and gated in CI** (2026-07-27/28) — `lint` checks, `lint:fix` fixes; the old `--fix` default would have passed a hollow gate.
- **Email + auth** (2026-07-27) — Resend infra, password reset, verification, `passwordChangedAt` session revocation, admin test accounts.
- **Email on in prod, `REQUIRE_EMAIL_VERIFICATION=true`** (2026-07-27), with the admin exempt from the publish gate.
- **Prod deployment verified** (2026-07-27) — SSR, assets, API, CORS, env vars and login confirmed live; `og:image` made absolute.
- **Database backup + restore drill** (2026-07-27) — full `mongodump` archived off-repo and proven to restore with matching collection counts.
- **Prod email migration** (2026-07-27) — 11 users verified, 3,370 authors stamped `testAccount:false`, `email_1` rebuilt as a partial unique index.
- **Single-step AI generator** (2026-07-27) — `scripts/lib/aiSeed.js` + `seed-ai-community.js`, idempotent and dry-run by default.
- **Normalized Redux store** — authors and poems live once in `createEntityAdapter` stores; list caches hold ids. The `updateXCacheAfterY` thunk family is gone.
- **Ranking is server-computed** and returned fresh by every mutation that changes points, so the sidebar cannot drift.
- **CI installs with `pnpm --frozen-lockfile`**, so lockfile drift fails before deploy; branch protection blocks force-push and deletion on `master`.
- **Brand refresh** — `lg-1` wordmark, recoloured icon set; fixed `og-image.png` being caught by a blanket `*.png` gitignore and never deploying.
- **`set-account-password.js`** — sets a password from a hidden prompt, for accounts unreachable via the email reset flow.
- **Absolute `og:image`/`twitter:image`** in `SeoHead.tsx`; relative paths are ignored by social scrapers.

## 📚 Reference docs

- `frontend/CLEANUP.md` — full frontend cleanup plan (testing, deps, refactors).
- `docs/PRODUCTION_CHECKLIST.md` — launch checklist (mostly complete).
- `docs/NEXTJS_MIGRATION.md` — Next.js migration status (Phase 8 = prod deploy verify).
- `docs/AI_COMMUNITY_SIMULATION.md` — AI activity seed plan + scripts.
- `docs/DATABASE_BACKUP_RESTORE.md` — Atlas backup/restore drill.
- `docs/EMAIL_AUTH_PLAN.md` — email/auth design (local-only, gitignored).
- `backend/scripts/*-plan.md`, `*-progress.md` — historical migration notes.

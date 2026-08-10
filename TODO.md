# Poemunity — TODO

Single source of truth for the backlog (frontend + backend). Deeper detail lives in the linked reference docs; this file is the curated, actionable list.

**Legend:** 👤 = you (manual / ops / dashboard) · 🤖 = code (Claude can do) · 🤝 = both

**How this file is organised.** Priority sections (P0–P4) hold OPEN work only — anything finished moves to *Recently shipped* as one line, because a done item left in place is read as work. Two cross-cutting sections sit outside the priorities: *Live-site verification* (things only the deployed URL can answer) and *Standing rules* (lessons that keep being re-learned, and that belong in front of you rather than buried in the item that taught them).

---

## ▶️ Start here — the three that matter

1. **👤 Rotate the MongoDB password and `RESEND_API_KEY`** (P0). Open since 2026-07-30 and the only item with a clock on it. Everything else on this list can wait a week without getting worse; leaked credentials get worse by sitting.
2. **👤 Count the legacy `users` collection** (P2 security). One query — `db.users.countDocuments()` — decides whether the two routes deleted on 2026-08-10 were serving real people's email addresses to anyone who asked, or nothing at all. It also decides whether there is a migration gap stranding real accounts.
3. **👤 Look at the live site.** Six commits are in production unlooked-at, four of them from today, and two of those are backend deploys — the backend has no test gate at all. CI cannot prove a deploy; only the URL can. The list is in *Live-site verification* below, and it takes about ten minutes.

**On the calendar, not on the list: read the per-sitemap indexed ratios from ~21 August.** All five sitemaps were submitted on 7 Aug 2026 and parse `Correcto`, so the clock is already running — nothing to do until then, and reading it early tells you nothing. It is the highest-value *answer* pending on this project: it decides the `noindex` question for 97% of the collection, the edge-caching question, and where any backlink effort should point.

---

## 🔴 P0 — Production go-live (blocks a real launch)

- 👤 **Rotate the MongoDB password and `RESEND_API_KEY`** (exposed 2026-07-30). An agent session sourced `backend/.env` in a way that made the shell echo it, so the **Atlas connection string including the password** and the **Resend API key** ended up in that session's transcript and tool logs. `.env` is gitignored and untracked, so nothing reached the repository and the exposure is limited to those logs — but both should be treated as compromised until rotated.
  1. Atlas → Database Access → edit user → Edit Password → autogenerate. Update `MONGODB` **and** `MONGODB_PRE` in the Vercel backend project and in local `.env` (they point at the same cluster — see Gotchas).
  2. Resend → API Keys → revoke and recreate. Update `RESEND_API_KEY` in Vercel and locally.

  While there: the current database **password is identical to the username**, which is worth fixing on its own merits regardless of this incident. **Never source `.env` from a shell** to read a value — unquoted values get executed and echoed. Load it through `dotenv` in a script instead.

_All other P0 launch blockers are complete._ 🎉 (email on, prod migration, deploy verification, database backup + restore drill — see Recently shipped.)

## 👤 Live-site verification (never empty, never inferable from CI)

**Why this is its own section.** Green CI is not a deploy: pushes go straight to `master` and Vercel deploys on push, so the two race; the backend is not gated on tests at all; and each app builds only when its own directory changes. A commit adding a needed backend fallback once passed CI and never deployed. **A feature is verified when it has been seen working on the live URL.** See Standing rules.

- **Six commits are unverified in production.** Today's four (`978fa24` author pagination, `dc341f7` SEO smalls, `be58670` sitemap cache header, `5aeb0dd` + `59b3cf9` the two backend security fixes — note the last two are the first backend deploys in a while, and the backend has no test gate), plus the older `8d113ba` (author listing aggregation, a **public read path** — confirm the real 3,300-author collection returns the same letters and counts as before), `8283b88` (notification fan-out + index) and `d3adb85` (notifications UI).
- **Author pagination**: `/authors/<a prolific poet>?page=2` renders the second ten poems, `?page=1` redirects to the clean URL, `?page=9999` is a real 404, and clicking through the nav from inside the site swaps the poems rather than appending to them (that last one is the client-navigation path, which no server-side test reaches).
- **Sitemap cache header**: two consecutive `curl -sI https://poemunity.com/sitemaps/poems-famous.xml` should show `x-vercel-cache: HIT` and a rising `age:` on the second. A test can pin the header string; only the deployed response proves the CDN honoured it.
- **The genre pages still return poems** after the `?genre=` escaping change (`59b3cf9`) — a one-URL check that the escape did not change legitimate matching.
- **Drafts**, end to end on the live site. The browser paths are covered by Cypress and the build gate runs, so what is unverified is the deploy itself.
- **Layout, visual and responsive behaviour generally.** A static audit and 1,446 jest tests provably cannot see them: the sticky rail that hid Poem of the week, the right rail vanishing below `$bp-xl`, an unclickable delete "×" between 1200–1310px, and a hydration mismatch were all found by looking, not by testing.
- **The header tagline's baseline offset is an estimate, not a measurement.** `top: 5px / 6px` on `.header .list__presentation` was reasoned, not measured — the Chrome tab was backgrounded, so layout was skipped and every rect read 0. The previous 2px/3px WAS measured, but for EB Garamond italic, and a script face puts its baseline elsewhere in the em box. Re-measure in the foreground, or nudge by eye.

## 🟠 P1 — AI community activity (review & extend)

_A **first round is already live in prod** (seeded 2026-06-12): runs `seed-activity-v1` (1,785 likes · 132 poem comments · 49 replies · 35 profile comments) + `seed-activity-v1.1-likes` (+440 likes). Current totals: 50 AI authors, ~416 AI poems, 216 AI comments, 2,225 like events. Note: `pre === prod`, so there is **no separate env to "promote from"** — this IS the production data._

- 👤 **Review the live AI activity** — run `inspect-run.mjs` on the existing runs (read-only); eyeball ordering/density/plausibility. (`docs/AI_COMMUNITY_SIMULATION.md`)
- 👤 **Decide on further rounds** — keep as-is, add another activity round, or trim. Any new seed is a prod write: dry-run + `mongodump` snapshot first, and keep `rollback-run.mjs` ready (rollback is per-`runId`).

## 🟡 P2 — Security & hardening

### Open findings from the 2026-08-10 code audit

Both apps were reviewed and the findings **verified against a running server** (throwaway probe suite, not kept) rather than read off the source. The three HIGH items are fixed and shipped; what follows is what is left.

Confirmed sound, so nobody re-audits them: draft visibility held against every probe; `privateFields` is honoured on the public author endpoint; notification and drafts routes are session-scoped throughout; JSON-LD escaping, the identity-only JWT with `passwordChangedAt` revocation, and CSRF (SameSite=Lax plus the origin check) all hold.

- 👤 **(HIGH — the data half) Does the legacy `users` collection still hold rows?** The two public routes over it are deleted, so nothing serves that data any more — but deleting a route does not delete a collection, and until this is answered nobody knows whether the site was leaking real addresses for months or nothing at all. `db.users.countDocuments()` settles it. **Empty** ⇒ drop the collection and the `User` model with it (the only remaining reference is the pre-migration fallback in `poems.js`). **Not empty** ⇒ those users never made it into `authors`, which is a migration gap rather than a cleanup: they cannot log in, and their poems resolve through the legacy fallback. **A read-only script must set BOTH `mongoose.set('autoIndex', false)` and `mongoose.set('autoCreate', false)` before requiring any model** — `check-index-drift.js` created an empty collection in production while calling itself read-only.
- 🤝 **(MEDIUM) `/register/availability?email=` is an account-existence oracle** — `backend/src/controllers/register.js:54`. Answers `emailAvailable: false` for a registered address, at 30/min. Login is deliberately non-enumerating (dummy bcrypt compare, identical 401) and register returns a neutral message for the email conflict *citing anti-enumeration* — then this states the answer plainly. The username half is necessary and harmless; the email half undoes the care taken everywhere else. **Product call**: drop the email check, or keep it and accept that the anti-enumeration elsewhere is decorative.
- 🤝 **(MEDIUM) `GET /api/v1/comments?since=1970-01-01` dumps every comment on the site** — `backend/src/controllers/comments.js:208`. Unauthenticated, unpaginated, populated with author name/slug/picture. It exists for the simulation scripts. Separately, the by-target branch has no draft check, so comments on a withdrawn poem stay publicly readable — the exact case `/mine` and `/received` go out of their way to filter. **Product call**: do the scripts still need `since=`, or can it move behind `SIMULATION_INTERNAL_SECRET`?
- 🤖 **(LOW) Audit smalls, one commit.**
  - `poems.js:442` — admin `PATCH /api/v1/poems` runs `updateMany({}, { $set: req.body })` over all 16k poems with no allowlist and no dry-run. `{"status":"draft"}` unpublishes the site in one request, and every other bulk operation in this repo is dry-run by default.
  - `poems.js:254` — the author-not-found early return hardcodes `page: 1, limit: 10` whatever was asked for.
  - Deleting a poem orphans its comments and notifications. The UI copes (`notificationHref` returns null, `/mine` filters them), but the rows accumulate and `?targetId=` still serves the comments.
  - `/privacy` still says session data may live in local storage. It does not (grep is clean) — a wrong statement on a legal page.
  - A `testAccount` author is hidden from listings, but `/authors/<slug>` still resolves for them.

### Still unaudited

- 🤝 **The parts of the security review the audit did not reach**: `pnpm audit` in both workspaces, live response headers (helmet defaults vs what Vercel actually sends), CORS in production (`FRONTEND_URLS` must not be permissive), and whether `SIMULATION_INTERNAL_SECRET` is compared in constant time and cannot be probed. Also **authorization coverage as a whole** — the audit checked the routes it read, not a systematic matrix of every mutating route against ownership.
- 🤝 **Public backend URL review** — is exposing `poemunity-backend.vercel.app` directly acceptable? Audit what is reachable.
- 🤖 **`middleware.ts` gates protected routes on cookie PRESENCE only.** A forged or expired token gets past it and reaches the page, which correctly renders signed-out — but the `/login` redirect never fires, so `/profile` renders an empty shell. Cosmetic today, not a leak. The fix is **not** "verify the JWT in middleware": the signing secret lives on the backend, and copying it into the frontend to satisfy a redirect is a worse trade than the bug. Either accept the shell, or have the page return `redirect: { destination: '/login' }` when `fetchServerUser` comes back null.
- 🤖 **`buildServerUser` and `decodeServerToken` are exported but used nowhere outside `serverApi.ts`.** `buildServerUser` returns UNVERIFIED identity by construction — that is why it hardcodes `isAdmin: false` — so a future caller importing it directly is the exact shape of the bug already fixed there. Stop exporting them, or rename to say so (`buildUnverifiedUserFromToken`). Cheap, and it removes the trap rather than documenting it.

### Index drift in Atlas

**Checked 2026-08-10** with `node backend/scripts/check-index-drift.js` against production (read-only — both `autoIndex` and `autoCreate` off before any model loads). Result: `poems`, `authors`, `comments` and `follows` all **OK**, so the `Comment` index `{ authorId: 1, createdAt: -1, _id: -1 }` DID build on deploy and the three follow indexes are live — both previously unverified. One orphan, exactly as predicted:

- 👤🤖 **Drop the orphaned `recipient_1` index on `notifications`.** Confirmed present in Atlas and no longer declared, so it costs a write on every notification insert and collapse, forever — `autoIndex` only ever CREATES. `node backend/scripts/drop-redundant-notification-index.js` (dry-run by default, `--apply` to act) drops it. **`mongodump` first** — this is the one production WRITE in the current backlog, which is why it is not done yet.

### Infrastructure

- 👤 **No separate dev/staging database** — `MONGODB_PRE` is byte-for-byte identical to `MONGODB` (same cluster, same `poemsAPI` db). Every "pre"/dev-mode script writes straight to **production**, and there is nowhere to rehearse a seed or migration. Stand up a real pre/staging cluster (or repoint `MONGODB_PRE` at a throwaway DB). Until then, treat every seed/migration script as a prod write. (Seed logic is validated against ephemeral in-memory Mongo in tests — see `aiSeed.test.js`.) **Deferred, not now.**
- 🤝 **Hard backend deploy-gate** — the backend deploy is not gated on tests (`backend/vercel.json` only routes traffic); CI-on-push is the only guard, and it races the deploy. A true gate means migrating off the legacy `builds` config. Deferred as risky, low value — but note two backend deploys shipped today under exactly this gap.
- 👤 **Adopt a `develop` branch workflow (deferred)** — work from `develop` and merge to `master` for releases, instead of committing to `master` directly. **Not now**: while shipping fast toward stability, direct-to-`master` is the intentional tradeoff. This is also the prerequisite for CI ever *blocking* a deploy — required checks need a PR to hold. Trap to remember: required checks plus path-filtered workflows leave skipped jobs hanging as "Expected" forever, so the move needs an always-run aggregator job.
- 👤 **Skip unaffected Vercel builds (monorepo)** — verify each Vercel project's **Root Directory** is set to its subfolder so a commit touching one side redeploys only that project, and root-only changes skip both.

## 🧪 P2 — Test coverage that would have caught real bugs

- 👤 **Watch the first few `E2E (Cypress)` CI runs.** The workflow is in, but has only ever been proven on a laptop — a cold GitHub runner is slower and more contended, which is where a locally-green suite starts to flake. If it goes red without an app change, fix the wait/timeout rather than retrying, and do **not** reach for `uncaught:exception` to quiet it.
- 🤖 **Extend Cypress coverage to everything shipped since the specs were written.** The four existing specs (comments, create-poem, ranking, register) predate most of the product. This item absorbs three older duplicates of itself — follow, notifications, and "nothing from 2026-08-04 has browser coverage" — because they are one job. In rough order of what would hurt most:
  - **Login / logout / session** — the cookie-to-Bearer proxy path is exercised incidentally by every spec, but nothing tests the form, logging out, or an expired token.
  - **Follow** — the largest surface with no e2e spec. Follow a poet, see the count change, find them in Following, unfollow. The one follow bug that reached the screen (the row sitting hard left under a centred name) was invisible to 1,079 passing tests, because `text-align` does not reach a flex container's items.
  - **Notifications** — sign in, have a second account like your poem, reload, assert the badge; open the panel, assert the row text and that the badge clears; assert the row links to the poem; toggle a preference off and assert no new badge. Note the bell fetches **once on mount**, so a spec expecting the badge to change without a reload will fail correctly.
  - **Like a poem** — the 2026-07-30 bug (heart and counter not updating on a `/detail/<slug>` URL). A browser test also covers the ranking refresh riding along in the like response.
  - **Search** — debounce, 2-character minimum, latest-wins when typing fast, and that the input keeps focus and caret mid-query.
  - **Pagination** — clicking a page link from inside the site, which is the path that had two bugs on 2026-08-10 and that no server-side test reaches.
  - **Next poem**, **poem edit/delete** (with the confirmation modal), **profile edit**, **password reset and email verification** (both live in prod, untested end to end), **Poem of the week** (desktop only), and **responsive checks at `$bp-xl` and just below**.

  Two things to respect: the suite runs **`next dev`, not a production build** — in development React *throws* on a hydration mismatch and Cypress fails, while a production build silently recovers and the suite would go green over a real bug. And it must point at `NEXT_PUBLIC_API_URL=http://localhost:4201`; unset, the app defaults to :4200, which locally is a **real backend**, and the specs write data. Red-check each new spec by breaking the implementation first.
- 🤝 **Decide what to do with the Selenium/Applitools visual suite** (`frontend/selenium/visual.spec.ts`). Not in CI, and not addable as-is: (1) it logs in with real credentials against `API_URL`, defaulting to :4200 — in CI that is an automated login against production on every push; (2) it **cannot fail**, since it still calls `eyes.closeAsync()` and the baselines were never accepted, and a job that cannot go red just trains people to ignore a green tick; (3) it needs three repo secrets. Its DOM assertions now overlap Cypress; the genuinely additive part is visual diffing. **If it goes in, make it `schedule:`-only** — visual diffs are very sensitive to font rendering across environments. The honest alternative is deleting it. Decide, rather than leaving it unrun.
- 👤 **Toast QA in the browser** — comment post/reply/delete, poem like-failure, delete, create/save.
- 🤖 **Raise unit coverage** for still-untested components and utilities (`frontend/CLEANUP.md` Phase 2).

## 🟣 P2.5 — Profile & social features (product roadmap)

Seeded by a competitor review plus conventions from Allpoetry / HelloPoetry. **Shipped: drafts, follow/followers, notifications (six types), the stats panel, and the My comments tab (Written + Received)** — see Recently shipped. What remains:

- 🤖 **Pinned poem.** One `featuredPoemId` on `Author`, rendered first on the public author page. Poets have a piece they want read first; today the newest wins.
- 🤖 **Free-form tags.** Genres are a fixed `CATEGORIES` list; tags (`#grief`, `#sonnet`, `#villanelle`) allow discovery by form and subject. Needs guardrails or the namespace becomes noise: lowercase, deduped, capped per poem, autocomplete from existing tags.
- 🤖 **Collections / series** (higher value later). Poets think in sequences and chapbooks, but this only earns its place once users have enough poems for grouping to matter.
- 🤖 **Followers in the ranking.** `computeRanking()` is `3×poems + 1×likes`; `+ 2×followers` has been decided but not built. When it lands, `follow`/`unfollow` join the mutations that return a freshly recomputed ranking — and see the `computeRanking()` cost item in P3 first, because this adds a `$lookup` to the most frequently-run expensive query on the site.

**Cross-cutting caveat:** these need schema changes, and `MONGODB_PRE` is the same database as `MONGODB`. Any backfill is a production write — `mongodump` snapshot first, dry-run first.

**Deliberately rejected from the reference site:**
- **The "profile 45% complete" bar** — a nag that treats the user as an incomplete record. The real goal (author pages look empty without bio/picture) is met instead by *one* dismissible contextual prompt on your own author page.
- **A merged "Activity" timeline** — poems and likes already have their own tabs, so it would repeat two tabs to deliver one capability. Comments were the only unreachable part, and they got a tab. A chronological cross-type feed would be a NEW decision, not this item being finished.
- **`Vacío` placeholders on every empty field** — six red "Empty" labels make a profile read as a form you failed. Omit empty fields; show one "add details" link.

## 🟢 P3 — SEO, performance & code quality

### SEO

- 👤 **Read the per-sitemap indexed ratios — from ~21 August 2026.** ✅ Submitted 7 Aug 2026: all five (index + four children) parse `Correcto`, and the discovered counts match the code exactly — 15,652 famous + 435 community + 3,364 authors + 136 pages = 19,587, the index total to the digit. That arithmetic is also independent proof that Google read every child in FULL, which is what the "a sitemap never ships partial" work exists to guarantee.

  **What is submitted is not what is answered.** The Sitemaps screen shows *Páginas descubiertas* — URLs found in the file, not URLs indexed. The ratio this was all for lives in **Indexación → Páginas**, filtered per sitemap (⋮ → "Ver indexación de páginas" on each row). Read it against these two scenarios, because the split cannot make Google index faster, only tell you why it isn't:
  - **Community high, famous near zero** — duplication confirmed. The 15,652 famous poems exist verbatim on hundreds of other sites and cannot rank; the decision is then whether to `noindex` them (recovering crawl budget for the 435 that are unique) or keep them as reader traffic and stop expecting search traffic. **Do not act before the numbers arrive** — `noindex`ing 97% of the collection on a hunch is not cheaply reversible.
  - **Everything near zero, including community** — not a duplication problem. A site-level signal, and a completely different investigation.
  - Two weeks from submission is the earliest honest read; three days is not a signal, it is noise.
- 🤝 **Every SSR page is uncacheable — decide whether to make public pages edge-cacheable.** Every route returns `cache-control: private, no-cache, no-store`, Next's default when `getServerSideProps` sets none. Nothing caches at Vercel's edge, so all 16,087 poem pages cost a full render plus a backend round-trip on **every** Googlebot fetch, and crawl rate is throttled by how expensive a site is to crawl. TTFB is fine (0.3–0.55s); the point is that it is paid every time.

  **A product decision, not a header tweak.** These pages embed `initialUser`, so the HTML genuinely differs per visitor. Making them anonymous-cacheable means dropping `initialUser` from SSR and hydrating auth client-side (`/api/auth/session` already exists) and accepting a brief signed-out header on first paint. Do NOT just add `s-maxage` without moving `initialUser` — that serves one visitor's signed-in header to everyone.

  **Parked behind the sitemap numbers above**: if the famous poems turn out to be unindexable and get `noindex`ed, 97% of this crawl cost disappears without paying the flash. Decide the sitemap question first.
- 🤖 **`/login` and `/register` have no `<h1>`.** Accessibility rather than SEO — both are `noindex,nofollow` — and the last leftover from the SEO-smalls item.
- 🤝 **Backlinks / off-site SEO.** Ordered by what is worth the effort. **The constraint that decides where to point any of it:** ~16,000 poems here are famous ones that exist verbatim elsewhere, so those pages cannot rank however many links they get. Aim every link at what only Poemunity has — community poems, author pages, and the AI experiment.
  - 🤝 **Write up the AI-poets experiment.** The highest-value item, and it is writing rather than SEO work: "I seeded a poetry community with 50 labelled AI poets — here's what happened" is a story a small tech or writing newsletter would cover, and it is genuinely novel. Everything else here is a link; this is a *reason* for somebody to link.
  - 🤝 **Poetry contest / resource page.** List online poetry contests in English, then tell those sites they are featured. It works because it gives them something first, which is the only reliable form of outreach.
  - 👤 **Own profiles** — GitHub, personal site, Bluesky/Twitter bio, Reddit. Low weight but legitimate and immediate.
  - 👤 **Poetry communities** (`r/OCPoetry`, `r/poetry`, Discords) — only with genuine participation. A drive-by link gets removed and can get the account banned.
  - ⛔ **Not worth doing:** directory submissions, comment links, paid "free backlink" services.
- 🤖 **Audit the remaining dynamic routes for soft 404s.** `/[genre]`, `/detail/[poemId]` and `/authors/[slug]` now answer 404 via `serverFetchResult` (status-based, so a backend blip cannot 404 the whole site). Nothing else was checked. Any page whose `getServerSideProps` swallows a failure into `null` and renders a shell is the same bug — one pass over `pages/` to confirm the list is complete.

### Performance

- 🤖 **`computeRanking()` is the heaviest thing on the like path.** A `$group` over *every* published poem (~16k) with no index able to serve it, running on **every like, create, delete and publish**, because those embed a freshly recomputed ranking in their response. It dwarfs everything the notification writes do. Options, none chosen: cache the top-10 with a short TTL and accept staleness; keep incremental per-author counters updated on the same mutations and rank from those; or accept it at this collection size. **Measure before the follower-points change lands** — that adds a `$lookup` over `follows` to this same query.
- 🤝 **PageSpeed: render-blocking CSS on mobile.** Two stylesheets, 14.2 KiB, ~450ms modelled saving. **The number that matters is 490ms for a 1.9 KiB file** — that is round-trip latency on throttled mobile, not bytes, so minifying will not help; only taking the request off the critical path will. The standard fix is Next's `experimental.optimizeCss` (Critters), which can produce a flash of unstyled content and must be verified on the DEPLOYED site. Treat "estimated savings" as modelled; the only real check is Lighthouse against production, before and after.
- 🤖 **Audit for wasted React renders.** Never done systematically. Start by *measuring* — DevTools Profiler with "record why each component rendered" — because the point is to find renders nobody suspected, and memoizing by intuition just adds noise. Suspicious first: **`AppContext`** (one object holding user/picture/isAdmin/config); **`ListItem`** (once per poem per list page — check it is `memo`'d and its props are stable); **inline arrow handlers** passed into memoized children, which defeat `memo` entirely; and **selectors** returning a new array/object without `createSelector`. **Rules: memoize only what a measurement showed**, note before/after in the commit, and remember `memo` costs a props comparison per render — a component that always gets new props is *slower* memoized.
- 🤖 **Hunt for performance problems, dead code and over-complication.** Worth its own focused sweep, and worth pointing an AI agent at with a concrete brief per area rather than "find issues", which produces confident noise. Areas: **backend query cost** (N+1 patterns, missing/duplicate indexes, aggregations that could be a find — the unindexed search regex is a known accepted trade, not a finding); **bundle size** (`@next/bundle-analyzer`; MUI and date-fns are the usual suspects); **Core Web Vitals on real pages** (Lighthouse against poemunity.com, not localhost); **dead code** (unused exports, SCSS, the legacy `User` model, `frontend/CLEANUP.md` leftovers); **duplication and over-abstraction**. **Ground rule: every finding needs a measurement or a concrete failure case before anyone changes code.**

### Code quality

- 🤖 **Finish the TypeScript migration** — `MyPoems.jsx`, `Register.jsx`, `Profile.jsx`, `MyFavouritePoems.jsx`, plus util files (`parseJWT.js`, `notifications.js`, `sortPoems.js`, `axiosInstance.js`). (`frontend/CLEANUP.md` §1)
- 🤖 **Duplicate links on poem list items** — accessibility/UX bug from `docs/PRODUCTION_CHECKLIST.md`. Verify and fix.
- 🤖 **Backend TypeScript migration** — backend is still plain JS.
- 🤖 **Dependency & tooling upkeep** — `pnpm outdated`, update ESLint, keep `pnpm audit` clean.

## 🔵 P4 — Product decisions & accepted limits

**Open decisions** (product calls, no technical blocker):

- 👤 **Eleven categories hold no poems** — `broken-heart`, `easter`, `fathers-day`, `graduation`, `mothers-day`, `success`, `sun`, `sympathy`, `teacher`, `valentines-day`, `wedding`. Three options: **seed them** (the occasion ones are exactly what people search seasonally, so they are the most valuable empty pages on the site); **drop them** from `CATEGORIES`; or **leave them** as aspirational buckets. The famous-poem corpus was scraped with its own topic vocabulary, which is why occasions are empty while `nature` has 1,630 — nobody tagged a scraped poem "Graduation". Not urgent: they are `noindex,follow` while empty and absent from the sitemap, and both reverse automatically on the first poem.
- 👤 **An author whose poems are all drafts vanishes from `/authors`** — follows from the `HAS_POEMS` filter excluding drafts. The alternative is a letter index that opens onto an empty author page.
- 👤 **Likes distribution for the simulation** — weight famous poems / themes to match each AI personality.
- 👤 **Monarch idea** — what is script vs. AI-generated, and how to invoke Claude invisibly.
- 🤖 **(Low) Authenticated "change password" endpoint + UI.** No logged-in change-password today; the only path is Forgot → emailed reset link, which resolves by `findOne({ email })`. **Only bites shared-inbox accounts** — the `testAccount: true` ones sharing an email — where the reset always hits the oldest doc (use `set-account-password.js` meanwhile). A route keyed on `req.userId` would remove the ambiguity.
- 🤖 **(Optional) Admin UI for test accounts** — a small screen for `POST /api/v1/admin/test-users`.

**Accepted limits** (decided, documented so they are not rediscovered as bugs):

- **A read notification is never retracted.** Unliking removes the row only while unread: a notification you have already seen is part of what happened to you. The visible consequence is a row saying "X liked your poem" beside a poem whose like count no longer includes them. If it ever reads as a bug rather than as history, the alternative is marking the row withdrawn — never a silent delete.
- **The `actors` array is best-effort after a retraction.** Capped at `MAX_ACTORS` (5); when a listed actor unlikes, it shrinks and cannot be refilled, because the older ids were never stored. `count` stays correct and all rendered text derives from `count`. Only matters if something tries to use `actors` as a complete list — for that, use the poem's `likes`.
- **`GET /notifications` returns no `total`.** It asks for one row more than the page instead of a second `countDocuments`, so "is there another page" is known and "how many" is not. If a count is ever wanted, bring the query back rather than inferring one.
- **My comments has no behavioural tie-break test, on purpose.** One was written and deleted: it passed with `_id` removed from both the sort spec and the index, because at fixture size the driver returns ties in a stable order anyway. A test that cannot fail is worse than none — the declared-index test carries the guarantee. Same known limit as the follow lists. Do not "restore" it without making it fail first.

## ⚠️ Standing rules (re-learned the hard way, each more than once)

- **Green CI is not a deploy.** Pushes go straight to `master` and Vercel deploys on push, so CI and the deploy *race*; the backend is not gated on tests at all; and each app builds only when its own directory changes, so a root-only commit deploys neither. A commit adding a needed backend fallback once passed CI and never deployed. Verify on the live URL — see the verification section above.
- **Layout needs a browser.** Lint, typecheck and 1,446 jest tests have passed through: a sticky rail that hid Poem of the week entirely, an unclickable button caused by an overlapping pseudo-element, a hydration mismatch from invalid HTML nesting, and a follow row sitting hard left under a centred name. jsdom cannot see geometry.
- **Every script is a production write until proven otherwise.** `MONGODB_PRE` is the same cluster and database as `MONGODB`. Dry-run first, `mongodump` first — and note `autoCreate` is a SEPARATE switch from `autoIndex` and also defaults to true, so a "read-only" script that merely requires a model creates a collection. Both must be off.
- **`autoIndex` only ever CREATES.** Adding an index to a schema builds it on deploy; removing the line never drops it, so it lives on in Atlas costing writes for a query nobody issues, invisibly, because the code no longer mentions it. Run `node backend/scripts/check-index-drift.js` (read-only, reports both directions) after any schema-index change. Every model with declared indexes must be listed in its `MODELS` array — one left off is not reported as clean, it is not reported at all, which prints identically.
- **A shared safety helper only helps the callers that reach it.** `escapeRegex` was written for `?q=`, and `?letter=` then `?genre=` each shipped raw. When a helper exists, the question is not "is this call site safe" but "how many call sites are there".
- **One list, two copies, one lossy transcription.** The 140-category taxonomy was applied to the database and then transcribed into `constants.ts` — and four entries never made it, orphaning 168 poems from search for months. Backend code cannot read the frontend constants (separate Vercel roots), so the mirror in `backend/src/data/categories.js` is guarded by `categoryDrift.test.js`, and the backend CI workflow watches `constants.ts`. Any new mirrored list needs the same treatment.
- **Red-check every new test.** Break the implementation, watch it fail, restore. Tests that pass against broken code are worse than none, and this repo has caught several in a single day — including two written during the very sessions that established this rule.

---

## ✅ Recently shipped (context — do not re-add)

**One line each, by design.** The reasoning that outlives the change lives in `AGENTS.md`; this list exists only so nobody proposes the work again.

- **Malformed query params are 400s, not 500s** (2026-08-10, from the audit) — `?userId=`, `?targetId=` and `?since=` each reached the driver unchecked and threw a CastError into a catch-all. A probe found three, not the one the audit had spotted.
- **A poem needs a title and a body** (2026-08-10, from the audit) — the API stored empty poems, which were then listed, given a detail page, and emitted into the sitemap with a slug derived from an absent title. Enforced at the route, NOT with `required` on the schema: the like route `save()`s existing documents and save validates the whole thing, so a schema rule would make any legacy poem missing a field impossible to like.
- **Escaped the `?genre=` regex** (2026-08-10, from the audit) — the third and last caller of `escapeRegex`, still raw: `?genre=.*` returned every genre from the one filter that is supposed to partition the collection, and `(a+)+$` was catastrophic backtracking on a public endpoint over 16k poems. `regexInjection.test.js` now covers all three callers.
- **Deleted the two legacy public `/users` routes** (2026-08-10, from the audit) — `GET /api/v1/users` served every legacy user document *including email* with no authentication, and `POST /api/v1/users` created an account anonymously with no rate limit or validation. Both were dead. Deleted rather than gated, and `users.test.js` now pins their absence against the DATABASE, not just the status code.
- **SEO smalls** (2026-08-10) — `WebSite` + `SearchAction` + `Organization` on the homepage (page 1 only), a `CollectionPage` on `/authors` built from the poets actually listed, a homepage `h1` that names the site rather than saying "Poems", canonicals on `/privacy` and `/terms`, and `og:image:width/height` — stated only for the site card, never for the author avatar a page may pass instead.
- **Author-page pagination** (2026-08-10) — `?page=N` on `/authors/<slug>` with the list rules (clean page 1, junk redirects, past-the-end 404, self-canonical, page number in the title), reaching the 3,381 poems (21%) that sat past page 1. **Two bugs found on the way, both in the shipped list pagination:** `/[genre]` never passed `currentPage` to `<Dashboard>`, and neither list hook re-seeded on a client-side page navigation.
- **Sitemap cache header** (2026-08-10) — `stale-while-revalidate` was sent with no value, so normalisation dropped it and `poems-famous.xml` regenerated on every crawl; now one shared `SITEMAP_CACHE_CONTROL`.
- **The address bar follows infinite scroll** (2026-08-07) — `usePageUrlSync` rewrites the URL with `replaceState` at each page boundary. Not an SEO change; crawlers already had the `<a href>` nav.
- **Paginated list URLs + author-index letters** (2026-08-07) — `?page=N` and `?letter=X` honoured server-side with real `<a>` navs; one address per view, out-of-range is 404, each page self-canonical. All 3,364 author pages linked.
- **Author pages render their links on the server** (2026-08-07) — `/authors` emitted 0 links to 3,364 author pages and each author page 0 links to its poems, both from seeding SSR props inside a `useEffect`. Guarded by `Authors.ssr.test.tsx`; RTL cannot see this class of bug.
- **Sitemap split into an index over four sections** (2026-08-07) — coverage per class instead of one number over 19,587 URLs. **The fetchers throw instead of `break`ing**: a failure is a 500, not a silently-truncated sitemap cached for a day. Poem pages fetch concurrently (~30s → ~5s); `pages` costs 136 `limit=1` probes rather than a walk of every poem.
- **Sitemap `<lastmod>`** (2026-08-06) — emitted only where it is true.
- **Header logo srcset** (2026-08-07) — no `sizes` meant next/image upscaled a 547px source to 640px for a 91px box.
- **Genre URLs and the CATEGORIES drift** (2026-07-31/08-04) — casing duplicates now 308-redirect; nonsense slugs are `notFound` (but only when backed by no poems, so the four orphan genres survive); the four missing categories (`anger`, `imagination`, `spirituality`, `sports` — 168 poems orphaned from search) added; genre validated server-side on both write routes; and the frontend/backend category lists guarded by `categoryDrift.test.js`. See Standing rules for the root cause.
- **Server-owned poem fields** (2026-07-31) — `likes`/`date`/`origin`/`userId` are admin-only on both write routes; `Poem` is `strict: false`, so the old spread persisted anything sent. `poemFieldAllowlist.test.js` asserts on what was PERSISTED, not the status code — which is how it survived a green suite.
- **The Drafts tab has a search box** (2026-08-04) — no backend change: `?q=` composes under `$and` and the session scoping is applied last, so it cannot be widened by a query param.
- **Comments RECEIVED, alongside written** (2026-08-04) — three sources including **replies to you anywhere**, which was reachable nowhere before.
- **Reply notifications** (2026-08-04) — `parentId` was stored from the first commit and never read.
- **Profile-comment notifications** (2026-08-04) — comments on an author page notified NOBODY, which is what actually caused the "preference that would not persist" mystery. **The wrong diagnosis is the lesson**: it was investigated as a client-side persistence bug for an hour before anyone asked WHERE the comment was.
- **"Join Poemunity" sidebar panel + mobile line** (2026-08-04) — signed-out only; every promise is something an account genuinely unlocks.
- **Notification settings behind a button beside "Edit profile"** (2026-08-04) — three arrangements preceded it; the worst put them below infinitely-scrolling tab panels.
- **Breadcrumbs: top-left, one label instead of three** (2026-08-04).
- **Dashboard rails balanced** (2026-08-04) — left 21%, right 20%, so nothing page-centred lined up with anything column-centred.
- **Comments aligned to the poem card** (2026-08-04) — the `$bp-xl` width rule named the poem block but not the comments.
- **My comments tab** (2026-08-04) — session-scoped; comments whose poem was deleted or withdrawn are dropped rather than linked to a 404.
- **Notifications: mark-read never sent its request** (2026-08-04) — `options: { fetch: false }` skipped the axios call, so nothing was ever marked read.
- **Notifications: unlike retracts its notification** (2026-08-04), while unread only. **Per-row timestamps** from `updatedAt`. **10 per page, one query instead of two.** **Independent, optimistic preference checkboxes** (a shared `disabled` greyed out all four). **Email announced as "Soon"**, bound to no state.
- **Profile stats panel** (2026-08-04) — rank read from the ranking already cached for the sidebar, so the two cannot disagree.
- **Perf: notification fan-out fetches preferences once** (2026-08-04) — 3 serial round trips per follower became 1 + 2N.
- **Perf: author listings count by grouping poems** (2026-08-04) — 98ms → 43ms; `?letter=` keeps the per-author `$lookup`, where it is 8x faster.
- **Security: `?letter=` regex escaped** (2026-08-04) — raw interpolation on a public endpoint was a ReDoS vector; `escapeRegex` moved to `utils/`. Two of its tests were hollow on the first pass: proving a pattern is literal needs an author whose name literally contains it.
- **Follow / followers** (2026-07-31) — `Follow` edge collection, unique `{follower, following}` index mapping E11000 to success, counts and `isFollowing` riding on `GET /authors/:slug`.
- **Notifications** (2026-07-31) — collapsed in storage, preference toggles, header bell with an unpolled badge.
- **Drafts** (2026-07-31) — `Poem.status` defaulted and never backfilled, so "published" means published OR ABSENT; one visibility fragment composed by every public read.
- **Cypress suite repaired: 34/34** (2026-07-30), up from 1 passing, now its own CI workflow.
- **Hydration mismatch on `/profile`** (2026-07-30) — `TabPanel` wrapped flow content in a `<p>` via MUI `Typography`; found by bisection, not DOM comparison, which cannot see it after React recovers.
- **Comment delete "×" unclickable between 1200–1310px** (2026-07-30) — found by Cypress with lint, typecheck and 990 jest tests green.
- **Poem text cleanup** (2026-07-30) — 1,962 titles, 885 bodies, 1,433 slugs; old slugs live on in `slugHistory`.
- **Next-poem index + orphan cleanup** (2026-07-30) — two orphaned indexes dropped; `check-index-drift.js` now reports drift.
- **Poem of the week** (2026-07-29) — derived from the week number, no cron and no stored state; a large prime stride stops consecutive picks reading as broken curation.
- **Own comments system, replacing Disqus** — first-party end to end, which is what made AI-authored and profile comments possible. Closed; do not reopen.
- **Server-backed search** (2026-07-28) — `?q=` over titles and author names, unanchored on purpose.
- **Fixed the flaky backend suite** (2026-07-28) — supertest's per-request `app.listen(0)` binds the wildcard address, so the suite talked to other processes.
- **Backend lint clean and gated in CI** (2026-07-27/28) — the old `--fix` default would have passed a hollow gate.
- **Email + auth** (2026-07-27) — Resend infra, password reset, verification, `passwordChangedAt` session revocation, admin test accounts; live in prod with `REQUIRE_EMAIL_VERIFICATION=true`.
- **Prod deployment verified** (2026-07-27) — SSR, assets, API, CORS, env vars and login confirmed live.
- **Database backup + restore drill** (2026-07-27) — full `mongodump` archived off-repo and proven to restore with matching counts.
- **Prod email migration** (2026-07-27) — 11 users verified, 3,370 authors stamped `testAccount:false`, `email_1` rebuilt as a partial unique index.
- **Single-step AI generator** (2026-07-27) — idempotent and dry-run by default.
- **Normalized Redux store** — authors and poems live once in `createEntityAdapter` stores; list caches hold ids.
- **Ranking is server-computed** and returned fresh by every mutation that changes points.
- **CI installs with `pnpm --frozen-lockfile`**; branch protection blocks force-push and deletion on `master`.
- **Brand refresh** — fixed `og-image.png` being caught by a blanket `*.png` gitignore and never deploying.
- **`set-account-password.js`** — sets a password from a hidden prompt, for accounts unreachable via the email reset flow.
- **Absolute `og:image`/`twitter:image`** — relative paths are ignored by social scrapers.

## 📚 Reference docs

- `AGENTS.md` — the durable reasoning behind everything above (and `CLAUDE.md` just imports it).
- `frontend/CLEANUP.md` — full frontend cleanup plan (testing, deps, refactors).
- `docs/PRODUCTION_CHECKLIST.md` — launch checklist (mostly complete).
- `docs/NEXTJS_MIGRATION.md` — Next.js migration status.
- `docs/AI_COMMUNITY_SIMULATION.md` — AI activity seed plan + scripts.
- `docs/DATABASE_BACKUP_RESTORE.md` — Atlas backup/restore drill.
- `docs/EMAIL_AUTH_PLAN.md` — email/auth design (local-only, gitignored).
- `backend/scripts/*-plan.md`, `*-progress.md` — historical migration notes.

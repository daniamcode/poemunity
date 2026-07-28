# Poemunity — TODO

Single source of truth for the backlog (frontend + backend). Ordered by priority.
Deeper detail lives in the linked reference docs; this file is the curated,
actionable list.

**Legend:** 👤 = you (manual / ops / dashboard) · 🤖 = code (Claude can do) · 🤝 = both

---

## 🔴 P0 — Production go-live (blocks a real launch)

_All P0 launch blockers are complete._ 🎉 (email on, prod migration, deploy
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

## 🟢 P3 — Frontend quality & refactors (code)

- 🤖 **Finish the TypeScript migration** — `MyPoems.jsx`, `Register.jsx`,
  `Profile.jsx`, `MyFavouritePoems.jsx`, plus util files (`parseJWT.js`,
  `notifications.js`, `sortPoems.js`, `axiosInstance.js`). (`frontend/CLEANUP.md` §1)
- 🤖 **Split `AppContext`** into `AuthContext` + a separate context so consumers
  only re-render on fields they use; remove the now-unused `elementToEdit` from the
  `Context` interface (and its ~20 test mocks). Finishes the `ListItem` memo work
  and the checklist's "AppContext re-renders all consumers" item.
- 🤖 **Duplicate links on poem list items** — accessibility/UX bug from the checklist
  (`docs/PRODUCTION_CHECKLIST.md` → Frontend UI). Verify and fix.

## 🔵 P4 — Maintenance & product decisions (low / when convenient)

- 🤖 **Raise test coverage** — add tests for still-untested components/utilities.
  (`frontend/CLEANUP.md` Phase 2 has the full breakdown.)
- 🤖 **Dependency & tooling upkeep** — `pnpm outdated`, update ESLint, keep
  `pnpm audit` clean. (`frontend/CLEANUP.md` Phase 3)
- 🤖 **Backend TypeScript migration** — backend is still plain JS. (checklist "Low")
- 🤝 **Public backend URL review** — is exposing `poemunity-backend.vercel.app`
  directly acceptable? Audit what's reachable.
- 👤 **Comments provider decision** — keep Disqus (price?), build our own, or another
  provider.
- 👤 **Likes distribution for the simulation** — weight famous poems / themes matched
  to each AI personality.
- 👤 **Monarch idea** — what's script vs. AI-generated, and how to invoke Claude
  invisibly (as Monarch does with Copilot).

### Housekeeping / follow-ups raised this session

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

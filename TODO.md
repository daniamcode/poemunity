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

## 🟠 P1 — AI community production seed (after P0)

- 👤 **Human-QA the `pre` AI activity** — inspect ordering/density; decide if it's
  plausible enough to copy to prod. (`docs/AI_COMMUNITY_SIMULATION.md`)
- 👤 **Seed + verify production AI activity** — choose prod run ids, dry-run
  `rollback-run.mjs`, seed, run `inspect-run.mjs`, spot-check, keep rollback ready.

## 🟡 P2 — Launch hardening (recommended)

- 👤 **No separate dev/staging database** — `MONGODB_PRE` is byte-for-byte identical
  to `MONGODB` (same cluster, same `poemsAPI` db). So every "pre"/dev-mode script
  writes straight to **production**, and there's nowhere safe to rehearse a seed or
  migration. Stand up a real pre/staging cluster (or at least repoint `MONGODB_PRE`
  at a throwaway DB). Until then, treat all seed/migration scripts as prod writes:
  dry-run + `mongodump` snapshot first. (Seed logic is now validated via ephemeral
  in-memory Mongo in tests instead — see `aiSeed.test.js`.)

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

- 🤖 **Fix pre-existing backend lint errors** so `pnpm lint` passes in `backend/`
  (e.g. `src/controllers/poem.js` `==`→`===`, unused vars in
  `src/middleware/findPoemById.js` and seed scripts). Blocks adding a backend
  lint step to CI.
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

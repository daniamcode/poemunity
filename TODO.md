# Poemunity — TODO

Single source of truth for the backlog (frontend + backend). Ordered by priority.
Deeper detail lives in the linked reference docs; this file is the curated,
actionable list.

**Legend:** 👤 = you (manual / ops / dashboard) · 🤖 = code (Claude can do) · 🤝 = both

---

## 🔴 P0 — Production go-live (blocks a real launch)

- 👤 **Turn email on** — verify `poemunity.com` in Resend (SPF/DKIM), then set
  `RESEND_API_KEY` + `EMAIL_FROM` in the backend Vercel project. Until then all
  sends safely no-op.
- 👤 **Production deployment verification** (the one remaining hard blocker in the
  checklist — see `docs/PRODUCTION_CHECKLIST.md` → "Final Manual Steps" and
  `docs/NEXTJS_MIGRATION.md` Phase 8):
  - Verify Vercel env vars — frontend `NEXT_PUBLIC_API_URL` → prod backend, remove
    stale `NEXT_PUBLIC_ADMIN`; backend `MONGODB`, `SECRET`, `REACT_APP_ADMIN`,
    `FRONTEND_URL` (exact prod origin, no trailing slash), `NODE_ENV=production`.
  - Confirm backend CORS allows the prod frontend origin (and rejects others).
  - `curl` the homepage, a genre page, a poem detail, `/privacy`, `/terms` to
    confirm real SSR HTML; check `/sitemap.xml`; check one Open Graph preview.
- 👤 **Database safety** — enable MongoDB Atlas Cloud Backup, run the restore drill
  in `docs/DATABASE_BACKUP_RESTORE.md`, and take an on-demand snapshot before any
  bulk production write.

## 🟠 P1 — AI community production seed (after P0)

- 👤 **Human-QA the `pre` AI activity** — inspect ordering/density; decide if it's
  plausible enough to copy to prod. (`docs/AI_COMMUNITY_SIMULATION.md`)
- 👤 **Seed + verify production AI activity** — choose prod run ids, dry-run
  `rollback-run.mjs`, seed, run `inspect-run.mjs`, spot-check, keep rollback ready.

## 🟡 P2 — Launch hardening (recommended)

- 🤝 **Flip `REQUIRE_EMAIL_VERIFICATION=true`** once email is confirmed working, to
  gate publishing behind a verified email (backend `requireVerified` middleware).
- 🤝 **Applitools CI** — accept the known baselines in the Applitools dashboard (👤),
  then switch `eyes.closeAsync()` → `eyes.close()` in `frontend/selenium/visual.spec.ts`
  so visual diffs fail the run (🤖).
- 👤 **Toast QA in the browser** — comment post/reply/delete, poem like-failure,
  delete, create/save. (A regression test already guards `manageError` against
  `[object Object]`.)
- 🤖 **Authenticated "change password" endpoint + UI** — today the only way to
  change a password is Forgot → emailed reset link, and that resolves the account
  by `findOne({ email })` (`password.js`). With accounts sharing an inbox (admin
  test accounts) this is ambiguous — it only ever hits the oldest doc for that
  email, so any other account on the same email can't reset via the UI. Add a
  logged-in change-password route that targets `req.userId` (verify current
  password, set new hash, bump `passwordChangedAt`) plus a Profile UI, so
  password changes don't depend on email uniqueness/ordering.

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
- 🤖 **Stop tracking `frontend/tsconfig.tsbuildinfo`** — it's a build artifact that
  churns on every build; add it to `.gitignore` and `git rm --cached` it.
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

## 📚 Reference docs

- `frontend/CLEANUP.md` — full frontend cleanup plan (testing, deps, refactors).
- `docs/PRODUCTION_CHECKLIST.md` — launch checklist (mostly complete).
- `docs/NEXTJS_MIGRATION.md` — Next.js migration status (Phase 8 = prod deploy verify).
- `docs/AI_COMMUNITY_SIMULATION.md` — AI activity seed plan + scripts.
- `docs/DATABASE_BACKUP_RESTORE.md` — Atlas backup/restore drill.
- `docs/EMAIL_AUTH_PLAN.md` — email/auth design (local-only, gitignored).
- `backend/scripts/*-plan.md`, `*-progress.md` — historical migration notes.

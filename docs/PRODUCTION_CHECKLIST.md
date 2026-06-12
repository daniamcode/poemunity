# Production Readiness Checklist

Audit performed on 2026-05-16. Issues ordered by severity.

---

## Current Launch Gate — 2026-06-12

**Status: not ready for production yet.** The original Critical items are checked off, and the repo-solvable blockers reviewed on 12 June 2026 are now implemented. The remaining no-go is production deployment verification against the real Vercel/Atlas dashboard state and real production URLs.

### Final Manual Steps Before Production

Do these in order. Do not seed production AI activity until the deployment and backup steps are complete.

1. **Verify Vercel environment variables**
   - Frontend project: `NEXT_PUBLIC_API_URL` points to the production backend URL.
   - Frontend project: remove stale `NEXT_PUBLIC_ADMIN` if it still exists.
   - Backend project: `MONGODB`, `SECRET`, `REACT_APP_ADMIN`, `FRONTEND_URL`, and `NODE_ENV=production` are set.
   - Backend `FRONTEND_URL` exactly matches the production frontend origin, with no trailing slash.

2. **Verify Vercel deployment gates**
   - Trigger/inspect a frontend deploy and confirm Vercel runs `pnpm lint && pnpm typecheck && pnpm test --no-coverage && pnpm build`.
   - Trigger/inspect a backend deploy and confirm Vercel runs `npm test`.
   - Enable GitHub branch protection for the production branch so required checks must pass before merge.

3. **Verify production HTTP behavior**
   - Confirm backend CORS allows the production frontend origin and does not allow random origins.
   - Confirm `/api/v1/poems?page=1&limit=1&orderBy=Likes` responds from the production backend.
   - Confirm the frontend API proxy/session routes work after login: `/api/auth/session` and `/api/backend/...`.

4. **Verify SSR and SEO on real production URLs**
   - Use `curl`, not only a browser, to confirm the homepage, a genre page, a poem detail page, `/privacy`, and `/terms` render useful HTML.
   - Check the default social preview and at least one poem detail URL in an Open Graph preview tool.
   - Confirm `/sitemap.xml` includes `/privacy`, `/terms`, authors, genres, and real poem/detail URLs.

5. **Complete database safety checks**
   - Confirm MongoDB Atlas Cloud Backup is enabled for production.
   - Complete the restore drill in `docs/DATABASE_BACKUP_RESTORE.md` against a temporary cluster.
   - Create an on-demand Atlas snapshot immediately before production AI seeding or any other bulk production write.

6. **Human QA the pre AI activity**
   - Inspect the pre homepage ordered by likes and the known detail examples from `docs/AI_COMMUNITY_SIMULATION.md`.
   - Decide whether the current density feels plausible enough to copy to production.
   - If it feels too dense or repetitive, adjust the production run plan before writing anything to prod.

7. **Prepare the production AI seed**
   - Choose production-only run ids, for example `prod-seed-activity-v1` and `prod-seed-activity-v1.1-likes`.
   - Run `rollback-run.mjs` as a dry-run against production with those run ids to verify connectivity and the rollback command.
   - Write down the exact seed commands before running them.

8. **Seed and verify production AI activity**
   - Run the production seed only after the checklist above is complete.
   - Run `inspect-run.mjs` for every production run id.
   - Spot-check production homepage ordering, likes, comments, replies, profile comments, timestamps, and legal links.
   - Keep the rollback command ready; execute it only if production QA fails.

### Hard blockers before production

- [x] **Legal pages and AI disclosure are implemented**
  - Added `/privacy` and `/terms`.
  - Linked both pages, plus a direct AI activity anchor, from the fixed header and site footer. Header links are required because infinite scroll can make the footer unreachable.
  - Added AI-assisted community activity clauses to both Privacy Policy and Terms of Service.
  - Added `/privacy` and `/terms` to `sitemap.xml`.
  - Contact details intentionally omitted from the policy copy.

- [x] **Auth migration no longer depends on `localStorage`**
  - Removed `loggedUser` / `localStorage` reads and writes from login, logout, header hydration, profile updates, Cypress helpers, and Selenium visual setup.
  - Added `/api/auth/session` so static pages can hydrate safe user fields from the httpOnly cookie without exposing the JWT.
  - Added `/api/backend/[...path]` Next.js proxy; browser API calls use the frontend-origin cookie, and the proxy forwards `Authorization` to Express server-side.
  - Updated Express `userExtractor` to accept either bearer tokens or the `token` cookie.
  - Shared backend token signing now keeps profile/picture/admin fields consistent after refreshes.

- [x] **CSRF posture is documented and guarded**
  - Decision: keep auth cookie `SameSite=Lax` for launch UX instead of `Strict`.
  - Added same-origin `Origin` checks for unsafe Next.js API routes (`POST`, `PUT`, `PATCH`, `DELETE`) in `/api/auth/login`, `/api/auth/logout`, and `/api/backend/[...path]`.
  - Cross-origin unsafe requests now return `403` before reaching the backend proxy; same-origin unsafe requests continue to backend auth and return normal auth/application responses.

- [ ] **Production deployment verification is incomplete**
  - `docs/NEXTJS_MIGRATION.md` Phase 8 still has unchecked items: Vercel env vars, backend CORS for the production frontend domain, SSR curl verification, and social preview verification.
  - Do not assume Vercel dashboard state from repo files; verify it in Vercel before launch.

- [x] **Database backup/restore plan is documented**
  - Added `docs/DATABASE_BACKUP_RESTORE.md`.
  - Launch still requires a real Atlas restore drill and an on-demand snapshot before production AI seeding.

- [x] **Vercel deploys have repo-level quality gates**
  - `frontend/vercel.json` runs `pnpm lint && pnpm typecheck && pnpm test --no-coverage && pnpm build`.
  - `backend/vercel.json` runs `npm test`.
  - GitHub branch protection is still recommended so broken branches cannot be merged, but Vercel now blocks its own deploy when the configured gate fails.

- [x] **Production AI seed has rollback**
  - Pre has been seeded (`seed-activity-v1`, `seed-activity-v1.1-likes`), production has not.
  - Added `backend/scripts/simulation/rollback-run.mjs`; dry-run verified against pre with the exact known counts (`216` comments, `1785` broad likes, `440` boosted likes).
  - Production rollback requires `--execute --confirm-production`.

### Documentation findings from this review

- `README.md` had stale frontend env var guidance. `NEXT_PUBLIC_ADMIN` is no longer used by app code for admin decisions; the backend still needs `REACT_APP_ADMIN` / `REACT_APP_ADMIN_PRE`.
- `backend/TODO.md` now points at the implemented AI simulation checkpoint and remaining production/manual work.
- `docs/NEXTJS_MIGRATION.md` is mostly complete but Phase 8 remains the production deploy checklist.

---

## 🚨 Critical — Fix Before Going Live

- [x] **Weak JWT secret** (`s3cr3t` is 6 chars, guessable)
  - `backend/.env:3`
  - Generate a strong secret: `openssl rand -base64 32` → store in Vercel env vars, never commit

- [x] **DB credentials committed to .env**
  - `backend/.env` is gitignored (not tracked). Created `backend/.env.example` to document all required vars.

- [x] **Backend has no ownership check on poem edit / delete**
  - `backend/src/controllers/poem.js:50-83`
  - The frontend correctly guards edit/delete behind `isOwner` (`ListItem.tsx:25`), but the API itself does not verify ownership — any authenticated user can PATCH or DELETE any poem via a raw HTTP request (curl, Postman, etc.)
  - Add ownership check in the controller before update/delete: `if (String(poem.authorId) !== req.userId) return res.status(403).json({ error: 'Forbidden' })`

- [x] **`{ $set: req.body, strict: false }` allows arbitrary field injection**
  - `backend/src/controllers/poem.js:57`
  - Whitelist allowed fields explicitly: `{ $set: { title, poem, genre, origin } }`

- [x] **Bulk `PATCH /poems` has no authentication**
  - `backend/src/controllers/poems.js` — added `userExtractor` + admin ID check; returns 403 for non-admins

- [x] **Disqus config hardcoded to `localhost:3000`**
  - Disqus removed from codebase; replaced by custom `CommentsSection` component. No longer applicable.

- [x] **No rate limiting on login / register**
  - `backend/app.js` — added `express-rate-limit`: 5 req/15 min on `/api/v1/login`, 3 req/hour on `/api/v1/register`

---

## 🔴 High — Strongly Recommended Before Launch

- [x] **No security headers** (XSS, clickjacking, HSTS, CSP all unset)
  - `backend/app.js` — `helmet` installed and added; `morgan` HTTP logging wired up (skipped in test env)

- [x] **CORS falls back to `localhost` if env var missing**
  - `backend/app.js` — throws on startup if `FRONTEND_URL` is not set when `NODE_ENV=production`

- [x] **Admin ID exposed in the frontend bundle**
  - `NEXT_PUBLIC_ADMIN` removed from `frontend/.env`. JWT now carries `isAdmin: boolean`; all frontend admin checks use `context.isAdmin` instead of ID comparison.

- [x] **No input validation on register / login**
  - `backend/src/controllers/register.js` — added: username 3–30 chars, password ≥ 8 chars (email format was already validated)

- [x] **Raw error objects sent to the client** (may leak stack traces)
  - `backend/src/controllers/poem.js` — like endpoint now returns `{ error: 'Failed to update poem' }` instead of the raw error object

- [x] **No logging or error monitoring**
  - `morgan` added to `backend/app.js` (HTTP request logging). Sentry integration still optional / not yet added.

- [x] **GitHub Actions use deprecated action versions**
  - `.github/workflows/*.yml`
  - Bump `actions/checkout` → `@v4`, `actions/setup-node` → `@v4`, `node-version` `13.x` → `20.x`

- [x] **Known dependency vulnerabilities likely present**
  - Moved `forever`, `jest`, `nodemon`, `supertest` to `devDependencies` in `backend/package.json`. `pnpm audit --prod` now reports 0 vulnerabilities.

---

## 🟡 Medium — Address Before or Shortly After Launch

- [x] **JWT tokens stored in `localStorage`** (XSS can steal them)
  - Removed the legacy `localStorage` fallback. Browser auth now uses the httpOnly `token` cookie plus Next.js session/proxy routes.

- [x] **No CSRF protection**
  - Kept `SameSite=Lax` intentionally and added same-origin `Origin` checks on unsafe Next.js API routes.

- [ ] **No email verification on register**
  - Send confirmation link; block login until verified

- [x] **No Privacy Policy or Terms of Service** (GDPR requirement)
  - Added `/privacy` and `/terms`; linked from footer; AI-assisted community activity is disclosed in both pages.

- [x] **Database backup strategy documented**
  - Added `docs/DATABASE_BACKUP_RESTORE.md`; launch still needs a completed Atlas restore drill

---

## 🟢 Low — Nice to Have

- [x] **SEO meta tags are sparse** (`og:image`, `description`, `canonical` missing on most pages)
  - `react-helmet` removed; replaced with Next.js `<Head>` via shared `SeoHead` component — `og:title`, `og:description`, `og:image`, `canonical`, and `robots.txt` added across all pages

- [x] **Unused backend dependencies** (`passport`, `passport-local`, `mssql`, `ejs`, `csv-parse`)
  - Removed from `backend/package.json`

- [x] **Legacy `User.js` model still in codebase** (superseded by `Author.js`)
  - Cannot delete yet — still used as a fallback in `poems.js` (pre-migration poems) and in `users.js` legacy routes; deprecation comment added. Safe to remove only after a DB migration moves all `users` collection documents into `authors`.

- [x] **No API versioning** (`/api/v1/`)
  - All routes now mounted at `/api/v1/` in `backend/app.js`; frontend constants and all hardcoded paths updated accordingly

- [ ] **Backend is plain JS while frontend is TypeScript**
  - Optional: migrate backend controllers to `.ts` for consistency

---

## 🖥️ Frontend — UX & Flows

- [x] **No feedback on failed login**
  - `Login.tsx` — error state wired up: 401 shows "Invalid username or password", 429 shows the rate-limit message, network failures show a generic retry message

- [x] **No feedback on failed registration**
  - `Register.tsx` — client-side validation shows rules as you type; server errors (duplicate username/email, etc.) surfaced via `role="alert"` paragraph

- [x] **No confirmation before poem deletion**
  - `PoemActions.tsx` — first click opens an inline dialog ("Delete this poem? / Cancel / Delete"); `onDelete` only fires after confirming

- [x] **Empty state missing when no poems match filters/search**
  - `List.tsx` — shows "No poems found. Try adjusting your filters." when `!isError && !isLoading && poems.length === 0`

- [x] **No error state when data fetch fails**
  - `List.tsx`, `Detail.tsx`, `Ranking.tsx` — all show an error message with a "Try again" retry button; `isError` sourced from Redux state that was already tracked but never read

---

## 🎨 Frontend — UI & Visual

- [x] **Silver ranking badge fails contrast ratio**
  - `frontend/src/components/Ranking/Ranking.scss` — `#bdc3c7` on white is ~1.6:1, well below AA 4.5:1
  - Added `$color-rank-silver: #7f8c8d` to `_variables.scss`; rank `&--2` now uses it (4.48:1 on white, passes AA)

- [x] **`#aaa` placeholder/empty text fails contrast**
  - `frontend/src/components/Profile/Profile.scss` (`.user-info__bio--empty` and similar)
  - Added `$color-text-accessible-muted: #767676` to `_variables.scss`; replaced `#aaa`, `#888`, `#999` in `.user-info__bio--empty`, `.privacy-toggle--private`, and `.user-info__hint`

- [x] **Inconsistent spacing scale across components**
  - Header uses 20px, List intro uses 15-30px, Detail uses 40px — no shared scale
  - Variables already defined (`$space-1`–`$space-9` + named aliases). Replaced hardcoded px values with scale tokens across `Profile.scss`, `List.scss`, `Header.scss`, and `Register.scss`; values within ≤2px of a scale step were rounded in

- [x] **No branding visible on mobile**
  - `frontend/src/components/Header/Header.scss` — logo hidden below 900px
  - Brand text ("Poemunity") now visible at all screen sizes; icon revealed at 900px+; font scaled 22px (mobile) → 35px (900px+) → 50px (1200px+); icon-dependent negative margins moved into the 900px breakpoint

- [ ] **Duplicate links on poem list items**
  - `frontend/src/components/ListItem/components/PoemHeader.tsx` — avatar and name are separate links to the same author page
  - Wrap both in a single `<Link>` to avoid redundant tab stops

---

## 📱 Frontend — Responsiveness

- [x] **Poem detail article width breaks on tablets**
  - `frontend/src/components/Detail/Detail.scss` — `width: 50%` was already replaced in a prior refactor; current code uses `width: 90vw; max-width: 800px` which is responsive at all sizes. No further change needed.

- [x] **PageNotFound fixed dimensions overflow on mobile**
  - `frontend/src/components/PageNotFound/PageNotFound.scss` — replaced `width: 500px; height: 500px` with `max-width: 500px; width: 100%` + padding so it scales on small screens

- [x] **No breakpoint below 600px on list/dashboard layout**
  - `frontend/src/components/List/List.scss`, `Dashboard.scss` — added `@media (max-width: $bp-sm)` block: reduced `.list__intro` padding, uncapped search input width, full-width sort selects; dashboard margin removed at mobile

- [x] **Header layout gap between 600px and 900px**
  - `frontend/src/components/Header/Header.scss` — resolved together with the "no branding on mobile" item above; brand text now shows at all widths, closing the 600-900px gap

---

## ⚡ Frontend — Performance

- [x] **`ListItem` not memoized — re-renders entire list on any state change**
  - `frontend/src/components/ListItem/ListItem.tsx`
  - Wrap with `React.memo()` — critical for infinite scroll lists

- [x] **Event handlers in `List` recreated on every render**
  - `frontend/src/components/List/List.tsx:47-71` — `handleOrderChange`, `handleOriginChange`, `handleSearchChange` are new functions each render
  - Wrap with `useCallback`

- [x] **No route-based code splitting**
  - `frontend/src/App.tsx:4-12` — all pages imported statically in one bundle
  - Use `React.lazy()` + `<Suspense>` for Dashboard, Detail, Profile, Register

- [ ] **Comments fetch fires on mount even if user never scrolls to comments**
  - Disqus removed; no third-party script concern. But `CommentsSection` is still mounted eagerly — `useComments` calls `fetchComments()` immediately via `useEffect`, making an API request on every poem detail load regardless of scroll position.
  - Use `IntersectionObserver` (or a `useIntersection` hook) in `Detail.tsx` to defer mounting `<CommentsSection>` until the user scrolls near the bottom of the poem. The sentinel ref pattern already used for infinite scroll (`useInfiniteScroll`) is a good model.

- [x] **Profile/avatar images not lazy-loaded**
  - `frontend/src/components/Header/Header.tsx:98`, `ListItem/components/AuthorAvatar.tsx`
  - Add `loading="lazy"` to all `<img>` tags

- [ ] **`AppContext` re-renders all consumers on any field change**
  - `frontend/src/App.tsx:70-78` — single context object; changing `username` re-renders everything reading `adminId`
  - Split into `AuthContext` (auth/user) and a separate context for rarely-changing data, or use `useReducer`

---

## ♿ Frontend — Accessibility

- [x] **Email fields use `type="text"` instead of `type="email"`**
  - `Register.tsx` fixed. `Login.tsx` — login uses username, not email, so no change needed there.

- [ ] **Like/unlike icons are divs — not keyboard accessible**
  - `frontend/src/components/ListItem/components/PoemFooter.tsx:36-42`
  - Replace `<div onClick>` with `<button>` elements so they're reachable by Tab and activatable with Enter/Space

- [ ] **Login, logout, profile icon buttons have no accessible label**
  - `frontend/src/components/Header/Header.tsx`
  - Add `aria-label="Log in"`, `aria-label="Log out"`, `aria-label="Your profile"` respectively

- [ ] **No visible focus indicators on interactive elements**
  - Multiple SCSS files — `:hover` states defined but no `:focus-visible` styles
  - Add `outline: 2px solid #3498db; outline-offset: 2px` to all interactive elements

- [ ] **Delete and edit icons not keyboard reachable**
  - `frontend/src/components/ListItem/components/PoemActions.tsx:19-27`
  - Wrap MUI icon components in `<button>` elements

- [ ] **No skip-navigation link**
  - Keyboard users must tab through the entire header on every page
  - Add a visually hidden "Skip to main content" link as the first focusable element

- [ ] **Ranking list not semantically marked up**
  - `frontend/src/components/Ranking/Ranking.tsx:49-72`
  - Wrap rank items in `<ol>` + `<li>` so screen readers announce position

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 7 |
| High | 8 |
| Medium | 5 |
| Low | 5 |
| Frontend UX | 5 |
| Frontend UI/Visual | 5 |
| Frontend Responsiveness | 4 |
| Frontend Performance | 6 |
| Frontend Accessibility | 7 |

**Hard blockers for launch:** as of 2026-06-12, use the [Current Launch Gate](#current-launch-gate--2026-06-12) at the top of this document. The original Critical code-security items are checked off, and the repo-solvable legal/auth/CSRF/CI/backup/rollback items are implemented. Production is still no-go until the real deployment verification and Atlas restore drill are completed or explicitly accepted.

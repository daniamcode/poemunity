# Production Readiness Checklist

Audit performed on 2026-05-16. Issues ordered by severity.

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

- [ ] **JWT tokens stored in `localStorage`** (XSS can steal them)
  - `httpOnly` cookie auth added (Phase 3); `localStorage` still present as legacy fallback — remove it to complete the migration

- [ ] **No CSRF protection**
  - Once on `httpOnly` cookies, enforce `SameSite=Strict`

- [ ] **No email verification on register**
  - Send confirmation link; block login until verified

- [ ] **No Privacy Policy or Terms of Service** (GDPR requirement)
  - Create `/privacy` and `/terms` pages; link from footer

- [ ] **No database backup strategy documented**
  - Enable automated backups in MongoDB Atlas; document restore steps

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

- [ ] **No feedback on failed login**
  - `frontend/src/components/Header/Login.tsx:34-41` — error callback is commented out; user gets no message on wrong credentials
  - Uncomment and wire up error state; display inline error below the form

- [x] **No feedback on failed registration**
  - `Register.tsx` — client-side validation shows rules as you type; server errors (duplicate username/email, etc.) surfaced via `role="alert"` paragraph

- [ ] **No confirmation before poem deletion**
  - `frontend/src/components/ListItem/components/PoemActions.tsx:20-26`
  - A single click permanently deletes a poem; add a confirmation dialog

- [ ] **Empty state missing when no poems match filters/search**
  - `frontend/src/components/List/List.tsx:93-95`
  - When `!isLoading && poems.length === 0`, show a friendly "No poems found" message

- [ ] **No error state when data fetch fails**
  - `frontend/src/components/List/List.tsx`, `Detail.tsx`, `Ranking.tsx`
  - App fails silently on network errors; add an error message with a retry option

---

## 🎨 Frontend — UI & Visual

- [ ] **Silver ranking badge fails contrast ratio**
  - `frontend/src/components/Ranking/Ranking.scss` — `#bdc3c7` on white is ~1.6:1, well below AA 4.5:1
  - Use `#7f8c8d` or darker for the silver rank badge

- [ ] **`#aaa` placeholder/empty text fails contrast**
  - `frontend/src/components/Profile/Profile.scss` (`.user-info__bio--empty` and similar)
  - Use at least `#767676` (AA minimum) for grey text on white

- [ ] **Inconsistent spacing scale across components**
  - Header uses 20px, List intro uses 15-30px, Detail uses 40px — no shared scale
  - Define SCSS spacing variables (`$space-sm`, `$space-md`, etc.) and apply uniformly

- [ ] **No branding visible on mobile**
  - `frontend/src/components/Header/Header.scss:219-230` — logo hidden below 900px
  - Show at minimum the text "Poemunity" on small screens

- [ ] **Duplicate links on poem list items**
  - `frontend/src/components/ListItem/components/PoemHeader.tsx` — avatar and name are separate links to the same author page
  - Wrap both in a single `<Link>` to avoid redundant tab stops

---

## 📱 Frontend — Responsiveness

- [ ] **Poem detail article width breaks on tablets**
  - `frontend/src/components/Detail/Detail.scss:124` — `width: 50%` with no tablet breakpoint
  - Add `@media (max-width: 1200px) { width: 100%; }`

- [ ] **PageNotFound fixed dimensions overflow on mobile**
  - `frontend/src/components/PageNotFound/PageNotFound.scss:7-14` — `width: 500px; height: 500px` fixed
  - Change to `max-width: 500px` and remove the fixed height

- [ ] **No breakpoint below 600px on list/dashboard layout**
  - `frontend/src/components/List/List.scss`, `Dashboard.scss` — smallest breakpoint is 900px
  - Add `@media (max-width: 600px)` rules for single-column mobile layout

- [ ] **Header layout gap between 600px and 900px**
  - `frontend/src/components/Header/Header.scss` — logo disappears below 900px with no fallback between 600-900px
  - Add an intermediate 768px breakpoint

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

- [ ] **Disqus comment thread blocks initial page paint**
  - `frontend/src/components/Detail/Detail.tsx:59`
  - Lazy-load Disqus only when the user scrolls near the comments section

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

**Hard blockers for launch:** items marked Critical — especially the ownership check on poem edit/delete (#3), the field injection via `strict: false` (#4), and the weak JWT secret (#1). These can be actively exploited from day one on a public domain.

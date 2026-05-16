# Production Readiness Checklist

Audit performed on 2026-05-16. Issues ordered by severity.

---

## 🚨 Critical — Fix Before Going Live

- [ ] **Weak JWT secret** (`s3cr3t` is 6 chars, guessable)
  - `backend/.env:3`
  - Generate a strong secret: `openssl rand -base64 32` → store in Vercel env vars, never commit

- [ ] **DB credentials committed to .env**
  - `backend/.env:1-4`
  - Move MongoDB connection strings to hosting environment variables

- [x] **Backend has no ownership check on poem edit / delete**
  - `backend/src/controllers/poem.js:50-83`
  - The frontend correctly guards edit/delete behind `isOwner` (`ListItem.tsx:25`), but the API itself does not verify ownership — any authenticated user can PATCH or DELETE any poem via a raw HTTP request (curl, Postman, etc.)
  - Add ownership check in the controller before update/delete: `if (String(poem.authorId) !== req.userId) return res.status(403).json({ error: 'Forbidden' })`

- [x] **`{ $set: req.body, strict: false }` allows arbitrary field injection**
  - `backend/src/controllers/poem.js:57`
  - Whitelist allowed fields explicitly: `{ $set: { title, poem, genre, origin } }`

- [ ] **Bulk `PATCH /poems` has no authentication**
  - `backend/src/controllers/poems.js:152-159`
  - Delete endpoint or add authentication + admin role check

- [ ] **Disqus config hardcoded to `localhost:3000`**
  - `frontend/src/components/Detail/Detail.tsx:39-40`
  - Use dynamic origin: `` url: `${window.location.origin}/detail/${poemId}` ``

- [ ] **No rate limiting on login / register**
  - `backend/app.js`
  - `npm i express-rate-limit` → 5 attempts / 15 min on `/api/login`, 3 / hour on `/api/register`

---

## 🔴 High — Strongly Recommended Before Launch

- [ ] **No security headers** (XSS, clickjacking, HSTS, CSP all unset)
  - `backend/app.js`
  - `npm i helmet` → `app.use(helmet())`

- [ ] **CORS falls back to `localhost` if env var missing**
  - `backend/app.js:15`
  - Throw on startup if `FRONTEND_URL` is not set in production

- [ ] **Admin ID exposed in the frontend bundle**
  - `frontend/.env:1` (`REACT_APP_ADMIN`)
  - Remove from frontend; derive admin status from JWT payload or `/api/users/me`

- [ ] **No input validation on register / login**
  - `backend/src/controllers/register.js`
  - Validate: email format, password ≥ 8 chars, username 3–30 chars (use `joi` or `zod`)

- [ ] **Raw error objects sent to the client** (may leak stack traces)
  - `backend/src/controllers/poem.js:42`
  - Return a generic message: `res.status(500).json({ error: 'Failed to save poem' })`

- [ ] **No logging or error monitoring**
  - Add `morgan` for HTTP request logs
  - Integrate Sentry (or equivalent) for production error tracking

- [ ] **GitHub Actions use deprecated action versions**
  - `.github/workflows/*.yml`
  - Bump `actions/checkout` → `@v4`, `actions/setup-node` → `@v4`, `node-version` `13.x` → `20.x`

- [ ] **Known dependency vulnerabilities likely present**
  - Run `npm audit --fix` in both `frontend/` and `backend/`

---

## 🟡 Medium — Address Before or Shortly After Launch

- [ ] **JWT tokens stored in `localStorage`** (XSS can steal them)
  - Migrate to `httpOnly` cookies — requires backend to issue `Set-Cookie` header

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

- [ ] **SEO meta tags are sparse** (`og:image`, `description`, `canonical` missing on most pages)
  - Flesh out `react-helmet` usage per route

- [x] **Unused backend dependencies** (`passport`, `passport-local`, `mssql`, `ejs`, `csv-parse`)
  - Removed from `backend/package.json`

- [x] **Legacy `User.js` model still in codebase** (superseded by `Author.js`)
  - Cannot delete yet — still used as a fallback in `poems.js` (pre-migration poems) and in `users.js` legacy routes; deprecation comment added. Safe to remove only after a DB migration moves all `users` collection documents into `authors`.

- [x] **No API versioning** (`/api/v1/`)
  - All routes now mounted at `/api/v1/` in `backend/app.js`; frontend constants and all hardcoded paths updated accordingly

- [ ] **Backend is plain JS while frontend is TypeScript**
  - Optional: migrate backend controllers to `.ts` for consistency

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 7 |
| High | 8 |
| Medium | 5 |
| Low | 5 |

**Hard blockers for launch:** items marked Critical — especially the ownership check on poem edit/delete (#3), the field injection via `strict: false` (#4), and the weak JWT secret (#1). These can be actively exploited from day one on a public domain.

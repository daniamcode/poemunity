# Next.js Migration Plan

Goal: migrate the React SPA to Next.js (Pages Router) for SSR and proper SEO.  
Backend (Express on Vercel) stays untouched. Frontend moves from a static Vercel SPA to a Next.js Vercel deployment.

---

## Architecture after migration

```
Vercel (Next.js)          Vercel (Express)
┌─────────────────┐       ┌──────────────────┐
│  pages/         │ HTTP  │  /api/v1/poems    │
│  components/    │ ────► │  /api/v1/users    │
│  SSR via        │       │  /api/v1/login    │
│  getServerSide  │       │  /api/v1/register │
│  Props          │       └──────────────────┘
└─────────────────┘
```

---

## Phase 1 — Scaffold Next.js

- [x] Install Next.js, remove esbuild build system
- [x] Create `next.config.js` (SASS support, env vars, image domains)
- [x] Create `pages/_app.tsx` (Redux Provider, MUI emotion cache, AppContext)
- [x] Create `pages/_document.tsx` (MUI SSR style extraction)
- [x] Update `package.json` scripts (`dev`, `build`, `start`)
- [x] Update `vercel.json` for Next.js (or remove — Vercel auto-detects)
- [x] Rename `REACT_APP_API_URL` → `NEXT_PUBLIC_API_URL` in axiosInstance and Vercel env vars
- [x] Rename `REACT_APP_ADMIN` → `NEXT_PUBLIC_ADMIN` everywhere

---

## Phase 2 — Redux SSR setup _(skipped — not needed)_

`next-redux-wrapper` is only required when you dispatch Redux actions inside `getServerSideProps` and need that state to hydrate on the client. Our Phase 5 implementation never touches Redux server-side: `getServerSideProps` calls `serverFetch` and returns plain props; the Redux store is seeded client-side via `useEffect` after hydration. Vercel serverless functions also handle one request per instance, so the singleton store never causes cross-request state contamination.

---

## Phase 3 — Authentication (cookies)

- [x] Add `pages/api/auth/login.ts` — Next.js proxy route that calls backend and sets `httpOnly` cookie on frontend domain
- [x] Add `pages/api/auth/logout.ts` — clears the cookie
- [x] No backend changes needed (cookie is set by the Next.js proxy, not Express directly)
- [x] Update `Login.tsx` to call `/api/auth/login`; keeps `localStorage` for client-side AppContext
- [x] Update `Logout.tsx` to call `DELETE /api/auth/logout` before clearing `localStorage`
- [x] Add `middleware.ts` — protects `/profile` server-side using the cookie
- [x] Remove client-side redirect from `pages/profile.tsx` (middleware replaces it)
- [x] Fix broken relative URL in `Header.tsx` (`/api/v1/users/me` → absolute backend URL)

---

## Phase 4 — Pages (routing migration)

React Router → Next.js file-based routing:

| React Router | Next.js page file |
|---|---|
| `/` | `pages/index.tsx` |
| `/:genre` | `pages/[genre].tsx` |
| `/detail/:poemId` | `pages/detail/[poemId].tsx` |
| `/profile` | `pages/profile.tsx` |
| `/login` | `pages/login.tsx` |
| `/register` | `pages/register.tsx` |
| `/authors` | `pages/authors/index.tsx` |
| `/authors/:slug` | `pages/authors/[slug].tsx` |

- [x] `pages/index.tsx` — Dashboard
- [x] `pages/[genre].tsx` — Dashboard filtered by genre
- [x] `pages/detail/[poemId].tsx` — Poem detail
- [x] `pages/profile.tsx` — User profile (CSR only, protected)
- [x] `pages/login.tsx` — Login page
- [x] `pages/register.tsx` — Register page
- [x] `pages/authors/index.tsx` — Authors index
- [x] `pages/authors/[slug].tsx` — Author detail
- [x] `pages/404.tsx` — Custom not-found page
- [x] Remove React Router (`react-router-dom`) from dependencies (replaced with `next-router-mock` in tests)
- [x] Replace all `<Link to=...>` with Next.js `<Link href=...>`
- [x] Replace all `useHistory` with `useRouter`
- [x] Replace all `useParams` with `useRouter`
- [x] Replace all `useLocation` with `useRouter`

---

## Phase 5 — SSR data fetching

For each SSR page, add `getServerSideProps` that fetches data from the Express API and seeds the Redux store before the page renders. Bots see fully populated HTML.

- [x] Dashboard: fetch first page of poems server-side
- [x] Genre dashboard: fetch first page filtered by genre server-side
- [x] Poem detail: fetch poem by ID/slug
- [x] Author detail: fetch author profile + poems server-side
- [x] Authors index: fetch letters + authors for 'A' server-side
- [x] Pass user auth token from cookie into server-side Express requests (for liked/owned state)

---

## Phase 6 — SEO

- [x] Replace `react-helmet` with Next.js `<Head>` in all pages
- [x] Add `og:title`, `og:description`, `og:image` per page via shared `SeoHead` component
- [x] Add `canonical` URL per page (derived from request host in `getServerSideProps`)
- [x] Add `robots.txt` to `public/` (disallows `/profile` and `/api/`)
- [x] Add `pages/sitemap.xml.ts` — dynamic sitemap with homepage, authors page, and all genre pages
- [x] Remove `react-helmet` from dependencies
- [x] Add `public/og-image.png` default social share image (placeholder needed)

---

## Phase 7 — Cleanup

- [x] Remove `build.js` (esbuild)
- [x] Remove `esbuild`, `esbuild-sass-plugin`, `fs-extra`, `servor` from dependencies
- [x] Remove `react-router-dom` and `@types/react-router-dom`
- [x] Remove `react-helmet` and `@types/react-helmet`
- [x] Remove `history` package usage (replaced with native `window.history.pushState`)
- [x] Remove `public/index.html` (replaced by `_document.tsx`)
- [x] Update `tsconfig.json` for Next.js
- [x] Update ESLint config for Next.js
- [x] Update Jest config (Next.js components need different transform setup)
- [x] Update GitHub Actions CI to run `pnpm build` and `pnpm test` in `frontend/`

---

## Phase 8 — Vercel deployment

- [x] Update (or remove) `frontend/vercel.json` — Next.js is auto-detected by Vercel
- [ ] Rename env var `REACT_APP_API_URL` → `NEXT_PUBLIC_API_URL` in Vercel dashboard
- [ ] Rename env var `REACT_APP_ADMIN` → `NEXT_PUBLIC_ADMIN` in Vercel dashboard
- [ ] Confirm Express CORS is configured to allow the Next.js Vercel domain
- [ ] Verify SSR pages render correct content in production (curl, not browser)
- [ ] Verify social share previews (use opengraph.xyz or similar)

---

## Notes

- **Pages Router chosen over App Router**: Redux + existing component structure maps cleanly. App Router migration can be a future step once the SSR foundation is stable.
- **`localStorage` auth**: Phase 5 is complete — `localStorage` can now be removed in favour of cookie-only auth (also resolves the medium-severity checklist security item). Deferred to a separate cleanup step.
- **Infinite scroll stays client-side**: `getServerSideProps` seeds the first page; subsequent pages load via existing Redux actions (no change to `useInfiniteScroll`).
- **MUI v7 + emotion**: already installed. SSR style extraction via emotion cache in `_document.tsx` is straightforward.

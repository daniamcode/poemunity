# Poemunity

A social poetry website. Frontend: Next.js (SSR). Backend: Node.js/Express deployed as a Vercel serverless function. Authentication is custom token-based (JWT + httpOnly cookies).

Deployed on Vercel (two separate projects). CI via GitHub Actions (lint, typecheck, tests — no deploy step; Vercel triggers automatically on push).


# TL;DR:
## Flux 
In the flux folder we have the original project, made during the bootcamp and deployed afterwards. 

This Fullstack Bootcamp took place at _Skylab Coders Academy_ (Barcelona) from the 6th of July to the 25th of September of 2020.

My final Project was **Poemunity**, a social poetry website made in 2,5 weeks with the following technologies and methodologies:

- JavaScript
- React
- Flux
- Node.js
- Express
- MongoDB & Mongoose
- SCSS
- Material UI
- Git & Github
- TDD & BDD Testing (Jasmine, Jest, Mocha, Chai)
- Agile (Scrum)
- SOLID principles

Presentation: https://www.youtube.com/watch?v=WAyod6lGboE&t=4s

## React-Query
Then, I created the Poemunity-React-Query folder and continued from there, managing Server State (cache) with React-Query and Client State with useContext (a Global State Manager like Flux or Redux is not needed anymore with this approach since we divide it into these two differenciated parts (Server State (asynchronous) and Client State)). By the way, a middleware like Thunk manages asynchrony for Redux, and all that becomes transparent to me with React Query.

## Redux
Finally, I implemented Redux, because the goal of this project is to learn as much as possible. The other two folders (Flux and React-Query) are now deprecated.

### Next.js migration
With the introduction of agentic AI, the frontend was migrated from a custom esbuild SPA to Next.js (Pages Router) for SSR and SEO. See `docs/NEXTJS_MIGRATION.md` for the full migration log. The `old` branch still has the three deprecated folders (flux, React-Query, Redux+esbuild) for reference.

## Author / User types

The app uses a single `Author` collection (after migrating away from a separate `User` collection). Authors are distinguished by two fields:

| Type | `origin` | `fake` | Has credentials? |
|---|---|---|---|
| Real registered user | `'user'` | `false` | Yes (username, email, passwordHash) |
| Fake seeded user | `'user'` | `true` | Maybe |
| Famous poet (manually added) | `'famous'` | `false` | No |
| Famous poet (Poetry Foundation) | `'Poetry Foundation'` | `false` | No |

**Important:** the `origin=famous` filter used in the API (`/api/poems?origin=famous` and `/api/authors?origin=famous`) is the **union** of `'famous'` and `'Poetry Foundation'` — both map to the same "famous" concept in the UI.

The legacy `User` model still exists in `backend/src/models/User.js` but is no longer used after the Author migration.

## Poem data

The famous poets and poems were seeded from the **Poetry Foundation Kaggle dataset**:
https://www.kaggle.com/datasets/tgdivy/poetry-foundation-poems

The CSV contains `Title`, `Poem`, `Poet`, and `Tags` columns. Tags are mapped to the app's genre system; the seed script is at `backend/scripts/seed-poems.js`.

## Deployment (Vercel + MongoDB Atlas)

Two separate Vercel projects, both connected to this GitHub repo:

| Project | Framework | Root directory | Triggers deploy on push to |
|---|---|---|---|
| `poemunity-frontend` | Next.js | `frontend/` | `master`, `development` |
| `poemunity-backend` | Node.js (Express) | `backend/` | `master`, `development` |

### How deploys work

Vercel detects pushes to the connected branches and deploys automatically — no manual step needed.

GitHub Actions and Vercel run **in parallel and independently**. A failing Actions run does not block the Vercel deploy (this needs improvement). The two pipelines cover different things:

| Step | GitHub Actions | Vercel |
|---|---|---|
| Lint | ✅ | ✗ |
| Typecheck | ✅ | ✗ |
| Frontend tests | ✅ | ✗ |
| Backend tests | ✅ | ✗ |
| Build (frontend) | ✅ verification | ✅ actual deploy |
| Build (backend) | ✗ | ✅ actual deploy |

To make Actions gate the deploy (block bad code from reaching production), enable **branch protection rules** in GitHub → Settings → Branches → require status checks to pass before merging.

### Backend

Express app wrapped in a single Vercel serverless function at `backend/index.js`. MongoDB connections are cached across warm invocations to avoid pool exhaustion. `backend/vercel.json` routes all traffic to that handler.

### Frontend

Next.js (Pages Router) with SSR via `getServerSideProps`. `frontend/vercel.json` only sets `buildCommand: "pnpm build"` — framework detection is automatic.

`NEXT_PUBLIC_API_URL` is baked into the bundle at build time. In local dev the axios instance falls back to `http://localhost:4200` so the env var is only required in Vercel.

### Required env vars

**Backend Vercel project:**
| Variable | Description |
|---|---|
| `MONGODB` | MongoDB Atlas connection string |
| `SECRET` | JWT signing secret (generate with `openssl rand -base64 32`) |
| `FRONTEND_URL` | Frontend Vercel URL, no trailing slash (e.g. `https://poemunity-frontend.vercel.app`) |
| `NODE_ENV` | `production` |

**Frontend Vercel project:**
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Full backend URL with protocol (e.g. `https://poemunity-backend.vercel.app`) |
| `NEXT_PUBLIC_ADMIN` | Admin author ID |

## Testing

### Backend unit tests

```bash
cd backend && pnpm test
```

Covers registration (happy path, missing fields, email validation, duplicate detection).

### Frontend unit / integration tests

```bash
cd frontend && pnpm test
```

### Selenium + Applitools visual regression

```bash
cd frontend && pnpm selenium
```

Requires a running dev stack (backend on 4200, frontend on 3000) and the following env vars in `frontend/.env`:

| Variable | Description |
|---|---|
| `APPLITOOLS_API_KEY` | From eyes.applitools.com → Account → API Key |
| `SELENIUM_USERNAME` | Username of a real account in the dev database |
| `SELENIUM_PASSWORD` | Password for that account |

**Note:** Visual diffs do not fail the test run (`eyes.closeAsync()` is used). Diff results are still recorded in the Applitools dashboard for review. When you want to enforce visual quality (e.g. pre-release), switch to `eyes.close()` in `frontend/selenium/visual.spec.ts` — any unaccepted diff will then fail the test.

### Local development

```bash
# Terminal 1 — backend (port 4200)
cd backend && pnpm dev

# Terminal 2 — frontend (port 3000)
cd frontend && pnpm dev
```

`frontend/.env.local` only needs `NEXT_PUBLIC_ADMIN` for admin features locally. `NEXT_PUBLIC_API_URL` is not needed — the axios instance defaults to `http://localhost:4200`.
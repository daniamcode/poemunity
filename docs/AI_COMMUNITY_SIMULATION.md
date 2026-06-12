# AI Community Simulation — Plan

Goal: make Poemunity feel like a living community by having AI authors behave like real humans — writing poems, liking content, commenting, and replying — in a natural, non-uniform way.

---

## Strategic Picture

Before the implementation details, the honest framing:

**What this plan actually is:** a content scheduling system with personality wrappers. Each tick is largely independent of the last. That is not wrong — it is the right starting point — but it is not the same as a self-sustaining community. Name this clearly so future decisions are made with open eyes.

**The ceiling this creates:** the simulation runs on a fixed schedule regardless of what real users do. AI activity and human activity are two parallel tracks. They intersect (AI reacts to real comments, real users read AI poems) but the AI does not adapt to the community it is in. This is acceptable for v1. It is worth revisiting once real users are active.

**Current status (as of 12 June 2026):** The infrastructure prerequisites are done. Disqus has been replaced with a custom comments system (model, API, React component all live). 50 AI author accounts exist in the DB with bios and `preferredGenres` set, and hundreds of backdated poems are seeded. The first one-shot activity run has been implemented and executed against the remote pre MongoDB database. Production has not been seeded yet.

---

## Implementation Checkpoint — 12 June 2026

This section is the handoff point for the next session.

### What shipped in pre

The first iteration was executed with Codex subagents instead of Anthropic because no Anthropic key was available locally.

| Run | Provider | Result |
|---|---|---|
| `seed-activity-v1` | `codex-subagents` | `1785` likes, `132` poem comments, `49` poem replies, `35` profile comments |
| `seed-activity-v1.1-likes` | `codex-focused-like-booster` | `440` extra focused likes across `35` community/AI poems |

Why the second run exists: the first like distribution was mathematically too diffuse for the real catalog size. The DB has roughly 16k poems, so 1,785 likes spread across the full archive left top poems with only 2-3 new likes. The focused booster corrected that by targeting community/AI poems already showing comment activity.

Current good inspection URLs on local dev:

- `http://localhost:3002/` — homepage now starts with the boosted poems when ordered by likes
- `http://localhost:3002/detail/cat-fat-rayson` — `29 Likes`, `8 Comments`
- `http://localhost:3002/detail/morning-after-moonwriter23` — `25 Likes`, `9 Comments`
- `http://localhost:3002/detail/tonight-sarahgr` — `20 Likes`, `7 Comments`

### Important code added

Simulation scripts now live in `backend/scripts/simulation/`:

```
backend/scripts/simulation/
├── README.md
├── ai/claude.mjs
├── auth.mjs
├── boost-likes.mjs
├── codex-export.mjs
├── codex-import.mjs
├── codex-validate.mjs
├── inspect-run.mjs
├── profiles.mjs
├── seed-activity.mjs
├── seed-comments.mjs
├── seed-likes.mjs
├── seed-profile-comments.mjs
└── utils.mjs
```

Other supporting changes:

- `backend/src/models/Comment.js` has `simulationRunId` and `simulationKind` for auditability.
- `backend/app.js` accepts local frontend ports `3000`, `3001`, and `3002` in development CORS.
- `backend/app.js` can bypass login rate limiting for internal simulation login calls via `SIMULATION_INTERNAL_SECRET`.
- `backend/src/controllers/poems.js` supports `orderBy=Likes` and sorts by `likes.length` before pagination.
- `frontend/pages/index.tsx`, `frontend/pages/[genre].tsx`, and `frontend/src/components/List/hooks/usePoemsList.ts` now pass `orderBy=Likes` so the homepage SSR and client pagination agree.

### Commands used for verification

Local ports during this pass: backend `4200`, frontend `3002` because `3000` and `3001` were already in use.

```bash
# Inspect completed runs
cd backend
NODE_ENV=development node scripts/simulation/inspect-run.mjs --run-id seed-activity-v1
NODE_ENV=development node scripts/simulation/inspect-run.mjs --run-id seed-activity-v1.1-likes

# Verify likes are visible to the list API
curl 'http://localhost:4200/api/v1/poems?page=1&limit=10&orderBy=Likes'

# Regression and focused checks
cd backend
pnpm test -- --runInBand src/__tests__/poems.pagination.test.js
pnpm exec standard src/controllers/poems.js src/__tests__/poems.pagination.test.js scripts/simulation/boost-likes.mjs scripts/simulation/inspect-run.mjs

cd ../frontend
pnpm test -- --runInBand src/components/List/hooks/usePoemsList.test.tsx src/components/List/List.test.tsx
pnpm exec eslint src/components/List/List.tsx src/components/List/hooks/usePoemsList.ts pages/index.tsx 'pages/[genre].tsx'
```

Latest focused verification results:

- Backend pagination tests: `17 passed`
- Frontend list tests: `28 passed`
- Focused backend Standard lint: passed
- Focused frontend ESLint: passed
- Browser check on `http://localhost:3002/`: first visible like counts were `29`, `25`, `24`

### Do not repeat these mistakes

- Do not judge the like seed by total number of likes alone. With 16k poems, broad random distribution is invisible. For bootstrap, likes need a target-centric pass.
- Do not rerun a completed run id. The scripts guard against this, but use a new `--run-id` for any future write.
- Do not run the production seed until the production checklist is cleared and the exact prod command/run id is written down.
- Do not rely on client-side sorting with paginated APIs. Any sort that users see on page 1 must happen server-side before `skip`/`limit`.

### Recommended next iteration

Do not generate more comments yet. First do a human QA pass on the pre site and decide whether the current density feels right.

If it passes QA, the next useful iteration is:

1. Decide whether production should receive the same two-run pattern (`seed-activity-v1` + focused likes) or a new production-specific run id.
2. Run the rollback dry-run with the chosen production run ids before seeding, so the cleanup path is proven against the intended names.
3. Add profile-page liveliness and/or comment reactions only after the main feed feels plausible.

---

## Success Metrics

"Feels alive" is not testable. Define what a healthy simulated community looks like before launch so you can tell if the simulation is working or just generating noise:

| Metric | Target range |
|---|---|
| Average comments per poem | 2–5 |
| Average reply depth (comment threads) | 1.5–2.5 levels |
| Likes per poem (30 days after publish) | 8–25 |
| Ratio AI:real interactions visible to a user | no more than 70:30 at launch |
| Median hours between a user posting a poem and first AI comment | 4–20h |

The last metric is the most important for perceived realism. A comment that arrives 30 minutes after posting feels like a bot. A comment that arrives 3 days later feels human.

---

## Transparency & Ethics

This is the most consequential strategic decision in the plan. The current decision is: no badge, fully transparent (AI authors look like real users). This is fine but it requires explicit answers to downstream questions:

- **Terms of Service**: `/terms#ai-community-activity` now states that the platform can include AI-generated or AI-assisted authors, profile details, comments, replies, profile comments and likes. Not a badge on every comment — one clause in the ToS is enough, and honest.
- **Direct challenge**: if a real user comments "are you a bot?" on an AI author's profile, the AI should not deny it. The prompt for profile replies should include: *If directly and sincerely asked whether you are a real person or a bot, acknowledge that you are an AI author and redirect warmly.* Denying it crosses a line; the ToS clause covers the ambiguity everywhere else.
- **Reviewer/journalist scenario**: if Poemunity gets press attention, "secretly populated with AI users" is a bad headline. "Curated AI authors create atmosphere for a growing real community" is a fine one. The framing matters; the underlying facts are the same.

---

## Architecture: Deterministic Script + Probabilistic AI

Taken directly from the Monarch pattern:

| Layer | What it is | Who controls it |
|---|---|---|
| **Orchestrator script** | Node.js cron runner | Deterministic — controls WHEN, WHO, WHAT triggers |
| **AI content generation** | Claude API calls | Probabilistic — generates poems, comments, replies |
| **Distribution engine** | Pure JS math | Deterministic — weighted random, time rules, genre quotas |

The script never guesses what to do next. It computes a weighted list of actions, picks one, builds a prompt, calls Claude, posts the result via the backend API. Same pattern as Monarch's `runner.mjs` but using the Anthropic SDK instead of Copilot CLI.

---

## How to Call Claude (vs. How Monarch Calls Copilot)

Monarch spawns the Copilot CLI as a subprocess:
```js
spawn(process.execPath, [COPILOT_LOADER, "-p", prompt, "--allow-all"])
```

For Poemunity we use the **Anthropic SDK** directly — no CLI subprocess needed, cleaner for cron jobs:

```js
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic() // reads ANTHROPIC_API_KEY from env

async function generate(systemPrompt, userPrompt, model = 'claude-haiku-4-5-20251001') {
    const msg = await client.messages.create({
        model,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
    })
    return msg.content[0].text
}
```

Use **Haiku** for bulk actions (likes decisions, short comments, replies) and **Sonnet** for poem creation. This keeps cost low while preserving quality where it matters.

### Rough cost estimate

Assuming 20 AI authors, 2 ticks/day:
- Poem creation: ~2 authors write per day → 2 Sonnet calls (~$0.01 each) = **~$0.02/day**
- Comments/replies: ~10 Haiku calls per tick → 20/day at ~$0.001 each = **~$0.02/day**
- Likes decisions: pure JS math, no Claude call needed
- **Total: ~$0.04/day ($1.20/month)** — negligible at this scale

---

## AI Author Authentication

The simulation script needs to POST to the backend API as specific AI authors. The approach:

1. Each AI author has a real `Author` document in MongoDB with `type: 'ai'` (already created — 50 exist)
2. At script startup, call `POST /api/login` for each AI author (credentials stored in env vars or a secure config file not committed to git)
3. Cache the returned JWT tokens in memory for the duration of the tick
4. Pass the token as `Authorization: Bearer <token>` on all subsequent API calls
5. Re-login if a token expires (or set a very long expiry for AI accounts, e.g. 365 days)

```js
// state.mjs — startup auth
export async function loginAIAuthors(authors) {
    const tokens = {}
    for (const author of authors) {
        const res = await fetch(`${API_BASE}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: author.email, password: author.password })
        })
        const { token } = await res.json()
        tokens[author._id] = token
    }
    return tokens
}
```

AI author credentials live in `SIMULATION_AUTHORS` env var (JSON array) or a local `authors.json` file gitignored.

---

## Cron Schedule

Two runs per day at randomised times (avoids bot-like regularity):

```js
// cron expression: every day at a fixed hour — offset injected at startup
// Strategy: pick two random hours at process start (e.g. 09:37 and 21:14)
// Re-randomise on next deploy / restart
const hour1 = 6  + Math.floor(Math.random() * 6)   // between 06:00–11:59
const hour2 = 18 + Math.floor(Math.random() * 5)   // between 18:00–22:59
const min1  = Math.floor(Math.random() * 60)
const min2  = Math.floor(Math.random() * 60)
```

Or deploy as a Vercel Cron Job (cron expression in `vercel.json`) hitting a `/api/simulation/tick` route — Vercel handles the scheduling, the route runs the orchestration logic. **Note: Vercel Cron requires the Pro plan ($20/month) for more than 1 job or sub-daily frequency. The free/Hobby plan only allows 1 cron and a minimum of once per day.**

Each "tick" runs a weighted action selection across all AI authors (not all authors act every tick — see probability weights below).

---

## Module 1 — Comment Monitoring & Interest-Based Nudges

### What it does
After each tick, fetch comments added since the last run. For each new comment, find AI authors whose interests overlap with that poem's genre. With some probability, have the matching author post a reply or a new top-level comment.

### Flow
```
fetch /api/v1/comments?since=<lastRunTimestamp>
  → for each comment:
      find poem genre
      find AI authors with matching interest
      roll probability (e.g. 30% chance any given author reacts)
      if triggered:
          build prompt with author personality + poem + existing comments
          call Claude → generate comment
          POST /api/v1/comments with { targetType: 'poem', targetId, body } as that author
```

### Probability rules
- Base chance an AI author reacts to a matching comment: **25–35%**
- Boost if the poem is by a "famous" author: +15%
- Cooldown: same author cannot comment on same poem twice within 48h
- Max 2 AI comments per tick per poem (avoid pile-on)

### Real user experience note

The perceived timing matters as much as the content. A real user posts a poem; if the first AI comment arrives in the next tick (possibly 30 minutes later), it will feel mechanical. The 48h cooldown and 2-per-tick cap help but do not fully address this.

Consider adding a minimum delay to all AI actions on poems posted by real users: skip any poem newer than 3–4 hours in the comment monitor. This ensures the earliest a real user sees AI engagement is hours after posting, not minutes — which reads as human. Log `firstEngagementAt` per poem in the simulation state to enforce this.

---

## Module 2 — Profile Comment Responses

### What it does
When a real user (or another AI) posts a comment on an AI author's profile, that AI author should reply — mimicking their personality.

### Personality system
Each AI author has a personality descriptor stored in their `Author` document (`bio` and `preferredGenres` are already set for all 50 authors). The following simulation-specific fields still need to be added to the schema:

```js
{
  replyStyle: 'asks questions back' | 'short and warm' | 'philosophical' | 'enthusiastic',
  replyProbability: 0.7,   // how often they reply at all
  avgReplyDelayHours: 4    // simulated delay before replying (stored, applied on next tick)
}
```

### Behaviour rules
- Not every comment gets a reply (use `replyProbability`)
- Replies sometimes end with a question (further engagement)
- Never reply instantly — apply a simulated delay (scheduled for a future tick)
- If the comment is hostile or nonsensical, ignore (Claude classifies intent first)

### Prompt structure
```
System: You are {authorName}. {personalityDescription}. You are replying to a comment
        on your profile. Reply as this person would: {replyStyle}. Keep it under 3 sentences.
        Sometimes end with a question. Never sound like a bot.

User: The comment reads: "{commentText}". Write your reply.
```

---

## Module 3 — Proactive Interactions (AI-initiated)

AI authors don't only react — they also browse and engage spontaneously.

### 3a — Commenting on poems
Each tick, each AI author has a small chance of discovering and commenting on a poem:
- Pick a poem from their preferred genres (weighted by recency + like count)
- Roll probability: **10–20%** per author per tick
- Generate a comment that reflects their personality and the poem's content
- Skip poems they've already commented on

### 3b — Commenting on other authors' profiles
AI authors occasionally visit other profiles and leave a note:
- Target selection: authors with overlapping genres, or famous poets
- Probability: **5–10%** per tick (rarer — makes it feel special)
- Prompt includes both authors' personalities for natural tone

---

## Module 4 — Poem Creation

AI authors publish new poems on a schedule with genre distribution.

### Time rules
- Each AI author has a `poemsPerMonth` target (e.g. 2–8, varies by author)
- The script tracks `lastPoemDate` per author and only triggers when due
- Add ±3 day jitter so not all poems land on the same day

### Genre distribution
- Each author has a `preferredGenres` array with weights (e.g. `[{genre: 'love', weight: 0.6}, {genre: 'nature', weight: 0.4}]`)
- Genre is sampled from that weighted distribution each time
- Globally, ensure no genre dominates — if a genre was overrepresented in the last 7 days, reduce its probability

### Prompt structure
```
System: You are {authorName}. {bio}. You write poetry in the style of {style}.
        Write a poem in the {genre} genre. It should feel personal and authentic.
        Return only the poem text, no title prefix, no explanation.

User: Write a new poem.
```

Title is generated in a separate call (short, no punctuation, fits the app style).

---

## Module 5 — Likes & Unlikes Distribution

### "Famous author" definition

An author is considered famous if their `Author` document has `type: 'famous'`. This is set manually for seeded AI authors who are meant to be well-known within the community. It is not computed dynamically from like counts, to avoid feedback loops. Real users (`type: 'user'`) can never be marked famous automatically.

### Like probability weights

| Factor | Multiplier |
|---|---|
| Poem by a famous author (`type: 'famous'`) | ×3.0 |
| Poem genre matches AI author's interests | ×2.0 |
| Poem is recent (< 7 days old) | ×1.5 |
| Poem already has many likes (social proof) | ×1.3 |
| Poem by the AI author themselves | ×0 (never self-like) |
| Already liked | skip |

### Unlike rules
- Occasionally unlike a poem previously liked (5% chance per tick per liked poem)
- Mimics changing tastes or re-evaluation

### Per-tick budget
- Each AI author can like at most **3–5 poems per tick** (prevents unrealistic volume)
- Distributed across genres proportionally to their interests

### Implementation
```js
function pickPoemsToLike(aiAuthor, allPoems) {
    const candidates = allPoems
        .filter(p => !aiAuthor.likedPoems.includes(p._id))
        .filter(p => p.authorId !== aiAuthor._id)
        .map(p => ({ poem: p, weight: computeWeight(aiAuthor, p) }))

    return weightedSample(candidates, randomInt(3, 5))
}
```

---

## Comments System

**Status: done.** Disqus has been replaced with a custom comments system.

The implementation matches the original plan exactly:

- `Comment` model (`backend/src/models/Comment.js`): `{ targetType: 'poem' | 'profile', targetId, authorId, body, parentId?, timestamps }`
- API (`backend/src/controllers/comments.js`): `GET`, `POST`, `PATCH`, `DELETE` — all live
- `GET /api/v1/comments?since=<ISO>` is already implemented and annotated for simulation script use
- React component at `frontend/src/components/Comments/`

The `disqus-react` package is still listed in `package.json` but the library is unused and can be removed when convenient.

---

## Script Architecture

```
backend/scripts/simulation/
├── index.mjs            ← entry point, orchestrates one tick
├── scheduler.mjs        ← randomised hour selection, cron setup
├── modules/
│   ├── commentMonitor.mjs
│   ├── profileReplies.mjs
│   ├── proactiveComments.mjs
│   ├── poemCreation.mjs
│   └── likes.mjs
├── ai/
│   └── claude.mjs       ← Anthropic SDK wrapper (equivalent of Monarch's runner.mjs)
├── distribution.mjs     ← weightedSample, rollProbability, genre quota logic
└── state.mjs            ← persist lastRunTimestamp, cooldowns, etc. in MongoDB
```

Each module exports a single `run(context)` function. `index.mjs` calls them in sequence, same deterministic pipeline pattern as Monarch.

### State schema (MongoDB collection: `simulation_state`)

```js
// Single document, upserted each tick
{
  _id: 'singleton',
  lastRunAt: Date,
  authorStates: {
    [authorId]: {
      lastPoemAt: Date,
      commentedPoems: [{ poemId, at: Date }],    // for 48h cooldown
      likedPoems: [poemId],
      pendingReplies: [                            // delayed reply queue (Module 2)
        {
          targetType: 'poem' | 'profile',
          targetId: String,
          inReplyToCommentId: String,
          prompt: String,                          // pre-built, ready to fire
          executeAfter: Date                       // simulated human delay
        }
      ]
    }
  }
}
```

On each tick, `state.mjs` processes any `pendingReplies` whose `executeAfter` is in the past **before** running the module pipeline. This is how Module 2's simulated delay works — replies are queued and fired on a later tick, never immediately.

### Error handling strategy

- Wrap each module's `run()` in a try/catch; a failing module logs and continues — one bad module doesn't abort the tick
- Claude API errors: retry once with 2s backoff, then skip that action and log
- Backend API errors (4xx/5xx): log and skip — don't retry writes, the next tick will naturally revisit candidates
- All errors written to a `simulation_errors` MongoDB collection for inspection

### Local testing / dry-run

Pass `--dry-run` to `index.mjs` to run the full pipeline without writing anything to the database or calling the backend API. Claude is still called (to validate prompts), but results are printed to stdout instead of POSTed. This makes it safe to test locally against production data.

---

## Phased Rollout

### Phase 0 — Bootstrap (one-time, before live simulation)

The simulation is useless on day one if the site is empty. The comment monitor has nothing to monitor; the like engine has nothing to like; proactive comments have no poems to comment on. You need a historical baseline before the live cron starts.

**Status: pre bootstrap done; production bootstrap not done.**

- ✅ **AI author accounts**: 50 authors with full profiles, bios, `preferredGenres`, `type: 'ai'` — created via `scripts/seed-fake-users.js` + `scripts/add-ai-personalities.js`. 3–5 can be promoted to `type: 'famous'` manually.
- ✅ **Poems**: hundreds of backdated poems seeded via `scripts/seed-fake-users.js`, distributed across genres and authors from early 2023 onward.
- ✅ **Pre likes**: `seed-activity-v1` created `1785` broad likes; `seed-activity-v1.1-likes` added `440` focused likes across `35` community/AI poems.
- ✅ **Pre comments**: `seed-activity-v1` created `132` top-level poem comments, `49` replies, and `35` profile comments.
- [ ] **Production likes/comments**: not run yet. Requires production readiness review, legal copy, backup snapshot, and a rollback dry-run with the chosen production run ids.

Remaining bootstrap work: decide whether production should receive the same pattern as pre or a production-specific run. Do not run production until the hard blockers in `docs/PRODUCTION_CHECKLIST.md` are cleared.

### Phase 1 — Foundation
- ✅ **Replace Disqus with own comments system**
- ✅ Add `Comment` model and API endpoints (including `?since=` for simulation)
- ✅ Add `type: 'ai'`/`type: 'famous'` and `preferredGenres` to `Author` model
- ✅ 50 AI author accounts created with bios and preferred genres
- [ ] Add simulation-specific fields to `Author`: `replyStyle`, `replyProbability`, `avgReplyDelayHours`, `poemsPerMonth` — not in the schema yet
- ✅ Build `claude.mjs` wrapper
- [x] Add ToS clause about AI-generated content

### Phase 2 — Bootstrap (remaining)
- ✅ Seed historical likes/comments in pre
- ✅ Add focused like booster after broad likes proved too diffuse
- ✅ Verify local homepage/detail pages show boosted activity
- [ ] Human QA the pre site for plausibility
- ✅ Add production cleanup/rollback script before prod seeding
- [ ] Seed production only after the production checklist is cleared

### Phase 3 — Poems & Likes
- [ ] `poemCreation.mjs` — AI authors publish poems on schedule
- [ ] `likes.mjs` — weighted like/unlike distribution

### Phase 4 — Comments
- [ ] `commentMonitor.mjs` — react to new comments
- [ ] `profileReplies.mjs` — AI author replies to profile comments
- [ ] `proactiveComments.mjs` — spontaneous poem/profile comments

### Phase 5 — Scheduling & Safety
- [ ] Deploy as Vercel Cron (`/api/simulation/tick`, twice daily)
- [ ] Add global tick budget cap (hard limit: max 20 total API calls per tick, regardless of probability outcomes)
- [ ] Add poem output validation before posting (min 4 lines, not empty, not a repetition of the prompt)
- [ ] Add admin dashboard endpoint to inspect last tick log and error collection
- [ ] Measure against success metrics (see top of doc) — adjust probability weights if off-target

---

## Ollama: Local / Self-Hosted Free Alternative

### What is Ollama

Ollama is a local LLM runner. You install it on any machine, pull a model (e.g. `ollama pull llama3.1`), and it exposes an HTTP API on `localhost:11434`. No API key, no per-token cost, no rate limits beyond your hardware.

It exposes an OpenAI-compatible endpoint, so swapping it in requires only changing the base URL in `claude.mjs`:

```js
// Drop-in Ollama wrapper — same interface as the Claude wrapper
import OpenAI from 'openai'  // or plain fetch — Ollama speaks OpenAI protocol

const ollama = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama'  // required by the client lib but ignored by Ollama
})

async function generate(systemPrompt, userPrompt, model = 'llama3.1:8b') {
    const res = await ollama.chat.completions.create({
        model,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ]
    })
    return res.choices[0].message.content
}
```

If Ollama runs on a remote server, replace `localhost` with the server's IP/hostname.

---

### Can it work for Poemunity's simulation?

Short answer: **yes, if deployed on a always-on server. No, if only on your laptop.**

| Scenario | Works? | Notes |
|---|---|---|
| **Local laptop, Vercel cron** | No | Vercel serverless functions can't reach `localhost` on your machine |
| **Local laptop, self-hosted cron** | Partially | Only runs when the laptop is on and awake |
| **Dedicated server (VPS), self-hosted cron** | Yes | Cron + Ollama on same machine, always available |
| **Dedicated server, Vercel cron** | Yes | Vercel hits a public endpoint on your server; server calls Ollama internally |

---

### Hardware requirements vs model quality

| Model | RAM needed | Size on disk | Quality for poetry/comments |
|---|---|---|---|
| `llama3.2:3b` | ~3 GB | 2 GB | Acceptable for short comments, weak for poems |
| `llama3.1:8b` | ~6 GB | 4.7 GB | Good for comments and replies, decent poems |
| `mistral:7b` | ~6 GB | 4.1 GB | Similar to 8B Llama, good creative writing |
| `llama3.1:70b` | ~40 GB | 40 GB | Near-Claude-Haiku quality, needs serious hardware |
| `llama3.3:70b` | ~43 GB | 43 GB | Best open-source option, GPU strongly recommended |

For the Poemunity use case (2 ticks/day, ~20 AI authors, short outputs) an **8B model on a machine with 8–16 GB RAM** is sufficient. Responses will be slower than the cloud but that doesn't matter for a background cron job.

---

### Is it truly "unlimited and free"?

**Free in API cost: yes.** No per-token billing, no rate limits enforced by a third party.

**Truly unlimited: not exactly.** The constraints shift from money to hardware:
- Electricity cost (small, a few €/month for a VPS or always-on machine)
- RAM/VRAM ceiling — you can't run a model that doesn't fit
- Throughput — a single 8B model on CPU processes ~10–30 tokens/second; your 2x daily cron generating a few poems and 10–20 short comments finishes in under 2 minutes, which is perfectly fine

For the volume Poemunity needs, Ollama on a modest server (even a €5–10/month VPS with 8 GB RAM) covers everything at effectively zero marginal cost.

---

### Recommended architecture if using Ollama on a server

```
Your VPS
├── Ollama (port 11434, internal only)
├── simulation cron (Node.js, runs twice daily)
│     calls Ollama at http://localhost:11434
│     posts results to Poemunity backend API
└── optional: expose a /run-simulation endpoint
      so Vercel cron can trigger it via HTTP
```

The cron script lives on the server (via `cron` or `pm2`), not on Vercel. Vercel still hosts the frontend and backend; the simulation runner is a separate background process on your own machine.

---

### Abstraction: make the AI provider swappable

Build `claude.mjs` as a thin adapter so you can switch providers via an env var:

```js
// ai/provider.mjs
const PROVIDER = process.env.AI_PROVIDER ?? 'claude'  // 'claude' | 'ollama'

export async function generate(systemPrompt, userPrompt, task = 'comment') {
    if (PROVIDER === 'ollama') {
        return generateOllama(systemPrompt, userPrompt, modelForTask(task))
    }
    return generateClaude(systemPrompt, userPrompt, modelForTask(task))
}

function modelForTask(task) {
    if (PROVIDER === 'ollama') {
        return task === 'poem' ? 'llama3.1:8b' : 'llama3.2:3b'
    }
    return task === 'poem' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001'
}
```

Set `AI_PROVIDER=ollama` on the server and `AI_PROVIDER=claude` in Vercel. The rest of the simulation code doesn't change.

---

## Decisions (formerly Open Questions)

- **AI comment visibility**: fully transparent — no badge. The goal is a living community, not a disclosed experiment. AI authors have real profiles, real poems, real personalities. Adding a badge breaks the illusion and makes real users second-guess every interaction.

- **Rate limits**: with ~20 AI authors and 2 ticks/day, peak load is ~10–15 Claude calls per tick. Haiku's rate limit is far above this. No throttling needed at this scale — revisit if authors grow beyond 100.

- **Seed data**: the main bootstrap (AI authors + poems) is done via `scripts/seed-fake-users.js` and `scripts/add-ai-personalities.js`. What remains is a one-off script to backfill historical likes and comments. Promote 3–5 authors to `type: 'famous'` manually before enabling the live cron.

---

## First Iteration: One-Shot Activity Run

Before building the full cron infrastructure, we run one script once. It makes all 50 AI authors do what they will eventually do on a schedule — like poems, comment, reply, and visit profiles — but as a single historical pass, not a recurring job. The goals are:

1. Complete the bootstrap (likes, comments, replies, and profile comments that seed data is missing)
2. Prove the full integration works: auth → Claude → database
3. Produce something real we can inspect in the live site before committing to the scheduler

This is not the simulation. It is a warm-up run that also validates every building block.

**Actual result:** implemented and run in pre on 12 June 2026. Comments were generated by Codex subagents, imported through `codex-import.mjs`, and audited with `simulationRunId`. Likes were written with direct MongoDB `$addToSet` plus rows in `simulation_like_events`, not through the toggle endpoint by default.

---

### Prerequisites (manual steps before running)

Before executing against production, do these once:

1. **Decide the run ids**. Do not reuse the pre run ids in production unless you explicitly want production audit rows to have the same names. Recommended production examples: `prod-seed-activity-v1` and `prod-seed-activity-v1.1-likes`.

2. **Do not promote AI authors to `type: 'famous'` just for weighting.** The implemented scripts support `SIMULATION_FAMOUS_USERNAMES` so weighting can happen without changing public author type. Keep `type: 'ai'` unless the product intentionally wants those authors presented as famous.

3. **Choose provider path**:
   - Anthropic path: set `ANTHROPIC_API_KEY` and run `seed-activity.mjs`.
   - Codex subagent path: use `codex-export.mjs`, have subagents fill `generatedBody`, then run `codex-validate.mjs` and `codex-import.mjs`.

4. **Preview rollback before production writes.** `rollback-run.mjs` is dry-run by default and removes only comments tagged with `simulationRunId` plus likes recorded in `simulation_like_events`. Run it once with the intended production run ids before seeding.

---

### Files created

```
backend/scripts/simulation/
├── README.md
├── auth.mjs
├── boost-likes.mjs            ← focused like booster for community/AI poems
├── codex-export.mjs           ← export comment tasks for Codex subagents
├── codex-import.mjs           ← import subagent-generated comments/replies/profile comments
├── codex-validate.mjs         ← validate generatedBody coverage and JSON shape
├── inspect-run.mjs            ← inspect run summary, top liked/commented poems, samples
├── profiles.mjs               ← COMMENTER / REGULAR / LURKER activity profiles
├── rollback-run.mjs           ← dry-run-first cleanup for comments and audited likes
├── seed-activity.mjs          ← Anthropic-backed one-shot pass
├── seed-comments.mjs          ← generated top-level comments + replies
├── seed-likes.mjs             ← weighted like distribution across poems
├── seed-profile-comments.mjs  ← AI authors leave notes on each other's profiles
├── utils.mjs
└── ai/
    └── claude.mjs
```

No scheduler, no state collection, no MongoDB simulation state yet. These scripts are for one-shot bootstrap and inspection only.

**Two insertion strategies are used:**
- **Likes** default to direct MongoDB `$addToSet` plus `simulation_like_events` audit rows. API mode still exists behind `--use-api-likes`, but direct DB mode avoids the toggle risk of `PUT /api/v1/poem/:poemId`.
- **Comments, replies, and profile comments** are inserted directly into MongoDB via Mongoose (bypassing the API) so that `createdAt` can be set to a historically plausible date. A poem from 2023 with a comment timestamped May 2026 is an obvious tell.

---

### `ai/claude.mjs`

Thin wrapper — identical to what the cron will use later, so it can be reused without changes:

```js
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic() // reads ANTHROPIC_API_KEY from env

export async function generate(systemPrompt, userPrompt, model = 'claude-haiku-4-5-20251001') {
  const msg = await client.messages.create({
    model,
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }]
  })
  return msg.content[0].text.trim()
}
```

Use Haiku for everything in this pass — comments are short, quality is acceptable, cost is minimal.

**Provider decision**: this first iteration uses Claude directly. The long-term plan is to switch to Ollama on a self-hosted server (see [Ollama section](#ollama-local--self-hosted-free-alternative)) to eliminate per-token cost. That switch only requires swapping `claude.mjs` for `ollama.mjs` — the rest of the code doesn't change. For now, Claude Haiku at < $0.01 for the full one-shot run is fine.

---

### `auth.mjs`

Logs in every AI author whose credentials are in `SIMULATION_AUTHORS` env var (JSON array: `[{ authorId, email, password }, ...]`). Returns a map of `authorId → jwt`.

```js
export async function loginAll(authors) {
  const tokens = {}
  for (const a of authors) {
    const res = await fetch(`${API_BASE}/api/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: a.email, password: a.password })
    })
    const { token } = await res.json()
    tokens[a.authorId] = token
  }
  return tokens
}
```

Fail fast if any login fails — credentials problem is better caught here than mid-run.

---

### Activity profiles

Not all 50 authors behave identically. Assign each author one of three profiles before running the script. This creates the natural variation a real community has:

| Profile | % of authors | Likes budget | Comments probability | Description |
|---|---|---|---|---|
| **COMMENTER** | ~20% (10 authors) | 20–30 | 80% chance to comment on a matching poem | Vocal, opinionated, always in the thread |
| **REGULAR** | ~40% (20 authors) | 30–40 | 40% chance | Balanced — likes and comments, not obsessively |
| **LURKER** | ~40% (20 authors) | 35–50 | 10% chance | Mostly likes, rarely speaks up |

Lurkers have the highest like budget because real lurkers are prolific likers — they engage silently. Commenters comment more but like less obsessively.

Assign profiles by hand before running — it takes 5 minutes and makes the community feel real. A suggested split based on the existing author personalities:
- COMMENTERS: `angry.quill`, `queerpoetrybabe`, `silent_scream`, `GrumpyGrandpa`, `historybuff42`, `lostinlove23`, `coffeeshop.verses`, `teen.writes_`, `warpoet_fred`, `immigrant.pen`
- LURKERS: `ChristmasEve_`, `DadOf3_Writes`, `JesusIsMyRock_`, `MomLife_Poems`, `SunrisePoet_`, `Garden_Guru`, `hopeful.heart`, `WarmSummer_`, `SiblingHood`, `soberlife_`, `birthdays_hurt`, `prayer.poems`, `forgive_and_write`, `butterfly_soul`, `SmallTownLife`, `WinterMuse`, `StormSurfer`, `desert_dragon`, `bookworm.poet`, `CitySlicker_V`
- REGULARS: everyone else

---

### `seed-likes.mjs`

For each AI author, pick poems to like using weighted rules, then PUT each one via the API.

**Key constraint**: `PUT /api/v1/poem/:poemId` is a toggle — it adds the like if absent, removes it if already present. Before PUTting, check that `poem.likes` does not already contain the author's `_id`. The seeded poems may already have some likes from the seed script, so this check is not optional.

**Per-author budget**: determined by activity profile (see above). Total across 50 authors: **~1,500–2,000 likes** — enough to put the top poems in the 15–25 range with a natural power-law distribution.

**Weight computation for historical seeding** (differs from the live cron — no recency boost since all poems are old relative to today; instead use historical engagement as a proxy for quality):

```js
function computeWeight(author, poem) {
  let w = 1
  if (poem.authorType === 'famous') w *= 3.0
  if (author.preferredGenres.includes(poem.genre)) w *= 2.0
  // social proof — poems that already have likes attract more
  const likeCount = poem.likes?.length ?? 0
  if (likeCount > 20) w *= 2.0
  else if (likeCount > 10) w *= 1.5
  else if (likeCount > 5) w *= 1.2
  if (String(poem.authorId ?? poem.userId) === String(author._id)) w = 0  // no self-like
  if (poem.likes?.includes(String(author._id))) w = 0                      // already liked
  return w
}
```

**15% outside-genre exploration**: for each author, 15% of their like budget is spent on poems outside their `preferredGenres`, picked randomly from the full catalog. This prevents engagement from looking siloed by genre and mimics real discovery behaviour ("I don't usually read war poetry but this one got me").

---

### `seed-comments.mjs`

Select the top 60 poems by like count (after `seed-likes.mjs` runs). For each poem, the number of comments is determined by its like count — popular poems get more comments, obscure ones get none or one. This is the natural power law.

**Comment count per poem**:
- Top 15 poems (most liked): 3–5 comments
- Next 25 poems: 1–3 comments
- Bottom 20 of the 60: 1 comment
- All other poems (350+): 0 comments

**Total Claude calls**: ~130–160.

**Cost estimate**: 150 Haiku calls × ~400 tokens avg = ~60k tokens → **~$0.01 total**.

**Temporal distribution — exponential decay, not uniform**:

Real engagement spikes when a poem is new and drops fast. Use a decayed distribution rather than a flat one:

```js
function commentDate(poemDate) {
  // exponential decay: most comments in first week, tail off after
  const r = Math.random()
  let daysAfter
  if (r < 0.55) daysAfter = Math.random() * 7          // 55% in first week
  else if (r < 0.85) daysAfter = 7 + Math.random() * 23  // 30% in days 8–30
  else daysAfter = 30 + Math.random() * 60               // 15% in days 31–90

  const result = addDays(poemDate, daysAfter)
  return result > yesterday() ? yesterday() : result     // never in the future
}
```

**Comment prompts — personality-aware and context-aware**:

Each author's bio implies a specific voice. Extract a short style instruction from their personality and pass it to Claude. More importantly, pass any existing comments on the poem so Claude generates reactions that acknowledge what was already said — otherwise comments feel parallel and disconnected.

```
System: You are {authorName}. {bio}
        Your comment style: {styleInstruction}
        You are leaving a comment on a poem you just read.
        React authentically — reference something specific in the poem.
        Do NOT start with "I" or "This poem". Vary your opening.

User: Poem title: "{title}"

{poemText}

{existingComments.length > 0
  ? `Others have already commented:\n${existingComments.map(c => `- ${c.authorName}: "${c.body}"`).join('\n')}\n\nWrite your own distinct reaction. You may agree, disagree, or take a completely different angle.`
  : 'Write your comment.'}
```

Where `styleInstruction` is derived per author from their bio and profile:
- COMMENTER-type authors: longer, opinionated, sometimes challenging
- REGULAR authors: 1–3 sentences, warm, personal
- LURKER authors (if they do comment, it's notable): brief, heartfelt, often one striking line

**Comment → like rule**: if author A generates a comment on poem P, also ensure A has liked P. Add A to `poem.likes` in memory before continuing (the script tracks this in-memory and writes likes in a final pass).

After generating, insert directly into MongoDB so `createdAt` can be set:

```js
await Comment.create({
  targetType: 'poem',
  targetId: poem._id,
  authorId: author._id,
  body: generatedComment,
  createdAt: commentDate(poem.date)
})
```

---

### Comment replies

After seeding top-level comments, roll 35% probability per comment to get a reply. This drives the reply depth metric (target: 1.5–2.5 levels).

**Selection**: find an AI author who (a) did not write the parent comment, (b) has overlapping genre interests, (c) is a COMMENTER or REGULAR profile (LURKERs almost never reply). Do not reply to your own comment.

The prompt must include the poem itself, not just the parent comment — replies often reference the poem directly:

```
System: You are {authorName}. {bio}. You are replying to someone's comment on a poem.
        Keep it short — 1 to 2 sentences. React to what they said.
        You may agree, push back gently, or add something they missed.
        Sound like a real person, not a reviewer.

User: Poem: "{title}"
{poemText}

{parentAuthorName} commented: "{parentCommentBody}"

Write your reply.
```

Insert with `parentId` and `createdAt` 1–5 days after the parent (not 7 — a reply that takes a week is unusual):

```js
await Comment.create({
  targetType: 'poem',
  targetId: poem._id,
  authorId: replyAuthor._id,
  body: generatedReply,
  parentId: parentComment._id,
  createdAt: randomDateBetween(parentComment.createdAt, addDays(parentComment.createdAt, 5))
})
```

---

### `seed-profile-comments.mjs`

AI authors occasionally visit each other's profiles and leave a short note. This makes profiles feel inhabited rather than just poem repositories.

**Volume**: ~30–40 profile comments total. Only COMMENTER and REGULAR authors leave profile comments (LURKERs don't). Each eligible author has a 50% chance of leaving one profile comment.

**Target selection**: pick an AI author with overlapping genres. Avoid your own profile. Prefer authors whose poems you've already liked or commented on — you visited their profile because you liked their work.

**Critical**: pass 1–2 actual poems by the target author into the prompt. Without this, Claude can only generate vague genre-based comments ("I love your nature writing!") which read immediately as AI-generated. With a real poem, it can reference something specific.

```
System: You are {authorName}. {bio}.
        You are leaving a comment on another poet's profile page.
        1–2 sentences. Be specific — reference something from one of their poems.
        Sound like a real reader who was moved by their work, not a reviewer.

User: The poet is {targetName}. Here is one of their poems:

Title: "{poemTitle}"
{poemText}

Write your comment on their profile.
```

Insert with `createdAt` spread across the past 12 months (not 6 — the community has been running for years).

---

### `seed-activity.mjs` — entry point

```js
// 1. connect to MongoDB directly (needed for comment inserts with custom createdAt)
await mongoose.connect(MONGODB)

// 2. load AI author credentials from env
const authors = JSON.parse(process.env.SIMULATION_AUTHORS)

// 3. login all authors (needed for likes API calls)
const tokens = await loginAll(authors)

// 4. fetch all poems + AI author documents
const [poems, aiAuthors] = await Promise.all([fetchAllPoems(), fetchAIAuthors()])

// 5. seed likes (via API — needs JWT)
await seedLikes(aiAuthors, poems, tokens)

// 6. seed top-level comments + replies (direct DB insert — needs mongoose connection)
await seedComments(aiAuthors, poems)

// 7. seed profile comments (direct DB insert)
await seedProfileComments(aiAuthors)
```

Each step logs a line per action (`liked: poemTitle ← authorName`, `commented: poemTitle ← authorName`, `replied: ← authorName`, `profile-comment: targetName ← authorName`). Wrap each step in try/catch — a failed action logs and continues, it does not abort the run.

---

### Running it

```bash
SIMULATION_AUTHORS='[...]' ANTHROPIC_API_KEY=sk-ant-... node scripts/simulation/seed-activity.mjs
```

Run against dev/pre DB first (`NODE_ENV=development`). Inspect the site. If it looks right, prepare separate production run ids, create a database snapshot, and preview rollback before running against prod.

This is a write-once operation per run id. Do not re-run the same run id. The default likes mode now uses direct MongoDB `$addToSet` and audit rows to avoid the toggle risk, but duplicate production writes are still undesirable.

### Running without Anthropic

This was the path used for pre:

```bash
cd backend
NODE_ENV=development node scripts/simulation/codex-export.mjs --run-id seed-activity-v1
# Codex subagents fill scripts/simulation/codex-runs/seed-activity-v1/comments-batch-*.json
NODE_ENV=development node scripts/simulation/codex-validate.mjs --run-id seed-activity-v1
NODE_ENV=development node scripts/simulation/codex-import.mjs --run-id seed-activity-v1
NODE_ENV=development node scripts/simulation/boost-likes.mjs --run-id seed-activity-v1.1-likes --source-run-id seed-activity-v1
NODE_ENV=development node scripts/simulation/inspect-run.mjs --run-id seed-activity-v1
NODE_ENV=development node scripts/simulation/inspect-run.mjs --run-id seed-activity-v1.1-likes
```

Rollback preview for the pre run:

```bash
NODE_ENV=development node scripts/simulation/rollback-run.mjs --run-id seed-activity-v1 --run-id seed-activity-v1.1-likes
```

Dry-run verification on 12 June 2026 matched the known pre activity exactly: `216` comments, `1785` broad likes, and `440` boosted likes, with `0` external replies that would be orphaned.

---

### Expected output

| Activity | Volume | Notes |
|---|---|---|
| Likes | ~1,500–2,000 | Power-law distribution; top poems hit 15–25 likes |
| Top-level comments | ~130–160 across 60 poems | Decayed temporal distribution; heavy first week |
| Replies | ~45–55 (35% of top-level) | Include poem text in prompt; max 5 days after parent |
| Profile comments | ~30–40 | Reference actual poems from target author |

Comments and replies have historically spread `createdAt` dates with exponential decay. All success metrics should be in range. Verify after running: spot-check 5–10 poems to confirm comment quality and timestamps look natural before enabling the cron.

---

### What this unlocks

Once this runs successfully:
- The site has a realistic like, comment, reply, and profile history
- Every building block of the future cron (auth, Claude, direct DB insert, API call) has been validated end-to-end
- `claude.mjs` and `auth.mjs` can be reused in the cron unchanged
- Phase 3 (recurring poem creation + likes) can start immediately after

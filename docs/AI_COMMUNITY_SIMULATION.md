# AI Community Simulation — Plan

Goal: make Poemunity feel like a living community by having AI authors behave like real humans — writing poems, liking content, commenting, and replying — in a natural, non-uniform way.

---

## Strategic Picture

Before the implementation details, the honest framing:

**What this plan actually is:** a content scheduling system with personality wrappers. Each tick is largely independent of the last. That is not wrong — it is the right starting point — but it is not the same as a self-sustaining community. Name this clearly so future decisions are made with open eyes.

**The ceiling this creates:** the simulation runs on a fixed schedule regardless of what real users do. AI activity and human activity are two parallel tracks. They intersect (AI reacts to real comments, real users read AI poems) but the AI does not adapt to the community it is in. This is acceptable for v1. It is worth revisiting once real users are active.

**The critical dependency:** everything below is impossible without replacing Disqus first. That is not a Phase 1 item among equals — it is the unblocking prerequisite for the entire simulation. Treat it as such.

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

- **Terms of Service**: must state that the platform includes AI-generated content and AI author profiles. Not a badge on every comment — one clause in the ToS is enough, and honest.
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

1. Each AI author has a real `User` document in MongoDB with `isAI: true` flag
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
Each AI author has a personality descriptor stored in their `Author` document (already partially built — see `personalities` field). Extend it with:

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

An author is considered famous if they have `isFamous: true` on their `Author`/`User` document. This flag is set manually by an admin for seeded AI authors who are meant to be well-known within the community (e.g. the first wave of AI poets). It is not computed dynamically from like counts, to avoid feedback loops. Real users can never be marked famous automatically.

### Like probability weights

| Factor | Multiplier |
|---|---|
| Poem by a famous author (`isFamous: true`) | ×3.0 |
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

## Disqus vs Own Comments System

### The problem with Disqus for this feature
Disqus has no public write API for posting comments programmatically. The read API exists but creating comments requires a user session. **AI-driven commenting is impossible with Disqus.**

### Options

| Option | Cost | Control | AI-writable? | Effort |
|---|---|---|---|---|
| **Disqus Free** | Free (shows ads) | Low | No | Already integrated |
| **Disqus Plus** | $11/month | Low | No | — |
| **Remark42** (self-hosted) | Server cost | High | Yes (REST API) | Medium |
| **Own solution** (MongoDB) | $0 extra | Full | Yes | Medium |

### Recommendation: build own comments system

You already have MongoDB + Express. A comments system is:
- `Comment` model: `{ targetType: 'poem' | 'profile', targetId, authorId, body, createdAt, parentId? }`
- Using `targetType` + `targetId` instead of separate `poemId`/`profileId` fields avoids schema duplication and works for both poem and profile comments with a single collection
- 4 API endpoints: `GET /comments?targetType=poem&targetId=:id`, `POST /comments`, `PATCH /comments/:id`, `DELETE /comments/:id`
- Replace the Disqus widget with a React component that calls your own API

Benefits:
- AI authors can post via the existing auth flow (just needs their JWT token — see [AI Author Authentication](#ai-author-authentication))
- Comments appear in the same style as the rest of the app
- No ads, no external dependency, no cost
- Comments can be indexed for SEO (Disqus is rendered client-side, invisible to bots)

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

Run a one-time bootstrap script (`seed.mjs`) that backdates all records so the site looks like it has been active for months:

- **AI author accounts**: 15–25 authors with full profiles, bios, personality fields, `isAI: true`, `isFamous` for 3–5 of them
- **Poems**: 60–100 poems spread across genres, with `createdAt` values distributed over the past 4–6 months (not uniform — cluster around weekends and evenings)
- **Likes**: 400–600 likes distributed using the same weighted rules as `likes.mjs`, so the historical data is consistent with the live simulation's logic
- **Comments**: 50–80 comments across the top poems, with realistic timestamps (not all on the day of the poem, distributed over days/weeks after posting)

This is a write-once operation. Once bootstrap is done, only the live simulation adds new content.

### Phase 1 — Foundation
- [ ] **Replace Disqus with own comments system** ← unblocks everything below
- [ ] Add `Comment` model and API endpoints
- [ ] Add `isAI`, `isFamous`, personality fields to `User`/`Author` model
- [ ] Build `claude.mjs` wrapper
- [ ] Add ToS clause about AI-generated content

### Phase 2 — Bootstrap
- [ ] Write and run `seed.mjs` — populate historical baseline (Phase 0 above)
- [ ] Verify the site looks plausibly alive before enabling the live cron

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

- **Seed data**: write a one-time `scripts/simulation/seed.mjs` that creates the AI author `User` documents with `isAI: true`, `isFamous` (for designated famous authors), `preferredGenres`, and `personality` fields. Run once before Phase 2. Do not re-run; subsequent author changes go through the normal admin flow.

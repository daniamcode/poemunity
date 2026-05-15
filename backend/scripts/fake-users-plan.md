# Fake Users Seeding Plan

## Goal

Create 50 realistic fake user accounts with AI-generated poems, inserted directly into MongoDB Atlas. These users populate the feed and make the site feel lived-in without requiring manual posting through the admin UI.

## What is NOT touched

- The existing 7 hardcoded fake users in `backend/src/controllers/poems.js` (cathy2, StaceyCosgrove, etc.) are kept as-is — the admin impersonation UI still works.
- The old admin impersonation flow is not removed.

---

## User Distribution

| Tier | Count | Poems each | Subtotal |
|---|---|---|---|
| Power users (very active) | 5 | 15–25 | ~100 |
| Regular users | 15 | 6–9 | ~115 |
| Casual users | 30 | 2–4 | ~95 |
| **Total** | **50** | — | **~310 poems** |

---

## User Personality System

Each user has:
- A real-sounding name and username
- 2–3 preferred genres they write in most of the time
- A writing style informed by their archetype
- A poem count matching their tier

Poems are 70% from preferred genres, 30% other — to feel natural.

**Example archetypes:**

| Username | Archetype | Main genres |
|---|---|---|
| moonwriter23 | introspective night owl | moon, night, dreams, silence |
| versesbysadie | heartbroken twenty-something | heartbreak, sad, lost-love |
| thomaswalker_ | nature-loving outdoorsman | nature, ocean, birds, environment |
| dadof3writes | middle-aged father | family, father, memory, nostalgia |
| angryquill | social justice activist | social-justice, anger, racism-and-discrimination |
| coffeeshopverses | urban millennial | city, work, humor, loneliness |
| jesusismyrock_ | devout Christian grandmother | faith, prayer, god, hope |
| queerpoetrybabe | LGBTQ advocate | lgbtq, identity, self-love |
| silentscream | mental health advocate | mental-health, anxiety, depression, healing |
| GrumpyGrandpa | Korean War vet, 80s | aging, nostalgia, war, veterans |

---

## Avatar Strategy

Uses **i.pravatar.cc** static avatar photos (free, reliable, realistic-looking).
Each user gets a unique photo ID: `https://i.pravatar.cc/150?img=N`

No S3 uploads needed. Photos are served directly from pravatar.cc.

---

## Poem Quality

- Intentionally realistic user quality — **not polished, not literary**
- Short to medium length (4–16 lines typically)
- Occasional awkward phrasing, simple rhymes, conversational tone
- Style varies per archetype: teen writes differently than retired veteran

---

## Script

**File:** `backend/scripts/seed-fake-users.js`

- Connects to MongoDB Atlas via `MONGODB_PRE` env var (same cluster as everything else)
- For each fake user: checks if username exists first (idempotent), then creates User document with hashed password
- For each poem: checks if title + userId combo exists (idempotent), then creates Poem document with slug
- At the end: updates each user's `poems` array to match all their created poems
- Prints summary: X users created, Y poems created

**Run command (from `backend/` directory):**
```
node scripts/seed-fake-users.js
```

---

## Implementation Phases

1. **User profile data** — 50 users with names, emails, avatars, preferred genres — embedded in script
2. **Poem generation** — ~310 poems written by Claude, embedded as strings in script
3. **Script execution** — run once against Atlas, verify in app
4. **Optional later** — add likes distribution across poems for engagement realism

---

## Credentials

All 50 fake users share password: `FakeUser2024!`

You can log in as any of them for testing. They're indistinguishable from real users in the DB.

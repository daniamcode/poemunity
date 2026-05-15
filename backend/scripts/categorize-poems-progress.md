# Poem Categorization — Progress Log

## What we are doing

We are migrating all poems in the MongoDB database from the old 14-category system to a new **140-category system** designed for SEO growth.

### Field being updated

We are **overwriting the existing `genre` field** on each poem document. There is no new field — the Poem model has always used `genre: String` as a free-form string, and we are updating its value to match the new slug-based categories.

Example of what changes in MongoDB:
```
Before: { genre: "life" }          ← old loose value
After:  { genre: "growing-up" }    ← new slug from 140-category list
```

Some old values were already valid new slugs (e.g. `love`, `death`, `nature`) and are kept as-is or refined. Others were vague (e.g. `haikus`, `funny`, `sad`) and are mapped to the closest new category.

### How slugs work

Category display names (e.g. `"Father's Day"`, `"Arts & Sciences"`) are converted to URL slugs via `categoryToSlug()` in `frontend/src/data/constants.ts`:

```
"Father's Day"         → fathers-day
"Arts & Sciences"      → arts-and-sciences
"Climate Change"       → climate-change
"LGBTQ"                → lgbtq
"Love"                 → love
```

The `genre` field in the DB stores the slug (lowercase, hyphens). The frontend filters by `genre` via a case-insensitive regex in the backend.

### Who is doing the categorization

Claude Code is reading poem title + first ~120 characters of content, then assigning the most appropriate category from the 140-item list. This runs inside the conversation — no external API calls needed.

### Script file

All completed updates are recorded in:
```
backend/scripts/categorize-poems.js
```

You can re-run it at any time (`node scripts/categorize-poems.js` from the `backend/` directory) — it is idempotent (just overwrites the same value again, no harm done).

---

## Progress

| Batch | Poems | Status | Notes |
|---|---|---|---|
| Batch 1 | 1–100 | ✅ Done | 99/100 matched on first run; 1 ID typo fixed by title lookup |
| Batch 2 | 101–200 | ✅ Done | 100/100 |
| Batch 3 | 201–300 | ✅ Done | 100/100 |
| Batch 4 | 301–400 | ✅ Done | 100/100 |
| Batch 5 | 401–500 | ✅ Done | 100/100; ID prefix changes e404→e416 (169→179) |
| Batch 6 | 501–600 | ✅ Done | 100/100 |
| Batch 7 | 601–700 | ✅ Done | 100/100 |
| Batch 8 | 701–800 | ✅ Done | 100/100; ID prefix change at e5aa (179→189) |
| Batch 9 | 801–900 | ✅ Done | 100/100 |
| Batch 10 | 901–1000 | ✅ Done | 100/100 |
| Batch 11 | 1001–1100 | ✅ Done | 100/100; ID prefix change at e73e (189→199) |
| Batch 12 | 1101–1200 | ✅ Done | 100/100 |
| Batch 13 | 1201–1300 | ✅ Done | 100/100 |
| Batch 14 | 1301–1400 | ✅ Done | 100/100 |
| Batch 15 | 1401–1500 | ✅ Done | 98/100 applied (IDs e806–e807 missing in DB) |
| Batch 16 | 1501–1600 | ✅ Done | 100/100 |
| Batch 17 | 1601–1700 | ✅ Done | 98/100 (IDs e8d0–e8d1 missing in DB) |
| Batch 18 | 1701–1800 | ✅ Done | 100/100 |
| Batch 19 | 1801–1900 | ✅ Done | 100/100 |
| Batch 20 | 1901–2000 | ✅ Done | 100/100 |
| Batch 21 | 2001–2100 | ✅ Done | 100/100 |
| Batch 22 | 2101–2200 | ✅ Done | 100/100 |
| Batch 23 | 2201–2300 | ✅ Done | 100/100 |
| Batch 24 | 2301–2400 | ✅ Done | 100/100 |
| Batches 25–117 | 2401–11700 | ✅ Done | all recorded in script |
| Batches 118–123 | 11701–15668 | ✅ Done | covers end of DB (68 poems in final batch) |
| Missing poems batch | 308 stragglers | ✅ Done | poems missed due to MongoDB skip/limit instability; queried directly and categorized |
| **TOTAL** | **15,668 poems** | **✅ COMPLETE** | Script run: 15,941 updated, 36 not found (stale IDs from duplicate-window overlap) |

---

## Final run result

```
Done — updated: 15941, not found: 36
```

The 36 "not found" are IDs that appeared in the batches array from earlier skip/limit windows that overlapped (duplicate coverage), but the underlying document had a slightly different ID. All 15,668 DB poems now have a genre from the 140-category slug system.

**The categorization is complete. No further batches needed.**

---

## Category reference

Full 140-category list with SEO data is in:
```
docs/categories-seo-research.md
```

Quick reference of slug → display name for the most common categories used:

| Slug | Display Name |
|---|---|
| love | Love |
| death | Death |
| nature | Nature |
| war | War |
| life | Life |
| philosophy | Philosophy |
| history-and-politics | History & Politics |
| arts-and-sciences | Arts & Sciences |
| sorrow-and-grieving | Sorrow & Grieving |
| social-commentaries | Social Commentaries |
| social-justice | Social Justice |
| religion | Religion |
| spiritual | Spiritual |
| family | Family |
| father | Father |
| mother | Mother |
| son | Son |
| friendship | Friendship |
| romantic | Romantic |
| lost-love | Lost Love |
| heartbreak | Heartbreak |
| missing-you | Missing You |
| long-distance | Long Distance |
| marriage | Marriage |
| divorce | Divorce |
| lust-and-desire | Lust & Desire |
| birthday | Birthday |
| anniversary | Anniversary |
| christmas | Christmas |
| new-year | New Year |
| memorial-day | Memorial Day |
| halloween | Halloween |
| thanksgiving | Thanksgiving |
| aging | Aging |
| childhood | Childhood |
| teen | Teen |
| growing-up | Growing Up |
| nostalgia | Nostalgia |
| memory | Memory |
| time | Time |
| living | Living |
| home | Home |
| city | City |
| work | Work |
| travel | Travel |
| school | School |
| humor | Humor |
| funny | Funny |
| sad | Sad |
| darkness | Darkness |
| hope | Hope |
| healing | Healing |
| mental-health | Mental Health |
| anxiety | Anxiety |
| depression | Depression |
| self-love | Self Love |
| identity | Identity |
| anger | Anger |
| regret | Regret |
| loneliness | Loneliness |
| grief | Grief |
| loss | Loss |
| abuse | Abuse |
| addiction | Addiction |
| illness | Illness |
| suicide | Suicide |
| night | Night |
| morning | Morning |
| silence | Silence |
| dreams | Dreams |
| beauty | Beauty |
| freedom | Freedom |
| gratitude | Gratitude |
| faith | Faith |
| prayer | Prayer |
| god | God |
| mythology | Mythology |
| fantasy | Fantasy |
| space | Space |
| stars | Stars |
| moon | Moon |
| ocean | Ocean |
| rain | Rain |
| flower | Flower |
| garden | Garden |
| birds | Birds |
| animal | Animal |
| trees | Trees |
| spring | Spring |
| summer | Summer |
| autumn | Autumn |
| winter | Winter |
| environment | Environment |
| climate-change | Climate Change |
| immigration | Immigration |
| racism-and-discrimination | Racism & Discrimination |
| slavery-and-freedom | Slavery & Freedom |
| gender-and-feminism | Gender & Feminism |
| lgbtq | LGBTQ |
| poverty | Poverty |
| violence | Violence |
| veterans | Veterans |
| america | America |
| music | Music |
| dance | Dance |
| food | Food |
| money | Money |
| goodbye-and-farewell | Goodbye & Farewell |
| moving-on | Moving On |
| apology | Apology |
| broken-heart | Broken Heart |
| strength | Strength |
| courage | Courage |
| kindness | Kindness |
| overcoming-adversity | Overcoming Adversity |
| motivational | Motivational |
| inspirational | Inspirational |
| baby | Baby |
| pregnancy | Pregnancy |
| sister | Sister |
| brother | Brother |
| daughter | Daughter |
| bullying | Bullying |
| betrayal | Betrayal |
| trust | Trust |
| justice | Justice |
| peace | Peace |
| change | Change |
| success | Success |

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
| Batch 4 | 301–400 | ⏳ Next | — |
| … | … | — | — |
| Total DB | 15,668 poems | ~2% done | — |

---

## Where to continue next time

**Next batch: poems 301–400.**

To resume, tell Claude Code: _"continue categorizing poems, next 100"_.

It will run this query to fetch the next batch:
```js
Poem.find({}).skip(300).limit(100).select('_id title poem').lean()
```

Then categorize and update, and append the results to `categorize-poems.js`.

---

## Category reference

Full 140-category list with SEO data is in:
```
docs/categories-seo-research.md
```

Quick reference of slug → display name for the most common categories used so far:

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
| love | Love |
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
| nature | Nature |
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
| social-justice | Social Justice |
| poverty | Poverty |
| violence | Violence |
| war | War |
| veterans | Veterans |
| america | America |
| history-and-politics | History & Politics |
| music | Music |
| dance | Dance |
| food | Food |
| money | Money |
| arts-and-sciences | Arts & Sciences |
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

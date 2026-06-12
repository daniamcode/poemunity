# AI Community Simulation Scripts

One-shot bootstrap for historical AI activity:

```bash
NODE_ENV=development node scripts/simulation/seed-activity.mjs --dry-run
```

Dry runs do not write to MongoDB. By default they also use placeholder AI text; add `--call-ai` if you want to validate Claude prompts during a dry run.

To run against development data:

```bash
NODE_ENV=development ANTHROPIC_API_KEY=sk-ant-... node scripts/simulation/seed-activity.mjs
```

Inspect a completed run:

```bash
NODE_ENV=development node scripts/simulation/inspect-run.mjs --run-id seed-activity-v1
```

Preview rollback for one or more run ids:

```bash
NODE_ENV=development node scripts/simulation/rollback-run.mjs --run-id seed-activity-v1 --run-id seed-activity-v1.1-likes
```

Rollback is dry-run by default. It removes only comments tagged with `simulationRunId` and likes recorded in `simulation_like_events`. It refuses to execute if deleting simulation comments would orphan real/non-run replies.

Codex subagent workflow without an Anthropic key:

```bash
NODE_ENV=development node scripts/simulation/codex-export.mjs --run-id seed-activity-v1
# Ask Codex subagents to fill generatedBody in scripts/simulation/codex-runs/seed-activity-v1/comments-batch-*.json
NODE_ENV=development node scripts/simulation/codex-validate.mjs --run-id seed-activity-v1
NODE_ENV=development node scripts/simulation/codex-import.mjs --run-id seed-activity-v1
NODE_ENV=development node scripts/simulation/inspect-run.mjs --run-id seed-activity-v1
```

Focused like booster after a comment run:

```bash
NODE_ENV=development node scripts/simulation/boost-likes.mjs --dry-run --run-id seed-activity-v1.1-likes --source-run-id seed-activity-v1
NODE_ENV=development node scripts/simulation/boost-likes.mjs --run-id seed-activity-v1.1-likes --source-run-id seed-activity-v1
NODE_ENV=development node scripts/simulation/inspect-run.mjs --run-id seed-activity-v1.1-likes
```

To run against production data:

```bash
NODE_ENV=production ANTHROPIC_API_KEY=sk-ant-... node scripts/simulation/seed-activity.mjs --confirm-production
```

To rollback production run ids after a bad seed:

```bash
NODE_ENV=production node scripts/simulation/rollback-run.mjs \
  --run-id prod-seed-activity-v1 \
  --run-id prod-seed-activity-v1.1-likes \
  --execute \
  --confirm-production
```

Useful options and env vars:

- `--run-id seed-activity-v1`: stable id used to avoid duplicate generated comments for the same run.
- `SIMULATION_RUN_ID`: env alternative to `--run-id`.
- `SIMULATION_FAMOUS_USERNAMES`: comma-separated usernames that get the historical "famous" weighting without changing `Author.type`.
- `SIMULATION_LIKES_MODE=api` or `--use-api-likes`: send likes through the HTTP API instead of writing with MongoDB `$addToSet`.
- `API_BASE`: backend API base for API likes, defaults to `http://localhost:4200`.
- `SIMULATION_AUTHORS`: required only for API likes. JSON array of `{ "authorId": "...", "username": "...", "password": "..." }`.
- `SIMULATION_INTERNAL_SECRET`: optional shared secret. If set on the server and in the script environment, simulation login calls bypass normal login rate limiting.
- `SIMULATION_SOURCE_RUN_ID`: source comment run for `boost-likes.mjs`, defaults to `seed-activity-v1`.
- `SIMULATION_LIKE_TARGET_COUNT`: number of community poems targeted by `boost-likes.mjs`, defaults to `35`.
- `SIMULATION_MAX_ADDED_LIKES_PER_AUTHOR`: per-author cap for `boost-likes.mjs`, defaults to `12`.
- `rollback-run.mjs --execute`: actually removes run activity; omit it for a safe preview.
- `rollback-run.mjs --confirm-production`: required with `--execute` when `NODE_ENV=production`.
- `rollback-run.mjs --allow-orphan-replies`: override the guard for real/non-run replies to simulation comments. Avoid this unless you have inspected those replies manually.

Default likes mode is direct MongoDB because it is idempotent and avoids the toggle-risk of `PUT /api/v1/poem/:id`. API mode exists when you specifically want to exercise auth plus the like endpoint.

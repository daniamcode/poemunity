# Database Backup and Restore Plan

Production data lives in MongoDB Atlas. This plan is the launch minimum before production writes or production AI seeding.

References:

- MongoDB Atlas backup/restore docs: https://www.mongodb.com/docs/atlas/backup-restore-cluster/
- MongoDB Atlas restore overview: https://www.mongodb.com/docs/atlas/backup/cloud-backup/restore-overview/
- `mongodump`: https://www.mongodb.com/docs/database-tools/mongodump/
- `mongorestore`: https://www.mongodb.com/docs/database-tools/mongorestore/

## Launch Requirements

- Confirm the production Atlas cluster has Cloud Backup enabled.
- Confirm at least one operator has Atlas `Project Backup Manager` or `Project Owner` access.
- Create an on-demand snapshot immediately before production AI seeding or other bulk writes.
- Complete one restore drill to a throwaway cluster before launch.
- Record the latest successful restore drill date, source snapshot time, and target cluster name in the release notes or deployment checklist.

## Restore Drill

Do this against a temporary Atlas cluster, not production.

1. In Atlas, open the production project and cluster backup page.
2. Create an on-demand snapshot, or select the newest scheduled snapshot.
3. Restore it to a new temporary cluster. Do not restore in-place during a drill.
4. Point a temporary local shell at the restored cluster and verify core counts:

```bash
mongosh "$RESTORE_URI" --eval 'db.poems.countDocuments(); db.authors.countDocuments(); db.comments.countDocuments()'
```

5. Run a read-only backend smoke test against the restored URI:

```bash
MONGODB="$RESTORE_URI" \
NODE_ENV=production \
PORT=4300 \
FRONTEND_URL=http://localhost:3002 \
SECRET=local-restore-smoke-secret \
REACT_APP_ADMIN=<admin-author-id> \
node index.js

curl 'http://localhost:4300/api/v1/poems?page=1&limit=1'
```

6. Delete the temporary cluster after the drill is recorded.

## Emergency Restore

1. Freeze writes if possible: disable production deploys and pause AI/community simulation scripts.
2. Identify the clean restore timestamp or snapshot.
3. Prefer restoring to a new Atlas cluster first; Atlas restore jobs can replace target data depending on the restore mode.
4. Update the backend Vercel `MONGODB` env var only after the restored cluster passes smoke checks.
5. Smoke test production reads, login, poem creation, comments, and likes before unfreezing writes.

## Local Archive Fallback

Atlas snapshots are the primary backup. For an extra pre-seed archive, use MongoDB Database Tools:

```bash
mkdir -p backups
mongodump --uri "$MONGODB" --archive="backups/poemunity-prod-$(date +%Y%m%d-%H%M%S).archive" --gzip
```

Restore that archive only to a temporary target first:

```bash
mongorestore --uri "$RESTORE_URI" --archive="backups/<archive>.archive" --gzip
```

`mongoexport` is not a backup strategy for this app because it does not preserve the full BSON shape/index state the way snapshots or `mongodump` do.

## AI Seed Rollback Is Separate

If the only bad write is a production AI seed run, use the targeted simulation rollback before considering a full database restore:

```bash
cd backend
NODE_ENV=production node scripts/simulation/rollback-run.mjs \
  --run-id prod-seed-activity-v1 \
  --run-id prod-seed-activity-v1.1-likes
```

That command is dry-run only. To actually undo those run ids:

```bash
NODE_ENV=production node scripts/simulation/rollback-run.mjs \
  --run-id prod-seed-activity-v1 \
  --run-id prod-seed-activity-v1.1-likes \
  --execute \
  --confirm-production
```

import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import { cleanGeneratedText, parseArgs } from './utils.mjs'

const DEFAULT_OUTPUT_DIR = 'scripts/simulation/codex-runs'

async function readJson (filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'))
}

function validateTask (task) {
  const body = cleanGeneratedText(task.generatedBody)
  if (!body) return `Missing generatedBody for ${task.localId}`
  if (/^(TODO|TBD|placeholder)/i.test(body)) return `Placeholder generatedBody for ${task.localId}`
  if (/\b(as an ai|language model|prompt|task id|generatedBody)\b/i.test(body)) {
    return `AI/process leakage in ${task.localId}: ${body}`
  }
  return null
}

async function main () {
  const args = parseArgs(process.argv.slice(2).filter(arg => !['--dry-run', '--call-ai', '--confirm-production', '--use-api-likes'].includes(arg)))
  const outputBase = process.env.SIMULATION_CODEX_OUTPUT_DIR || DEFAULT_OUTPUT_DIR
  const runDir = path.resolve(outputBase, args.runId)
  const files = (await fs.readdir(runDir))
    .filter(file => /^comments-batch-\d+\.json$/.test(file))
    .sort()

  const errors = []
  let taskCount = 0
  for (const file of files) {
    const batch = await readJson(path.join(runDir, file))
    for (const task of batch.tasks || []) {
      taskCount += 1
      const error = validateTask(task)
      if (error) errors.push(`${file}: ${error}`)
    }
  }

  console.log(JSON.stringify({
    runId: args.runId,
    files: files.length,
    taskCount,
    valid: errors.length === 0,
    errors
  }, null, 2))

  if (errors.length) process.exit(1)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

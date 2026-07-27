// Securely set an account's password WITHOUT the plaintext ever appearing on
// the command line, in shell history, or in any log. Run it in YOUR OWN
// terminal (not through an assistant) — it prompts for the password with echo
// disabled, so nobody but you ever sees it.
//
//   Usage:  node scripts/set-account-password.js <username>
//   e.g.    node scripts/set-account-password.js daniamcode2
//
// Requires MONGODB in backend/.env (same var the app uses). The new password
// is bcrypt-hashed and passwordChangedAt is bumped, which revokes existing
// sessions for that account (see middleware/userExtractor.js).

const fs = require('fs')
const path = require('path')
const readline = require('readline')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const Author = require('../src/models/Author')

function loadEnv () {
  if (process.env.MONGODB) return
  const envPath = path.join(__dirname, '..', '.env')
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)\s*=\s*(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}

// Read a line from stdin with the typed characters masked.
function askHidden (query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    const onData = () => {
      // Repaint the line as the prompt + asterisks so the password never shows.
      const masked = '*'.repeat(rl.line.length)
      readline.clearLine(process.stdout, 0)
      readline.cursorTo(process.stdout, 0)
      process.stdout.write(query + masked)
    }
    process.stdin.on('data', onData)
    rl.question(query, (value) => {
      process.stdin.removeListener('data', onData)
      rl.close()
      process.stdout.write('\n')
      resolve(value)
    })
  })
}

function validate (pw) {
  if (typeof pw !== 'string' || pw.length < 8) return 'Password must be at least 8 characters'
  if (pw.length > 128) return 'Password must be at most 128 characters'
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'Password must contain at least one letter and one number'
  return null
}

;(async () => {
  const username = process.argv[2]
  if (!username) {
    console.error('Usage: node scripts/set-account-password.js <username>')
    process.exit(1)
  }
  loadEnv()
  if (!process.env.MONGODB) { console.error('MONGODB not set (backend/.env)'); process.exit(1) }

  const pw1 = await askHidden(`New password for "${username}": `)
  const err = validate(pw1)
  if (err) { console.error('✖ ' + err); process.exit(1) }
  const pw2 = await askHidden('Confirm password: ')
  if (pw1 !== pw2) { console.error('✖ Passwords do not match'); process.exit(1) }

  await mongoose.connect(process.env.MONGODB)
  const author = await Author.findOne({ username }).collation({ locale: 'en', strength: 2 })
  if (!author) { console.error(`✖ No account with username "${username}"`); await mongoose.disconnect(); process.exit(1) }

  author.passwordHash = await bcrypt.hash(pw1, 10)
  author.passwordChangedAt = new Date()
  await author.save()
  console.log(`✔ Password updated for ${author.username} (${author._id}). Existing sessions revoked.`)
  await mongoose.disconnect()
})().catch((e) => { console.error(e.message); process.exit(1) })

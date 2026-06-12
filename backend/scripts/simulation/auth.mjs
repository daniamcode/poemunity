import { getApiBase } from './utils.mjs'

export async function loginAll (authors, context = {}) {
  const tokens = {}
  const apiBase = context.apiBase || getApiBase()

  for (const author of authors) {
    const username = author.username
    if (!username) throw new Error('SIMULATION_AUTHORS entries must include username')

    const headers = { 'Content-Type': 'application/json' }
    if (process.env.SIMULATION_INTERNAL_SECRET) {
      headers['x-simulation-secret'] = process.env.SIMULATION_INTERNAL_SECRET
    }

    const res = await globalThis.fetch(`${apiBase}/api/v1/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ username, password: author.password })
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Failed to log in ${username}: ${res.status} ${body}`)
    }

    tokens[author.authorId || author._id || username] = await res.text()
  }

  return tokens
}

import type { NextApiRequest, NextApiResponse } from 'next'
import { fetchServerUser } from '../../../src/lib/serverApi'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).end()

    const token = req.cookies.token
    if (!token) return res.status(204).end()

    // Profile data comes from the DB (via the token's identity), not the token
    // itself — so it's always fresh and the cookie stays small.
    const user = await fetchServerUser(token)
    if (!user) return res.status(401).json({ error: 'Invalid session' })

    return res.json(user)
}

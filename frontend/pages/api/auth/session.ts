import type { NextApiRequest, NextApiResponse } from 'next'
import { buildServerUser } from '../../../src/lib/serverApi'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).end()

    const token = req.cookies.token
    if (!token) return res.status(204).end()

    const user = buildServerUser(token)
    if (!user) return res.status(401).json({ error: 'Invalid session' })

    return res.json(user)
}

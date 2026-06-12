import type { NextApiRequest, NextApiResponse } from 'next'
import { authCookie } from '../../../src/lib/authCookie'
import { rejectCrossOriginUnsafeRequest } from '../../../src/lib/requestGuards'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end()
    if (rejectCrossOriginUnsafeRequest(req, res)) return

    try {
        const backendRes = await fetch(`${BACKEND_URL}/api/v1/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        })

        const text = await backendRes.text()

        if (!backendRes.ok) {
            return res.status(backendRes.status).json(JSON.parse(text))
        }

        // Backend returns raw JWT string (not JSON-wrapped)
        const token = text

        res.setHeader('Set-Cookie', authCookie(token))

        return res.status(204).end()
    } catch {
        return res.status(500).json({ error: 'Login failed' })
    }
}

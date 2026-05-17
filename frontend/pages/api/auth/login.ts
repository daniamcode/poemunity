import type { NextApiRequest, NextApiResponse } from 'next'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200'
const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end()

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

        const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
        res.setHeader(
            'Set-Cookie',
            `token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SEVEN_DAYS_SECONDS}${secure}`
        )

        // Return JSON-parsed token so the client can still store it in localStorage
        return res.json(token)
    } catch {
        return res.status(500).json({ error: 'Login failed' })
    }
}

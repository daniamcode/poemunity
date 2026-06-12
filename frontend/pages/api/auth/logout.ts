import type { NextApiRequest, NextApiResponse } from 'next'
import { clearAuthCookie } from '../../../src/lib/authCookie'
import { rejectCrossOriginUnsafeRequest } from '../../../src/lib/requestGuards'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') return res.status(405).end()
    if (rejectCrossOriginUnsafeRequest(req, res)) return

    res.setHeader('Set-Cookie', clearAuthCookie())
    return res.json({ message: 'Logged out' })
}

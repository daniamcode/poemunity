import type { NextApiRequest, NextApiResponse } from 'next'

const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function getRequestOrigin(req: NextApiRequest) {
    const host = req.headers.host
    if (!host) return null

    const forwardedProto = req.headers['x-forwarded-proto']
    const proto = Array.isArray(forwardedProto)
        ? forwardedProto[0]
        : forwardedProto || (host.startsWith('localhost') ? 'http' : 'https')

    return `${proto}://${host}`
}

export function rejectCrossOriginUnsafeRequest(req: NextApiRequest, res: NextApiResponse) {
    const method = req.method || 'GET'
    if (!UNSAFE_METHODS.has(method)) return false

    const origin = req.headers.origin
    if (!origin) return false

    if (origin !== getRequestOrigin(req)) {
        res.status(403).json({ error: 'Cross-origin request rejected' })
        return true
    }

    return false
}

import type { NextApiRequest, NextApiResponse } from 'next'
import { authCookie } from '../../../src/lib/authCookie'
import { rejectCrossOriginUnsafeRequest } from '../../../src/lib/requestGuards'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200'

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '2mb'
        }
    }
}

function buildTargetUrl(req: NextApiRequest) {
    const rawPath = req.query.path
    const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath
    const url = new URL(`${BACKEND_URL}/${path}`)

    Object.entries(req.query).forEach(([key, value]) => {
        if (key === 'path') return
        if (Array.isArray(value)) {
            value.forEach(item => url.searchParams.append(key, item))
            return
        }
        if (value !== undefined) {
            url.searchParams.set(key, value)
        }
    })

    return url.toString()
}

function isJson(contentType: string | null) {
    return Boolean(contentType?.includes('application/json'))
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (rejectCrossOriginUnsafeRequest(req, res)) return

    const token = req.cookies.token
    const headers: Record<string, string> = {}
    const contentType = req.headers['content-type']

    if (contentType) headers['Content-Type'] = Array.isArray(contentType) ? contentType[0] : contentType
    if (token) headers.Authorization = `Bearer ${token}`

    try {
        const backendRes = await fetch(buildTargetUrl(req), {
            method: req.method,
            headers,
            body: ['GET', 'HEAD'].includes(req.method || '') ? undefined : JSON.stringify(req.body)
        })

        const responseContentType = backendRes.headers.get('content-type')
        const text = await backendRes.text()

        if (responseContentType) {
            res.setHeader('Content-Type', responseContentType)
        }

        if (isJson(responseContentType) && text) {
            const payload = JSON.parse(text)
            if (payload.token) {
                res.setHeader('Set-Cookie', authCookie(payload.token))
            }
            return res.status(backendRes.status).json(payload)
        }

        return res.status(backendRes.status).send(text)
    } catch {
        return res.status(502).json({ error: 'Backend request failed' })
    }
}

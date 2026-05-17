const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4200'

export interface ServerUser {
    user: string   // raw JWT (= context.user)
    userId: string
    username: string
    picture: string
    config: { headers: { Authorization: string } }
}

// JWT decode using Node.js Buffer — works in getServerSideProps (no browser atob needed)
export function decodeServerToken(token: string): Record<string, any> | null {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        return JSON.parse(Buffer.from(base64, 'base64').toString('utf8'))
    } catch {
        return null
    }
}

export function buildServerUser(token: string): ServerUser | null {
    const jwt = decodeServerToken(token)
    if (!jwt) return null
    return {
        user: token,
        userId: jwt.id ?? '',
        username: jwt.username ?? '',
        picture: jwt.picture ?? '',
        config: { headers: { Authorization: `Bearer ${token}` } }
    }
}

export async function serverFetch<T>(
    path: string,
    params?: Record<string, string | number>,
    token?: string
): Promise<T | null> {
    try {
        const url = new URL(BASE_URL + path)
        if (params) {
            Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
        }
        const headers: Record<string, string> = token
            ? { Authorization: `Bearer ${token}` }
            : {}
        const res = await fetch(url.toString(), { headers })
        if (!res.ok) return null
        return res.json()
    } catch {
        return null
    }
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4200'

export interface ServerUser {
    user: string
    userId: string
    username: string
    picture: string
    bio: string
    preferredGenres: string[]
    name: string
    surname: string
    city: string
    country: string
    birthYear: number | null
    gender: string
    privateFields: string[]
    isAdmin: boolean
    emailVerified: boolean
    config: { withCredentials: true }
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
        user: 'authenticated',
        userId: jwt.id ?? '',
        username: jwt.username ?? '',
        picture: jwt.picture ?? '',
        bio: jwt.bio ?? '',
        preferredGenres: jwt.preferredGenres ?? [],
        name: jwt.name ?? '',
        surname: jwt.surname ?? '',
        city: jwt.city ?? '',
        country: jwt.country ?? '',
        birthYear: jwt.birthYear ?? null,
        gender: jwt.gender ?? '',
        privateFields: jwt.privateFields ?? [],
        isAdmin: jwt.isAdmin ?? false,
        // The JWT is identity-only and carries no verification state; default to
        // false. The DB-backed profile (fetchServerUser) is the source of truth.
        emailVerified: false,
        config: { withCredentials: true }
    }
}

// Fetch the authenticated user's full profile from the DB (source of truth).
// The JWT carries identity only, so display fields (picture, birthYear, …)
// must come from here — never from the token — to avoid stale/oversized-cookie
// problems. Falls back to token identity if the profile fetch fails.
export async function fetchServerUser(token?: string): Promise<ServerUser | null> {
    if (!token) return null
    const profile = await serverFetch<Record<string, any>>('/api/v1/users/profile', undefined, token)
    if (!profile) return buildServerUser(token)
    return {
        user: 'authenticated',
        userId: profile.id ?? '',
        username: profile.username ?? '',
        picture: profile.picture ?? '',
        bio: profile.bio ?? '',
        preferredGenres: profile.preferredGenres ?? [],
        name: profile.name ?? '',
        surname: profile.surname ?? '',
        city: profile.city ?? '',
        country: profile.country ?? '',
        birthYear: profile.birthYear ?? null,
        gender: profile.gender ?? '',
        privateFields: profile.privateFields ?? [],
        isAdmin: profile.isAdmin ?? false,
        emailVerified: profile.emailVerified ?? false,
        config: { withCredentials: true }
    }
}

export interface ServerFetchResult<T> {
    data: T | null
    /**
     * The HTTP status, or 0 when the request never completed at all (DNS,
     * timeout, connection refused).
     */
    status: number
}

/**
 * `serverFetch`, but keeping the status.
 *
 * The distinction matters for pages that want to answer 404: `serverFetch`
 * collapses "this record does not exist" and "the backend is having a moment"
 * into the same `null`, and a page that treats `null` as `notFound: true` will
 * hard-404 its entire URL space during an outage — telling Google to deindex
 * the site over a blip. A soft 404 is a bad day; a mass deindex is a bad month.
 *
 * So: 404 to `notFound`, anything else renders whatever it can.
 */
export async function serverFetchResult<T>(
    path: string,
    params?: Record<string, string | number>,
    token?: string
): Promise<ServerFetchResult<T>> {
    try {
        const url = new URL(BASE_URL + path)
        if (params) {
            Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
        }
        const headers: Record<string, string> = token
            ? { Authorization: `Bearer ${token}` }
            : {}
        const res = await fetch(url.toString(), { headers })
        if (!res.ok) return { data: null, status: res.status }
        return { data: await res.json(), status: res.status }
    } catch {
        return { data: null, status: 0 }
    }
}

export async function serverFetch<T>(
    path: string,
    params?: Record<string, string | number>,
    token?: string
): Promise<T | null> {
    return (await serverFetchResult<T>(path, params, token)).data
}

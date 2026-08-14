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
        // NEVER from the token. This function decodes WITHOUT verifying the
        // signature — it cannot verify, the signing secret lives on the backend
        // — so every field here is attacker-controlled for anyone who can set a
        // cookie. Reading `jwt.isAdmin` handed the admin UI to whoever asked for
        // it. Privilege comes from the DB-backed profile or not at all.
        isAdmin: false,
        // Same reasoning, and the same answer the original comment gave: the
        // DB-backed profile (fetchServerUser) is the source of truth.
        emailVerified: false,
        config: { withCredentials: true }
    }
}

/**
 * Fetch the authenticated user's full profile from the DB (source of truth).
 *
 * The JWT carries identity only, so display fields (picture, birthYear, …) come
 * from here — never from the token — to avoid stale and oversized-cookie
 * problems.
 *
 * THE FALLBACK IS NOT ALLOWED TO RESCUE A REJECTED TOKEN. It used to run on any
 * failure at all, and `serverFetch` collapses every failure into `null` — so a
 * 401 fell through to decoding the very token the backend had just refused. A
 * structurally valid JWT signed with the wrong secret therefore rendered the
 * page as signed in, under whatever username and `isAdmin` flag its payload
 * asked for. The API still rejected every subsequent call, so nothing leaked,
 * but the UI asserted a session that did not exist.
 *
 * So the status is now read, not discarded: 401 and 403 are the backend saying
 * this token is no good, and the only correct answer to that is "not signed
 * in". The fallback survives only for the case it was written for — the backend
 * being unreachable or broken (status 0 or 5xx) — where a signed-in reader
 * keeps their identity on screen through a blip. Even then the identity is
 * unverified, which is why `buildServerUser` grants no privilege.
 */
export async function fetchServerUser(token?: string): Promise<ServerUser | null> {
    if (!token) return null
    const { data: profile, status } = await serverFetchResult<Record<string, any>>(
        '/api/v1/users/profile', undefined, token
    )
    if (!profile) {
        // AN ALLOWLIST, not a list of statuses to refuse. The fallback exists
        // for one situation — the backend being unreachable or broken — so it
        // runs for exactly that: a request that never completed (0) or a server
        // error (5xx). Everything else, 401 and 403 included, means the backend
        // answered and did not give us a profile, and the honest reading of
        // that is "not signed in".
        //
        // The denylist version (`if 401 or 403 return null`) let a 404 through
        // to the fallback — and a 404 here is a renamed route, i.e. deploy skew,
        // not an outage. Same reasoning as PUBLISHED_MATCH and the poem field
        // allowlist: a status nobody thought about should be inert, not trusted.
        const backendUnavailable = status === 0 || status >= 500
        return backendUnavailable ? buildServerUser(token) : null
    }
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

/**
 * The backend did not answer, as opposed to answering "no".
 *
 * `0` is a request that never completed (DNS, timeout, connection refused);
 * `5xx` is the backend failing. Both mean "ask again later". A 404 does NOT
 * belong here and never should: that is a real answer about a real URL.
 */
export function isBackendUnavailable(status: number): boolean {
    return status === 0 || status >= 500
}

/**
 * TELL A CRAWLER THE TRUTH WHEN THE BACKEND IS DOWN: 503, NOT 200.
 *
 * This is the fix for 1,025 soft 404s, and the mechanism was reproduced
 * exactly — point the app at a dead backend and request any poem:
 *
 *     HTTP 200 · <title>Poem | Poemunity</title> · empty description
 *     · self-referencing canonical · no poem anywhere on the page
 *
 * Google fetched pages in that state during the crawl surge that followed the
 * 7 Aug sitemap submission, and filed 1,025 of them as soft 404 — a page that
 * claims success while showing nothing.
 *
 * The routes already reasoned about one half of this: `notFound` is gated on a
 * 404 status rather than on `!data`, precisely so a blip cannot deindex the
 * site. But that left only two branches, 404 or 200, and the honest answer to
 * "my database is unreachable" is neither. A 503 says *temporary*: Google
 * retries, keeps the URL indexed, and files nothing against it.
 *
 * `Retry-After` is advisory but free, and it is what turns a 503 from "broken"
 * into "come back in two minutes".
 *
 * The page still renders whatever it has, deliberately — a human who hits this
 * gets the site's chrome and a nav rather than a stack trace, while the crawler
 * reads the status code and comes back.
 */
export function markBackendUnavailable(res: { statusCode: number, setHeader: (k: string, v: string) => void }): void {
    res.statusCode = 503
    res.setHeader('Retry-After', '120')
}

export async function serverFetch<T>(
    path: string,
    params?: Record<string, string | number>,
    token?: string
): Promise<T | null> {
    return (await serverFetchResult<T>(path, params, token)).data
}

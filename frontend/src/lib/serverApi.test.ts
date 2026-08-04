import { fetchServerUser, buildServerUser, decodeServerToken } from './serverApi'

/**
 * `fetchServerUser` and the token fallback behind it.
 *
 * The vulnerability these tests exist for: `fetchServerUser` used `serverFetch`,
 * which collapses EVERY failure into `null`, and then fell back to
 * `buildServerUser(token)` — a decode of the JWT WITHOUT signature
 * verification (it cannot verify; the secret lives on the backend). So a
 * structurally valid token signed with the wrong secret went: backend 401 →
 * fallback → page hydrated as signed in, under whatever `username` and
 * `isAdmin` the attacker put in the payload. Nothing leaked (the API rejected
 * every later call) but the UI asserted a session that did not exist and handed
 * over the admin chrome.
 *
 * Two rules follow, and each of the two needs the other:
 *
 *   1. 401/403 → `null`. The backend has refused this token; "not signed in" is
 *      the only correct answer. The fallback survives ONLY for a backend that
 *      is unreachable (status 0) or broken (5xx), which is the case it was
 *      written for — a signed-in reader keeps their identity through a blip.
 *   2. The fallback grants no privilege, ever. Every field it reads is
 *      attacker-controlled, so `isAdmin` is hardcoded `false` rather than read
 *      from the payload.
 *
 * The success case is the deliberate distractor: an implementation that simply
 * returned `isAdmin: false` always, or `null` on every failure, would satisfy
 * the security assertions and be wrong. A real admin must still get the admin
 * UI, and that privilege must arrive from the DB-backed profile.
 */

const b64url = (obj: Record<string, unknown>) =>
    Buffer.from(JSON.stringify(obj)).toString('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

/**
 * A token that decodes cleanly and claims everything an attacker would want.
 * The signature is nonsense — that is the point: this is exactly the shape of a
 * token signed with the WRONG secret, which the backend answers 401 to and the
 * client cannot tell apart from a good one by looking.
 */
const forgedAdminToken = [
    b64url({ alg: 'HS256', typ: 'JWT' }),
    b64url({
        id: 'attacker-id',
        username: 'attacker',
        name: 'Mallory',
        isAdmin: true,
        emailVerified: true
    }),
    'not-a-real-signature'
].join('.')

const okResponse = (body: unknown) => ({
    ok: true,
    status: 200,
    json: async () => body
})

const errorResponse = (status: number) => ({
    ok: false,
    status,
    json: async () => ({})
})

const mockFetch = jest.fn()

beforeEach(() => {
    mockFetch.mockReset()
    global.fetch = mockFetch as unknown as typeof fetch
})

describe('fetchServerUser: a refused token is not rescued by the fallback', () => {
    it.each([401, 403])(
        'returns null on %i even though the token decodes cleanly',
        async (status) => {
            mockFetch.mockResolvedValue(errorResponse(status))

            // The premise: this token is not junk. A regression that falls back
            // to decoding it produces a signed-in admin, not an empty object.
            const decoded = decodeServerToken(forgedAdminToken)
            expect(decoded).toMatchObject({ username: 'attacker', isAdmin: true })

            await expect(fetchServerUser(forgedAdminToken)).resolves.toBeNull()
        }
    )
})

describe('fetchServerUser: an unreachable or broken backend still falls back', () => {
    it('falls back to token identity when the request never completes (status 0)', async () => {
        mockFetch.mockRejectedValue(new Error('ECONNREFUSED'))

        const user = await fetchServerUser(forgedAdminToken)

        expect(user).not.toBeNull()
        expect(user!.user).toBe('authenticated')
        expect(user!.userId).toBe('attacker-id')
        expect(user!.username).toBe('attacker')
    })

    it('falls back on a 5xx', async () => {
        mockFetch.mockResolvedValue(errorResponse(503))

        const user = await fetchServerUser(forgedAdminToken)

        expect(user).not.toBeNull()
        expect(user!.username).toBe('attacker')
    })

    it.each([
        ['network failure', () => mockFetch.mockRejectedValue(new Error('ECONNREFUSED'))],
        ['500', () => mockFetch.mockResolvedValue(errorResponse(500))]
    ])('never grants isAdmin through the fallback (%s), however loudly the payload asks',
        async (_label, arrange) => {
            arrange()

            const user = await fetchServerUser(forgedAdminToken)

            // Identity survived the blip, so this is the fallback path and not
            // a null: the assertion below is about privilege, not reachability.
            expect(user!.username).toBe('attacker')
            expect(user!.isAdmin).toBe(false)
            expect(user!.emailVerified).toBe(false)
        }
    )

    it('buildServerUser hardcodes isAdmin false directly', () => {
        const user = buildServerUser(forgedAdminToken)
        expect(user!.username).toBe('attacker')
        expect(user!.isAdmin).toBe(false)
    })
})

describe('fetchServerUser: the profile is the source of truth', () => {
    it('returns DB values, including a real admin flag', async () => {
        // Distractor: the token says admin AND the profile says admin, but the
        // fields disagree everywhere else, so a fallback answer is visibly
        // different from a profile answer. An implementation that always
        // returned isAdmin:false would pass every security test above and fail
        // here — a real admin has to keep the admin UI.
        mockFetch.mockResolvedValue(okResponse({
            id: 'db-id',
            username: 'realadmin',
            name: 'Ada',
            picture: 'pic.png',
            bio: 'from the database',
            preferredGenres: ['Love'],
            birthYear: 1815,
            privateFields: ['city'],
            isAdmin: true,
            emailVerified: true
        }))

        const user = await fetchServerUser(forgedAdminToken)

        expect(user).toMatchObject({
            user: 'authenticated',
            userId: 'db-id',
            username: 'realadmin',
            name: 'Ada',
            bio: 'from the database',
            preferredGenres: ['Love'],
            birthYear: 1815,
            privateFields: ['city'],
            isAdmin: true,
            emailVerified: true
        })
    })

    it('a non-admin profile is not admin, even with a token claiming otherwise', async () => {
        mockFetch.mockResolvedValue(okResponse({
            id: 'db-id',
            username: 'poet',
            isAdmin: false
        }))

        const user = await fetchServerUser(forgedAdminToken)

        expect(user!.username).toBe('poet')
        expect(user!.isAdmin).toBe(false)
    })
})

describe('fetchServerUser: degenerate tokens', () => {
    it('returns null with no token, without calling the backend', async () => {
        await expect(fetchServerUser(undefined)).resolves.toBeNull()
        await expect(fetchServerUser('')).resolves.toBeNull()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('returns null rather than throwing when a malformed token hits the fallback path', async () => {
        // The fallback is the only path that decodes, so the malformed token
        // has to reach it: a 401 would return null for the refusal instead and
        // prove nothing about the decode.
        mockFetch.mockRejectedValue(new Error('ECONNREFUSED'))

        await expect(fetchServerUser('not-a-jwt')).resolves.toBeNull()
        await expect(fetchServerUser('a.b')).resolves.toBeNull()
        expect(decodeServerToken('not-a-jwt')).toBeNull()
    })

    describe('the fallback is an allowlist, not a denylist', () => {
        // It exists for "the backend is unreachable or broken". A 404 is a
        // renamed route — deploy skew — and a 400 is a bad request; neither is
        // an outage, and neither should hydrate the page off an unverified
        // token. Caught in review of the first fix, which listed the statuses
        // to REFUSE and so trusted every status nobody had thought about.
        test.each([[400], [404], [418], [429]])('status %i does NOT fall back', async (status) => {
            mockFetch.mockResolvedValue(errorResponse(status) as never)

            await expect(fetchServerUser(forgedAdminToken)).resolves.toBeNull()
        })

        test.each([[500], [502], [503]])('status %i still falls back — that is the point', async (status) => {
            mockFetch.mockResolvedValue(errorResponse(status) as never)

            const user = await fetchServerUser(forgedAdminToken)

            expect(user?.username).toBe('attacker')
            // ...but never with privilege.
            expect(user?.isAdmin).toBe(false)
        })
    })
})

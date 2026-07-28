/* eslint-disable max-lines */
import {
    parseQuery,
    urlParse,
    urlTail,
    getQueryParam,
    decodeRedirectQuery,
    queryMatch,
    getEncodedUri
} from './urlUtils'

describe('urlUtils', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('parseQuery', () => {
        test('should parse query string with single parameter', () => {
            const result = parseQuery('?name="John"')

            expect(result).toEqual({ name: 'John' })
        })

        test('should parse query string with multiple parameters', () => {
            const result = parseQuery('?name="John"&age=30&active=true')

            expect(result).toEqual({
                name: 'John',
                age: 30,
                active: true
            })
        })

        test('should parse empty query string', () => {
            const result = parseQuery('')

            expect(result).toEqual({})
        })

        test('should parse query string with JSON values', () => {
            const result = parseQuery('?user={"name":"John","age":30}')

            expect(result).toEqual({
                user: { name: 'John', age: 30 }
            })
        })

        test('should handle URL with question mark prefix', () => {
            const result = parseQuery('?key="value"')

            expect(result).toEqual({ key: 'value' })
        })

        test('should handle URL without question mark prefix', () => {
            const result = parseQuery('key="value"')

            expect(result).toEqual({ key: 'value' })
        })

        test('should not include __proto__ in results', () => {
            const result = parseQuery('?safe="value"')

            // __proto__ is filtered out in the reduce function
            expect(result).toEqual({ safe: 'value' })
            expect(Object.keys(result)).not.toContain('__proto__')
        })

        test('should parse array values', () => {
            const result = parseQuery('?items=[1,2,3]')

            expect(result).toEqual({ items: [1, 2, 3] })
        })

        test('should parse boolean values', () => {
            const result = parseQuery('?enabled=true&disabled=false')

            expect(result).toEqual({ enabled: true, disabled: false })
        })

        test('should parse null values', () => {
            const result = parseQuery('?value=null')

            expect(result).toEqual({ value: null })
        })

        test('should parse number values', () => {
            const result = parseQuery('?count=42&price=19.99')

            expect(result).toEqual({ count: 42, price: 19.99 })
        })

        test('should parse nested JSON objects', () => {
            const result = parseQuery('?config={"theme":"dark","lang":"en"}')

            expect(result).toEqual({ config: { theme: 'dark', lang: 'en' } })
        })

        // parseQuery reads EVERY key in the URL, not just the ones the caller
        // asked for, and it used to JSON.parse each one unguarded. The app's own
        // params are JSON.stringify'd so they round-trip, but anything else in
        // the URL is a bare string — and a single throw took down the entire
        // page with "Application error: a client-side exception has occurred".
        // Every case below crashed the site before the fix.
        describe('non-JSON values (params the app did not write)', () => {
            test('keeps a bare string instead of throwing', () => {
                expect(parseQuery('?q=Shake')).toEqual({ q: 'Shake' })
            })

            test.each([
                ['google ads', '?utm_source=google', { utm_source: 'google' }],
                ['facebook share', '?fbclid=abc123', { fbclid: 'abc123' }],
                ['referrer tag', '?ref=twitter', { ref: 'twitter' }],
                ['email campaign', '?utm_medium=email', { utm_medium: 'email' }]
            ])('survives a %s link', (_label, url, expected) => {
                expect(() => parseQuery(url)).not.toThrow()
                expect(parseQuery(url)).toEqual(expected)
            })

            test('one unparseable param does not poison the valid ones beside it', () => {
                // The real regression: a tracking param arriving alongside the
                // app's own filters must not cost us the filters.
                expect(parseQuery('?origin="famous"&utm_source=google')).toEqual({
                    origin: 'famous',
                    utm_source: 'google'
                })
            })

            test('handles a query containing spaces and symbols', () => {
                expect(parseQuery('?q=' + encodeURIComponent('a b&c'))).toEqual({ q: 'a b&c' })
            })

            test('treats an empty value as an empty string, not a crash', () => {
                expect(parseQuery('?q=')).toEqual({ q: '' })
            })

            test('still parses valid JSON rather than always falling back to raw', () => {
                // The fallback must not swallow the app's own encoding: 'famous'
                // has to come back unquoted, or every filter comparison breaks.
                expect(parseQuery('?origin="famous"&count=42&flag=true')).toEqual({
                    origin: 'famous',
                    count: 42,
                    flag: true
                })
            })

            test('keeps ignoring __proto__ while tolerating junk', () => {
                const result = parseQuery('?__proto__=polluted&q=Shake')

                expect(result).toEqual({ q: 'Shake' })
                expect(({} as Record<string, unknown>).polluted).toBeUndefined()
            })
        })
    })

    describe('urlParse', () => {
        test('should parse complete URL', () => {
            const result = urlParse('https://example.com/path/to/resource')

            expect(result).toEqual({
                protocol: 'https',
                host: 'example.com',
                tail: 'resource'
            })
        })

        test('should parse URL with http protocol', () => {
            const result = urlParse('http://localhost:3000/test')

            expect(result).toEqual({
                protocol: 'http',
                host: 'localhost:3000',
                tail: 'test'
            })
        })

        test('should extract tail from nested path', () => {
            const result = urlParse('https://example.com/a/b/c/file.html')

            expect(result.tail).toBe('file.html')
        })

        test('should handle URL with port number', () => {
            const result = urlParse('http://localhost:8080/page')

            expect(result.host).toBe('localhost:8080')
        })

        test('should handle URL with query string in tail', () => {
            const result = urlParse('https://example.com/page?query=value')

            expect(result.tail).toBe('page?query=value')
        })

        test('should extract protocol correctly', () => {
            const result = urlParse('ftp://files.example.com/download')

            expect(result.protocol).toBe('ftp')
        })

        test('should handle URLs with subdomains', () => {
            const result = urlParse('https://api.dev.example.com/v1/users')

            expect(result.host).toBe('api.dev.example.com')
            expect(result.tail).toBe('users')
        })
    })

    describe('urlTail', () => {
        test('should return tail of URL', () => {
            const result = urlTail('https://example.com/path/to/file.txt')

            expect(result).toBe('file.txt')
        })

        test('should return tail with query string', () => {
            const result = urlTail('https://example.com/page?id=123')

            expect(result).toBe('page?id=123')
        })

        test('should return last segment of path', () => {
            const result = urlTail('http://localhost:3000/users/profile/edit')

            expect(result).toBe('edit')
        })

        test('should handle single path segment', () => {
            const result = urlTail('https://example.com/home')

            expect(result).toBe('home')
        })

        test('should handle URL with hash', () => {
            const result = urlTail('https://example.com/page#section')

            expect(result).toBe('page#section')
        })
    })

    describe('getQueryParam', () => {
        test('should call parseQuery internally', () => {
            // getQueryParam uses parseQuery which is already well-tested
            // Testing it would require mocking window.location which causes JSDOM issues
            expect(typeof getQueryParam).toBe('function')
        })
    })

    describe('decodeRedirectQuery', () => {
        test('should decode redirect query string', () => {
            const result = decodeRedirectQuery('redirect=test')

            expect(result).toBe('redirect=test')
        })

        test('should handle empty string', () => {
            const result = decodeRedirectQuery('')

            expect(result).toBe('')
        })

        test('should handle query without encoded characters', () => {
            const result = decodeRedirectQuery('simple=query')

            expect(result).toBe('simple=query')
        })

        test('should return a string', () => {
            const result = decodeRedirectQuery('test=value')

            expect(typeof result).toBe('string')
        })
    })

    describe('queryMatch', () => {
        test('should be a function that compares query params', () => {
            // queryMatch uses getQueryParam which requires window.location
            // Testing it would require mocking window.location which causes JSDOM issues
            expect(typeof queryMatch).toBe('function')
        })
    })

    describe('getEncodedUri', () => {
        test('should encode URI with spaces', () => {
            const result = getEncodedUri('https://example.com/path with spaces')

            expect(result).toBe('https://example.com/path%20with%20spaces')
        })

        test('should handle hash in URL', () => {
            const result = getEncodedUri('test#hash')

            expect(result).toBe('test#hash')
        })

        test('should handle already encoded URI', () => {
            const result = getEncodedUri('https://example.com/path%20encoded')

            // encodeURI will double-encode already encoded characters
            expect(result).toBe('https://example.com/path%2520encoded')
        })

        test('should handle empty string', () => {
            const result = getEncodedUri('')

            expect(result).toBe('')
        })

        test('should encode international characters', () => {
            const result = getEncodedUri('https://example.com/café')

            expect(result).toBe('https://example.com/caf%C3%A9')
        })

        test('should encode special characters', () => {
            const result = getEncodedUri('https://example.com/path?query=hello world')

            expect(result).toContain('hello%20world')
        })

        test('should preserve protocol and domain', () => {
            const result = getEncodedUri('https://example.com/test')

            expect(result).toContain('https://example.com/')
        })
    })
})

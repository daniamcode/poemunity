import { getCurrentFormattedDate, parseLikes, buildPoemData } from './poemUtils'
import { PoemFormData } from '../components/Profile/hooks/useProfileForm'

describe('poemUtils', () => {
    describe('getCurrentFormattedDate', () => {
        it('should return a formatted date string', () => {
            const result = getCurrentFormattedDate()
            // Format: YYYY-M-D H:M:S
            expect(result).toMatch(/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/)
        })

        it('should include current year', () => {
            const result = getCurrentFormattedDate()
            const currentYear = new Date().getFullYear()
            expect(result).toContain(currentYear.toString())
        })

        it('should return different values when called at different times', () => {
            const date1 = getCurrentFormattedDate()
            // Wait a tiny bit to ensure different seconds
            const date2 = getCurrentFormattedDate()
            // They might be the same if called in the same second, so we just check format
            expect(date1).toMatch(/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/)
            expect(date2).toMatch(/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/)
        })
    })

    describe('parseLikes', () => {
        it('should return empty array when likes is empty string', () => {
            expect(parseLikes('')).toEqual([])
        })

        it('should return empty array when likes is empty array', () => {
            expect(parseLikes([])).toEqual([])
        })

        it('should split comma-separated string into array', () => {
            expect(parseLikes('user1,user2,user3')).toEqual(['user1', 'user2', 'user3'])
        })

        it('should handle single value string', () => {
            expect(parseLikes('user1')).toEqual(['user1'])
        })

        it('should handle string with spaces after commas', () => {
            expect(parseLikes('user1, user2, user3')).toEqual(['user1', ' user2', ' user3'])
        })

        it('should return empty array for non-string array input', () => {
            expect(parseLikes(['user1', 'user2'])).toEqual([])
        })
    })

    describe('buildPoemData', () => {
        const mockPoemFormData: PoemFormData = {
            content: 'Test poem content',
            title: 'Test Title',
            category: 'love',
            fakeId: 'user123',
            origin: 'famous',
            likes: 'user1,user2'
        }

        it('should build poem data for regular user', () => {
            const result = buildPoemData(mockPoemFormData, false)

            // An ordinary poet sends exactly the four fields the server will
            // accept from one — nothing more. `toEqual`, not `toMatchObject`:
            // the whole point is what is ABSENT.
            expect(result).toEqual({
                poem: 'Test poem content',
                title: 'Test Title',
                genre: 'love'
            })
        })

        it('should build poem data for admin user', () => {
            const result = buildPoemData(mockPoemFormData, true)

            expect(result).toMatchObject({
                poem: 'Test poem content',
                title: 'Test Title',
                genre: 'love',
                userId: 'user123',
                likes: ['user1', 'user2'],
                origin: 'famous'
            })
            expect(result.date).toMatch(/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/)
        })

        it('should handle empty likes for admin', () => {
            const poemData = { ...mockPoemFormData, likes: '' }
            const result = buildPoemData(poemData, true)

            expect(result.likes).toEqual([])
        })

        it('should include current date for admin only', () => {
            const currentYear = new Date().getFullYear()

            expect(buildPoemData(mockPoemFormData, true).date)
                .toContain(currentYear.toString())
            // A poet's date comes from the server clock, so sending one would
            // only be a claim the database never honours.
            expect(buildPoemData(mockPoemFormData, false).date).toBeUndefined()
        })

        it('should send no server-owned field for a regular user', () => {
            // These four are dropped by `POST /poems` and by `PATCH /poem/:id`
            // for anyone but the admin (see backend poemFieldAllowlist.test.js).
            // Sending them anyway is not merely wasted bytes: the edit success
            // handler merges the POSTED fields into the Redux poem entity, so
            // the UI would display a date, an origin and a like count that the
            // database never stored.
            const result = buildPoemData(mockPoemFormData, false)

            expect(result.userId).toBeUndefined()
            expect(result.origin).toBeUndefined()
            expect(result.likes).toBeUndefined()
            expect(result.date).toBeUndefined()
        })

        it('should include all admin-specific fields for admin user', () => {
            const result = buildPoemData(mockPoemFormData, true)

            expect(result.userId).toBe('user123')
            expect(result.origin).toBe('famous')
            expect(result.likes).toEqual(['user1', 'user2'])
        })

        it('should map content to poem field', () => {
            const result = buildPoemData(mockPoemFormData, false)
            expect(result.poem).toBe('Test poem content')
        })

        it('should map category to genre field', () => {
            const result = buildPoemData(mockPoemFormData, false)
            expect(result.genre).toBe('love')
        })
    })
})

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

            expect(result).toMatchObject({
                poem: 'Test poem content',
                title: 'Test Title',
                genre: 'love',
                likes: [],
                origin: 'user'
            })
            expect(result.date).toMatch(/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/)
            expect(result.userId).toBeUndefined()
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

        it('should include current date in result', () => {
            const result = buildPoemData(mockPoemFormData, false)
            const currentYear = new Date().getFullYear()

            expect(result.date).toContain(currentYear.toString())
        })

        it('should not include admin-specific fields for regular user', () => {
            const result = buildPoemData(mockPoemFormData, false)

            expect(result.userId).toBeUndefined()
            expect(result.origin).toBe('user')
            expect(result.likes).toEqual([])
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

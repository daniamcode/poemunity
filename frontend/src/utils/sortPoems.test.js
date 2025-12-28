import sortPoems from './sortPoems'
import { ORDER_BY_DATE, ORDER_BY_LIKES, ORDER_BY_RANDOM, ORDER_BY_TITLE } from '../data/constants'

describe('sortPoems', () => {
    const mockPoems = [
        {
            id: '1',
            title: 'Zebra Poem',
            author: 'Author A',
            poem: 'Content',
            genre: 'love',
            likes: ['user1'],
            date: '2024-01-15'
        },
        {
            id: '2',
            title: 'Apple Poem',
            author: 'Author B',
            poem: 'Content',
            genre: 'sad',
            likes: ['user1', 'user2', 'user3'],
            date: '2024-01-20'
        },
        {
            id: '3',
            title: 'Middle Poem',
            author: 'Author C',
            poem: 'Content',
            genre: 'love',
            likes: ['user1', 'user2'],
            date: '2024-01-10'
        }
    ]

    describe('Regression: Array mutation issue', () => {
        test('should NOT mutate the original array when sorting by title', () => {
            const originalPoems = [...mockPoems]
            const originalFirstPoem = mockPoems[0]

            const sorted = sortPoems(ORDER_BY_TITLE, mockPoems)

            // Verify original array is unchanged
            expect(mockPoems[0]).toBe(originalFirstPoem)
            expect(mockPoems).toEqual(originalPoems)

            // Verify we got a new array
            expect(sorted).not.toBe(mockPoems)
        })

        test('should NOT mutate the original array when sorting by likes', () => {
            const originalPoems = [...mockPoems]
            const originalFirstPoem = mockPoems[0]

            const sorted = sortPoems(ORDER_BY_LIKES, mockPoems)

            // Verify original array is unchanged
            expect(mockPoems[0]).toBe(originalFirstPoem)
            expect(mockPoems).toEqual(originalPoems)

            // Verify we got a new array
            expect(sorted).not.toBe(mockPoems)
        })

        test('should NOT mutate the original array when sorting by date', () => {
            const originalPoems = [...mockPoems]
            const originalFirstPoem = mockPoems[0]

            const sorted = sortPoems(ORDER_BY_DATE, mockPoems)

            // Verify original array is unchanged
            expect(mockPoems[0]).toBe(originalFirstPoem)
            expect(mockPoems).toEqual(originalPoems)

            // Verify we got a new array
            expect(sorted).not.toBe(mockPoems)
        })

        test('should NOT mutate the original array when sorting by random', () => {
            const originalPoems = [...mockPoems]

            const sorted = sortPoems(ORDER_BY_RANDOM, mockPoems)

            // Verify we got a new array (even if order might be same by chance)
            expect(sorted).not.toBe(mockPoems)

            // Original array should be unchanged
            expect(mockPoems).toEqual(originalPoems)
        })

        test('should return a new array reference every time, even with same order', () => {
            const poems = [...mockPoems]

            const sorted1 = sortPoems(ORDER_BY_TITLE, poems)
            const sorted2 = sortPoems(ORDER_BY_TITLE, poems)

            // Each call should return a NEW array reference
            expect(sorted1).not.toBe(sorted2)
            expect(sorted1).not.toBe(poems)
            expect(sorted2).not.toBe(poems)
        })
    })

    describe('Sorting functionality', () => {
        test('should sort by title alphabetically', () => {
            const sorted = sortPoems(ORDER_BY_TITLE, mockPoems)

            expect(sorted[0].title).toBe('Apple Poem')
            expect(sorted[1].title).toBe('Middle Poem')
            expect(sorted[2].title).toBe('Zebra Poem')
        })

        test('should sort by likes count descending', () => {
            const sorted = sortPoems(ORDER_BY_LIKES, mockPoems)

            expect(sorted[0].likes.length).toBe(3) // Apple Poem
            expect(sorted[1].likes.length).toBe(2) // Middle Poem
            expect(sorted[2].likes.length).toBe(1) // Zebra Poem
        })

        test('should sort by date descending (newest first)', () => {
            const sorted = sortPoems(ORDER_BY_DATE, mockPoems)

            expect(sorted[0].date).toBe('2024-01-20') // Apple Poem
            expect(sorted[1].date).toBe('2024-01-15') // Zebra Poem
            expect(sorted[2].date).toBe('2024-01-10') // Middle Poem
        })

        test('should return array when sorting by random', () => {
            const sorted = sortPoems(ORDER_BY_RANDOM, mockPoems)

            // Should return an array with same length
            expect(sorted).toHaveLength(mockPoems.length)

            // Should contain all the same poems
            expect(sorted).toEqual(expect.arrayContaining(mockPoems))
        })

        test('should return original array when no valid sort option provided', () => {
            const sorted = sortPoems('invalid-option', mockPoems)

            // Should still return a new array, but not sorted
            expect(sorted).not.toBe(mockPoems)
            expect(sorted).toHaveLength(mockPoems.length)
        })
    })
})

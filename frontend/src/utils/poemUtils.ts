import { PoemFormData } from '../components/Profile/hooks/useProfileForm'

// Helper: Format current date as YYYY-M-D H:M:S
export function getCurrentFormattedDate(): string {
    const date = new Date()
    const datePart = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    const timePart = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
    return `${datePart} ${timePart}`
}

// Helper: Parse likes from string to array
export function parseLikes(likes: string | string[]): string[] {
    if (typeof likes === 'string' && likes.length > 0) {
        return likes.split(',')
    }
    return []
}

// Helper: Build poem data based on user role and form data
export function buildPoemData(poem: PoemFormData, isAdmin: boolean): any {
    const baseData = {
        poem: poem.content,
        title: poem.title,
        genre: poem.category,
        date: getCurrentFormattedDate()
    }

    if (isAdmin) {
        return {
            ...baseData,
            userId: poem.fakeId,
            likes: parseLikes(poem.likes),
            origin: poem.origin
        }
    }

    return {
        ...baseData,
        likes: [],
        origin: 'user'
    }
}

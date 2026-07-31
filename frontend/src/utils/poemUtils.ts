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
// `date`, `likes` and `origin` are NOT sent for an ordinary poet, because the
// server no longer accepts them from one: creation stamps its own date and an
// empty likes array, and `PATCH /poem/:id` drops all three. Sending them anyway
// would be worse than useless — the edit success handler merges the posted
// fields straight into the poem entity, so the UI would show a date and an
// origin the database never stored.
//
// The admin keeps them: they seed and repair fake-poet content, and both
// endpoints admin-gate exactly this set.
export function buildPoemData(poem: PoemFormData, isAdmin: boolean): any {
    const baseData = {
        poem: poem.content,
        title: poem.title,
        genre: poem.category
    }

    if (isAdmin) {
        return {
            ...baseData,
            date: getCurrentFormattedDate(),
            userId: poem.fakeId,
            likes: parseLikes(poem.likes),
            origin: poem.origin
        }
    }

    return baseData
}

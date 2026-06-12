const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7

export function authCookie(token: string) {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    return `token=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SEVEN_DAYS_SECONDS}${secure}`
}

export function clearAuthCookie() {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    return `token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`
}

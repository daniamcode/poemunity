export const API_ENDPOINTS = {
    POEMS: '/api/v1/poems',
    POEMS_RANKING: '/api/v1/poems/ranking',
    POEM_OF_THE_WEEK: '/api/v1/poems/poem-of-the-week',
    POEM: '/api/v1/poem',
    LOGIN: '/api/v1/login',
    REGISTER: '/api/v1/register',
    REGISTER_AVAILABILITY: '/api/v1/register/availability',
    PASSWORD_FORGOT: '/api/v1/password/forgot',
    PASSWORD_RESET: '/api/v1/password/reset',
    VERIFY_CONFIRM: '/api/v1/verify/confirm',
    VERIFY_RESEND: '/api/v1/verify/resend',
    AUTHORS: '/api/v1/authors',
    AUTHORS_LETTERS: '/api/v1/authors/letters',
    // Follow lives in the /authors namespace — it is a fact about an author, not
    // a resource of its own. `idOrSlug` because the author page has a slug and
    // the signed-in user's own profile tabs have only an id.
    AUTHOR_FOLLOW: (idOrSlug: string) => `/api/v1/authors/${encodeURIComponent(idOrSlug)}/follow`,
    AUTHOR_FOLLOWERS: (idOrSlug: string) => `/api/v1/authors/${encodeURIComponent(idOrSlug)}/followers`,
    AUTHOR_FOLLOWING: (idOrSlug: string) => `/api/v1/authors/${encodeURIComponent(idOrSlug)}/following`,
    NOTIFICATIONS: '/api/v1/notifications',
    NOTIFICATIONS_UNREAD_COUNT: '/api/v1/notifications/unread-count',
    NOTIFICATIONS_READ: '/api/v1/notifications/read',
    NOTIFICATION_PREFERENCES: '/api/v1/notifications/preferences',
    COMMENTS: '/api/v1/comments',
    // The "My comments" tab. Session-scoped, so it takes no author parameter.
    COMMENTS_MINE: '/api/v1/comments/mine',
    // Two numbers for the profile stats panel. The RANK it shows is not here —
    // it comes from POEMS_RANKING, already fetched once app-wide, so the panel
    // and the public sidebar cannot disagree.
    USER_STATS: '/api/v1/users/stats'
}

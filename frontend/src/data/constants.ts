export const WEB_SUBTITLE = 'Your poem community!'
export const CATEGORIES_TITLE = 'Categories'
export const CATEGORIES_BROWSE_ALL = 'Browse all categories →'
export const MUST_HAVE_CATEGORIES = [
    'America',
    'Animal',
    'Arts & Sciences',
    'Beauty',
    'Children',
    'Childhood',
    'Death',
    'Family',
    'Friendship',
    'History & Politics',
    'Humor',
    'Life',
    'Living',
    'Loss',
    'Love',
    'Marriage',
    'Memory',
    'Nature',
    'Philosophy',
    'Religion',
    'Social Commentaries',
    'Sorrow & Grieving',
    'Spiritual',
    'Teen',
    'Time',
    'War',
]
export const CATEGORIES = [
    'Abuse',
    'Addiction',
    'Aging',
    'America',
    'Anger',
    'Animal',
    'Anniversary',
    'Anxiety',
    'Apology',
    'Arts & Sciences',
    'Autumn',
    'Baby',
    'Beauty',
    'Betrayal',
    'Birds',
    'Birthday',
    'Broken Heart',
    'Brother',
    'Bullying',
    'Change',
    'Childhood',
    'Children',
    'Christmas',
    'City',
    'Climate Change',
    'Courage',
    'Dance',
    'Darkness',
    'Daughter',
    'Death',
    'Depression',
    'Divorce',
    'Dreams',
    'Easter',
    'Environment',
    'Faith',
    'Family',
    'Fantasy',
    "Father's Day",
    'Father',
    'Flower',
    'Food',
    'Freedom',
    'Friendship',
    'Funeral',
    'Funny',
    'Garden',
    'Gender & Feminism',
    'God',
    'Goodbye & Farewell',
    'Graduation',
    'Gratitude',
    'Grief',
    'Growing Up',
    'Halloween',
    'Healing',
    'Heartbreak',
    'History & Politics',
    'Home',
    'Hope',
    'Humor',
    'Identity',
    'Illness',
    'Imagination',
    'Immigration',
    'Inspirational',
    'Justice',
    'Kindness',
    'LGBTQ',
    'Life',
    'Living',
    'Loneliness',
    'Long Distance',
    'Loss',
    'Lost Love',
    'Love',
    'Lust & Desire',
    'Marriage',
    'Memorial Day',
    'Memory',
    'Mental Health',
    'Missing You',
    'Money',
    'Moon',
    'Morning',
    'Mother',
    "Mother's Day",
    'Motivational',
    'Moving On',
    'Music',
    'Mythology',
    'Nature',
    'New Year',
    'Night',
    'Nostalgia',
    'Ocean',
    'Overcoming Adversity',
    'Peace',
    'Philosophy',
    'Poverty',
    'Prayer',
    'Pregnancy',
    'Racism & Discrimination',
    'Rain',
    'Regret',
    'Religion',
    'Romantic',
    'Sad',
    'School',
    'Self Love',
    'Silence',
    'Sister',
    'Slavery & Freedom',
    'Social Commentaries',
    'Social Justice',
    'Son',
    'Sorrow & Grieving',
    'Space',
    'Sports',
    'Spring',
    'Spiritual',
    'Spirituality',
    'Stars',
    'Strength',
    'Success',
    'Suicide',
    'Summer',
    'Sun',
    'Sympathy',
    'Teacher',
    'Teen',
    'Thanksgiving',
    'Time',
    'Travel',
    'Trees',
    'Trust',
    "Valentine's Day",
    'Veterans',
    'Violence',
    'War',
    'Wedding',
    'Winter',
    'Work',
]

export function categoryToSlug(category: string): string {
    return category
        .toLowerCase()
        .replace(/'/g, '')
        .replace(/\s*&\s*/g, '-and-')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
}
// Reverse of categoryToSlug, for showing a human label ("Silence") when all we
// hold is the route slug ("silence"). Falls back to the slug so an unknown or
// retired category still reads sensibly rather than rendering blank.
export function slugToCategory(slug: string): string {
    return CATEGORIES.find(category => categoryToSlug(category) === slug) ?? slug
}

// Built once rather than per call: /[genre] runs this on every request, and
// CATEGORIES is a 136-entry list that never changes at runtime.
const CATEGORY_SLUGS = new Set(CATEGORIES.map(categoryToSlug))

/**
 * Is this route slug one of the curated categories?
 *
 * Deliberately NOT `slugToCategory(slug) !== slug`: that only works by accident,
 * because every CATEGORIES entry happens to be Title Case and so never equals
 * its own slug. Add one lowercase entry and that test silently reports it as
 * unknown.
 *
 * Note this answers "is it in the curated list", not "does it have poems" — the
 * database holds genres that CATEGORIES does not (they came from the scraped
 * famous poems, whose topic vocabulary was never reconciled with this list), so
 * callers deciding whether a page is real must check for poems too.
 */
export function isKnownCategorySlug(slug: string): boolean {
    return CATEGORY_SLUGS.has(slug)
}

// Labels for the Authors dropdown values, so a message can name the active
// filter using the same word the user picked.
export const ORIGIN_LABELS: Record<string, string> = {
    famous: 'Famous',
    user: 'Users',
    ai: 'AI'
}

export const ALL = 'All'
export const PROFILE_SUBTITLE_CREATE = 'Insert a poem:'
export const PROFILE_SUBTITLE_UPDATE = 'Modify a poem:'
export const PROFILE_SELECT_TITLE_AUTHOR = "Author's Id: "
export const PROFILE_SELECT_TITLE = 'Title'
export const PROFILE_SELECT_LIKES = 'Likes'
export const PROFILE_SELECT_CATEGORY = 'Select a category'
export const PROFILE_POEM_PLACEHOLDER = 'Insert your poem here'
export const PROFILE_SEND_POEM = 'Send'
export const PROFILE_RESET_POEM = 'Reset'
export const PROFILE_CANCEL_EDIT = 'Cancel'
export const PROFILE_POEMS = 'My poems'
export const PROFILE_FAVOURITE_POEMS = 'My favourite poems'
export const PROFILE_DRAFTS = 'Drafts'
export const PROFILE_FOLLOWING = 'Following'
export const PROFILE_FOLLOWERS = 'Followers'
// Follow / followers.
// The button says "Following" while hovered/focused it says "Unfollow": the
// resting label states the CURRENT state (which is what a reader needs), and
// the hover label states what a click would do (which is what a clicker needs).
// A button permanently labelled "Unfollow" reads as though you are not
// following yet, and one permanently labelled "Following" gives no clue it is
// clickable at all.
export const FOLLOW = 'Follow'
export const FOLLOWING_STATE = 'Following'
export const UNFOLLOW = 'Unfollow'
export const FOLLOWERS_LABEL = 'Followers'
export const FOLLOWING_LABEL = 'Following'
export const FOLLOW_LOGGED_OUT_TITLE = 'Log in to follow this poet'
export const FOLLOWING_EMPTY = 'Not following anyone yet. Follow a poet and they will show up here.'
export const FOLLOWERS_EMPTY = 'No followers yet.'
export const FOLLOW_LIST_LOAD_MORE = 'Show more'
// Drafts: private until published. The second button on the create form, and
// the per-poem toggle on the owner's own lists.
export const PROFILE_SAVE_DRAFT = 'Save as draft'
export const PUBLISH_POEM = 'Publish'
export const UNPUBLISH_POEM = 'Move to drafts'
export const DRAFT_BADGE = 'Draft'
export const LIKE = 'Like'
export const LIKES = 'Likes'
export const READ_MORE = 'Read more'
// AI transparency. The footer carries the full statement, but the footer is out
// of reach on the views that scroll infinitely, so AI-authored poems and
// comments carry a badge linking here.
export const AI_DISCLOSURE_HREF = '/terms#ai-community-activity'
export const AI_BADGE_LABEL = 'AI'
export const AI_BADGE_TITLE = 'AI-assisted community account — read what this means'

export const SEARCH_PLACEHOLDER = 'Search poems and authors'
// Below this many characters the query is not sent. A one-letter query matches
// most of the collection, so it costs a round trip to return noise. The gate is
// announced rather than silent (SEARCH_MIN_LENGTH_HINT) — a search box that
// ignores you with no explanation is the actual anti-pattern.
export const SEARCH_MIN_LENGTH = 2
export const SEARCH_MIN_LENGTH_HINT = `Type ${SEARCH_MIN_LENGTH} or more characters to search`
export const SEARCH_NO_RESULTS = 'No poems match your search.'
// An empty profile tab is a different situation from a search that found
// nothing: there is no query to relax, so the message says what would fill it.
export const MY_POEMS_EMPTY = "No poems yet. Publish one and it will show up here."
export const MY_FAVOURITE_POEMS_EMPTY = 'No poems yet. Poems you like will show up here.'
export const MY_DRAFTS_EMPTY = 'No drafts. Save a poem as a draft and it will wait for you here.'
export const ORDER_BY = 'Order poems by: '
export const ORDER_BY_TITLE = 'Title'
export const ORDER_BY_DATE = 'Date'
export const ORDER_BY_RANDOM = 'Random'
export const ORDER_BY_LIKES = 'Likes'
export const CATEGORIES_TITLE_LABEL = 'Category: '
export const RANKING_TITLE = 'Poets ranking'
export const RANKING_SUBTITLE = '3 points per poem, 1 per like'
export const RANKING_POETS_TITLE = 'Poets'
export const RANKING_POINTS_TITLE = 'Points'
export const POEM_POINTS = 3
export const LIKE_POINTS = 1

// Pagination
export const PAGINATION_LIMIT = 10

// Authors
export const AUTHORS_TITLE = 'Authors'
export const AUTHORS_BROWSE_ALL = 'Browse all authors →'

export const POEM_OF_THE_WEEK_TITLE = 'Poem of the week'

// --- Notifications -------------------------------------------------------
export const NOTIFICATIONS_TITLE = 'Notifications'
export const NOTIFICATIONS_EMPTY = 'Nothing yet. Likes, comments and new followers will show up here.'
export const NOTIFICATIONS_OPEN = 'Notifications'
export const NOTIFICATIONS_LOAD_MORE = 'Show more'
// "Notify me", not "Email me": this pass is in-app only and no email is sent,
// so an email label would promise something the code does not do. Revisit when
// the digest ships (TODO.md).
export const STATS_TITLE = 'Your stats'
export const STATS_POEMS_LABEL = 'Poems published'
export const STATS_LIKES_LABEL = 'Likes received'
export const STATS_RANK_LABEL = 'Rank'
// Shown instead of a position when the poet is outside the top 10. The ranking
// endpoint returns ten rows, so a place outside them is genuinely not known —
// "11th or lower" would be a guess and "—" alone reads as an error.
export const STATS_RANK_UNRANKED = 'Outside the top 10'
export const STATS_EMPTY = 'Publish your first poem and your stats will appear here.'

export const NOTIFICATION_PREFS_TITLE = 'Notify me about'
export const NOTIFICATION_PREFS_INTRO = 'Choose what you want to hear about. All are on by default.'
export const NOTIFICATION_PREF_LABELS = {
    like: 'Likes on my poems',
    comment: 'Comments on my poems',
    follow: 'New followers',
    newPoem: 'New poems from poets I follow'
}

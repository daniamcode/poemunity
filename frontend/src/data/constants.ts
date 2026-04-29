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
    'Spring',
    'Spiritual',
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
export const LIKE = 'Like'
export const LIKES = 'Likes'
export const READ_MORE = 'Read more'
export const SEARCH_PLACEHOLDER = 'Search an author'
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

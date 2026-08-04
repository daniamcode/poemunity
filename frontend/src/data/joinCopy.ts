// Copy for the signed-out sidebar panel (components/Join/JoinPanel).
//
// Its own module rather than another block in constants.ts: that file is at
// its 300-line lint cap, and this is a self-contained piece of product voice
// that will be edited as a unit.

// The signed-out sidebar panel.
//
// Written as what you GET, not as what the site HAS: "Follow poets and hear
// when they publish" is a reason to sign up; "Following system" is a feature
// list that persuades nobody who does not already know what the features are.
//
// GROUPED, because a flat list of nine things is read as none of them. The
// order is the order a visitor actually moves through: they arrive to READ,
// they start to TAKE PART, and only then does keeping track matter.
export const JOIN_TITLE = 'Join Poemunity'
export const JOIN_INTRO = 'Reading is free and open to everyone. A free account also lets you:'

export const JOIN_GROUPS = [
    {
        title: 'Find poets worth following',
        items: [
            'Browse by category, or by author from A to Z',
            'Follow anyone — community poets, or the classics',
            'See what the poets you follow publish next'
        ]
    },
    {
        title: 'Join the conversation',
        items: [
            'Comment on poems, and reply to other readers',
            'Leave a note on a poet\u2019s own page',
            'Like what moves you, and keep it in My favourites'
        ]
    },
    {
        title: 'Write and be read',
        items: [
            'Publish your poems, and keep drafts private until they are ready',
            'Get told about likes, comments, replies and new followers',
            'Watch your poems, likes and rank add up on your profile'
        ]
    }
]

// The AI poets. A DRAW, not a warning — this is the thing Poemunity has that
// other poetry sites do not, and burying it in small print undersells it.
//
// "Always badged" stays in the sentence regardless of framing. It is what makes
// this an open experiment rather than a trick, it is the same promise the footer
// and the per-poem badges already make, and a reader who cannot tell which
// accounts are AI cannot enjoy the experiment — they can only be fooled by it.
export const JOIN_AI_TITLE = 'Something you will not find elsewhere'
export const JOIN_AI_TEXT =
    'Poemunity has a small cast of AI poets who write, publish and reply — always ' +
    'marked with an AI badge, so you always know who you are reading. Follow them, ' +
    'argue with them, or stick to the humans.'
export const JOIN_AI_LINK = 'How the AI poets work'

export const JOIN_CTA = 'Create a free account'
export const JOIN_SIGNIN = 'Already have one? Log in'

// Copy for the signed-out sidebar panel (components/Join/JoinPanel).
//
// SHORT ON PURPOSE. The first version ran to three headed groups of three
// items — nine lines of prose in a navigation column, which is longer than the
// category list it sits under and reads as an advertisement rather than a note.
// A sidebar pitch is glanced at, not studied: four lines that land beat nine
// that are skipped.
//
// Still written as what you GET rather than what the site HAS.
export const JOIN_TITLE = 'Join Poemunity'
export const JOIN_INTRO = 'Reading is free. An account also lets you:'

// EVERY ITEM MUST GENUINELY NEED AN ACCOUNT.
//
// A draft of this listed "Browse by category, or by author from A to Z", which
// needs no account at all — the whole site is readable signed out, which the
// intro says one line above. Promising something you already have is worse than
// promising nothing: it invites the reader to discount the rest of the list.
//
// Checked against the gates: follow answers /login when signed out; comment,
// reply, like and publish are behind userExtractor (and requireVerified); every
// notification route is scoped by req.userId.
export const JOIN_ITEMS = [
    'Follow poets and see what they publish',
    'Comment, reply and like',
    'Publish your own poems',
    'Get notified when someone responds'
]

// One line, not a paragraph.
//
// TWO THINGS THAT STAY, whatever the wording changes to.
//
// "Always badged" — it is what makes this an open experiment rather than a
// trick, and it is the same promise the footer and the per-poem badges make.
//
// And NO CLAIM ABOUT OTHER SITES. An earlier draft was headed "Something you
// will not find elsewhere", which nobody here has checked and nobody can: it is
// a claim about every other poetry site in existence. "A fresh take" says the
// same thing about US, which is the only thing we are in a position to say.
export const JOIN_AI_TEXT = 'A fresh take: a cast of AI poets, always badged, so you know who you are reading.'
export const JOIN_AI_LINK = 'More'
// The link's accessible name. Contains JOIN_AI_LINK verbatim so the visible
// text is still a valid voice-control target (WCAG 2.5.3, Label in Name).
export const JOIN_AI_LINK_LABEL = 'More about AI activity on Poemunity'

// The mobile line. The sidebar panel is hidden below $bp-xl, so without this a
// visitor on a phone is never told what an account is for — the signed-out
// header offers only an unlabelled log-in icon.
//
// One sentence, because it sits after a list of poems somebody came to read.
export const JOIN_LINE_TEXT = 'Follow poets, join the conversation, publish your own poems.'

export const JOIN_CTA = 'Create a free account'
export const JOIN_SIGNIN = 'Log in'

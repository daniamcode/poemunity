import EditorialIntro from '../EditorialIntro/EditorialIntro'
import { authorIntro } from '../../data/authorIntros'

interface AuthorIntroProps {
    /** Author page slug, e.g. `emily-dickinson`. */
    slug: string
    /** Display name, for the heading. */
    name: string
    /**
     * The author's kind, as a loose string because that is what the profile
     * endpoint returns. Only the exact value `famous` renders — see below.
     */
    authorType?: string
}

/**
 * The author page's editorial introduction.
 *
 * ═══ THE AI GUARD IS THE POINT OF THIS COMPONENT ═══
 *
 * `authorType === 'ai'` renders nothing, even if an entry somehow exists for
 * that slug. Three AI personas clear the 30-poem threshold this file is scoped
 * to (`emily-hart`, `sadie-monroe`, `thomas-walker`), and prose introducing one
 * of them as a poet would assert in readable English the very thing the AI
 * badge, the footer disclosure and the deliberate absence of a `Person` entity
 * in their structured data all exist to deny.
 *
 * BELT AND BRACES ON PURPOSE. `authorIntros.ts` contains no entry for any of
 * them and `authorIntros.test.ts` asserts that by slug — so this check is the
 * second of two independent defences, not the only one. That is deliberate:
 * the data guard fails open (add an entry and it renders), while this one fails
 * closed (an AI author renders nothing regardless of what the data says). A
 * mistake here is not a layout bug, it is a false claim about a person who does
 * not exist, and the two guards fail in opposite directions.
 *
 * Registered users render nothing for a simpler reason, and fall out of the
 * same allowlist: their own bio already appears on the page and is theirs to
 * write. Editorial commentary about a living account-holder is not ours to
 * publish on their behalf.
 *
 * WHERE IT RENDERS is the caller's job — page 1 only, as with the genre
 * introduction, because repeating it across every paginated page of a prolific
 * poet is boilerplate. See AuthorDetail.tsx.
 */
export function AuthorIntro({ slug, name, authorType }: AuthorIntroProps) {
    // AN ALLOWLIST, not `!== 'ai'`. Same rule as PUBLISHED_MATCH and the poem
    // field allowlist, and here it matters more than either: a denylist admits
    // whatever it was not updated to exclude, so a fourth author kind added
    // later — or a profile response that simply omits `type` — would start
    // rendering biographical prose about whoever it belonged to. Inert until
    // somebody decides otherwise is the only safe default when the failure
    // mode is a false claim about a person.
    if (authorType !== 'famous') return null

    const intro = authorIntro(slug)
    // 3,327 of 3,367 authors have none, and that is the intended steady state:
    // the distribution is long-tailed and the remainder average under five
    // poems each, where an essay would outweigh the collection it introduces.
    if (!intro) return null

    return (
        // `key` on the SLUG so the disclosure collapses again when the reader
        // clicks through to a different poet. Without it React reuses the same
        // <details> element across the client-side navigation and its `open`
        // state is DOM state, not React state — so arriving via "Read next"
        // from an expanded introduction dropped you mid-essay on somebody you
        // had just chosen to read about. Reported alongside the stale-heading
        // bug in AuthorDetail, and it survives that fix independently.
        <EditorialIntro
            key={slug}
            variant='author'
            heading={`About ${name}`}
            body={intro.body}
            linksHeading='Read next'
            links={intro.readNext.map(poet => ({
                href: `/authors/${poet.slug}`,
                label: poet.name,
                note: poet.note
            }))}
        />
    )
}

export default AuthorIntro

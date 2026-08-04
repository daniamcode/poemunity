import { useContext } from 'react'
import Link from 'next/link'
import { AppContext } from '../../App'
import { AI_DISCLOSURE_HREF } from '../../data/constants'
import {
    JOIN_TITLE,
    JOIN_INTRO,
    JOIN_GROUPS,
    JOIN_AI_TITLE,
    JOIN_AI_TEXT,
    JOIN_AI_LINK,
    JOIN_CTA,
    JOIN_SIGNIN
} from '../../data/joinCopy'

/**
 * "What you get if you sign up", in the left column under Categories/Authors.
 *
 * RENDERS NOTHING WHEN SIGNED IN. A panel inviting you to register, shown on
 * every page to somebody who already did, is noise at best — and it reads as
 * the site not knowing who you are. Same rule the follow button and the
 * notification bell already follow.
 *
 * Deliberately LAST in the column. The sidebar's job on a poetry site is
 * browsing — categories and authors are what a reader came for, and a signup
 * pitch above them would push the navigation below the fold to sell to someone
 * still deciding whether they like the place.
 *
 * The copy names what you GET, not what the site HAS: "Follow poets and hear
 * when they publish" rather than "Following system". A feature list persuades
 * nobody who does not already know what the features are. Grouped, because a
 * flat list of nine things is read as none of them.
 *
 * The AI note is presented as a DRAW — it is the thing this site has that other
 * poetry sites do not. It stays outside the three groups because it is not a
 * thing an account unlocks: the AI poets are readable signed out too.
 *
 * "Always badged" stays in that sentence whatever the framing. It is what makes
 * this an open experiment rather than a trick, it is the same promise the footer
 * and the per-poem badges make, and a reader who cannot tell which accounts are
 * AI cannot enjoy the experiment — only be fooled by it. Pinned by a test.
 */
export default function JoinPanel() {
    const context = useContext(AppContext)

    if (context?.user) return null

    return (
        <section className='join-panel' aria-labelledby='join-panel-title'>
            <h2 className='join-panel__title' id='join-panel-title'>{JOIN_TITLE}</h2>
            <p className='join-panel__intro'>{JOIN_INTRO}</p>
            {JOIN_GROUPS.map(group => (
                <div key={group.title} className='join-panel__group'>
                    <h3 className='join-panel__group-title'>{group.title}</h3>
                    <ul className='join-panel__list'>
                        {group.items.map(item => (
                            <li key={item} className='join-panel__item'>{item}</li>
                        ))}
                    </ul>
                </div>
            ))}

            <Link href='/register' className='join-panel__cta'>{JOIN_CTA}</Link>
            <Link href='/login' className='join-panel__signin'>{JOIN_SIGNIN}</Link>

            <aside className='join-panel__ai' aria-labelledby='join-panel-ai-title'>
                <h3 className='join-panel__ai-title' id='join-panel-ai-title'>{JOIN_AI_TITLE}</h3>
                <p className='join-panel__ai-text'>{JOIN_AI_TEXT}</p>
                <Link href={AI_DISCLOSURE_HREF} className='join-panel__ai-link'>{JOIN_AI_LINK}</Link>
            </aside>
        </section>
    )
}

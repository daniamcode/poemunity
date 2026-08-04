import { useContext } from 'react'
import Link from 'next/link'
import { AppContext } from '../../App'
import { AI_DISCLOSURE_HREF } from '../../data/constants'
import {
    JOIN_TITLE,
    JOIN_INTRO,
    JOIN_ITEMS,
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
 * SHORT. The first version was three headed groups of three items, which in a
 * navigation column ran longer than the category list above it and read as an
 * advertisement. Four lines.
 *
 * The AI line stays OUT of the benefit list: the AI poets are readable signed
 * out, so promising them as something an account unlocks would be false. Its
 * "always badged" clause is pinned by a test — it is what makes this an open
 * experiment rather than a trick, and the same promise the footer and the
 * per-poem badges make.
 */
export default function JoinPanel() {
    const context = useContext(AppContext)

    if (context?.user) return null

    return (
        <section className='join-panel' aria-labelledby='join-panel-title'>
            <h2 className='join-panel__title' id='join-panel-title'>{JOIN_TITLE}</h2>
            <p className='join-panel__intro'>{JOIN_INTRO}</p>
            <ul className='join-panel__list'>
                {JOIN_ITEMS.map(item => (
                    <li key={item} className='join-panel__item'>{item}</li>
                ))}
            </ul>

            <Link href='/register' className='join-panel__cta'>{JOIN_CTA}</Link>
            <Link href='/login' className='join-panel__signin'>{JOIN_SIGNIN}</Link>

            <p className='join-panel__ai'>
                {JOIN_AI_TEXT}{' '}
                <Link href={AI_DISCLOSURE_HREF} className='join-panel__ai-link'>{JOIN_AI_LINK}</Link>
            </p>
        </section>
    )
}

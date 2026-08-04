import { useContext } from 'react'
import Link from 'next/link'
import { AppContext } from '../../App'
import { JOIN_LINE_TEXT, JOIN_CTA } from '../../data/joinCopy'

/**
 * The mobile counterpart to JoinPanel — one sentence and a link, after the
 * poem list.
 *
 * WHY A SECOND COMPONENT rather than the same one repositioned. `.dashboard` is
 * a flex COLUMN on mobile and a ROW at $bp-xl, and the whole sidebar is
 * `display: none` below that breakpoint — so one DOM node cannot be inside the
 * sidebar on desktop and after the list on mobile. The alternative was
 * rendering JoinPanel twice and hiding one, which duplicates its heading id and
 * its landmark for no benefit.
 *
 * And a narrow screen does not want the four-line panel anyway. It is reading a
 * list of poems; the right moment for a pitch is AFTER that list, in one line
 * it can ignore.
 *
 * Signed-out only, like the panel. Without it a visitor on a phone is never
 * told what an account is for at all — the signed-out header offers only an
 * unlabelled log-in icon.
 */
export default function JoinLine() {
    const context = useContext(AppContext)

    if (context?.user) return null

    return (
        <aside className='join-line'>
            <p className='join-line__text'>{JOIN_LINE_TEXT}</p>
            <Link href='/register' className='join-line__cta'>{JOIN_CTA}</Link>
        </aside>
    )
}

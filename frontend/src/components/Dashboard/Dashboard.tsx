import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import Accordion from '../SimpleAccordion'
import JoinPanel from '../Join/JoinPanel'
import JoinLine from '../Join/JoinLine'
import AuthorsAccordion from '../AuthorsAccordion'
import Ranking from '../Ranking/Ranking'
import PoemOfTheWeek from '../PoemOfTheWeek/PoemOfTheWeek'
import List from '../List/List'
import GenreIntro from '../GenreIntro/GenreIntro'
import { InitialPoemsData } from '../List/hooks/usePoemsList'
import { RootState } from '../../redux/store'
import { genreTitle } from '../../utils/seo'
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter'

interface DashboardProps {
    initialData?: InitialPoemsData
    /** 1-based page from `?page=`, resolved server-side. */
    currentPage?: number
    match?: {
        params?: {
            genre?: string
        }
        [key: string]: unknown
    }
    location?: unknown
    history?: unknown
}

function Dashboard({ initialData, currentPage, match }: DashboardProps) {
    const router = useRouter()
    const genre = match?.params?.genre ?? (router.query.genre as string | undefined)
    const queryFromUrl = typeof router.query.q === 'string' ? router.query.q : ''

    // Live total, not the SSR one: searching is client-side, so a heading built
    // from initialData would keep claiming the unfiltered count while the reader
    // looks at three results.
    const cachedTotal = useSelector((state: RootState) => state.poemsListQuery?.total)
    const total = cachedTotal ?? initialData?.total ?? 0
    // The homepage h1 used to be the single word "Poems", which says nothing
    // about what this site is — the <title> ("Your poem community") was doing
    // all the work on its own. It stays visually hidden (see below); a hidden
    // heading is still the page's top-level heading for search engines and for
    // anyone navigating by headings, so it may as well be the true one.
    const heading = genre
        ? genreTitle(capitalizeFirstLetter(genre.replace(/-/g, ' ')), total)
        : 'Poemunity — your poem community'

    return (
        <main className='dashboard' data-testid='dashboard-component'>
            <div className='dashboard__accordion'>
                <Accordion genre={genre} />
                <AuthorsAccordion />
                {/* Last, and signed-out only — see JoinPanel. */}
                <JoinPanel />
            </div>
            <div className='dashboard__list'>
                {/* These pages had NO h1 at all — the top-level heading was
                    missing for search engines and for anyone navigating by
                    headings. On the dashboard it is visually hidden: the page
                    is the site's front door and already carries the brand, so a
                    second visible title is noise. */}
                <h1 className={genre ? 'dashboard__heading' : 'sr-only'}>{heading}</h1>
                {/* The genre's editorial introduction — the one piece of text on
                    this site that exists nowhere else on the web, and the reason
                    a genre page can rank where a scraped poem page cannot (see
                    docs/SEO_AUDIT.md).

                    Three gates, and each one is load-bearing:

                    `genre` — the homepage has no genre and no introduction.

                    `currentPage === 1` — repeating the same 250 words across
                    125 paginated URLs is boilerplate, and it would make every
                    page of /love mostly identical to every other, which is the
                    near-duplicate shape self-canonical pagination exists to
                    avoid. Page 1 is the one competing for "love poems".

                    `!queryFromUrl` — a ?q= URL is noindex and shows a filtered
                    subset, so an essay about the whole genre would sit above
                    results it does not describe.

                    The URL query is the right signal for that last one rather
                    than the live typed input: this decides what the SERVER
                    renders, which is all a crawler ever sees. Typing in the
                    search box without navigating leaves the introduction in
                    place, which is correct for a reader who is still on the
                    genre page. */}
                {genre && currentPage === 1 && !queryFromUrl && (
                    <GenreIntro genre={genre} label={capitalizeFirstLetter(genre.replace(/-/g, ' '))} />
                )}
                <List genre={genre} initialData={initialData} currentPage={currentPage} />
                {/* Mobile only — the sidebar that carries JoinPanel is
                    display:none below $bp-xl, so this is the only place a
                    phone visitor is told what an account is for. */}
                <JoinLine />
            </div>
            {/* Both live in the right rail, which only exists at $bp-xl — a
                deliberate choice: this is a desktop-only extra, not something to
                push above the poem list on a phone.

                Poem of the week goes FIRST. Ten ranking rows are ~700px, so with
                the card underneath it landed below the fold inside the rail's own
                scroll — reachable only by putting the cursor over the rail, which
                nobody discovers. The card is the thing worth seeing; the ranking
                is the long secondary list, so it takes the overflow instead. */}
            <div className='dashboard__ranking'>
                <PoemOfTheWeek />
                <Ranking />
            </div>
        </main>
    )
}

export default Dashboard

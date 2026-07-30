import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import Accordion from '../SimpleAccordion'
import AuthorsAccordion from '../AuthorsAccordion'
import Ranking from '../Ranking/Ranking'
import List from '../List/List'
import { InitialPoemsData } from '../List/hooks/usePoemsList'
import { RootState } from '../../redux/store'
import { genreTitle } from '../../utils/seo'
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter'

interface DashboardProps {
    initialData?: InitialPoemsData
    match?: {
        params?: {
            genre?: string
        }
        [key: string]: unknown
    }
    location?: unknown
    history?: unknown
}

function Dashboard({ initialData, match }: DashboardProps) {
    const router = useRouter()
    const genre = match?.params?.genre ?? (router.query.genre as string | undefined)

    // Live total, not the SSR one: searching is client-side, so a heading built
    // from initialData would keep claiming the unfiltered count while the reader
    // looks at three results.
    const cachedTotal = useSelector((state: RootState) => state.poemsListQuery?.total)
    const total = cachedTotal ?? initialData?.total ?? 0
    const heading = genre
        ? genreTitle(capitalizeFirstLetter(genre.replace(/-/g, ' ')), total)
        : 'Poems'

    return (
        <main className='dashboard' data-testid='dashboard-component'>
            <div className='dashboard__accordion'>
                <Accordion genre={genre} />
                <AuthorsAccordion />
            </div>
            <div className='dashboard__list'>
                {/* These pages had NO h1 at all — the top-level heading was
                    missing for search engines and for anyone navigating by
                    headings. On the dashboard it is visually hidden: the page
                    is the site's front door and already carries the brand, so a
                    second visible title is noise. */}
                <h1 className={genre ? 'dashboard__heading' : 'sr-only'}>{heading}</h1>
                <List genre={genre} initialData={initialData} />
            </div>
            <div className='dashboard__ranking'>
                <Ranking />
            </div>
        </main>
    )
}

export default Dashboard

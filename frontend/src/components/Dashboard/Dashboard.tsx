import { useRouter } from 'next/router'
import Accordion from '../SimpleAccordion'
import AuthorsAccordion from '../AuthorsAccordion'
import Ranking from '../Ranking/Ranking'
import List from '../List/List'
import { InitialPoemsData } from '../List/hooks/usePoemsList'

interface DashboardProps {
    initialData?: InitialPoemsData
}

function Dashboard({ initialData }: DashboardProps) {
    const router = useRouter()
    const genre = router.query.genre as string | undefined

    return (
        <main className='dashboard' data-testid='dashboard-component'>
            <div className='dashboard__accordion'>
                <Accordion genre={genre} />
                <AuthorsAccordion />
            </div>
            <div className='dashboard__list'>
                <List genre={genre} initialData={initialData} />
            </div>
            <div className='dashboard__ranking'>
                <Ranking />
            </div>
        </main>
    )
}

export default Dashboard

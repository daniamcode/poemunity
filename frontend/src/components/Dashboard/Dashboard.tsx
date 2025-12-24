import '../List/List.scss'
import '../Detail/Detail.scss'
import '../../App.scss'
import '../Dashboard/Dashboard.scss'
import Accordion from '../SimpleAccordion'
import Ranking from '../Ranking/Ranking'
import List from '../List/List'

function Dashboard() {
    return (
        <main className='dashboard'>
            <div className='dashboard__accordion'>
                <Accordion />
            </div>
            <div className='dashboard__list'>
                <List />
            </div>
            <div className='dashboard__ranking'>
                <Ranking />
            </div>
        </main>
    )
}
export default Dashboard

import { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import './Ranking.scss'
import { getRanking } from '../utils/getRanking'
import CircularProgress from './CircularIndeterminate'
import {
    RANKING_TITLE,
    RANKING_SUBTITLE,
    RANKING_POETS_TITLE,
    RANKING_POINTS_TITLE,
    POEM_POINTS,
    LIKE_POINTS
} from '../data/constants'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../redux/store'
import { getRankingAction } from '../redux/actions/poemsActions'
import { Poem } from '../typescript/interfaces'

const useStyles = makeStyles({
    table: {
        minWidth: 50
    }
})

export default function Ranking() {
    interface RankingStates {
        poems: Poem[]
        rank: object
    }
    const classes = useStyles()

    const [poems, setPoems] = useState<RankingStates['poems']>([])

    const [rank, setRank] = useState<RankingStates['rank']>({})

    // Redux
    const dispatch = useAppDispatch()

    const { rankingQuery } = useSelector((state: RootState) => state)

    useEffect(() => {
        dispatch(
            getRankingAction({
                params: {
                    origin: 'user'
                }
            })
        )
    }, [dispatch])

    useEffect(() => {
        if (rankingQuery?.item) {
            setPoems(rankingQuery?.item)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(rankingQuery?.item)])

    useEffect(() => {
        if (poems) {
            setRank(getRanking(poems, POEM_POINTS, LIKE_POINTS))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify([poems, POEM_POINTS, LIKE_POINTS])])

    if (rankingQuery.isFetching) {
        return <CircularProgress data-test='ranking__loading' />
    }

    return (
        <main className='ranking'>
            <h3 className='ranking__title'>{RANKING_TITLE}</h3>
            <h5 className='ranking__subtitle'>{RANKING_SUBTITLE}</h5>
            <TableContainer className='ranking__body' component={Paper}>
                <Table className={classes.table} aria-label='simple table'>
                    <TableHead>
                        <TableRow>
                            <TableCell align='center'>{RANKING_POETS_TITLE}</TableCell>
                            <TableCell align='center'>{RANKING_POINTS_TITLE}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.keys(rank).map((element, index) => (
                            <TableRow key={index}>
                                <TableCell
                                    className='ranking__picture-container'
                                    align='center'
                                    component='th'
                                    scope='row'
                                >
                                    <div className='ranking__picture-wrap'>
                                        <img className='ranking__picture' src={rank[element]?.picture} />
                                        <p className='ranking__picture-description'>{rank[element]?.author}</p>
                                    </div>
                                </TableCell>
                                <TableCell className='ranking__number' align='center'>
                                    {rank[element]?.points}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </main>
    )
}

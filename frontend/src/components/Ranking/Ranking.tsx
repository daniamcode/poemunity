import { useState, useEffect } from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import './Ranking.scss'
import { getRanking } from '../../utils/getRanking'
import CircularProgress from '../CircularIndeterminate'
import {
    RANKING_TITLE,
    RANKING_SUBTITLE,
    RANKING_POETS_TITLE,
    RANKING_POINTS_TITLE,
    POEM_POINTS,
    LIKE_POINTS
} from '../../data/constants'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../../redux/store'
import { getRankingAction } from '../../redux/actions/poemsActions'
import { Poem } from '../../typescript/interfaces'

interface RankItem {
    author: string
    picture: string
    points: number
}

export default function Ranking() {
    interface RankingStates {
        poems: Poem[]
        rank: RankItem[]
    }

    const [poems, setPoems] = useState<RankingStates['poems']>([])

    const [rank, setRank] = useState<RankingStates['rank']>([])

    // Redux
    const dispatch = useAppDispatch()

    const { rankingQuery } = useSelector((state: RootState) => state)

    useEffect(() => {
        // Fetch all user poems for ranking calculation (no pagination params)
        // TODO: In the future, move ranking calculation to backend to avoid fetching all poems
        dispatch(
            getRankingAction({
                params: {
                    origin: 'user'
                    // No page/limit - fetches all poems for accurate ranking
                }
            })
        )
    }, [dispatch])

    useEffect(() => {
        if (rankingQuery?.item) {
            setPoems(rankingQuery?.item)
        }
    }, [JSON.stringify(rankingQuery?.item)])

    useEffect(() => {
        if (poems) {
            setRank(getRanking(poems, POEM_POINTS, LIKE_POINTS))
        }
    }, [JSON.stringify([poems, POEM_POINTS, LIKE_POINTS])])

    if (rankingQuery.isFetching) {
        return <CircularProgress data-test='ranking__loading' />
    }

    return (
        <main className='ranking'>
            <h3 className='ranking__title'>{RANKING_TITLE}</h3>
            <h5 className='ranking__subtitle'>{RANKING_SUBTITLE}</h5>
            <TableContainer className='ranking__body' component={Paper}>
                <Table sx={{ minWidth: 50 }} aria-label='simple table'>
                    <TableHead>
                        <TableRow>
                            <TableCell align='center'>{RANKING_POETS_TITLE}</TableCell>
                            <TableCell align='center'>{RANKING_POINTS_TITLE}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rank.slice(0, 10).map((item, index) => (
                            <TableRow key={index}>
                                <TableCell
                                    className='ranking__picture-container'
                                    align='center'
                                    component='th'
                                    scope='row'
                                >
                                    <div className='ranking__picture-wrap'>
                                        <img className='ranking__picture' src={item?.picture} />
                                        <p className='ranking__picture-description'>{item?.author}</p>
                                    </div>
                                </TableCell>
                                <TableCell className='ranking__number' align='center'>
                                    {item?.points}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </main>
    )
}

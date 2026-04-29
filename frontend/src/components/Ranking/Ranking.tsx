import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Ranking.scss'
import { getRanking } from '../../utils/getRanking'
import CircularProgress from '../CircularIndeterminate'
import {
    RANKING_TITLE,
    RANKING_SUBTITLE,
    POEM_POINTS,
    LIKE_POINTS
} from '../../data/constants'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../../redux/store'
import { getRankingAction } from '../../redux/actions/poemsActions'
import { Poem } from '../../typescript/interfaces'
import { AuthorAvatar } from '../ListItem/components/AuthorAvatar'
import { slugify } from '../../utils/urlUtils'

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

    const dispatch = useAppDispatch()
    const rankingQuery = useSelector((state: RootState) => state.rankingQuery)

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
            <div className='ranking__list'>
                {rank.slice(0, 10).map((item, index) => {
                    const authorSlug = slugify(item.author)
                    const rankPos = index + 1
                    return (
                        <Link 
                            key={index} 
                            to={`/authors/${authorSlug}`} 
                            className='ranking__item'
                        >
                            <span className={`ranking__rank-number ranking__rank-number--${rankPos}`}>
                                {rankPos}
                            </span>
                            <div className='ranking__author-info'>
                                <AuthorAvatar name={item.author} picture={item.picture} />
                                <span className='ranking__author-name'>{item.author}</span>
                            </div>
                            <span className='ranking__points'>
                                {item.points} pts
                            </span>
                        </Link>
                    )
                })}
            </div>
        </main>
    )
}

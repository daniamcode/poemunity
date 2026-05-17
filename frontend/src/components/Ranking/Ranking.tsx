import { useState, useEffect, memo } from 'react'
import Link from 'next/link'
import { getRanking, RankItem } from '../../utils/getRanking'
import CircularProgress from '../CircularIndeterminate'
import {
    RANKING_TITLE,
    RANKING_SUBTITLE,
    POEM_POINTS,
    LIKE_POINTS
} from '../../data/constants'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import { Poem } from '../../typescript/interfaces'
import { AuthorAvatar } from '../ListItem/components/AuthorAvatar'
import { slugify } from '../../utils/urlUtils'

function Ranking() {
    interface RankingStates {
        poems: Poem[]
        rank: RankItem[]
    }

    const [poems, setPoems] = useState<RankingStates['poems']>([])
    const [rank, setRank] = useState<RankingStates['rank']>([])

    const rankingQuery = useSelector((state: RootState) => state.rankingQuery)

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
                {rank.slice(0, 10).map((item: RankItem, index) => {
                    const authorSlug = item.authorSlug || slugify(item.author)
                    const rankPos = index + 1
                    return (
                        <Link 
                            key={index} 
                            href={`/authors/${authorSlug}`} 
                            className='ranking__item'
                        >
                            <span className={`ranking__rank-number ranking__rank-number--${rankPos}`}>
                                {rankPos}
                            </span>
                            <div className='ranking__avatar' title={item.author}>
                                <AuthorAvatar name={item.author} picture={item.picture} />
                            </div>
                            <span className='ranking__author-name' title={item.author}>{item.author}</span>
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

export default memo(Ranking)

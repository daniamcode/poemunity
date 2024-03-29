import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import './Ranking.scss'
import usePoems from '../react-query/usePoems'
import { getRanking } from '../utils/getRanking.js'
import CircularProgress from './CircularIndeterminate'
import {
  RANKING_TITLE,
  RANKING_SUBTITLE,
  RANKING_POETS_TITLE,
  RANKING_POINTS_TITLE
} from '../data/constants'

const useStyles = makeStyles({
  table: {
    minWidth: 50
  }
})

export default function Ranking () {
  const classes = useStyles()
  const poemPoints = 3
  const likePoints = 1

  const [poems, setPoems] = useState([])
  const poemsQuery = usePoems('user')

  const [rank, setRank] = useState(
    getRanking(null)
  )

  useEffect(()=> {
    if(poemsQuery.data) {
      setPoems(poemsQuery.data)
    }
  }, [JSON.stringify(poemsQuery.data)])

  useEffect(()=> {
    if(poems) {
      setRank(getRanking(poems, poemPoints, likePoints))
    }
  }, [JSON.stringify([poems, poemPoints, likePoints])])

  if (poemsQuery.isLoading) {
    return <CircularProgress data-test='ranking__loading'/>
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
                    <img
                      className='ranking__picture'
                      src={rank[element].picture}
                    />
                    <p className='ranking__picture-description'>
                      {rank[element].author}
                    </p>
                  </div>
                </TableCell>
                <TableCell className='ranking__number' align='center'>
                  {rank[element].points}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </main>
  )
}

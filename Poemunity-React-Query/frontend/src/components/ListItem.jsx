import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import './List.scss'
import './Detail.scss'
import '../App.scss'
import HighlightOffSharpIcon from '@material-ui/icons/HighlightOffSharp'
import EditIcon from '@material-ui/icons/Edit'
import SubjectSharpIcon from '@material-ui/icons/SubjectSharp'
import {
  LIKE,
  LIKES,
  READ_MORE,
} from '../data/constants'
import normalizeString from '../utils/normalizeString'
import PropTypes from 'prop-types'


function ListItem ({
   poem,
   filter,
   context
}) {
  return (    
    <main key={poem.id} className='poem__detail'>
      {normalizeString(poem.author).includes(filter) && (
        <section className='poem__block' id='poem__block'>
          <section>
            <Link to={`/detail/${poem.id}`} className='poem__title'>
              {poem.title}
            </Link>
            <div className='poem__author-container'>
              <img className='poem__picture' src={poem.picture} />
              <p className='poem__author'>{poem.author}</p>
            </div>
            <div className='poem__date'>{poem.date}</div>
          </section>
          <section>
            <div className='poem__content poems__content'>
              {poem.poem}
            </div>
            <div className='poems__read-more'>
              <Link
                to={`/detail/${poem.id}`}
                className='poems__read-more'
              >
                {READ_MORE}
              </Link>
            </div>
          </section>
          <section className='poem__footer'>
            {poem.likes?.length === 1 && (
              <div className='poem__likes'>
                {poem.likes?.length} {LIKE}
              </div>
            )}
            {poem.likes?.length !== 1 && (
              <div className='poem__likes'>
                {poem.likes?.length} {LIKES}
              </div>
            )}
            <div className='separator' />
            {context.user &&
              poem.userId !== context.userId &&
              poem.likes.some((id) => id === context.userId) && (
                <Link
                  className='poem__likes-icon'
                  onClick={(event) => onLike(event, poem.id)}
                />
            )}
            {context.user &&
              poem.userId !== context.userId &&
              !poem.likes.some((id) => id === context.userId) && (
                <Link
                  className='poem__unlikes-icon'
                  onClick={(event) => onLike(event, poem.id)}
                />
            )}
            {context.user &&
              (poem.userId === context.userId ||
                context.userId === context.adminId) && (
                  <EditIcon
                    className='poem__edit-icon'
                    onClick={(event) => editPoem(poem.id)}
                  />
            )}
            {context.user &&
              (poem.userId === context.userId ||
                context.userId === context.adminId) && (
                  <HighlightOffSharpIcon
                    className='poem__delete-icon'
                    style={{ fill: 'red' }}
                    onClick={(event) => deletePoemMutation.mutate(poem.id)}
                  />
            )}
            <Link
              to={`/detail/${poem.id}`}
              className='poem__comments-icon'
            >
              <SubjectSharpIcon style={{ fill: '#000' }} />
            </Link>
          </section>
        </section>
      )}
    </main>
  )
}

ListItem.propTypes = {
  poem: PropTypes.object.isRequired,
  filter: PropTypes.string.isRequired,
  context: PropTypes.object.isRequired,
}

export default ListItem

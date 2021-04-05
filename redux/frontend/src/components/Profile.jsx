import React, { useState } from 'react'
import PropTypes from 'prop-types'
import SwipeableViews from 'react-swipeable-views'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Typography from '@material-ui/core/Typography'
import Box from '@material-ui/core/Box'
import './Profile.scss'
import '../App.scss'
import { savePoem } from '../actions/poemActions'
import MyPoems from './MyPoems'
import MyFavouritePoems from './MyFavouritePoems'
import { useAuth0 } from '@auth0/auth0-react'
import CircularProgress from './CircularIndeterminate'
import {
  PROFILE_TITLE,
  PROFILE_SUBTITLE,
  PROFILE_POEMS,
  PROFILE_FAVOURITE_POEMS,
  CATEGORIES,
  PROFILE_SELECT_CATEGORY_TITLE,
  PROFILE_SELECT_CATEGORY,
  PROFILE_SELECT_TITLE_TITLE,
  PROFILE_SELECT_TITLE,
  PROFILE_POEM_PLACEHOLDER,
  PROFILE_SEND_POEM
} from '../data/constants'

function TabPanel (props) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
}

function a11yProps (index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  }
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: 500
  }
}))

export default function Profile (props) {
  const theme = useTheme()
  const [value, setValue] = React.useState(0)

  const [poemContent, setPoemContent] = useState('')
  const [poemTitle, setPoemTitle] = useState('')
  const [poemCategory, setPoemCategory] = useState('')

  const { user, isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return <CircularProgress />
  }

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleChangeIndex = (index) => {
    setValue(index)
  }

  function onFieldChange (value, setValue) {
    setValue(value)
  }

  function handleSubmit (event) {
    event.preventDefault()
    event.target.reset()

    const currentDatetime = new Date()
    const formattedDate =
      currentDatetime.getFullYear() +
      '-' +
      (currentDatetime.getMonth() + 1) +
      '-' +
      currentDatetime.getDate() +
      ' ' +
      currentDatetime.getHours() +
      ':' +
      currentDatetime.getMinutes() +
      ':' +
      currentDatetime.getSeconds()

    savePoem({
      userId: user.sub,
      author: user.name,
      picture: user.picture,
      poem: poemContent,
      title: poemTitle,
      genre: poemCategory,
      likes: [],
      date: formattedDate
    })
    setPoemContent('')
    setPoemTitle('')
    setPoemCategory('')
  }

  return (
    isAuthenticated && (
      <main className='profile__main'>
        <section className='profile__title'>
          <div>
            {user.name}
            {PROFILE_TITLE}
          </div>
        </section>
        <section className='profile__intro'>
          <img
            className='profile__image'
            src={user.picture}
            alt={user.name}
          />
          <div className='profile__personal-data'>
            <div className='profile__insert-poem'>
              <p className='profile__insert-poem-title'>{PROFILE_SUBTITLE}</p>
              <br />
              <form
                className='profile__insert-poem-form'
                onSubmit={handleSubmit}
              >
                <div className='profile__insert-poem-inputs'>
                  <label className='profile__insert-poem-input'>
                    {PROFILE_SELECT_TITLE_TITLE}
                    <input
                      className='profile__insert-poem-input'
                      placeholder={PROFILE_SELECT_TITLE}
                      name='title'
                      required
                      value={poemTitle}
                      onChange={(event) =>
                        onFieldChange(event.target.value, setPoemTitle)}
                    />
                  </label>
                  <label className='profile__insert-poem-input'>
                    {PROFILE_SELECT_CATEGORY_TITLE}
                    <select
                      className='profile__insert-poem-input'
                      id='category'
                      name='category'
                      required
                      onChange={(event) => {
                        onFieldChange(event.target.value, setPoemCategory)
                      }}
                    >
                      <option value=''>{PROFILE_SELECT_CATEGORY}</option>
                      {CATEGORIES?.map((category) => (
                        <option value={category.toLowerCase()}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div>
                  <textarea
                    className='profile__text-area'
                    id='poem'
                    name='poem'
                    required
                    placeholder={PROFILE_POEM_PLACEHOLDER}
                    value={poemContent}
                    onChange={(event) =>
                      onFieldChange(event.target.value, setPoemContent)}
                  />
                </div>

                <button className='profile__send-poem' type='submit'>
                  {PROFILE_SEND_POEM}
                </button>
              </form>
            </div>
          </div>
        </section>
        <section className='profile__outro'>
          <div className='profile__tabs'>
            <AppBar position='static' color='default'>
              <Tabs
                value={value}
                onChange={handleChange}
                indicatorColor='primary'
                textColor='primary'
                variant='fullWidth'
                aria-label='full width tabs example'
              >
                <Tab label={PROFILE_POEMS} {...a11yProps(0)} />
                <Tab label={PROFILE_FAVOURITE_POEMS} {...a11yProps(1)} />
              </Tabs>
            </AppBar>
            <SwipeableViews
              axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
              index={value}
              onChangeIndex={handleChangeIndex}
            >
              <TabPanel
                className='profile__myPoems'
                value={value}
                index={0}
                dir={theme.direction}
              >
                <MyPoems />
              </TabPanel>
              <TabPanel
                className='profile__myPoems'
                value={value}
                index={1}
                dir={theme.direction}
              >
                <MyFavouritePoems />
              </TabPanel>
            </SwipeableViews>
          </div>
        </section>
      </main>
    )
  )
}

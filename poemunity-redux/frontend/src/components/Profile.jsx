import React, { useState, useEffect, useContext } from 'react'
import { AppContext } from '../App';
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
import MyPoems from './MyPoems'
import MyFavouritePoems from './MyFavouritePoems'
import CircularProgress from './CircularIndeterminate'
import {
  PROFILE_TITLE,
  PROFILE_SUBTITLE_CREATE,
  PROFILE_SUBTITLE_UPDATE,
  PROFILE_POEMS,
  PROFILE_FAVOURITE_POEMS,
  CATEGORIES,
  PROFILE_SELECT_CATEGORY_TITLE,
  PROFILE_SELECT_CATEGORY,
  PROFILE_SELECT_TITLE_AUTHOR,
  PROFILE_SELECT_TITLE_TITLE,
  PROFILE_SELECT_TITLE,
  PROFILE_SELECT_LIKES,
  PROFILE_POEM_PLACEHOLDER,
  PROFILE_SEND_POEM,
  PROFILE_RESET_POEM
} from '../data/constants'
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../redux/store';
import { getPoemAction, savePoemAction } from '../redux/actions/poemActions';
import { createPoemAction, updateAllPoemsCacheAfterCreatePoemAction, updateAllPoemsCacheAfterSavePoemAction } from '../redux/actions/poemsActions';
import { manageError, manageSuccess } from '../utils/notifications';

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
  const [poemFakeId, setPoemFakeId] = useState('')
  const [poemTitle, setPoemTitle] = useState('')
  const [poemOrigin, setPoemOrigin] = useState('')
  const [poemCategory, setPoemCategory] = useState('')
  const [poemLikes, setPoemLikes] = useState([])

  // const [errorMessage, setErrorMessage] = useState(null)

  const context = useContext(AppContext);

  function onSave ({event, poem, poemId}) {
    event.preventDefault()
    dispatch(savePoemAction({
      params: { poemId }, 
      context,
      data: poem,
      callbacks: {
        success: () => {
          // todo: when I update this cache, it has effects on many queries. 
          // Maybe I need some optimisation, in the frontend or in the backend
          dispatch(updateAllPoemsCacheAfterSavePoemAction({poem, poemId}))
          manageSuccess('Poem saved')
        },
        error: () => {
          manageError('Sorry. There was an error saving the poem')
        }
      }
    }))
  }

  // Redux
  const dispatch = useAppDispatch();

  const { poemQuery } = useSelector(state => state);

  useEffect(() => {
    const queryOptions = {
        reset: true,
        fetch: false,
    };
    dispatch(getPoemAction({
        options: queryOptions,
    }));
  }, []);

  function handleLoadPoem() {
      if (context?.elementToEdit) {
          const queryOptions = {
              reset: true,
              fetch: true,
          };
          dispatch(getPoemAction({
              params: {poemId: context?.elementToEdit},
              options: queryOptions,
          }));
      }
  }

  useEffect(() => {
      handleLoadPoem();
  }, [JSON.stringify(context?.elementToEdit)]);

  useEffect(()=> {
    if(poemQuery?.item) {
      setPoemTitle(context?.elementToEdit ? poemQuery?.item?.title : '')
      setPoemContent(context?.elementToEdit ? poemQuery?.item?.poem : '')
      setPoemFakeId(context?.elementToEdit ? poemQuery?.item?.userId : '')
      setPoemLikes(context?.elementToEdit ? poemQuery?.item?.likes?.toString() : [])
      setPoemCategory(context?.elementToEdit ? poemQuery?.item?.genre : '')
      setPoemOrigin(context?.elementToEdit ? poemQuery?.item?.origin : '')
    }
  }, [JSON.stringify([context?.elementToEdit, poemQuery?.item])])

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleChangeIndex = (index) => {
    setValue(index)
  }

  function onFieldChange (value, setValue) {
    setValue(value)
  }

  const handleSend = (event) => {
    event.preventDefault()
    // event.target.reset()

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

      if(!context?.elementToEdit) {
        if(context?.userId === context.adminId) {
          const poem = {
            userId: poemFakeId,
            poem: poemContent,
            title: poemTitle,
            genre: poemCategory,
            likes: poemLikes.length !== 0 ? [...poemLikes?.split(',')] : [],
            date: formattedDate,
            origin: poemOrigin
          }
          dispatch(createPoemAction({
            poem,
            context,
            callbacks: {
              success: (response) => {
                dispatch(updateAllPoemsCacheAfterCreatePoemAction({response}));
              },
              error: () => {
                console.log('something went wrong creating a poem!')
              }
            }
          }))
        } else {
          const poem = {
            poem: poemContent,
            title: poemTitle,
            genre: poemCategory,
            likes: [],
            date: formattedDate,
            origin: 'user'
          }
          dispatch(createPoemAction({
            poem,
            context,
            callbacks: {
              success: (response) => {
                dispatch(updateAllPoemsCacheAfterCreatePoemAction({response}));
              },
              error: (error) => {
                console.log('something went wrong creating a poem!')
              }
            }
          }))
        }
        setPoemContent('')
        setPoemTitle('')
        setPoemOrigin('')
        setPoemCategory('')
      } else {
        if(context?.userId === context.adminId) {
          onSave({
            event, 
            poem: 
              {
                userId: poemFakeId,
                poem: poemContent,
                title: poemTitle,
                genre: poemCategory,
                likes: poemLikes.length !== 0 ? [...poemLikes?.split(',')] : [],
                date: formattedDate,
                origin: poemOrigin,
              }, 
            poemId: poemQuery.item.id});  
        } else {
          onSave({
            event,
            poem: 
            {
              poem: poemContent,
              title: poemTitle,
              genre: poemCategory,
              likes: [],
              date: formattedDate,
            },
            poemId: poemQuery.item.id});
        }
        context.setState({...context, elementToEdit: ''})
      }
  }

  const handleReset = (event) => {
    context.setState({...context, elementToEdit: ''})
    setPoemContent('')
    setPoemTitle('')
    setPoemOrigin('')
    setPoemCategory('')
  }

  return (
    
      <main className='profile__main'>
        {
          context?.user ?
          (
          <div>
          <section className='profile__title'>
          <div>
            {context?.username}
            {PROFILE_TITLE}
          </div>
        </section>
        <section className='profile__intro'>
          <img
            className='profile__image'
            src='https://poemunity.s3.us-east-2.amazonaws.com/user/default-profile-icon.jpg'
            // src={context.picture}
            alt={context?.username}
          />
          <div className='profile__personal-data'>
            <div className='profile__insert-poem'>
              <p className='profile__insert-poem-title'>
                {context?.elementToEdit 
                  ? PROFILE_SUBTITLE_UPDATE 
                  : PROFILE_SUBTITLE_CREATE}
              </p>
              <br />
              <form
                className='profile__insert-poem-form'
              >
                <div className='profile__insert-poem-inputs'>
                  {
                  context?.userId === context.adminId && (
                  <>
                    <label className='profile__insert-poem-input'>
                      Origin
                      <select
                        className="profile__insert-poem-input"
                        name="origin"
                        required
                        value={poemOrigin}
                        onChange={(event) => onFieldChange(event.target.value, setPoemOrigin)}
                      >
                        <option value=''>{PROFILE_SELECT_CATEGORY}</option>
                        <option value="famous">Famous</option>
                        <option value="user">User</option>
                      </select>
                    </label>
                    <label className='profile__insert-poem-input'>
                      {PROFILE_SELECT_TITLE_AUTHOR}
                      <input
                        className='profile__insert-poem-input'
                        name='author'
                        required
                        value={poemFakeId}
                        onChange={(event) =>
                          onFieldChange(event.target.value, setPoemFakeId)}
                      />
                    </label>
                    <label className='profile__insert-poem-input'>
                    {PROFILE_SELECT_LIKES}
                    <input
                      className='profile__insert-poem-input'
                      name='likes'
                      value={poemLikes}
                      onChange={(event) =>
                        onFieldChange(event.target.value, setPoemLikes)}
                    />
                  </label>
                </>
                  )
                  }
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
                      value={poemCategory}
                      onChange={(event) => {
                        onFieldChange(event.target.value, setPoemCategory)
                      }}
                    >
                      <option value=''>{PROFILE_SELECT_CATEGORY}</option>
                      {CATEGORIES?.map((category) => (
                        <option value={category.toLowerCase()} selected={poemQuery?.item?.genre === category.toLowerCase()}>
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

                <button className='profile__send-poem' type='submit' onClick={handleReset}>
                  {PROFILE_RESET_POEM}
                </button>
                <button 
                  className='profile__send-poem' 
                  type='submit' 
                  onClick={handleSend}
                  disabled={!poemTitle || !poemCategory || !poemContent || ((context?.userId === context.adminId) && !poemOrigin)}
                >
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
        </div>

        ) : null
        }
        
        
      </main>
    
  )
}

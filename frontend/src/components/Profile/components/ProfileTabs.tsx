import React from 'react'
import { useTheme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import SwipeableViews from 'react-swipeable-views'
import { PROFILE_POEMS, PROFILE_FAVOURITE_POEMS } from '../../../data/constants'
import MyPoems from '../../MyPoems/MyPoems'
import MyFavouritePoems from '../../MyFavouritePoems/MyFavouritePoems'
import TabPanel, { a11yProps } from './TabPanel'

interface ProfileTabsProps {
    value: number
    handleChange: (event: React.ChangeEvent<unknown>, newValue: number) => void
    handleChangeIndex: (index: number) => void
}

function ProfileTabs({ value, handleChange, handleChangeIndex }: ProfileTabsProps) {
    const theme = useTheme()

    return (
        <section className='profile__outro'>
            <div className='profile__tabs-header'>
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
            </div>
            <div className='profile__tabs-content'>
                <SwipeableViews
                    axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                    index={value}
                    onChangeIndex={handleChangeIndex}
                >
                    <TabPanel className='profile__myPoems' value={value} index={0} dir={theme.direction}>
                        <MyPoems />
                    </TabPanel>
                    <TabPanel className='profile__myPoems' value={value} index={1} dir={theme.direction}>
                        <MyFavouritePoems />
                    </TabPanel>
                </SwipeableViews>
            </div>
        </section>
    )
}

export default ProfileTabs

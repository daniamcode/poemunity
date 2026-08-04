import React from 'react'
import { useTheme } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import {
    PROFILE_POEMS,
    PROFILE_FAVOURITE_POEMS,
    PROFILE_DRAFTS,
    PROFILE_FOLLOWING,
    PROFILE_FOLLOWERS,
    PROFILE_COMMENTS
} from '../../../data/constants'
import MyPoems from '../../MyPoems/MyPoems'
import MyFavouritePoems from '../../MyFavouritePoems/MyFavouritePoems'
import MyDrafts from '../../MyDrafts/MyDrafts'
import { MyFollowing, MyFollowers } from '../../Follow/MyFollows'
import MyComments from './MyComments'
import TabPanel, { a11yProps } from './TabPanel'

interface ProfileTabsProps {
    value: number
    handleChange: (event: React.ChangeEvent<unknown>, newValue: number) => void
    handleChangeIndex: (index: number) => void
}

function ProfileTabs({ value, handleChange }: ProfileTabsProps) {
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
                        {/* Drafts are private, and this whole section only ever
                            renders for the signed-in owner of the profile (see
                            Profile.jsx's context.user gate), so the tab needs no
                            visibility check of its own. */}
                        <Tab label={PROFILE_DRAFTS} {...a11yProps(2)} />
                        {/* Following before Followers: the first is a list you
                            curated and act on, the second is one that happens
                            to you. */}
                        <Tab label={PROFILE_FOLLOWING} {...a11yProps(3)} />
                        <Tab label={PROFILE_FOLLOWERS} {...a11yProps(4)} />
                        {/* LAST, and named for what it holds. Your poems and
                            the poems you liked already have tabs, so an
                            "Activity" tab would mostly repeat them; comments
                            were the one thing you could write and then never
                            find again. */}
                        <Tab label={PROFILE_COMMENTS} {...a11yProps(5)} />
                    </Tabs>
                </AppBar>
            </div>
            <div className='profile__tabs-content'>
                <TabPanel className='profile__myPoems' value={value} index={0} dir={theme.direction}>
                    <MyPoems />
                </TabPanel>
                <TabPanel className='profile__myPoems' value={value} index={1} dir={theme.direction}>
                    <MyFavouritePoems />
                </TabPanel>
                <TabPanel className='profile__myPoems' value={value} index={2} dir={theme.direction}>
                    <MyDrafts />
                </TabPanel>
                {/* TabPanel renders its children only while selected, so only
                    the visible follow list is mounted and fetching — the two
                    caches never race each other. */}
                <TabPanel className='profile__myPoems' value={value} index={3} dir={theme.direction}>
                    <MyFollowing />
                </TabPanel>
                <TabPanel className='profile__myPoems' value={value} index={4} dir={theme.direction}>
                    <MyFollowers />
                </TabPanel>
                <TabPanel className='profile__myPoems' value={value} index={5} dir={theme.direction}>
                    <MyComments />
                </TabPanel>
            </div>
        </section>
    )
}

export default ProfileTabs

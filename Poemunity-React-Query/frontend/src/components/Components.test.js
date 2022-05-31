import React from 'react'
import Enzyme, { mount, shallow } from 'enzyme'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import Ranking from './Ranking'
import MyPoems from './MyPoems'
import MyFavouritePoems from './MyFavouritePoems'
import Login from './Login'
import Logout from './Logout'
import Profile from './Profile'
import Header from './Header'
import {
  QueryClient,
  QueryClientProvider,
} from "react-query"

const queryClient = new QueryClient();

describe('Ranking component', () => {
  it('renders with mount', async () => {
    const wrapper = mount(
    <QueryClientProvider client={queryClient}>
      <Ranking />
    </QueryClientProvider>
    )
    expect(wrapper).not.toBeNull()
    // this debug is great to see what is inside the component. For example, shallow doesn't render the children but mount does. There's another method called render
    // console.debug(wrapper.debug())
  
    // better to use a data-test attribute rather than a classname that can be changed accidentaly
    const ranking = wrapper.find(`[data-test='ranking__loading']`)
    expect(ranking.length).toBe(1)
  })
  it('also renders with shallow', () => {
    const wrapper = shallow(
    <QueryClientProvider client={queryClient}>
      <Ranking />
    </QueryClientProvider>
    )
    expect(wrapper).not.toBeNull()

  })
})

describe('MyPoems component', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(
    <QueryClientProvider client={queryClient}>
      <MyPoems />
    </QueryClientProvider>
    )
  })

  it('renders', () => {
    expect(wrapper).not.toBeNull()
  })
})

describe('MyFavouritePoems component', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(
    <QueryClientProvider client={queryClient}>
      <MyFavouritePoems />
    </QueryClientProvider>
    )
  })

  it('renders', () => {
    expect(wrapper).not.toBeNull()
  })
})

describe('Login component', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(
    <QueryClientProvider client={queryClient}>
      <Login />
    </QueryClientProvider>
    )
  })

  xit('renders', () => {
    expect(wrapper).not.toBeNull()
  })
})

describe('Logout component', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(
    <QueryClientProvider client={queryClient}>
      <Logout />
    </QueryClientProvider>
    )
  })

  it('renders', () => {
    expect(wrapper).not.toBeNull()
  })
})

describe('Profile component', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(
    <QueryClientProvider client={queryClient}>
      <Profile />
    </QueryClientProvider>
    )
  })

  it('renders', () => {
    expect(wrapper).not.toBeNull()
  })
})

describe('Header component', () => {
  let wrapper
  beforeEach(() => {
    wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Header />
      </QueryClientProvider>
    )
  })

  xit('renders', () => {
    expect(wrapper).not.toBeNull()
  })
})

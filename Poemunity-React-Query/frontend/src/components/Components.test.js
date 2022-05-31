import React from 'react'
import Enzyme, { mount } from 'enzyme'
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
  const onCountChange = jest.fn()
  let wrapper
  beforeEach(() => {
    wrapper = mount(
    <QueryClientProvider client={queryClient}>
      <Ranking onCountChange={onCountChange} />
    </QueryClientProvider>
    )
  })

  it('renders', () => {
    expect(wrapper).not.toBeNull()
  })
})

describe('MyPoems component', () => {
  const onCountChange = jest.fn()
  let wrapper
  beforeEach(() => {
    wrapper = mount(
    <QueryClientProvider client={queryClient}>
      <MyPoems onCountChange={onCountChange} />
    </QueryClientProvider>
    )
  })

  it('renders', () => {
    expect(wrapper).not.toBeNull()
  })
})

describe('MyFavouritePoems component', () => {
  const onCountChange = jest.fn()
  let wrapper
  beforeEach(() => {
    wrapper = mount(
    <QueryClientProvider client={queryClient}>
      <MyFavouritePoems onCountChange={onCountChange} />
    </QueryClientProvider>
    )
  })

  it('renders', () => {
    expect(wrapper).not.toBeNull()
  })
})

describe('Login component', () => {
  const onCountChange = jest.fn()
  let wrapper
  beforeEach(() => {
    wrapper = mount(
    <QueryClientProvider client={queryClient}>
      <Login onCountChange={onCountChange} />
    </QueryClientProvider>
    )
  })

  it('renders', () => {
    expect(wrapper).not.toBeNull()
  })
})

describe('Logout component', () => {
  const onCountChange = jest.fn()
  let wrapper
  beforeEach(() => {
    wrapper = mount(
    <QueryClientProvider client={queryClient}>
      <Logout onCountChange={onCountChange} />
    </QueryClientProvider>
    )
  })

  it('renders', () => {
    expect(wrapper).not.toBeNull()
  })
})

describe('Profile component', () => {
  const onCountChange = jest.fn()
  let wrapper
  beforeEach(() => {
    wrapper = mount(
    <QueryClientProvider client={queryClient}>
      <Profile onCountChange={onCountChange} />
    </QueryClientProvider>
    )
  })

  it('renders', () => {
    expect(wrapper).not.toBeNull()
  })
})

describe('Header component', () => {
  const onCountChange = jest.fn()
  let wrapper
  beforeEach(() => {
    wrapper = mount(
      <QueryClientProvider client={queryClient}>
        <Header onCountChange={onCountChange} />
      </QueryClientProvider>
    )
  })

  it('renders', () => {
    expect(wrapper).not.toBeNull()
  })
})

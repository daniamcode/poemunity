import React from 'react'
import Enzyme, { mount, shallow } from 'enzyme'
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import {createMemoryHistory} from 'history'
import Ranking from './Ranking'
import MyPoems from './MyPoems'
import MyFavouritePoems from './MyFavouritePoems'
import Login from './Login'
import Logout from './Logout'
import Profile from './Profile'
import Header from './Header'
import { BrowserRouter as Router } from 'react-router-dom'
import '@testing-library/jest-dom'
import { manageSuccess } from '../utils/notifications';

import {
  QueryClient,
  QueryClientProvider,
} from "react-query"

const queryClient = new QueryClient();

// these mocks seem to have to be defined before the "describe"
jest.mock('../utils/notifications');


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
// mount is for Enzyme, render is for React Testing Library
// todo: refactor the rest of the tests with wrapperFactory
describe('Login component', () => {
  let wrapper = null;
  const wrapperFactory = () => {
    return ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <Router>
          {children}
        </Router>
      </QueryClientProvider>
    );
  };

  afterEach(() => {
    jest.restoreAllMocks();
    wrapper = null;
  });

  it('renders', async() => {
    wrapper = wrapperFactory();

    render(<Login />, { wrapper });

    expect(wrapper).not.toBeNull()
    await waitFor(() => {
      expect(document.querySelector('.login')).toBeInTheDocument();
    })
  })

  it('Should call manageSuccess when clicking login', () => {  
    wrapper = wrapperFactory();
    
    render(<Login />, { wrapper });

    fireEvent.submit(screen.getByTestId('login'))

    expect(manageSuccess).toHaveBeenCalled();    
    expect(manageSuccess).toHaveBeenCalledTimes(1)
    expect(manageSuccess).toHaveBeenCalledWith('Logging in...')
  });  
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
  const history = createMemoryHistory()
  beforeEach(() => {
    wrapper = mount(
      <QueryClientProvider client={queryClient} >
        <Router history={history}>
          <Header />
        </Router>
      </QueryClientProvider>
    )
  })

  it('renders', () => {
    expect(wrapper).not.toBeNull()
  })
})

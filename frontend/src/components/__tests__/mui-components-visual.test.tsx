import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from '../../redux/store'

// Import all components using MUI
import CircularIndeterminate from '../CircularIndeterminate'
import SimpleAccordion from '../SimpleAccordion'
import Ranking from '../Ranking/Ranking'
import ProfileTabs from '../Profile/components/ProfileTabs'
import TabPanel from '../Profile/components/TabPanel'
import { PoemFooter } from '../Detail/components/PoemFooter'
import ListItem from '../ListItem/ListItem'
import MyPoems from '../MyPoems/MyPoems'
import MyFavouritePoems from '../MyFavouritePoems/MyFavouritePoems'
import List from '../List/List'
import { AppContext } from '../../App'

// Create a wrapper with all necessary providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  )
}

describe('MUI Components Visual Regression Tests', () => {
  describe('CircularIndeterminate', () => {
    test('should render loading spinner correctly', () => {
      const { container } = render(<CircularIndeterminate />, { wrapper: AllTheProviders })
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('SimpleAccordion', () => {
    test('should render accordion correctly', () => {
      const { container } = render(<SimpleAccordion />, { wrapper: AllTheProviders })
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('Ranking', () => {
    test('should render ranking table correctly', () => {
      const { container } = render(<Ranking />, { wrapper: AllTheProviders })
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('ProfileTabs', () => {
    test('should render profile tabs correctly', () => {
      const mockHandleChange = jest.fn()
      const mockHandleChangeIndex = jest.fn()

      const { container } = render(
        <ProfileTabs
          value={0}
          handleChange={mockHandleChange}
          handleChangeIndex={mockHandleChangeIndex}
        />,
        { wrapper: AllTheProviders }
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('TabPanel', () => {
    test('should render tab panel when selected', () => {
      const { container } = render(
        <TabPanel value={0} index={0}>
          <div>Test Content</div>
        </TabPanel>,
        { wrapper: AllTheProviders }
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    test('should not render tab panel when not selected', () => {
      const { container } = render(
        <TabPanel value={0} index={1}>
          <div>Test Content</div>
        </TabPanel>,
        { wrapper: AllTheProviders }
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('PoemFooter', () => {
    const mockPoem = {
      id: 'test-poem-id',
      title: 'Test Poem',
      author: 'testuser',
      poem: 'Test poem content',
      likes: [],
      userId: 'test-user-id',
      genre: 'love',
      picture: 'test-pic.jpg',
      date: '2024-01-01'
    }

    const mockContext = {
      user: 'test-token',
      userId: 'test-user-id',
      username: 'testuser',
      picture: 'test-pic.jpg',
      adminId: 'admin-id',
      setState: jest.fn(),
      config: {
        headers: {
          Authorization: 'Bearer test-token'
        }
      },
      elementToEdit: ''
    }

    test('should render poem footer correctly', () => {
      const mockOnLike = jest.fn()
      const mockOnDelete = jest.fn()
      const mockOnEdit = jest.fn()

      const { container } = render(
        <PoemFooter
          poem={mockPoem}
          context={mockContext}
          onLike={mockOnLike}
          onDelete={mockOnDelete}
          onEdit={mockOnEdit}
        />,
        { wrapper: AllTheProviders }
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  // Note: List component is a route component and gets data from Redux/router
  // It's better tested as an integration test, not a visual regression test
  // Skipping List component snapshot for now

  describe('ListItem', () => {
    const mockPoem = {
      id: 'test-poem-id',
      title: 'Test Poem',
      author: 'testuser',
      poem: 'Test poem content',
      likes: [],
      userId: 'test-user-id',
      genre: 'love',
      picture: 'test-pic.jpg',
      date: '2024-01-01'
    }

    const mockContext = {
      user: 'test-token',
      userId: 'test-user-id',
      username: 'testuser',
      picture: 'test-pic.jpg',
      adminId: 'admin-id',
      setState: jest.fn(),
      config: {
        headers: {
          Authorization: 'Bearer test-token'
        }
      },
      elementToEdit: ''
    }

    test('should render list item correctly', () => {
      const { container } = render(
        <ListItem poem={mockPoem} context={mockContext} />,
        { wrapper: AllTheProviders }
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    test('should render list item with likes correctly', () => {
      const likedPoem = { ...mockPoem, likes: ['user-1', 'user-2', 'test-user-id'] }
      const { container } = render(
        <ListItem poem={likedPoem} context={mockContext} />,
        { wrapper: AllTheProviders }
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('MyPoems', () => {
    const mockAppContext = {
      user: 'test-token',
      userId: 'test-user-id',
      username: 'testuser',
      picture: 'test-pic.jpg',
      adminId: 'admin-id',
      setState: jest.fn(),
      config: {
        headers: {
          Authorization: 'Bearer test-token'
        }
      },
      elementToEdit: ''
    }

    test('should render MyPoems component correctly', () => {
      const { container } = render(
        <AppContext.Provider value={mockAppContext}>
          <MyPoems />
        </AppContext.Provider>,
        { wrapper: AllTheProviders }
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('MyFavouritePoems', () => {
    const mockAppContext = {
      user: 'test-token',
      userId: 'test-user-id',
      username: 'testuser',
      picture: 'test-pic.jpg',
      adminId: 'admin-id',
      setState: jest.fn(),
      config: {
        headers: {
          Authorization: 'Bearer test-token'
        }
      },
      elementToEdit: ''
    }

    test('should render MyFavouritePoems component correctly', () => {
      const { container } = render(
        <AppContext.Provider value={mockAppContext}>
          <MyFavouritePoems />
        </AppContext.Provider>,
        { wrapper: AllTheProviders }
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })

  describe('List', () => {
    const mockAppContext = {
      user: 'test-token',
      userId: 'test-user-id',
      username: 'testuser',
      picture: 'test-pic.jpg',
      adminId: 'admin-id',
      setState: jest.fn(),
      config: {
        headers: {
          Authorization: 'Bearer test-token'
        }
      },
      elementToEdit: ''
    }

    test('should render List component correctly without genre', () => {
      const { container } = render(
        <AppContext.Provider value={mockAppContext}>
          <List />
        </AppContext.Provider>,
        { wrapper: AllTheProviders }
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    test('should render List component correctly with genre', () => {
      const mockProps = {
        match: {
          params: {
            genre: 'love'
          }
        }
      }

      const { container } = render(
        <AppContext.Provider value={mockAppContext}>
          <List {...mockProps} />
        </AppContext.Provider>,
        { wrapper: AllTheProviders }
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })
})

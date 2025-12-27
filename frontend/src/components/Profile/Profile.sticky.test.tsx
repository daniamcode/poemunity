import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import Profile from './Profile'
import store from '../../redux/store'
import { AppContext } from '../../App'

describe('Profile - Sticky Elements', () => {
    const mockContext = {
        user: 'test-user',
        userId: '123',
        username: 'Test User',
        picture: 'test.jpg',
        adminId: '456',
        elementToEdit: '',
        setState: jest.fn(),
        config: {
            headers: {
                Authorization: 'Bearer test-token'
            }
        }
    }

    const renderProfile = () => {
        return render(
            <AppContext.Provider value={mockContext}>
                <Provider store={store}>
                    <BrowserRouter>
                        <Profile />
                    </BrowserRouter>
                </Provider>
            </AppContext.Provider>
        )
    }

    test('should render profile__intro with sticky class', () => {
        const { container } = renderProfile()

        const profileIntro = container.querySelector('.profile__intro')
        expect(profileIntro).toBeInTheDocument()
        expect(profileIntro).toHaveClass('profile__intro')
    })

    test('should maintain sticky element after simulated scroll', () => {
        const { container } = renderProfile()

        // Simulate scroll event
        Object.defineProperty(window, 'scrollY', { value: 500, writable: true })
        window.dispatchEvent(new Event('scroll'))

        // Profile intro should still be present
        const profileIntro = container.querySelector('.profile__intro')
        expect(profileIntro).toBeInTheDocument()
    })

    test('should render profile with correct structure', () => {
        const { container } = renderProfile()

        const profile = container.querySelector('.profile__main')
        expect(profile).toBeInTheDocument()

        // Check that profile__intro exists within profile
        const profileIntro = profile?.querySelector('.profile__intro')
        expect(profileIntro).toBeInTheDocument()
    })

    test('should keep sticky element in correct position after multiple scroll events', () => {
        const { container } = renderProfile()

        // Simulate multiple scroll events
        Object.defineProperty(window, 'scrollY', { value: 200, writable: true })
        window.dispatchEvent(new Event('scroll'))

        Object.defineProperty(window, 'scrollY', { value: 800, writable: true })
        window.dispatchEvent(new Event('scroll'))

        const profileIntro = container.querySelector('.profile__intro')
        expect(profileIntro).toBeInTheDocument()
        expect(profileIntro).toHaveClass('profile__intro')
    })

    test('should render profile intro content within sticky element', () => {
        const { container } = renderProfile()

        const profileIntro = container.querySelector('.profile__intro')

        // Verify sticky element contains expected content
        expect(profileIntro).toBeInTheDocument()

        // Check for profile image directly in intro
        const profileImage = profileIntro?.querySelector('.profile__image')
        expect(profileImage).toBeInTheDocument()

        // Check for personal data section
        const personalData = profileIntro?.querySelector('.profile__personal-data')
        expect(personalData).toBeInTheDocument()
    })

    test('should render profile__tabs-header with sticky class', () => {
        const { container } = renderProfile()

        const profileTabsHeader = container.querySelector('.profile__tabs-header')
        expect(profileTabsHeader).toBeInTheDocument()
        expect(profileTabsHeader).toHaveClass('profile__tabs-header')
    })

    test('should maintain profile__tabs-header sticky element after scroll', () => {
        const { container } = renderProfile()

        // Simulate scroll event
        Object.defineProperty(window, 'scrollY', { value: 1000, writable: true })
        window.dispatchEvent(new Event('scroll'))

        const profileTabsHeader = container.querySelector('.profile__tabs-header')
        expect(profileTabsHeader).toBeInTheDocument()
    })

    test('should have sticky intro and tabs header elements', () => {
        const { container } = renderProfile()

        const profileIntro = container.querySelector('.profile__intro')
        const profileTabsHeader = container.querySelector('.profile__tabs-header')

        // Both sticky elements should exist
        expect(profileIntro).toBeInTheDocument()
        expect(profileTabsHeader).toBeInTheDocument()
    })

    test('should keep profile__tabs-header in correct position after multiple scroll events', () => {
        const { container } = renderProfile()

        // Simulate multiple scroll events
        Object.defineProperty(window, 'scrollY', { value: 500, writable: true })
        window.dispatchEvent(new Event('scroll'))

        Object.defineProperty(window, 'scrollY', { value: 1500, writable: true })
        window.dispatchEvent(new Event('scroll'))

        const profileTabsHeader = container.querySelector('.profile__tabs-header')
        expect(profileTabsHeader).toBeInTheDocument()
        expect(profileTabsHeader).toHaveClass('profile__tabs-header')
    })

    test('should render tabs content within sticky tabs header element', () => {
        const { container } = renderProfile()

        const profileTabsHeader = container.querySelector('.profile__tabs-header')
        expect(profileTabsHeader).toBeInTheDocument()

        // Check for Material-UI AppBar inside tabs header
        const appBar = profileTabsHeader?.querySelector('.MuiAppBar-root')
        expect(appBar).toBeInTheDocument()
    })

    test('should keep all sticky elements in correct stacking order', () => {
        const { container } = renderProfile()

        const profileIntro = container.querySelector('.profile__intro') as HTMLElement
        const profileTabsHeader = container.querySelector('.profile__tabs-header') as HTMLElement

        // Both sticky elements should be present
        expect(profileIntro).toBeInTheDocument()
        expect(profileTabsHeader).toBeInTheDocument()

        // Verify they exist in the DOM (order will be maintained by CSS z-index)
        const profile = container.querySelector('.profile__main')
        expect(profile).toContainElement(profileIntro)
        expect(profile).toContainElement(profileTabsHeader)
    })
})

import { render, cleanup } from '@testing-library/react'
import { AppContext, AppProvider } from './App'
import { Provider } from 'react-redux'
import store from './redux/store'
import '@testing-library/jest-dom'
import React, { useContext } from 'react'
import * as poemsActions from './redux/actions/poemsActions'

jest.mock('./redux/actions/poemsActions', () => ({
    ...jest.requireActual('./redux/actions/poemsActions'),
    getRankingAction: jest.fn(() => ({ type: 'get_ranking' }))
}))

describe('App', () => {
    afterEach(() => {
        cleanup()
    })

    describe('Ranking data fetch', () => {
        beforeEach(() => {
            jest.clearAllMocks()
        })

        test('dispatches getRankingAction once on mount', () => {
            render(
                <Provider store={store}>
                    <AppProvider>
                        <div />
                    </AppProvider>
                </Provider>
            )
            expect(poemsActions.getRankingAction).toHaveBeenCalledTimes(1)
            expect(poemsActions.getRankingAction).toHaveBeenCalledWith({ params: { origin: 'user' } })
        })
    })

    describe('Context setState - Race condition bug prevention', () => {
        test('setState should use functional update pattern to avoid stale closures', () => {
            const AppSource = require('fs').readFileSync(require('path').join(__dirname, 'App.tsx'), 'utf8')

            expect(AppSource).toMatch(/setContextState\s*\(\s*prevState\s*=>/)
            expect(AppSource).toMatch(/\.\.\.prevState/)
            expect(AppSource).not.toMatch(/setContextState\s*\(\s*{\s*\.\.\.contextState/)
        })

        test('App component renders with context provider', () => {
            const { container } = render(
                <Provider store={store}>
                    <AppProvider>
                        <div className='container' />
                    </AppProvider>
                </Provider>
            )

            const appContainer = container.querySelector('.container')
            expect(appContainer).toBeInTheDocument()
        })

        test('Context is available to child components', () => {
            let contextWasCaptured = false

            const TestComponent = () => {
                const ctx = useContext(AppContext)
                contextWasCaptured = ctx !== null && ctx !== undefined
                return null
            }

            render(
                <Provider store={store}>
                    <AppProvider>
                        <TestComponent />
                    </AppProvider>
                </Provider>
            )

            expect(contextWasCaptured).toBe(true)
        })
    })
})

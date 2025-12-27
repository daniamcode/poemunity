import { loginAction, registerAction } from './loginActions'
import * as commonActions from './commonActions'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import { ACTIONS } from '../reducers/loginReducers'
import { AppDispatch } from '../store'

describe('loginActions', () => {
    let dispatch: AppDispatch

    const mockCallbacks = {
        success: jest.fn(),
        error: jest.fn(),
        reset: jest.fn()
    }

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
    })

    describe('loginAction', () => {
        test('should call postAction with correct parameters', () => {
            const spy = jest.spyOn(commonActions, 'postAction')
            const loginData = {
                username: 'testuser',
                password: 'password123'
            }

            loginAction({
                data: loginData,
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith({
                type: ACTIONS.LOGIN,
                url: API_ENDPOINTS.LOGIN,
                dispatch,
                data: loginData,
                callbacks: mockCallbacks
            })
            expect(spy).toHaveBeenCalledTimes(1)

            spy.mockRestore()
        })

        test('should return a function', () => {
            const result = loginAction({
                data: { username: 'test', password: 'test' },
                callbacks: mockCallbacks
            })

            expect(typeof result).toBe('function')
        })

        test('should handle login with different credentials', () => {
            const spy = jest.spyOn(commonActions, 'postAction')
            const loginData = {
                username: 'anotheruser',
                password: 'differentpassword'
            }

            loginAction({
                data: loginData,
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: loginData
                })
            )

            spy.mockRestore()
        })

        test('should call dispatch when thunk is invoked', () => {
            const spy = jest.spyOn(commonActions, 'postAction')

            const thunk = loginAction({
                data: { username: 'test', password: 'test' },
                callbacks: mockCallbacks
            })

            thunk(dispatch)

            expect(dispatch).toBeDefined()
            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    dispatch
                })
            )

            spy.mockRestore()
        })

        test('should use LOGIN action type', () => {
            const spy = jest.spyOn(commonActions, 'postAction')

            loginAction({
                data: { username: 'test', password: 'test' },
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: ACTIONS.LOGIN
                })
            )

            spy.mockRestore()
        })

        test('should use correct API endpoint', () => {
            const spy = jest.spyOn(commonActions, 'postAction')

            loginAction({
                data: { username: 'test', password: 'test' },
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: API_ENDPOINTS.LOGIN
                })
            )

            spy.mockRestore()
        })
    })

    describe('registerAction', () => {
        test('should call postAction with correct parameters', () => {
            const spy = jest.spyOn(commonActions, 'postAction')
            const registerData = {
                username: 'newuser',
                password: 'newpassword',
                email: 'test@example.com'
            }

            registerAction({
                data: registerData,
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith({
                type: ACTIONS.REGISTER,
                url: API_ENDPOINTS.REGISTER,
                dispatch,
                data: registerData,
                callbacks: mockCallbacks
            })
            expect(spy).toHaveBeenCalledTimes(1)

            spy.mockRestore()
        })

        test('should return a function', () => {
            const result = registerAction({
                data: { username: 'test', password: 'test' },
                callbacks: mockCallbacks
            })

            expect(typeof result).toBe('function')
        })

        test('should handle registration with different user data', () => {
            const spy = jest.spyOn(commonActions, 'postAction')
            const registerData = {
                username: 'differentuser',
                password: 'differentpass',
                email: 'different@example.com'
            }

            registerAction({
                data: registerData,
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: registerData
                })
            )

            spy.mockRestore()
        })

        test('should call dispatch when thunk is invoked', () => {
            const spy = jest.spyOn(commonActions, 'postAction')

            const thunk = registerAction({
                data: { username: 'test', password: 'test' },
                callbacks: mockCallbacks
            })

            thunk(dispatch)

            expect(dispatch).toBeDefined()
            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    dispatch
                })
            )

            spy.mockRestore()
        })

        test('should use REGISTER action type', () => {
            const spy = jest.spyOn(commonActions, 'postAction')

            registerAction({
                data: { username: 'test', password: 'test' },
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: ACTIONS.REGISTER
                })
            )

            spy.mockRestore()
        })

        test('should use correct API endpoint', () => {
            const spy = jest.spyOn(commonActions, 'postAction')

            registerAction({
                data: { username: 'test', password: 'test' },
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: API_ENDPOINTS.REGISTER
                })
            )

            spy.mockRestore()
        })
    })

    describe('loginAction vs registerAction', () => {
        test('should use different action types', () => {
            const loginSpy = jest.spyOn(commonActions, 'postAction')
            const registerSpy = jest.spyOn(commonActions, 'postAction')

            loginAction({
                data: { username: 'test', password: 'test' },
                callbacks: mockCallbacks
            })(dispatch)

            const loginCall = loginSpy.mock.calls[0][0]

            loginSpy.mockClear()

            registerAction({
                data: { username: 'test', password: 'test' },
                callbacks: mockCallbacks
            })(dispatch)

            const registerCall = registerSpy.mock.calls[0][0]

            expect(loginCall.type).toBe(ACTIONS.LOGIN)
            expect(registerCall.type).toBe(ACTIONS.REGISTER)
            expect(loginCall.type).not.toBe(registerCall.type)

            loginSpy.mockRestore()
            registerSpy.mockRestore()
        })

        test('should use different API endpoints', () => {
            const loginSpy = jest.spyOn(commonActions, 'postAction')
            const registerSpy = jest.spyOn(commonActions, 'postAction')

            loginAction({
                data: { username: 'test', password: 'test' },
                callbacks: mockCallbacks
            })(dispatch)

            const loginCall = loginSpy.mock.calls[0][0]

            loginSpy.mockClear()

            registerAction({
                data: { username: 'test', password: 'test' },
                callbacks: mockCallbacks
            })(dispatch)

            const registerCall = registerSpy.mock.calls[0][0]

            expect(loginCall.url).toBe(API_ENDPOINTS.LOGIN)
            expect(registerCall.url).toBe(API_ENDPOINTS.REGISTER)
            expect(loginCall.url).not.toBe(registerCall.url)

            loginSpy.mockRestore()
            registerSpy.mockRestore()
        })
    })
})

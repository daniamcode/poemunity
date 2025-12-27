import Axios from 'axios'
import API from './axiosInstance'

jest.mock('axios')

describe('axiosInstance', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should create axios instance with default baseURL and timeout', () => {
        const mockAxiosInstance = { get: jest.fn(), post: jest.fn() }
        Axios.create.mockReturnValue(mockAxiosInstance)

        const headers = { 'Content-Type': 'application/json' }
        const result = API(headers)

        expect(Axios.create).toHaveBeenCalledWith({
            baseURL: 'http://localhost:4200',
            timeout: 40000,
            headers
        })
        expect(result).toBe(mockAxiosInstance)
    })

    test('should create axios instance with custom headers', () => {
        const mockAxiosInstance = { get: jest.fn(), post: jest.fn() }
        Axios.create.mockReturnValue(mockAxiosInstance)

        const customHeaders = {
            Authorization: 'Bearer token123',
            'Custom-Header': 'custom-value'
        }

        API(customHeaders)

        expect(Axios.create).toHaveBeenCalledWith({
            baseURL: 'http://localhost:4200',
            timeout: 40000,
            headers: customHeaders
        })
    })

    test('should create axios instance with empty headers', () => {
        const mockAxiosInstance = { get: jest.fn(), post: jest.fn() }
        Axios.create.mockReturnValue(mockAxiosInstance)

        API({})

        expect(Axios.create).toHaveBeenCalledWith({
            baseURL: 'http://localhost:4200',
            timeout: 40000,
            headers: {}
        })
    })

    test('should merge extraConfig with default config', () => {
        const mockAxiosInstance = { get: jest.fn(), post: jest.fn() }
        Axios.create.mockReturnValue(mockAxiosInstance)

        const headers = { 'Content-Type': 'application/json' }
        const extraConfig = {
            withCredentials: true,
            maxRedirects: 5
        }

        API(headers, extraConfig)

        expect(Axios.create).toHaveBeenCalledWith({
            baseURL: 'http://localhost:4200',
            timeout: 40000,
            headers,
            withCredentials: true,
            maxRedirects: 5
        })
    })

    test('should allow extraConfig to override default timeout', () => {
        const mockAxiosInstance = { get: jest.fn(), post: jest.fn() }
        Axios.create.mockReturnValue(mockAxiosInstance)

        const headers = {}
        const extraConfig = { timeout: 60000 }

        API(headers, extraConfig)

        expect(Axios.create).toHaveBeenCalledWith({
            baseURL: 'http://localhost:4200',
            timeout: 60000,
            headers
        })
    })

    test('should return axios instance that can be used for requests', () => {
        const mockGet = jest.fn()
        const mockPost = jest.fn()
        const mockAxiosInstance = { get: mockGet, post: mockPost }
        Axios.create.mockReturnValue(mockAxiosInstance)

        const instance = API({})

        expect(instance.get).toBe(mockGet)
        expect(instance.post).toBe(mockPost)
    })

    test('should call Axios.create exactly once per invocation', () => {
        const mockAxiosInstance = { get: jest.fn(), post: jest.fn() }
        Axios.create.mockReturnValue(mockAxiosInstance)

        API({})

        expect(Axios.create).toHaveBeenCalledTimes(1)
    })
})

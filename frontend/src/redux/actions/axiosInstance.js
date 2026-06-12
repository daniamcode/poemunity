import Axios from 'axios'

// Use port 4201 for Cypress tests, port 4200 for development
// This allows Cypress tests to run without killing the dev backend
const getBaseURL = () => {
    if (process.env.NODE_ENV === 'test') {
        return 'http://localhost:4200'
    }
    if (typeof window !== 'undefined' && window.Cypress) {
        return 'http://localhost:4201'
    }
    if (typeof window !== 'undefined') {
        return '/api/backend'
    }
    if (process.env.NODE_ENV === 'production') {
        return process.env.NEXT_PUBLIC_API_URL
    }
    return 'http://localhost:4200'
}

export default function API(headers, extraConfig) {
    return Axios.create({
        // baseURL: `${process.env.API_BASE_PATH}`,
        baseURL: getBaseURL(),
        timeout: 40000,
        withCredentials: true,
        headers,
        ...extraConfig
    })
}

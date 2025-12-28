import Axios from 'axios'

// Use port 4201 for Cypress tests, port 4200 for development
// This allows Cypress tests to run without killing the dev backend
const getBaseURL = () => {
    if (typeof window !== 'undefined' && window.Cypress) {
        return 'http://localhost:4201'
    }
    return 'http://localhost:4200'
}

export default function API(headers, extraConfig) {
    return Axios.create({
        // baseURL: `${process.env.API_BASE_PATH}`,
        baseURL: getBaseURL(),
        timeout: 40000,
        headers,
        ...extraConfig
    })
}

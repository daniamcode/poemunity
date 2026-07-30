import Axios from 'axios'

// In the BROWSER every call goes through the Next proxy at /api/backend, which
// attaches the httpOnly session cookie as a Bearer token and refreshes it when a
// response carries a new one. On the SERVER (getServerSideProps) there is no
// proxy to talk to, so it addresses the backend directly.
//
// There used to be a `window.Cypress` branch here pointing the browser straight
// at localhost:4201. It meant the E2E suite exercised an application that does
// not ship: no proxy, so no cookie-to-Bearer translation and no token refresh —
// the two things most worth having end-to-end coverage of — and every request
// was cross-origin, which the CORS allowlist rightly refused, so the app under
// test could not even load a poem. Cypress now runs the real path; point the
// frontend's NEXT_PUBLIC_API_URL at the test backend instead.
const getBaseURL = () => {
    if (process.env.NODE_ENV === 'test') {
        return 'http://localhost:4200'
    }
    if (typeof window !== 'undefined') {
        return '/api/backend'
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200'
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

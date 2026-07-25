import { GetServerSideProps } from 'next'
import Profile from '../src/components/Profile/Profile'
import { fetchServerUser } from '../src/lib/serverApi'

// Route protection is handled server-side by middleware.ts
export default Profile

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const token = req.cookies?.token
    return { props: { initialUser: await fetchServerUser(token) } }
}

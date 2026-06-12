import { GetServerSideProps } from 'next'
import Profile from '../src/components/Profile/Profile'
import { buildServerUser } from '../src/lib/serverApi'

// Route protection is handled server-side by middleware.ts
export default Profile

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const token = req.cookies?.token
    return { props: { initialUser: token ? buildServerUser(token) : null } }
}

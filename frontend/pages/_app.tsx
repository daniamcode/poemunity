import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { Toaster } from 'react-hot-toast'
import store from '../src/redux/store'
import createEmotionCache from '../src/lib/emotionCache'
import { AppProvider } from '../src/App'
import Header from '../src/components/Header/Header'
import '../src/App.scss'
import '../src/components/List/List.scss'
import '../src/components/Detail/Detail.scss'
import '../src/components/Dashboard/Dashboard.scss'
import '../src/components/Authors/Authors.scss'
import '../src/components/Header/Header.scss'
import '../src/components/Header/Login.scss'
import '../src/components/PageNotFound/PageNotFound.scss'
import '../src/components/Profile/Profile.scss'
import '../src/components/Ranking/Ranking.scss'
import '../src/components/Register/Register.scss'

const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
    emotionCache?: EmotionCache
}

export default function MyApp({ Component, pageProps, emotionCache = clientSideEmotionCache }: MyAppProps) {
    return (
        <CacheProvider value={emotionCache}>
            <Provider store={store}>
                <AppProvider initialUser={pageProps.initialUser ?? null}>
                    <div className='container'>
                        <Header />
                        <div className='margin-body'>
                            <Component {...pageProps} />
                        </div>
                    </div>
                    <Toaster position='bottom-right' />
                </AppProvider>
            </Provider>
        </CacheProvider>
    )
}

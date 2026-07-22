import type { AppProps } from 'next/app'
import Script from 'next/script'
import { Provider } from 'react-redux'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { Toaster } from 'react-hot-toast'
import store from '../src/redux/store'
import createEmotionCache from '../src/lib/emotionCache'
import { AppProvider } from '../src/App'
import Header from '../src/components/Header/Header'
import Footer from '../src/components/Footer/Footer'
import '../src/App.scss'
import '../src/components/List/List.scss'
import '../src/components/Detail/Detail.scss'
import '../src/components/Dashboard/Dashboard.scss'
import '../src/components/Authors/Authors.scss'
import '../src/components/Footer/Footer.scss'
import '../src/components/Header/Header.scss'
import '../src/components/Header/Login.scss'
import '../src/components/Legal/LegalPage.scss'
import '../src/components/PageNotFound/PageNotFound.scss'
import '../src/components/Profile/Profile.scss'
import '../src/components/Ranking/Ranking.scss'
import '../src/components/Register/Register.scss'

const clientSideEmotionCache = createEmotionCache()

const GA_MEASUREMENT_ID = 'G-0L5GRL29BS'

interface MyAppProps extends AppProps {
    emotionCache?: EmotionCache
}

export default function MyApp({ Component, pageProps, emotionCache = clientSideEmotionCache }: MyAppProps) {
    return (
        <CacheProvider value={emotionCache}>
            {process.env.NODE_ENV === 'production' && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
                        strategy='afterInteractive'
                    />
                    <Script id='google-analytics' strategy='afterInteractive'>
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${GA_MEASUREMENT_ID}');
                        `}
                    </Script>
                </>
            )}
            <Provider store={store}>
                <AppProvider initialUser={pageProps.initialUser}>
                    <div className='container'>
                        <a className='skip-link' href='#main-content'>Skip to main content</a>
                        <Header />
                        <div className='margin-body' id='main-content' tabIndex={-1}>
                            <Component {...pageProps} />
                        </div>
                        <Footer />
                    </div>
                    <Toaster position='bottom-right' />
                </AppProvider>
            </Provider>
        </CacheProvider>
    )
}

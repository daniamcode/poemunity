import type { AppProps } from 'next/app'
import Script from 'next/script'
import { Provider } from 'react-redux'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { Toaster } from 'react-hot-toast'
import store from '../src/redux/store'
import createEmotionCache from '../src/lib/emotionCache'
import { fontBody, fontHeading, fontDisplay } from '../src/lib/fonts'
import { AppProvider } from '../src/App'
import Header from '../src/components/Header/Header'
import Footer from '../src/components/Footer/Footer'
import VerifyBanner from '../src/components/Auth/VerifyBanner'
import '../src/App.scss'
import '../src/components/List/List.scss'
import '../src/components/Detail/Detail.scss'
import '../src/components/Dashboard/Dashboard.scss'
import '../src/components/Authors/Authors.scss'
import '../src/components/Follow/Follow.scss'
import '../src/components/Notifications/Notifications.scss'
import '../src/components/Footer/Footer.scss'
import '../src/components/Header/Header.scss'
import '../src/components/Header/Login.scss'
import '../src/components/Legal/LegalPage.scss'
import '../src/components/PageNotFound/PageNotFound.scss'
import '../src/components/Profile/Profile.scss'
import '../src/components/Ranking/Ranking.scss'
import '../src/components/PoemOfTheWeek/PoemOfTheWeek.scss'
import '../src/components/Register/Register.scss'
import '../src/components/Auth/VerifyBanner.scss'

const clientSideEmotionCache = createEmotionCache()

const GA_MEASUREMENT_ID = 'G-0L5GRL29BS'

interface MyAppProps extends AppProps {
    emotionCache?: EmotionCache
}

export default function MyApp({ Component, pageProps, emotionCache = clientSideEmotionCache }: MyAppProps) {
    return (
        <CacheProvider value={emotionCache}>
            {/* Publish the loaded font families as CSS custom properties on
                :root, which is what `$font-body` / `$font-heading` in
                _variables.scss resolve to. It has to be :root rather than a
                wrapper class — `body` sets font-family, and a variable declared
                on a descendant is not visible to its ancestor. */}
            <style jsx global>{`
                :root {
                    --font-body: ${fontBody.style.fontFamily};
                    --font-heading: ${fontHeading.style.fontFamily};
                    --font-display: ${fontDisplay.style.fontFamily};
                }
            `}</style>
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
                        <VerifyBanner />
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

import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document'
import createEmotionServer from '@emotion/server/create-instance'
import createEmotionCache from '../src/lib/emotionCache'

export default class MyDocument extends Document {
    static async getInitialProps(ctx: DocumentContext) {
        const originalRenderPage = ctx.renderPage
        const cache = createEmotionCache()
        const { extractCriticalToChunks } = createEmotionServer(cache)

        ctx.renderPage = () =>
            originalRenderPage({
                enhanceApp: (App: any) =>
                    function EnhancedApp(props: any) {
                        return <App emotionCache={cache} {...props} />
                    }
            })

        const initialProps = await Document.getInitialProps(ctx)
        const emotionStyles = extractCriticalToChunks(initialProps.html)
        const emotionStyleTags = emotionStyles.styles.map(style => (
            <style
                data-emotion={`${style.key} ${style.ids.join(' ')}`}
                key={style.key}
                dangerouslySetInnerHTML={{ __html: style.css }}
            />
        ))

        return {
            ...initialProps,
            styles: [...emotionStyleTags, initialProps.styles]
        }
    }

    render() {
        return (
            <Html lang='en'>
                <Head>
                    <link rel='icon' href='/favicon.ico' sizes='48x48' />
                    <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
                    <link rel='icon' type='image/png' sizes='96x96' href='/favicon-96x96.png' />
                    <link rel='apple-touch-icon' href='/apple-touch-icon.png' />
                    <link rel='manifest' href='/site.webmanifest' />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

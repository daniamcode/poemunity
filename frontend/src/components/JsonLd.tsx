import Head from 'next/head'
import { JsonLdObject } from '../utils/structuredData'

interface JsonLdProps {
    data: JsonLdObject
    /** Distinguishes multiple blocks on one page for next/head deduplication. */
    id?: string
}

/**
 * Serialise structured data into a <script type="application/ld+json">.
 *
 * The escaping is not optional. This payload carries poem titles and author
 * names — user-supplied text — into a raw script element, where the HTML parser
 * ends the script at the first literal `</script>` no matter where it sits. A
 * poem titled `</script><script>…` would otherwise break out and execute.
 * Escaping `<` as < is inert inside JSON (it parses back to the same
 * string) and cannot terminate the element.
 */
export function JsonLd({ data, id = 'jsonld' }: JsonLdProps) {
    const json = JSON.stringify(data).replace(/</g, '\\u003c')

    return (
        <Head>
            <script
                type='application/ld+json'
                key={id}
                dangerouslySetInnerHTML={{ __html: json }}
            />
        </Head>
    )
}

export default JsonLd

import { render } from '@testing-library/react'
import { JsonLd } from './JsonLd'

// next/head renders nothing in a test env, so capture what it is handed.
const heads: React.ReactNode[] = []
jest.mock('next/head', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => {
        heads.push(children)
        return null
    }
}))

function scriptHtml(): string {
    const last = heads[heads.length - 1] as React.ReactElement<{
        dangerouslySetInnerHTML: { __html: string }
    }>
    return last.props.dangerouslySetInnerHTML.__html
}

describe('JsonLd', () => {
    beforeEach(() => { heads.length = 0 })

    test('serialises the data as JSON', () => {
        render(<JsonLd data={{ '@type': 'CollectionPage', name: 'Love poems' }} />)

        expect(JSON.parse(scriptHtml())).toEqual({ '@type': 'CollectionPage', name: 'Love poems' })
    })

    test('declares the ld+json type so crawlers pick it up', () => {
        render(<JsonLd data={{ '@type': 'CollectionPage' }} />)

        const last = heads[heads.length - 1] as React.ReactElement<{ type: string }>
        expect(last.props.type).toBe('application/ld+json')
    })

    // This payload carries poem titles and author names — user-supplied text —
    // into a raw script element, where the HTML parser ends the script at the
    // first literal </script> wherever it appears. A poem titled
    // "</script><script>alert(1)</script>" would otherwise break out and run.
    describe('escaping', () => {
        test('a closing script tag in the data cannot terminate the element', () => {
            render(
                <JsonLd data={{ '@type': 'CollectionPage', name: '</script><script>alert(1)</script>' }} />
            )

            const html = scriptHtml()
            expect(html).not.toContain('</script>')
            expect(html).not.toContain('<script>')
        })

        test('the escaped payload still parses back to the original string', () => {
            const name = '</script><img src=x onerror=alert(1)>'
            render(<JsonLd data={{ '@type': 'CollectionPage', name }} />)

            expect(JSON.parse(scriptHtml()).name).toBe(name)
        })

        test('escapes every < , not just the first', () => {
            render(<JsonLd data={{ '@type': 'CollectionPage', a: '<one>', b: '<two>' }} />)

            expect(scriptHtml()).not.toContain('<')
        })
    })
})

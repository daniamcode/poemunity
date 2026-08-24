import React from 'react'
import { render, screen } from '@testing-library/react'
import AuthorIntro from '../components/AuthorIntro/AuthorIntro'
import EditorialIntro from '../components/EditorialIntro/EditorialIntro'
import { AUTHOR_INTROS, authorIntro } from '../data/authorIntros'

/**
 * EDITORIAL INTRODUCTIONS ON AUTHOR PAGES.
 *
 * The author-page counterpart to genreIntros.test.tsx, scoped to the poets with
 * 6 or more poems here — 696 entries. Most of these assertions mirror that
 * file. Two do not, and they are the reason this suite exists separately:
 *
 *   NO AI PERSONA MAY EVER GET ONE. Twenty of them clear the threshold, and
 *   prose introducing any one as a poet would assert in plain English the thing
 *   the AI badge, the footer disclosure and the deliberate absence of a
 *   `Person` entity in their structured data all exist to deny. This is a
 *   truthfulness rule, not a styling one.
 *
 *   AND THE GUARD IS AN ALLOWLIST. `authorType !== 'famous'` rather than
 *   `=== 'ai'`, so a fourth author kind, or a profile response that omits the
 *   field, renders nothing rather than something.
 */

const KNOWN_AUTHOR_SLUGS = new Set(require('../test-utils/authorSlugs.json') as string[])

/** Every AI persona that clears the 6-poem threshold this file is scoped to. */
const AI_PERSONAS = [
    'emily-hart', 'sadie-monroe', 'thomas-walker', 'michael-brennan', 'maya-torres',
    'jake-sullivan', 'aria-patel', 'sam-rivera', 'ruth-caldwell', 'devon-blake', 'marcus-webb',
    'chloe-frost', 'zion-parks', 'ryan-cole', 'grace-okafor', 'lily-chen', 'karen-fischer',
    'robert-steele', 'harold-jenkins', 'diane-murphy'
]

/**
 * Poets over the threshold that are DELIBERATELY not written, because the work
 * is not known well enough here to describe truthfully — plus three blocked on
 * a mangled name in the database. Asserted by slug so that "finish the set"
 * never becomes a reason to invent one: an empty author page is a supported
 * state, and a confident sentence that is not true is not.
 *
 * The list GROWS as the threshold drops, and that is the honest signal. At 30+
 * poems every author was writable; at 11-19 twenty-two were not; in the 6-10
 * band a further 132 are not. That curve is the real argument against going
 * lower, and it is recorded here rather than in a commit message.
 */
const DELIBERATELY_UNWRITTEN = [
    'thomas-bastard', 'louise-imogen-guiney', 'frank-lima', 'j-allyn-rosser', 'joyce-sutphen',
    'mark-rudman', 'nate-klug', 'david-rivard', 'reginald-gibbons', 'marjorie-pickthall',
    'r-t-smith', 'rachel-sherwood', 'alice-b-fogel', 'amy-beeder', 'devin-johnston',
    'jessica-greenbaum', 'joel-brouwer', 'katie-peterson', 'mark-levine', 'sandra-simonds',
    'sophie-jewett', 'stephen-sandy', 'wendy-xu', 'megan-snyder-camp', 'linda-kunhardt',
    'alli-warren', 'thomas-centolella', 'terese-svoboda', 'sylvia-legris', 'roberto-harrison',
    'rebecca-hazelton', 'rachel-richardson', 'peter-pereira', 'maggie-dietz', 'john-brehm',
    'g-e-murray', 'francisco-aragn', 'farnoosh-fathi', 'dorothea-grossman',
    'cynthia-huntington', 'catherine-wagner', 'averill-curdy', 'theodore-weiss',
    'teresa-mei-chuc', 'sy-hoahwah', 'sueyeun-juliette-lee', 'sudeep-sen', 'sheryl-luna',
    'rodney-koeneke', 'roberto-tejada', 'richard-emil-braun', 'rebecca-morgan-frank',
    'raza-ali-hasan', 'lucy-ives', 'karen-an-hwei-lee', 'juan-delgado', 'john-spaulding',
    'john-reibetanz', 'joanie-mackowski', 'hester-knibbe', 'francine-sterle', 'emily-wilson',
    'debra-nystrom', 'constance-urdang', 'charlie-smith', 'chard-deniord', 'sandra-lim',
    'rynn-williams', 'robin-ekiss', 'roberta-hill', 'robert-vandermolen', 'rebecca-seiferle',
    'patricia-goedicke', 'norma-cole', 'mark-waldron', 'margaret-hasse', 'lisa-olstein',
    'kathryn-nuernberger', 'katharine-coles', 'kari-edwards', 'karenne-wood', 'joyce-peseroff',
    'john-peck', 'jason-guriel', 'jacob-saenz', 'eric-ekstrand', 'donald-grady-davidson',
    'dan-taulapapa-mcmullin', 'cynthia-cruz', 'connie-wanek', 'bin-ramke', 'alison-c-rollins',
    'valerie-martnez', 'tyrone-williams', 'tsitsi-ella-jaji', 'timothy-yu', 'thomas-p-lynch',
    'sun-yung-shin', 'stacy-szymaszek', 'sjohnna-mccray', 'sarah-gambito', 'sara-miller',
    'samiya-bashir', 'robert-fernandez', 'richard-o-moore', 'richard-hoffman', 'rebecca-wolff',
    'primus-st-john', 'oliver-de-la-paz', 'norman-williams', 'nick-carb',
    'natalie-scenters-zapico', 'mnica-de-la-torre', 'michael-chitwood', 'meghan-orourke',
    'matthew-nienow', 'lynn-crosbie', 'liz-waldner', 'kevin-mcfadden', 'katrina-roberts',
    'kathryn-starbuck', 'kate-gale', 'judith-harris', 'joshua-edwards', 'john-unterecker',
    'john-hennessy', 'john-beer', 'jason-shinder', 'jameson-fitzpatrick',
    'james-clerk-maxwell', 'jack-underwood', 'jack-collom', 'idra-novey', 'hilda-raz',
    'heidy-steidlmayer', 'hannah-gamble', 'emily-warn', 'eloise-klein-healy',
    'elizabeth-arnold', 'dg-nanouk-okpik', 'deborah-paredez', 'david-tomas-martinez',
    'david-roderick', 'david-hernandez', 'cyrus-cassells', 'cleopatra-mathis',
    'cathy-linh-che', 'carrie-fountain', 'bruce-guernsey', 'brian-culhane', 'brenda-crdenas',
    'barbara-ras', 'anna-rabinowitz', 'allan-peterson', 'lord-ron-george-gordon',
    'knight-of-the-white-elephant-of-burmah-william-mcgonagall', 'elena-karina-rne'
]

describe('no AI persona is ever introduced as a poet', () => {
    test.each(AI_PERSONAS)('%s has no entry in the data', slug => {
        expect(authorIntro(slug)).toBeNull()
    })

    test.each(AI_PERSONAS)('%s renders nothing even if data existed', slug => {
        // The SECOND, independent defence. The data guard above fails open —
        // add an entry and it renders — while this one fails closed. They fail
        // in opposite directions on purpose.
        const { container } = render(
            <AuthorIntro slug={slug} name='Emily Hart' authorType='ai' />
        )

        expect(container.innerHTML).toBe('')
    })

    test('a famous poet whose type says ai renders nothing', () => {
        // The guard is on the TYPE, not the slug list — so mislabelled data
        // errs towards silence rather than towards a claim.
        const { container } = render(
            <AuthorIntro slug='emily-dickinson' name='Emily Dickinson' authorType='ai' />
        )

        expect(container.innerHTML).toBe('')
    })
})

describe('the guard is an allowlist', () => {
    test.each([
        ['a registered user', 'user'],
        ['an unknown future kind', 'collective'],
        ['an empty string', ''],
        ['a missing type', undefined]
    ])('%s renders nothing', (_label, authorType) => {
        const { container } = render(
            <AuthorIntro slug='emily-dickinson' name='Emily Dickinson' authorType={authorType} />
        )

        expect(container.innerHTML).toBe('')
    })

    test('only famous renders', () => {
        render(<AuthorIntro slug='emily-dickinson' name='Emily Dickinson' authorType='famous' />)

        expect(screen.getByRole('heading', { name: 'About Emily Dickinson' })).toBeInTheDocument()
    })
})

describe('the written content is sound', () => {
    const entries = Object.entries(AUTHOR_INTROS)

    test('696 poets are covered', () => {
        expect(entries).toHaveLength(696)
    })

    test.each(DELIBERATELY_UNWRITTEN)('%s is left unwritten on purpose', slug => {
        expect(authorIntro(slug)).toBeNull()
    })

    test.each(entries.map(([slug]) => slug))('%s is a real author page', slug => {
        // A typo renders nothing at all, silently and forever: the component
        // looks the intro up BY slug.
        expect(KNOWN_AUTHOR_SLUGS.has(slug)).toBe(true)
    })

    test('the fixture is a real corpus, not an empty set that passes everything', () => {
        expect(KNOWN_AUTHOR_SLUGS.size).toBeGreaterThan(3000)
        expect(KNOWN_AUTHOR_SLUGS.has('definitely-not-a-poet-xyz')).toBe(false)
    })

    const allLinks = entries.flatMap(([slug, intro]) =>
        intro.readNext.map(poet => ({ from: slug, ...poet }))
    )

    test.each(allLinks.map(l => [l.from, l.slug] as const))(
        '%s → /authors/%s resolves',
        (_from, slug) => {
            expect(KNOWN_AUTHOR_SLUGS.has(slug)).toBe(true)
        }
    )

    test('no poet is recommended to read next after themselves', () => {
        const selfRefs = entries.filter(([slug, intro]) =>
            intro.readNext.some(p => p.slug === slug)
        )

        expect(selfRefs.map(([slug]) => slug)).toEqual([])
    })

    test.each(entries)('%s is 60–350 words', (_slug, intro) => {
        const words = intro.body.join(' ').split(/\s+/).length
        expect(words).toBeGreaterThanOrEqual(60)
        expect(words).toBeLessThanOrEqual(350)
    })

    test.each(entries)('%s names three poets to read next', (_slug, intro) => {
        expect(intro.readNext).toHaveLength(3)
    })

    test('no paragraph is reused between poets', () => {
        // The boilerplate guard. Prose swappable between two poets is filler,
        // and filler is the signal this whole effort exists to escape.
        const paragraphs = entries.flatMap(([, intro]) => intro.body)
        expect(new Set(paragraphs).size).toBe(paragraphs.length)
    })

    test('no AI persona appears even as a read-next recommendation', () => {
        // The subtler version of the same rule: linking a persona from a real
        // poet's page under "Read next" presents it as a peer.
        const recommended = new Set(allLinks.map(l => l.slug))

        AI_PERSONAS.forEach(p => expect(recommended.has(p)).toBe(false))
    })
})

describe('a one-paragraph entry keeps its read-next links', () => {
    // The shortest entries sit on the THINNEST author pages, which are the ones
    // that most need an outbound link. The links render inside the <details>,
    // so a guard on the prose alone turns a short entry into a dead end — and
    // nothing about the rendered page looks wrong.
    const oneParagraph = {
        heading: 'About Someone',
        body: ['A single paragraph, which is all this collection warrants.'],
        linksHeading: 'Read next',
        links: [{ href: '/authors/john-donne', label: 'John Donne', note: 'why' }],
        variant: 'author' as const
    }

    test('the links are rendered', () => {
        render(<EditorialIntro {...oneParagraph} />)

        expect(screen.getByRole('link', { name: 'John Donne' })).toHaveAttribute(
            'href', '/authors/john-donne'
        )
    })

    test('and they are in the server-rendered HTML, not fetched on expand', () => {
        const { TextEncoder, TextDecoder } = require('util')
        ;(global as never as Record<string, unknown>).TextEncoder ??= TextEncoder
        ;(global as never as Record<string, unknown>).TextDecoder ??= TextDecoder
        const html = (require('react-dom/server') as typeof import('react-dom/server'))
            .renderToString(<EditorialIntro {...oneParagraph} />)

        expect(html).toContain('/authors/john-donne')
    })

    test('an entry with no links and no second paragraph renders no disclosure', () => {
        // The other direction: the disclosure exists to hold something.
        const { container } = render(<EditorialIntro {...oneParagraph} links={[]} />)

        expect(container.querySelector('details')).toBeNull()
    })
})

describe('the crawler sees it in the server-rendered HTML', () => {
    const { TextEncoder, TextDecoder } = require('util')
    ;(global as never as Record<string, unknown>).TextEncoder ??= TextEncoder
    ;(global as never as Record<string, unknown>).TextDecoder ??= TextDecoder

    const ssr = (node: React.ReactElement) =>
        (require('react-dom/server') as typeof import('react-dom/server')).renderToString(node)

    test('the collapsed half is server-rendered, not fetched on expand', () => {
        const html = ssr(
            <AuthorIntro slug='emily-dickinson' name='Emily Dickinson' authorType='famous' />
        )

        expect(html).toContain('<details')
        expect(html).not.toMatch(/<details[^>]*\sopen/)
        // A distinctive clause from the second paragraph, which is collapsed.
        expect(html).toContain('flat curiosity of a witness')
        expect(html).toContain('/authors/walt-whitman')
    })

    test('an AI persona server-renders nothing at all', () => {
        expect(ssr(<AuthorIntro slug='emily-hart' name='Emily Hart' authorType='ai' />)).toBe('')
    })
})

describe('authorIntro()', () => {
    test('returns null for an unknown slug', () => {
        expect(authorIntro('not-a-poet')).toBeNull()
    })

    test('is not fooled by inherited Object properties', () => {
        expect(authorIntro('constructor')).toBeNull()
        expect(authorIntro('toString')).toBeNull()
    })
})

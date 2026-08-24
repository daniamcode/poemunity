/**
 * ORIGINAL EDITORIAL INTRODUCTIONS FOR THE MOST-REPRESENTED POETS.
 *
 * The author-page counterpart to `genreIntros.ts`, and it exists for the same
 * reason: 97.3% of the poems here are scraped famous ones that cannot outrank
 * their own source, so the pages that CAN rank are the ones carrying text that
 * exists nowhere else (`docs/SEO_AUDIT.md`). Author pages are also the largest
 * group of pages Google currently indexes on this site, which makes them worth
 * improving rather than merely worth having.
 *
 * SCOPE: authors with 11 or more poems here, in three passes — the 40 poets at
 * 30+ (2026-08-18), 63 more at 20–29 (2026-08-21), and 266 more at 11–19
 * (2026-08-24). 408 of the 3,364 authors clear 11 poems; 369 have an entry.
 *
 * ═══ THE THRESHOLD IS NOT THE ONLY FILTER, AND THE OTHER ONE MATTERS MORE ═══
 *
 * 39 authors clear 11 poems and have NO entry, for three separate reasons, and
 * every one of them is deliberate.
 *
 * FIFTEEN ARE AI PERSONAS: `emily-hart` (38 poems), `sadie-monroe` (35),
 * `thomas-walker` (30), `michael-brennan` (28), `maya-torres` (25),
 * `jake-sullivan` (14), `aria-patel` (14), `ruth-caldwell` (13),
 * `sam-rivera` (13), `devon-blake` (13), `marcus-webb` (12),
 * `chloe-frost` (12), `ryan-cole` (11), `grace-okafor` (11) and
 * `zion-parks` (11). They are not people. They get no entry.
 *
 * TWENTY-TWO ARE POETS WHOSE WORK IS NOT KNOWN WELL ENOUGH HERE TO DESCRIBE
 * TRUTHFULLY — mostly minor or very recent figures where the honest options are
 * an invented judgement or nothing, and nothing is correct. A page with no
 * introduction is a supported state; a page with a confident sentence that is
 * not true is the exact "written for search engines" signal this whole effort
 * exists to escape. They are, with their counts: `thomas-bastard` (19),
 * `louise-imogen-guiney` (18), `frank-lima` (15), `j-allyn-rosser` (14),
 * `joyce-sutphen` (14), `mark-rudman` (14), `nate-klug` (13),
 * `david-rivard` (13), `reginald-gibbons` (13), `marjorie-pickthall` (12),
 * `r-t-smith` (12), `rachel-sherwood` (12), `alice-b-fogel` (11),
 * `amy-beeder` (11), `devin-johnston` (11), `jessica-greenbaum` (11),
 * `joel-brouwer` (11), `katie-peterson` (11), `mark-levine` (11),
 * `sandra-simonds` (11), `sophie-jewett` (11) and `stephen-sandy` (11).
 *
 * TWO ARE BLOCKED ON A DATA BUG, not on knowledge. `lord-ron-george-gordon`
 * (19 poems) is Byron with his name mangled by the scrape, and
 * `knight-of-the-white-elephant-of-burmah-william-mcgonagall` (12) is
 * McGonagall carrying a joke title as part of his name. An introduction would
 * name a poet the page itself does not. Fix the names first — see `TODO.md`,
 * where this sits with the `wisawa-szymborska` typo as one transliteration
 * problem.
 *
 * Writing a biography for them would fabricate a human being — asserting in
 * prose the very thing the AI badge, the footer disclosure and the deliberate
 * absence of a `Person` entity in their structured data all exist to deny. It
 * is the same rule as `structuredData.ts`: their pages describe a collection
 * and stay silent about authorship. `authorIntros.test.ts` asserts by slug that
 * none of the fifteen is ever added.
 *
 * Real registered users are excluded by the same logic and a simpler one: this
 * file is editorial commentary about published poets, and inventing a
 * description of a living account-holder is not something to do on their
 * behalf. None currently clears 11 poems in any case — the most any registered
 * user has published here is 8.
 *
 * `anonymous` (82 poems) IS included, and is not a biography — it is a note
 * about what that byline means, which is a genuinely useful thing to explain.
 *
 * ═══ ACCURACY ═══
 *
 * These are claims about REAL PEOPLE, several of them living, which is a higher
 * bar than the genre introductions. The rules followed here:
 *
 *   1. WRITE ABOUT THE WORK, not the life. Biography is where errors hide and
 *      where they do the most damage; the poems are the subject anyway.
 *   2. NO DATES unless they are load-bearing AND certain. A wrong birth year
 *      for a living poet is a factual error about a person, published.
 *   3. NOTHING THAT COULD EMBARRASS A LIVING POET. Several here are alive;
 *      critical judgement is fine, gossip and diagnosis are not.
 *
 * `readNext` slugs are asserted to exist by the test, exactly as `startHere` is
 * in the genre file — and they do the author-to-author internal linking the
 * audit found missing entirely.
 */

export interface ReadNextPoet {
    /** Author page slug. Asserted to exist by the test. */
    slug: string
    name: string
    /** One line on the connection. */
    note: string
}

export interface AuthorIntro {
    /** Paragraphs of original prose. Plain text — no markup. */
    body: string[]
    /** Other poets here worth reading next — the author-to-author link graph. */
    readNext: ReadNextPoet[]
}

export const AUTHOR_INTROS: Record<string, AuthorIntro> = {
    'william-shakespeare': {
        body: [
            'The poems collected here are the sonnets and the shorter verse rather than the plays, and they are a stranger body of work than their fame suggests. The sequence is addressed largely to a young man, turns later to a woman described in terms that mock every convention of praise then available, and spends much of its length arguing with time rather than courting anybody.',
            'What to notice technically: the English sonnet form he used puts its turn late, in a closing couplet, which gives these poems their characteristic shape of an argument built over twelve lines and then snapped shut in two. Sometimes the couplet genuinely resolves what came before. Often it does not, and the mismatch is the point — sonnet 18 promises immortality in its last two lines, and the claim has held.'
        ],
        readNext: [
            { slug: 'john-donne', name: 'John Donne', note: 'The next generation, and far more argumentative.' },
            { slug: 'sir-philip-sidney', name: 'Sir Philip Sidney', note: 'The sonnet sequence Shakespeare was writing after.' },
            { slug: 'ben-jonson', name: 'Ben Jonson', note: 'His contemporary and rival, plainer and more classical.' }
        ]
    },

    anonymous: {
        body: [
            'Not a person. This page collects the poems that reached print without a name attached — traditional ballads, folk songs, hymns, riddles and verse whose authorship was lost, never recorded, or never claimed.',
            'It is worth browsing rather than skipping. The ballads in particular are among the oldest things on this site and their techniques were shaped by memory rather than by the page: heavy repetition, refrains, stock phrases and abrupt cuts between scenes are all features of poems that had to be carried in a head before they could be written down. A great deal of what later poets do deliberately, this material does because it had no choice.'
        ],
        readNext: [
            { slug: 'robert-burns', name: 'Robert Burns', note: 'Collected and reworked Scots songs from this tradition.' },
            { slug: 'samuel-taylor-coleridge', name: 'Samuel Taylor Coleridge', note: 'Wrote a literary ballad in deliberate imitation of them.' },
            { slug: 'alfred-lord-tennyson', name: 'Alfred, Lord Tennyson', note: 'Took the ballad and the old story into Victorian English.' }
        ]
    },

    'alfred-lord-tennyson': {
        body: [
            'The most technically accomplished ear of the Victorian period, and the poet most damaged by his own popularity — the anthology pieces are so familiar that the strangeness of the work is easy to miss.',
            'Read "Ulysses" suspiciously rather than approvingly. It is quoted as an anthem of striving, and it is also a portrait of an old king proposing to abandon his kingdom and his son out of restlessness. "In Memoriam", written over seventeen years after the death of a friend, is the major work: a long sequence of short lyrics in a stanza he made his own, working through grief and doubt in public at a moment when doing so was genuinely risky.'
        ],
        readNext: [
            { slug: 'robert-browning', name: 'Robert Browning', note: 'His great contemporary, and his opposite in method.' },
            { slug: 'matthew-arnold', name: 'Matthew Arnold', note: 'The same Victorian doubt, argued rather than sung.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'What came next: the music kept, the consolation dropped.' }
        ]
    },

    'rae-armantrout': {
        body: [
            'A contemporary American poet and one of the very few living writers heavily represented here. Her poems are short, sectioned, and built out of overheard language — advertising, science reporting, small talk — set against each other so the gaps between the pieces do the work.',
            'They reward a different kind of attention than most of this collection. There is usually no argument to follow and no scene to picture; the method is juxtaposition, and the meaning appears in the join. If a poem seems to change the subject between sections, that is not a lapse — it is the poem.'
        ],
        readNext: [
            { slug: 'john-ashbery', name: 'John Ashbery', note: 'The other pole of difficulty, and much more expansive.' },
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'Also compressed, but funny and rhymed.' },
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'The ancestor: found language, precisely arranged.' }
        ]
    },

    'william-wordsworth': {
        body: [
            'The poet who made the poet\'s own mind a legitimate subject, which is why so much English poetry after him sounds like somebody thinking rather than somebody declaring.',
            'The manifesto is worth knowing: he argued for poetry written in the ordinary language of ordinary people, about ordinary lives, and against the elevated diction that preceded him. He did not always follow his own rule. But "Tintern Abbey" and "The Prelude" do something genuinely new — they describe not a landscape but the process of remembering a landscape, and the difference between the two is the whole Romantic project in miniature.'
        ],
        readNext: [
            { slug: 'samuel-taylor-coleridge', name: 'Samuel Taylor Coleridge', note: 'His collaborator on the book that started it.' },
            { slug: 'john-keats', name: 'John Keats', note: 'The next generation, and warmer.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'The living inheritance of this way of looking.' }
        ]
    },

    'emily-dickinson': {
        body: [
            'Fewer than a dozen of her nearly 1,800 poems appeared in print while she was alive, and those were edited into conventional shape without her consent. Everything unusual about her — the dashes, the slant rhymes, the abrupt capitals, the refusal to close a thought — was treated as error to be corrected for decades afterwards.',
            'Read her for the sentences that stop mid-turn. Her subjects are death, faith, pain and the mind observing itself, and her characteristic move is to report an interior event with the flat curiosity of a witness rather than the distress of a sufferer — a fly in the room at the moment of dying, a funeral held inside a brain. The hymn metres she uses are deliberately ordinary, which makes what she does inside them stranger.'
        ],
        readNext: [
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'Her exact contemporary and total opposite.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'The same decade, the same subjects, formal control.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'Also unpublished in life, also inventing his own prosody.' }
        ]
    },

    'william-butler-yeats': {
        body: [
            'The rare poet who got substantially better after fifty. The early work is dreamy, Celtic and heavily ornamented; the late work is spare, bitter, political and among the greatest in the language. Reading him in chronological order is unlike reading anyone else here.',
            'The turn is visible in "Easter, 1916", written after the Dublin rising, with its refrain that all is changed, changed utterly, and a terrible beauty born — a poem genuinely unsure whether what happened was good, by a man who knew the people executed. The later poems on age, art and Byzantium are where he ends up.'
        ],
        readNext: [
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'The next Irish poet to face the same question.' },
            { slug: 't-s-eliot', name: 'T. S. Eliot', note: 'The other pole of modernism in English.' },
            { slug: 'ezra-pound', name: 'Ezra Pound', note: 'Edited him, and pushed him towards the spare late style.' }
        ]
    },

    'john-ashbery': {
        body: [
            'The most influential and most argued-about American poet of the later twentieth century, and the one most likely to make a reader feel they are doing it wrong. They are not.',
            'His poems move by association rather than argument, change register without warning, and rarely settle into a paraphrasable subject. The productive way in is to stop looking for what a poem is "about" and read for the movement of a mind in language — the tone, which is unmistakable, does more work than the content. "Self-Portrait in a Convex Mirror" is the major long poem and the most conventionally rewarding place to start.'
        ],
        readNext: [
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'His friend and contemporary; far more immediate.' },
            { slug: 'wallace-stevens', name: 'Wallace Stevens', note: 'The clearest ancestor of this kind of difficulty.' },
            { slug: 'rae-armantrout', name: 'Rae Armantrout', note: 'The same refusals, compressed instead of expansive.' }
        ]
    },

    'yusef-komunyakaa': {
        body: [
            'A contemporary American poet best known for work drawn from his service in Vietnam, though the range here is much wider — jazz, the Louisiana of his childhood, and the classical material of his later books.',
            'The war poems are the ones to start with and their method is the lesson: they were written well over a decade after the events, and memory arrives through surfaces and reflections rather than narrative. "Facing It" places the whole subject in the polished granite of a memorial wall, where the speaker\'s face and the names occupy the same plane. The jazz influence is structural rather than decorative — improvisation used as a principle of construction.'
        ],
        readNext: [
            { slug: 'brian-turner', name: 'Brian Turner', note: 'Iraq, by someone who had read these first.' },
            { slug: 'wilfred-owen', name: 'Wilfred Owen', note: 'Where the refusal of consolation begins.' },
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'History assembled from documents and voices.' }
        ]
    },

    'percy-bysshe-shelley': {
        body: [
            'The most politically radical of the major Romantics and the one whose reputation has swung furthest. Victorian editors preferred the ethereal lyric poet; the political writing was suppressed, unpublished for years, or quietly left out.',
            '"The Masque of Anarchy", written in fury after the Peterloo massacre, was not printed until long after his death, and its closing stanza has been borrowed by protest movements ever since. Read it next to "Ode to the West Wind" and "To a Skylark" — the same voice, wanting to be an instrument something larger blows through, applied in one case to weather and in the other to a state.'
        ],
        readNext: [
            { slug: 'william-blake', name: 'William Blake', note: 'The same radicalism, stranger and more private.' },
            { slug: 'john-keats', name: 'John Keats', note: 'His contemporary; sensuous where Shelley is abstract.' },
            { slug: 'william-wordsworth', name: 'William Wordsworth', note: 'The elder Romantic he admired and then attacked.' }
        ]
    },

    'john-donne': {
        body: [
            'The founder of what got called the metaphysical style, and the most argumentative love poet in English. His characteristic poem takes an outrageous proposition and proves it — that two lovers contain the whole world, that a flea has already married them, that death should not be proud.',
            'The device to know is the conceit: an extended comparison between things that have no business being compared, sustained past the point of decoration until it becomes an actual argument. The twin compasses at the end of "A Valediction: Forbidding Mourning" are the famous case. His later religious poems use exactly the same equipment on God, and are more violent than the love poems.'
        ],
        readNext: [
            { slug: 'george-herbert', name: 'George Herbert', note: 'The devotional side of the same tradition, quieter.' },
            { slug: 'andrew-marvell', name: 'Andrew Marvell', note: 'The next generation of the conceit, and wittier.' },
            { slug: 'ben-jonson', name: 'Ben Jonson', note: 'His contemporary and the classical alternative.' }
        ]
    },

    'walt-whitman': {
        body: [
            'He self-published the first edition of "Leaves of Grass", set some of the type himself, printed it without his name on the title page, and then revised and expanded the book for the rest of his life. It is less a collection than a single project he kept rebuilding.',
            'What he invented was a long, unrhymed, unmetered line built on the rhythms of speech and the King James Bible, and a first person large enough to claim it contained multitudes and contradicted itself. Almost all American free verse descends from this. Read the Civil War poems too — he nursed the wounded in Washington hospitals, and the poems from that period are the least rhetorical thing he wrote.'
        ],
        readNext: [
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'His exact contemporary and total opposite.' },
            { slug: 'allen-ginsberg', name: 'Allen Ginsberg', note: 'The most direct inheritor of the long line.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Took the American catalogue and asked who it left out.' }
        ]
    },

    'kay-ryan': {
        body: [
            'A contemporary American poet whose poems are very short, very narrow on the page, and much funnier than their reputation for compression suggests.',
            'The technical signature is internal rhyme — rhymes buried mid-line rather than placed at the ends, so the poem chimes without announcing that it is rhyming. Combined with the thin column shape, this makes her poems read fast and then stop you. They usually work by taking a cliché or a piece of received wisdom literally until it comes apart.'
        ],
        readNext: [
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'The obvious ancestor: precise, dry, syllabic.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Compression and slant rhyme, a century earlier.' },
            { slug: 'rae-armantrout', name: 'Rae Armantrout', note: 'Also short and sectioned, but far less consoling.' }
        ]
    },

    'sir-philip-sidney': {
        body: [
            'An Elizabethan courtier who wrote the first major sonnet sequence in English, "Astrophil and Stella", and largely established what an English sonnet sequence was for.',
            'The opening sonnet is the one to read first: it describes the poet struggling to write, ransacking other people\'s books for phrases, and ending with the instruction to look in his heart and write. That gesture — the poem about failing to write the poem — is now so common it is a cliché, and this is close to where it starts. He also wrote the "Defence of Poesy", the first significant work of literary criticism in English.'
        ],
        readNext: [
            { slug: 'william-shakespeare', name: 'William Shakespeare', note: 'The sequence that answered this one.' },
            { slug: 'edmund-spenser', name: 'Edmund Spenser', note: 'His contemporary, and the other great Elizabethan.' },
            { slug: 'john-donne', name: 'John Donne', note: 'The reaction against all this courtly smoothness.' }
        ]
    },

    'algernon-charles-swinburne': {
        body: [
            'The most sonically extravagant poet in Victorian English and the most divisive — his contemporaries were scandalised by the subject matter and mesmerised by the sound, frequently at the same time.',
            'Read him aloud or you will miss the point entirely. The poems run on relentless metre, heavy alliteration and long rolling lines that carry you past the sense; several critics have complained, not unfairly, that the music sometimes runs ahead of the meaning. He is also a serious classicist, and the Greek material is where the technique is doing the most work.'
        ],
        readNext: [
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The other great Victorian sound-inventor, far denser.' },
            { slug: 'charles-baudelaire', name: 'Charles Baudelaire', note: 'The French scandal Swinburne admired and imported.' },
            { slug: 'alfred-lord-tennyson', name: 'Alfred, Lord Tennyson', note: 'The respectable Victorian ear, for contrast.' }
        ]
    },

    'robert-browning': {
        body: [
            'The inventor, more than anyone, of the dramatic monologue — a poem spoken entirely by a character who is not the poet, and who usually reveals more than they intend.',
            '"My Last Duchess" is the model and the best place to start: a duke shows a visitor a portrait of his previous wife, and in the course of being charming he discloses that he had her killed. Nothing in the poem tells you this; you assemble it from what he says and what he assumes you will not notice. That technique — meaning arriving past the speaker rather than through them — is his major contribution, and it is everywhere in modern poetry and fiction.'
        ],
        readNext: [
            { slug: 'elizabeth-barrett-browning', name: 'Elizabeth Barrett Browning', note: 'His wife, and more famous than him in their lifetime.' },
            { slug: 'alfred-lord-tennyson', name: 'Alfred, Lord Tennyson', note: 'His great rival, and the opposite method.' },
            { slug: 't-s-eliot', name: 'T. S. Eliot', note: 'Prufrock is a dramatic monologue, and knows it.' }
        ]
    },

    'henry-wadsworth-longfellow': {
        body: [
            'The most popular poet in nineteenth-century America by a wide margin, memorised by schoolchildren for generations, and then critically demoted so thoroughly that the demotion is now itself worth questioning.',
            'What he actually did well: narrative at length, in metres that carry a reader forward, on American material at a moment when American poetry was still assumed to be a provincial branch of English. What dates: the moralising, and the habit of ending on an instruction. His most-quoted lines — about rain falling into every life — are better in context than they are as a fridge magnet.'
        ],
        readNext: [
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The American alternative that won the argument.' },
            { slug: 'edgar-allan-poe', name: 'Edgar Allan Poe', note: 'His contemporary, and a hostile critic of him.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Read him; wrote nothing like him.' }
        ]
    },

    'samuel-menashe': {
        body: [
            'An American poet who wrote extremely short poems for decades in near-total obscurity, and received serious recognition only very late in his life.',
            'The poems are often under ten lines and repay slow reading in a way that length usually gets credit for. They are dense with rhyme and half-rhyme, frequently biblical in vocabulary, and built so that removing one word would collapse them. If you read fast you will read past them; this is a body of work that assumes you will stop.'
        ],
        readNext: [
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'The same compression, drier and funnier.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The great precedent for the very short poem.' },
            { slug: 'george-herbert', name: 'George Herbert', note: 'Devotional brevity, four centuries earlier.' }
        ]
    },

    'thomas-hardy': {
        body: [
            'He gave up novels after the hostile reception of "Jude the Obscure" and wrote poetry for the rest of his life — which means the work he is now most valued for as a poet came after sixty.',
            'The subject that produced his best poems is uncomfortable: after his first wife died, following years in which they had largely stopped speaking, he wrote a sequence about her that is full of a guilt no reconciliation was available for. He is technically restless, inventing stanza forms constantly, and deliberately awkward in diction — the roughness is a choice, and it is what keeps the sentiment honest.'
        ],
        readNext: [
            { slug: 'edward-thomas', name: 'Edward Thomas', note: 'The English melancholy, one generation on.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'Named Hardy as the poet who mattered most to him.' },
            { slug: 'a-e-housman', name: 'A. E. Housman', note: 'The same losses, in tighter and colder forms.' }
        ]
    },

    'william-blake': {
        body: [
            'A poet, engraver and printer who produced his books himself — text and images etched together on the same plate and coloured by hand — so the poems were not originally read as text on a page at all.',
            '"Songs of Innocence and of Experience" is the way in, and the design is the argument: paired poems that answer each other, so the lamb has a tiger and the innocent version of a scene has an experienced one. Read the pairs together. His longer prophetic books are a private mythology of his own invention and are genuinely difficult; nobody should feel obliged to start there.'
        ],
        readNext: [
            { slug: 'percy-bysshe-shelley', name: 'Percy Bysshe Shelley', note: 'The same radicalism, made public and political.' },
            { slug: 'william-wordsworth', name: 'William Wordsworth', note: 'His contemporary, and far more respectable.' },
            { slug: 'allen-ginsberg', name: 'Allen Ginsberg', note: 'Claimed Blake directly as an ancestor.' }
        ]
    },

    'dean-young': {
        body: [
            'A contemporary American poet associated with a fast, associative, deliberately funny mode that owes a good deal to Surrealism and to the New York School.',
            'The poems move quickly and change direction without apology, and the comedy is doing serious work rather than lightening it — several of his best pieces are about illness and mortality while remaining genuinely funny on the line. If a poem seems to be going somewhere and then goes somewhere else instead, that is the method rather than a fault in the reading.'
        ],
        readNext: [
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'The New York School voice this descends from.' },
            { slug: 'john-ashbery', name: 'John Ashbery', note: 'The same associative movement, more oblique.' },
            { slug: 'billy-collins', name: 'Billy Collins', note: 'Also funny, and much more orderly about it.' }
        ]
    },

    'robert-herrick': {
        body: [
            'A seventeenth-century clergyman who wrote over a thousand short poems about flowers, festivals, country customs, women\'s clothing and the shortness of everything.',
            'He wrote the most-quoted opening line in English carpe diem verse — gather ye rosebuds while ye may — and the poem it opens is doing something slightly more complicated than the line suggests. The pleasures of reading him are small-scale and cumulative: an ear for the short line, a genuine interest in ordinary rural life, and a habit of noticing textures that most of his contemporaries thought beneath poetry.'
        ],
        readNext: [
            { slug: 'ben-jonson', name: 'Ben Jonson', note: 'His acknowledged master.' },
            { slug: 'andrew-marvell', name: 'Andrew Marvell', note: 'The same argument, made far more strangely.' },
            { slug: 'christopher-marlowe', name: 'Christopher Marlowe', note: 'The pastoral invitation, at its source.' }
        ]
    },

    'w-s-merwin': {
        body: [
            'He abandoned punctuation entirely in the 1960s and never went back, which is the first thing anyone notices and the least interesting thing about him.',
            'The absence of commas and full stops makes the poems read as a single unbroken movement of speech, with the line breaks doing all the work of pacing — it is a formal decision, not a stylistic tic. His enduring subject is loss, and specifically ecological loss: he was writing elegies for species, forests and vanishing languages decades before that was a recognised thing for a poet to do, and he spent his later life restoring rainforest on Maui.'
        ],
        readNext: [
            { slug: 'wendell-berry', name: 'Wendell Berry', note: 'The same commitment, argued from a farm.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'Attention to the non-human, far more consoling.' },
            { slug: 'rainer-maria-rilke', name: 'Rainer Maria Rilke', note: 'Merwin translated widely; this is the register.' }
        ]
    },

    'carl-sandburg': {
        body: [
            'The poet of industrial America, and the one who insisted that stockyards, freight handlers and wage work were legitimate subjects for poetry at a time when that was contested.',
            '"Chicago" is the model and its method is refusal: he lists the accusations against the city — that it is wicked, crooked, brutal — agrees with all of them, and then admires it anyway. He works in Whitman\'s long line and plain American speech, and his weakness is the same as Whitman\'s: at length the catalogue can turn into a list. The short poems, "Fog" especially, show the other gear.'
        ],
        readNext: [
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The line and the catalogue come from here.' },
            { slug: 'philip-levine', name: 'Philip Levine', note: 'The same work, two generations later and closer up.' },
            { slug: 'edgar-lee-masters', name: 'Edgar Lee Masters', note: 'His contemporary; the Midwest from inside a graveyard.' }
        ]
    },

    'edgar-lee-masters': {
        body: [
            'Best known for "Spoon River Anthology", a book of short free-verse epitaphs spoken by the dead of a fictional Midwestern town — each poem a person, and the whole assembling into a portrait of a community.',
            'The pleasure and the point are in the contradictions between them. One resident\'s account of an event is flatly denied by the next; a respected citizen is exposed by somebody buried two pages later. No narrator adjudicates. It was a scandal on publication for exactly that reason, and it remains one of the most readable long American books of the period.'
        ],
        readNext: [
            { slug: 'carl-sandburg', name: 'Carl Sandburg', note: 'The same Midwest, from street level.' },
            { slug: 'robert-browning', name: 'Robert Browning', note: 'The dramatic monologue this technique descends from.' },
            { slug: 'edwin-arlington-robinson', name: 'Edwin Arlington Robinson', note: 'Small-town portraits, formally traditional.' }
        ]
    },

    'kahlil-gibran': {
        body: [
            'A Lebanese-American writer whose book "The Prophet" has never been out of print since publication and has been translated into more than a hundred languages — one of the best-selling books of poetry ever written, and one largely ignored by academic criticism.',
            'The form is aphoristic: short prose-poem addresses on marriage, children, work, joy and sorrow, delivered by a departing sage. Read for what it is rather than what it is not — it is wisdom literature in the older sense, closer to scripture or proverb than to the lyric tradition around it here, and its enormous readership is a fact about it worth taking seriously.'
        ],
        readNext: [
            { slug: 'jalal-al-din-rumi', name: 'Rumi', note: 'The tradition Gibran is closest to.' },
            { slug: 'rabindranath-tagore', name: 'Rabindranath Tagore', note: 'The same moment of Eastern writing in English.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The expansive, unmetered, prophetic voice.' }
        ]
    },

    'jane-hirshfield': {
        body: [
            'A contemporary American poet whose work is shaped by long practice in Zen Buddhism and by extensive translation from classical Japanese — both are visible in the poems without either being announced.',
            'The characteristic gesture is a small, exactly observed physical fact that opens, without commentary, onto something much larger. She resists the closing flourish that most lyric poems reach for, and the restraint is the technique. Her poems on science and on climate are among the few in that mode that avoid both lecture and despair.'
        ],
        readNext: [
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'The same attention, warmer and more instructive.' },
            { slug: 'w-s-merwin', name: 'W. S. Merwin', note: 'Also a translator, also formally quiet.' },
            { slug: 'jack-gilbert', name: 'Jack Gilbert', note: 'Plain American speech doing serious work.' }
        ]
    },

    'w-s-di-piero': {
        body: [
            'A contemporary American poet and essayist whose poems are grounded in cities, working-class immigrant life, and the visual arts — he writes about painting as somebody who has looked at a great deal of it.',
            'The voice is conversational but not casual, and the poems tend to move through a real street or a real picture rather than through an idea. Read him for the texture of place; the Philadelphia and San Francisco material is where the work is most itself.'
        ],
        readNext: [
            { slug: 'philip-levine', name: 'Philip Levine', note: 'Working life as a poetic subject, insisted upon.' },
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'The city walked through, and the art looked at.' },
            { slug: 'william-carlos-williams', name: 'William Carlos Williams', note: 'The American place, plainly rendered.' }
        ]
    },

    'ben-jonson': {
        body: [
            'Shakespeare\'s contemporary, rival, and first serious editor — the tribute he wrote for the First Folio is where the phrase about Shakespeare not being of an age but for all time comes from.',
            'His own poems are the classical alternative to everything Donne was doing at the same moment: balanced, plain, learned, built on Latin models, and suspicious of extravagance. "On My First Son", written after the death of his seven-year-old, is the most affecting thing here precisely because the restraint is total — he calls the boy his best piece of poetry and stops.'
        ],
        readNext: [
            { slug: 'william-shakespeare', name: 'William Shakespeare', note: 'The rival he both mocked and canonised.' },
            { slug: 'john-donne', name: 'John Donne', note: 'The opposite instinct, in the same decade.' },
            { slug: 'robert-herrick', name: 'Robert Herrick', note: 'His self-declared disciple.' }
        ]
    },

    'john-milton': {
        body: [
            'He wrote his major work after going completely blind, dictating it to whoever was available, and the result is the most ambitious poem in English.',
            '"Paradise Lost" is in unrhymed iambic pentameter — a deliberate refusal, argued in a preface, of rhyme as a modern bondage — with sentences that run for a dozen lines and hold their grammar the whole way. The famous problem is that Satan gets the best lines and the strongest characterisation, which readers have been arguing about since Blake said Milton was of the Devil\'s party without knowing it. The shorter poems, including the sonnet on his blindness, are a gentler introduction.'
        ],
        readNext: [
            { slug: 'william-blake', name: 'William Blake', note: 'Read Milton as a rebel, and said so.' },
            { slug: 'edmund-spenser', name: 'Edmund Spenser', note: 'The English epic tradition Milton inherited.' },
            { slug: 'percy-bysshe-shelley', name: 'Percy Bysshe Shelley', note: 'Took Milton\'s Satan as a political model.' }
        ]
    },

    'edmund-spenser': {
        body: [
            'The most ambitious English poet before Milton, and the one who invented a stanza still named after him — eight lines of iambic pentameter closed by a longer ninth, which slows the whole thing down deliberately.',
            '"The Faerie Queene" is enormous, allegorical, deliberately archaic in its language even when it was written, and not a book to start at page one out of duty. The shorter work is the better entry: the "Amoretti" sonnets and "Epithalamion", a wedding poem for his own marriage whose stanza count is built around the hours of a midsummer day.'
        ],
        readNext: [
            { slug: 'sir-philip-sidney', name: 'Sir Philip Sidney', note: 'His contemporary and the other Elizabethan pole.' },
            { slug: 'john-milton', name: 'John Milton', note: 'Called Spenser a better teacher than the theologians.' },
            { slug: 'john-keats', name: 'John Keats', note: 'Learned his craft by imitating Spenser directly.' }
        ]
    },

    'billy-collins': {
        body: [
            'Probably the most widely read living American poet, and the one most often used to argue about whether accessibility is a virtue. The poems are conversational, funny, and structured so that a reader is never lost.',
            'The method is consistent and worth watching: begin in a completely ordinary situation — a room, a piece of music, a task — proceed calmly, and then swerve somewhere much stranger or sadder in the last few lines without raising his voice. "Introduction to Poetry", about students tying a poem to a chair to beat a confession out of it, is the one most likely to be handed to you in a classroom.'
        ],
        readNext: [
            { slug: 'dorothy-parker', name: 'Dorothy Parker', note: 'The other tradition of the late-landing joke.' },
            { slug: 'ted-kooser', name: 'Ted Kooser', note: 'The same plainness, without the punchline.' },
            { slug: 'dean-young', name: 'Dean Young', note: 'Funny too, and far less orderly.' }
        ]
    },

    'samuel-taylor-coleridge': {
        body: [
            'Half of the partnership that started English Romanticism, and the one who did the theorising — his distinction between imagination and mere fancy is the philosophical backbone of the whole movement.',
            'Three poems carry his reputation: "The Rime of the Ancient Mariner", a deliberate literary imitation of the old ballads; "Kubla Khan", published with a preface claiming it was composed in an opium sleep and interrupted by a visitor from Porlock, a story that does literary work whether or not it is true; and "Frost at Midnight", the quietest and possibly the best, a father talking to a sleeping baby by a dying fire.'
        ],
        readNext: [
            { slug: 'william-wordsworth', name: 'William Wordsworth', note: 'His collaborator and the other half of the project.' },
            { slug: 'john-keats', name: 'John Keats', note: 'The next generation, and the better ear.' },
            { slug: 'william-blake', name: 'William Blake', note: 'Imagination as an absolute claim, not a theory.' }
        ]
    },

    'john-keats': {
        body: [
            'He wrote almost everything he is known for in a single extraordinary year, and died at twenty-five having been savaged by reviewers who thought him socially beneath the art.',
            'The odes are the achievement, and the useful thing to know about them is that they are arguments rather than raptures — "Ode on a Grecian Urn" ends on a proposition about beauty and truth that the poem may or may not endorse and has been fought over for two centuries. His concept of negative capability, the capacity to remain in uncertainty without irritably reaching after fact, is as good a description of what poems do as anyone has managed.'
        ],
        readNext: [
            { slug: 'percy-bysshe-shelley', name: 'Percy Bysshe Shelley', note: 'His contemporary; wrote the elegy for him.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The next great inventor of English sound.' },
            { slug: 'wallace-stevens', name: 'Wallace Stevens', note: 'The ode as philosophical argument, continued.' }
        ]
    },

    'gwendolyn-brooks': {
        body: [
            'The first Black author to win the Pulitzer Prize for poetry, and a poet whose career contains one of the most instructive turns in American literature.',
            'Her early work is formally immaculate — sonnets, ballads, technically exacting — and it is superb. After 1967 she deliberately broke with that mode, publishing with Black-owned presses and writing in a rawer, more direct register aimed at a different readership. Reading the early and late work together is the single most useful hour available on this site. "We Real Cool" sits between them: eight lines, seven pool players, and everything carried by where the word "we" falls.'
        ],
        readNext: [
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Encouraged her early; the tradition she came from.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'The next generation of the same compression.' },
            { slug: 'sonia-sanchez', name: 'Sonia Sanchez', note: 'The movement Brooks turned towards after 1967.' }
        ]
    },

    'frank-stanford': {
        body: [
            'An American poet who died at twenty-nine, wrote prolifically, and remains a cult figure whose influence on later poets far exceeds his general readership.',
            'The work is surreal, violent, drenched in the rural South and the Mississippi delta, and full of images that do not resolve into sense so much as accumulate. His enormous book-length poem is famously unpunctuated and near-endless. Start with the shorter poems; the voice arrives immediately, and either it takes or it does not.'
        ],
        readNext: [
            { slug: 'james-wright', name: 'James Wright', note: 'American rural surrealism, more controlled.' },
            { slug: 'yusef-komunyakaa', name: 'Yusef Komunyakaa', note: 'The Southern landscape, differently haunted.' },
            { slug: 'charles-bukowski', name: 'Charles Bukowski', note: 'The other outsider mode, flatter and drier.' }
        ]
    },

    'george-herbert': {
        body: [
            'A country parson whose entire book of poems was published only after his death, on his instruction that it should be printed if it might help any dejected soul and burned otherwise.',
            'They are devotional poems that mostly consist of losing arguments with God. "The Collar" is a tantrum of forty lines that ends with a single word spoken from outside it; "Prayer" is a sonnet containing no verb at all, defining its subject through a cascade of images before settling on the phrase "something understood". He also wrote shaped poems — an altar, a pair of wings — where the form on the page is part of the meaning.'
        ],
        readNext: [
            { slug: 'john-donne', name: 'John Donne', note: 'A friend of the family, and the louder version.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The same argument, two centuries on and fiercer.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'Devotional plainness, and equally controlled.' }
        ]
    },

    'christina-rossetti': {
        body: [
            'A Victorian poet of unusual technical range, capable of a poem sung in churches every December and, in the same career, one of the strangest narrative poems of the century.',
            '"Goblin Market" is that poem: two sisters, forbidden fruit sold by goblin men, and a rescue that has been read as religious allegory, sexual parable and a plain story about sisterhood, without any reading exhausting it. Her shorter lyrics are the other half of her — formally exact, unsentimental about death, and in "Remember" generous enough to withdraw their own request halfway through.'
        ],
        readNext: [
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The same decade and subjects, across an ocean.' },
            { slug: 'elizabeth-barrett-browning', name: 'Elizabeth Barrett Browning', note: 'The other major Victorian woman poet.' },
            { slug: 'george-herbert', name: 'George Herbert', note: 'The devotional tradition she is working in.' }
        ]
    },

    'alice-notley': {
        body: [
            'A contemporary American poet with one of the longest and least compromising careers in the second-generation New York School and well beyond it.',
            'Her work is formally restless — book-length narrative poems, invented punctuation, quotation marks used as a rhythmic device rather than to report speech — and unusually willing to be difficult. "The Descent of Alette", an epic set on a subway, is the most-discussed. She writes about grief, war and being a woman writing at length in a tradition that mostly did not make room for that.'
        ],
        readNext: [
            { slug: 'john-ashbery', name: 'John Ashbery', note: 'The New York School she came out of.' },
            { slug: 'rae-armantrout', name: 'Rae Armantrout', note: 'The other end of contemporary difficulty.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'The long poem rebuilt from classical material.' }
        ]
    },

    'david-ferry': {
        body: [
            'A poet and translator whose own work and whose translations are hard to separate — he translated Virgil, Horace and Gilgamesh, and his versions read as poems rather than as cribs.',
            'The original poems are quiet, formally traditional and preoccupied with distance: from the dead, from other people, from the past being translated. He was still publishing major work in his nineties, and the late books are the ones to start with — the plainness there is earned rather than chosen.'
        ],
        readNext: [
            { slug: 'w-s-merwin', name: 'W. S. Merwin', note: 'Also a major translator, also elegiac.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'Translation and original work in the same breath.' },
            { slug: 'stanley-kunitz', name: 'Stanley Kunitz', note: 'The other great late career on this site.' }
        ]
    },

    'robert-creeley': {
        body: [
            'The poems are short, the lines are shorter, and the line breaks fall in places no speaker would pause — mid-phrase, after an article, between a verb and its object. That is the whole method, and it is not decoration: breaking against the syntax forces attention onto the hesitations of thinking rather than onto the finished thought.',
            'He came out of Black Mountain and stayed with the same materials for decades — love, marriage, drinking, being in a room with somebody. "I Know a Man" is the poem everybody quotes, and it earns it: four stanzas, a friend addressed by the wrong name, and a swerve in the last line that is funny and frightening at once.'
        ],
        readNext: [
            { slug: 'charles-olson', name: 'Charles Olson', note: 'The Black Mountain theorist he worked alongside.' },
            { slug: 'robert-duncan', name: 'Robert Duncan', note: 'The third of that group, and the most mythic.' },
            { slug: 'william-carlos-williams', name: 'William Carlos Williams', note: 'The measure both of them were arguing from.' }
        ]
    },

    'sir-thomas-wyatt': {
        body: [
            'The sonnet enters English here. Wyatt translated Petrarch at the court of Henry VIII, and what he brought back was not only a form but a stance — the lover as somebody watching his own position deteriorate.',
            'His metre has been argued about for four centuries. Editors once smoothed his lines into regularity on the assumption that he could not count; the modern view is that the roughness is his, and that the poems move by speech stress rather than by a syllable count borrowed from Italian. "They flee from me" is the place to test that: read aloud, its famous stanzas are perfectly balanced, and on the page they scan badly. The court poems are also poems about danger, written by a man who was imprisoned more than once.'
        ],
        readNext: [
            { slug: 'henry-howard-earl-of-surrey', name: 'Henry Howard, Earl of Surrey', note: 'His contemporary, who smoothed the line Wyatt roughened.' },
            { slug: 'sir-philip-sidney', name: 'Sir Philip Sidney', note: 'The next generation, and the first great English sequence.' },
            { slug: 'john-donne', name: 'John Donne', note: 'Where the speaking voice finally overruns the metre entirely.' }
        ]
    },

    'a-e-stallings': {
        body: [
            'A contemporary poet working almost entirely in rhyme and metre, which in her hands is not a period costume — the forms carry current material, and the rhymes are frequently the joke or the wound.',
            'Classical myth runs through the work, handled as household business rather than as reference: Persephone, Eurydice and Penelope turn up doing ordinary things. She is also a translator from Greek and Latin, and the translations and the original poems inform each other; a poet who has carried Lucretius across in rhyming verse has thought harder than most about what a line can be made to hold.'
        ],
        readNext: [
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'The other great contemporary case for rhyme.' },
            { slug: 'rhina-p-espaillat', name: 'Rhina P. Espaillat', note: 'Formal verse across two languages.' },
            { slug: 'marilyn-hacker', name: 'Marilyn Hacker', note: 'Strict forms turned to entirely modern ends.' }
        ]
    },

    'edward-thomas': {
        body: [
            'Almost all of it was written in about two years. He was a prose writer and reviewer for most of his working life, began writing poems in his late thirties after Robert Frost told him his prose already was poetry, and was killed in France in 1917.',
            'The poems are quiet to the point of seeming to be about nothing — a road, a bird, a name on a signpost, a station where the train stopped for no reason. "Adlestrop" is the famous one and is exactly that. What holds them is an undertow of unease that never resolves into statement; the war is rarely mentioned and is everywhere in the pacing.'
        ],
        readNext: [
            { slug: 'robert-frost', name: 'Robert Frost', note: 'The friend who told him to write them.' },
            { slug: 'ivor-gurney', name: 'Ivor Gurney', note: 'The same war, the same English landscape, less composed.' },
            { slug: 'walter-de-la-mare', name: 'Walter de la Mare', note: 'His contemporary in quiet English strangeness.' }
        ]
    },

    'rita-dove': {
        body: [
            'Her best-known book tells the story of her grandparents twice — once from his side, once from hers — in short poems that never explain themselves and never join up into a novel. The gaps between them are the form.',
            'That is characteristic: she works in sequences, uses history as material rather than as subject, and keeps the individual poem small and hard. Elsewhere the range is wide — a verse drama out of Greek tragedy, a book about ballroom dance and the twentieth century, poems about Rosa Parks and about a Black violin virtuoso in Beethoven\'s Vienna. She has served as United States Poet Laureate.'
        ],
        readNext: [
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'History assembled from voices and documents.' },
            { slug: 'natasha-trethewey', name: 'Natasha Trethewey', note: 'The next generation of the historical sequence.' },
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'The formal ancestor of much of this.' }
        ]
    },

    'robert-frost': {
        body: [
            'The most misquoted poet in English. The roads poem is about the story the speaker plans to tell later, not about taking the brave path; the woods are lovely and the poem does not stop there. Read straight, the work is far colder than its reputation as rural consolation.',
            'Technically he is doing something unusual: blank verse and rhymed stanzas carrying the rhythms of New England speech, so the metre is audible and the sentence sounds spoken at the same time. He called it the sound of sense. The long dramatic poems — a couple arguing on a staircase, a hired man come back to die — are where the method is most obviously at work and are much less read than the anthology pieces.'
        ],
        readNext: [
            { slug: 'edward-thomas', name: 'Edward Thomas', note: 'The friend he turned into a poet.' },
            { slug: 'edwin-arlington-robinson', name: 'Edwin Arlington Robinson', note: 'The New England portrait poem before him.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'The same refusal of comfort, in an older key.' }
        ]
    },

    'matthew-arnold': {
        body: [
            'A poet of the withdrawal of belief, and honest enough to admit he had nothing to put in its place. "Dover Beach" states the position in thirty-seven lines: the sea, the retreating roar, and two people told to be true to one another because nothing else is reliable.',
            'He wrote most of the poetry early and spent his later career as a critic and school inspector, which shows in the verse — it argues, it defines, it worries at a position rather than singing it. That makes him the least musical of the major Victorians and the most quotable. The elegies, particularly the ones for Oxford and for lost friends, are where the argument finally admits feeling.'
        ],
        readNext: [
            { slug: 'arthur-hugh-clough', name: 'Arthur Hugh Clough', note: 'His friend, and the subject of his best elegy.' },
            { slug: 'alfred-lord-tennyson', name: 'Alfred, Lord Tennyson', note: 'The same doubt, sung rather than argued.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'What is left when the argument is finished.' }
        ]
    },

    'mother-goose': {
        body: [
            'Not a person. The name is a publishing convention that has collected several centuries of English nursery rhyme, counting-out verse, riddles and street song, most of it anonymous and much of it older than any book it appears in.',
            'It is worth reading as verse rather than only as material for children. These are poems built for the ear and the body — strong stress, heavy rhyme, refrain, nonsense syllables that exist purely to keep time — because they survived by being memorised and chanted rather than by being printed. A good many are fragments of something longer that has gone. The oddity of the imagery is a side effect of that transmission, not an attempt at whimsy.'
        ],
        readNext: [
            { slug: 'edward-lear', name: 'Edward Lear', note: 'Nonsense written on purpose, by one author.' },
            { slug: 'lewis-carroll', name: 'Lewis Carroll', note: 'The same nonsense with a logician behind it.' },
            { slug: 'robert-louis-stevenson', name: 'Robert Louis Stevenson', note: 'Poems for children with an author\'s signature.' }
        ]
    },

    'amy-lowell': {
        body: [
            'She arrived after Imagism had been declared and effectively took over its publicity, which cost her a reputation with the group\'s founders and won the movement its American readership. The poems themselves are less doctrinaire than the argument around them suggests.',
            'Two things to notice: the free verse is genuinely cadenced rather than merely unrhymed, and she also wrote what she called polyphonic prose — paragraph-shaped pieces that use rhyme and refrain internally. "Patterns", her most anthologised poem, is a war poem disguised as a garden walk, and its stiff brocade and gravel paths do the whole argument without ever raising its voice.'
        ],
        readNext: [
            { slug: 'h-d', name: 'H. D.', note: 'Imagism at its purest and most austere.' },
            { slug: 'ezra-pound', name: 'Ezra Pound', note: 'Who named the movement and then abandoned it to her.' },
            { slug: 'richard-aldington', name: 'Richard Aldington', note: 'The third Imagist, and the most classical.' }
        ]
    },

    'elizabeth-barrett-browning': {
        body: [
            'She was by some distance the more famous of the two Brownings in their lifetime, and was seriously proposed for the Laureateship. The love sonnets are what survives in general memory, and they are better than their most-quoted line suggests — a sequence about being addressed by somebody whose regard you cannot quite believe.',
            'The larger achievement is "Aurora Leigh", a novel in blank verse about a woman trying to be a poet and to earn money, which takes on prostitution, class and marriage at a length no Victorian poem by a woman was supposed to. She also wrote directly political verse against child labour and slavery, which was controversial and was meant to be.'
        ],
        readNext: [
            { slug: 'robert-browning', name: 'Robert Browning', note: 'Her husband, and the opposite method.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'The next Victorian woman to work at this level.' },
            { slug: 'alfred-lord-tennyson', name: 'Alfred, Lord Tennyson', note: 'The verse novel he attempted in the same decade.' }
        ]
    },

    'louise-glck': {
        body: [
            'Austere, unhurried and almost entirely without ornament. The vocabulary is plain, the sentences are short, and the effect is of somebody stating a difficult thing exactly once and declining to soften it.',
            'The books are conceived whole rather than collected, and several of them speak through borrowed mouths — the flowers of a New England garden answering a gardener and a god in one book, Odysseus and Penelope carrying a modern marriage in another, Persephone in a third. Myth is used here as a way of not writing autobiography while writing it. She received the Nobel Prize in Literature in 2020.'
        ],
        readNext: [
            { slug: 'jorie-graham', name: 'Jorie Graham', note: 'The same generation, and far more expansive.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'Classical material put to contemporary use.' },
            { slug: 'mark-strand', name: 'Mark Strand', note: 'The other great flat, plain American voice.' }
        ]
    },

    'wallace-stevens': {
        body: [
            'One subject, worked at for forty years: what the mind adds to the world, and whether anything is left when it stops. The early poems dress the argument in tropical colour and comic titles; the late ones state it almost bare.',
            'He is the great American poet of abstraction who is nonetheless full of things — ice cream, a jar in Tennessee, a blackbird, a woman in a peignoir eating oranges on a Sunday morning. The blank verse is superb and easy to miss because the diction is so odd. Start with the shorter poems, which are jokes with a metaphysics inside them, before the long meditations that make up the last decade of the work.'
        ],
        readNext: [
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'His contemporary, and precise where he is grand.' },
            { slug: 'john-ashbery', name: 'John Ashbery', note: 'The clearest inheritor of this kind of difficulty.' },
            { slug: 'hart-crane', name: 'Hart Crane', note: 'The other pole of American high style.' }
        ]
    },

    'gottfried-benn': {
        body: [
            'A German poet, read here in translation, who began with a small book of poems set in a morgue. He worked as a doctor, and the early work uses clinical detachment as a poetic instrument — bodies described with the flat accuracy of a report, which is precisely what makes them unbearable.',
            'The later poems are something else entirely: short, static, resigned, built around the idea that a poem is one of the few things a person can still make. He is a difficult figure historically, having briefly and publicly welcomed the Nazi regime before being silenced by it, and any honest reading of the work has to carry that. What survives is the sound — a hard, clipped, unmusical German that translators struggle to reproduce.'
        ],
        readNext: [
            { slug: 'paul-celan', name: 'Paul Celan', note: 'The German language after what Benn lived through.' },
            { slug: 'rainer-maria-rilke', name: 'Rainer Maria Rilke', note: 'The high style Benn was writing against.' },
            { slug: 'bertolt-brecht', name: 'Bertolt Brecht', note: 'The exact political opposite, in the same language.' }
        ]
    },

    'ange-mlinko': {
        body: [
            'A contemporary poet with an unusually rich vocabulary and an ear tuned to the sound of a word before its usefulness. The poems move by association and by pun, and they are frequently about places — the Gulf coast, the Mediterranean, Beirut — observed by somebody who is not from there.',
            'The difficulty is worth naming. She does not build a poem around a single explainable occasion; she lets botany, myth, weather reports and domestic life sit in the same stanza and trusts the reader to feel the pressure between them. Read for texture rather than for message, and the poems open quickly.'
        ],
        readNext: [
            { slug: 'john-ashbery', name: 'John Ashbery', note: 'The permission behind much of this.' },
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'The ancestor of the precise, exotic noun.' },
            { slug: 'brenda-shaughnessy', name: 'Brenda Shaughnessy', note: 'Her contemporary, and more nakedly personal.' }
        ]
    },

    'howard-nemerov': {
        body: [
            'A formalist with a dry, sceptical intelligence, who wrote a great deal about weather, windows, trees and the act of looking, and who was funny in a way that formal poets of his generation often were not.',
            'The characteristic poem sets up an observation, turns it philosophical, and then undercuts the philosophy before it can congeal. He wrote fiction and criticism as well, and served as United States Poet Laureate. The epigrams and light verse are not a sideline — they are the same instrument at a shorter setting, and several of them are among the best short poems of the mid-century.'
        ],
        readNext: [
            { slug: 'richard-wilbur', name: 'Richard Wilbur', note: 'The same formal generation, more lyrical.' },
            { slug: 'anthony-hecht', name: 'Anthony Hecht', note: 'Formal verse turned on much darker material.' },
            { slug: 'john-hollander', name: 'John Hollander', note: 'The other great scholar-poet of that group.' }
        ]
    },

    'andrew-marvell': {
        body: [
            'The metaphysical conceit at its most controlled. Where Donne argues, Marvell balances — the poems set two positions against each other with such symmetry that it can be genuinely unclear which side the poem is on, and that ambiguity appears to be deliberate.',
            '"To His Coy Mistress" is the famous one, and its syllogism is a joke about how far logic can be pushed in the service of persuasion. But the garden poems are the strange ones: green shade, a soul sitting in a tree like a bird, a mower in love with a field. He wrote political verse under two opposed regimes, and the tact required to survive that is visible in the poems.'
        ],
        readNext: [
            { slug: 'john-donne', name: 'John Donne', note: 'The generation before, and far noisier.' },
            { slug: 'george-herbert', name: 'George Herbert', note: 'The devotional branch of the same tradition.' },
            { slug: 'henry-vaughan', name: 'Henry Vaughan', note: 'The mystic of that group, and the closest to the garden poems.' }
        ]
    },

    'lucille-clifton': {
        body: [
            'Short poems, lower case, no wasted syllable, and an authority that has nothing to do with volume. She wrote about the body — pregnancy, illness, ageing, a specific woman\'s specific hips — at a time when that was still treated as a minor subject.',
            'Two threads run through the work: family history reaching back to an enslaved ancestor named in the poems, and a set of biblical retellings that hand the story to whoever was standing off to the side. The plainness is deceptive; the line breaks are doing a great deal of the work, and the poems reward being read aloud slowly.'
        ],
        readNext: [
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'The elder who championed her, and the formal counterweight.' },
            { slug: 'sonia-sanchez', name: 'Sonia Sanchez', note: 'The same era, more overtly political.' },
            { slug: 'june-jordan', name: 'June Jordan', note: 'Contemporary, and the essayist\'s directness.' }
        ]
    },

    'william-carlos-williams': {
        body: [
            'He practised medicine full time and wrote between patients, which is not biographical colour: the poems are short because his working day was, and they attend to whatever was in front of him — a wheelbarrow, plums in an icebox, a fire engine, a woman eating a plum on the street.',
            'The argument he spent a career making is that American poetry needed an American measure, taken from the way people actually speak rather than from English metre. The short-lined poems are the experiment. "Spring and All" mixes them with prose manifesto and is the book to read whole. His late poems, in the stepped triadic line, are the most moving and the least like anyone else.'
        ],
        readNext: [
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'His friend, and the other pole of American precision.' },
            { slug: 'george-oppen', name: 'George Oppen', note: 'The Objectivists who took the lesson furthest.' },
            { slug: 'denise-levertov', name: 'Denise Levertov', note: 'The poet he most directly handed the measure to.' }
        ]
    },

    'denise-levertov': {
        body: [
            'She came to the United States from England already publishing, and changed her ear completely once she arrived — the early poems are lush and British, the mature ones are American, spare and attentive to breath.',
            'Her term for what she was after was organic form: not free verse as the absence of rules but a shape discovered in the making of each particular poem. The later work turns political under the pressure of the Vietnam war, and the poems from that period argue with themselves about whether a lyric poet can write usefully about atrocity. That argument is more interesting than most of the answers other poets gave.'
        ],
        readNext: [
            { slug: 'robert-duncan', name: 'Robert Duncan', note: 'Her closest correspondent, until the war split them.' },
            { slug: 'william-carlos-williams', name: 'William Carlos Williams', note: 'The measure she Americanised her line on.' },
            { slug: 'h-d', name: 'H. D.', note: 'The elder she read as a permission for myth.' }
        ]
    },

    'randall-mann': {
        body: [
            'Contemporary formal verse put to distinctly unromantic use. The poems rhyme, use villanelles and sestinas without apology, and are frequently about desire, work, San Francisco and the specific unglamorous textures of gay life in a city that has been written about mostly in myth.',
            'The wit is the point of entry and the discipline is what makes it land — a rhyme arriving on the wrong word turns a joke cruel, and he does that constantly. He is one of the strongest arguments available that form is not a conservative choice.'
        ],
        readNext: [
            { slug: 'thom-gunn', name: 'Thom Gunn', note: 'The San Francisco predecessor, formal and unsentimental.' },
            { slug: 'd-a-powell', name: 'D. A. Powell', note: 'The same city and subject, in long lines.' },
            { slug: 'carl-phillips', name: 'Carl Phillips', note: 'Desire handled as a syntactic problem.' }
        ]
    },

    'roddy-lumsden': {
        body: [
            'A Scottish poet of enormous verbal appetite — lists, obscure nouns, slang, trivia and formal games all pressed into short poems that move fast and rarely explain themselves.',
            'He was also, unusually, a central figure as an editor and anthologist, and a generation of younger British poets came into print through work he selected. The poems are best read a few at a time; the density is deliberate and the effect flattens if you read them in bulk. Underneath the wordplay there is a persistent melancholy that the surface is designed to outrun.'
        ],
        readNext: [
            { slug: 'don-paterson', name: 'Don Paterson', note: 'The other major Scottish poet of that moment.' },
            { slug: 'carol-ann-duffy', name: 'Carol Ann Duffy', note: 'The generation just ahead, and more direct.' },
            { slug: 'simon-armitage', name: 'Simon Armitage', note: 'Contemporary British verse at its most colloquial.' }
        ]
    },

    'rudyard-kipling': {
        body: [
            'Technically he is one of the most accomplished versifiers in English, and politically he is the most compromised major poet of his period — an unembarrassed poet of empire whose worst poems are propaganda for it. Both statements are true and neither cancels the other.',
            'What he could do: ballad and music-hall metres handled with total confidence, dialect that scans, refrains that lodge in the memory permanently, and a real ear for the speech of soldiers whose officers did not write poems about them. The late work, after his son was killed in the First World War, includes short epitaphs of extraordinary bitterness that read as a repudiation of everything the early recruiting verse promised.'
        ],
        readNext: [
            { slug: 'a-e-housman', name: 'A. E. Housman', note: 'The same doomed young soldiers, in a colder register.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'The English contemporary who never bought the empire.' },
            { slug: 'robert-louis-stevenson', name: 'Robert Louis Stevenson', note: 'The other great late-Victorian storyteller in verse.' }
        ]
    },

    'james-galvin': {
        body: [
            'A poet of the high country along the Wyoming and Colorado line, written from inside the work of it rather than from a viewpoint. Fences, weather, horses and water rights are the furniture, and none of it is picturesque.',
            'The poems are elliptical in a way that mountain plainness does not lead you to expect — they cut between images without transition, drop the connective sentence, and end before the summary. That combination of hard physical detail and withheld explanation is the signature. His prose book about a single piece of land is the best entry point to what the poems assume you already know.'
        ],
        readNext: [
            { slug: 'c-d-wright', name: 'C. D. Wright', note: 'The same ellipsis, applied to the American South.' },
            { slug: 'frank-stanford', name: 'Frank Stanford', note: 'The other end of that American strangeness.' },
            { slug: 'jim-harrison', name: 'Jim Harrison', note: 'Landscape and appetite in the same breath.' }
        ]
    },

    'tom-sleigh': {
        body: [
            'A poet who has also worked as a journalist in war zones and refugee camps, and the two practices press on each other: the poems carry reported detail that a purely literary imagination would not have invented, and they are careful about the ethics of using it.',
            'The line is long and syntactically involved, closer to classical verse than to reportage, and the classical reading is explicit — Homeric and Greek material surfaces beside Mogadishu and Beirut without being used to ennoble anything. What he is testing is whether the old forms can hold contemporary atrocity without turning it into literature. He does not always claim they can.'
        ],
        readNext: [
            { slug: 'yusef-komunyakaa', name: 'Yusef Komunyakaa', note: 'War written from inside it.' },
            { slug: 'carolyn-forch', name: 'Carolyn Forché', note: 'The poetry of witness, and the argument about it.' },
            { slug: 'david-ferry', name: 'David Ferry', note: 'The classical material handled as living poetry.' }
        ]
    },

    'd-a-powell': {
        body: [
            'Very long lines, often running the full width of the page, built out of camp, song lyrics, pastoral convention and the vocabulary of illness. The early trilogy is one of the essential American records of the AIDS epidemic, and it is funnier than that description allows.',
            'The technique is worth watching: he sets a pop refrain or a nursery cadence next to a clinical fact so that the sweetness curdles in the same line. The later books turn to California agriculture, pesticides and the same landscape\'s poisons, which is the pastoral tradition doing what it was always supposed to do and rarely does.'
        ],
        readNext: [
            { slug: 'mark-doty', name: 'Mark Doty', note: 'The same epidemic, in a more lyrical register.' },
            { slug: 'carl-phillips', name: 'Carl Phillips', note: 'Desire, syntax and restraint.' },
            { slug: 'randall-mann', name: 'Randall Mann', note: 'The formalist working the same city.' }
        ]
    },

    'robert-burns': {
        body: [
            'He wrote in Scots at a moment when educated opinion held that Scots was something to be trained out of a writer, and the choice is the whole achievement — the language carries a register of tenderness and mockery that his English poems, which he also wrote, simply do not reach.',
            'A large part of the work is song: he collected, repaired and rewrote traditional Scottish material, and the line between what he found and what he made is often impossible to draw. That is why so much of it feels anonymous in the best sense. The satires are sharper than the sentimental reputation suggests, particularly the ones aimed at the pious.'
        ],
        readNext: [
            { slug: 'william-blake', name: 'William Blake', note: 'His exact contemporary in radical simplicity.' },
            { slug: 'john-clare', name: 'John Clare', note: 'The other great vernacular poet of rural life.' },
            { slug: 'robert-louis-stevenson', name: 'Robert Louis Stevenson', note: 'Scots and English in one writer, a century later.' }
        ]
    },

    'gerald-stern': {
        body: [
            'Long, breathless, exclamatory lines that start mid-thought and accumulate — an ecstatic mode that American poetry mostly abandoned after Whitman and that he revived without irony.',
            'The subjects are Jewish immigrant memory, birds, roadside weeds, dead animals, and a persistent refusal to let anything be discarded without being mourned. He came to wide attention late, with a book written in his fifties, and the whole body of work has the energy of somebody who has decided he has no time to be careful. The poems are elegies that behave like celebrations.'
        ],
        readNext: [
            { slug: 'philip-levine', name: 'Philip Levine', note: 'The same generation, working-class and plainer.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The line he is reopening.' },
            { slug: 'allen-ginsberg', name: 'Allen Ginsberg', note: 'The other twentieth-century inheritor of that breath.' }
        ]
    },

    'gertrude-stein': {
        body: [
            'She is not difficult in the way that allusive poetry is difficult — there is nothing to look up. The difficulty is that the sentences do not do what sentences do: reference is suspended, repetition replaces development, and grammar becomes the material rather than the vehicle.',
            '"Tender Buttons" describes objects, food and rooms in language that refuses to describe, and reads as either nonsense or a genuine attempt to write what looking is like before naming arrives. Read it aloud and the comedy comes through immediately. Her influence is enormous and mostly indirect: almost every later poet who treats syntax as something to be worked rather than obeyed is downstream of this.'
        ],
        readNext: [
            { slug: 'mina-loy', name: 'Mina Loy', note: 'The same modernist moment, more savage.' },
            { slug: 'e-e-cummings', name: 'E. E. Cummings', note: 'Grammar broken in the opposite direction.' },
            { slug: 'harryette-mullen', name: 'Harryette Mullen', note: 'The contemporary poet closest to "Tender Buttons".' }
        ]
    },

    'charles-reznikoff': {
        body: [
            'The quietest of the Objectivists and the most radical in method. The short city poems are almost nothing — a girder, a tree in a yard, a woman on a stoop — set down without comment, on the theory that the thing seen accurately does not need help.',
            'His largest work takes that principle to its limit: hundreds of pages of verse made entirely out of American court records, the language of testimony broken into lines and otherwise unaltered. There is no authorial voice at all, and the result is devastating. It is the founding document of documentary poetry, and nothing since has surpassed its nerve.'
        ],
        readNext: [
            { slug: 'george-oppen', name: 'George Oppen', note: 'The Objectivist who most valued him.' },
            { slug: 'carl-rakosi', name: 'Carl Rakosi', note: 'The third of that group.' },
            { slug: 'william-carlos-williams', name: 'William Carlos Williams', note: 'The elder they all measured against.' }
        ]
    },

    'christian-wiman': {
        body: [
            'A religious poet in a period that has few, and one whose faith is argued rather than assumed — the poems are full of doubt, physical pain and a God addressed with something close to hostility.',
            'The verse is dense and heavily sounded, with internal rhyme and consonantal clatter doing much of the work, which keeps the devotional material from going soft. He edited Poetry magazine for a decade and writes prose about belief and illness that reads as the same argument in another form. Start with the shorter lyrics; the long poems assume you have accepted the terms.'
        ],
        readNext: [
            { slug: 'george-herbert', name: 'George Herbert', note: 'The tradition he is consciously writing inside.' },
            { slug: 'franz-wright', name: 'Franz Wright', note: 'Contemporary faith written from further down.' },
            { slug: 'scott-cairns', name: 'Scott Cairns', note: 'The other serious contemporary devotional poet here.' }
        ]
    },

    'william-matthews': {
        body: [
            'Conversational, urbane and very fast — the poems talk their way toward a perception rather than announcing one, and the good ones arrive somewhere the opening sentence could not have predicted.',
            'Jazz is the recurring subject and also the model: he wrote about Mingus and Bud Powell repeatedly, and the poems improvise over a stated figure in much the same way. The wit is constant and can disguise how sad the work is. Alongside those he wrote a long run of poems about food, wine, divorce and middle age that are among the least self-pitying treatments of that material in American verse.'
        ],
        readNext: [
            { slug: 'stephen-dunn', name: 'Stephen Dunn', note: 'The same reflective American middle register.' },
            { slug: 'howard-nemerov', name: 'Howard Nemerov', note: 'Wit used as a philosophical instrument.' },
            { slug: 'tony-hoagland', name: 'Tony Hoagland', note: 'The next generation of the talking poem.' }
        ]
    },

    'brenda-shaughnessy': {
        body: [
            'The syntax is the event. Sentences double back, correct themselves, pun compulsively and refuse to settle, which makes the poems read as thinking under pressure rather than as reporting on it.',
            'The subjects have grown harder across the books — desire and self-invention early, then motherhood, disability and a family life described with an honesty that never tips into either complaint or uplift. One long poem imagines an alternative universe in which a child\'s injury did not happen, and holds both worlds open at once. That refusal to choose is characteristic of the whole body of work.'
        ],
        readNext: [
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'The family poem at its most exposed.' },
            { slug: 'lucie-brock-broido', name: 'Lucie Brock-Broido', note: 'Extravagant diction in the service of grief.' },
            { slug: 'ange-mlinko', name: 'Ange Mlinko', note: 'Her contemporary, and more oblique.' }
        ]
    },

    'naomi-shihab-nye': {
        body: [
            'Plainspoken to the point that the poems can look easy, and they are not — the flatness is a deliberate hospitality, and it lets the work carry political material without hardening into argument.',
            'She writes as a Palestinian American, and the poems return to that inheritance through small things: a grandmother\'s house, a bag of fruit, a stranger at an airport gate. "Kindness" is the poem most people meet first and it is genuinely the ars poetica — the claim that you have to lose something before the word means anything. She also writes extensively for younger readers, which is a continuation of the same project, not a separate career.'
        ],
        readNext: [
            { slug: 'li-young-lee', name: 'Li-Young Lee', note: 'Family, exile and food in the same key.' },
            { slug: 'martn-espada', name: 'Martín Espada', note: 'The political poem written to be understood.' },
            { slug: 'joy-harjo', name: 'Joy Harjo', note: 'Inheritance carried in a speaking voice.' }
        ]
    },

    'ezra-pound': {
        body: [
            'Impossible to separate from the machinery of modernism, because he built most of it — he named Imagism, edited "The Waste Land" into the poem we have, and pushed Yeats towards the hard late style. As an editor he was probably the most consequential figure in twentieth-century English poetry.',
            'The poems themselves divide sharply. The early short ones and the translations from Chinese and Old English are luminous and are where to start. "The Cantos" are a lifetime\'s unfinished epic, sometimes magnificent and often unreadable without an apparatus. And his broadcasts for Fascist Italy and his antisemitism are not a footnote; they are in the poems, and reading him honestly means reading them there.'
        ],
        readNext: [
            { slug: 'h-d', name: 'H. D.', note: 'The Imagist who outlasted the movement.' },
            { slug: 'basil-bunting', name: 'Basil Bunting', note: 'The best poet the Cantos method produced.' },
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'Modernist precision without the epic ambition.' }
        ]
    },

    'dante-gabriel-rossetti': {
        body: [
            'A painter as well as a poet, and the poems look like the paintings — saturated colour, stalled narrative, women rendered as objects of contemplation rather than as speakers. Whether that is a criticism or a description of the project depends on the poem.',
            '"The Blessed Damozel" is the early famous one, heaven observed from the wrong side of it. The major work is a sonnet sequence about love, memory and failure, written in a heavily worked, almost airless style that repays slow reading. He translated early Italian poetry, and the translations are where his ear is least encumbered.'
        ],
        readNext: [
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'His sister, and the better poet of the two.' },
            { slug: 'algernon-charles-swinburne', name: 'Algernon Charles Swinburne', note: 'The Pre-Raphaelite circle at its loudest.' },
            { slug: 'john-keats', name: 'John Keats', note: 'The source of nearly all this sensuousness.' }
        ]
    },

    'donald-revell': {
        body: [
            'A poet who moved from a formal, argumentative early style into something visionary and disjunctive, and the later work is the reason to read him — short lines, abrupt declaratives, and a willingness to sound prophetic without irony.',
            'He is also a translator of Rimbaud and Apollinaire, and writes essays on Thoreau and the American attention, which together explain a great deal: the poems want the sudden lit perception that both those traditions promise, and they are prepared to sacrifice continuity to get it. Expect the connections between sentences to be missing on purpose.'
        ],
        readNext: [
            { slug: 'arthur-rimbaud', name: 'Arthur Rimbaud', note: 'The poet he has spent years translating.' },
            { slug: 'fanny-howe', name: 'Fanny Howe', note: 'Contemporary American poetry with a religious charge.' },
            { slug: 'michael-palmer', name: 'Michael Palmer', note: 'The same disjunction, colder.' }
        ]
    },

    'josephine-miles': {
        body: [
            'Spare, dry, syntactically curious poems by somebody who spent a scholarly career studying how English poetry actually uses its words — she did quantitative work on poetic vocabulary decades before that was a normal thing to do.',
            'The poems show it. They are built around ordinary constructions — a conjunction, a preposition, a modal verb — held up until they look strange, and the tone is conversational without ever being chatty. She was a central figure in Berkeley\'s literary life and taught many poets who became better known than she is. The work deserves rediscovery on its own terms.'
        ],
        readNext: [
            { slug: 'lorine-niedecker', name: 'Lorine Niedecker', note: 'The other great American poet of compression.' },
            { slug: 'william-carlos-williams', name: 'William Carlos Williams', note: 'The plain American measure she works in.' },
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'A later poet doing something adjacent, with rhyme.' }
        ]
    },

    'franz-wright': {
        body: [
            'Short poems, often very short, written from close to the floor — addiction, psychiatric hospitals, night, prayer offered by somebody with no confidence that anyone is listening.',
            'The tone is what makes them survivable: a black, quick humour that arrives exactly when the poem threatens to become an appeal for pity. He is the son of the poet James Wright, and the two are the only father and son to have won the Pulitzer Prize in poetry, which is a fact the poems themselves handle with considerable difficulty. Read a handful at a time.'
        ],
        readNext: [
            { slug: 'james-wright', name: 'James Wright', note: 'His father, and the plainer American lyric.' },
            { slug: 'christian-wiman', name: 'Christian Wiman', note: 'Contemporary prayer written against the odds.' },
            { slug: 'charles-simic', name: 'Charles Simic', note: 'The same short poem, turned surreal.' }
        ]
    },

    'carl-phillips': {
        body: [
            'One long sinuous sentence per poem, more or less — full of qualification, parenthesis and reversal, so that reading him is the experience of a mind refusing to simplify a moral situation for the sake of a finished line.',
            'The material is desire, power, trust and the small cruelties available inside intimacy, handled with a classical restraint that has more to do with Greek lyric than with confession. Nothing is confessed, in fact; the poems generalise almost immediately, which is why they can be read as ethics as much as erotics. The forests, horses and fields recur as a private vocabulary, not as scenery.'
        ],
        readNext: [
            { slug: 'mark-doty', name: 'Mark Doty', note: 'The same subjects, far more expansive.' },
            { slug: 'henri-cole', name: 'Henri Cole', note: 'Comparable restraint, tighter forms.' },
            { slug: 'd-a-powell', name: 'D. A. Powell', note: 'The opposite temperament on shared ground.' }
        ]
    },

    'heather-mchugh': {
        body: [
            'A poet of the pun taken entirely seriously. Words are split, re-hyphenated, heard against their etymologies and made to mean two incompatible things in one position, and the effect is comic and vertiginous at once.',
            'This could easily be a party trick and is not, because the wordplay is usually the poem\'s argument: language failing to hold a thing is the subject as often as the thing itself. She is also a translator, notably of Paul Celan, which is the sternest possible school for somebody who loves puns — Celan\'s German breaks in the same places and never for fun.'
        ],
        readNext: [
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'Compression and wordplay in a smaller frame.' },
            { slug: 'paul-celan', name: 'Paul Celan', note: 'The poet she has translated.' },
            { slug: 'harryette-mullen', name: 'Harryette Mullen', note: 'Wordplay as a structural principle.' }
        ]
    },

    'robert-pinsky': {
        body: [
            'A poet of sound above all — he talks about poetry as a bodily, vocal art, and the poems are built to be said. The syntax is long and clause-heavy but the sentences always land, which is a harder trick than it looks.',
            'The subject range is unusually public for a contemporary American poet: history, work, a shirt traced back to the factory that made it, Jewish inheritance, the civic uses of memory. He served three terms as United States Poet Laureate and made recorded speech central to that role, and his translation of Dante\'s Inferno in terza rima is the best argument available for what he means about sound.'
        ],
        readNext: [
            { slug: 'robert-hass', name: 'Robert Hass', note: 'His contemporary and frequent interlocutor.' },
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'The other great translator-poet of the period.' },
            { slug: 'c-k-williams', name: 'C. K. Williams', note: 'The long line pushed further still.' }
        ]
    },

    'george-meredith': {
        body: [
            'Better known as a novelist, and the poems are worth the detour for one sequence in particular: fifty poems of sixteen lines each — sonnets with an extra quatrain, which is exactly the wrong shape and is the point — tracking a marriage as it fails.',
            'It is the least consoling long poem of its century about love, written from inside the situation and refusing to award blame to either party. The syntax is knotted in the way his prose is knotted, and it takes a few pages to acclimatise. The nature poems are conventional by comparison; the marriage sequence is not like anything else in Victorian verse.'
        ],
        readNext: [
            { slug: 'elizabeth-barrett-browning', name: 'Elizabeth Barrett Browning', note: 'The Victorian marriage from the opposite direction.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Another novelist whose verse outlasted expectations.' },
            { slug: 'dante-gabriel-rossetti', name: 'Dante Gabriel Rossetti', note: 'The other great sonnet sequence of the period.' }
        ]
    },

    'gerard-manley-hopkins': {
        body: [
            'He published almost nothing in his lifetime — a Jesuit priest who burned his early verse, wrote in private, and reached print decades after his death, at which point he sounded more modern than the poets of the 1920s.',
            'The prosody is his own invention: sprung rhythm counts stresses rather than syllables, so lines can be crammed with unstressed matter and still beat regularly, and the result is a density of alliteration and compound coinage that no one else in English attempts. The early poems celebrate the particular thisness of a bird, a tree, a landscape. The late sonnets, written out of desolation, use exactly the same instrument on despair, and are among the most frightening poems in the language.'
        ],
        readNext: [
            { slug: 'algernon-charles-swinburne', name: 'Algernon Charles Swinburne', note: 'The other great Victorian sound-inventor.' },
            { slug: 'george-herbert', name: 'George Herbert', note: 'The devotional tradition behind the late sonnets.' },
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'The clearest twentieth-century inheritor of that consonance.' }
        ]
    },

    'jane-kenyon': {
        body: [
            'Short, plain, unhurried poems set almost entirely on a New Hampshire farm — light on a floor, a dog, a bowl of soup, an afternoon that goes on too long. The surfaces are calm and the poems are not.',
            'She wrote about depression from inside it with unusual precision and without dramatising it, which is the achievement people mean when they call the work quiet. "Let Evening Come" is the poem most often read aloud at funerals and holds up to that use. She translated Anna Akhmatova, and the influence is audible in how much she is willing to leave out.'
        ],
        readNext: [
            { slug: 'donald-hall', name: 'Donald Hall', note: 'Her husband, and the same farm from the other side.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'The same attention, turned outward.' },
            { slug: 'linda-pastan', name: 'Linda Pastan', note: 'Domestic life handled with comparable economy.' }
        ]
    },

    'juan-felipe-herrera': {
        body: [
            'Enormously various — performance pieces, prose poems, bilingual collage, poems for children, elegies for real people — and the variety is deliberate: he writes as though the job of a poet is to be usable by whoever is in the room.',
            'The energy is closer to spoken word and to the murals and street theatre of the Chicano movement than to the workshop, and the poems lose most of their charge on a silent first reading. Read them aloud, allow the Spanish and English to interrupt each other, and the shape appears. He served as United States Poet Laureate, the first Mexican American to do so.'
        ],
        readNext: [
            { slug: 'martn-espada', name: 'Martín Espada', note: 'The political poem, plainer and angrier.' },
            { slug: 'gary-soto', name: 'Gary Soto', note: 'Californian childhood in a quieter register.' },
            { slug: 'jimmy-santiago-baca', name: 'Jimmy Santiago Baca', note: 'The same tradition, written from prison.' }
        ]
    },

    'siegfried-sassoon': {
        body: [
            'The satirist of the First World War. Where Owen mourns, Sassoon attacks — short, brutal, epigrammatic poems aimed squarely at generals, journalists, cheering civilians and the clergy, ending on a punch delivered in the final couplet.',
            'He was a decorated officer who publicly refused to continue serving and was sent to a psychiatric hospital rather than court-martialled, where he met Owen and encouraged the poems that made Owen\'s name. The verse technique is conventional on purpose: he uses the comfortable Georgian lyric shape and fills it with something that makes the shape obscene. The later, quieter poems are unlike the war work and are largely unread.'
        ],
        readNext: [
            { slug: 'wilfred-owen', name: 'Wilfred Owen', note: 'The poet he encouraged, and the greater one.' },
            { slug: 'isaac-rosenberg', name: 'Isaac Rosenberg', note: 'The same war from the ranks.' },
            { slug: 'robert-graves', name: 'Robert Graves', note: 'His friend, and the survivor\'s long afterward.' }
        ]
    },

    'alexander-pope': {
        body: [
            'The heroic couplet at the highest level it has ever reached in English. Everything is in the couplet: balance, antithesis, the second line correcting the first, the caesura shifting to land a word exactly where it does the most damage.',
            'The satires are savage and personal, and the mock-epic about a stolen lock of hair is the best joke in the language about the scale of a form against the triviality of an occasion. He is also endlessly quotable, to the point that several lines everyone knows are his without knowing it. The essays in verse argue philosophy in couplets and are far more readable than that description suggests.'
        ],
        readNext: [
            { slug: 'john-dryden', name: 'John Dryden', note: 'The couplet he inherited and perfected.' },
            { slug: 'jonathan-swift', name: 'Jonathan Swift', note: 'His friend, and the coarser satirist.' },
            { slug: 'samuel-johnson', name: 'Samuel Johnson', note: 'The last great moralist in that measure.' }
        ]
    },

    'lorine-niedecker': {
        body: [
            'She lived most of her life on an island in a Wisconsin marsh, worked cleaning floors in a hospital, and wrote some of the most concentrated poems in American English. Very little of it was known while she was alive.',
            'Her word for the method was condensery — a factory that takes something out. The poems are five or six lines, built from local speech, folk rhythm, geology and family talk, and they hold the water and the poverty of that place without a word of complaint. She corresponded with the Objectivists and belongs with them, but nobody else in that group sounds remotely like her.'
        ],
        readNext: [
            { slug: 'george-oppen', name: 'George Oppen', note: 'The Objectivist nearest her in seriousness.' },
            { slug: 'basil-bunting', name: 'Basil Bunting', note: 'Northern speech condensed into music.' },
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'The contemporary heir to that scale.' }
        ]
    },

    'charles-simic': {
        body: [
            'Short poems in flat, plain English in which something impossible is stated as a matter of fact — a knife with opinions, a fork descended from a bird, a shoe interrogated. The surrealism works because the diction never becomes exotic.',
            'He was born in Belgrade and his childhood was spent under bombardment and occupation, which he described drily as having had his travel arranged for him by Hitler and Stalin. That history is rarely the explicit subject and is in every poem: the objects are frightened, the rooms are empty, and the humour is the humour of somebody who saw the joke early. He also wrote fine prose poems and served as United States Poet Laureate.'
        ],
        readNext: [
            { slug: 'james-tate', name: 'James Tate', note: 'American surrealism at its funniest.' },
            { slug: 'mark-strand', name: 'Mark Strand', note: 'The same flatness, more metaphysical.' },
            { slug: 'bill-knott', name: 'Bill Knott', note: 'The wilder end of that generation.' }
        ]
    },

    'bob-hicok': {
        body: [
            'The poems talk. They start on some small domestic or civic irritation, digress at length, argue with themselves, make jokes, and then turn without warning into something that has been about mortality the whole time.',
            'The technique is riskier than it looks: the digression has to feel unplanned and land as though it were, and when it fails the poem is just a monologue. When it works — often — the comedy is the delivery system for grief. He writes a great deal about Michigan, about work, and about American violence, and the poems about school shootings and about ordinary cruelty are among the least performative treatments of that subject in contemporary verse.'
        ],
        readNext: [
            { slug: 'tony-hoagland', name: 'Tony Hoagland', note: 'The same comic-uncomfortable American mode.' },
            { slug: 'dean-young', name: 'Dean Young', note: 'Digression pushed towards surrealism.' },
            { slug: 'matthew-zapruder', name: 'Matthew Zapruder', note: 'The next generation of the thinking-aloud poem.' }
        ]
    },

    'edgar-allan-poe': {
        body: [
            'Read for sound before anything else. The insistent metres, the internal rhyme, the refrains repeated until they become a form of pressure — these are the whole apparatus, and they are why the poems lodge in the memory of people who would not claim to like them.',
            'His essay claiming that "The Raven" was assembled by calculation, working backwards from a desired effect, is either a genuine account of his method or an elaborate joke, and the poems support both readings. English criticism has often found him vulgar; the French took him extremely seriously, and it is largely through Baudelaire\'s translations that he became a founding figure for Symbolism and, through it, for modern poetry.'
        ],
        readNext: [
            { slug: 'charles-baudelaire', name: 'Charles Baudelaire', note: 'His translator, and the poet he made possible.' },
            { slug: 'stphane-mallarm', name: 'Stéphane Mallarmé', note: 'Where the French line of descent arrives.' },
            { slug: 'alfred-lord-tennyson', name: 'Alfred, Lord Tennyson', note: 'The contemporary ear Poe most admired.' }
        ]
    },

    'ilya-kaminsky': {
        body: [
            'A poet writing in English, which is not his first language, and the slight foreignness of the syntax is load-bearing — the sentences arrive at an angle, and the plainest statements land hardest.',
            'His best-known book is a parable: a town under occupation whose inhabitants respond to a killing by refusing to hear, so that deafness becomes a form of resistance and sign language becomes the town\'s common tongue. It is a war poem that names no war, and it works as a story as much as a sequence. The insistence on joy in the middle of atrocity is the most difficult and most deliberate thing about the work.'
        ],
        readNext: [
            { slug: 'carolyn-forch', name: 'Carolyn Forché', note: 'The poetry of witness and its terms.' },
            { slug: 'paul-celan', name: 'Paul Celan', note: 'The language of catastrophe at its most compressed.' },
            { slug: 'philip-schultz', name: 'Philip Schultz', note: 'Contemporary American poems out of the same immigrant material.' }
        ]
    },

    'herman-melville': {
        body: [
            'He turned to poetry after the novels stopped selling, and wrote it for the rest of his life to almost no audience at all. The verse is knotted, awkward and deliberately unbeautiful, and the awkwardness is not incompetence — smooth verse would falsify what he is describing.',
            'The Civil War book is the essential one: short poems on particular battles and particular deaths, written by somebody watching the industrial machinery of the thing arrive, and clear-eyed about the fact that the war would be remembered as a story. There is also a very long philosophical poem set in the Holy Land, which almost nobody finishes and which contains extraordinary passages.'
        ],
        readNext: [
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The same war, the opposite temperament.' },
            { slug: 'stephen-crane', name: 'Stephen Crane', note: 'The next American to write war without consolation.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'The other great novelist who turned to verse.' }
        ]
    },

    'joy-harjo': {
        body: [
            'A Muscogee poet whose lines are shaped by breath and by music — she plays saxophone and performs with a band, and the poems are written to be carried on a voice rather than read silently.',
            'The recurring subjects are memory, land, survival and a continent understood as still inhabited by what happened on it. "She Had Some Horses" is the book most people meet first, and its incantatory repetition is the clearest example of the method. She served as United States Poet Laureate, the first Native American to do so, and used the position to map Native poetry as a living body of work rather than a historical category.'
        ],
        readNext: [
            { slug: 'n-scott-momaday', name: 'N. Scott Momaday', note: 'The elder of Native American letters.' },
            { slug: 'linda-hogan', name: 'Linda Hogan', note: 'The same ground, quieter.' },
            { slug: 'simon-j-ortiz', name: 'Simon J. Ortiz', note: 'Storytelling as poetic form.' }
        ]
    },

    'tony-hoagland': {
        body: [
            'Very funny and frequently unpleasant, on purpose. The poems set up a comfortable liberal American speaker and then let him say the thing he actually thinks, about race, money, sex or television, so that the reader is caught agreeing.',
            'That method drew serious criticism, some of it from poets he named, and the arguments are worth knowing about because the poems invite them rather than avoiding them. Technically he is a master of the plain-spoken American free-verse poem that turns twice: once for the joke, once for the knife. The last books, written while he was ill, drop the provocation and are the tenderest work he did.'
        ],
        readNext: [
            { slug: 'bob-hicok', name: 'Bob Hicok', note: 'The same talking poem, less confrontational.' },
            { slug: 'dean-young', name: 'Dean Young', note: 'His contemporary, wilder in method.' },
            { slug: 'stephen-dunn', name: 'Stephen Dunn', note: 'The reflective version of that voice.' }
        ]
    },

    'li-young-lee': {
        body: [
            'Sensuous, slow, close to prayer. The poems move by long repeated cadences and return continually to a handful of things — fruit, hands, a father, sleep, the body of a beloved — until the objects take on a weight far beyond their size.',
            'His family fled political persecution and moved through several countries before reaching the United States, and exile is the ground under everything even when it is not mentioned. "The Gift" and "Persimmons" are the poems most often anthologised and are a fair sample: domestic memory turned, without any visible seam, into something metaphysical. The risk in the style is monotony, and the best poems earn their slowness.'
        ],
        readNext: [
            { slug: 'garrett-hongo', name: 'Garrett Hongo', note: 'Asian American memory in a more narrative form.' },
            { slug: 'naomi-shihab-nye', name: 'Naomi Shihab Nye', note: 'The same tenderness, plainer.' },
            { slug: 'marilyn-chin', name: 'Marilyn Chin', note: 'The opposite temperament on shared ground.' }
        ]
    },

    'linda-pastan': {
        body: [
            'Short-lined domestic lyrics — a kitchen, a marriage, a garden, children leaving — written over decades with a consistency that can obscure how good the individual poems are.',
            'The method is small and exact: an ordinary occasion, a single turn near the end, and no raised voice at any point. Mortality is the constant undertone, and the later books, written in old age, address it directly and without drama. The poem about teaching a child to ride a bicycle is the one everybody knows, and it is a fair introduction to how much she can get out of a domestic scene without inflating it.'
        ],
        readNext: [
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'The same quiet, in a rural setting.' },
            { slug: 'maxine-kumin', name: 'Maxine Kumin', note: 'Domestic and farm life, more physical.' },
            { slug: 'lisel-mueller', name: 'Lisel Mueller', note: 'The same generation, with a European inheritance.' }
        ]
    },

    'c-d-wright': {
        body: [
            'Arkansas syntax put to experimental use. The poems keep the vocabulary and cadence of the rural South and refuse the storytelling that usually comes with it — lines are cut, sequences are collaged, and the reader assembles the occasion.',
            'She worked repeatedly in book-length forms, several of them documentary: one made with a photographer inside Louisiana prisons, another travelling the Mississippi Delta. Those projects put real recorded speech next to her own lines without smoothing the difference. Late in her life she wrote a long prose-poem book about a single tree, which is as good a demonstration as any of how far she could take attention.'
        ],
        readNext: [
            { slug: 'frank-stanford', name: 'Frank Stanford', note: 'The Arkansas poet she edited and kept in print.' },
            { slug: 'forrest-gander', name: 'Forrest Gander', note: 'Her closest collaborator in poetry and translation.' },
            { slug: 'james-galvin', name: 'James Galvin', note: 'The same ellipsis, in western landscape.' }
        ]
    },

    'wendy-videlock': {
        body: [
            'Very short rhymed poems, most of them under a dozen lines, working in a mode that barely exists in contemporary American verse — closer to proverb, riddle and charm than to the lyric of personal occasion.',
            'The poems are witty, quick and much sharper than their nursery-rhyme surfaces suggest; the rhyme frequently sets up an expectation that the last line refuses. Colorado landscape, animals and a dry sceptical humour recur. Read several in a row and the accumulated tone — amused, unsentimental, unimpressed by grandeur — becomes the real subject.'
        ],
        readNext: [
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'The obvious contemporary comparison, and the deeper one.' },
            { slug: 'a-e-stallings', name: 'A. E. Stallings', note: 'Formal verse with classical ballast.' },
            { slug: 'x-j-kennedy', name: 'X. J. Kennedy', note: 'Light verse taken entirely seriously.' }
        ]
    },

    'william-e-stafford': {
        body: [
            'He wrote every morning, early, for decades, on the principle that lowering your standards far enough gets you started and the poem can be found afterwards. The output was enormous and the tone is remarkably even.',
            'The poems are plain, conversational and set mostly in the American West — a road at night, a river, a deer on the shoulder. "Traveling through the Dark" is the famous one and is a small ethical crisis handled in eighteen lines with no rhetoric at all. He was a conscientious objector during the Second World War and did alternative service in labour camps; the pacifism is not announced in the poems but the refusal to raise a voice is where it lives.'
        ],
        readNext: [
            { slug: 'ted-kooser', name: 'Ted Kooser', note: 'The same plainness, in the Great Plains.' },
            { slug: 'robert-bly', name: 'Robert Bly', note: 'His contemporary and frequent opposite number.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'Daily attention as a working method.' }
        ]
    },

    'brenda-hillman': {
        body: [
            'Experimental in a way that stays legible: the poems use unusual typography, marginal notes, scientific vocabulary and fragments, but they are anchored in identifiable places and events, and the strangeness is a way of registering attention rather than refusing it.',
            'The central achievement is a tetralogy built on the four classical elements, which moves across ecology, protest, geology and grief without settling into any one of them. Environmental activism runs through the later work directly, and the poems are unusual in taking the risk of documenting political action while it is happening rather than after it has become history.'
        ],
        readNext: [
            { slug: 'robert-hass', name: 'Robert Hass', note: 'Her husband, and the plainer treatment of shared ground.' },
            { slug: 'lyn-hejinian', name: 'Lyn Hejinian', note: 'The Bay Area experimental line.' },
            { slug: 'forrest-gander', name: 'Forrest Gander', note: 'Geology and poetry in the same practice.' }
        ]
    },

    'edna-st-vincent-millay': {
        body: [
            'She was a genuine celebrity, which has cost her critically ever since — the sonnets were read as the record of a scandalous life rather than as the extremely accomplished poems they are.',
            'Read the sonnets on their own terms and the craft is obvious: strict Petrarchan and Shakespearean forms carrying a modern, unapologetic female speaker who treats desire as hers to dispose of, and who says so in the highest possible style. The famous quatrain about the candle is four lines that made her name and is not remotely her best work. The late political poems, written against fascism, are the ones the reputation still has not caught up with.'
        ],
        readNext: [
            { slug: 'elinor-wylie', name: 'Elinor Wylie', note: 'Her contemporary in polished formal verse.' },
            { slug: 'sara-teasdale', name: 'Sara Teasdale', note: 'The lyric she was measured against.' },
            { slug: 'louise-bogan', name: 'Louise Bogan', note: 'The same forms, far more guarded.' }
        ]
    },

    'elizabeth-alexander': {
        body: [
            'A poet, essayist and scholar whose work sits at the intersection of the historical document and the family photograph — poems about the Black American past that keep the scale domestic and specific.',
            'She read at a presidential inauguration, which is an almost impossible commission: a poem that must be public, simultaneous and immediately intelligible. Hers took ordinary labour as its subject and declined the grand manner, which is the right answer to the problem. The rest of the work is quieter and better — portraits, elegies, poems on paintings, and a sustained interest in what gets recorded about a life and what does not.'
        ],
        readNext: [
            { slug: 'rita-dove', name: 'Rita Dove', note: 'The historical sequence held to domestic scale.' },
            { slug: 'natasha-trethewey', name: 'Natasha Trethewey', note: 'Archive and family in the same frame.' },
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'The ancestor of this whole line.' }
        ]
    },
    'a-f-moritz': {
        body: [
            'A Canadian poet, American-born, whose work sits oddly outside both national conversations and is the better for it. The mode is visionary but the diction is plain: ordinary streets, factories and suburbs described until they turn allegorical without any announcement that they are about to.',
            'He is also a translator from Spanish and French, and the poems have the slightly formal, slightly displaced quality of somebody who spends time inside other languages. The recurring subject is the city as a moral landscape — who works in it, what it costs, what it might have been. Read a sequence rather than a single poem; the effect is cumulative.'
        ],
        readNext: [
            { slug: 'george-oppen', name: 'George Oppen', note: 'The city examined with the same seriousness.' },
            { slug: 'charles-wright', name: 'Charles Wright', note: 'Contemporary visionary poetry, southern rather than urban.' },
            { slug: 'czeslaw-milosz', name: 'Czeslaw Milosz', note: 'The European habit of moral witness in verse.' }
        ]
    },

    'aimee-nezhukumatathil': {
        body: [
            'Bright, sensuous and full of the natural world — octopuses, fireflies, monsoon fruit, birds with improbable names — written with a warmth that is rare in contemporary American poetry and often mistaken for lightness.',
            'The poems are more layered than the surface suggests. They work the distance between a Filipina and Malayali childhood in the American Midwest and the landscape around it, and the wonder is doing double duty: what a naturalist notices and what an outsider notices are the same act of attention here. She also writes nature essays, and the two forms feed each other openly.'
        ],
        readNext: [
            { slug: 'ross-gay', name: 'Ross Gay', note: 'The other great contemporary poet of delight.' },
            { slug: 'naomi-shihab-nye', name: 'Naomi Shihab Nye', note: 'Plainspoken warmth with an inheritance behind it.' },
            { slug: 'arthur-sze', name: 'Arthur Sze', note: 'The natural world at a colder, stranger angle.' }
        ]
    },

    'alan-r-shapiro': {
        body: [
            'Domestic, narrative and formally careful — a poet of families, illness and the ordinary mechanics of grief, working close to plain speech without ever falling out of measure.',
            'The best-known books came out of the deaths of his brother and sister, and they avoid the two obvious failures of that material: they neither perform the grief nor flinch from it, and they keep noticing the absurd small things that go on happening around a deathbed. He also writes criticism and memoir, and the poems have an essayist\'s willingness to think a problem all the way through rather than stopping at an image.'
        ],
        readNext: [
            { slug: 'mark-doty', name: 'Mark Doty', note: 'The elegy at its most lyrical.' },
            { slug: 'stephen-dunn', name: 'Stephen Dunn', note: 'The same reflective, conversational American register.' },
            { slug: 'donald-hall', name: 'Donald Hall', note: 'Late elegies written from inside a marriage.' }
        ]
    },

    'd-nurkse': {
        body: [
            'Short poems with the flat, unhurried tone of a report, describing displacement, borders, wars and childhood in a way that makes the ordinary and the catastrophic sound identical. That evenness is the technique, not a limitation.',
            'He has worked in human rights, and the poems know the vocabulary of it without ever becoming testimony or argument. Many are told by a child, or by somebody remembering being one, which is where the flatness earns itself: a child reports what happened without ranking it. The Brooklyn poems and the war poems use the same voice, and the resemblance is the point.'
        ],
        readNext: [
            { slug: 'carolyn-forch', name: 'Carolyn Forché', note: 'The poetry of witness and the argument about it.' },
            { slug: 'ilya-kaminsky', name: 'Ilya Kaminsky', note: 'Occupation told as parable.' },
            { slug: 'charles-simic', name: 'Charles Simic', note: 'Wartime childhood as a flat, dry surface.' }
        ]
    },

    'henry-timrod': {
        body: [
            'A Southern poet of the American Civil War, and the awkward case that a literary history has to hold in two hands: the craft is real, and it was spent on the Confederacy.',
            'The odes are the work that lasts — the memorial ode for the Confederate dead in Charleston is formally accomplished and genuinely moving as elegy, which is precisely what makes it difficult. The nature poems and the earlier lyrics show a poet trained on Wordsworth and Tennyson, working far from any literary centre and in considerable poverty. Read him as evidence rather than as consolation.'
        ],
        readNext: [
            { slug: 'herman-melville', name: 'Herman Melville', note: 'The same war, from the other side and without consolation.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The Union war poems, and the wound dresser.' },
            { slug: 'paul-laurence-dunbar', name: 'Paul Laurence Dunbar', note: 'The South this verse does not speak for.' }
        ]
    },

    'james-tate': {
        body: [
            'Deadpan American surrealism, and probably the funniest body of work in modern American poetry. A typical poem begins with a flat declarative sentence about something impossible and then reasons about it patiently, in the tone of a man explaining an insurance claim.',
            'The early work is more lyric and more wounded — his first book, written very young, is built around the father he never met, killed in the war. The late prose poems are where the method arrives: little stories about neighbours, town officials and animals that behave exactly like people, in which nothing is explained and the joke keeps sliding into dread. Enormously influential on younger poets, and easy to imitate badly.'
        ],
        readNext: [
            { slug: 'charles-simic', name: 'Charles Simic', note: 'His friend and collaborator, and the darker surrealist.' },
            { slug: 'russell-edson', name: 'Russell Edson', note: 'The prose poem as a cruel little fable.' },
            { slug: 'dean-young', name: 'Dean Young', note: 'The generation that took the permission and ran.' }
        ]
    },

    'john-dryden': {
        body: [
            'The dominant English poet of the late seventeenth century, and the man who made the heroic couplet into a public instrument — flexible enough for satire, argument, translation, elegy and the occasional royal compliment.',
            'The satires are the reason to read him. "Absalom and Achitophel" turns a political crisis into biblical narrative and destroys its targets by describing them accurately, which is far more damaging than abuse. He translated Virgil entire, wrote criticism that invented much of the English vocabulary for talking about poetry, and changed his religion and his politics with the times — his enemies never let him forget it, and the verse absorbs the mockery without breaking stride.'
        ],
        readNext: [
            { slug: 'alexander-pope', name: 'Alexander Pope', note: 'The couplet inherited and perfected.' },
            { slug: 'jonathan-swift', name: 'Jonathan Swift', note: 'Satire in the next generation, and coarser.' },
            { slug: 'john-milton', name: 'John Milton', note: 'The giant he wrote in the shadow of.' }
        ]
    },

    'langston-hughes': {
        body: [
            'He put the blues into English poetry — not as subject matter but as structure, taking the three-line blues stanza and the call-and-response of a church and building poems that scan as music and read as speech.',
            'The apparent simplicity is a deliberate political choice. He wrote for readers who were not literary, about work, rent, love, laundry and being told to wait, and the plainness is what let the anger travel. "Harlem" asks what happens to a dream deferred in eleven lines and has been quoted in more consequential rooms than most poems ever reach. The later work is sharper and more experimental than the anthologies suggest.'
        ],
        readNext: [
            { slug: 'claude-mckay', name: 'Claude McKay', note: 'The Harlem Renaissance in strict sonnet form.' },
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'The next generation, and formally denser.' },
            { slug: 'etheridge-knight', name: 'Etheridge Knight', note: 'The oral tradition carried further still.' }
        ]
    },

    'mary-ruefle': {
        body: [
            'Funny, abrupt and quietly devastating. The poems change register without warning — a joke, then a flat statement about death, then something that sounds like a child\'s question — and the speed of those turns is the whole pleasure.',
            'She works in short lyrics and in prose pieces that refuse to declare whether they are poems or essays, and her lectures on poetry are as good as either. There is also a body of erasures: nineteenth-century books whitened out until a few words remain. Underneath all of it is a consistent set of preoccupations — mortality, weather, the strangeness of having a body and a vocabulary — handled without a shred of solemnity.'
        ],
        readNext: [
            { slug: 'james-tate', name: 'James Tate', note: 'The same deadpan, more narrative.' },
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'Compression and wit at a smaller scale.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'The essay and the poem refusing to separate.' }
        ]
    },

    'michael-ryan': {
        body: [
            'A poet of self-examination carried further than is comfortable — the poems are formally controlled and psychologically merciless, and the control is what keeps them from becoming confession.',
            'The subjects are appetite, shame, family and the difficulty of accounting honestly for one\'s own behaviour, handled with an unusual refusal to arrange the material in the speaker\'s favour. He has also written memoir, and the poems share its central bet: that stating a thing exactly is worth more than framing it kindly. The craft is traditional and unshowy, which is why the content lands.'
        ],
        readNext: [
            { slug: 'frank-bidart', name: 'Frank Bidart', note: 'The extreme end of the same self-examination.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'The body and the family, less guarded.' },
            { slug: 'w-d-snodgrass', name: 'W. D. Snodgrass', note: 'Where this American mode begins.' }
        ]
    },

    'muriel-rukeyser': {
        body: [
            'A political poet in the largest sense — she treated documents, science, industry and public disaster as legitimate lyric material decades before that was a recognised mode.',
            'Her central sequence assembles the Gauley Bridge tunnel disaster from congressional testimony, X-ray reports and interviews with dying miners, and it is one of the great American documentary poems. Elsewhere she writes love poems, poems about her body and her pregnancy, and the line most often quoted about what would happen if one woman told the truth about her life. She was neglected for a long stretch and has been recovered repeatedly since; each generation finds a different reason.'
        ],
        readNext: [
            { slug: 'charles-reznikoff', name: 'Charles Reznikoff', note: 'The documentary poem built from court records.' },
            { slug: 'adrienne-rich', name: 'Adrienne Rich', note: 'The next generation of the political lyric.' },
            { slug: 'c-d-wright', name: 'C. D. Wright', note: 'Contemporary documentary poetry.' }
        ]
    },

    'stanley-moss': {
        body: [
            'A long career written mostly at the edge of the American poetry world — he founded and ran a press that kept a great deal of international poetry in print, and his own books arrived at their own pace.',
            'The poems are cosmopolitan and unembarrassed by grandeur: God is addressed directly and argued with, the Mediterranean and its languages recur, and the tone moves between erudition and something closer to a joke at a dinner table. Late work written in old age is the most striking, less because of the subject than because the appetite in it never diminishes.'
        ],
        readNext: [
            { slug: 'gerald-stern', name: 'Gerald Stern', note: 'The same late ecstatic energy.' },
            { slug: 'yehuda-amichai', name: 'Yehuda Amichai', note: 'God argued with in ordinary language.' },
            { slug: 'david-ferry', name: 'David Ferry', note: 'The other great late career here.' }
        ]
    },

    'alicia-ostriker': {
        body: [
            'Poet and critic in equal measure, and the criticism explains the poems: she spent decades arguing that women were rewriting the myths they had been handed, and her own work does exactly that with the Hebrew Bible.',
            'The biblical poems are the centre — Sarah, Job, the psalms — approached as a Jewish reader who is neither believing nor dismissive, and willing to be angry at the text. Elsewhere she writes about the body, ageing, motherhood and New York with a direct, unadorned line. The mode is argument as much as lyric, and the arguments are with material that will not answer back.'
        ],
        readNext: [
            { slug: 'adrienne-rich', name: 'Adrienne Rich', note: 'The critical and poetic project running in parallel.' },
            { slug: 'marge-piercy', name: 'Marge Piercy', note: 'The same generation, more overtly political.' },
            { slug: 'jean-valentine', name: 'Jean Valentine', note: 'The interior version of the same search.' }
        ]
    },

    'bernadette-mayer': {
        body: [
            'A second-generation New York School writer who treated procedure as a way of getting at ordinary life: a book written by photographing and journalling every day of one month, a sonnet sequence about pregnancy and money, an epic covering a single day.',
            'The experiments never feel academic because the material is so domestic — babies, rent, food, sex, sleeplessness — and the tone is fast, funny and uninterested in polish. She taught and ran workshops that shaped a great many younger poets, and her list of writing experiments circulates as a document in its own right. The maximalism is the argument: a life is not a series of occasions worth a lyric each.'
        ],
        readNext: [
            { slug: 'alice-notley', name: 'Alice Notley', note: 'The same milieu, and the long poem taken further.' },
            { slug: 'ted-berrigan', name: 'Ted Berrigan', note: 'The sonnet as a New York School machine.' },
            { slug: 'anne-waldman', name: 'Anne Waldman', note: 'Performance and length as method.' }
        ]
    },

    'c-dale-young': {
        body: [
            'A poet who has practised medicine throughout his writing life, and the two vocabularies meet without either being used as decoration for the other — anatomy is described precisely because he knows it, not to make a metaphor.',
            'The poems are formally attentive and often turn on inheritance and category: mixed race, Caribbean background, desire, the specific loneliness of being placed by other people. The tone is measured almost to the point of coolness, which makes the moments where it breaks count for more. Read the poems about patients alongside the ones about family; they are asking the same question about what a body discloses.'
        ],
        readNext: [
            { slug: 'carl-phillips', name: 'Carl Phillips', note: 'Desire handled with comparable restraint.' },
            { slug: 'henri-cole', name: 'Henri Cole', note: 'Formal control over difficult intimacy.' },
            { slug: 'natasha-trethewey', name: 'Natasha Trethewey', note: 'Inheritance and category as a lifelong subject.' }
        ]
    },

    'carolyn-kizer': {
        body: [
            'Formally accomplished, satirical and unusually direct about being a woman writing inside a tradition that had mostly used women as material. Her long poem addressing that situation is witty, furious and does not resolve, which is the honest outcome.',
            'She translated Chinese poetry, and the influence shows in the clarity of her images and in a willingness to let a poem be occasional. She also founded and edited a major poetry magazine and resigned a national arts post over a matter of principle. The wit is the delivery system; underneath it the poems are consistently about power and who is permitted to speak.'
        ],
        readNext: [
            { slug: 'louise-bogan', name: 'Louise Bogan', note: 'The formal generation just before, and more guarded.' },
            { slug: 'maxine-kumin', name: 'Maxine Kumin', note: 'A contemporary working the same forms.' },
            { slug: 'marilyn-hacker', name: 'Marilyn Hacker', note: 'Strict form turned to feminist ends.' }
        ]
    },

    'eileen-myles': {
        body: [
            'Fast, short-lined, conversational poems that read like somebody talking to you on the way somewhere. The line breaks are frequent and slightly arbitrary-looking, which keeps the pace up and stops any sentence settling into a pronouncement.',
            'The material is daily and unguarded — dogs, apartments, work, being broke, being queer in New York across several decades — and the refusal of literary decorum is a position rather than a shortcut. Myles also writes fiction and essays and once ran for president as a poet, which is entirely consistent with the work. The influence on younger writers has been enormous, particularly on the idea that a poem can simply be attention paid in real time.'
        ],
        readNext: [
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'The ancestor of the poem written on the move.' },
            { slug: 'bernadette-mayer', name: 'Bernadette Mayer', note: 'Daily life as a formal principle.' },
            { slug: 'tim-dlugos', name: 'Tim Dlugos', note: 'The same downtown New York, cut short.' }
        ]
    },

    'fanny-howe': {
        body: [
            'A poet of exile and belief whose work never settles into either. The poems are short, fragmentary and drawn towards the mystical, but they are also politically alert — race, poverty and the Catholic left run through the whole body of work.',
            'Her prose is inseparable from the poetry; the essay on what she calls bewilderment describes a method of proceeding without resolution that the poems enact. Sequences are the natural unit, and individual pieces can look slight in isolation. Read fifteen pages at once and the accumulated tone — searching, unconsoled, refusing to conclude — becomes unmistakable.'
        ],
        readNext: [
            { slug: 'jean-valentine', name: 'Jean Valentine', note: 'The same interiority, even more compressed.' },
            { slug: 'donald-revell', name: 'Donald Revell', note: 'Contemporary poetry with a religious charge.' },
            { slug: 'christian-wiman', name: 'Christian Wiman', note: 'Belief argued rather than assumed.' }
        ]
    },

    'gary-snyder': {
        body: [
            'The most durable poet to come out of the Beat orbit, and the one who did the least performing. He worked as a logger, a fire lookout and a trail crew hand, studied Zen in Japan for years, and the poems carry that as practical knowledge rather than as atmosphere.',
            'The line is short, the diction is concrete, and the influence of Chinese and Japanese poetry is structural rather than decorative — images set beside each other with the connective tissue removed. He is also a serious ecological thinker, and the later work argues for a way of living in a place that the earlier work had already been describing. Start with the mountain and work poems.'
        ],
        readNext: [
            { slug: 'kenneth-rexroth', name: 'Kenneth Rexroth', note: 'The elder who opened the same Asian and Californian ground.' },
            { slug: 'lawrence-ferlinghetti', name: 'Lawrence Ferlinghetti', note: 'The other pole of that San Francisco moment.' },
            { slug: 'william-e-stafford', name: 'William E. Stafford', note: 'Plain American attention to landscape.' }
        ]
    },

    'george-oppen': {
        body: [
            'He published one book, stopped writing for twenty-five years to do political work, and returned with a body of poetry that is among the most serious in American English. The silence is not a biographical curiosity; the poems are visibly the work of somebody who decided that writing had to be worth it.',
            'The language is stripped to nouns and small connectives, with a great deal of white space and a habit of stopping mid-argument. The recurring question is what it means that other people exist — he calls it the shipwreck of the singular — and the poems approach it without any consolation of style. Slow reading is not optional here.'
        ],
        readNext: [
            { slug: 'charles-reznikoff', name: 'Charles Reznikoff', note: 'The Objectivist he most admired.' },
            { slug: 'lorine-niedecker', name: 'Lorine Niedecker', note: 'The same group, and the most compressed of them.' },
            { slug: 'carl-rakosi', name: 'Carl Rakosi', note: 'The fourth Objectivist, and the wryest.' }
        ]
    },

    'h-d': {
        body: [
            'Imagism at its purest: short poems, hard clear images, Greek material handled without any Victorian softening. The early sea and garden poems are as spare as anything in English, and they were the movement\'s proof of concept.',
            'The later work is the reason the reputation keeps growing. Long poems written during and after the London Blitz turn to myth, Egypt, alchemy and a rewritten Helen of Troy, and they are visionary in a way nothing in the early work predicts. She spent much of her life inside other people\'s definitions of her — imagist, patient, muse — and the late books are the answer to all of them.'
        ],
        readNext: [
            { slug: 'ezra-pound', name: 'Ezra Pound', note: 'Who named her Imagist and edited the early poems.' },
            { slug: 'mina-loy', name: 'Mina Loy', note: 'The other modernist woman working against type.' },
            { slug: 'denise-levertov', name: 'Denise Levertov', note: 'The poet who read her as permission for myth.' }
        ]
    },

    'james-schuyler': {
        body: [
            'The quietest of the New York School and, for many readers, the one who wears best. The poems look like notation — weather, flowers, a window, what somebody said — set in short lines that follow the eye rather than any measure.',
            'What makes them more than a diary is the timing: he can run twenty lines of pure description and then place one sentence about loneliness or illness that reorganises everything before it. The long poems, especially the ones written from a hospital or a friend\'s house, are among the best American poems about being a body in a room. Nothing is raised; nothing needs to be.'
        ],
        readNext: [
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'His friend, and the fast opposite of this stillness.' },
            { slug: 'john-ashbery', name: 'John Ashbery', note: 'The same circle, and the difficult end of it.' },
            { slug: 'barbara-guest', name: 'Barbara Guest', note: 'The fourth of that group, and the most painterly.' }
        ]
    },

    'marge-piercy': {
        body: [
            'Direct, political and completely uninterested in obliquity. The poems are about work, women\'s labour, Jewish practice, gardens and the machinery of ordinary injustice, written in a plain line that carries argument without strain.',
            'The famous ones are useful in the way a tool is useful — poems about being of use, about the woman treated as a broken appliance — and they have been read aloud at rallies and weddings for decades. She is also a prolific novelist, and the poems share the fiction\'s appetite for the concrete: how something is grown, cooked, built or endured, described by somebody who has done it.'
        ],
        readNext: [
            { slug: 'adrienne-rich', name: 'Adrienne Rich', note: 'The same politics, denser on the page.' },
            { slug: 'alicia-ostriker', name: 'Alicia Ostriker', note: 'Jewish material rewritten from the woman\'s side.' },
            { slug: 'audre-lorde', name: 'Audre Lorde', note: 'The political poem as an act of survival.' }
        ]
    },

    'marie-ponsot': {
        body: [
            'She published a first book, raised seven children largely alone, worked as a translator, and did not publish a second collection for twenty-five years. The late work is where the reputation properly begins, which is worth knowing before reading it.',
            'The poems are formally intricate — she loved difficult inherited shapes, particularly the tripled rhyme of the tritina, a compressed form of her own devising — and the intricacy is playful rather than solemn. The subjects are motherhood, ageing, friendship and faith, handled with a wit that never becomes archness. The craft is dense enough that these reward being read twice.'
        ],
        readNext: [
            { slug: 'marilyn-hacker', name: 'Marilyn Hacker', note: 'Contemporary formal virtuosity.' },
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'Rhyme used for pleasure rather than for period.' },
            { slug: 'ruth-stone', name: 'Ruth Stone', note: 'Another long career recognised very late.' }
        ]
    },

    'mary-jo-bang': {
        body: [
            'Cool, allusive and formally restless — the poems borrow from art history, philosophy and pop culture in the same breath, and the tone stays deliberately level over material that is frequently unbearable.',
            'The central book is an elegy sequence for her son, and its refusal to warm up is precisely what makes it work: grief is handled through style, framing and quotation because the direct approach would collapse. She has also translated Dante\'s Inferno into contemporary English studded with modern reference, which is either a scandal or the most vivid version available, depending on the reader.'
        ],
        readNext: [
            { slug: 'lucie-brock-broido', name: 'Lucie Brock-Broido', note: 'Ornate diction in the service of grief.' },
            { slug: 'louise-glck', name: 'Louise Glück', note: 'The plain opposite of this method, on the same subject.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'Classical translation and original work in one practice.' }
        ]
    },

    'mary-karr': {
        body: [
            'Better known for memoir, and the poems are not a sideline — they are where the same Texas childhood, drinking, faith and family get handled without narrative obligation.',
            'The voice is fast, funny and profane, and it turns without warning into something devotional; she is one of very few contemporary American poets writing seriously about conversion without either apologising or preaching. The line is loose and speech-driven, closer to a monologue than a lyric. Read the poems on prayer next to the poems on her mother and the same argument runs through both.'
        ],
        readNext: [
            { slug: 'franz-wright', name: 'Franz Wright', note: 'Faith written from the same territory.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'Family material at comparable exposure.' },
            { slug: 'christian-wiman', name: 'Christian Wiman', note: 'Belief argued in a denser style.' }
        ]
    },

    'philip-levine': {
        body: [
            'The poet of Detroit factory work, and of the specific dignity and boredom of a shift. He worked those jobs before he wrote about them, and the poems never romanticise the labour or the men doing it.',
            'The line is long and speech-driven, the diction plain, and the recurring gesture is naming — individual workers, streets, machines, the Spanish anarchists he wrote about for decades — on the principle that being named is the least a person is owed. He served as United States Poet Laureate. The elegies for his brother and for men he worked beside are the strongest thing in the work.'
        ],
        readNext: [
            { slug: 'gerald-stern', name: 'Gerald Stern', note: 'His close contemporary, and the ecstatic version.' },
            { slug: 'larry-levis', name: 'Larry Levis', note: 'His student, and the more elliptical inheritor.' },
            { slug: 'thomas-mcgrath', name: 'Thomas McGrath', note: 'American radical politics in a long line.' }
        ]
    },

    'robert-w-service': {
        body: [
            'Ballads of the Yukon gold rush, written to be recited and still doing that job a century later. "The Shooting of Dan McGrew" and "The Cremation of Sam McGee" are music-hall narrative verse of a very high order, and they have never needed a critic\'s permission to survive.',
            'The metre is heavy, the rhymes are emphatic, and the comedy and the cold are equally well handled. He also wrote a good deal about the First World War from an ambulance driver\'s vantage, which is grimmer and much less read. Literary opinion has always been condescending about him; readers have never agreed, and on the evidence of the poems out loud, the readers have a case.'
        ],
        readNext: [
            { slug: 'rudyard-kipling', name: 'Rudyard Kipling', note: 'The model for the recitable ballad.' },
            { slug: 'edgar-albert-guest', name: 'Edgar Albert Guest', note: 'The other great popular versifier of the period.' },
            { slug: 'vachel-lindsay', name: 'Vachel Lindsay', note: 'Poetry written to be performed aloud.' }
        ]
    },

    'sandra-mcpherson': {
        body: [
            'A poet of close natural observation — plants, birds, weather, quilts — whose descriptions are exact enough to work as identification and are never only description.',
            'The personal material is handled obliquely: adoption, both as a child and as a parent, runs under the work without being announced, and the poems about objects made by hand are doing that thinking by other means. She has collected outsider art and African American quilts, and the same interest shows in the poems — a preference for made things whose maker is not part of the official record.'
        ],
        readNext: [
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'Exactness about animals and objects.' },
            { slug: 'jane-hirshfield', name: 'Jane Hirshfield', note: 'Attention as a discipline.' },
            { slug: 'linda-bierds', name: 'Linda Bierds', note: 'The same Pacific Northwest, in historical dress.' }
        ]
    },

    'sara-teasdale': {
        body: [
            'Short, musical lyrics about love, solitude and death, written with a clarity that made her enormously popular and then, for decades, critically dismissed. The dismissal was mostly about fashion; the poems are better made than they look.',
            'The technique is worth attention: very plain vocabulary, exact rhyme, and a habit of putting the reversal in the last line so that a sweet poem turns cold in four words. "There Will Come Soft Rains" imagines nature\'s indifference to human extinction and is as unsentimental as anything written in the period. Read her next to Millay and the difference is temperature, not skill.'
        ],
        readNext: [
            { slug: 'edna-st-vincent-millay', name: 'Edna St. Vincent Millay', note: 'The contemporary she is always measured against.' },
            { slug: 'elinor-wylie', name: 'Elinor Wylie', note: 'The same polished lyric, cooler still.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'The Victorian ancestor of this exact music.' }
        ]
    },

    'ted-kooser': {
        body: [
            'Plain Midwestern poems about barns, small towns, old people, tools and weather, written by somebody who spent his working life as an insurance executive and wrote early in the morning before going in.',
            'The method is one clear metaphor per poem, usually placed near the end, and the poems are short enough to be read in a minute. That accessibility is a deliberate position — he ran a project syndicating a poem a week to newspapers — and it costs him nothing in precision: the images are unusual and exact, not familiar. He served as United States Poet Laureate.'
        ],
        readNext: [
            { slug: 'william-e-stafford', name: 'William E. Stafford', note: 'The same plainness, a generation earlier.' },
            { slug: 'linda-pastan', name: 'Linda Pastan', note: 'The domestic lyric at similar scale.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'Rural quiet with a darker undertow.' }
        ]
    },

    'vachel-lindsay': {
        body: [
            'He walked across America trading poems for meals, and wrote verse designed to be chanted, stamped and performed rather than read on a page. The performance was the point, and the poems look strange in print because half their apparatus is missing.',
            'The rhythms are drawn from revival meetings, marching bands and street preaching, and at their best — the poem for the founder of the Salvation Army, the poems about Lincoln and about small-town Illinois — they have a genuine hypnotic drive. Some of the most famous work relies on racial caricature that was objectionable then and is unreadable now, which is a plain fact about the poems and not a reason to pretend the rest is not remarkable.'
        ],
        readNext: [
            { slug: 'carl-sandburg', name: 'Carl Sandburg', note: 'The other Illinois poet of the same moment.' },
            { slug: 'edgar-lee-masters', name: 'Edgar Lee Masters', note: 'The third of that Midwestern trio.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Performance rhythm without the caricature.' }
        ]
    },

    'keith-waldrop': {
        body: [
            'Quiet, disjunctive poems assembled largely by collage — he built books by taking language out of nineteenth-century prose and rearranging it until the source is inaudible and only the tone survives.',
            'The results are far from mechanical: the trilogy that collects this method reads as a sustained meditation on perception and belief, dry and oddly moving. With his wife he ran a small press for decades that published a great deal of experimental and translated poetry, and the translations from French are a substantial body of work in their own right. Read for atmosphere before trying to read for argument.'
        ],
        readNext: [
            { slug: 'rosmarie-waldrop', name: 'Rosmarie Waldrop', note: 'His wife and co-publisher, working adjacent ground.' },
            { slug: 'michael-palmer', name: 'Michael Palmer', note: 'The same disjunction, more lyrical.' },
            { slug: 'susan-howe', name: 'Susan Howe', note: 'Archives cut up and rearranged.' }
        ]
    },

    'charles-bukowski': {
        body: [
            'Enormously popular and critically resisted, usually for the same reasons. The poems are short-lined, plainspoken and anti-literary by design — drinking, horse racing, rented rooms, the post office job, women, other writers — and the persona is so consistent that readers routinely mistake it for an absence of craft.',
            'It is not. The line breaks are doing steady work, the endings are timed, and the best poems turn on a single flat observation withheld until the last line. The volume is a problem: he published constantly and the ratio of good to slack is poor, so an anthology serves him better than a complete edition. The misogyny in some of it is real and is not a misreading.'
        ],
        readNext: [
            { slug: 'lawrence-ferlinghetti', name: 'Lawrence Ferlinghetti', note: 'The other great populariser of that era.' },
            { slug: 'frank-stanford', name: 'Frank Stanford', note: 'American outsider poetry at its wildest.' },
            { slug: 'etheridge-knight', name: 'Etheridge Knight', note: 'The plainspoken poem with far more at stake.' }
        ]
    },

    'chase-twichell': {
        body: [
            'Clear, unhurried poems about the natural world, memory and Zen practice, written in a plain declarative line that resists the temptation to console.',
            'The best of them work by refusing the epiphany the shape seems to promise: an observation is made, its implications are followed, and the poem stops before it can become a lesson. Family material — a difficult father, alcohol — surfaces without being made into a narrative. She also founded a small press dedicated to poetry, and the poems have that editor\'s dislike of a wasted line.'
        ],
        readNext: [
            { slug: 'jane-hirshfield', name: 'Jane Hirshfield', note: 'Zen practice and lyric attention in one place.' },
            { slug: 'mary-oliver', name: 'Mary Oliver', note: 'The same landscape, warmer and more consoling.' },
            { slug: 'gary-snyder', name: 'Gary Snyder', note: 'The Buddhist and ecological line she works in.' }
        ]
    },

    'dana-gioia': {
        body: [
            'A formalist and an essayist, and the essay came first for many readers: his argument that poetry had retreated into the academy and lost its general audience set off a decade of quarrelling and helped give the New Formalism its name.',
            'The poems themselves are quieter than the polemic. They are metrical, unshowy and often elegiac — the sequence written after the death of his infant son is the work that matters most — and the influence of Italian and Latin lyric is audible. He worked in business for years before writing full time and later ran a national arts agency, which is unusual for a poet and shows in the poems\' interest in ordinary working life.'
        ],
        readNext: [
            { slug: 'timothy-steele', name: 'Timothy Steele', note: 'The same formal argument, more strictly applied.' },
            { slug: 'a-e-stallings', name: 'A. E. Stallings', note: 'The next generation of that project.' },
            { slug: 'donald-justice', name: 'Donald Justice', note: 'The elder formalist behind much of this.' }
        ]
    },

    'j-patrick-lewis': {
        body: [
            'A prolific children\'s poet with an unusual range: riddles, animal poems, biographical portraits in verse, concrete poems and history written for readers who have not been told yet that poetry is difficult.',
            'The craft is real and largely invisible, which is the job — the rhymes have to be exact and the metre has to hold or a child reading aloud will stumble. He served as national Children\'s Poet Laureate. The books about historical figures and about world geography are the ones that show most clearly that writing simply and writing thinly are different things.'
        ],
        readNext: [
            { slug: 'jack-prelutsky', name: 'Jack Prelutsky', note: 'The comic end of the same shelf.' },
            { slug: 'x-j-kennedy', name: 'X. J. Kennedy', note: 'Light verse for both audiences at once.' },
            { slug: 'lewis-carroll', name: 'Lewis Carroll', note: 'The ancestor of nonsense done properly.' }
        ]
    },

    'john-ciardi': {
        body: [
            'Poet, translator and, for a long stretch, the most audible explainer of poetry in America — his weekly column and his textbook on how a poem means taught a generation how to read one without being lectured.',
            'His translation of Dante was written to be read aloud by people who had never read Dante, and it succeeds at that better than more scholarly versions. The original poems are formally solid, conversational and often comic, and the poems for children are as good as the adult work. He wrote as a bomber crewman in the Pacific, and the war poems have none of the consolation the period generally offered.'
        ],
        readNext: [
            { slug: 'karl-shapiro', name: 'Karl Shapiro', note: 'The same war and the same generation.' },
            { slug: 'richard-wilbur', name: 'Richard Wilbur', note: 'The formal peak of that cohort.' },
            { slug: 'x-j-kennedy', name: 'X. J. Kennedy', note: 'Wit and technique in the same proportions.' }
        ]
    },

    'john-koethe': {
        body: [
            'A philosopher by profession, and the poems read like thinking rather than like the record of a thought — long, syntactically calm meditations that circle a question about time, memory and one\'s own past without ever landing on a conclusion.',
            'The obvious debt is to Ashbery, but the temperature is different: where Ashbery deflects, Koethe stays with the sentence and lets it exhaust itself. The recurring subject is a life examined from late in it — what a person expected, what they got, whether the difference means anything. The poems are long and the reward is cumulative; there is no anthology piece to sample.'
        ],
        readNext: [
            { slug: 'john-ashbery', name: 'John Ashbery', note: 'The clearest influence, and the more evasive.' },
            { slug: 'wallace-stevens', name: 'Wallace Stevens', note: 'The philosophical lyric before either of them.' },
            { slug: 'mark-strand', name: 'Mark Strand', note: 'The same meditative register, flatter.' }
        ]
    },

    'lawrence-ferlinghetti': {
        body: [
            'He ran the bookstore and the press that published Ginsberg, defended it in an obscenity trial and won, and did more than anyone to put postwar American poetry into paperback and into people\'s hands. That alone would be the entry.',
            'The poems are performance-shaped: lines scattered across the page to score the pauses, jokes, political anger and a persistent lyricism that the wisecracking is meant to keep from turning soft. He wrote in the tradition of public speech rather than of the seminar, which is why critics undervalued him and readers did not. The painting and the poetry share a preference for the broad clear gesture.'
        ],
        readNext: [
            { slug: 'allen-ginsberg', name: 'Allen Ginsberg', note: 'The poet he published and defended in court.' },
            { slug: 'gregory-corso', name: 'Gregory Corso', note: 'The Beat with the strangest ear.' },
            { slug: 'kenneth-rexroth', name: 'Kenneth Rexroth', note: 'The San Francisco elder behind the whole scene.' }
        ]
    },

    'louis-simpson': {
        body: [
            'He began as a formalist and moved into a plain, deceptively casual free verse, and the shift is one of the clearest examples of what happened to American poetry in the middle of the last century.',
            'The war poems, written out of infantry service in Europe, are among the least rhetorical of their generation. The later work turns to suburban New Jersey and Long Island and asks, in a tone of mild bafflement, what American life is actually for — the poem about the open road and what became of it is the recurring gesture. Jamaican-born, Jewish and Scottish by descent, he wrote as somebody permanently slightly outside the material.'
        ],
        readNext: [
            { slug: 'robert-bly', name: 'Robert Bly', note: 'The contemporary who pushed the same shift hardest.' },
            { slug: 'james-wright', name: 'James Wright', note: 'The same turn from formal to plain, done better.' },
            { slug: 'karl-shapiro', name: 'Karl Shapiro', note: 'The other soldier-poet of the period.' }
        ]
    },

    'lyn-hejinian': {
        body: [
            'A central figure in Language writing, and the least forbidding way in is her autobiography made of sentences that do not follow one another — a book structured by the number of years the writer had lived, revised later to add more.',
            'The principle throughout is that meaning is made by the reader rather than delivered, so the sentences are complete and lucid while the connections between them are left open. Her essay arguing for the open text states the position directly. It is difficult work that is never obscure at the level of the line, which is the distinction worth holding onto.'
        ],
        readNext: [
            { slug: 'charles-bernstein', name: 'Charles Bernstein', note: 'The polemical end of the same movement.' },
            { slug: 'rosmarie-waldrop', name: 'Rosmarie Waldrop', note: 'The sentence as a unit of composition.' },
            { slug: 'gertrude-stein', name: 'Gertrude Stein', note: 'The ancestor of all of it.' }
        ]
    },

    'martn-espada': {
        body: [
            'A political poet who worked as a tenant lawyer before writing full time, and the poems have a lawyer\'s respect for the specific: names, dates, addresses, what exactly was done to whom.',
            'The subjects are Puerto Rican history, immigrant labour, evictions and the people the record leaves out, and the mode is narrative and declarative rather than oblique — these are poems written to be understood on first hearing, and they are built to be read aloud. The elegies are the strongest, particularly the sequence for the restaurant workers killed on September 11th, most of them undocumented and unnamed in the coverage.'
        ],
        readNext: [
            { slug: 'juan-felipe-herrera', name: 'Juan Felipe Herrera', note: 'The same tradition, more experimental.' },
            { slug: 'jimmy-santiago-baca', name: 'Jimmy Santiago Baca', note: 'The poem written out of confinement.' },
            { slug: 'philip-levine', name: 'Philip Levine', note: 'Work and the naming of workers.' }
        ]
    },

    'natasha-trethewey': {
        body: [
            'Formally exact poems about the American South, race and the archive — what was photographed, what was recorded in a ledger, and what was deliberately not written down.',
            'The central book takes the Louisiana Native Guards, Black Union soldiers whose service was largely erased, and sets their story against her own mixed-race family in Mississippi. She uses inherited forms — sonnet, villanelle, pantoum — precisely because the material is about official structures and who they exclude. She served two terms as United States Poet Laureate. The elegies for her mother are the most personal and the least ornamented work she has done.'
        ],
        readNext: [
            { slug: 'rita-dove', name: 'Rita Dove', note: 'The historical sequence held to domestic scale.' },
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'The ancestor of the documentary historical poem.' },
            { slug: 'elizabeth-alexander', name: 'Elizabeth Alexander', note: 'Archive and family in the same frame.' }
        ]
    },

    'paul-laurence-dunbar': {
        body: [
            'The first Black American poet to earn a national reputation, and his career is a case study in what that cost. He wrote in two modes — formal literary English and a dialect his publishers and audiences demanded — and he said plainly that the dialect work was the price of being read at all.',
            'Read both. The dialect poems are technically skilful and were used to confirm exactly the stereotype he resented; the standard-English lyrics include "We Wear the Mask", which states the whole predicament in fifteen lines and is one of the best short poems of its century. He died young, having written an enormous amount in about a decade.'
        ],
        readNext: [
            { slug: 'claude-mckay', name: 'Claude McKay', note: 'The next generation, in formal sonnets.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Vernacular reclaimed on the poet\'s own terms.' },
            { slug: 'countee-cullen', name: 'Countee Cullen', note: 'The Harlem Renaissance formalist.' }
        ]
    },

    'peter-balakian': {
        body: [
            'A poet and prose writer whose central material is the Armenian genocide — inherited rather than witnessed, reaching him through a grandmother\'s memory and through documents he later spent years researching as a historian.',
            'The poems avoid the two easy shapes for that subject: they are neither testimony nor lament. They move associatively between New Jersey suburbs, art, ruins and atrocity, letting the historical material surface in the middle of ordinary life the way an inheritance actually does. The later books widen out to other twentieth-century violences and to the question of what a witness at two removes is entitled to say.'
        ],
        readNext: [
            { slug: 'carolyn-forch', name: 'Carolyn Forché', note: 'The poetry of witness as a stated project.' },
            { slug: 'yehuda-amichai', name: 'Yehuda Amichai', note: 'History carried in domestic language.' },
            { slug: 'adam-zagajewski', name: 'Adam Zagajewski', note: 'The European inheritance of the same century.' }
        ]
    },

    'rachel-wetzsteon': {
        body: [
            'Formally skilled, urban and witty — poems set in Manhattan, full of parks, apartments and unreturned affection, written in metre handled lightly enough that the metre rarely announces itself.',
            'The wit is genuine and so is the melancholy under it; she was very good at the poem that jokes its way to a conclusion it cannot make funny. She was a scholar of English poetry and the reading shows in the craft rather than in allusion. She died young, which colours how the last book is now read, and the poems themselves are more robust than that framing suggests.'
        ],
        readNext: [
            { slug: 'randall-mann', name: 'Randall Mann', note: 'Contemporary formal verse, another city.' },
            { slug: 'marilyn-hacker', name: 'Marilyn Hacker', note: 'Formal skill and urban material.' },
            { slug: 'james-schuyler', name: 'James Schuyler', note: 'New York observed with less armour.' }
        ]
    },

    'ralph-waldo-emerson': {
        body: [
            'The poems have always been read as an appendix to the essays, which is unfair but understandable — the prose is where the ideas move, and the verse frequently sounds like a man putting his own doctrine into rhyme.',
            'Where he is good he is very good: the short gnomic poems, the ones about compensation and about the world being made of the same stuff as the mind, have a hardness the prose never quite reaches. His practical importance is enormous — he told American writers to stop imitating England, and Whitman took the instruction literally. Read the essays first; then the poems make sense as the compressed version.'
        ],
        readNext: [
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The poet who answered the summons.' },
            { slug: 'henry-david-thoreau', name: 'Henry David Thoreau', note: 'The same circle, and the sharper eye.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Read him closely, and disagreed at every turn.' }
        ]
    },

    'scott-cairns': {
        body: [
            'A devotional poet working from Orthodox Christianity, which gives the poems a vocabulary — icon, mystery, the fathers of the church — that most contemporary American religious verse does not have available.',
            'The poems are playful about it. He writes glosses on Hebrew words, rewrites biblical episodes from off-centre vantages, and treats theology as something to be argued with in ordinary syntax. The tone is essayistic and often comic, which keeps a body of work about the sacred from becoming pious. Read the poems that take a single word apart; they are the clearest demonstration of the method.'
        ],
        readNext: [
            { slug: 'christian-wiman', name: 'Christian Wiman', note: 'Contemporary faith in a denser style.' },
            { slug: 'george-herbert', name: 'George Herbert', note: 'The devotional tradition behind all of this.' },
            { slug: 'fanny-howe', name: 'Fanny Howe', note: 'Belief approached without resolution.' }
        ]
    },

    'sharon-olds': {
        body: [
            'Direct, physical and frequently shocking on first reading — the body, sex, childbirth, a father\'s alcoholism and death written with an explicitness that was genuinely new when it arrived and is now widely imitated.',
            'The technique is more controlled than the material suggests: long lines that break in the middle of a phrase, an insistent present tense, and metaphors drawn from anatomy and from the kitchen in the same poem. The book about her father\'s dying and the later book about the end of her marriage are the two that show the method under real pressure. Read a few at a time; the intensity does not dilute.'
        ],
        readNext: [
            { slug: 'brenda-shaughnessy', name: 'Brenda Shaughnessy', note: 'The next generation of the body poem.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'The same subject at a fraction of the length.' },
            { slug: 'anne-sexton', name: 'Anne Sexton', note: 'The ancestor of this exposure.' }
        ]
    },

    'stevie-smith': {
        body: [
            'Unclassifiable and constantly underestimated. The poems look like light verse — nursery rhythms, comic rhymes, her own scrawled drawings alongside — and they are about death, loneliness, God and the wish to stop.',
            '"Not Waving but Drowning" is the famous one and is exactly the method: twelve lines, a joke of a title, and a man who was too far out all his life. The voice is childlike without being innocent, and it uses the singsong to say things a serious tone could not carry. She read her poems half-sung in public, which the recordings confirm was not a gimmick.'
        ],
        readNext: [
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Hymn metre used for the same unsettling ends.' },
            { slug: 'charlotte-mew', name: 'Charlotte Mew', note: 'The English predecessor in oddness and isolation.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'Who admired her, and shared the bleakness.' }
        ]
    },

    'thomas-mcgrath': {
        body: [
            'An American radical poet who was blacklisted after refusing to testify before a congressional committee, lost his teaching post, and kept writing for decades outside the literary economy.',
            'The major work is a long autobiographical poem, written in instalments over most of his life, that moves between a North Dakota farm childhood, labour organising, Hollywood and exile. It is Whitmanic in scale but sceptical rather than celebratory, and its politics are stated rather than implied. The short poems are more lyrical and are the easier place to begin, though the long poem is the achievement.'
        ],
        readNext: [
            { slug: 'philip-levine', name: 'Philip Levine', note: 'Labour written with the same seriousness.' },
            { slug: 'kenneth-rexroth', name: 'Kenneth Rexroth', note: 'The other great American radical of the period.' },
            { slug: 'muriel-rukeyser', name: 'Muriel Rukeyser', note: 'Politics and documentary in the same practice.' }
        ]
    },

    'tracy-k-smith': {
        body: [
            'Her best-known book takes David Bowie, the Hubble telescope and her father\'s work as an engineer on it and turns them into an elegy — science fiction used as elegy is an unusual move and it works completely.',
            'Elsewhere she writes about race, American history and the archive, including a sequence built from letters by Black Civil War soldiers and their families, presented with almost no editorial intervention. She served two terms as United States Poet Laureate and spent them taking poetry to places that do not usually get visits. The register is calm and unhurried even when the material is not.'
        ],
        readNext: [
            { slug: 'natasha-trethewey', name: 'Natasha Trethewey', note: 'The archive handled with the same care.' },
            { slug: 'terrance-hayes', name: 'Terrance Hayes', note: 'Her contemporary, and formally restless.' },
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'The elder both of them work from.' }
        ]
    },

    'w-d-snodgrass': {
        body: [
            'His first book is usually named as the opening of American confessional poetry — poems about a divorce and a daughter he could no longer see, written in strict rhyme and metre, which is the part that gets forgotten.',
            'That combination is the point: the formality is what keeps the private material from becoming a complaint, and later confessional poets mostly abandoned it. He disliked the label and spent the rest of his career elsewhere, including a long, uncomfortable sequence of monologues spoken by members of Hitler\'s inner circle. That book is difficult in every sense and is the other thing he should be known for.'
        ],
        readNext: [
            { slug: 'robert-lowell', name: 'Robert Lowell', note: 'His teacher, who followed him into the material.' },
            { slug: 'anne-sexton', name: 'Anne Sexton', note: 'The same moment, without the formal brake.' },
            { slug: 'donald-justice', name: 'Donald Justice', note: 'Formal control kept to the end.' }
        ]
    },

    'a-e-housman': {
        body: [
            'A great classical scholar who wrote a small quantity of very plain English verse about young men dying, and has never been out of print since.',
            'The poems are short, rhymed, ballad-shaped and almost childishly simple in vocabulary, which is exactly why they lodge: there is nothing between the reader and the statement. The recurring subject is early death — soldiers, suicides, hanged men, the beautiful and the doomed — treated with a stoicism that admits no consolation whatsoever. His scholarly prose was famously savage; the poems are the other half of the same temperament, and the restraint in them is total.'
        ],
        readNext: [
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'The same bleakness, in a rougher music.' },
            { slug: 'wilfred-owen', name: 'Wilfred Owen', note: 'The young soldiers Housman elegised in advance.' },
            { slug: 'edward-thomas', name: 'Edward Thomas', note: 'English quiet a generation later.' }
        ]
    },

    'a-r-ammons': {
        body: [
            'A poet of process rather than of finished perception. The poems watch a wind, a dune, a stream or a thought in the act of changing, and the syntax is built to keep going — colons instead of full stops, so a poem can run for pages without ever closing a sentence.',
            'He wrote one long poem on a roll of adding-machine tape, letting the width of the tape set the line, which is the clearest statement of the method: the form is a constraint accepted in advance and then simply inhabited. The short poems are witty and the long ones are where the thinking happens. Science, especially physics and ecology, is native vocabulary here rather than borrowed imagery.'
        ],
        readNext: [
            { slug: 'wallace-stevens', name: 'Wallace Stevens', note: 'The philosophical lyric he grew out of.' },
            { slug: 'charles-wright', name: 'Charles Wright', note: 'The long meditative American line.' },
            { slug: 'ralph-waldo-emerson', name: 'Ralph Waldo Emerson', note: 'The nature-as-mind argument, at its source.' }
        ]
    },

    'albert-goldbarth': {
        body: [
            'Maximal, digressive and encyclopedic — a single poem can carry pulp science fiction, Sumerian archaeology, a marriage, a comic book and a physics paper, and the pleasure is in watching the connections hold.',
            'He collects things, and the poems behave like a collection: accumulation is the structure, not a failure of editing. Underneath the erudition the concerns are ordinary and constant — love, mortality, the wish to keep everything — and the jokes are frequently a way of approaching them sideways. Long poems are the natural unit; a short Goldbarth is not really representative.'
        ],
        readNext: [
            { slug: 'james-tate', name: 'James Tate', note: 'American strangeness with a comic surface.' },
            { slug: 'dean-young', name: 'Dean Young', note: 'Digression as a working method.' },
            { slug: 'frederick-seidel', name: 'Frederick Seidel', note: 'Erudition put to entirely different use.' }
        ]
    },

    'alberto-ros': {
        body: [
            'Poems from the Arizona border, written by somebody raised on it — Spanish and English in the same sentence, and the border treated as a place people live rather than as a symbol.',
            'The mode is closer to storytelling than to lyric: small-town characters, grandmothers, shopkeepers, a whole populated world rendered with an even affection that never tips into nostalgia. He has said his English carries the syntax of the Spanish he grew up hearing, and that slight torque is audible throughout. He served as the first poet laureate of Arizona, and much of the later work is deliberately civic.'
        ],
        readNext: [
            { slug: 'gary-soto', name: 'Gary Soto', note: 'Californian childhood in the same register.' },
            { slug: 'juan-felipe-herrera', name: 'Juan Felipe Herrera', note: 'The performative end of the same tradition.' },
            { slug: 'naomi-shihab-nye', name: 'Naomi Shihab Nye', note: 'Plain warmth carrying political weight.' }
        ]
    },

    'atsuro-riley': {
        body: [
            'A very small body of work with an entirely distinctive sound. The poems are set in the South Carolina lowcountry and are built out of compressed, hyphenated, half-invented words that behave like Anglo-Saxon compounds — the language is doing the describing before any image arrives.',
            'The effect is closer to Hopkins than to anything contemporary, and it is not decoration: the mud, kudzu and creosote of that landscape are being made audible rather than pictured. Characters recur across the poems so the books read as a single place seen repeatedly. Read aloud, or a great deal of it is lost.'
        ],
        readNext: [
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The compound-word ancestor.' },
            { slug: 'c-d-wright', name: 'C. D. Wright', note: 'Southern speech put to experimental use.' },
            { slug: 'frank-stanford', name: 'Frank Stanford', note: 'The same landscape at its wildest.' }
        ]
    },

    'camille-t-dungy': {
        body: [
            'A poet and essayist who has done as much as anyone to complicate the idea of American nature writing — she edited a landmark anthology of African American nature poetry, and the argument in it runs through her own work.',
            'The poems set landscape against history: a field is a field and also a place where something happened, and the pastoral tradition\'s assumption of safety in the open air is not available to everyone. She also writes about motherhood, illness and travel with the same double vision. The historical sequences use archival voices, and the personal essays are the clearest guide to what the poems assume.'
        ],
        readNext: [
            { slug: 'ross-gay', name: 'Ross Gay', note: 'The garden and the body, joyfully.' },
            { slug: 'ed-roberson', name: 'Ed Roberson', note: 'Nature and the city in an experimental line.' },
            { slug: 'natasha-trethewey', name: 'Natasha Trethewey', note: 'Landscape read as historical record.' }
        ]
    },

    'david-baker': {
        body: [
            'A poet of the Midwest — Ohio farmland, rivers, small towns — writing a formally careful line that carries a great deal of natural detail and a steady undertow of loss.',
            'The poems are ecological without being polemical: what is disappearing is named precisely, and the naming does the work. He is also a long-serving poetry editor and a critic, and the poems have an editor\'s ear for a line that is doing less than it appears to. The strongest work sets a domestic occasion against a landscape that is quietly failing, and refuses to make the comparison explicit.'
        ],
        readNext: [
            { slug: 'ted-kooser', name: 'Ted Kooser', note: 'The plainer Midwestern lyric.' },
            { slug: 'stanley-plumly', name: 'Stanley Plumly', note: 'The same generation and the same elegiac care.' },
            { slug: 'james-wright', name: 'James Wright', note: 'Ohio, and where this landscape poem starts.' }
        ]
    },

    'derek-mahon': {
        body: [
            'One of the great formal poets in twentieth-century Irish English — rhymed, metrical, urbane, and permanently drawn to abandoned places: sheds, hotels, disused mills, a lighthouse, the edge of the sea in bad weather.',
            'His best-known poem finds a shed full of mushrooms that have been waiting since the owners left, and turns them into every group of people history has forgotten to come back for. That is characteristic: an exact physical scene, held long enough that the historical weight arrives without being asserted. He wrote against the pressure to make Northern Irish poetry only about the conflict, and the distance is part of the meaning.'
        ],
        readNext: [
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'His exact contemporary, and the opposite instinct.' },
            { slug: 'louis-macneice', name: 'Louis MacNeice', note: 'The Northern predecessor for that urbanity.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'The English formalist he is often measured against.' }
        ]
    },

    'dorianne-laux': {
        body: [
            'Plainspoken, physical poems about working-class American life — waitressing, factory shifts, motherhood, desire in middle age — written in a line that stays close to speech and never reaches for a literary register.',
            'The sensuality is the distinguishing feature: food, skin, heat and music are described with an appetite that is rare in poems about scarcity, and it keeps the material from reading as documentation of hardship. She has written a good deal about music and about the body ageing, and the later poems about illness and about her mother are the most exposed. Accessible on first reading and better on the third.'
        ],
        readNext: [
            { slug: 'philip-levine', name: 'Philip Levine', note: 'Working life named plainly.' },
            { slug: 'kim-addonizio', name: 'Kim Addonizio', note: 'Her frequent collaborator, and sharper-edged.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'The body written without decorum.' }
        ]
    },

    'eleanor-wilner': {
        body: [
            'A poet who works almost entirely through myth — Greek, biblical, historical — not to decorate a personal occasion but to argue with the stories themselves about what they taught people to accept.',
            'The poems are discursive and long-breathed, and they usually turn on a reversal: the myth is retold until the moment where it could have gone otherwise, and then held there. The politics are explicit in the later books, particularly about war, and the mythological frame is what lets them avoid the op-ed. She has also edited widely, and the erudition is worn as working material rather than as display.'
        ],
        readNext: [
            { slug: 'alicia-ostriker', name: 'Alicia Ostriker', note: 'Myth rewritten from the same conviction.' },
            { slug: 'louise-glck', name: 'Louise Glück', note: 'Myth used as a way of not writing autobiography.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'Classical material at its most inventive.' }
        ]
    },

    'forrest-gander': {
        body: [
            'A poet, translator and trained geologist, and all three are visible: the poems handle rock, erosion and deep time with technical accuracy, and the translations from Spanish and Japanese have shaped the way his own lines move.',
            'The work is formally adventurous — books that mix verse, prose and photography, a novel in poems — and the central subjects are intimacy and loss set against a landscape that outlasts both. The book written after the death of his wife, the poet C. D. Wright, is the most direct, and it uses the geology as consolation and as refusal of consolation at once.'
        ],
        readNext: [
            { slug: 'c-d-wright', name: 'C. D. Wright', note: 'His wife and closest collaborator.' },
            { slug: 'brenda-hillman', name: 'Brenda Hillman', note: 'Geology and poetry in one practice.' },
            { slug: 'arthur-sze', name: 'Arthur Sze', note: 'Science and translation feeding the same line.' }
        ]
    },

    'geoffrey-hill': {
        body: [
            'Difficult on purpose, and unapologetic about it — he argued that difficulty is a form of respect for the reader, and the poems act on that belief without compromise.',
            'The early work is dense, formal and preoccupied with martyrdom, English history and the moral hazard of writing beautifully about atrocity; the sequence on the murdered European Jews interrogates its own right to exist as it goes. The late books are looser, angrier and full of contemporary rubbish — advertising, politics, slang — used as material. Expect to reread. He is among the most demanding poets in modern English and among the few who repay the whole effort.'
        ],
        readNext: [
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The density and the religious pressure.' },
            { slug: 't-s-eliot', name: 'T. S. Eliot', note: 'The modernist inheritance he argues with.' },
            { slug: 'paul-celan', name: 'Paul Celan', note: 'The other poet of atrocity and refusal.' }
        ]
    },

    'howard-moss': {
        body: [
            'For decades the poetry editor of a magazine that could make a career, which has slightly obscured the fact that he was a very good poet in his own right.',
            'The poems are formally polished, urbane and elegiac, drawn to summer houses, water and the moment a season turns. The wit is dry and the sadness is unforced. He wrote well about music and about other poets, and the criticism shares the verse\'s preference for exactness over enthusiasm. Read the water and Long Island poems first.'
        ],
        readNext: [
            { slug: 'richard-wilbur', name: 'Richard Wilbur', note: 'The formal generation he belonged to.' },
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: 'The poet he published and admired.' },
            { slug: 'james-schuyler', name: 'James Schuyler', note: 'New York quiet without the formal frame.' }
        ]
    },

    'james-wright': {
        body: [
            'He wrote two careers. The first is formal, metrical and traditional; the second, beginning with a book in the early sixties, is plain, image-driven free verse and changed American poetry.',
            'The Ohio poems are the heart of it: mill towns, football, drunks, the river, people whose lives were used up by industry, described without a trace of condescension. The famous lying-in-a-hammock poem ends on a line about having wasted his life that readers have been arguing about ever since. The late Italian poems are warmer and less known. Deep sympathy for the defeated is the constant across all of it.'
        ],
        readNext: [
            { slug: 'robert-bly', name: 'Robert Bly', note: 'His collaborator in the turn to the deep image.' },
            { slug: 'philip-levine', name: 'Philip Levine', note: 'Industrial America named exactly.' },
            { slug: 'franz-wright', name: 'Franz Wright', note: 'His son, working the same darkness.' }
        ]
    },

    'john-fuller': {
        body: [
            'An English poet of enormous technical range — sonnets, sestinas, verse letters, comic narrative, riddles — who treats form as a source of pleasure rather than a discipline to be endured.',
            'The wit is the entry point and the poems are frequently more unsettling than the surface suggests: a light metre carrying a genuinely strange story is his most characteristic effect. He is also a novelist and was a long-standing Oxford teacher, and he ran a private press that printed early work by poets who became well known. Read the narrative poems, where the technique has something to carry.'
        ],
        readNext: [
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'The English formal generation just ahead of him.' },
            { slug: 'paul-muldoon', name: 'Paul Muldoon', note: 'Formal ingenuity pushed further still.' },
            { slug: 'x-j-kennedy', name: 'X. J. Kennedy', note: 'Light verse handled with full technique.' }
        ]
    },

    'michael-palmer': {
        body: [
            'Lyrical and disjunctive at once, which is an unusual combination — the sentences are beautiful and they do not connect, and the refusal to connect is the argument.',
            'He is associated with Language writing without belonging to it, having kept a commitment to music and to the lyric "I" that the movement mostly renounced. The poems circle politics, painting and the unreliability of statement, and they frequently quote or answer other poets, including in translation. Read for the sound and let the sense arrive late; taking notes on the first pass is the wrong approach.'
        ],
        readNext: [
            { slug: 'robert-duncan', name: 'Robert Duncan', note: 'The San Francisco elder behind this lyricism.' },
            { slug: 'paul-celan', name: 'Paul Celan', note: 'The broken lyric at its source.' },
            { slug: 'peter-gizzi', name: 'Peter Gizzi', note: 'The next generation of the same music.' }
        ]
    },

    'paisley-rekdal': {
        body: [
            'Formally various — free verse, received forms, documentary sequences, hybrid prose — and the variety is driven by subject rather than by restlessness: each book seems to find the shape its material needs.',
            'The recurring concerns are mixed-race identity, sexual violence, the American West and how a public monument or a photograph decides what gets remembered. One long project reckons with a transcontinental railroad built by Chinese labourers whose names went unrecorded. The essays and the poems are close relatives, and the research is visible without the poems turning into reports.'
        ],
        readNext: [
            { slug: 'natasha-trethewey', name: 'Natasha Trethewey', note: 'The archive as a lifelong subject.' },
            { slug: 'marilyn-chin', name: 'Marilyn Chin', note: 'Chinese American inheritance, more combative.' },
            { slug: 'camille-t-dungy', name: 'Camille T. Dungy', note: 'Landscape read against history.' }
        ]
    },

    'richard-wilbur': {
        body: [
            'The most technically accomplished American formalist of his generation, and the one his contemporaries left behind when they went confessional. He kept rhyming, and time has been kinder to him than the sixties were.',
            'The poems are elegant, witty and rooted in the visible world — laundry on a line becoming angels is the most quoted instance — and they are unusually good-tempered, which was held against him. Underneath the polish there is real darkness, most visibly in the war poems and the late elegies. His translations of Molière and Racine into rhymed English are still the standard performing texts, and they are the best argument for what his ear could do.'
        ],
        readNext: [
            { slug: 'anthony-hecht', name: 'Anthony Hecht', note: 'The same formal school, far darker.' },
            { slug: 'howard-nemerov', name: 'Howard Nemerov', note: 'Wit and metre in the same proportions.' },
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: 'Formal precision without the polish showing.' }
        ]
    },

    'robert-duncan': {
        body: [
            'A poet of the grand visionary tradition who took Romanticism, myth, theosophy and medieval mysticism entirely seriously at a moment when American poetry was mostly going the other way.',
            'He described the poem as a field to be entered rather than an object to be made, and the long serial works — the passages and structures of rime that run across books — behave accordingly, opening rather than concluding. He also stopped publishing for fifteen years on principle, and the late books that broke the silence are the strongest. His public break with Denise Levertov over the Vietnam war is one of the most serious arguments American poets have had about what poetry may do.'
        ],
        readNext: [
            { slug: 'charles-olson', name: 'Charles Olson', note: 'The Black Mountain theory of the open field.' },
            { slug: 'denise-levertov', name: 'Denise Levertov', note: 'His closest correspondent, until the war.' },
            { slug: 'robin-blaser', name: 'Robin Blaser', note: 'The third of the San Francisco visionaries.' }
        ]
    },

    'robert-hass': {
        body: [
            'Clear, conversational Californian poems that move between landscape, food, sex, politics and reading with an ease that hides how much technique is involved in the transitions.',
            'The line is long and prose-adjacent, and the poems frequently pause to define a word or correct themselves, which turns the act of thinking into the poem\'s subject. He translated Czesław Miłosz for decades and co-translated Japanese haiku, and both are audible — the moral seriousness from one, the trust in the bare image from the other. He served as United States Poet Laureate and has written a great deal about watersheds and environmental politics.'
        ],
        readNext: [
            { slug: 'czeslaw-milosz', name: 'Czeslaw Milosz', note: 'The poet he spent decades translating.' },
            { slug: 'brenda-hillman', name: 'Brenda Hillman', note: 'His wife, and the experimental counterpart.' },
            { slug: 'robert-pinsky', name: 'Robert Pinsky', note: 'His contemporary and frequent interlocutor.' }
        ]
    },

    'robin-blaser': {
        body: [
            'A central figure of the San Francisco Renaissance who spent most of his working life in Canada, and whose reputation has always been carried by other poets rather than by anthologies.',
            'His life\'s work is a single continuing serial poem, written over decades, in which the individual pieces are less units than moments in an ongoing argument about the sacred, the public world and what a poem can hold. The essay on the practice of outside is the key to it. He also edited and defended the work of his friend Jack Spicer, and the two are best read together.'
        ],
        readNext: [
            { slug: 'robert-duncan', name: 'Robert Duncan', note: 'His close contemporary in that circle.' },
            { slug: 'michael-palmer', name: 'Michael Palmer', note: 'The later inheritance of this serial lyric.' },
            { slug: 'charles-olson', name: 'Charles Olson', note: 'The theory of the poem as an open field.' }
        ]
    },

    'ruth-stone': {
        body: [
            'She wrote for more than sixty years, largely unrecognised, and the major honours arrived when she was in her eighties. That shape is inseparable from the poems, many of which are about poverty, rural Vermont and a widowhood that began abruptly and never ended.',
            'The tone is the surprise: funny, colloquial, unsentimental and frequently furious, with an almost cosmic sweep — physics and deep space turn up beside a wood stove without any change of register. She described poems as arriving across the landscape and having to be caught, which sounds fey until you read how exact the results are.'
        ],
        readNext: [
            { slug: 'lorine-niedecker', name: 'Lorine Niedecker', note: 'Rural poverty written with the same economy.' },
            { slug: 'marie-ponsot', name: 'Marie Ponsot', note: 'Another very late recognition.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'Grief written without decorum.' }
        ]
    },

    'ted-berrigan': {
        body: [
            'His central book is a sequence of sonnets built by cutting up and recombining his own lines, other people\'s lines and overheard talk, so that phrases recur in new positions and accumulate meaning by repetition.',
            'It should be a stunt and it is not — the sequence is genuinely moving, and the repeated lines start to work like refrains in a song. He was the hub of the second-generation New York School, a famously generous teacher and talker, and the later poems are looser, more direct and full of names, pills, cigarettes and friends. Read the sonnets straight through rather than sampling.'
        ],
        readNext: [
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'The first generation he took his permission from.' },
            { slug: 'ron-padgett', name: 'Ron Padgett', note: 'His closest collaborator.' },
            { slug: 'bernadette-mayer', name: 'Bernadette Mayer', note: 'Procedure applied to daily life.' }
        ]
    },

    'terrance-hayes': {
        body: [
            'Formally inventive in a way that is rare and unforced — he invents forms as readily as he uses inherited ones, and the invented ones usually encode something about their subject rather than being a puzzle for its own sake.',
            'One book is seventy sonnets written in a single year, all sharing a title, addressed to a future assassin; the pressure of that repetition is the book\'s argument about American violence. Music, painting, fatherhood, Black masculinity and other poets run through the work, and the wordplay is constant. Funny and frightening in the same line, frequently.'
        ],
        readNext: [
            { slug: 'kevin-young', name: 'Kevin Young', note: 'His contemporary, working music and history.' },
            { slug: 'harryette-mullen', name: 'Harryette Mullen', note: 'Wordplay as a structural principle.' },
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'The sonnet turned to this material first.' }
        ]
    },

    'afaa-michael-weaver': {
        body: [
            'He worked in Baltimore factories for fifteen years before publishing, and the industrial poems are written from the inside — the noise, the shifts, the specific exhaustion — without any of the ennobling that outsiders bring to that material.',
            'The later work moves outward: a long engagement with Chinese poetry and language, Taoist and Christian thought held together without being reconciled, and a sustained reckoning with childhood abuse that is handled with great restraint. He also writes plays. The register is calm and formal, and that composure is what makes the hardest poems bearable.'
        ],
        readNext: [
            { slug: 'philip-levine', name: 'Philip Levine', note: 'Factory work named with the same respect.' },
            { slug: 'yusef-komunyakaa', name: 'Yusef Komunyakaa', note: 'His contemporary, and the music of the line.' },
            { slug: 'jay-wright', name: 'Jay Wright', note: 'Spiritual systems taken entirely seriously.' }
        ]
    },

    'anne-stevenson': {
        body: [
            'An American-born poet who spent her working life in Britain, and the doubleness is audible — the ear is transatlantic and the poems are frequently about not being wholly of a place.',
            'The verse is formally alert, sceptical and intellectually restless, with a strong strain of natural observation and a persistent quarrel with sentimentality. She wrote a biography of Sylvia Plath that caused a great deal of argument, and the poems share its refusal to be reverent. The best of them are conversational on the surface and metrically tight underneath, which is a difficult trick to keep up for a whole career.'
        ],
        readNext: [
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: 'The American reticence she works from.' },
            { slug: 'eavan-boland', name: 'Eavan Boland', note: 'The same generation, in Ireland.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'The English scepticism she wrote alongside.' }
        ]
    },

    'barbara-guest': {
        body: [
            'The painterly one. She was the only woman usually counted in the first-generation New York School and was consistently under-read next to the men, which has been slowly corrected.',
            'The poems place words on the page the way a painter places marks — space, interruption and the visual arrangement carry meaning, and the syntax is often left unfinished on purpose. She wrote extensively about art and a biography of H. D. The later work is more abstract and more assured, and it has been an important permission for a great many younger experimental poets. Do not read for a paraphrase; there isn\'t one.'
        ],
        readNext: [
            { slug: 'james-schuyler', name: 'James Schuyler', note: 'The same circle, at its quietest.' },
            { slug: 'h-d', name: 'H. D.', note: 'The modernist she wrote a life of.' },
            { slug: 'mei-mei-berssenbrugge', name: 'Mei-mei Berssenbrugge', note: 'The later poetry of the extended, spacious line.' }
        ]
    },

    'd-h-lawrence': {
        body: [
            'The novels have always overshadowed the poems, and the poems are stranger and in some ways better. He wrote free verse before it was common in England, arguing for a poetry of the immediate present with no formal armour at all.',
            'The animal and flower poems are the achievement: a snake at a water trough, a tortoise, figs, bats, described with a physical attention that keeps turning into an argument about how humans behave. The late poems about death are stark and unornamented. He is uneven, sometimes hectoring, and the ideas about sex and instinct that date worst are in the prose more than here.'
        ],
        readNext: [
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The free verse he took his licence from.' },
            { slug: 'robinson-jeffers', name: 'Robinson Jeffers', note: 'Animal life written with the same unsentimental force.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'The English predecessor he wrote a study of.' }
        ]
    },

    'dan-beachy-quick': {
        body: [
            'A poet and essayist whose work is unusually saturated in reading — Melville, the Greeks, Keats, Emerson — not as allusion but as a way of thinking, so the poems often read like marginalia that grew into something.',
            'The line is short, the diction slightly archaic, and the mode is meditative to the point of prayer. Books are built as extended engagements with a single text or figure rather than as collections. This is deliberately slow writing, and readers looking for an occasion or a narrative will find the poems elusive; readers willing to follow a thought through several turns will find them generous.'
        ],
        readNext: [
            { slug: 'susan-stewart', name: 'Susan Stewart', note: 'Scholarship and lyric in one practice.' },
            { slug: 'fanny-howe', name: 'Fanny Howe', note: 'Meditation that refuses to conclude.' },
            { slug: 'john-keats', name: 'John Keats', note: 'The poet he reads most closely.' }
        ]
    },

    'delmore-schwartz': {
        body: [
            'A poet, story writer and critic who arrived very young with enormous acclaim and spent decades unable to repeat it — a trajectory that later became legend among the writers who knew him.',
            'The best work is early: poems of Jewish immigrant New York, of Coney Island, of a heavy consciousness that will not let its owner alone. The famous title about the heavy bear who goes with me names the body as an embarrassing companion, and the conceit holds for the whole poem. He is a formal poet with a deliberately clumsy, thudding music, which is easy to mistake for a fault and is doing exactly what the subject requires.'
        ],
        readNext: [
            { slug: 'john-berryman', name: 'John Berryman', note: 'His friend, and the elegies for him.' },
            { slug: 'robert-lowell', name: 'Robert Lowell', note: 'The same generation and the same weight.' },
            { slug: 'karl-shapiro', name: 'Karl Shapiro', note: 'Jewish American poetry of the period.' }
        ]
    },

    'ed-roberson': {
        body: [
            'A poet whose syntax is genuinely his own — clauses fold back on themselves, words shift part of speech mid-line, and the difficulty is compressive rather than obscure: too much is being said at once, not too little.',
            'He worked as a limnologist and travelled widely, and the poems carry ecology, the city and Black American life without ever separating them into different subjects. Nature here is not an escape from the urban; it is the same system observed at another scale. The later books are the most approachable. Read slowly, and read the sentence rather than the line.'
        ],
        readNext: [
            { slug: 'nathaniel-mackey', name: 'Nathaniel Mackey', note: 'Serial form and improvisation.' },
            { slug: 'camille-t-dungy', name: 'Camille T. Dungy', note: 'Black American nature poetry as a tradition.' },
            { slug: 'will-alexander', name: 'Will Alexander', note: 'Language pushed further still.' }
        ]
    },

    'gail-mazur': {
        body: [
            'Conversational, observant poems rooted in Boston and Cape Cod — a bar, a ballpark, a hospital corridor, a kitchen — that begin in the ordinary and end somewhere considerably less comfortable.',
            'The transitions are the craft: a poem will drift from a small scene into illness, marriage or loss without any visible hinge. She founded and ran a long-lived reading series that shaped literary Boston for decades. The tone is wry and unhurried, and the poems trust the reader to feel the weight without being told where it is.'
        ],
        readNext: [
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'The quiet lyric with a dark undertow.' },
            { slug: 'stephen-dunn', name: 'Stephen Dunn', note: 'The reflective American poem.' },
            { slug: 'frank-bidart', name: 'Frank Bidart', note: 'Her Boston contemporary, at the other extreme.' }
        ]
    },

    'hayden-carruth': {
        body: [
            'A poet of Vermont farm work, jazz, poverty and mental illness, who wrote in almost every available form and edited an anthology that taught a generation what modern American poetry contained.',
            'The range is genuinely unusual: strict sonnets, long jazz-inflected free verse, blues stanzas, a book-length poem in a single voice. The subjects stay constant — cold, work, animals, music, rage at how the poor are treated. He wrote openly about breakdown and about the asylum, and the poems on that subject are unsparing and completely free of self-pity.'
        ],
        readNext: [
            { slug: 'philip-levine', name: 'Philip Levine', note: 'Work and anger in the same measure.' },
            { slug: 'wendell-berry', name: 'Wendell Berry', note: 'Farming as a moral position.' },
            { slug: 'ruth-stone', name: 'Ruth Stone', note: 'Vermont poverty in a comic key.' }
        ]
    },

    'jack-prelutsky': {
        body: [
            'The most widely read children\'s poet of his generation, and a genuine technician: the metre never slips, the rhymes are exact, and the comic timing survives being read aloud badly by a tired adult, which is the real test.',
            'The subjects are monsters, dinosaurs, disgusting food, school and the pleasures of misbehaving. He served as the first national Children\'s Poet Laureate. The nonsense poems are in a direct line from Lear and Carroll, and the best of them have the slight menace that the tradition always had — the joke is funny and the creature is genuinely coming.'
        ],
        readNext: [
            { slug: 'j-patrick-lewis', name: 'J. Patrick Lewis', note: 'The same shelf, with a wider range.' },
            { slug: 'edward-lear', name: 'Edward Lear', note: 'Where the nonsense tradition starts.' },
            { slug: 'mother-goose', name: 'Mother Goose', note: 'The anonymous material underneath all of it.' }
        ]
    },

    'jacqueline-woodson': {
        body: [
            'Best known as a writer for young readers, and her memoir in verse is the book that put her poems in front of a general audience — a childhood in South Carolina and Brooklyn told in short free-verse pieces that read as scenes rather than as lyrics.',
            'The technique is deceptively plain: no metaphor is reached for, the vocabulary stays inside a child\'s, and the historical weight — segregation, the Great Migration, family religion — arrives through what the child notices and cannot yet interpret. It is a model of how to write simply about serious material without simplifying it.'
        ],
        readNext: [
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Plainness with the same authority.' },
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'The Brooklyn and Chicago childhood in verse.' },
            { slug: 'elizabeth-alexander', name: 'Elizabeth Alexander', note: 'Family history handled at domestic scale.' }
        ]
    },

    'jay-wright': {
        body: [
            'One of the most ambitious and least read poets in American English. The work builds a single cosmology across many books, drawing on Dogon and Bambara thought, Mesoamerican myth, European philosophy and the Black Atlantic, and it assumes the reader will do the study.',
            'That demand is why the audience is small and why the poets who read him regard him so highly. The poems are ritualistic, patterned and musical, closer to ceremony than to statement. Start with the shorter early lyrics, which are lucid, before the later architectures. Nothing else in the language is doing what this does.'
        ],
        readNext: [
            { slug: 'nathaniel-mackey', name: 'Nathaniel Mackey', note: 'The nearest contemporary in ambition.' },
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'The elder he learned formal seriousness from.' },
            { slug: 'ed-roberson', name: 'Ed Roberson', note: 'Comparable difficulty, different system.' }
        ]
    },

    'jorie-graham': {
        body: [
            'Long, restless poems that stage the act of perception as it happens — the line breaks mid-thought, brackets and dashes interrupt, and blanks are left where a word would settle the question too soon.',
            'The early books are more painterly and more controlled; the later ones open out into ecological catastrophe, surveillance and illness, and the syntax becomes correspondingly harder to hold. What stays constant is the refusal to report a completed experience. She has been enormously influential as a teacher, and her mannerisms are visible in a whole generation. Read a full poem or none.'
        ],
        readNext: [
            { slug: 'louise-glck', name: 'Louise Glück', note: 'Her exact contemporary and total opposite.' },
            { slug: 'brenda-hillman', name: 'Brenda Hillman', note: 'Ecology and experiment in the same practice.' },
            { slug: 'wallace-stevens', name: 'Wallace Stevens', note: 'The tradition of the mind watching itself.' }
        ]
    },

    'kevin-young': {
        body: [
            'Prolific and formally various, with an ear trained on the blues — the short-lined poems use repetition and turnaround the way a twelve-bar structure does, and the effect is closer to song than to speech.',
            'The books are usually conceived whole: a jazz elegy, a book about Basquiat, a book about food, a book of grief poems written after his father\'s death. He is also an anthologist and critic, and his prose on hoaxes and on African American poetics is substantial. The grief book is the one to start with; the constraint of the short line makes the plainest statements land hardest.'
        ],
        readNext: [
            { slug: 'terrance-hayes', name: 'Terrance Hayes', note: 'His contemporary, and more formally restless.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'The blues stanza at its source.' },
            { slug: 'michael-s-harper', name: 'Michael S. Harper', note: 'Jazz as poetic structure.' }
        ]
    },

    'linda-gregerson': {
        body: [
            'The poems are laid out in triplets with a distinctive stepped indentation, and the shape is doing real work: it slows an argument that is otherwise long-breathed and syntactically complex.',
            'She is a Renaissance scholar, and the poems have that reading in them — moral argument, theology, the visual arts — set against contemporary occasions, frequently violent ones. The recurring subject is what people do to children and to each other, approached with an intellectual calm that makes the material worse rather than easier. Read the sentence across the line breaks, not line by line.'
        ],
        readNext: [
            { slug: 'susan-stewart', name: 'Susan Stewart', note: 'The other great scholar-poet of that generation.' },
            { slug: 'eleanor-wilner', name: 'Eleanor Wilner', note: 'Myth and moral argument.' },
            { slug: 'jorie-graham', name: 'Jorie Graham', note: 'Syntax stretched across the line.' }
        ]
    },

    'lucia-perillo': {
        body: [
            'Funny, blunt and physically specific. She trained as a wildlife biologist, and the natural world in her poems is observed by somebody who has done fieldwork — no reverence, plenty of accuracy.',
            'Multiple sclerosis progressively disabled her, and the poems about the body are among the least self-pitying and most useful writing on illness in American poetry: sardonic, angry, interested in the indignity as material. The tone is conversational and profane, the structure is looser than it looks, and the endings routinely refuse the consolation the poem has been setting up.'
        ],
        readNext: [
            { slug: 'dorianne-laux', name: 'Dorianne Laux', note: 'The same plainspoken physicality.' },
            { slug: 'kim-addonizio', name: 'Kim Addonizio', note: 'Comparable bluntness and wit.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'The body written without decorum.' }
        ]
    },

    'marianne-boruch': {
        body: [
            'Quiet, oblique poems that begin in observation and drift — a bird, a hospital, a museum case, a memory — with the connections deliberately loosened so the reader has to supply the joins.',
            'She has spent time observing in medical settings and in natural history collections, and the poems have that watcher\'s patience: things are looked at for longer than a lyric usually allows. The essays on poetry are unusually good on craft. The voice is unemphatic and can seem slight on a single reading; the accumulated attention is the point.'
        ],
        readNext: [
            { slug: 'jane-hirshfield', name: 'Jane Hirshfield', note: 'Attention as a discipline.' },
            { slug: 'sandra-mcpherson', name: 'Sandra McPherson', note: 'Natural observation held very close.' },
            { slug: 'chase-twichell', name: 'Chase Twichell', note: 'The same unhurried register.' }
        ]
    },

    'marvin-bell': {
        body: [
            'His signature is a long sequence of poems about a figure called the Dead Man, written in long unpunctuated lines in a form he invented, where each poem exists in two halves and the speaker is simultaneously alive and dead.',
            'That sounds like a conceit and it turns into a genuinely flexible instrument: it can carry politics, jokes, grief and philosophy in the same breath because the speaker has no stake left. The earlier work is more conventional, warm and family-centred. He taught for decades in Iowa and was Iowa\'s first poet laureate, and generations of American poets passed through his classroom.'
        ],
        readNext: [
            { slug: 'russell-edson', name: 'Russell Edson', note: 'The invented form as a lifelong device.' },
            { slug: 'mark-strand', name: 'Mark Strand', note: 'Absence and the vacated speaker.' },
            { slug: 'james-tate', name: 'James Tate', note: 'American strangeness kept deadpan.' }
        ]
    },

    'nikki-giovanni': {
        body: [
            'She came out of the Black Arts Movement writing poems built for the voice — direct, rhythmic, unafraid of the first person and completely uninterested in the workshop\'s preference for indirection.',
            'The early poems are militant and were meant to be; the later ones turn to love, family, ageing and grandmothers without any loss of edge. She recorded her work with gospel choirs, which is the right context for it. Critics have often called her uneven, and the reply is in the audiences: this is a body of work that has been read aloud in schools, churches and living rooms for fifty years.'
        ],
        readNext: [
            { slug: 'sonia-sanchez', name: 'Sonia Sanchez', note: 'The same movement, at its most musical.' },
            { slug: 'amiri-baraka', name: 'Amiri Baraka', note: 'The Black Arts Movement at its most confrontational.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'The quieter contemporary.' }
        ]
    },

    'philip-larkin': {
        body: [
            'The most quoted English poet of the second half of the twentieth century, and the most argued about. The poems are formally immaculate, colloquial in vocabulary, and arranged so that a plain conversational opening builds to a final stanza that lifts into something enormous.',
            'The subjects are work, provincial England, deferral, ageing and death, handled with a bleakness that is frequently very funny. Since the publication of his letters, the racism and misogyny in them have been part of any honest account of him; the poems themselves are the reason he is still read, and the best of them — a hospital at dawn, an empty church, a wedding train across England — are among the finest in the language.'
        ],
        readNext: [
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'The poet he said taught him everything.' },
            { slug: 'stevie-smith', name: 'Stevie Smith', note: 'His contemporary, whom he admired.' },
            { slug: 'derek-mahon', name: 'Derek Mahon', note: 'The Irish formalist most often compared with him.' }
        ]
    },

    'richard-crashaw': {
        body: [
            'The most extravagant of the English metaphysical poets and the least English in temper — he converted to Catholicism, went into exile and died in Italy, and the verse is closer to Baroque continental devotion than to anything at home.',
            'The imagery is famously excessive: wounds as mouths, tears as rivers, saints in a state that is unmistakably erotic. Readers have found this either sublime or ridiculous for four centuries, and both reactions are available in the same poem. The technical control is real, and the hymns to Saint Teresa are the place where the extravagance and the craft are in balance.'
        ],
        readNext: [
            { slug: 'george-herbert', name: 'George Herbert', note: 'The restrained English devotional alternative.' },
            { slug: 'henry-vaughan', name: 'Henry Vaughan', note: 'The mystic of that generation.' },
            { slug: 'john-donne', name: 'John Donne', note: 'Where the erotic and the devout first fuse.' }
        ]
    },

    'samuel-daniel': {
        body: [
            'An Elizabethan poet, historian and critic whose sonnet sequence sits alongside Sidney\'s and Shakespeare\'s and is quieter than either — plain, melodious and unusually free of straining conceits.',
            'He wrote a verse history of the civil wars, masques for the court, and a defence of rhyme answering an argument that English poetry should abandon it for classical metres; the defence is one of the best pieces of Elizabethan criticism. His reputation has always been that of a careful, unspectacular craftsman, which is accurate and undersells how good the best sonnets are.'
        ],
        readNext: [
            { slug: 'sir-philip-sidney', name: 'Sir Philip Sidney', note: 'The sequence that set the fashion.' },
            { slug: 'michael-drayton', name: 'Michael Drayton', note: 'His close contemporary in every genre.' },
            { slug: 'edmund-spenser', name: 'Edmund Spenser', note: 'The other great Elizabethan.' }
        ]
    },

    'thomas-campion': {
        body: [
            'A composer as well as a poet, and almost alone among English lyricists in writing both words and music for his songs — which is why the verse scans so beautifully and why it can seem thin on the page.',
            'Read it as lyric for the lute and it is superb: the stresses fall where a singer needs them, the syntax stays simple, and the rhymes never strain. He also argued against rhyme in favour of classical quantitative metres, an odd position for the best rhymer of his generation, and wrote poems in both systems. The love songs and the drinking songs are the entry point.'
        ],
        readNext: [
            { slug: 'ben-jonson', name: 'Ben Jonson', note: 'The classical lyric done plainly.' },
            { slug: 'robert-herrick', name: 'Robert Herrick', note: 'The next generation of the English song.' },
            { slug: 'thomas-carew', name: 'Thomas Carew', note: 'The Caroline lyric at its most polished.' }
        ]
    },

    'todd-boss': {
        body: [
            'Short, heavily sound-patterned poems — internal rhyme, alliteration, very short lines — that keep an audible music while staying entirely contemporary in subject.',
            'The poems are domestic and Midwestern: marriage, a house, weather, a father. He has also worked extensively on films made from poems, which fits the writing: these are pieces built to be heard and to move at speed. The risk in the method is that the music can outrun the content, and the best poems are the ones where the sound is doing the emotional work rather than decorating it.'
        ],
        readNext: [
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'Internal rhyme at its most disciplined.' },
            { slug: 'ted-kooser', name: 'Ted Kooser', note: 'The Midwestern domestic poem.' },
            { slug: 'heather-mchugh', name: 'Heather McHugh', note: 'Sound-driven poetry with more torque.' }
        ]
    },

    'toi-derricotte': {
        body: [
            'A poet of uncomfortable honesty about race, family and the body — including a long engagement with what it has meant to be a Black woman frequently taken for white, which she has written about with a candour that gives no one an easy position.',
            'The poems are plain in diction and unflinching in content: childbirth, a violent father, a mother\'s cruelty, the daily calculations of passing. She co-founded an organisation that has supported two generations of African American poets, and that work belongs in any account of her importance. The memoir and the poems should be read together.'
        ],
        readNext: [
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'The body and the family in fewer words.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'Comparable exposure, different inheritance.' },
            { slug: 'cornelius-eady', name: 'Cornelius Eady', note: 'Her co-founder, and the other side of that project.' }
        ]
    },

    'yehuda-amichai': {
        body: [
            'The central Israeli poet of the twentieth century, read here in translation, and the writer who made modern Hebrew poetry sound like ordinary speech — army slang, business language and liturgy in the same line.',
            'The characteristic move is to take a religious phrase every Hebrew reader knows and set it against something domestic or bureaucratic, so that the sacred and the mundane deflate and enlarge each other at once. The subjects are love, Jerusalem, war and God, and the tone is tender, ironic and permanently tired of history. Much of the wordplay is untranslatable, which the best English versions admit rather than disguise.'
        ],
        readNext: [
            { slug: 'czeslaw-milosz', name: 'Czeslaw Milosz', note: 'The other great European witness of that century.' },
            { slug: 'george-seferis', name: 'George Seferis', note: 'A national poetry rebuilt in a modern voice.' },
            { slug: 'stanley-moss', name: 'Stanley Moss', note: 'God argued with in ordinary language.' }
        ]
    },

    'yvor-winters': {
        body: [
            'A critic first for most readers, and a famously severe one — he argued that poetry should be rational and morally evaluative, and he dismissed a great deal of what everyone else admired.',
            'His own poems began as free-verse imagism and turned, deliberately, to strict metre and plain abstract statement, which is his theory carried out on himself. The best of them — poems about California landscape, about a dead friend, about the sea — are hard, spare and genuinely moving, and they prove the doctrine could produce more than an argument. He taught Thom Gunn and others, and the poets he formed diverged from him in every direction.'
        ],
        readNext: [
            { slug: 'j-v-cunningham', name: 'J. V. Cunningham', note: 'His student, and the epigram at its hardest.' },
            { slug: 'thom-gunn', name: 'Thom Gunn', note: 'The student who kept the metre and dropped the doctrine.' },
            { slug: 'edgar-bowers', name: 'Edgar Bowers', note: 'The purest example of what he taught.' }
        ]
    },

    'annie-finch': {
        body: [
            'A formalist whose interest in metre is unusual: she treats rhythm as ritual rather than as decorum, and much of the work is written for chanting, ceremony and performance.',
            'The material is pagan and feminist — goddesses, seasons, the body, a long poem on the eleusinian mysteries — and the metres chosen are frequently the falling ones English poetry uses least, which is a deliberate argument about what the standard iambic line has excluded. She has also written textbooks on metre that are genuinely useful. A poem here is best read aloud, and preferably out of a chair.'
        ],
        readNext: [
            { slug: 'marilyn-hacker', name: 'Marilyn Hacker', note: 'Formal virtuosity turned feminist.' },
            { slug: 'alicia-ostriker', name: 'Alicia Ostriker', note: 'Myth rewritten from the woman\'s side.' },
            { slug: 'a-e-stallings', name: 'A. E. Stallings', note: 'Contemporary rhyme with classical ballast.' }
        ]
    },

    'aphra-behn': {
        body: [
            'The first Englishwoman known to have earned her living by writing, which is the fact that always leads — and the poems deserve better than to be an appendix to it.',
            'They are frankly erotic, formally assured and often very funny, including a poem about male impotence that treats the subject with more sympathy and more comedy than most later writers have managed. She wrote for the Restoration stage, spied for the crown, and produced a short novel about slavery that is still argued over. The verse is Restoration in manner: polished couplets, pastoral names, and a directness about desire that the following century did its best to forget.'
        ],
        readNext: [
            { slug: 'katherine-philips', name: 'Katherine Philips', note: 'The other major Englishwoman writing verse then.' },
            { slug: 'john-dryden', name: 'John Dryden', note: 'The dominant voice of her literary world.' },
            { slug: 'anne-finch-countess-of-winchilsea', name: 'Anne Finch, Countess of Winchilsea', note: 'The next generation, and more inward.' }
        ]
    },

    'carol-frost': {
        body: [
            'Dense, sonically packed poems drawn to the natural world at its least sentimental — bees, carrion, weather, animals doing what animals do — with a syntax that compresses rather than explains.',
            'The recurring subject is appetite and violence in nature and in people, and the poems decline to draw the moral. A sustained later sequence deals with a parent\'s dementia and is among the better treatments of that subject, partly because the same unsentimental eye is turned on it. Read for the sound; the arguments are carried by rhythm as much as by statement.'
        ],
        readNext: [
            { slug: 'robinson-jeffers', name: 'Robinson Jeffers', note: 'Nature written without a shred of consolation.' },
            { slug: 'marianne-boruch', name: 'Marianne Boruch', note: 'Observation held past comfort.' },
            { slug: 'sandra-mcpherson', name: 'Sandra McPherson', note: 'Natural detail rendered exactly.' }
        ]
    },

    'czeslaw-milosz': {
        body: [
            'A Polish poet who lived through the German occupation of Warsaw, defected from a Stalinist diplomatic post and spent decades teaching in California, and whose work is the central European twentieth century in one body of writing.',
            'The poems are lucid, discursive and morally exacting without being pious — he distrusted poetry that made suffering beautiful and said so repeatedly. The great subjects are memory, exile, the temptation of ideology and the question of what survives a catastrophe. He received the Nobel Prize in Literature. In English he is largely read through translations he made with American poets, which is why the versions sound so much like American poems.'
        ],
        readNext: [
            { slug: 'adam-zagajewski', name: 'Adam Zagajewski', note: 'The next Polish generation.' },
            { slug: 'robert-hass', name: 'Robert Hass', note: 'His long-time translator.' },
            { slug: 'yehuda-amichai', name: 'Yehuda Amichai', note: 'The same century, another language.' }
        ]
    },

    'donald-hall': {
        body: [
            'A long career of many parts — anthologist, essayist, children\'s writer, editor — with the poems changing shape more than once across sixty years.',
            'The work that lasts is the late work: poems written at a New Hampshire farmhouse that had been in his family for generations, and then the books written after the death of his wife, the poet Jane Kenyon. Those elegies are plain, repetitive and almost unbearably specific about ordinary domestic detail, which is exactly why they work. He served as United States Poet Laureate, and his prose about old age is as good as the verse.'
        ],
        readNext: [
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'His wife, and the same farmhouse from inside.' },
            { slug: 'maxine-kumin', name: 'Maxine Kumin', note: 'New England rural life in verse.' },
            { slug: 'galway-kinnell', name: 'Galway Kinnell', note: 'His contemporary, and the darker lyric.' }
        ]
    },

    'dorothea-lasky': {
        body: [
            'Flat, declarative, deliberately unpolished poems that state extreme feeling in the plainest available words and refuse the modulation a workshop would ask for.',
            'That refusal is the position: she has written about wanting poetry to be sincere and a little embarrassing, closer to a spell or a shout than to a well-made object. The poems deal in death, love, colour, animals and rage, often in a voice that sounds childlike and is not. Readers either take to it immediately or find it artless, and the artlessness is constructed with some care.'
        ],
        readNext: [
            { slug: 'eileen-myles', name: 'Eileen Myles', note: 'The unguarded contemporary voice.' },
            { slug: 'elaine-equi', name: 'Elaine Equi', note: 'The flat surface used for wit rather than heat.' },
            { slug: 'mary-ruefle', name: 'Mary Ruefle', note: 'Abrupt tonal turns handled comically.' }
        ]
    },

    'elaine-equi': {
        body: [
            'Short, dry, immaculately timed poems that take a pop-cultural or everyday object — a shade of lipstick, a film, a brand, a saint — and turn it over until it looks strange.',
            'The mode owes something to New York School casualness and something to Surrealism, but the tone is entirely her own: cool, amused, never straining for profundity, and considerably sharper than the light surface suggests. The poems are short enough to look slight and are constructed with real precision. A single one is a joke; twenty in a row are a sensibility.'
        ],
        readNext: [
            { slug: 'ron-padgett', name: 'Ron Padgett', note: 'Comic deadpan of the same lineage.' },
            { slug: 'james-tate', name: 'James Tate', note: 'The straight-faced absurd.' },
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'Compression with a comic edge.' }
        ]
    },

    'emily-bront': {
        body: [
            'The novel has swallowed the poems, and the poems came first. They were written privately, discovered by her sister, and published under a pseudonym before the fiction existed.',
            'Many belong to an invented world she and her sister had been elaborating since childhood, which is why speakers are sometimes prisoners, exiles or soldiers of nowhere in particular. The best of them are short, hymn-metred and startlingly hard: a refusal of comfort, an address to a wind or a night sky, a declaration of self-sufficiency that reads as neither boast nor consolation. Read them as poems rather than as evidence about the novel.'
        ],
        readNext: [
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'The Victorian devotional lyric at its best.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'Hymn metre turned to entirely private ends.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'The same moorland bleakness, later.' }
        ]
    },

    'etheridge-knight': {
        body: [
            'He began writing seriously in prison, and the work never lost the oral forms he learned there and in the Black community he came from — toasts, boasts, signifying, the sound of a poem meant to be performed rather than read.',
            'The prison poems are the core: portraits of individual men, a poem for the ones who go mad, an elegy that gets its force from naming. Elsewhere he wrote love poems and haiku, and the haiku are excellent — the compression suits him. Addiction shaped his life and appears in the poems without excuse or self-dramatisation. The line is short, blunt and rhythmically exact.'
        ],
        readNext: [
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'The elder who championed and published him.' },
            { slug: 'sonia-sanchez', name: 'Sonia Sanchez', note: 'The same movement and the same oral roots.' },
            { slug: 'jimmy-santiago-baca', name: 'Jimmy Santiago Baca', note: 'The poem written out of confinement.' }
        ]
    },

    'fady-joudah': {
        body: [
            'A physician who has worked in field hospitals and a translator of Palestinian poetry, and both practices are visible in the verse — clinical exactness, and a syntax slightly turned by another language.',
            'The poems handle exile, medicine and war without ever settling into reportage; they are lyric and elliptical, and they resist the demand that a Palestinian poet supply testimony on request. That resistance is itself one of the subjects. His translations of Mahmoud Darwish are the standard English versions and are worth reading alongside his own books.'
        ],
        readNext: [
            { slug: 'naomi-shihab-nye', name: 'Naomi Shihab Nye', note: 'The same inheritance, plainer.' },
            { slug: 'hayan-charara', name: 'Hayan Charara', note: 'Arab American poetry of the same generation.' },
            { slug: 'ilya-kaminsky', name: 'Ilya Kaminsky', note: 'War written as parable rather than report.' }
        ]
    },

    'frank-ohara': {
        body: [
            'He worked at a museum, wrote poems on his lunch break, and produced one of the most immediately likeable bodies of work in American poetry — fast, chatty, full of names, brand names, streets and friends.',
            'The casualness is exact. Beneath the gossip the poems are precisely timed, and the famous elegy that begins with a newspaper headline about a singer\'s death gets its whole effect from having spent twenty lines on lunch first. He described his method, half-jokingly, as simply calling the person on the phone instead. Almost everything conversational in American poetry since runs through here.'
        ],
        readNext: [
            { slug: 'james-schuyler', name: 'James Schuyler', note: 'The same circle, and the still opposite.' },
            { slug: 'kenneth-koch', name: 'Kenneth Koch', note: 'His closest friend and the comic one.' },
            { slug: 'eileen-myles', name: 'Eileen Myles', note: 'The clearest later inheritance.' }
        ]
    },

    'harmony-holiday': {
        body: [
            'A poet, dancer and archivist whose work sits between forms — collage, essay, film, sound — and takes Black music, especially jazz and its casualties, as both subject and structure.',
            'The pages mix verse, prose, quotation and photograph, and the argument is that a life lived inside a music cannot be reported in a form the music does not recognise. Her father was a soul singer, and inheritance is handled as archive rather than as memoir. Difficult, deliberately unfinished, and unlike almost anything else being published.'
        ],
        readNext: [
            { slug: 'nathaniel-mackey', name: 'Nathaniel Mackey', note: 'Music as serial form.' },
            { slug: 'will-alexander', name: 'Will Alexander', note: 'Language pushed past the sentence.' },
            { slug: 'evie-shockley', name: 'Evie Shockley', note: 'Formal experiment and Black poetics.' }
        ]
    },

    'kenneth-koch': {
        body: [
            'The funniest of the New York School, and the one whose comedy is most likely to be mistaken for lightness. The poems are exuberant, digressive and full of invented occasions, and they are extremely well made.',
            'He also did something few major poets attempt: he taught poetry writing to schoolchildren and to nursing-home residents and wrote two books about it that are still the best things of their kind. The long comic poems are the achievement, and the parodies — including a famous three-line reply to William Carlos Williams — are perfect. Underneath all of it is a real elegiac strain that surfaces in the late books.'
        ],
        readNext: [
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'His closest friend and collaborator.' },
            { slug: 'ron-padgett', name: 'Ron Padgett', note: 'His student, and the comic inheritance.' },
            { slug: 'john-ashbery', name: 'John Ashbery', note: 'The third of that original trio.' }
        ]
    },

    'kim-addonizio': {
        body: [
            'Blunt, sensual and formally more skilled than the bar-room surface suggests — she writes sonnets about drinking and desire and the sonnet holds, which is most of the pleasure.',
            'The material is appetite, tattoos, bad decisions, music and mortality, handled with a wit that never asks the reader for sympathy. She has written craft books that are widely used and are unusually candid about the unglamorous parts. The best poems set a hard, funny voice against a form tight enough to make the ending land like a door closing.'
        ],
        readNext: [
            { slug: 'dorianne-laux', name: 'Dorianne Laux', note: 'Her co-author, and the warmer register.' },
            { slug: 'lucia-perillo', name: 'Lucia Perillo', note: 'Comparable bluntness about the body.' },
            { slug: 'charles-bukowski', name: 'Charles Bukowski', note: 'The bar-stool tradition she writes against and through.' }
        ]
    },

    'larry-levis': {
        body: [
            'Long, drifting, associative poems that begin with a small memory and travel a great distance from it — a horse, a field, a factory, a friend now dead — without ever announcing the transitions.',
            'The elegiac tone is constant, and the poems keep their emotional temperature low while covering enormous ground, which is the technical achievement. He died in his forties, and the posthumous books are the strongest and the longest-lined. His teacher was Philip Levine, and the shared subjects — California agriculture, work, the vanished — arrive here at a completely different angle.'
        ],
        readNext: [
            { slug: 'philip-levine', name: 'Philip Levine', note: 'His teacher, and the plainer treatment.' },
            { slug: 'norman-dubie', name: 'Norman Dubie', note: 'The long associative American poem.' },
            { slug: 'charles-wright', name: 'Charles Wright', note: 'Meditation stretched across the line.' }
        ]
    },

    'mark-halliday': {
        body: [
            'Talky, self-aware, comic poems that let a recognisably ordinary American speaker go on at length and then quietly expose him. The mode has been called ultra-talk, and he is its clearest practitioner.',
            'The risk is obvious — a poem that sounds like a man complaining is one bad line away from being a man complaining — and he mostly avoids it by turning the irony on the speaker rather than the world. The subjects are pop music, ambition, ageing, literary envy and mortality, and the last of those arrives more often as the books go on. Funny first, sad second, and in that order deliberately.'
        ],
        readNext: [
            { slug: 'tony-hoagland', name: 'Tony Hoagland', note: 'The same mode, more confrontational.' },
            { slug: 'bob-hicok', name: 'Bob Hicok', note: 'Digression pushed further.' },
            { slug: 'stephen-dunn', name: 'Stephen Dunn', note: 'The reflective version of the talking poem.' }
        ]
    },

    'melvin-b-tolson': {
        body: [
            'A deliberately difficult modernist, which is what made his reputation complicated: he wrote in a dense, allusive, footnoted manner at a moment when Black American poetry was mostly being praised for directness, and he refused to be assigned a simpler style.',
            'The major work is a long ode written as poet laureate of Liberia, a formally ambitious historical sweep, and an earlier book of portraits of a small-town Black community that is far more accessible. He taught for decades at a small college and coached a debate team into national prominence. Read the portraits first, then the odes.'
        ],
        readNext: [
            { slug: 'hart-crane', name: 'Hart Crane', note: 'The American high style he worked in.' },
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'The same insistence on craft over category.' },
            { slug: 'jay-wright', name: 'Jay Wright', note: 'Difficulty as a refusal to be simplified.' }
        ]
    },

    'michael-drayton': {
        body: [
            'An Elizabethan and Jacobean poet of extraordinary industry who wrote in nearly every available kind — sonnets, historical verse, pastoral, satire, and an enormous topographical poem describing the whole of England river by river.',
            'One sonnet has outlived everything else and deserves to: it opens with a lover proposing a clean break, sustains the pose for eight lines, and then breaks in the sestet. It is one of the finest sonnets in English and is not much like the rest of him. The long poems are period pieces of real skill, and the ballad on Agincourt is still recitable.'
        ],
        readNext: [
            { slug: 'samuel-daniel', name: 'Samuel Daniel', note: 'His close contemporary in every genre.' },
            { slug: 'william-shakespeare', name: 'William Shakespeare', note: 'The sonnet sequence that outlasted them all.' },
            { slug: 'edmund-spenser', name: 'Edmund Spenser', note: 'The elder both of them measured against.' }
        ]
    },

    'michael-s-harper': {
        body: [
            'Jazz is the organising principle, not a subject: the poems are built on repetition, variation and the way a phrase returns changed, and John Coltrane is the recurring figure and formal model.',
            'The other constant is history and family — his own children, some of whom died in infancy, and an American past that keeps intruding on the domestic present. The syntax is elliptical and can be hard to follow on a first pass; the poems assume that the reader will listen rather than parse. He taught for decades and was an important editor and mentor of Black American poets.'
        ],
        readNext: [
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'The elder he championed.' },
            { slug: 'yusef-komunyakaa', name: 'Yusef Komunyakaa', note: 'Jazz structure in the next generation.' },
            { slug: 'nathaniel-mackey', name: 'Nathaniel Mackey', note: 'Music as serial form, taken further.' }
        ]
    },

    'nick-flynn': {
        body: [
            'A poet and memoirist whose central material — a mother\'s suicide, a father who turned up homeless at the shelter where he worked — could easily have produced sensational writing and did not.',
            'The poems are fragmentary and controlled, circling the events rather than narrating them, and the same material handled in prose reads completely differently, which is a useful demonstration of what verse is for. Later books take on torture and complicity in American conduct abroad. The line is short, the diction plain, and the restraint is the whole technique.'
        ],
        readNext: [
            { slug: 'mary-karr', name: 'Mary Karr', note: 'Memoir and poem out of the same life.' },
            { slug: 'franz-wright', name: 'Franz Wright', note: 'The same darkness, more compressed.' },
            { slug: 'carolyn-forch', name: 'Carolyn Forché', note: 'Complicity and witness as a subject.' }
        ]
    },

    'norman-dubie': {
        body: [
            'A poet of dramatic monologues and invented histories — poems spoken by painters, scientists, Russians, nuns and children, set in places and periods he had no personal claim on, which was the point.',
            'The result is one of the least autobiographical bodies of work in contemporary American poetry, at a time when almost everyone else was mining their own lives. The poems are lush, surreal at the edges, and full of exact-sounding detail that may or may not be historical. He was a Buddhist and the later books turn openly to that. Enormously prolific; an anthology serves him better than a complete works.'
        ],
        readNext: [
            { slug: 'larry-levis', name: 'Larry Levis', note: 'The long associative line of the same era.' },
            { slug: 'charles-simic', name: 'Charles Simic', note: 'American surrealism kept plain.' },
            { slug: 'robert-browning', name: 'Robert Browning', note: 'The dramatic monologue at its source.' }
        ]
    },

    'robert-graves': {
        body: [
            'He wanted to be remembered as a poet and is mostly remembered for prose — a war memoir, historical novels, and a theory of poetry as the service of a triple goddess that he took entirely literally.',
            'The poems are formally traditional, clear and unfashionable in a deliberate way: he ignored modernism completely and wrote lyric after lyric in plain metre about love, myth and the First World War. The love poems are the best of them, and their strangeness comes from being addressed to a real woman and a mythic figure at once. He rewrote and discarded his own work continuously, so different editions differ substantially.'
        ],
        readNext: [
            { slug: 'siegfried-sassoon', name: 'Siegfried Sassoon', note: 'His friend, and the same war.' },
            { slug: 'wilfred-owen', name: 'Wilfred Owen', note: 'The war poetry that overshadowed his.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'The English lyric tradition he stayed inside.' }
        ]
    },

    'ross-gay': {
        body: [
            'The poet of delight, which he has made into something more rigorous than it sounds: the poems insist on joy while remaining fully aware of Black death, grief and American violence, and the insistence is the argument.',
            'Gardens are everywhere — he is a serious grower of fruit — and so are long sinuous sentences that run down the page in very short lines, so a single poem can be one breath held for four pages. The book of small essays on delight is the companion piece. The gratitude is not naive; it is a discipline practised in full view of everything that makes it difficult.'
        ],
        readNext: [
            { slug: 'aimee-nezhukumatathil', name: 'Aimee Nezhukumatathil', note: 'The other contemporary poet of wonder.' },
            { slug: 'camille-t-dungy', name: 'Camille T. Dungy', note: 'The garden read against history.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Celebration as a form of resistance.' }
        ]
    },

    'stephen-edgar': {
        body: [
            'An Australian poet who writes in intricate rhymed stanzas of his own devising, with long sentences threaded through them so carefully that the rhymes can pass almost unnoticed on a first reading.',
            'The subjects are time, physics, photographs, the sea and the strangeness of consciousness persisting from one moment to the next. Tasmania and the Australian light are constant presences. The technical accomplishment is at the very top of contemporary formal verse in English, and the poems wear it lightly enough that readers who dislike form on principle frequently do not notice it happening.'
        ],
        readNext: [
            { slug: 'les-murray', name: 'Les Murray', note: 'The other major Australian voice, entirely different.' },
            { slug: 'a-e-stallings', name: 'A. E. Stallings', note: 'Contemporary rhyme handled with comparable ease.' },
            { slug: 'anthony-hecht', name: 'Anthony Hecht', note: 'Elaborate stanzas carrying serious weight.' }
        ]
    },

    'thom-gunn': {
        body: [
            'He began in England writing tight metrical poems about will, motorcyclists and existential poise, moved to San Francisco, and gradually let free verse and a far warmer temperament into the work.',
            'The two modes coexist for the rest of his life, and he switched between them by subject rather than by period. The central book is the one written out of the AIDS epidemic: elegies for friends, in metre, refusing both euphemism and spectacle, and among the finest poems of the late twentieth century. He wrote about drugs, sex and street life with a level gaze that never asked for either approval or shock.'
        ],
        readNext: [
            { slug: 'mark-doty', name: 'Mark Doty', note: 'The same epidemic, more lyrical.' },
            { slug: 'yvor-winters', name: 'Yvor Winters', note: 'His teacher, and the source of the metre.' },
            { slug: 'randall-mann', name: 'Randall Mann', note: 'The San Francisco formalist after him.' }
        ]
    },

    'trumbull-stickney': {
        body: [
            'A classical scholar who died at thirty and left a small body of poems that keep being rediscovered by people who feel he should be better known.',
            'The verse is late-Victorian in manner — sonnets, blank verse, classical subjects — and the best of it has an unusual note of exhaustion and doubt that sounds a decade or two ahead of its date. The much-anthologised lyric about being mnemosyne, arranging memories of places by their weather, is the one to start with. It is a small and unfinished body of work, and the interest is real rather than sentimental.'
        ],
        readNext: [
            { slug: 'edwin-arlington-robinson', name: 'Edwin Arlington Robinson', note: 'His American contemporary, and the survivor.' },
            { slug: 'matthew-arnold', name: 'Matthew Arnold', note: 'The doubt he inherited.' },
            { slug: 'george-santayana', name: 'George Santayana', note: 'The philosopher-poet of the same Harvard circle.' }
        ]
    },

    'walter-savage-landor': {
        body: [
            'A Romantic-era writer with an entirely classical temperament: the poems are short, chiselled, epigrammatic and unemotional in manner, which put him permanently out of step with his own period.',
            'The best of them are four or eight lines and read like inscriptions — the famous quatrain about having warmed both hands before the fire of life is exactly that, a self-epitaph written decades before it was needed. He also wrote enormous prose dialogues between historical figures. Cantankerous, litigious and exiled by his own temper, he outlived nearly everyone he began with.'
        ],
        readNext: [
            { slug: 'ben-jonson', name: 'Ben Jonson', note: 'The English classical epigram at its source.' },
            { slug: 'j-v-cunningham', name: 'J. V. Cunningham', note: 'The modern master of the same form.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'The Victorian who kept the hard edge.' }
        ]
    },

    'wilfred-owen': {
        body: [
            'He wrote for about a year and was killed a week before the armistice, and the poems changed how the First World War is understood in English.',
            'The technical invention is pararhyme — words matched by consonant and not by vowel, so every rhyme lands slightly wrong — which produces exactly the unresolved sound the subject requires. The famous poems do two things at once: describe a gas attack or a mutilated man with clinical exactness, and dismantle the language of glory sentence by sentence. His draft preface says the poetry is in the pity, and that the elegies are to this generation in no sense consolatory.'
        ],
        readNext: [
            { slug: 'siegfried-sassoon', name: 'Siegfried Sassoon', note: 'The friend who encouraged and edited him.' },
            { slug: 'isaac-rosenberg', name: 'Isaac Rosenberg', note: 'The same war, written from the ranks.' },
            { slug: 'ivor-gurney', name: 'Ivor Gurney', note: 'The composer-poet who survived it, barely.' }
        ]
    },

    'adam-zagajewski': {
        body: [
            'A Polish poet, read here in translation, whose work moves between the ordinary European present — trains, cafés, provincial towns — and a historical weight that is never stated directly.',
            'He began as part of a dissident generation writing pointedly political verse and then turned away from it, arguing that poetry that only opposes becomes as narrow as what it opposes. What replaced it is a poetry of praise held in permanent tension with knowledge of catastrophe; the poem urging the mutilated world be tried anyway is the clearest instance, and it circulated widely after 2001 for reasons the poem itself would probably have distrusted.'
        ],
        readNext: [
            { slug: 'czeslaw-milosz', name: 'Czeslaw Milosz', note: 'The elder Polish poet behind him.' },
            { slug: 'yehuda-amichai', name: 'Yehuda Amichai', note: 'History carried in domestic language.' },
            { slug: 'peter-balakian', name: 'Peter Balakian', note: 'Inherited catastrophe as a lifelong subject.' }
        ]
    },

    'alfred-corn': {
        body: [
            'A formally accomplished poet and a serious critic, whose handbook on English metre is one of the more useful books of its kind — and the verse shows the same analytic temperament.',
            'The poems are urbane, allusive and drawn to travel, painting, architecture and religion; a long poem on American history and a sequence written around the AIDS epidemic are the most ambitious. He writes at length and expects patience. The manner is deliberately cultivated at a moment when American poetry mostly prized the demotic, which has cost him readers and is also the reason to read him.'
        ],
        readNext: [
            { slug: 'anthony-hecht', name: 'Anthony Hecht', note: 'Erudition carried in elaborate stanzas.' },
            { slug: 'richard-howard', name: 'Richard Howard', note: 'Erudition and the dramatic monologue.' },
            { slug: 'mark-doty', name: 'Mark Doty', note: 'The epidemic elegy in a warmer register.' }
        ]
    },

    'alice-fulton': {
        body: [
            'She invented a piece of punctuation — a double equals sign — to mark a kind of connection English syntax has no symbol for, which tells you most of what you need to know about the ambition here.',
            'The poems draw on physics and complexity theory not as metaphor but as a theory of poetic form: she has argued for a fractal poetics in which pattern recurs at every scale rather than being imposed as metre. The surfaces are dense, punning and technically exuberant, and the subjects are science, gender, upstate New York and the body. Difficult, and the difficulty is systematic rather than decorative.'
        ],
        readNext: [
            { slug: 'heather-mchugh', name: 'Heather McHugh', note: 'Wordplay as the poem\'s argument.' },
            { slug: 'jorie-graham', name: 'Jorie Graham', note: 'Perception staged in the syntax.' },
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'The ancestor of scientific precision in verse.' }
        ]
    },

    'anne-bradstreet': {
        body: [
            'The first published poet of the American colonies, and the first substantial body of English verse written in North America. That fact tends to overshadow how good the later poems are.',
            'The early work is formal, public and imitative of the models available to her. The poems worth reading are the private ones — to her husband, on the death of grandchildren, on the burning of her house — where the Puritan requirement to submit to God\'s will runs directly into grief that will not comply, and the poem records the collision rather than resolving it. Her brother-in-law published the first book without her permission.'
        ],
        readNext: [
            { slug: 'edward-taylor', name: 'Edward Taylor', note: 'The other major Puritan poet of the colonies.' },
            { slug: 'george-herbert', name: 'George Herbert', note: 'The devotional model she wrote from.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The New England argument with God, two centuries on.' }
        ]
    },

    'carl-rakosi': {
        body: [
            'The longest-lived of the Objectivists, and the wryest. He stopped writing for about twenty-five years — a psychiatric social worker who decided the poetry and the politics could not be reconciled — and resumed after a reader tracked him down.',
            'The poems are short, clean and frequently comic, with an ear for pomposity and a fondness for the small observed thing. He is less austere than Oppen and less compressed than Niedecker, and the humour is the distinguishing note within that group. The late work, written in his eighties and nineties, is as lively as anything he did.'
        ],
        readNext: [
            { slug: 'george-oppen', name: 'George Oppen', note: 'The same group, and the gravest of them.' },
            { slug: 'charles-reznikoff', name: 'Charles Reznikoff', note: 'Objectivist attention at its purest.' },
            { slug: 'lorine-niedecker', name: 'Lorine Niedecker', note: 'The most compressed of the four.' }
        ]
    },

    'cathy-song': {
        body: [
            'Quiet, domestic poems set largely in Hawaii, built around family — grandmothers, mothers, children, kitchens — and the immigrant histories that put those people in that place.',
            'The manner is visual and unhurried; her first book takes its title and several poems from the painter Georgia O\'Keeffe and the woodblock artist Kitagawa Utamaro, and the poems work like those images, holding a single domestic scene until it discloses a generation. The risk in the mode is placidity, and the best poems avoid it by letting something unresolved sit at the edge of the frame.'
        ],
        readNext: [
            { slug: 'li-young-lee', name: 'Li-Young Lee', note: 'Family and exile in a more sensuous key.' },
            { slug: 'garrett-hongo', name: 'Garrett Hongo', note: 'Hawaii and Japanese American history.' },
            { slug: 'marilyn-chin', name: 'Marilyn Chin', note: 'The same inheritance, far more combative.' }
        ]
    },

    'charles-wright': {
        body: [
            'Long lines that drop and continue on a second, indented half-line, so the poem moves down the page in a stepped rhythm. That shape is the signature and it suits the content: these are meditations that keep pausing to look again.',
            'The subjects are landscape, memory, mortality and a religious longing without a religion — he called himself a God-fearing agnostic, and the poems keep addressing an absence with great courtesy. Italy, Appalachia and his own back yard recur. He served as United States Poet Laureate. Read for the movement of the sentence; the poems are not going anywhere in particular and are not meant to.'
        ],
        readNext: [
            { slug: 'a-r-ammons', name: 'A. R. Ammons', note: 'The other great American poem of process.' },
            { slug: 'mark-strand', name: 'Mark Strand', note: 'The meditative lyric, flatter and colder.' },
            { slug: 'larry-levis', name: 'Larry Levis', note: 'The long associative American line.' }
        ]
    },

    'claudia-emerson': {
        body: [
            'Narrative, formally careful poems about rural Virginia, marriage and its ending, written in a plain register that keeps the material from becoming either bitter or forgiving.',
            'The central book moves through the failure of one marriage and the beginning of another, and its most striking sequence is written to a second husband whose first wife had died — a genuinely difficult vantage handled with tact and without sentimentality. Later work deals with illness and with rural southern life. She died in her fifties; the late poems written from inside cancer treatment are direct and unsparing.'
        ],
        readNext: [
            { slug: 'natasha-trethewey', name: 'Natasha Trethewey', note: 'The formal southern poem of the same generation.' },
            { slug: 'ellen-bryant-voigt', name: 'Ellen Bryant Voigt', note: 'Rural Virginia in the same key.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'The quiet lyric with a dark undertow.' }
        ]
    },

    'cornelius-eady': {
        body: [
            'A poet with a strong sense of performance — many of the books were written for or with music, and the line lengths follow a speaking or singing voice rather than a metre.',
            'The best-known sequence is spoken by the imaginary Black man a white woman invented to cover her own crime, and it gives that fiction a voice, a body and a grievance. It is one of the sharpest things in recent American poetry about how a lie about race gets built. He co-founded an organisation that has supported a generation of African American poets, which belongs in any account of him.'
        ],
        readNext: [
            { slug: 'toi-derricotte', name: 'Toi Derricotte', note: 'His co-founder in that project.' },
            { slug: 'terrance-hayes', name: 'Terrance Hayes', note: 'The next generation of formal invention.' },
            { slug: 'yusef-komunyakaa', name: 'Yusef Komunyakaa', note: 'Music as the structure of the line.' }
        ]
    },

    'denis-johnson': {
        body: [
            'Known mainly for fiction, and the poems came first and are worth taking on their own terms: hallucinatory, plainspoken and set in the same America of motels, bad weather and chemically altered perception.',
            'The lines are long and the images arrive at odd angles, with a religious charge that never resolves into belief. Addiction and its aftermath are everywhere, treated without either apology or glamour. There is a strong strain of the visionary, which the flat vocabulary keeps from becoming grand — a man in a laundromat sees something enormous and reports it in the tone of somebody describing the weather.'
        ],
        readNext: [
            { slug: 'franz-wright', name: 'Franz Wright', note: 'The same territory, in shorter poems.' },
            { slug: 'james-tate', name: 'James Tate', note: 'American strangeness kept deadpan.' },
            { slug: 'charles-wright', name: 'Charles Wright', note: 'The unresolved religious longing.' }
        ]
    },

    'eavan-boland': {
        body: [
            'She spent a career arguing, in poems and in prose, that Irish poetry had made women into symbols — the nation as a woman, the muse, the fated girl — and had left actual women\'s lives out of the record.',
            'Her answer was to write the suburb: a kitchen in Dublin, a child\'s fever, a washing machine, an ordinary marriage, in a formally controlled line that makes no apology for the smallness of the occasion. The history poems set the famine and emigration against that domestic present. Her essays on the position of the woman poet in a national tradition are as influential as the verse.'
        ],
        readNext: [
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'The tradition she was arguing with.' },
            { slug: 'anne-stevenson', name: 'Anne Stevenson', note: 'The same generation, across the water.' },
            { slug: 'adrienne-rich', name: 'Adrienne Rich', note: 'The American version of the same argument.' }
        ]
    },

    'edwin-arlington-robinson': {
        body: [
            'The great American poet of the failed life. His New England town is populated by people the world has passed over — a rich man who kills himself, a drunkard who drinks to a lost age of chivalry, a miser, a man who cannot stop remembering — and each gets a short, formally perfect poem.',
            'The technique is worth watching: strict metre and rhyme handled so plainly that readers often do not notice, and a habit of withholding the decisive fact until the final line. He wrote long blank-verse narratives too, which were popular then and are read less now. The short portraits are among the best in American poetry.'
        ],
        readNext: [
            { slug: 'robert-frost', name: 'Robert Frost', note: 'The New England poem after him.' },
            { slug: 'edgar-lee-masters', name: 'Edgar Lee Masters', note: 'The small-town portrait gallery, in the Midwest.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'The same fatalism, in English.' }
        ]
    },

    'edwin-markham': {
        body: [
            'One poem made him internationally famous almost overnight: a response to a painting of a stooped French peasant, published in a newspaper and reprinted everywhere, which turned a picture into an indictment of labour and land ownership.',
            'It is a genuinely powerful piece of public verse — heavy, rhetorical, built for reading aloud at meetings — and it did political work in its moment. The rest of the writing rarely reaches that level, and the later career leaned on the fame. Read him as evidence of what poetry could still do in public life at the turn of the twentieth century.'
        ],
        readNext: [
            { slug: 'vachel-lindsay', name: 'Vachel Lindsay', note: 'Poetry written for public performance.' },
            { slug: 'carl-sandburg', name: 'Carl Sandburg', note: 'Labour as a subject, a generation later.' },
            { slug: 'ella-wheeler-wilcox', name: 'Ella Wheeler Wilcox', note: 'The other great newspaper poet of the period.' }
        ]
    },

    'eleanor-ross-taylor': {
        body: [
            'A southern poet who published slowly across six decades and was admired by other poets long before she was widely read — Randall Jarrell and Adrienne Rich among the earliest advocates.',
            'The poems are compressed, syntactically odd and frequently spoken by women whose situations are sketched rather than explained: a farm wife, a mother, somebody keeping house in a marriage that is not discussed. The ellipsis is deliberate and demanding. Recognition arrived very late, and the late books are as sharp as the early ones.'
        ],
        readNext: [
            { slug: 'ruth-stone', name: 'Ruth Stone', note: 'Another very late recognition.' },
            { slug: 'louise-bogan', name: 'Louise Bogan', note: 'Formal reticence about difficult material.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The compression she is often compared to.' }
        ]
    },

    'gary-soto': {
        body: [
            'Poems of a Mexican American childhood in California\'s Central Valley — fieldwork, factories, poverty, Fresno heat — written in a clear narrative line with a strong sense of the physical.',
            'The mode is memory rather than complaint: the poems recall rather than argue, and the politics arrive through accumulation of detail about what the work did to the people doing it. He has also written a great deal for young readers, and the crossover is natural, since the poems already take a child\'s vantage seriously. The best of them are funny and sad in the same few lines.'
        ],
        readNext: [
            { slug: 'alberto-ros', name: 'Alberto Ríos', note: 'The border told as story.' },
            { slug: 'juan-felipe-herrera', name: 'Juan Felipe Herrera', note: 'The same tradition, more experimental.' },
            { slug: 'philip-levine', name: 'Philip Levine', note: 'His teacher, and work as a subject.' }
        ]
    },

    'george-seferis': {
        body: [
            'The central Greek poet of the twentieth century in English translation, and the writer who found a way to carry the classical inheritance without being crushed by it.',
            'The poems are full of statues, stones, harbours and ruins, and the recurring pressure is that the past is enormous and the present is small and displaced — he came from a Greek community in Asia Minor that was uprooted, and exile is structural rather than metaphorical. He received the Nobel Prize in Literature, and he served as a diplomat, which explains the tone of a man watching history from just inside the room.'
        ],
        readNext: [
            { slug: 'c-p-cavafy', name: 'C. P. Cavafy', note: 'The Greek predecessor, ironic and historical.' },
            { slug: 'czeslaw-milosz', name: 'Czeslaw Milosz', note: 'The same century, another displacement.' },
            { slug: 'yehuda-amichai', name: 'Yehuda Amichai', note: 'Ancient language turned to modern speech.' }
        ]
    },

    'harryette-mullen': {
        body: [
            'Her most-read book takes Gertrude Stein\'s object poems and rewrites them through Black vernacular, advertising slogans, hair-care language and puns, producing something that is both a critique and a genuinely funny piece of writing.',
            'Constraint is the method throughout: alphabetical arrangement, dictionary procedures, a book of daily haiku-like observations written on walks. The wordplay is never decorative — it is where the racial and commercial pressure on language becomes audible. Read a page rather than a poem; the units are small and the effect is cumulative.'
        ],
        readNext: [
            { slug: 'gertrude-stein', name: 'Gertrude Stein', note: 'The book she is rewriting.' },
            { slug: 'terrance-hayes', name: 'Terrance Hayes', note: 'Wordplay as structural principle.' },
            { slug: 'evie-shockley', name: 'Evie Shockley', note: 'Formal experiment and Black poetics.' }
        ]
    },

    'isaac-rosenberg': {
        body: [
            'The First World War written from the ranks — he served as a private, was poor, Jewish and East End London, and the difference in vantage from the officer poets is visible in every line.',
            'There is no sense of betrayed idealism because there was no idealism to betray; the poems are physical, strange and almost impersonal, and their most famous images — a rat crossing between the trenches with impartial sympathies, poppies whose roots are in men\'s veins — belong to nobody\'s propaganda. He was also a painter. Killed in 1918, and recognised as a major poet only decades later.'
        ],
        readNext: [
            { slug: 'wilfred-owen', name: 'Wilfred Owen', note: 'The same war, from the officer\'s side.' },
            { slug: 'ivor-gurney', name: 'Ivor Gurney', note: 'The other ranker-poet of that war.' },
            { slug: 'siegfried-sassoon', name: 'Siegfried Sassoon', note: 'The officer\'s satire of the same war.' }
        ]
    },

    'ivor-gurney': {
        body: [
            'A composer and a poet, and among the finest English song-writers of his generation before the war and illness took the career apart.',
            'The war poems are unlike the standard anthology pieces: conversational, specific about mud, food, singing and comrades, and often more concerned with Gloucestershire than with the front. The later poems, written over fifteen years in asylums, are broken, urgent and occasionally extraordinary, and much of that work was unpublished for decades. His songs and his poems set each other off; hearing one changes how the other reads.'
        ],
        readNext: [
            { slug: 'edward-thomas', name: 'Edward Thomas', note: 'English landscape under the same shadow.' },
            { slug: 'isaac-rosenberg', name: 'Isaac Rosenberg', note: 'The war from the ranks.' },
            { slug: 'john-clare', name: 'John Clare', note: 'The asylum poems a century earlier.' }
        ]
    },

    'john-frederick-nims': {
        body: [
            'A formal poet, translator and teacher whose textbook on poetry taught several generations how metre actually works, and whose translations of Saint John of the Cross are still among the best in English.',
            'The original poems are metrically expert and often comic; he wrote love poems, epigrams and light verse with equal skill, and edited a major poetry magazine. The best-known lyric praises a woman for her clumsiness and is genuinely tender rather than condescending, which is a harder balance than it looks. He is a craftsman\'s poet, and the craft is the pleasure.'
        ],
        readNext: [
            { slug: 'richard-wilbur', name: 'Richard Wilbur', note: 'The formal peak of that generation.' },
            { slug: 'john-ciardi', name: 'John Ciardi', note: 'The other great poet-explainer of the period.' },
            { slug: 'x-j-kennedy', name: 'X. J. Kennedy', note: 'Light verse handled with full technique.' }
        ]
    },

    'john-greenleaf-whittier': {
        body: [
            'A Quaker abolitionist who wrote a great deal of committed political verse and one long poem about being snowed in on a New England farm, and it is the snow poem that survives.',
            'That poem is genuinely good: a family shut in for days, the fire, the stories told, and behind it the knowledge that everyone in the room is now dead. The antislavery poems were effective propaganda and read as propaganda now, which is not a criticism of what they were for. His hymns are still sung. The reputation has shrunk considerably from its Victorian height, and the domestic poem deserves to keep it from shrinking further.'
        ],
        readNext: [
            { slug: 'william-cullen-bryant', name: 'William Cullen Bryant', note: 'The same American generation.' },
            { slug: 'henry-wadsworth-longfellow', name: 'Henry Wadsworth Longfellow', note: 'The most popular of that group.' },
            { slug: 'paul-laurence-dunbar', name: 'Paul Laurence Dunbar', note: 'The next generation of American verse on race.' }
        ]
    },

    'joshua-mehigan': {
        body: [
            'A formalist working in plain, hard, unornamented metre — the poems rhyme and scan and the diction is deliberately ordinary, so the form registers as inevitability rather than as elegance.',
            'The subject that has drawn most attention is mental illness: a long sequence set in and around a psychiatric hospital, written without the two available clichés of either romanticising or pathologising. Elsewhere he writes about small industrial towns and the people in them. He publishes slowly and the body of work is small, which suits a poet whose whole method is refusing to say more than he can support.'
        ],
        readNext: [
            { slug: 'edwin-arlington-robinson', name: 'Edwin Arlington Robinson', note: 'The formal poem about a failed life.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'Plain vocabulary in immaculate metre.' },
            { slug: 'a-e-stallings', name: 'A. E. Stallings', note: 'Her contemporary in the same formal revival.' }
        ]
    },

    'june-jordan': {
        body: [
            'Poet, essayist and teacher, and one of the most directly political American writers of her generation — the poems address police violence, Palestine, South Africa, rape and language rights in plain declarative English.',
            'The directness is a considered position: she taught Black English as a subject and argued that the standard the schools enforce is a political instrument. The love poems are as unguarded as the political ones. She founded a programme built on the idea that poetry belongs to everyone, and a great deal of her energy went into students rather than into a career.'
        ],
        readNext: [
            { slug: 'audre-lorde', name: 'Audre Lorde', note: 'Her contemporary and closest peer in this work.' },
            { slug: 'adrienne-rich', name: 'Adrienne Rich', note: 'The same politics from a different position.' },
            { slug: 'martn-espada', name: 'Martín Espada', note: 'The political poem written to be understood.' }
        ]
    },

    'laura-kasischke': {
        body: [
            'Unsettling domestic poems — a suburb, a kitchen, a mother, a daughter — where the ordinary detail keeps sliding into dread without any change in the calm reporting voice.',
            'The imagery is surreal and the syntax is not, which is where the disquiet comes from: the sentence stays sane while its contents do not. Mortality, adolescence and the vulnerability of children recur constantly. She also writes novels, and the poems have that reader\'s sense of narrative withheld. The effect is closer to a horror film\'s pacing than to anything usually called lyric.'
        ],
        readNext: [
            { slug: 'louise-glck', name: 'Louise Glück', note: 'The domestic myth handled coldly.' },
            { slug: 'dorothea-lasky', name: 'Dorothea Lasky', note: 'Flat statement carrying extremity.' },
            { slug: 'sylvia-plath', name: 'Sylvia Plath', note: 'The kitchen turned frightening, at its source.' }
        ]
    },

    'linda-bierds': {
        body: [
            'A poet of historical imagination: the poems inhabit scientists, artists, inventors and their households — a photographer, a glassblower, a codebreaker — reconstructing a moment of perception rather than a biography.',
            'The research is thorough and worn lightly, and the poems are formally controlled, with a strong visual sense and long descriptive sentences. There is very little autobiography anywhere in the work, which was unfashionable throughout the period she wrote in. Read a whole book: the poems talk to each other, and single pieces can look like well-made curiosities on their own.'
        ],
        readNext: [
            { slug: 'norman-dubie', name: 'Norman Dubie', note: 'Invented history as a lifelong method.' },
            { slug: 'sandra-mcpherson', name: 'Sandra McPherson', note: 'Made things observed exactly.' },
            { slug: 'susan-stewart', name: 'Susan Stewart', note: 'Scholarship as poetic material.' }
        ]
    },

    'lisel-mueller': {
        body: [
            'She arrived in the United States as a teenager, a refugee from Nazi Germany, and wrote in English about a European inheritance she could not go back to — that displacement is quiet in the poems and structural.',
            'The manner is lucid and unshowy: fairy tales retold, immigrants, music, marriage, the ordinary furniture of a Midwestern life, with the historical catastrophe kept just off the page. She was also a translator from German. The most anthologised poem lists what happened when a mother\'s eyesight failed and is a good sample: plain sentences, and an accumulation that arrives somewhere unexpected.'
        ],
        readNext: [
            { slug: 'linda-pastan', name: 'Linda Pastan', note: 'The domestic lyric at similar scale.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'The quiet poem with a dark undertow.' },
            { slug: 'czeslaw-milosz', name: 'Czeslaw Milosz', note: 'The European inheritance stated directly.' }
        ]
    },

    'louis-untermeyer': {
        body: [
            'His importance is mostly as an anthologist. For half a century his collections were how American readers and students met modern poetry, and what he included or left out shaped a great many reputations.',
            'His own verse is competent, formal and of its period — parodies, light verse and lyrics, the parodies being the liveliest. He was also a translator and a popular broadcaster until Cold War blacklisting ended that. Read him for the history of taste as much as for the poems: the anthologies are a record of what American poetry was assumed to be, decade by decade.'
        ],
        readNext: [
            { slug: 'edna-st-vincent-millay', name: 'Edna St. Vincent Millay', note: 'The poet his anthologies helped make famous.' },
            { slug: 'robert-frost', name: 'Robert Frost', note: 'His friend, and the subject of much of his promotion.' },
            { slug: 'x-j-kennedy', name: 'X. J. Kennedy', note: 'The later anthologist-poet of light verse.' }
        ]
    },

    'marilyn-nelson': {
        body: [
            'A formal poet who has used inherited shapes — sonnet sequences, the crown of sonnets, ballad stanzas — to tell American histories that were kept out of the record, and specifically to give them the dignity that formal verse confers.',
            'The subjects include the scientist George Washington Carver, the lynching of Emmett Till, an enslaved man\'s remains kept in a medical collection, and her own family. She writes a good deal for young readers without simplifying the history. The decision to handle atrocity inside strict form is deliberate and is discussed in her own prose: the shape is a container for material that would otherwise be unbearable.'
        ],
        readNext: [
            { slug: 'rita-dove', name: 'Rita Dove', note: 'The historical sequence at domestic scale.' },
            { slug: 'natasha-trethewey', name: 'Natasha Trethewey', note: 'Inherited forms carrying the archive.' },
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'The sonnet turned to this material first.' }
        ]
    },

    'matthew-rohrer': {
        body: [
            'Light-footed, funny, slightly surreal poems that begin in an ordinary situation — a subway, a child, a dream, a walk — and move by small unexplained swerves rather than by argument.',
            'The tone is casual almost to the point of throwaway, and the poems are considerably better constructed than that surface admits: the endings land. He has written collaboratively and improvisationally, including books composed with another poet in real time, and the interest in composition as play runs through everything. Domestic life and fatherhood are the recurring material in the later books.'
        ],
        readNext: [
            { slug: 'james-tate', name: 'James Tate', note: 'Deadpan American surrealism.' },
            { slug: 'ron-padgett', name: 'Ron Padgett', note: 'The New York School casualness he inherits.' },
            { slug: 'elaine-equi', name: 'Elaine Equi', note: 'The short poem timed to the second.' }
        ]
    },

    'r-s-thomas': {
        body: [
            'A Welsh Anglican priest who wrote for sixty years about a hard hill country, the people farming it, and a God who does not answer. The three subjects are one subject.',
            'The early poems centre on a composite farmer — coarse, silent, unimproved — described with a mixture of revulsion and respect that Thomas never resolved. The later work turns almost entirely to theology: short, bare poems about waiting in an empty church for something that does not arrive. Nationalist, austere and frequently uncomfortable in his own opinions, he is one of the major religious poets in twentieth-century English.'
        ],
        readNext: [
            { slug: 'george-herbert', name: 'George Herbert', note: 'The devotional ancestor he wrote against.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The other priest-poet of the language.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'The empty church, from outside belief.' }
        ]
    },

    'rachel-hadas': {
        body: [
            'A poet, translator and classicist whose work is steeped in Greek — she lived in Greece for years, and the classical reading is a habit of mind rather than a set of references.',
            'The poems are formally attentive and essayistic, moving between myth, teaching, motherhood and, in the strongest sequence, a husband\'s long neurological illness. That book is unusual in the literature of caregiving for how much attention it gives to language itself as the thing being lost. The tone is measured throughout, which is what allows the hardest material to be stated plainly.'
        ],
        readNext: [
            { slug: 'anne-carson', name: 'Anne Carson', note: 'Classical material put to contemporary use.' },
            { slug: 'marie-ponsot', name: 'Marie Ponsot', note: 'Formal intricacy and domestic subject.' },
            { slug: 'alicia-ostriker', name: 'Alicia Ostriker', note: 'Myth and the essayist\'s mind.' }
        ]
    },

    'robert-bly': {
        body: [
            'He was the most effective advocate of a change in American poetry — away from formal, ironic verse and towards what he called the deep image, drawn from dreams, the unconscious and translation from Spanish and German.',
            'His magazine and his translations of Neruda, Vallejo, Machado, Rilke and Kabir did as much as his own poems to make that shift happen. The early nature poems are the best of the verse: short, quiet, Minnesotan, and genuinely strange. He was also a fierce opponent of the Vietnam war and, later, a figure in the men\'s movement, which drew a great deal of mockery and some of it was earned.'
        ],
        readNext: [
            { slug: 'james-wright', name: 'James Wright', note: 'His collaborator in the same turn.' },
            { slug: 'william-e-stafford', name: 'William E. Stafford', note: 'Plain Midwestern attention.' },
            { slug: 'louis-simpson', name: 'Louis Simpson', note: 'The third of that group.' }
        ]
    },

    'robert-louis-stevenson': {
        body: [
            'The novels overshadow the verse, and the verse is not an afterthought. His book of poems written for children is one of the few in that genre that neither talks down nor turns coy — a child alone with a lamplighter, a shadow, a fever, a counterpane made into a landscape.',
            'The technique is exact: simple metres handled without a stumble, and a real memory of what solitude feels like at that age. The adult poems include a self-written epitaph that has been on his grave and in anthologies ever since. He wrote in Scots as well as English, and the Scots poems are livelier than the reputation suggests.'
        ],
        readNext: [
            { slug: 'robert-burns', name: 'Robert Burns', note: 'The Scots tradition behind him.' },
            { slug: 'a-e-housman', name: 'A. E. Housman', note: 'Plain metre carrying real bleakness.' },
            { slug: 'walter-de-la-mare', name: 'Walter de la Mare', note: 'The next poet to write childhood strangeness well.' }
        ]
    },

    'stuart-dybek': {
        body: [
            'Known primarily for short stories set in Polish and Latino Chicago, and the poems occupy the same streets — viaducts, alleys, church bells, summer heat, a neighbourhood remembered with precision and no nostalgia.',
            'The verse is lyric and imagistic where the fiction is narrative, and the two forms clearly leak into each other: the stories are full of poems and the poems are full of half-told incidents. Music, especially the accordion and the radio, runs through both. Read the poems as the compressed version of a world the stories map at length.'
        ],
        readNext: [
            { slug: 'carl-sandburg', name: 'Carl Sandburg', note: 'The Chicago poem before him.' },
            { slug: 'gary-soto', name: 'Gary Soto', note: 'Childhood neighbourhood recalled exactly.' },
            { slug: 'charles-simic', name: 'Charles Simic', note: 'The city rendered slightly unreal.' }
        ]
    },

    'susan-stewart': {
        body: [
            'A poet and a scholar of equal seriousness, and the criticism — on longing, on the senses, on what poems do — is the best guide to what the poems are attempting.',
            'The verse is formally patterned, frequently built on repetition and question-and-answer structures borrowed from folk forms, and it is preoccupied with sensory experience and with the dead. The tone is grave without being solemn. This is deliberately literary poetry that expects a reader who enjoys a shape being worked out, and the shapes are unusual enough to reward that.'
        ],
        readNext: [
            { slug: 'linda-gregerson', name: 'Linda Gregerson', note: 'The other great scholar-poet of that generation.' },
            { slug: 'dan-beachy-quick', name: 'Dan Beachy-Quick', note: 'Reading turned into lyric.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'Scholarship and poem in one practice.' }
        ]
    },

    'sylvia-plath': {
        body: [
            'The late poems are the reason, and they were written in a few months: fast, controlled, savage, formally tight and utterly unlike the accomplished early work she had spent a decade perfecting.',
            'What makes them extraordinary is the technique, not the biography — the driving rhyme and half-rhyme, the short lines, the ability to hold a metaphor past the point of comfort. Her death has been allowed to swallow the reading of the work for sixty years, and the poems repay being taken as made objects. The novel, the journals and the early collection are all worth reading; the last book is the one that changed English poetry.'
        ],
        readNext: [
            { slug: 'anne-sexton', name: 'Anne Sexton', note: 'Her friend and contemporary.' },
            { slug: 'robert-lowell', name: 'Robert Lowell', note: 'Her teacher, and the confessional turn she outgrew.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The compression she worked from.' }
        ]
    },

    't-s-eliot': {
        body: [
            'He changed what an English poem could be twice — once with a monologue by a man too anxious to speak, and again with a fragmented, quotation-riddled poem about a civilisation after the war, which set the terms for modernism in English.',
            'The later religious poems are a different achievement: quieter, more discursive, and among the finest devotional verse of the century. As an editor and critic he shaped taste for decades. The antisemitism in some of the early poems is real and is part of what has to be read. Ezra Pound cut the long poem to roughly half its length, which is a fact worth knowing before reading it.'
        ],
        readNext: [
            { slug: 'ezra-pound', name: 'Ezra Pound', note: 'Who edited the poem into its final shape.' },
            { slug: 'geoffrey-hill', name: 'Geoffrey Hill', note: 'The inheritance argued with.' },
            { slug: 'william-butler-yeats', name: 'William Butler Yeats', note: 'The other pole of modernism in English.' }
        ]
    },

    'tom-clark': {
        body: [
            'Prolific, fast and hard to summarise — poems, biographies of other poets, sports writing, and a long association with the second-generation New York School and with Bolinas in California.',
            'The poems are short, colloquial and often deceptively casual, ranging from love lyrics to political anger to jokes about baseball. He was a poetry editor for a major literary magazine for years and published a great deal of important work. The unevenness is the cost of the speed; the best pieces have a clarity and lightness very few writers of that scene managed.'
        ],
        readNext: [
            { slug: 'ted-berrigan', name: 'Ted Berrigan', note: 'The centre of that circle.' },
            { slug: 'ron-padgett', name: 'Ron Padgett', note: 'The same generation and the same wit.' },
            { slug: 'joanne-kyger', name: 'Joanne Kyger', note: 'The Bolinas poets he wrote among.' }
        ]
    },

    'weldon-kees': {
        body: [
            'A poet, painter, jazz musician and photographer who published three books, walked away from a car left near the Golden Gate Bridge, and was never found. The disappearance has attached itself to the work permanently.',
            'The poems deserve better than that frame: they are formally accomplished, cold, and among the bleakest in American English. A recurring figure named Robinson moves through empty apartments doing nothing in particular, and the effect is of a man watched by a camera nobody is operating. Post-war American emptiness has never been written better, and the reputation has grown steadily since.'
        ],
        readNext: [
            { slug: 'edwin-arlington-robinson', name: 'Edwin Arlington Robinson', note: 'The American poem of a hollow life.' },
            { slug: 'donald-justice', name: 'Donald Justice', note: 'Who edited him and kept him in print.' },
            { slug: 'delmore-schwartz', name: 'Delmore Schwartz', note: 'The same generation and the same weight.' }
        ]
    },

    'william-cowper': {
        body: [
            'An eighteenth-century poet of the quiet interior — a sofa, a garden, a winter evening, three pet hares — written in blank verse that made domestic detail a serious subject a generation before the Romantics.',
            'He suffered severe religious despair for much of his life, and the late poem about a sailor swept overboard is among the most frightening things in English: the drowning man is an image of himself, abandoned. He also wrote hymns still in use and a comic ballad about a runaway horse that was enormously popular. The range from light comedy to absolute terror is the striking thing.'
        ],
        readNext: [
            { slug: 'william-wordsworth', name: 'William Wordsworth', note: 'The domestic blank verse he made possible.' },
            { slug: 'john-clare', name: 'John Clare', note: 'Rural detail and mental collapse.' },
            { slug: 'thomas-gray', name: 'Thomas Gray', note: 'The eighteenth-century elegiac mode.' }
        ]
    },

    'william-cullen-bryant': {
        body: [
            'He wrote the poem that made American nature verse possible before he was twenty — a meditation on death set in the American landscape rather than a European one — and spent the rest of a long life as a newspaper editor.',
            'The verse is formal, dignified and Wordsworthian, and its historical importance is larger than its present readership. The best of it turns on a particular American scene — a prairie, a waterfowl crossing an empty sky — and derives its argument from that rather than from inherited symbolism. As an editor he was an influential abolitionist voice, which is part of why he mattered so much in his century.'
        ],
        readNext: [
            { slug: 'ralph-waldo-emerson', name: 'Ralph Waldo Emerson', note: 'The American nature argument stated in prose.' },
            { slug: 'john-greenleaf-whittier', name: 'John Greenleaf Whittier', note: 'The same generation and politics.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'What American poetry did next.' }
        ]
    },

    'william-meredith': {
        body: [
            'A formal poet of considerable reticence — the poems are courteous, measured and reluctant to raise their voice, which made him unfashionable during the confessional decades and looks like integrity now.',
            'He served as a naval aviator in two wars, and the war poems are notable for refusing drama. Later work deals with friendship, ageing and the deaths of other poets. A stroke left him with severe aphasia for the last two decades of his life, and he continued to publish; the late poems are shorter and even plainer. He served as poetry consultant to the Library of Congress.'
        ],
        readNext: [
            { slug: 'richard-wilbur', name: 'Richard Wilbur', note: 'The formal generation he belonged to.' },
            { slug: 'howard-nemerov', name: 'Howard Nemerov', note: 'Reticence and wit in the same measure.' },
            { slug: 'donald-justice', name: 'Donald Justice', note: 'Formal control kept to the end.' }
        ]
    },

    'lonie-adams': {
        body: [
            'A poet of the metaphysical lyric in an American century that mostly went the other way — the poems are compressed, syntactically inverted and deliberately archaic in diction, closer to the seventeenth century than to her own.',
            'The body of work is small and was admired by a narrow group of her contemporaries; she served as poetry consultant to the Library of Congress and taught for many years. The poems reward slow reading and resist paraphrase entirely, which has kept the audience small. Read her beside Louise Bogan, with whom she shared a generation and a preference for reticence.'
        ],
        readNext: [
            { slug: 'louise-bogan', name: 'Louise Bogan', note: 'Her closest contemporary in temperament.' },
            { slug: 'elinor-wylie', name: 'Elinor Wylie', note: 'The same polished American lyric.' },
            { slug: 'henry-vaughan', name: 'Henry Vaughan', note: 'The seventeenth-century manner she works in.' }
        ]
    },

    'anne-finch-countess-of-winchilsea': {
        body: [
            'An English poet whose best work is a nocturne — a garden at night, described in exact detail, in which the speaker\'s solitude and pleasure are inseparable from the darkness that permits them. Wordsworth singled it out as almost the only fresh natural description written between Milton and his own day.',
            'She also wrote directly about the position of a woman who writes, in verse that is witty rather than pleading, and about her own long depression in terms far more precise than the period generally allowed. The fables and the occasional poems are conventional; the nocturne, the self-defences and the melancholy poems are not.'
        ],
        readNext: [
            { slug: 'aphra-behn', name: 'Aphra Behn', note: 'The generation just before, and far more public.' },
            { slug: 'katherine-philips', name: 'Katherine Philips', note: 'Female friendship as a serious poetic subject.' },
            { slug: 'william-cowper', name: 'William Cowper', note: 'The quiet English interior after her.' }
        ]
    },

    'anne-waldman': {
        body: [
            'A performance poet in the fullest sense — the work is written for the voice, at length, and the recordings are not a supplement to the page but the primary form.',
            'She was central to the St. Mark\'s Poetry Project in New York and co-founded a Buddhist-influenced writing school with Allen Ginsberg, and both institutions shaped decades of American poetry. Her long serial poem, written over many years, is feminist, incantatory and deliberately excessive. Read a passage aloud, at speed, and it works; read it silently in fragments and it can look like repetition without purpose.'
        ],
        readNext: [
            { slug: 'allen-ginsberg', name: 'Allen Ginsberg', note: 'Her co-founder, and the breath-driven line.' },
            { slug: 'alice-notley', name: 'Alice Notley', note: 'The long poem by a woman, taken further.' },
            { slug: 'bernadette-mayer', name: 'Bernadette Mayer', note: 'The same New York milieu.' }
        ]
    },

    'archibald-macleish': {
        body: [
            'A poet of the public sphere who spent much of his life in it — Librarian of Congress, government service, a verse play about Job that reached Broadway — and whose most quoted line argues that a poem should not mean but be.',
            'That line has been used against him ever since, since much of his own work is emphatically about meaning something. The early lyrics are the most durable: modernist in manner, formally assured, and unusually good on time and distance. The public verse of the thirties and forties is period writing of real skill, and reads now as a record of what American poetry sounded like when it addressed a nation.'
        ],
        readNext: [
            { slug: 't-s-eliot', name: 'T. S. Eliot', note: 'The modernist manner he adapted.' },
            { slug: 'karl-shapiro', name: 'Karl Shapiro', note: 'The next generation of public American verse.' },
            { slug: 'stephen-vincent-bent', name: 'Stephen Vincent Benét', note: 'The American historical poem of that moment.' }
        ]
    },

    'audre-lorde': {
        body: [
            'She described herself as a Black lesbian mother warrior poet, and insisted that none of those could be left out of a reading of the work. The poems act on that: identity is not a theme here, it is the ground.',
            'The verse is direct, rhythmic and angry in a controlled way, and it moves easily between the political and the erotic — she argued that the two are the same energy. The prose is equally important, particularly the essays on difference and on the uses of anger, and the journals written during cancer treatment. Read the poems and the essays together; they were never separate practices for her.'
        ],
        readNext: [
            { slug: 'june-jordan', name: 'June Jordan', note: 'Her contemporary and closest peer.' },
            { slug: 'adrienne-rich', name: 'Adrienne Rich', note: 'The long argument between the two of them.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'The same material, at a fraction of the volume.' }
        ]
    },

    'carolyn-forch': {
        body: [
            'She spent time in El Salvador before and during its civil war, and the book that came out of it made the phrase poetry of witness a category in American letters — and started an argument about it that has not stopped.',
            'The most famous poem is a flat prose account of a dinner with a colonel who empties a sack of human ears onto the table. It reports and declines to interpret, which is the method. The later books are more fragmentary and more formally ambitious, and her anthology of witness poetry from the whole twentieth century is a major editorial work in its own right.'
        ],
        readNext: [
            { slug: 'ilya-kaminsky', name: 'Ilya Kaminsky', note: 'Atrocity written as parable.' },
            { slug: 'd-nurkse', name: 'D. Nurkse', note: 'Displacement reported flatly.' },
            { slug: 'muriel-rukeyser', name: 'Muriel Rukeyser', note: 'The American ancestor of documentary poetry.' }
        ]
    },

    'charlotte-anna-perkins-gilman': {
        body: [
            'Known now for a short story about wallpaper and for feminist economic theory, and the poems were part of the same campaign — verse written to be read at meetings and printed in reform magazines.',
            'They are satirical, metrically brisk and entirely unembarrassed about being propaganda: poems about housework, marriage as an economic arrangement, and the absurdity of the separate spheres. Judged as lyric they are thin; judged as public argument in verse they are effective and often very funny. Read them alongside the prose, which is where the argument is made in full.'
        ],
        readNext: [
            { slug: 'edwin-markham', name: 'Edwin Markham', note: 'Reform verse of the same period.' },
            { slug: 'ella-wheeler-wilcox', name: 'Ella Wheeler Wilcox', note: 'The popular American verse she wrote against.' },
            { slug: 'marge-piercy', name: 'Marge Piercy', note: 'The later feminist poem of use.' }
        ]
    },

    'danez-smith': {
        body: [
            'A performance-shaped poet whose work reached a very large audience through video before the books, and the writing is built for that — repetition, escalation, direct address, and endings that land like the last line of a set.',
            'The subjects are Black queer life, police violence, HIV and desire, and the formal range is wider than the performance reputation suggests: there are received forms, invented ones, erasures and long sequences. The best-known poem imagines an afterlife where the murdered boys are safe, which is elegy and refusal in the same gesture.'
        ],
        readNext: [
            { slug: 'terrance-hayes', name: 'Terrance Hayes', note: 'Formal invention on adjacent material.' },
            { slug: 'evie-shockley', name: 'Evie Shockley', note: 'Experiment and Black poetics.' },
            { slug: 'essex-hemphill', name: 'Essex Hemphill', note: 'The Black gay poem before them.' }
        ]
    },

    'david-st-john': {
        body: [
            'A lyric poet in the older sense — the poems are musical, sensuous and interested in beauty as such, at a moment when American poetry was mostly suspicious of it.',
            'The line is long and the syntax flows; the recurring material is desire, art, film and Europe, and the mode is closer to romance than to confession. He works in sequences and has written book-length poems, and the influence of Italian and French poetry is audible. Readers who find the manner too lush are reacting to something real; readers who want the ear indulged will find few contemporaries doing it as well.'
        ],
        readNext: [
            { slug: 'larry-levis', name: 'Larry Levis', note: 'His close contemporary, and the elegiac drift.' },
            { slug: 'charles-wright', name: 'Charles Wright', note: 'The long meditative American line.' },
            { slug: 'lucie-brock-broido', name: 'Lucie Brock-Broido', note: 'Lushness pursued to its limit.' }
        ]
    },

    'derek-walcott': {
        body: [
            'A Caribbean poet who took the whole English tradition as his inheritance and refused to apologise for it, while writing about the specific history — slavery, colonialism, the sea, St. Lucia — that tradition helped produce.',
            'The verse is formally rich and densely metaphorical, and the long poem retelling the Homeric material through fishermen on a Caribbean island is the major achievement. The recurring tension, stated openly in the poems, is between the language he loves and the empire that brought it. He received the Nobel Prize in Literature and was also a painter and a playwright.'
        ],
        readNext: [
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'His friend, and a parallel colonial inheritance.' },
            { slug: 'kamau-brathwaite', name: 'Kamau Brathwaite', note: 'The Caribbean alternative to Walcott\'s method.' },
            { slug: 'william-butler-yeats', name: 'William Butler Yeats', note: 'The model for a national poetry in English.' }
        ]
    },

    'donald-justice': {
        body: [
            'A poet\'s poet, and a great teacher — a large share of the American poets who came up through Iowa passed through his classroom, and his influence is visible in far more careers than his own reputation suggests.',
            'The poems are formally exact, restrained and elegiac, drawn to childhood in Florida, pianos, old photographs and the sense of a life mostly spent. He wrote villanelles and sestinas without strain and free verse that keeps the ghost of a metre. Nothing is raised, nothing is confessed, and the effect is of something withheld with great care. He also edited and rescued the work of Weldon Kees.'
        ],
        readNext: [
            { slug: 'weldon-kees', name: 'Weldon Kees', note: 'The poet he brought back into print.' },
            { slug: 'richard-wilbur', name: 'Richard Wilbur', note: 'The formal generation he belongs with.' },
            { slug: 'mark-strand', name: 'Mark Strand', note: 'His student, and the flatter successor.' }
        ]
    },

    'edgar-albert-guest': {
        body: [
            'For decades a newspaper poem a day, syndicated across America, in plain rhymed stanzas about home, work, perseverance and family. He was probably the most widely read verse writer in the country and has never had any critical standing whatever.',
            'Both facts are worth holding. The poems are sentimental by design and metrically competent, and they did what they were for: they were cut out, kept in wallets and read at funerals. Dorothy Parker\'s famous quip at his expense is funnier than any line of his. Read him to understand what most Americans meant by poetry in the first half of the twentieth century.'
        ],
        readNext: [
            { slug: 'ella-wheeler-wilcox', name: 'Ella Wheeler Wilcox', note: 'The other great popular versifier.' },
            { slug: 'robert-w-service', name: 'Robert W. Service', note: 'Popular verse with far more craft.' },
            { slug: 'carl-sandburg', name: 'Carl Sandburg', note: 'The poet the same audience was also reading.' }
        ]
    },

    'evie-shockley': {
        body: [
            'A poet and scholar whose work moves between traditional forms, visual arrangement on the page and outright typographic play, on the argument that the shape of a Black poem is itself a contested question.',
            'Her criticism makes that case directly, and the poems demonstrate it: a sonnet, a shaped poem, a homophonic pun and an erasure can appear within a few pages. The subjects are race, history, the South and the politics of aesthetic categories. The wordplay is dense and rewards a slow second reading, which is the reading the poems are built for.'
        ],
        readNext: [
            { slug: 'harryette-mullen', name: 'Harryette Mullen', note: 'The clearest precedent for this play.' },
            { slug: 'terrance-hayes', name: 'Terrance Hayes', note: 'Invented forms with a purpose.' },
            { slug: 'nathaniel-mackey', name: 'Nathaniel Mackey', note: 'Black experimental poetics at length.' }
        ]
    },

    'frank-bidart': {
        body: [
            'He uses typography as notation — capitals, italics, indentation, blank space — because he wanted the page to record a voice with the exactness of a musical score, and the poems are unreadable in any other layout.',
            'The great works are dramatic monologues spoken by people in extremity: a murderer, an anorexic, a dancer losing his mind. They are not sensationalist; the voices are given full articulacy and the poems refuse to stand outside them and judge. Later work turns to his own life, desire and Catholicism. The intensity is unrelenting and entirely deliberate.'
        ],
        readNext: [
            { slug: 'robert-lowell', name: 'Robert Lowell', note: 'His mentor, and the poems he helped edit.' },
            { slug: 'louise-glck', name: 'Louise Glück', note: 'The plain opposite of this notation.' },
            { slug: 'michael-ryan', name: 'Michael Ryan', note: 'Self-examination without mercy.' }
        ]
    },

    'galway-kinnell': {
        body: [
            'A poet of the body, animals and death, writing in a full-throated American line that owes a great deal to Whitman and nothing at all to irony.',
            'The best-known long poem crawls into the life of a bear and stays there, and the sequence built on the nightmares of a father listening to his children is as good on parenthood as anything in the language. He translated Villon and Rilke, wrote a much-loved poem about a pig, and read aloud superbly. The mode risks grandiosity and the poems mostly avoid it by staying stubbornly physical.'
        ],
        readNext: [
            { slug: 'james-wright', name: 'James Wright', note: 'The same generation and the same turn.' },
            { slug: 'gerald-stern', name: 'Gerald Stern', note: 'The ecstatic American line.' },
            { slug: 'donald-hall', name: 'Donald Hall', note: 'His contemporary and friend.' }
        ]
    },

    'george-starbuck': {
        body: [
            'A virtuoso of the comic and the formal, and one of the great technicians of light verse in American English — double rhymes, invented stanzas, puns sustained across an entire poem, all handled with an ease that hides the labour.',
            'The wit is not decorative: several of the best poems are political, and the joke is the delivery system for real anger about war and nuclear weapons. He belonged to the same Boston circle as Plath and Sexton and is much less read than either. Anyone who enjoys watching a form being played rather than obeyed will find a great deal here.'
        ],
        readNext: [
            { slug: 'x-j-kennedy', name: 'X. J. Kennedy', note: 'Light verse with full technique.' },
            { slug: 'anthony-hecht', name: 'Anthony Hecht', note: 'His contemporary, and the dark formalist.' },
            { slug: 'john-hollander', name: 'John Hollander', note: 'Formal play as a scholarly pleasure.' }
        ]
    },

    'heid-e-erdrich': {
        body: [
            'An Ojibwe poet whose work moves between lyric, visual poetry and film — she has made a considerable body of poem-films, and the interest in how a poem is delivered runs through everything.',
            'The subjects are Native identity, science and its treatment of Indigenous remains and DNA, food, family and the Great Lakes. The tone is dry and frequently comic, which cuts against the solemnity the material usually attracts. She has also edited anthologies of Native poetry that have changed what is available to read, and the curatorial work belongs in the same account as the poems.'
        ],
        readNext: [
            { slug: 'linda-hogan', name: 'Linda Hogan', note: 'Native poetry and the natural world.' },
            { slug: 'joy-harjo', name: 'Joy Harjo', note: 'The best-known voice of that tradition.' },
            { slug: 'diane-glancy', name: 'Diane Glancy', note: 'Fragmented form and Native inheritance.' }
        ]
    },

    'henry-vaughan': {
        body: [
            'A Welsh metaphysical poet who took George Herbert as a direct model and then went somewhere Herbert never did — towards light, childhood and a mysticism that reads as genuine rather than literary.',
            'The famous opening about seeing eternity the other night as a great ring of pure and endless light is characteristic: an abrupt visionary claim stated as fact. Nature is more present here than in the other devotional poets of the century, and so is a sense of the fallen adult looking back at a child who could still see. Uneven across a whole collection, and unmatched at his best.'
        ],
        readNext: [
            { slug: 'george-herbert', name: 'George Herbert', note: 'His acknowledged model.' },
            { slug: 'thomas-traherne', name: 'Thomas Traherne', note: 'The other mystic of childhood and light.' },
            { slug: 'richard-crashaw', name: 'Richard Crashaw', note: 'The extravagant end of the same devotion.' }
        ]
    },

    'hilaire-belloc': {
        body: [
            'Best known for cautionary verses for children in which badly behaved children die grotesquely and the moral is delivered with complete gravity. The joke is the deadpan, and the metre never falters.',
            'He also wrote sonnets, epigrams, drinking songs and a great deal of prose, and was a formidable public controversialist. The polemical Catholicism and the antisemitism in his prose are a real part of the record and cannot be waved away. The light verse survives on technique: it is as well made as any comic verse in English, and children still find the deaths extremely funny.'
        ],
        readNext: [
            { slug: 'edward-lear', name: 'Edward Lear', note: 'Nonsense with a gentler temperament.' },
            { slug: 'g-k-chesterton', name: 'G. K. Chesterton', note: 'His close ally, and the ballad revived.' },
            { slug: 'lewis-carroll', name: 'Lewis Carroll', note: 'The logician\'s version of the same comedy.' }
        ]
    },

    'ishmael-reed': {
        body: [
            'A satirist first, in poetry and in fiction — the poems are irreverent, allusive and combative, drawing on hoodoo, jazz, comic books, African diasporic religion and American politics without ranking any of them.',
            'His term for the aesthetic is Neo-HooDoo, and the argument is that a Black American art should draw on its own multiple sources rather than on the Western canon\'s permission. He has spent a career picking public fights, and the poems have the energy of somebody who expects to be argued with. Funny, uneven and consistently unwilling to be respectable.'
        ],
        readNext: [
            { slug: 'amiri-baraka', name: 'Amiri Baraka', note: 'The other great combative voice of that era.' },
            { slug: 'bob-kaufman', name: 'Bob Kaufman', note: 'Jazz surrealism from the same period.' },
            { slug: 'harryette-mullen', name: 'Harryette Mullen', note: 'The wordplay tradition after him.' }
        ]
    },

    'j-v-cunningham': {
        body: [
            'The finest modern epigrammatist in English, and by a distance. The poems are short — often two or four lines — rhymed, metrically exact and cold, and they say a complete thing and stop.',
            'He was a scholar of Renaissance literature and wrote in the classical tradition of Martial: wit as a weapon, brevity as a moral position. The self-epitaphs are famous and deserve to be. He studied under Yvor Winters and took the doctrine further than the teacher did. There is nothing decorative anywhere in the work, and it is unusually rereadable for exactly that reason.'
        ],
        readNext: [
            { slug: 'yvor-winters', name: 'Yvor Winters', note: 'His teacher, and the source of the severity.' },
            { slug: 'ben-jonson', name: 'Ben Jonson', note: 'The English classical epigram at its source.' },
            { slug: 'walter-savage-landor', name: 'Walter Savage Landor', note: 'The nineteenth-century master of the form.' }
        ]
    },

    'james-k-baxter': {
        body: [
            'The major New Zealand poet of his century, and an unusually public one: he moved through Catholic conversion, alcoholism and a late life running a commune on the Whanganui River, and the poems track all of it without much self-protection.',
            'The early work is formally traditional and technically brilliant; the late sequences, written in a loose long line addressed to a friend, are the most original — colloquial, prophetic, self-mocking and rooted in Māori as well as European ways of seeing. He is a national figure in a way that is hard to convey from outside, and the poems mostly earn it.'
        ],
        readNext: [
            { slug: 'les-murray', name: 'Les Murray', note: 'The Australian equivalent in scale and awkwardness.' },
            { slug: 'robert-lowell', name: 'Robert Lowell', note: 'The same movement from formal to loose.' },
            { slug: 'r-s-thomas', name: 'R. S. Thomas', note: 'A hard country and an argued religion.' }
        ]
    },

    'james-l-dickey': {
        body: [
            'A poet of physical extremity — hunting, flying, swimming, animals, bodies in motion — written in a driving anapaestic rhythm that almost nobody else in American poetry uses at length.',
            'The best poems put a man in a situation where the body takes over from the mind, and the propulsive metre enacts it. He flew in the Second World War, worked as an advertising executive, and was a considerable self-mythologiser, and the novel he is famous for has largely eaten the reputation of the verse. The poems about his brother and about firefighting are as good as anything in the period.'
        ],
        readNext: [
            { slug: 'galway-kinnell', name: 'Galway Kinnell', note: 'The body and the animal in the same key.' },
            { slug: 'robinson-jeffers', name: 'Robinson Jeffers', note: 'The American poem of violent nature.' },
            { slug: 'david-bottoms', name: 'David Bottoms', note: 'The Georgia poet he singled out and praised.' }
        ]
    },

    'jean-valentine': {
        body: [
            'Very short, very quiet poems with a great deal of white space, in which the connections are left out and the reader is trusted to feel where they were.',
            'The mode is close to dream and close to prayer without belonging to either, and the recurring material is friendship, loss, addiction, motherhood and the dead, addressed directly. Nothing is explained. The poems can look slight on the page and are unusually durable in memory, which is the test they are built for. Read several; a single one gives no sense of the accumulation.'
        ],
        readNext: [
            { slug: 'fanny-howe', name: 'Fanny Howe', note: 'The same interiority and refusal to conclude.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Compression with a different authority.' },
            { slug: 'paul-celan', name: 'Paul Celan', note: 'The silence between the lines.' }
        ]
    },

    'jimmy-santiago-baca': {
        body: [
            'He taught himself to read and write in prison, serving a long sentence, and began publishing from inside. That fact is inseparable from the work and the poems do not trade on it.',
            'The line is long and declamatory, the influence of Neruda and of Chicano oral tradition is direct, and the recurring subjects are incarceration, the New Mexico landscape, family and language as something taken and reclaimed. He has spent decades running writing workshops in prisons and detention centres. The poems are best read aloud; on the page the repetitions can look loose, and in the voice they are structural.'
        ],
        readNext: [
            { slug: 'etheridge-knight', name: 'Etheridge Knight', note: 'The other great American poet of the prison.' },
            { slug: 'martn-espada', name: 'Martín Espada', note: 'The political poem written to be understood.' },
            { slug: 'juan-felipe-herrera', name: 'Juan Felipe Herrera', note: 'The same tradition, more experimental.' }
        ]
    },

    'joanna-klink': {
        body: [
            'Slow, atmospheric poems of longing and attention, written in a syntax that keeps extending itself — clause after clause, as though stopping would settle something the poem does not want settled.',
            'The material is weather, distance, other people and the difficulty of reaching them, handled philosophically rather than anecdotally; there is very little narrative anywhere. The influence of German poetry and of Celan is acknowledged. Readers who want an occasion will find these elusive; readers willing to stay inside a sustained tone will find them unusually absorbing.'
        ],
        readNext: [
            { slug: 'paul-celan', name: 'Paul Celan', note: 'The poet she reads most closely.' },
            { slug: 'jorie-graham', name: 'Jorie Graham', note: 'Perception staged in the syntax.' },
            { slug: 'jean-valentine', name: 'Jean Valentine', note: 'The same interiority, far more compressed.' }
        ]
    },

    'john-clare': {
        body: [
            'An agricultural labourer who wrote the most exact poetry of the English countryside anyone has written — species named correctly, nests described from having watched them, and no picturesque framing anywhere.',
            'The enclosure of common land is the political centre of the work: he watched a landscape and a way of living be fenced off, and wrote about it as loss rather than as progress. The later poems, written across more than twenty years in asylums, include the famous declaration of being nobody knows what and nobody cares. Editors long smoothed his spelling and punctuation; modern editions restore them, and they are better unsmoothed.'
        ],
        readNext: [
            { slug: 'william-wordsworth', name: 'William Wordsworth', note: 'The nature poem from the other class position.' },
            { slug: 'robert-burns', name: 'Robert Burns', note: 'The vernacular poet he was compared to in his lifetime.' },
            { slug: 'ivor-gurney', name: 'Ivor Gurney', note: 'Asylum poems a century later.' }
        ]
    },

    'jonathan-swift': {
        body: [
            'The prose satires are what he is read for, and the poems are the same intelligence at closer range: short, colloquial, in brisk octosyllabic couplets, and frequently disgusting on purpose.',
            'He wrote about the body — dressing rooms, disease, decay — with a physical revulsion that has been diagnosed by every generation of critics since and is more usefully read as satire on illusion. He also wrote his own obituary poem, which is funny, vain and clear-eyed at once. The Irish poems attacking English rule are the least read and among the sharpest political verse of the century.'
        ],
        readNext: [
            { slug: 'alexander-pope', name: 'Alexander Pope', note: 'His friend, and the grander satirist.' },
            { slug: 'john-dryden', name: 'John Dryden', note: 'The satiric couplet before them both.' },
            { slug: 'samuel-johnson', name: 'Samuel Johnson', note: 'The moral satire that followed.' }
        ]
    },

    'karl-shapiro': {
        body: [
            'He won major recognition for poems written while serving in the Pacific during the Second World War, in strict form, and spent much of the rest of his career arguing against the literary establishment that had rewarded him.',
            'The war poems are unsentimental and exact — an autopsy, a troopship, a dead soldier\'s effects. Later he attacked modernism and the academic domination of poetry in polemics that made him enemies, and wrote a book of prose poems in a deliberately looser mode. The poems on Jewish identity are among the strongest in mid-century American verse.'
        ],
        readNext: [
            { slug: 'randall-jarrell', name: 'Randall Jarrell', note: 'The other great American poet of that war.' },
            { slug: 'john-ciardi', name: 'John Ciardi', note: 'The same war and the same generation.' },
            { slug: 'delmore-schwartz', name: 'Delmore Schwartz', note: 'Jewish American poetry of the period.' }
        ]
    },

    'kenneth-rexroth': {
        body: [
            'The elder of the San Francisco Renaissance — he ran the readings, made the introductions, and was the intellectual centre of a scene that later got named after younger and louder people.',
            'His own poems are quiet, erotic and full of the Sierra Nevada: camping, stars, a woman, mountain water, written in a plain line derived from his lifelong reading of Chinese and Japanese poetry. His translations from both are among the most influential in American English. He was an anarchist and wrote directly political elegies, most famously for Dylan Thomas, which is as angry a poem as the period produced.'
        ],
        readNext: [
            { slug: 'gary-snyder', name: 'Gary Snyder', note: 'The mountains and the Asian reading, inherited.' },
            { slug: 'lawrence-ferlinghetti', name: 'Lawrence Ferlinghetti', note: 'The other San Francisco institution.' },
            { slug: 'thomas-mcgrath', name: 'Thomas McGrath', note: 'American radical poetry of the same years.' }
        ]
    },

    'linda-gregg': {
        body: [
            'Spare, declarative poems, usually short, set in Greece, California or an unnamed elsewhere, and built out of stark images stated once with no elaboration.',
            'The tone is austere and slightly outside time — gods, animals, stones and a solitary woman who might be in any century. Desire and loss are the constants, handled without narrative. She wrote about attention as the poet\'s discipline, and her essay on what she called the resonant source is a useful key. Read a whole book; the individual poems are deliberately small and gain enormously in sequence.'
        ],
        readNext: [
            { slug: 'jack-gilbert', name: 'Jack Gilbert', note: 'Her longtime partner, working the same Greek austerity.' },
            { slug: 'louise-glck', name: 'Louise Glück', note: 'Myth and plainness in the same combination.' },
            { slug: 'jean-valentine', name: 'Jean Valentine', note: 'Compression and silence.' }
        ]
    },

    'linda-hogan': {
        body: [
            'A Chickasaw poet whose work holds together ecology, Native history and a spiritual account of the world in which those are not separable subjects.',
            'The poems are plain-spoken and image-led — animals, water, oil fields, bodies — and they carry an argument about land and dispossession without becoming argument. She has written novels and essays, and the essays make explicit what the poems assume. The strongest work sets a specific animal or place against a specific historical wrong, and lets the reader do the joining.'
        ],
        readNext: [
            { slug: 'joy-harjo', name: 'Joy Harjo', note: 'The best-known voice of that generation.' },
            { slug: 'heid-e-erdrich', name: 'Heid E. Erdrich', note: 'The next generation, and dryer.' },
            { slug: 'n-scott-momaday', name: 'N. Scott Momaday', note: 'The elder of Native American letters.' }
        ]
    },

    'louise-bogan': {
        body: [
            'A poet of extreme formal reticence — short, rhymed, tightly controlled lyrics that handle rage, betrayal and desire while giving away almost nothing about the occasion.',
            'That withholding was a considered position: she disliked confession and thought the poem should be an object rather than a disclosure. She was also, for nearly forty years, the poetry critic of a major magazine, and the reviews are sharp and worth reading. The body of work is small because she destroyed a great deal. What survives is as densely made as anything in American poetry of the century.'
        ],
        readNext: [
            { slug: 'lonie-adams', name: 'Léonie Adams', note: 'Her closest contemporary in temperament.' },
            { slug: 'elinor-wylie', name: 'Elinor Wylie', note: 'The same polished lyric.' },
            { slug: 'may-swenson', name: 'May Swenson', note: 'The generation after, and far more playful.' }
        ]
    },

    'margaret-atwood': {
        body: [
            'The novels have taken most of the attention and she began as a poet, publishing verse for a decade before the fiction made her famous — and the poems are sharper and stranger than the fiction\'s readers expect.',
            'They are short, cold, often written in the first person by somebody with a grievance, and full of Canadian landscape treated as hostile rather than picturesque. One sequence speaks in the voice of a nineteenth-century settler woman going mad in the bush; another rewrites Circe. The wit is dry and the politics — colonial, environmental, sexual — are stated without slogans.'
        ],
        readNext: [
            { slug: 'sylvia-plath', name: 'Sylvia Plath', note: 'The cold precision of the same decade.' },
            { slug: 'adrienne-rich', name: 'Adrienne Rich', note: 'The political lyric of that generation.' },
            { slug: 'a-f-moritz', name: 'A. F. Moritz', note: 'Canadian poetry at another angle.' }
        ]
    },

    'mark-jarman': {
        body: [
            'A formal poet associated with the New Narrative — the argument that American poetry should recover story and metre — and his own work makes that case better than the manifestos did.',
            'The central achievement is a sequence of unrhymed sonnets addressed to a God he is not sure is there, written by a minister\'s son who knows the liturgy from the inside. The doubt is genuine and so is the attention to form. He also wrote a book-length narrative poem about a California coastal childhood. Read the sonnets first; the argument and the craft are inseparable there.'
        ],
        readNext: [
            { slug: 'r-s-thomas', name: 'R. S. Thomas', note: 'The empty church, in Welsh hills.' },
            { slug: 'christian-wiman', name: 'Christian Wiman', note: 'Contemporary faith and formal density.' },
            { slug: 'dana-gioia', name: 'Dana Gioia', note: 'The same formal revival.' }
        ]
    },

    'mark-strand': {
        body: [
            'Flat, plain, slightly unnerving poems in which the speaker is frequently absent from his own life — the early work is full of vacancies, doubles and rooms just left, stated in the calmest possible sentences.',
            'The influence of Latin American and European surrealism is direct, and he translated from Spanish and Portuguese. Later books are more discursive and funnier, and the prose poems are very funny indeed. He served as United States Poet Laureate and wrote well on painting, especially Hopper, whose emptied rooms are close relatives of his own.'
        ],
        readNext: [
            { slug: 'charles-simic', name: 'Charles Simic', note: 'The same flatness, with objects.' },
            { slug: 'donald-justice', name: 'Donald Justice', note: 'His teacher, and the formal restraint behind it.' },
            { slug: 'james-tate', name: 'James Tate', note: 'The comic end of American strangeness.' }
        ]
    },

    'matthew-sweeney': {
        body: [
            'An Irish poet who called his mode alternative realism: the poems are told in flat, unhurried narrative sentences about events that are impossible, and nobody in them notices anything is wrong.',
            'A man keeps a coffin in his flat; a boy waits for a boat that will not come. The refusal to explain is total, and it produces genuine unease rather than whimsy. Donegal, the sea and emigration recur. He wrote a good deal for children, where the same deadpan works as comedy rather than dread. Short poems, plain vocabulary, and no reassurance anywhere.'
        ],
        readNext: [
            { slug: 'charles-simic', name: 'Charles Simic', note: 'The impossible stated as fact.' },
            { slug: 'russell-edson', name: 'Russell Edson', note: 'The cruel little fable.' },
            { slug: 'paul-muldoon', name: 'Paul Muldoon', note: 'Irish strangeness with more wordplay.' }
        ]
    },

    'maxine-kumin': {
        body: [
            'A poet of the New England farm written from inside the work of it — foaling, mucking out, haying, killing an animal that has to be killed — in formally careful verse that never sentimentalises the animals.',
            'The other constant is loss: she wrote for decades about the suicide of her close friend Anne Sexton, and the poems on that subject are among the least self-serving accounts of a friendship in American letters. She was seriously injured in a carriage accident late in life and wrote about the recovery with the same unsparing practicality she applies to livestock.'
        ],
        readNext: [
            { slug: 'anne-sexton', name: 'Anne Sexton', note: 'Her closest friend, and the elegies for her.' },
            { slug: 'donald-hall', name: 'Donald Hall', note: 'New England farm life in verse.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'The same country, quieter.' }
        ]
    },

    'may-swenson': {
        body: [
            'A formal inventor of great playfulness: shaped poems, riddles, typographic experiments, and a lifelong habit of describing a familiar thing in language that withholds its name until the reader guesses.',
            'The subjects are the body, animals, machines, space travel and desire, observed with an eye that is scientific and delighted at once. The love poems, many of them addressed to women and published cautiously in her lifetime, are frank and tender. She is one of the few American poets of her generation whose formal experiments read as pleasure rather than as programme.'
        ],
        readNext: [
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'Syllabic precision and the animal poem.' },
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: 'Her friend, and the exact eye.' },
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'The riddle-poem in the next generation.' }
        ]
    },

    'nathaniel-mackey': {
        body: [
            'Two serial works have run across decades and many volumes — one a sequence of poems, the other a series of letters written by a fictional musician — and neither is designed to conclude.',
            'Jazz is the model: phrases return altered, the writing improvises on its own earlier material, and the reading experience is closer to listening to a long set than to finishing a poem. The vocabulary draws on Caribbean, African and Andalusian sources. It is genuinely difficult work and the difficulty is musical rather than referential; start anywhere and read for twenty pages before judging.'
        ],
        readNext: [
            { slug: 'jay-wright', name: 'Jay Wright', note: 'The nearest contemporary in ambition.' },
            { slug: 'ed-roberson', name: 'Ed Roberson', note: 'Comparable syntactic difficulty.' },
            { slug: 'harmony-holiday', name: 'Harmony Holiday', note: 'Music and archive in the next generation.' }
        ]
    },

    'rabindranath-tagore': {
        body: [
            'A Bengali poet, songwriter, novelist, painter and educator whose stature in Bengal has never been matched in English, largely because the English versions are his own and are unlike the originals.',
            'He translated a selection of his songs into prose-poem English, and that book won him the Nobel Prize in Literature — the first for a writer from Asia — while giving Western readers a mystical, softened Tagore that Bengali readers do not recognise. He wrote the national anthems of two countries. Read the English versions knowing they are a shadow of a body of work that is above all musical.'
        ],
        readNext: [
            { slug: 'kahlil-gibran', name: 'Kahlil Gibran', note: 'The other early-century devotional bestseller in English.' },
            { slug: 'william-butler-yeats', name: 'William Butler Yeats', note: 'Who introduced the English translations.' },
            { slug: 'ezra-pound', name: 'Ezra Pound', note: 'The other channel for Asian poetry into English.' }
        ]
    },

    'ray-gonzalez': {
        body: [
            'A poet of the desert border country around El Paso and Juárez, working in short lyrics and in prose poems, with the landscape treated as a presence rather than a backdrop.',
            'The poems are image-driven and often surreal at the edges, drawing on Chicano experience, family and the specific heat and emptiness of that region. He has also been a prolific anthologist and editor of Latino writing, which has shaped what is available to read. The prose poems are the most distinctive part of the work and the best place to start.'
        ],
        readNext: [
            { slug: 'alberto-ros', name: 'Alberto Ríos', note: 'The border told as story.' },
            { slug: 'juan-felipe-herrera', name: 'Juan Felipe Herrera', note: 'The same tradition, performative.' },
            { slug: 'victor-hernndez-cruz', name: 'Victor Hernández Cruz', note: 'Latino poetry with a musical ear.' }
        ]
    },

    'ron-padgett': {
        body: [
            'Deadpan, generous and very funny — the poems take an ordinary thought and follow it one step past where anyone else would stop, and the comedy comes from the total absence of emphasis.',
            'He came to New York from Tulsa as a teenager, became part of the second-generation New York School, and has translated a great deal of French poetry. The plainness is deceptive: these are carefully timed poems about mortality, friendship and the strangeness of having a mind. Several of his poems were used in a film about a bus driver who writes, which introduced the work to a much larger audience.'
        ],
        readNext: [
            { slug: 'kenneth-koch', name: 'Kenneth Koch', note: 'His teacher, and the comic tradition.' },
            { slug: 'ted-berrigan', name: 'Ted Berrigan', note: 'His closest collaborator.' },
            { slug: 'james-tate', name: 'James Tate', note: 'The straight-faced absurd.' }
        ]
    },

    'sir-walter-ralegh': {
        body: [
            'Courtier, soldier, coloniser, prisoner and finally an executed man, and the poems come out of that life directly — several are addressed to a queen whose favour was the difference between everything and nothing.',
            'The tone is disillusioned in a way that reads as entirely modern: the reply to Marlowe\'s shepherd, refusing the pastoral offer on the grounds that everything named in it will rot, is the clearest example. The long poem written from prison is fragmentary and strange. The verse written the night before his execution is four lines and is the best thing of its kind in English.'
        ],
        readNext: [
            { slug: 'christopher-marlowe', name: 'Christopher Marlowe', note: 'The poem Ralegh answers.' },
            { slug: 'sir-philip-sidney', name: 'Sir Philip Sidney', note: 'The courtier poet as ideal.' },
            { slug: 'sir-thomas-wyatt', name: 'Sir Thomas Wyatt', note: 'Court danger in verse, a generation earlier.' }
        ]
    },

    'stephen-dunn': {
        body: [
            'The American middle-class interior examined with unusual honesty — marriage, suburbs, compromise, the small dishonesties of an ordinary decent life — in a conversational free verse that thinks aloud and keeps correcting itself.',
            'The poems characteristically set up a position, concede the objection to it, and end somewhere less comfortable than they began. The intelligence is the pleasure; there is very little imagery and almost no display. Critics have called the manner prosaic, and the reply is that a poem which convincingly changes its mind is harder to write than one that does not.'
        ],
        readNext: [
            { slug: 'william-matthews', name: 'William Matthews', note: 'The same reflective register, faster.' },
            { slug: 'mark-halliday', name: 'Mark Halliday', note: 'The talking poem with more irony.' },
            { slug: 'tony-hoagland', name: 'Tony Hoagland', note: 'The confrontational version.' }
        ]
    },

    'tim-dlugos': {
        body: [
            'A poet of downtown New York in the late seventies and eighties — fast, chatty, camp, full of names and bars and films — writing in the conversational mode the New York School had made available.',
            'The late poems change everything. Written while he was dying of AIDS, they keep the same casual voice and turn it on hospital rooms, catheters, visitors and faith, and the effect of that unaltered lightness is devastating. The long poem written from a hospital bed is one of the essential documents of the epidemic. He was little published in book form during his life and has been steadily recovered since.'
        ],
        readNext: [
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'The voice he inherited.' },
            { slug: 'eileen-myles', name: 'Eileen Myles', note: 'The same downtown, surviving it.' },
            { slug: 'thom-gunn', name: 'Thom Gunn', note: 'The epidemic elegy in formal verse.' }
        ]
    },

    'victor-hernndez-cruz': {
        body: [
            'A Puerto Rican poet who came to New York as a child and has moved between the island, the mainland and Morocco, and the poems move the same way — English and Spanish in the same line, with the rhythm of the music of both.',
            'He was one of the earliest and best of the Nuyorican poets, publishing very young, and the work is built for sound: the line lengths follow a beat rather than a syntax, and reading silently loses most of it. The later poems bring in Arabic and Andalusian material, arguing that Caribbean culture is already a mixture and always was.'
        ],
        readNext: [
            { slug: 'ray-gonzalez', name: 'Ray Gonzalez', note: 'Latino poetry of the same generation.' },
            { slug: 'juan-felipe-herrera', name: 'Juan Felipe Herrera', note: 'Bilingual performance poetry.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'The music-driven line at its source.' }
        ]
    },

    'amy-gerstler': {
        body: [
            'Funny, macabre and formally loose — the poems adopt voices (a ghost, a dog, a saint, a bride, a Victorian lady) and let them talk, and the pleasure is in how quickly a comic premise turns tender or grotesque.',
            'The material is drawn from religious kitsch, natural history, advice literature and medical curiosity, and the tone stays affectionate towards all of it. She has worked in and around the Los Angeles art world, and the poems have a collagist\'s appetite for other people\'s language. Prose poems and monologues suit her better than the lyric, and that is where the best work is.'
        ],
        readNext: [
            { slug: 'elaine-equi', name: 'Elaine Equi', note: 'The same cool comic surface.' },
            { slug: 'matthea-harvey', name: 'Matthea Harvey', note: 'Invention and whimsy with a hard centre.' },
            { slug: 'russell-edson', name: 'Russell Edson', note: 'The prose poem as cruel fable.' }
        ]
    },

    'andrew-hudgins': {
        body: [
            'A southern poet who writes formal verse about religion, family and the American South with a comic streak that keeps ambushing the seriousness — he is genuinely funny about death, sin and his own father.',
            'One book is a sequence of monologues spoken by a Confederate-era poet; another retells the life of Christ in an idiom that is reverent and irreverent at once. The blank verse and the rhymed stanzas are handled with real ease. The humour is not a defence mechanism so much as a theology: the poems keep suggesting that the sacred and the ridiculous are the same size.'
        ],
        readNext: [
            { slug: 'henry-timrod', name: 'Henry Timrod', note: 'The Confederate poet his monologues answer.' },
            { slug: 'mark-jarman', name: 'Mark Jarman', note: 'Formal verse and argued belief.' },
            { slug: 'david-bottoms', name: 'David Bottoms', note: 'The same southern generation.' }
        ]
    },

    'aracelis-girmay': {
        body: [
            'Lyrical, tender poems built on repetition and direct address, drawing on Eritrean, Puerto Rican and African American inheritance and refusing to treat any of them as a separate topic.',
            'Her strongest book takes the migrants who have drowned crossing the Mediterranean and the Red Sea as its occasion, and holds elegy and celebration in the same poems without letting either win. She also writes for children, and the same generosity of address runs through both. The line is long and incantatory; read aloud, the repetitions work as they are meant to.'
        ],
        readNext: [
            { slug: 'ross-gay', name: 'Ross Gay', note: 'Joy insisted on in full view of grief.' },
            { slug: 'ilya-kaminsky', name: 'Ilya Kaminsky', note: 'Catastrophe written as song.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Celebration as resistance.' }
        ]
    },

    'arthur-sze': {
        body: [
            'Poems built as constellations: sections that do not obviously connect, set beside each other so the reader supplies the relation — a technique he takes as much from Chinese poetry as from modernist collage.',
            'The content is unusually wide, moving between quantum physics, New Mexico landscape, Chinese classical material, ecology and daily life. He is also a translator from Chinese, and the trust in the bare image comes from there. Nothing is explained, and the poems avoid difficulty for its own sake: each individual image is perfectly clear, and only the joins are left to you.'
        ],
        readNext: [
            { slug: 'forrest-gander', name: 'Forrest Gander', note: 'Science and translation in one practice.' },
            { slug: 'gary-snyder', name: 'Gary Snyder', note: 'The Asian influence handled structurally.' },
            { slug: 'brenda-hillman', name: 'Brenda Hillman', note: 'Ecology and formal experiment.' }
        ]
    },

    'basil-bunting': {
        body: [
            'A Northumbrian poet who spent decades in obscurity — Persia, journalism, war service, a spell as a newspaper subeditor — and then published, in his sixties, one of the great long poems in modern English.',
            'That poem is an autobiography in five parts, patterned on a sonata, and it is written for the ear above everything: dense Northern consonants, dialect words, and a rhythm he insisted had to be heard rather than parsed. He worked from Pound and Zukofsky and from a lifelong study of Persian poetry. Listen to a recording before reading it; the sense follows the sound here, not the other way round.'
        ],
        readNext: [
            { slug: 'ezra-pound', name: 'Ezra Pound', note: 'His mentor and the method he adapted.' },
            { slug: 'lorine-niedecker', name: 'Lorine Niedecker', note: 'His correspondent, and the same compression.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'English consonantal music at its densest.' }
        ]
    },

    'benjamin-franklin': {
        body: [
            'Not a poet by trade or ambition, and the verse here should be read as what it is: occasional pieces, drinking songs, epitaphs and squibs by a man whose real instrument was prose.',
            'The interest is documentary and considerable. Eighteenth-century American verse was a social activity — written for a tavern, a newspaper, a friend\'s album — and Franklin\'s examples show what that looked like from the pen of the period\'s most versatile writer. The wit is genuine, the metre is competent, and the printer\'s epitaph he wrote for himself is the one piece that survives on its own merits.'
        ],
        readNext: [
            { slug: 'anne-bradstreet', name: 'Anne Bradstreet', note: 'American verse a century earlier, and far more serious.' },
            { slug: 'jonathan-swift', name: 'Jonathan Swift', note: 'The occasional satiric poem at its best.' },
            { slug: 'philip-freneau', name: 'Philip Freneau', note: 'The poet of the American Revolution.' }
        ]
    },

    'carol-muske-dukes': {
        body: [
            'A poet and novelist whose work has a strong narrative pull and an equally strong resistance to resolving the story — the poems circle an event rather than telling it.',
            'The books written after the sudden death of her husband are the most affecting, and they avoid the elegiac conventions almost entirely: the tone is bewildered and forensic rather than mournful. Elsewhere the subjects are Los Angeles, motherhood, art and public life. She founded a writing programme in a women\'s prison early in her career, and served as poet laureate of California.'
        ],
        readNext: [
            { slug: 'mary-jo-bang', name: 'Mary Jo Bang', note: 'Grief handled through style.' },
            { slug: 'claudia-emerson', name: 'Claudia Emerson', note: 'Narrative held at a formal distance.' },
            { slug: 'jorie-graham', name: 'Jorie Graham', note: 'The same generation, more experimental.' }
        ]
    },

    'cedar-sigo': {
        body: [
            'A Suquamish poet raised on the Port Madison reservation and formed as a writer in San Francisco, and both places are audible: the poems are casual, quick and social in the New York School manner, with an entirely different inheritance underneath.',
            'The lines are short, the references are to friends, records, painters and other poets, and the poems are frequently addressed to somebody. He writes about Native identity without making it a theme to be explained. His lectures on poetry as a practice among friends are a good companion to the verse.'
        ],
        readNext: [
            { slug: 'joanne-kyger', name: 'Joanne Kyger', note: 'His mentor, and the Bolinas line.' },
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'The conversational poem he works from.' },
            { slug: 'diane-glancy', name: 'Diane Glancy', note: 'Native inheritance and formal fragmentation.' }
        ]
    },

    'cesare-pavese': {
        body: [
            'An Italian poet and novelist, read here in translation, whose verse is unusual for its period in being narrative and prosaic on purpose — long lines telling small stories about men in bars, on roads, alone in rooms.',
            'He translated American fiction into Italian during Fascism, at some risk, and the plainness of that prose is audible in his own poems. The recurring subjects are solitude, work, the Piedmont countryside and an inability to be at ease with other people. The late poems, written in a very direct voice, are the best known and the hardest to read without knowing how his life ended.'
        ],
        readNext: [
            { slug: 'weldon-kees', name: 'Weldon Kees', note: 'Postwar emptiness written just as coldly.' },
            { slug: 'philip-levine', name: 'Philip Levine', note: 'Work and solitude in plain narrative.' },
            { slug: 'charles-bukowski', name: 'Charles Bukowski', note: 'The bar and the rented room, later.' }
        ]
    },

    'charles-bernstein': {
        body: [
            'The most polemical figure in Language writing, and the funniest — the poems parody official language, advertising, criticism and their own procedures, frequently within the same piece.',
            'The argument, made in essays as much as in verse, is that poetry\'s job is to make the reader aware of language as a constructed and political thing rather than as a transparent window. That sounds forbidding and the practice is often comic. He co-founded the journal that named the movement and has spent decades building archives and infrastructure for experimental poetry. Read the essays alongside; they are half the work.'
        ],
        readNext: [
            { slug: 'lyn-hejinian', name: 'Lyn Hejinian', note: 'The same movement, gentler in method.' },
            { slug: 'ron-silliman', name: 'Ron Silliman', note: 'The third pole of Language writing.' },
            { slug: 'gertrude-stein', name: 'Gertrude Stein', note: 'The ancestor they all claim.' }
        ]
    },

    'charlotte-mew': {
        body: [
            'A small body of work, published late and in poverty, in an idiom that belongs to no school: long irregular lines, dramatic monologues, and speakers whose situations are desperate and are never quite explained.',
            'The best-known poem is spoken by a farmer about the young wife who will not come near him, and it is genuinely frightening in a way Victorian and Georgian verse almost never is. Repression, sexual and religious, runs through everything. Hardy and Woolf admired her; the poems were nearly forgotten and have been recovered steadily since. Read the monologues first.'
        ],
        readNext: [
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Her advocate, and the same bleak music.' },
            { slug: 'stevie-smith', name: 'Stevie Smith', note: 'The next English oddity of the same kind.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'The Victorian lyric she inherits.' }
        ]
    },

    'claude-mckay': {
        body: [
            'A Jamaican-born poet who wrote militant political verse in the strictest possible English forms, and the contrast is the point: the sonnet that begins with the refusal to die like hogs uses a Shakespearean shape to declare armed resistance.',
            'He began writing in Jamaican Creole before leaving the island, and that early dialect work is worth reading beside the later sonnets. He travelled to the Soviet Union, lived in Marseille and Morocco, wrote novels, and ended in a very different politics from where he began. Central to the Harlem Renaissance and never entirely comfortable inside it.'
        ],
        readNext: [
            { slug: 'countee-cullen', name: 'Countee Cullen', note: 'The other great formalist of that movement.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'The vernacular alternative.' },
            { slug: 'paul-laurence-dunbar', name: 'Paul Laurence Dunbar', note: 'The generation before, and the dialect problem.' }
        ]
    },

    'david-bottoms': {
        body: [
            'Georgia landscapes, rivers, hunting, cars, fathers and sons, written in a plain narrative line with a strong sense of the physical and no interest in decoration.',
            'The best-known early poem watches boys shooting rats at a dump and turns that into something about aim, waste and coming of age without a word of commentary. Later work is quieter and more elegiac, particularly the poems about his father and about religion in the rural South. He served as poet laureate of Georgia. The mode is southern realism, and the restraint is what keeps it from nostalgia.'
        ],
        readNext: [
            { slug: 'james-l-dickey', name: 'James L. Dickey', note: 'The Georgia predecessor who first praised him.' },
            { slug: 'andrew-hudgins', name: 'Andrew Hudgins', note: 'The same generation, formal and comic.' },
            { slug: 'rodney-jones', name: 'Rodney Jones', note: 'Southern narrative verse alongside him.' }
        ]
    },

    'david-yezzi': {
        body: [
            'A formal poet and a dramatist, and the two overlap: many of the strongest poems are monologues, and the metre is handled the way a playwright handles it — as speech with a spine rather than as ornament.',
            'The subjects are marriage, work, moral compromise and the cost of ordinary self-interest, treated with a cool eye that rarely lets the speaker off. He has been a magazine editor and critic, and the verse has a critic\'s dislike of the approximate word. Not a large audience, and a poet other formalists read closely.'
        ],
        readNext: [
            { slug: 'j-v-cunningham', name: 'J. V. Cunningham', note: 'The hard modern epigram.' },
            { slug: 'dana-gioia', name: 'Dana Gioia', note: 'The same formal argument.' },
            { slug: 'joshua-mehigan', name: 'Joshua Mehigan', note: 'Contemporary metre kept plain.' }
        ]
    },

    'diane-glancy': {
        body: [
            'A poet of Cherokee descent whose work is deliberately broken — fragments, gaps, non-standard syntax, English pulled out of shape — on the argument that a language imposed by conquest should not be made to sound comfortable.',
            'The material is Native history, Christianity, the Trail of Tears, travel and the flat middle of America. She writes plays and fiction as well, and moves between forms within a single book. The difficulty is not obscurity: individual lines are stark and clear, and it is the refusal to join them smoothly that the reader has to accept.'
        ],
        readNext: [
            { slug: 'linda-hogan', name: 'Linda Hogan', note: 'The same inheritance, plainer.' },
            { slug: 'heid-e-erdrich', name: 'Heid E. Erdrich', note: 'Formal invention and Native material.' },
            { slug: 'joy-harjo', name: 'Joy Harjo', note: 'The best-known voice of that generation.' }
        ]
    },

    'dunya-mikhail': {
        body: [
            'An Iraqi poet who worked as a journalist in Baghdad, left under pressure and now writes from the United States, in Arabic and increasingly in English.',
            'The poems are short, plain and ironic, and the irony is what makes them survivable — the title poem of her best-known book describes war as an efficient and tireless worker, and the deadpan does more than any lament could. She writes about exile, telephone calls, children and objects left behind. The plainness is deceptive: nothing here is simple except the vocabulary.'
        ],
        readNext: [
            { slug: 'fady-joudah', name: 'Fady Joudah', note: 'Arabic poetry and English in one practice.' },
            { slug: 'ilya-kaminsky', name: 'Ilya Kaminsky', note: 'War told through parable and irony.' },
            { slug: 'miroslav-holub', name: 'Miroslav Holub', note: 'The dry deadpan under a regime.' }
        ]
    },

    'eamon-grennan': {
        body: [
            'An Irish poet who has taught for decades in the United States, writing close-focus poems of natural observation — birds, weather, tides, light on a wall — in long sinuous sentences that stay with a single perception.',
            'The influence of Irish landscape and of Italian poetry (he translates from Italian) both show. There is little narrative and almost no argument; what the poems offer is duration, the experience of looking at something for longer than is normal. That is a genuine and unfashionable ambition, and when it works the ordinary object becomes very strange.'
        ],
        readNext: [
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'The Irish poem of close physical attention.' },
            { slug: 'derek-mahon', name: 'Derek Mahon', note: 'The formal Irish contemporary.' },
            { slug: 'marianne-boruch', name: 'Marianne Boruch', note: 'Observation held past comfort.' }
        ]
    },

    'eliza-griswold': {
        body: [
            'A reporter who has covered conflict and religion in Africa, the Middle East and Appalachia, and a poet, and the two practices inform each other without collapsing into one.',
            'The poems are spare and travelled — landscapes, checkpoints, faith, the moral position of the outsider with a notebook — and they are conscious of that last problem. She also collected and translated landays, the short anonymous folk couplets of Pashtun women, many of them scabrous and dangerous to speak aloud. That book is a substantial piece of work in its own right.'
        ],
        readNext: [
            { slug: 'carolyn-forch', name: 'Carolyn Forché', note: 'The reporter-poet problem, stated first.' },
            { slug: 'tom-sleigh', name: 'Tom Sleigh', note: 'Journalism and poetry in the same career.' },
            { slug: 'd-nurkse', name: 'D. Nurkse', note: 'Conflict reported flatly.' }
        ]
    },

    'elizabeth-bishop': {
        body: [
            'She published very little and revised for years, and the result is a body of work with almost no weak poems in it. The surface is descriptive and modest; underneath, almost everything is about dislocation and the refusal to say so directly.',
            'The famous villanelle about losing things builds an argument about a lost person while insisting the whole way that loss is easily mastered, and the final parenthesis breaks it. Elsewhere: Nova Scotia, Brazil, a fish, a filling station, a moose on a road at night. Nothing is confessed, everything is looked at, and the looking turns out to be the emotion.'
        ],
        readNext: [
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'Her mentor, and the exact eye.' },
            { slug: 'robert-lowell', name: 'Robert Lowell', note: 'Her closest correspondent, and her opposite.' },
            { slug: 'may-swenson', name: 'May Swenson', note: 'Her friend, and another great looker.' }
        ]
    },

    'ella-wheeler-wilcox': {
        body: [
            'Enormously popular in her lifetime and critically dismissed then and since, she wrote thousands of poems for newspapers and gift books on love, cheerfulness, temperance and self-belief.',
            'The famous couplet about laughing and the world laughing with you is hers, and it is a fair sample: rhythmically confident, emotionally direct, and completely unembarrassed. One early collection was refused by a publisher as too erotic, which helped sales considerably. She belongs to the history of what verse was for — greeting cards, sermons, consolation — rather than to the history of poetic form.'
        ],
        readNext: [
            { slug: 'edgar-albert-guest', name: 'Edgar Albert Guest', note: 'The next generation of newspaper verse.' },
            { slug: 'sara-teasdale', name: 'Sara Teasdale', note: 'Popular lyric with far more craft.' },
            { slug: 'edwin-markham', name: 'Edwin Markham', note: 'Public verse of the same moment.' }
        ]
    },

    'eva-gore-booth': {
        body: [
            'An Irish poet, suffragist and labour organiser from an Anglo-Irish landed family who left it to work with women\'s trade unions in industrial England.',
            'The poems are lyrical, mystical and drawn to Irish legend, and they carry a pacifism that cost her socially during the First World War — she campaigned for conscientious objectors and against the executions after the Easter Rising, in which her sister was sentenced to death. Yeats wrote a famous poem about the two of them, which is how most readers arrive here. The political writing and the mystical lyrics are the same project.'
        ],
        readNext: [
            { slug: 'william-butler-yeats', name: 'William Butler Yeats', note: 'Who wrote about her and her sister.' },
            { slug: 'charlotte-mew', name: 'Charlotte Mew', note: 'The English contemporary, and another outsider.' },
            { slug: 'ivor-gurney', name: 'Ivor Gurney', note: 'The same war from inside it.' }
        ]
    },

    'frederick-seidel': {
        body: [
            'Deliberately offensive, formally impeccable and completely unrepentant — the poems rhyme neatly while describing wealth, sex, violence and racism in a voice that refuses to signal disapproval of itself.',
            'Motorcycles, hotels, tailors and named public figures recur. The critical argument about him has run for decades: whether the poems satirise the privileged voice they use or simply indulge it, and the honest answer is that they are constructed so that this cannot be settled. That is either the achievement or the evasion. Nobody else in American poetry sounds remotely like this.'
        ],
        readNext: [
            { slug: 'robert-lowell', name: 'Robert Lowell', note: 'The patrician American voice before him.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'Immaculate form carrying unpleasant content.' },
            { slug: 'charles-bukowski', name: 'Charles Bukowski', note: 'The opposite class position, similar provocation.' }
        ]
    },

    'geoffrey-brock': {
        body: [
            'A formal poet and a translator from Italian, and the translation work is the larger part of his public presence — versions of Italian poetry and prose that read as English poems rather than as cribs.',
            'His own poems are metrically assured, quiet and domestic: marriage, children, memory, the small negotiations of a shared life, with an occasional turn towards something darker that the form keeps in check. The body of work is small and unhurried. Readers who like a poem to be built rather than uttered will find a good deal here.'
        ],
        readNext: [
            { slug: 'a-e-stallings', name: 'A. E. Stallings', note: 'Formal verse and classical translation.' },
            { slug: 'david-ferry', name: 'David Ferry', note: 'Translation and original work inseparable.' },
            { slug: 'dana-gioia', name: 'Dana Gioia', note: 'The same formal revival.' }
        ]
    },

    'gregory-djanikian': {
        body: [
            'An Armenian poet born in Egypt and raised in the United States, whose best-known poems are about arriving — a boy learning American games, American slang and the specific comedy of getting them slightly wrong.',
            'Those poems are funny and warm and quietly serious about what assimilation costs. Underneath them sits the Armenian genocide, which enters the later work directly in poems that are much darker and more fragmentary. The plain narrative style stays constant across both, which is what makes the shift so effective when it comes.'
        ],
        readNext: [
            { slug: 'peter-balakian', name: 'Peter Balakian', note: 'The same inheritance, handled obliquely.' },
            { slug: 'gary-soto', name: 'Gary Soto', note: 'Childhood recalled in clear narrative.' },
            { slug: 'li-young-lee', name: 'Li-Young Lee', note: 'Exile and family in a more lyrical key.' }
        ]
    },

    'ha-jin': {
        body: [
            'A Chinese-born writer who has published entirely in English, a language he learned as an adult, and the poems are the least known part of a body of work dominated by fiction.',
            'They are plain, narrative and unliterary in vocabulary, which is a deliberate choice rather than a limitation: he has written about preferring a language he has to earn. The subjects are the Chinese countryside, the army, exile, and the ordinary compromises made under a political system that leaves little room. The flatness carries the weight; the poems never raise their voice about material that would justify it.'
        ],
        readNext: [
            { slug: 'marilyn-chin', name: 'Marilyn Chin', note: 'The same inheritance, far more combative.' },
            { slug: 'cathy-song', name: 'Cathy Song', note: 'Quiet domestic Asian American verse.' },
            { slug: 'czeslaw-milosz', name: 'Czeslaw Milosz', note: 'Exile written plainly.' }
        ]
    },

    'hailey-leithauser': {
        body: [
            'Short, dense, heavily rhymed poems that treat sound as the engine — internal rhyme, alliteration, palindromes and inherited forms handled with obvious delight.',
            'She published a first book late, and the work has an unhurried, finished quality as a result. The subjects are frequently sly or macabre — worms, appetites, small predators — and the technical brilliance keeps the tone from tipping into cuteness. This is poetry for readers who enjoy watching a difficult form solved, and the solutions are consistently better than the puzzle would require.'
        ],
        readNext: [
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'The obvious comparison, and the deeper one.' },
            { slug: 'a-e-stallings', name: 'A. E. Stallings', note: 'Contemporary rhyme with classical ballast.' },
            { slug: 'heather-mchugh', name: 'Heather McHugh', note: 'Wordplay as the poem\'s argument.' }
        ]
    },

    'hayan-charara': {
        body: [
            'An Arab American poet raised in Detroit, writing plain, domestic, narrative poems about family, a father\'s shop, the city, and the experience of being made suspect by American politics.',
            'The manner is understated to the point of flatness, and the political material arrives through incident rather than statement — a comment at a counter, a phone call, a name misread. He has edited anthologies of Arab American poetry that widened what is available in English. The children\'s writing shares the same clarity.'
        ],
        readNext: [
            { slug: 'fady-joudah', name: 'Fady Joudah', note: 'The same inheritance, more elliptical.' },
            { slug: 'naomi-shihab-nye', name: 'Naomi Shihab Nye', note: 'Arab American plainness and warmth.' },
            { slug: 'dunya-mikhail', name: 'Dunya Mikhail', note: 'Deadpan irony about war.' }
        ]
    },

    'henri-cole': {
        body: [
            'Formally tight — many poems are unrhymed sonnets or near-sonnets — and psychologically raw inside that tightness, which is the whole tension of the work.',
            'The subjects are the body, illness, desire, animals, a mother, and the poems approach them with an unblinking clinical attention that never becomes clinical in tone. Elizabeth Bishop\'s example of observation-as-emotion is visible, filtered through something much more exposed. The later books are looser and more direct. He writes about the natural world with the same intensity as about a hospital room, and does not distinguish.'
        ],
        readNext: [
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: 'The reticence he learned and then broke.' },
            { slug: 'carl-phillips', name: 'Carl Phillips', note: 'Desire and syntax under control.' },
            { slug: 'c-dale-young', name: 'C. Dale Young', note: 'Anatomy handled precisely.' }
        ]
    },

    'james-laughlin': {
        body: [
            'He founded the publishing house that kept modernist and international poetry in print in America for half a century — Pound told him to be a publisher rather than a poet, and he did both.',
            'His own verse is casual, epigrammatic and instantly recognisable by its shape: he typed in a strict measure where the second line of every couplet is within a character or two of the first, giving the poems an even, blocky look. The content is love, gossip, literary friendship and old age, in a light conversational voice. Charming rather than major, and the charm is real.'
        ],
        readNext: [
            { slug: 'ezra-pound', name: 'Ezra Pound', note: 'His teacher, and the source of the advice.' },
            { slug: 'kenneth-rexroth', name: 'Kenneth Rexroth', note: 'One of the poets his press sustained.' },
            { slug: 'ron-padgett', name: 'Ron Padgett', note: 'The light conversational poem, later.' }
        ]
    },

    'julian-talamantez-brolaski': {
        body: [
            'A poet who writes in a deliberately impure English — archaic spellings, Spanish, Chaucerian borrowings, country-and-western idiom and invented pronouns all in the same poem.',
            'That mixture is the argument, stated in the title of one book: mongrel language for a mixed inheritance, Mescalero Apache and Latinx and queer. They are also a country musician, and the songs and the poems belong together. The work is playful and genuinely difficult, and it asks the reader to accept that a poem need not settle on one register to be coherent.'
        ],
        readNext: [
            { slug: 'cedar-sigo', name: 'Cedar Sigo', note: 'A contemporary working adjacent ground.' },
            { slug: 'harryette-mullen', name: 'Harryette Mullen', note: 'Language mixed as method.' },
            { slug: 'bernadette-mayer', name: 'Bernadette Mayer', note: 'The experimental New York lineage.' }
        ]
    },

    'marilyn-chin': {
        body: [
            'Combative, funny and formally restless — she writes about Chinese American identity, assimilation and feminism with an anger that is frequently delivered as a joke, which makes it land harder.',
            'The poems draw on classical Chinese forms and on American pop culture in the same breath, and one much-anthologised poem turns her own name change on immigration into an argument about what a country asks people to give up. She translates from Chinese and has written fiction. The tone can shift from elegy to satire inside a stanza, deliberately.'
        ],
        readNext: [
            { slug: 'cathy-song', name: 'Cathy Song', note: 'The same inheritance, much quieter.' },
            { slug: 'ha-jin', name: 'Ha Jin', note: 'Chinese material in plain English.' },
            { slug: 'paisley-rekdal', name: 'Paisley Rekdal', note: 'Mixed inheritance and the archive.' }
        ]
    },

    'matthea-harvey': {
        body: [
            'Inventive and visually playful — books built around a robot and his wife, around erasures of a Victorian sea manual, around photographs of objects she has made — and the whimsy is consistently doing serious work.',
            'The poems are funny and formally odd, with a strong strain of melancholy underneath the invention: the imaginary creatures are usually lonely. She works across visual art and poetry and has written for children. Readers who mistrust whimsy should test her on the robot poems, where the conceit is sustained long enough to become genuinely sad.'
        ],
        readNext: [
            { slug: 'amy-gerstler', name: 'Amy Gerstler', note: 'Comic invention with a hard centre.' },
            { slug: 'elaine-equi', name: 'Elaine Equi', note: 'The short poem timed precisely.' },
            { slug: 'russell-edson', name: 'Russell Edson', note: 'The invented world as method.' }
        ]
    },

    'miroslav-holub': {
        body: [
            'A Czech immunologist who wrote poems, and the science is not a metaphor: the poems are constructed like experiments, stating conditions, making an observation and stopping without a conclusion.',
            'The tone is dry, ironic and deliberately unpoetic, which under a censoring regime was also a political strategy — a poem about a fly at Crécy or a boy drawing a door says what an editorial could not. He was widely translated into English and had a real influence on British and American poets looking for an alternative to lyric warmth. The wit survives translation better than most poetry does.'
        ],
        readNext: [
            { slug: 'zbigniew-herbert', name: 'Zbigniew Herbert', note: 'The Polish equivalent of that dry irony.' },
            { slug: 'charles-simic', name: 'Charles Simic', note: 'Eastern European deadpan in American English.' },
            { slug: 'dunya-mikhail', name: 'Dunya Mikhail', note: 'Irony as a way of surviving the subject.' }
        ]
    },

    'patricia-smith': {
        body: [
            'She came out of the performance scene as a repeat national slam champion, and the writing has that root — the poems are built to be delivered, and the persona work is central.',
            'The technical range is wider than the performance reputation suggests: sonnet crowns, sestinas, ghazals and a book-length sequence in which Hurricane Katrina speaks in its own voice alongside the people it drowned. Chicago, her father\'s murder, Black womanhood and American violence recur. Read the Katrina book whole; the accumulation of voices is the structure, and single poems undersell it.'
        ],
        readNext: [
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'The Chicago poem and the formal command.' },
            { slug: 'danez-smith', name: 'Danez Smith', note: 'The performance line, a generation later.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Persona and history in fewer words.' }
        ]
    },

    'paul-muldoon': {
        body: [
            'The most technically dazzling poet writing in Irish English — rhymes stretched to the edge of audibility, forms invented and then rigidly obeyed, and long poems whose end-words repeat across the whole sequence.',
            'The manner is playful and the material frequently is not: the Troubles, emigration, family, America. The poems refuse to resolve, and the refusal is a position about how much a poem can honestly claim to know. He can be maddening; the rewards are for readers who like a puzzle whose solution turns out to be a feeling. Start with the shorter early poems before the long ones.'
        ],
        readNext: [
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'His teacher, and the opposite temperament.' },
            { slug: 'derek-mahon', name: 'Derek Mahon', note: 'The Northern Irish formalist alongside him.' },
            { slug: 'matthew-sweeney', name: 'Matthew Sweeney', note: 'Irish strangeness kept deadpan.' }
        ]
    },

    'peter-gizzi': {
        body: [
            'Lyrical and elegiac in a tradition that mostly gave up on both — the poems are musical, syntactically broken, and openly indebted to Jack Spicer, whose work he edited.',
            'The recurring situation is a voice trying to reach somebody who is gone, and the brokenness of the line is the evidence rather than a style. Grief is the constant subject: brothers, friends, a whole poetic lineage. He was an important editor of experimental poetry magazines. Read for the sound and the address; there is very little narrative to hold on to and none is offered.'
        ],
        readNext: [
            { slug: 'michael-palmer', name: 'Michael Palmer', note: 'The broken lyric before him.' },
            { slug: 'robin-blaser', name: 'Robin Blaser', note: 'The serial poem in that lineage.' },
            { slug: 'susan-howe', name: 'Susan Howe', note: 'Archive and lyric fragment.' }
        ]
    },

    'rodney-jones': {
        body: [
            'Long-lined southern narrative poems, set mostly in rural Alabama, that talk their way through an incident and arrive at a moral complication rather than a moral.',
            'The material is race, religion, sex, work and family in the mid-century South, handled by somebody who grew up inside it and declines both nostalgia and easy repudiation. The line is discursive and the diction is plain, and the poems are frequently funny about things that are not funny. Read a long one whole; the shape only appears at the end.'
        ],
        readNext: [
            { slug: 'david-bottoms', name: 'David Bottoms', note: 'The same southern generation.' },
            { slug: 'andrew-hudgins', name: 'Andrew Hudgins', note: 'The South handled formally and comically.' },
            { slug: 'james-l-dickey', name: 'James L. Dickey', note: 'The southern poem of physical extremity.' }
        ]
    },

    'rosmarie-waldrop': {
        body: [
            'A poet, translator and publisher, born in Germany and writing in English, and the position between languages is the subject as much as the medium — she has written about the gap between them as the place her poems happen.',
            'The work is mostly in prose paragraphs that proceed by logical-sounding sentences whose logic does not hold, so the reader keeps being asked to notice how a sentence persuades. She translated Edmond Jabès and a great deal of contemporary French and German poetry, and ran a small press with her husband for decades. Difficult, precise and consistently funny in a very dry way.'
        ],
        readNext: [
            { slug: 'keith-waldrop', name: 'Keith Waldrop', note: 'Her husband and co-publisher.' },
            { slug: 'lyn-hejinian', name: 'Lyn Hejinian', note: 'The sentence as the unit of composition.' },
            { slug: 'gertrude-stein', name: 'Gertrude Stein', note: 'The grammar experiment at its source.' }
        ]
    },

    'russell-edson': {
        body: [
            'He wrote almost nothing but prose poems, for decades, in a single instantly recognisable mode: a short fable in which a family does something impossible and cruel, told in a flat fairy-tale register.',
            'A man marries a cake; parents eat their son; a father becomes furniture. The comedy is real and so is the horror, and the refusal to explain or moralise is total. He called himself a writer of little psychological anecdotes and was largely ignored by mainstream American poetry while quietly influencing everyone who writes prose poems now. Read a dozen; a single one reads as a joke, and the accumulation is something else.'
        ],
        readNext: [
            { slug: 'james-tate', name: 'James Tate', note: 'The late prose poems in the same territory.' },
            { slug: 'charles-simic', name: 'Charles Simic', note: 'The impossible object stated plainly.' },
            { slug: 'matthew-sweeney', name: 'Matthew Sweeney', note: 'The deadpan impossible narrative.' }
        ]
    },

    'sarah-lindsay': {
        body: [
            'A poet of extinction, deep time and biological oddity — trilobites, failed expeditions, dead languages, animals that no longer exist — written with dry humour and considerable research behind it.',
            'The poems are formally quiet and the strangeness is entirely in the content; she does not need to distort the syntax when the fossil record will do it for her. There is a persistent theme of things that persisted pointlessly or vanished without notice, and the tone toward all of it is affectionate. She works outside the usual career structures, and the books are the better for it.'
        ],
        readNext: [
            { slug: 'linda-bierds', name: 'Linda Bierds', note: 'History and science as poetic material.' },
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'The precise animal poem.' },
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'Dry wit and the natural world.' }
        ]
    },

    'seamus-heaney': {
        body: [
            'He began with poems about digging, ploughing, churning butter and cutting turf, written with a physical exactness that made an argument: this work and this speech belong in poetry.',
            'The middle books face the Northern Irish conflict directly and, more interestingly, face his own reluctance to write propaganda for either side. The bog poems, using preserved Iron Age bodies as a way into ritual violence, are the most argued about. Later he turned to translation — Beowulf above all — and to a lighter, more visionary late style. He received the Nobel Prize in Literature. The ear is the reason he lasts.'
        ],
        readNext: [
            { slug: 'derek-mahon', name: 'Derek Mahon', note: 'His contemporary, and the opposite instinct.' },
            { slug: 'paul-muldoon', name: 'Paul Muldoon', note: 'His student, and formally dazzling.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The consonantal music behind the early poems.' }
        ]
    },

    'tess-gallagher': {
        body: [
            'Plainspoken poems of the Pacific Northwest — logging country, water, working families — with an emotional directness that is unusual even in a period that prized it.',
            'The elegies for her husband, the writer Raymond Carver, are the best-known part of the work and are notable for how little they perform: the poems stay with practical, physical detail and let the grief sit underneath. She also writes about her father and about Irish connections. The manner is unguarded, which makes the poems easy to underestimate and hard to forget.'
        ],
        readNext: [
            { slug: 'dorianne-laux', name: 'Dorianne Laux', note: 'Working-class life and physical detail.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'The quiet elegy.' },
            { slug: 'linda-gregg', name: 'Linda Gregg', note: 'Directness pared much further.' }
        ]
    },

    'thomas-carew': {
        body: [
            'A Caroline court poet whose lyrics are among the most polished of the century — smooth, sensual, technically immaculate, and entirely unbothered about being frivolous.',
            'The love poems belong to the tradition of elegant persuasion that Jonson refined and the Cavaliers inherited. The one indispensable poem is his elegy for John Donne, which is also the best contemporary criticism of Donne anybody wrote: it names exactly what Donne did to English verse and admits that nobody else could do it. He also wrote an erotic poem frank enough to have been left out of editions for centuries.'
        ],
        readNext: [
            { slug: 'ben-jonson', name: 'Ben Jonson', note: 'The classical polish he learned.' },
            { slug: 'john-donne', name: 'John Donne', note: 'The poet of his great elegy.' },
            { slug: 'richard-lovelace', name: 'Richard Lovelace', note: 'The Cavalier lyric alongside him.' }
        ]
    },

    'will-alexander': {
        body: [
            'A surrealist of enormous vocabulary — the poems run on long unbroken cascades of scientific, alchemical and invented terminology, and the effect is closer to an incantation than to statement.',
            'He works from Aimé Césaire and the Black surrealist tradition rather than from American models, and the ambition is cosmic: biology, astronomy, African diasporic thought and philosophy all in the same sentence. Nothing here can be paraphrased and the poems do not want to be. He is also a musician and a painter. Read a page aloud and stop worrying about following it; the momentum is the meaning.'
        ],
        readNext: [
            { slug: 'bob-kaufman', name: 'Bob Kaufman', note: 'Black surrealism in American English.' },
            { slug: 'nathaniel-mackey', name: 'Nathaniel Mackey', note: 'Black experimental poetics at length.' },
            { slug: 'harmony-holiday', name: 'Harmony Holiday', note: 'The next generation of that lineage.' }
        ]
    }
}

/**
 * The introduction for an author slug, or null when none is written.
 *
 * `Object.hasOwn`, not a bare lookup — the slug comes straight from the URL,
 * and a plain object resolves inherited properties, so `/authors/constructor`
 * would otherwise render an "introduction" built from `Object.prototype` and
 * then crash mapping over `intro.body`. Same guard as `genreIntro()`.
 */
export function authorIntro(slug: string): AuthorIntro | null {
    return Object.hasOwn(AUTHOR_INTROS, slug) ? AUTHOR_INTROS[slug] : null
}

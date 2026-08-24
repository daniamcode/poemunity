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
 * SCOPE: authors with 6 or more poems here, in four passes — 40 at 30+
 * (2026-08-18), 63 at 20-29 (2026-08-21), 266 at 11-19 (2026-08-24) and 327 at
 * 6-10 (2026-08-24). 874 of the 3,364 authors clear 6 poems; 696 have an entry,
 * covering 9,418 of the 16,082 poems.
 *
 * ═══ THE THRESHOLD IS NOT THE ONLY FILTER, AND THE OTHER ONE MATTERS MORE ═══
 *
 * 178 authors clear 6 poems and have NO entry, for four reasons.
 *
 * TWENTY ARE AI PERSONAS and ONE IS A REGISTERED USER. Every drop in the
 * threshold pulls more personas over the line — 3, then 2, then 10, then 5 —
 * so each pass re-derives the list from live data rather than trusting the
 * last. Writing a biography for one of them would fabricate a human being.
 *
 * 154 ARE POETS WHOSE WORK IS NOT KNOWN WELL ENOUGH HERE TO DESCRIBE
 * TRUTHFULLY. This number is the honest signal in the whole effort: at 30+
 * poems every non-persona author was writable, at 11-19 twenty-two were not,
 * and in the 6-10 band a further 132 were not. The curve is the argument
 * against going lower — below 6 poems it would dominate. A page with no
 * introduction is a supported state; a confident sentence that is not true is
 * the exact "written for search engines" signal this work exists to escape.
 *
 * THREE ARE BLOCKED ON A DATA BUG, not on knowledge. `lord-ron-george-gordon`
 * (19 poems) is Byron with his name mangled by the scrape,
 * `knight-of-the-white-elephant-of-burmah-william-mcgonagall` (12) carries a
 * joke title inside the name field, and `elena-karina-rne` (7) has lost the
 * start of a surname. An introduction would name a poet the page itself does
 * not. Fix the names first — see `TODO.md`, where these sit with the
 * `wisawa-szymborska` slug as one transliteration problem.
 *
 * `authorIntros.test.tsx` asserts all four groups by slug, so "finish the set"
 * can never become a reason to invent one.
 *
 * On the personas specifically: prose introducing one as a poet would assert
 * the very thing the AI badge, the footer disclosure and the deliberate absence
 * of a `Person` entity in their structured data all exist to deny. It is the
 * same rule as `structuredData.ts` — their pages describe a collection and stay
 * silent about authorship.
 *
 * Real registered users are excluded by the same logic and a simpler one: this
 * file is editorial commentary about published poets, and inventing a
 * description of a living account-holder is not something to do on their
 * behalf. One registered user now clears the threshold with 8 poems, and gets no
 * entry for exactly this reason.
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
    },
    'adelaide-crapsey': {
        body: [
            'She invented the cinquain — five lines, a fixed syllable count rising and then collapsing to two — and wrote most of her best work while dying of tuberculosis in her thirties. The form is the achievement: it is built to end early, and the poems use that shape to say something and stop before consolation can arrive. Her single collection was published after her death. Read several together, since each one is over in about fifteen seconds.'
        ],
        readNext: [
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The compression she is measured against.' },
            { slug: 'h-d', name: 'H. D.', note: 'Imagism arriving at almost the same moment.' },
            { slug: 'sara-teasdale', name: 'Sara Teasdale', note: 'The short American lyric of the period.' }
        ]
    },

    ai: {
        body: [
            'She published under a single name and wrote almost entirely in dramatic monologue — murderers, child abusers, dictators, celebrities and the dead, each given a first person and no authorial rebuke.',
            'The poems are short, violent and delivered in a flat, present-tense voice that refuses to stand outside the speaker and judge. That refusal is the whole method, and it makes the work genuinely uncomfortable rather than merely shocking. She wrote about being of mixed Black, Japanese, Choctaw and Irish descent and about being asked to pick one.'
        ],
        readNext: [
            { slug: 'frank-bidart', name: 'Frank Bidart', note: 'The monologue spoken from inside extremity.' },
            { slug: 'robert-browning', name: 'Robert Browning', note: 'The form at its origin.' },
            { slug: 'norman-dubie', name: 'Norman Dubie', note: 'Invented voices as a lifelong method.' }
        ]
    },

    'alan-dugan': {
        body: [
            'Plain, sardonic, unbeautiful poems written in a flat working voice that is suspicious of poetry itself — several of them are about the indignity of having a job, a body and a marriage, and none of them asks for sympathy.',
            'He published books titled simply "Poems" and then numbered them, which is a fair statement of the attitude. The tone is comic and bitter in equal measure, and the technique is entirely in the timing: the last line usually withdraws whatever the poem seemed to be offering.'
        ],
        readNext: [
            { slug: 'philip-levine', name: 'Philip Levine', note: 'Work written plainly and without uplift.' },
            { slug: 'charles-bukowski', name: 'Charles Bukowski', note: 'The anti-literary stance, less controlled.' },
            { slug: 'weldon-kees', name: 'Weldon Kees', note: 'American bleakness in formal dress.' }
        ]
    },

    'alice-oswald': {
        body: [
            'A British poet who trained as a classicist and worked as a gardener, and both are load-bearing: the poems are physically exact about water, soil and light, and they treat Homer as a living source rather than a monument.',
            'One book is a long poem made from the voices of everyone who lives and works along a river, recorded and reworked. Another strips the Iliad down to its similes and the deaths of named soldiers, removing the plot entirely. She writes for the voice and performs from memory, which is audible in the rhythms.'
        ],
        readNext: [
            { slug: 'd-h-lawrence', name: 'D. H. Lawrence', note: 'The English animal poem at its most physical.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'Classical material rebuilt as contemporary poetry.' },
            { slug: 'basil-bunting', name: 'Basil Bunting', note: 'A long poem written for the ear.' }
        ]
    },

    'amiri-baraka': {
        body: [
            'He changed names and politics more than once — Beat-adjacent Greenwich Village poet, then a founder of the Black Arts Movement, then a Marxist — and the work changes with him, which is the point rather than an inconsistency.',
            'The early poems are lyrical and formally loose; the Black Arts work is confrontational, written for performance and explicitly meant to be useful to a movement. Jazz is everywhere, as subject and as structure, and his prose on blues and Black music is essential. Some of the polemics contain antisemitism and misogyny that his defenders have never satisfactorily explained away, and reading him honestly means reading those too.'
        ],
        readNext: [
            { slug: 'sonia-sanchez', name: 'Sonia Sanchez', note: 'The same movement, and the better ear.' },
            { slug: 'nikki-giovanni', name: 'Nikki Giovanni', note: 'Black Arts written for a wide audience.' },
            { slug: 'ishmael-reed', name: 'Ishmael Reed', note: 'The satirist of the same era.' }
        ]
    },

    'anne-winters': {
        body: [
            'A small body of work, published at long intervals, almost all of it about cities — New York specifically, and the labour, poverty and money that move underneath a street.',
            'The poems are formally dense and syntactically demanding, closer to nineteenth-century models than to anything contemporary, and the difficulty is deliberate: she is describing an economic system, and a plain lyric would flatten it. The long title poem about capital and the people it displaces is the one to read first.'
        ],
        readNext: [
            { slug: 'george-oppen', name: 'George Oppen', note: 'The city examined with the same seriousness.' },
            { slug: 'charles-reznikoff', name: 'Charles Reznikoff', note: 'New York recorded without commentary.' },
            { slug: 'charles-baudelaire', name: 'Charles Baudelaire', note: 'The modern city as poetic subject, at its source.' }
        ]
    },

    'arthur-rimbaud': {
        body: [
            'He wrote everything he is known for between about sixteen and twenty-one, then stopped completely and spent the rest of his short life trading in Africa. The abandonment is part of the legend and should not be allowed to swallow the poems.',
            'What he did: broke French verse open, argued that a poet must derange the senses systematically to become a seer, and produced in his last works a prose poetry with no obvious ancestor. Read in translation the loss is real — the sound was half of it — but the violence of the imagination survives intact. Almost every avant-garde since has claimed him.'
        ],
        readNext: [
            { slug: 'paul-verlaine', name: 'Paul Verlaine', note: 'His lover, and the poet he nearly destroyed.' },
            { slug: 'charles-baudelaire', name: 'Charles Baudelaire', note: 'The predecessor he took his licence from.' },
            { slug: 'donald-revell', name: 'Donald Revell', note: 'One of his contemporary English translators.' }
        ]
    },

    'bei-dao': {
        body: [
            'A Chinese poet whose early work circulated in the underground magazines of the late 1970s and was denounced as obscure — a charge that in that context meant politically unreadable rather than difficult.',
            'The poems are short, image-driven and deliberately ambiguous, and the ambiguity was a way of writing under a state that read everything. One two-line poem became a slogan of the 1989 protests, after which he spent decades in exile, unable to return. The later work is quieter and preoccupied with language itself as the only country left.'
        ],
        readNext: [
            { slug: 'paul-celan', name: 'Paul Celan', note: 'Compression under historical pressure.' },
            { slug: 'zbigniew-herbert', name: 'Zbigniew Herbert', note: 'Writing obliquely under a regime.' },
            { slug: 'ha-jin', name: 'Ha Jin', note: 'The Chinese century in plain English.' }
        ]
    },

    'bill-berkson': {
        body: [
            'A New York School poet and, for most of his working life, an art critic — he wrote about painting constantly, collaborated with painters, and the poems have a gallery-goer\'s attention to surface and arrangement.',
            'The verse is quick, urbane and full of friends, and it belongs to the conversational tradition O\'Hara established without imitating it. He is a good example of a poet whose real influence ran through a scene — editing, teaching, criticism, company — as much as through the books.'
        ],
        readNext: [
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'His friend and collaborator.' },
            { slug: 'james-schuyler', name: 'James Schuyler', note: 'The quiet end of that circle.' },
            { slug: 'ron-padgett', name: 'Ron Padgett', note: 'The second generation of it.' }
        ]
    },

    'bruce-lansky': {
        body: [
            'A publisher and anthologist of comic verse for children whose collections have sold enormously and are, more than any single poet, how a great many American children first encountered a poem they liked.',
            'The material is broad — jokes about school, teachers, homework and disgusting food — and the editorial principle is straightforward: he tested poems on classrooms and kept what worked. That is a real method, and it produced books with an unusually high hit rate. Read for the anthologist as much as the author.'
        ],
        readNext: [
            { slug: 'jack-prelutsky', name: 'Jack Prelutsky', note: 'The best of the poets in these anthologies.' },
            { slug: 'kenn-nesbitt', name: 'Kenn Nesbitt', note: 'The same comic territory.' },
            { slug: 'j-patrick-lewis', name: 'J. Patrick Lewis', note: 'Children\'s verse with a wider range.' }
        ]
    },

    'c-k-williams': {
        body: [
            'He is known for a line so long it barely fits the page — a decision made mid-career that let him carry the syntax of thinking, including all the qualifications and self-corrections, without breaking it up.',
            'The poems are frequently about shame, complicity and moments of ordinary cruelty observed in the street, and the length is what allows a scene to be described and then re-examined inside the same sentence. He also translated Greek drama. The late books about ageing and mortality are shorter-breathed and, for some readers, the best.'
        ],
        readNext: [
            { slug: 'robert-pinsky', name: 'Robert Pinsky', note: 'The long syntactic line handled differently.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'Exposure at comparable intensity.' },
            { slug: 'philip-levine', name: 'Philip Levine', note: 'His contemporary in the plain American voice.' }
        ]
    },

    caconrad: {
        body: [
            'Their poems come out of what they call somatic rituals — elaborate physical procedures performed in order to write, involving objects, places, colours and sometimes considerable discomfort, with the resulting notes cut into the poem.',
            'That sounds like a gimmick and functions as a genuine method: the constraint produces a diction nothing else would reach. The politics are explicit — queer life, ecological collapse, and a rage at both the state and the literary establishment. The rituals are published alongside the poems, so the work shows its own workings.'
        ],
        readNext: [
            { slug: 'bernadette-mayer', name: 'Bernadette Mayer', note: 'Procedure applied to daily life.' },
            { slug: 'eileen-myles', name: 'Eileen Myles', note: 'The unguarded queer American voice.' },
            { slug: 'julian-talamantez-brolaski', name: 'Julian Talamantez Brolaski', note: 'Language mixed as a political act.' }
        ]
    },

    'craig-arnold': {
        body: [
            'A formal poet of unusual technical control whose best-known poems are about appetite — a sequence on eating a fruit that is also plainly about desire, handled with a precision that makes the double reading feel earned rather than arch.',
            'He was fascinated by volcanoes and disappeared while hiking one in Japan, which has inevitably shaped how the small body of work is read. Take the poems first: the ear is superb, the wit is dry, and the second book\'s long dramatic pieces show where he was going.'
        ],
        readNext: [
            { slug: 'a-e-stallings', name: 'A. E. Stallings', note: 'Contemporary formal verse of the same generation.' },
            { slug: 'thom-gunn', name: 'Thom Gunn', note: 'Desire handled in metre.' },
            { slug: 'randall-mann', name: 'Randall Mann', note: 'Form put to unromantic use.' }
        ]
    },

    'dana-levin': {
        body: [
            'Restless, searching poems that mix the visionary with the deliberately banal — dreams, tarot, neuroscience, American politics and the poet\'s own doubts about writing any of it down.',
            'The books are structured as inquiries rather than collections, and they leave their uncertainty visible: false starts, questions, notes to self. The mode risks seeming unfinished and is finished on purpose. Grief and a sense of civic collapse run underneath the later work.'
        ],
        readNext: [
            { slug: 'brenda-hillman', name: 'Brenda Hillman', note: 'Experiment kept legible.' },
            { slug: 'mary-ruefle', name: 'Mary Ruefle', note: 'The comic and the abyssal in one turn.' },
            { slug: 'jorie-graham', name: 'Jorie Graham', note: 'Thinking staged as the poem.' }
        ]
    },

    'daryl-hine': {
        body: [
            'A Canadian poet of extreme formal accomplishment, working in metres and stanza forms that had largely been abandoned, and a translator of Greek — including a verse Hesiod and the Homeric hymns.',
            'He edited a major poetry magazine for a decade. The original poems are erudite, witty and syntactically elaborate, including a whole autobiography written in dactylic hexameter, which is either a stunt or a demonstration depending on how you feel by page ten. A poet for readers who like a form audibly held.'
        ],
        readNext: [
            { slug: 'richard-wilbur', name: 'Richard Wilbur', note: 'Comparable urbanity and technique.' },
            { slug: 'richard-wilbur', name: 'Richard Wilbur', note: 'The formal peak of that American generation.' },
            { slug: 'a-e-stallings', name: 'A. E. Stallings', note: 'Classical translation and rhyme today.' }
        ]
    },

    'david-ignatow': {
        body: [
            'Plain, short, unornamented poems written by a man who ran a family bindery business for years and wrote about work, money, the city and the strain of ordinary life without a trace of literary decoration.',
            'The voice is conversational to the point of seeming artless, and the endings are where the craft is: a poem describes something flatly and then turns, in a line, into a statement about death or failure. He is a good corrective for anyone who thinks plainness is easy.'
        ],
        readNext: [
            { slug: 'charles-reznikoff', name: 'Charles Reznikoff', note: 'The New York poem stripped bare.' },
            { slug: 'william-carlos-williams', name: 'William Carlos Williams', note: 'The American plain style he works in.' },
            { slug: 'alan-dugan', name: 'Alan Dugan', note: 'The same flat, sardonic register.' }
        ]
    },

    'david-trinidad': {
        body: [
            'A poet of pop culture treated with complete seriousness — Barbie, film stars, 1960s television, cosmetics and the specific objects of a gay American childhood, catalogued with an archivist\'s exactness.',
            'The camp surface is real and so is the elegy underneath it; a good many of these poems are about the AIDS epidemic and about friends who are gone, approached sideways through the objects they loved. He works in received forms and in list poems, and the lists are the most affecting thing he does.'
        ],
        readNext: [
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'The pop-culture poem at its source.' },
            { slug: 'tim-dlugos', name: 'Tim Dlugos', note: 'The same milieu and the same losses.' },
            { slug: 'elaine-equi', name: 'Elaine Equi', note: 'The everyday object turned strange.' }
        ]
    },

    'douglas-kearney': {
        body: [
            'The page is a performance score. Words overlap, run at angles, collide and crowd each other, and the visual arrangement carries meaning that a linear reading cannot deliver.',
            'The subjects are Black American history, minstrelsy, violence and fatherhood, and the typographic chaos is an argument about how that material has been represented. He is also a performer and a librettist, and hearing him read is the fastest way to understand what the pages are doing. Difficult on screen, and worth the trouble.'
        ],
        readNext: [
            { slug: 'evie-shockley', name: 'Evie Shockley', note: 'Visual form and Black poetics.' },
            { slug: 'harryette-mullen', name: 'Harryette Mullen', note: 'Language under commercial and racial pressure.' },
            { slug: 'tyehimba-jess', name: 'Tyehimba Jess', note: 'Historical voices in engineered forms.' }
        ]
    },

    'edgar-bowers': {
        body: [
            'The purest product of Yvor Winters\'s teaching: strict metre, plain abstract statement, and an almost complete refusal of decoration or self-display.',
            'He served in Army counter-intelligence in Germany at the end of the Second World War, and the poems that come out of that — including several set in and around the ruins — are the strongest. The body of work is small, published slowly, and unfashionable in every decade it appeared in. Read for the pressure that formal restraint puts on plain speech.'
        ],
        readNext: [
            { slug: 'yvor-winters', name: 'Yvor Winters', note: 'His teacher, and the doctrine.' },
            { slug: 'j-v-cunningham', name: 'J. V. Cunningham', note: 'The same school, at epigram length.' },
            { slug: 'thom-gunn', name: 'Thom Gunn', note: 'The fellow student who went elsewhere.' }
        ]
    },

    'edward-lear': {
        body: [
            'A professional painter of birds and landscapes who wrote nonsense verse as a sideline and is now remembered almost entirely for it — limericks, invented creatures, and words he made up that entered the language.',
            'The nonsense is not simply silly. Its most famous pieces are about creatures who are mismatched, exiled or shaped wrong and who set off anyway, and the melancholy under the comedy is unmistakable once heard. He was a lonely, epileptic, itinerant man who wrote for other people\'s children, and the poems know it.'
        ],
        readNext: [
            { slug: 'lewis-carroll', name: 'Lewis Carroll', note: 'The logician\'s nonsense.' },
            { slug: 'hilaire-belloc', name: 'Hilaire Belloc', note: 'Comic verse with a crueller edge.' },
            { slug: 'stevie-smith', name: 'Stevie Smith', note: 'Nursery rhythms carrying real despair.' }
        ]
    },

    'francisco-x-alarcn': {
        body: [
            'A Chicano poet who wrote in Spanish, English and Nahuatl, frequently within the same book, and who treated the recovery of Indigenous Mexican language and ritual as central rather than decorative.',
            'The poems are short, chant-like and set in narrow columns down the page, which gives them the pace of an incantation. He wrote extensively for children in bilingual editions, and was an openly gay Latino poet at a time when that cost something in both communities. Read a sequence aloud in both languages.'
        ],
        readNext: [
            { slug: 'juan-felipe-herrera', name: 'Juan Felipe Herrera', note: 'The same tradition, at greater volume.' },
            { slug: 'gary-soto', name: 'Gary Soto', note: 'Chicano childhood in plain narrative.' },
            { slug: 'lorna-dee-cervantes', name: 'Lorna Dee Cervantes', note: 'Chicana poetry of the same generation.' }
        ]
    },

    'jack-spicer': {
        body: [
            'He argued that poems are dictated — that the poet is a radio receiving something from outside, and that the job is to keep the furniture of one\'s own personality out of the transmission.',
            'That belief produced serial books meant to be read whole rather than anthologised, full of Martians, baseball, lemons, Rimbaud and the Holy Grail, and a tone that is funny and desolate at once. He refused to let his books be distributed outside the Bay Area. The Vancouver lectures are the clearest statement of the theory, and the posthumous collected made him a major figure decades after his death.'
        ],
        readNext: [
            { slug: 'robin-blaser', name: 'Robin Blaser', note: 'His friend, editor and defender.' },
            { slug: 'robert-duncan', name: 'Robert Duncan', note: 'The third of that San Francisco circle.' },
            { slug: 'peter-gizzi', name: 'Peter Gizzi', note: 'His modern editor, and closest inheritor.' }
        ]
    },

    'james-whitcomb-riley': {
        body: [
            'The Hoosier poet: enormously popular in his lifetime, writing in an Indiana dialect about country childhood, ghosts, pumpkins and the frost on the fields, and read aloud to American schoolchildren for generations.',
            'The dialect is the whole instrument, and it is handled with real skill — the metre never stumbles and the comic timing is exact. What dates is the sentimentality and the nostalgia for a rural past that was already being sold as a product. Read for what popular American verse actually sounded like before modernism.'
        ],
        readNext: [
            { slug: 'paul-laurence-dunbar', name: 'Paul Laurence Dunbar', note: 'Dialect verse and its costs.' },
            { slug: 'edgar-albert-guest', name: 'Edgar Albert Guest', note: 'The next generation of popular verse.' },
            { slug: 'robert-w-service', name: 'Robert W. Service', note: 'Recitable narrative at its best.' }
        ]
    },

    'jim-harrison': {
        body: [
            'Better known for fiction, and he considered himself a poet first. The poems are physical, appetite-driven and set outdoors — rivers, dogs, birds, food, drink, the northern Michigan and Montana country he lived in.',
            'The form he made his own is a compressed suite of short unrhymed stanzas, influenced by his reading of Chinese and Zen poetry, which lets a poem move from a bird to mortality in three lines without a transition. He is unembarrassed about pleasure and unsentimental about death, which is a rare combination.'
        ],
        readNext: [
            { slug: 'gary-snyder', name: 'Gary Snyder', note: 'The same Asian influence, more disciplined.' },
            { slug: 'james-galvin', name: 'James Galvin', note: 'Western landscape written from inside it.' },
            { slug: 'ted-kooser', name: 'Ted Kooser', note: 'Plain American attention.' }
        ]
    },

    'john-wieners': {
        body: [
            'A poet of extraordinary tenderness and damage — the early Boston and San Francisco poems record addiction, hustling, queer desire and psychiatric confinement in a voice that stays lyrical throughout.',
            'He came out of Black Mountain and the Beat scene without belonging to either, and the later work grows fragmentary as his life did, mixing celebrity gossip, drag, and mystical fragments. The tone is what carries it: courteous, wounded, entirely without self-pity. A poet other poets have always championed and general readers are still discovering.'
        ],
        readNext: [
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'The New York lyric of the same years.' },
            { slug: 'charles-olson', name: 'Charles Olson', note: 'His teacher at Black Mountain.' },
            { slug: 'tim-dlugos', name: 'Tim Dlugos', note: 'The later gay lyric of the city.' }
        ]
    },

    'john-yau': {
        body: [
            'A poet and art critic whose work is playful, serial and suspicious of the idea that a poem should express a self — many are built on repetition with variation, or spoken by invented characters across a whole sequence.',
            'Chinese American identity is a recurring subject, handled with irony rather than testimony, and the poems frequently mock the terms in which that identity is demanded. He has written extensively on painting, and the criticism and the poems share a preference for the sideways approach.'
        ],
        readNext: [
            { slug: 'john-ashbery', name: 'John Ashbery', note: 'The permission behind much of this.' },
            { slug: 'marilyn-chin', name: 'Marilyn Chin', note: 'The same inheritance, more combative.' },
            { slug: 'harryette-mullen', name: 'Harryette Mullen', note: 'Serial procedure and wordplay.' }
        ]
    },

    'joseph-brodsky': {
        body: [
            'Tried in Leningrad for social parasitism on the grounds that he had no recognised job, sentenced to internal exile, and expelled from the Soviet Union in his early thirties. He never went back.',
            'The Russian poems are formally intricate, rhymed and metrically strict, and he insisted on carrying that into English, translating himself with results that divide readers sharply. The recurring subjects are empire, time, exile and the indifference of the physical world. He received the Nobel Prize in Literature and later served as United States Poet Laureate — an unusual thing for a poet writing mostly in another language.'
        ],
        readNext: [
            { slug: 'osip-mandelstam', name: 'Osip Mandelstam', note: 'The Russian predecessor he measured himself against.' },
            { slug: 'marina-tsvetaeva', name: 'Marina Tsvetaeva', note: 'The poet he called the greatest of the century.' },
            { slug: 'czeslaw-milosz', name: 'Czeslaw Milosz', note: 'His friend, and the same exile.' }
        ]
    },

    'kazim-ali': {
        body: [
            'A poet of spare, questioning lyrics shaped by Muslim practice, queerness and a persistent interest in the body — swimming, breath, fasting, prayer — as a way of thinking rather than as imagery.',
            'The poems are short and full of gaps, and they tend to ask rather than assert. He writes across forms, including essays and novels, and translates from French. What holds the work together is a refusal to resolve the tension between a religious inheritance and a life it does not straightforwardly accommodate.'
        ],
        readNext: [
            { slug: 'fanny-howe', name: 'Fanny Howe', note: 'Faith approached without resolution.' },
            { slug: 'jean-valentine', name: 'Jean Valentine', note: 'The short poem full of silence.' },
            { slug: 'agha-shahid-ali', name: 'Agha Shahid Ali', note: 'Muslim inheritance in American English.' }
        ]
    },

    'kenneth-patchen': {
        body: [
            'A pacifist, an outsider and a genuine formal inventor — he made picture poems, painted books and poems-with-jazz recordings decades before any of that was a category, largely while in severe chronic pain.',
            'The verse ranges from tender love poems to furious antiwar denunciation, and the tone is sincere in a way that embarrasses the sophisticated. He was enormously important to the Beats and has never fitted any syllabus. Read the picture poems as objects; the printed text alone loses half of what they are.'
        ],
        readNext: [
            { slug: 'lawrence-ferlinghetti', name: 'Lawrence Ferlinghetti', note: 'The poem as public and political object.' },
            { slug: 'e-e-cummings', name: 'E. E. Cummings', note: 'Typography as part of the poem.' },
            { slug: 'kenneth-rexroth', name: 'Kenneth Rexroth', note: 'The pacifist American avant-garde.' }
        ]
    },

    'lady-mary-wortley-montagu': {
        body: [
            'An aristocrat, letter-writer and satirist whose verse is sharp, worldly and often furious about the position of women in marriage and the marriage market.',
            'She observed smallpox inoculation in Constantinople and campaigned to introduce it in England, which is what she is usually remembered for. The poems deserve their own attention: town eclogues, verse epistles, and a devastating reply to Pope after their friendship collapsed into public feuding. The wit is Augustan and the anger is her own.'
        ],
        readNext: [
            { slug: 'alexander-pope', name: 'Alexander Pope', note: 'Her friend, then her enemy.' },
            { slug: 'jonathan-swift', name: 'Jonathan Swift', note: 'The satiric register of the period.' },
            { slug: 'anne-finch-countess-of-winchilsea', name: 'Anne Finch, Countess of Winchilsea', note: 'The generation just before, and quieter.' }
        ]
    },

    'linh-dinh': {
        body: [
            'Born in Saigon and brought to the United States as a child, he writes short, harsh, deliberately ugly poems about poverty, war, bodies and language, in a voice that refuses every consolation available to an immigrant narrative.',
            'He is also a translator and anthologist of Vietnamese poetry, and a photographer of American streets. The work is confrontational by design and has grown more so; readers should expect deliberate offence rather than accidental. The early poems are the ones that show what the method can do.'
        ],
        readNext: [
            { slug: 'ai', name: 'Ai', note: 'Violence delivered without authorial comfort.' },
            { slug: 'charles-bukowski', name: 'Charles Bukowski', note: 'The anti-literary stance.' },
            { slug: 'russell-edson', name: 'Russell Edson', note: 'The cruel little fable.' }
        ]
    },

    'louise-erdrich': {
        body: [
            'Known primarily as a novelist, and the poems are where a good deal of the same material was first worked out — Ojibwe inheritance, North Dakota, Catholicism, desire and family across generations.',
            'The verse is narrative and image-led, with a strong strain of the mythic; several poems are spoken by figures from Ojibwe story or by historical characters, and the borders between the human and the animal are treated as porous rather than metaphorical. Read alongside the novels and the shared world becomes obvious.'
        ],
        readNext: [
            { slug: 'joy-harjo', name: 'Joy Harjo', note: 'The best-known Native voice of that generation.' },
            { slug: 'linda-hogan', name: 'Linda Hogan', note: 'The same ground, quieter.' },
            { slug: 'heid-e-erdrich', name: 'Heid E. Erdrich', note: 'Her sister, and the dryer register.' }
        ]
    },

    'luke-kennard': {
        body: [
            'A British poet whose early work is built around comic prose poems featuring a wolf who offers unwanted literary criticism, which is a fair indication of the register: absurd, deadpan and considerably sadder than it first appears.',
            'The later books turn to sonnets, self-help language and the mechanics of a failing marriage, keeping the comedy while sharpening it. He is one of the few contemporary poets in English whose jokes actually land on the page, and the seriousness arrives underneath them rather than instead of them.'
        ],
        readNext: [
            { slug: 'russell-edson', name: 'Russell Edson', note: 'The prose poem as absurd fable.' },
            { slug: 'james-tate', name: 'James Tate', note: 'Deadpan American surrealism.' },
            { slug: 'matthew-sweeney', name: 'Matthew Sweeney', note: 'The impossible narrated flatly.' }
        ]
    },

    'lynn-emanuel': {
        body: [
            'Cinematic, fast-cutting poems with a strong sense of the American West and of film — one book circles her father, another the town she grew up in, and the poems keep breaking frame to address the reader directly about the poem being written.',
            'That metafictional habit is not decoration: the recurring question is who is doing the looking and what a poem does to whatever it describes. The voice is dry, funny and slightly hard-boiled. Read for the pacing, which is closer to editing than to lineation.'
        ],
        readNext: [
            { slug: 'laura-kasischke', name: 'Laura Kasischke', note: 'Domestic dread at a similar angle.' },
            { slug: 'mary-jo-bang', name: 'Mary Jo Bang', note: 'Grief handled through style.' },
            { slug: 'james-tate', name: 'James Tate', note: 'The frame broken for comic effect.' }
        ]
    },

    'margarita-engle': {
        body: [
            'A Cuban American writer whose books are verse novels, mostly for young readers, telling Cuban history through short first-person poems — an abolitionist poet, a plantation, a hurricane, a family divided by revolution.',
            'The form does real work: short lyric sections let a difficult history be carried by individual voices rather than by exposition, and the white space lets a young reader stop. She served as national Young People\'s Poet Laureate. The research is thorough and the poems never lecture.'
        ],
        readNext: [
            { slug: 'jacqueline-woodson', name: 'Jacqueline Woodson', note: 'Memoir in verse for young readers.' },
            { slug: 'marilyn-nelson', name: 'Marilyn Nelson', note: 'History told in formal verse.' },
            { slug: 'juan-felipe-herrera', name: 'Juan Felipe Herrera', note: 'Latino poetry for every audience at once.' }
        ]
    },

    'marina-tsvetaeva': {
        body: [
            'The most rhythmically violent of the great Russian poets of her generation — the lines are broken by dashes, the syntax is compressed to the point of rupture, and the poems move at a speed that translators struggle to keep up with.',
            'The life was catastrophic: revolution, emigration, poverty, a daughter dead of starvation in an orphanage, return to the Soviet Union, her husband executed, and her own suicide in evacuation. The poems are not merely a record of that; they are ferocious, erotic and formally inventive throughout. Read more than one translation, because no single English version carries the sound.'
        ],
        readNext: [
            { slug: 'osip-mandelstam', name: 'Osip Mandelstam', note: 'Her contemporary and the same catastrophe.' },
            { slug: 'anna-akhmatova', name: 'Anna Akhmatova', note: 'The other great Russian woman poet of the century.' },
            { slug: 'joseph-brodsky', name: 'Joseph Brodsky', note: 'Who called her the greatest poet of the century.' }
        ]
    },

    'maya-angelou': {
        body: [
            'The memoirs made her famous and the poems made her a public voice — read at a presidential inauguration, quoted in classrooms and on posters, and held at arm\'s length by a good deal of academic criticism.',
            'The verse is built for the voice: strong repeating refrains, insistent rhythm, direct address, and a rhetoric drawn from the pulpit and from blues. Poems about survival and dignity are the core of it, and their enormous readership is a fact about them worth taking seriously rather than explaining away. Hear a recording before deciding; on the page they are only half present.'
        ],
        readNext: [
            { slug: 'nikki-giovanni', name: 'Nikki Giovanni', note: 'The same public voice, more combative.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'The blues and pulpit rhythms at their source.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'The same material at a fraction of the volume.' }
        ]
    },

    'michael-anania': {
        body: [
            'A Chicago poet, editor and publisher whose work is quiet, precise and rooted in place — the Missouri River, Nebraska, the industrial Midwest — with an attention to landscape that owes something to the Objectivists.',
            'He edited a significant small press for years and taught for decades, and his influence on Midwestern writing runs largely through that work. The poems are unhurried, image-led and resistant to summary, and they reward being read as sequences rather than sampled.'
        ],
        readNext: [
            { slug: 'george-oppen', name: 'George Oppen', note: 'The Objectivist attention behind this.' },
            { slug: 'carl-sandburg', name: 'Carl Sandburg', note: 'The Chicago poem before him.' },
            { slug: 'stuart-dybek', name: 'Stuart Dybek', note: 'The same city in a warmer register.' }
        ]
    },

    'michael-hofmann': {
        body: [
            'A German-born poet writing in English and one of the most important literary translators working from German, which shapes everything: the English is slightly angular, the diction is exact and unusual, and the tone is permanently displaced.',
            'The central subject is his father, a German novelist, approached across several books with a coldness that is itself the emotion. He is also a critic whose reviews are famously severe. The poems are few and slow to arrive; the translations are a body of work in their own right.'
        ],
        readNext: [
            { slug: 'gottfried-benn', name: 'Gottfried Benn', note: 'One of the German poets he has translated.' },
            { slug: 'robert-lowell', name: 'Robert Lowell', note: 'The father poems and the confessional inheritance.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'The English tone he writes against and through.' }
        ]
    },

    'michael-robbins': {
        body: [
            'Dense, fast, rhyming poems packed with song lyrics, brand names, internet slang and heavy metal, moving between registers at a speed that is the whole effect.',
            'The rhymes are hard and comic and the argument underneath is not: ecological collapse, faith, drugs and the exhaustion of irony recur across the books. He is also a critic with strong opinions about popular music. The method risks turning into a tic and the best poems are the ones where the joke turns out to have been an elegy.'
        ],
        readNext: [
            { slug: 'frederick-seidel', name: 'Frederick Seidel', note: 'Immaculate rhyme carrying unpleasant content.' },
            { slug: 'paul-muldoon', name: 'Paul Muldoon', note: 'Rhyme stretched past the point of comfort.' },
            { slug: 'matthew-zapruder', name: 'Matthew Zapruder', note: 'The contemporary poem thinking aloud.' }
        ]
    },

    'minnie-bruce-pratt': {
        body: [
            'A lesbian feminist poet whose central sequence comes out of losing custody of her children in the American South because of her sexuality, and it is one of the clearest cases in modern poetry of a private catastrophe that is entirely political.',
            'The poems are plain, narrative and unsparing, and they refuse both self-pity and triumph. Later work deals with gender, labour organising and her marriage to a transgender activist. Her prose on identity and accountability has been widely read outside poetry.'
        ],
        readNext: [
            { slug: 'audre-lorde', name: 'Audre Lorde', note: 'The same politics and generation.' },
            { slug: 'adrienne-rich', name: 'Adrienne Rich', note: 'The lesbian feminist lyric at its most argued.' },
            { slug: 'june-jordan', name: 'June Jordan', note: 'The political poem written plainly.' }
        ]
    },

    'nate-marshall': {
        body: [
            'A Chicago poet out of the city\'s youth performance scene, writing about the South Side neighbourhood he grew up in with a precision that refuses both the pastoral and the crime report.',
            'The poems use hip-hop structure openly — internal rhyme, sampling, the logic of a verse — and one book is organised around the idea of assembling a crew. He is also an editor and anthologist of that scene. The work is generous about a place that outsiders mostly describe from a distance.'
        ],
        readNext: [
            { slug: 'kevin-young', name: 'Kevin Young', note: 'Music as the structure of the book.' },
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'The Chicago poem at its source.' },
            { slug: 'danez-smith', name: 'Danez Smith', note: 'The same performance generation.' }
        ]
    },

    'paul-violi': {
        body: [
            'A comic formal inventor: poems shaped as indexes, errata slips, television listings, footnotes and captions, in which the borrowed format does the storytelling and the story is usually a small disaster.',
            'The jokes are exact and the melancholy is real — an index that gradually reveals a ruined life is a genuinely moving thing. He belonged to the wider New York School orbit and taught for years. Read three or four of the found-format poems in a row; the invention is the pleasure.'
        ],
        readNext: [
            { slug: 'kenneth-koch', name: 'Kenneth Koch', note: 'The comic New York School at its best.' },
            { slug: 'ron-padgett', name: 'Ron Padgett', note: 'Deadpan of the same lineage.' },
            { slug: 'elaine-equi', name: 'Elaine Equi', note: 'The short poem timed to the second.' }
        ]
    },

    'quan-barry': {
        body: [
            'Born in Saigon and raised in Massachusetts, she writes formally various poems about war, the body, medicine and history, with an unusual willingness to look directly at atrocity.',
            'One book is built around Vietnam — the war, its afterlife, the country as it is rather than as an American memory — and another around the physical body in illness. She is also a novelist and playwright. The voice is cool and exact, which is what allows the material to be as violent as it is.'
        ],
        readNext: [
            { slug: 'yusef-komunyakaa', name: 'Yusef Komunyakaa', note: 'Vietnam from the other side of it.' },
            { slug: 'ocean-vuong', name: 'Ocean Vuong', note: 'The Vietnamese American inheritance, later.' },
            { slug: 'carolyn-forch', name: 'Carolyn Forché', note: 'Witness and its problems.' }
        ]
    },

    'richard-brautigan': {
        body: [
            'Short, whimsical, deceptively slight poems that arrive like jokes and frequently turn out to be about loneliness — a few lines, an unlikely comparison, and a stop before anything is explained.',
            'He was enormously popular in the counterculture and then critically dismissed as a period artefact, which undersells the precision of the best pieces. The famous poem imagining a forest tended by machines of loving grace is either a utopia or a warning and is deliberately left as both. Read a handful; they are over almost before they start.'
        ],
        readNext: [
            { slug: 'james-tate', name: 'James Tate', note: 'The deadpan American absurd.' },
            { slug: 'ron-padgett', name: 'Ron Padgett', note: 'Comedy with a serious floor under it.' },
            { slug: 'gary-snyder', name: 'Gary Snyder', note: 'The other side of that West Coast moment.' }
        ]
    },

    'robert-lowell': {
        body: [
            'The dominant American poet of his generation, and the one whose career maps the mid-century shift most exactly: dense, formal, Catholic and rhetorical early; then a book of loose autobiographical poems about family, marriage and psychiatric hospitals that made confessional poetry a movement.',
            'The later years went into unrhymed sonnets written and rewritten obsessively, including a book using his wife\'s private letters, which is still argued about as an ethical matter and should be. He came from a prominent New England family, was jailed as a conscientious objector, and lived with severe manic depression. The last book is quieter and among his best.'
        ],
        readNext: [
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: 'His closest friend and his opposite.' },
            { slug: 'w-d-snodgrass', name: 'W. D. Snodgrass', note: 'His student, who got there first.' },
            { slug: 'john-berryman', name: 'John Berryman', note: 'The same generation and the same wreckage.' }
        ]
    },

    'robert-wrigley': {
        body: [
            'An Idaho poet writing formally attentive narrative poems about the mountain West — hunting, horses, rivers, roadkill, weather — with a physical exactness that never turns the landscape into scenery.',
            'The poems are frequently about killing something, or finding something dead, and about what that does to the person doing the looking. The metre is handled quietly enough that most readers will not notice it holding the line together. A poet of place who is not remotely sentimental about the place.'
        ],
        readNext: [
            { slug: 'james-galvin', name: 'James Galvin', note: 'The same country, more elliptical.' },
            { slug: 'jim-harrison', name: 'Jim Harrison', note: 'Appetite and landscape together.' },
            { slug: 'james-l-dickey', name: 'James L. Dickey', note: 'The physical poem at its most driving.' }
        ]
    },

    'rupert-brooke': {
        body: [
            'The face of English war poetry for about a year, and then its counterexample. The 1914 sonnets are patriotic, beautiful and entirely untouched by combat — he died of infection on the way to Gallipoli, having seen almost no fighting.',
            'That is why he is read now against Owen and Rosenberg rather than beside them: the sonnets record what people believed before the trenches taught otherwise, and they are superbly made. The earlier poems are wittier and stranger than the reputation allows, including some genuinely funny ones about the English abroad.'
        ],
        readNext: [
            { slug: 'wilfred-owen', name: 'Wilfred Owen', note: 'The correction, written from inside the war.' },
            { slug: 'siegfried-sassoon', name: 'Siegfried Sassoon', note: 'The satire that followed the disillusion.' },
            { slug: 'charles-hamilton-sorley', name: 'Charles Hamilton Sorley', note: 'The contemporary who saw through it first.' }
        ]
    },

    'thomas-lux': {
        body: [
            'Short, punchy poems with a strong comic surface and a persistent darkness underneath — a barbed-wire fence, a childhood on a dairy farm, refrigerators, a man\'s bad heart, delivered in a fast plain line.',
            'The early work was surreal and impersonal; he deliberately moved towards clarity and the later poems are the ones to read, where the strangeness is in the fact rather than in the treatment. He was a superb reader of his own work and taught for decades. Funny, and then not.'
        ],
        readNext: [
            { slug: 'bill-knott', name: 'Bill Knott', note: 'The same generation at its wildest.' },
            { slug: 'james-tate', name: 'James Tate', note: 'The surreal American poem.' },
            { slug: 'tony-hoagland', name: 'Tony Hoagland', note: 'The comic poem that turns on you.' }
        ]
    },

    'thomas-merton': {
        body: [
            'A Trappist monk who published a bestselling autobiography and then spent decades writing poems, essays and letters from inside a monastery about the world he had supposedly left.',
            'The early verse is devotional and conventional; the later work is far more interesting — antiwar poems, experiments in collage and found language, and a long engagement with Zen and with Latin American poets he corresponded with and translated. The tension between contemplation and public argument is the real subject, and he never resolved it.'
        ],
        readNext: [
            { slug: 'czeslaw-milosz', name: 'Czeslaw Milosz', note: 'His correspondent, and the same moral pressure.' },
            { slug: 'scott-cairns', name: 'Scott Cairns', note: 'Contemporary devotional poetry.' },
            { slug: 'gary-snyder', name: 'Gary Snyder', note: 'The Zen reading, from the other direction.' }
        ]
    },

    'tom-pickard': {
        body: [
            'A working-class Newcastle poet who left school at fourteen, reopened a medieval tower as a reading venue and brought Basil Bunting back into public life — an act with consequences for English poetry well beyond his own books.',
            'The poems are short, sharp and often in Northumbrian speech, about work, unemployment, sex, the border country and the weather on the fells. They are political without being programmatic. The songs and the ballads are the strongest, and they are built to be spoken in the accent they were written in.'
        ],
        readNext: [
            { slug: 'basil-bunting', name: 'Basil Bunting', note: 'The poet he rescued from obscurity.' },
            { slug: 'hugh-macdiarmid', name: 'Hugh MacDiarmid', note: 'Vernacular as a political choice.' },
            { slug: 'robert-burns', name: 'Robert Burns', note: 'The song tradition behind it.' }
        ]
    },

    'tomas-transtrmer': {
        body: [
            'A Swedish poet, read here in translation, who worked for most of his life as a psychologist in prisons and juvenile institutions and wrote a small number of very concentrated poems.',
            'The signature is the metaphor arriving suddenly and physically — a landscape becoming an instrument, a sleeping man becoming a room — in poems that are otherwise plain and unhurried. Winter, water, borders and the moment of waking recur. A stroke in his fifties left him unable to speak, and he continued writing; the late poems are the shortest and most compressed. He received the Nobel Prize in Literature.'
        ],
        readNext: [
            { slug: 'robert-bly', name: 'Robert Bly', note: 'His friend and principal English translator.' },
            { slug: 'inger-christensen', name: 'Inger Christensen', note: 'Scandinavian poetry at another extreme.' },
            { slug: 'charles-simic', name: 'Charles Simic', note: 'The plain sentence carrying the impossible.' }
        ]
    },

    'wesley-mcnair': {
        body: [
            'A New England narrative poet who writes about small-town and rural Maine — trailers, diners, failing farms, people the economy has left behind — in a plain conversational line and with real affection.',
            'The poems are character studies more than lyrics, and the technique is restraint: the situation is described, the judgement is withheld, and the last few lines let the reader feel what has not been said. He served as poet laureate of Maine. A poet in the direct line from Frost and Robinson, working the same country.'
        ],
        readNext: [
            { slug: 'edwin-arlington-robinson', name: 'Edwin Arlington Robinson', note: 'The New England portrait poem.' },
            { slug: 'ted-kooser', name: 'Ted Kooser', note: 'The same plainness, further west.' },
            { slug: 'donald-hall', name: 'Donald Hall', note: 'Rural New England from inside it.' }
        ]
    },

    'william-trowbridge': {
        body: [
            'A comic poet whose books are built around recurring hapless figures — an oaf, a misfit superhero, a man who gets everything slightly wrong — used as a way of writing about failure, ageing and mortality without solemnity.',
            'The verse is technically capable and deliberately unshowy; the joke is always the delivery system, and the sadness is always underneath it. He served as poet laureate of Missouri. Read several of the character poems in sequence, since the figure accumulates.'
        ],
        readNext: [
            { slug: 'thomas-lux', name: 'Thomas Lux', note: 'Comedy with a hard floor under it.' },
            { slug: 'billy-collins', name: 'Billy Collins', note: 'The accessible comic American poem.' },
            { slug: 'mark-halliday', name: 'Mark Halliday', note: 'The self-exposing comic speaker.' }
        ]
    },

    'adrian-matejka': {
        body: [
            'His best-known book is a sequence about Jack Johnson, the first Black heavyweight champion, assembled from many voices — Johnson himself, his wives, his rivals, the newspapers — so that a life gets built out of what everyone else said about it.',
            'The poems are formally various and the music is drawn from blues and hip-hop as much as from verse tradition. Elsewhere he writes about a mixed-race childhood in the Midwest, poverty and science fiction. He has edited a major poetry magazine.'
        ],
        readNext: [
            { slug: 'tyehimba-jess', name: 'Tyehimba Jess', note: 'History assembled from competing voices.' },
            { slug: 'kevin-young', name: 'Kevin Young', note: 'Music as the structure of a book.' },
            { slug: 'terrance-hayes', name: 'Terrance Hayes', note: 'Formal invention on shared ground.' }
        ]
    },

    'agha-shahid-ali': {
        body: [
            'A Kashmiri American poet who did more than anyone to establish the ghazal as a real form in English rather than a loose label — insisting on the strict repeating rhyme and refrain that English imitators had been quietly dropping.',
            'The great subject is Kashmir: exile, the occupation, and a homeland that exists mainly as loss. The tone is formal, ornate and elegiac, and the poems are unembarrassed about beauty. He also translated Faiz Ahmed Faiz. The late book written during his terminal illness is the strongest.'
        ],
        readNext: [
            { slug: 'kazim-ali', name: 'Kazim Ali', note: 'Muslim inheritance in American poetry.' },
            { slug: 'mahmoud-darwish', name: 'Mahmoud Darwish', note: 'The poetry of a lost homeland.' },
            { slug: 'marilyn-hacker', name: 'Marilyn Hacker', note: 'Strict inherited form in contemporary hands.' }
        ]
    },

    'allen-ginsberg': {
        body: [
            'The poem that begins by declaring the best minds of his generation destroyed changed what American poetry could say out loud, and its obscenity trial changed what an American publisher could print.',
            'The line is long and breath-driven, built from Whitman and from Hebrew liturgy, and it is designed to be performed. The elegy for his mother is the greater poem and much less quoted. He spent decades as a public figure — Buddhist, activist, teacher, relentless promoter of other writers — and the later work is uneven, but the political poems of the sixties still have their charge.'
        ],
        readNext: [
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The line he took and rebuilt.' },
            { slug: 'lawrence-ferlinghetti', name: 'Lawrence Ferlinghetti', note: 'Who published him and stood trial for it.' },
            { slug: 'gregory-corso', name: 'Gregory Corso', note: 'The Beat with the strangest ear.' }
        ]
    },

    'anthony-madrid': {
        body: [
            'A formalist with an absurdist streak — his first book is a set of ghazals written in an aggressively confident voice that is plainly a put-on, and the joke holds for a whole collection.',
            'The verse is metrically strict and the content deliberately ridiculous, which turns out to be a productive combination: the form keeps the nonsense from dissipating. He writes about prosody and folklore as a scholar too, and the poems are best read as performances by a persona rather than as statements.'
        ],
        readNext: [
            { slug: 'agha-shahid-ali', name: 'Agha Shahid Ali', note: 'The ghazal handled seriously.' },
            { slug: 'kenneth-koch', name: 'Kenneth Koch', note: 'Comic exuberance inside real technique.' },
            { slug: 'luke-kennard', name: 'Luke Kennard', note: 'The sustained comic persona.' }
        ]
    },

    'ben-belitt': {
        body: [
            'Chiefly important as a translator — his English versions of Neruda, Lorca, Machado and Alberti introduced several generations of American readers to those poets, and were argued about for how much of himself he put into them.',
            'His own poems are dense, latinate and heavily worked, out of step with the plain style that dominated his lifetime. He taught at the same college for decades. Read the translations first; the original poems make more sense once you have heard what he thought a poem should sound like.'
        ],
        readNext: [
            { slug: 'robert-bly', name: 'Robert Bly', note: 'The rival approach to translating the same poets.' },
            { slug: 'kenneth-rexroth', name: 'Kenneth Rexroth', note: 'Translation as a life\'s work.' },
            { slug: 'hart-crane', name: 'Hart Crane', note: 'The dense American high style.' }
        ]
    },

    'bruce-smith': {
        body: [
            'A Philadelphia poet whose work is musical, syntactically restless and preoccupied with class, race and the physical city — boxing, jazz, factories, the street he grew up on.',
            'The line is jagged and full of interruption, closer to improvisation than to statement, and the poems tend to resist the tidy ending they seem to be approaching. He writes about being a white poet formed by Black music and is unusually honest about the awkwardness of that position.'
        ],
        readNext: [
            { slug: 'michael-s-harper', name: 'Michael S. Harper', note: 'Jazz as poetic structure.' },
            { slug: 'c-k-williams', name: 'C. K. Williams', note: 'Philadelphia and the long moral line.' },
            { slug: 'philip-levine', name: 'Philip Levine', note: 'Work and the city named plainly.' }
        ]
    },

    'cate-marvin': {
        body: [
            'Sharp, formally aware poems with a hard edge — the speaker is frequently furious, frequently funny about it, and never asks to be liked, which is rarer than it sounds.',
            'The subjects are desire, humiliation, girlhood, ambition and the specific indignities of being a woman in literary life. She co-founded an organisation campaigning on gender inequity in publishing, and the poems come from the same place. Read for the voice, which is the whole instrument.'
        ],
        readNext: [
            { slug: 'kim-addonizio', name: 'Kim Addonizio', note: 'Comparable bluntness and wit.' },
            { slug: 'brenda-shaughnessy', name: 'Brenda Shaughnessy', note: 'Syntax under emotional pressure.' },
            { slug: 'sylvia-plath', name: 'Sylvia Plath', note: 'The fury handled formally.' }
        ]
    },

    'charles-olson': {
        body: [
            'His essay on projective verse is one of the most consequential documents in postwar American poetry: it argued that the poem should be composed by field, that the line should follow the breath, and that the typewriter could score a voice on the page.',
            'The practice is the long serial poem about Gloucester, Massachusetts — geography, fishing, history, myth and local record assembled over decades and left unfinished. He ran Black Mountain College and taught or influenced most of the poets around it. The theory is easier to read than the poems, which is a genuine problem and not a reason to skip them.'
        ],
        readNext: [
            { slug: 'robert-creeley', name: 'Robert Creeley', note: 'The theory applied at short length.' },
            { slug: 'robert-duncan', name: 'Robert Duncan', note: 'The open field taken somewhere visionary.' },
            { slug: 'ezra-pound', name: 'Ezra Pound', note: 'The long poem he is arguing with.' }
        ]
    },

    'chris-abani': {
        body: [
            'A Nigerian-born poet, novelist and essayist who was imprisoned in Nigeria over his writing while still very young, and whose work handles violence, faith and the body without ever making a spectacle of the biography.',
            'The poems move between Lagos, Los Angeles and elsewhere, and are grounded in Igbo and Catholic material at the same time. He writes with great tenderness about brutality, which is the defining tension. The short lyrics are the way in; the longer sequences assume you have accepted the terms.'
        ],
        readNext: [
            { slug: 'kofi-awoonor', name: 'Kofi Awoonor', note: 'West African poetry in English.' },
            { slug: 'yusef-komunyakaa', name: 'Yusef Komunyakaa', note: 'Violence written with a musical ear.' },
            { slug: 'jericho-brown', name: 'Jericho Brown', note: 'Faith, the body and damage.' }
        ]
    },

    'cole-swensen': {
        body: [
            'A poet of the hybrid book: her collections take a subject — gardens, ghosts, illuminated manuscripts, a painter, the history of hands — and circle it in fragmentary lyric prose and sparse verse for a whole volume.',
            'She is a translator from French and a theorist of the space between lyric and experiment, and both show. The poems are cool, researched and visually spacious, and they ask the reader to accept accumulation instead of argument. Read a whole book or none; a single page looks like a note.'
        ],
        readNext: [
            { slug: 'susan-howe', name: 'Susan Howe', note: 'Archive and lyric fragment.' },
            { slug: 'rosmarie-waldrop', name: 'Rosmarie Waldrop', note: 'The sentence as unit of composition.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'Scholarship as poetic form.' }
        ]
    },

    'david-wojahn': {
        body: [
            'His best-known sequence is a set of unrhymed sonnets on rock and roll — Elvis, Lennon, Hendrix, small cultural moments treated with the seriousness usually reserved for history, and getting it.',
            'Elsewhere the subjects are family, addiction, illness and the American twentieth century, handled in dense formal poems full of documentary detail. His criticism on contemporary poetry is worth reading alongside. The method is to take the disposable and give it the weight it actually carried in people\'s lives.'
        ],
        readNext: [
            { slug: 'larry-levis', name: 'Larry Levis', note: 'The long elegiac American poem.' },
            { slug: 'lynda-hull', name: 'Lynda Hull', note: 'His wife, and the same music and damage.' },
            { slug: 'robert-lowell', name: 'Robert Lowell', note: 'The unrhymed sonnet as a serial instrument.' }
        ]
    },

    'debora-greger': {
        body: [
            'Painterly, allusive poems that move between museums, mythology, English and American landscapes and a dry domestic wit — the recurring gesture is to set a work of art beside an ordinary life and let both look strange.',
            'She is a visual artist as well, and the poems have a curator\'s eye for arrangement. The tone is cool and slightly ironic, and the erudition is worn lightly. Read for the sidelong humour, which is easy to miss on a first pass.'
        ],
        readNext: [
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: 'Observation as the whole emotion.' },
            { slug: 'amy-gerstler', name: 'Amy Gerstler', note: 'Wit and the borrowed voice.' },
            { slug: 'mary-jo-bang', name: 'Mary Jo Bang', note: 'Art history as poetic material.' }
        ]
    },

    'e-e-cummings': {
        body: [
            'The typography is what everyone remembers — lowercase, split words, punctuation used as rhythm, lines scattered across the page — and it is a scoring system rather than a decoration: the arrangement tells you how fast to read and where the surprise falls.',
            'Underneath it he is a surprisingly traditional lyric poet, writing sonnets about love and spring, and a savage satirist about war, patriotism and conformity. He was also a painter, and served in an ambulance corps in the First World War and was imprisoned by the French, which produced his best prose. The sentiment can cloy; the technique never stopped being new.'
        ],
        readNext: [
            { slug: 'kenneth-patchen', name: 'Kenneth Patchen', note: 'The page as a visual object.' },
            { slug: 'mina-loy', name: 'Mina Loy', note: 'Modernist typography with a harder edge.' },
            { slug: 'gertrude-stein', name: 'Gertrude Stein', note: 'Grammar broken in the other direction.' }
        ]
    },

    'eduardo-c-corral': {
        body: [
            'Spanish and English sit side by side in these poems without translation or apology, and the refusal to gloss is part of the argument about who the poem is for.',
            'The subjects are queer desire, the border, undocumented migration and the body, handled with a lush precision that owes something to Lorca. One book is built around the voices of people crossing the desert. The images are frequently violent and frequently beautiful in the same line, which is the effect he is after.'
        ],
        readNext: [
            { slug: 'javier-zamora', name: 'Javier Zamora', note: 'Migration written from inside it.' },
            { slug: 'rigoberto-gonzlez', name: 'Rigoberto González', note: 'Queer Latino poetry of the same moment.' },
            { slug: 'francisco-x-alarcn', name: 'Francisco X. Alarcón', note: 'The bilingual page as a position.' }
        ]
    },

    'ellen-bryant-voigt': {
        body: [
            'A poet of rural Virginia and of family, working in a syntax that is genuinely her own — long sentences pulled tight across short lines, with a musician\'s sense of phrasing (she trained as a pianist).',
            'The most striking book is a sequence of unrhymed sonnets about the 1918 influenza epidemic in a farming community, spoken by many voices and adding up to something no single narrator could carry. Her prose on the craft of syntax is among the best writing on technique by a working poet.'
        ],
        readNext: [
            { slug: 'claudia-emerson', name: 'Claudia Emerson', note: 'Rural Virginia in the same register.' },
            { slug: 'linda-gregerson', name: 'Linda Gregerson', note: 'Syntax stretched across the line.' },
            { slug: 'robert-frost', name: 'Robert Frost', note: 'The rural dramatic poem she works from.' }
        ]
    },

    'emily-berry': {
        body: [
            'A British poet whose first book is fast, funny and unsettling — dispatches from invented lives, absurd bureaucracies, and a persistent sense that the speaker is performing rather than confiding.',
            'The second is very different: a sustained treatment of a mother\'s death and of grief as something that will not organise itself into a narrative, written in fragments and with the psychoanalytic vocabulary showing. The two books together demonstrate an unusual range. She has edited an important poetry magazine.'
        ],
        readNext: [
            { slug: 'mary-jo-bang', name: 'Mary Jo Bang', note: 'Grief handled through style.' },
            { slug: 'stevie-smith', name: 'Stevie Smith', note: 'The British poem at its strangest.' },
            { slug: 'dorothea-lasky', name: 'Dorothea Lasky', note: 'Flat statement carrying extremity.' }
        ]
    },

    'frances-ellen-watkins-harper': {
        body: [
            'An abolitionist, suffragist and lecturer who was among the most widely read African American poets of the nineteenth century, writing verse built to be delivered at meetings and to be understood at once.',
            'The poems use ballad metre and hymn stanza — forms an audience already knew — to carry arguments about slavery, motherhood under slavery, temperance and the vote. The best-known declares she would not rest in a grave in a land where men are slaves. She also wrote one of the earliest novels published by a Black American woman.'
        ],
        readNext: [
            { slug: 'phillis-wheatley', name: 'Phillis Wheatley', note: 'The first African American poet in print.' },
            { slug: 'george-moses-horton', name: 'George Moses Horton', note: 'A poet who published while enslaved.' },
            { slug: 'paul-laurence-dunbar', name: 'Paul Laurence Dunbar', note: 'The generation that followed.' }
        ]
    },

    'g-k-chesterton': {
        body: [
            'A prolific journalist, novelist and Catholic controversialist whose verse is loud, metrically driving and built for recitation — long galloping ballads about battles, roads, donkeys and beer.',
            'The best of it is very good indeed: the battle poem about Lepanto has a momentum almost nothing else in English matches, and the comic pieces are genuinely funny. The politics are of their period and the antisemitism in some of his prose is real. Read the ballads aloud; silently they lose most of what they have.'
        ],
        readNext: [
            { slug: 'hilaire-belloc', name: 'Hilaire Belloc', note: 'His close ally in every argument.' },
            { slug: 'rudyard-kipling', name: 'Rudyard Kipling', note: 'The recitable ballad at its best.' },
            { slug: 'alfred-noyes', name: 'Alfred Noyes', note: 'The same galloping narrative verse.' }
        ]
    },

    'gerard-malanga': {
        body: [
            'A poet and photographer who worked as Andy Warhol\'s assistant through the Factory years, and whose real significance is as a documentarian of that scene — but the poems came first and continued.',
            'They belong to the New York School\'s conversational mode: names, parties, love affairs, films, written quickly and without much revision. The interest is partly historical and partly in the tone, which is unguarded in a way the more careful poets of that circle were not.'
        ],
        readNext: [
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'The model for the poem-as-diary.' },
            { slug: 'bill-berkson', name: 'Bill Berkson', note: 'The art world written from inside it.' },
            { slug: 'ted-berrigan', name: 'Ted Berrigan', note: 'The second generation of that scene.' }
        ]
    },

    'hugh-macdiarmid': {
        body: [
            'He set out to make a modern literature in Scots and largely succeeded — assembling a written language from dialect, dictionaries and older texts, and using it for a long philosophical poem in which a drunk man lies on a hillside arguing with a thistle.',
            'That poem is one of the great modernist works in any language of these islands. The later work turns didactic and enormous, incorporating scientific and technical prose wholesale, and divides readers sharply. He was a communist, a nationalist, and quarrelsome to the point of being expelled from both movements.'
        ],
        readNext: [
            { slug: 'robert-burns', name: 'Robert Burns', note: 'The Scots tradition he was reclaiming.' },
            { slug: 'basil-bunting', name: 'Basil Bunting', note: 'Northern modernism written for the ear.' },
            { slug: 'tom-pickard', name: 'Tom Pickard', note: 'Vernacular as a political choice, later.' }
        ]
    },

    'javier-zamora': {
        body: [
            'He crossed from El Salvador to the United States alone at nine, and the poems are about that journey, the war that caused it, and the family it separated him from for years.',
            'The verse mixes Spanish and English, uses documentary fragments, and is precise about the physical facts — the desert, the boat, the coyote, the phone calls. What keeps it from being testimony is the formal care: the poems are made objects, not depositions. The memoir he later published covers the same ground at length.'
        ],
        readNext: [
            { slug: 'eduardo-c-corral', name: 'Eduardo C. Corral', note: 'The border in a lusher idiom.' },
            { slug: 'martn-espada', name: 'Martín Espada', note: 'The political poem written to be understood.' },
            { slug: 'solmaz-sharif', name: 'Solmaz Sharif', note: 'State language turned against itself.' }
        ]
    },

    'jericho-brown': {
        body: [
            'He invented a form he calls the duplex — a fourteen-line poem built from repeating, slightly altered couplets, borrowing from the sonnet, the ghazal and the blues — and it has been widely taken up since.',
            'The subjects are Black life in America, queer desire, a violent father, HIV and faith, handled with a lyricism that never softens the material. The poems are short and the endings land hard. His argument for the form is that a poem about inherited violence should be built out of repetition that will not resolve.'
        ],
        readNext: [
            { slug: 'danez-smith', name: 'Danez Smith', note: 'The same generation, more performative.' },
            { slug: 'carl-phillips', name: 'Carl Phillips', note: 'Desire handled with syntactic restraint.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Compression with total authority.' }
        ]
    },

    'jill-alexander-essbaum': {
        body: [
            'A formal poet whose subject is the collision of the erotic and the devotional — the poems rhyme hard, pun constantly, and treat lust and prayer as versions of the same appetite.',
            'The technique is showy on purpose: heavy internal rhyme, wordplay pushed to the edge of taste, and a willingness to be tasteless when that is the honest register. The religious material is not ironic. She has also written a novel. Read several; the effect depends on the accumulation of nerve.'
        ],
        readNext: [
            { slug: 'john-donne', name: 'John Donne', note: 'The erotic and the devout in one instrument.' },
            { slug: 'richard-crashaw', name: 'Richard Crashaw', note: 'Devotion at its most extravagant.' },
            { slug: 'kim-addonizio', name: 'Kim Addonizio', note: 'Contemporary form and appetite.' }
        ]
    },

    'jill-mcdonough': {
        body: [
            'One book is a sequence of sonnets on executions in America, one for each century and each case, written in a plain conversational voice that reports what happened and declines to editorialise.',
            'The restraint is the argument: fifty flat accounts of a state killing someone do more than any denunciation. She has taught in prisons for years and writes about that too, alongside poems about drinking, teaching and marriage that are funny and unguarded. The formal control is constant across both registers.'
        ],
        readNext: [
            { slug: 'reginald-dwayne-betts', name: 'Reginald Dwayne Betts', note: 'Incarceration written from inside it.' },
            { slug: 'marilyn-nelson', name: 'Marilyn Nelson', note: 'Atrocity contained by strict form.' },
            { slug: 'charles-reznikoff', name: 'Charles Reznikoff', note: 'The record left to speak for itself.' }
        ]
    },

    'karen-volkman': {
        body: [
            'An abstract lyric poet: the poems are musically dense and almost entirely without narrative or occasion, working through sound, syntax and a vocabulary that keeps sliding out of reference.',
            'One book is a sequence of sonnets that observe the form\'s shape while refusing its argumentative logic. The influence of French symbolism is audible. This is poetry to be read for the pleasure of the sentence rather than for what it is about, and readers who need a subject will find it frustrating by design.'
        ],
        readNext: [
            { slug: 'stphane-mallarm', name: 'Stéphane Mallarmé', note: 'The symbolist ancestor.' },
            { slug: 'michael-palmer', name: 'Michael Palmer', note: 'Lyric beauty without connection.' },
            { slug: 'lucie-brock-broido', name: 'Lucie Brock-Broido', note: 'Extravagant diction as method.' }
        ]
    },

    'kaveh-akbar': {
        body: [
            'Addiction and faith are the two subjects, and the poems refuse to separate them — recovery is described in devotional language and God is addressed with the vocabulary of craving.',
            'He is Iranian American and Muslim, and Persian poetry sits underneath the work as an inheritance rather than as reference. The line is short, the images are physical and strange, and the tone is startled rather than confessional. He has also done a great deal as an interviewer and editor to widen what American poetry pays attention to.'
        ],
        readNext: [
            { slug: 'franz-wright', name: 'Franz Wright', note: 'Addiction and prayer in the same poem.' },
            { slug: 'kazim-ali', name: 'Kazim Ali', note: 'Muslim practice as a way of thinking.' },
            { slug: 'christian-wiman', name: 'Christian Wiman', note: 'Belief argued under duress.' }
        ]
    },

    'kenneth-slessor': {
        body: [
            'An Australian poet whose reputation rests largely on a handful of poems, one of which — a long elegy for a friend drowned in Sydney Harbour — is among the finest in Australian English.',
            'The verse is modernist in manner, urban, and obsessed with time and memory; he was also a war correspondent and wrote almost no poetry after that. The Sydney poems capture a specific harbour city at a specific moment better than anything else in the literature. A small body of work, and very little of it wasted.'
        ],
        readNext: [
            { slug: 'les-murray', name: 'Les Murray', note: 'The later Australian voice.' },
            { slug: 'stephen-edgar', name: 'Stephen Edgar', note: 'Australian formal verse today.' },
            { slug: 'hart-crane', name: 'Hart Crane', note: 'The same modernist high style.' }
        ]
    },

    'lorna-dee-cervantes': {
        body: [
            'A Chicana poet whose first book is a landmark: poems about a Californian childhood, a grandmother\'s house, racism experienced and denied, and the specific difficulty of writing in a language that is and is not yours.',
            'The best-known poem answers a white friend who insists there is no war between the races, and dismantles that claim without raising its voice. The politics are direct and the craft is quiet. Later work is more experimental and less read; the early poems remain foundational for Chicana literature.'
        ],
        readNext: [
            { slug: 'francisco-x-alarcn', name: 'Francisco X. Alarcón', note: 'The bilingual page as a position.' },
            { slug: 'gary-soto', name: 'Gary Soto', note: 'Californian childhood in plain narrative.' },
            { slug: 'audre-lorde', name: 'Audre Lorde', note: 'The political poem as survival.' }
        ]
    },

    'lynda-hull': {
        body: [
            'Long, dense, image-saturated poems about heroin, jazz clubs, cheap hotels and the American city at night, written in a syntax that keeps accelerating and rarely lets a sentence close early.',
            'She had lived the material and does not present it as spectacle. The music is central: Coltrane and bebop as structure, and a sense of the poem improvising over changes. She died in a car crash in her thirties with three books\' worth of work, the last two published after her death.'
        ],
        readNext: [
            { slug: 'david-wojahn', name: 'David Wojahn', note: 'Her husband, and the same cultural material.' },
            { slug: 'larry-levis', name: 'Larry Levis', note: 'The long associative elegiac poem.' },
            { slug: 'michael-s-harper', name: 'Michael S. Harper', note: 'Jazz as structural principle.' }
        ]
    },

    'mahmoud-darwish': {
        body: [
            'The Palestinian national poet, read here in translation, and a writer who spent a career resisting exactly that title — his later work is deliberately more personal and more oblique than the audiences wanting anthems would have liked.',
            'The early poems are direct and were memorised and chanted; the mature work is meditative, allusive and preoccupied with exile, land, memory and the Arabic language itself. He drew on classical Arabic tradition and on the European modernists equally. Even in translation the cadence carries, which is unusual and says something about the underlying construction.'
        ],
        readNext: [
            { slug: 'fady-joudah', name: 'Fady Joudah', note: 'His principal English translator.' },
            { slug: 'agha-shahid-ali', name: 'Agha Shahid Ali', note: 'The poetry of a lost homeland.' },
            { slug: 'yehuda-amichai', name: 'Yehuda Amichai', note: 'The other side of the same ground.' }
        ]
    },

    'margaret-fishback': {
        body: [
            'A working advertising copywriter — reportedly the highest-paid woman in the business in her day — who wrote light verse for magazines about department stores, hats, dates, taxis and the daily comedy of a working woman in Manhattan.',
            'The technique is exact: tight rhyme, brisk metre, and a punchline that arrives on schedule. It is period writing and it is very well made, and it documents a life that serious poetry of the 1930s largely ignored. Read alongside Dorothy Parker, whose register is close and considerably darker.'
        ],
        readNext: [
            { slug: 'dorothy-parker', name: 'Dorothy Parker', note: 'The same wit, with more acid.' },
            { slug: 'franklin-pierce-adams', name: 'Franklin Pierce Adams', note: 'The newspaper light-verse column.' },
            { slug: 'x-j-kennedy', name: 'X. J. Kennedy', note: 'Light verse handled with full technique.' }
        ]
    },

    'marin-sorescu': {
        body: [
            'A Romanian poet, read in translation, whose poems are short, ironic parables written in the flattest possible language — a man interrogates a stone, someone tries to leave a room that has no door.',
            'Under a censoring state that deadpan was a strategy as well as a style: the poems are politically unanswerable because they never state a position. The humour survives translation because it lives in the situation rather than in the wordplay. The late poems, written while dying, drop the irony almost entirely.'
        ],
        readNext: [
            { slug: 'miroslav-holub', name: 'Miroslav Holub', note: 'The same dry Eastern European deadpan.' },
            { slug: 'zbigniew-herbert', name: 'Zbigniew Herbert', note: 'The parable under a regime.' },
            { slug: 'charles-simic', name: 'Charles Simic', note: 'The impossible object stated plainly.' }
        ]
    },

    'mary-barnard': {
        body: [
            'Her Sappho is the reason most English readers hear Sappho the way they do: spare, fragmentary, arranged as short free-verse pieces with the gaps left visible rather than filled in.',
            'That decision — to let the damage of the manuscripts be part of the poem — shaped the modern reception of a poet who survives almost entirely in scraps. Her own verse is imagist in descent, precise and unhurried, and she wrote about the Pacific Northwest. The translations are the achievement.'
        ],
        readNext: [
            { slug: 'h-d', name: 'H. D.', note: 'Greek material at its most spare.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'The later Sappho in English.' },
            { slug: 'ezra-pound', name: 'Ezra Pound', note: 'Who advised her early on.' }
        ]
    },

    'mary-sidney-herbert-countess-of-pembroke': {
        body: [
            'She completed her brother Philip Sidney\'s verse translation of the Psalms after his death, and the result is one of the most metrically inventive works of the English Renaissance — over a hundred psalms, almost every one in a different stanza form.',
            'That variety was a technical demonstration as much as a devotional act, and it was read in manuscript by poets including Herbert and Donne. She also edited her brother\'s work, translated from French and Italian, and ran a literary circle. A major writer whose reputation was subsumed into her brother\'s for four centuries.'
        ],
        readNext: [
            { slug: 'sir-philip-sidney', name: 'Sir Philip Sidney', note: 'Her brother, and the work she finished.' },
            { slug: 'george-herbert', name: 'George Herbert', note: 'The devotional poet who read these psalms.' },
            { slug: 'lady-mary-wroth', name: 'Lady Mary Wroth', note: 'Her niece, and the next woman of that circle.' }
        ]
    },

    'mary-szybist': {
        body: [
            'One book circles the Annunciation — the moment of being addressed by something enormous — through dozens of formal approaches: erasures, diagrams, a poem laid out as a sunburst, a poem made from a newspaper report.',
            'The result is a genuinely unusual religious book: attentive, secular in its doubts, and formally inventive without being cold. The recurring question is what it means to be spoken to and whether anyone is speaking. Read the whole sequence; individual pieces look like experiments and cohere as a book.'
        ],
        readNext: [
            { slug: 'scott-cairns', name: 'Scott Cairns', note: 'Contemporary devotional poetry, playful.' },
            { slug: 'jean-valentine', name: 'Jean Valentine', note: 'The interior addressed to somebody absent.' },
            { slug: 'fanny-howe', name: 'Fanny Howe', note: 'Belief without resolution.' }
        ]
    },

    'nathalie-handal': {
        body: [
            'A French American poet of Palestinian descent who writes across languages and continents, and whose books are frequently organised as journeys — cities, borders, hotel rooms, the Mediterranean.',
            'The poems are short, lyrical and preoccupied with belonging to several places and none. She is also an editor and anthologist whose collections of Arab and Arab American women\'s writing did a great deal to widen what is available in English. The travel poems are the strongest.'
        ],
        readNext: [
            { slug: 'mahmoud-darwish', name: 'Mahmoud Darwish', note: 'The Palestinian inheritance at its source.' },
            { slug: 'naomi-shihab-nye', name: 'Naomi Shihab Nye', note: 'The same descent, plainer.' },
            { slug: 'meena-alexander', name: 'Meena Alexander', note: 'Displacement across several languages.' }
        ]
    },

    'oliver-wendell-holmes-sr': {
        body: [
            'A physician and professor who wrote occasional verse for most of his life — light, witty, formally neat poems produced for dinners, reunions and public occasions, plus a few that outlived the occasion.',
            'The best-known saved a warship from being scrapped by shaming the public into keeping it, which is a rare instance of a poem doing something concrete. Another turns a shell into an extended argument about the soul, competently enough to have been memorised for a century. His medical writing on hand-washing and childbed fever mattered more than any of it.'
        ],
        readNext: [
            { slug: 'ralph-waldo-emerson', name: 'Ralph Waldo Emerson', note: 'The New England circle he belonged to.' },
            { slug: 'henry-wadsworth-longfellow', name: 'Henry Wadsworth Longfellow', note: 'The most popular of that group.' },
            { slug: 'john-greenleaf-whittier', name: 'John Greenleaf Whittier', note: 'The New England generation.' }
        ]
    },

    'paul-celan': {
        body: [
            'A German-speaking Jewish poet from what is now Ukraine whose parents were murdered in the camps, and who spent his life writing in the language of their killers. Everything about the work follows from that.',
            'The early poem about black milk is the most famous German poem of the Holocaust and he came to distrust its beauty. The later poems compress and break German into coinages and fragments, until a poem can be four words wide — the language taken apart because it cannot be used whole. He is difficult in a way no paraphrase survives, and the difficulty is not a style.'
        ],
        readNext: [
            { slug: 'osip-mandelstam', name: 'Osip Mandelstam', note: 'The poet he translated and identified with.' },
            { slug: 'gottfried-benn', name: 'Gottfried Benn', note: 'The German language before the catastrophe.' },
            { slug: 'heather-mchugh', name: 'Heather McHugh', note: 'One of his English translators.' }
        ]
    },

    'rafael-campo': {
        body: [
            'A practising physician who writes formal verse — sonnets, villanelles, rhymed couplets — about patients, HIV, being Cuban American and being gay, and the form is doing specific work rather than being a preference.',
            'His argument, made in essays too, is that metre is a kind of care: the ordered line holds a suffering body the way a clinic is supposed to. The poems are direct about medicine\'s failures and about his own. The AIDS poems from the epidemic\'s worst years are the core of the work.'
        ],
        readNext: [
            { slug: 'c-dale-young', name: 'C. Dale Young', note: 'The other contemporary physician-poet here.' },
            { slug: 'thom-gunn', name: 'Thom Gunn', note: 'The epidemic elegy in metre.' },
            { slug: 'marilyn-hacker', name: 'Marilyn Hacker', note: 'Formal verse and illness.' }
        ]
    },

    'rebecca-lindenberg': {
        body: [
            'Her first book is an elegy for the poet Craig Arnold, who disappeared on a volcano in Japan, and it is structured as an index — fragments, definitions and cross-references circling a death with no body and no confirmed account.',
            'The form solves a real problem: a disappearance cannot be narrated, and an index does not pretend to. The poems are lyrical and exact, and they avoid every available cliché of the grief book. Later work moves outward without losing that formal intelligence.'
        ],
        readNext: [
            { slug: 'craig-arnold', name: 'Craig Arnold', note: 'The poet the book is written for.' },
            { slug: 'mary-jo-bang', name: 'Mary Jo Bang', note: 'Grief handled through style.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'The elegy as an assembled object.' }
        ]
    },

    'rick-barot': {
        body: [
            'Quiet, essayistic poems that move by association between a painting, a memory, a news item and a physical detail, in long sentences that keep qualifying themselves.',
            'He is Filipino American, and the material of migration, colonial history and family surfaces without being announced as a theme. One book is built around the galleon trade and its long consequences. The register is calm and the poems are unusually good at holding several unrelated things in mind at once.'
        ],
        readNext: [
            { slug: 'arthur-sze', name: 'Arthur Sze', note: 'Constellated form and clear images.' },
            { slug: 'carl-phillips', name: 'Carl Phillips', note: 'The long self-qualifying sentence.' },
            { slug: 'rigoberto-gonzlez', name: 'Rigoberto González', note: 'The same generation and inheritance.' }
        ]
    },

    'robert-bridges': {
        body: [
            'Poet Laureate for the last decade of his life, and now remembered mostly for two things other than his own poems: he was Gerard Manley Hopkins\'s friend and eventually his editor, publishing the poems decades after Hopkins died, and he wrote a long philosophical poem in old age that was an unexpected bestseller.',
            'His own lyrics are metrically fastidious — he experimented seriously with quantitative and syllabic measures — and emotionally cool. The reputation has fallen a long way. Read him for the technical experiments and for the fact that without him there would be no Hopkins to read.'
        ],
        readNext: [
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The friend whose work he preserved.' },
            { slug: 'a-e-housman', name: 'A. E. Housman', note: 'The same generation, plainer and harder.' },
            { slug: 'alfred-lord-tennyson', name: 'Alfred, Lord Tennyson', note: 'The Victorian ear he inherited.' }
        ]
    },

    'ronald-johnson': {
        body: [
            'He took a copy of Paradise Lost and erased almost all of it, leaving a scattering of Milton\'s own words on the page as a new poem — one of the earliest and best erasure works, and still the most audacious.',
            'His larger project is a long visionary poem built in three sections, concrete and typographic in places, celebratory throughout, and owing more to Blake and to American open-field poetics than to anything contemporary. He also wrote cookbooks. A poet almost unknown in his lifetime and steadily more read since.'
        ],
        readNext: [
            { slug: 'john-milton', name: 'John Milton', note: 'The poem he erased.' },
            { slug: 'charles-olson', name: 'Charles Olson', note: 'The open-field long poem.' },
            { slug: 'susan-howe', name: 'Susan Howe', note: 'The page as a visual field.' }
        ]
    },

    'sam-sax': {
        body: [
            'A poet out of the performance scene whose books are organised around a single pressure — one on madness and its medical history, one on queerness, disease and the bathhouse, one on the animal.',
            'The poems are short, fast and formally aware, drawing on Jewish liturgy, queer history and the vocabulary of diagnosis. The politics are explicit and the tone is more grieving than combative. The research is real: these books argue with archives as well as with the present.'
        ],
        readNext: [
            { slug: 'danez-smith', name: 'Danez Smith', note: 'The same generation and stage.' },
            { slug: 'jericho-brown', name: 'Jericho Brown', note: 'Desire, illness and invented form.' },
            { slug: 'tim-dlugos', name: 'Tim Dlugos', note: 'The epidemic written as it happened.' }
        ]
    },

    'sina-queyras': {
        body: [
            'A Canadian poet whose books change method completely from one to the next — a long poem answering Virginia Woolf\'s waves, a book of grief written after a sister\'s death, a book on the poetics of anger.',
            'The work is formally experimental and emotionally direct at the same time, which is an unusual combination, and it is explicitly queer and feminist in its arguments. Prose, essay and verse mix freely. Read a single book straight through: the shape of the argument is the point.'
        ],
        readNext: [
            { slug: 'lisa-robertson', name: 'Lisa Robertson', note: 'Canadian experimental poetics.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'Genre held deliberately open.' },
            { slug: 'juliana-spahr', name: 'Juliana Spahr', note: 'Politics and form in the same move.' }
        ]
    },

    'sir-john-suckling': {
        body: [
            'A Cavalier poet, gambler and courtier whose lyrics are brisk, cynical and very funny about love — the famous one asks a pale lolling lover what good his sighing is doing and tells him to give up.',
            'The tone is anti-romantic on principle, which was itself a fashion, and he does it better than most. He invented the card game cribbage by some accounts, raised a troop for the king at his own extravagant expense, and died young in exile after a failed plot. The ballad on a wedding is his other durable piece.'
        ],
        readNext: [
            { slug: 'richard-lovelace', name: 'Richard Lovelace', note: 'The Cavalier lyric at its most gallant.' },
            { slug: 'thomas-carew', name: 'Thomas Carew', note: 'The polished end of the same circle.' },
            { slug: 'ben-jonson', name: 'Ben Jonson', note: 'The classical model behind all of them.' }
        ]
    },

    'stephanie-burt': {
        body: [
            'One of the most widely read poetry critics writing in English, and a poet whose own work is playful, allusive and formally various — sonnets, syllabics, poems spoken by objects, sea creatures and superheroes.',
            'The criticism and the poems share a generosity: an unusual willingness to find what a poem is trying to do rather than to measure it against a standard. The later work deals directly with gender transition. Read the essays alongside; they are among the best available guides to contemporary poetry.'
        ],
        readNext: [
            { slug: 'randall-jarrell', name: 'Randall Jarrell', note: 'The critic-poet she has written a book about.' },
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'Formal play at a small scale.' },
            { slug: 'matthea-harvey', name: 'Matthea Harvey', note: 'Invention with a serious floor.' }
        ]
    },

    'stephen-crane': {
        body: [
            'The novels came first and the poems are stranger than anything in them: very short, unrhymed, unmetred parables in which a man eats his own heart or argues with a universe that declines to be impressed.',
            'They look like nothing else written in America in the 1890s — no ornament, no metre, no consolation — and they anticipate free verse by a decade or more. The tone is flat and ironic and the God in them is either absent or indifferent. He died at twenty-eight, having written a great deal in about seven years.'
        ],
        readNext: [
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The other American writing nothing like her contemporaries.' },
            { slug: 'ambrose-bierce', name: 'Ambrose Bierce', note: 'The same American bleakness in prose and verse.' },
            { slug: 'herman-melville', name: 'Herman Melville', note: 'A novelist turned to hard, unbeautiful verse.' }
        ]
    },

    'stephen-spender': {
        body: [
            'One of the group of English poets of the 1930s who tried to make a political poetry — pylons, factories, the Spanish civil war, unemployment — and the one whose reputation has suffered most from the association.',
            'The best lyrics are genuinely fine, particularly the early ones about light, flight and the continually remembered dead. He spent much of his later life as an editor, memoirist and public literary figure, and his prose about that generation is as valuable as the verse. Uneven, and the good poems are better than the reputation.'
        ],
        readNext: [
            { slug: 'louis-macneice', name: 'Louis MacNeice', note: 'The best poet of that group.' },
            { slug: 'george-szirtes', name: 'George Szirtes', note: 'The formal British poem of a later generation.' },
            { slug: 'wilfred-owen', name: 'Wilfred Owen', note: 'The war poetry they were writing after.' }
        ]
    },

    'alice-moore-dunbar-nelson': {
        body: [
            'A writer, teacher and activist of the Harlem Renaissance generation whose poems, stories and journalism were long read mainly as a footnote to her marriage to Paul Laurence Dunbar.',
            'The poems are formally conventional and quietly subversive: sonnets about the sea, about violets, about a woman\'s wish for a wider life than she has been allotted. Her diary, published long after her death, is a major document of Black women\'s intellectual life in the period, including her relationships with women. Read the sonnets, then the diary.'
        ],
        readNext: [
            { slug: 'paul-laurence-dunbar', name: 'Paul Laurence Dunbar', note: 'Her husband, and the poet she was overshadowed by.' },
            { slug: 'georgia-douglas-johnson', name: 'Georgia Douglas Johnson', note: 'The same generation and the same constraints.' },
            { slug: 'frances-ellen-watkins-harper', name: 'Frances Ellen Watkins Harper', note: 'The generation just before.' }
        ]
    },

    'allen-grossman': {
        body: [
            'A poet and theorist whose prose about what poetry is for — the claim that it exists to keep persons from disappearing — is as substantial as the verse and considerably more read.',
            'The poems are high, declarative and unfashionably grand, full of angels, fathers, the sea and the dead, in a diction that makes no concession to the plain style around it. He taught for decades and shaped a number of well-known poets. Difficult, deliberately elevated, and unlike anything else being written when it appeared.'
        ],
        readNext: [
            { slug: 'hart-crane', name: 'Hart Crane', note: 'The American high style he works in.' },
            { slug: 'robert-duncan', name: 'Robert Duncan', note: 'Visionary poetics taken seriously.' },
            { slug: 'geoffrey-hill', name: 'Geoffrey Hill', note: 'Difficulty defended as respect.' }
        ]
    },

    'allison-adelle-hedge-coke': {
        body: [
            'A poet of Cherokee, Huron and Creek descent who worked in fields, canneries and factories before publishing, and whose poems carry that labour as fact rather than as credential.',
            'Her most ambitious book is a long sequence about the Indigenous earthworks of the American interior, spoken partly by the mounds themselves, set against the strip mining and agriculture that have destroyed them. The forms are experimental and the ecological argument is direct. She is also an editor and anthologist of Native writing.'
        ],
        readNext: [
            { slug: 'linda-hogan', name: 'Linda Hogan', note: 'Ecology and Native history together.' },
            { slug: 'heid-e-erdrich', name: 'Heid E. Erdrich', note: 'Formal invention and Native material.' },
            { slug: 'diane-glancy', name: 'Diane Glancy', note: 'English deliberately broken.' }
        ]
    },

    'anna-swir': {
        body: [
            'A Polish poet, read in translation, who served as a military nurse during the Warsaw Uprising and wrote about it decades later in very short, flat poems that report an atrocity in a few lines and stop.',
            'The other body of work is about the female body — ageing, sex, childbirth, physical labour — written with a bluntness that had almost no precedent in Polish poetry. Milosz translated her and wrote about her at length. Both subjects are handled the same way: no metaphor, no consolation, one fact per poem.'
        ],
        readNext: [
            { slug: 'czeslaw-milosz', name: 'Czeslaw Milosz', note: 'Her translator and advocate.' },
            { slug: 'vera-pavlova', name: 'Vera Pavlova', note: 'The short poem on the body, later.' },
            { slug: 'sharon-olds', name: 'Sharon Olds', note: 'The physical written without decorum.' }
        ]
    },

    'b-h-fairchild': {
        body: [
            'His father ran a machine shop, and the poems are set there — lathes, drill presses, the specific vocabulary of metalwork — written in long narrative lines about men doing skilled physical work in small Kansas and Texas towns.',
            'The trick, and it is a real one, is that the poems are also full of Hart Crane, opera and the history of art, because the men in them are not simple and the poems refuse to make them so. A machinist recites poetry over a lathe and the poem does not treat that as incongruous.'
        ],
        readNext: [
            { slug: 'philip-levine', name: 'Philip Levine', note: 'Industrial work named with respect.' },
            { slug: 'rodney-jones', name: 'Rodney Jones', note: 'Long narrative lines out of small-town America.' },
            { slug: 'hart-crane', name: 'Hart Crane', note: 'The poet his machinists read.' }
        ]
    },

    'bruce-weigl': {
        body: [
            'He enlisted at eighteen and served in Vietnam, and has written about it for fifty years without ever settling the account — the poems keep returning because the material will not close.',
            'The style is plain and declarative, and the best poems place an ordinary domestic present against something remembered, with no transition and no comment. He has also translated Vietnamese poetry and returned to the country repeatedly, including to adopt a daughter. Among the essential American writing on that war.'
        ],
        readNext: [
            { slug: 'yusef-komunyakaa', name: 'Yusef Komunyakaa', note: 'The same war, with a jazz ear.' },
            { slug: 'brian-turner', name: 'Brian Turner', note: 'Iraq, by somebody who had read these.' },
            { slug: 'quan-barry', name: 'Quan Barry', note: 'Vietnam from the other direction.' }
        ]
    },

    'chana-bloch': {
        body: [
            'A poet and translator whose versions of Yehuda Amichai and Dahlia Ravikovitch shaped how Israeli poetry reads in English, and whose translation of the Song of Songs restored its plain erotic directness.',
            'Her own poems are short, wry and domestic — marriage, divorce, Jewish practice, illness — with a biblical vocabulary used conversationally rather than reverently. The late poems written during terminal illness are unsentimental and very good. Read the translations alongside; the same ear is doing both jobs.'
        ],
        readNext: [
            { slug: 'yehuda-amichai', name: 'Yehuda Amichai', note: 'The poet she translated for decades.' },
            { slug: 'alicia-ostriker', name: 'Alicia Ostriker', note: 'Biblical material rewritten by a woman.' },
            { slug: 'linda-pastan', name: 'Linda Pastan', note: 'The domestic lyric at similar scale.' }
        ]
    },

    'charles-hamilton-sorley': {
        body: [
            'He was twenty when he was killed at Loos, and had already written the poem that dismantles the consolations the rest of English war poetry was still offering: a sonnet telling the reader that the millions of mouthless dead cannot hear praise, and that no one should say anything soft about them.',
            'He had studied in Germany just before the war and refused to hate the enemy, which is rarer than it sounds in 1915. The body of work is tiny and was published after his death. Robert Graves thought him one of the three great losses of that war.'
        ],
        readNext: [
            { slug: 'wilfred-owen', name: 'Wilfred Owen', note: 'The same refusal, a year later.' },
            { slug: 'isaac-rosenberg', name: 'Isaac Rosenberg', note: 'The war from the ranks.' },
            { slug: 'rupert-brooke', name: 'Rupert Brooke', note: 'The consolation Sorley wrote against.' }
        ]
    },

    'craig-santos-perez': {
        body: [
            'A Chamorro poet from Guam whose long serial project takes the language of military occupation, tourism, treaty and environmental report and rebuilds it as poetry — the pages use fragments, footnotes, blank space and untranslated CHamoru.',
            'The argument is that an island administered as an unincorporated territory needs a poetics that shows the incompleteness rather than smoothing it. Ecological collapse in the Pacific is the other constant. Formally demanding, politically explicit, and unlike anything else in American poetry.'
        ],
        readNext: [
            { slug: 'allison-adelle-hedge-coke', name: 'Allison Adelle Hedge Coke', note: 'Land, extraction and Indigenous form.' },
            { slug: 'juliana-spahr', name: 'Juliana Spahr', note: 'Ecology and politics in experimental form.' },
            { slug: 'kamau-brathwaite', name: 'Kamau Brathwaite', note: 'The page remade for a colonised language.' }
        ]
    },

    'daniel-borzutzky': {
        body: [
            'Relentless, repetitive prose poems about state violence, debt, privatisation and bodies treated as accounting entries, moving between Chicago and Chile without marking the border.',
            'The repetition is the method: a phrase returns dozens of times with small mutations until the bureaucratic language starts to sound like what it actually describes. He translates Chilean poetry, and the dictatorship\'s vocabulary is audible under the American material. Deliberately hard to read in bulk, and meant to be.'
        ],
        readNext: [
            { slug: 'cesare-pavese', name: 'Cesare Pavese', note: 'European poetry of state violence and plain speech.' },
            { slug: 'solmaz-sharif', name: 'Solmaz Sharif', note: 'Official language turned against itself.' },
            { slug: 'joyelle-mcsweeney', name: 'Joyelle McSweeney', note: 'The contemporary poetics of the grotesque.' }
        ]
    },

    'dara-wier': {
        body: [
            'Slippery, associative poems that begin in a recognisable Southern or domestic scene and drift somewhere unaccountable, with the syntax staying calm the whole way.',
            'One book is a sequence written after a friend\'s death that circles it obliquely for a hundred pages. She has taught for decades and co-founded a press, and her influence on younger experimental poets runs largely through that. Read for tone; the poems resist paraphrase and are not trying to be difficult.'
        ],
        readNext: [
            { slug: 'james-tate', name: 'James Tate', note: 'Her longtime colleague, and the deadpan absurd.' },
            { slug: 'mary-ruefle', name: 'Mary Ruefle', note: 'Abrupt turns handled lightly.' },
            { slug: 'c-d-wright', name: 'C. D. Wright', note: 'Southern speech put to experimental use.' }
        ]
    },

    'david-harsent': {
        body: [
            'A British poet whose work is consistently dark — violence, myth, dreams, a wood, a hunt, a war reported from no identified war — written in a spare, clipped line that withholds the explanation the poems keep implying.',
            'He has collaborated extensively with a composer, writing libretti, and the poems have that sense of a text built to be set. One book is a sequence of dispatches from an unnamed conflict; another circles the Grimm brothers. Consistently unsettling and never gratuitous.'
        ],
        readNext: [
            { slug: 'alice-oswald', name: 'Alice Oswald', note: 'English landscape and classical violence.' },
            { slug: 'geoffrey-hill', name: 'Geoffrey Hill', note: 'Atrocity and the ethics of writing it.' },
            { slug: 'matthew-sweeney', name: 'Matthew Sweeney', note: 'Dread narrated flatly.' }
        ]
    },

    'david-shapiro': {
        body: [
            'He published his first book as a teenager and became the youngest member of the second-generation New York School, and the poems keep that precocity — quick, allusive, musical, full of art and philosophy handled lightly.',
            'He was a violinist and an art historian, and wrote monographs on painters. The poems move by association and by pun, and they are more melancholy than the surface velocity suggests. The elegies for his father and the poems about music are the most direct.'
        ],
        readNext: [
            { slug: 'john-ashbery', name: 'John Ashbery', note: 'The obvious elder.' },
            { slug: 'kenneth-koch', name: 'Kenneth Koch', note: 'His teacher, and comic exuberance.' },
            { slug: 'ted-berrigan', name: 'Ted Berrigan', note: 'The centre of that second generation.' }
        ]
    },

    'diane-wakoski': {
        body: [
            'Long, incantatory, first-person poems that use a set of recurring personal mythologies — a motorcycle betrayer, the king of Spain, a missing father, the moon — repeated across books until they take on the weight of legend.',
            'She rejected the label of confessional and called the work a personal mythology, which is a fair distinction: the material is autobiographical and the treatment is deliberately theatrical. The poems about being an unbeautiful woman in a culture that rewards beauty are the most uncomfortable and the most durable.'
        ],
        readNext: [
            { slug: 'anne-sexton', name: 'Anne Sexton', note: 'The performed self in verse.' },
            { slug: 'alice-notley', name: 'Alice Notley', note: 'Personal myth built at length.' },
            { slug: 'jerome-rothenberg', name: 'Jerome Rothenberg', note: 'The deep-image American avant-garde.' }
        ]
    },

    'edward-hirsch': {
        body: [
            'A poet and a rare successful populariser — his book on how to read a poem was a bestseller and is genuinely useful, written from love rather than from pedagogy.',
            'The poems are lyrical, allusive and elegiac, with a strong strain of insomnia, art and Jewish inheritance. The book-length elegy for his son, written in short unrhymed triplets, is the work most readers now come to first: unflinching about addiction and about the failures of a parent, and formally disciplined enough to survive its own grief.'
        ],
        readNext: [
            { slug: 'gerald-stern', name: 'Gerald Stern', note: 'The same ecstatic Jewish American line.' },
            { slug: 'mary-jo-bang', name: 'Mary Jo Bang', note: 'The elegy for a son, handled coldly.' },
            { slug: 'donald-hall', name: 'Donald Hall', note: 'The long elegiac sequence.' }
        ]
    },

    'elinor-wylie': {
        body: [
            'Polished, brittle, technically immaculate lyrics — she liked hard surfaces, and the poems are full of silver, glass, salt, ice and other things that shine and cut.',
            'She was a celebrity for her private life in a way that has always distorted the reading, and the poems themselves are cool and controlled almost to the point of armour. The best of them use that hardness as the subject: how to survive by becoming less penetrable. Read her beside Millay for the contrast in temperature.'
        ],
        readNext: [
            { slug: 'edna-st-vincent-millay', name: 'Edna St. Vincent Millay', note: 'The warmer contemporary.' },
            { slug: 'louise-bogan', name: 'Louise Bogan', note: 'The same reticence, more severe.' },
            { slug: 'sara-teasdale', name: 'Sara Teasdale', note: 'The plain lyric of the period.' }
        ]
    },

    'elizabeth-spires': {
        body: [
            'Quiet, formally careful poems about childhood, motherhood, mortality and religious doubt, in a plain register that rarely raises its voice and never overstates.',
            'She writes well about places — Ohio, the Maryland shore, Italy — and about paintings and historical figures approached as neighbours rather than as subjects. She has also written for children. A poet of the middle register, doing it very well, at a moment when that has been unfashionable.'
        ],
        readNext: [
            { slug: 'linda-pastan', name: 'Linda Pastan', note: 'The domestic lyric at similar scale.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'Quiet with a darker undertow.' },
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: 'Observation carrying the feeling.' }
        ]
    },

    'franklin-pierce-adams': {
        body: [
            'A newspaper columnist whose daily column was the centre of literary New York for two decades, and whose own contributions were light verse — parodies, epigrams, versified complaints about the subway and the weather.',
            'He is remembered for eight lines about a baseball double play that put three infielders permanently into the language. The column mattered more than the verse: he printed early work by writers who became famous, and being run there was a career event. Read as a document of what a literary public looked like when a newspaper could be one.'
        ],
        readNext: [
            { slug: 'dorothy-parker', name: 'Dorothy Parker', note: 'The wit he helped make famous.' },
            { slug: 'margaret-fishback', name: 'Margaret Fishback', note: 'The same light-verse economy.' },
            { slug: 'louis-untermeyer', name: 'Louis Untermeyer', note: 'The taste-making anthologist of the era.' }
        ]
    },

    'george-moses-horton': {
        body: [
            'He was enslaved in North Carolina and published poems while still enslaved — selling love lyrics to university students who wanted verses for their sweethearts, and using the money in an attempt to buy his freedom.',
            'The poems are formally conventional, in the hymn and ballad measures available to him, and several state the case against slavery directly in a voice that had to be careful. That combination — polite eighteenth-century diction carrying an unanswerable argument — is the thing to notice. He gained his freedom at the end of the Civil War.'
        ],
        readNext: [
            { slug: 'phillis-wheatley', name: 'Phillis Wheatley', note: 'The first African American poet in print.' },
            { slug: 'frances-ellen-watkins-harper', name: 'Frances Ellen Watkins Harper', note: 'The abolitionist poem at its most public.' },
            { slug: 'paul-laurence-dunbar', name: 'Paul Laurence Dunbar', note: 'The generation after emancipation.' }
        ]
    },

    'georgia-douglas-johnson': {
        body: [
            'A central figure of the Harlem Renaissance who ran a weekly salon in Washington for twenty years — Hughes, Toomer, Hurston and others passed through her house — while publishing her own poems and plays.',
            'The verse is formally traditional and thematically bold for its moment: poems about the constrained lives of women, about being Black and a woman at once, and about longing described without euphemism. Her antilynching plays were too dangerous for most theatres to stage. The salon is part of the achievement, not a footnote to it.'
        ],
        readNext: [
            { slug: 'jean-toomer', name: 'Jean Toomer', note: 'One of the writers who passed through her salon.' },
            { slug: 'alice-moore-dunbar-nelson', name: 'Alice Moore Dunbar-Nelson', note: 'The same generation and constraints.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'The Harlem Renaissance at its most audible.' }
        ]
    },

    'gregory-orr': {
        body: [
            'He killed his younger brother in a hunting accident as a boy, and has written about it directly for fifty years — the fact is central to the work and he has never treated it as private.',
            'The early poems are short, imagistic and stunned; the later books turn to a sustained argument, in hundreds of small untitled lyrics, that poetry is what makes a survivable order out of disorder. His prose on that idea is widely read. The poems are plain, repetitive and quietly insistent, and the repetition is the point.'
        ],
        readNext: [
            { slug: 'jean-valentine', name: 'Jean Valentine', note: 'The short poem full of silence.' },
            { slug: 'stanley-kunitz', name: 'Stanley Kunitz', note: 'His teacher, and the same long reckoning.' },
            { slug: 'franz-wright', name: 'Franz Wright', note: 'Damage written short.' }
        ]
    },

    'inger-christensen': {
        body: [
            'A Danish poet, read in translation, whose major books are built on mathematical structures — one sequence expands according to the Fibonacci series, so each section is as long as the previous two combined.',
            'That sounds arid and produces the opposite: a hypnotic catalogue of things that exist, written under the shadow of nuclear weapons and ecological loss, where the accumulating length becomes an argument about abundance and its destruction. Another book is a sonnet cycle of fifteen sonnets built to a strict interlocking pattern. Among the great European poems of the last century.'
        ],
        readNext: [
            { slug: 'tomas-transtrmer', name: 'Tomas Tranströmer', note: 'The Scandinavian contemporary.' },
            { slug: 'alice-fulton', name: 'Alice Fulton', note: 'Mathematics as a theory of poetic form.' },
            { slug: 'ronald-johnson', name: 'Ronald Johnson', note: 'The long constructed visionary poem.' }
        ]
    },

    'james-longenbach': {
        body: [
            'A poet and one of the best critics of modern poetry writing in his generation — his books on the line, on the resistance to poetry and on Pound and Stevens are unusually useful because they are written by somebody making the thing he describes.',
            'The poems are quiet, syntactically elegant and preoccupied with music, painting and mortality. The late book written during terminal illness is direct and unadorned. Read a critical book and a collection together; each explains the other more than most poet-critics manage.'
        ],
        readNext: [
            { slug: 'wallace-stevens', name: 'Wallace Stevens', note: 'The poet he wrote about best.' },
            { slug: 'james-schuyler', name: 'James Schuyler', note: 'The quiet observational lyric.' },
            { slug: 'stephanie-burt', name: 'Stephanie Burt', note: 'The other contemporary critic-poet here.' }
        ]
    },

    'james-mcmichael': {
        body: [
            'A poet of long, discursive, essayistic poems that move slowly through history, family and place with almost no lyric heightening — one book-length poem takes in the Industrial Revolution, his mother\'s death and his own childhood in the same unhurried voice.',
            'The influence is more from prose than from other poets, and the demand on the reader is patience rather than decoding. When it works the accumulation produces something no shorter poem could reach. Read a whole poem in one sitting or not at all.'
        ],
        readNext: [
            { slug: 'a-r-ammons', name: 'A. R. Ammons', note: 'The long poem as a process.' },
            { slug: 'robert-hass', name: 'Robert Hass', note: 'The prose-adjacent Californian line.' },
            { slug: 'john-koethe', name: 'John Koethe', note: 'The long meditative American poem.' }
        ]
    },

    'james-weldon-johnson': {
        body: [
            'He wrote the words to a song that became known as the Black national anthem, edited the first major anthology of African American poetry, ran the NAACP, and served as a United States consul. The poems sit inside a very full life.',
            'His central book renders seven Black sermons as verse — the creation, the crucifixion, a funeral — capturing the cadence and imagery of the preachers he had heard without using dialect spelling, which he argued had become a trap. That decision, argued in his preface, is one of the most consequential in African American poetics.'
        ],
        readNext: [
            { slug: 'paul-laurence-dunbar', name: 'Paul Laurence Dunbar', note: 'The dialect problem he was answering.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'The next solution to the same question.' },
            { slug: 'jean-toomer', name: 'Jean Toomer', note: 'The Harlem Renaissance at its most experimental.' }
        ]
    },

    'jean-toomer': {
        body: [
            'His single essential book mixes poems, sketches and drama into a portrait of the rural Georgia he had briefly taught in and of Black urban life in Washington and Chicago — a form nobody had used before and he never repeated.',
            'The poems inside it are spare, musical and heavily influenced by imagism and by the spirituals. He spent the rest of his life in spiritual movements, largely stopped publishing, and resisted being categorised racially at all, which complicated his place in the Harlem Renaissance then and now. The book is the achievement and it is complete in itself.'
        ],
        readNext: [
            { slug: 'james-weldon-johnson', name: 'James Weldon Johnson', note: 'The generation just ahead.' },
            { slug: 'georgia-douglas-johnson', name: 'Georgia Douglas Johnson', note: 'Whose salon he attended.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Rural and urban Black life in verse.' }
        ]
    },

    'john-berryman': {
        body: [
            'His major work is a sequence of nearly four hundred eighteen-line poems spoken by a character called Henry — a version of himself in the third person, interrupted by an unnamed friend who calls him Mr Bones and speaks in minstrel dialect.',
            'That device is the difficulty and the achievement: it lets him write about grief, drink, lust and his father\'s suicide with a syntax broken and reassembled until it sounds like nobody else. The dialect borrowings are uncomfortable and are part of any honest reading. He died by suicide; the late religious poems are the quietest thing he wrote.'
        ],
        readNext: [
            { slug: 'robert-lowell', name: 'Robert Lowell', note: 'His friend, and the same generation of wreckage.' },
            { slug: 'delmore-schwartz', name: 'Delmore Schwartz', note: 'The friend he elegised repeatedly.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The broken syntax he learned from.' }
        ]
    },

    'john-haines': {
        body: [
            'He homesteaded in Alaska for more than twenty years — trapping, hunting, building — and the poems come out of that directly: snow, animals, silence, and a landscape indifferent to whether anyone survives it.',
            'The verse is spare and image-driven, with a mythic undertow that the plainness keeps from becoming grandiose. He is unsentimental about wilderness in a way that later nature poetry often is not. The prose memoir of those years is the companion piece and is the more famous book.'
        ],
        readNext: [
            { slug: 'gary-snyder', name: 'Gary Snyder', note: 'Work in wild country as a practice.' },
            { slug: 'william-e-stafford', name: 'William E. Stafford', note: 'Plain western attention.' },
            { slug: 'robinson-jeffers', name: 'Robinson Jeffers', note: 'Nature without human consolation.' }
        ]
    },

    'john-wilmot-earl-of-rochester': {
        body: [
            'A Restoration courtier and libertine whose verse is obscene, brilliantly made and philosophically serious in about that order — the satires on reason, on the court and on himself are as sharp as anything in the language.',
            'The pornographic poems are genuinely pornographic and were suppressed for centuries; they are also formally immaculate, which is part of the joke. Underneath the libertinism is a real nihilism about human motive. He died at thirty-three, reportedly after a deathbed conversion that his contemporaries argued about for decades.'
        ],
        readNext: [
            { slug: 'john-dryden', name: 'John Dryden', note: 'The dominant poet he quarrelled with.' },
            { slug: 'sir-john-suckling', name: 'Sir John Suckling', note: 'The Cavalier cynicism just before.' },
            { slug: 'jonathan-swift', name: 'Jonathan Swift', note: 'Disgust made into satire, later.' }
        ]
    },

    'jonathan-galassi': {
        body: [
            'A publisher first — for decades at the head of a major literary house — and a translator of Eugenio Montale and Giacomo Leopardi whose versions are the standard English editions.',
            'His own poems are formally careful, urbane and increasingly direct about a life reconsidered in middle age, including coming out later than most. The publishing world is a subject in the novel he wrote, and lightly present in the poems. Read the Montale first; the translations are the larger contribution.'
        ],
        readNext: [
            { slug: 'michael-hofmann', name: 'Michael Hofmann', note: 'The other poet-translator of that stature.' },
            { slug: 'geoffrey-brock', name: 'Geoffrey Brock', note: 'Italian poetry in contemporary English.' },
            { slug: 'james-laughlin', name: 'James Laughlin', note: 'The publisher-poet before him.' }
        ]
    },

    'joshua-clover': {
        body: [
            'A Marxist critic and poet whose verse is dense, referential and openly political — riots, capital, pop songs and film theory in the same stanza, with the argument never far below the surface.',
            'The early books are more lyrical and the later ones more polemical; his prose on riots and strikes is read well outside poetry. He is a deliberately combative figure. Whether the poems survive the politics is exactly the question the poems want you to be asking.'
        ],
        readNext: [
            { slug: 'charles-bernstein', name: 'Charles Bernstein', note: 'Language writing as political argument.' },
            { slug: 'juliana-spahr', name: 'Juliana Spahr', note: 'Politics and experimental form together.' },
            { slug: 'michael-robbins', name: 'Michael Robbins', note: 'Pop culture at speed.' }
        ]
    },

    'joyce-carol-oates': {
        body: [
            'Enormously prolific in every genre, and the poems are the least known part of it — sharp, unsettling, often violent, and closer to her short fiction than to any lyric tradition.',
            'The subjects are the body, damage, American violence and family, handled with the same refusal to look away that the novels are known for. The verse is uneven, as a body of work produced at that volume will be, and the best of it has an unnerving flatness. Read as a companion to the fiction rather than instead of it.'
        ],
        readNext: [
            { slug: 'ai', name: 'Ai', note: 'Violence given a voice and no comment.' },
            { slug: 'laura-kasischke', name: 'Laura Kasischke', note: 'Domestic dread from a novelist-poet.' },
            { slug: 'sylvia-plath', name: 'Sylvia Plath', note: 'The controlled fury she has written about.' }
        ]
    },

    'joyelle-mcsweeney': {
        body: [
            'Her term for what she does is the necropastoral: a poetics of decay, contamination, plague and the grotesque, set against the idea that nature is clean and separate from culture.',
            'The writing is fast, baroque and deliberately excessive, moving between poem, play, essay and fiction. A book written after the death of her infant daughter turns that aesthetic on grief without softening it. She co-founded a press that has published a great deal of translated experimental writing. Not for readers who want the poem to behave.'
        ],
        readNext: [
            { slug: 'daniel-borzutzky', name: 'Daniel Borzutzky', note: 'The grotesque as political method.' },
            { slug: 'will-alexander', name: 'Will Alexander', note: 'Language at maximum pressure.' },
            { slug: 'lucie-brock-broido', name: 'Lucie Brock-Broido', note: 'Extravagance in the service of grief.' }
        ]
    },

    'juan-ramn-jimnez': {
        body: [
            'A Spanish poet whose early work is musical and heavily ornamented and whose mature work strips all of it away in pursuit of what he called naked poetry — the thing itself, with nothing added.',
            'He is best known outside Spain for a prose book about a writer and his donkey, read by generations of schoolchildren, which undersells him badly. He went into exile after the civil war and never returned. He received the Nobel Prize in Literature. Lorca\'s generation treated him as the essential precursor.'
        ],
        readNext: [
            { slug: 'antonio-machado', name: 'Antonio Machado', note: 'His great Spanish contemporary.' },
            { slug: 'federico-garca-lorca', name: 'Federico García Lorca', note: 'The generation that followed him.' },
            { slug: 'cesare-pavese', name: 'Cesare Pavese', note: 'The plain European line of the same decades.' }
        ]
    },

    'kenn-nesbitt': {
        body: [
            'A children\'s poet whose work is built for the classroom read-aloud — short, rhymed, reliably funny poems about school, pets, homework and the small anarchies children actually find funny.',
            'The craft is in the metre, which never trips a young reader, and in the punchline, which is always in the last line. He served as national Children\'s Poet Laureate and has done a great deal of practical work on getting poems in front of children who have decided they dislike poetry.'
        ],
        readNext: [
            { slug: 'jack-prelutsky', name: 'Jack Prelutsky', note: 'The master of this exact form.' },
            { slug: 'bruce-lansky', name: 'Bruce Lansky', note: 'The anthologist of that shelf.' },
            { slug: 'j-patrick-lewis', name: 'J. Patrick Lewis', note: 'Children\'s verse with a wider range.' }
        ]
    },

    'kenneth-fearing': {
        body: [
            'Depression-era poems written in the voice of advertising, radio and the newspaper — slogans, headlines and sales patter cut together until the whole American commercial surface sounds like a death notice.',
            'The most famous is an obituary for a man whose life is summarised entirely in the noises of the city and the language of the ticker. He also wrote hard-boiled novels, one of them filmed twice. The technique — appropriating commercial speech to indict it — was decades ahead of its reputation.'
        ],
        readNext: [
            { slug: 'carl-sandburg', name: 'Carl Sandburg', note: 'The American city in the same decades.' },
            { slug: 'charles-reznikoff', name: 'Charles Reznikoff', note: 'Found language as poetic method.' },
            { slug: 'harryette-mullen', name: 'Harryette Mullen', note: 'Commercial language turned inside out.' }
        ]
    },

    'landis-everson': {
        body: [
            'He was part of the Berkeley Renaissance around Spicer and Duncan in the 1940s, stopped writing entirely for roughly forty years, and resumed in his seventies after an editor tracked him down.',
            'The late poems are light, clear and unhurried, with a formal ease that the long silence did not damage; they won a first-book award for a man in his eighties. Read them alongside the early Berkeley work for one of the odder shapes a poetic career has taken.'
        ],
        readNext: [
            { slug: 'jack-spicer', name: 'Jack Spicer', note: 'His Berkeley contemporary.' },
            { slug: 'robert-duncan', name: 'Robert Duncan', note: 'The third of that circle.' },
            { slug: 'ruth-stone', name: 'Ruth Stone', note: 'Another recognition arriving very late.' }
        ]
    },

    'les-murray': {
        body: [
            'The dominant Australian poet of his generation: rural, Catholic, combative, and committed to the idea that a farm in New South Wales is as legitimate a subject as anything in Europe.',
            'The verse is dense, alliterative and full of invented compounds, and it can be as difficult as anything modernist while being written in defence of ordinary country people against what he called the metropolitan sneer. He wrote a whole book in the voices of animals and a verse novel in sonnets. The politics were often ugly and the ear was extraordinary.'
        ],
        readNext: [
            { slug: 'kenneth-slessor', name: 'Kenneth Slessor', note: 'The Australian generation before.' },
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'Rural material at the same level of craft.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The compound-word music behind it.' }
        ]
    },

    'lucie-brock-broido': {
        body: [
            'An extravagant stylist — the diction is archaic, ornate and deliberately excessive, and the poems refuse the plain contemporary manner at every opportunity.',
            'She described her mode as a personal elegy conducted in borrowed dress, and the books circle death, a murdered child, a father, historical figures spoken through. The difficulty is real and is not obscurity for its own sake: the ornament is armour around material she is not going to state plainly. She taught for decades and her students are visible throughout contemporary American poetry.'
        ],
        readNext: [
            { slug: 'mary-jo-bang', name: 'Mary Jo Bang', note: 'Grief handled through style.' },
            { slug: 'karen-volkman', name: 'Karen Volkman', note: 'The abstract ornate lyric.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The figure she wrote a whole book towards.' }
        ]
    },

    'major-jackson': {
        body: [
            'Formally assured poems that move between Philadelphia childhood, art, travel, race and love, in a line that keeps a strong musical pulse without settling into fixed metre.',
            'One long poem is a book-length letter in tercets, a running commentary on American life, celebrity and poetry itself. He works comfortably in received forms and in loose ones, and the range of reference — hip-hop, painting, philosophy — is worn without strain. An unusually sociable body of work: it addresses people.'
        ],
        readNext: [
            { slug: 'terrance-hayes', name: 'Terrance Hayes', note: 'His contemporary in formal invention.' },
            { slug: 'yusef-komunyakaa', name: 'Yusef Komunyakaa', note: 'The musical ear and the elder.' },
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'The city rendered formally.' }
        ]
    },

    'matthew-zapruder': {
        body: [
            'Plain, wandering poems that think aloud — they start with something ordinary, admit they do not know where they are going, and arrive somewhere unexpectedly moving without any change of tone.',
            'The influence of Polish poetry and of the New York School is audible. His book arguing about why poetry is difficult, and why it mostly is not, is a good companion. The risk in the mode is preciousness and the best poems avoid it by being genuinely funny about their own uncertainty.'
        ],
        readNext: [
            { slug: 'bob-hicok', name: 'Bob Hicok', note: 'Digression handled at greater speed.' },
            { slug: 'james-tate', name: 'James Tate', note: 'The deadpan turn.' },
            { slug: 'adam-zagajewski', name: 'Adam Zagajewski', note: 'The Polish plainness he learned from.' }
        ]
    },

    'maureen-n-mclane': {
        body: [
            'A poet and a scholar of Romanticism, and the two practices are visibly connected: the poems keep asking what a lyric is for, and answer by writing one anyway.',
            'The verse is spare, quick and often in very short lines, mixing high literary reference with hiking, weather, sex and the internet. Her prose memoir told through the poems she has read is an unusual and successful hybrid. Read for the intelligence of the movement rather than for a subject.'
        ],
        readNext: [
            { slug: 'anne-carson', name: 'Anne Carson', note: 'Scholarship and lyric in one practice.' },
            { slug: 'stephanie-burt', name: 'Stephanie Burt', note: 'The critic-poet of the same generation.' },
            { slug: 'lorine-niedecker', name: 'Lorine Niedecker', note: 'The very short line handled seriously.' }
        ]
    },

    'meena-alexander': {
        body: [
            'Born in India, raised partly in Sudan, educated in England and settled in New York, she wrote about that dispersal without ever resolving it into a single story of arrival.',
            'The poems are lyrical, fragmentary and full of place names, and they are preoccupied with violence — communal, colonial, domestic — and with the difficulty of writing a self in a language acquired under empire. Her prose memoir is the clearest guide. The late poems are the most direct.'
        ],
        readNext: [
            { slug: 'agha-shahid-ali', name: 'Agha Shahid Ali', note: 'The South Asian American lyric.' },
            { slug: 'nathalie-handal', name: 'Nathalie Handal', note: 'Displacement across several languages.' },
            { slug: 'marilyn-chin', name: 'Marilyn Chin', note: 'Inheritance and English.' }
        ]
    },

    'monica-youn': {
        body: [
            'A former lawyer whose poems are structured like arguments — precise, controlled, working through a conceit or a legal term with a rigour that eventually turns it strange.',
            'One book takes a legal placeholder term for an anonymous piece of land and uses it to think about property, inheritance and infertility. Another works through a set of variations on a single figure. The subjects include race, Korean American identity and the machinery of law. Cool on the surface and precisely engineered underneath.'
        ],
        readNext: [
            { slug: 'solmaz-sharif', name: 'Solmaz Sharif', note: 'Official vocabulary turned against itself.' },
            { slug: 'srikanth-reddy', name: 'Srikanth Reddy', note: 'Procedure applied to political language.' },
            { slug: 'cathy-park-hong', name: 'Cathy Park Hong', note: 'The same generation and questions.' }
        ]
    },

    'natalie-shapero': {
        body: [
            'Wry, fast, morbid poems with a comic timing that keeps landing on mortality — the tone is somewhere between a stand-up set and a suicide note, and the poems know it.',
            'She is also a lawyer, and there is a lawyer\'s precision in how a poem sets up its terms before knocking them over. Motherhood, illness, the body and American violence recur. The jokes are the point of entry and the second reading is the one that hurts.'
        ],
        readNext: [
            { slug: 'monica-youn', name: 'Monica Youn', note: 'The other lawyer-poet here.' },
            { slug: 'mary-ruefle', name: 'Mary Ruefle', note: 'The comic turn into the abyss.' },
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'Compression with a dry edge.' }
        ]
    },

    'osip-mandelstam': {
        body: [
            'One of the great Russian poets of the century, and the one whose death is inseparable from his work: he wrote a sixteen-line epigram about Stalin, read it aloud to a few people, and died in a transit camp on the way to the Gulag.',
            'The poems are dense, allusive and musically exact, moving between classical antiquity, Petersburg and the Voronezh exile where the late notebooks were written. His widow memorised the unpublished poems to keep them alive and later wrote two of the great memoirs of the period. Read her books alongside the poems.'
        ],
        readNext: [
            { slug: 'marina-tsvetaeva', name: 'Marina Tsvetaeva', note: 'The same generation and catastrophe.' },
            { slug: 'anna-akhmatova', name: 'Anna Akhmatova', note: 'His friend, and the other great survivor.' },
            { slug: 'paul-celan', name: 'Paul Celan', note: 'Who translated him and claimed him as a brother.' }
        ]
    },

    'philip-appleman': {
        body: [
            'A scholar of Darwin who edited the standard teaching edition, and a poet whose verse is humanist, sceptical and frequently very funny about religion.',
            'The poems argue: against creationism, against consolation, for a moral life without a deity, in a plain conversational line that never lectures for long before making a joke. He also wrote love poems of considerable tenderness. A poet with an argument, which was unfashionable, and he made it well.'
        ],
        readNext: [
            { slug: 'howard-nemerov', name: 'Howard Nemerov', note: 'Wit as a philosophical instrument.' },
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'Unbelief handled with more dread.' },
            { slug: 'jennifer-michael-hecht', name: 'Jennifer Michael Hecht', note: 'The poet-historian of doubt.' }
        ]
    },

    'prageeta-sharma': {
        body: [
            'Elliptical, syntactically restless poems about race, institutional life, marriage and grief, written in a register that keeps refusing to settle into either lyric warmth or experimental coldness.',
            'The book written after her husband\'s death is the most direct, and it handles both the loss and the racism she encountered in the academic town they lived in without separating the two. She has taught and directed programmes for years. Read a full book; the tone accumulates.'
        ],
        readNext: [
            { slug: 'bhanu-kapil', name: 'Bhanu Kapil', note: 'The South Asian experimental line.' },
            { slug: 'meena-alexander', name: 'Meena Alexander', note: 'Displacement and the lyric.' },
            { slug: 'brenda-shaughnessy', name: 'Brenda Shaughnessy', note: 'Grief and syntax under pressure.' }
        ]
    },

    'queen-elizabeth-i': {
        body: [
            'She wrote verse, and it is worth reading for reasons that are not only historical. The poems are short, formally competent and unusually revealing for somebody whose entire public method was concealment.',
            'One responds to a rejected suitor; another, written on a window with a diamond, answers a courtier\'s complaint in two lines. The most striking is about being ruled by an inner passion she will not name. She also translated Boethius and Horace. A monarch who understood exactly how much a poem could be made to say and no more.'
        ],
        readNext: [
            { slug: 'sir-walter-ralegh', name: 'Sir Walter Ralegh', note: 'The courtier who wrote to and about her.' },
            { slug: 'mary-sidney-herbert-countess-of-pembroke', name: 'Mary Sidney Herbert', note: 'The other great woman writer of that court.' },
            { slug: 'sir-philip-sidney', name: 'Sir Philip Sidney', note: 'The Elizabethan courtier poet as ideal.' }
        ]
    },

    'randall-jarrell': {
        body: [
            'The most feared and most generous critic of his generation — he could destroy a book in a sentence and was also the reader who established Frost, Bishop and Whitman for a whole cohort.',
            'The poems are quieter than the criticism\'s reputation suggests: monologues spoken by women in supermarkets and libraries, children, soldiers. The five-line poem about a ball turret gunner is the most anthologised American war poem and is over before you have braced for it. He also wrote a comic academic novel and translated Rilke.'
        ],
        readNext: [
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: 'The poet he championed earliest.' },
            { slug: 'robert-lowell', name: 'Robert Lowell', note: 'His friend and contemporary.' },
            { slug: 'karl-shapiro', name: 'Karl Shapiro', note: 'The other poet of that war.' }
        ]
    },

    'richard-blanco': {
        body: [
            'He read at a presidential inauguration — the first Latino, immigrant and openly gay poet to do so — and the occasional poems written for public moments are a real part of the work rather than an interruption to it.',
            'The rest is about a Cuban American childhood in Miami, a family that never stopped talking about an island he had never seen, and the difficulty of being gay inside it. He trained as a civil engineer. The poems are narrative, warm and accessible, and the best of them are about not fitting the story you were handed.'
        ],
        readNext: [
            { slug: 'elizabeth-alexander', name: 'Elizabeth Alexander', note: 'The inaugural poem and its problems.' },
            { slug: 'margarita-engle', name: 'Margarita Engle', note: 'Cuban American history in verse.' },
            { slug: 'rigoberto-gonzlez', name: 'Rigoberto González', note: 'Queer Latino poetry alongside him.' }
        ]
    },

    'spencer-reece': {
        body: [
            'He worked in retail for years, published late, and later became an Episcopal priest — and the poems have that shape: patient, observant, unhurried, written by somebody used to watching people at a counter.',
            'The long autobiographical poem about a department store clerk is the best-known. Later work comes out of his time at an orphanage in Honduras and from parish life. The register is quiet and the subject is usually loneliness. He is unembarrassed by faith and never uses it to close a poem early.'
        ],
        readNext: [
            { slug: 'george-herbert', name: 'George Herbert', note: 'The priest-poet tradition.' },
            { slug: 'james-schuyler', name: 'James Schuyler', note: 'Patient observation as method.' },
            { slug: 'mark-doty', name: 'Mark Doty', note: 'The gay lyric of the same generation.' }
        ]
    },

    'srikanth-reddy': {
        body: [
            'One of his books is an erasure: he took the memoirs of a former UN Secretary-General later revealed to have concealed his wartime service in a Nazi unit, and carved a confessional monologue out of the man\'s own evasive prose.',
            'That is the method in general — procedure applied to political language until it says what it was constructed to avoid saying. Other books are quieter and more meditative, working in prose blocks and long philosophical sequences. He is a scholar as well, and the poems assume a reader willing to think slowly.'
        ],
        readNext: [
            { slug: 'ronald-johnson', name: 'Ronald Johnson', note: 'Erasure at its most audacious.' },
            { slug: 'monica-youn', name: 'Monica Youn', note: 'Legal and official language as material.' },
            { slug: 'solmaz-sharif', name: 'Solmaz Sharif', note: 'The state\'s vocabulary turned around.' }
        ]
    },

    'stephen-dobyns': {
        body: [
            'A poet and crime novelist whose verse is narrative, fast and frequently comic, built on a device he uses constantly: a hypothetical situation proposed and then followed to an absurd or terrible conclusion.',
            'The recurring figure across one long sequence is a bewildered everyman used to think about death, sex and stupidity. He writes plainly, at length, and with a novelist\'s appetite for incident. His book of essays on poetry is unusually practical about how a poem actually gets made.'
        ],
        readNext: [
            { slug: 'russell-edson', name: 'Russell Edson', note: 'The absurd premise followed to the end.' },
            { slug: 'thomas-lux', name: 'Thomas Lux', note: 'Comedy with a hard floor.' },
            { slug: 'charles-simic', name: 'Charles Simic', note: 'The plain sentence carrying the impossible.' }
        ]
    },

    'sydney-lea': {
        body: [
            'A New England poet of hunting, fishing, dogs and rural neighbours, writing long narrative poems in a conversational voice that takes its time and trusts the story.',
            'The mode is traditional and the sympathies are with people the literary world does not usually notice — guides, farmers, drinkers, the recently dead. He founded and edited a well-regarded literary review, and served as poet laureate of Vermont. Read a long poem whole; the shape depends on the accumulation.'
        ],
        readNext: [
            { slug: 'wesley-mcnair', name: 'Wesley McNair', note: 'Rural New England in the same register.' },
            { slug: 'donald-hall', name: 'Donald Hall', note: 'The New Hampshire farm from inside.' },
            { slug: 'robert-frost', name: 'Robert Frost', note: 'The New England narrative poem.' }
        ]
    },

    'thomas-gray': {
        body: [
            'He published very little and one poem of his is among the most quoted in English — an evening in a country churchyard, thinking about the people buried there who never got the chance to become anybody.',
            'That elegy is a technical marvel: quatrains of perfect balance, a vocabulary of extraordinary restraint, and an argument about obscurity that ends by imagining the poet\'s own epitaph. The rest of the work is odder and more learned — Pindaric odes, Norse and Welsh imitations — and much less read. A scholar who wrote one indispensable poem.'
        ],
        readNext: [
            { slug: 'william-cowper', name: 'William Cowper', note: 'The quiet English interior after him.' },
            { slug: 'samuel-johnson', name: 'Samuel Johnson', note: 'The moral verse of the same decades.' },
            { slug: 'william-wordsworth', name: 'William Wordsworth', note: 'Who argued with Gray\'s diction and inherited his subject.' }
        ]
    },

    'thomas-love-peacock': {
        body: [
            'A novelist and satirist whose verse is mostly embedded in his fiction — drinking songs, ballads and parodies sung by characters, several of which are better than the poems his contemporaries wrote in earnest.',
            'He wrote a provocative essay arguing that poetry was a primitive survival with no place in an age of science, which prompted Shelley\'s famous defence. The joke is that Peacock was a good poet making a bad-faith case. Read the songs; they are funny, metrically deft and completely unpretentious.'
        ],
        readNext: [
            { slug: 'percy-bysshe-shelley', name: 'Percy Bysshe Shelley', note: 'His friend, and the reply to his essay.' },
            { slug: 'leigh-hunt', name: 'Leigh Hunt', note: 'The same literary circle.' },
            { slug: 'george-meredith', name: 'George Meredith', note: 'His son-in-law, and another novelist-poet.' }
        ]
    },

    'thomas-sayers-ellis': {
        body: [
            'The poems are typographically restless — words split, doubled, set as signs and shapes — and they draw structurally on go-go music, funk and the visual culture of Washington, D.C., where he grew up.',
            'He co-founded the Dark Room Collective, which brought together a generation of Black poets, and he is also a photographer. The wordplay is dense and political, working on names, slogans and the vocabulary of race in America until the words come apart. Read aloud and look at the page; both are required.'
        ],
        readNext: [
            { slug: 'douglas-kearney', name: 'Douglas Kearney', note: 'The page as performance score.' },
            { slug: 'harryette-mullen', name: 'Harryette Mullen', note: 'Wordplay as structural politics.' },
            { slug: 'amiri-baraka', name: 'Amiri Baraka', note: 'Music and Black poetics.' }
        ]
    },

    'valzhyna-mort': {
        body: [
            'A Belarusian poet writing in Belarusian and in English, whose work is loud, physical and full of a country most of her readers cannot place — one that has spent a century being fought over and renamed.',
            'The poems are dense with folk material, family history and violence, and they move between languages in a way that keeps the English slightly foreign. A recent book is built around Belarusian mass graves and the women who remembered them. The music is the point: read aloud, this is some of the most sonically driven poetry being written.'
        ],
        readNext: [
            { slug: 'marina-tsvetaeva', name: 'Marina Tsvetaeva', note: 'The rhythmic violence she works from.' },
            { slug: 'ilya-kaminsky', name: 'Ilya Kaminsky', note: 'The same region, written as parable.' },
            { slug: 'anna-swir', name: 'Anna Swir', note: 'War and the body, flatly.' }
        ]
    },

    'vera-pavlova': {
        body: [
            'A Russian poet, trained as a musicologist, who writes very short poems — often four to eight lines — about sex, marriage, motherhood and death with an epigrammatic bluntness.',
            'The brevity is the technique: each poem states one thing exactly and refuses to develop it, so a book reads as hundreds of small hard observations rather than as a sequence. The erotic poems are frank without being performative. In English she is read through translations made by her husband, which is worth knowing.'
        ],
        readNext: [
            { slug: 'anna-swir', name: 'Anna Swir', note: 'The body written just as bluntly.' },
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'Compression as a whole method.' },
            { slug: 'samuel-menashe', name: 'Samuel Menashe', note: 'The very short poem taken seriously.' }
        ]
    },

    'walter-de-la-mare': {
        body: [
            'An English poet of the uncanny — empty houses, listeners who do not answer, travellers knocking at doors nobody opens — working in traditional metres that make the strangeness worse rather than safer.',
            'He wrote a great deal for children and is one of the few who did it without condescension; the children\'s poems are as unsettling as the adult ones. The famous poem about a traveller receiving no reply is a masterclass in withholding. Formally conservative, imaginatively very strange indeed.'
        ],
        readNext: [
            { slug: 'edward-thomas', name: 'Edward Thomas', note: 'English quiet with the same undertow.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Ghosts handled in plain metre.' },
            { slug: 'robert-louis-stevenson', name: 'Robert Louis Stevenson', note: 'Poems for children without condescension.' }
        ]
    },

    'zbigniew-herbert': {
        body: [
            'A Polish poet, read in translation, whose recurring figure is a man called Mr Cogito — an ordinary person thinking about history, cowardice, the classics and how to behave when behaving well costs everything.',
            'The poems are ironic, plain and morally exact, drawing constantly on Greek and Roman material to say things about totalitarian Poland that could not be said directly. The most famous ends with an instruction to go where the others went, without hope of reward. Among the essential European poets of the century.'
        ],
        readNext: [
            { slug: 'czeslaw-milosz', name: 'Czeslaw Milosz', note: 'His translator and countryman.' },
            { slug: 'miroslav-holub', name: 'Miroslav Holub', note: 'The same dry deadpan under a regime.' },
            { slug: 'marin-sorescu', name: 'Marin Sorescu', note: 'The parable as political method.' }
        ]
    },

    'alan-seeger': {
        body: [
            'An American who joined the French Foreign Legion in 1914 and was killed on the Somme, leaving one poem that has never left the anthologies — a formal, rhymed declaration of an appointment with death that the poet fully intends to keep.',
            'It is a poem of consent rather than protest, written before the war\'s reputation curdled, and it is beautifully made. The rest of the work is late-Romantic and much less distinctive. Read him next to Owen for the difference between a war entered voluntarily and one endured.'
        ],
        readNext: [
            { slug: 'rupert-brooke', name: 'Rupert Brooke', note: 'The same early idealism.' },
            { slug: 'wilfred-owen', name: 'Wilfred Owen', note: 'The correction.' },
            { slug: 'charles-hamilton-sorley', name: 'Charles Hamilton Sorley', note: 'Who saw through it first.' }
        ]
    },

    'alfred-noyes': {
        body: [
            'He wrote one of the most recitable narrative poems in English — a galloping ballad about a highwayman, a landlord\'s daughter and a redcoat ambush — and it has been memorised by schoolchildren for a century.',
            'The metre is relentless and the story is pure melodrama executed at a very high level. He wrote a great deal else, mostly conservative in form and temperament, and was a vocal opponent of modernism. Read the ballads aloud; that is what they are for and they do not pretend otherwise.'
        ],
        readNext: [
            { slug: 'g-k-chesterton', name: 'G. K. Chesterton', note: 'The same galloping narrative verse.' },
            { slug: 'rudyard-kipling', name: 'Rudyard Kipling', note: 'The recitable ballad at its best.' },
            { slug: 'robert-w-service', name: 'Robert W. Service', note: 'Narrative verse built for performance.' }
        ]
    },

    'amit-majmudar': {
        body: [
            'A diagnostic radiologist who writes formally intricate poems — rhyme, invented stanzas, sustained conceits — about Hindu inheritance, American life, medicine and politics, at a rate that suggests the two careers do not conflict.',
            'He has translated the Bhagavad Gita into verse and written novels and essays. The formal appetite is the distinguishing feature: he will attempt a shape most contemporaries would consider unusable and make it carry contemporary material. Read the poems on the body and on scripture together.'
        ],
        readNext: [
            { slug: 'a-e-stallings', name: 'A. E. Stallings', note: 'Contemporary rhyme with classical ballast.' },
            { slug: 'rafael-campo', name: 'Rafael Campo', note: 'The physician writing in metre.' },
            { slug: 'agha-shahid-ali', name: 'Agha Shahid Ali', note: 'South Asian inheritance in strict form.' }
        ]
    },

    'angela-jackson': {
        body: [
            'A Chicago poet formed by the Black Arts workshop scene of the city, writing in a voice that carries Southern speech, blues and the storytelling of a family that came north.',
            'The poems are musical and frequently spoken by characters — women in particular — and the mode is closer to oral performance than to the page. She has also written plays and novels, and served as poet laureate of Illinois. Read for the voice, which is doing most of the structural work.'
        ],
        readNext: [
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'The Chicago elder, and her subject in a later book.' },
            { slug: 'sonia-sanchez', name: 'Sonia Sanchez', note: 'The Black Arts voice at its most musical.' },
            { slug: 'margaret-walker', name: 'Margaret Walker', note: 'Southern inheritance in formal verse.' }
        ]
    },

    'august-kleinzahler': {
        body: [
            'Sharp, urbane, jazz-inflected poems about cities — San Francisco, New Jersey, wherever he happens to be — with an ear for overheard speech and a dislike of anything that sounds like a poetry reading.',
            'The tone is dry and slightly hostile in a way that turns out to be affectionate. He is a fine prose writer and a famously combative critic. The poems move fast between registers, from a bus stop to a Mahler symphony, and refuse to explain the transition. Read for the sound and the wit.'
        ],
        readNext: [
            { slug: 'thom-gunn', name: 'Thom Gunn', note: 'The San Francisco poem, more formal.' },
            { slug: 'william-matthews', name: 'William Matthews', note: 'Jazz and urbanity in one voice.' },
            { slug: 'basil-bunting', name: 'Basil Bunting', note: 'The mentor figure he has written about.' }
        ]
    },

    'babette-deutsch': {
        body: [
            'A poet, critic and translator whose handbook of poetic terms and whose survey of modern poetry taught several generations, and whose translations from Russian and German introduced English readers to Pushkin, Blok and Rilke.',
            'Her own verse is formally traditional, intelligent and of its period. The lasting contribution is the criticism and the translation, and the poems are best read as the work of somebody who thought hard about how poems are made and could demonstrate it.'
        ],
        readNext: [
            { slug: 'louis-untermeyer', name: 'Louis Untermeyer', note: 'The other great populariser of that era.' },
            { slug: 'marina-tsvetaeva', name: 'Marina Tsvetaeva', note: 'The Russian tradition she translated from.' },
            { slug: 'louise-bogan', name: 'Louise Bogan', note: 'The critic-poet of the same generation.' }
        ]
    },

    'barbara-jane-reyes': {
        body: [
            'A Filipina American poet whose books mix English, Tagalog and Spanish, and use prayer, litany and colonial documents as structures — the poem as a form of talking back to an archive.',
            'The subjects are diaspora, gendered violence, Catholicism and the specific position of Filipina women in American life. The forms are experimental and the anger is direct. She has written about the invisibility of Filipino American writing, and the poems are part of that argument.'
        ],
        readNext: [
            { slug: 'rick-barot', name: 'Rick Barot', note: 'The same inheritance, quieter.' },
            { slug: 'craig-santos-perez', name: 'Craig Santos Perez', note: 'The Pacific and the colonial document.' },
            { slug: 'sarah-gambito', name: 'Sarah Gambito', note: 'Filipina American poetry alongside her.' }
        ]
    },

    'ben-lerner': {
        body: [
            'Known now mainly as a novelist, and he began as a poet — three books whose central subject is the failure of poems to do what they claim, written in a voice that is fluent, ironic and unable to stop qualifying itself.',
            'One is a sequence of prose sonnets built out of misremembered phrases; another works through Topeka and the language of the culture wars. His essay on why people hate poetry is the clearest statement of the project: the poem always falls short of the idea of the poem, and that gap is the subject.'
        ],
        readNext: [
            { slug: 'john-ashbery', name: 'John Ashbery', note: 'The elder he has written about at length.' },
            { slug: 'claudia-rankine', name: 'Claudia Rankine', note: 'The essayistic contemporary poem.' },
            { slug: 'joshua-clover', name: 'Joshua Clover', note: 'Theory and poem in one practice.' }
        ]
    },

    'bill-knott': {
        body: [
            'He published his first book under a pseudonym and announced that the author was dead by suicide, which is a fair introduction to a career spent antagonising the literary world that kept trying to admit him.',
            'The poems are short, surreal, tender and grotesque, often in a single line — he was a master of the one-image poem that lands like a slap. Later he gave books away free online rather than deal with publishers. Wildly uneven by design; the best twenty poems are as good as anything in his generation.'
        ],
        readNext: [
            { slug: 'james-tate', name: 'James Tate', note: 'The same generation of American surrealists.' },
            { slug: 'thomas-lux', name: 'Thomas Lux', note: 'Comedy over a hard floor.' },
            { slug: 'charles-simic', name: 'Charles Simic', note: 'The plain sentence made impossible.' }
        ]
    },

    'c-p-cavafy': {
        body: [
            'A Greek poet of Alexandria who published almost nothing conventionally, printing poems as pamphlets and handing them to friends, and who is now among the most widely read modern European poets.',
            'The poems are short, dry and unmetaphorical, and they do two things: they recreate obscure moments from Hellenistic and Byzantine history as if reporting them, and they record homosexual desire in a city where it had to be discreet, with a frankness that was decades early. The famous ones — the journey to Ithaka, the city that follows you, the barbarians who fail to arrive — are read as parables and were written as history.'
        ],
        readNext: [
            { slug: 'george-seferis', name: 'George Seferis', note: 'The Greek poet who followed him.' },
            { slug: 'thom-gunn', name: 'Thom Gunn', note: 'Desire recorded at a level gaze.' },
            { slug: 'yehuda-amichai', name: 'Yehuda Amichai', note: 'History carried in plain language.' }
        ]
    },

    'carl-dennis': {
        body: [
            'Reflective, conversational poems that behave like the better half of an argument — a proposition is offered, the objection is granted, and the poem ends somewhere more honest than where it began.',
            'The subjects are ordinary and moral: friendship, obligation, what one owes to a neighbour or a stranger or an earlier version of oneself. There is very little imagery and no display. It is a difficult mode to sustain and he has sustained it for decades, which is why the best poems feel like the work of a person rather than a style.'
        ],
        readNext: [
            { slug: 'stephen-dunn', name: 'Stephen Dunn', note: 'The same reflective American register.' },
            { slug: 'william-matthews', name: 'William Matthews', note: 'The talking poem, faster.' },
            { slug: 'philip-appleman', name: 'Philip Appleman', note: 'The argued poem without a deity.' }
        ]
    },

    'carmen-gimnez-smith': {
        body: [
            'Fast, restless poems that mix motherhood, Latina identity, class and rage in a syntax that keeps interrupting itself, and are openly suspicious of the well-made lyric.',
            'One book is a hybrid memoir about her mother\'s illness and immigration; another is an extended argument with the American literary establishment about who gets to be a difficult poet. She has been an editor and publisher of experimental writing, and that curatorial work is part of the same project.'
        ],
        readNext: [
            { slug: 'prageeta-sharma', name: 'Prageeta Sharma', note: 'Institutional life and race handled elliptically.' },
            { slug: 'cathy-park-hong', name: 'Cathy Park Hong', note: 'The same argument, in essays and poems.' },
            { slug: 'brenda-shaughnessy', name: 'Brenda Shaughnessy', note: 'Motherhood and syntax under pressure.' }
        ]
    },

    'cathy-park-hong': {
        body: [
            'Her poems use invented and hybrid languages — a book written in a fictional creole spoken in a border town, another in the voices of tourists and guides in an imaginary desert city — to think about empire, tourism and English itself.',
            'The verse is dense, comic and deliberately grating. She is now more widely known for a book of essays on Asian American consciousness, and the essays clarify what the poems were doing: refusing the well-behaved immigrant lyric in favour of something abrasive and strange.'
        ],
        readNext: [
            { slug: 'marilyn-chin', name: 'Marilyn Chin', note: 'The combative Asian American lyric.' },
            { slug: 'monica-youn', name: 'Monica Youn', note: 'Precision engineering on the same questions.' },
            { slug: 'harryette-mullen', name: 'Harryette Mullen', note: 'Invented language as method.' }
        ]
    },

    'charles-lamb': {
        body: [
            'An essayist first, and the verse is slighter — but the poem about old familiar faces, a plain list of the dead and departed with a repeated refrain, is one of the most affecting short poems of the period.',
            'His life was marked by a family catastrophe he never discussed publicly in verse and never escaped, and the poems that touch it do so obliquely. He wrote with his sister a retelling of Shakespeare for children that has never gone out of print. Read the essays first; the poems make more sense after them.'
        ],
        readNext: [
            { slug: 'samuel-taylor-coleridge', name: 'Samuel Taylor Coleridge', note: 'His schoolfriend and lifelong correspondent.' },
            { slug: 'leigh-hunt', name: 'Leigh Hunt', note: 'The same literary circle.' },
            { slug: 'william-cowper', name: 'William Cowper', note: 'The quiet English interior before them.' }
        ]
    },

    'charlotte-smith': {
        body: [
            'She revived the English sonnet almost single-handedly at the end of the eighteenth century, publishing a book of elegiac sonnets that went through edition after edition and that Wordsworth and Coleridge both read closely.',
            'The poems are melancholy, seaside, and unashamedly personal — she wrote to support her children after a disastrous marriage, and the debt and the misery are in the verse. Her long blank-verse poems on emigration and on the beach are radical about the French Revolution and about her own poverty. A major precursor whose reputation vanished for a century.'
        ],
        readNext: [
            { slug: 'william-wordsworth', name: 'William Wordsworth', note: 'Who read her carefully and said so.' },
            { slug: 'anna-ltitia-barbauld', name: 'Anna Lætitia Barbauld', note: 'Her contemporary in radical English verse.' },
            { slug: 'john-clare', name: 'John Clare', note: 'The next generation of exact natural detail.' }
        ]
    },

    'chen-chen': {
        body: [
            'Warm, funny, digressive poems about being a gay Chinese American son, a boyfriend, a person on the internet, written in a voice that sounds like talking and is timed like stand-up.',
            'The humour carries real material: a mother who cannot accept him, immigration, the exhaustion of explaining oneself. The titles are long and jokey and the endings are frequently tender in a way the setup does not prepare you for. One of the most widely read younger American poets, and the accessibility is a choice rather than a limit.'
        ],
        readNext: [
            { slug: 'ocean-vuong', name: 'Ocean Vuong', note: 'The same inheritance in a lusher register.' },
            { slug: 'ross-gay', name: 'Ross Gay', note: 'Delight as a serious discipline.' },
            { slug: 'hieu-minh-nguyen', name: 'Hieu Minh Nguyen', note: 'Queer Asian American poetry alongside him.' }
        ]
    },

    'christopher-middleton': {
        body: [
            'A British poet and one of the major translators from German of his century — Robert Walser, Nietzsche, Trakl, Christa Wolf — who spent most of his working life teaching in Texas.',
            'His own poems are experimental, learned and deliberately outside the English mainstream: surrealist procedures, prose poems, and a diction that borrows freely from other languages. He is a poet\'s poet in the exact sense — little read generally, and consistently important to other writers. Start with the prose poems.'
        ],
        readNext: [
            { slug: 'michael-hofmann', name: 'Michael Hofmann', note: 'The next great translator from German.' },
            { slug: 'tom-raworth', name: 'Tom Raworth', note: 'British experimental poetry of the same decades.' },
            { slug: 'russell-edson', name: 'Russell Edson', note: 'The prose poem as its own genre.' }
        ]
    },

    'ciaran-carson': {
        body: [
            'A Belfast poet who wrote in a very long line — much longer than the page comfortably holds — that he took from traditional Irish storytelling and from the rhythm of a session tune.',
            'The subject is Belfast during the Troubles: streets, checkpoints, demolished pubs, and the way a city\'s map becomes a record of violence. He was a traditional musician and wrote about Irish music, and he translated Dante and the Táin. The digressive, unstoppable sentence is the form his material required.'
        ],
        readNext: [
            { slug: 'paul-muldoon', name: 'Paul Muldoon', note: 'The same Northern generation, more oblique.' },
            { slug: 'seamus-heaney', name: 'Seamus Heaney', note: 'The elder writing the same conflict.' },
            { slug: 'derek-mahon', name: 'Derek Mahon', note: 'The formal Belfast alternative.' }
        ]
    },

    'claudia-rankine': {
        body: [
            'Her best-known book is prose, lyric, essay and image at once — a sequence of short accounts of everyday racism, told in the second person, so that the reader occupies the position being described.',
            'That formal decision is the whole argument: the accumulation of small incidents, each individually deniable, is the thing that cannot be shown any other way. She works with visual artists and in theatre, and her later book on whiteness continues the method. Whether it is poetry is a question the books deliberately leave open.'
        ],
        readNext: [
            { slug: 'solmaz-sharif', name: 'Solmaz Sharif', note: 'Documentary poetics of state language.' },
            { slug: 'elizabeth-alexander', name: 'Elizabeth Alexander', note: 'The essayist-poet on the same ground.' },
            { slug: 'susan-howe', name: 'Susan Howe', note: 'The archive broken open.' }
        ]
    },

    'david-mason': {
        body: [
            'A formalist who works in narrative at length — including verse novels about Greek refugees and about the Colorado mining country — at a moment when almost nobody was attempting either.',
            'The metre is handled unobtrusively and the interest is in the story and the people in it. He has written memoir and libretti and served as poet laureate of Colorado. The argument, made in his essays too, is that poetry gave up narrative to fiction unnecessarily and can take some of it back.'
        ],
        readNext: [
            { slug: 'mark-jarman', name: 'Mark Jarman', note: 'The same argument for narrative and form.' },
            { slug: 'dana-gioia', name: 'Dana Gioia', note: 'The formal revival\'s clearest advocate.' },
            { slug: 'robinson-jeffers', name: 'Robinson Jeffers', note: 'The American long narrative poem.' }
        ]
    },

    'david-wagoner': {
        body: [
            'A Pacific Northwest poet of forests, rivers, animals and getting lost in them — the best-known poem instructs a lost walker to stand still and let the forest find them, and that patience is the whole method.',
            'He edited Theodore Roethke\'s notebooks and taught for decades in Seattle, and the influence of Roethke\'s greenhouse poems is audible. He wrote novels as well, and drew on Native American stories in ways that have since been reconsidered. Prolific, plainspoken and consistently attentive.'
        ],
        readNext: [
            { slug: 'theodore-roethke', name: 'Theodore Roethke', note: 'His teacher, and the poems he edited.' },
            { slug: 'william-e-stafford', name: 'William E. Stafford', note: 'The other great Northwest plain style.' },
            { slug: 'john-haines', name: 'John Haines', note: 'Wilderness without consolation.' }
        ]
    },

    'deborah-landau': {
        body: [
            'Anxious, sensual, mortality-haunted poems written in short sequences — a woman in a city, drinking wine, watching the news, aware of her own body ageing and of catastrophe arriving somewhere just offstage.',
            'The tone is comic and dread-filled at once, and the poems accumulate rather than argue. One book circles a serious illness; another sets domestic pleasure against the ambient violence of the American present. She directs a major writing programme. Read a sequence whole.'
        ],
        readNext: [
            { slug: 'natalie-shapero', name: 'Natalie Shapero', note: 'The comic-morbid contemporary poem.' },
            { slug: 'brenda-shaughnessy', name: 'Brenda Shaughnessy', note: 'Appetite and dread together.' },
            { slug: 'deborah-digges', name: 'Deborah Digges', note: 'The lyric of the anxious interior.' }
        ]
    },

    'dick-allen': {
        body: [
            'An advocate of what he called expansive poetry — a return to narrative and metre against the dominance of the short free-verse lyric — and a poet whose own work is accessible, discursive and often set in suburban Connecticut.',
            'The later books are increasingly Zen in their concerns, with short poems about attention and impermanence. He served as poet laureate of Connecticut. A poet who argued for a position and then quietly demonstrated it rather than continuing to argue.'
        ],
        readNext: [
            { slug: 'dana-gioia', name: 'Dana Gioia', note: 'The parallel formal argument.' },
            { slug: 'jane-hirshfield', name: 'Jane Hirshfield', note: 'Zen practice in American poetry.' },
            { slug: 'carl-dennis', name: 'Carl Dennis', note: 'The reflective suburban poem.' }
        ]
    },

    'donald-davie': {
        body: [
            'A critic first for most readers — his books on syntax in English poetry and on the tradition he called the line of wit shaped how a generation read — and a poet whose verse enacts the same preferences: lucid, classical, and suspicious of the image for its own sake.',
            'He was associated with the Movement and then spent decades arguing with everyone including himself, particularly about Pound, whom he wrote about repeatedly and could neither accept nor dismiss. The poems are dry and intelligent and reward a reader who likes an argument.'
        ],
        readNext: [
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'The Movement\'s best poet.' },
            { slug: 'ezra-pound', name: 'Ezra Pound', note: 'The figure he could never settle with.' },
            { slug: 'yvor-winters', name: 'Yvor Winters', note: 'The other great critic-poet of severe taste.' }
        ]
    },

    'dorothy-parker': {
        body: [
            'Light verse with a blade in it: short, immaculately rhymed poems about love affairs, suicide, men and disappointment, in which the punchline usually withdraws whatever the poem appeared to be offering.',
            'The famous quatrain listing the drawbacks of every available method of killing yourself and concluding that you might as well live is exactly the technique. She was a critic and short-story writer of real seriousness, and later a screenwriter and political activist blacklisted for it. The verse is period writing done at the highest level of the form.'
        ],
        readNext: [
            { slug: 'edna-st-vincent-millay', name: 'Edna St. Vincent Millay', note: 'The contemporary she was measured against.' },
            { slug: 'margaret-fishback', name: 'Margaret Fishback', note: 'The same wit, less acid.' },
            { slug: 'franklin-pierce-adams', name: 'Franklin Pierce Adams', note: 'The column that made her name.' }
        ]
    },

    'edmund-waller': {
        body: [
            'A seventeenth-century poet whose smooth, closed couplets did as much as anything to make the heroic couplet the dominant English form — Dryden said he had taught the age to write correctly.',
            'The politics were flexible to the point of scandal: he plotted for the king, was caught, informed on his colleagues, was exiled, and later wrote a panegyric to Cromwell followed by one to the restored monarch. One short lyric telling a rose to go and confess its own mortality on his behalf is the poem that has outlasted all of it.'
        ],
        readNext: [
            { slug: 'john-dryden', name: 'John Dryden', note: 'Who credited him with the modern couplet.' },
            { slug: 'thomas-carew', name: 'Thomas Carew', note: 'The polished Caroline lyric.' },
            { slug: 'robert-herrick', name: 'Robert Herrick', note: 'The other great carpe diem poet of the century.' }
        ]
    },

    'emily-jungmin-yoon': {
        body: [
            'A Korean Canadian American poet whose central sequence gives voice to the women coerced into sexual slavery by the Japanese military, working from survivor testimony and refusing to aestheticise it.',
            'The poems are spare and formally careful, and they keep asking what a poet who was not there is entitled to do with somebody else\'s account. Elsewhere she writes about language, immigration and being asked to translate herself. She is a translator from Korean as well.'
        ],
        readNext: [
            { slug: 'don-mee-choi', name: 'Don Mee Choi', note: 'Korean history and the translated document.' },
            { slug: 'carolyn-forch', name: 'Carolyn Forché', note: 'Witness and its ethical problem.' },
            { slug: 'solmaz-sharif', name: 'Solmaz Sharif', note: 'State violence in official language.' }
        ]
    },

    'emma-lazarus': {
        body: [
            'She wrote the sonnet that ends up on the Statue of Liberty, and the poem is better and stranger than its use as national self-congratulation suggests — it explicitly rejects the conquering colossus of the ancient world in favour of a mother of exiles, and the immigrants it welcomes are described in terms nobody would put on a poster.',
            'She was a Sephardic Jewish American writing in response to pogroms in Russia, and much of her later work is directly about Jewish history and about what became Zionism. The rest of the poetry is accomplished nineteenth-century verse; that sonnet is something else.'
        ],
        readNext: [
            { slug: 'julia-ward-howe', name: 'Julia Ward Howe', note: 'The other great American public poem of the era.' },
            { slug: 'frances-ellen-watkins-harper', name: 'Frances Ellen Watkins Harper', note: 'Political verse for a movement.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The American promise, stated at length.' }
        ]
    },

    'ernest-m-hemingway': {
        body: [
            'The poems are minor and he knew it. They are worth reading as evidence: early imagist exercises written in Paris, satirical squibs about other writers, and some bitter verse from the wars he covered.',
            'The interest is in watching the prose style form — the flat declarative sentence, the refusal of adjectives — being tried out first in lines. There is also a good deal of adolescent cruelty in them. Read as a footnote to the fiction rather than as a body of work in its own right.'
        ],
        readNext: [
            { slug: 'ezra-pound', name: 'Ezra Pound', note: 'Who taught him to cut.' },
            { slug: 'gertrude-stein', name: 'Gertrude Stein', note: 'The other Paris influence on that prose.' },
            { slug: 'stephen-crane', name: 'Stephen Crane', note: 'The American flat style before him.' }
        ]
    },

    'frederick-goddard-tuckerman': {
        body: [
            'A nineteenth-century New England recluse who published one book, was admired by a few contemporaries, and then vanished from view until modernist readers rediscovered him.',
            'The work is a set of sonnet sequences written after his wife\'s death, formally irregular and full of exact natural detail — plants named correctly, weather observed closely — set against a grief that never resolves. The long late poem about a cricket is his masterpiece and is one of the strangest American poems of the century.'
        ],
        readNext: [
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The New England contemporary in comparable isolation.' },
            { slug: 'edwin-arlington-robinson', name: 'Edwin Arlington Robinson', note: 'The formal New England poem after him.' },
            { slug: 'thomas-hardy', name: 'Thomas Hardy', note: 'Grief for a wife, in a rougher music.' }
        ]
    },

    'geoffrey-chaucer': {
        body: [
            'The first major poet in English, in the sense that he chose English when the prestige languages available to him were French and Latin — and made it capable of comedy, philosophy, filth and grief.',
            'The pilgrims of his unfinished frame narrative are the achievement: a miller, a wife, a pardoner, a knight, each with a voice that is unmistakably their own and frequently at odds with what they think they are revealing. The Middle English looks harder than it is; read it aloud and roughly half the difficulty dissolves. The love poems and the dream visions are the other half of the work.'
        ],
        readNext: [
            { slug: 'john-skelton', name: 'John Skelton', note: 'The next English poet with a comparable ear for the vernacular.' },
            { slug: 'william-shakespeare', name: 'William Shakespeare', note: 'The next writer of that range.' },
            { slug: 'anonymous', name: 'Anonymous', note: 'The ballads and tales alongside him.' }
        ]
    },

    'george-bilgere': {
        body: [
            'Accessible, comic, conversational poems about middle-aged American life — a marriage, a bar, a father, a swimming pool — in the mode that Billy Collins made popular, and done with real timing.',
            'The poems set up an ordinary scene, wander, and land on something about mortality or regret without ever changing tone. The risk in that mode is charm without weight and the best ones avoid it. Easy to read and harder to write than they look.'
        ],
        readNext: [
            { slug: 'billy-collins', name: 'Billy Collins', note: 'The obvious comparison, and his advocate.' },
            { slug: 'mark-halliday', name: 'Mark Halliday', note: 'The self-aware comic speaker.' },
            { slug: 'stephen-dunn', name: 'Stephen Dunn', note: 'The reflective suburban poem.' }
        ]
    },

    'george-santayana': {
        body: [
            'A philosopher who wrote verse throughout his life and was clear-eyed about its limits — he said his poems were the sincere expression of a mind that thought in prose, which is fair.',
            'The sonnets are formally polished, late-Victorian in manner, and preoccupied with the loss of religious belief by somebody who continued to find Catholicism beautiful without believing a word of it. That position — aesthetic devotion without faith — is unusual and gives the best poems their particular cool sadness.'
        ],
        readNext: [
            { slug: 'trumbull-stickney', name: 'Trumbull Stickney', note: 'His Harvard contemporary.' },
            { slug: 'matthew-arnold', name: 'Matthew Arnold', note: 'The loss of belief argued in verse.' },
            { slug: 'wallace-stevens', name: 'Wallace Stevens', note: 'His student, who took the problem further.' }
        ]
    },

    'george-szirtes': {
        body: [
            'Born in Budapest and brought to England as a child refugee after 1956, he writes formally intricate poems in English about Hungary, the Holocaust his mother survived, and the condition of being a person who arrived.',
            'He is also a major translator from Hungarian. The verse is metrically skilled and often uses inherited forms to hold material that would otherwise be shapeless — terza rima, canzone, sonnet sequences. The photographs and the family history recur. Formal control as a way of handling inherited catastrophe.'
        ],
        readNext: [
            { slug: 'michael-hofmann', name: 'Michael Hofmann', note: 'The poet-translator working from German.' },
            { slug: 'peter-balakian', name: 'Peter Balakian', note: 'Inherited genocide as subject.' },
            { slug: 'adam-zagajewski', name: 'Adam Zagajewski', note: 'The European inheritance in the lyric.' }
        ]
    },

    'grace-schulman': {
        body: [
            'Formally attentive poems about New York, Jewish practice, marriage and the natural world, written across many decades with a consistency of tone that rewards reading a selected rather than a single book.',
            'She was poetry editor of a major literary magazine for thirty-five years, and translated from Hebrew and Spanish. The poems are unhurried and moral without being pious, and they are frequently addressed to somebody — a husband, a friend, a painter, a bird.'
        ],
        readNext: [
            { slug: 'marie-ponsot', name: 'Marie Ponsot', note: 'Formal intricacy in a New York life.' },
            { slug: 'chana-bloch', name: 'Chana Bloch', note: 'Jewish material handled conversationally.' },
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'The poet she has written about.' }
        ]
    },

    'hart-crane': {
        body: [
            'The most ambitious American poet of his short life and the most divisive — he set out to answer the pessimism of The Waste Land with an affirmative American epic built around Brooklyn Bridge, and the result is either sublime or unreadable depending on the page.',
            'The style is what critics call the logic of metaphor: images justified by association and sound rather than by sense, at a very high pitch. The shorter poems, particularly the sea sequence written to a lover, are the easier and possibly the greater work. He died by suicide at thirty-two, jumping from a ship.'
        ],
        readNext: [
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The American affirmation he was continuing.' },
            { slug: 't-s-eliot', name: 'T. S. Eliot', note: 'The poem he set out to answer.' },
            { slug: 'melvin-b-tolson', name: 'Melvin B. Tolson', note: 'The same high style, differently used.' }
        ]
    },

    'henry-david-thoreau': {
        body: [
            'The prose is the achievement and he thought of himself as a poet, which is worth taking seriously even though Emerson told him the verse was not good enough.',
            'The poems are short, plain, formally conventional and occasionally very fine — the best of them handle the same material as the prose, a pond, smoke, mist, a season, with a compression the essays do not attempt. He burned some at Emerson\'s urging, which is a small literary tragedy. Read them as the compressed edge of the prose.'
        ],
        readNext: [
            { slug: 'ralph-waldo-emerson', name: 'Ralph Waldo Emerson', note: 'His mentor, and his discouraging critic.' },
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'New England compression done supremely.' },
            { slug: 'gary-snyder', name: 'Gary Snyder', note: 'The later American poetry of practice and place.' }
        ]
    },

    'henry-dumas': {
        body: [
            'He was shot dead by a transit policeman in a New York subway station at thirty-three, in circumstances never satisfactorily explained, leaving most of his work unpublished.',
            'What survives is remarkable: poems and stories drawing on the rural South, on Black music, and on an Afro-mystical imagination that has more in common with later Afrofuturism than with his contemporaries. Toni Morrison edited and championed him. The work is fragmentary because the life was cut off, not because it was unfinished in conception.'
        ],
        readNext: [
            { slug: 'jean-toomer', name: 'Jean Toomer', note: 'The rural South rendered lyrically.' },
            { slug: 'amiri-baraka', name: 'Amiri Baraka', note: 'The Black Arts moment he belonged to.' },
            { slug: 'jay-wright', name: 'Jay Wright', note: 'Spiritual systems taken seriously.' }
        ]
    },

    'henry-viii-king-of-england': {
        body: [
            'He wrote songs, and they are competent court lyrics of the early Tudor period — the best-known is a defence of pastime with good company, which is exactly what it sounds like.',
            'The historical interest outweighs the literary: this is a monarch who was a trained musician participating in a courtly convention where writing verse was part of being cultivated. Read it as context for the court that produced Wyatt and Surrey, whose poems were written under the same king and are considerably more dangerous.'
        ],
        readNext: [
            { slug: 'sir-thomas-wyatt', name: 'Sir Thomas Wyatt', note: 'The great poet of that court, and its prisoner.' },
            { slug: 'henry-howard-earl-of-surrey', name: 'Henry Howard, Earl of Surrey', note: 'Executed by this king.' },
            { slug: 'queen-elizabeth-i', name: 'Queen Elizabeth I', note: 'His daughter, and the better poet.' }
        ]
    },

    'hieu-minh-nguyen': {
        body: [
            'Poems about being a queer Vietnamese American son in Minnesota — a mother, a body, desire, hunger and a family history that arrives through what is not said at dinner.',
            'He came out of the performance scene and the poems keep that directness while being carefully made on the page. The tone is unguarded and frequently very funny about painful things. The second book is harder and better, refusing the redemptive shape the first sometimes reached for.'
        ],
        readNext: [
            { slug: 'ocean-vuong', name: 'Ocean Vuong', note: 'The same inheritance, more lyrical.' },
            { slug: 'chen-chen', name: 'Chen Chen', note: 'Queer Asian American humour and tenderness.' },
            { slug: 'sam-sax', name: 'sam sax', note: 'The performance generation on the page.' }
        ]
    },

    'jake-adam-york': {
        body: [
            'He set out to write an elegy for every person killed in the American civil rights movement, and had completed a substantial part of that project when he died suddenly in his forties.',
            'The poems are formally careful, southern, and unusually self-aware about the position of a white Alabaman writing them — they keep examining their own right to the material. Food, smoke, music and Alabama landscape recur. The unfinished shape of the project is now part of what it means.'
        ],
        readNext: [
            { slug: 'natasha-trethewey', name: 'Natasha Trethewey', note: 'The southern archive as a lifelong subject.' },
            { slug: 'marilyn-nelson', name: 'Marilyn Nelson', note: 'Atrocity held inside strict form.' },
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'The historical elegy at its source.' }
        ]
    },

    'jaswinder-bolina': {
        body: [
            'Fast, discursive, essayistic poems that think aloud about race, class, American citizenship and the absurdity of being asked where you are really from — written in a voice that is genuinely funny and never resolves into a slogan.',
            'He is also an essayist, and the essays on being a brown American poet are widely read. The verse moves by digression and self-interruption, and the political argument arrives as a side effect of the thinking rather than as its conclusion.'
        ],
        readNext: [
            { slug: 'matthew-zapruder', name: 'Matthew Zapruder', note: 'The poem thinking aloud.' },
            { slug: 'cathy-park-hong', name: 'Cathy Park Hong', note: 'The essayist-poet on race in America.' },
            { slug: 'bob-hicok', name: 'Bob Hicok', note: 'Digression as a moral method.' }
        ]
    },

    'jayne-cortez': {
        body: [
            'A performance poet whose work was written to be delivered with a band — she recorded for decades with a group of jazz and funk musicians, and the poems are scored for that.',
            'The technique is repetition and incantation, and the subjects are police violence, colonialism, apartheid, and the exploitation of Black musicians. The language is blunt and the images are surreal in a way that comes from Surrealism proper as much as from the blues. On the page these are a script; find a recording.'
        ],
        readNext: [
            { slug: 'amiri-baraka', name: 'Amiri Baraka', note: 'The same movement and the same music.' },
            { slug: 'bob-kaufman', name: 'Bob Kaufman', note: 'Jazz surrealism in American poetry.' },
            { slug: 'sonia-sanchez', name: 'Sonia Sanchez', note: 'Black Arts written for the voice.' }
        ]
    },

    'jennifer-michael-hecht': {
        body: [
            'A historian of doubt and of suicide, and a poet whose verse is playful, dense with reference and philosophically restless — the poems argue with the history she writes about in prose.',
            'The manner is comic and associative, closer to the New York School than to anything academic, which makes the erudition light on its feet. Her argument against suicide, made in prose and glanced at in the poems, is that we owe our continued existence to each other. Read the prose and the verse together.'
        ],
        readNext: [
            { slug: 'philip-appleman', name: 'Philip Appleman', note: 'The argued humanist poem.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'Scholarship and poem in one practice.' },
            { slug: 'kenneth-koch', name: 'Kenneth Koch', note: 'Comic exuberance inside real technique.' }
        ]
    },

    'jill-bialosky': {
        body: [
            'Quiet, narrative poems about family, motherhood, loss and the domestic interior, written in a plain register that stays close to the emotional facts.',
            'Her sister\'s suicide is the material of a widely read prose memoir and it runs under the poems as well. She has worked as a senior editor at a major publisher for decades, which puts her on both sides of the poetry world. The verse is accessible and unshowy, and the best of it is very direct about grief.'
        ],
        readNext: [
            { slug: 'edward-hirsch', name: 'Edward Hirsch', note: 'The book-length elegy for a child.' },
            { slug: 'linda-pastan', name: 'Linda Pastan', note: 'The domestic lyric at similar scale.' },
            { slug: 'jill-alexander-essbaum', name: 'Jill Alexander Essbaum', note: 'The same generation, at the opposite extreme.' }
        ]
    },

    'john-kinsella': {
        body: [
            'An Australian poet of enormous output whose subject is the Western Australian wheatbelt — a landscape he writes about as a site of ecological destruction, colonial theft and personal history all at once.',
            'He is an anarchist and a vegan and describes his work as activist, and the poems are formally restless: pastoral forms deliberately broken, long sequences, collaborations. The argument is that a pastoral written on stolen and poisoned land cannot be a comfortable form. Prolific to a degree that makes a selected essential.'
        ],
        readNext: [
            { slug: 'les-murray', name: 'Les Murray', note: 'The Australian poet he argues with.' },
            { slug: 'juliana-spahr', name: 'Juliana Spahr', note: 'Ecology and experimental politics.' },
            { slug: 'alice-oswald', name: 'Alice Oswald', note: 'The broken pastoral in Britain.' }
        ]
    },

    'joshua-beckman': {
        body: [
            'Quiet, spontaneous-seeming poems that are frequently untitled and read like overheard thought — short lines, ordinary words, no obvious occasion, and a strange cumulative tenderness.',
            'He has worked as an editor and translator and has made books collaboratively, including improvised ones. The mode risks slightness and depends entirely on tone, which he sustains. Read twenty pages rather than one poem; the effect is atmospheric and does not survive sampling.'
        ],
        readNext: [
            { slug: 'matthew-rohrer', name: 'Matthew Rohrer', note: 'His frequent collaborator.' },
            { slug: 'james-schuyler', name: 'James Schuyler', note: 'Notation as a whole method.' },
            { slug: 'ron-padgett', name: 'Ron Padgett', note: 'Deadpan plainness with a floor under it.' }
        ]
    },

    'julia-ward-howe': {
        body: [
            'She wrote the words to a marching song that became the most enduring American public poem of the nineteenth century — apocalyptic, biblical, and set to a tune the soldiers were already singing.',
            'The rest of her writing is largely forgotten and she was a considerable figure beyond it: an abolitionist, a suffragist, and the author of a proclamation calling on women to oppose war that later became one root of Mother\'s Day. The hymn is period rhetoric at its most effective, and it is worth reading rather than only singing.'
        ],
        readNext: [
            { slug: 'emma-lazarus', name: 'Emma Lazarus', note: 'The other great American public poem.' },
            { slug: 'john-greenleaf-whittier', name: 'John Greenleaf Whittier', note: 'The abolitionist verse of the same decades.' },
            { slug: 'walt-whitman', name: 'Walt Whitman', note: 'The Civil War written without the trumpet.' }
        ]
    },

    kabir: {
        body: [
            'A fifteenth-century North Indian poet-saint, born into a Muslim weaving family and claimed by Hindus, Muslims and Sikhs alike, whose short poems attack ritual, caste, priests and scholars in the plainest possible language.',
            'The poems were sung rather than written and survive in many versions; there is no reliable single text and the tradition is oral. In English he is read through very free translations, most famously Tagore\'s and later Robert Bly\'s, which are closer to adaptations. The argument in them is constant: the divine is not in the temple or the book, and you are wasting your life looking there.'
        ],
        readNext: [
            { slug: 'rabindranath-tagore', name: 'Rabindranath Tagore', note: 'His most famous English translator.' },
            { slug: 'kahlil-gibran', name: 'Kahlil Gibran', note: 'Wisdom literature in English translation.' },
            { slug: 'thomas-merton', name: 'Thomas Merton', note: 'Contemplative poetry across traditions.' }
        ]
    },

    'katherine-philips': {
        body: [
            'A seventeenth-century poet who made female friendship a serious subject for verse — the poems addressed to the women in her circle use the vocabulary of passionate love, and readers have argued about the register ever since.',
            'She translated Corneille, ran a coterie in which everyone took classical pen names, and had her poems published without permission, which she claimed to find mortifying. The verse is formally polished and emotionally direct, and it was widely admired in a century that gave women writers very little room.'
        ],
        readNext: [
            { slug: 'aphra-behn', name: 'Aphra Behn', note: 'The next Englishwoman to live by writing.' },
            { slug: 'anne-finch-countess-of-winchilsea', name: 'Anne Finch, Countess of Winchilsea', note: 'The generation after.' },
            { slug: 'andrew-marvell', name: 'Andrew Marvell', note: 'The formal poise of the same decades.' }
        ]
    },

    'katie-ford': {
        body: [
            'Spare, austere poems of faith and its withdrawal — she trained in divinity, and the poems address a God who is either absent or unwilling, in a register closer to psalm than to lyric.',
            'One book comes out of Hurricane Katrina and the drowning of New Orleans; another out of the end of a marriage and severe illness. The lines are short and the vocabulary is plain, and the restraint is what makes the desolation land. Nothing here is consoling and nothing is theatrical.'
        ],
        readNext: [
            { slug: 'fanny-howe', name: 'Fanny Howe', note: 'Belief pursued without resolution.' },
            { slug: 'jean-valentine', name: 'Jean Valentine', note: 'The short poem full of silence.' },
            { slug: 'louise-glck', name: 'Louise Glück', note: 'Austerity as a whole method.' }
        ]
    },

    'khaled-mattawa': {
        body: [
            'A Libyan American poet and one of the essential translators of contemporary Arabic poetry into English — Adonis, Saadi Youssef, Fadhil Al-Azzawi and others reach English readers largely through him.',
            'His own poems move between Benghazi and the American Midwest, and they are preoccupied with exile, revolution and the impossibility of reporting a country to people who have already decided what it is. The line is long and discursive. The translations and the poems are one project.'
        ],
        readNext: [
            { slug: 'adonis', name: 'Adonis', note: 'The poet he has translated most.' },
            { slug: 'fady-joudah', name: 'Fady Joudah', note: 'The other great Arabic-English poet-translator.' },
            { slug: 'mahmoud-darwish', name: 'Mahmoud Darwish', note: 'The Arabic tradition behind both.' }
        ]
    },

    'kobayashi-issa': {
        body: [
            'One of the four great masters of Japanese haiku, and the most human of them — the poems are full of flies, fleas, frogs, sparrows and small creatures addressed as equals, in a voice that is comic and grieving at once.',
            'His life was a catalogue of losses, including several children, and the most famous poems are about exactly that: a world of dew, and yet. The plainness is deceptive and the humour is not decoration. In English he is read through many competing translations, and comparing two or three is the fastest way to see what the original is doing.'
        ],
        readNext: [
            { slug: 'gary-snyder', name: 'Gary Snyder', note: 'The Japanese tradition in American English.' },
            { slug: 'jane-hirshfield', name: 'Jane Hirshfield', note: 'A translator from the Japanese tradition.' },
            { slug: 'kenneth-rexroth', name: 'Kenneth Rexroth', note: 'Who brought this poetry into American English.' }
        ]
    },

    'kofi-awoonor': {
        body: [
            'A Ghanaian poet who built his English verse on the Ewe dirge — a traditional funeral song form — so the poems carry the cadence and the communal grief of that tradition into a European language.',
            'He was also a diplomat, a novelist and a political prisoner in Ghana in the 1970s. The poems are elegiac, formally rooted in oral practice, and preoccupied with the damage colonialism did to a culture\'s ability to mourn its own. He was killed in the 2013 terrorist attack on a Nairobi shopping mall while attending a literary festival.'
        ],
        readNext: [
            { slug: 'chris-abani', name: 'Chris Abani', note: 'West African poetry in English, later.' },
            { slug: 'derek-walcott', name: 'Derek Walcott', note: 'The colonial inheritance and the English line.' },
            { slug: 'kamau-brathwaite', name: 'Kamau Brathwaite', note: 'Oral form remaking the page.' }
        ]
    },

    'lady-mary-wroth': {
        body: [
            'The first Englishwoman known to have written a full sonnet sequence, and it inverts the convention it inherits: the speaker is a woman, constant and clear-eyed, addressing a man who is not.',
            'She was Philip Sidney\'s niece and Mary Sidney\'s, and the family tradition is visible in the technical command — the sequence ends with a crown of sonnets, fourteen poems locked together by repeated lines, which is about as difficult as English verse gets. Her prose romance caused a scandal at court and was withdrawn. A major writer suppressed in her own time and recovered late.'
        ],
        readNext: [
            { slug: 'sir-philip-sidney', name: 'Sir Philip Sidney', note: 'Her uncle, and the sequence she answers.' },
            { slug: 'mary-sidney-herbert-countess-of-pembroke', name: 'Mary Sidney Herbert', note: 'Her aunt, and the family\'s other major poet.' },
            { slug: 'katherine-philips', name: 'Katherine Philips', note: 'The next Englishwoman of that stature.' }
        ]
    },

    'lawson-fusao-inada': {
        body: [
            'A Japanese American poet who was interned as a child during the Second World War, and who writes about the camps in a voice shaped by jazz — he is a musician, and the poems are built on riff, repeat and swing.',
            'That combination is unusual and effective: the improvisatory form keeps the historical material from settling into monument. He was central to establishing Asian American literature as a field, co-editing a landmark anthology. He served as poet laureate of Oregon.'
        ],
        readNext: [
            { slug: 'garrett-hongo', name: 'Garrett Hongo', note: 'Japanese American memory in narrative verse.' },
            { slug: 'michael-s-harper', name: 'Michael S. Harper', note: 'Jazz as poetic structure.' },
            { slug: 'cathy-song', name: 'Cathy Song', note: 'Japanese American family history, quieter.' }
        ]
    },

    'marilyn-hacker': {
        body: [
            'A formal virtuoso — sonnets, sestinas, villanelles, crowns of sonnets — used for material the forms were never designed to hold: lesbian desire, breast cancer, Paris, exile and political argument.',
            'One book is a novel in verse about a love affair, entirely in received forms. Another is a sequence written through cancer treatment that refuses both bravery and self-pity. She is also a major translator from French. The argument implicit in the whole career is that form belongs to whoever can use it.'
        ],
        readNext: [
            { slug: 'a-e-stallings', name: 'A. E. Stallings', note: 'The next generation of formal command.' },
            { slug: 'agha-shahid-ali', name: 'Agha Shahid Ali', note: 'Strict inherited form in American English.' },
            { slug: 'adrienne-rich', name: 'Adrienne Rich', note: 'The politics she shares and the form she kept.' }
        ]
    },

    'mark-doty': {
        body: [
            'A lyric poet of great descriptive richness whose central body of work came out of the AIDS epidemic and the death of his partner — poems that describe a fish market, a beach, a dog, an illness, at length and in colour.',
            'The abundance is the argument: the world is described lavishly because it is being lost. He writes superbly about animals and about looking at art, and his prose memoirs are as good as the verse. The risk is prettiness and the best poems earn their beauty by what they are holding up against.'
        ],
        readNext: [
            { slug: 'thom-gunn', name: 'Thom Gunn', note: 'The same epidemic, in metre.' },
            { slug: 'd-a-powell', name: 'D. A. Powell', note: 'The same losses, at the other extreme of style.' },
            { slug: 'carl-phillips', name: 'Carl Phillips', note: 'Desire under syntactic control.' }
        ]
    },

    'mary-mapes-dodge': {
        body: [
            'Best known for a children\'s novel about a Dutch boy and a pair of silver skates, and more important as the founding editor of a children\'s magazine that published Twain, Alcott, Kipling and Stevenson.',
            'Her own verse is light, competent and written for children — rhymes about weather, animals and small domestic events. The editorial achievement is the larger one: she insisted that writing for children should be as well made as writing for adults, and commissioned accordingly.'
        ],
        readNext: [
            { slug: 'robert-louis-stevenson', name: 'Robert Louis Stevenson', note: 'Whose children\'s verse she published.' },
            { slug: 'joyce-sidman', name: 'Joyce Sidman', note: 'The modern children\'s nature poem.' },
            { slug: 'mother-goose', name: 'Mother Goose', note: 'The anonymous ground of all of it.' }
        ]
    },

    'mei-mei-berssenbrugge': {
        body: [
            'Very long lines — sometimes running the width of the page — in a cool, abstract, almost scientific register, describing perception, weather, light, animals and the space between people.',
            'There is no narrative and almost no personality in the usual sense; the poems are phenomenological, examining how a thing is apprehended rather than what it means. She has collaborated with visual artists throughout her career. Difficult in a completely unaggressive way: nothing is hidden, and nothing is explained either.'
        ],
        readNext: [
            { slug: 'barbara-guest', name: 'Barbara Guest', note: 'The painterly spacious line.' },
            { slug: 'arthur-sze', name: 'Arthur Sze', note: 'Constellated perception.' },
            { slug: 'cole-swensen', name: 'Cole Swensen', note: 'The book-length lyric investigation.' }
        ]
    },

    'michael-collier': {
        body: [
            'Quiet, formally attentive poems about family, childhood, illness and the ordinary Maryland and Arizona landscapes of his life, in a plain style that owes something to Bishop and something to Frost.',
            'He directed a major writers\' conference for years and served as poet laureate of Maryland, and translated a Greek tragedy. The poems are unshowy and psychologically exact, particularly about the strain inside families that appear to be functioning. A poet of the middle register done carefully.'
        ],
        readNext: [
            { slug: 'elizabeth-bishop', name: 'Elizabeth Bishop', note: 'Observation carrying the feeling.' },
            { slug: 'stanley-plumly', name: 'Stanley Plumly', note: 'The same elegiac care.' },
            { slug: 'michael-ryan', name: 'Michael Ryan', note: 'Family examined without mercy.' }
        ]
    },

    'michael-field': {
        body: [
            'Not one person. Michael Field was the pen name of Katharine Bradley and her niece Edith Cooper, who lived together as a couple, wrote together for decades, and asked to be read as a single poet.',
            'The verse is aesthetic, sensuous and heavily influenced by Sappho and by Renaissance painting, and the poems about their own love are among the frankest of the period. When the identity became known their reputation collapsed — the Victorian public would accept a male poet and not two women. Recovered late and read seriously now.'
        ],
        readNext: [
            { slug: 'algernon-charles-swinburne', name: 'Algernon Charles Swinburne', note: 'The aesthetic movement at its loudest.' },
            { slug: 'christina-rossetti', name: 'Christina Rossetti', note: 'The Victorian woman poet at her best.' },
            { slug: 'sappho', name: 'Sappho', note: 'The Greek model they wrote from.' }
        ]
    },

    'miller-williams': {
        body: [
            'A plainspoken Southern poet who read at a presidential inauguration and spent his career writing narrative, formally controlled poems about ordinary people in Arkansas and elsewhere.',
            'The mode is compassionate and unsentimental: the poems present a life in twenty lines and decline to judge it. He was also a translator and a publisher, and taught for decades. His verse is technically tighter than the conversational surface suggests, and rereading usually reveals the metre that was holding it.'
        ],
        readNext: [
            { slug: 'edwin-arlington-robinson', name: 'Edwin Arlington Robinson', note: 'The formal portrait of a failed life.' },
            { slug: 'rodney-jones', name: 'Rodney Jones', note: 'Southern narrative verse.' },
            { slug: 'wesley-mcnair', name: 'Wesley McNair', note: 'The same compassion, in New England.' }
        ]
    },

    'molly-peacock': {
        body: [
            'A formal poet who writes about the body, marriage, a difficult childhood and desire in rhymed and metred poems that read as though they were spoken — the rhyme frequently falls mid-line where you do not expect it.',
            'She was a central figure in reviving public poetry reading series and in the poetry-in-transit movement, and has written memoir and biography. The poems are frank about sex and about family damage, and the form is what keeps that frankness from becoming a confession.'
        ],
        readNext: [
            { slug: 'marilyn-hacker', name: 'Marilyn Hacker', note: 'Form carrying contemporary material.' },
            { slug: 'marie-ponsot', name: 'Marie Ponsot', note: 'Formal intricacy and a woman\'s life.' },
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'Rhyme hidden inside the line.' }
        ]
    },

    'peter-everwine': {
        body: [
            'Spare, quiet poems of loss and the Californian valley, and a translator of Aztec poetry and of the Hebrew poet Natan Zach — the translations and the originals share a bare, unhurried line.',
            'He belonged to the Fresno circle around Philip Levine, and his work is the quietest of that group: short poems, plain images, a great deal of silence. Absence is the constant subject — a father, a language, a landscape that has been farmed out. Read slowly; there is very little to hold onto and that is intentional.'
        ],
        readNext: [
            { slug: 'philip-levine', name: 'Philip Levine', note: 'His Fresno colleague and friend.' },
            { slug: 'larry-levis', name: 'Larry Levis', note: 'The same valley, more elliptical.' },
            { slug: 'w-s-merwin', name: 'W. S. Merwin', note: 'Translation and the bare line.' }
        ]
    },

    'phillis-wheatley': {
        body: [
            'Kidnapped from West Africa as a child, enslaved in Boston, and the first African American to publish a book of poems — which she could only do after being examined by a panel of prominent men to certify that she had written it.',
            'That examination is part of how the poems have to be read. They are neoclassical, formally accomplished, and careful, and the arguments about slavery in them are made obliquely because they could not be made otherwise. The elegies are the largest part of the work. She was freed after the book appeared and died in poverty in her early thirties.'
        ],
        readNext: [
            { slug: 'george-moses-horton', name: 'George Moses Horton', note: 'The next poet to publish while enslaved.' },
            { slug: 'frances-ellen-watkins-harper', name: 'Frances Ellen Watkins Harper', note: 'The abolitionist generation.' },
            { slug: 'alexander-pope', name: 'Alexander Pope', note: 'The couplet tradition she wrote in.' }
        ]
    },

    'rickey-laurentiis': {
        body: [
            'Formally rich, sensuous poems about the American South, lynching photographs, queer desire and the Black body as it has been looked at — the first book is largely a set of confrontations with images.',
            'The diction is deliberately ornate, which sets up a tension with the violence being described that the poems never resolve and do not want to. The influence of the Southern gothic and of Renaissance devotional verse are both audible. Uncomfortable by design, and very carefully made.'
        ],
        readNext: [
            { slug: 'jericho-brown', name: 'Jericho Brown', note: 'Desire, violence and invented form.' },
            { slug: 'natasha-trethewey', name: 'Natasha Trethewey', note: 'The southern image as historical record.' },
            { slug: 'carl-phillips', name: 'Carl Phillips', note: 'Syntax as a moral instrument.' }
        ]
    },

    'rigoberto-gonzlez': {
        body: [
            'A Chicano poet, memoirist and critic whose work is about queer Latino life, migrant farm labour, family violence and the border, written plainly and without any bid for sympathy.',
            'The poems are narrative and image-led, and the family material is handled with an unusual refusal to redeem anybody. He has done a great deal as a reviewer and anthologist to widen the visibility of Latino writing. The memoirs and the poems cover the same ground and are worth reading together.'
        ],
        readNext: [
            { slug: 'eduardo-c-corral', name: 'Eduardo C. Corral', note: 'The same ground, more lyrical.' },
            { slug: 'gary-soto', name: 'Gary Soto', note: 'Field labour and childhood.' },
            { slug: 'richard-blanco', name: 'Richard Blanco', note: 'Queer Latino poetry, warmer.' }
        ]
    },

    'robert-hayden': {
        body: [
            'A poet of extraordinary formal control who insisted on being read as a poet rather than as a spokesman, which cost him support during the Black Arts years and looks like integrity now.',
            'The great poems are historical: a slave ship rendered through the voices of its crew and its cargo, a portrait of Frederick Douglass in a single sentence, an escape north told as a chorus. The most quoted is fourteen lines about a father getting up in the cold to light the fires, and the son who never thanked him. He was the first African American to hold the Library of Congress poetry post.'
        ],
        readNext: [
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'The contemporary who chose differently.' },
            { slug: 'rita-dove', name: 'Rita Dove', note: 'The historical sequence after him.' },
            { slug: 'michael-s-harper', name: 'Michael S. Harper', note: 'His champion and inheritor.' }
        ]
    },

    'robert-southey': {
        body: [
            'Poet Laureate for thirty years, enormously prolific, and now read mainly for two things: a short poem on the pointlessness of a famous battle that nobody in it can explain, and a ballad about a bishop eaten by rats.',
            'He began as a political radical planning a utopian commune with Coleridge and ended as an establishment conservative, which Byron never let him forget and satirised savagely. The long epics were admired in their day and are unread now. The short poems and the prose are where anything survives.'
        ],
        readNext: [
            { slug: 'samuel-taylor-coleridge', name: 'Samuel Taylor Coleridge', note: 'His brother-in-law and co-conspirator.' },
            { slug: 'william-wordsworth', name: 'William Wordsworth', note: 'The third of that Lake circle.' },
            { slug: 'thomas-love-peacock', name: 'Thomas Love Peacock', note: 'Who mocked all of them in prose.' }
        ]
    },

    'rosanna-warren': {
        body: [
            'A poet, translator and scholar whose verse is formally exact and steeped in classical and French material — she has written a major life of a French poet and translates from several languages.',
            'The poems are dense and elegiac, dealing with family, painting, war and the dead, and the erudition is worn as working knowledge rather than display. She is also a painter, and there is a painter\'s attention to light and edge throughout. Slow, careful, and unfashionably learned.'
        ],
        readNext: [
            { slug: 'david-ferry', name: 'David Ferry', note: 'Translation and original work inseparable.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'Classical scholarship as poetic method.' },
            { slug: 'geoffrey-brock', name: 'Geoffrey Brock', note: 'The poet-translator of the same generation.' }
        ]
    },

    'sherod-santos': {
        body: [
            'Lyrical, meditative poems in long sentences, drawn to landscape, painting and the moment where perception turns into memory — the manner is elegiac even when nothing has been lost.',
            'He has translated Greek lyric and written a book of prose poems built from the accounts of psychiatric patients, which is the most striking thing he has done. The style is deliberately unhurried and can seem old-fashioned; the attention in it is real.'
        ],
        readNext: [
            { slug: 'charles-wright', name: 'Charles Wright', note: 'The long meditative American line.' },
            { slug: 'david-st-john', name: 'David St. John', note: 'The unembarrassed lyric.' },
            { slug: 'stanley-plumly', name: 'Stanley Plumly', note: 'The elegiac register held for a career.' }
        ]
    },

    'solmaz-sharif': {
        body: [
            'Her first book takes terms from the United States Department of Defense dictionary of military terms and sets them, in small capitals, inside poems about her Iranian family, exile and surveillance.',
            'The device is exact rather than clever: the official vocabulary is shown doing what it was built to do, which is to make violence procedural. The second book is quieter and angrier, about return, borders and the position of a poet writing in the language of the state that bombed her relatives. Among the most disciplined political poetry being written.'
        ],
        readNext: [
            { slug: 'claudia-rankine', name: 'Claudia Rankine', note: 'Documentary poetics of the present.' },
            { slug: 'srikanth-reddy', name: 'Srikanth Reddy', note: 'Official language carved into confession.' },
            { slug: 'monica-youn', name: 'Monica Youn', note: 'Legal vocabulary as poetic material.' }
        ]
    },

    'stanley-plumly': {
        body: [
            'An elegiac poet in the most literal sense — the poems return again and again to his father\'s death and to the Ohio of his childhood, in long sinuous sentences that unwind across the line breaks.',
            'He also wrote superb prose about the Romantics, including a book on Keats\'s death and another on the posthumous life of his reputation. The verse is unhurried, image-rich and formally quiet, and it depends on the reader\'s willingness to follow a sentence for a long way. The late poems on his own dying are the most direct.'
        ],
        readNext: [
            { slug: 'james-wright', name: 'James Wright', note: 'The same Ohio and the same sympathy.' },
            { slug: 'charles-wright', name: 'Charles Wright', note: 'The long meditative sentence.' },
            { slug: 'john-keats', name: 'John Keats', note: 'The poet he wrote two books about.' }
        ]
    },

    'suzanne-buffam': {
        body: [
            'Short, dry, aphoristic poems assembled into books that behave like commonplace books — one is built as a series of observations on sleeplessness, another as a catalogue of small comparisons.',
            'The wit is understated and the accumulation is the form: individually the pieces look like fragments, and read in sequence they build a temperament. The influence of the aphorism and of the classical Japanese pillow book are both visible. Precise, funny, and easy to underestimate.'
        ],
        readNext: [
            { slug: 'mary-ruefle', name: 'Mary Ruefle', note: 'The aphoristic turn handled comically.' },
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'Compression as a whole method.' },
            { slug: 'sarah-manguso', name: 'Sarah Manguso', note: 'The aphorism as a book-length form.' }
        ]
    },

    'tato-laviera': {
        body: [
            'A Nuyorican poet who wrote in English, Spanish and the mixture of the two that is actually spoken, and whose books are built for performance — the page is a score for a voice that moves between languages mid-sentence.',
            'The subjects are the Lower East Side, Puerto Rican identity in New York, Afro-Caribbean music and the refusal to choose one country. He answered a famous poem about assimilation with one declaring he had not assimilated but had assimilated America instead. Central to Nuyorican literature and best encountered aloud.'
        ],
        readNext: [
            { slug: 'victor-hernndez-cruz', name: 'Victor Hernández Cruz', note: 'The same movement and the same music.' },
            { slug: 'pedro-pietri', name: 'Pedro Pietri', note: 'The Nuyorican poem at its most confrontational.' },
            { slug: 'juan-felipe-herrera', name: 'Juan Felipe Herrera', note: 'Bilingual performance poetry.' }
        ]
    },

    'tom-raworth': {
        body: [
            'The fastest poet in modern British English — very short lines, no punctuation, no settling, read aloud at a speed that makes the syntax impossible to hold and is the entire experience.',
            'He was a central figure in the British Poetry Revival, a printer and a connector between the American and British avant-gardes. The poems refuse to be about anything in the ordinary sense; they are about velocity and the failure of the mind to keep up. Find a recording, then read the page.'
        ],
        readNext: [
            { slug: 'veronica-forrest-thomson', name: 'Veronica Forrest-Thomson', note: 'The British avant-garde theorised.' },
            { slug: 'christopher-middleton', name: 'Christopher Middleton', note: 'British experiment of the same decades.' },
            { slug: 'clark-coolidge', name: 'Clark Coolidge', note: 'The American equivalent in speed.' }
        ]
    },

    'veronica-forrest-thomson': {
        body: [
            'A poet and theorist who died at twenty-seven, leaving a book of criticism that has become foundational for British experimental poetics and a small body of dense, allusive verse.',
            'The theory argues that poetry works by artifice — by the formal features that resist being paraphrased into a statement about the world — and that criticism which rushes to meaning destroys what a poem does. The poems demonstrate it: pastiche, quotation, technical vocabulary and lyric all colliding. Read the criticism and the poems together; neither is complete alone.'
        ],
        readNext: [
            { slug: 'tom-raworth', name: 'Tom Raworth', note: 'The British avant-garde she wrote among.' },
            { slug: 'clark-coolidge', name: 'Clark Coolidge', note: 'The American abstraction alongside it.' },
            { slug: 'lyn-hejinian', name: 'Lyn Hejinian', note: 'The parallel American theory.' }
        ]
    },

    'wanda-coleman': {
        body: [
            'The unofficial poet laureate of Los Angeles — not the city of the film industry but of South Central, low-wage work, medical bills, racism and rage, written across decades and largely outside the institutions.',
            'She invented her own version of the sonnet, loose and driving, and used it for hundreds of poems. The voice is loud, funny, obscene and completely unsentimental about poverty. She was famously combative in print. Among the most important American poets of her generation and still under-read.'
        ],
        readNext: [
            { slug: 'terrance-hayes', name: 'Terrance Hayes', note: 'Whose sonnets acknowledge hers.' },
            { slug: 'charles-bukowski', name: 'Charles Bukowski', note: 'The other Los Angeles outsider, and her opposite.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Compression and authority.' }
        ]
    },

    'zachary-schomburg': {
        body: [
            'Short surreal prose poems in a flat, calm, fairy-tale voice — a person turns into an object, a town is swallowed, someone is buried alive and comments on the temperature.',
            'The mode is directly descended from Edson and from Eastern European surrealism, and the tone is the whole instrument: nothing is ever surprised by what happens. Death and love are the two subjects. He also draws and runs a small press. Read fifteen at a time; individually they read as jokes.'
        ],
        readNext: [
            { slug: 'russell-edson', name: 'Russell Edson', note: 'The direct ancestor.' },
            { slug: 'james-tate', name: 'James Tate', note: 'The late prose poems in the same key.' },
            { slug: 'matthew-rohrer', name: 'Matthew Rohrer', note: 'The contemporary deadpan.' }
        ]
    },

    'ada-limn': {
        body: [
            'Warm, direct, physically alert poems about horses, gardens, grief, the body and the difficulty of staying hopeful without lying about anything — she is one of the very few contemporary poets who can write about joy without it reading as a evasion.',
            'The line is conversational and the images are exact. Illness, childlessness and a stepfamily recur in the later books. She served as United States Poet Laureate and used the role for a project on poetry and public land. Widely loved, and the craft underneath the accessibility is easy to miss.'
        ],
        readNext: [
            { slug: 'ross-gay', name: 'Ross Gay', note: 'The other contemporary poet of insisted-on delight.' },
            { slug: 'aimee-nezhukumatathil', name: 'Aimee Nezhukumatathil', note: 'Wonder handled as a discipline.' },
            { slug: 'natalie-diaz', name: 'Natalie Diaz', note: 'The body and the land, at higher voltage.' }
        ]
    },

    'adam-kirsch': {
        body: [
            'A critic first — widely published on literature, Jewish thought and the modern canon — and a formal poet whose verse is metrically strict, restrained and intellectually serious.',
            'The poems are frequently about historical or biblical figures, or about the moral position of somebody living comfortably while thinking about catastrophe. The manner is deliberately unfashionable: no confession, no free verse, no display. Read the criticism alongside; the same temperament runs through both.'
        ],
        readNext: [
            { slug: 'j-v-cunningham', name: 'J. V. Cunningham', note: 'The hard modern epigram.' },
            { slug: 'david-yezzi', name: 'David Yezzi', note: 'The contemporary formalist alongside him.' },
            { slug: 'geoffrey-hill', name: 'Geoffrey Hill', note: 'History and moral scruple in verse.' }
        ]
    },

    adonis: {
        body: [
            'The most influential living Arabic poet, read here in translation, and the central figure in the modernist transformation of Arabic verse — he broke with the classical metrical system and argued for it in criticism as forcefully as he demonstrated it in poems.',
            'The work is visionary, mythic and politically unsparing towards Arab regimes and towards religious authority, which has kept him controversial across the region for sixty years. He writes long sequences rather than lyrics. His prose on the static and the dynamic in Arab culture is as important as the poetry.'
        ],
        readNext: [
            { slug: 'mahmoud-darwish', name: 'Mahmoud Darwish', note: 'The other great modern Arabic poet.' },
            { slug: 'khaled-mattawa', name: 'Khaled Mattawa', note: 'His principal English translator.' },
            { slug: 'arthur-rimbaud', name: 'Arthur Rimbaud', note: 'The French visionary line he drew on.' }
        ]
    },

    'allen-tate': {
        body: [
            'A Southern poet and critic, central to the Fugitive group and to the New Criticism that dominated American literary study for decades — the insistence on reading the poem as an object rather than through the author\'s biography is largely his generation\'s doing.',
            'His best-known poem is a long ode at a Confederate cemetery, and its subject is the impossibility of the very commemoration it performs. The Southern Agrarian politics he espoused were reactionary and defended segregation, which is part of the record. The poems are dense, formal and deliberately difficult.'
        ],
        readNext: [
            { slug: 'john-crowe-ransom', name: 'John Crowe Ransom', note: 'The Fugitive group\'s other central figure.' },
            { slug: 'robert-lowell', name: 'Robert Lowell', note: 'His student, who broke with the method.' },
            { slug: 'hart-crane', name: 'Hart Crane', note: 'His friend, and his opposite in every way.' }
        ]
    },

    'ama-ata-aidoo': {
        body: [
            'A Ghanaian writer better known for plays and fiction, whose poems carry the same argument: about African women, about the disappointments of independence, and about what an educated diaspora owes the place it left.',
            'The verse is direct, conversational and frequently addressed to somebody in particular, drawing on Akan oral forms. The tone moves between anger and comedy without warning. She served briefly as a government minister for education and resigned. Read the poems alongside the plays; the voice is continuous.'
        ],
        readNext: [
            { slug: 'kofi-awoonor', name: 'Kofi Awoonor', note: 'The Ghanaian contemporary, more elegiac.' },
            { slug: 'chris-abani', name: 'Chris Abani', note: 'West African writing in English, later.' },
            { slug: 'audre-lorde', name: 'Audre Lorde', note: 'The politics of Black women\'s writing.' }
        ]
    },

    'ambrose-bierce': {
        body: [
            'A journalist and short-story writer of exceptional bleakness whose verse is mostly satirical — epigrams, mock-definitions and attacks on politicians, clergy and rival writers, delivered with a cruelty he made no attempt to soften.',
            'He is best known for a sardonic dictionary that redefines ordinary words as instruments of hypocrisy, and much of that book is in verse. He served in the Civil War and wrote the best American short fiction about it. He disappeared in Mexico in his seventies and was never found.'
        ],
        readNext: [
            { slug: 'stephen-crane', name: 'Stephen Crane', note: 'The same American bleakness.' },
            { slug: 'dorothy-parker', name: 'Dorothy Parker', note: 'The epigram with a blade.' },
            { slug: 'jonathan-swift', name: 'Jonathan Swift', note: 'Satire as a moral instrument.' }
        ]
    },

    'andrew-motion': {
        body: [
            'A British Poet Laureate for a decade, and a poet whose work is narrative, elegiac and formally quiet — the recurring material is his mother\'s long illness after a riding accident, and the poems return to it across many books.',
            'He has written biographies of Larkin and Keats, and founded a national poetry archive of recorded readings. The laureate poems attracted the usual difficulty of writing to order about public occasions. The best work is the personal narrative verse, and the war poems assembled from veterans\' testimony.'
        ],
        readNext: [
            { slug: 'philip-larkin', name: 'Philip Larkin', note: 'His subject as a biographer.' },
            { slug: 'david-harsent', name: 'David Harsent', note: 'The contemporary British darkness.' },
            { slug: 'george-szirtes', name: 'George Szirtes', note: 'The formal British generation.' }
        ]
    },

    'anna-ltitia-barbauld': {
        body: [
            'A radical Dissenting writer of the late eighteenth century whose long poem imagining Britain in ruins and America ascendant was so badly received that she stopped publishing verse entirely.',
            'The rest of the work is various and often domestic in the best sense — a poem to a mouse in a trap answering a scientist, hymns, and children\'s books that Coleridge and Lamb argued about. She was an important editor and critic. The reputation vanished for a century and a half and has been substantially restored.'
        ],
        readNext: [
            { slug: 'charlotte-smith', name: 'Charlotte Smith', note: 'The contemporary who revived the sonnet.' },
            { slug: 'william-cowper', name: 'William Cowper', note: 'The Dissenting sensibility in verse.' },
            { slug: 'william-blake', name: 'William Blake', note: 'The radical decade from the other side.' }
        ]
    },

    'anne-sexton': {
        body: [
            'She began writing in a hospital after a breakdown, on a therapist\'s suggestion, and published poems about mental illness, abortion, masturbation and her own body at a moment when none of that had appeared in American verse.',
            'The best work is more formally controlled than the confessional label suggests — she rhymed heavily and used strict stanzas, and the discipline is what makes the material bearable. The book of retold fairy tales is savagely funny. She performed with a rock band and died by suicide at forty-five. Read the early formal books before the late ones.'
        ],
        readNext: [
            { slug: 'sylvia-plath', name: 'Sylvia Plath', note: 'Her friend, and the same seminar.' },
            { slug: 'maxine-kumin', name: 'Maxine Kumin', note: 'Her closest friend, and the elegies for her.' },
            { slug: 'w-d-snodgrass', name: 'W. D. Snodgrass', note: 'Where the confessional mode begins.' }
        ]
    },

    'baron-brooke-fulke-greville': {
        body: [
            'An Elizabethan statesman and Philip Sidney\'s lifelong friend and biographer, whose own verse is astringent, philosophical and considerably darker than anything in the sonnet fashion he began inside.',
            'The sequence of love poems turns steadily into a study of human corruption and the failure of the will, and the late religious poems are Calvinist and unsparing. The style is knotted and difficult, and the difficulty is doctrinal rather than decorative. A poet for readers who like their Elizabethans bleak.'
        ],
        readNext: [
            { slug: 'sir-philip-sidney', name: 'Sir Philip Sidney', note: 'His friend, and the life he wrote.' },
            { slug: 'george-herbert', name: 'George Herbert', note: 'The devotional argument, gentler.' },
            { slug: 'john-donne', name: 'John Donne', note: 'The knotted argumentative line.' }
        ]
    },

    'carter-revard': {
        body: [
            'An Osage poet and medieval scholar who spent a career editing English manuscripts while writing poems that braid Osage history, birds, science and academic life together with considerable humour.',
            'The mixture is the point: a poem can move from a Middle English lyric to a coyote to a uranium mine without a change of tone. He wrote about being enrolled Osage and of mixed descent, and about the specific comedy of an Indigenous scholar working on the colonisers\' literature. Warm, learned and unusually funny.'
        ],
        readNext: [
            { slug: 'duane-niatum', name: 'Duane Niatum', note: 'The Native American poetry of the same era.' },
            { slug: 'linda-hogan', name: 'Linda Hogan', note: 'Ecology and Native inheritance.' },
            { slug: 'joy-harjo', name: 'Joy Harjo', note: 'The best-known voice of that generation.' }
        ]
    },

    'christopher-smart': {
        body: [
            'He wrote his most extraordinary poem while confined in an asylum: a vast unfinished antiphonal work in which every line begins with the same word, and which contains the passage about his cat Jeoffry that is one of the best-loved things in English.',
            'That poem was unpublished for nearly two centuries. The public work is more conventional and includes a superb religious ode. The madness he was confined for consisted largely of praying aloud in the street, which his friend Johnson thought no worse a habit than most. Read the cat, then the rest.'
        ],
        readNext: [
            { slug: 'william-blake', name: 'William Blake', note: 'The private mythology and the visionary line.' },
            { slug: 'samuel-johnson', name: 'Samuel Johnson', note: 'His friend and defender.' },
            { slug: 'john-clare', name: 'John Clare', note: 'The asylum poems a generation later.' }
        ]
    },

    'clarence-major': {
        body: [
            'A poet, novelist and painter whose work moves between experimental abstraction and plain narrative, and who has been publishing across every genre since the 1960s without settling in any of them.',
            'The poems draw on jazz, on the visual arts and on Black American speech, and he edited an early dictionary of African American slang. He was associated with the Black Arts moment while resisting its demand that Black writing be programmatic. The result is a body of work that is hard to summarise and consistently interesting.'
        ],
        readNext: [
            { slug: 'ishmael-reed', name: 'Ishmael Reed', note: 'The satirist of the same era.' },
            { slug: 'nathaniel-mackey', name: 'Nathaniel Mackey', note: 'Black experimental writing at length.' },
            { slug: 'jayne-cortez', name: 'Jayne Cortez', note: 'Jazz and the Black avant-garde.' }
        ]
    },

    'clark-coolidge': {
        body: [
            'One of the most radically abstract poets in American English — the early work strips language down to isolated words and syllables on the page, and the later work runs at enormous speed through a diction drawn from jazz, geology and pulp fiction.',
            'He is a drummer, and the poems are best understood rhythmically: what governs them is pulse rather than syntax. Enormously prolific. There is no way to read a Coolidge poem for its content, and readers who accept that find one of the great sonic bodies of work of the period.'
        ],
        readNext: [
            { slug: 'tom-raworth', name: 'Tom Raworth', note: 'The British equivalent in velocity.' },
            { slug: 'gertrude-stein', name: 'Gertrude Stein', note: 'The ancestor of the abstract sentence.' },
            { slug: 'michael-palmer', name: 'Michael Palmer', note: 'Disjunction with a lyric surface.' }
        ]
    },

    'dannie-abse': {
        body: [
            'A Welsh Jewish doctor who practised chest medicine for decades and wrote poems the whole time, about patients, South Wales, Jewish inheritance and the awkwardness of being a physician who is also the man writing this down.',
            'The tone is humane and self-deprecating, the forms are traditional but unobtrusive, and the poems about the consulting room are the best of them — a doctor watching himself perform competence. The late elegies for his wife, killed in a car crash, are direct and unbearable.'
        ],
        readNext: [
            { slug: 'rafael-campo', name: 'Rafael Campo', note: 'The physician writing in metre.' },
            { slug: 'r-s-thomas', name: 'R. S. Thomas', note: 'The Welsh poem, colder.' },
            { slug: 'c-dale-young', name: 'C. Dale Young', note: 'Medicine handled precisely.' }
        ]
    },

    'darren-sardelli': {
        body: [
            'A children\'s poet writing short, rhymed comic pieces built for classroom performance — poems about school, homework, teachers and inventive excuses, with the punchline always in the last line.',
            'The craft is entirely in the metre and the timing, which have to survive being read aloud by a nine-year-old. He works in schools, and the poems are written with that room in mind. A working children\'s poet rather than a literary figure, and good at the job.'
        ],
        readNext: [
            { slug: 'kenn-nesbitt', name: 'Kenn Nesbitt', note: 'The same comic territory.' },
            { slug: 'jack-prelutsky', name: 'Jack Prelutsky', note: 'The master of this form.' },
            { slug: 'bruce-lansky', name: 'Bruce Lansky', note: 'The anthologist of that shelf.' }
        ]
    },

    'david-lehman': {
        body: [
            'A poet, critic and anthologist who founded and edited a long-running annual selection of American poetry, which has probably shaped more reading habits than any individual book of his.',
            'His own verse is fast, witty and New York School in descent — one book contains a poem written every day for a year, and the daily discipline shows in the looseness and the charm. He has written well on Auden, on the New York School and on the American songbook. Light on its feet, and knowing about it.'
        ],
        readNext: [
            { slug: 'kenneth-koch', name: 'Kenneth Koch', note: 'His teacher, and comic exuberance.' },
            { slug: 'ron-padgett', name: 'Ron Padgett', note: 'The deadpan New York line.' },
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'The poem as a daily practice.' }
        ]
    },

    'david-orr': {
        body: [
            'Primarily a critic — poetry columnist for a major newspaper for years, and the author of a genuinely useful book about why people find poetry intimidating and a second about the most misread poem in America.',
            'The criticism is funny, sceptical and unusually good at explaining what the poetry world is actually like as an institution. His own verse is sparse and formally careful. Read the prose on Frost first; it is the best short account of how a poem gets misunderstood into fame.'
        ],
        readNext: [
            { slug: 'robert-frost', name: 'Robert Frost', note: 'The subject of his book on misreading.' },
            { slug: 'stephanie-burt', name: 'Stephanie Burt', note: 'The other contemporary critic-poet here.' },
            { slug: 'randall-jarrell', name: 'Randall Jarrell', note: 'The critic-poet tradition.' }
        ]
    },

    'diane-di-prima': {
        body: [
            'The most significant woman of the Beat generation, and the one who kept working long after the movement dispersed — a publisher, a co-editor of an underground literary newsletter, and a poet for six decades.',
            'The long serial poem she worked on for years mixes revolutionary politics, alchemy, magic and feminist argument in a loose incantatory line. The earlier work is more directly autobiographical about bohemian New York, single motherhood and poverty. She was also a serious student of Buddhism and of the occult, and neither is decorative in the poems.'
        ],
        readNext: [
            { slug: 'anne-waldman', name: 'Anne Waldman', note: 'The next generation of the long incantatory poem.' },
            { slug: 'gregory-corso', name: 'Gregory Corso', note: 'The Beat with the strangest ear.' },
            { slug: 'joanne-kyger', name: 'Joanne Kyger', note: 'The other essential woman of that scene.' }
        ]
    },

    'duane-niatum': {
        body: [
            'A Klallam poet from the Pacific Northwest whose poems are grounded in the coastal landscape — cedar, rain, herons, the strait — and in a family history of removal and boarding schools.',
            'He edited two important anthologies of Native American poetry that established the field for a general readership, which is a large part of his significance. The verse is lyrical and formally quiet, and it resists the mythic register that publishers often wanted from Native writers of his generation.'
        ],
        readNext: [
            { slug: 'carter-revard', name: 'Carter Revard', note: 'The same generation, with more comedy.' },
            { slug: 'linda-hogan', name: 'Linda Hogan', note: 'Land and inheritance together.' },
            { slug: 'sherwin-bitsui', name: 'Sherwin Bitsui', note: 'The later Native American avant-garde.' }
        ]
    },

    'edward-taylor': {
        body: [
            'A Puritan minister in frontier Massachusetts who wrote elaborate devotional poems for two centuries\' worth of nobody — he left instructions that they not be published, and they were discovered in a library in the 1930s.',
            'The style is metaphysical, closer to Herbert and Crashaw than to anything in colonial America, and the conceits are homely and extravagant at once: God as a spinning wheel, the soul as a bowling ball, Christ as a distillery. The poems were written as private preparation before administering communion. Nothing else in early American literature is remotely like them.'
        ],
        readNext: [
            { slug: 'george-herbert', name: 'George Herbert', note: 'His obvious model.' },
            { slug: 'anne-bradstreet', name: 'Anne Bradstreet', note: 'The other colonial poet of substance.' },
            { slug: 'richard-crashaw', name: 'Richard Crashaw', note: 'The extravagant conceit at its limit.' }
        ]
    },

    'etel-adnan': {
        body: [
            'A Lebanese American writer and painter whose poems, essays and paintings form one practice — she came to visual art partly because writing in French felt politically compromised during the Algerian war.',
            'The poems are spare, philosophical and preoccupied with mountains, war, exile and colour. Her prose account of the Lebanese civil war is a landmark. The late work, made in her nineties, is among the most admired; she was rediscovered by the art world very late and the writing followed. Read the poems and look at the paintings together.'
        ],
        readNext: [
            { slug: 'adonis', name: 'Adonis', note: 'The Arabic modernist tradition.' },
            { slug: 'meena-alexander', name: 'Meena Alexander', note: 'Displacement across several languages.' },
            { slug: 'inger-christensen', name: 'Inger Christensen', note: 'Philosophical poetry of the same scale.' }
        ]
    },

    'gjertrud-schnackenberg': {
        body: [
            'A formalist of extraordinary technical ambition whose books are long, meditative sequences in strict metre and rhyme — on her father\'s death, on a chess-playing automaton, on Byzantium, on the death of her husband.',
            'The scale is unusual: these are book-length poems that sustain formal pressure over hundreds of lines, densely allusive and unhurried. The elegy for her husband is the most direct and the most devastating. She publishes rarely and each book is a single conceived structure rather than a collection.'
        ],
        readNext: [
            { slug: 'anthony-hecht', name: 'Anthony Hecht', note: 'Elaborate form carrying historical horror.' },
            { slug: 'geoffrey-hill', name: 'Geoffrey Hill', note: 'Difficulty defended.' },
            { slug: 'lucie-brock-broido', name: 'Lucie Brock-Broido', note: 'Ornate diction and grief.' }
        ]
    },

    'gregory-corso': {
        body: [
            'The youngest of the core Beats, largely self-educated in prison, and the one with the strangest ear — the poems lurch between the sublime and the ridiculous within a line and are frequently very funny.',
            'The best-known is a long comic monologue about marriage as a horrifying prospect, and another meditates on the atomic bomb by addressing it directly and affectionately. The technique is genuine: the diction is archaic and slangy at once, deliberately. Uneven, and the good poems are unlike anyone else\'s.'
        ],
        readNext: [
            { slug: 'allen-ginsberg', name: 'Allen Ginsberg', note: 'His friend and promoter.' },
            { slug: 'lawrence-ferlinghetti', name: 'Lawrence Ferlinghetti', note: 'The publisher of that scene.' },
            { slug: 'diane-di-prima', name: 'Diane di Prima', note: 'The Beat who kept going.' }
        ]
    },

    'gregory-pardlo': {
        body: [
            'His poems move between Brooklyn, fatherhood, a father who was a striking air traffic controller, and a long meditation on Black masculinity and inheritance — all handled with an essayist\'s willingness to complicate.',
            'The style is discursive and syntactically elaborate, and the poems frequently pause to interrogate their own terms. He has written a memoir and translated from Danish. The best pieces set a small domestic scene against a large historical argument without forcing the connection.'
        ],
        readNext: [
            { slug: 'major-jackson', name: 'Major Jackson', note: 'The same generation and register.' },
            { slug: 'terrance-hayes', name: 'Terrance Hayes', note: 'Formal invention on shared ground.' },
            { slug: 'elizabeth-alexander', name: 'Elizabeth Alexander', note: 'The essayist-poet on family and history.' }
        ]
    },

    'irving-feldman': {
        body: [
            'A poet of Jewish American life and of the Holocaust\'s aftermath, writing in long, syntactically dense poems that argue with themselves and with the reader.',
            'The early work includes some of the strongest American poetry on the murder of European Jews written by somebody who was not there and knows it. The later books are comic, satirical and preoccupied with friendship, art and the absurdity of literary ambition. He is a poet other poets read; the general audience never quite arrived.'
        ],
        readNext: [
            { slug: 'gerald-stern', name: 'Gerald Stern', note: 'The Jewish American ecstatic line.' },
            { slug: 'delmore-schwartz', name: 'Delmore Schwartz', note: 'The generation before.' },
            { slug: 'karl-shapiro', name: 'Karl Shapiro', note: 'Jewish identity in mid-century American verse.' }
        ]
    },

    'isabella-whitney': {
        body: [
            'The first Englishwoman known to have published original secular poetry, in the 1560s and 70s, and the poems are startlingly practical: she writes as a servant out of work, giving advice to her sisters in service and to her brothers.',
            'Her best-known piece is a mock will bequeathing the city of London itself — its shops, streets and prisons — since she has nothing else to leave. It is a poem about poverty disguised as a joke, and it is one of the liveliest documents of Elizabethan city life. Recovered by scholars only recently.'
        ],
        readNext: [
            { slug: 'lady-mary-wroth', name: 'Lady Mary Wroth', note: 'The next Englishwoman to publish at length.' },
            { slug: 'katherine-philips', name: 'Katherine Philips', note: 'The next Englishwoman to publish widely.' },
            { slug: 'john-skelton', name: 'John Skelton', note: 'The rough vernacular verse of the period.' }
        ]
    },

    'ishion-hutchinson': {
        body: [
            'A Jamaican poet whose language is dense, baroque and heavily consonantal — the influence of Walcott and of Hopkins is audible, and the vocabulary reaches for the rare word on purpose.',
            'The subjects are a Jamaican childhood, an absent father, colonial history, and in a recent book the West Indian soldiers and labourers conscripted into the First World War. The difficulty is textural rather than structural: read for the sound and the sense arrives. One of the strongest voices of his generation.'
        ],
        readNext: [
            { slug: 'derek-walcott', name: 'Derek Walcott', note: 'The Caribbean inheritance he works from.' },
            { slug: 'gerard-manley-hopkins', name: 'Gerard Manley Hopkins', note: 'The consonantal density behind it.' },
            { slug: 'kamau-brathwaite', name: 'Kamau Brathwaite', note: 'The other Caribbean method.' }
        ]
    },

    'jamaal-may': {
        body: [
            'A Detroit poet whose poems are built around machines, repair, sound and fear — he worked with electronics and the vocabulary of circuits and engines runs through the work as native language.',
            'The best-known sequence catalogues phobias, one per poem, and uses them to write about a city, a body and a childhood without ever announcing that it is doing so. He came out of the performance scene and the poems retain that momentum. The line is muscular and the images are exact.'
        ],
        readNext: [
            { slug: 'nate-marshall', name: 'Nate Marshall', note: 'The same generation and city poetics.' },
            { slug: 'philip-levine', name: 'Philip Levine', note: 'Detroit named plainly.' },
            { slug: 'terrance-hayes', name: 'Terrance Hayes', note: 'Invented sequences with a purpose.' }
        ]
    },

    'jennifer-moxley': {
        body: [
            'A poet of deliberately old-fashioned diction and syntax used for entirely contemporary ends — the poems sound like nineteenth-century verse and are about precarious academic labour, friendship, feminism and the poetry world.',
            'That estrangement is the method: an elevated register applied to a shabby present makes both visible. She has translated from French and written memoir. The work is austere and demanding and has a devoted readership among poets who value the refusal to sound current.'
        ],
        readNext: [
            { slug: 'lisa-robertson', name: 'Lisa Robertson', note: 'Archaic register turned to theory.' },
            { slug: 'rosmarie-waldrop', name: 'Rosmarie Waldrop', note: 'The sentence as the site of thought.' },
            { slug: 'susan-howe', name: 'Susan Howe', note: 'The historical page reactivated.' }
        ]
    },

    'joanne-kyger': {
        body: [
            'A poet of daily life in Bolinas, California — the garden, the neighbours, the weather, Buddhist practice, a walk — written in short casual lines that look like notes and are considerably more constructed than they appear.',
            'She travelled in Japan and India with Snyder and Ginsberg and wrote a superb journal of it. The work is anti-monumental on principle: no big poems, no summing up, just attention paid daily for fifty years. Hugely influential on younger poets who wanted an alternative to the ambitious lyric.'
        ],
        readNext: [
            { slug: 'gary-snyder', name: 'Gary Snyder', note: 'The Buddhist and Pacific line.' },
            { slug: 'cedar-sigo', name: 'Cedar Sigo', note: 'The poet she mentored.' },
            { slug: 'diane-di-prima', name: 'Diane di Prima', note: 'The other essential woman of that scene.' }
        ]
    },

    'john-bunyan': {
        body: [
            'The allegory is the achievement, and the verse inside and around it is plainer than anything else in seventeenth-century English — deliberately, since he was writing for readers who had little schooling and less patience for ornament.',
            'The best-known poem is a marching hymn about being valiant against all discouragement, still sung. He wrote from prison, jailed for preaching without a licence, and the plainness is a Nonconformist position as much as an aesthetic one. Read the verses inside the allegory rather than separately.'
        ],
        readNext: [
            { slug: 'george-herbert', name: 'George Herbert', note: 'The devotional poem, from the other end of the church.' },
            { slug: 'john-milton', name: 'John Milton', note: 'The Puritan imagination at its grandest.' },
            { slug: 'christopher-smart', name: 'Christopher Smart', note: 'Praise written from confinement.' }
        ]
    },

    'john-lee-clark': {
        body: [
            'A DeafBlind poet who writes about tactile life — touch, protactile communication, the body as the medium of contact — from inside an experience most literature has only described from outside.',
            'The poems are plain, funny and frequently angry about the assumptions hearing and sighted people make. He has argued for a distinctively DeafBlind poetics rather than an accommodation of an existing one, and the essays make the case. Genuinely new material handled without any bid for inspiration.'
        ],
        readNext: [
            { slug: 'ilya-kaminsky', name: 'Ilya Kaminsky', note: 'Deafness as a poetic and political subject.' },
            { slug: 'lucia-perillo', name: 'Lucia Perillo', note: 'The body written without appeal.' },
            { slug: 'lucia-perillo', name: 'Lucia Perillo', note: 'Disability written without appeal.' }
        ]
    },

    'john-skelton': {
        body: [
            'A Tudor poet and royal tutor who wrote in short, rough, headlong lines rhyming on the same sound for as long as he could keep it up — a metre that has been named after him and that nobody else has used well.',
            'The effect is comic and slightly deranged, and he used it for savage satires on Cardinal Wolsey, for a mock-elegy for a sparrow, and for an alehouse portrait that is one of the earliest great low-life poems in English. Coarse, energetic and completely unlike the courtly verse that followed him.'
        ],
        readNext: [
            { slug: 'geoffrey-chaucer', name: 'Geoffrey Chaucer', note: 'The vernacular master before him.' },
            { slug: 'isabella-whitney', name: 'Isabella Whitney', note: 'The city and the poor in Tudor verse.' },
            { slug: 'sir-thomas-wyatt', name: 'Sir Thomas Wyatt', note: 'The courtly manner that displaced him.' }
        ]
    },

    'jonathan-williams': {
        body: [
            'A poet, publisher, photographer and walker who founded a press that printed Olson, Creeley, Zukofsky, Niedecker and many others — the publishing is at least as important as the poems.',
            'The verse is short, comic and often built from found language: overheard Appalachian speech, hillbilly sayings, gravestones, gardening catalogues. He championed outsider art and self-taught artists of the American South before anyone else did. A collector, a connector, and a genuine eccentric.'
        ],
        readNext: [
            { slug: 'lorine-niedecker', name: 'Lorine Niedecker', note: 'One of the poets his press kept in print.' },
            { slug: 'charles-olson', name: 'Charles Olson', note: 'The Black Mountain circle he published.' },
            { slug: 'basil-bunting', name: 'Basil Bunting', note: 'Northern speech condensed.' }
        ]
    },

    'joyce-sidman': {
        body: [
            'A children\'s poet whose books pair verse with natural science — poems about nocturnal animals, about things that survive, about the chemistry of colour — designed so a child gets a poem and a fact from the same page.',
            'The forms vary widely and are chosen to suit the creature, which is a quiet lesson in what form is for. The books are illustrated and conceived as whole objects. Among the best writing for children about the natural world being made now.'
        ],
        readNext: [
            { slug: 'j-patrick-lewis', name: 'J. Patrick Lewis', note: 'Children\'s verse with a wide range.' },
            { slug: 'aimee-nezhukumatathil', name: 'Aimee Nezhukumatathil', note: 'Natural wonder for adults.' },
            { slug: 'marianne-moore', name: 'Marianne Moore', note: 'The precise animal poem.' }
        ]
    },

    'juliana-spahr': {
        body: [
            'A poet of connection and complicity — one book repeats and extends a sentence about everyone breathing the same air until the reader is implicated in a war being conducted in their name.',
            'The method is repetition with slow accretion, and the politics are explicit: ecology, empire, capital and the position of a poet inside institutions she criticises. She has co-written and co-edited extensively, and her work on the economics of the poetry world is unusually candid. Formally repetitive by design; read a whole sequence.'
        ],
        readNext: [
            { slug: 'joshua-clover', name: 'Joshua Clover', note: 'His frequent collaborator, and the same politics.' },
            { slug: 'lyn-hejinian', name: 'Lyn Hejinian', note: 'The Language inheritance.' },
            { slug: 'craig-santos-perez', name: 'Craig Santos Perez', note: 'Ecology, empire and experimental form.' }
        ]
    },

    'kiki-petrosino': {
        body: [
            'Her work moves between formal experiment and historical research — a recent book uses her own DNA test results and the archives of a Virginia university founded by a slaveholding president to write about ancestry and erasure.',
            'The earlier poems are funnier and stranger, built around invented personae and a dry absurdist streak. The constant is a refusal to let a poem settle into either lyric confession or documentary. Formally curious throughout, and the archive work is exact.'
        ],
        readNext: [
            { slug: 'natasha-trethewey', name: 'Natasha Trethewey', note: 'The archive and mixed inheritance.' },
            { slug: 'evie-shockley', name: 'Evie Shockley', note: 'Formal experiment and Black poetics.' },
            { slug: 'tyehimba-jess', name: 'Tyehimba Jess', note: 'History in engineered forms.' }
        ]
    },

    'kyle-dargan': {
        body: [
            'Formally restless poems about Black masculinity, music, technology and Washington, D.C., written with a strong rhythmic pulse drawn from go-go and hip-hop.',
            'He invents forms and uses received ones, and the books are usually organised around a governing conceit — a video game, a body of water, a set of transmissions. The politics are direct without being slogans. He has edited a literary magazine and taught for years in the city he writes about.'
        ],
        readNext: [
            { slug: 'thomas-sayers-ellis', name: 'Thomas Sayers Ellis', note: 'The other great D.C. poet of that music.' },
            { slug: 'terrance-hayes', name: 'Terrance Hayes', note: 'Invented forms with a purpose.' },
            { slug: 'major-jackson', name: 'Major Jackson', note: 'The same generation and register.' }
        ]
    },

    'leigh-hunt': {
        body: [
            'A journalist, editor and poet who went to prison for libelling the Prince Regent and whose real importance is as a connector — he published and promoted Keats and Shelley when nobody else would.',
            'His own verse is uneven and was mocked for its cosy diction; two short poems have survived, one about a man whose love of his fellow beings gets him ahead of the pious in heaven, and one about a stolen kiss. Read him for the literary history and for those two, which are genuinely charming.'
        ],
        readNext: [
            { slug: 'john-keats', name: 'John Keats', note: 'The poet he introduced to the world.' },
            { slug: 'percy-bysshe-shelley', name: 'Percy Bysshe Shelley', note: 'His friend and defender.' },
            { slug: 'charles-lamb', name: 'Charles Lamb', note: 'The same London literary circle.' }
        ]
    },

    'lisa-robertson': {
        body: [
            'A Canadian poet whose books are conceptual and essayistic — one is a set of reports on the weather written in the diction of eighteenth-century meteorology, another rewrites Virgil\'s farming poem as a work about the city.',
            'The prose is dense, theoretical and voluptuous at once, borrowing period vocabulary to think about architecture, gender, clothing and the constructed nature of nature. Difficult and pleasurable in equal measure. Read a whole book: each one is a single sustained argument.'
        ],
        readNext: [
            { slug: 'jennifer-moxley', name: 'Jennifer Moxley', note: 'The archaic register put to current use.' },
            { slug: 'cole-swensen', name: 'Cole Swensen', note: 'The book-length lyric investigation.' },
            { slug: 'sina-queyras', name: 'Sina Queyras', note: 'Canadian experimental poetics.' }
        ]
    },

    'marcus-wicker': {
        body: [
            'Poems about Black American life that use pop culture — television, sneakers, internet video, gospel — as their vocabulary, with a formal control that the casual surface disguises.',
            'One book is structured around prayers addressed to unlikely recipients; another confronts police violence directly and refuses the consolations available. The tone moves between comedy and grief quickly and deliberately. A strong ear for the line, and an unusual willingness to let a joke carry the weight.'
        ],
        readNext: [
            { slug: 'terrance-hayes', name: 'Terrance Hayes', note: 'Pop culture inside real technique.' },
            { slug: 'kyle-dargan', name: 'Kyle Dargan', note: 'The same generation and music.' },
            { slug: 'jericho-brown', name: 'Jericho Brown', note: 'Faith, violence and invented form.' }
        ]
    },

    'margaret-burroughs': {
        body: [
            'An artist, teacher and founder of a Black history museum in Chicago, whose poems belong to the same civic project: written to be read at gatherings, direct in address, and unembarrassed about instruction.',
            'The best-known asks what she should tell her children who are Black, and answers by listing what a world has told them about themselves. She was a printmaker and organiser as much as a writer, and the poems are one instrument among several. Read as part of a life\'s work rather than as a separate career.'
        ],
        readNext: [
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'Her Chicago contemporary and friend.' },
            { slug: 'margaret-walker', name: 'Margaret Walker', note: 'The same generation of public verse.' },
            { slug: 'langston-hughes', name: 'Langston Hughes', note: 'Poetry written to be useful.' }
        ]
    },

    'margaret-walker': {
        body: [
            'Her first book opens with a long incantatory poem for her people that has been recited for eighty years — a catalogue of Black American labour, worship and endurance ending in a demand for a new generation.',
            'She also wrote folk ballads about legendary Black figures, in traditional stanzas, and a major historical novel about her great-grandmother\'s life in slavery and Reconstruction. She taught in Mississippi for decades and founded an institute there. The formal range, from ballad to free-verse oration, is wider than the anthologies show.'
        ],
        readNext: [
            { slug: 'gwendolyn-brooks', name: 'Gwendolyn Brooks', note: 'Her contemporary and the formal counterweight.' },
            { slug: 'james-weldon-johnson', name: 'James Weldon Johnson', note: 'The folk sermon in Black American verse.' },
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'History rendered formally.' }
        ]
    },

    'mary-jo-salter': {
        body: [
            'A formal poet of considerable technical ease writing about family, travel, art and mortality — the rhymes are frequently so unobtrusive that a reader notices them only on the second pass.',
            'She was an editor of a major poetry anthology and taught for decades, and the poems have that reader\'s breadth of reference without any showing-off. The best of them take an ordinary domestic occasion and let a formal shape reveal what it contains. Quiet, skilled and unfashionably composed.'
        ],
        readNext: [
            { slug: 'molly-peacock', name: 'Molly Peacock', note: 'Form and a woman\'s life.' },
            { slug: 'richard-wilbur', name: 'Richard Wilbur', note: 'The formal generation she learned from.' },
            { slug: 'elizabeth-spires', name: 'Elizabeth Spires', note: 'The same careful middle register.' }
        ]
    },

    'michael-schmidt': {
        body: [
            'A poet, critic and, above all, a publisher — he founded and ran a press and a magazine that between them kept a very large part of modern poetry in print in Britain for fifty years.',
            'His histories of poetry, told through the lives of poets, are readable and opinionated. The own verse is formally careful and cosmopolitan, reflecting a Mexican childhood and an English literary life. As with several figures here, the editorial work has shaped what is available to read more than the poems have.'
        ],
        readNext: [
            { slug: 'donald-davie', name: 'Donald Davie', note: 'The critic-poet of British taste.' },
            { slug: 'james-laughlin', name: 'James Laughlin', note: 'The publisher-poet in America.' },
            { slug: 'jonathan-galassi', name: 'Jonathan Galassi', note: 'The same double life.' }
        ]
    },

    'mina-loy': {
        body: [
            'A modernist of extraordinary nerve — her early poems about sex, pregnancy and the female body were considered obscene, and her feminist manifesto demanded the abolition of virginity as a category.',
            'The style is fragmented, latinate and syntactically strange, using enormous words with total precision. She was a painter, a lampshade designer and a fixture of several avant-gardes without belonging to any. Her long elegy for the poet-boxer she married is among the great modernist poems. Neglected for decades and now central.'
        ],
        readNext: [
            { slug: 'gertrude-stein', name: 'Gertrude Stein', note: 'The other modernist remaking the sentence.' },
            { slug: 'h-d', name: 'H. D.', note: 'The modernist woman against type.' },
            { slug: 'e-e-cummings', name: 'E. E. Cummings', note: 'Typographic modernism.' }
        ]
    },

    'natalie-diaz': {
        body: [
            'A Mojave poet whose language is physical, erotic and charged — the poems handle the Colorado River as a body, the body as a territory, and desire between women with a sensuality that is inseparable from the politics of land and water.',
            'The first book deals with a brother\'s addiction and is more narrative; the second is denser and more formally ambitious. She is a language activist working on Mojave preservation, and the poems argue that a language and a river are the same kind of thing to lose. Among the most striking voices now writing.'
        ],
        readNext: [
            { slug: 'joy-harjo', name: 'Joy Harjo', note: 'The elder of contemporary Native poetry.' },
            { slug: 'ada-limn', name: 'Ada Limón', note: 'Her collaborator, and the body in the landscape.' },
            { slug: 'sherwin-bitsui', name: 'Sherwin Bitsui', note: 'The Native American avant-garde.' }
        ]
    },

    'ocean-vuong': {
        body: [
            'Lush, elegiac poems about a Vietnamese American family, a mother who could not read, a grandmother\'s war, and queer desire — the language is deliberately beautiful and the material is not.',
            'The influence of Whitman, of Dickinson and of Vietnamese oral forms are all present. He has since become better known for fiction, and the poems remain the more concentrated work. The risk in the style is over-sweetness and the best poems earn their beauty by what they are holding.'
        ],
        readNext: [
            { slug: 'li-young-lee', name: 'Li-Young Lee', note: 'The clearest ancestor for this sensuousness.' },
            { slug: 'chen-chen', name: 'Chen Chen', note: 'The same generation, funnier.' },
            { slug: 'hieu-minh-nguyen', name: 'Hieu Minh Nguyen', note: 'Queer Vietnamese American poetry alongside him.' }
        ]
    },

    'patricia-lockwood': {
        body: [
            'Her poems came out of the internet and read like it — jokes escalating into surrealism, escalating into grief, in a voice that is unmistakably one person talking.',
            'The most notorious is a furious prose-poem about rape culture that circulated enormously; another imagines the natural world engaged in relentless sexual activity and is very funny. She has since written memoir and fiction and is a formidable critic. The poems are the least respectable and possibly the most alive part of the work.'
        ],
        readNext: [
            { slug: 'mary-ruefle', name: 'Mary Ruefle', note: 'The comic turn into the abyss.' },
            { slug: 'dorothea-lasky', name: 'Dorothea Lasky', note: 'Flat statement carrying extremity.' },
            { slug: 'russell-edson', name: 'Russell Edson', note: 'The prose poem as fable.' }
        ]
    },

    'paul-hoover': {
        body: [
            'A poet, editor and translator whose anthology of postmodern American poetry defined that field for a generation of students, and whose own work moves through most of the styles it collects.',
            'The poems are experimental, procedural and often comic — one book is a set of variations on a single Renaissance sonnet, another works through philosophical vocabulary. He translates from Spanish and Vietnamese. Read the anthology to see what he values, then the poems.'
        ],
        readNext: [
            { slug: 'charles-bernstein', name: 'Charles Bernstein', note: 'The movement his anthology mapped.' },
            { slug: 'clark-coolidge', name: 'Clark Coolidge', note: 'Abstraction at its most committed.' },
            { slug: 'michael-palmer', name: 'Michael Palmer', note: 'Lyric disjunction.' }
        ]
    },

    'peter-cole': {
        body: [
            'A translator of medieval Hebrew and Arabic poetry whose versions of the Jewish poets of Muslim Spain are among the finest translations of the last fifty years, and a poet whose own work is formally intricate and steeped in that material.',
            'The poems are dense with sound and argument, and they engage directly with the politics of Jerusalem, where he lives. Mysticism, translation and political conflict are treated as one subject. He co-founded a press for Hebrew and Arabic literature in translation.'
        ],
        readNext: [
            { slug: 'yehuda-amichai', name: 'Yehuda Amichai', note: 'The modern Hebrew poem.' },
            { slug: 'khaled-mattawa', name: 'Khaled Mattawa', note: 'The Arabic tradition in English.' },
            { slug: 'geoffrey-hill', name: 'Geoffrey Hill', note: 'Density and moral argument.' }
        ]
    },

    'pierre-martory': {
        body: [
            'A French poet who published almost nothing in his lifetime and is read in English largely because John Ashbery, his partner for many years, translated him.',
            'The poems are dreamlike, melancholy and precise, moving between wartime memory, Parisian life and a persistent sense of exclusion. Ashbery said Martory was the poet he had learned the most from, which reframes both bodies of work. Read them together; the influence runs in both directions.'
        ],
        readNext: [
            { slug: 'john-ashbery', name: 'John Ashbery', note: 'His partner and translator.' },
            { slug: 'paul-verlaine', name: 'Paul Verlaine', note: 'The French melancholy lyric.' },
            { slug: 'james-schuyler', name: 'James Schuyler', note: 'The quiet observational poem.' }
        ]
    },

    'reginald-dwayne-betts': {
        body: [
            'He served over eight years in prison from the age of sixteen, taught himself to read seriously inside, and later became a lawyer — the poems come out of all of that and refuse to be a redemption narrative.',
            'The technique is formal: sonnets, a canzone, an abecedarian, used because the constraint mirrors the sentence. One book confronts solitary confinement with pages that are partly redacted. He works on prison reform and on getting books into prisons, and the poems and that work are one project.'
        ],
        readNext: [
            { slug: 'etheridge-knight', name: 'Etheridge Knight', note: 'The American prison poem at its source.' },
            { slug: 'jimmy-santiago-baca', name: 'Jimmy Santiago Baca', note: 'Literacy acquired inside.' },
            { slug: 'jill-mcdonough', name: 'Jill McDonough', note: 'The carceral system in formal verse.' }
        ]
    },

    'richard-jones': {
        body: [
            'Plain, quiet, accessible poems about family, faith, fatherhood and ordinary domestic moments, written in short lines and a deliberately simple vocabulary.',
            'He has edited a long-running literary magazine and the poems have an editor\'s dislike of excess. The mode risks blandness and is saved by the exactness of the observation and by an undertow of grief in the later books. A poet writing for readers rather than for the seminar.'
        ],
        readNext: [
            { slug: 'ted-kooser', name: 'Ted Kooser', note: 'The plain American lyric.' },
            { slug: 'linda-pastan', name: 'Linda Pastan', note: 'The domestic poem at similar scale.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'Quiet with a darker floor.' }
        ]
    },

    'richard-lovelace': {
        body: [
            'A Cavalier poet, imprisoned twice for the royalist cause, who wrote the two lines everyone knows about stone walls not making a prison — and meant them, having tested the proposition.',
            'The other famous poem tells a lover he could not love her so much if he did not love honour more, which is either gallant or self-serving depending on the reader. The verse is smooth, courtly and technically deft. He died in poverty after the royalist defeat, which gives the earlier gallantry a retrospective edge.'
        ],
        readNext: [
            { slug: 'sir-john-suckling', name: 'Sir John Suckling', note: 'The Cavalier at his most cynical.' },
            { slug: 'thomas-carew', name: 'Thomas Carew', note: 'The polished end of that circle.' },
            { slug: 'robert-herrick', name: 'Robert Herrick', note: 'The other great royalist lyricist.' }
        ]
    },

    'robert-fitzgerald': {
        body: [
            'His verse translations of Homer and Virgil are the reason he matters — supple, readable English hexameter-adjacent lines that became the standard classroom texts for decades and are still the versions many readers hear in their heads.',
            'His own poems are formally careful, classical in temper and few in number. He was a close friend and editor of Flannery O\'Connor and of James Agee, and much of his working life went into other people\'s books. Read the Odyssey first; the original poems are a footnote to a translator of the first rank.'
        ],
        readNext: [
            { slug: 'david-ferry', name: 'David Ferry', note: 'The later poet-translator of the classics.' },
            { slug: 'rosanna-warren', name: 'Rosanna Warren', note: 'Classical learning in contemporary verse.' },
            { slug: 'anne-carson', name: 'Anne Carson', note: 'The classics remade for a later ear.' }
        ]
    },

    'robin-becker': {
        body: [
            'Accessible, formally attentive poems about lesbian life, family, horses, art and loss, written in a conversational register that never strains for effect.',
            'The elegies for her sister run through several books and are the strongest material. She writes well about the physical world and about the ethics of ordinary attachment. A poet of the middle register who has been quietly good at it for a long time.'
        ],
        readNext: [
            { slug: 'minnie-bruce-pratt', name: 'Minnie Bruce Pratt', note: 'The same generation and politics.' },
            { slug: 'marilyn-hacker', name: 'Marilyn Hacker', note: 'Lesbian life in strict form.' },
            { slug: 'jane-kenyon', name: 'Jane Kenyon', note: 'The quiet elegiac lyric.' }
        ]
    },

    'sandra-beasley': {
        body: [
            'Witty, formally varied poems about the body, illness, Southern inheritance and the awkwardness of a life lived around a set of severe allergies — the constraint is treated as material rather than as complaint.',
            'One sequence is spoken by a persona who is part damsel and part something considerably less docile. The tone is dry and the poems are frequently very funny about serious things. She has also written a memoir about food allergy and about disability as a social fact.'
        ],
        readNext: [
            { slug: 'natalie-shapero', name: 'Natalie Shapero', note: 'The comic-morbid contemporary poem.' },
            { slug: 'lucia-perillo', name: 'Lucia Perillo', note: 'The body written without appeal.' },
            { slug: 'kay-ryan', name: 'Kay Ryan', note: 'Wit at compressed scale.' }
        ]
    },

    'sandra-m-gilbert': {
        body: [
            'A critic whose study of nineteenth-century women writers changed how English literature is taught, and a poet whose verse deals with grief, Italian American family and the body.',
            'Her husband died after routine surgery and the poems and prose that came out of that are the most direct writing she has done. The criticism and the poetry share a preoccupation with what women were permitted to say and what happened to the rest. She also edited a major anthology of women\'s literature.'
        ],
        readNext: [
            { slug: 'alicia-ostriker', name: 'Alicia Ostriker', note: 'The critic-poet on the same questions.' },
            { slug: 'adrienne-rich', name: 'Adrienne Rich', note: 'The generation of that argument.' },
            { slug: 'maxine-kumin', name: 'Maxine Kumin', note: 'Grief handled practically.' }
        ]
    },

    'shane-mccrae': {
        body: [
            'His line is broken by slashes and gaps, interrupting words mid-syllable, and the fracture is the argument: this is a poetics of a history that cannot be spoken smoothly.',
            'The books take on the American slave trade, a mixed-race childhood in which he was raised by white supremacist grandparents who abducted him, and a heaven populated by figures from that history. The formal control is total and the effect is of somebody speaking under enormous pressure. Among the most distinctive voices now writing.'
        ],
        readNext: [
            { slug: 'robert-hayden', name: 'Robert Hayden', note: 'The historical poem at its source.' },
            { slug: 'tyehimba-jess', name: 'Tyehimba Jess', note: 'History in engineered forms.' },
            { slug: 'rickey-laurentiis', name: 'Rickey Laurentiis', note: 'The southern image confronted.' }
        ]
    },

    'sherwin-bitsui': {
        body: [
            'A Diné poet whose long poems move by rapid surreal image — a city, a desert, oil, water, a horse — with almost no connective tissue and no explanatory frame.',
            'The Navajo language and ceremonial structure underlie the work without being translated for the reader, which is a deliberate refusal. The subjects are extraction, urban Native life and ecological damage. Difficult in the way a landscape is difficult: read for accumulation rather than argument.'
        ],
        readNext: [
            { slug: 'natalie-diaz', name: 'Natalie Diaz', note: 'The same generation, more erotic and political.' },
            { slug: 'dg-nanouk-okpik', name: 'dg nanouk okpik', note: 'The Native avant-garde alongside him.' },
            { slug: 'arthur-sze', name: 'Arthur Sze', note: 'Constellated images of the Southwest.' }
        ]
    },

    'sir-arthur-conan-doyle': {
        body: [
            'The detective stories are the achievement and he wrote verse throughout his life — ballads of the sea, of soldiers, of sport and of medicine, in brisk traditional metres built for reading aloud.',
            'The poems are competent, energetic and entirely conventional, and they show a professional storyteller working in a form he enjoyed rather than one he needed. His late spiritualism appears in some of them. Read as a sidelight on a writer whose real instrument was prose narrative.'
        ],
        readNext: [
            { slug: 'rudyard-kipling', name: 'Rudyard Kipling', note: 'The recitable ballad done supremely.' },
            { slug: 'robert-louis-stevenson', name: 'Robert Louis Stevenson', note: 'The other Scottish storyteller in verse.' },
            { slug: 'alfred-noyes', name: 'Alfred Noyes', note: 'Narrative verse built for performance.' }
        ]
    },

    'stanley-kunitz': {
        body: [
            'A career of seventy years in which the poems got simpler and better — the early work is dense and formal, the late work is plain, short and among the finest American poetry about old age.',
            'The father who died by suicide before he was born runs through the whole body of work, returned to at intervals for decades. He was a gardener of some seriousness and the late poems use it exactly. He served twice as the nation\'s poetry consultant, the second time in his nineties, and mentored several generations.'
        ],
        readNext: [
            { slug: 'theodore-roethke', name: 'Theodore Roethke', note: 'His friend, and the other great American gardener-poet.' },
            { slug: 'gregory-orr', name: 'Gregory Orr', note: 'His student, working the same wound.' },
            { slug: 'david-ferry', name: 'David Ferry', note: 'The other great late career here.' }
        ]
    },

    'stephen-c-foster': {
        body: [
            'The first American to make a living as a professional songwriter, and the words to his songs are the closest thing the nineteenth-century United States had to a national popular verse.',
            'The melodies have outlasted everything, and the lyrics are a genuine problem: many were written for blackface minstrel performance and carry its caricature, even where he later revised toward sympathy. Ignoring that is dishonest and so is pretending the songs are not extraordinarily well made. He died at thirty-seven in poverty.'
        ],
        readNext: [
            { slug: 'james-whitcomb-riley', name: 'James Whitcomb Riley', note: 'The dialect problem in a later generation.' },
            { slug: 'paul-laurence-dunbar', name: 'Paul Laurence Dunbar', note: 'The Black poet writing against that caricature.' },
            { slug: 'anonymous', name: 'Anonymous', note: 'The folk tradition his songs entered.' }
        ]
    },

    'susan-griffin': {
        body: [
            'An ecofeminist writer whose best-known book alternates the voice of scientific rationality with a lyric counter-voice, arguing that the domination of women and of the natural world are the same operation.',
            'The form is a hybrid of poem, essay and documentary collage, and it was formally radical when it appeared. Her later work on war, private life and the roots of violence continues the method. The poems proper are direct and political. Read the hybrid books; that is where the real invention is.'
        ],
        readNext: [
            { slug: 'adrienne-rich', name: 'Adrienne Rich', note: 'The same feminist argument in verse.' },
            { slug: 'juliana-spahr', name: 'Juliana Spahr', note: 'Ecology and politics in experimental form.' },
            { slug: 'brenda-hillman', name: 'Brenda Hillman', note: 'Environmental activism inside the poem.' }
        ]
    },

    'susan-howe': {
        body: [
            'She works in archives — colonial New England documents, Dickinson\'s manuscripts, Melville\'s marginalia — and cuts the language she finds into pages where text is scattered, overlapped and set at angles.',
            'The argument is that history reaches us as damaged material and that a poem should show the damage rather than transcribe it into sense. She began as a visual artist and the pages are meant to be seen. Difficult, exacting, and among the most original bodies of work in American poetry.'
        ],
        readNext: [
            { slug: 'emily-dickinson', name: 'Emily Dickinson', note: 'The manuscripts she has written about at length.' },
            { slug: 'ronald-johnson', name: 'Ronald Johnson', note: 'Erasure as composition.' },
            { slug: 'charles-olson', name: 'Charles Olson', note: 'The archive as an open field.' }
        ]
    },

    'tarfia-faizullah': {
        body: [
            'Her first book is a sequence built from interviews with Bangladeshi women raped by Pakistani soldiers during the 1971 war — the poems alternate the survivors\' testimony with the interviewer\'s discomfort at extracting it.',
            'That self-implication is what raises the book above documentary. The second collection is more personal, dealing with a sister\'s death and a Bangladeshi American girlhood in Texas. The line is lyrical and the material is not, and she never resolves the tension in favour of beauty.'
        ],
        readNext: [
            { slug: 'emily-jungmin-yoon', name: 'Emily Jungmin Yoon', note: 'Testimony and the poet\'s position.' },
            { slug: 'carolyn-forch', name: 'Carolyn Forché', note: 'Witness and its ethical problem.' },
            { slug: 'solmaz-sharif', name: 'Solmaz Sharif', note: 'War in official and personal language.' }
        ]
    },

    'tess-taylor': {
        body: [
            'Formally attentive poems about American landscape, agriculture, family history and the archive — one book traces her descent from Thomas Jefferson and the plantation that implies, without letting herself off.',
            'She has worked as a critic and reviewer, and writes well about the labour of growing food. The verse is exact and unhurried, and the historical material is handled with the discomfort it deserves rather than as a curiosity.'
        ],
        readNext: [
            { slug: 'natasha-trethewey', name: 'Natasha Trethewey', note: 'The southern archive as a subject.' },
            { slug: 'camille-t-dungy', name: 'Camille T. Dungy', note: 'Landscape read against history.' },
            { slug: 'tess-gallagher', name: 'Tess Gallagher', note: 'The plainspoken American lyric.' }
        ]
    },

    'thomas-james': {
        body: [
            'He published one book and died by suicide shortly afterwards at twenty-seven, and the book became a cult object — passed between poets in photocopies for decades before being reprinted.',
            'The poems are cold, precise and full of Egyptian mummies, drowned figures and bodies preserved or dissolving. The influence on later American poets, particularly on Louise Glück, has been considerable and openly acknowledged. A very small body of work with an outsized afterlife.'
        ],
        readNext: [
            { slug: 'louise-glck', name: 'Louise Glück', note: 'Who wrote about the book\'s influence on her.' },
            { slug: 'sylvia-plath', name: 'Sylvia Plath', note: 'The cold late style he learned from.' },
            { slug: 'frank-stanford', name: 'Frank Stanford', note: 'Another cult figure who died young.' }
        ]
    },

    'thylias-moss': {
        body: [
            'Formally unpredictable poems that move fast between registers — theology, science, Black girlhood in Cleveland, jokes, rage — with long sinuous sentences and images that refuse to sit still.',
            'She later worked on what she called limited fork poetics, extending the poem into video and multimedia. The written work is where most readers start, and the best of it is genuinely startling: a poem can begin with a doll and end somewhere metaphysical without a visible seam.'
        ],
        readNext: [
            { slug: 'harryette-mullen', name: 'Harryette Mullen', note: 'Language pushed structurally.' },
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Black girlhood in fewer words.' },
            { slug: 'will-alexander', name: 'Will Alexander', note: 'Language at maximum pressure.' }
        ]
    },

    'tyehimba-jess': {
        body: [
            'His major book is an engineering feat: poems about nineteenth-century Black performers built as sonnet crowns that can be read across, down and backwards, plus fold-out pages that work in several directions at once.',
            'The form is the argument. Conjoined twins who performed together get poems that must be read two ways; a musician erased from the record gets a shape that refuses a single reading. The material is minstrelsy, ragtime, and the artists whose work was stolen. Read the physical book if you can.'
        ],
        readNext: [
            { slug: 'adrian-matejka', name: 'Adrian Matejka', note: 'History assembled from many voices.' },
            { slug: 'marilyn-nelson', name: 'Marilyn Nelson', note: 'Strict form holding atrocity.' },
            { slug: 'douglas-kearney', name: 'Douglas Kearney', note: 'The page as a performance score.' }
        ]
    },

    'victoria-chang': {
        body: [
            'Her best-known book is a sequence of obituaries — for her mother, her father\'s mind, and dozens of abstractions and objects — written in identical justified blocks, so the form itself becomes the relentlessness of loss.',
            'Later books work through the language of business memoranda and through correspondence with the dead. The formal constraint is always doing conceptual work. She writes about Asian American identity, motherhood and grief with a dryness that keeps the material from becoming sentimental.'
        ],
        readNext: [
            { slug: 'mary-jo-bang', name: 'Mary Jo Bang', note: 'Grief handled through form.' },
            { slug: 'marilyn-chin', name: 'Marilyn Chin', note: 'The Chinese American inheritance.' },
            { slug: 'monica-youn', name: 'Monica Youn', note: 'Conceptual precision.' }
        ]
    },

    'vijay-seshadri': {
        body: [
            'Conversational, essayistic poems that think their way through a subject with a dry wit and an unusual willingness to be uncertain in public.',
            'Born in India and raised in the American Midwest, he writes about that displacement without making it the whole subject; the poems are as likely to be about a fish, a memory of manual work, or the mechanics of consciousness. The register is calm and the endings frequently open outward rather than closing. A small, careful body of work.'
        ],
        readNext: [
            { slug: 'john-koethe', name: 'John Koethe', note: 'The meditative American poem.' },
            { slug: 'jaswinder-bolina', name: 'Jaswinder Bolina', note: 'The essayistic poem on displacement.' },
            { slug: 'carl-dennis', name: 'Carl Dennis', note: 'The reflective register held for a career.' }
        ]
    },

    'wisawa-szymborska': {
        body: [
            'A Polish poet, read here in translation, whose poems are conversational, ironic and deceptively modest — they begin with an ordinary observation and arrive at something enormous without ever raising the voice.',
            'The technique is the question: many poems are structured as a series of quiet enquiries into things everybody assumes are settled — a photograph, a cat in an empty flat, the statistics of a population, the end of the world happening elsewhere. She received the Nobel Prize in Literature. Her acceptance speech, in praise of not knowing, is the best short statement of her method.'
        ],
        readNext: [
            { slug: 'czeslaw-milosz', name: 'Czeslaw Milosz', note: 'Her Polish contemporary and fellow laureate.' },
            { slug: 'zbigniew-herbert', name: 'Zbigniew Herbert', note: 'The same generation, more classical.' },
            { slug: 'miroslav-holub', name: 'Miroslav Holub', note: 'The dry Central European deadpan.' }
        ]
    },

    'w-s-graham': {
        body: [
            'A Scottish poet who lived in poverty in Cornwall for most of his life and wrote poems whose central subject is language itself — the difficulty of reaching another person through words, addressed directly to the reader.',
            'The early work is dense and Dylan Thomas-adjacent; the mature poems are spare, strange and unmistakable, frequently addressing somebody by name across a gap. He wrote superb elegies for painter friends. Neglected in his lifetime and steadily more admired since, particularly by other poets.'
        ],
        readNext: [
            { slug: 'basil-bunting', name: 'Basil Bunting', note: 'The other great neglected British modernist.' },
            { slug: 'paul-celan', name: 'Paul Celan', note: 'Language as the subject and the obstacle.' },
            { slug: 'tom-pickard', name: 'Tom Pickard', note: 'The British poem outside the metropolitan centre.' }
        ]
    },

    'william-logan': {
        body: [
            'Notorious as a reviewer — probably the most severe working critic of American poetry, and genuinely funny about it, which is why the pieces are read even by people who think he is wrong.',
            'His own poems are formally exact, dense with historical and natural detail, and considerably colder than most contemporary verse. The criticism has overshadowed them almost completely. Read a book of reviews and a collection together and decide whether the standards he applies to others hold up applied to him.'
        ],
        readNext: [
            { slug: 'yvor-winters', name: 'Yvor Winters', note: 'The critic-poet of comparable severity.' },
            { slug: 'geoffrey-hill', name: 'Geoffrey Hill', note: 'Difficulty and historical density.' },
            { slug: 'donald-davie', name: 'Donald Davie', note: 'The critical temperament in verse.' }
        ]
    },

    'thomas-traherne': {
        body: [
            'A seventeenth-century clergyman whose poems and prose meditations were unknown until manuscripts were found on a London bookstall in the 1890s and, remarkably, more were discovered a century later.',
            'The subject is almost entirely one thing: the world as seen by a child before habit and ownership spoiled it — wheat as orient and immortal, streets as gold. That radiant vision is unusual in a century of devotional gloom. The prose meditations are the greater achievement and the poems are their compressed form.'
        ],
        readNext: [
            { slug: 'henry-vaughan', name: 'Henry Vaughan', note: 'The other mystic of childhood and light.' },
            { slug: 'george-herbert', name: 'George Herbert', note: 'The devotional tradition behind both.' },
            { slug: 'william-blake', name: 'William Blake', note: 'Innocence as a serious philosophical position.' }
        ]
    },

    'toma-alamun': {
        body: [
            'A Slovenian poet, widely translated, whose poems are fast, playful, aggressive and non-sequential — lines that do not follow each other and are not supposed to.',
            'He published his first book in the 1960s after being briefly jailed for a satirical piece, and became the central figure in Central European poetic modernism, enormously influential on American poets who read him in translation. The tone is exuberant and slightly manic. Read for velocity; asking what a poem is about is the wrong question here.'
        ],
        readNext: [
            { slug: 'frank-ohara', name: 'Frank O\'Hara', note: 'The velocity he admired and adapted.' },
            { slug: 'marin-sorescu', name: 'Marin Sorescu', note: 'Central European play under a regime.' },
            { slug: 'james-tate', name: 'James Tate', note: 'The American deadpan absurd.' }
        ]
    },

    'john-logan': {
        body: [
            'A Catholic poet who taught for decades and whose work moves from formal early verse to a looser, confessional line about desire, drink, faith and friendship.',
            'He was an important teacher and editor for younger poets, and a generous presence in the American poetry of his period. The poems about the body and about being a Catholic no longer able to be one are the most affecting. Never widely read, and consistently valued by the poets who knew him.'
        ],
        readNext: [
            { slug: 'john-berryman', name: 'John Berryman', note: 'The same generation and the same wreckage.' },
            { slug: 'james-wright', name: 'James Wright', note: 'The turn from formal to plain.' },
            { slug: 'thomas-merton', name: 'Thomas Merton', note: 'The Catholic poem of the period.' }
        ]
    },

    'dave-smith': {
        body: [
            'A Virginia poet of the tidewater and the Chesapeake — watermen, boats, fathers, small towns — writing dense, syntactically knotted narrative poems in a distinctly Southern register.',
            'The line is long and the diction is thick, which divides readers: the argument for it is that a landscape of mud, tide and labour should not be rendered in a clean lyric line. He edited a major literary review and an influential anthology of his generation. Read the boat and river poems first.'
        ],
        readNext: [
            { slug: 'james-l-dickey', name: 'James L. Dickey', note: 'The Southern physical poem before him.' },
            { slug: 'rodney-jones', name: 'Rodney Jones', note: 'Southern narrative verse alongside him.' },
            { slug: 'david-bottoms', name: 'David Bottoms', note: 'The same generation and region.' }
        ]
    },

    'e-ethelbert-miller': {
        body: [
            'A poet and, more consequentially, a literary organiser — for decades he ran an African American resource centre in Washington, edited anthologies, hosted radio, and connected a very large number of Black writers to each other.',
            'The poems are short, accessible and frequently about baseball, love, fatherhood and the ordinary business of a Black American life. The plainness is deliberate: he has argued for poetry that reaches people outside the university. The organising work is inseparable from the writing.'
        ],
        readNext: [
            { slug: 'lucille-clifton', name: 'Lucille Clifton', note: 'Plainness with total authority.' },
            { slug: 'cornelius-eady', name: 'Cornelius Eady', note: 'The institution-builder as poet.' },
            { slug: 'thomas-sayers-ellis', name: 'Thomas Sayers Ellis', note: 'The other great D.C. poetic presence.' }
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

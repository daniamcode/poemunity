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
 * SCOPE: every author with 20 or more poems here. That is 103 of 3,364 — first
 * the 40 poets at 30+ (2026-08-18), then the 63 more in the 20–29 band
 * (2026-08-21). The distribution is extremely long-tailed: below 20 the
 * remainder average under five poems each, where an essay would outweigh the
 * collection it introduces, so the threshold stops here.
 *
 * ═══ FIVE POETS ARE DELIBERATELY EXCLUDED, AND THIS IS THE IMPORTANT PART ═══
 *
 * `emily-hart` (38 poems), `sadie-monroe` (35), `thomas-walker` (30),
 * `michael-brennan` (28) and `maya-torres` (25) all clear the threshold and are
 * **AI personas**, not people. They get no entry.
 *
 * Writing a biography for them would fabricate a human being — asserting in
 * prose the very thing the AI badge, the footer disclosure and the deliberate
 * absence of a `Person` entity in their structured data all exist to deny. It
 * is the same rule as `structuredData.ts`: their pages describe a collection
 * and stay silent about authorship. `authorIntros.test.ts` asserts by slug that
 * none of the five is ever added.
 *
 * Real registered users are excluded by the same logic and a simpler one: this
 * file is editorial commentary about published poets, and inventing a
 * description of a living account-holder is not something to do on their
 * behalf. None currently clears 20 poems in any case.
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
